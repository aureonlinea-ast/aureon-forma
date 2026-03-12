import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import GetQuoteButton from "@/components/GetQuoteButton";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    projectType: "",
    message: "",
    callbackRequested: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from("contact_submissions").insert({
      full_name: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      company: formData.company.trim() || null,
      project_type: formData.projectType || null,
      message: formData.message.trim(),
      callback_requested: formData.callbackRequested,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    toast.success("Message sent! We'll be in touch soon.");
    setFormData({
      fullName: "", email: "", phone: "", company: "",
      projectType: "", message: "", callbackRequested: false,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const inputClasses =
    "w-full glass-surface bg-transparent px-5 py-4 text-sm font-body font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors duration-300";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display font-light text-4xl lg:text-5xl text-foreground tracking-wide mb-4">
              Contact
            </h1>
            <div className="w-12 h-[1px] bg-primary mb-8" />
            <p className="text-sm font-body font-light text-muted-foreground mb-12 leading-relaxed">
              Ready to start a project? Get in touch and let's craft something exceptional.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12 flex flex-col sm:flex-row gap-6"
          >
            <a
              href="https://wa.me/254727750097"
              className="glass-surface px-6 py-4 text-sm font-body font-light text-muted-foreground hover:text-primary transition-colors text-center"
            >
              +254 727 750 097
            </a>
            <a
              href="https://wa.me/254115435031"
              className="glass-surface px-6 py-4 text-sm font-body font-light text-muted-foreground hover:text-primary transition-colors text-center"
            >
              +254 115 435 031
            </a>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className={inputClasses} required />
              <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputClasses} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className={inputClasses} />
              <input name="company" placeholder="Company" value={formData.company} onChange={handleChange} className={inputClasses} />
            </div>
            <select name="projectType" value={formData.projectType} onChange={handleChange} className={inputClasses}>
              <option value="">Project Type</option>
              <option value="archviz">ArchViz</option>
              <option value="architectural-design">Architectural Design</option>
              <option value="modelling">3D Modelling</option>
              <option value="product-visualization">Product Visualization</option>
              <option value="branding">Branding & Marketing</option>
            </select>
            <textarea
              name="message"
              placeholder="Tell us about your project..."
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className={inputClasses + " resize-none"}
              required
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="callbackRequested"
                checked={formData.callbackRequested}
                onChange={handleChange}
                className="w-4 h-4 accent-primary bg-transparent border-border"
              />
              <span className="text-sm font-body font-light text-muted-foreground">
                Request a callback
              </span>
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 glass-surface px-8 py-4 text-sm font-body font-light tracking-[0.2em] uppercase text-foreground hover:text-primary hover:border-primary/50 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </motion.form>

          <div className="mt-16 pt-12 border-t border-border/20">
            <h2 className="font-display text-2xl text-foreground font-light mb-4 tracking-wide">
              Need a detailed quote?
            </h2>
            <p className="text-sm font-body font-light text-muted-foreground mb-6 leading-relaxed">
              Use our quote engine to configure your project and get an instant estimate.
            </p>
            <GetQuoteButton />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
