import React, { useState, useContext, useRef, useEffect } from 'react'
import { AppCtx } from '../App.jsx'
import s from './Page.module.css'

const WHATSAPP_NUMBER = '+923001234567'

function WhatsAppTester() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { from: 'system', text: 'Connected to PrivyHealth WhatsApp Bot (Test Mode)\nType a command or tap a shortcut below.' },
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(msgOverride) {
    const userMsg = (msgOverride || input).trim()
    if (!userMsg) return
    setInput('')
    setMessages(prev => [...prev, { from: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'demo-tester', message: userMsg }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { from: 'bot', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: '❌ Bot offline. Check that the backend is running.' }])
    } finally {
      setLoading(false)
    }
  }

  const quickCommands = ['help', 'verify PK-7X4M2K', 'fill PK-7X4M2K', 'verify PK-2BX8NQ', 'emergency', 'my record']

  return (
    <div className="whatsapp-tester">
      <div className="wa-header">
        <div className="wa-avatar">PH</div>
        <div>
          <div className="wa-name">PrivyHealth Pakistan</div>
          <div className="wa-status">● Online (Test Mode)</div>
        </div>
      </div>

      <div className="wa-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`wa-msg wa-msg-${msg.from}`}>
            <pre className="wa-msg-text">{msg.text}</pre>
          </div>
        ))}
        {loading && (
          <div className="wa-msg wa-msg-bot">
            <div className="wa-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="wa-quick-cmds">
        {quickCommands.map(cmd => (
          <button key={cmd} className="wa-quick-btn" onClick={() => send(cmd)} disabled={loading}>
            {cmd}
          </button>
        ))}
      </div>

      <div className="wa-input-row">
        <input
          className="wa-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && send()}
          placeholder="Type a command or try verify PK-7X4M2K"
          disabled={loading}
        />
        <button className="wa-send-btn" onClick={() => send()} disabled={loading || !input.trim()}>
          ➤
        </button>
      </div>

      <div className="wa-note">
        This simulates the real WhatsApp bot. Pharmacists send these exact messages to verify prescriptions.
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { wallet, setWallet, dark, setDark, lang, setLang } = useContext(AppCtx)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('wallet')

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function linkWhatsApp() {
    const msg = encodeURIComponent(`join PrivyHealth — My account: ${wallet || 'not-connected'}`)
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${msg}`, '_blank')
  }

  const tabs = [
    { id: 'wallet', label: '🔐 Account' },
    { id: 'whatsapp', label: '💬 WhatsApp' },
    { id: 'network', label: '⛓ Network' },
    { id: 'appearance', label: '🎨 Appearance' },
  ]

  return (
    <div className={s.page}>
      <h1 className={s.title}>Settings</h1>
      <p className={s.desc}>Configure your PrivyHealth account, WhatsApp bot, and app preferences</p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '7px 14px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600,
              border: `1.5px solid ${activeTab === t.id ? 'var(--accent)' : 'var(--border)'}`,
              background: activeTab === t.id ? 'var(--green-faint)' : 'var(--card)',
              color: activeTab === t.id ? 'var(--green-dark)' : 'var(--text-2)',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 580 }}>

        {activeTab === 'wallet' && (
          <section className={s.card}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🔐 Account Connection</h3>
            {wallet ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 10, height: 10, background: '#22c55e', borderRadius: '50%', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 13, wordBreak: 'break-all' }}>{wallet}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>Connected to WireFluid Testnet</div>
                <button className={s.smBtn} onClick={() => setWallet(null)}>Disconnect</button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.6 }}>
                  Connect a WireFluid-compatible account to access your health records, issue prescriptions, and earn pharmacy credits.
                </p>
                <button
                  className={s.btn}
                  style={{ width: 'auto', padding: '9px 20px' }}
                  onClick={() => setWallet('0x' + Math.random().toString(16).slice(2, 42))}
                >
                  Connect Account (Demo)
                </button>
              </>
            )}
          </section>
        )}

        {activeTab === 'whatsapp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section className={s.card}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>💬 WhatsApp Bot</h3>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.6 }}>
                Pharmacists send <code style={{ fontFamily: 'var(--mono)', fontSize: 12, background: '#f0fdf4', padding: '1px 6px', borderRadius: 4, color: '#16a34a', border: '1px solid #86efac' }}>verify PK-XXXXXX</code> to get an instant prescription check — no app needed.
              </p>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 6 }}>BOT NUMBER (DEMO SANDBOX)</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: '#0f5b34', letterSpacing: 1 }}>{WHATSAPP_NUMBER}</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>Commands:</div>
                {[
                  ['verify PK-XXXXXX', 'Check if prescription is valid'],
                  ['fill PK-XXXXXX', 'Mark as dispensed (pharmacy)'],
                  ['refill PK-XXXXXX', 'Request a refill'],
                  ['emergency', 'Emergency access info'],
                  ['help', 'Show all commands'],
                ].map(([cmd, desc]) => (
                  <div key={cmd} style={{ display: 'flex', gap: 12, fontSize: 13, paddingBottom: 8, borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                    <code style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: '#16a34a', minWidth: 170, flexShrink: 0 }}>{cmd}</code>
                    <span style={{ color: 'var(--text-2)' }}>{desc}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={linkWhatsApp}
                style={{ background: '#25d366', color: 'white', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                💬 Open in WhatsApp
              </button>
            </section>

            <section className={s.card}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🧪 Try the Bot Right Now</h3>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>No phone needed — test the WhatsApp bot directly in the browser</p>
              <WhatsAppTester />
            </section>
          </div>
        )}

        {activeTab === 'network' && (
          <section className={s.card}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>⛓ WireFluid Network</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Network', 'WireFluid Testnet'],
                ['Chain ID', '1234'],
                ['RPC URL', 'https://rpc.wirefluid.com'],
                ['Explorer', 'explorer.wirefluid.com'],
                ['Currency', 'WF'],
                ['Status', '● Live'],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: k === 'Status' ? '#16a34a' : 'var(--text)', fontFamily: ['Chain ID', 'RPC URL'].includes(k) ? 'var(--mono)' : 'var(--font)' }}>{v}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'appearance' && (
          <section className={s.card}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🎨 Appearance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Dark Mode</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Switch to dark background</div>
                </div>
                <button
                  onClick={() => setDark(!dark)}
                  style={{ width: 44, height: 24, background: dark ? 'var(--green)' : 'var(--border)', borderRadius: 12, border: 'none', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <span style={{ position: 'absolute', top: 3, left: dark ? 22 : 3, width: 18, height: 18, background: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Language</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>App interface language</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['en', 'ur'].map(l => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      style={{ padding: '5px 12px', borderRadius: 6, border: `1.5px solid ${lang === l ? 'var(--green)' : 'var(--border)'}`, background: lang === l ? 'var(--green-faint)' : 'var(--bg)', color: lang === l ? 'var(--green-dark)' : 'var(--text-2)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                    >
                      {l === 'en' ? 'English' : 'اردو'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className={s.card} style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text)' }}>PrivyHealth Pakistan v1.0.0</strong><br />
            Entangled Hackathon 2026 · 10M PKR Prize Pool<br />
            Built on WireFluid Network · DRAP Compliant<br />
            <span style={{ color: 'var(--green)' }}>contact@privyhealth.pk</span>
          </div>
        </section>
      </div>
    </div>
  )
}
