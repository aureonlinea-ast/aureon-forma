import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

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

const categoryLabels: Record<string, string> = {
  archviz: "Architectural Visualization",
  "architectural-design": "Architectural Design",
  modelling: "3D Modelling & Physical Models",
  "product-visualization": "Product Visualization",
  branding: "Branding, Marketing & Digital",
  vr: "VR Experiences",
};

const categoryOrder = ["archviz", "architectural-design", "modelling", "product-visualization", "branding", "vr"];

const QuotePage = () => {
  const [services, setServices] = useState<ServicePrice[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPricing = async () => {
      const { data } = await supabase
        .from("service_pricing")
        .select("*")
        .eq("is_active", true)
        .order("service_category", { ascending: true });
      if (data) setServices(data as ServicePrice[]);
    };
    fetchPricing();
  }, []);

  const toggleService = (name: string) => {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const estimatedPrice = services
    .filter((s) => selectedServices.includes(s.service_name))
    .reduce((sum, s) => sum + Number(s.base_price), 0);

  const timelineMultiplier =
    formData.timeline === "Urgent (1-2 weeks)" ? 1.5 :
    formData.timeline === "Standard (2-4 weeks)" ? 1.2 : 1;

  const finalPrice = Math.round(estimatedPrice * timelineMultiplier);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service.");
      return;
    }
    setIsSubmitting(true);

    const { error } = await supabase.from("quote_requests").insert({
      full_name: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      company: formData.company.trim() || null,
      project_classification: formData.projectClassification,
      project_type: formData.projectType,
      selected_services: selectedServices,
      timeline: formData.timeline,
      requirement_period: formData.requirementPeriod || null,
      additional_notes: formData.additionalNotes.trim() || null,
      estimated_price: finalPrice,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    // Send notification to team
    supabase.functions.invoke("send-notification", {
      body: {
        type: "quote",
        data: {
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          company: formData.company.trim() || null,
          project_classification: formData.projectClassification,
          project_type: formData.projectType,
          selected_services: selectedServices,
          timeline: formData.timeline,
          requirement_period: formData.requirementPeriod || null,
          estimated_price: finalPrice,
          additional_notes: formData.additionalNotes.trim() || null,
        },
      },
    }).catch(console.error);

    toast.success("Quote request submitted! We'll get back to you shortly.");
    setFormData({
      fullName: "", email: "", phone: "", company: "",
      projectClassification: "", projectType: "", timeline: "",
      requirementPeriod: "", additionalNotes: "",
    });
    setSelectedServices([]);
  };

  const inputClasses =
    "w-full glass-surface bg-transparent px-5 py-4 text-sm font-body font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors duration-300";

  const selectClasses =
    `${inputClasses} appearance-none bg-background text-foreground [&>option]:bg-background [&>option]:text-foreground`;

  const groupedServices = categoryOrder
    .map((cat) => ({
      category: cat,
      label: categoryLabels[cat],
      items: services.filter((s) => s.service_category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display font-light text-4xl lg:text-5xl text-foreground tracking-wide mb-4">
              Get a Quote
            </h1>
            <div className="w-12 h-[1px] bg-primary mb-4" />
            <p className="text-sm font-body font-light text-muted-foreground mb-12 leading-relaxed max-w-xl">
              Configure your project requirements below and receive an instant estimate. Our team will follow up with a detailed proposal.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-10"
          >
            {/* Personal Info */}
            <section>
              <h2 className="font-display text-xl text-foreground font-light mb-6 tracking-wide">
                Your Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="fullName" placeholder="Full Name *" value={formData.fullName} onChange={handleChange} className={inputClasses} required />
                <input name="email" type="email" placeholder="Email *" value={formData.email} onChange={handleChange} className={inputClasses} required />
                <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className={inputClasses} />
                <input name="company" placeholder="Company / Studio" value={formData.company} onChange={handleChange} className={inputClasses} />
              </div>
            </section>

            {/* Project Details */}
            <section>
              <h2 className="font-display text-xl text-foreground font-light mb-6 tracking-wide">
                Project Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select name="projectClassification" value={formData.projectClassification} onChange={handleChange} className={selectClasses} required>
                  <option value="">Project Classification *</option>
                  {projectClassifications.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select name="projectType" value={formData.projectType} onChange={handleChange} className={selectClasses} required>
                  <option value="">Project Type *</option>
                  {projectTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select name="timeline" value={formData.timeline} onChange={handleChange} className={selectClasses} required>
                  <option value="">Timeline *</option>
                  {timelines.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select name="requirementPeriod" value={formData.requirementPeriod} onChange={handleChange} className={selectClasses}>
                  <option value="">Engagement Type</option>
                  {requirementPeriods.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </section>

            {/* Service Selection */}
            <section>
              <h2 className="font-display text-xl text-foreground font-light mb-2 tracking-wide">
                Select Services
              </h2>
              <p className="text-xs font-body font-light text-muted-foreground mb-6">
                Choose all the services you need. Prices shown are starting rates in USD.
              </p>

              <div className="flex flex-col gap-8">
                {groupedServices.map((group) => (
                  <div key={group.category}>
                    <h3 className="text-sm font-body font-light tracking-[0.15em] uppercase text-primary mb-4">
                      {group.label}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.items.map((service) => {
                        const isSelected = selectedServices.includes(service.service_name);
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => toggleService(service.service_name)}
                            className={`text-left glass-surface p-4 transition-all duration-300 ${
                              isSelected
                                ? "border-primary/60 bg-[hsla(43,52%,56%,0.08)]"
                                : "hover:border-border/50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <span className="text-sm font-body font-light text-foreground block">
                                  {service.service_name}
                                </span>
                                {service.description && (
                                  <span className="text-xs font-body font-light text-muted-foreground mt-1 block">
                                    {service.description}
                                  </span>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-sm font-body text-primary block">
                                  ${Number(service.base_price).toLocaleString()}
                                </span>
                                {service.price_per_unit && (
                                  <span className="text-xs font-body font-light text-muted-foreground">
                                    {service.price_per_unit}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={`mt-2 w-4 h-4 border flex items-center justify-center transition-colors duration-200 ${
                              isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Price Estimate */}
            {selectedServices.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-surface p-6 sm:p-8"
              >
                <h2 className="font-display text-xl text-foreground font-light mb-4 tracking-wide">
                  Estimated Quote
                </h2>
                <div className="flex flex-col gap-2 mb-4">
                  {services
                    .filter((s) => selectedServices.includes(s.service_name))
                    .map((s) => (
                      <div key={s.id} className="flex justify-between text-sm font-body font-light">
                        <span className="text-muted-foreground">{s.service_name}</span>
                        <span className="text-foreground">${Number(s.base_price).toLocaleString()}</span>
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
                  <span className="text-sm font-body font-light text-muted-foreground uppercase tracking-[0.15em]">
                    Estimated Total
                  </span>
                  <span className="font-display text-3xl text-primary">
                    ${finalPrice.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs font-body font-light text-muted-foreground mt-3">
                  * Starting estimate. Final pricing confirmed after project review.
                </p>
              </motion.section>
            )}

            {/* Additional Notes */}
            <textarea
              name="additionalNotes"
              placeholder="Additional notes about your project..."
              value={formData.additionalNotes}
              onChange={handleChange}
              rows={4}
              className={inputClasses + " resize-none"}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="glass-surface px-8 py-4 text-sm font-body font-light tracking-[0.2em] uppercase text-foreground hover:text-primary hover:border-primary/50 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_hsl(var(--gold)/0.15)]"
            >
              {isSubmitting ? "Submitting..." : "Submit Quote Request"}
            </button>
          </motion.form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuotePage;
