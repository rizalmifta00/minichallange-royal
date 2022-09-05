import { build } from 'esbuild'
import alias from 'esbuild-plugin-alias'
import { exists, readAsync, removeAsync, writeAsync } from 'fs-jetpack'
import get from 'lodash.get'
import pad from 'lodash.pad'
import padEnd from 'lodash.padend'
import { join } from 'path'
import { error, Forker, logUpdate } from 'server-utility'
import config from '../../../config'
import { buildClient } from './build-client'
import { buildDb } from './build-db'
import { buildDbs } from './build-dbs'
import { prepareAppServer } from './build-server'
import { buildWatch } from './build-watch'
import { dev } from './client/util'
import { parseConfig, ParsedConfig } from './config-parse'
import { checkLatestVersion, watchPkgsAndGenerateVersion } from './version'

const cwd = process.cwd()
const formatTs = (ts: number) => {
  return pad(`${((new Date().getTime() - ts) / 1000).toFixed(2)}s`, 7)
}

let debugLogTimer = null as any
const startLog = (text: string) => {
  let ts = new Date().getTime()
  debugLogTimer = setInterval(() => {
    logUpdate(`[${formatTs(ts)}] ${padEnd(text, 30)} `)
  }, 100)
}

const endLog = () => {
  clearTimeout(debugLogTimer)
  logUpdate.done()
}

export const runDev = (
  watch: boolean,
  mode: 'dev' | 'prod' | 'pkg',
  opt?: { isPkg?: true; isDebug?: true; port?: number }
) => {
  return new Promise<void>(async (resolve) => {
    let ts = new Date().getTime()
    const isDebug = get(opt, 'isDebug', false)

    const version = await watchPkgsAndGenerateVersion()

    checkLatestVersion().then((e) => {
      if (e) console.log(e)
    })

    const ival = setInterval(() => {
      if (!isDebug)
        logUpdate(
          `[${formatTs(ts)}] ${padEnd(`Booting Royal 👑 ${version}`, 30)} `
        )
    }, 100)

    if (isDebug) {
      console.log(
        `[${formatTs(ts)}] ${padEnd(`Booting Royal 👑 ${version}`, 30)} `
      )
    }

    if (!exists(join(cwd, 'pkgs'))) {
      error(
        'Directory pkgs not found. Please run `node base` from root directory.'
      )
      return
    }

    await removeAsync(join(cwd, '.output', 'server.js'))

    const rebuildDB = async (config: ParsedConfig) => {
      for (let [k, v] of Object.entries(config.dbs)) {
        await buildDb({ name: k, url: v.url, cwd, watch })
      }
      if (Object.keys(config.dbs).length > 0) {
        await buildDbs(cwd, config, watch)
      }
    }

    const rebuildClient = async (config: ParsedConfig) => {
      for (let [k, v] of Object.entries(config.client)) {
        await buildClient({ cwd, name: k, config: v, watch })
      }
    }

    if (isDebug) startLog(`Building DB`)
    const cfg = parseConfig(
      config,
      opt && opt.isPkg ? 'prod' : 'dev',
      opt?.port
    )

    await rebuildDB(cfg)
    if (isDebug) endLog()

    // build app/*
    if (isDebug) startLog(`Building App Client`)
    await rebuildClient(cfg)
    if (isDebug) endLog()

    if (isDebug) startLog(`Building App Server`)
    await prepareAppServer({ cwd, config: cfg, watch })
    let appServReqNpm = []
    const importAppServer = await import(join('../../../app/server/src/index'))
    if (importAppServer && importAppServer['default']) {
      const appServ = importAppServer['default']
      if (appServ) {
        appServReqNpm = appServ['externals'] || []

        const appServePkgJsonPath = join(cwd, 'app', 'server', 'package.json')
        const appServePkgJson = JSON.parse(
          (await readAsync(appServePkgJsonPath)) || '{}'
        ) as any

        if (Object.keys(appServePkgJson).length === 0) {
          console.log(`Failed to read file: ${appServePkgJsonPath}`)
          return
        }
        const deps = {} as Record<string, string>

        for (let p of appServReqNpm) {
          if (appServePkgJson.dependencies[p]) {
            deps[p] = appServePkgJson.dependencies[p]
          } else if (appServePkgJson.devDependencies[p]) {
            deps[p] = appServePkgJson.devDependencies[p]
          }
        }

        await writeAsync(join(cwd, '.output', 'package.json'), {
          name: config.app.name,
          version: config.app.version || '1.0.0',
          dependencies: deps,
          pkg: {
            assets: ['client/**/*', 'pkgs/**/*'],
          },
        })

        if (appServ['events'] && appServ['events']['build']) {
          await appServ['events']['build']({ mode, build })
        }
      }
    }

    await buildWatch({
      input: join(cwd, 'app', 'server', 'src', 'index.ts'),
      output: join(cwd, '.output', 'pkgs', 'server.app.js'),
      watch,
      buildOptions: {
        minify: true,
        sourcemap: 'linked',
        external: appServReqNpm,
      },
    })
    if (isDebug) endLog()

    if (isDebug) startLog(`Building Pkgs Server`)
    // build server/web
    await buildWatch({
      input: join(cwd, 'pkgs', 'server', 'web', 'src', 'index.ts'),
      output: join(cwd, '.output', 'pkgs', 'server.web.js'),
      watch,
      buildOptions: {
        minify: true,
        sourcemap: 'linked',
      },
    })
    if (isDebug) endLog()

    if (isDebug) startLog(`Building Boot`)

    // build boot
    let firstBoot = false
    await buildWatch({
      input: join(cwd, 'pkgs', 'boot', 'src', 'index.ts'),
      output: join(cwd, '.output', 'server.js'),
      watch,
      buildOptions: {
        minify: true,
        sourcemap: true,
        external: ['chokidar'],
        plugins: [
          alias({
            pidtree: join(cwd, 'pkgs', 'boot', 'src', 'pidtree.js'),
          }),
        ],
      },
      onReady: async () => {
        clearInterval(ival)
        logUpdate.done()

        if (firstBoot && new Date().getTime() - ts > 10 * 1000) {
          console.log(`\
[ royal ] Booting is taking too long.
          Maybe cleaning ignored files will speed up: git clean -fdx`)
        }
        firstBoot = false

        if (isDebug) endLog()

        if (watch) {
          devBoot(opt)
        }
        resolve()
      },
    })
  })
}

const devBoot = async (opt?: {
  isPkg?: true
  isDebug?: true
  port?: number
}) => {
  const argport = [] as string[]
  if (opt?.port) {
    argport.push('--port', opt?.port.toString())
  }
  dev.boot = await Forker.run(join(cwd, '.output', 'server.js'), {
    arg: ['--mode', 'dev', ...process.argv.slice(4), ...argport],
  })
}
