# PrivyHealth Pakistan

Patient-owned health records, tamper-evident prescriptions, and pharmacy verification over WhatsApp — demo stack for **WireFluid** and hackathon showcases.

## What ships in this repo

- **React + Vite** (`client/`) — bilingual toggle shell, PWA, MetaMask (ethers v6).
- **Express API** (`server/src/index.cjs`) — prescriptions, pharmacies, admin overview, WhatsApp bot simulator, AI drug-check / chat (when keys are set).
- **Vercel serverless** (`api/`) — same REST and AI routes for production deploys (in-memory demo store resets per cold start unless you add a database).
- **Hardhat** (`contracts/`, `scripts/`) — Solidity contracts for local / WireFluid networks.

## Quick start

```bash
npm install
npm run dev
```

- **Web:** [http://localhost:5173](http://localhost:5173)
- **API:** [http://127.0.0.1:3001](http://127.0.0.1:3001) (proxied as `/api` from Vite)

Production preview (build + API + preview proxy):

```bash
npm run build
# Terminal 1
npm run dev:api
# Terminal 2
npm run preview
```

Open [http://localhost:4173](http://localhost:4173).

## Environment

Copy `.env.example` to `.env.local` and fill values you need. Important keys:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | AI drug-check + chat |
| `VITE_WIREFLUID_*` | Chain switch / add in the browser |
| `VITE_API_BASE` | Optional absolute API URL if the SPA is not same-origin |
| `JWT_SECRET` | Required for role JWT auth in API |
| `AUTH_STRICT` | Enforce doctor/pharmacy JWT for write actions |
| `REQUIRE_ADMIN_JWT` | Enforce admin JWT on admin overview |
| `FORCE_MEMORY_STORE` | Set `1` for serverless demo mode without durable DB |
| `DOCTOR_BOOTSTRAP_PASSWORD` / `PHARMACY_BOOTSTRAP_PASSWORD` / `ADMIN_BOOTSTRAP_PASSWORD` | Default role credentials (change for launch) |

## Deploy (Vercel)

1. Connect the repo; set **Build Command** `npm run build` and **Output Directory** `dist` (see `vercel.json`).
2. Add environment variables from `.env.example` in the Vercel project settings.
3. After deploying contracts, paste `VITE_ADDR_*` values into Vercel.

**Note:** For Vercel demos, prefer `FORCE_MEMORY_STORE=1` unless you add a durable external database. Serverless local files can reset.

## Compliance & positioning

This repository is an **engineering and UX demo**. It is **not** a licensed medical device, **not** DRAP-registered software, and **not** a substitute for professional care. Use clear disclaimers in any pitch or marketing.

## Access model (launch)

- Doctor/pharmacy/admin routes are role-guarded in UI **and** API.
- Users can sign in from `Settings -> Role Access`.
- Wallet-linked features (like creating records) require connected wallet.
- Protected routes show an **Access Required** screen instead of silent redirects.

## Optional production upgrades

- **Durable DB (Neon/Supabase/Postgres):**
  - set `USE_POSTGRES=1`
  - set `DATABASE_URL` (pooled connection string)
  - keep `FORCE_MEMORY_STORE=0`
- **WhatsApp without Twilio (Meta Cloud API):**
  - set `WHATSAPP_PROVIDER=meta`
  - set `META_WHATSAPP_TOKEN`
  - set `META_WHATSAPP_PHONE_NUMBER_ID`
  - set `META_WHATSAPP_VERIFY_TOKEN`
  - configure webhook URL: `/api/whatsapp/webhook`
- **Twilio mode (optional):**
  - set `WHATSAPP_PROVIDER=twilio`
  - set Twilio env vars and webhook to `/api/whatsapp/webhook`

## Launch runbook

Use `LAUNCH_CHECKLIST.md` for production demo steps, required env vars, and QA scenarios.

## Hackathon MVP recommendation

For maximum stability during judging:

- Use `FORCE_MEMORY_STORE=1` on serverless deploys.
- Use `VITE_DEMO_MODE=1` so disclaimers stay visible.
- Use `Settings -> Role Access` for admin/doctor/pharmacy sign-in.
- Use WhatsApp in **Twilio-free mode**:
  - click-to-chat via `VITE_WHATSAPP_NUMBER`
  - in-app WhatsApp bot simulator (`/api/whatsapp/test`)

This gives a reliable end-to-end demo without external webhook dependencies.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | API + Vite dev server |
| `npm run build` | Production client build → `dist/` |
| `npm run preview` | Serve `dist/` (configure API or run `dev:api` locally) |
| `npm run compile` | Hardhat compile |
| `npm run test` | Hardhat tests |
