import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Page.module.css'
import { api } from '../lib/api.js'

const doctors = [
  { name: 'Dr. Ahmed Khan', specialty: 'General Physician', city: 'Karachi', pmdc: 'PMDC-12345', verified: true, rating: 4.8, available: true, fee: 1800, slots: ['morning', 'evening'], lat: 24.8607, lng: 67.0011 },
  { name: 'Dr. Sara Hussain', specialty: 'Cardiologist', city: 'Lahore', pmdc: 'PMDC-23456', verified: true, rating: 4.9, available: false, fee: 3500, slots: ['afternoon'], lat: 31.5204, lng: 74.3587 },
  { name: 'Dr. Bilal Raza', specialty: 'Dermatologist', city: 'Islamabad', pmdc: 'PMDC-34567', verified: true, rating: 4.7, available: true, fee: 2500, slots: ['morning', 'afternoon'], lat: 33.6844, lng: 73.0479 },
  { name: 'Dr. Fatima Sheikh', specialty: 'Gynecologist', city: 'Karachi', pmdc: 'PMDC-45678', verified: true, rating: 4.9, available: true, fee: 3000, slots: ['evening'], lat: 24.9036, lng: 67.1984 },
  { name: 'Dr. Usman Malik', specialty: 'Orthopedic Surgeon', city: 'Rawalpindi', pmdc: 'PMDC-56789', verified: true, rating: 4.6, available: false, fee: 2200, slots: ['afternoon', 'evening'], lat: 33.5651, lng: 73.0169 },
  { name: 'Dr. Amina Zahid', specialty: 'Pediatrician', city: 'Karachi', pmdc: 'PMDC-67890', verified: true, rating: 4.8, available: true, fee: 2000, slots: ['morning'], lat: 24.8752, lng: 67.0921 },
]

const cityCoords = {
  Karachi: { lat: 24.8607, lng: 67.0011 },
  Lahore: { lat: 31.5204, lng: 74.3587 },
  Islamabad: { lat: 33.6844, lng: 73.0479 },
  Rawalpindi: { lat: 33.5651, lng: 73.0169 },
  Peshawar: { lat: 34.0151, lng: 71.5249 },
  Quetta: { lat: 30.1798, lng: 66.975 },
}

function distanceKm(a, b) {
  if (!a || !b) return null
  const toRad = (v) => (v * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s1 = Math.sin(dLat / 2)
  const s2 = Math.sin(dLng / 2)
  const q = s1 * s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2 * s2
  return 2 * 6371 * Math.asin(Math.sqrt(q))
}

export default function DoctorDirectory() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [specialty, setSpecialty] = useState('Any')
  const [city, setCity] = useState('Any')
  const [timePref, setTimePref] = useState('any')
  const [maxFee, setMaxFee] = useState(4000)
  const [minRating, setMinRating] = useState(4.5)
  const [myPos, setMyPos] = useState(null)
  const [pharmacies, setPharmacies] = useState([])
  const [geoErr, setGeoErr] = useState('')
  const [bookingDoctor, setBookingDoctor] = useState(null)
  const [bookName, setBookName] = useState('')
  const [bookPhone, setBookPhone] = useState('')
  const [bookSlot, setBookSlot] = useState('morning')
  const [bookNote, setBookNote] = useState('')
  const [bookDone, setBookDone] = useState(null)
  const [bookingBusy, setBookingBusy] = useState(false)
  const [bookingErr, setBookingErr] = useState('')

  useEffect(() => {
    fetch(api('/api/pharmacies'))
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => setPharmacies(Array.isArray(rows) ? rows : []))
      .catch(() => setPharmacies([]))
  }, [])

  const refPoint = myPos || (city !== 'Any' ? cityCoords[city] : null)

  const filtered = useMemo(() => {
    const search = q.toLowerCase()
    return doctors
      .filter((d) => (
        d.name.toLowerCase().includes(search)
        || d.specialty.toLowerCase().includes(search)
        || d.city.toLowerCase().includes(search)
      ))
      .filter((d) => specialty === 'Any' || d.specialty === specialty)
      .filter((d) => city === 'Any' || d.city === city)
      .filter((d) => timePref === 'any' || d.slots.includes(timePref))
      .filter((d) => d.fee <= maxFee)
      .filter((d) => d.rating >= minRating)
      .map((d) => {
        const km = refPoint ? distanceKm(refPoint, { lat: d.lat, lng: d.lng }) : null
        return { ...d, km }
      })
      .sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1
        if (a.km != null && b.km != null) return a.km - b.km
        if (a.km != null) return -1
        if (b.km != null) return 1
        return b.rating - a.rating
      })
  }, [q, specialty, city, timePref, maxFee, minRating, refPoint])

  const pharmaciesNearby = useMemo(() => {
    return pharmacies
      .filter((p) => city === 'Any' || p.city === city)
      .map((p) => {
        const c = cityCoords[p.city]
        const km = refPoint && c ? distanceKm(refPoint, c) : null
        return { ...p, km }
      })
      .sort((a, b) => {
        if (a.km != null && b.km != null) return a.km - b.km
        return (b.verifications || 0) - (a.verifications || 0)
      })
      .slice(0, 6)
  }, [pharmacies, city, refPoint])

  const specialties = ['Any', ...Array.from(new Set(doctors.map((d) => d.specialty)))]
  const cities = ['Any', ...Array.from(new Set(doctors.map((d) => d.city)))]

  function useMyLocation() {
    setGeoErr('')
    if (!navigator.geolocation) {
      setGeoErr('Geolocation is not available on this device/browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoErr('Could not get your location. Choose a city filter instead.'),
      { timeout: 8000 }
    )
  }

  function openBooking(d) {
    setBookingDoctor(d)
    setBookName('')
    setBookPhone('')
    setBookSlot(d.slots?.[0] || 'morning')
    setBookNote('')
    setBookDone(null)
    setBookingErr('')
  }

  async function submitBooking(e) {
    e.preventDefault()
    if (!bookName.trim() || !bookPhone.trim()) return
    setBookingBusy(true)
    setBookingErr('')
    const reqBody = {
      doctorId: bookingDoctor?.pmdc,
      doctorName: bookingDoctor?.name,
      specialty: bookingDoctor?.specialty,
      city: bookingDoctor?.city,
      slot: bookSlot,
      patientName: bookName.trim(),
      phone: bookPhone.trim(),
      note: bookNote.trim(),
    }
    try {
      const res = await fetch(api('/api/appointments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not submit booking request')
      setBookDone({
        doctor: data.doctorName,
        specialty: data.specialty,
        city: data.city,
        slot: data.slot,
        patient: data.patientName,
        phone: data.phone,
        createdAt: data.createdAt,
      })
    } catch (err) {
      setBookingErr(err?.message || 'Booking failed')
    } finally {
      setBookingBusy(false)
    }
  }

  return (
    <div className={s.page}>
      <h1 className={s.title}>Doctor & Pharmacy Finder</h1>
      <p className={s.desc}>Set your preferences: doctor type, city, time, fee range, nearest options, and matching nearby pharmacies.</p>

      <div className={s.card} style={{ marginBottom: 14 }}>
        <div className={s.row}>
          <div className={s.field}>
            <label>Search</label>
            <input className={s.search} style={{ marginBottom: 0, maxWidth: '100%' }} value={q} onChange={e => setQ(e.target.value)} placeholder="Name, specialty, or city..." />
          </div>
          <div className={s.field}>
            <label>Specialty</label>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              {specialties.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
            </select>
          </div>
          <div className={s.field}>
            <label>City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={s.field}>
            <label>Preferred Time</label>
            <select value={timePref} onChange={(e) => setTimePref(e.target.value)}>
              <option value="any">Any</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>
          <div className={s.field}>
            <label>Max Fee (PKR): {maxFee}</label>
            <input type="range" min="1000" max="5000" step="100" value={maxFee} onChange={(e) => setMaxFee(Number(e.target.value))} />
          </div>
          <div className={s.field}>
            <label>Min Rating</label>
            <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
              {[4.0, 4.3, 4.5, 4.7].map((r) => <option key={r} value={r}>⭐ {r}+</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <button type="button" className={s.smBtn} onClick={useMyLocation}>Use My Location (nearest)</button>
          {myPos && <span style={{ fontSize: 12, color: '#166534' }}>Nearest mode enabled</span>}
          {geoErr && <span style={{ fontSize: 12, color: '#dc2626' }}>{geoErr}</span>}
        </div>
      </div>

      <div className={s.list}>
        {filtered.map(d => (
          <div key={d.pmdc} className={s.docCard}>
            <div className={s.docAvatar}>{d.name.split(' ').map(n => n[0]).slice(1,3).join('')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</span>
                {d.verified && <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 100 }}>✓ PMDC</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.specialty} · {d.city} · PKR {d.fee}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{d.pmdc} · ⭐ {d.rating} · {d.slots.join(', ')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: d.available ? '#16a34a' : 'var(--text-3)' }}>
                {d.available ? '● Available' : '○ Unavailable'}
              </span>
              {d.km != null && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{d.km.toFixed(1)} km away</span>}
              <button type="button" className={s.smBtn} onClick={() => navigate(d.available ? '/doctor/write' : '/patient')}>
                {d.available ? 'Request Rx' : 'Notify me'}
              </button>
              {d.available && (
                <button type="button" className={s.smBtn} onClick={() => openBooking(d)}>
                  Book now
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className={s.card} style={{ fontSize: 13, color: 'var(--text-2)' }}>
            No doctors match these preferences. Try increasing fee range or changing city/time filter.
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Nearby Pharmacies</h2>
        <div className={s.list}>
          {pharmaciesNearby.map((p) => (
            <div key={p.id} className={s.docCard}>
              <div className={s.docAvatar}>🏪</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{p.city} · {p.tier} · {p.verifications} verifications</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{p.drapLicense || 'DRAP pending'}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                {p.km != null && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{p.km.toFixed(1)} km away</span>}
                <button type="button" className={s.smBtn} onClick={() => navigate('/pharmacy/verify')}>
                  Verify at Pharmacy
                </button>
              </div>
            </div>
          ))}
          {pharmaciesNearby.length === 0 && (
            <div className={s.card} style={{ fontSize: 13, color: 'var(--text-2)' }}>
              No pharmacy matches yet for this city. Try another city or register a pharmacy.
            </div>
          )}
        </div>
      </div>

      {bookingDoctor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'grid', placeItems: 'center', zIndex: 2000, padding: 16 }}>
          <div className={s.card} style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Request Appointment Slot</h3>
              <button type="button" className={s.smBtn} onClick={() => setBookingDoctor(null)}>Close</button>
            </div>
            {!bookDone ? (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>
                  Booking with <strong>{bookingDoctor.name}</strong> ({bookingDoctor.specialty}, {bookingDoctor.city}) · Fee PKR {bookingDoctor.fee}
                </p>
                <form onSubmit={submitBooking}>
                  <div className={s.row}>
                    <div className={s.field}>
                      <label>Your Name</label>
                      <input value={bookName} onChange={(e) => setBookName(e.target.value)} required />
                    </div>
                    <div className={s.field}>
                      <label>Phone Number</label>
                      <input value={bookPhone} onChange={(e) => setBookPhone(e.target.value)} placeholder="+92..." required />
                    </div>
                    <div className={s.field}>
                      <label>Preferred Slot</label>
                      <select value={bookSlot} onChange={(e) => setBookSlot(e.target.value)}>
                        {bookingDoctor.slots.map((sl) => <option key={sl} value={sl}>{sl}</option>)}
                      </select>
                    </div>
                    <div className={`${s.field} ${s.fullField}`}>
                      <label>Reason / Notes (optional)</label>
                      <textarea value={bookNote} onChange={(e) => setBookNote(e.target.value)} rows={2} placeholder="Brief symptoms or reason..." />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" className={s.smBtn} onClick={() => setBookingDoctor(null)}>Cancel</button>
                    <button type="submit" className={s.btn} style={{ width: 'auto', padding: '9px 18px' }} disabled={bookingBusy}>
                      {bookingBusy ? 'Submitting...' : 'Confirm Request'}
                    </button>
                  </div>
                  {bookingErr && <div style={{ marginTop: 10, color: '#dc2626', fontSize: 12 }}>{bookingErr}</div>}
                </form>
              </>
            ) : (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, color: '#166534', marginBottom: 8 }}>✅ Slot request received</div>
                <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.7 }}>
                  Doctor: <strong>{bookDone.doctor}</strong><br />
                  Slot: <strong>{bookDone.slot}</strong><br />
                  Patient: <strong>{bookDone.patient}</strong><br />
                  ETA: within 15 minutes
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button type="button" className={s.smBtn} onClick={() => setBookingDoctor(null)}>Done</button>
                  <button type="button" className={s.smBtn} onClick={() => navigate('/doctor/write')}>Proceed to Write Rx</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
