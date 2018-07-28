import { parseComponent } from 'vue-template-compiler'
import { NestedMap, setToMap } from './nested-map'

export interface PageMeta {
  name: string
  specifier: string
  path: string
  component: string
  children?: PageMeta[]
  routeMeta?: any
}

const routeMetaName = 'route-meta'

export function resolveRoutePaths(
  paths: string[],
  importPrefix: string,
  readFile: (path: string) => string
): PageMeta[] {
  const map: NestedMap<string[]> = {}

  const splitted = paths.map(p => p.split('/'))
  splitted.forEach(path => {
    setToMap(map, pathToMapPath(path), path)
  })

  return pathMapToMeta(map, importPrefix, readFile)
}

function pathMapToMeta(
  map: NestedMap<string[]>,
  importPrefix: string,
  readFile: (path: string) => string,
  parentDepth: number = 0
): PageMeta[] {
  if (map.value) {
    const path = map.value

    const meta: PageMeta = {
      name: pathToName(path),
      specifier: pathToSpecifier(path),
      path: pathToRoute(path, parentDepth),
      component: importPrefix + path.join('/')
    }

    const content = readFile(path.join('/'))
    const parsed = parseComponent(content)
    const routeMetaBlock = parsed.customBlocks.find(
      b => b.type === routeMetaName
    )

    if (routeMetaBlock) {
      try {
        meta.routeMeta = JSON.parse(routeMetaBlock.content)
      } catch (err) {
        throw new Error(
          `Invalid json format of <route-meta> content in ${path.join('/')}\n` +
            err.message
        )
      }
    }

    if (map.children) {
      meta.children = pathMapChildrenToMeta(
        map.children,
        importPrefix,
        readFile,
        path.length
      )
    }

    return [meta]
  }

  return map.children
    ? pathMapChildrenToMeta(map.children, importPrefix, readFile, parentDepth)
    : []
}

function pathMapChildrenToMeta(
  children: Map<string, NestedMap<string[]>>,
  importPrefix: string,
  readFile: (path: string) => string,
  parentDepth: number
): PageMeta[] {
  return Array.from(children.values()).reduce<PageMeta[]>((acc, value) => {
    return acc.concat(pathMapToMeta(value, importPrefix, readFile, parentDepth))
  }, [])
}

function isDynamicRoute(segment: string): boolean {
  return segment[0] === '_'
}

function isOmittable(segment: string): boolean {
  return segment === 'index.vue'
}

function pathToMapPath(segments: string[]): string[] {
  const last = segments[segments.length - 1]
  return segments.slice(0, -1).concat(basename(last))
}

function pathToName(segments: string[]): string {
  const last = segments[segments.length - 1]
  segments = segments.slice(0, -1).concat(basename(last))

  return segments
    .map(s => {
      return s[0] === '_' ? s.slice(1) : s
    })
    .join('-')
}

function pathToSpecifier(segments: string[]): string {
  const name = pathToName(segments)
  const replaced = name
    .replace(/(^|[^a-zA-Z])([a-zA-Z])/g, (_, a, b) => {
      return a + b.toUpperCase()
    })
    .replace(/[^a-zA-Z0-9]/g, '')

  return /^\d/.test(replaced) ? '_' + replaced : replaced
}

function pathToRoute(segments: string[], parentDepth: number): string {
  const last = segments[segments.length - 1]

  if (isOmittable(last)) {
    segments = segments.slice(0, -1)
  } else {
    segments = segments.slice(0, -1).concat(basename(last))
  }

  const routeSegments = segments.slice(parentDepth).map(s => {
    return isDynamicRoute(s) ? ':' + s.slice(1) : s
  })

  const prefix = parentDepth > 0 ? '' : '/'
  return prefix + routeSegments.join('/')
}

function basename(filename: string): string {
  return filename.replace(/\..+?$/, '')
}
