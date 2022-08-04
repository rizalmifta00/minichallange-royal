import { join, sep } from 'path'
import { AppServer } from './types'

const g = global as any

export const getAppServer = async (mode: 'dev' | 'prod' | 'pkg') => {
  if (!g.app || mode === 'dev') {
    g.app = {}
    if (__dirname.split(sep).join('/').endsWith('.output/pkgs')) {
      const dpath = join(__dirname, 'server.app.js');
      if (mode === 'dev') {
        delete require.cache[dpath]
      }
      const app = require(dpath).default
      if (app) {
        g.app = app
      }
    }
    if (__dirname.startsWith(`/snapshot/.output`) || __dirname.startsWith(join('C:','snapshot','.output'))) {
      const app = require(join(__dirname, 'pkgs', 'server.app.js')).default
      if (app) {
        g.app = app
      }
    }
  }

  return g.app as AppServer
}
