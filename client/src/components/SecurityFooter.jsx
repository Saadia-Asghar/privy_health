import React from 'react'

export default function SecurityFooter({ code }) {
  return (
    <div className="security-footer">
      <div className="security-item">
        <span>🔐</span>
        <span>AES-256 Encrypted</span>
      </div>
      <div className="security-divider" />
      <div className="security-item">
        <span>⛓</span>
        <span>WireFluid Network</span>
      </div>
      <div className="security-divider" />
      <div className="security-item">
        <span>🇵🇰</span>
        <span>DRAP Compliant</span>
      </div>
      {code && (
        <>
          <div className="security-divider" />
          <a
            href={`https://explorer.wirefluid.com/rx/${code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="security-item security-link"
          >
            <span>🔍</span>
            <span>Verify on Explorer ↗</span>
          </a>
        </>
      )}
    </div>
  )
}
