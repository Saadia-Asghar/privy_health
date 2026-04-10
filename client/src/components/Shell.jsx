import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppCtx } from '../App.jsx'
import s from './Shell.module.css'

const publicNav = [
  { to: '/', label: 'Home', exact: true },
  { to: '/drug-checker', label: 'Drug Checker', badge: 'Free', badgeColor: 'green' },
  { to: '/medicine-prices', label: 'Medicine Prices', badge: 'New', badgeColor: 'blue' },
  { to: '/doctors', label: 'Doctor Directory' },
  { to: '/qr-scanner', label: 'QR Scanner', badge: 'Emergency', badgeColor: 'red' },
  { to: '/live', label: 'Live', badge: '●Live', badgeColor: 'live' },
  { to: '/demo', label: 'Demo' },
  { to: '/about', label: 'About' },
]

const patientNav = [
  { to: '/patient', label: 'Dashboard', lock: true },
  { to: '/patient/mint', label: 'Create Record', lock: true },
  { to: '/patient/record', label: 'My Record', lock: true },
]

function Badge({ text, color }) {
  const colors = {
    green: { bg: '#dcfce7', fg: '#16a34a' },
    blue: { bg: '#dbeafe', fg: '#1d4ed8' },
    red: { bg: '#fee2e2', fg: '#dc2626' },
    live: { bg: '#dcfce7', fg: '#16a34a' },
  }
  const c = colors[color] || colors.green
  return (
    <span style={{ background: c.bg, color: c.fg, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, letterSpacing: 0.3 }}>
      {text}
    </span>
  )
}

export default function Shell({ children }) {
  const { dark, setDark, wallet, setWallet, mode, setMode, lang, setLang } = useContext(AppCtx)
  const navigate = useNavigate()

  function connectWallet() {
    setWallet(wallet ? null : '0x1a2b...3c4d')
  }

  return (
    <div className={s.shell}>
      {/* Top bar */}
      <header className={s.topbar}>
        <div className={s.topLeft}>
          <div className={s.logo} onClick={() => navigate('/')}>
            <div className={s.logoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--green)">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
            </div>
            <div>
              <div className={s.logoName}>PrivyHealth</div>
              <div className={s.logoSub}>Pakistan · Web3</div>
            </div>
          </div>
        </div>

        <div className={s.topCenter}>
          <span className={s.appTitle}>PrivyHealth Pakistan</span>
          <span className={s.titleSep}>·</span>
          <span className={s.hackTitle}>Entangled Hackathon 2026</span>
        </div>

        <div className={s.topRight}>
          <div className={s.modeToggle}>
            <button
              className={`${s.modeBtn} ${mode === 'live' ? s.modeBtnActive : ''}`}
              onClick={() => { setMode('live'); navigate('/live') }}
            >
              <span className={s.liveDot} />
              Live
            </button>
            <button
              className={`${s.modeBtn} ${mode === 'demo' ? s.modeBtnActive : ''}`}
              onClick={() => { setMode('demo'); navigate('/demo') }}
            >
              <span style={{ marginRight: 4 }}>▷</span>
              Demo
            </button>
          </div>

          <button
            className={s.langBtn}
            onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
          >
            {lang === 'en' ? 'اردو' : 'EN'}
          </button>

          <button className={s.darkBtn} onClick={() => setDark(!dark)} title="Toggle dark mode">
            {dark ? '☀' : '🌙'}
          </button>

          <button className={s.connectBtn} onClick={connectWallet}>
            {wallet ? (
              <><span className={s.connectedDot} />{wallet}</>
            ) : (
              <><WalletIcon /> Connect Wallet</>
            )}
          </button>
        </div>
      </header>

      <div className={s.body}>
        {/* Sidebar */}
        <aside className={s.sidebar}>
          <div className={s.navSection}>
            <div className={s.navSectionLabel}>PUBLIC</div>
            {publicNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) => `${s.navItem} ${isActive ? s.navItemActive : ''}`}
              >
                <span className={s.navLabel}>{item.label}</span>
                {item.badge && <Badge text={item.badge} color={item.badgeColor} />}
              </NavLink>
            ))}
          </div>

          <div className={s.navSection}>
            <div className={s.navSectionLabel}>PATIENT</div>
            {patientNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/patient'}
                className={({ isActive }) => `${s.navItem} ${isActive ? s.navItemActive : ''}`}
              >
                <span className={s.navLabel}>{item.label}</span>
                {item.lock && !wallet && <LockIcon />}
              </NavLink>
            ))}
          </div>

          <div className={s.navSection}>
            <div className={s.navSectionLabel}>PROVIDER</div>
            <NavLink to="/doctor" end className={({ isActive }) => `${s.navItem} ${isActive ? s.navItemActive : ''}`}>
              <span className={s.navLabel}>Doctor Dashboard</span>
            </NavLink>
            <NavLink to="/doctor/write" className={({ isActive }) => `${s.navItem} ${isActive ? s.navItemActive : ''}`}>
              <span className={s.navLabel}>Write Prescription</span>
            </NavLink>
            <NavLink to="/pharmacy/verify" className={({ isActive }) => `${s.navItem} ${isActive ? s.navItemActive : ''}`}>
              <span className={s.navLabel}>Verify Prescription</span>
            </NavLink>
            <NavLink to="/pharmacy" end className={({ isActive }) => `${s.navItem} ${isActive ? s.navItemActive : ''}`}>
              <span className={s.navLabel}>Pharmacy Portal</span>
            </NavLink>
            <NavLink to="/pharmacy/register" className={({ isActive }) => `${s.navItem} ${isActive ? s.navItemActive : ''}`}>
              <span className={s.navLabel}>Register Pharmacy</span>
              <Badge text="New" color="blue" />
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `${s.navItem} ${isActive ? s.navItemActive : ''}`}>
              <span className={s.navLabel}>Admin</span>
            </NavLink>
          </div>

          <div className={s.navBottom}>
            <NavLink to="/pitch" className={({ isActive }) => `${s.navItem} ${isActive ? s.navItemActive : ''}`}>
              <span className={s.navLabel}>Pitch Deck</span>
              <Badge text="New" color="green" />
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `${s.navItem} ${isActive ? s.navItemActive : ''}`}>
              <span className={s.navLabel}>⚙ Settings</span>
            </NavLink>
          </div>
        </aside>

        {/* Main content */}
        <main className={s.main}>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className={s.mobileNav}>
        {[
          { to: '/', icon: '🏠', label: 'Home', end: true },
          { to: '/drug-checker', icon: '💊', label: 'Drugs' },
          { to: '/pharmacy/verify', icon: '✅', label: 'Verify' },
          { to: '/patient', icon: '👤', label: 'Patient' },
          { to: '/settings', icon: '⚙', label: 'Settings' },
        ].map(item => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `${s.mobileNavItem} ${isActive ? s.mobileNavActive : ''}`}>
            <span className={s.mobileNavIcon}>{item.icon}</span>
            <span className={s.mobileNavLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
      <path d="M20 12V22H4V12"/>
      <path d="M22 7H2v5h20V7z"/>
      <path d="M12 22V7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  )
}
