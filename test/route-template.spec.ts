import { createRoutes } from '../src/template/routes'
import { PageMeta } from '../src/resolve'

describe('Route template', () => {
  it('should generate routes', () => {
    const meta: PageMeta[] = [
      {
        name: 'foo',
        path: '/foo',
        component: '@/pages/foo.vue'
      },
      {
        name: 'bar',
        path: '/bar',
        component: '@/pages/bar.vue'
      }
    ]

    expect(createRoutes(meta)).toMatchSnapshot()
  })

  it('should generate nested routes', () => {
    const meta: PageMeta[] = [
      {
        name: 'foo',
        path: '/foo',
        component: '@/pages/foo.vue',
        children: [
          {
            name: 'bar',
            path: 'bar',
            component: '@/pages/bar.vue'
          },
          {
            name: 'baz',
            path: 'baz',
            component: '@/pages/baz.vue'
          }
        ]
      }
    ]

    expect(createRoutes(meta)).toMatchSnapshot()
  })
})
