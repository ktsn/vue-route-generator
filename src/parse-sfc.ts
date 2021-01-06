import type { parseComponent as _parserV2 } from 'vue-template-compiler'
import type { parse as _parserV3 } from '@vue/compiler-sfc'

export interface ParseResult {
  customBlocks: CustomBlock[]
}

export interface CustomBlock {
  type: string
  content: string
}

export function parseSFC(code: string): ParseResult {
  try {
    const parserV2: typeof _parserV2 = require('vue-template-compiler')
      .parseComponent
    return parserV2(code, {
      pad: 'space',
    })
  } catch {
    try {
      const parserV3: typeof _parserV3 = require('@vue/compiler-sfc').parse
      return parserV3(code, {
        pad: 'space',
      }).descriptor
    } catch {
      throw new Error(
        '[vue-route-generator] Either "vue-template-compiler" or "@vue/compiler-sfc" is required.'
      )
    }
  }
}
