import { exec } from 'child_process'
import { exists } from 'fs-jetpack'
import padEnd from 'lodash.padend'
import { join } from 'path'
import { log, logUpdate } from 'server-utility'
import { formatTs, IApp } from '.'
import { ParsedConfig } from '../dev/config-parse'

export const startDevClient = async (
  config: ParsedConfig,
  app: IApp,
  cwd: string
) => {
  let idx = 1

  const clientNames = [] as string[]
  for (let [name, client] of Object.entries(config.client)) {
    const port = parseInt(new URL(config.server.url).port) + idx
    const path = join(process.cwd(), 'app', name)
    const vitecli = join(path, 'node_modules', '.bin', 'vite')
    if (!exists(vitecli)) {
      log(`[WARNING] ${vitecli} not found.`)
      log(`          Cannot run development server for app/${name}`)
      continue
    }

    const ts = new Date().getTime()
    app.client[name] = exec(`${vitecli} --port=${port}`, { cwd: path })
    app.client[name].stderr?.pipe(process.stderr)
    app.client[name].stdout?.on('data', (e) => {
      e.split('\n').forEach((str: string) => {
        if (str.indexOf('Local: ') >= 0) {
          const devHost = str.split('Local: ').pop()?.trim()
          const host = client.url.replace(`[server.url]`, config.server.url)
          logUpdate.done()
          log(
            `[${formatTs(ts)}] 🍋 ${padEnd(
              `Front End [app/${name}] at`,
              24
            )} ➜ ${devHost}`
          )
          if (host.startsWith(config.server.url)) {
            log(`           ➥  proxied to ${host}`)
          }
        }
      })
    })
    clientNames.push(name)
  }
}
