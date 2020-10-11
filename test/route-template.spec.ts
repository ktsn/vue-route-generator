import { createRoutes } from '../src/template/routes'
import { PageMeta } from '../src/resolve'

describe('Route template', () => {
  it('should generate routes', () => {
    const meta: PageMeta[] = [
      {
        name: 'foo',
        chunkName: 'foo',
        specifier: 'Foo',
        path: '/foo',
        pathSegments: ['foo'],
        component: '@/pages/foo.vue',
      },
      {
        name: 'bar',
        chunkName: 'bar',
        specifier: 'Bar',
        path: '/bar',
        pathSegments: ['bar'],
        component: '@/pages/bar.vue',
      },
    ]

    expect(createRoutes(meta, true, '', true)).toMatchSnapshot()
  })

  it('should generate nested routes', () => {
    const meta: PageMeta[] = [
      {
        name: 'foo',
        chunkName: 'foo',
        specifier: 'Foo',
        path: '/foo',
        pathSegments: ['foo'],
        component: '@/pages/foo.vue',
        children: [
          {
            name: 'bar',
            chunkName: 'bar',
            specifier: 'FooBar',
            path: 'bar',
            pathSegments: ['foo', 'bar'],
            component: '@/pages/bar.vue',
          },
          {
            name: 'baz',
            chunkName: 'baz',
            specifier: 'FooBaz',
            path: 'baz',
            pathSegments: ['foo', 'baz'],
            component: '@/pages/baz.vue',
          },
        ],
      },
    ]

    expect(createRoutes(meta, true, '', true)).toMatchSnapshot()
  })

  it('should generate static import code', () => {
    const meta: PageMeta[] = [
      {
        name: 'foo',
        chunkName: 'foo',
        specifier: 'Foo',
        path: '/foo',
        pathSegments: ['foo'],
        component: '@/pages/foo.vue',
      },
      {
        name: 'bar',
        chunkName: 'bar',
        specifier: 'Bar',
        path: '/bar',
        pathSegments: ['bar'],
        component: '@/pages/bar.vue',
      },
    ]

    expect(createRoutes(meta, false, '', true)).toMatchSnapshot()
  })

  it('should generate route meta', () => {
    const meta: PageMeta[] = [
      {
        name: 'foo',
        chunkName: 'foo',
        specifier: 'Foo',
        path: '/foo',
        pathSegments: ['foo'],
        component: '@/pages/foo.vue',
        routeMeta: {
          title: 'Hello',
        },
      },
    ]

    expect(createRoutes(meta, false, '', true)).toMatchSnapshot()
  })

  it('should merge route block into route record', () => {
    const meta: PageMeta[] = [
      {
        name: 'foo',
        chunkName: 'foo',
        specifier: 'Foo',
        path: '/foo',
        pathSegments: ['foo'],
        component: '@/pages/foo.vue',
        route: {
          lang: 'json',
          index: 0,
          content: {
            name: 'Test',
            meta: {
              title: 'Hello',
            },
            props: true,
          },
        },
      },
    ]

    expect(createRoutes(meta, false, '', true)).toMatchSnapshot()
  })

  it('should import and merge route block if inlineRouteBlock is false', () => {
    const meta: PageMeta[] = [
      {
        name: 'foo',
        chunkName: 'foo',
        specifier: 'Foo',
        path: '/foo',
        pathSegments: ['foo'],
        component: '@/pages/foo.vue',
        route: {
          lang: 'json',
          index: 0,
        },
      },
    ]

    expect(createRoutes(meta, false, '', false)).toMatchSnapshot()
  })

  it('should configure chunk name prefix', () => {
    const meta: PageMeta[] = [
      {
        name: 'foo',
        chunkName: 'foo',
        specifier: 'Foo',
        path: '/foo',
        pathSegments: ['foo'],
        component: '@/pages/foo.vue',
      },
      {
        name: 'bar',
        chunkName: 'bar',
        specifier: 'Bar',
        path: '/bar',
        pathSegments: ['bar'],
        component: '@/pages/bar.vue',
      },
    ]

    expect(createRoutes(meta, true, 'page-', true)).toMatchSnapshot()
  })

  it('should pick chunkName as a webpack chunk name', () => {
    const meta: PageMeta[] = [
      {
        name: 'users',
        chunkName: 'users-index',
        specifier: 'users_index',
        path: '/users',
        pathSegments: ['users'],
        component: '@/pages/users/index.vue',
      },
    ]

    expect(createRoutes(meta, true, 'page-', true)).toMatchSnapshot()
  })

  it('should not include name if the route has a default child', () => {
    const meta: PageMeta[] = [
      {
        name: 'foo',
        chunkName: 'foo',
        specifier: 'Foo',
        path: '/foo',
        pathSegments: ['foo'],
        component: '@/pages/foo.vue',
        children: [
          {
            name: 'foo',
            chunkName: 'foo-index',
            specifier: 'FooIndex',
            path: '',
            pathSegments: ['foo'],
            component: '@/pages/foo/index.vue',
          },
        ],
      },
    ]

    expect(createRoutes(meta, true, '', true)).toMatchSnapshot()
  })
})
