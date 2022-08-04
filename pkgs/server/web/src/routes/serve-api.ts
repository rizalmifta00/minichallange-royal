import { ParsedConfig } from 'boot/dev/config-parse'
import { createApp, createRouter, useBody } from 'h3'
import { API, g } from '..'

export type IServeApiArgs = {
  app: ReturnType<typeof createApp>
  router: ReturnType<typeof createRouter>
  mode: 'dev' | 'prod' | 'pkg'
  config: ParsedConfig
  api: Record<string, API>
}

let cachedApiArgs = {} as IServeApiArgs
export const serveApi = async (arg?: Partial<IServeApiArgs>) => {
  if (arg) {
    for (let [k, value] of Object.entries(arg)) {
      ;(cachedApiArgs as any)[k] = value
    }
  }
  let { api, app, mode, config, router } = cachedApiArgs

  for (let [_, v] of Object.entries(api)) {
    const [url, handler] = v

    router.use(url, async (req, reply, next) => {
      const _reply = reply as any

      let body = undefined

      if (req.method === 'POST') {
        body = await useBody(req)
      }

      _reply.send = (msg: any) => {
        if (typeof msg === 'object') {
          reply.setHeader('content-type', 'application/json')
          reply.write(JSON.stringify(msg))
        } else {
          reply.write(msg)
        }
        reply.end()
      }

      await handler({
        body,
        req,
        reply: _reply,
        ext: {},
        mode,
        baseurl: config.server.url,
        session: {},
      })
    })
  }
}
