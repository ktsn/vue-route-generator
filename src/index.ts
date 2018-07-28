import * as fg from 'fast-glob'
import { createRoutes } from './template/routes'
import { resolveRoutePaths } from './resolve'

export interface GenerateConfig {
  pages: string
  importPrefix?: string
  dynamicImport?: boolean
}

export function generateRoutes({
  pages,
  importPrefix = '@/pages/',
  dynamicImport = true
}: GenerateConfig): string {
  const pagePaths = fg.sync<string>('**/*.vue', {
    cwd: pages,
    onlyFiles: true
  })

  const metaList = resolveRoutePaths(pagePaths, importPrefix)

  return createRoutes(metaList, dynamicImport)
}
