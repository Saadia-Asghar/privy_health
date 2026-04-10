import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Page.module.css'

export default function PharmacyRegister() {
  const [form, setForm] = useState({ name: '', city: '', address: '', drapLicense: '', whatsappNumber: '', ownerName: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(null)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Pharmacy name is required'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.address.trim()) errs.address = 'Address is required'
    if (!form.drapLicense.trim()) errs.drapLicense = 'DRAP license number is required'
    if (form.whatsappNumber && !/^\+?\d{10,15}$/.test(form.whatsappNumber.replace(/\s/g, ''))) {
      errs.whatsappNumber = 'Enter a valid phone number (e.g. +923001234567)'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const resp = await fetch('/api/pharmacies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to register')
      setDone(data)
    } catch (err) {
      setErrors({ submit: err.message })
    }
    setLoading(false)
  }

  if (done) return (
    <div className={s.page}>
      <div className={s.card} style={{ maxWidth: 500, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Registration Submitted!</h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.6 }}>
          <strong>{done.name}</strong> is registered as a <strong>Basic</strong> pharmacy.
          An admin will review your DRAP license and approve your account within 24 hours.
        </p>
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, textAlign: 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Pharmacy Tier System</div>
          {[['● Basic', '0–99 verifications — standard listing'],['✓ Verified', '100+ verifications — featured listing + patient referrals'],['⭐ Premium', '500+ verifications — controlled substances + priority listing']].map(([t, d]) => (
            <div key={t} style={{ fontSize: 12, color: 'var(--text-2)', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--text)' }}>{t}</strong> — {d}
            </div>
          ))}
        </div>
        <button className={s.btn} onClick={() => navigate('/pharmacy')}>Go to Pharmacy Portal</button>
      </div>
    </div>
  )

  return (
    <div className={s.page}>
      <h1 className={s.title}>Register Your Pharmacy</h1>
      <p className={s.desc}>Join PrivyHealth's verified pharmacy network. Earn verification credits, get patient referrals, and protect yourself legally.</p>

      <form onSubmit={submit}>
        <div className={s.card} style={{ maxWidth: 560 }}>
          <div className={s.row}>
            <div className={s.field}>
              <label>Pharmacy Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Medico Pharmacy" />
              {errors.name && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>⚠ {errors.name}</span>}
            </div>
            <div className={s.field}>
              <label>City *</label>
              <select value={form.city} onChange={e => set('city', e.target.value)}>
                <option value="">Select city</option>
                {['Karachi','Lahore','Islamabad','Rawalpindi','Peshawar','Quetta','Multan','Faisalabad','Hyderabad','Sialkot'].map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.city && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>⚠ {errors.city}</span>}
            </div>
            <div className={`${s.field} ${s.fullField}`}>
              <label>Full Address *</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. Shop 15, Saddar Market, Karachi" />
              {errors.address && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>⚠ {errors.address}</span>}
            </div>
            <div className={s.field}>
              <label>DRAP License Number *</label>
              <input value={form.drapLicense} onChange={e => set('drapLicense', e.target.value)} placeholder="e.g. DRAP-KHI-2341" style={{ fontFamily: 'var(--mono)' }} />
              {errors.drapLicense && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>⚠ {errors.drapLicense}</span>}
            </div>
            <div className={s.field}>
              <label>WhatsApp Number</label>
              <input value={form.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value)} placeholder="+923001234567" />
              {errors.whatsappNumber && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>⚠ {errors.whatsappNumber}</span>}
            </div>
            <div className={`${s.field} ${s.fullField}`}>
              <label>Owner / Manager Name</label>
              <input value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="Muhammad Ali" />
            </div>
          </div>

          <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#92400e' }}>
            ⚠ Your DRAP license will be verified before approval. Fake licenses will be reported to DRAP.
          </div>

          {errors.submit && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#dc2626' }}>
              Error: {errors.submit}
            </div>
          )}
          <button type="submit" className={s.btn} disabled={loading}>
            {loading ? <><span className="loading-spinner" /> Registering...</> : '🏪 Register Pharmacy'}
          </button>
        </div>
      </form>
    </div>
  )
}
