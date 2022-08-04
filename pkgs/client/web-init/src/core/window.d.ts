import { css } from '@emotion/react'
import { IAppRoot } from 'index'
import { Fragment } from 'react'
import type { dbs } from 'server-db'
import { jsx } from './jsx'

declare global {
  interface Window {
    mode: 'dev' | 'prod' | 'pkg'
    css: typeof css
    jsx: typeof jsx
    Fragment: typeof Fragment
    Capacitor: any
    isMobile: boolean
    mobile: {
      ready: boolean
      insets: any
    }
    navigate: (href: string) => void
    preventPopRender: boolean
    appRoot: IAppRoot & { render: () => void }
    db: typeof dbs['db']
    dbs: typeof dbs
    dbDefinitions: Record<string, any>
    auth: any
    baseurl: string
    serverurl: string
    params: any
    cache: {
      layouts: Record<string, any>
      pages: Record<string, any>
    }
  }
}
