import { supabase } from "@/integrations/supabase/client";

const TOKEN_KEY = "aureon_admin_token";

export const setAdminToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const getAdminToken = () => localStorage.getItem(TOKEN_KEY) ?? "";
export const clearAdminToken = () => localStorage.removeItem(TOKEN_KEY);

type Eq = Record<string, string | number | boolean | null>;

interface SelectOpts {
  columns?: string;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  eq?: Eq;
  single?: boolean;
}

async function call(payload: Record<string, unknown>) {
  const token = getAdminToken();
  const { data, error } = await supabase.functions.invoke("admin-db", {
    body: { token, ...payload },
  });
  if (error) return { data: null, error };
  if (data?.error) return { data: null, error: new Error(data.error) };
  return { data: data?.data ?? null, error: null as Error | null };
}

export const adminDb = {
  select: (table: string, opts: SelectOpts = {}) =>
    call({ op: "select", table, ...opts }),
  insert: (table: string, values: unknown) =>
    call({ op: "insert", table, values }),
  update: (table: string, values: unknown, eq: Eq) =>
    call({ op: "update", table, values, eq }),
  delete: (table: string, eq: Eq) =>
    call({ op: "delete", table, eq }),
};