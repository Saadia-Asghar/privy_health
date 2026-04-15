import React, { useEffect, useState, useCallback, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './HomePage.module.css'
import { api } from '../lib/api.js'
import { AppCtx } from '../App.jsx'

function WhoAreYou({ lang = 'en' }) {
  const navigate = useNavigate()

  const cards = [
    {
      icon: '👤',
      label: "I'm a Patient",
      desc: 'Encrypted records, prescriptions, and emergency card — owned by you.',
      time: '⏱ No signup wall for browsing',
      href: '/patient',
      className: '',
    },
    {
      icon: '🩺',
      label: "I'm a Doctor",
      desc: 'Issue tamper-proof prescriptions with PK codes. PMDC-ready workflow.',
      time: '⏱ PMDC license required',
      href: '/doctor/write',
      className: '',
    },
    {
      icon: '💊',
      label: "I'm a Pharmacist",
      desc: 'Verify by code or WhatsApp — stops forged scripts at the counter.',
      time: '⏱ Instant — no app install',
      href: '/pharmacy/verify',
      badge: 'Most Used',
      className: 'who-card-highlight',
    },
    {
      icon: '🚨',
      label: 'Emergency',
      desc: 'Scan QR for blood type & allergies — no wallet, no login.',
      time: '⚡ Built for ER & first responders',
      href: '/qr-scanner',
      className: 'who-card-emergency',
    },
  ]

  const go = useCallback(
    (href) => () => navigate(href),
    [navigate]
  )

  const onKey = (href) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate(href)
    }
  }

  return (
    <div className="who-are-you">
      <div className="who-title">{lang === 'ur' ? 'آپ کس مقصد کے لیے آئے ہیں؟' : 'What brings you here?'}</div>
      <p className="who-sub">
        {lang === 'ur'
          ? 'راستہ منتخب کریں — ججز اکثر فارمیسی ویریفائی یا پیشنٹ ڈیش بورڈ سے آغاز کرتے ہیں۔'
          : 'Pick a path — judges often start with Pharmacist (verify) or Patient (dashboard).'}
      </p>
      <div className="who-grid">
        {cards.map((card) => (
          <div
            key={card.label}
            role="button"
            tabIndex={0}
            className={`who-card ${card.className}`}
            onClick={go(card.href)}
            onKeyDown={onKey(card.href)}
          >
            {card.badge && <div className="who-badge">{card.badge}</div>}
            <div className="who-icon">{card.icon}</div>
            <div className="who-label">{card.label}</div>
            <div className="who-desc">{card.desc}</div>
            <div className="who-time">{card.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { lang } = useContext(AppCtx)
  const [overview, setOverview] = useState(null)
  const [statsState, setStatsState] = useState('loading')

  useEffect(() => {
    let cancelled = false
    fetch(api('/api/admin/overview'))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setOverview(data)
          setStatsState('live')
        } else if (!cancelled) {
          setStatsState('fallback')
        }
      })
      .catch(() => { if (!cancelled) setStatsState('fallback') })
    return () => {
      cancelled = true
    }
  }, [])

  const rxTotal = overview?.totalPrescriptions ?? 3
  const pharmTotal = overview?.totalPharmacies ?? 5
  const fillRate = overview?.fillRate ?? 0

  return (
    <div className={s.page}>
      <div className={s.hero}>
        <div className={s.trustStrip} aria-label="Trust signals">
          <span className={s.trustItem}>🔐 AES-256 at rest</span>
          <span className={s.trustDot}>·</span>
          <span className={s.trustItem}>⛓ WireFluid</span>
          <span className={s.trustDot}>·</span>
          <span className={s.trustItem}>🇵🇰 Pakistan-first</span>
          <span className={s.trustDot}>·</span>
          <span className={s.trustItem}>💬 WhatsApp verify</span>
        </div>

        <div className={s.hackBadge}>
          <span className={s.hackStar}>⭐</span>
          Entangled Hackathon 2026 · 10M PKR · WireFluid Network
        </div>

        <h1 className={s.headline}>
          {lang === 'ur' ? (
            <>
              <span className={s.headlineLine}>آپ کی صحت۔</span>
              <span className={s.headlineLine}>آپ کا ڈیٹا۔</span>
              <span className={s.headlineAccent}>اب واقعی آپ کا۔</span>
            </>
          ) : (
            <>
              <span className={s.headlineLine}>Your health.</span>
              <span className={s.headlineLine}>Your data.</span>
              <span className={s.headlineAccent}>Finally yours.</span>
            </>
          )}
        </h1>

        <p className={s.sub}>
          {lang === 'ur' ? (
            <>
              پاکستان کا پہلا <strong>patient-owned</strong>، encrypted medical record layer: on-chain شناخت، جعلی نسخوں سے تحفظ،
              WhatsApp ویریفکیشن، اور ایمرجنسی QR رسائی — سب ایک جگہ۔
            </>
          ) : (
            <>
              Pakistan’s first <strong>patient-owned</strong>, encrypted medical record layer: soulbound identity on-chain,
              prescriptions that can’t be forged, pharmacy verification over WhatsApp, and emergency QR access without a login.
              Built to ship — not slide-ware.
            </>
          )}
        </p>

        <div className={s.actions}>
          <button type="button" className={s.primaryBtn} onClick={() => navigate('/demo')}>
            {lang === 'ur' ? '▶ 2 منٹ کا interactive demo' : '▶ 2-minute interactive demo'}
          </button>
          <button type="button" className={s.secondaryBtn} onClick={() => navigate('/pharmacy/verify')}>
            Verify prescription code
          </button>
          <button type="button" className={s.ghostBtn} onClick={() => navigate('/pitch')}>
            Pitch deck
          </button>
        </div>

        <div className={s.liveStats} aria-live="polite">
          <div className={s.statCard}>
            <div className={s.statNum}>{rxTotal}</div>
            <div className={s.statLabel}>Prescriptions in demo network</div>
            <div className={s.statHint}>Live from your API · updates on refresh</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statNum}>{pharmTotal}</div>
            <div className={s.statLabel}>Verified pharmacy profiles</div>
            <div className={s.statHint}>Tiers &amp; verification counts</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statNum}>{fillRate}%</div>
            <div className={s.statLabel}>Simulated fill rate</div>
            <div className={s.statHint}>Audit-friendly dispense trail</div>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
          {statsState === 'live'
            ? 'Live API stats connected.'
            : statsState === 'loading'
              ? 'Checking live stats...'
              : 'Showing fallback stats (admin endpoint requires auth in strict mode).'}
        </div>

        <div className={s.features}>
          <div className={s.feat}>
            <div className={s.featNum}>PK-XXXXXX</div>
            <div className={s.featLabel}>6-digit prescription code</div>
          </div>
          <div className={s.featDiv} />
          <div className={s.feat}>
            <div className={s.featNum}>WhatsApp</div>
            <div className={s.featLabel}>Rural Sindh–ready</div>
          </div>
          <div className={s.featDiv} />
          <div className={s.feat}>
            <div className={s.featNum}>DRAP</div>
            <div className={s.featLabel}>Schedule G / H / OTC</div>
          </div>
          <div className={s.featDiv} />
          <div className={s.feat}>
            <div className={s.featNum}>230M+</div>
            <div className={s.featLabel}>People who deserve this</div>
          </div>
        </div>
      </div>

      <WhoAreYou lang={lang} />

      <div className={s.whatsappSection}>
        <div className={s.waContent}>
          <div className={s.waLeft}>
            <div className={s.waTitle}>Works on any phone — even WhatsApp.</div>
            <p className={s.waDesc}>
              Most counters are staffed by shopkeepers, not pharmacists. PrivyHealth meets them where they already are:
              a single message verifies authenticity before any medicine leaves the shelf.
            </p>
            <div className={s.waDemo}>
              <div className={s.waMsgOut}>verify PK-7X4M2K</div>
              <div className={s.waMsgIn}>
                ✅ VALID PRESCRIPTION<br />
                Augmentin 625mg · 2× daily · 5 days<br />
                Dr. Ahmed Khan (PMDC) ✓<br />
                Valid until: April 12, 2026<br />
                <em>Reply fill PK-7X4M2K to mark dispensed</em>
              </div>
            </div>
          </div>
          <div className={s.waRight}>
            <div className={s.waStats}>
              <div className={s.waStat}>
                <div className={s.waStatNum}>95%</div>
                <div className={s.waStatLabel}>pharmacies without a qualified pharmacist on site</div>
              </div>
              <div className={s.waStat}>
                <div className={s.waStatNum}>100k+</div>
                <div className={s.waStatLabel}>unlicensed medicine shops (est.)</div>
              </div>
              <div className={s.waStat}>
                <div className={s.waStatNum}>0</div>
                <div className={s.waStatLabel}>excuses for forged prescriptions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className={s.judgeFooter}>
        <p>
          <strong>Try it:</strong>{' '}
          <button type="button" className={s.inlineLink} onClick={() => navigate('/demo')}>Guided demo</button>, verify{' '}
          <code className={s.code}>PK-7X4M2K</code> on{' '}
          <button type="button" className={s.inlineLink} onClick={() => navigate('/pharmacy/verify')}>Pharmacy verify</button>, or open{' '}
          <button type="button" className={s.inlineLink} onClick={() => navigate('/settings')}>Settings → WhatsApp tester</button>.
        </p>
        <p className={s.disclaimer}>
          Educational prototype — not a medical device or regulated health product. No real patient data.
        </p>
      </footer>
    </div>
  )
}
