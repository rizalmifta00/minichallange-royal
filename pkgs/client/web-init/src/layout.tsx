import { FC } from 'react'

type ILayout = {
  component: FC<{}>
}

export const layout = (opt: ILayout) => {
  return opt.component
}
