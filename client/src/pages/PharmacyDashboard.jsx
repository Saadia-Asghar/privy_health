import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Page.module.css'
import { api } from '../lib/api.js'

export default function PharmacyDashboard() {
  const [stats, setStats] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(api('/api/pharmacy/demo-pharmacy/stats'))
      .then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  const tierColors = { Basic: '#6b7280', Verified: '#2563eb', Premium: '#d97706' }
  const tc = tierColors[stats?.tier] || '#6b7280'
  const progress = stats ? Math.min(100, stats.verifications / (stats.tier === 'Basic' ? 100 : 500) * 100) : 0

  return (
    <div className={s.page}>
      <h1 className={s.title}>Pharmacy Portal</h1>
      <p className={s.desc}>Medico Pharmacy · Saddar, Karachi · DRAP-KHI-2341</p>

      {stats && (
        <>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20, boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Tier</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: tc }}>{stats.tier}</div>
              </div>
              <div style={{ padding: '4px 14px', borderRadius: 100, background: tc + '20', color: tc, fontSize: 12, fontWeight: 700, alignSelf: 'center' }}>
                {stats.tier === 'Premium' ? '⭐ Premium' : stats.tier === 'Verified' ? '✓ Verified' : '◦ Basic'}
              </div>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: 100, height: 7, marginBottom: 6 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: tc, borderRadius: 100, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}>
              <span>{stats.verifications} verifications</span>
              <span>{stats.tier === 'Premium' ? 'Max tier' : `${(stats.tier === 'Basic' ? 100 : 500) - stats.verifications} more to ${stats.tier === 'Basic' ? 'Verified' : 'Premium'}`}</span>
            </div>
          </div>

          <div className={s.statsRow}>
            <div className={s.stat}><div className={s.statVal}>{stats.verifications}</div><div className={s.statLbl}>Total Verifications</div></div>
            <div className={s.stat}><div className={s.statVal}>{stats.todayVerifications || 0}</div><div className={s.statLbl}>Today</div></div>
            <div className={s.stat}><div className={s.statVal}>{stats.canFillControlled ? 'Yes' : 'No'}</div><div className={s.statLbl}>Controlled Drugs</div></div>
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, cursor: 'pointer', transition: 'all 0.15s' }} onClick={() => navigate('/pharmacy/verify')} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--green)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Verify Prescription</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Enter code or use WhatsApp</div>
        </div>
        <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, cursor: 'pointer', transition: 'all 0.15s' }} onClick={() => navigate('/doctors')} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--green)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📍</div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Pharmacy Directory</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Find verified pharmacies</div>
        </div>
      </div>
    </div>
  )
}
