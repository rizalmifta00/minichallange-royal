import { ParsedConfig } from 'boot/dev/config-parse'
import { fork } from 'child_process'

export type IDBQueueResult = {
  resolve: (result: any) => void
  reject: (reason: string) => void
}

declare global {
  const config: ParsedConfig
  const dbQueue: Record<string, IDBQueueResult>
  const forks: Record<string, ReturnType<typeof fork> & { ready: boolean }>
}

export {}
