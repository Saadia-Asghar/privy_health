import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Page.module.css'
import { AppCtx } from '../App.jsx'

export default function AboutPage() {
  const navigate = useNavigate()
  const { lang } = useContext(AppCtx)

  return (
    <div className={s.page}>
      <h1 className={s.title}>{lang === 'ur' ? 'PrivyHealth Pakistan کے بارے میں' : 'About PrivyHealth Pakistan'}</h1>
      <p className={s.desc}>
        {lang === 'ur'
          ? 'پاکستان کے لیے محفوظ نسخہ ویریفکیشن پلیٹ فارم — Entangled Hackathon 2026 کے لیے تیار کیا گیا۔'
          : "Secure prescription verification for Pakistan's 230 million people. Built for the Entangled Hackathon 2026."}
      </p>

      <div className={s.aboutGrid}>
        <div className={s.card}>
          <h3 style={{ marginBottom: 8, fontWeight: 700 }}>The Problem</h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
            95% of Pakistan's pharmacies operate without a qualified pharmacist. Antibiotics are sold freely,
            causing XDR typhoid outbreaks. QR codes require smartphones that most shopkeepers don't have.
            Existing digital prescription systems fail before they reach the counter.
          </p>
        </div>
        <div className={s.card}>
          <h3 style={{ marginBottom: 8, fontWeight: 700 }}>Our Solution</h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
            A 6-digit human-readable code (e.g. PK-7X4M2K) works on any phone. WhatsApp-first verification
            means pharmacists already have the tool they need. A pharmacy incentive tier system gives drug
            stores real reasons to verify — no blockchain knowledge required from anyone.
          </p>
        </div>
        <div className={s.card}>
          <h3 style={{ marginBottom: 8, fontWeight: 700 }}>Technology</h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
            Prescriptions are secured on the WireFluid network with AES-256 encryption.
            AI-powered drug interaction checking. DRAP-aligned medicine categories
            (Schedule G, H, OTC, Controlled). Emergency access via QR code for ER doctors.
          </p>
        </div>
        <div className={s.card}>
          <h3 style={{ marginBottom: 8, fontWeight: 700 }}>Entangled Hackathon 2026</h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
            Built for the Entangled Hackathon 2026 — 10M PKR Prize Pool. Targeting real-world impact
            in Pakistan's pharmaceutical system. DRAP compliance ready. WhatsApp integration live.
            Open to partnership with DRAP, NHSRC, and major pharmacy chains.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className={s.btn} style={{ width: 'auto', padding: '9px 20px' }} onClick={() => navigate('/demo')}>
          Try Interactive Demo
        </button>
        <button className={s.smBtn} onClick={() => navigate('/pitch')}>
          View Pitch Deck
        </button>
      </div>
    </div>
  )
}
