import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, info)
    }
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md bg-slate-900/70 backdrop-blur-sm border border-rose-500/30 rounded-xl p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-1">
                Something went wrong
              </h2>
              <p className="text-sm text-slate-400">
                {this.state.error.message || 'An unexpected error occurred.'}
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-purple-500/20 border border-purple-500/40 text-purple-200 hover:bg-purple-500/30 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
