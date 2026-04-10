import React, { useState } from 'react'
import s from './Page.module.css'

const medicines = [
  { name: 'Augmentin 625mg (10 tabs)', brand: 'GlaxoSmithKline', price: 680, generic: 420, category: 'Antibiotic' },
  { name: 'Panadol Extra (20 tabs)', brand: 'GSK', price: 95, generic: 45, category: 'Analgesic' },
  { name: 'Metformin 500mg (60 tabs)', brand: 'Various', price: 180, generic: 120, category: 'Antidiabetic' },
  { name: 'Ciprofloxacin 500mg (10 tabs)', brand: 'Bayer', price: 290, generic: 160, category: 'Antibiotic' },
  { name: 'Brufen 400mg (20 tabs)', brand: 'Abbott', price: 120, generic: 65, category: 'NSAID' },
  { name: 'Nexium 20mg (14 tabs)', brand: 'AstraZeneca', price: 520, generic: 280, category: 'PPI' },
  { name: 'Amoxicillin 250mg (21 caps)', brand: 'Various', price: 145, generic: 80, category: 'Antibiotic' },
  { name: 'Insulin Actrapid (1 vial)', brand: 'Novo Nordisk', price: 890, generic: null, category: 'Insulin' },
]

export default function MedicinePrices() {
  const [q, setQ] = useState('')
  const filtered = medicines.filter(m => m.name.toLowerCase().includes(q.toLowerCase()) || m.category.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Medicine Prices</h1>
        <span className={s.badge} style={{ background: '#dbeafe', color: '#1d4ed8' }}>New</span>
      </div>
      <p className={s.desc}>DRAP-regulated maximum retail prices (MRP) in PKR. Updated monthly.</p>

      <input className={s.search} value={q} onChange={e => setQ(e.target.value)} placeholder="Search medicines..." />

      <div className={s.table}>
        <div className={s.thead}>
          <div style={{ flex: 2 }}>Medicine</div>
          <div>Category</div>
          <div>Brand MRP</div>
          <div>Generic</div>
          <div>Savings</div>
        </div>
        {filtered.map(m => (
          <div key={m.name} className={s.trow}>
            <div style={{ flex: 2 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.brand}</div>
            </div>
            <div><span className={s.catTag}>{m.category}</span></div>
            <div style={{ fontWeight: 600 }}>PKR {m.price}</div>
            <div style={{ color: 'var(--green)', fontWeight: 600 }}>{m.generic ? `PKR ${m.generic}` : '—'}</div>
            <div style={{ color: m.generic ? '#16a34a' : 'var(--text-3)', fontWeight: 600 }}>
              {m.generic ? `Save ${Math.round((1 - m.generic/m.price)*100)}%` : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
