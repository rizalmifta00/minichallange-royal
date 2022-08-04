import { spawn } from 'cross-spawn'
import { join } from 'path'

export const runProd = async (port?: number) => {
  let argport: string[] = []
  if (port) {
    argport.push('--port')
    argport.push(port.toString())
  }
  const res = spawn(
    process.execPath,
    [join(process.cwd(), '.output', 'server.js'), ...argport],
    {
      cwd: join(process.cwd(), '.output'),
      shell: true,
    }
  )
  res.stdout.pipe(process.stdout)
  res.stderr.pipe(process.stderr)
}
