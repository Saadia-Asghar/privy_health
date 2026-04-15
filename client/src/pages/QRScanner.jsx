import React, { useEffect, useRef, useState } from 'react'
import s from './Page.module.css'
import { api } from '../lib/api.js'

export default function QRScanner() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanErr, setScanErr] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(0)

  function cleanupScan() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  useEffect(() => () => cleanupScan(), [])

  async function lookupByValue(rawCode) {
    if (!rawCode) return
    setLoading(true)
    try {
      const r = await fetch(api(`/api/prescriptions/verify/${encodeURIComponent(rawCode.toUpperCase())}`))
      setResult(await r.json())
    } catch {
      setResult({ error: 'Network error' })
    }
    setLoading(false)
  }

  async function lookup() {
    lookupByValue(code)
  }

  async function startScan() {
    setScanErr('')
    if (!('BarcodeDetector' in window)) {
      setScanErr('QR camera scanning is not supported in this browser. Use manual code entry.')
      return
    }
    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      const loop = async () => {
        if (!videoRef.current || !streamRef.current) return
        try {
          const matches = await detector.detect(videoRef.current)
          const raw = matches?.[0]?.rawValue
          if (raw) {
            const m = String(raw).toUpperCase().match(/PK-[A-Z0-9]{6}/)
            if (m) {
              setCode(m[0])
              cleanupScan()
              lookupByValue(m[0])
              return
            }
          }
        } catch {
          // ignore per-frame detector errors
        }
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)
    } catch (e) {
      setScanErr(e?.message || 'Unable to access camera.')
      cleanupScan()
    }
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
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>Camera scan supports QR values containing PK-XXXXXX.</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>or enter code manually below</div>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            {!scanning ? (
              <button type="button" className={s.smBtn} onClick={startScan}>Start Camera Scan</button>
            ) : (
              <button type="button" className={s.smBtn} onClick={cleanupScan}>Stop Scan</button>
            )}
          </div>
          {scanErr && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 8 }}>{scanErr}</div>}
          <video ref={videoRef} style={{ width: '100%', maxWidth: 280, marginTop: 10, borderRadius: 8, display: scanning ? 'block' : 'none' }} muted playsInline />
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
