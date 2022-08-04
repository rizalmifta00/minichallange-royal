import {
  createContext,
  FC,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react'

export const GlobalContext = createContext({
  global: new WeakMap(),
  render: () => {},
})

export const useGlobal = <T extends object>(
  defaultValue: T,
  effect?: () => Promise<void | (() => void)> | void | (() => void)
): T & { render: () => void } => {
  const { global, render } = useContext(GlobalContext)

  if (!global.has(defaultValue)) {
    global.set(defaultValue, { ...defaultValue })
  }

  useEffect(() => {
    let res: any = null
    if (effect) {
      res = effect()
    }
    return () => {
      if (typeof res === 'function') res()
      else if (res instanceof Promise) {
        res.then((e) => {
          if (typeof e === 'function') e()
        })
      }
    }
  }, [])

  const res = global.get(defaultValue)
  res.render = render
  return res
}
