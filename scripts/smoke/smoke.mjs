#!/usr/bin/env node
/**
 * Deployment smoke tests — HTTP layer.
 *
 * Verifies, for every configured platform target (Vercel / Render / Railway /
 * Netlify / Lovable / custom domain):
 *   1. Every critical route resolves (SPA fallback serves index.html on deep
 *      links such as /admin — the first thing that breaks off-Lovable).
 *   2. The built bundle has the VITE_SUPABASE_* values baked in, otherwise
 *      /admin renders but can never reach the backend.
 *   3. Auth gating: the admin edge functions reject missing/invalid tokens.
 *   4. Discovery files (robots.txt, sitemap.xml, llms.txt) are served.
 *
 * Usage:
 *   node scripts/smoke/smoke.mjs                       # all configured targets
 *   SMOKE_URL=https://my-app.vercel.app node scripts/smoke/smoke.mjs
 *   SMOKE_TARGETS="vercel=https://a,render=https://b" node scripts/smoke/smoke.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

export const CRITICAL_ROUTES = [
  "/",
  "/work",
  "/work/lumina",
  "/services",
  "/behind-the-scenes",
  "/about",
  "/contact",
  "/quote",
  "/admin",
];

const STATIC_FILES = ["/robots.txt", "/sitemap.xml", "/llms.txt"];

export function resolveTargets(env = process.env) {
  if (env.SMOKE_URL) return { local: env.SMOKE_URL };
  if (env.SMOKE_TARGETS) {
    return Object.fromEntries(
      env.SMOKE_TARGETS.split(",")
        .map((pair) => pair.split("=").map((s) => s.trim()))
        .filter(([name, url]) => name && url),
    );
  }
  const cfg = JSON.parse(readFileSync(join(here, "targets.json"), "utf8"));
  return Object.fromEntries(Object.entries(cfg.targets).filter(([, url]) => url));
}

const results = [];
const record = (target, name, ok, detail = "") => {
  results.push({ target, name, ok, detail });
  const mark = ok ? "\u001b[32mPASS\u001b[0m" : "\u001b[31mFAIL\u001b[0m";
  console.log(`  ${mark} ${name}${detail ? ` — ${detail}` : ""}`);
};

async function get(url, init) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20000);
  try {
    return await fetch(url, { redirect: "follow", signal: controller.signal, ...init });
  } finally {
    clearTimeout(t);
  }
}

async function checkTarget(name, baseUrl) {
  const base = baseUrl.replace(/\/$/, "");
  console.log(`\n\u001b[1m${name}\u001b[0m  ${base}`);

  let indexHtml = "";

  for (const route of CRITICAL_ROUTES) {
    try {
      const res = await get(base + route);
      const body = await res.text();
      const isHtml = /<div id="root"/.test(body);
      if (route === "/admin") indexHtml = body;
      record(
        name,
        `route ${route}`,
        res.ok && isHtml,
        res.ok
          ? isHtml
            ? String(res.status)
            : "no SPA shell (#root) — SPA fallback missing on this host"
          : `HTTP ${res.status}`,
      );
    } catch (e) {
      record(name, `route ${route}`, false, String(e?.message ?? e));
    }
  }

  try {
    const scriptSrc = indexHtml.match(/<script[^>]+src="([^"]+\.js)"/)?.[1];
    if (!scriptSrc) {
      record(name, "bundle has backend config", false, "no module script in index.html");
    } else {
      const bundleUrl = scriptSrc.startsWith("http") ? scriptSrc : base + scriptSrc;
      const js = await (await get(bundleUrl)).text();
      const hasUrl = /https:\/\/[a-z0-9]+\.supabase\.co/.test(js);
      record(name, "bundle has backend config", hasUrl, hasUrl ? "" : "VITE_SUPABASE_* missing at build time");
    }
  } catch (e) {
    record(name, "bundle has backend config", false, String(e?.message ?? e));
  }

  for (const file of STATIC_FILES) {
    try {
      const res = await get(base + file);
      record(name, `static ${file}`, res.ok, res.ok ? "" : `HTTP ${res.status}`);
    } catch (e) {
      record(name, `static ${file}`, false, String(e?.message ?? e));
    }
  }
}

async function checkAuthGating() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  console.log(`\n\u001b[1mauth gating\u001b[0m  (admin edge functions)`);
  if (!url || !key) {
    record("auth", "admin auth gating", false, "VITE_SUPABASE_URL / _PUBLISHABLE_KEY not in env");
    return;
  }
  const post = (fn, body) =>
    get(`${url}/functions/v1/${fn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });

  const cases = [
    ["rejects wrong password", () => post("admin-auth", { action: "login", password: "definitely-not-it" })],
    ["rejects forged token", () => post("admin-auth", { action: "verify", token: "admin.9999999999999.forged" })],
    ["admin-db rejects missing token", () => post("admin-db", { op: "select", table: "quote_requests" })],
    [
      "admin-db rejects forged token",
      () => post("admin-db", { op: "select", table: "quote_requests", token: "admin.9999999999999.forged" }),
    ],
  ];

  for (const [label, run] of cases) {
    try {
      const res = await run();
      record("auth", label, res.status === 401, `HTTP ${res.status}`);
    } catch (e) {
      record("auth", label, false, String(e?.message ?? e));
    }
  }
}

async function main() {
  const targets = resolveTargets();
  if (!Object.keys(targets).length) {
    console.error("No targets configured. Fill scripts/smoke/targets.json or set SMOKE_URL / SMOKE_TARGETS.");
    process.exit(2);
  }
  for (const [name, url] of Object.entries(targets)) await checkTarget(name, url);
  await checkAuthGating();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log("\nFailures:");
    for (const f of failed) console.log(`  - [${f.target}] ${f.name}: ${f.detail}`);
    process.exit(1);
  }
}

const invoked = process.argv[1]?.endsWith("smoke.mjs");
if (invoked) main();
