import { parse } from '@babel/core'
import pluginJsx from '@babel/plugin-syntax-jsx'
import pluginTs from '@babel/plugin-syntax-typescript'
import traverse from '@babel/traverse'
import { readFile, writeFile } from 'fs/promises'
import { basename, join } from 'path'
import { prettyError } from 'server-utility'
import { IClientWatchers } from '../build-client'
import { clientDir, walkDir } from './util'

export const pageOutput = {
  list: {} as any,
}
let reloadPageTimer = 0 as any
export async function reloadPage(
  this: {
    watchers: IClientWatchers
    singleRun: boolean
  },
  event: string,
  path: string
) {
  if (event === 'addDir') return
  if (event === 'add' && !(await readFile(path, 'utf-8'))) {
    await writeFile(
      path,
      `\
import { page } from 'web-init'

export default page({
  url: '/${basename(path).substring(0, basename(path).length - 4)}',
  component: ({}) => {
    return <div>Halo</div>
  }
})`
    )
  }

  if (event !== 'unlink' && event !== 'unlinkDir' && event !== 'add') {
    await generatePageSingle(path)
    return
  }

  clearTimeout(reloadPageTimer)
  reloadPageTimer = setTimeout(async () => {
    await generatePageAll()
  }, 500)

  if (this.singleRun) {
    clearTimeout(this.watchers.singleRun.page)
    this.watchers.singleRun.page = setTimeout(() => {
      if (this.watchers.page) {
        this.watchers.page.close()
      }
    }, 2000)
  }
}
const generatePageAll = async () => {
  const list = await walkDir(clientDir.page)
  pageOutput.list = {}

  for (let path of list) {
    try {
      let pathNoExt = path.endsWith('.tsx')
        ? path.substring(0, path.length - 4)
        : path

      const name = pathNoExt
        .substring(clientDir.page.length + 1)
        .replace(/[\/\\]/gi, '.')

      const source = await readFile(path, 'utf-8')
      const parsed = parse(source, {
        sourceType: 'module',
        plugins: [pluginJsx, [pluginTs, { isTSX: true }]],
      })

      let layout = 'default'
      let url = ''
      traverse(parsed, {
        CallExpression: (p) => {
          if (url) return

          const c = p.node
          if (c.callee.type === 'Identifier' && c.callee.name === 'page') {
            const arg = c.arguments[0]

            if (arg && arg.type === 'ObjectExpression') {
              for (let prop of arg.properties) {
                if (
                  prop.type === 'ObjectProperty' &&
                  prop.key.type === 'Identifier' &&
                  prop.value.type === 'StringLiteral'
                ) {
                  if (prop.key.name === 'url') {
                    url = prop.value.value
                  } else if (prop.key.name === 'layout') {
                    layout = prop.value.value
                  }
                }
              }
              // const prop = arg.properties[0]
            }
          }
        },
      })
      pageOutput.list[name] = `["${url}", "${layout}", () => import('..${path
        .substring(clientDir.root.length, path.length - 4)
        .replace(/\\/gi, '/')}.tsx?t=${new Date().getTime()}')]`
    } catch (e) {}
  }

  const output = `export default {
  ${Object.entries(pageOutput.list)
    .map((arg: any) => {
      const [key, value] = arg
      return `'${key}':${value},`
    })
    .join('\n  ')}
}`
  await writeFile(clientDir.pageOut, output)
}

const generatePageSingle = async (path: string) => {
  try {
    const source = await readFile(path, 'utf-8')
    const page = {
      layout: '',
      url: '',
    }

    const parsed = parse(source, {
      sourceType: 'module',
      plugins: [pluginJsx, [pluginTs, { isTSX: true }]],
    })

    traverse(parsed, {
      CallExpression: (p) => {
        if (page.url) return

        const c = p.node
        if (c.callee.type === 'Identifier' && c.callee.name === 'page') {
          const arg = c.arguments[0]

          if (arg && arg.type === 'ObjectExpression') {
            for (let prop of arg.properties) {
              if (
                prop.type === 'ObjectProperty' &&
                prop.key.type === 'Identifier' &&
                prop.value.type === 'StringLiteral'
              ) {
                if (prop.key.name === 'url') {
                  page.url = prop.value.value
                } else if (prop.key.name === 'layout') {
                  page.layout = prop.value.value
                }
              }
            }
          }
        }
      },
    })

    let pathNoExt = path.endsWith('.tsx')
      ? path.substring(0, path.length - 4)
      : path

    const name = pathNoExt
      .substring(clientDir.page.length + 1)
      .replace(/[\/\\]/gi, '.')

    const layout = page.layout || 'default'
    const expected = `["${page.url}", "${layout}", () => import('..${path
      .substring(clientDir.root.length, path.length - 4)
      .replace(/\\/gi, '/')}')]`

    if (expected !== pageOutput.list[name]) {
      pageOutput.list[name] = expected

      const output = `export default {
  ${Object.entries(pageOutput.list)
    .map((arg: any) => {
      const [key, value] = arg
      return `'${key}':${value},`
    })
    .join('\n  ')}
}`

      await writeFile(clientDir.pageOut, output)
    }
  } catch (e: any) {
    var pe = prettyError()
    console.log(
      `Error while saving \n${path.substring(
        clientDir.root.length + 1
      )}:\n\n${pe(e)} `
    )
  }
}
