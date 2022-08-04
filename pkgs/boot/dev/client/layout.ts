import { basename } from 'path'
import { clientDir, walkDir } from './util'
import { format } from 'prettier'
import { writeFile } from 'fs/promises'
import { IClientWatchers } from '../build-client'

export async function reloadLayout(this: {
  watchers: IClientWatchers
  singleRun: boolean
}) {
  const newLayouts: any = {}
  const list = await walkDir(clientDir.layout)

  for (let i of list) {
    const name = basename(i.endsWith('.tsx') ? i.substring(0, i.length - 4) : i)
    newLayouts[name] = `() => import('..${i
      .substring(clientDir.root.length, i.length - 4)
      .replace(/\\/gi, '/')}')`
  }
  const output = `export default {
    ${Object.entries(newLayouts)
      .map((arg: any) => {
        const [key, value] = arg
        return `'${key}':${value},`
      })
      .join('\n')}
      }`
  const formatted = format(output, { parser: 'babel' })
  await writeFile(clientDir.layoutOut, formatted)

  if (this.singleRun) {
    clearTimeout(this.watchers.singleRun.layout)
    this.watchers.singleRun.layout = setTimeout(() => {
      if (this.watchers.layout) {
        this.watchers.layout.close()
      }
    }, 2000)
  }
}
