# PrivyHealth Pakistan

**Blockchain-powered prescription verification for Pakistan's 230M people**
Entangled Hackathon 2026 · 10M PKR Prize Pool · WireFluid Network

## Architecture

- **Frontend**: React + Vite on `0.0.0.0:5000`
- **Backend**: Express API on `127.0.0.1:3001` (Vite proxies `/api`)
- **Start**: `npm run dev` (concurrently runs both)

## Core Innovation

- **6-digit prescription codes** (PK-7X4M2K) — works without QR scanner or smartphone
- **WhatsApp-first verification** — pharmacist sends "verify PK-7X4M2K" and gets instant reply
- **DRAP-compliant** drug categories (Schedule G/H, OTC, Controlled)
- **Pharmacy tier pyramid**: Basic → Verified (100+) → Premium (500+)
- **WireFluid blockchain** for immutable prescription NFTs
- **Emergency QR access** — ER doctors get patient records without wallet

## Project Structure

```
client/src/
  App.jsx                   — Routes + AppCtx + SplashScreen + ErrorBoundary
  index.css                 — CSS variables (--green theme) + print styles
  components/
    Shell.jsx               — Top bar + sidebar + mobile bottom nav
    Shell.module.css
    SplashScreen.jsx        — Animated startup screen
    SplashScreen.module.css
    ErrorBoundary.jsx       — React error boundary (catches JS errors)
  pages/
    HomePage.jsx            — Hero landing + stats + WhatsApp demo
    HomePage.module.css
    Page.module.css         — Shared page styles (used by all pages)
    DrugChecker.jsx         — Drug interaction checker
    MedicinePrices.jsx      — DRAP MRP table with generic savings
    DoctorDirectory.jsx     — PMDC-verified doctor listings
    QRScanner.jsx           — QR scan + manual code entry
    LiveDemo.jsx            — Step-by-step demo walkthrough
    AboutPage.jsx           — Project info
    PatientDashboard.jsx    — Prescription cards with expand/print/WhatsApp
    PatientDashboard.module.css
    MintRecord.jsx          — Create health record NFT
    MyRecord.jsx            — View health record
    WritePrescription.jsx   — Doctor prescription form → generates PK-XXXXXX
    WritePrescription.module.css
    VerifyPrescription.jsx  — Code input + WhatsApp tab + dispense
    VerifyPrescription.module.css
    PharmacyDashboard.jsx   — Pharmacy stats + tier progress
    PharmacyRegister.jsx    — Register new pharmacy (with DRAP validation)
    AdminDashboard.jsx      — Password-gated DRAP compliance + pharmacy registry
    SettingsPage.jsx        — Wallet, WhatsApp bot setup, WireFluid config, theme
    NotFound.jsx            — 404 page with friendly message
server/src/
  index.js                  — Express REST API (in-memory store + seed data)
```

## Demo Data (Seed)

- `PK-7X4M2K` — Active, Augmentin 625mg, Schedule G, 7d left
- `PK-9KRM4X` — Filled, Metformin 500mg, Schedule H
- `PK-2BX8NQ` — Active, Ciprofloxacin 500mg, Schedule G, 5d left
- Pharmacies: Medico Pharmacy (Verified), Al-Shifa (Premium), City Pharmacy (Basic)

## API Routes

- `GET /api/prescriptions?patientId=&doctorId=`
- `POST /api/prescriptions`
- `GET /api/prescriptions/verify/:code`
- `POST /api/prescriptions/fill/:code` + `{pharmacyId, pharmacyName}`
- `GET /api/pharmacies`
- `POST /api/pharmacies`
- `GET /api/pharmacy/:id/stats`
- `GET /api/admin/overview`

## V8 UX Polish

### New shared components
- `TransactionPreview.jsx` — modal showing exactly what will happen before any write action, with cost + time + undo info
- `FieldHelp.jsx` — "?" tooltip on every form label (pmdc, drap, refills, category, etc.)
- `SecurityFooter.jsx` — persistent trust signals (AES-256, WireFluid, DRAP, Explorer link)
- `WhatsNext.jsx` — post-action "what to do next" card after prescription issued, record created, etc.

### WhatsApp Bot API (`POST /api/whatsapp/test`)
- Full bot simulator: `verify PK-XXXXXX`, `fill PK-XXXXXX`, `refill PK-XXXXXX`, `help`, `emergency`, `my record`
- Returns rich formatted replies exactly like the real WhatsApp bot
- Powers the in-browser WhatsApp Tester on the Settings page

### Page upgrades
- **Settings** — 4 tabs: Account | WhatsApp | Network | Appearance; includes embedded live WhatsApp tester
- **LiveDemo** — 5-step interactive click-through with real API calls; embedded WhatsApp tester + live verify input
- **WritePrescription** — TransactionPreview modal before submit; hero success screen with copy/share/print; FieldHelp tooltips; no blockchain jargon
- **PatientDashboard** — setup next-steps progress banner (2/3 steps); pharmacist fullscreen mode; EmptyState; SecurityFooter
- **HomePage** — "What brings you here?" 4-card role selector (Patient/Doctor/Pharmacist/Emergency)

### Language improvements
- "NFT minted · IPFS encrypted" → "Secured on WireFluid · Encrypted"
- "Wallet address" → "Your account ID"
- "Blockchain" → "WireFluid secure network"
- "Sign & Issue Prescription NFT" → "Sign & Send Prescription"

## Key Features Added

1. **Splash screen** — animated startup with PrivyHealth logo + progress bar
2. **Error boundaries** — catches JS errors gracefully per-page
3. **404 page** — "No prescription for /path" with go-home/go-back
4. **Settings page** — WhatsApp bot commands, WireFluid network info, wallet, theme
5. **Admin password gate** — `entangled2026` (demo), session-persisted
6. **Patient prescription cards** — expandable, with big code display, print, WhatsApp share
7. **Print prescription** — opens print window with full DRAP-formatted prescription
8. **Register Pharmacy** — form with DRAP license validation + tier explanation
9. **Mobile bottom nav** — 5-item nav for small screens
10. **Print stylesheet** — hides sidebar/nav, white background for printing
11. **Favicon** — green heart SVG + web manifest for PWA

## Pharmacy Tier System

| Tier | Verifications | Perks |
|------|---------------|-------|
| Basic | 0–99 | Standard listing |
| Verified | 100+ | Featured listing + patient referrals |
| Premium | 500+ | Controlled substances + priority listing |

## Color Scheme

- `--green: #16c784` — primary accent
- `--green-dark: #0ea572` — hover
- CSS variables control dark/light mode via `.dark` on root

## AppCtx State

`{ dark, setDark, wallet, setWallet, mode, setMode, lang, setLang }`
