/** @jsx jsx */
import { createRouter } from 'radix3'
import { FC, Suspense } from 'react'
import { GlobalContext, useLocal } from 'web-utils'
import { loadPageAndLayout } from './core/router'
import { ErrorBoundary } from './error'

const w = window
export type IAppRoot = {
  url: string
  layout: {
    name?: string
    current?: FC
    last?: FC
    list: Record<string, () => Promise<{ default: React.ComponentType<any> }>>
  }
  page: {
    name?: string
    current?: FC
    list: Record<
      string,
      () => Promise<{
        url: string
        component: () => Promise<React.ComponentType<any>>
      }>
    >
  }
  router?: ReturnType<typeof createRouter>
  cached: Record<
    'page' | 'layout',
    Record<string, { layout: string; page: FC }>
  >
  global: WeakMap<any, any>
  mounted: boolean
  devTime: number
}

const devTime = new Date().getTime()

export const App = () => {
  const local = useLocal({
    url: '',
    layout: {},
    page: {},
    cached: { page: {}, layout: {} },
    mounted: true,
    global: new WeakMap(),
    devTime: devTime,
  } as IAppRoot)

  w.appRoot = local

  if (
    !local.router ||
    local.url !== location.pathname ||
    (w.mode === 'dev' && devTime !== local.devTime)
  ) {
    local.devTime = devTime
    local.url = location.pathname
    loadPageAndLayout(local)
  }

  const Layout = local.layout.current
  const Page = local.page.current

  if (!Layout || !Page) {
    return null
  }



  return (
    <GlobalContext.Provider
      value={{
        global: local.global,
        render: () => {
          local.render()
        },
      }}
    >
      <OptionalSuspense>
        <Layout>
          <OptionalSuspense>
            <Page />
          </OptionalSuspense>
        </Layout>
      </OptionalSuspense>
    </GlobalContext.Provider>
  )
}

const OptionalSuspense: FC<{ children: any }> = ({ children }) => {
  return children.$$typeof ? (
    <Suspense fallback={null}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </Suspense>
  ) : (
    <ErrorBoundary>{children}</ErrorBoundary>
  )
}
