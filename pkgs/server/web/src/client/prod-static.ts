import { ParsedConfig } from 'boot/dev/config-parse'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import express from 'express'
import trim from 'lodash.trim'
import mime from 'mime-types'
import { join } from 'path'

export const setupProdStatic = async (
  app: ReturnType<typeof express>,
  router: ReturnType<typeof express.Router>,
  config: ParsedConfig,
  url: string,
  name: string,
  mode: 'prod' | 'pkg'
) => {
  let root = join(process.cwd(), 'client', name)

  if (mode === 'pkg') {
    root = join(__dirname, 'client', name)
  }

  const route = url.substring(config.server.url.length)

  router.use(`${trim(route, '/')}/**`, async (req, res, next) => {
    let path = join(root, req.originalUrl || '')

    if (!path.startsWith(root)) {
      path = join(root, 'index.html')
    } else {
      try {
        const st = await stat(path)
        if (st.isDirectory()) {
          path = join(root, 'index.html')
        }
      } catch (e) {
        path = join(root, 'index.html')
        res.statusCode = 404
      }
    }

    const type = mime.lookup(path)

    if (type) res.setHeader('content-type', type)
    createReadStream(path).pipe(res)
  })
}
