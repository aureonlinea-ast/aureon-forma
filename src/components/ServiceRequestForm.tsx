import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Service } from "@/data/services";

interface ServicePrice {
  id: string;
  service_name: string;
  service_category: string;
  base_price: number;
  price_per_unit: string | null;
  description: string | null;
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
  const [pricing, setPricing] = useState<ServicePrice[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
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
        const items = data as ServicePrice[];
        setPricing(items);
        // Pre-select all by default for this service category
        if (items.length) setSelected(items.map((i) => i.service_name));
      }
    };
    fetchPricing();
  }, [service.slug]);

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const baseEstimate = pricing
    .filter((p) => selected.includes(p.service_name))
    .reduce((sum, p) => sum + Number(p.base_price), 0);

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
    };

    const { error } = await supabase.from("quote_requests").insert(payload);
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
      <p className="text-sm font-body font-light text-muted-foreground mb-10 leading-relaxed">
        Tell us about your project. We'll respond with a tailored proposal within 48 hours.
      </p>

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
              Scope — {service.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pricing.map((p) => {
                const isSelected = selected.includes(p.service_name);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => toggle(p.service_name)}
                    className={`text-left glass-surface p-4 transition-all duration-300 ${
                      isSelected ? "border-primary/60 bg-[hsla(43,52%,56%,0.08)]" : "hover:border-border/50"
                    }`}
                  >
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
                          ${Number(p.base_price).toLocaleString()}
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

        {finalPrice > 0 && (
          <div className="glass-surface p-6 sm:p-8">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-body font-light text-muted-foreground uppercase tracking-[0.2em]">
                Estimated Total
              </span>
              <span className="font-display text-3xl text-primary">
                ${finalPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-xs font-body font-light text-muted-foreground mt-3">
              * Starting estimate. Final pricing confirmed after project review.
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