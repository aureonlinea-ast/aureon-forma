import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const ROLE = "admin";

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)),
  );
  return b64url(sig);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function issueToken(secret: string): Promise<string> {
  const payload = `${ROLE}.${Date.now() + TOKEN_TTL_MS}`;
  const sig = await hmac(payload, secret);
  return `${payload}.${sig}`;
}

async function verifyToken(
  token: string,
  secret: string,
): Promise<{ valid: boolean; role?: string; exp?: number }> {
  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false };
  const [role, expStr, sig] = parts;
  const expected = await hmac(`${role}.${expStr}`, secret);
  if (!timingSafeEqual(sig, expected)) return { valid: false };
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return { valid: false };
  return { valid: true, role, exp };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!adminPassword) return json({ error: "Admin password not configured" }, 500);

    const body = await req.json().catch(() => ({}));
    const action = body?.action ?? "login";

    if (action === "verify") {
      const token = String(body?.token ?? "");
      if (!token) return json({ authenticated: false, role: null }, 401);
      const v = await verifyToken(token, adminPassword);
      if (!v.valid) return json({ authenticated: false, role: null }, 401);
      return json({ authenticated: true, role: v.role, exp: v.exp });
    }

    // login
    const password = String(body?.password ?? "");
    if (password !== adminPassword) {
      return json({ authenticated: false, error: "Invalid password" }, 401);
    }
    const token = await issueToken(adminPassword);
    return json({ authenticated: true, role: ROLE, token });
  } catch (_e) {
    return json({ error: "Internal server error" }, 500);
  }
});
