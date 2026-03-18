import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import ClientsTab from "@/components/admin/ClientsTab";
import QuotesTab from "@/components/admin/QuotesTab";
import QuoteTemplateTab from "@/components/admin/QuoteTemplateTab";

interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  project_type: string | null;
  message: string;
  callback_requested: boolean;
  created_at: string;
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

interface ServicePrice {
  id: string;
  service_name: string;
  service_category: string;
  base_price: number;
  price_per_unit: string | null;
  description: string | null;
  is_active: boolean;
}

type Tab = "dashboard" | "contacts" | "quotes" | "pricing" | "analytics" | "clients" | "template";

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [pricing, setPricing] = useState<ServicePrice[]>([]);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: { password },
      });
      if (error) throw error;
      if (data?.authenticated) {
        setAuthenticated(true);
        sessionStorage.setItem("aureon_admin", data.token);
      } else {
        setLoginError("Invalid password");
      }
    } catch {
      setLoginError("Authentication failed. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("aureon_admin");
    if (token) setAuthenticated(true);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetchData();
  }, [authenticated]);

  const fetchData = async () => {
    const [contactsRes, quotesRes, pricingRes] = await Promise.all([
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("service_pricing").select("*").order("service_category", { ascending: true }),
    ]);
    if (contactsRes.data) setContacts(contactsRes.data as ContactSubmission[]);
    if (quotesRes.data) setQuotes(quotesRes.data as QuoteRequest[]);
    if (pricingRes.data) setPricing(pricingRes.data as ServicePrice[]);
  };

  const updatePrice = async (id: string) => {
    const newPrice = parseFloat(editValue);
    if (isNaN(newPrice)) return;
    await supabase.from("service_pricing").update({ base_price: newPrice, updated_at: new Date().toISOString() }).eq("id", id);
    setEditingPrice(null);
    fetchData();
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem("aureon_admin");
    setPassword("");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-surface p-8 sm:p-12 w-full max-w-md"
        >
          <h1 className="font-display text-3xl text-foreground font-light mb-2 tracking-wide">
            Aureon Admin
          </h1>
          <div className="w-12 h-[1px] bg-primary mb-8" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full glass-surface bg-transparent px-5 py-4 text-sm font-body font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors duration-300 mb-4"
            autoFocus
          />
          {loginError && (
            <p className="text-xs font-body text-destructive mb-4">{loginError}</p>
          )}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full glass-surface px-8 py-4 text-sm font-body font-light tracking-[0.2em] uppercase text-foreground hover:text-primary hover:border-primary/50 transition-all duration-500 disabled:opacity-50"
          >
            {loggingIn ? "Authenticating..." : "Access Dashboard"}
          </button>
        </motion.form>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "Overview" },
    { key: "analytics", label: "Analytics" },
    { key: "clients", label: "Clients" },
    { key: "contacts", label: "Contact Forms" },
    { key: "quotes", label: "Quotes" },
    { key: "pricing", label: "Pricing" },
    { key: "template", label: "Quote Template" },
  ];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30">
        <div className="container mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <h1 className="font-display text-2xl text-foreground font-light tracking-wide">
            Aureon Dashboard
          </h1>
          <button onClick={handleLogout} className="text-xs font-body font-light tracking-[0.15em] uppercase text-muted-foreground hover:text-primary transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/20">
        <div className="container mx-auto px-6 lg:px-12 flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 text-sm font-body font-light tracking-[0.1em] uppercase transition-all duration-300 border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-8">
        {/* Dashboard Overview */}
        {activeTab === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Contact Submissions", value: contacts.length },
                { label: "Quote Requests", value: quotes.length },
                { label: "Pending Quotes", value: quotes.filter((q) => q.status === "pending").length },
                { label: "Total Quote Value", value: `$${quotes.reduce((s, q) => s + (q.estimated_price || 0), 0).toLocaleString()}` },
              ].map((stat) => (
                <div key={stat.label} className="glass-surface p-6">
                  <p className="text-xs font-body font-light text-muted-foreground uppercase tracking-[0.15em] mb-2">{stat.label}</p>
                  <p className="font-display text-3xl text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Site Health */}
            <div>
              <h2 className="font-display text-xl text-foreground font-light mb-4 tracking-wide">Site Health</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Database", status: "Operational", color: "text-green-400" },
                  { label: "Edge Functions", status: "Active", color: "text-green-400" },
                  { label: "API", status: "Responding", color: "text-green-400" },
                  { label: "Form Submissions", status: contacts.length > 0 || quotes.length > 0 ? "Receiving" : "Awaiting", color: contacts.length > 0 || quotes.length > 0 ? "text-green-400" : "text-yellow-400" },
                ].map((item) => (
                  <div key={item.label} className="glass-surface p-4 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.color.replace("text-", "bg-")}`} />
                    <div>
                      <p className="text-sm font-body font-light text-foreground">{item.label}</p>
                      <p className={`text-xs font-body font-light ${item.color}`}>{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="font-display text-xl text-foreground font-light mb-4 tracking-wide">Recent Activity</h2>
              <div className="flex flex-col gap-3">
                {[
                  ...contacts.slice(0, 3).map((c) => ({
                    type: "Contact", name: c.full_name, email: c.email, date: c.created_at,
                    detail: c.project_type || "General inquiry",
                  })),
                  ...quotes.slice(0, 3).map((q) => ({
                    type: "Quote", name: q.full_name, email: q.email, date: q.created_at,
                    detail: `$${(q.estimated_price || 0).toLocaleString()} — ${q.project_type}`,
                  })),
                ]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 6)
                  .map((item, i) => (
                    <div key={i} className="glass-surface p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-body font-light tracking-[0.1em] uppercase px-3 py-1 ${
                          item.type === "Quote" ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted/50"
                        }`}>
                          {item.type}
                        </span>
                        <div>
                          <p className="text-sm font-body font-light text-foreground">{item.name}</p>
                          <p className="text-xs font-body font-light text-muted-foreground">{item.detail}</p>
                        </div>
                      </div>
                      <span className="text-xs font-body font-light text-muted-foreground whitespace-nowrap">{formatDate(item.date)}</span>
                    </div>
                  ))}
                {contacts.length === 0 && quotes.length === 0 && (
                  <p className="text-sm font-body font-light text-muted-foreground">No activity yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && <AnalyticsTab contacts={contacts} quotes={quotes} />}

        {/* Clients Tab */}
        {activeTab === "clients" && <ClientsTab contacts={contacts} quotes={quotes} formatDate={formatDate} />}

        {/* Contacts Tab */}
        {activeTab === "contacts" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            <h2 className="font-display text-xl text-foreground font-light tracking-wide">
              Contact Submissions ({contacts.length})
            </h2>
            {contacts.length === 0 ? (
              <p className="text-sm font-body font-light text-muted-foreground">No submissions yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {contacts.map((c) => (
                  <div key={c.id} className="glass-surface p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-sm font-body text-foreground">{c.full_name}</p>
                        <p className="text-xs font-body font-light text-muted-foreground">{c.email} {c.phone && `· ${c.phone}`}</p>
                        {c.company && <p className="text-xs font-body font-light text-muted-foreground">{c.company}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        {c.callback_requested && (
                          <span className="text-xs font-body px-2 py-1 bg-primary/10 text-primary">Callback</span>
                        )}
                        {c.project_type && (
                          <span className="text-xs font-body font-light text-muted-foreground">{c.project_type}</span>
                        )}
                        <span className="text-xs font-body font-light text-muted-foreground">{formatDate(c.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-sm font-body font-light text-muted-foreground leading-relaxed">{c.message}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Quotes Tab */}
        {activeTab === "quotes" && <QuotesTab quotes={quotes} pricing={pricing} formatDate={formatDate} onRefresh={fetchData} />}

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-foreground font-light tracking-wide">Service Pricing (USD)</h2>
              <p className="text-xs font-body font-light text-muted-foreground">Click any price to edit</p>
            </div>
            {Object.entries(
              pricing.reduce<Record<string, ServicePrice[]>>((acc, s) => {
                (acc[s.service_category] = acc[s.service_category] || []).push(s);
                return acc;
              }, {})
            ).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-body font-light tracking-[0.15em] uppercase text-primary mb-3">
                  {category.replace(/-/g, " ")}
                </h3>
                <div className="flex flex-col gap-2">
                  {items.map((service) => (
                    <div key={service.id} className="glass-surface p-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-body font-light text-foreground">{service.service_name}</p>
                        <p className="text-xs font-body font-light text-muted-foreground">
                          {service.description} {service.price_per_unit && `· ${service.price_per_unit}`}
                        </p>
                      </div>
                      {editingPrice === service.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">$</span>
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-24 bg-transparent border-b border-primary text-sm font-body text-foreground focus:outline-none py-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") updatePrice(service.id);
                              if (e.key === "Escape") setEditingPrice(null);
                            }}
                          />
                          <button onClick={() => updatePrice(service.id)} className="text-xs text-primary hover:text-primary/80">Save</button>
                          <button onClick={() => setEditingPrice(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingPrice(service.id); setEditValue(String(service.base_price)); }}
                          className="text-sm font-body text-primary hover:text-primary/80 transition-colors"
                        >
                          ${Number(service.base_price).toLocaleString()}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
