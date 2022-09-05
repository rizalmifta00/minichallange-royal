import { ParsedConfig } from 'boot/dev/config-parse'
import type { dbs } from 'server-db'
import { IClusterParent, IServerInit } from '.'
import type { build } from 'boot'
import { Request, Response } from 'express'

// @ts-ignore
import type APIQuery from '../../../../app/server/src/query'
import express from 'express'

export type AppServer = {
  ext: Record<string, any>
  events: {
    build?: (props: {
      mode: 'dev' | 'prod' | 'pkg'
      build: typeof build
    }) => Promise<void>
    root?: {
      init: (root: IClusterParent, config: IServerInit) => Promise<void>
      kill?: (root: IClusterParent, config: IServerInit) => Promise<void>
    }
    worker?: {
      init: (
        app: ReturnType<typeof express>,
        router: ReturnType<typeof express.Router>,
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
  req: Request
  reply: Response
  ext: any
  mode: 'dev' | 'prod' | 'pkg'
  baseurl: string
}

export type API = [string, (args: APIProps) => void | Promise<void>]

export type DBAuth = (args: {
  db: string
  table: string
  action: string
  params: string
}) => Promise<boolean> | boolean

export type AuthLogin = (args: {
  req: Request
  reply: Response
  ext: typeof g.app.ext
}) => { [key: string]: any }

export type AuthLogout = (args: {
  req: Request
  reply: Response
  ext: typeof g.app.ext
}) => Promise<void>
