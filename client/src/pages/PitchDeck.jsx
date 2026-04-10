import React, { useState, useEffect, useCallback } from 'react'

const SLIDES = [
  {
    id: 1,
    type: 'title',
  },
  {
    id: 2,
    type: 'problem',
  },
  {
    id: 3,
    type: 'solution',
  },
  {
    id: 4,
    type: 'how',
  },
  {
    id: 5,
    type: 'tiers',
  },
  {
    id: 6,
    type: 'traction',
  },
  {
    id: 7,
    type: 'market',
  },
  {
    id: 8,
    type: 'ask',
  },
]

function SlideTitle() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg, #0c4a3f 0%, #064e3b 40%, #022c22 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start',
      padding: '8vh 10vw', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '10%', right: '8%', width: '38vw', height: '38vw', borderRadius: '50%', background: 'rgba(22,163,74,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-5%', right: '20%', width: '22vw', height: '22vw', borderRadius: '50%', background: 'rgba(52,211,153,0.07)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '3vh' }}>
        <div style={{ width: '2.5vw', height: '2.5vw', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
        </div>
        <span style={{ fontSize: '1.3vw', fontWeight: 700, color: '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase' }}>PrivyHealth Pakistan</span>
      </div>

      <h1 style={{ fontSize: '5.5vw', fontWeight: 900, color: '#ffffff', lineHeight: 1.08, marginBottom: '2.5vh', letterSpacing: '-0.02em', maxWidth: '70%' }}>
        Prescription fraud.<br />
        <span style={{ color: '#10b981' }}>Eliminated.</span>
      </h1>

      <p style={{ fontSize: '1.6vw', color: 'rgba(255,255,255,0.72)', maxWidth: '55%', lineHeight: 1.6, marginBottom: '4vh' }}>
        Blockchain-verified prescriptions via 6-digit codes and WhatsApp — built for Pakistan's 230 million people and 100,000+ pharmacies.
      </p>

      <div style={{ display: 'flex', gap: '2vw', alignItems: 'center' }}>
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '100px', padding: '0.8vh 2vw' }}>
          <span style={{ fontSize: '1.2vw', color: '#10b981', fontWeight: 700 }}>Entangled Hackathon 2026</span>
        </div>
        <span style={{ fontSize: '1.2vw', color: 'rgba(255,255,255,0.45)' }}>10M PKR Prize Pool</span>
      </div>

      <div style={{ position: 'absolute', right: '8vw', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '2vh' }}>
        {[['6-digit', 'Prescription Code'], ['WhatsApp', 'Pharmacy Verify'], ['DRAP', 'Compliant'], ['230M+', 'Pakistanis']].map(([num, label]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1vw', padding: '1.5vh 2vw', textAlign: 'center', minWidth: '12vw' }}>
            <div style={{ fontSize: '1.8vw', fontWeight: 800, color: '#10b981' }}>{num}</div>
            <div style={{ fontSize: '0.9vw', color: 'rgba(255,255,255,0.5)', marginTop: '0.4vh' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideProblem() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#fafaf9',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '7vh 8vw', position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '0.5vw', height: '100%', background: '#dc2626' }} />

      <div style={{ fontSize: '1vw', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2vh' }}>
        The Problem
      </div>
      <h2 style={{ fontSize: '3.8vw', fontWeight: 900, color: '#111', lineHeight: 1.1, marginBottom: '4vh', letterSpacing: '-0.02em' }}>
        Pakistan's prescription system<br />is <span style={{ color: '#dc2626' }}>dangerously broken</span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2vw' }}>
        {[
          {
            stat: '95%',
            label: 'pharmacies have no qualified pharmacist',
            detail: 'Just shopkeepers dispensing antibiotics freely with zero verification',
            color: '#dc2626',
            bg: '#fef2f2',
            border: '#fca5a5',
          },
          {
            stat: 'XDR',
            label: 'typhoid crisis from antibiotic misuse',
            detail: "Pakistan declared a global health emergency — caused by freely dispensed antibiotics",
            color: '#d97706',
            bg: '#fffbeb',
            border: '#fcd34d',
          },
          {
            stat: '100k+',
            label: 'unlicensed medicine shops nationwide',
            detail: 'QR code solutions fail — most shopkeepers have basic Android phones, no scanner app',
            color: '#7c3aed',
            bg: '#f5f3ff',
            border: '#c4b5fd',
          },
        ].map(item => (
          <div key={item.stat} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: '1.2vw', padding: '3vh 2.5vw' }}>
            <div style={{ fontSize: '3.8vw', fontWeight: 900, color: item.color, lineHeight: 1, marginBottom: '1.5vh' }}>{item.stat}</div>
            <div style={{ fontSize: '1.3vw', fontWeight: 700, color: '#111', marginBottom: '1vh', lineHeight: 1.3 }}>{item.label}</div>
            <div style={{ fontSize: '1.1vw', color: '#555', lineHeight: 1.5 }}>{item.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideSolution() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, #064e3b 0%, #0c4a3f 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '7vh 8vw', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', bottom: '-8vh', right: '-5vw', width: '40vw', height: '40vw', borderRadius: '50%', background: 'rgba(16,185,129,0.06)', pointerEvents: 'none' }} />

      <div style={{ fontSize: '1vw', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2vh' }}>Our Solution</div>
      <h2 style={{ fontSize: '3.5vw', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '4vh', letterSpacing: '-0.02em', maxWidth: '65%' }}>
        Works on any phone. Even basic Android.<br />
        <span style={{ color: '#10b981' }}>No app download needed.</span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5vw', maxWidth: '85%' }}>
        {[
          {
            icon: '↗',
            title: '6-Digit Human-Readable Code',
            desc: 'PK-7X4M2K — patients say this at any pharmacy. No smartphone, no QR, no app required.',
          },
          {
            icon: '◎',
            title: 'WhatsApp-First Verification',
            desc: 'Pharmacist sends "verify PK-7X4M2K" → instant reply with full prescription details. Zero training needed.',
          },
          {
            icon: '◈',
            title: 'DRAP-Compliant Categories',
            desc: 'Schedule G, H, OTC, and Controlled Substances — automatically flagged and gated by pharmacy tier.',
          },
          {
            icon: '▲',
            title: 'Pharmacy Incentive Pyramid',
            desc: 'Basic → Verified → Premium. Pharmacies earn credits per verification — driven to comply.',
          },
        ].map(item => (
          <div key={item.title} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '1vw', padding: '2.5vh 2vw' }}>
            <div style={{ fontSize: '1.8vw', fontWeight: 900, color: '#10b981', marginBottom: '1vh', fontFamily: 'monospace' }}>{item.icon}</div>
            <div style={{ fontSize: '1.3vw', fontWeight: 700, color: '#fff', marginBottom: '0.8vh' }}>{item.title}</div>
            <div style={{ fontSize: '1.1vw', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideHow() {
  const steps = [
    { n: '01', actor: 'Doctor', action: 'Writes prescription on PrivyHealth', detail: 'Fills medicine, dosage, category — one TransactionPreview confirmation', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { n: '02', actor: 'System', action: 'Generates 6-digit code instantly', detail: 'PK-7X4M2K — secured on WireFluid, recorded with timestamp and doctor signature', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    { n: '03', actor: 'Patient', action: 'Shows code at pharmacy', detail: 'Says "Code hai PK-7X4M2K" or sends WhatsApp message — no paper slip needed', color: '#0f5b34', bg: '#f0fdf4', border: '#86efac' },
    { n: '04', actor: 'Pharmacist', action: 'Verifies in seconds', detail: 'Types or WhatsApps the code → full prescription details returned instantly', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  ]

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#f8f9fa',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '6vh 8vw',
    }}>
      <div style={{ fontSize: '1vw', fontWeight: 700, color: '#0f5b34', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.5vh' }}>How It Works</div>
      <h2 style={{ fontSize: '3vw', fontWeight: 900, color: '#111', lineHeight: 1.15, marginBottom: '4vh', letterSpacing: '-0.02em' }}>
        From prescription to pharmacy in <span style={{ color: '#0f5b34' }}>under 30 seconds</span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5vw', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '3.5vh', left: '5%', right: '5%', height: '2px', background: 'linear-gradient(90deg, #2563eb, #7c3aed, #0f5b34, #d97706)', zIndex: 0 }} />
        {steps.map(step => (
          <div key={step.n} style={{ background: step.bg, border: `1.5px solid ${step.border}`, borderRadius: '1.2vw', padding: '2.5vh 1.8vw', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '4vh', height: '4vh', background: step.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2vh' }}>
              <span style={{ fontSize: '1vw', fontWeight: 800, color: '#fff' }}>{step.n}</span>
            </div>
            <div style={{ fontSize: '1vw', fontWeight: 800, color: step.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.8vh' }}>{step.actor}</div>
            <div style={{ fontSize: '1.25vw', fontWeight: 700, color: '#111', marginBottom: '1vh', lineHeight: 1.3 }}>{step.action}</div>
            <div style={{ fontSize: '1.05vw', color: '#555', lineHeight: 1.5 }}>{step.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideTiers() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#fff',
      display: 'flex', padding: '6vh 8vw', gap: '6vw',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '1vw', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.5vh' }}>
          Pharmacy Incentives
        </div>
        <h2 style={{ fontSize: '3.2vw', fontWeight: 900, color: '#111', lineHeight: 1.1, marginBottom: '2vh', letterSpacing: '-0.02em' }}>
          The pyramid that makes<br />
          <span style={{ color: '#0f5b34' }}>pharmacies want to verify</span>
        </h2>
        <p style={{ fontSize: '1.3vw', color: '#555', lineHeight: 1.6, maxWidth: '90%' }}>
          Most systems try to force compliance. PrivyHealth makes pharmacies compete to be verified — because higher tiers mean more patients and higher-value prescriptions.
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2vh' }}>
        {[
          {
            tier: 'Premium',
            range: '500+ verifications',
            perks: ['Controlled substance prescriptions', 'Priority listing in directory', 'Patient referrals from app'],
            color: '#d97706',
            bg: '#fffbeb',
            border: '#fcd34d',
            badge: '⭐',
          },
          {
            tier: 'Verified',
            range: '100+ verifications',
            perks: ['Featured pharmacy listing', 'Patient referral traffic', 'Standard medicines unlocked'],
            color: '#2563eb',
            bg: '#eff6ff',
            border: '#bfdbfe',
            badge: '✓',
          },
          {
            tier: 'Basic',
            range: '0–99 verifications',
            perks: ['Standard listing', 'OTC and Schedule H only', 'Earns verification credits'],
            color: '#6b7280',
            bg: '#f9fafb',
            border: '#e5e7eb',
            badge: '◦',
          },
        ].map(tier => (
          <div key={tier.tier} style={{ background: tier.bg, border: `1.5px solid ${tier.border}`, borderRadius: '1vw', padding: '2vh 2vw', display: 'flex', gap: '1.5vw', alignItems: 'flex-start' }}>
            <div style={{ width: '3.5vh', height: '3.5vh', background: tier.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.2vh' }}>
              <span style={{ fontSize: '1.1vw', color: '#fff', fontWeight: 900 }}>{tier.badge}</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '0.5vh' }}>
                <span style={{ fontSize: '1.4vw', fontWeight: 800, color: tier.color }}>{tier.tier}</span>
                <span style={{ fontSize: '1vw', color: '#777', fontWeight: 600 }}>{tier.range}</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5vw', flexWrap: 'wrap' }}>
                {tier.perks.map(p => (
                  <span key={p} style={{ fontSize: '1vw', color: '#444' }}>• {p}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideTraction() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, #064e3b 0%, #065f46 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '7vh 8vw', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-5vh', right: '-5vw', width: '35vw', height: '35vw', borderRadius: '50%', background: 'rgba(16,185,129,0.08)', pointerEvents: 'none' }} />

      <div style={{ fontSize: '1vw', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.5vh' }}>
        Live Demo & Traction
      </div>
      <h2 style={{ fontSize: '3vw', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '4vh', letterSpacing: '-0.02em', maxWidth: '70%' }}>
        Fully working system.<br />
        <span style={{ color: '#10b981' }}>Try it right now.</span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2vw', marginBottom: '3vh' }}>
        {[
          { val: '3', label: 'Live Demo Prescriptions', sub: 'PK-7X4M2K · PK-9KRM4X · PK-2BX8NQ' },
          { val: '100%', label: 'WhatsApp Bot Functional', sub: 'verify / fill / refill / emergency — live' },
          { val: 'DRAP', label: 'Compliant Categories', sub: 'Schedule G, H, OTC, Controlled' },
        ].map(item => (
          <div key={item.val} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '1vw', padding: '2.5vh 2vw', textAlign: 'center' }}>
            <div style={{ fontSize: '3.2vw', fontWeight: 900, color: '#10b981', lineHeight: 1, marginBottom: '1vh' }}>{item.val}</div>
            <div style={{ fontSize: '1.2vw', fontWeight: 700, color: '#fff', marginBottom: '0.5vh' }}>{item.label}</div>
            <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.55)' }}>{item.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5vw' }}>
        {[
          'Doctor writes prescription',
          'Patient gets 6-digit code',
          'Pharmacist verifies on WhatsApp',
          'Dispensed — recorded on WireFluid',
        ].map((f, i) => (
          <div key={f} style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '0.8vw', padding: '1.5vh 1.5vw', display: 'flex', alignItems: 'flex-start', gap: '0.8vw' }}>
            <span style={{ fontSize: '1.2vw', fontWeight: 800, color: '#10b981', flexShrink: 0 }}>{i + 1}.</span>
            <span style={{ fontSize: '1.1vw', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideMarket() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#f8f9fa',
      display: 'flex', padding: '6vh 8vw', gap: '5vw',
    }}>
      <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '1vw', fontWeight: 700, color: '#0f5b34', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.5vh' }}>
          Market Opportunity
        </div>
        <h2 style={{ fontSize: '3.2vw', fontWeight: 900, color: '#111', lineHeight: 1.1, marginBottom: '3vh', letterSpacing: '-0.02em' }}>
          The largest unserved<br />
          <span style={{ color: '#0f5b34' }}>pharma market in Asia</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
          {[
            { label: 'Total Addressable Market', value: 'PKR 450B', sub: "Pakistan's pharmaceutical market size (2025)", color: '#0f5b34' },
            { label: 'Pharmacy Network', value: '100,000+', sub: 'Medicine shops — most undigitised', color: '#2563eb' },
            { label: 'Patient Population', value: '230M', sub: 'Potential users at full scale', color: '#7c3aed' },
            { label: 'DRAP Regulatory Alignment', value: 'Ready', sub: 'Schedule G/H enforcement mandate from 2026', color: '#d97706' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '2vw', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.8vw', padding: '1.5vh 2vw' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.05vw', color: '#777', marginBottom: '0.3vh' }}>{item.label}</div>
                <div style={{ fontSize: '1.1vw', color: '#555', lineHeight: 1.4 }}>{item.sub}</div>
              </div>
              <div style={{ fontSize: '2.2vw', fontWeight: 900, color: item.color, flexShrink: 0, textAlign: 'right' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 0.9, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '2vh' }}>
        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '1.2vw', padding: '3vh 2.5vw' }}>
          <div style={{ fontSize: '1vw', fontWeight: 700, color: '#777', marginBottom: '2vh', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Revenue Model</div>
          {[
            { model: 'Pharmacy SaaS', desc: 'PKR 999/month per verified pharmacy' },
            { model: 'Doctor Subscriptions', desc: 'Premium PMDC-verified tier — PKR 2,499/mo' },
            { model: 'Hospital API', desc: 'Per-API-call pricing for hospital EMR integration' },
            { model: 'DRAP Reporting', desc: 'Automated compliance reports for regulators' },
          ].map(item => (
            <div key={item.model} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.2vh 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '1.2vw', fontWeight: 700, color: '#111' }}>{item.model}</div>
              <div style={{ fontSize: '1.05vw', color: '#555', textAlign: 'right', maxWidth: '55%' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SlideAsk() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(140deg, #0c4a3f 0%, #064e3b 50%, #022c22 100%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      padding: '7vh 10vw', textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'rgba(16,185,129,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'rgba(16,185,129,0.06)', pointerEvents: 'none' }} />

      <div style={{ fontSize: '1vw', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2vh' }}>
        What We're Asking For
      </div>
      <h2 style={{ fontSize: '4.5vw', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '2vh', letterSpacing: '-0.02em' }}>
        Help us fix Pakistan's<br />
        <span style={{ color: '#10b981' }}>prescription crisis</span>
      </h2>
      <p style={{ fontSize: '1.5vw', color: 'rgba(255,255,255,0.65)', maxWidth: '65%', lineHeight: 1.6, marginBottom: '5vh' }}>
        We're seeking the 10M PKR prize to deploy to 1,000 pharmacies in Karachi, integrate with DRAP's registry, and onboard 100 PMDC-verified doctors onto the platform.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2vw', width: '100%', maxWidth: '75%', marginBottom: '4vh' }}>
        {[
          { goal: '1,000', label: 'pharmacies onboarded', detail: 'Karachi pilot in 90 days' },
          { goal: '100+', label: 'PMDC-verified doctors', detail: 'On platform at launch' },
          { goal: 'DRAP', label: 'formal integration', detail: 'Real-time compliance reporting' },
        ].map(item => (
          <div key={item.goal} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '1vw', padding: '2.5vh 2vw' }}>
            <div style={{ fontSize: '2.8vw', fontWeight: 900, color: '#10b981', lineHeight: 1, marginBottom: '1vh' }}>{item.goal}</div>
            <div style={{ fontSize: '1.2vw', fontWeight: 700, color: '#fff', marginBottom: '0.5vh' }}>{item.label}</div>
            <div style={{ fontSize: '1vw', color: 'rgba(255,255,255,0.55)' }}>{item.detail}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '1.3vw', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
        "Every unverified antibiotic sold without a prescription is a step toward the next epidemic."
      </div>
    </div>
  )
}

const SLIDE_COMPONENTS = {
  title: SlideTitle,
  problem: SlideProblem,
  solution: SlideSolution,
  how: SlideHow,
  tiers: SlideTiers,
  traction: SlideTraction,
  market: SlideMarket,
  ask: SlideAsk,
}

const SLIDE_LABELS = {
  title: 'Title',
  problem: 'Problem',
  solution: 'Solution',
  how: 'How It Works',
  tiers: 'Pharmacy Tiers',
  traction: 'Traction',
  market: 'Market',
  ask: 'Ask',
}

export default function PitchDeck() {
  const [current, setCurrent] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const prev = useCallback(() => setCurrent(c => Math.max(0, c - 1)), [])
  const next = useCallback(() => setCurrent(c => Math.min(SLIDES.length - 1, c + 1)), [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
      else if (e.key === 'f' || e.key === 'F') setFullscreen(f => !f)
      else if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  const slide = SLIDES[current]
  const SlideComponent = SLIDE_COMPONENTS[slide.type]

  if (fullscreen) return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <SlideComponent />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.8)', padding: '10px 24px', gap: 12 }}>
        <button onClick={prev} disabled={current === 0} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.4 : 1, fontSize: 13, fontWeight: 600 }}>
          ← Prev
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: 8, height: 8, borderRadius: '50%', background: i === current ? '#10b981' : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', padding: 0, transition: 'background 0.2s' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{current + 1}/{SLIDES.length}</span>
          <button onClick={() => setFullscreen(false)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Exit
          </button>
          <button onClick={next} disabled={current === SLIDES.length - 1} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: current === SLIDES.length - 1 ? 'not-allowed' : 'pointer', opacity: current === SLIDES.length - 1 ? 0.4 : 1, fontSize: 13, fontWeight: 600 }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '24px 24px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 20, marginBottom: 2 }}>PrivyHealth Pakistan — Pitch Deck</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Entangled Hackathon 2026 · 10M PKR Prize Pool · {SLIDES.length} slides</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Press F for fullscreen · Arrow keys to navigate</span>
          <button
            onClick={() => setFullscreen(true)}
            style={{ background: '#0c4a3f', color: '#10b981', border: '1.5px solid #10b981', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            Present
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${i === current ? '#10b981' : 'var(--border)'}`,
              background: i === current ? '#f0fdf4' : 'var(--card)',
              color: i === current ? '#0f5b34' : 'var(--text-2)',
              transition: 'all 0.15s',
            }}
          >
            {i + 1}. {SLIDE_LABELS[s.type]}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1.5px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <div style={{ aspectRatio: '16/9', position: 'relative' }}>
          <SlideComponent />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <button
          onClick={prev}
          disabled={current === 0}
          style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.45 : 1 }}
        >
          ← Previous
        </button>

        <div style={{ display: 'flex', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{ width: 10, height: 10, borderRadius: '50%', background: i === current ? '#0f5b34' : 'var(--border)', border: 'none', cursor: 'pointer', padding: 0, transition: 'background 0.2s' }}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={current === SLIDES.length - 1}
          style={{ background: current === SLIDES.length - 1 ? 'var(--card)' : '#0c4a3f', color: current === SLIDES.length - 1 ? 'var(--text-3)' : '#10b981', border: `1.5px solid ${current === SLIDES.length - 1 ? 'var(--border)' : '#10b981'}`, borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: current === SLIDES.length - 1 ? 'not-allowed' : 'pointer', opacity: current === SLIDES.length - 1 ? 0.45 : 1 }}
        >
          Next →
        </button>
      </div>

      <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
        Slide {current + 1} of {SLIDES.length} — {SLIDE_LABELS[slide.type]}
      </div>
    </div>
  )
}
