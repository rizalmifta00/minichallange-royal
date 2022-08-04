import { spawn } from 'cross-spawn'
import { log } from 'server-utility'

export const npm = async (
  args: string[],
  opt: { cwd: string; name: string }
) => {
  return new Promise<void>((resolve) => {
    const cwd = process.cwd()
    const res = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', args, {
      cwd: opt.cwd,
      shell: true,
    })
    process.chdir(cwd)
    log(`[${opt.name}] npm ${args.join(' ')}`)
    res.on('error', (e) => {
      log(`[ERROR] ${e}`)
    })
    res.on('exit', resolve)
  })
}
