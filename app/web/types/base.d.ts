import * as emotion from '@emotion/react'
import type _dbs from 'dbs'
export {}

declare global {
  const css: typeof emotion.css
  const navigate: (src: string) => void
  const params: any
  const db: typeof _dbs['db']
  const dbs: typeof _dbs
}
