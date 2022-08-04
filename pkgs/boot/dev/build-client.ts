import { watch } from 'chokidar'
import { unzip } from 'fflate'
import { readFileSync } from 'fs'
import { dir, dirAsync, exists, list, readAsync, writeAsync } from 'fs-jetpack'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { reloadLayout } from './client/layout'
import { reloadPage } from './client/page'
import { clientDir } from './client/util'
import { BaseClient } from './config-parse'
import { pnpm } from './pnpm-runner'

export type IClientWatchers = {
  page: null | ReturnType<typeof watch>
  layout: null | ReturnType<typeof watch>
  singleRun: {
    page: any
    layout: any
  }
}

export const buildClient = async (arg: {
  cwd: string
  name: string
  config: BaseClient
  watch: boolean
}) => {
  const { cwd, name } = arg

  const cdir = join(arg.cwd, 'app', name)
  clientDir.root = cdir
  clientDir.page = join(cdir, 'src', 'base', 'page')
  clientDir.pageOut = join(cdir, 'types', 'page.ts')
  clientDir.layout = join(cdir, 'src', 'base', 'layout')
  clientDir.layoutOut = join(cdir, 'types', 'layout.ts')
  clientDir.api = join(cdir, 'src', 'api')
  clientDir.apiOut = join(cdir, 'types', 'api.ts')
  clientDir.auth = join(cdir, 'src', 'auth')
  clientDir.authOut = join(cdir, 'types', 'auth.ts')

  dir(cdir)

  const cdirList = list(cdir)
  if (!cdirList || (cdirList && cdirList.length < 5)) {
    const zipFile = readFileSync(
      join(arg.cwd, 'pkgs', 'boot', 'dev', 'client', 'client.zip')
    )
    await new Promise<void>((res) => {
      unzip(zipFile, {}, async (_: any, content: any) => {
        const promises: any[] = []
        for (let [path, file] of Object.entries(content || []) as any) {
          const cpath = join(cdir, path.substring(7))
          if (file.length === 0) {
            await dirAsync(cpath)
            continue
          }
          promises.push(
            writeFile(cpath, file, {
              mode: 0o777,
            })
          )
        }
        await Promise.all(promises)
        res()
      })
    })
  }

  const psource = await readAsync(join(cdir, 'package.json'), 'utf8')
  if (psource) {
    const pjson = JSON.parse(psource)
    let appName = name
    if (appName === 'server') {
      appName = name + '_'
    }
    if (pjson && pjson['name'] !== `app-${appName}`) {
      pjson['name'] = `app-${appName}`
      await writeAsync(
        join(cdir, 'package.json'),
        JSON.stringify(pjson, null, 2)
      )
    }
  }

  if (!exists(join(cdir, 'types', 'page.ts'))) {
    await writeAsync(join(cdir, 'types', 'page.ts'), `export default {}`)
  }

  if (!exists(join(cdir, 'types', 'layout.ts'))) {
    await writeAsync(join(cdir, 'types', 'layout.ts'), `export default {}`)
  }

  if (!exists(join(cdir, 'node_modules'))) {
    await pnpm(['install'], {
      cwd: cdir,
      name,
      stdout: arg.watch,
    })
  }

  const watchers = {
    page: null as null | ReturnType<typeof watch>,
    layout: null as null | ReturnType<typeof watch>,
    singleRun: { api: null, page: null, layout: null },
  }

  watch(clientDir.page).on(
    'all',
    reloadPage.bind({ singleRun: arg.watch === false, watchers })
  )

  watch(clientDir.layout).on(
    'all',
    reloadLayout.bind({ singleRun: arg.watch === false, watchers })
  )
}
