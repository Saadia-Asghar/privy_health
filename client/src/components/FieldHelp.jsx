import React, { useState } from 'react'

const HELP_TEXT = {
  bloodType: 'Your blood group (e.g., B+, O-). Found on medical reports or ask your doctor.',
  pmdc: 'Pakistan Medical and Dental Council license number. Format: PMDC-12345. Found on your degree certificate.',
  drapLicense: 'DRAP retail drug license number. Required to sell medicines legally in Pakistan. Format: DRAP-KHI-2341.',
  cnic: 'We only need the last 4 digits of your CNIC for identity matching — never your full number.',
  walletAddress: "Your WireFluid account ID. It starts with '0x' and is 42 characters long.",
  prescriptionCode: 'A 6-character code like PK-7X4M2K. The doctor gives this to the patient after issuing a prescription.',
  encryptionNote: 'Your data is scrambled using military-grade encryption before it leaves your browser. Even we cannot read it.',
  emergencyContact: 'This person will be contacted if you are unable to speak for yourself in an emergency.',
  refills: 'How many times the patient can get this medicine without a new prescription. 0 = one-time only.',
  validFor: 'After this many days, the prescription expires and the patient needs to see you again.',
  whatsappNumber: 'The Pakistan number that pharmacists will message to verify prescriptions. Include country code: +923001234567',
  category: 'DRAP drug category. Schedule G requires a prescription. Controlled Substances need Premium pharmacy certification.',
}

export default function FieldHelp({ field }) {
  const [show, setShow] = useState(false)
  const text = HELP_TEXT[field]
  if (!text) return null

  return (
    <span className="field-help-wrapper">
      <button
        className="field-help-btn"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={e => { e.preventDefault(); setShow(!show) }}
        type="button"
        aria-label="Help"
      >
        ?
      </button>
      {show && <div className="field-help-tooltip">{text}</div>}
    </span>
  )
}
