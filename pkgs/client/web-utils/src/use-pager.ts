import { useEffect, useRef, useState } from 'react'

interface IUsePager<T> {
  pageSize?: number
  query: (arg: {
    pageSize: number
    currentPage: number
    skip: number
    take: number
  }) => Promise<T[]>
  onChange?: (pager: any) => void
  init?: any
}

export const usePager = <T>(props: IUsePager<T>) => {
  const _ = useRef({
    dataPerPage: [] as Array<Array<T>>,
    data: [] as T[],
    currentPage: 0,
    pageSize: props.pageSize || 50,
    loading: false,
    hasMore: true,
    reload: async () => {
      meta.currentPage = 0
      meta.data.splice(0, meta.data.length)
      meta.dataPerPage.splice(0, meta.dataPerPage.length)
      meta.hasMore = true
      meta.next()
    },
    next: async () => {
      if (!meta.hasMore) return []

      meta.loading = true
      meta.render()
      meta.currentPage = meta.currentPage + 1
      const data = await props.query({
        currentPage: meta.currentPage,
        pageSize: meta.pageSize,
        skip: meta.pageSize * (meta.currentPage - 1),
        take: meta.pageSize,
      })
      meta.dataPerPage.push(data)
      for (let i of data) {
        meta.data.push(i)
      }

      if (data.length < meta.pageSize) {
        meta.hasMore = false
      }

      meta.loading = false
      meta.render()

      if (props.onChange) {
        let pager = meta
        if (props.init) {
          pager = { ...meta }
          for (let [k, v] of Object.entries(pager)) {
            if (typeof v === 'function') {
              delete (pager as any)[k]
            }
          }
        }
        props.onChange(pager)
      }

      return data
    },
    render: () => {
      if (meta.mounted) {
        _render({})
      }
    },
    mounted: true,
  })
  useEffect(() => {
    if (props.init && Object.keys(props.init).length > 0) {
      for (let [k, v] of Object.entries(props.init)) {
        ;(meta as any)[k] = v
      }
      meta.render()
    } else {
      meta.next()
    }
    return () => {
      meta.mounted = false
    }
  }, [])
  const [__, _render] = useState({})
  const meta = _.current
  return _.current
}
