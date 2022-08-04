import { FC, ReactElement, useEffect, useRef, useState } from 'react'
import { waitUntil } from './wait-until'

const proxify = (obj: any, doRender: () => void) => {
  return new Proxy(obj, {
    set: function (target, key, value) {
      console.log(value)

      if (value === 'object' && !!value && !(value instanceof Proxy)) {
        target[key] = proxify(value, doRender)
      } else {
        target[key] = value
      }
      return true
    },
  })
}

export const useLocalObservable = <T extends any>(
  data: () => T,
  effect?: () => Promise<void | (() => void)> | void | (() => void)
): T & { render: () => void; log: () => void } => {
  const meta = useRef(
    new Proxy(
      {
        ...(data() as any),
        log: () => {
          console.log(toJS(meta.current))
        },
        render: () => {
          if (int.mounted) render({})
        },
      },
      {
        set: function (target, key, value) {
          const doRender = () => {
            if (int.timeout !== null || !int.mounted) return true
            int.timeout = setTimeout(async () => {
              if (!int.mounted) {
                await waitUntil(() => int.mounted, 1000)
              }
              render({})
              int.timeout = null

            })
          }
          if (
            typeof value === 'object' &&
            !!value 
          ) {
            target[key] = value

            // target[key] = proxify(value, doRender)
          } else {
            target[key] = value
          }
          doRender()

          return true
        },
      }
    ) as any
  )
  const internal = useRef({ mounted: false, timeout: null as any })
  const int = internal.current
  useEffect(() => {
    int.mounted = true
    if (effect) effect()

    return () => {
      // int.mounted = false
    }
  }, [])
  const [_, render] = useState({})

  return meta.current
}

export const useLocalStore = useLocalObservable

export const Observer: FC<{ children: () => ReactElement }> = ({
  children,
}) => {
  return children()
}

export const observer = <T>(component: FC<T>) => {
  return component
}

export const observable = <T>(args: T) => {
  return args
}
export const toJS = <T extends Record<string, any>>(args: T) => {
  let res = {} as any
  for (let i of Object.keys(args)) {
    if (i !== 'log' && i !== 'render') {
      res[i] = args[i]
    }
  }
  return res
}
export const action = (func: (...args: any[]) => void) => {
  return func
}
