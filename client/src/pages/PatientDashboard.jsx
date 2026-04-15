import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppCtx } from '../App.jsx'
import s from './Page.module.css'
import ps from './PatientDashboard.module.css'
import SecurityFooter from '../components/SecurityFooter.jsx'
import { api } from '../lib/api.js'
import { publicSiteUrl, whatsappNumber, whatsappWaLink } from '../lib/publicSite.js'

const RECORD_KEY = 'privyhealth_record_created'

function PatientNextSteps({ prescriptions, hasRecord }) {
  const navigate = useNavigate()
  const hasPrescriptions = prescriptions.length > 0
  const steps = [
    {
      id: 'record',
      done: hasRecord,
      icon: '📋',
      title: 'Health record secured',
      desc: 'Your medical info is encrypted on WireFluid',
    },
    {
      id: 'prescriptions',
      done: hasPrescriptions,
      icon: '💊',
      title: hasPrescriptions ? 'Active prescriptions' : 'Get your first prescription',
      desc: hasPrescriptions ? `${prescriptions.filter(p => !p.filled).length} active, ready for pharmacy` : 'Visit a verified doctor to receive prescriptions here',
    },
    {
      id: 'whatsapp',
      done: false,
      icon: '📱',
      title: 'Link WhatsApp',
      desc: 'Get prescription updates and alerts via WhatsApp',
    },
  ]

  const incomplete = steps.filter(s => !s.done)
  if (incomplete.length === 0) return null
  const next = incomplete[0]

  function handleClick() {
    if (next.id === 'prescriptions') navigate('/doctors')
    else if (next.id === 'whatsapp') navigate('/settings')
  }

  return (
    <div className="next-step-banner">
      <div className="next-step-progress">
        <div className="next-step-dots">
          {steps.map(s => (
            <div key={s.id} className={`dot ${s.done ? 'done' : s.id === next.id ? 'active' : ''}`} />
          ))}
        </div>
        <div className="next-step-count">
          {steps.filter(s => s.done).length}/{steps.length} steps complete
        </div>
      </div>
      <div className="next-step-content">
        <span className="next-step-icon">{next.icon}</span>
        <div className="next-step-text">
          <div className="next-step-title">{next.title}</div>
          <div className="next-step-desc">{next.desc}</div>
        </div>
        {next.id !== 'record' && (
          <button
            onClick={handleClick}
            style={{ flexShrink: 0, padding: '8px 14px', background: 'var(--accent)', color: '#040d08', border: 'none', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {next.id === 'prescriptions' ? 'Find Doctor →' : 'Link WhatsApp →'}
          </button>
        )}
      </div>
    </div>
  )
}

function PharmacistFullscreen({ prescription, onClose }) {
  useEffect(() => {
    navigator.wakeLock?.request('screen').catch(() => {})
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const expiryStr = new Date(prescription.validUntil).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
  const site = publicSiteUrl()

  return (
    <div className="pharmacist-fullscreen">
      <button className="pharmacist-close" onClick={onClose}>✕</button>
      <div className="pharmacist-header">Show this to the pharmacist</div>
      <div className="pharmacist-code">{prescription.code}</div>
      <div className="pharmacist-medicine">{prescription.medication}</div>
      <div className="pharmacist-expiry">Valid until: {expiryStr}</div>
      <div className="pharmacist-whatsapp">
        Pharmacist: WhatsApp <strong>verify {prescription.code}</strong> to {whatsappNumber()}<br />
        Or enter code at: {site.replace(/^https?:\/\//, '')}/pharmacy/verify
      </div>
    </div>
  )
}

export default function PatientDashboard() {
  const { wallet } = useContext(AppCtx)
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [fullscreenRx, setFullscreenRx] = useState(null)
  const navigate = useNavigate()

  const hasRecord = typeof localStorage !== 'undefined' && localStorage.getItem(RECORD_KEY) === '1'

  useEffect(() => {
    const demo = api('/api/prescriptions?patientId=demo-patient')
    const urls = wallet
      ? [demo, api(`/api/prescriptions?patientId=${encodeURIComponent(wallet.toLowerCase())}`)]
      : [demo]
    Promise.all(urls.map((u) => fetch(u).then((r) => r.json())))
      .then((lists) => {
        const byCode = new Map()
        for (const d of lists) {
          if (Array.isArray(d)) d.forEach((p) => byCode.set(p.code, p))
        }
        setPrescriptions([...byCode.values()])
      })
      .catch(() => setPrescriptions([]))
      .finally(() => setLoading(false))
  }, [wallet])

  const active = prescriptions.filter(p => !p.filled && !p.expired)
  const filled = prescriptions.filter(p => p.filled)
  const expired = prescriptions.filter(p => p.expired && !p.filled)

  function shareWhatsApp(p) {
    const msg = `My prescription code: ${p.code}\nMedicine: ${p.medication}\nIssued by: ${p.doctorName}\n\nPharmacist: send verify ${p.code}`
    window.open(whatsappWaLink(msg), '_blank')
  }

  function printPrescription(p) {
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>Prescription ${p.code}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto}h1{color:#0f5b34;font-size:22px}
    .code-box{background:#0c4a3f;color:white;padding:20px;border-radius:10px;text-align:center;margin-bottom:20px}
    .code{font-family:monospace;font-size:32px;font-weight:bold;letter-spacing:4px}
    table{width:100%;border-collapse:collapse;font-size:14px}td{padding:10px 0;border-bottom:1px solid #eee}
    td:first-child{color:#666;width:40%}td:last-child{font-weight:600}
    .verify-box{background:#f0fdf4;border:1px solid #86efac;padding:12px 16px;border-radius:8px;margin-top:16px;font-size:13px;color:#166534}
    .footer{margin-top:30px;font-size:12px;color:#666;border-top:1px solid #eee;padding-top:16px}</style>
    </head><body>
    <h1>PrivyHealth Pakistan</h1>
    <div style="color:#666;font-size:13px;margin-bottom:24px">WireFluid Secure Network · DRAP Compliant</div>
    <div class="code-box">
    <div style="font-size:11px;opacity:0.6;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">PRESCRIPTION CODE</div>
    <div class="code">${p.code}</div>
    <div style="font-size:12px;opacity:0.65;margin-top:6px">Say this at any PrivyHealth pharmacy</div></div>
    <table>
    <tr><td>Patient</td><td>${p.patientName}</td></tr>
    <tr><td>Medicine</td><td>${p.medication}</td></tr>
    <tr><td>Dosage</td><td>${p.dosage} · ${p.frequency}</td></tr>
    <tr><td>Duration</td><td>${p.duration}</td></tr>
    <tr><td>Doctor</td><td>${p.doctorName}</td></tr>
    <tr><td>Valid Until</td><td>${new Date(p.validUntil).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}</td></tr>
    <tr><td>Category</td><td>${p.category}</td></tr>
    <tr><td>Refills</td><td>${p.refillsAllowed} allowed</td></tr>
    ${p.patientAllergies?.length ? `<tr><td>Allergies</td><td style="color:#dc2626">⚠ ${p.patientAllergies.join(', ')}</td></tr>` : ''}
    </table>
    <div class="verify-box"><strong>For pharmacists:</strong> Send <strong>verify ${p.code}</strong> to WhatsApp ${whatsappNumber()}</div>
    <div class="footer">Secured on WireFluid Network. DRAP Category: ${p.category} · Code: ${p.code}</div>
    <script>window.onload=()=>window.print()</script></body></html>`)
    win.document.close()
  }

  return (
    <div className={s.page}>
      {fullscreenRx && <PharmacistFullscreen prescription={fullscreenRx} onClose={() => setFullscreenRx(null)} />}

      <h1 className={s.title}>Patient Dashboard</h1>
      <p className={s.desc}>
        {wallet
          ? `Wallet-linked view · ${wallet.slice(0, 6)}…${wallet.slice(-4)} — demo data still includes shared PK codes`
          : 'Demo patient: Ayesha Malik · disconnect wallet anytime to browse sample prescriptions'}
        {' '}· WireFluid-ready workflow
      </p>

      <PatientNextSteps prescriptions={prescriptions} hasRecord={hasRecord} />

      <div className={s.statsRow}>
        <div className={s.stat}>
          <div className={s.statVal} style={{ color: '#16a34a' }}>{active.length}</div>
          <div className={s.statLbl}>Active</div>
        </div>
        <div className={s.stat}>
          <div className={s.statVal} style={{ color: '#1d4ed8' }}>{filled.length}</div>
          <div className={s.statLbl}>Filled</div>
        </div>
        <div className={s.stat}>
          <div className={s.statVal} style={{ color: '#d97706' }}>{expired.length}</div>
          <div className={s.statLbl}>Expired</div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}><span className="loading-spinner" /></div>
      ) : (
        <div className={ps.list}>
          {prescriptions.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💊</div>
              <h3 className="empty-title">No prescriptions yet</h3>
              <p className="empty-message">When a verified doctor prescribes you medicine, it will appear here with a code to use at the pharmacy.</p>
              <button onClick={() => navigate('/doctors')} style={{ padding: '8px 16px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-md)', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                Find a Doctor →
              </button>
            </div>
          )}

          {prescriptions.map(p => {
            const daysLeft = Math.max(0, Math.ceil((new Date(p.validUntil) - Date.now()) / 86400000))
            const isExpanded = expanded === p.id
            const statusBg = p.filled ? '#dbeafe' : p.expired ? '#f3f4f6' : daysLeft <= 2 ? '#fef9c3' : '#dcfce7'
            const statusColor = p.filled ? '#1d4ed8' : p.expired ? '#6b7280' : daysLeft <= 2 ? '#92400e' : '#16a34a'
            const statusText = p.filled ? '✓ Filled' : p.expired ? 'Expired' : daysLeft <= 2 ? `${daysLeft}d left!` : `${daysLeft}d left`

            return (
              <div key={p.id} className={`${ps.rxCard} ${isExpanded ? ps.rxExpanded : ''}`}>
                <div className={ps.rxMain} onClick={() => setExpanded(isExpanded ? null : p.id)}>
                  <div className={ps.rxLeft}>
                    <div className={ps.rxMed}>{p.medication}</div>
                    <div className={ps.rxMeta}>{p.doctorName} · {p.dosage} · {p.frequency}</div>
                  </div>
                  <div className={ps.rxRight}>
                    <div className={ps.rxCode}>{p.code}</div>
                    <span style={{ background: statusBg, color: statusColor, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>
                      {statusText}
                    </span>
                  </div>
                  <span className={ps.rxChevron}>{isExpanded ? '▲' : '▼'}</span>
                </div>

                {isExpanded && (
                  <div className={ps.rxDetails}>
                    <div className={ps.rxCodeBig}>
                      <div className={ps.rxCodeLabel}>Prescription Code — Show at pharmacy</div>
                      <div className={ps.rxCodeValue}>{p.code}</div>
                      <div className={ps.rxCodeHint}>Say: "Code hai {p.code}" · or WhatsApp it</div>
                    </div>

                    {!p.filled && !p.expired && (
                      <button
                        onClick={() => setFullscreenRx(p)}
                        style={{ width: '100%', padding: '12px', marginBottom: 12, background: '#059669', color: 'white', border: 'none', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                      >
                        📱 Show Full-Screen to Pharmacist
                      </button>
                    )}

                    <div className={ps.rxInfoGrid}>
                      {[
                        ['Duration', p.duration],
                        ['Category', p.category],
                        ['Refills', `${p.refillsUsed}/${p.refillsAllowed} used`],
                        ['Valid Until', new Date(p.validUntil).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })],
                        ['Issued', new Date(p.issuedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })],
                        ...(p.notes ? [['Notes', p.notes]] : []),
                      ].map(([k, v]) => (
                        <div key={k} className={ps.rxInfoItem}>
                          <div className={ps.rxInfoKey}>{k}</div>
                          <div className={ps.rxInfoVal}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {p.patientAllergies?.length > 0 && (
                      <div className={ps.rxAllergy}>
                        ⚠ Allergy Alert: <strong>{p.patientAllergies.join(', ')}</strong>
                      </div>
                    )}

                    <div className={ps.rxActions}>
                      <button className={ps.rxAction} onClick={() => shareWhatsApp(p)}>
                        💬 Share via WhatsApp
                      </button>
                      <button className={ps.rxAction} onClick={() => printPrescription(p)}>
                        🖨 Print
                      </button>
                      <button className={ps.rxAction} onClick={() => navigate('/pharmacy/verify')}>
                        ✅ Verify Now
                      </button>
                    </div>

                    {p.filled && p.filledByName && (
                      <div className={ps.rxFilledInfo}>
                        ✓ Dispensed at <strong>{p.filledByName}</strong> on {new Date(p.filledAt).toLocaleString('en-PK')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <SecurityFooter />
    </div>
  )
}
