import React from 'react'

export default function TransactionPreview({ action, details, onConfirm, onCancel }) {
  const previews = {
    issuePrescription: {
      title: 'Sign & Send Prescription',
      icon: '💊',
      what: `A signed prescription for ${details?.medicine || 'the medicine'} will be sent to the patient.`,
      result: [
        `Patient receives code: ${details?.code || 'PK-XXXXXX'}`,
        'Prescription is locked — cannot be altered',
        'Any pharmacy can verify with the code instantly',
      ],
      cost: 'Small network fee (~0.001 WF)',
      time: 'About 5-10 seconds',
      canUndo: false,
    },
    createRecord: {
      title: 'Create Your Health Record',
      icon: '🏥',
      what: 'Your health information will be encrypted and saved on the WireFluid secure network.',
      result: [
        'Your record is encrypted before leaving your device',
        'Only you control who can view it',
        "You'll get a unique Record ID",
      ],
      cost: 'Small network fee (~0.001 WF)',
      time: 'About 10-30 seconds',
      canUndo: false,
    },
    grantAccess: {
      title: `Allow ${details?.doctorName || 'Doctor'} to View Your Record`,
      icon: '🔑',
      what: `Dr. ${details?.doctorName || 'the doctor'} will be able to view your health records during your consultation.`,
      result: [
        `${details?.doctorName || 'The doctor'} can read your record`,
        'You can remove their access anytime',
        'Every access is permanently logged',
      ],
      cost: 'Small network fee',
      time: 'About 10 seconds',
      canUndo: true,
    },
    setEmergencyCard: {
      title: 'Save Emergency Medical Card',
      icon: '🚨',
      what: 'Your emergency info (blood type, allergies) will be saved. Emergency doctors can access it instantly — no login needed.',
      result: [
        'Blood type and allergies saved securely',
        'ER doctors can scan your QR to access instantly',
        'You can update this anytime',
      ],
      cost: 'Small network fee',
      time: 'About 10 seconds',
      canUndo: true,
    },
  }

  const preview = previews[action] || {
    title: 'Confirm Action',
    icon: '⚡',
    what: 'This action will be saved permanently on the WireFluid network.',
    result: ['Action saved on WireFluid secure network'],
    cost: 'Small network fee',
    time: 'About 10-30 seconds',
    canUndo: false,
  }

  return (
    <div className="tx-preview-overlay" onClick={onCancel}>
      <div className="tx-preview-modal" onClick={e => e.stopPropagation()}>
        <div className="tx-preview-header">
          <span className="tx-preview-icon">{preview.icon}</span>
          <div>
            <h3>{preview.title}</h3>
            <p className="tx-preview-subtitle">Review before confirming</p>
          </div>
        </div>

        <p className="tx-what">{preview.what}</p>

        <div className="tx-results">
          <div className="tx-results-label">What will happen:</div>
          {preview.result.map((r, i) => (
            <div key={i} className="tx-result-item">
              <span className="tx-check">✓</span>
              <span>{r}</span>
            </div>
          ))}
        </div>

        <div className="tx-meta">
          <div className="tx-meta-item">
            <span className="tx-meta-icon">⏱</span>
            <span>{preview.time}</span>
          </div>
          <div className="tx-meta-item">
            <span className="tx-meta-icon">💰</span>
            <span>{preview.cost}</span>
          </div>
          {!preview.canUndo && (
            <div className="tx-meta-item tx-permanent">
              <span className="tx-meta-icon">🔒</span>
              <span>Permanent — cannot be reversed</span>
            </div>
          )}
        </div>

        <div className="tx-network-hint">
          <span>🌐</span>
          <span>Your wallet will ask you to confirm this action on WireFluid</span>
        </div>

        <div className="tx-preview-actions">
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-md)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 2, padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: '#040d08', fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none' }}
          >
            Confirm & Sign →
          </button>
        </div>
      </div>
    </div>
  )
}
