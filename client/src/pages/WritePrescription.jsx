import React, { useState } from 'react'
import s from './Page.module.css'
import ws from './WritePrescription.module.css'
import TransactionPreview from '../components/TransactionPreview.jsx'
import WhatsNext from '../components/WhatsNext.jsx'
import FieldHelp from '../components/FieldHelp.jsx'
import SecurityFooter from '../components/SecurityFooter.jsx'

const categories = [
  { value: 'ScheduleG', label: 'Schedule G — Antibiotic / Prescription Required' },
  { value: 'ScheduleH', label: 'Schedule H — Prescription Advised' },
  { value: 'OTC', label: 'OTC — Freely Available' },
  { value: 'ControlledSubstance', label: 'Controlled Substance — Premium Pharmacy Only' },
]

export default function WritePrescription() {
  const [form, setForm] = useState({
    patientName: 'Ayesha Malik',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    category: 'ScheduleG',
    refillsAllowed: '0',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showWhatsNext, setShowWhatsNext] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setShowPreview(true)
  }

  async function confirmSubmit() {
    setShowPreview(false)
    setLoading(true)
    try {
      const resp = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          doctorId: 'demo-doctor',
          doctorName: 'Dr. Ahmed Khan',
          patientId: 'demo-patient',
        }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to issue prescription')
      setResult(data)
      setShowWhatsNext(true)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  function copyCode(code) {
    navigator.clipboard?.writeText(code).catch(() => {})
  }

  function shareWhatsApp(code, medicine) {
    const msg = encodeURIComponent(`Prescription Code: ${code}\nMedicine: ${medicine}\n\nPharmacist — please send: verify ${code}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  function printResult(p) {
    const win = window.open('', '_blank')
    win.document.write(`<html><head><title>Prescription ${p.code}</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto}h1{color:#0f5b34}
    .code-box{background:#0c4a3f;color:white;padding:20px;border-radius:10px;text-align:center;margin:20px 0}
    .code{font-family:monospace;font-size:32px;font-weight:bold;letter-spacing:4px}
    table{width:100%;border-collapse:collapse;font-size:14px}td{padding:10px 0;border-bottom:1px solid #eee}
    td:first-child{color:#666;width:40%}td:last-child{font-weight:600}
    .verify-box{background:#f0fdf4;border:1px solid #86efac;padding:12px 16px;border-radius:8px;margin-top:16px;font-size:13px;color:#166534}</style>
    </head><body>
    <h1>PrivyHealth Pakistan</h1><p style="color:#666;font-size:13px">WireFluid Secure Network · DRAP Compliant</p>
    <div class="code-box"><div style="font-size:11px;opacity:0.6;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">PRESCRIPTION CODE</div>
    <div class="code">${p.code}</div>
    <div style="font-size:12px;opacity:0.65;margin-top:6px">Show at any PrivyHealth pharmacy</div></div>
    <table><tr><td>Patient</td><td>${p.patientName}</td></tr>
    <tr><td>Medicine</td><td>${p.medication}</td></tr>
    <tr><td>Dosage</td><td>${p.dosage} · ${p.frequency}</td></tr>
    <tr><td>Duration</td><td>${p.duration}</td></tr>
    <tr><td>Doctor</td><td>${p.doctorName}</td></tr>
    <tr><td>Valid Until</td><td>${new Date(p.validUntil).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr></table>
    <div class="verify-box"><strong>For pharmacists:</strong> Send <strong>verify ${p.code}</strong> to WhatsApp +923001234567</div>
    <script>window.onload=()=>window.print()</script></body></html>`)
    win.document.close()
  }

  if (result) return (
    <div className={s.page}>
      {showWhatsNext && (
        <WhatsNext event="prescriptionIssued" onDismiss={() => setShowWhatsNext(false)} />
      )}
      <div className="rx-success-screen">
        <div className="rx-check-big">✅</div>
        <h2 className="rx-success-title">Prescription Sent!</h2>
        <p className="rx-success-sub">{result.medication} · Secured on WireFluid · {new Date(result.validUntil).toLocaleDateString('en-PK', { day: 'numeric', month: 'long' })}</p>

        <div className="rx-code-hero">
          <div className="rx-code-label">Prescription Code — Give to patient</div>
          <div className="rx-code-value">{result.code}</div>
          <div className="rx-code-subtitle">Patient says: "Code hai {result.code}" at any pharmacy</div>
        </div>

        <div className="rx-share-row">
          <button className="rx-share-btn" onClick={() => copyCode(result.code)}>
            📋 Copy Code
          </button>
          <button className="rx-share-btn" onClick={() => shareWhatsApp(result.code, result.medication)}>
            💬 WhatsApp
          </button>
          <button className="rx-share-btn" onClick={() => printResult(result)}>
            🖨 Print
          </button>
        </div>

        <div className="rx-patient-instructions">
          <div className="rx-instructions-title">Tell the patient:</div>
          "Show this code at any PrivyHealth pharmacy, or send it via WhatsApp to verify instantly. No paper slip needed."
        </div>

        <SecurityFooter code={result.code} />

        <button
          className={s.smBtn}
          style={{ marginTop: 20 }}
          onClick={() => { setResult(null); setShowWhatsNext(false) }}
        >
          Write Another Prescription
        </button>
      </div>
    </div>
  )

  return (
    <div className={s.page}>
      {showPreview && (
        <TransactionPreview
          action="issuePrescription"
          details={{ medicine: form.medication, code: 'PK-XXXXXX' }}
          onConfirm={confirmSubmit}
          onCancel={() => setShowPreview(false)}
        />
      )}

      <h1 className={s.title}>Write Prescription</h1>
      <p className={s.desc}>Issues a signed prescription with a 6-digit verification code for the patient</p>

      <form onSubmit={handleSubmit}>
        <div className={s.card} style={{ maxWidth: 560 }}>
          <div className={s.row}>
            <div className={s.field}>
              <label>Patient Name</label>
              <input value={form.patientName} onChange={e => set('patientName', e.target.value)} required />
            </div>

            <div className={s.field}>
              <label>
                Category <FieldHelp field="category" />
              </label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div className={`${s.field} ${s.fullField}`}>
              <label>Medication</label>
              <input
                value={form.medication}
                onChange={e => set('medication', e.target.value)}
                required
                placeholder="e.g. Augmentin 625mg"
                list="meds"
              />
              <datalist id="meds">
                <option value="Augmentin 625mg" />
                <option value="Ciprofloxacin 500mg" />
                <option value="Metformin 500mg" />
                <option value="Amoxicillin 250mg" />
                <option value="Panadol Extra" />
                <option value="Brufen 400mg" />
                <option value="Amlodipine 5mg" />
                <option value="Atorvastatin 10mg" />
              </datalist>
            </div>

            <div className={s.field}>
              <label>Dosage</label>
              <input value={form.dosage} onChange={e => set('dosage', e.target.value)} required placeholder="e.g. 2 tablets" />
            </div>

            <div className={s.field}>
              <label>Frequency</label>
              <input value={form.frequency} onChange={e => set('frequency', e.target.value)} required placeholder="e.g. twice daily" />
            </div>

            <div className={s.field}>
              <label>Duration</label>
              <input value={form.duration} onChange={e => set('duration', e.target.value)} required placeholder="e.g. 7 days" />
            </div>

            <div className={s.field}>
              <label>
                Refills <FieldHelp field="refills" />
              </label>
              <select value={form.refillsAllowed} onChange={e => set('refillsAllowed', e.target.value)}>
                {['0', '1', '2', '3'].map(n => (
                  <option key={n} value={n}>{n === '0' ? '0 (No refills)' : `${n} refill${+n > 1 ? 's' : ''}`}</option>
                ))}
              </select>
              <div className="field-hint">0 = patient must come back for new prescription</div>
            </div>

            <div className={`${s.field} ${s.fullField}`}>
              <label>Notes (optional)</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Additional instructions, e.g. Take with food · Avoid sun exposure" />
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius)', fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button type="submit" className={s.btn} disabled={loading}>
            {loading ? <><span className="loading-spinner" /> Sending...</> : '💊 Sign & Send Prescription'}
          </button>
        </div>
      </form>
    </div>
  )
}
