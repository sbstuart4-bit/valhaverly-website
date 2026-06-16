# valhaverly-website

Marketing website for Valhaverly — private governance for families sharing lifestyle assets.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Intake form

The early-access form submits to `/api/intake` (Next.js API route). No client-side requests leave `valhaverly.com`.

To save submissions to Google Sheets, deploy `google-apps-script.gs` and set the web app URL as **`INTAKE_SHEET_URL`** in Vercel → Project → Settings → Environment Variables. This URL is only used server-side.

## Deploy

Push to GitHub; Vercel auto-detects Next.js. No build command override needed.
