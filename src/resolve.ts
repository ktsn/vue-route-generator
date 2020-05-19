import { parseComponent } from 'vue-template-compiler'
import { NestedMap, setToMap } from './nested-map'

export interface PageMeta {
  name: string
  chunkName: string
  specifier: string
  path: string
  pathSegments: string[]
  component: string
  children?: PageMeta[]
  routeMeta?: any
  route?: any
}

interface FileError extends Error {
  file?: string
}

const routeMetaName = 'route-meta'
const routeBlockName = 'route'

export function resolveRoutePaths(
  paths: string[],
  importPrefix: string,
  nested: boolean,
  readFile: (path: string) => string
): PageMeta[] {
  const map: NestedMap<string[]> = {}

  const splitted = paths.map((p) => p.split('/'))
  splitted.forEach((path) => {
    setToMap(map, pathToMapPath(path), path)
  })

  return pathMapToMeta(map, importPrefix, nested, readFile)
}

function pathMapToMeta(
  map: NestedMap<string[]>,
  importPrefix: string,
  nested: boolean,
  readFile: (path: string) => string,
  parentDepth: number = 0
): PageMeta[] {
  if (map.value) {
    const path = map.value

    const meta: PageMeta = {
      name: pathToName(path),
      chunkName: pathToChunkName(path),
      specifier: pathToSpecifier(path),
      path: pathToRoute(path, parentDepth, nested),
      pathSegments: toActualPath(path),
      component: importPrefix + path.join('/'),
    }

    const content = readFile(path.join('/'))
    const parsed = parseComponent(content, {
      pad: 'space',
    })
    const routeMetaBlock = parsed.customBlocks.find(
      (b) => b.type === routeMetaName
    )
    const routeBlock = parsed.customBlocks.find(
      (b) => b.type === routeBlockName
    )

    // Deprecated. Will be removed in a later version
    if (routeMetaBlock) {
      console.warn(
        '<route-meta> custom block is deprecated. Use <route> block instead. Found in ' +
          path.join('/')
      )
      meta.routeMeta = tryParseCustomBlock(
        routeMetaBlock.content,
        path,
        'route-meta'
      )
    }

    if (routeBlock) {
      meta.route = tryParseCustomBlock(routeBlock.content, path, 'route')
    }

    if (map.children) {
      meta.children = pathMapChildrenToMeta(
        map.children,
        importPrefix,
        nested,
        readFile,
        meta.pathSegments.length
      )
    }

    return [meta]
  }

  return map.children
    ? pathMapChildrenToMeta(
        map.children,
        importPrefix,
        nested,
        readFile,
        parentDepth
      )
    : []
}

function routePathComparator(a: string[], b: string[]): number {
  const a0 = a[0]
  const b0 = b[0]

  if (!a0 || !b0) {
    return a.length - b.length
  }

  const aOrder = isDynamicRoute(a0) ? 1 : 0
  const bOrder = isDynamicRoute(b0) ? 1 : 0
  const order = aOrder - bOrder

  return order !== 0 ? order : routePathComparator(a.slice(1), b.slice(1))
}

function pathMapChildrenToMeta(
  children: Map<string, NestedMap<string[]>>,
  importPrefix: string,
  nested: boolean,
  readFile: (path: string) => string,
  parentDepth: number
): PageMeta[] {
  return Array.from(children.values())
    .reduce<PageMeta[]>((acc, value) => {
      return acc.concat(
        pathMapToMeta(value, importPrefix, nested, readFile, parentDepth)
      )
    }, [])
    .sort((a, b) => {
      // Prioritize static routes than dynamic routes
      return routePathComparator(a.pathSegments, b.pathSegments)
    })
}

function tryParseCustomBlock(
  content: string,
  filePath: string[],
  blockName: string
): any {
  try {
    return JSON.parse(content)
  } catch (err) {
    const joinedPath = filePath.join('/')
    const wrapped: FileError = new Error(
      `Invalid json format of <${blockName}> content in ${joinedPath}\n` +
        err.message
    )

    // Store file path to provide useful information to downstream tools
    // like friendly-errors-webpack-plugin
    wrapped.file = joinedPath

    throw wrapped
  }
}

function isDynamicRoute(segment: string): boolean {
  return segment[0] === ':'
}

function isOmittable(segment: string): boolean {
  return segment === 'index'
}

/**
 * - Remove `.vue` from the last path
 * - Omit if the last segument is `index`
 * - Convert dynamic route to `:param` format
 */
function toActualPath(segments: string[]): string[] {
  const lastIndex = segments.length - 1
  const last = basename(segments[lastIndex])
  segments = segments.slice(0, -1).concat(last)

  return segments
    .filter((s) => !isOmittable(s))
    .map((s, i) => {
      if (s[0] === '_') {
        const suffix = lastIndex === i ? '?' : ''
        return ':' + s.slice(1) + suffix
      } else {
        return s
      }
    })
}

function pathToMapPath(segments: string[]): string[] {
  const last = segments[segments.length - 1]
  return segments.slice(0, -1).concat(basename(last))
}

function pathToName(segments: string[]): string {
  const last = segments[segments.length - 1]
  segments = segments
    .slice(0, -1)
    .concat(basename(last))
    .filter((s) => !isOmittable(s))

  if (segments.length === 0) {
    return 'index'
  }

  return segments
    .map((s) => {
      return s[0] === '_' ? s.slice(1) : s
    })
    .join('-')
}

function pathToChunkName(segments: string[]): string {
  const last = segments[segments.length - 1]
  segments = segments.slice(0, -1).concat(basename(last))

  return segments
    .map((s) => {
      return s[0] === '_' ? s.slice(1) : s
    })
    .join('-')
}

function pathToSpecifier(segments: string[]): string {
  const last = segments[segments.length - 1]
  const replaced = segments
    .slice(0, -1)
    .concat(basename(last))
    .join('_')
    .replace(/[^a-zA-Z0-9]/g, '_')

  return /^\d/.test(replaced) ? '_' + replaced : replaced
}

function pathToRoute(
  segments: string[],
  parentDepth: number,
  nested: boolean
): string {
  const prefix = nested || parentDepth > 0 ? '' : '/'
  return prefix + toActualPath(segments).slice(parentDepth).join('/')
}

function basename(filename: string): string {
  return filename.replace(/\.[^.]+$/g, '')
}
