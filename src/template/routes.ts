import { PageMeta } from '../resolve'

function createChildrenRoute(children: PageMeta[]): string {
  return `,
    children: [${children.map(createRoute).join(',')}]`
}

function createRoute(meta: PageMeta): string {
  const children = !meta.children ? '' : createChildrenRoute(meta.children)

  return `
  {
    name: '${meta.name}',
    path: '${meta.path}',
    component: () => import(/* webpackChunkName: "${meta.name}" */ '${
    meta.component
  }')${children}
  }`
}

export function createRoutes(meta: PageMeta[]): string {
  const code = meta.map(createRoute).join(',')
  return `export default [${code}]`
}
