import { ChildProcess } from 'child_process'
import fs from 'fs/promises'
import { join } from 'path'

export const clientDir = {
  root: '',
  page: '',
  pageOut: '',
  api: '',
  apiOut: '',
  layout: '',
  layoutOut: '',
  auth: '',
  authOut: '',
}

export const dev = {
  boot: null as null | ChildProcess,
}

export const walkDir = async function (directory: string) {
  let fileList: string[] = []

  const files = await fs.readdir(directory)
  for (const file of files) {
    const p = join(directory, file)
    if ((await fs.stat(p)).isDirectory()) {
      fileList = [...fileList, ...(await walkDir(p))]
    } else {
      fileList.push(p)
    }
  }

  return fileList
}
