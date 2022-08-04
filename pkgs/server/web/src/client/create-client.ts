import { BaseClient, ParsedConfig } from 'boot/dev/config-parse'
import type { createApp, createRouter } from 'h3'
import { setupDevProxy } from './dev-proxy'
import { setupProdStatic } from './prod-static'

export const createClient = async (
  app: ReturnType<typeof createApp>,
  router: ReturnType<typeof createRouter>,
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
