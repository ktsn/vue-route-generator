import * as fs from 'fs'
import * as path from 'path'
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

  const metaList = resolveRoutePaths(pagePaths, importPrefix, file => {
    return fs.readFileSync(path.join(pages, file), 'utf8')
  })

  return createRoutes(metaList, dynamicImport)
}
