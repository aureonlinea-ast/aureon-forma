import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuoteTemplate {
  id: string;
  company_name: string;
  company_website: string;
  company_phone_1: string;
  company_phone_2: string;
  company_address: string;
  validity_days: number;
  tax_label: string;
  tax_percentage: number;
  others_label: string;
  others_amount: number;
  terms_conditions: string[];
  acceptance_text: string;
}

const QuoteTemplateTab = () => {
  const [template, setTemplate] = useState<QuoteTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [newTerm, setNewTerm] = useState("");

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    const { data } = await supabase
      .from("quote_template" as any)
      .select("*")
      .limit(1)
      .single();
    if (data) setTemplate(data as any);
  };

  const updateField = (field: keyof QuoteTemplate, value: any) => {
    if (!template) return;
    setTemplate({ ...template, [field]: value });
  };

  const save = async () => {
    if (!template) return;
    setSaving(true);
    const { error } = await supabase
      .from("quote_template" as any)
      .update({
        company_name: template.company_name,
        company_website: template.company_website,
        company_phone_1: template.company_phone_1,
        company_phone_2: template.company_phone_2,
        company_address: template.company_address,
        validity_days: template.validity_days,
        tax_label: template.tax_label,
        tax_percentage: template.tax_percentage,
        others_label: template.others_label,
        others_amount: template.others_amount,
        terms_conditions: template.terms_conditions,
        acceptance_text: template.acceptance_text,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", template.id);
    if (error) {
      toast.error("Failed to save template");
      console.error(error);
    } else {
      toast.success("Quote template updated");
    }
    setSaving(false);
  };

  const addTerm = () => {
    if (!newTerm.trim() || !template) return;
    updateField("terms_conditions", [...template.terms_conditions, newTerm.trim()]);
    setNewTerm("");
  };

  const removeTerm = (index: number) => {
    if (!template) return;
    updateField("terms_conditions", template.terms_conditions.filter((_, i) => i !== index));
  };

  const updateTerm = (index: number, value: string) => {
    if (!template) return;
    const updated = [...template.terms_conditions];
    updated[index] = value;
    updateField("terms_conditions", updated);
  };

  if (!template) {
    return <p className="text-sm font-body font-light text-muted-foreground">Loading template...</p>;
  }

  const fieldClass = "w-full glass-surface bg-transparent px-4 py-3 text-sm font-body font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors duration-300";
  const labelClass = "text-xs font-body font-light text-muted-foreground uppercase tracking-[0.15em] mb-1.5 block";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-foreground font-light tracking-wide">Quote Template</h2>
        <button
          onClick={save}
          disabled={saving}
          className="glass-surface px-6 py-3 text-sm font-body font-light tracking-[0.15em] uppercase text-primary hover:border-primary/50 transition-all duration-300 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Company Details */}
      <div>
        <h3 className="text-sm font-body font-light tracking-[0.15em] uppercase text-primary mb-4">Company Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Company Name</label>
            <input className={fieldClass} value={template.company_name} onChange={(e) => updateField("company_name", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input className={fieldClass} value={template.company_website} onChange={(e) => updateField("company_website", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone 1</label>
            <input className={fieldClass} value={template.company_phone_1} onChange={(e) => updateField("company_phone_1", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Phone 2</label>
            <input className={fieldClass} value={template.company_phone_2} onChange={(e) => updateField("company_phone_2", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Address</label>
            <input className={fieldClass} value={template.company_address} onChange={(e) => updateField("company_address", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Pricing & Validity */}
      <div>
        <h3 className="text-sm font-body font-light tracking-[0.15em] uppercase text-primary mb-4">Pricing & Validity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>Validity (days)</label>
            <input type="number" className={fieldClass} value={template.validity_days} onChange={(e) => updateField("validity_days", parseInt(e.target.value) || 30)} />
          </div>
          <div>
            <label className={labelClass}>Tax Label</label>
            <input className={fieldClass} value={template.tax_label} onChange={(e) => updateField("tax_label", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Tax %</label>
            <input type="number" step="0.1" className={fieldClass} value={template.tax_percentage} onChange={(e) => updateField("tax_percentage", parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className={labelClass}>{template.others_label} Amount (USD)</label>
            <input type="number" className={fieldClass} value={template.others_amount} onChange={(e) => updateField("others_amount", parseFloat(e.target.value) || 0)} />
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div>
        <h3 className="text-sm font-body font-light tracking-[0.15em] uppercase text-primary mb-4">Terms & Conditions</h3>
        <div className="flex flex-col gap-3">
          {template.terms_conditions.map((term, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-xs text-muted-foreground mt-3 min-w-[20px]">{i + 1}.</span>
              <textarea
                className={`${fieldClass} min-h-[60px] flex-1`}
                value={term}
                onChange={(e) => updateTerm(i, e.target.value)}
              />
              <button
                onClick={() => removeTerm(i)}
                className="text-xs text-destructive hover:text-destructive/80 mt-3 px-2"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              className={`${fieldClass} flex-1`}
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="Add new term..."
              onKeyDown={(e) => e.key === "Enter" && addTerm()}
            />
            <button
              onClick={addTerm}
              className="glass-surface px-4 py-3 text-sm font-body font-light text-primary hover:border-primary/50 transition-all"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Acceptance Text */}
      <div>
        <h3 className="text-sm font-body font-light tracking-[0.15em] uppercase text-primary mb-4">Acceptance Text</h3>
        <input className={fieldClass} value={template.acceptance_text} onChange={(e) => updateField("acceptance_text", e.target.value)} />
      </div>

      {/* Others Label */}
      <div>
        <h3 className="text-sm font-body font-light tracking-[0.15em] uppercase text-primary mb-4">Other Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Others Label</label>
            <input className={fieldClass} value={template.others_label} onChange={(e) => updateField("others_label", e.target.value)} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuoteTemplateTab;
