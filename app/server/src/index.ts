import { AppServer } from 'server-web/src/types'

export default {
  ext: {
    Password: require('./utils/bcrypt'),
  },
  query: import('./query'),
  api: import('./api'),
  events: {
    root: {
      init: async (root) => {},
    },
    worker: {
      init: async (app) => {},
    },
  },
} as AppServer
