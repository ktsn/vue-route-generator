import * as prettier from 'prettier'
import { PageMeta } from '../resolve'

function isAllowedRouteOption(key: string): boolean {
  return !['name', 'meta', 'path', 'component'].includes(key)
}

function createChildrenRoute(children: PageMeta[]): string {
  return `,children: [${children.map(createRoute).join(',')}]`
}

function createRoute(meta: PageMeta): string {
  const children = !meta.children ? '' : createChildrenRoute(meta.children)
  const route = meta.route ?? {}

  // If default child is exists, the route should not have a name.
  const routeName =
    meta.children && meta.children.some((m) => m.path === '')
      ? ''
      : `name: '${route.name ?? meta.name}',`

  const routeMeta = meta.routeMeta
    ? ',meta: ' + JSON.stringify(meta.routeMeta, null, 2)
    : meta.route?.meta
    ? ',meta: ' + JSON.stringify(route.meta, null, 2)
    : ''

  const otherOptions = Object.keys(route)
    .filter(isAllowedRouteOption)
    .map((key) => `,${key}: ${JSON.stringify(route[key])}`)
    .join(',')

  return `
  {
    ${routeName}
    path: '${meta.path}',
    component: ${meta.specifier}${routeMeta}${otherOptions}${children}
  }`
}

function createImport(
  meta: PageMeta,
  dynamic: boolean,
  chunkNamePrefix: string
): string {
  const code = dynamic
    ? `function ${meta.specifier}() { return import(/* webpackChunkName: "${chunkNamePrefix}${meta.chunkName}" */ '${meta.component}') }`
    : `import ${meta.specifier} from '${meta.component}'`

  return meta.children
    ? [code]
        .concat(
          meta.children.map((child) =>
            createImport(child, dynamic, chunkNamePrefix)
          )
        )
        .join('\n')
    : code
}

export function createRoutes(
  meta: PageMeta[],
  dynamic: boolean,
  chunkNamePrefix: string
): string {
  const imports = meta
    .map((m) => createImport(m, dynamic, chunkNamePrefix))
    .join('\n')
  const code = meta.map(createRoute).join(',')
  return prettier.format(`${imports}\n\nexport default [${code}]`, {
    parser: 'babel',
    semi: false,
    singleQuote: true,
  })
}
