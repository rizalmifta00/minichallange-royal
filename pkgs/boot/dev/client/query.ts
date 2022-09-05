import { readAsync, writeAsync } from 'fs-jetpack'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { format } from 'prettier'
import { dev, walkDir } from './util'

let timeout = null as any
export const reloadQuery = function (
  this: { cwd: string },
  event: string,
  path: string
) {
  if (event !== 'change') {
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
      await generateQueryIndex(this.cwd)
    }, 200)
  }
}

const generateQueryIndex = async (cwd: string) => {
  const queryPath = join(cwd, 'app', 'server', 'src', 'query')
  const queryOut = join(cwd, 'app', 'server', 'src', 'query.ts')
  const newQuery: Record<
    string,
    Record<string, { import: string; name: string }>
  > = {}
  const list = await walkDir(join(cwd, 'app', 'server', 'src', 'query'))

  for (let i of list) {
    const name = i
      .substring(0, i.length - 3)
      .substring(queryPath.length + 1)
      .replace(/[\W_]/g, '_')

    const [dbName, ...queryNameArray] = name.split('_')
    const queryName = queryNameArray.join('_')

    const querySrc = await readAsync(i)
    if ((querySrc && !querySrc.trim()) || !querySrc) {
      await writeAsync(
        i,
        `\
import { raw } from 'dbs/db'
export default async (params: any) => {
  return await db.$queryRaw(raw(\`SELECT NOW ()\`))
}`
      )
    }
    if (!newQuery[dbName]) {
      newQuery[dbName] = {}
    }
    newQuery[dbName][queryName] = {
      import: `./query${i
        .substring(queryPath.length, i.length - 3)
        .replace(/\\\\/gi, '/')}`,
      name,
    }
  }
  const output = `
  ${Object.entries(newQuery)
    .map((arg) => {
      const [dbName, values] = arg

      return Object.values(values)
        .map((value) => {
          return `import ${value.name} from '${value.import}'`
        })
        .join('\n')
    })
    .join('\n')}
  
  export default {
    ${Object.entries(newQuery)
      .map((arg) => {
        const [dbName, values] = arg

        return `${dbName}: {\
          ${Object.entries(values)
            .map(([key, value]) => {
              return `'${key}':${value.name},`
            })
            .join('\n')}
        }`
      })
      .join('\n')}
      }`
  const formatted = format(output, { parser: 'babel' })
  await writeFile(queryOut, formatted)
}
