import { ParsedConfig } from 'boot/dev/config-parse'
import express from 'express'
import { g } from '..'

const login = require('../../../../../app/server/src/auth/login')
const logout = require('../../../../../app/server/src/auth/logout')

export type IServeAuthArgs = {
  router: ReturnType<typeof express.Router>
  app: ReturnType<typeof express>
  config: ParsedConfig
  mode: 'dev' | 'prod' | 'pkg'
}

export const serveAuth = (arg: Partial<IServeAuthArgs>) => {
  const { router } = arg

  if (router) {
    router.post('/auth/set-data', async (req, res, next) => {
      const { key, value } = req.body
      if (key) {
        ;(req.session as any)[key] = value
      }
      res.send(req.session)
    })

    router.get('/auth/data', async (req, res, next) => {
      res.send(req.session)
    })

    router.post('/auth/login', async (req, res, next) => {
      let response = {}
      if (!!login)
        response = await login.default({
          sid: req.session.id,
          ext: g.app.ext,
          req,
          res,
        })
      res.send({ ...req.session, ...response })
    })

    router.get('/auth/logout', async (req, res, next) => {
      if (!!logout)
        await logout.default({
          sid: req.session.id,
          ext: g.app.ext,
          req,
          res,
        })

      req.session.destroy((err) => {
        console.error(err)
      })
      console.log(req.session)
      res.send({})
    })
  }
}
