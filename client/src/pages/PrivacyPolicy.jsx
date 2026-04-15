import React from 'react'
import s from './Page.module.css'
import { marketingUrl, supportEmail } from '../lib/publicSite.js'

export default function PrivacyPolicy() {
  const mkt = marketingUrl()
  const email = supportEmail()
  const updated = '2026-04-14'

  return (
    <div className={s.page}>
      <h1 className={s.title}>Privacy Policy</h1>
      <p className={s.desc}>
        This Privacy Policy explains how PrivyHealth Pakistan (the “Service”) handles data. This project is a demo/prototype and is not a
        substitute for clinical systems. Last updated: {updated}.
      </p>

      <div className={s.card} style={{ marginBottom: 14 }}>
        <h3 style={{ marginTop: 0, marginBottom: 8, fontWeight: 800 }}>Pakistan health-data positioning</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
          We design for Pakistan contexts (pharmacies, WhatsApp workflows, DRAP-aligned categories). You should treat any “health record”
          features in this demo as <strong>non-clinical</strong> and <strong>non-authoritative</strong>. Do not enter real patient health
          information in demo mode.
        </p>
      </div>

      <div className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <section>
          <h3 style={{ margin: '0 0 6px', fontWeight: 800 }}>Data we may process</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
            <li><strong>Account data</strong>: email + role (admin/doctor/pharmacy) for login.</li>
            <li><strong>Operational data</strong>: rate-limit counters and basic request metadata.</li>
            <li><strong>Audit logs</strong>: actions like prescription create/fill with timestamp, IP, and user agent.</li>
            <li><strong>Demo prescription data</strong>: synthetic data used for demonstrations.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ margin: '10px 0 6px', fontWeight: 800 }}>How we use data</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
            <li>Authenticate users and enforce role-based access.</li>
            <li>Prevent abuse (rate limits) and support incident review (audit logs).</li>
            <li>Operate the demo experience and improve reliability.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ margin: '10px 0 6px', fontWeight: 800 }}>Where data is stored</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
            In local development, demo data may be stored on your machine. In hosted demos, serverless environments may store data temporarily
            and may reset after cold starts. For production-grade deployments, use a durable database and a formal compliance program.
          </p>
        </section>

        <section>
          <h3 style={{ margin: '10px 0 6px', fontWeight: 800 }}>Sharing</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
            We do not sell personal data. Service providers (hosting, email, messaging) may process limited data to deliver the Service.
          </p>
        </section>

        <section>
          <h3 style={{ margin: '10px 0 6px', fontWeight: 800 }}>Contact</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
            Questions? Contact <strong>{email}</strong>. For general information, see <a href={mkt} target="_blank" rel="noreferrer">{mkt}</a>.
          </p>
        </section>
      </div>
    </div>
  )
}

