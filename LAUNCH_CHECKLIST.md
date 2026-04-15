# PrivyHealth Launch Checklist

This checklist is for demo-day / production-style launch of the current stack.

## 1) Required environment variables

Set these in Vercel (or your host):

- `JWT_SECRET` (strong random, 32+ chars)
- `JWT_EXPIRES_IN=8h` (or your policy)
- `AUTH_STRICT=1`
- `REQUIRE_ADMIN_JWT=1`
- `OPEN_REGISTRATION=0`
- `ALLOW_PHARMACY_SELF_REG=1` (or `0` if closed)
- `RATE_LIMIT_GLOBAL_MAX=200`
- `RATE_LIMIT_AUTH_MAX=30`
- `RATE_LIMIT_WRITE_MAX=60`

For serverless demo:

- `FORCE_MEMORY_STORE=1`

For local/persistent file demo only:
- For durable Postgres mode (Neon/Supabase):
  - `USE_POSTGRES=1`
  - `DATABASE_URL=...`
  - `PGSSLMODE=require`
  - `FORCE_MEMORY_STORE=0`


- `FORCE_MEMORY_STORE=0`
- `SQLJS_PATH=/tmp/privyhealth.db` (serverless temp) or real local file path

Client-facing:

- `VITE_API_BASE` (only when frontend is on a different origin)
- `VITE_DEMO_MODE=1` (recommended for public demos)
- `VITE_PUBLIC_SITE_URL`
- `VITE_MARKETING_URL`
- `VITE_SUPPORT_EMAIL`

Bootstrap creds (change before public launch):

- `ADMIN_BOOTSTRAP_PASSWORD`
- `DOCTOR_BOOTSTRAP_PASSWORD`
- `PHARMACY_BOOTSTRAP_PASSWORD`

## 2) Pre-launch build checks

- `npm install`
- `npm run build`
- Confirm no build errors/warnings that block ship.

## 3) API contract checks

Verify these endpoints respond in deployed environment:

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me` (with bearer token)
- `GET /api/prescriptions`
- `POST /api/prescriptions` (doctor/admin token)
- `GET /api/prescriptions/verify/:code`
- `POST /api/prescriptions/fill/:code` (pharmacy/admin token)
- `GET /api/pharmacies`
- `GET /api/pharmacy/:id/stats`
- `GET /api/admin/overview` (admin token)

## 4) Role UX checks

In browser:

1. Open `Settings -> Role Access`.
2. Sign in as doctor account.
3. Confirm doctor pages unlock, admin/pharmacy remain locked.
4. Sign out, sign in as pharmacy account.
5. Confirm pharmacy pages unlock.
6. Sign out, sign in as admin account.
7. Confirm all protected pages unlock.

Expected behavior:

- Nav shows disabled lock state for unauthorized roles.
- Direct URL to protected pages shows "Access Required".
- Expired/invalid token clears session and prompts re-login.

## 5) Wallet checks

- Connect wallet from header or Settings.
- Confirm `/patient/mint` unlocks only with connected wallet.
- Confirm disconnect returns wallet-required access prompt.

## 6) QR flow checks

- Open `/qr-scanner`.
- Manual: enter known code `PK-...`, verify response.
- Camera scan:
  - Click "Start Camera Scan"
  - Present QR containing `PK-XXXXXX`
  - Confirm auto-fill + verification
- Unsupported browsers should show graceful fallback message.

## 7) End-to-end demo script

1. Admin login in Settings role panel.
2. Doctor login -> create prescription.
3. Pharmacy login -> verify + fill prescription.
4. Patient dashboard shows lifecycle updates.
5. QR scanner validates the code.
6. Show legal pages (`/privacy`, `/terms`) and demo banner.

## 8) Legal/compliance copy checks

- Demo mode banner visible (`VITE_DEMO_MODE=1`).
- No hardcoded domain claims you do not own.
- Support email and URLs come from env vars.
- Privacy + Terms pages reachable and readable.

## 9) WhatsApp provider mode

- **MVP mode (recommended for hackathon):**
  - `WHATSAPP_PROVIDER=mock`
  - `VITE_WHATSAPP_NUMBER=+92...`
  - Use click-to-chat + in-app bot simulator.
- **Meta Cloud API mode (no Twilio):**
  - `WHATSAPP_PROVIDER=meta`
  - `META_WHATSAPP_TOKEN`
  - `META_WHATSAPP_PHONE_NUMBER_ID`
  - `META_WHATSAPP_VERIFY_TOKEN`
  - Set webhook to `/api/whatsapp/webhook` (GET verify + POST messages)

## 10) Release decision

Ship only when:

- All sections above pass.
- Team confirms this is demo/prototype use only.
- Operator has credentials and a fallback plan if serverless data resets.
