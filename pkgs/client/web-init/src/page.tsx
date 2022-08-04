import { FC } from 'react'
import layouts from '../../../../app/web/types/layout'

type IPage = {
  url: string
  layout?: keyof typeof layouts
  actions?: string[]
  component: FC<{ layout: any & { ready: boolean; render: () => void } }>
}

export const page = (opt: IPage) => {
  return opt
}
