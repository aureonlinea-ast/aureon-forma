import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuoteRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  selected_services: string[];
  estimated_price: number | null;
  status: string;
}

interface ServicePrice {
  service_name: string;
  base_price: number;
  service_category: string;
}

interface Invoice {
  id: string;
  quote_id: string | null;
  invoice_number: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  services: any[];
  subtotal: number;
  tax_amount: number;
  others_amount: number;
  total: number;
  currency: string;
  payment_plan: string;
  payment_method: string;
  installments: any[];
  status: string;
  notes: string | null;
  created_at: string;
}

interface Props {
  quotes: QuoteRequest[];
  pricing: ServicePrice[];
  formatDate: (d: string) => string;
  onRefresh: () => void;
}

const PAYMENT_PLANS = [
  { value: "standard", label: "Standard (40/30/15/15%)", splits: [40, 30, 15, 15] },
  { value: "monthly_retainer", label: "Monthly Retainer", splits: [25, 25, 25, 25] },
  { value: "quarterly", label: "Quarterly Payment", splits: [50, 50] },
  { value: "full_upfront", label: "Full Upfront", splits: [100] },
];

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mpesa", label: "M-PESA" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-400",
  sent: "bg-blue-500/10 text-blue-400",
  partial: "bg-primary/10 text-primary",
  paid: "bg-emerald-500/10 text-emerald-400",
  overdue: "bg-red-500/10 text-red-400",
  cancelled: "bg-muted text-muted-foreground",
};

const InvoicesTab = ({ quotes, pricing, formatDate, onRefresh }: Props) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [creating, setCreating] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState("");
  const [paymentPlan, setPaymentPlan] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [template, setTemplate] = useState<any>(null);

  useEffect(() => {
    fetchInvoices();
    fetchTemplate();
  }, []);

  const fetchInvoices = async () => {
    const { data } = await supabase.from("invoices" as any).select("*").order("created_at", { ascending: false });
    if (data) setInvoices(data as any);
  };

  const fetchTemplate = async () => {
    const { data } = await supabase.from("quote_template" as any).select("*").limit(1).single();
    if (data) setTemplate(data);
  };

  const createInvoice = async () => {
    if (!selectedQuote) return;
    setCreating(true);
    const quote = quotes.find(q => q.id === selectedQuote);
    if (!quote) { setCreating(false); return; }

    const plan = PAYMENT_PLANS.find(p => p.value === paymentPlan) || PAYMENT_PLANS[0];
    const services = quote.selected_services.map(name => {
      const svc = pricing.find(p => p.service_name === name);
      return { service_name: name, base_price: svc?.base_price || 0, category: svc?.service_category || "general" };
    });

    const subtotal = quote.estimated_price || 0;
    const taxPct = template?.tax_percentage || 0;
    const taxAmount = subtotal * (taxPct / 100);
    const othersAmount = template?.others_amount || 0;
    const total = subtotal + taxAmount + othersAmount;

    const now = new Date();
    const installments = plan.splits.map((pct, i) => ({
      number: i + 1,
      percentage: pct,
      amount: Math.round(total * pct / 100),
      due_date: new Date(now.getTime() + (i + 1) * 30 * 86400000).toISOString().split("T")[0],
      status: "pending",
    }));

    const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const { error } = await supabase.from("invoices" as any).insert({
      quote_id: quote.id,
      invoice_number: invoiceNumber,
      full_name: quote.full_name,
      email: quote.email,
      phone: quote.phone,
      company: quote.company,
      services,
      subtotal,
      tax_amount: taxAmount,
      others_amount: othersAmount,
      total,
      currency: "USD",
      payment_plan: paymentPlan,
      payment_method: paymentMethod,
      installments,
      status: "draft",
    } as any);

    if (error) {
      toast.error("Failed to create invoice");
      console.error(error);
    } else {
      toast.success("Invoice created");
      setSelectedQuote("");
      fetchInvoices();
    }
    setCreating(false);
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    await supabase.from("invoices" as any).update({ status, updated_at: new Date().toISOString() } as any).eq("id", id);
    toast.success(`Invoice status updated to ${status}`);
    fetchInvoices();
  };

  const updateInstallmentStatus = async (invoiceId: string, installmentIndex: number, status: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;
    const updated = [...invoice.installments];
    updated[installmentIndex] = { ...updated[installmentIndex], status };
    await supabase.from("invoices" as any).update({ installments: updated, updated_at: new Date().toISOString() } as any).eq("id", invoiceId);
    toast.success(`Installment ${installmentIndex + 1} marked as ${status}`);
    fetchInvoices();
  };

  const generateInvoicePdf = async (invoice: Invoice) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-quote-pdf", {
        body: {
          ...invoice,
          id: invoice.invoice_number,
          style: "branded",
          template,
          exchangeRate: 1,
          services: invoice.services,
          estimated_price: invoice.subtotal,
        },
      });
      if (error) throw error;
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Aureon-Invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate invoice PDF");
    }
  };

  const approvedQuotes = quotes.filter(q => ["approved", "in_progress", "completed"].includes(q.status));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
      {/* Create Invoice */}
      <div className="glass-surface p-6">
        <h3 className="font-display text-lg text-foreground font-light mb-4 tracking-wide">Create Invoice from Quote</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs font-body font-light text-muted-foreground uppercase tracking-wider block mb-1">Quote</label>
            <select
              value={selectedQuote}
              onChange={e => setSelectedQuote(e.target.value)}
              className="w-full glass-surface bg-transparent px-3 py-2 text-sm font-body text-foreground focus:outline-none"
            >
              <option value="" className="bg-background text-foreground">Select a quote...</option>
              {approvedQuotes.map(q => (
                <option key={q.id} value={q.id} className="bg-background text-foreground">
                  {q.full_name} — ${(q.estimated_price || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-body font-light text-muted-foreground uppercase tracking-wider block mb-1">Payment Plan</label>
            <select
              value={paymentPlan}
              onChange={e => setPaymentPlan(e.target.value)}
              className="w-full glass-surface bg-transparent px-3 py-2 text-sm font-body text-foreground focus:outline-none"
            >
              {PAYMENT_PLANS.map(p => (
                <option key={p.value} value={p.value} className="bg-background text-foreground">{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-body font-light text-muted-foreground uppercase tracking-wider block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full glass-surface bg-transparent px-3 py-2 text-sm font-body text-foreground focus:outline-none"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m.value} value={m.value} className="bg-background text-foreground">{m.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={createInvoice}
          disabled={!selectedQuote || creating}
          className="glass-surface px-6 py-2 text-sm font-body font-light tracking-[0.15em] uppercase text-primary hover:border-primary/50 transition-all disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Invoice"}
        </button>
      </div>

      {/* Invoice List */}
      <h2 className="font-display text-xl text-foreground font-light tracking-wide">
        Invoices ({invoices.length})
      </h2>

      {invoices.length === 0 ? (
        <p className="text-sm font-body font-light text-muted-foreground">No invoices yet. Create one from an approved quote above.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {invoices.map(inv => (
            <div key={inv.id} className="glass-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-body text-foreground font-medium">{inv.invoice_number}</p>
                  <p className="text-sm font-body font-light text-foreground">{inv.full_name}</p>
                  <p className="text-xs font-body font-light text-muted-foreground">{inv.email}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="font-display text-xl text-primary">${Number(inv.total).toLocaleString()}</p>
                  <span className={`text-xs font-body px-2 py-1 ${STATUS_COLORS[inv.status] || "bg-muted text-muted-foreground"}`}>
                    {inv.status}
                  </span>
                </div>
              </div>

              {/* Payment info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Plan</p>
                  <p className="text-sm font-body font-light text-foreground">
                    {PAYMENT_PLANS.find(p => p.value === inv.payment_plan)?.label || inv.payment_plan}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Method</p>
                  <p className="text-sm font-body font-light text-foreground">
                    {PAYMENT_METHODS.find(m => m.value === inv.payment_method)?.label || inv.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Date</p>
                  <p className="text-sm font-body font-light text-foreground">{formatDate(inv.created_at)}</p>
                </div>
              </div>

              {/* Installments */}
              {inv.installments.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-2">Installments</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {inv.installments.map((inst: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between glass-surface p-2 gap-2">
                        <div>
                          <span className="text-xs font-body text-foreground">#{inst.number} — {inst.percentage}%</span>
                          <span className="text-xs font-body text-muted-foreground ml-2">${Number(inst.amount).toLocaleString()}</span>
                          <span className="text-xs font-body text-muted-foreground ml-2">Due: {inst.due_date}</span>
                        </div>
                        <button
                          onClick={() => updateInstallmentStatus(inv.id, idx, inst.status === "paid" ? "pending" : "paid")}
                          className={`text-xs font-body px-2 py-1 transition-all ${
                            inst.status === "paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          {inst.status === "paid" ? "Paid ✓" : "Mark Paid"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border/20">
                <button
                  onClick={() => generateInvoicePdf(inv)}
                  className="text-xs font-body font-light px-3 py-1.5 glass-surface text-primary hover:border-primary/30 transition-all"
                >
                  ↓ Download PDF
                </button>
                {["draft", "sent", "partial", "paid", "overdue", "cancelled"].filter(s => s !== inv.status).map(s => (
                  <button
                    key={s}
                    onClick={() => updateInvoiceStatus(inv.id, s)}
                    className={`text-xs font-body font-light px-3 py-1.5 transition-all ${STATUS_COLORS[s]} hover:opacity-80`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default InvoicesTab;
