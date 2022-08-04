import { ParsedConfig } from 'boot/dev/config-parse'
import { createApp, createRouter } from 'h3'
import { createServer } from 'http'
import get from 'lodash.get'
import { g } from '.'
import { getAppServer } from './app-server'
import { createClient } from './client/create-client'
import { serveApi } from './routes/serve-api'
import { serveDb } from './routes/serve-db'
import { serveDbPkg } from './routes/serve-db-pkg'
import * as serverDb from 'server-db'

export const web = {
  app: undefined as undefined | ReturnType<typeof createApp>,
  server: undefined as undefined | ReturnType<typeof createServer>,
  clients: {} as Record<string, {}>,
  ext: undefined as undefined | (Record<string, any> & { init?: () => void }),
}

export const startWorkerHttp = async (
  config: ParsedConfig,
  mode: 'dev' | 'prod' | 'pkg',
  workerId?: string
) => {
  const app = createApp()

  await getAppServer(mode)

  const url = new URL(config.server.url)

  // initiate db
  if (workerId) {
    g.dbs = await serverDb.dbsClient('proxy-cluster', Object.keys(config.dbs), {
      workerId,
    })
  } else {
    // await serverDb.startDBFork(config)
    // g.dbs = await serverDb.dbsClient('fork', Object.keys(config.dbs))
  }
  if (g.dbs) g.db = g.dbs['db']

  // init worker event
  const onInitWorker = get(g.app, 'events.worker.init')
  const router = createRouter()
  if (onInitWorker) {
    try {
      await onInitWorker(app, router, config)
    } catch (e) {
      console.error(e)
    }
  }

  // serve api
  if (g.app['api']) {
    const api = (await g.app['api']).default
    if (api) {
      await serveApi({ app, router, mode, config, api })
    }
  }

  // serve db
  if (workerId) {
    serveDb({ workerId, router, app, config, mode })
  } else {
    await serveDbPkg({ app, router, config, mode })
  }

  // serve static file
  let clientIdx = 1
  for (let [name, client] of Object.entries(config.client)) {
    await createClient(
      app,
      router,
      name,
      client,
      config,
      mode,
      parseInt(url.port || '3200') + clientIdx
    )
  }

  app.use(router)

  web.app = app
  web.server = createServer(web.app)
  if (mode === 'pkg') {
    console.log(`Server started at http://localhost:${url.port}`)
  }

  if (!workerId) {
    web.server.on('close', serverDb.stopDBFork)
    web.server.on('error', serverDb.stopDBFork)
  }

  web.server.listen(url.port || 3200)
}
