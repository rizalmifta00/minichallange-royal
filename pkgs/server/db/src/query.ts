import { Worker } from 'cluster'
import { generateQueueID } from './util'
import { IDBMsg } from '../../web/src/routes/serve-db'
import { define } from './fork'

// @ts-ignore
import type APIQuery from '../../../../app/server/src/query'
import { IDBQueueResult } from '../types/global'
import consola from 'consola'

/**
 * fork
 *   forkQuery()
 *   - parent
 *      parentQuery()
 *      - cluster
 *          clusterQuery()
 */

export const clusterQuery = async (
  body: IDBMsg,
  workerId: string
): Promise<IDBQueueResult> => {
  return new Promise((resolve, reject) => {
    define('dbQueue', {})

    const cid = generateQueueID(dbQueue, `wk-${workerId}`)
    dbQueue[cid] = { resolve, reject }

    process.send({
      action: 'db.query',
      db: { query: body, id: cid },
    })
  })
}


export const forkQuery = (
  body: IDBMsg,
  prefix?: string
): Promise<IDBQueueResult> => {
  const g = global as any & { apiQuery: typeof APIQuery }

  return new Promise<IDBQueueResult>(async (resolve, reject) => {
    const name = body.db

    if (forks[name]) {
      if (body.action === 'query' && !body.table.startsWith('$')) {
        if (g.app && g.app.query) {
          const q = (await g.app.query).default
          if (q[body.db] && q[body.db][body.table]) {
            try {
              const result = await q[body.db][body.table](...body.params)
              resolve(result)
            } catch (e) {
              if (typeof e === 'string') {
                console.error(
                  `[  dbs  ] QUERY ERROR ➜ ${name}.query.${
                    body.table
                  } \n           ➥  ${e.split('\n').join('\n            ')}`
                )
              } else {
                consola.error(e)
              }
              reject(e)
            }
            return
          }
        }
        resolve(null)
        return
      }

      const id = generateQueueID(dbQueue, prefix || 'fork')
      dbQueue[id] = { resolve, reject }
      forks[name].send({ ...body, id })
    } else {
      console.log('[  dbs  ] Error: database is not forked.')
      resolve(undefined)
    }
  })
}
