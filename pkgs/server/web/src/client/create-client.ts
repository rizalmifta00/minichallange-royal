import { BaseClient, ParsedConfig } from 'boot/dev/config-parse'
import express from 'express'
import { setupDevProxy } from './dev-proxy'
import { setupProdStatic } from './prod-static'

export const createClient = async (
  app: ReturnType<typeof express>,
  router: ReturnType<typeof express.Router>,
  name: string,
  client: BaseClient,
  config: ParsedConfig,
  mode: 'dev' | 'prod' | 'pkg',
  port: number
) => {
  const url = client.url

  if (url.startsWith(config.server.url)) {
    if (mode === 'dev') {
      setupDevProxy(app, router, config, url, port, name)
    } else {
      setupProdStatic(app, router, config, url, name, mode as any)
    }
  }
  // clients[name] = client
}
