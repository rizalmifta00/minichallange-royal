import { ParsedConfig } from 'boot/dev/config-parse'
import { createApp, createRouter } from 'h3'
import type { IncomingMessage, ServerResponse } from 'http'
import type { dbs } from 'server-db'
import { IClusterParent, IServerInit } from '.'
import type { build } from 'boot'

// @ts-ignore
import type APIQuery from '../../../../app/server/src/query'
import { getAppServer } from './app-server'

export type AppServer = {
  ext: Record<string, any>
  events: {
    build?: (props: {
      mode: 'dev' | 'prod' | 'pkg'
      build: typeof build
    }) => Promise<void>
    root?: {
      init: (root: IClusterParent, config: IServerInit) => Promise<void>
    }
    worker?: {
      init: (
        app: ReturnType<typeof createApp>,
        router: ReturnType<typeof createRouter>,
        config: ParsedConfig
      ) => Promise<void>
    }
  }
  api?: Promise<{ default: Record<string, API> }>
  query?: Promise<{ default: typeof APIQuery }>
  externals?: string[]
}
export const g = global as typeof global & {
  app: AppServer
  dbs: dbs
  db: dbs['db']
}

export type APIProps = {
  body: any
  req: IncomingMessage
  reply: ServerResponse & { send: (body: any) => void }
  ext: any
  mode: 'dev' | 'prod' | 'pkg'
  baseurl: string
  session: any
}

export type API = [string, (args: APIProps) => void | Promise<void>]
