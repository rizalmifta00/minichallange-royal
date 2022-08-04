export * from './client'
export * from './fork'
export * from './query'
import type import_dbs from 'dbs'
export type dbs = typeof import_dbs

/**
 
                    cluster ───► parent  ──────► fork
            clusterQuery()      parentQuery()    forkQuery()
 dbClient('proxy-cluster')                       dbClient('fork')
            ▲
            │  h3 router
            │
 dbClient('fetch')

 */