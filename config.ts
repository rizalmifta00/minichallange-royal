import type { BaseConfig } from './pkgs/boot/dev/config-parse'
import 'dotenv/config'

export default {
  app: {
    name: 'app',
    version: '0.0.1',
  },
  prod: {
    server: {
      url: 'https://localhost:3200',
      worker: Number.MAX_VALUE,
    },
    client: {
      web: {
        url: '[server.url]',
      },
    },
    dbs: {
      // db: {
      //   url: process.env.PROD_DB,
      // },
    },
  },
  dev: {
    server: {
      url: 'http://localhost:3200',
      worker: 1,
    },
    client: {
      web: {
        url: '[server.url]/',
      },
    },
    dbs: {
      // db: {
      //   url: process.env.DEV_DB,
      // },
    },
  },
} as BaseConfig
