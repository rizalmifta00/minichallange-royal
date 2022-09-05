import { ParsedConfig } from 'boot/dev/config-parse'

import pad from 'lodash.pad'
import * as serverDb from 'server-db'
import { log } from 'server-utility'
import express from 'express'

export type IServeDbArgs = {
  workerId: string
  router: ReturnType<typeof express.Router>
  app: ReturnType<typeof express>
  config: ParsedConfig
  mode: 'dev' | 'prod' | 'pkg'
}

export type IDBMsg = {
  table: string
  db: string
  action: string
  params: Partial<{
    where: any
    orderBy: any
    take: any
    include: any
    data: any
  }>[]
}

export const serveDb = (arg: Partial<IServeDbArgs>) => {
  const { router, workerId } = arg

  if (router) {
    router.post('/__data/*', async (req, res, next) => {
      const body = req.body as IDBMsg
      res.setHeader('content-type', 'application/json')
      if (workerId) {
        const dbResult = await serverDb.clusterQuery(body, workerId)
        if (dbResult) {
          res.write(JSON.stringify(dbResult))
          res.end()
          return
        }
        res.write(JSON.stringify([]))
        res.end()
        return
      }

      res.statusCode = 403
      res.write(JSON.stringify({ status: 'forbidden' }))
      res.end()
    })
  }
}
