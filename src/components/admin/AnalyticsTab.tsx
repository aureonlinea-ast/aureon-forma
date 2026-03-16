import { motion } from "framer-motion";

interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  project_type: string | null;
}

interface QuoteRequest {
  id: string;
  full_name: string;
  email: string;
  estimated_price: number | null;
  status: string;
  project_classification: string;
  project_type: string;
  selected_services: string[];
  created_at: string;
}

interface Props {
  contacts: ContactSubmission[];
  quotes: QuoteRequest[];
}

const AnalyticsTab = ({ contacts, quotes }: Props) => {
  // Derive analytics from existing data
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentContacts = contacts.filter(c => new Date(c.created_at) > thirtyDaysAgo);
  const recentQuotes = quotes.filter(q => new Date(q.created_at) > thirtyDaysAgo);
  const weekContacts = contacts.filter(c => new Date(c.created_at) > sevenDaysAgo);
  const weekQuotes = quotes.filter(q => new Date(q.created_at) > sevenDaysAgo);

  const avgQuoteValue = quotes.length > 0
    ? quotes.reduce((s, q) => s + (q.estimated_price || 0), 0) / quotes.length
    : 0;

  const pendingRate = quotes.length > 0
    ? (quotes.filter(q => q.status === "pending").length / quotes.length) * 100
    : 0;

  // Service popularity
  const serviceCounts: Record<string, number> = {};
  quotes.forEach(q => q.selected_services.forEach(s => {
    serviceCounts[s] = (serviceCounts[s] || 0) + 1;
  }));
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxServiceCount = topServices.length > 0 ? topServices[0][1] : 1;

  // Project type distribution
  const typeCounts: Record<string, number> = {};
  quotes.forEach(q => {
    typeCounts[q.project_classification] = (typeCounts[q.project_classification] || 0) + 1;
  });
  const typeEntries = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const maxTypeCount = typeEntries.length > 0 ? typeEntries[0][1] : 1;

  // Monthly trend (last 6 months)
  const months: { label: string; contacts: number; quotes: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const monthStart = d;
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    months.push({
      label,
      contacts: contacts.filter(c => {
        const cd = new Date(c.created_at);
        return cd >= monthStart && cd <= monthEnd;
      }).length,
      quotes: quotes.filter(q => {
        const qd = new Date(q.created_at);
        return qd >= monthStart && qd <= monthEnd;
      }).length,
    });
  }
  const maxMonthly = Math.max(...months.map(m => m.contacts + m.quotes), 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Week", value: weekContacts.length + weekQuotes.length, sub: "submissions" },
          { label: "30-Day Contacts", value: recentContacts.length, sub: "inquiries" },
          { label: "30-Day Quotes", value: recentQuotes.length, sub: "requests" },
          { label: "Avg Quote Value", value: `$${Math.round(avgQuoteValue).toLocaleString()}`, sub: "USD" },
          { label: "Pending Rate", value: `${pendingRate.toFixed(0)}%`, sub: "of quotes" },
          { label: "Total Revenue Potential", value: `$${quotes.reduce((s, q) => s + (q.estimated_price || 0), 0).toLocaleString()}`, sub: "all quotes" },
          { label: "Unique Clients", value: new Set([...contacts.map(c => c.email), ...quotes.map(q => q.email)]).size, sub: "by email" },
          { label: "Services Requested", value: Object.keys(serviceCounts).length, sub: "unique services" },
        ].map((stat) => (
          <div key={stat.label} className="glass-surface p-5">
            <p className="text-xs font-body font-light text-muted-foreground uppercase tracking-[0.15em] mb-1">{stat.label}</p>
            <p className="font-display text-2xl text-foreground">{stat.value}</p>
            <p className="text-xs font-body font-light text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly Trend */}
      <div>
        <h3 className="text-sm font-body font-light tracking-[0.15em] uppercase text-primary mb-4">Monthly Activity (6 Months)</h3>
        <div className="glass-surface p-6">
          <div className="flex items-end gap-3 h-40">
            {months.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5" style={{ height: "120px" }}>
                  <div className="w-full flex flex-col justify-end h-full gap-0.5">
                    <div
                      className="w-full bg-primary/30 rounded-t-sm transition-all"
                      style={{ height: `${(m.contacts / maxMonthly) * 100}%`, minHeight: m.contacts > 0 ? "4px" : "0" }}
                    />
                    <div
                      className="w-full bg-primary rounded-t-sm transition-all"
                      style={{ height: `${(m.quotes / maxMonthly) * 100}%`, minHeight: m.quotes > 0 ? "4px" : "0" }}
                    />
                  </div>
                </div>
                <span className="text-xs font-body font-light text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/30 rounded-sm" />
              <span className="text-xs font-body font-light text-muted-foreground">Contacts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-sm" />
              <span className="text-xs font-body font-light text-muted-foreground">Quotes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Popularity */}
        <div>
          <h3 className="text-sm font-body font-light tracking-[0.15em] uppercase text-primary mb-4">Top Requested Services</h3>
          <div className="flex flex-col gap-2">
            {topServices.map(([name, count]) => (
              <div key={name} className="glass-surface p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-body font-light text-foreground">{name}</p>
                  <div className="w-full bg-muted/30 h-1.5 rounded-full mt-1">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${(count / maxServiceCount) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-body text-primary">{count}</span>
              </div>
            ))}
            {topServices.length === 0 && (
              <p className="text-sm font-body font-light text-muted-foreground">No data yet.</p>
            )}
          </div>
        </div>

        {/* Project Classification */}
        <div>
          <h3 className="text-sm font-body font-light tracking-[0.15em] uppercase text-primary mb-4">Project Classifications</h3>
          <div className="flex flex-col gap-2">
            {typeEntries.map(([name, count]) => (
              <div key={name} className="glass-surface p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-body font-light text-foreground">{name}</p>
                  <div className="w-full bg-muted/30 h-1.5 rounded-full mt-1">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${(count / maxTypeCount) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-body text-primary">{count}</span>
              </div>
            ))}
            {typeEntries.length === 0 && (
              <p className="text-sm font-body font-light text-muted-foreground">No data yet.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsTab;
