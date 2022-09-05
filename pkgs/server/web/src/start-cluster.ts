import cluster, { Cluster } from 'cluster'
import os from 'os'
import { IClusterParent, IServerInit } from '..'
import * as serverDb from 'server-db'
import { forkQuery } from 'server-db'
import { log, waitUntil } from 'server-utility'
import pad from 'lodash.pad'
import throttle from 'lodash.throttle'
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
        try {
          if (wk.isConnected() && !wk.isDead()) {
            const result = await forkQuery(msg.db.query, msg.db.id)
            wk.send({ action: 'db.result', db: { id: msg.db.id, result } })
          } else {
            console.log(
              '[  dbs  ] Sending Query result failed, parent worker is killed',
              msg.db.query
            )
          }
        } catch (e) {
          throw e
        }
      }
    })

    const restartCluster = throttle(
      async (wk: typeof cluster.worker, code: any, singal: any) => {
        if (wk) {
          log(
            `[${pad(`wrk-${wk.id}`, 7)}]  🍃 Back End Worker #${
              wk.id
            } killed, restarting... (pid:${process.pid})`
          )
          if (parent.status !== 'stopping') {
            await waitUntil(() => wk.isDead())
            cluster.fork({
              id: Object.keys(parent.child).indexOf(wk.id.toString()) + 1,
            })
          }
          delete parent.child[wk.id]
        } else {
          console.log('[  wrk  ] Worker is killed')
        }
      },
      400
    )
    // sementara dimatikan dulu karena bikin ngebug
    cluster.on('exit', restartCluster)
    cluster.on('disconnect', restartCluster)
  })
}
