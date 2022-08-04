import { IAppRoot } from 'index'
import { createRouter } from 'radix3'
import { FC, lazy } from 'react'
import layouts from '../../../../../app/web/types/layout'
import pages from '../../../../../app/web/types/page'

export type Base = {
  layouts: typeof layouts
  pages: typeof pages
}

export type IFoundPage = {
  layout: string
  page: string
  Page: FC
  Layout: FC
  params: any
}

const w = window

if (w.appRoot && w.mode === 'dev') {
  w.appRoot.router = undefined
  w.cache.layouts = {};
  w.cache.pages = {};
  if (w.appRoot.render) w.appRoot.render()
}

// this will be run on each app render, so it cannot be an aysnc func
export const loadPageAndLayout = (local: IAppRoot) => {
  local.page.list = pages as any
  local.layout.list = layouts as any

  if (!local.router || w.mode === 'dev') {
    w.cache.layouts = {}
    w.cache.pages = {}
    local.router = createRouter()
    initializeRoute(local)
  }

  if (local.router) {
    let found = local.router.lookup(local.url) as IFoundPage | null | undefined

    if (!found) {
      found = local.router.lookup(local.url + '/') as
        | IFoundPage
        | null
        | undefined
    }


    if (found) {
      w.params = found.params || {}

      local.page.name = found.page

      if (w.cache.pages[found.page]) {
        local.page.current = w.cache.pages[found.page]
      } else {
        local.page.current = found.Page
      }

      if (local.layout.name !== found.layout || w.mode === 'dev') {
        local.layout.name = found.layout

        if (w.cache.layouts[found.layout]) {
          local.layout.current = w.cache.layouts[found.layout]
        } else {
          local.layout.current = found.Layout
        }
      } else if (w.cache.layouts[found.layout]) {
        local.layout.current = w.cache.layouts[found.layout]
      }
    }
    return found
  }
}

const initializeRoute = (local: IAppRoot) => {
  if (local.router) {
    for (let [pageName, page] of Object.entries(local.page.list)) {
      const [url, layoutName, pageDef] = page as unknown as [
        string,
        string,
        () => Promise<{
          default: {
            url: string
            layout: string
            component: () => {
              default: React.ComponentType<any>
            }
          }
        }>
      ]

      local.router.insert(convertUrl(url), {
        layout: layoutName,
        page: pageName,
        Page: lazy(
          () =>
            new Promise<any>(async (resolve) => {
              const component = (await pageDef()).default.component
              w.cache.pages[pageName] = component
              resolve({
                default: component,
              })
            })
        ),
        Layout: lazy(
          () =>
            new Promise<any>(async (resolve) => {
              const layoutFound = local.layout.list[layoutName]
              if (layoutFound) {
                const result = (await layoutFound()).default

                w.cache.layouts[layoutName] = result
                resolve({
                  default: result,
                })
              } else {
                resolve({
                  default: (children: any) => children,
                })
              }
            })
        ),
      })
    }
  }
}

const convertUrl = (url: string) => {
  let newUrl = url.replace(/\:(.+)\?/gi, ':$1')
  return newUrl
}
