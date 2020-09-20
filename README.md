# vue-route-generator

[Vue Router](https://github.com/vuejs/vue-router) route config generator.

You may want to use [vue-auto-routing](https://github.com/ktsn/vue-auto-routing) for auto generating routing or [vue-cli-plugin-auto-routing](https://github.com/ktsn/vue-cli-plugin-auto-routing) which includes all useful features on routing.

## Overview

This tool generates a JavaScript code that exporting Vue Router's `routes` config by reading your Vue components directory.

For example, when you have following file structure:

```
pages/
├── index.vue
├── users.vue
└── users/
    └── _id.vue
```

Then run the following script:

```js
const { generateRoutes } = require('vue-route-generator')

const code = generateRoutes({
  pages: './pages' // Vue page component directory
})

console.log(code)
```

vue-route-generator will generate like the following code (beautified the indentations etc.):

```js
export default [
  {
    name: 'index',
    path: '/',
    component: () => import('@/pages/index.vue')
  },
  {
    name: 'users',
    path: '/users',
    component: () => import('@/pages/users.vue'),
    children: [
      {
        name: 'users-id',
        path: ':id',
        component: () => import('@/pages/users/_id.vue')
      }
    ]
  }
]
```

You can save the code and include router instance:

```js
const fs = require('fs')
const { generateRoutes } = require('vue-route-generator')

const code = generateRoutes({
  pages: './pages'
})

fs.writeFileSync('./router/routes.js', code)
```

```js
// router/index.js
import Vue from 'vue'
import Router from 'vue-router'

// import generated routes
import routes from './routes'

Vue.use(Router)

export default new Router({
  routes
})
```

## Routing

The routing is inspired by [Nuxt routing](https://nuxtjs.org/guide/routing) and is implemented with the same functionality.

### Partials

Directories and files started and ended with `__` (two underscores, e.g. `__foo__.vue`) will be ignored. You can use them as partial components which will be used in some page components.

## Route Custom Block

If the components have `<route>` custom block, its json content will be merged into the generated route record.

For example, if `index.vue` has the following `<route>` block:

```vue
<route>
{
  "name": "home",
  "meta": {
    "requiresAuth": true
  }
}
</route>

<template>
  <h1>Hello</h1>
</template>
```

The generated route config is like following:

```js
module.exports = [
  {
    name: 'home', // Overwritten by <route> block's name field.
    path: '/',
    component: () => import('@/pages/index.vue'),

    // Added by <route> block's meta field.
    meta: {
      requiresAuth: true
    }
  }
]
```

## Syntax Highlighting

To enable syntax highlighting in VS Code using [Vetur's Custom Code Blocks](https://vuejs.github.io/vetur/highlighting.html#custom-block) add the following snippet to your preferences...
```
 "vetur.grammar.customBlocks": {
    "route": "json"
  }
```

## References

### `generateRoutes(config: GenerateConfig): string`

`GenerateConfig` has the following properties:

- `pages`: Path to the directory that contains your page components.
- `importPrefix`: A string that will be added to importing component path (default `@/pages/`).
- `dynamicImport`: Use dynamic import expression (`import()`) to import component (default `true`).
- `chunkNamePrefix`: Prefix for each route chunk name (only available when `dynamicImport: true`).
- `nested`: If `true`, generated route path will be always treated as nested. (e.g. will generate `path: 'foo'` rather than `path: '/foo'`)

## Related Projects

- [vue-cli-plugin-auto-routing](https://github.com/ktsn/vue-cli-plugin-auto-routing): Vue CLI plugin including auto pages and layouts resolution.
- [vue-router-layout](https://github.com/ktsn/vue-router-layout): Lightweight layout resolver for Vue Router.
- [vue-auto-routing](https://github.com/ktsn/vue-auto-routing): Generate Vue Router routing automatically.

## License

MIT
