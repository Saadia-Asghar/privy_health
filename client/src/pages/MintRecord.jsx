import React, { useState, useContext } from 'react'
import { AppCtx } from '../App.jsx'
import { useNavigate } from 'react-router-dom'
import s from './Page.module.css'
import SecurityFooter from '../components/SecurityFooter.jsx'

export default function MintRecord() {
  const { wallet, setWallet } = useContext(AppCtx)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: 'Ayesha Malik',
    dob: '1990-05-15',
    bloodType: 'B+',
    allergies: 'Penicillin',
    conditions: 'None',
    emergencyContact: '+92 300 1234567',
  })
  const [created, setCreated] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function create(e) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1600))
    setWallet('0x' + Math.random().toString(16).slice(2, 42))
    setCreated(true)
    setLoading(false)
  }

  if (created) return (
    <div className={s.page}>
      <div className={s.card} style={{ maxWidth: 500, textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Health Record Created!</h2>
        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          Your health record is encrypted and secured on the WireFluid network. Only you control who can see it.
        </p>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 20, textAlign: 'left', fontSize: 13 }}>
          <div style={{ fontWeight: 700, color: '#166534', marginBottom: 8 }}>What's next?</div>
          <div style={{ color: '#16a34a', lineHeight: 1.8 }}>
            1. Visit a doctor — they can now issue prescriptions linked to your record<br />
            2. Show your 6-digit code at any PrivyHealth pharmacy<br />
            3. Set up WhatsApp alerts in Settings
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className={s.btn} style={{ width: 'auto', padding: '9px 20px' }} onClick={() => navigate('/patient')}>
            View My Dashboard
          </button>
          <button className={s.smBtn} onClick={() => navigate('/settings')}>
            Link WhatsApp
          </button>
        </div>
        <SecurityFooter />
      </div>
    </div>
  )

  return (
    <div className={s.page}>
      <h1 className={s.title}>Create Health Record</h1>
      <p className={s.desc}>Set up your encrypted health record on WireFluid. Your data is only accessible to doctors and pharmacists you authorise.</p>

      <form onSubmit={create}>
        <div className={s.card} style={{ maxWidth: 560 }}>
          <div className={s.row}>
            <div className={s.field}>
              <label>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your full name" />
            </div>
            <div className={s.field}>
              <label>Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
            </div>
            <div className={s.field}>
              <label>Blood Type</label>
              <select value={form.bloodType} onChange={e => set('bloodType', e.target.value)}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className={s.field}>
              <label>Known Allergies</label>
              <input value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="e.g. Penicillin, Aspirin" />
            </div>
            <div className={`${s.field} ${s.fullField}`}>
              <label>Existing Conditions</label>
              <input value={form.conditions} onChange={e => set('conditions', e.target.value)} placeholder="e.g. Diabetes, Hypertension, or None" />
            </div>
            <div className={`${s.field} ${s.fullField}`}>
              <label>Emergency Contact Number</label>
              <input value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} placeholder="+92 300 1234567" />
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#166534' }}>
            Your information is encrypted with AES-256 and stored on WireFluid. No one can access it without your permission.
          </div>

          <button type="submit" className={s.btn} disabled={loading}>
            {loading ? (
              <><span className="loading-spinner" /> Securing to WireFluid...</>
            ) : (
              'Create My Health Record'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
