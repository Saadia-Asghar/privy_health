import React, { useState, createContext, useCallback, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Shell from './components/Shell.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import HomePage from './pages/HomePage.jsx'
import DrugChecker from './pages/DrugChecker.jsx'
import MedicinePrices from './pages/MedicinePrices.jsx'
import DoctorDirectory from './pages/DoctorDirectory.jsx'
import QRScanner from './pages/QRScanner.jsx'
import LiveDemo from './pages/LiveDemo.jsx'
import AboutPage from './pages/AboutPage.jsx'
import PatientDashboard from './pages/PatientDashboard.jsx'
import MintRecord from './pages/MintRecord.jsx'
import MyRecord from './pages/MyRecord.jsx'
import WritePrescription from './pages/WritePrescription.jsx'
import VerifyPrescription from './pages/VerifyPrescription.jsx'
import PharmacyDashboard from './pages/PharmacyDashboard.jsx'
import PharmacyRegister from './pages/PharmacyRegister.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import DoctorDashboard from './pages/DoctorDashboard.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import PitchDeck from './pages/PitchDeck.jsx'
import NotFound from './pages/NotFound.jsx'
import PrivacyPolicy from './pages/PrivacyPolicy.jsx'
import Terms from './pages/Terms.jsx'
import AccessRequired from './pages/AccessRequired.jsx'
import { connectMetaMask, shortAddress } from './wallet.js'
import { hasRole } from './lib/auth.js'

export const AppCtx = createContext(null)

function RequireRole({ roles, children }) {
  if (!hasRole(roles)) {
    return (
      <AccessRequired
        title="Role Access Required"
        message={`This page requires one of these roles: ${roles.join(', ')}. Sign in with the correct account in Settings or the page session panel.`}
      />
    )
  }
  return children
}

function RequireWallet({ wallet, children }) {
  if (!wallet) {
    return (
      <AccessRequired
        title="Wallet Connection Required"
        message="Connect your wallet first to continue. This feature links actions to your wallet identity."
        actionLabel="Connect in Settings"
      />
    )
  }
  return children
}

export default function App() {
  const [splash, setSplash] = useState(true)
  const [dark, setDark] = useState(false)
  /** Full 0x address when connected */
  const [wallet, setWallet] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [walletError, setWalletError] = useState(null)
  const [mode, setMode] = useState('live')
  const [lang, setLang] = useState('en')

  const walletShort = wallet ? shortAddress(wallet) : null

  const disconnectWallet = useCallback(() => {
    setWallet(null)
    setChainId(null)
    setWalletError(null)
  }, [])

  const connectWallet = useCallback(async () => {
    if (wallet) {
      disconnectWallet()
      return
    }
    setConnecting(true)
    setWalletError(null)
    try {
      const { account, chainId: cid } = await connectMetaMask()
      setWallet(account)
      setChainId(cid)
    } catch (e) {
      setWalletError(e?.message || 'Could not connect wallet.')
    } finally {
      setConnecting(false)
    }
  }, [wallet, disconnectWallet])

  useEffect(() => {
    const eth = typeof window !== 'undefined' ? window.ethereum : null
    if (!eth?.on) return undefined

    const onAccounts = (accs) => {
      if (!accs?.length) {
        setWallet(null)
        setChainId(null)
      } else {
        setWallet(accs[0])
      }
    }
    const onChain = () => {
      window.location.reload()
    }
    eth.on('accountsChanged', onAccounts)
    eth.on('chainChanged', onChain)
    return () => {
      eth.removeListener?.('accountsChanged', onAccounts)
      eth.removeListener?.('chainChanged', onChain)
    }
  }, [])

  if (splash) return <SplashScreen onDone={() => setSplash(false)} />

  return (
    <AppCtx.Provider
      value={{
        dark,
        setDark,
        wallet,
        walletShort,
        setWallet,
        chainId,
        connecting,
        walletError,
        connectWallet,
        disconnectWallet,
        mode,
        setMode,
        lang,
        setLang,
      }}
    >
      <div className={dark ? 'dark' : ''} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
        <ErrorBoundary>
          <BrowserRouter>
            <Shell>
              <Routes>
                <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                <Route path="/drug-checker" element={<ErrorBoundary><DrugChecker /></ErrorBoundary>} />
                <Route path="/medicine-prices" element={<ErrorBoundary><MedicinePrices /></ErrorBoundary>} />
                <Route path="/doctors" element={<ErrorBoundary><DoctorDirectory /></ErrorBoundary>} />
                <Route path="/qr-scanner" element={<ErrorBoundary><QRScanner /></ErrorBoundary>} />
                <Route path="/live" element={<ErrorBoundary><LiveDemo isLive={true} /></ErrorBoundary>} />
                <Route path="/demo" element={<ErrorBoundary><LiveDemo isLive={false} /></ErrorBoundary>} />
                <Route path="/about" element={<ErrorBoundary><AboutPage /></ErrorBoundary>} />
                <Route path="/patient" element={<ErrorBoundary><PatientDashboard /></ErrorBoundary>} />
                <Route
                  path="/patient/mint"
                  element={(
                    <ErrorBoundary>
                      <RequireWallet wallet={wallet}>
                        <MintRecord />
                      </RequireWallet>
                    </ErrorBoundary>
                  )}
                />
                <Route path="/patient/record" element={<ErrorBoundary><MyRecord /></ErrorBoundary>} />
                <Route
                  path="/doctor/write"
                  element={(
                    <ErrorBoundary>
                      <RequireRole roles={['doctor', 'admin']}>
                        <WritePrescription />
                      </RequireRole>
                    </ErrorBoundary>
                  )}
                />
                <Route
                  path="/pharmacy/verify"
                  element={(
                    <ErrorBoundary>
                      <RequireRole roles={['pharmacy', 'admin']}>
                        <VerifyPrescription />
                      </RequireRole>
                    </ErrorBoundary>
                  )}
                />
                <Route
                  path="/pharmacy"
                  element={(
                    <ErrorBoundary>
                      <RequireRole roles={['pharmacy', 'admin']}>
                        <PharmacyDashboard />
                      </RequireRole>
                    </ErrorBoundary>
                  )}
                />
                <Route path="/pharmacy/register" element={<ErrorBoundary><PharmacyRegister /></ErrorBoundary>} />
                <Route
                  path="/doctor"
                  element={(
                    <ErrorBoundary>
                      <RequireRole roles={['doctor', 'admin']}>
                        <DoctorDashboard />
                      </RequireRole>
                    </ErrorBoundary>
                  )}
                />
                <Route
                  path="/admin"
                  element={(
                    <ErrorBoundary>
                      <RequireRole roles={['admin']}>
                        <AdminDashboard />
                      </RequireRole>
                    </ErrorBoundary>
                  )}
                />
                <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
                <Route path="/pitch" element={<ErrorBoundary><PitchDeck /></ErrorBoundary>} />
                <Route path="/privacy" element={<ErrorBoundary><PrivacyPolicy /></ErrorBoundary>} />
                <Route path="/terms" element={<ErrorBoundary><Terms /></ErrorBoundary>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Shell>
          </BrowserRouter>
        </ErrorBoundary>
      </div>
    </AppCtx.Provider>
  )
}
