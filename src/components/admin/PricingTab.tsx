import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCurrencies, type CurrencyRate } from "@/hooks/useCurrencies";

interface ServicePrice {
  id: string;
  service_name: string;
  service_category: string;
  base_price: number;
  price_per_unit: string | null;
  description: string | null;
  is_active: boolean;
  currency?: string;
}

const PricingTab = () => {
  const { currencies: liveCurrencies } = useCurrencies();
  const [pricing, setPricing] = useState<ServicePrice[]>([]);
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState({
    service_name: "",
    service_category: "archviz",
    base_price: 0,
    price_per_unit: "",
    description: "",
    currency: "USD",
  });

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setRates(liveCurrencies);
  }, [liveCurrencies]);

  const fetchAll = async () => {
    const [pRes, cRes] = await Promise.all([
      supabase.from("service_pricing").select("*").order("service_category"),
      supabase.from("currency_rates" as any).select("*").order("code"),
    ]);
    if (pRes.data) setPricing(pRes.data as ServicePrice[]);
    if (cRes.data) setRates(cRes.data as unknown as CurrencyRate[]);
  };

  const updateRow = (id: string, patch: Partial<ServicePrice>) => {
    setPricing((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const saveRow = async (row: ServicePrice) => {
    setSavingId(row.id);
    const { error } = await supabase
      .from("service_pricing")
      .update({
        service_name: row.service_name,
        service_category: row.service_category,
        base_price: Number(row.base_price) || 0,
        price_per_unit: row.price_per_unit,
        description: row.description,
        is_active: row.is_active,
        currency: row.currency || "USD",
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", row.id);
    setSavingId(null);
    if (error) toast.error("Save failed");
    else toast.success("Saved");
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Delete this pricing item?")) return;
    await supabase.from("service_pricing").delete().eq("id", id);
    setPricing((prev) => prev.filter((p) => p.id !== id));
  };

  const addRow = async () => {
    if (!newRow.service_name.trim()) {
      toast.error("Service name required");
      return;
    }
    const { data, error } = await supabase
      .from("service_pricing")
      .insert({
        service_name: newRow.service_name.trim(),
        service_category: newRow.service_category,
        base_price: Number(newRow.base_price) || 0,
        price_per_unit: newRow.price_per_unit || null,
        description: newRow.description || null,
        currency: newRow.currency,
      } as any)
      .select()
      .single();
    if (error) {
      toast.error("Add failed: " + error.message);
      return;
    }
    setPricing((prev) => [...prev, data as ServicePrice]);
    setNewRow({ service_name: "", service_category: "archviz", base_price: 0, price_per_unit: "", description: "", currency: "USD" });
    toast.success("Added");
  };

  const updateRate = (code: string, patch: Partial<CurrencyRate>) => {
    setRates((prev) => prev.map((r) => (r.code === code ? { ...r, ...patch } : r)));
  };

  const saveRate = async (rate: CurrencyRate) => {
    const { error } = await supabase
      .from("currency_rates" as any)
      .update({
        name: rate.name,
        symbol: rate.symbol,
        rate_to_usd: Number(rate.rate_to_usd) || 1,
        is_active: rate.is_active,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("code", rate.code);
    if (error) toast.error("Save failed");
    else toast.success(`${rate.code} updated`);
  };

  const field =
    "glass-surface bg-transparent px-3 py-2 text-sm font-body font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors w-full";
  const label =
    "text-[10px] font-body font-light tracking-[0.2em] uppercase text-muted-foreground mb-1 block";

  const categories = Array.from(new Set(pricing.map((p) => p.service_category))).sort();
  const allCategories = ["archviz", "architectural-design", "modelling", "product-visualization", "branding", "vr", ...categories];
  const uniqueCats = Array.from(new Set(allCategories));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-12">
      {/* Currencies */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground font-light tracking-wide">Currencies</h2>
          <p className="text-xs font-body font-light text-muted-foreground">
            Rates are vs. USD. Edit & save per row.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm font-body font-light">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border/30">
                <th className="py-3 pr-4">Code</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Symbol</th>
                <th className="py-3 pr-4">Rate / USD</th>
                <th className="py-3 pr-4">Active</th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.code} className="border-b border-border/20">
                  <td className="py-2 pr-4 text-primary">{r.code}</td>
                  <td className="py-2 pr-4"><input className={field} value={r.name} onChange={(e) => updateRate(r.code, { name: e.target.value })} /></td>
                  <td className="py-2 pr-4"><input className={field + " w-20"} value={r.symbol} onChange={(e) => updateRate(r.code, { symbol: e.target.value })} /></td>
                  <td className="py-2 pr-4"><input type="number" step="0.0001" className={field + " w-32"} value={r.rate_to_usd} onChange={(e) => updateRate(r.code, { rate_to_usd: parseFloat(e.target.value) || 0 })} /></td>
                  <td className="py-2 pr-4">
                    <input type="checkbox" checked={r.is_active} onChange={(e) => updateRate(r.code, { is_active: e.target.checked })} />
                  </td>
                  <td className="py-2">
                    <button onClick={() => saveRate(r)} className="text-xs text-primary hover:text-foreground transition-colors uppercase tracking-[0.15em]">Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing items */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground font-light tracking-wide">Service Pricing</h2>
          <p className="text-xs font-body font-light text-muted-foreground">
            Shared by /quote and every service request form.
          </p>
        </div>

        {/* Add new */}
        <div className="glass-surface p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-end">
          <div className="lg:col-span-2">
            <label className={label}>Service name *</label>
            <input className={field} value={newRow.service_name} onChange={(e) => setNewRow({ ...newRow, service_name: e.target.value })} />
          </div>
          <div>
            <label className={label}>Category</label>
            <select className={field} value={newRow.service_category} onChange={(e) => setNewRow({ ...newRow, service_category: e.target.value })}>
              {uniqueCats.map((c) => <option key={c} value={c} className="bg-background">{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Price</label>
            <input type="number" className={field} value={newRow.base_price} onChange={(e) => setNewRow({ ...newRow, base_price: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <label className={label}>Currency</label>
            <select className={field} value={newRow.currency} onChange={(e) => setNewRow({ ...newRow, currency: e.target.value })}>
              {rates.map((r) => <option key={r.code} value={r.code} className="bg-background">{r.code}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Unit</label>
            <input className={field} placeholder="per image" value={newRow.price_per_unit} onChange={(e) => setNewRow({ ...newRow, price_per_unit: e.target.value })} />
          </div>
          <div>
            <button onClick={addRow} className="glass-surface px-4 py-2 text-xs uppercase tracking-[0.15em] text-primary hover:border-primary/50 transition-all w-full">Add</button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm font-body font-light">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.15em] text-muted-foreground border-b border-border/30">
                <th className="py-3 pr-3">Service</th>
                <th className="py-3 pr-3">Category</th>
                <th className="py-3 pr-3">Price</th>
                <th className="py-3 pr-3">Curr.</th>
                <th className="py-3 pr-3">Unit</th>
                <th className="py-3 pr-3">Active</th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {pricing.map((p) => (
                <tr key={p.id} className="border-b border-border/20 align-top">
                  <td className="py-2 pr-3 min-w-[220px]">
                    <input className={field} value={p.service_name} onChange={(e) => updateRow(p.id, { service_name: e.target.value })} />
                    <input className={field + " mt-1 text-xs"} placeholder="description" value={p.description ?? ""} onChange={(e) => updateRow(p.id, { description: e.target.value })} />
                  </td>
                  <td className="py-2 pr-3 min-w-[160px]">
                    <select className={field} value={p.service_category} onChange={(e) => updateRow(p.id, { service_category: e.target.value })}>
                      {uniqueCats.map((c) => <option key={c} value={c} className="bg-background">{c}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-3 w-28"><input type="number" className={field} value={p.base_price} onChange={(e) => updateRow(p.id, { base_price: parseFloat(e.target.value) || 0 })} /></td>
                  <td className="py-2 pr-3 w-24">
                    <select className={field} value={p.currency ?? "USD"} onChange={(e) => updateRow(p.id, { currency: e.target.value })}>
                      {rates.map((r) => <option key={r.code} value={r.code} className="bg-background">{r.code}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-3 w-32"><input className={field} value={p.price_per_unit ?? ""} onChange={(e) => updateRow(p.id, { price_per_unit: e.target.value })} /></td>
                  <td className="py-2 pr-3"><input type="checkbox" checked={p.is_active} onChange={(e) => updateRow(p.id, { is_active: e.target.checked })} /></td>
                  <td className="py-2 whitespace-nowrap">
                    <button onClick={() => saveRow(p)} disabled={savingId === p.id} className="text-xs text-primary hover:text-foreground transition-colors uppercase tracking-[0.15em] mr-3">
                      {savingId === p.id ? "…" : "Save"}
                    </button>
                    <button onClick={() => deleteRow(p.id)} className="text-xs text-destructive hover:text-destructive/70 uppercase tracking-[0.15em]">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
};

export default PricingTab;