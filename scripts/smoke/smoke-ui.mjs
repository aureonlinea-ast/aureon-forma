#!/usr/bin/env node
/**
 * Deployment smoke tests — browser layer (optional, needs Playwright).
 *
 *   npx --yes playwright@1 install chromium   # once
 *   SMOKE_URL=https://my-app.vercel.app ADMIN_PASSWORD='...' node scripts/smoke/smoke-ui.mjs
 *
 * Without ADMIN_PASSWORD it still asserts the gate (login screen renders, no
 * dashboard leaks). With it, it logs in and asserts the dashboard UI renders.
 */

import { resolveTargets, CRITICAL_ROUTES } from "./smoke.mjs";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright is not installed. Run: npx --yes playwright@1 install chromium");
  process.exit(2);
}

const results = [];
const record = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? "\u001b[32mPASS\u001b[0m" : "\u001b[31mFAIL\u001b[0m"} ${name}${detail ? ` — ${detail}` : ""}`);
};

async function run(name, base) {
  console.log(`\n\u001b[1m${name}\u001b[0m  ${base}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  try {
    for (const route of CRITICAL_ROUTES.filter((r) => r !== "/admin")) {
      await page.goto(base + route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);
      const rendered = await page.locator("#root *").count();
      const title = await page.title();
      record(`renders ${route}`, rendered > 5 && !!title, `${rendered} nodes, title "${title}"`);
    }

    // Auth gating
    await page.goto(base + "/admin", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    const loginVisible = await page.getByPlaceholder("Enter password").isVisible().catch(() => false);
    record("/admin shows the login gate", loginVisible);

    const bodyText = (await page.locator("body").innerText()).toLowerCase();
    const leaked = ["overview", "invoices", "quote template"].some((t) => bodyText.includes(t));
    record("/admin leaks no dashboard data while signed out", !leaked);

    if (loginVisible) {
      await page.getByPlaceholder("Enter password").fill("wrong-password");
      await page.getByRole("button", { name: /access dashboard/i }).click();
      await page.waitForTimeout(2500);
      const stillGated = await page.getByPlaceholder("Enter password").isVisible().catch(() => false);
      record("/admin rejects a wrong password", stillGated);
    }

    const pw = process.env.ADMIN_PASSWORD;
    if (pw && loginVisible) {
      await page.getByPlaceholder("Enter password").fill(pw);
      await page.getByRole("button", { name: /access dashboard/i }).click();
      await page.waitForTimeout(4000);
      const text = await page.locator("body").innerText();
      const ok = /Overview/i.test(text) && /Aureon Admin|Analytics/i.test(text);
      record("/admin dashboard renders after login", ok);
      for (const tab of ["Analytics", "Clients"]) {
        const btn = page.getByRole("button", { name: new RegExp(`^${tab}$`, "i") }).first();
        if (await btn.isVisible().catch(() => false)) {
          await btn.click();
          await page.waitForTimeout(1500);
          record(`admin tab ${tab} renders`, (await page.locator("#root *").count()) > 20);
        }
      }
      // session survives a hard refresh (proves SPA fallback + token verify)
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(4000);
      const stillIn = !(await page.getByPlaceholder("Enter password").isVisible().catch(() => false));
      record("admin session survives a hard refresh on /admin", stillIn);
    } else if (!pw) {
      console.log("  (set ADMIN_PASSWORD to also smoke-test the signed-in dashboard)");
    }

    record("no uncaught page errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));
  } finally {
    await browser.close();
  }
}

const targets = resolveTargets();
for (const [name, url] of Object.entries(targets)) await run(name, url.replace(/\/$/, ""));

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
