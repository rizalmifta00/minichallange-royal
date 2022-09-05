import { ParsedConfig } from 'boot/dev/config-parse'
import express from 'express'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import { createServer } from 'http'
import get from 'lodash.get'
import { g } from '.'
import { getAppServer } from './app-server'
import { createClient } from './client/create-client'
import { serveApi } from './routes/serve-api'
import { serveAuth } from './routes/serve-auth'
import { serveDb } from './routes/serve-db'
import { serveDbPkg } from './routes/serve-db-pkg'
import * as serverDb from 'server-db'
import session from 'express-session'

// A session store using Sequelize.js, which is a Node.js / io.js ORM for PostgreSQL, MySQL, SQLite and MSSQL.
const Sequelize = require('sequelize')
const SequelizeStore = require('connect-session-sequelize')(session.Store)

export const web = {
  app: undefined as undefined | ReturnType<typeof express>,
  server: undefined as undefined | ReturnType<typeof createServer>,
  clients: {} as Record<string, {}>,
  ext: undefined as undefined | (Record<string, any> & { init?: () => void }),
}

export const startWorkerHttp = async (
  config: ParsedConfig,
  mode: 'dev' | 'prod' | 'pkg',
  workerId?: string
) => {
  const app = express()

  // body parser
  app.use(
    bodyParser.json({
      limit: '50mb',
    })
  )
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
    })
  )

  // file upload
  app.use(fileUpload())

  // create database if database connection exist
  let store = undefined
  if (Object.keys(config.dbs).length > 0) {
    const key = !!config.dbs.db ? 'db' : Object.keys(config.dbs)[0]
    const sequelize = new Sequelize(config.dbs[key].url, {
      dialect: 'pgsql',
      logging: false,
    })
    store = new SequelizeStore({
      db: sequelize,
      checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
      expiration: Number(process.env.SESSION_MAXAGE || 60000), // The maximum age (in milliseconds) of a valid session.
    })

    store.sync()
  }

  // Use the session middleware
  app.use(
    session({
      store,
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRETKEY || 'SESSION_SECRETKEY',
      cookie: { maxAge: Number(process.env.SESSION_MAXAGE || 60000) },
    })
  )

  await getAppServer(mode)

  const url = new URL(config.server.url)

  // initiate db
  if (workerId) {
    g.dbs = await serverDb.dbsClient('proxy-cluster', Object.keys(config.dbs), {
      workerId,
    })
  } else {
    // todo: kalau mode=pkg masih ngebug...
    // await serverDb.startDBFork(config)
    // g.dbs = await serverDb.dbsClient('fork', Object.keys(config.dbs))
  }
  if (g.dbs) g.db = g.dbs['db']

  // init worker event
  const onInitWorker = get(g.app, 'events.worker.init')
  const router = express.Router()
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

  // serve auth
  if (workerId) {
    serveAuth({ router, app, config, mode })
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

  try {
    web.server.listen(url.port || 3200)
  } catch (e) {
    console.log(`Failed to start server on port ${url.port || 3200}`, e)
  }
}
