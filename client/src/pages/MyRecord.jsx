import React, { useContext, useEffect, useState } from 'react'
import { BrowserProvider, Contract } from 'ethers'
import { AppCtx } from '../App.jsx'
import { useNavigate } from 'react-router-dom'
import s from './Page.module.css'
import SecurityFooter from '../components/SecurityFooter.jsx'
import healthRecordArtifact from '../../../src/artifacts/contracts/HealthRecord.sol/HealthRecord.json'

const RECORD_SNAPSHOT_KEY = 'privyhealth_record_snapshot'
const HEALTH_RECORD_ADDR = import.meta.env.VITE_ADDR_HEALTH_RECORD

export default function MyRecord() {
  const { wallet } = useContext(AppCtx)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(Boolean(wallet))
  const [record, setRecord] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (!wallet) return undefined

    async function load() {
      setLoading(true)
      setError('')
      try {
        const snapshot = JSON.parse(localStorage.getItem(RECORD_SNAPSHOT_KEY) || 'null')
        let chainData = null

        if (HEALTH_RECORD_ADDR && window.ethereum) {
          const provider = new BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          const contract = new Contract(HEALTH_RECORD_ADDR, healthRecordArtifact.abi, signer)
          const tokenIdBn = await contract.patientToken(wallet.toLowerCase())
          const tokenId = tokenIdBn?.toString?.() || '0'
          if (tokenId !== '0') {
            const tokenUri = await contract.tokenURI(tokenIdBn)
            const encryptedCID = await contract.getEncryptedCID(tokenIdBn)
            let tokenMeta = {}
            if (String(tokenUri || '').startsWith('data:application/json;utf8,')) {
              tokenMeta = JSON.parse(decodeURIComponent(tokenUri.replace('data:application/json;utf8,', '')))
            }
            chainData = { tokenId, tokenUri, encryptedCID, tokenMeta }
          }
        }

        const next = {
          name: snapshot?.name || 'Not provided',
          bloodType: snapshot?.bloodType || 'Unknown',
          allergies: snapshot?.allergies || 'None',
          conditions: snapshot?.conditions || 'None',
          emergencyContact: snapshot?.emergencyContact || 'Not set',
          recordId: chainData?.tokenId ? `#PHR-${chainData.tokenId}` : '#LOCAL-DEMO',
          tokenId: chainData?.tokenId || snapshot?.tokenId || '',
          encryptedCID: chainData?.encryptedCID || '',
          updatedAt: snapshot?.updatedAt || null,
          onChain: Boolean(chainData?.tokenId),
          hasRecord: Boolean(chainData?.tokenId || snapshot),
        }
        if (chainData?.tokenMeta?.attributes) {
          const bt = chainData.tokenMeta.attributes.find((a) => a?.trait_type === 'Blood Type')?.value
          if (bt) next.bloodType = bt
        }
        if (active) setRecord(next)
      } catch (err) {
        if (active) setError(err?.shortMessage || err?.message || 'Could not load record')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [wallet])

  if (!wallet) return (
    <div className={s.page}>
      <h1 className={s.title}>My Health Record</h1>
      <div className={s.card} style={{ maxWidth: 400, textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Record Not Set Up</h3>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.6 }}>
          Create your health record to store your medical info securely and receive digital prescriptions from doctors.
        </p>
        <button className={s.btn} onClick={() => navigate('/patient/mint')}>
          Create Health Record
        </button>
      </div>
    </div>
  )

  return (
    <div className={s.page}>
      <h1 className={s.title}>My Health Record</h1>
      <p className={s.desc}>
        Secured on WireFluid · Encrypted · Account: {wallet.slice(0, 10)}...
      </p>
      {loading && <div className={s.card} style={{ maxWidth: 560, marginBottom: 14, fontSize: 13 }}>Loading on-chain record...</div>}
      {!HEALTH_RECORD_ADDR && (
        <div className={s.card} style={{ maxWidth: 560, marginBottom: 14, fontSize: 12, border: '1px dashed #f59e0b', color: '#92400e' }}>
          Contract address missing: set <code style={{ fontFamily: 'var(--mono)' }}>VITE_ADDR_HEALTH_RECORD</code> to read live chain records.
        </div>
      )}
      {error && <div className={s.card} style={{ maxWidth: 560, marginBottom: 14, fontSize: 12, color: '#dc2626' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 560 }}>
        {[
          { label: 'Name', value: record?.name || 'Ayesha Malik' },
          { label: 'Blood Type', value: record?.bloodType || 'B+' },
          { label: 'Known Allergies', value: record?.allergies || 'Penicillin' },
          { label: 'Conditions', value: record?.conditions || 'None' },
          { label: 'Emergency Contact', value: record?.emergencyContact || '+92 300 1234567' },
          { label: 'Record ID', value: record?.recordId || '#PKH-001-2026' },
        ].map(r => (
          <div key={r.label} className={s.card} style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              {r.label}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{r.value}</div>
          </div>
        ))}
      </div>
      {!loading && record && !record.hasRecord && (
        <div className={s.card} style={{ marginTop: 14, maxWidth: 560, textAlign: 'center' }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>📝</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>No record minted yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10 }}>
            Create your health record first to enable encrypted on-chain access control.
          </div>
          <button className={s.btn} style={{ width: 'auto', padding: '8px 16px', margin: '0 auto' }} onClick={() => navigate('/patient/mint')}>
            Create Health Record
          </button>
        </div>
      )}
      {record?.onChain && (
        <div className={s.card} style={{ marginTop: 14, maxWidth: 560, fontSize: 12, color: 'var(--text-2)' }}>
          On-chain status: <strong style={{ color: '#166534' }}>Live</strong>
          {record.encryptedCID && (
            <div style={{ marginTop: 6 }}>
              Encrypted pointer: <code style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{record.encryptedCID.slice(0, 36)}...</code>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className={s.smBtn} onClick={() => navigate('/patient')}>My Prescriptions</button>
        <button className={s.smBtn} onClick={() => navigate('/settings')}>Link WhatsApp</button>
      </div>

      <SecurityFooter />
    </div>
  )
}
