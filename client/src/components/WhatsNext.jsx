import React from 'react'
import { useNavigate } from 'react-router-dom'

const NEXT_STEPS = {
  prescriptionIssued: {
    celebration: '💊 Prescription sent to patient!',
    message: 'The patient has received their prescription code. Share it via WhatsApp or print a copy.',
    steps: [
      { icon: '📋', label: 'Write Another Prescription', desc: 'Issue a new prescription', href: '/doctor/write', priority: 'high' },
      { icon: '👥', label: 'View All Prescriptions', desc: 'See prescription history', href: '/patient', priority: 'medium' },
    ],
  },
  recordCreated: {
    celebration: '🎉 Your health record is secured!',
    message: 'Your medical information is now encrypted and saved on the WireFluid secure network.',
    steps: [
      { icon: '🚨', label: 'Set Emergency Card', desc: 'So doctors can help you in emergencies', href: '/qr-scanner', priority: 'high' },
      { icon: '👨‍⚕️', label: 'Find a Verified Doctor', desc: 'Browse PMDC-verified doctors', href: '/doctors', priority: 'medium' },
      { icon: '📱', label: 'Link WhatsApp', desc: 'Get prescription updates via WhatsApp', href: '/settings', priority: 'low' },
    ],
  },
  pharmacyRegistered: {
    celebration: '✅ Pharmacy registration submitted!',
    message: 'Your DRAP license will be verified within 48 hours. You can verify prescriptions in the meantime.',
    steps: [
      { icon: '✅', label: 'Verify a Prescription', desc: 'Start verifying codes right now', href: '/pharmacy/verify', priority: 'high' },
      { icon: '📊', label: 'Pharmacy Dashboard', desc: 'Track your verification stats', href: '/pharmacy/dashboard', priority: 'medium' },
    ],
  },
}

export default function WhatsNext({ event, onDismiss }) {
  const navigate = useNavigate()
  const content = NEXT_STEPS[event]
  if (!content) return null

  function handleStep(step) {
    onDismiss()
    navigate(step.href)
  }

  return (
    <div className="whats-next-overlay" onClick={onDismiss}>
      <div className="whats-next-card" onClick={e => e.stopPropagation()}>
        <button className="whats-next-close" onClick={onDismiss}>✕</button>

        <div className="whats-next-celebration">{content.celebration}</div>
        <p className="whats-next-message">{content.message}</p>

        <div className="whats-next-label">What would you like to do next?</div>

        <div className="whats-next-steps">
          {content.steps.map((step, i) => (
            <button
              key={i}
              className={`whats-next-step priority-${step.priority}`}
              onClick={() => handleStep(step)}
              style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
            >
              <span className="step-icon">{step.icon}</span>
              <div className="step-content">
                <div className="step-label">{step.label}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
              <span className="step-arrow">→</span>
            </button>
          ))}
        </div>

        <button className="whats-next-skip" onClick={onDismiss}>
          I'll do this later
        </button>
      </div>
    </div>
  )
}
