import { PageMeta } from '../resolve'

function createChildrenRoute(children: PageMeta[]): string {
  return `,
    children: [${children.map(createRoute).join(',')}]`
}

function createRoute(meta: PageMeta): string {
  const children = !meta.children ? '' : createChildrenRoute(meta.children)

  const routeMeta = !meta.routeMeta
    ? ''
    : ',\nmeta: ' + JSON.stringify(meta.routeMeta, null, 2)

  return `
  {
    name: '${meta.name}',
    path: '${meta.path}',
    component: ${meta.specifier}${routeMeta}${children}
  }`
}

function createImport(meta: PageMeta, dynamic: boolean): string {
  const code = dynamic
    ? `const ${meta.specifier} = () => import(/* webpackChunkName: "${
        meta.name
      }" */ '${meta.component}')`
    : `import ${meta.specifier} from '${meta.component}'`

  return meta.children
    ? [code]
        .concat(meta.children.map(child => createImport(child, dynamic)))
        .join('\n')
    : code
}

export function createRoutes(meta: PageMeta[], dynamic: boolean): string {
  const imports = meta.map(m => createImport(m, dynamic)).join('\n')
  const code = meta.map(createRoute).join(',')
  return `${imports}\n\nexport default [${code}]`
}
