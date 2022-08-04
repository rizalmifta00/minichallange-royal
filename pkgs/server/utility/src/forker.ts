import { ChildProcess, fork } from 'child_process'
import { prettyError } from './logger'

export type RUN_MODE = 'dev' | 'prod'
export type ForkerRunning = {
  onKilled?: () => void | Promise<void>
  child?: ChildProcess
}
export type ForkerMsg = {
  event: 'started' | 'killing' | 'killed'
}

export const Forker = {
  mode: 'dev' as RUN_MODE,
  running: {} as Record<string, ForkerRunning>,
  run: async (
    path: string,
    options?: {
      arg?: string[]
      onStarted?: (state: any) => void | Promise<void>
    }
  ) => {
    const arg = (options && options.arg) || []
    if (!Forker.running[path]) {
      Forker.running[path] = {}
    }
    const run = Forker.running[path]

    if (run.child && run.child.connected) {
      await new Promise<void>((resolve) => {
        if (run.child) {
          run.child.on('exit', resolve)
          run.child.send({ event: 'killing' })
        }
      })
    }
    run.child = fork(path, {
      execArgv: ['--enable-source-maps', path, ...arg],
    })
    run.child.stdout?.pipe(process.stdout)
    run.child.stderr?.pipe(process.stderr)
    run.child.once('spawn', () => {
      if (run.child) run.child.send({ event: 'started' })
    })
    return run.child
  },
  asChild: async (arg: { onKilled: () => void | Promise<void> }) => {
    prettyError()

    if (process.send) {
      process.on('message', async (data: ForkerMsg) => {
        if (data.event === 'killing') {
          await arg.onKilled()
          process.exit(1)
        }
      })
    }
  },
}
