import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_TABLES = new Set([
  "contact_submissions",
  "quote_requests",
  "invoices",
  "service_pricing",
  "currency_rates",
  "quote_template",
]);

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

async function verifyToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expStr, sig] = parts;
  const expected = await hmac(`${role}.${expStr}`, secret);
  if (!timingSafeEqual(sig, expected)) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return role === "admin";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!adminPassword || !supabaseUrl || !serviceKey) {
      return json({ error: "Server not configured" }, 500);
    }

    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Invalid body" }, 400);

    const token = String(body.token ?? "");
    if (!token || !(await verifyToken(token, adminPassword))) {
      return json({ error: "Unauthorized" }, 401);
    }

    const op = String(body.op ?? "");
    const table = String(body.table ?? "");
    if (!ALLOWED_TABLES.has(table)) return json({ error: "Forbidden table" }, 400);

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    let query: any = supabase.from(table);

    if (op === "select") {
      query = query.select(body.columns ?? "*");
      if (body.order) {
        query = query.order(body.order.column, { ascending: !!body.order.ascending });
      }
      if (body.limit) query = query.limit(Number(body.limit));
      if (body.eq) for (const [k, v] of Object.entries(body.eq)) query = query.eq(k, v);
      if (body.single) query = query.single();
      const { data, error } = await query;
      if (error) return json({ error: error.message }, 400);
      return json({ data });
    }

    if (op === "insert") {
      const { data, error } = await supabase.from(table).insert(body.values).select();
      if (error) return json({ error: error.message }, 400);
      return json({ data });
    }

    if (op === "update") {
      let q: any = supabase.from(table).update(body.values);
      if (body.eq) for (const [k, v] of Object.entries(body.eq)) q = q.eq(k, v);
      const { data, error } = await q.select();
      if (error) return json({ error: error.message }, 400);
      return json({ data });
    }

    if (op === "delete") {
      let q: any = supabase.from(table).delete();
      if (body.eq) for (const [k, v] of Object.entries(body.eq)) q = q.eq(k, v);
      const { error } = await q;
      if (error) return json({ error: error.message }, 400);
      return json({ data: true });
    }

    return json({ error: "Unknown op" }, 400);
  } catch (e) {
    return json({ error: "Internal error" }, 500);
  }
});