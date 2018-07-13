import { NestedMap, setToMap } from './nested-map'

export interface PageMeta {
  name: string
  path: string
  component: string
  children?: PageMeta[]
}

export function resolveRoutePaths(
  paths: string[],
  importPrefix: string
): PageMeta[] {
  const map: NestedMap<string[]> = {}

  const splitted = paths.map(p => p.split('/'))
  splitted.forEach(path => {
    setToMap(map, pathToMapPath(path), path)
  })

  return pathMapToMeta(map, importPrefix)
}

function pathMapToMeta(
  map: NestedMap<string[]>,
  importPrefix: string,
  parentDepth: number = 0
): PageMeta[] {
  if (map.value) {
    const path = map.value
    const meta: PageMeta = {
      name: pathToName(path),
      path: pathToRoute(path, parentDepth),
      component: importPrefix + path.join('/')
    }

    if (map.children) {
      meta.children = pathMapChildrenToMeta(
        map.children,
        importPrefix,
        path.length
      )
    }

    return [meta]
  }

  return map.children
    ? pathMapChildrenToMeta(map.children, importPrefix, parentDepth)
    : []
}

function pathMapChildrenToMeta(
  children: Map<string, NestedMap<string[]>>,
  importPrefix: string,
  parentDepth: number
): PageMeta[] {
  return Array.from(children.values()).reduce<PageMeta[]>((acc, value) => {
    return acc.concat(pathMapToMeta(value, importPrefix, parentDepth))
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
