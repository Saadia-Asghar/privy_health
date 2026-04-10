import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import s from './Page.module.css'

export default function NotFound() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className={s.page} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
      <div style={{ fontSize: 72, marginBottom: 16, lineHeight: 1 }}>🏥</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>404 — Page Not Found</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 8 }}>
        No prescription for <code style={{ fontFamily: 'var(--mono)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>{location.pathname}</code>
      </p>
      <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 28 }}>
        This page does not exist. Check the URL or use the sidebar to navigate.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className={s.btn}
          style={{ width: 'auto', padding: '10px 24px' }}
          onClick={() => navigate('/')}
        >
          Go Home
        </button>
        <button
          className={s.smBtn}
          onClick={() => navigate(-1)}
        >
          ← Go Back
        </button>
      </div>
    </div>
  )
}
