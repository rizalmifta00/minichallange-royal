import { IClientSend } from './client'
import { forkQuery, clusterQuery } from './query'

export const fetchSend: IClientSend = async (params) => {
  const w = window as any
  let url = `${w.serverurl}/__data/${toSnake(params.action)}`

  if (params.table) {
    url += `...${params.table}`
  }

  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  }

  const fetching = await fetch(url, options)
  return await fetching.json()
}
export const forkSend: IClientSend = async (msg) => {
  return await forkQuery(msg)
}
export const proxyClusterSend: IClientSend = async (msg, { workerId }) => {
  return await clusterQuery(msg, workerId)
}

const toSnake = (str: string) =>
  str[0].toLowerCase() +
  str
    .slice(1, str.length)
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
