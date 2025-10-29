import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ React Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="tf-card max-w-2xl w-full p-8">
            <h1 className="text-3xl font-bold text-red-400 mb-4">⚠️ Application Error</h1>
            <p className="text-slate-300 mb-4">
              Something went wrong. This is usually caused by MSW not starting correctly.
            </p>
            <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
              <p className="text-sm font-mono text-red-300">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-200">Troubleshooting Steps:</h2>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm">
                <li>Check the browser console for detailed error messages</li>
                <li>Ensure the dev server is running (<code className="bg-slate-800 px-2 py-1 rounded">npm run dev</code>)</li>
                <li>Clear browser cache and reload (Ctrl+Shift+R)</li>
                <li>Check if <code className="bg-slate-800 px-2 py-1 rounded">public/mockServiceWorker.js</code> exists</li>
                <li>Try stopping the dev server and running <code className="bg-slate-800 px-2 py-1 rounded">npx msw init public</code></li>
              </ol>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="tf-btn tf-btn--primary mt-6"
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

