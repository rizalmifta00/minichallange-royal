import * as emotion from '@emotion/react'
export {}

declare global {
  const css: typeof emotion.css
  const navigate: (src: string) => void
  const params: any
}
