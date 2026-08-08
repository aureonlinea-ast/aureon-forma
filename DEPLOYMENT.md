# Deploying Aureon (including the /admin dashboard) outside Lovable

The app is a Vite SPA. The `/admin` dashboard is a normal client route protected
server-side by the `admin-auth` and `admin-db` edge functions (HMAC token +
`ADMIN_PASSWORD`). To ship it anywhere, three things must be true:

1. The three `VITE_SUPABASE_*` variables are set **at build time** on the host.
2. The host serves `index.html` as the SPA fallback so `/admin` and other deep
   links resolve after refresh.
3. The edge functions (`admin-auth`, `admin-db`, `chat`, `send-notification`,
   `generate-quote-pdf`) remain deployed on Lovable Cloud — they are called
   cross-origin from whichever host you use. No change needed; CORS is already
   `*`.

Required env vars (copy from `.env.example`):

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
```

Build command: `npm ci && npm run build` — output goes to `dist/`.

## Vercel
`vercel.json` already ships with `cleanUrls` + a catch-all rewrite to
`/index.html`. In the Vercel project settings add the three env vars above,
then `Deploy`.

## Netlify / Cloudflare Pages
`netlify.toml` and `public/_redirects` already provide the SPA fallback. Add
the three env vars in the site's build settings.

## Render
`render.yaml` is included — create a new **Static Site**, point it at the repo,
and Render will pick it up. Fill the three env vars marked `sync: false` in the
dashboard. The rewrite rule (`/* → /index.html`) is baked in.

## Railway
`railway.json` + `nixpacks.toml` are included. Railway builds with Nixpacks and
starts `serve -s dist` on `$PORT`, giving proper SPA fallback. Add the three
env vars under the service's **Variables** tab.

## Azure Static Web Apps
`public/staticwebapp.config.json` already sets the navigation fallback.

## Sanity check after deploy
- Visit `/admin` on a fresh tab → login screen renders.
- Log in with `ADMIN_PASSWORD` (`$Astro4L`) → dashboard loads data.
- Hard-refresh on `/admin` → still resolves (proves SPA fallback works).
- Or run the automated smoke tests: `SMOKE_URL=https://your-deploy npm run smoke`
  (and `npm run smoke:ui` for the browser pass). See `scripts/smoke/README.md`.
- If the login screen loads but the dashboard is empty, the `VITE_SUPABASE_*`
  vars weren't set at build time — rebuild after adding them.