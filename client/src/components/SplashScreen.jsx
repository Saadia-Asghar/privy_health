import React, { useEffect, useState } from 'react'
import s from './SplashScreen.module.css'

export default function SplashScreen({ onDone }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 400)
    const t2 = setTimeout(() => setStep(2), 900)
    const t3 = setTimeout(() => setStep(3), 1400)
    const t4 = setTimeout(() => onDone(), 1800)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [onDone])

  return (
    <div className={s.splash}>
      <div className={`${s.inner} ${step >= 1 ? s.visible : ''}`}>
        <div className={s.logoWrap}>
          <div className={s.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
          </div>
        </div>
        <div className={`${s.name} ${step >= 2 ? s.nameVisible : ''}`}>
          <span className={s.privy}>Privy</span><span className={s.health}>Health</span>
        </div>
        <div className={`${s.tagline} ${step >= 3 ? s.taglineVisible : ''}`}>
          Pakistan · WireFluid Network · Entangled Hackathon 2026
        </div>
        <div className={`${s.bar} ${step >= 2 ? s.barVisible : ''}`}>
          <div className={s.barFill} />
        </div>
      </div>
    </div>
  )
}
