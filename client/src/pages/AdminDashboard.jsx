import React, { useState, useEffect } from 'react'
import s from './Page.module.css'

const ADMIN_PASSWORD = 'entangled2026'

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === '1')
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [data, setData] = useState(null)
  const [approving, setApproving] = useState(null)

  useEffect(() => {
    if (!authed) return
    fetch('/api/admin/overview').then(r => r.json()).then(setData).catch(() => {})
  }, [authed])

  function login(e) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1')
      setAuthed(true)
    } else {
      setPwErr('Incorrect password')
      setPw('')
    }
  }

  if (!authed) return (
    <div className={s.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div className={s.card} style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
        <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Admin Access</h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>PrivyHealth Pakistan · DRAP Compliance Portal</p>
        <form onSubmit={login}>
          <div className={s.field} style={{ marginBottom: 12 }}>
            <label>Admin Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwErr('') }}
              placeholder="Enter password"
              autoFocus
            />
            {pwErr && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>⚠ {pwErr}</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 14 }}>
            Demo password: <code style={{ fontFamily: 'var(--mono)' }}>entangled2026</code>
          </div>
          <button type="submit" className={s.btn}>Login to Admin</button>
        </form>
      </div>
    </div>
  )

  return (
    <div className={s.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <h1 className={s.title}>Admin · DRAP Compliance</h1>
        <button className={s.smBtn} onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false) }}>Logout</button>
      </div>
      <p className={s.desc}>PrivyHealth Pakistan · System overview and compliance reporting</p>

      {data && (
        <>
          <div className={s.statsRow} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              ['💊', data.totalPrescriptions, 'Prescriptions'],
              ['✅', data.filledPrescriptions, 'Filled'],
              ['📈', `${data.fillRate}%`, 'Fill Rate'],
              ['🏪', data.totalPharmacies, 'Pharmacies'],
            ].map(([icon, val, lbl]) => (
              <div key={lbl} className={s.stat}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div className={s.statVal}>{val}</div>
                <div className={s.statLbl}>{lbl}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>DRAP Category Report</h2>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              {[
                ['Schedule G — Antibiotic (Prescription Required)', data.byCategory?.ScheduleG || 0, '#f59e0b'],
                ['Schedule H — Prescription Advised', data.byCategory?.ScheduleH || 0, '#3b82f6'],
                ['OTC — Freely Available', data.byCategory?.OTC || 0, '#22c55e'],
                ['Controlled Substance (Schedule X)', data.byCategory?.ControlledSubstance || 0, '#ef4444'],
              ].map(([cat, count, color]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-2)' }}>{cat}</span>
                  </div>
                  <strong style={{ color }}>{count}</strong>
                </div>
              ))}
              <div style={{ padding: '14px 20px', background: 'var(--bg)', display: 'flex', gap: 10 }}>
                <button onClick={() => alert('DRAP monthly report exported (demo)')} style={{ background: 'var(--green)', color: 'white', border: 'none', borderRadius: 'var(--radius)', padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Export DRAP Monthly Report
                </button>
                <button onClick={() => window.print()} style={{ background: 'var(--card)', color: 'var(--text)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  🖨 Print Report
                </button>
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontWeight: 700, fontSize: 15 }}>Pharmacy Registry</h2>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{data.pharmacies?.length || 0} registered</span>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '9px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5, gap: 12 }}>
                <div style={{ flex: 2 }}>Pharmacy</div>
                <div>Tier</div>
                <div>Verifications</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              {(data.pharmacies || []).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <div style={{ flex: 2 }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.city} · {p.drapLicense}</div>
                  </div>
                  <div>
                    <span style={{ padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: p.tier === 'Premium' ? '#fef9c3' : p.tier === 'Verified' ? '#dbeafe' : '#f3f4f6', color: p.tier === 'Premium' ? '#92400e' : p.tier === 'Verified' ? '#1e40af' : '#374151' }}>
                      {p.tier}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-2)', fontWeight: 600 }}>{p.verifications}</div>
                  <div>
                    <span style={{ padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: p.status === 'Active' ? '#dcfce7' : '#fef9c3', color: p.status === 'Active' ? '#166534' : '#92400e' }}>
                      {p.status}
                    </span>
                  </div>
                  <div>
                    <button className={s.smBtn} style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => alert(`Audit log for ${p.name} (demo)`)}>
                      Audit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
