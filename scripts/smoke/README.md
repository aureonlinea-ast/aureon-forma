# Deployment smoke tests

Two layers, both runnable against any platform target (Vercel, Render, Railway,
Netlify/Cloudflare, Azure SWA, Lovable, custom domain).

## 1. HTTP smoke — `npm run smoke`

No browser needed. For each target it asserts:

- every critical route (`/`, `/work`, `/work/:slug`, `/services`,
  `/behind-the-scenes`, `/about`, `/contact`, `/quote`, **`/admin`**) returns
  200 **and** serves the SPA shell — this is what catches a missing SPA
  fallback, the usual reason `/admin` 404s off-Lovable;
- the built JS bundle has the backend URL baked in (i.e. the three
  `VITE_SUPABASE_*` vars were present at build time — otherwise `/admin`
  renders but can never load data);
- `robots.txt`, `sitemap.xml`, `llms.txt` are served;
- **auth gating**: `admin-auth` rejects a wrong password and a forged token,
  and `admin-db` returns 401 for missing *and* forged tokens.

Targets come from `targets.json`, or override per run:

```bash
SMOKE_URL=https://my-app.vercel.app npm run smoke
SMOKE_TARGETS="vercel=https://a.vercel.app,render=https://b.onrender.com" npm run smoke
```

Add each platform URL to `targets.json` after its first deploy so `npm run smoke`
covers them all in one pass. Exit code is non-zero on any failure (CI-friendly).

## 2. Browser smoke — `npm run smoke:ui`

Requires Playwright once: `npx --yes playwright@1 install chromium`.

Loads every route in Chromium and asserts real UI render (DOM nodes + title, no
uncaught page errors), then on `/admin`:

- the password gate renders and no dashboard content leaks while signed out;
- a wrong password is rejected;
- with `ADMIN_PASSWORD` set, login succeeds, the Overview/Analytics/Clients tabs
  render, and the session survives a hard refresh on `/admin`.

```bash
SMOKE_URL=https://my-app.vercel.app ADMIN_PASSWORD='...' npm run smoke:ui
```

## 3. CI unit guards — `npm test`

- `src/pages/__tests__/Admin.auth.test.tsx` — the `/admin` route gate: no token
  → login screen, forged token → server-verified and cleared, non-admin role
  rejected, dashboard only after the server confirms `role: admin`.
- `src/test/deploy-targets.test.ts` — every host config still declares an SPA
  fallback and the required build-time env vars are documented.
