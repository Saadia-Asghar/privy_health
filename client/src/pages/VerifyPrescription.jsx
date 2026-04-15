import React, { useState } from 'react'
import s from './Page.module.css'
import vs from './VerifyPrescription.module.css'
import { api } from '../lib/api.js'
import { clearAuthSession, fetchWithAuth, getAuthSession, login } from '../lib/auth.js'
import { whatsappWaLink } from '../lib/publicSite.js'

export default function VerifyPrescription() {
  const [session, setSession] = useState(() => getAuthSession())
  const [email, setEmail] = useState('pharmacy@local.demo')
  const [password, setPassword] = useState('')
  const [authErr, setAuthErr] = useState('')
  const [tab, setTab] = useState('code')
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filling, setFilling] = useState(false)
  const [filled, setFilled] = useState(false)
  const [hint, setHint] = useState('')
  const canFill = ['pharmacy', 'admin'].includes(session?.user?.role)

  function normalizeCode(raw) {
    let v = String(raw || '').toUpperCase().replace(/[^A-Z0-9-]/g, '')
    if (v === 'PK' && !v.includes('-')) v = 'PK-'
    if (/^PK[A-Z0-9]/.test(v)) v = v.replace(/^PK/, 'PK-')
    if (v.length > 9) v = v.slice(0, 9)
    return v
  }

  function handleInput(e) {
    const v = normalizeCode(e.target.value)
    setCode(v)
    setHint('')
    setResult(null); setFilled(false)
    if (v.replace(/-/g, '').length >= 8) verify(v)
  }

  async function verify(c = code) {
    const normalized = normalizeCode(c)
    setCode(normalized)
    if (!normalized || normalized.length < 7) {
      setHint('Enter full code like PK-7X4M2K.')
      return
    }
    setLoading(true); setResult(null)
    try {
      const r = await fetch(api(`/api/prescriptions/verify/${encodeURIComponent(normalized)}`))
      setResult(await r.json())
    } catch { setResult({ error: 'Network error' }) }
    setLoading(false)
  }

  async function fill() {
    if (!canFill) {
      setResult({ valid: false, error: 'Pharmacy/admin login required to mark dispensed.' })
      return
    }
    setFilling(true)
    try {
      const res = await fetchWithAuth(`/api/prescriptions/fill/${encodeURIComponent(code)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pharmacyId: 'demo-pharmacy', pharmacyName: 'Medico Pharmacy, Karachi' }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Fill failed')
      }
      setFilled(true)
    } catch (e) {
      setResult({ valid: false, error: e.message })
      if (e.code === 'AUTH_EXPIRED') setSession(null)
    }
    setFilling(false)
  }

  async function signInPharmacy(e) {
    e.preventDefault()
    setAuthErr('')
    try {
      const out = await login(email, password)
      if (!['pharmacy', 'admin'].includes(out.user?.role)) throw new Error('Pharmacy/admin role required')
      setSession(out)
      setResult(null)
      setPassword('')
    } catch (e2) {
      setAuthErr(e2.message)
    }
  }

  return (
    <div className={s.page}>
      <h1 className={s.title}>Verify Prescription</h1>
      <p className={s.desc}>Enter the 6-digit code, scan QR, or use WhatsApp to verify</p>
      <div className={s.card} style={{ maxWidth: 540, marginBottom: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Pharmacy API session</div>
        {canFill ? (
          <div style={{ fontSize: 12, color: '#166534' }}>
            Signed in as <strong>{session.user.email}</strong> ({session.user.role}). Fill actions use JWT authorization.
            <button
              className={s.smBtn}
              type="button"
              style={{ marginLeft: 10 }}
              onClick={() => { clearAuthSession(); setSession(null) }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={signInPharmacy} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'end' }}>
            <div className={s.field}>
              <label>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className={s.field}>
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className={s.smBtn} type="submit" style={{ height: 36 }}>Sign in</button>
            {authErr && <div style={{ gridColumn: '1 / -1', fontSize: 12, color: '#dc2626' }}>{authErr}</div>}
          </form>
        )}
      </div>

      <div className={vs.tabs}>
        {[['code', 'Enter Code'], ['whatsapp', 'WhatsApp']].map(([id, lbl]) => (
          <button key={id} className={`${vs.tab} ${tab === id ? vs.tabActive : ''}`} onClick={() => setTab(id)}>{lbl}</button>
        ))}
      </div>

      {tab === 'code' && (
        <div style={{ maxWidth: 440 }}>
          <input
            className={vs.codeInput}
            value={code}
            onChange={handleInput}
            placeholder="PK-______"
            autoFocus
            spellCheck={false}
          />
          <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginBottom: 16 }}>Auto-verifies at 8 characters · e.g. PK-7X4M2K</div>
          {hint && <div style={{ fontSize: 12, color: '#b45309', textAlign: 'center', marginBottom: 10 }}>{hint}</div>}
          <button className={s.btn} onClick={() => verify()} disabled={loading || code.length < 7}>
            {loading ? <span className="loading-spinner" /> : 'Verify Prescription'}
          </button>
        </div>
      )}

      {tab === 'whatsapp' && (
        <div className={vs.waPanel}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Verify via WhatsApp</h3>
          {[['1', 'Save PrivyHealth number to your contacts'],['2', <>Send: <code>verify PK-7X4M2K</code> (replace with actual code)</>],['3', 'Receive details in seconds'],['4', <>Reply: <code>fill PK-7X4M2K</code> to mark as dispensed</>]].map(([n, t]) => (
            <div key={n} className={vs.waStep}>
              <div className={vs.waStepN}>{n}</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{t}</div>
            </div>
          ))}
          <a href={whatsappWaLink()} target="_blank" rel="noopener" className={vs.waSave}>Save PrivyHealth to WhatsApp →</a>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24, maxWidth: 540 }}>
          {result.error && !result.valid && !result.filled && !result.expired ? (
            <div className={`${vs.resultCard} ${vs.invalid}`}>
              <div className={vs.rcIcon}>❌</div>
              <h3>Invalid Code</h3>
              <p>{result.error}</p>
            </div>
          ) : result.expired ? (
            <div className={`${vs.resultCard} ${vs.expired}`}>
              <div className={vs.rcIcon}>⏰</div>
              <h3>Prescription Expired</h3>
              <p>Expired on {new Date(result.validUntil).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
            </div>
          ) : result.filled ? (
            <div className={`${vs.resultCard} ${vs.alreadyFilled}`}>
              <div className={vs.rcIcon}>❌</div>
              <h3>Already Dispensed — Do Not Give Medicine</h3>
              <p>Dispensing again is fraudulent and recorded on WireFluid.</p>
            </div>
          ) : result.valid ? (
            <div className={`${vs.resultCard} ${vs.valid}`}>
              <div className={vs.validHeader}>
                <div style={{ fontSize: 28 }}>✅</div>
                <div>
                  <h3>Valid — Dispense This Medicine</h3>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Code: {result.code}</div>
                </div>
              </div>
              <div className={vs.rows}>
                {[['Medicine', result.medication], ['Dosage', `${result.dosage} · ${result.frequency} · ${result.duration}`], ['Doctor', `${result.doctorName} ✓`], ['Expires', new Date(result.validUntil).toLocaleDateString('en-PK')], ['Refills', `${result.refillsUsed}/${result.refillsAllowed}`]].map(([k,v]) => (
                  <div key={k} className={vs.row}><span>{k}</span><strong>{v}</strong></div>
                ))}
                {result.patientAllergies?.length > 0 && (
                  <div className={vs.allergy}>⚠ Patient Allergies: {result.patientAllergies.join(', ')}</div>
                )}
              </div>
              {!filled ? (
                <button className={vs.dispenseBtn} onClick={fill} disabled={filling || !canFill}>
                  {filling ? <span className="loading-spinner" /> : canFill ? '✅ Mark as Dispensed' : 'Pharmacy Login Required'}
                </button>
              ) : (
                <div className={vs.dispensedMsg}>Prescription marked as dispensed on WireFluid ✓</div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
