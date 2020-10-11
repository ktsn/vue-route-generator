import * as prettier from 'prettier'
import { PageMeta } from '../resolve'

function isAllowedRouteOption(key: string): boolean {
  return !['name', 'meta', 'path', 'component'].includes(key)
}

function createChildrenRoute(
  children: PageMeta[],
  inlineRouteBlock: boolean
): string {
  return `,children: [${children
    .map((c) => createRoute(c, inlineRouteBlock))
    .join(',')}]`
}

function createRoute(meta: PageMeta, inlineRouteBlock: boolean): string {
  const children = !meta.children
    ? ''
    : createChildrenRoute(meta.children, inlineRouteBlock)
  const route = meta.route

  // If default child is exists, the route should not have a name.
  const routeName =
    meta.children && meta.children.some((m) => m.path === '')
      ? ''
      : `name: '${route?.content?.name ?? meta.name}',`

  const routeMeta = meta.routeMeta
    ? ',meta: ' + JSON.stringify(meta.routeMeta, null, 2)
    : route?.content?.meta
    ? ',meta: ' + JSON.stringify(route.content.meta, null, 2)
    : ''

  const otherOptions = Object.keys(route?.content ?? {})
    .filter(isAllowedRouteOption)
    .map((key) => `,${key}: ${JSON.stringify(route?.content[key])}`)
    .join(',')

  const routeBlockSpread =
    !inlineRouteBlock && meta.route ? `...${meta.specifier}___route,` : ''

  return `
  {
    ${routeName}${routeBlockSpread}
    path: '${meta.path}',
    component: ${meta.specifier}${routeMeta}${otherOptions}${children}
  }`
}

function createImport(
  meta: PageMeta,
  dynamic: boolean,
  chunkNamePrefix: string,
  inlineRouteBlock: boolean
): string {
  let code = dynamic
    ? `function ${meta.specifier}() { return import(/* webpackChunkName: "${chunkNamePrefix}${meta.chunkName}" */ '${meta.component}') }`
    : `import ${meta.specifier} from '${meta.component}'`

  if (meta.route && !inlineRouteBlock) {
    code += `\nimport ${meta.specifier}___route from '${meta.component}?vue&vueRouteGenerator&type=custom&blockType=route&index=${meta.route.index}&lang=${meta.route.lang}'`
  }

  return meta.children
    ? [code]
        .concat(
          meta.children.map((child) =>
            createImport(child, dynamic, chunkNamePrefix, inlineRouteBlock)
          )
        )
        .join('\n')
    : code
}

export function createRoutes(
  meta: PageMeta[],
  dynamic: boolean,
  chunkNamePrefix: string,
  inlineRouteBlock: boolean
): string {
  const imports = meta
    .map((m) => createImport(m, dynamic, chunkNamePrefix, inlineRouteBlock))
    .join('\n')
  const code = meta.map((m) => createRoute(m, inlineRouteBlock)).join(',')
  return prettier.format(`${imports}\n\nexport default [${code}]`, {
    parser: 'babel',
    semi: false,
    singleQuote: true,
  })
}
