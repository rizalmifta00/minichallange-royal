import { css } from '@emotion/react'
import React, { Fragment } from 'react'
import { jsx } from './jsx'
import { dbsClient } from 'server-db'

import { dbsList } from '../../../../../app/web/types/dbs-list'

export const initEnv = async () => {
  const w = window
  if (!w.css) {
    if (!w.mode) w.mode = 'dev'
    w.css = css
    w.jsx = jsx
    w.Fragment = Fragment
    w.React = React
    w.cache = {
      layouts: {},
      pages: {},
    }
    w.params = {}

    if (w.Capacitor) {
      w.isMobile = true
      w.mobile = {
        ready: false,
        insets: null,
      }
      if (w.Capacitor.Plugins) {
        const app = w.Capacitor.Plugins.App
        if (app) {
          app.addListener('backButton', () => {
            history.back()
          })
        }
      }
    }

    w.navigate = (href: string) => {
      if (!w.appRoot.mounted) {
        location.href = href
        return
      }
      history.pushState({}, '', href)
      w.appRoot.render()
    }
    window.addEventListener('popstate', () => {
      if (w.preventPopRender) {
        w.preventPopRender = false
        return
      }
      w.appRoot.render()
    })

    w.dbs = await dbsClient('fetch', dbsList as any)
    for (let key of Object.keys(w.dbs)) {
      ;(w as any)[key] = w.dbs[key]
    }
  }
}
