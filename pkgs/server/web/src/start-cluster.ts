import cluster from 'cluster'
import os from 'os'
import { IClusterParent, IServerInit } from '..'
import * as serverDb from 'server-db'
const MAX_CLUSTER_PROCESS = os.cpus().length

export const startCluster = (parent: IClusterParent) => {
  return new Promise<void>((started) => {
    const clusterSize = Math.min(
      MAX_CLUSTER_PROCESS,
      parent.config.server.worker
    )
    parent.clusterSize = clusterSize

    for (let i = 0; i < clusterSize; i++) {
      cluster.fork({ id: i + 1 })
    }

    cluster.on('online', (wk) => {
      parent.child[wk.id] = wk
      wk.send({
        config: parent.config,
        mode: parent.mode,
        action: 'init',
        parentStatus: parent.status,
      })

      if (Object.keys(parent.child).length >= clusterSize) {
        started()
      }
    })

    cluster.on('message', async (wk, msg: IServerInit, socket) => {
      if (
        msg &&
        msg.action === 'db.query' &&
        msg.db &&
        msg.db.query &&
        msg.db.id
      ) {
        await serverDb.parentQuery(msg.db.query, wk, msg.db.id)
      }
    })

    cluster.on('exit', (wk, code, singal) => {
      if (parent.status !== 'stopping') {
        cluster.fork({
          id: Object.keys(parent.child).indexOf(wk.id.toString()) + 1,
        })
      }
      delete parent.child[wk.id]
    })
  })
}
