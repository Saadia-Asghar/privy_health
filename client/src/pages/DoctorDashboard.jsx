import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppCtx } from '../App.jsx'
import s from './Page.module.css'

export default function DoctorDashboard() {
  const { wallet } = useContext(AppCtx)
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/prescriptions?doctorId=demo-doctor')
      .then(r => r.json())
      .then(data => { setPrescriptions(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const today = prescriptions.filter(p => {
    const d = new Date(p.issuedAt)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })
  const filled = prescriptions.filter(p => p.filled)

  return (
    <div className={s.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className={s.title}>Dr. Ahmed Khan</h1>
          <p className={s.desc}>PMDC-12345 · General Physician · Karachi</p>
        </div>
        <button
          className={s.btn}
          style={{ width: 'auto', padding: '10px 20px' }}
          onClick={() => navigate('/doctor/write')}
        >
          + Write Prescription
        </button>
      </div>

      <div className={s.statsRow}>
        <div className={s.stat}>
          <div className={s.statVal} style={{ color: '#16a34a' }}>{today.length}</div>
          <div className={s.statLbl}>Issued Today</div>
        </div>
        <div className={s.stat}>
          <div className={s.statVal} style={{ color: '#1d4ed8' }}>{filled.length}</div>
          <div className={s.statLbl}>Filled</div>
        </div>
        <div className={s.stat}>
          <div className={s.statVal}>{prescriptions.length}</div>
          <div className={s.statLbl}>Total Issued</div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontWeight: 700, fontSize: 15 }}>Recent Prescriptions</h2>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{prescriptions.length} total</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><span className="loading-spinner" /></div>
        ) : prescriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💊</div>
            <h3 className="empty-title">No prescriptions yet</h3>
            <p className="empty-message">Write your first prescription and a 6-digit code will be generated for the patient instantly.</p>
            <button className={s.btn} style={{ width: 'auto', padding: '9px 18px' }} onClick={() => navigate('/doctor/write')}>
              Write First Prescription
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {prescriptions.slice(0, 8).map(p => (
              <div key={p.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{p.medication}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    {p.patientName} · <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{p.code}</span>
                  </div>
                </div>
                <span style={{
                  padding: '3px 12px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 700,
                  background: p.filled ? '#dbeafe' : '#dcfce7',
                  color: p.filled ? '#1d4ed8' : '#16a34a',
                }}>
                  {p.filled ? 'Filled' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', boxShadow: 'var(--shadow)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className={s.smBtn} onClick={() => navigate('/doctor/write')}>Write Prescription</button>
          <button className={s.smBtn} onClick={() => navigate('/pharmacy/verify')}>Verify Code</button>
          <button className={s.smBtn} onClick={() => navigate('/drug-checker')}>Drug Checker</button>
        </div>
      </div>
    </div>
  )
}
