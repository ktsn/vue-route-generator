import { resolveRoutePaths } from '../src/resolve'

function mockReadFile(path: string): string {
  if (path === 'meta.vue') {
    return `<route-meta>
    {
      "title": "Hello"
    }
    </route-meta>`
  }

  if (path === 'invalid-meta.vue') {
    return `<route-meta>
    {
      "invalid": "Test",
    }
    </route-meta>`
  }

  if (path === 'route.vue') {
    return `<route>
    {
      "name": "Test",
      "meta": {
        "title": "Hello"
      }
    }
    </route>`
  }

  if (path === 'invalid-route.vue') {
    return `<route>
    {
      "name": "Test",
    }
    </route>`
  }

  return ''
}

describe('Route resolution', () => {
  interface TestOptions {
    nested?: boolean
    inlineRouteBlock?: boolean
    expectWarn?: string
  }

  function test(
    name: string,
    paths: string[],
    options: TestOptions = {}
  ): void {
    it(name, () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation()

      expect(
        resolveRoutePaths(paths, {
          importPrefix: '@/pages/',
          nested: !!options.nested,
          inlineRouteBlock: options.inlineRouteBlock ?? true,
          readFile: mockReadFile,
        })
      ).toMatchSnapshot()

      if (options.expectWarn) {
        expect(spy).toHaveBeenCalledWith(options.expectWarn)
      }
    })
  }

  test('resolves routes', ['index.vue', 'foo.vue', 'baz.vue'])

  test('resolves nested route including index', ['a/index/b/index/c.vue'])

  test('resolves nested route including index with corresponding index.vue', [
    'a/index.vue',
    'a/index/b/index.vue',
    'a/index/b/index/c.vue',
  ])

  test('resolves dynamic routes', ['users/_id.vue'])

  test('resolves dynamic routes with multiple "."', ['user.register.vue'])

  test('resolves dynamic routes with required param', ['users/_id/index.vue'])

  test('resolves nested routes', ['foo.vue', 'foo/index.vue', 'foo/bar.vue'])

  test('resolves dynamic nested routes', [
    'users/_id.vue',
    'users/test.vue',
    'users.vue',
    'users/_id/foo.vue',
  ])

  test('resolves spase nested routes', ['users.vue', 'users/session/login.vue'])

  test('resolves number prefixed route', ['1test.vue', '1test/2nested.vue'])

  test('resolve route meta', ['meta.vue'], {
    expectWarn:
      '<route-meta> custom block is deprecated. Use <route> block instead. Found in meta.vue',
  })

  test('resolve route custom block', ['route.vue'])

  test(
    'do not resolve route custom block if inlineRouteBlock is false',
    ['route.vue'],
    {
      inlineRouteBlock: false,
    }
  )

  test('resolves as nested routes', ['index.vue', 'foo.vue'], {
    nested: true,
  })

  test('prioritizes index than dynamic route', [
    'users/_id.vue',
    'users/foo.vue',
    'users/index.vue',
  ])

  it('throws error when failed to parse route-meta', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation()

    expect(() => {
      resolveRoutePaths(['invalid-meta.vue'], {
        importPrefix: '@/pages/',
        nested: false,
        inlineRouteBlock: true,
        readFile: mockReadFile,
      })
    }).toThrow(
      /Invalid json format of <route-meta> content in invalid-meta\.vue/
    )
    expect(spy).toHaveBeenCalledWith(
      '<route-meta> custom block is deprecated. Use <route> block instead. Found in invalid-meta.vue'
    )
  })

  it('throws error when failed to parse route custom block', () => {
    expect(() => {
      resolveRoutePaths(['invalid-route.vue'], {
        importPrefix: '@/pages/',
        nested: false,
        inlineRouteBlock: true,
        readFile: mockReadFile,
      })
    }).toThrow(/Invalid json format of <route> content in invalid-route\.vue/)
  })

  describe('sorting', () => {
    test('prioritizes static routes than dynamic ones', [
      'nested/foo.vue',
      'nested/_id.vue',
      'nested/bar.vue',
    ])

    test('prioritizes deeper routes', [
      'nested/_id/foo/bar.vue',
      'nested/_id/_key/bar.vue',
      'nested/test/foo/bar.vue',
      'nested/test/foo/_id.vue',
    ])

    test('handles when a dynamic route is a directory', [
      'nested/_id/foo.vue',
      'nested/foo.vue',
    ])

    test('handles when a static route is a directory', [
      'nested/_id.vue',
      'nested/foo/bar.vue',
    ])

    test('handles when both static and dynamic routes are directories', [
      'nested/_id/foo.vue',
      'nested/static/foo.vue',
    ])
  })
})
