import React, { useContext } from 'react'
import { AppCtx } from '../App.jsx'
import { useNavigate } from 'react-router-dom'
import s from './Page.module.css'
import SecurityFooter from '../components/SecurityFooter.jsx'

export default function MyRecord() {
  const { wallet } = useContext(AppCtx)
  const navigate = useNavigate()

  if (!wallet) return (
    <div className={s.page}>
      <h1 className={s.title}>My Health Record</h1>
      <div className={s.card} style={{ maxWidth: 400, textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Record Not Set Up</h3>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.6 }}>
          Create your health record to store your medical info securely and receive digital prescriptions from doctors.
        </p>
        <button className={s.btn} onClick={() => navigate('/patient/mint')}>
          Create Health Record
        </button>
      </div>
    </div>
  )

  return (
    <div className={s.page}>
      <h1 className={s.title}>My Health Record</h1>
      <p className={s.desc}>
        Secured on WireFluid · Encrypted · Account: {wallet.slice(0, 10)}...
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 560 }}>
        {[
          { label: 'Name', value: 'Ayesha Malik' },
          { label: 'Blood Type', value: 'B+' },
          { label: 'Known Allergies', value: 'Penicillin' },
          { label: 'Conditions', value: 'None' },
          { label: 'Emergency Contact', value: '+92 300 1234567' },
          { label: 'Record ID', value: '#PKH-001-2026' },
        ].map(r => (
          <div key={r.label} className={s.card} style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              {r.label}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className={s.smBtn} onClick={() => navigate('/patient')}>My Prescriptions</button>
        <button className={s.smBtn} onClick={() => navigate('/settings')}>Link WhatsApp</button>
      </div>

      <SecurityFooter />
    </div>
  )
}
