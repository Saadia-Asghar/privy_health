import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    console.error('PrivyHealth Error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24 }}>
          <div style={{ maxWidth: 480, width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 40, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              PrivyHealth encountered an unexpected error. This is likely temporary.
            </p>
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontFamily: 'monospace', fontSize: 12, color: '#dc2626', textAlign: 'left', wordBreak: 'break-word' }}>
              {this.state.error?.message || 'Unknown error'}
            </div>
            <button
              onClick={() => { this.setState({ error: null, info: null }); window.location.href = '/' }}
              style={{ background: '#16c784', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              Return to Home
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
