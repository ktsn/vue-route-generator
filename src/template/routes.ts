import * as prettier from 'prettier'
import { PageMeta } from '../resolve'

function createChildrenRoute(children: PageMeta[]): string {
  return `,children: [${children.map(createRoute).join(',')}]`
}

function createRoute(meta: PageMeta): string {
  const children = !meta.children ? '' : createChildrenRoute(meta.children)

  // If default child is exists, the route should not have a name.
  const routeName =
    meta.children && meta.children.some(m => m.path === '')
      ? ''
      : `name: '${meta.name}',`

  const routeMeta = !meta.routeMeta
    ? ''
    : ',meta: ' + JSON.stringify(meta.routeMeta, null, 2)

  return `
  {
    ${routeName}
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
  return prettier.format(`${imports}\n\nexport default [${code}]`, {
    parser: 'babylon',
    semi: false,
    singleQuote: true
  })
}
