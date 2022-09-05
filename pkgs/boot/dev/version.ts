import { watch } from 'chokidar'
import { readAsync, writeAsync } from 'fs-jetpack'
import https from 'https'
import { join } from 'path'
import fetch from 'node-fetch'

export const generateVersion = () => {
  const date = new Date()

  const d = date.getDate()
  const h = date.getHours()
  const m = date.getMinutes()

  const zero = (d: number) => `${d < 10 ? `0${d}` : d}`
  return `${date.getFullYear() - 2020}.${date.getMonth()}${zero(d)}.${
    h + 10
  }${zero(m)}`
}

export const watchPkgsAndGenerateVersion = async () => {
  const vpath = join(process.cwd(), 'pkgs', 'version.json')

  const current = await readAsync(vpath, 'json')

  let timeout: ReturnType<typeof setTimeout> = 0 as any

  watch(join(process.cwd(), 'pkgs', '**'), {
    ignored: /node_modules/gi,
    ignoreInitial: true,
  }).on('all', (e, path) => {
    if (path !== vpath) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        writeAsync(vpath, { version: generateVersion() })
      }, 1000)
    }
  })

  return `v${current.version}`
}

export const checkLatestVersion = async () => {
  let msg = ''
  try {
    const vpath = join(process.cwd(), 'pkgs', 'version.json')

    const _latest = await fetch(
      `https://raw.githubusercontent.com/rizrmd/royal/master/pkgs/version.json?t=${new Date().getTime()}`
    )
    const latest = (await _latest.json()) as any
    const current = await readAsync(vpath, 'json')

    if (num(latest) > num(current)) {
      msg = `\
    ➥  Update available v${current.version} →  v${latest.version}
       Please update from https://github.com/rizrmd/royal
       Check: https://github.com/rizrmd/royal/blob/master/pkgs/version.json
`
    }
    if (num(latest) < num(current)) {
      msg = `\
    ➥  Your pkgs is updated! (old version at: v${latest.version})
       Please push your changes to https://github.com/rizrmd/royal
       Check: https://github.com/rizrmd/royal/blob/master/pkgs/version.json
`
    }
  } catch (e) {
    console.log('    ➥  Failed to check latest royal version')
  }
  return msg
}

const num = (ver: { version: string }) => {
  return parseInt(ver.version.replace(/\./gi, ''))
}
