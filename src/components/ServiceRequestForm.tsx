import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Service } from "@/data/services";
import { useCurrencies, convertPrice, formatPrice } from "@/hooks/useCurrencies";

interface ServicePrice {
  id: string;
  service_name: string;
  service_category: string;
  base_price: number;
  price_per_unit: string | null;
  description: string | null;
  currency?: string;
}

const projectClassifications = [
  "Residential",
  "Commercial",
  "Mixed-Use",
  "Hospital / Healthcare",
  "Hospitality",
  "Educational",
  "Industrial",
];

const projectTypes = [
  "Villa",
  "High-Rise Apartments",
  "Townhouses",
  "Office Tower",
  "Shopping Mall",
  "Hotel / Resort",
  "Hospital",
  "School / University",
  "Warehouse / Factory",
  "Mixed-Use Development",
  "Single Family Home",
  "Other",
];

const timelines = [
  "Urgent (1-2 weeks)",
  "Standard (2-4 weeks)",
  "Relaxed (1-2 months)",
  "Extended (2-4 months)",
  "Flexible",
];

const requirementPeriods = [
  "One-time project",
  "Monthly retainer",
  "Quarterly engagement",
  "Annual partnership",
];

interface ServiceRequestFormProps {
  service: Service;
}

/**
 * Tailored quote form that pre-scopes to a single service category.
 * Uses the same schema (quote_requests) and notification flow as /quote
 * so the back office handles it identically.
 */
const ServiceRequestForm = ({ service }: ServiceRequestFormProps) => {
  const { currencies } = useCurrencies();
  const [pricing, setPricing] = useState<ServicePrice[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [currency, setCurrency] = useState<string>("USD");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    projectClassification: "",
    projectType: "",
    timeline: "",
    requirementPeriod: "",
    additionalNotes: "",
  });

  useEffect(() => {
    const fetchPricing = async () => {
      const { data } = await supabase
        .from("service_pricing")
        .select("*")
        .eq("is_active", true)
        .eq("service_category", service.slug);
      if (data) {
        // Do NOT pre-select — clients pick what they need.
        setPricing(data as ServicePrice[]);
        setSelected([]);
      }
    };
    fetchPricing();
  }, [service.slug]);

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const activeCurrency = currencies.find((c) => c.code === currency);

  // Compounding sum, line-by-line, converted to the selected display currency.
  const lineItems = pricing
    .filter((p) => selected.includes(p.service_name))
    .map((p) => ({
      ...p,
      converted: convertPrice(
        Number(p.base_price),
        (p.currency || "USD"),
        currency,
        currencies
      ),
    }));

  const baseEstimate = lineItems.reduce((sum, p) => sum + p.converted, 0);

  const timelineMultiplier =
    formData.timeline === "Urgent (1-2 weeks)"
      ? 1.5
      : formData.timeline === "Standard (2-4 weeks)"
      ? 1.2
      : 1;

  const finalPrice = Math.round(baseEstimate * timelineMultiplier);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Always submit at least the service title even if no pricing rows exist
    const submittedServices =
      selected.length > 0 ? selected : [service.title];

    setSubmitting(true);

    const payload = {
      full_name: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      company: formData.company.trim() || null,
      project_classification: formData.projectClassification,
      project_type: formData.projectType,
      selected_services: submittedServices,
      timeline: formData.timeline,
      requirement_period: formData.requirementPeriod || null,
      additional_notes:
        `[Service Request: ${service.title}] ` +
        (formData.additionalNotes.trim() || ""),
      estimated_price: finalPrice || null,
      currency,
    };

    const { error } = await supabase.from("quote_requests").insert(payload as any);
    setSubmitting(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    supabase.functions
      .invoke("send-notification", {
        body: { type: "quote", data: payload },
      })
      .catch(console.error);

    toast.success(`${service.title} request submitted. We'll be in touch shortly.`);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      company: "",
      projectClassification: "",
      projectType: "",
      timeline: "",
      requirementPeriod: "",
      additionalNotes: "",
    });
  };

  const input =
    "w-full glass-surface bg-transparent px-5 py-4 text-sm font-body font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors duration-300";
  const select = `${input} appearance-none bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground`;

  return (
    <motion.section
      id="request"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="mt-20 scroll-mt-32"
    >
      <h2 className="font-display text-2xl sm:text-3xl text-foreground font-light mb-2 tracking-wide">
        Request {service.title}
      </h2>
      <div className="w-8 h-[1px] bg-primary mb-4" />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <p className="text-sm font-body font-light text-muted-foreground leading-relaxed max-w-lg">
          Pick the items you need. Your estimate compounds as you select — convertible across currencies.
        </p>
        {currencies.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-body font-light tracking-[0.25em] uppercase text-muted-foreground">
              Currency
            </span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="glass-surface bg-transparent px-3 py-2 text-xs font-body font-light text-foreground focus:outline-none focus:border-primary/50 appearance-none"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code} className="bg-background">
                  {c.code} — {c.symbol}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="fullName" placeholder="Full Name *" value={formData.fullName} onChange={handleChange} className={input} required />
          <input name="email" type="email" placeholder="Email *" value={formData.email} onChange={handleChange} className={input} required />
          <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className={input} />
          <input name="company" placeholder="Company / Studio" value={formData.company} onChange={handleChange} className={input} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select name="projectClassification" value={formData.projectClassification} onChange={handleChange} className={select} required>
            <option value="">Project Classification *</option>
            {projectClassifications.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select name="projectType" value={formData.projectType} onChange={handleChange} className={select} required>
            <option value="">Project Type *</option>
            {projectTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select name="timeline" value={formData.timeline} onChange={handleChange} className={select} required>
            <option value="">Timeline *</option>
            {timelines.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select name="requirementPeriod" value={formData.requirementPeriod} onChange={handleChange} className={select}>
            <option value="">Engagement Type</option>
            {requirementPeriods.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {pricing.length > 0 && (
          <div>
            <h3 className="text-sm font-body font-light tracking-[0.2em] uppercase text-primary mb-4">
              Scope — {service.title} <span className="text-muted-foreground/60 normal-case tracking-normal text-xs">(select what you need)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pricing.map((p) => {
                const isSelected = selected.includes(p.service_name);
                const displayed = convertPrice(
                  Number(p.base_price),
                  p.currency || "USD",
                  currency,
                  currencies
                );
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => toggle(p.service_name)}
                    className={`text-left glass-surface p-4 transition-all duration-300 flex gap-3 items-start ${
                      isSelected ? "border-primary/60 bg-[hsla(43,52%,56%,0.08)]" : "hover:border-border/50"
                    }`}
                  >
                    {/* checkbox */}
                    <span
                      className={`mt-1 shrink-0 w-4 h-4 border flex items-center justify-center transition-colors duration-200 ${
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                      }`}
                      aria-hidden
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="text-sm font-body font-light text-foreground block">
                          {p.service_name}
                        </span>
                        {p.description && (
                          <span className="text-xs font-body font-light text-muted-foreground mt-1 block">
                            {p.description}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-body text-primary block">
                          {formatPrice(displayed, activeCurrency)}
                        </span>
                        {p.price_per_unit && (
                          <span className="text-xs font-body font-light text-muted-foreground">
                            {p.price_per_unit}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {lineItems.length > 0 && (
          <div className="glass-surface p-6 sm:p-8">
            <div className="flex flex-col gap-2 mb-4">
              {lineItems.map((p) => (
                <div key={p.id} className="flex justify-between text-sm font-body font-light">
                  <span className="text-muted-foreground">{p.service_name}</span>
                  <span className="text-foreground">{formatPrice(p.converted, activeCurrency)}</span>
                </div>
              ))}
              {timelineMultiplier > 1 && (
                <div className="flex justify-between text-sm font-body font-light text-primary/80 pt-2 border-t border-border/30">
                  <span>Timeline premium ({formData.timeline})</span>
                  <span>×{timelineMultiplier}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-baseline pt-4 border-t border-border/30">
              <span className="text-xs font-body font-light text-muted-foreground uppercase tracking-[0.2em]">
                Estimated Total
              </span>
              <span className="font-display text-3xl text-primary">
                {formatPrice(finalPrice, activeCurrency)}
              </span>
            </div>
            <p className="text-xs font-body font-light text-muted-foreground mt-3">
              * Compounding estimate. Final pricing confirmed after project review.
            </p>
          </div>
        )}

        <textarea
          name="additionalNotes"
          placeholder={`Tell us about your ${service.title.toLowerCase()} brief...`}
          value={formData.additionalNotes}
          onChange={handleChange}
          rows={4}
          className={input + " resize-none"}
        />

        <button
          type="submit"
          disabled={submitting}
          className="glass-surface px-8 py-4 text-sm font-body font-light tracking-[0.2em] uppercase text-foreground hover:text-primary hover:border-primary/50 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_hsl(var(--gold)/0.15)]"
        >
          {submitting ? "Submitting..." : `Request ${service.title}`}
        </button>
      </form>
    </motion.section>
  );
};

export default ServiceRequestForm;