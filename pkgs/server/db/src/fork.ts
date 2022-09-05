import { ParsedConfig } from 'boot/dev/config-parse'
export const define = (name: string, value: any) => {
  const g = global as any
  if (!g[name]) {
    g[name] = value
  }
}

export const startDBFork = async (
  config: ParsedConfig,
  mode: 'dev' | 'prod' | 'pkg'
) => {
  const { fork } = await import('child_process')
  const { dirname, join } = await import('path')

  const cwd = join(dirname(__filename), '..')

  define('dbQueue', {})
  define('forks', {})
  define('config', config)

  const forkDb = [] as Promise<void>[]
  for (let name of Object.keys(config.dbs)) {
    forkDb.push(
      new Promise(async (resolveFork) => {
        const setupFork = () => {
          forks[name] = fork(join(cwd, 'pkgs', 'dbs', name, 'db.js')) as any
          forks[name].once('spawn', () => {
            forks[name].ready = true
          })
          forks[name].on(
            'message',
            (data: {
              id: string
              value: any
              event?: 'ready' | 'error' | 'killed'
              reason?: string | { meta: { message: string } }
              failedQuery?: any
            }) => {
              if (data.event === 'ready') {
                console.log(`[  dbs  ] Database ${name} is connected.`)
                resolveFork()
              } else {
                if (data.event === 'killed') {
                  console.log(
                    `[  dbs  ] ${(typeof data.reason === 'string'
                      ? data.reason
                      : '' || ''
                    ).trim()}`
                  )
                  return
                }
                if (data.id) {
                  const dqres = dbQueue[data.id]
                  if (dqres) {
                    const { resolve, reject } = dqres
                    delete dbQueue[data.id]

                    if (data.event === 'error') {
                      if (typeof data.reason === 'object' && data.reason.meta) {
                        reject(data.reason.meta.message)
                      } else {
                        reject(data.reason as string)
                      }
                    } else {
                      resolve(data.value)
                    }
                  }
                }
              }
            }
          )
          forks[name].stdout?.pipe(process.stdout)
          forks[name].stderr?.pipe(process.stderr)

          const restartDB = (e) => {
            setTimeout(() => {
              console.log(
                `[  dbs  ] Database worker is killed, restarting in 5s`,
                e
              )
              forks[name].ready = false
              setupFork()
            }, 5000)
          }
          // forks[name].once('close', restartDB)
          forks[name].once('disconnect', restartDB)
          // forks[name].once('exit', restartDB)
          forks[name].once('error', restartDB)
        }
        setupFork()
      })
    )
  }
  await Promise.all(forkDb)
}
export const stopDBFork = async () => {
  for (let f of Object.values(forks)) {
    if (!f.killed) {
      f.kill()
    }
  }
}
