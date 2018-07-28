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

  return ''
}

describe('Route resolution', () => {
  function test(name: string, paths: string[]): void {
    it(name, () => {
      expect(
        resolveRoutePaths(paths, '@/pages/', mockReadFile)
      ).toMatchSnapshot()
    })
  }

  test('resolves routes', ['index.vue', 'foo.vue', 'baz.vue'])

  test('resolves dynamic routes', ['users/_id.vue'])

  test('resolves nested routes', ['foo.vue', 'foo/index.vue', 'foo/bar.vue'])

  test('resolves dynamic nested routes', [
    'users/_id.vue',
    'users/test.vue',
    'users.vue',
    'users/_id/foo.vue'
  ])

  test('resolves spase nested routes', ['users.vue', 'users/session/login.vue'])

  test('resolves number prefixed route', ['1test.vue', '1test/2nested.vue'])

  test('resolve route meta', ['meta.vue'])

  it('throws error when failed to parse route-meta', () => {
    expect(() => {
      resolveRoutePaths(['invalid-meta.vue'], '@/pages/', mockReadFile)
    }).toThrow(
      /Invalid json format of <route-meta> content in invalid-meta\.vue/
    )
  })
})
