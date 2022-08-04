import { watch } from 'chokidar'
import { readAsync, writeAsync } from 'fs-jetpack'
import https from 'https'
import { join } from 'path'

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

  const latest = await fetch(
    `https://raw.githubusercontent.com/rizrmd/royal/master/pkgs/version.json`
  )

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

  let msg = ''

  if (num(latest) > num(current)) {
    msg = `
            ➥ Update available v${current.version} →  v${latest.version}
              Please update from github.com/rizrmd/royal
`
  }
  if (num(latest) < num(current)) {
    msg = `
            ➥ Your pkgs is updated! (old version at: v${latest.version})
              Please push your changes to github.com/rizrmd/royal
` 
  }

  return `v${current.version} ${msg}`
}

const num = (ver: { version: string }) => {
  return parseInt(ver.version.replace(/\./gi, ''))
}

const fetch = (url: string) => {
  return new Promise<any>((resolve) => {
    const _url = new URL(url)
    const options = {
      hostname: _url.hostname,
      port: _url.port,
      path: _url.pathname,
      method: 'GET',
    }

    const req = https.request(options, (res) => {
      let response = ''
      res.on('data', (d) => {
        response += d.toString()
      })
      res.on('end', () => {
        resolve(JSON.parse(response))
      })
    })

    req.on('error', (error) => {
      console.error(error)
    })

    req.end()
  })
}
