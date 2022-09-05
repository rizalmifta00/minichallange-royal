import { useEffect, useRef, useState } from 'react'
import { retryFetch } from './retry-fetch'

const rfetch = retryFetch({
  retries: 3,
  retryDelay: 1000,
})

export const useAuth = (arg?: { onReady: () => void | Promise<void> }) => {
  const w = window as any
  if (!w.auth) {
    w.auth = { user: { role: 'guest' }, initialized: false }
  }
  const auth = w.auth

  const ref = useRef({
    user: auth.user,
    ready: auth.initialized,
    activity: 'idle' as
      | 'idle'
      | 'logging-in'
      | 'logging-out'
      | 'saving'
      | 'reloading',
    login: async (credentials: any) => {
      setLoading(true)
      ref.current.activity = 'logging-in'
      render()

      const res = await rfetch(`${w.baseurl}/auth/login`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const json = await res.json()
      setUser(json)
      setLoading(false)
      ref.current.activity = 'idle'
      render()
      return json
    },
    logout: async () => {
      setLoading(true)
      ref.current.activity = 'logging-out'
      render()
      const res = await rfetch(`${w.baseurl}/auth/logout`)
      const json = await res.json()
      setUser(json)
      setLoading(false)
      ref.current.activity = 'idle'
      render()
      return json
    },
    reload: async () => {
      setLoading(true)
      ref.current.activity = 'reloading'

      render()
      const res = await rfetch(`${w.baseurl}/auth/data`)
      setUser(await res.json())
      setLoading(false)
      ref.current.activity = 'idle'
      render()
    },
    set: async (key: string, value: any) => {
      setLoading(true)
      ref.current.activity = 'saving'
      render()
      const res = await rfetch(`${w.baseurl}/auth/set-data`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      })
      setUser(await res.json())
      setLoading(false)
      ref.current.activity = 'idle'
      render()
    },
  })
  const internal = useRef({
    mounted: true,
  })
  const [_, _render] = useState({})
  const render = () => {
    if (internal.current.mounted) {
      _render({})
    }
  }
  const setLoading = (loading: boolean) => {
    ref.current.ready = !loading
  }
  const setUser = (val: any) => {
    const c = val.cookie

    if (c) {
      w.session = {
        name: c.name,
        sid: val.encryptedSessionId,
      }

      localStorage[c.name] = w.session.sid
      delete val.cookie
    }

    if (!val.role) {
      val.role = 'guest'
    }

    auth.user = val
    ref.current.user = val
    w.user = val
  }

  useEffect(() => {
    ;(async () => {
      if (!w.auth.initialized) {
        const res = await rfetch(`${w.baseurl}/auth/data`)
        setUser(await res.json())
        if (!auth.initialized) auth.initialized = true
        setLoading(false)
      }
      if (arg && arg.onReady) {
        arg.onReady()
      }
      render()
    })()

    return () => {
      internal.current.mounted = false
    }
  }, [])
  return ref.current
}
