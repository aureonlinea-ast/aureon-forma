import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate_to_usd: number;
  is_active: boolean;
}

/**
 * Fetches active currency rates from the public `currency_rates` table.
 * Falls back to a USD-only list so the UI never breaks before approval/seed.
 */
export function useCurrencies() {
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([
    { code: "USD", name: "US Dollar", symbol: "$", rate_to_usd: 1, is_active: true },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("currency_rates" as any)
        .select("*")
        .eq("is_active", true)
        .order("code");
      if (data && Array.isArray(data) && data.length) {
        setCurrencies(data as unknown as CurrencyRate[]);
      }
      setLoading(false);
    })();
  }, []);

  return { currencies, loading };
}

/**
 * Convert a base price (with its own currency) into the display currency.
 * Math: amount_in_usd = base / fromRate. amount_in_target = amount_in_usd * toRate.
 */
export function convertPrice(
  amount: number,
  fromCode: string,
  toCode: string,
  currencies: CurrencyRate[]
): number {
  if (!amount) return 0;
  if (fromCode === toCode) return amount;
  const from = currencies.find((c) => c.code === fromCode);
  const to = currencies.find((c) => c.code === toCode);
  if (!from || !to) return amount;
  const usd = amount / Number(from.rate_to_usd || 1);
  return usd * Number(to.rate_to_usd || 1);
}

export function formatPrice(amount: number, currency: CurrencyRate | undefined): string {
  const symbol = currency?.symbol ?? "$";
  const rounded = Math.round(amount);
  return `${symbol}${rounded.toLocaleString()}`;
}