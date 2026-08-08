import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

/**
 * Guards the off-Lovable deployment contract: every platform target must keep
 * an SPA fallback so /admin (and every other deep link) resolves after a hard
 * refresh. Losing one of these silently 404s the admin dashboard in prod.
 */
describe("platform deploy targets", () => {
  it("Vercel rewrites everything to index.html", () => {
    const cfg = JSON.parse(readFileSync("vercel.json", "utf8"));
    expect(cfg.rewrites?.some((r: { destination: string }) => r.destination === "/index.html")).toBe(true);
  });

  it("Netlify / Cloudflare Pages keep the 200 fallback", () => {
    expect(readFileSync("netlify.toml", "utf8")).toMatch(/to\s*=\s*"\/index\.html"/);
    expect(readFileSync("public/_redirects", "utf8")).toMatch(/\/\*\s+\/index\.html\s+200/);
  });

  it("Render rewrites to index.html and builds to dist", () => {
    const yaml = readFileSync("render.yaml", "utf8");
    expect(yaml).toMatch(/destination:\s*\/index\.html/);
    expect(yaml).toMatch(/staticPublishPath:\s*\.\/dist/);
  });

  it("Railway serves the SPA with a fallback", () => {
    const cfg = JSON.parse(readFileSync("railway.json", "utf8"));
    expect(cfg.deploy.startCommand).toMatch(/serve@?\d*\s+-s\s+dist/);
    expect(readFileSync("nixpacks.toml", "utf8")).toMatch(/serve@?\d*\s+-s\s+dist/);
  });

  it("Azure Static Web Apps sets the navigation fallback", () => {
    const cfg = JSON.parse(readFileSync("public/staticwebapp.config.json", "utf8"));
    expect(cfg.navigationFallback.rewrite).toBe("/index.html");
  });

  it("documents the build-time env vars every host needs", () => {
    const example = readFileSync(".env.example", "utf8");
    for (const key of ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PROJECT_ID"]) {
      expect(example).toContain(key);
    }
  });

  it("ships the smoke test entrypoints", () => {
    expect(existsSync("scripts/smoke/smoke.mjs")).toBe(true);
    expect(existsSync("scripts/smoke/smoke-ui.mjs")).toBe(true);
    expect(existsSync("scripts/smoke/targets.json")).toBe(true);
  });
});
