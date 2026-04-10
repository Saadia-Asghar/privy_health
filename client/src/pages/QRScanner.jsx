import React, { useState } from 'react'
import s from './Page.module.css'

export default function QRScanner() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function lookup() {
    if (!code) return
    setLoading(true)
    try {
      const r = await fetch(`/api/prescriptions/verify/${encodeURIComponent(code.toUpperCase())}`)
      setResult(await r.json())
    } catch { setResult({ error: 'Network error' }) }
    setLoading(false)
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>QR Scanner / Emergency Access</h1>
        <span className={s.badge} style={{ background: '#fee2e2', color: '#dc2626' }}>Emergency</span>
      </div>
      <p className={s.desc}>Scan patient QR or enter prescription code. ER doctors can access emergency records without patient wallet interaction.</p>

      <div className={s.card} style={{ maxWidth: 460 }}>
        <div className={s.qrPlaceholder}>
          <div className={s.qrIcon}>📷</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>Camera access required for QR scan</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>or enter code manually below</div>
        </div>
        <div className={s.field} style={{ marginTop: 16 }}>
          <label>Prescription Code</label>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="PK-7X4M2K" style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, letterSpacing: 2, textAlign: 'center' }} />
        </div>
        <button className={s.btn} onClick={lookup} disabled={loading || !code}>
          {loading ? <span className="loading-spinner" /> : 'Verify'}
        </button>
        {result && (
          <div style={{ marginTop: 16, padding: '14px 16px', background: result.valid ? '#f0fdf4' : '#fef2f2', border: `1px solid ${result.valid ? '#86efac' : '#fca5a5'}`, borderRadius: 'var(--radius)', fontSize: 13, animation: 'fadeIn 0.2s ease' }}>
            {result.valid ? (
              <>
                <strong style={{ color: '#16a34a' }}>✅ Valid — {result.medication}</strong>
                <p style={{ marginTop: 6, color: 'var(--text-2)' }}>{result.doctorName} · Expires {new Date(result.validUntil).toLocaleDateString('en-PK')}</p>
              </>
            ) : (
              <strong style={{ color: '#dc2626' }}>❌ {result.filled ? 'Already Filled' : result.expired ? 'Expired' : result.error || 'Invalid'}</strong>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
