import React, { useState } from 'react'
import s from './Page.module.css'
import { api } from '../lib/api.js'

const LOCAL_INTERACTIONS = {
  'warfarin+aspirin': { severity: 'high', msg: 'Major interaction: Increased bleeding risk. Avoid combination.' },
  'metformin+alcohol': { severity: 'medium', msg: 'Moderate: Increased risk of lactic acidosis with heavy alcohol use.' },
  'augmentin+warfarin': { severity: 'medium', msg: 'Moderate: Augmentin may increase the anticoagulant effect of Warfarin.' },
  'ciprofloxacin+antacids': { severity: 'medium', msg: 'Moderate: Antacids reduce absorption of Ciprofloxacin. Take 2 hrs apart.' },
}

function localCheck(a, b) {
  const key = [a, b].map((d) => d.toLowerCase().trim()).sort().join('+')
  return LOCAL_INTERACTIONS[key]
}

function mapApiToResult(data) {
  const list = Array.isArray(data.interactions) ? data.interactions : []
  if (list.length) {
    const high = list.find((i) => i.severity === 'high')
    const moderate = list.find((i) => i.severity === 'moderate')
    const low = list.find((i) => i.severity === 'low')
    const pick = high || moderate || low || list[0]
    const sev = high ? 'high' : moderate || low ? 'medium' : 'none'
    const msg = pick?.note || data.summary || 'Review with pharmacist.'
    return { severity: sev, msg, source: 'api' }
  }
  if (data.summary && data.summary !== 'Check with pharmacist.') {
    return {
      severity: data.safe === false ? 'medium' : 'none',
      msg: data.summary,
      source: 'api',
    }
  }
  return null
}

export default function DrugChecker() {
  const [drug1, setDrug1] = useState('')
  const [drug2, setDrug2] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState(null)

  async function check() {
    const a = drug1.trim()
    const b = drug2.trim()
    if (!a || !b) return
    setLoading(true)
    setResult(null)
    setSource(null)
    try {
      const res = await fetch(api('/api/ai/drug-check'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications: [a, b] }),
      })
      const data = await res.json().catch(() => ({}))
      const mapped = mapApiToResult(data)
      if (mapped) {
        setResult({ severity: mapped.severity, msg: mapped.msg })
        setSource(mapped.source)
      } else {
        const local = localCheck(a, b)
        if (local) {
          setResult(local)
          setSource('local')
        } else {
          setResult({
            severity: 'none',
            msg: 'No known significant interaction found between these medications (still confirm with a pharmacist).',
          })
          setSource('local')
        }
      }
    } catch {
      const local = localCheck(a, b)
      if (local) {
        setResult(local)
        setSource('local')
      } else {
        setResult({
          severity: 'none',
          msg: 'No known significant interaction found between these medications (still confirm with a pharmacist).',
        })
        setSource('local')
      }
    } finally {
      setLoading(false)
    }
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
      <p className={s.desc}>
        Check for interactions between two medications. Uses an AI-assisted review when configured, with offline rules as fallback.
      </p>

      <div className={s.card} style={{ maxWidth: 520 }}>
        <div className={s.row}>
          <div className={s.field}>
            <label>First Drug</label>
            <input value={drug1} onChange={(e) => setDrug1(e.target.value)} placeholder="e.g. Warfarin" list="drugs1" />
            <datalist id="drugs1">
              <option value="Warfarin" />
              <option value="Aspirin" />
              <option value="Metformin" />
              <option value="Augmentin" />
              <option value="Ciprofloxacin" />
              <option value="Antacids" />
            </datalist>
          </div>
          <div className={s.field}>
            <label>Second Drug</label>
            <input value={drug2} onChange={(e) => setDrug2(e.target.value)} placeholder="e.g. Aspirin" list="drugs2" />
            <datalist id="drugs2">
              <option value="Warfarin" />
              <option value="Aspirin" />
              <option value="Metformin" />
              <option value="Augmentin" />
              <option value="Ciprofloxacin" />
              <option value="Antacids" />
              <option value="Alcohol" />
            </datalist>
          </div>
        </div>
        <button className={s.btn} onClick={check} disabled={!drug1 || !drug2 || loading}>
          {loading ? 'Checking…' : 'Check Interaction'}
        </button>

        {result && (
          <div
            style={{
              marginTop: 20,
              background: severityStyle[result.severity].bg,
              border: `1px solid ${severityStyle[result.severity].border}`,
              borderRadius: 'var(--radius)',
              padding: '14px 16px',
              fontSize: 14,
              color: severityStyle[result.severity].color,
              lineHeight: 1.6,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <strong>
              {severityStyle[result.severity].icon}{' '}
              {result.severity === 'high'
                ? 'Major Interaction'
                : result.severity === 'medium'
                  ? 'Moderate Interaction'
                  : 'No Interaction'}
            </strong>
            <p style={{ marginTop: 6 }}>{result.msg}</p>
            {source && (
              <p style={{ marginTop: 10, fontSize: 11, opacity: 0.75 }}>
                {source === 'api' ? 'AI-assisted summary' : 'Offline rule set'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
