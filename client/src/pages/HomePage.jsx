import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppCtx } from '../App.jsx'
import s from './HomePage.module.css'

function WhoAreYou() {
  const navigate = useNavigate()
  const cards = [
    {
      icon: '👤',
      label: "I'm a Patient",
      desc: 'View my prescriptions and health records',
      time: '⏱ No registration needed',
      href: '/patient',
      className: '',
    },
    {
      icon: '🩺',
      label: "I'm a Doctor",
      desc: 'Write prescriptions and access patient records',
      time: '⏱ PMDC license required',
      href: '/doctor/write',
      className: '',
    },
    {
      icon: '💊',
      label: "I'm a Pharmacist",
      desc: 'Verify a prescription right now — no registration',
      time: '⏱ Instant — enter code or WhatsApp',
      href: '/pharmacy/verify',
      badge: 'Most Used',
      className: 'who-card-highlight',
    },
    {
      icon: '🚨',
      label: 'Emergency',
      desc: 'Scan patient QR for blood type and allergies instantly',
      time: '⚡ No login required',
      href: '/qr-scanner',
      className: 'who-card-emergency',
    },
  ]

  return (
    <div className="who-are-you">
      <div className="who-title">What brings you here?</div>
      <div className="who-grid">
        {cards.map(card => (
          <div
            key={card.label}
            className={`who-card ${card.className}`}
            onClick={() => navigate(card.href)}
            style={{ cursor: 'pointer' }}
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
  const { wallet, setWallet } = useContext(AppCtx)
  const navigate = useNavigate()

  return (
    <div className={s.page}>
      <div className={s.hero}>
        <div className={s.hackBadge}>
          <span className={s.hackStar}>⭐</span>
          Entangled Hackathon 2026 · 10M PKR Prize Pool
        </div>

        <h1 className={s.headline}>
          Pakistan's health data<br />
          is <span className={s.struck}>scattered.</span><br />
          <span className={s.private}>Private.</span>
        </h1>

        <p className={s.sub}>
          Your medical records, encrypted and owned by you. Doctors you trust.
          Prescriptions that can't be forged. Emergency access that saves lives.
          All on WireFluid.
        </p>

        <div className={s.actions}>
          <button className={s.primaryBtn} onClick={() => navigate('/patient')}>
            View My Records
          </button>
          <button className={s.secondaryBtn} onClick={() => navigate('/drug-checker')}>
            Check Drug Interactions
          </button>
        </div>

        <div className={s.features}>
          <div className={s.feat}>
            <div className={s.featNum}>6-digit</div>
            <div className={s.featLabel}>Prescription Code</div>
          </div>
          <div className={s.featDiv} />
          <div className={s.feat}>
            <div className={s.featNum}>WhatsApp</div>
            <div className={s.featLabel}>Pharmacy Verify</div>
          </div>
          <div className={s.featDiv} />
          <div className={s.feat}>
            <div className={s.featNum}>DRAP</div>
            <div className={s.featLabel}>Compliant</div>
          </div>
          <div className={s.featDiv} />
          <div className={s.feat}>
            <div className={s.featNum}>230M+</div>
            <div className={s.featLabel}>Pakistanis Served</div>
          </div>
        </div>
      </div>

      <WhoAreYou />

      <div className={s.whatsappSection}>
        <div className={s.waContent}>
          <div className={s.waLeft}>
            <div className={s.waTitle}>Works on any phone. Even WhatsApp.</div>
            <p className={s.waDesc}>
              95% of Pakistani pharmacies have no qualified pharmacist — just shopkeepers.
              PrivyHealth works with a simple WhatsApp message:
            </p>
            <div className={s.waDemo}>
              <div className={s.waMsgOut}>verify PK-7X4M2K</div>
              <div className={s.waMsgIn}>
                ✅ VALID PRESCRIPTION<br />
                Augmentin 625mg · 2x daily · 5 days<br />
                Dr. Ahmed Khan (PMDC-12345) ✓<br />
                Valid until: April 12, 2026<br />
                <em>Reply 'fill PK-7X4M2K' to mark as dispensed</em>
              </div>
            </div>
          </div>
          <div className={s.waRight}>
            <div className={s.waStats}>
              <div className={s.waStat}>
                <div className={s.waStatNum}>95%</div>
                <div className={s.waStatLabel}>pharmacies without qualified staff</div>
              </div>
              <div className={s.waStat}>
                <div className={s.waStatNum}>100k+</div>
                <div className={s.waStatLabel}>unlicensed medicine shops</div>
              </div>
              <div className={s.waStat}>
                <div className={s.waStatNum}>XDR</div>
                <div className={s.waStatLabel}>typhoid from unverified antibiotics</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
