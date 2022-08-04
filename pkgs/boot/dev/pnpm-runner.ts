import { spawn } from 'cross-spawn'
import pad from 'lodash.pad'
import { log, silentUpdate } from 'server-utility'
import { rawLogUpdate } from 'server-utility'
import { Transform } from 'stream'

export const pnpm = async (
  args: string[],
  opt: { cwd: string; name: string; stdout?: boolean }
) => {
  return new Promise<void>((resolve) => {
    if (opt.stdout !== false) silentUpdate(true)
    const cwd = process.cwd()
    const res = spawn(
      /^win/.test(process.platform) ? 'pnpm.cmd' : 'pnpm',
      args,
      {
        cwd: opt.cwd,
        shell: true,
      }
    )
    const timeouts = [] as any[]

    if (opt.stdout !== false) {
      res.stdout.pipe(
        new Transform({
          transform: (chunk, encoding, done) => {
            const lines = chunk.toString().split('\n')
            for (let line of lines) {
              if (line.trim()) {
                timeouts.push(
                  setTimeout(() => {
                    rawLogUpdate(` ➥ ${line}`)
                    timeouts.shift()
                  }, timeouts.length * 10)
                )
              }
            }
            done(null, chunk)
          },
        })
      )
      res.stderr.pipe(process.stdout)
    }
    process.chdir(cwd)
    log(`[${pad(opt.name, 7)}] pnpm ${args.join(' ')}`)
    res.on('error', (e) => {
      log(`[ERROR] ${e}`)
    })

    res.on('exit', () => {
      silentUpdate(false)
      rawLogUpdate.clear()
      for (let i of timeouts) {
        clearTimeout(i)
      }
      resolve()
    })
  })
}
