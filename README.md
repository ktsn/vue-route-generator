# vue-route-generator

[Vue Router](https://github.com/vuejs/vue-router) route config generator.

## Overview

This tool generates a JavaScript code that exporting Vue Router's `routes` config by reading your Vue components directory.

For example, when you have following file structure:

```
pages
├── index.vue
└── users.vue
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

vue-route-generator will generate the following code (beautified the indentations etc.):

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

## References

### `generateRoutes(config: GenerateConfig): string`

`GenerateConfig` has the following properties:

* `pages`: Path to the directory that contains your page components.
* `importPrefix`: A string that will be added to importing component path (default `@/pages/`).

## License

MIT
