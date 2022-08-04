import { readAsync, writeAsync } from 'fs-jetpack'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { format } from 'prettier'
import { dev, walkDir } from './util'

let timeout = null as any
export const reloadAPI = function (
  this: { cwd: string },
  event: string,
  path: string
) {
  if (event !== 'change') {
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
      await generateApiIndex(this.cwd)
    }, 200)
  }
}

const generateApiIndex = async (cwd: string) => {
  const apiPath = join(cwd, 'app', 'server', 'src', 'api')
  const apiOut = join(cwd, 'app', 'server', 'src', 'api.ts')
  const newApi: Record<string, { import: string; name: string }> = {}
  const list = await walkDir(join(cwd, 'app', 'server', 'src', 'api'))

  for (let i of list) {
    const name = i
      .substring(0, i.length - 3)
      .substring(apiPath.length + 1)
      .replace(/[\W_]/g, '_')

    const apiSrc = await readAsync(i)
    if ((apiSrc && !apiSrc.trim()) || !apiSrc) {
      await writeAsync(
        i,
        `\
import { API } from 'server-web'

export default [
  '/${name}',
  async ({ body, reply }) => {
    reply.send("${name} works!")
  },
] as API
      `
      )
    }
    newApi[name] = {
      import: `./api${i
        .substring(apiPath.length, i.length - 3)
        .replace(/\\\\/gi, '/')}`,
      name,
    }
  }
  const output = `
  ${Object.entries(newApi)
    .map((arg: any) => {
      const [_, value] = arg
      return `import ${value.name} from '${value.import}'`
    })
    .join('\n')}
  
  export default {
    ${Object.entries(newApi)
      .map((arg: any) => {
        const [key, value] = arg
        return `'${key}':${value.name},`
      })
      .join('\n')}
      }`
  const formatted = format(output, { parser: 'babel' })
  await writeFile(apiOut, formatted)
}
