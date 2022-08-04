import React from 'react'

export const useAsyncEffect = (func: () => Promise<any>, deps: any) => {
  React.useEffect(() => {
    func()
  }, deps)
}

export default useAsyncEffect
