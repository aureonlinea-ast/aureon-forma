import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type Currency = "USD" | "KES" | "EUR" | "RMB";

interface ServicePrice {
  id: string;
  service_name: string;
  service_category: string;
  base_price: number;
}

interface QuoteRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  project_classification: string;
  project_type: string;
  selected_services: string[];
  timeline: string;
  requirement_period: string | null;
  estimated_price: number | null;
  additional_notes: string | null;
  status: string;
  created_at: string;
}

interface Props {
  quotes: QuoteRequest[];
  pricing: ServicePrice[];
  formatDate: (d: string) => string;
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  KES: "KES ",
  EUR: "€",
  RMB: "¥",
};

const QuotesTab = ({ quotes, pricing, formatDate }: Props) => {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1, KES: 1, EUR: 1, CNY: 1 });
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await res.json();
      if (data.rates) {
        setRates({
          USD: 1,
          KES: data.rates.KES || 129,
          EUR: data.rates.EUR || 0.92,
          CNY: data.rates.CNY || 7.24,
        });
      }
    } catch {
      // Fallback rates
      setRates({ USD: 1, KES: 129, EUR: 0.92, CNY: 7.24 });
    }
  };

  const getRate = () => {
    if (currency === "RMB") return rates.CNY || 7.24;
    return rates[currency] || 1;
  };

  const convertPrice = (usdPrice: number) => {
    return (usdPrice * getRate()).toFixed(2);
  };

  const sym = CURRENCY_SYMBOLS[currency];

  const generatePdf = async (quote: QuoteRequest) => {
    setGeneratingPdf(quote.id);
    try {
      // Find service details for this quote
      const services = quote.selected_services.map((name) => {
        const svc = pricing.find((p) => p.service_name === name);
        return svc || { service_name: name, service_category: "general", base_price: 0 };
      });

      const { data, error } = await supabase.functions.invoke("generate-quote-pdf", {
        body: {
          ...quote,
          services,
          currency,
          exchangeRate: getRate(),
        },
      });

      if (error) throw error;

      // Download the PDF
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename || "Aureon-Quote.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-display text-xl text-foreground font-light tracking-wide">
          Quote Requests ({quotes.length})
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-body font-light text-muted-foreground uppercase tracking-wider">Currency:</span>
          {(["USD", "KES", "EUR", "RMB"] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1.5 text-xs font-body font-light tracking-[0.1em] uppercase transition-all duration-300 ${
                currency === c
                  ? "text-primary glass-surface border-primary/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {currency !== "USD" && (
        <p className="text-xs font-body font-light text-muted-foreground">
          Exchange rate: 1 USD = {getRate().toFixed(2)} {currency === "RMB" ? "CNY" : currency} (live)
        </p>
      )}

      {quotes.length === 0 ? (
        <p className="text-sm font-body font-light text-muted-foreground">No quote requests yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((q) => (
            <div key={q.id} className="glass-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm font-body text-foreground">{q.full_name}</p>
                  <p className="text-xs font-body font-light text-muted-foreground">
                    {q.email} {q.phone && `· ${q.phone}`}
                  </p>
                  {q.company && <p className="text-xs font-body font-light text-muted-foreground">{q.company}</p>}
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="font-display text-xl text-primary">
                    {sym}{Number(convertPrice(q.estimated_price || 0)).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-body px-2 py-1 ${
                      q.status === "pending" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {q.status}
                    </span>
                    <button
                      onClick={() => generatePdf(q)}
                      disabled={generatingPdf === q.id}
                      className="text-xs font-body font-light px-3 py-1 glass-surface text-primary hover:text-primary/80 hover:border-primary/30 transition-all disabled:opacity-50"
                    >
                      {generatingPdf === q.id ? "Generating..." : "↓ PDF"}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div>
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Classification</p>
                  <p className="text-sm font-body font-light text-foreground">{q.project_classification}</p>
                </div>
                <div>
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Type</p>
                  <p className="text-sm font-body font-light text-foreground">{q.project_type}</p>
                </div>
                <div>
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Timeline</p>
                  <p className="text-sm font-body font-light text-foreground">{q.timeline}</p>
                </div>
                <div>
                  <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Engagement</p>
                  <p className="text-sm font-body font-light text-foreground">{q.requirement_period || "One-time"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {q.selected_services.map((s) => (
                  <span key={s} className="text-xs font-body font-light px-2 py-1 glass-surface text-muted-foreground">{s}</span>
                ))}
              </div>
              {q.additional_notes && (
                <p className="text-sm font-body font-light text-muted-foreground mt-2">{q.additional_notes}</p>
              )}
              <p className="text-xs font-body font-light text-muted-foreground mt-2">{formatDate(q.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default QuotesTab;
