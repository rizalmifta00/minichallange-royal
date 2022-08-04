import { ParsedConfig } from 'boot/dev/config-parse'

import { createApp, createRouter, useBody } from 'h3'
import * as serverDb from 'server-db'
import { log } from 'server-utility'

export type IServeDbArgs = {
  workerId: string
  router: ReturnType<typeof createRouter>
  app: ReturnType<typeof createApp>
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
    router.use('/__data/**', async (req, res, next) => {
      const body = (await useBody(req)) as IDBMsg

      if (workerId) {
        const dbResult = await serverDb.clusterQuery(body, workerId)
        if (dbResult) {
          res.setHeader('content-type', 'application/json')
          res.write(JSON.stringify(dbResult))
          res.end()
          return
        } else {
          res.setHeader('content-type', 'application/json')
          res.write(JSON.stringify([]))
          res.end()
          return
        }
      }

      res.statusCode = 403
      res.setHeader('content-type', 'application/json')
      res.write(JSON.stringify({ status: 'forbidden' }))
      res.end()
    })
  }
}
