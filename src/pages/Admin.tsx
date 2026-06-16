import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminDb, setAdminToken, getAdminToken, clearAdminToken } from "@/lib/adminDb";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import ClientsTab from "@/components/admin/ClientsTab";
import QuotesTab from "@/components/admin/QuotesTab";
import QuoteTemplateTab from "@/components/admin/QuoteTemplateTab";
import InvoicesTab from "@/components/admin/InvoicesTab";
import PricingTab from "@/components/admin/PricingTab";

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

type Tab = "dashboard" | "contacts" | "quotes" | "pricing" | "analytics" | "clients" | "template" | "invoices";

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [pricing, setPricing] = useState<ServicePrice[]>([]);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const { data, error } = await supabase.functions.invoke("admin-auth", {
        body: { action: "login", password },
      });
      if (error) throw error;
      if (data?.authenticated && data?.role === "admin" && data?.token) {
        setAuthenticated(true);
        setRole(data.role);
        setAdminToken(data.token);
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
    // Always re-verify the stored token with the server. The token is an
    // HMAC signed by ADMIN_PASSWORD (server-only secret) — it cannot be
    // forged or replayed regardless of where this dashboard is deployed.
    const token = getAdminToken();
    if (!token) {
      setCheckingSession(false);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("admin-auth", {
          body: { action: "verify", token },
        });
        if (!error && data?.authenticated && data?.role === "admin") {
          setAuthenticated(true);
          setRole(data.role);
        } else {
          clearAdminToken();
        }
      } catch {
        clearAdminToken();
      } finally {
        setCheckingSession(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetchData();
  }, [authenticated]);

  const fetchData = async () => {
    const [contactsRes, quotesRes, pricingRes] = await Promise.all([
      adminDb.select("contact_submissions", { order: { column: "created_at", ascending: false } }),
      adminDb.select("quote_requests", { order: { column: "created_at", ascending: false } }),
      adminDb.select("service_pricing", { order: { column: "service_category", ascending: true } }),
    ]);
    if (contactsRes.data) setContacts(contactsRes.data as ContactSubmission[]);
    if (quotesRes.data) setQuotes(quotesRes.data as QuoteRequest[]);
    if (pricingRes.data) setPricing(pricingRes.data as ServicePrice[]);
  };

  const updatePrice = async (id: string) => {
    const newPrice = parseFloat(editValue);
    if (isNaN(newPrice)) return;
    await adminDb.update("service_pricing", { base_price: newPrice, updated_at: new Date().toISOString() }, { id });
    setEditingPrice(null);
    fetchData();
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setRole(null);
    clearAdminToken();
    setPassword("");
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-body font-light tracking-[0.2em] uppercase text-muted-foreground">
            Verifying session
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated || role !== "admin") {
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

  const mainTabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "Overview" },
    { key: "analytics", label: "Analytics" },
    { key: "clients", label: "Clients" },
  ];
  const sideTabs: { key: Tab; label: string }[] = [
    { key: "contacts", label: "Contact Forms" },
    { key: "quotes", label: "Quotes" },
    { key: "invoices", label: "Invoices" },
    { key: "pricing", label: "Pricing" },
    { key: "template", label: "Quote Template" },
  ];
  const allTabs = [...mainTabs, ...sideTabs];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  // ---------- Dashboard infographic data ----------
  const now = new Date();
  const days14 = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const c = contacts.filter((x) => {
      const t = new Date(x.created_at);
      return t >= d && t < next;
    }).length;
    const q = quotes.filter((x) => {
      const t = new Date(x.created_at);
      return t >= d && t < next;
    }).length;
    return { label: d.toLocaleDateString("en-US", { day: "numeric" }), c, q, total: c + q };
  });
  const maxDay = Math.max(1, ...days14.map((d) => d.total));

  const statusBuckets = ["pending", "reviewing", "approved", "rejected"].map((s) => ({
    key: s,
    label: s,
    count: quotes.filter((q) => q.status === s).length,
  }));
  const statusTotal = Math.max(1, statusBuckets.reduce((s, b) => s + b.count, 0));

  const serviceMix: Record<string, number> = {};
  quotes.forEach((q) => q.selected_services.forEach((s) => (serviceMix[s] = (serviceMix[s] || 0) + 1)));
  const topServices = Object.entries(serviceMix).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxService = Math.max(1, ...topServices.map(([, c]) => c));

  const revenueBands = (() => {
    const bands = [
      { label: "< $5k", min: 0, max: 5000 },
      { label: "$5–25k", min: 5000, max: 25000 },
      { label: "$25–100k", min: 25000, max: 100000 },
      { label: "> $100k", min: 100000, max: Infinity },
    ];
    return bands.map((b) => ({
      label: b.label,
      count: quotes.filter((q) => (q.estimated_price || 0) >= b.min && (q.estimated_price || 0) < b.max).length,
    }));
  })();
  const maxBand = Math.max(1, ...revenueBands.map((b) => b.count));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/30">
        <div className="container mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-foreground"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="font-display text-2xl text-foreground font-light tracking-wide">
              Aureon Dashboard
            </h1>
          </div>
          <button onClick={handleLogout} className="text-xs font-body font-light tracking-[0.15em] uppercase text-muted-foreground hover:text-primary transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Horizontal main tabs */}
      <div className="border-b border-border/20">
        <div className="container mx-auto px-6 lg:px-12 flex gap-0 overflow-x-auto scrollbar-hide">
          {mainTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setMobileNavOpen(false); }}
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

      <div className="flex-1 flex">
        {/* Vertical sidebar (desktop) */}
        <aside
          className={`hidden lg:flex flex-col border-r border-border/20 transition-all duration-500 ${
            sidebarCollapsed ? "w-14" : "w-60"
          }`}
        >
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="self-end p-3 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <nav className="flex flex-col gap-1 px-2">
            {sideTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                title={tab.label}
                className={`px-3 py-3 text-left text-xs font-body font-light tracking-[0.15em] uppercase rounded-sm transition-all duration-300 border-l-2 ${
                  activeTab === tab.key
                    ? "text-primary border-primary bg-primary/5"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
                } ${sidebarCollapsed ? "text-center px-0" : ""}`}
              >
                {sidebarCollapsed ? tab.label.charAt(0) : tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile collapsible drawer */}
        {mobileNavOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          >
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-64 h-full bg-background border-r border-border/30 flex flex-col p-4 gap-1"
            >
              <p className="text-[10px] font-body font-light tracking-[0.25em] uppercase text-muted-foreground mb-2 px-3">
                Sections
              </p>
              {allTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setMobileNavOpen(false); }}
                  className={`px-3 py-3 text-left text-xs font-body font-light tracking-[0.15em] uppercase rounded-sm transition-all duration-300 ${
                    activeTab === tab.key
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </motion.aside>
          </div>
        )}

        <div className="flex-1 container mx-auto px-6 lg:px-12 py-8 min-w-0">
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

            {/* Infographics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* 14-day activity */}
              <div className="glass-surface p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-body font-light tracking-[0.2em] uppercase text-primary">14-Day Activity</h3>
                  <div className="flex items-center gap-4 text-[10px] font-body font-light tracking-[0.15em] uppercase text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-primary/40" /> Contacts</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-primary" /> Quotes</span>
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-32">
                  {days14.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 group relative">
                      <div className="w-full bg-primary/40 transition-all" style={{ height: `${(d.c / maxDay) * 100}%`, minHeight: d.c > 0 ? "2px" : "0" }} />
                      <div className="w-full bg-primary transition-all" style={{ height: `${(d.q / maxDay) * 100}%`, minHeight: d.q > 0 ? "2px" : "0" }} />
                      <span className="text-[9px] font-body font-light text-muted-foreground text-center mt-1">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status donut */}
              <div className="glass-surface p-6">
                <h3 className="text-xs font-body font-light tracking-[0.2em] uppercase text-primary mb-4">Quote Status</h3>
                <div className="flex items-center gap-6">
                  <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                    {(() => {
                      let offset = 0;
                      const colors = ["hsl(45 70% 60%)", "hsl(45 50% 50%)", "hsl(140 50% 50%)", "hsl(0 60% 55%)"];
                      return statusBuckets.map((b, i) => {
                        const pct = (b.count / statusTotal) * 100;
                        const el = (
                          <circle
                            key={b.key}
                            cx="18" cy="18" r="15.9"
                            fill="transparent"
                            stroke={colors[i]}
                            strokeWidth="3.5"
                            strokeDasharray={`${pct} ${100 - pct}`}
                            strokeDashoffset={-offset}
                          />
                        );
                        offset += pct;
                        return el;
                      });
                    })()}
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="hsl(var(--border))" strokeWidth="0.3" />
                  </svg>
                  <div className="flex flex-col gap-1.5 text-[11px] font-body font-light">
                    {statusBuckets.map((b, i) => (
                      <div key={b.key} className="flex items-center gap-2">
                        <span className="w-2 h-2" style={{ background: ["hsl(45 70% 60%)", "hsl(45 50% 50%)", "hsl(140 50% 50%)", "hsl(0 60% 55%)"][i] }} />
                        <span className="text-muted-foreground capitalize">{b.label}</span>
                        <span className="text-foreground ml-auto">{b.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top services */}
              <div className="glass-surface p-6">
                <h3 className="text-xs font-body font-light tracking-[0.2em] uppercase text-primary mb-4">Top Services Requested</h3>
                <div className="flex flex-col gap-3">
                  {topServices.length === 0 && <p className="text-xs font-body font-light text-muted-foreground">No data yet.</p>}
                  {topServices.map(([name, count]) => (
                    <div key={name}>
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-xs font-body font-light text-foreground truncate pr-2">{name}</span>
                        <span className="text-xs font-body text-primary tabular-nums">{count}</span>
                      </div>
                      <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${(count / maxService) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue distribution */}
              <div className="glass-surface p-6">
                <h3 className="text-xs font-body font-light tracking-[0.2em] uppercase text-primary mb-4">Quote Value Distribution</h3>
                <div className="flex items-end gap-3 h-32">
                  {revenueBands.map((b) => (
                    <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex-1 flex items-end">
                        <div className="w-full bg-primary/70 transition-all" style={{ height: `${(b.count / maxBand) * 100}%`, minHeight: b.count > 0 ? "3px" : "0" }} />
                      </div>
                      <span className="text-[10px] font-body font-light text-muted-foreground text-center">{b.label}</span>
                      <span className="text-[10px] font-body text-primary">{b.count}</span>
                    </div>
                  ))}
                </div>
              </div>
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
        {activeTab === "pricing" && <PricingTab />}

        {/* Quote Template Tab */}
        {activeTab === "template" && <QuoteTemplateTab />}

        {/* Invoices Tab */}
        {activeTab === "invoices" && <InvoicesTab quotes={quotes} pricing={pricing} formatDate={formatDate} onRefresh={fetchData} />}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
