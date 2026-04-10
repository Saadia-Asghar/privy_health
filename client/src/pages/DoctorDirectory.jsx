import React, { useState } from 'react'
import s from './Page.module.css'

const doctors = [
  { name: 'Dr. Ahmed Khan', specialty: 'General Physician', city: 'Karachi', pmdc: 'PMDC-12345', verified: true, rating: 4.8, available: true },
  { name: 'Dr. Sara Hussain', specialty: 'Cardiologist', city: 'Lahore', pmdc: 'PMDC-23456', verified: true, rating: 4.9, available: false },
  { name: 'Dr. Bilal Raza', specialty: 'Dermatologist', city: 'Islamabad', pmdc: 'PMDC-34567', verified: true, rating: 4.7, available: true },
  { name: 'Dr. Fatima Sheikh', specialty: 'Gynecologist', city: 'Karachi', pmdc: 'PMDC-45678', verified: true, rating: 4.9, available: true },
  { name: 'Dr. Usman Malik', specialty: 'Orthopedic Surgeon', city: 'Rawalpindi', pmdc: 'PMDC-56789', verified: true, rating: 4.6, available: false },
]

export default function DoctorDirectory() {
  const [q, setQ] = useState('')
  const filtered = doctors.filter(d => d.name.toLowerCase().includes(q.toLowerCase()) || d.specialty.toLowerCase().includes(q.toLowerCase()) || d.city.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className={s.page}>
      <h1 className={s.title}>Doctor Directory</h1>
      <p className={s.desc}>PMDC-verified doctors on PrivyHealth Pakistan. Issue WireFluid-verified prescriptions patients can use at any pharmacy.</p>

      <input className={s.search} value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, specialty, or city..." />

      <div className={s.list}>
        {filtered.map(d => (
          <div key={d.pmdc} className={s.docCard}>
            <div className={s.docAvatar}>{d.name.split(' ').map(n => n[0]).slice(1,3).join('')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</span>
                {d.verified && <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 100 }}>✓ PMDC</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.specialty} · {d.city}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{d.pmdc} · ⭐ {d.rating}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: d.available ? '#16a34a' : 'var(--text-3)' }}>
                {d.available ? '● Available' : '○ Unavailable'}
              </span>
              <button className={s.smBtn}>Book</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
