import React, { useState, createContext, useContext } from 'react'
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

export const AppCtx = createContext(null)

export default function App() {
  const [splash, setSplash] = useState(true)
  const [dark, setDark] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [mode, setMode] = useState('live')
  const [lang, setLang] = useState('en')

  if (splash) return <SplashScreen onDone={() => setSplash(false)} />

  return (
    <AppCtx.Provider value={{ dark, setDark, wallet, setWallet, mode, setMode, lang, setLang }}>
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
                <Route path="/patient/mint" element={<ErrorBoundary><MintRecord /></ErrorBoundary>} />
                <Route path="/patient/record" element={<ErrorBoundary><MyRecord /></ErrorBoundary>} />
                <Route path="/doctor/write" element={<ErrorBoundary><WritePrescription /></ErrorBoundary>} />
                <Route path="/pharmacy/verify" element={<ErrorBoundary><VerifyPrescription /></ErrorBoundary>} />
                <Route path="/pharmacy" element={<ErrorBoundary><PharmacyDashboard /></ErrorBoundary>} />
                <Route path="/pharmacy/register" element={<ErrorBoundary><PharmacyRegister /></ErrorBoundary>} />
                <Route path="/doctor" element={<ErrorBoundary><DoctorDashboard /></ErrorBoundary>} />
                <Route path="/admin" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
                <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
                <Route path="/pitch" element={<ErrorBoundary><PitchDeck /></ErrorBoundary>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Shell>
          </BrowserRouter>
        </ErrorBoundary>
      </div>
    </AppCtx.Provider>
  )
}
