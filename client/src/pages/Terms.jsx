import React from 'react'
import s from './Page.module.css'
import { marketingUrl, supportEmail } from '../lib/publicSite.js'

export default function Terms() {
  const mkt = marketingUrl()
  const email = supportEmail()
  const updated = '2026-04-14'

  return (
    <div className={s.page}>
      <h1 className={s.title}>Terms of Service</h1>
      <p className={s.desc}>
        These Terms govern your use of PrivyHealth Pakistan (the “Service”). This is a demo/prototype and may be reset at any time.
        Last updated: {updated}.
      </p>

      <div className={s.card} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <section>
          <h3 style={{ margin: '0 0 6px', fontWeight: 800 }}>Demo-only use</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
            The Service is for demonstration and evaluation. <strong>Do not enter real patient health data.</strong> You are responsible for
            ensuring any use complies with applicable Pakistani laws, regulations, and professional standards.
          </p>
        </section>

        <section>
          <h3 style={{ margin: '10px 0 6px', fontWeight: 800 }}>No medical advice</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
            The Service does not provide medical advice, diagnosis, or treatment recommendations. Any AI outputs are informational only and can
            be incorrect.
          </p>
        </section>

        <section>
          <h3 style={{ margin: '10px 0 6px', fontWeight: 800 }}>Availability and data retention</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
            The Service may be unavailable, rate-limited, or reset (including after cold starts). We do not guarantee persistence unless
            explicitly configured with a durable database.
          </p>
        </section>

        <section>
          <h3 style={{ margin: '10px 0 6px', fontWeight: 800 }}>Acceptable use</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
            <li>No scraping, denial-of-service, or abuse of the API.</li>
            <li>No attempts to access data without authorization.</li>
            <li>No use of the Service for illegal activity.</li>
          </ul>
        </section>

        <section>
          <h3 style={{ margin: '10px 0 6px', fontWeight: 800 }}>Contact</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
            Support: <strong>{email}</strong>. More info: <a href={mkt} target="_blank" rel="noreferrer">{mkt}</a>.
          </p>
        </section>
      </div>
    </div>
  )
}

