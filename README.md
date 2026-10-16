# Editable Wedding Invitation — React + Node.js

A responsive wedding invitation starter inspired by elegant digital invitation pages. This is an independent implementation, not ChungDoi source code or a pixel-perfect copy.

## Included
- Photo-led invitation cover with an open action and background-music mute control
- Responsive hero, couple introduction and wedding story
- Automatically advancing wedding photo slideshow
- Live wedding countdown and downloadable calendar event
- Ceremony, venue, dress code and celebration schedule
- RSVP modal with attendance and guest count
- Guestbook form with messages shared through the Express API
- Expandable gift box with editable bank details and WhatsApp contacts
- PostgreSQL storage for production RSVP and guestbook records
- Local JSON storage as a no-setup development fallback
- Editable couple/event content in one file

## Requirements
- Node.js 18 or newer
- npm

## Run locally
1. Extract the ZIP and open the project folder in a terminal.
2. Install packages:
   ```bash
   npm install
   ```
3. Start the frontend and API (uses local JSON storage unless `DATABASE_URL` is set):
   ```bash
   npm run dev
   ```
4. Open the Vite URL printed in your terminal (usually `http://localhost:5173`).

The Vite dev server proxies `/api` requests to Express. In development, RSVP and guestbook data is stored in `server/data/` when PostgreSQL is not configured.

## Deploy to Vercel

The project is configured as a Vite static site plus a Vercel Node.js function for `/api/*`. Before deploying, provide a hosted PostgreSQL service: a PostgreSQL server running on your computer is not reachable by Vercel.

1. Push this project to a GitHub, GitLab, or Bitbucket repository.
2. Create a hosted PostgreSQL database (for example through Vercel's Marketplace or a provider such as Neon or Supabase). Copy the provider's connection string for server-side/backend use. Prefer its pooled connection string if offered.
3. Open that database provider's SQL editor and run the contents of `server/schema.sql` once. Vercel does not run schema changes automatically; this lets the runtime database user have only the permissions it needs to read and write invitation rows.
4. In Vercel, choose **Add New → Project**, import the repository, and keep the project root as the Root Directory. The committed `vercel.json` sets the Vite build command and `dist` output directory.
5. In **Project → Settings → Environment Variables**, add:
   - `DATABASE_URL`: hosted PostgreSQL connection string (keep it server-side; do not prefix it with `VITE_`)
   - `PGSSL=true`: if required by your database provider
   - `RSVP_ADMIN_TOKEN`: a long, random secret for the private RSVP export endpoint
   Apply the variables to Production (and Preview if preview deployments should use the same database), then redeploy. Vercel sets `NODE_ENV=production` and `VERCEL=1`.
6. Open the deployed URL and check `/api/health`. It should return `{"ok":true,"storage":"postgres"}`. Then test an RSVP and a guestbook message.

If you want to migrate current local JSON entries, first create the tables in the hosted database as above, then from PowerShell in the project folder set `DATABASE_URL` to the hosted connection string and run `npm.cmd run db:import-json`. This writes those records to the hosted database, so protect that connection string and do not commit it.

The catch-all Vercel function is `api/[...path].js`; local development still uses the Express server started by `npm run dev`. `vercel.json` also sends unknown client-side routes to the Vite app.

## PostgreSQL and production

Create a PostgreSQL database and a dedicated application user. Set these environment variables in your hosting provider's environment/secrets settings:

- `DATABASE_URL`: connection URL, for example `postgresql://app_user:password@db-host:5432/wedding`
- `NODE_ENV=production`: production mode refuses to start without PostgreSQL
- `PORT`: optional HTTP port (usually supplied by your hosting provider)
- `PGSSL=true`: enable TLS if required by your database provider; certificates are verified by default
- `PGSSL_REJECT_UNAUTHORIZED=false`: only for providers whose TLS certificate cannot be verified by the system trust store
- `RSVP_ADMIN_TOKEN`: secret used to authorize `GET /api/rsvp`, which returns guest names and responses. Send it as `Authorization: Bearer <token>`; never place it in frontend code.

For a regular Express deployment, the server applies the idempotent schema in `server/schema.sql` at startup. For Vercel, run that schema once in the hosted database's SQL editor as described above.

For a local production-mode test in PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://app_user:password@localhost:5432/wedding"
$env:NODE_ENV = "production"
$env:RSVP_ADMIN_TOKEN = "replace-with-a-long-random-secret"
npm run start
```

If existing records are in `server/data/rsvps.json` or `server/data/guestbook.json`, set `DATABASE_URL` and run `npm run db:import-json` once before deployment. The importer skips existing record IDs if rerun and leaves JSON files untouched.

## Customize the invitation
Edit `src/invitationData.js`:
- couple names, date and `dateISO` (defaults currently match the supplied `invite.jpeg`)
- parent names, ceremony/party venue, address and `mapUrl`
- `coverPhoto`, `invitationImage`, and `photos` for the cover, invitation artwork, story image, and rotating gallery
- ceremony `schedule`, dress code and gift details
- `musicUrl` points to `public/music.mp3`; replace that file or update the path to use different music
- add bank records to `gift.accounts` with `bank`, `accountName` and `accountNumber`
- `public/invite.jpeg` is also used as the favicon, Apple touch icon, and social-sharing image

Use image and music files you own or have permission to use. Files inside `public/` are available by their root paths, for example `/p1.jpeg` and `/music.mp3`.

## Production build
```bash
npm run build
npm start
```
The Express server serves the `dist` folder if it exists. `DATABASE_URL` is required in production.

## Important notes
- RSVP and guestbook records use parameterized PostgreSQL queries when `DATABASE_URL` is set. Local JSON mode is intended for development only.
- `GET /api/rsvp` contains personal guest information and is protected by `RSVP_ADMIN_TOKEN`. Guestbook messages appear publicly on the invitation; add moderation and rate limiting before broadly exposing submissions.
- External Google Fonts and sample Unsplash images require internet access.
- This project is a starter: replace the sample couple details and sample photos before presenting it as your own work.
