import { dirname, join } from 'path'
import config from '../../../config'

export type BaseClient = { url: string }
export type BaseConfig = {
  app: {
    name: string
    version?: string
  }
  prod: {
    server: {
      url: string
      worker: number
    }
    client: Record<string, BaseClient>
    dbs: Record<string, { url: string }>
  }
  dev: {
    server: {
      url: string
      worker: number
    }
    useProdDB?: boolean
    client: Record<string, BaseClient>
    dbs: Record<string, { url: string }>
  }
}

export type ParsedConfig = BaseConfig['prod'] & { app: BaseConfig['app'] }
export const readConfig = async (
  mode: 'dev' | 'prod' | 'pkg',
  port?:number
): Promise<ParsedConfig> => {
  return parseConfig(config, mode, port)
}

export const parseConfig = (
  config: any,
  mode: 'dev' | 'prod' | 'pkg',
  port?: number
): ParsedConfig => {
  const result = {
    app: config.app,
  } as any

  let configMode = mode
  if (mode === 'pkg') {
    configMode = 'prod'
  }
  for (let [k, v] of Object.entries(config[configMode])) {
    ;(result as any)[k] = v
  }

  if (result.useProdDB) {
    delete result.useProdDB
    result.dbs = config.prod.dbs
  }

  if (port) {
    const url = new URL(result.server.url)
    url.port = port.toString()
    result.server.url = url.toString()
  }

  return result
}
