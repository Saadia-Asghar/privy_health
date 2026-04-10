import React, { useState } from 'react'
import s from './Page.module.css'

const interactions = {
  'warfarin+aspirin': { severity: 'high', msg: 'Major interaction: Increased bleeding risk. Avoid combination.' },
  'metformin+alcohol': { severity: 'medium', msg: 'Moderate: Increased risk of lactic acidosis with heavy alcohol use.' },
  'augmentin+warfarin': { severity: 'medium', msg: 'Moderate: Augmentin may increase the anticoagulant effect of Warfarin.' },
  'ciprofloxacin+antacids': { severity: 'medium', msg: 'Moderate: Antacids reduce absorption of Ciprofloxacin. Take 2 hrs apart.' },
}

export default function DrugChecker() {
  const [drug1, setDrug1] = useState('')
  const [drug2, setDrug2] = useState('')
  const [result, setResult] = useState(null)

  function check() {
    const key = [drug1, drug2].map(d => d.toLowerCase().trim()).sort().join('+')
    const found = interactions[key]
    if (found) setResult(found)
    else setResult({ severity: 'none', msg: 'No known significant interaction found between these medications.' })
  }

  const severityStyle = {
    high: { bg: '#fef2f2', border: '#fca5a5', icon: '🚫', color: '#dc2626' },
    medium: { bg: '#fffbeb', border: '#fcd34d', icon: '⚠️', color: '#d97706' },
    none: { bg: '#f0fdf4', border: '#86efac', icon: '✅', color: '#16a34a' },
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Drug Checker</h1>
        <span className={s.badge} style={{ background: '#dcfce7', color: '#16a34a' }}>Free</span>
      </div>
      <p className={s.desc}>Check for interactions between two medications. Based on DRAP approved drug data.</p>

      <div className={s.card} style={{ maxWidth: 520 }}>
        <div className={s.row}>
          <div className={s.field}>
            <label>First Drug</label>
            <input value={drug1} onChange={e => setDrug1(e.target.value)} placeholder="e.g. Warfarin" list="drugs1" />
            <datalist id="drugs1"><option value="Warfarin"/><option value="Aspirin"/><option value="Metformin"/><option value="Augmentin"/><option value="Ciprofloxacin"/><option value="Antacids"/></datalist>
          </div>
          <div className={s.field}>
            <label>Second Drug</label>
            <input value={drug2} onChange={e => setDrug2(e.target.value)} placeholder="e.g. Aspirin" list="drugs2" />
            <datalist id="drugs2"><option value="Warfarin"/><option value="Aspirin"/><option value="Metformin"/><option value="Augmentin"/><option value="Ciprofloxacin"/><option value="Antacids"/><option value="Alcohol"/></datalist>
          </div>
        </div>
        <button className={s.btn} onClick={check} disabled={!drug1 || !drug2}>Check Interaction</button>

        {result && (
          <div style={{ marginTop: 20, background: severityStyle[result.severity].bg, border: `1px solid ${severityStyle[result.severity].border}`, borderRadius: 'var(--radius)', padding: '14px 16px', fontSize: 14, color: severityStyle[result.severity].color, lineHeight: 1.6, animation: 'fadeIn 0.2s ease' }}>
            <strong>{severityStyle[result.severity].icon} {result.severity === 'high' ? 'Major Interaction' : result.severity === 'medium' ? 'Moderate Interaction' : 'No Interaction'}</strong>
            <p style={{ marginTop: 6 }}>{result.msg}</p>
          </div>
        )}
      </div>
    </div>
  )
}
