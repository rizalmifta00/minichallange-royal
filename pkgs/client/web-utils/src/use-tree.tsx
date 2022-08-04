/** @jsx jsx */
import React, { FC, forwardRef, Fragment, Ref } from 'react'
import { useLocal } from './use-local'

interface IUseTree<T, K extends Record<string, any>> {
  primaryKey: string
  parentKey?: string
  extends?: K
  init?: any
  autoLoadChildren?: boolean
  onReady?: () => void
  onItemInit?: (item: TreeItem<T, K>, parent?: TreeItem<T, K>) => void
  onChange?: (tree: any) => void
  query: (props: { level: number; parent?: any }) => Promise<T[]>
}

type TreeItemStatus = 'init' | 'loading' | 'loaded'
type TreeItem<T, K> = T & {
  _tree: {
    level: number
    status: TreeItemStatus
    children: TreeItem<T, K>[]
    totalChild: number
  }
} & K

export const useTree = <T, K>(props: IUseTree<T, K>) => {
  const loadTree = async (
    level: number,
    parentKey: any
  ): Promise<TreeItem<T, K>[]> => {
    const res = (await props.query({ level, parent: parentKey })) as any

    for (let item of Object.values(res) as any) {
      item._tree = {
        level,
        status: 'init',
        children: [],
        totalChild: 0,
      }

      if (props.extends) {
        for (let [k, v] of Object.entries(props.extends)) {
          item[k] = v
        }
      }
    }

    return res
  }
  const local = useLocal(
    {
      root: [] as TreeItem<T, K>[],
      ready: false,
      rowLoadings: {},
      mounted: true,
      reload: async () => {
        local.root = await loadTree(0, null)
        local.ready = true
        render()

        if (props.onReady) {
          if (props.autoLoadChildren !== false) {
            const ival = setInterval(() => {
              if (Object.keys(local.rowLoadings).length === 0) {
                clearInterval(ival)
                if (props.onReady) {
                  if (local.mounted) props.onReady()
                }
              }
            }, 200)
          } else {
            if (local.mounted) props.onReady()
          }
        }
      },
      loadChildren: async (item: any) => {
        item._tree.status = 'loading'
        local.render()
        item._tree.children = await loadTree(
          item._tree.level + 1,
          (item as any)[props.primaryKey]
        )

        item._tree.status = 'loaded'
        local.render()
        return item._tree.children
      },
      flatten: () => {
        const list: TreeItem<T, K>[] = []
        const walk = (e: TreeItem<T, K>) => {
          list.push(e)
          for (let child of e._tree.children) {
            list.push(child)
            if (child._tree.children.length > 0) {
              for (let tchild of child._tree.children) {
                walk(tchild)
              }
            }
          }
        }
        for (let item of local.root) {
          walk(item)
        }

        return list
      },
      Tree: forwardRef(
        ({ className, children, container }, ref: Ref<HTMLDivElement>) => {
          const Container = container
          const treeChild = (
            <TreeChildren
              renderRoot={render}
              items={local.root}
              rowLoadings={local.rowLoadings}
              primaryKey={props.primaryKey}
              autoload={props.autoLoadChildren}
              onItemInit={props.onItemInit}
              children={children}
              loadChildren={loadTree}
            />
          )
          return (
            <div className={className} ref={ref}>
              {Container ? (
                <Container
                  renderChild={({ item, index }) => {
                    return (
                      <ChildContainer
                        key={index}
                        onItemInit={props.onItemInit}
                        item={item}
                        rowLoadings={local.rowLoadings}
                        renderRoot={render}
                        primaryKey={props.primaryKey}
                        loadChildren={loadTree}
                        autoload={props.autoLoadChildren}
                        children={children}
                      />
                    )
                  }}
                />
              ) : (
                treeChild
              )}
            </div>
          )
        }
      ) as FC<{
        className?: string
        ref?: any
        container?: FC<{
          renderChild: FC<{ item: TreeItem<T, K>; index: number }>
        }>
        children: FC<{
          item: TreeItem<T, K>
          loadChildren: () => Promise<TreeItem<T, K>[]>
          TreeChildren: FC<{ items?: TreeItem<T, K>[] }>
          render: () => void
        }>
      }>,
    },
    async () => {
      local.reload()
      return () => {
        local.mounted = false
      }
    }
  )

  const render = () => {
    if (!local.mounted) return

    if (props.onChange) {
      let opt = local

      if (props.init) {
        opt = { ...local }
        for (let [k, v] of Object.entries(opt)) {
          if (typeof v === 'function') {
            delete (opt as any)[k]
          }
        }
      }

      props.onChange(opt)
    }
  }

  return local
}

type ITreeChildren<T, K> = FC<{
  parent?: TreeItem<T, K>
  items: TreeItem<T, K>[]
  loadChildren: any
  primaryKey: string
  autoload?: boolean
  children: any
  rowLoadings: Record<any, true>
  onItemInit?: (item: TreeItem<T, K>, parent?: TreeItem<T, K>) => void
  renderRoot: () => void
}>
const TreeChildren: ITreeChildren<any, any> = ({
  items,
  primaryKey,
  parent,
  loadChildren,
  autoload,
  rowLoadings,
  onItemInit,
  children,
  renderRoot,
}) => {
  return (
    <Fragment>
      {items.map((e, idx) => {
        return (
          <ChildContainer
            parent={parent}
            key={idx}
            item={e}
            rowLoadings={rowLoadings}
            primaryKey={primaryKey}
            onItemInit={onItemInit}
            loadChildren={loadChildren}
            autoload={autoload}
            children={children}
            renderRoot={renderRoot}
          />
        )
      })}
    </Fragment>
  )
}

type IChildContainer<T, K> = React.FC<{
  parent?: TreeItem<T, K>
  item: TreeItem<T, K>
  autoload?: boolean
  primaryKey: string
  onItemInit?: (item: TreeItem<T, K>, parent?: TreeItem<T, K>) => void
  rowLoadings: Record<string, true>
  loadChildren: (level: number, parentKey: any) => Promise<TreeItem<T, K>[]>
  children: any
  renderRoot: () => void
}>

const ChildContainer: IChildContainer<any, any> = ({
  item,
  autoload,
  primaryKey,
  rowLoadings: rowStatus,
  children,
  parent,
  onItemInit,
  loadChildren,
  renderRoot,
}) => {
  const local = useLocal({}, async () => {
    if (item._tree.status === 'init' && autoload !== false) {
      item._tree.status = 'loading'
      rowStatus[item[primaryKey]] = true
      renderRoot()
      item._tree.children = await loadChildren(
        item._tree.level + 1,
        (item as any)[primaryKey]
      )

      item._tree.totalChild += item._tree.children.length

      if (parent && parent._tree) {
        parent._tree.totalChild += item._tree.children.length
      }

      item._tree.status = 'loaded'
      delete rowStatus[item[primaryKey]]
      local.render()
      renderRoot()
      if (onItemInit) {
        onItemInit(item, parent)
      }
    }
  })
  return (
    <Fragment>
      {children ? (
        children({
          item,
          render: local.render,
          TreeChildren: (({ items }) => {
            return (
              <TreeChildren
                parent={item}
                renderRoot={renderRoot}
                items={items ? items : item._tree.children}
                primaryKey={primaryKey}
                autoload={autoload}
                onItemInit={onItemInit}
                rowLoadings={rowStatus}
                children={children}
                loadChildren={loadChildren}
              />
            )
          }) as FC<{ items: any }>,
          loadChildren: async () => {
            item._tree.status = 'loading'
            local.render()
            item._tree.children = await loadChildren(
              item._tree.level + 1,
              (item as any)[primaryKey]
            )

            item._tree.status = 'loaded'
            local.render()
            return item._tree.children
          },
        })
      ) : (
        <div></div>
      )}
    </Fragment>
  )
}
