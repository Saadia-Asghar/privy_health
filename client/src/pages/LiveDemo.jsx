import React, { useState, useRef, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Page.module.css'
import { api } from '../lib/api.js'
import { whatsappNumber } from '../lib/publicSite.js'
import { AppCtx } from '../App.jsx'

function MiniWhatsApp() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { from: 'system', text: 'WhatsApp Bot — Test Mode\nSend a command to verify the prescription.' },
  ])
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(msgOverride) {
    const userMsg = (msgOverride || input).trim()
    if (!userMsg) return
    setInput('')
    setMessages(prev => [...prev, { from: 'user', text: userMsg }])
    setLoading(true)
    try {
      const res = await fetch(api('/api/whatsapp/test'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { from: 'bot', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: '❌ Backend not reachable. Make sure server is running.' }])
    }
    setLoading(false)
  }

  return (
    <div className="whatsapp-tester">
      <div className="wa-header">
        <div className="wa-avatar">PH</div>
        <div>
          <div className="wa-name">PrivyHealth Pakistan</div>
          <div className="wa-status">● Online</div>
        </div>
      </div>
      <div className="wa-messages" style={{ height: 200 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`wa-msg wa-msg-${msg.from}`}>
            <pre className="wa-msg-text">{msg.text}</pre>
          </div>
        ))}
        {loading && (
          <div className="wa-msg wa-msg-bot">
            <div className="wa-typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="wa-quick-cmds">
        {['verify PK-7X4M2K', 'fill PK-7X4M2K', 'help'].map(cmd => (
          <button key={cmd} className="wa-quick-btn" onClick={() => send(cmd)} disabled={loading}>{cmd}</button>
        ))}
      </div>
      <div className="wa-input-row">
        <input
          className="wa-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="verify PK-7X4M2K"
          disabled={loading}
        />
        <button className="wa-send-btn" onClick={() => send()} disabled={loading || !input.trim()}>➤</button>
      </div>
    </div>
  )
}

function MiniVerify() {
  const [code, setCode] = useState('PK-7X4M2K')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function verify() {
    if (!code.trim()) return
    setLoading(true)
    try {
      const res = await fetch(api(`/api/prescriptions/verify/${code.trim()}`))
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ valid: false, error: 'Cannot connect to server' })
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          style={{ flex: 1, padding: '9px 12px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 15 }}
          placeholder="PK-XXXXXX"
        />
        <button onClick={verify} disabled={loading} style={{ padding: '9px 16px', background: 'var(--accent)', color: '#040d08', border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {loading ? '...' : 'Verify →'}
        </button>
      </div>

      {result && (
        <div style={{ padding: '14px 16px', borderRadius: 'var(--radius)', border: `1.5px solid ${result.valid ? '#86efac' : '#fca5a5'}`, background: result.valid ? '#f0fdf4' : '#fef2f2' }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: result.valid ? '#16a34a' : '#dc2626' }}>
            {result.valid ? '✅ VALID PRESCRIPTION' : result.filled ? '⚠️ ALREADY DISPENSED' : result.expired ? '❌ EXPIRED' : '❌ NOT FOUND'}
          </div>
          {result.valid && (
            <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.7 }}>
              {result.medication} · {result.dosage}<br />
              Dr. {result.doctorName} ✓<br />
              Patient: {result.patientName}
            </div>
          )}
          {!result.valid && <div style={{ fontSize: 13, color: '#dc2626' }}>{result.error || 'This prescription cannot be dispensed.'}</div>}
        </div>
      )}
    </div>
  )
}

export default function LiveDemo({ isLive }) {
  const navigate = useNavigate()
  const { lang } = useContext(AppCtx)
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: 'Doctor writes a prescription',
      explanation: 'Dr. Ahmed Khan issues Augmentin 625mg for patient Ayesha Malik. The system generates a 6-digit code instantly.',
      component: (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', maxWidth: 400 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Prescription Issued</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Augmentin 625mg</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Dr. Ahmed Khan · 2x daily · 5 days</div>
            </div>
            <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>Active</span>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center', border: '2px solid var(--accent)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Prescription Code</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.1em' }}>PK-7X4M2K</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>Patient shows this at any pharmacy</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Patient shows code at pharmacy',
      explanation: 'The patient shows PK-7X4M2K at the pharmacy — on their phone screen, printed, or via WhatsApp. No paper slip required.',
      component: (
        <div style={{ background: 'white', color: '#111', borderRadius: 'var(--radius-lg)', padding: '1.5rem', maxWidth: 360, textAlign: 'center', border: '2px solid #059669' }}>
          <div style={{ fontSize: 14, color: '#555', marginBottom: 12 }}>Patient shows this screen to pharmacist</div>
          <div style={{ fontFamily: 'monospace', fontSize: 'clamp(2rem, 10vw, 3rem)', fontWeight: 900, color: '#059669', letterSpacing: '0.12em', marginBottom: 8 }}>PK-7X4M2K</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Augmentin 625mg</div>
          <div style={{ fontSize: 13, color: '#666' }}>Valid until April 12, 2026</div>
          <div style={{ marginTop: 14, fontSize: 12, color: '#888' }}>
            Or WhatsApp: <strong>verify PK-7X4M2K</strong> → {whatsappNumber()}
          </div>
        </div>
      ),
    },
    {
      title: 'Pharmacy verifies via WhatsApp',
      explanation: 'The pharmacist sends "verify PK-7X4M2K" to the WhatsApp bot — works on any basic Android phone. Try it live:',
      component: <MiniWhatsApp />,
    },
    {
      title: 'Live verification — enter any code',
      explanation: 'The full verification API is live. Enter PK-7X4M2K, PK-9KRM4X, or PK-2BX8NQ to see real responses:',
      component: <MiniVerify />,
    },
    {
      title: 'Medicine dispensed — permanently recorded',
      explanation: 'After dispensing, the pharmacy marks "fill PK-7X4M2K". The record is saved permanently. The code cannot be reused.',
      component: (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', maxWidth: 400 }}>
          <div style={{ display: 'flex', align: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Prescription Filled</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Recorded permanently on WireFluid</div>
            </div>
          </div>
          {[
            ['Code', 'PK-7X4M2K'],
            ['Medicine', 'Augmentin 625mg'],
            ['Pharmacy', 'Medico Pharmacy (Verified)'],
            ['Time', new Date().toLocaleTimeString('en-PK')],
            ['Status', 'Cannot be dispensed again'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-3)' }}>{k}</span>
              <strong style={{ color: k === 'Status' ? '#16a34a' : 'var(--text)' }}>{v}</strong>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>
          {lang === 'ur' ? (isLive ? '● Live ڈیمو' : '▷ Interactive ڈیمو') : (isLive ? '● Live Demo' : '▷ Interactive Demo')}
        </h1>
        <span className={s.badge} style={{ background: isLive ? '#dcfce7' : '#f3f4f6', color: isLive ? '#16a34a' : 'var(--text-2)' }}>
          {isLive ? 'Live' : 'Demo'}
        </span>
      </div>
      <p className={s.desc}>
        {lang === 'ur'
          ? (isLive
            ? 'تمام ڈیٹا WireFluid testnet پر live ہے — دیکھنے کے لیے wallet ضروری نہیں۔'
            : 'ہر فیچر دیکھنے کے لیے step-by-step demo چلائیں — بغیر رجسٹریشن بھی ممکن۔')
          : (isLive
            ? 'All data is live on WireFluid testnet — no wallet needed to explore'
            : 'Click through to see every feature — no wallet or registration needed')}
      </p>

      <div className="demo-badge">🎮 Read-Only · No Wallet Needed</div>

      <div className="demo-steps-nav">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <button
              className={`demo-step-btn ${i === activeStep ? 'active' : ''} ${i < activeStep ? 'done' : ''}`}
              onClick={() => setActiveStep(i)}
              title={step.title}
            >
              {i < activeStep ? '✓' : i + 1}
            </button>
            {i < steps.length - 1 && <div className="demo-step-connector" />}
          </React.Fragment>
        ))}
      </div>

      <div className="demo-step-content">
        <div className="demo-step-title">Step {activeStep + 1}: {steps[activeStep].title}</div>
        <div className="demo-explanation">💡 {steps[activeStep].explanation}</div>
        <div className="demo-component">{steps[activeStep].component}</div>
      </div>

      <div className="demo-nav-buttons">
        <button
          className={s.smBtn}
          onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
        >
          ← Previous
        </button>
        {activeStep < steps.length - 1 ? (
          <button className={s.btn} style={{ padding: '8px 20px' }} onClick={() => setActiveStep(activeStep + 1)}>
            Next →
          </button>
        ) : (
          <button className={s.btn} style={{ padding: '8px 20px' }} onClick={() => navigate('/')}>
            Back to Home →
          </button>
        )}
      </div>

      {activeStep === steps.length - 1 && (
        <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--green-faint)', border: '1px solid var(--green-light)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--green-dark)' }}>✅ Demo Complete</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>You've seen the full flow — from prescription to dispensed. Try the real features:</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/pharmacy/verify')} className={s.btn} style={{ padding: '8px 16px' }}>Verify a Code</button>
            <button onClick={() => navigate('/patient')} className={s.smBtn}>My Prescriptions</button>
            <button onClick={() => navigate('/drug-checker')} className={s.smBtn}>Drug Checker</button>
          </div>
        </div>
      )}
    </div>
  )
}
