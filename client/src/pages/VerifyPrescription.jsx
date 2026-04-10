import React, { useState } from 'react'
import s from './Page.module.css'
import vs from './VerifyPrescription.module.css'

export default function VerifyPrescription() {
  const [tab, setTab] = useState('code')
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filling, setFilling] = useState(false)
  const [filled, setFilled] = useState(false)

  function handleInput(e) {
    let v = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
    if (v === 'PK' && !v.includes('-')) v = 'PK-'
    if (v.length > 9) v = v.slice(0, 9)
    setCode(v)
    setResult(null); setFilled(false)
    if (v.replace(/-/g, '').length >= 8) verify(v)
  }

  async function verify(c = code) {
    if (!c || c.length < 7) return
    setLoading(true); setResult(null)
    try {
      const r = await fetch(`/api/prescriptions/verify/${encodeURIComponent(c)}`)
      setResult(await r.json())
    } catch { setResult({ error: 'Network error' }) }
    setLoading(false)
  }

  async function fill() {
    setFilling(true)
    try {
      await fetch(`/api/prescriptions/fill/${encodeURIComponent(code)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pharmacyId: 'demo-pharmacy', pharmacyName: 'Medico Pharmacy, Karachi' }) })
      setFilled(true)
    } catch {}
    setFilling(false)
  }

  return (
    <div className={s.page}>
      <h1 className={s.title}>Verify Prescription</h1>
      <p className={s.desc}>Enter the 6-digit code, scan QR, or use WhatsApp to verify</p>

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
          <a href="https://wa.me/923001234567" target="_blank" rel="noopener" className={vs.waSave}>Save PrivyHealth to WhatsApp →</a>
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
                <button className={vs.dispenseBtn} onClick={fill} disabled={filling}>
                  {filling ? <span className="loading-spinner" /> : '✅ Mark as Dispensed'}
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
