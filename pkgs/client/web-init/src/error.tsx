import { Component, ReactElement } from 'react'

type ErrorBoundaryState = {
  error: Error | null
  errorInfo: any
}
export class ErrorBoundary extends Component<
  { children: ReactElement },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch = (error: any, errorInfo: any) =>
    catchFunc(error, errorInfo, this)

  render() {
    if (this.state.errorInfo) {
      return handleError(this)
    }
    // Normally, just render children
    return this.props.children || <div></div>
  }
}

const handleError = (ctx: any) => (
  // Error path
  <div style={ctx.props.style || styles.error}>
    <h2>Something went wrong.</h2>
    <details
      className="whitespace-pre-wrap text-sm overflow-auto p-2"
      css={css`
        font-family: monospace, monospace;
        font-size: 11px;
        background-color: #ececeb58;
      `}
    >
      {ctx.state.error && ctx.state.error.toString()}
      <br />
      <br />
      <div>{ctx.state.errorInfo.componentStack}</div>
    </details>
  </div>
)

const catchFunc = (error: Error, errorInfo: any, ctx: any) => {
  // catch errors in any components below and re-render with error message
  ctx.setState({
    error: error,
    errorInfo: errorInfo,
  })
  // log error messages, etc.
}

const styles = {
  error: {
    backgroundColor: '#f98e7e',
    borderTop: '1px solid #777',
    borderBottom: '1px solid #777',
    padding: '12px',
  },
}
