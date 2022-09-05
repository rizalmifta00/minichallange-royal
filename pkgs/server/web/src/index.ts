import type { ParsedConfig } from 'boot/dev/config-parse'
import cluster, { Worker } from 'cluster'
import get from 'lodash.get'
import pad from 'lodash.pad'
import * as serverDb from 'server-db'
import { IDBQueueResult } from 'server-db/types/global'
import { log, prettyError } from 'server-utility'
import { getAppServer } from './app-server'
import { IDBMsg } from './routes/serve-db'
import { startCluster } from './start-cluster'
import { startWorkerHttp, web } from './start-worker-http'
import { g } from './types'
export * from './types'

prettyError()

export type IServerInit = {
  action: 'init' | 'kill' | 'reload' | 'db.query' | 'db.result'
  name?: string
  config: ParsedConfig
  mode: 'dev' | 'prod' | 'pkg'
  parentStatus?: IClusterParent['status']
  db?: {
    id: string
    result?: any
    query?: IDBMsg
  }
}

export type IClusterParent = {
  status: 'init' | 'ready' | 'stopping'
  child: Record<number, Worker>
  clusterSize: number
  config: ParsedConfig
  mode: 'dev' | 'prod' | 'pkg'
}

if (cluster.isWorker) {
  const worker = cluster.worker
  if (worker) {
    worker.on('message', async (data: IServerInit) => {
      const id = process.env.id

      if (data.action === 'init') {
        await startWorkerHttp(data.config, data.mode, `${id || 0}`)
        log(
          `[${pad(`wrk-${id}`, 7)}]  🍃 Back End Worker #${id} ${
            data.parentStatus === 'init' ? 'started' : 'reloaded'
          } (pid:${process.pid})`
        )
      } else if (data.action === 'kill') {
        if (web.server) {
          web.server.on('close', () => {
            worker?.destroy()
          })
          if (web.server.listening) {
            web.server.close()
          } else {
            worker?.destroy()
          }
        } else {
          process.exit(1)
        }
      } else if (data.action === 'db.result') {
        const dbQueue = (global as any).dbQueue as Record<
          string,
          IDBQueueResult
        >
        if (data.db && dbQueue[data.db.id]) {
          dbQueue[data.db.id].resolve(data.db.result)
          delete dbQueue[data.db.id]
        }
      }
    })
  }
} else {
  if (process.send) {
    ;(async () => {
      const parent = {
        status: 'init',
        child: {},
        clusterSize: 0,
      } as IClusterParent

      process.on('message', async (data: IServerInit) => {
        if (data.action === 'kill') {
          const onKillRoot = get(g.app, 'events.root.kill')
          if (onKillRoot) {
            await onKillRoot()
          }
          if (process.send) process.send({ event: 'killed' })
        }
        if (data.action === 'init') {
          try {
            for (let client of Object.values(data.config.client)) {
              client.url = client.url.replace(
                `[server.url]`,
                data.config.server.url
              )
            }

            parent.config = data.config
            parent.mode = data.mode

            if (parent.status === 'init') {
              await startCluster(parent)
              await serverDb.startDBFork(data.config, data.mode)

              const forks = (global as any).forks
              if (Object.keys(forks || {}).length === 0) {
                console.log(`[  dbs  ] WARNING: No database used`)
              }
            } else {
              await startCluster(parent)
            }

            await getAppServer(data.mode)

            const onInitRoot = get(g.app, 'events.root.init')

            if (onInitRoot) {
              g.dbs = await serverDb.dbsClient(
                'fork',
                Object.keys(data.config.dbs)
              )
              g.db = g.dbs['db']

              await onInitRoot(parent, data)
            }

            parent.status = 'ready'
            if (process.send)
              process.send({ event: 'started', url: data.config.server.url })
          } catch (e) {
            console.log(`[ worker ] Failed to start worker: ${e}`)
          }
        }

        if (data.action === 'db.query' && data.db && data.db.query) {
          serverDb.forkQuery(data.db.query)
        }

        if (data.action === 'reload') {
          await getAppServer('dev')
          if (parent.status === 'ready') {
            for (let wk of Object.values(parent.child)) {
              wk.send({ action: 'kill' })
            }
          }
        } else if (data.action.startsWith('reload.')) {
          await getAppServer('dev')
          if (parent.status === 'ready') {
            for (let wk of Object.values(parent.child)) {
              wk.send(data)
            }
          }
        }

        if (data.action === 'kill') {
          await serverDb.stopDBFork()

          parent.status = 'stopping'
          const killings = [] as Promise<void>[]
          for (let wk of Object.values(parent.child)) {
            wk.send({ action: 'kill' })
            killings.push(
              new Promise((killed) => {
                wk.once('disconnect', killed)
                wk.once('exit', killed)
              })
            )
          }

          await Promise.all(killings)
          process.exit(1)
        }
      })
    })()
  }
}
