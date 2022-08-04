import * as emotion from '@emotion/react'
export const jsx = (...args: any[]) => {
  const w = window as any
  const [_tag, _props] = args

  let tag = _tag
  let propsModified = false
  const props = { ..._props }
  if (props.class) {
    propsModified = true
    props.className = `${props.className || ''} ${props.class}`
    delete props.class
  }

  if (tag === 'label' && props.for) {
    propsModified = true
    props.htmlFor = props.for
    delete props.for
  }

  if (
    tag === 'a' &&
    !props.target &&
    typeof props.href === 'string' &&
    props.href.startsWith('/')
  ) {
    const onClick = props.onClick
    props.onClick = (e: any) => {
      if (!onClick) {
        e.stopPropagation()
        e.preventDefault()
        navigate(props.href)
      } else {
        onClick(e)
      }
    }

    if (w.isMobile) {
      tag = 'div'
    }

    propsModified = true
  }

  if (props.className && props.className.indexOf('btn-fade') >= 0) {
    const findParent = (e: any) => {
      let tag = e.target
      while (
        tag &&
        (typeof tag.className !== 'string' ||
          !tag.className ||
          (tag.className &&
            tag.className.indexOf &&
            tag.className.indexOf('btn-fade') < 0))
      ) {
        tag = tag.parentNode
      }
      return tag
    }
    props.onPointerDown = (e: any) => {
      const tag = findParent(e)
      if (tag) tag.style.opacity = 0.3
    }
    props.onPointerUp =
      props.onPointerCancel =
      props.onPointerOut =
        (e: any) => {
          const tag = findParent(e)
          if (tag) tag.style.opacity = 1
        }

    if (props.className.indexOf('transition-all') <= 0) {
      props.className += ' transition-all'
    }
    propsModified = true
  }

  if (
    typeof props.style === 'string' ||
    (typeof props.style === 'object' && props.style.styles && props.style.name)
  ) {
    props.css = css`
      ${props.style}
    `
    delete props.style
    propsModified = true
  }

  if (tag === 'img') {
    if (typeof props.draggable === 'undefined') {
      props.draggable = false
      propsModified = true
    }
    if (props.src.startsWith('http')) {
      props.style = { visibility: 'hidden' }
    }

    const onLoad = props.onLoad
    props.onLoad = (e: any) => {
      if (props.src.startsWith('http')) {
        e.target.style.visibility = 'visible'
      }
      if (onLoad) {
        onLoad(e)
      }
    }
  }

  if (propsModified) {
    return emotion.jsx(tag, props, ...args.slice(2))
  }

  return emotion.jsx.apply(null, args as any)
}
