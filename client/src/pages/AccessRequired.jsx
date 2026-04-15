import React from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Page.module.css'

export default function AccessRequired({ title, message, actionLabel = 'Open Settings' }) {
  const navigate = useNavigate()

  return (
    <div className={s.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div className={s.card} style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 42, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 8 }}>{title}</h2>
        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button className={s.btn} style={{ width: 'auto', padding: '10px 20px' }} onClick={() => navigate('/settings')}>
            {actionLabel}
          </button>
          <button className={s.smBtn} onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    </div>
  )
}

