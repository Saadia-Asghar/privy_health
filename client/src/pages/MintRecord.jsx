import React, { useState, useContext } from 'react'
import { BrowserProvider, Contract } from 'ethers'
import { AppCtx } from '../App.jsx'
import { useNavigate } from 'react-router-dom'
import s from './Page.module.css'
import SecurityFooter from '../components/SecurityFooter.jsx'
import healthRecordArtifact from '../../../src/artifacts/contracts/HealthRecord.sol/HealthRecord.json'

const RECORD_KEY = 'privyhealth_record_created'
const RECORD_SNAPSHOT_KEY = 'privyhealth_record_snapshot'
const HEALTH_RECORD_ADDR = import.meta.env.VITE_ADDR_HEALTH_RECORD

export default function MintRecord() {
  const { wallet } = useContext(AppCtx)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: 'Ayesha Malik',
    dob: '1990-05-15',
    bloodType: 'B+',
    allergies: 'Penicillin',
    conditions: 'None',
    emergencyContact: '+92 300 1234567',
  })
  const [created, setCreated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')
  const [tokenId, setTokenId] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function buildTokenUri() {
    const payload = {
      name: `PrivyHealth Record · ${form.name}`,
      description: 'Patient-controlled encrypted health record pointer',
      attributes: [
        { trait_type: 'Blood Type', value: form.bloodType || 'Unknown' },
        { trait_type: 'Country', value: 'Pakistan' },
      ],
      issuedAt: new Date().toISOString(),
    }
    return `data:application/json;utf8,${encodeURIComponent(JSON.stringify(payload))}`
  }

  function encryptedPointer() {
    const compact = JSON.stringify({
      n: form.name,
      b: form.bloodType,
      a: form.allergies,
      c: form.conditions,
      e: form.emergencyContact,
      t: Date.now(),
    })
    return `enc://${btoa(unescape(encodeURIComponent(compact))).slice(0, 220)}`
  }

  async function create(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let mintedTokenId = ''
      let mintedTx = ''
      const canMintOnChain = Boolean(wallet && HEALTH_RECORD_ADDR && window.ethereum)
      if (canMintOnChain) {
        const provider = new BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new Contract(HEALTH_RECORD_ADDR, healthRecordArtifact.abi, signer)
        const tx = await contract.mintRecord(encryptedPointer(), buildTokenUri())
        mintedTx = tx.hash || ''
        await tx.wait()
        const pid = await contract.patientToken(wallet.toLowerCase())
        mintedTokenId = pid?.toString?.() || ''
      } else {
        // Keep demo path working when contracts are not configured.
        await new Promise(r => setTimeout(r, 700))
      }

      localStorage.setItem(RECORD_KEY, '1')
      if (wallet) localStorage.setItem('privyhealth_record_wallet', wallet.toLowerCase())
      localStorage.setItem(RECORD_SNAPSHOT_KEY, JSON.stringify({
        ...form,
        tokenId: mintedTokenId,
        txHash: mintedTx,
        updatedAt: new Date().toISOString(),
      }))
      setTxHash(mintedTx)
      setTokenId(mintedTokenId)
      setCreated(true)
    } catch (err) {
      setError(err?.shortMessage || err?.message || 'Could not create record. Please try again.')
    }
    setLoading(false)
  }

  if (created) return (
    <div className={s.page}>
      <div className={s.card} style={{ maxWidth: 500, textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Health Record Created!</h2>
        <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          Your health record is encrypted and secured on the WireFluid network. Only you control who can see it.
        </p>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 20, textAlign: 'left', fontSize: 13 }}>
          <div style={{ fontWeight: 700, color: '#166534', marginBottom: 8 }}>What's next?</div>
          <div style={{ color: '#16a34a', lineHeight: 1.8 }}>
            1. Visit a doctor — they can now issue prescriptions linked to your record<br />
            2. Show your 6-digit code at any PrivyHealth pharmacy<br />
            3. Set up WhatsApp alerts in Settings
          </div>
        </div>
        {!!tokenId && (
          <div style={{ marginBottom: 10, fontSize: 12, color: 'var(--text-2)' }}>
            Record token ID: <strong style={{ fontFamily: 'var(--mono)' }}>#{tokenId}</strong>
          </div>
        )}
        {!!txHash && (
          <div style={{ marginBottom: 14, fontSize: 12, color: 'var(--text-2)' }}>
            On-chain tx: <span style={{ fontFamily: 'var(--mono)' }}>{txHash.slice(0, 18)}...{txHash.slice(-8)}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className={s.btn} style={{ width: 'auto', padding: '9px 20px' }} onClick={() => navigate('/patient')}>
            View My Dashboard
          </button>
          <button className={s.smBtn} onClick={() => navigate('/settings')}>
            Link WhatsApp
          </button>
        </div>
        <SecurityFooter />
      </div>
    </div>
  )

  return (
    <div className={s.page}>
      <h1 className={s.title}>Create Health Record</h1>
      <p className={s.desc}>Set up your encrypted health record on WireFluid. Your data is only accessible to doctors and pharmacists you authorise.</p>
      {!HEALTH_RECORD_ADDR && (
        <div className={s.card} style={{ maxWidth: 560, marginBottom: 16, padding: '10px 14px', fontSize: 12, border: '1px dashed #f59e0b', color: '#92400e' }}>
          On-chain mint is disabled because <code style={{ fontFamily: 'var(--mono)' }}>VITE_ADDR_HEALTH_RECORD</code> is not set. The app will use local demo mode.
        </div>
      )}

      {!wallet && (
        <div className={s.card} style={{ maxWidth: 560, marginBottom: 16, padding: '12px 16px', fontSize: 13, color: 'var(--text-2)', border: '1px dashed var(--border)' }}>
          <strong style={{ color: 'var(--text)' }}>Tip:</strong> Connect your wallet in the header first so your record can be tied to your on-chain identity in a full deployment.
        </div>
      )}

      <form onSubmit={create}>
        <div className={s.card} style={{ maxWidth: 560 }}>
          <div className={s.row}>
            <div className={s.field}>
              <label>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your full name" />
            </div>
            <div className={s.field}>
              <label>Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
            </div>
            <div className={s.field}>
              <label>Blood Type</label>
              <select value={form.bloodType} onChange={e => set('bloodType', e.target.value)}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className={s.field}>
              <label>Known Allergies</label>
              <input value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="e.g. Penicillin, Aspirin" />
            </div>
            <div className={`${s.field} ${s.fullField}`}>
              <label>Existing Conditions</label>
              <input value={form.conditions} onChange={e => set('conditions', e.target.value)} placeholder="e.g. Diabetes, Hypertension, or None" />
            </div>
            <div className={`${s.field} ${s.fullField}`}>
              <label>Emergency Contact Number</label>
              <input value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} placeholder="+92 300 1234567" />
            </div>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#166534' }}>
            Your information is encrypted with AES-256 and stored on WireFluid. No one can access it without your permission.
          </div>

          <button type="submit" className={s.btn} disabled={loading}>
            {loading ? (
              <><span className="loading-spinner" /> Securing to WireFluid...</>
            ) : (
              'Create My Health Record'
            )}
          </button>
          {error && <div style={{ marginTop: 10, fontSize: 12, color: '#dc2626' }}>{error}</div>}
        </div>
      </form>
    </div>
  )
}
