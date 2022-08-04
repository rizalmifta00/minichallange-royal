import consola from 'consola'
import lu from 'log-update'

const logUpdateConf = {
  silent: false,
}
export const silentUpdate = (state: boolean) => {
  logUpdateConf.silent = state
}
export const logUpdate = function (str: string) {
  if (!logUpdateConf.silent) return lu(str)
}
logUpdate.done = lu.done;
export const rawLogUpdate = lu;

export const log = consola.log
export const error = consola.error
import PrettyError from 'pretty-error'

const pe = new PrettyError()

export const prettyError = () => {
  const printError = (e: any) => {
    console.log(pe.render(e))
  }

  process.on('uncaughtException', (e) => {
    printError(e)
    process.exit(1)
  })
  process.on('unhandledRejection', (e) => {
    printError(e)
    process.exit(1)
  })

  return pe.render
}
