import { useState } from "react";
import { motion } from "framer-motion";

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
  estimated_price: number | null;
  status: string;
  created_at: string;
}

interface Props {
  contacts: ContactSubmission[];
  quotes: QuoteRequest[];
  formatDate: (d: string) => string;
}

interface Client {
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  contactCount: number;
  quoteCount: number;
  totalQuoteValue: number;
  lastActivity: string;
  services: string[];
}

const ClientsTab = ({ contacts, quotes, formatDate }: Props) => {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Aggregate clients by email
  const clientMap = new Map<string, Client>();

  contacts.forEach((c) => {
    const existing = clientMap.get(c.email);
    if (existing) {
      existing.contactCount++;
      if (new Date(c.created_at) > new Date(existing.lastActivity)) {
        existing.lastActivity = c.created_at;
        existing.name = c.full_name;
      }
      if (c.phone && !existing.phone) existing.phone = c.phone;
      if (c.company && !existing.company) existing.company = c.company;
    } else {
      clientMap.set(c.email, {
        email: c.email,
        name: c.full_name,
        phone: c.phone,
        company: c.company,
        contactCount: 1,
        quoteCount: 0,
        totalQuoteValue: 0,
        lastActivity: c.created_at,
        services: [],
      });
    }
  });

  quotes.forEach((q) => {
    const existing = clientMap.get(q.email);
    if (existing) {
      existing.quoteCount++;
      existing.totalQuoteValue += q.estimated_price || 0;
      existing.services = [...new Set([...existing.services, ...q.selected_services])];
      if (new Date(q.created_at) > new Date(existing.lastActivity)) {
        existing.lastActivity = q.created_at;
      }
      if (q.phone && !existing.phone) existing.phone = q.phone;
      if (q.company && !existing.company) existing.company = q.company;
    } else {
      clientMap.set(q.email, {
        email: q.email,
        name: q.full_name,
        phone: q.phone,
        company: q.company,
        contactCount: 0,
        quoteCount: 1,
        totalQuoteValue: q.estimated_price || 0,
        lastActivity: q.created_at,
        services: [...q.selected_services],
      });
    }
  });

  const clients = Array.from(clientMap.values())
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

  const filtered = search
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          (c.company?.toLowerCase().includes(search.toLowerCase()))
      )
    : clients;

  const selected = selectedClient ? clientMap.get(selectedClient) : null;
  const selectedContacts = selectedClient ? contacts.filter((c) => c.email === selectedClient) : [];
  const selectedQuotes = selectedClient ? quotes.filter((q) => q.email === selectedClient) : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="font-display text-xl text-foreground font-light tracking-wide">
          Clients ({clients.length})
        </h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="glass-surface bg-transparent px-4 py-2 text-sm font-body font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors w-full sm:w-64"
        />
      </div>

      {selectedClient && selected ? (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setSelectedClient(null)}
            className="text-xs font-body font-light tracking-[0.1em] uppercase text-primary hover:text-primary/80 self-start"
          >
            ← Back to clients
          </button>

          <div className="glass-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-display text-xl text-foreground">{selected.name}</p>
                <p className="text-sm font-body font-light text-muted-foreground">{selected.email}</p>
                {selected.phone && <p className="text-sm font-body font-light text-muted-foreground">{selected.phone}</p>}
                {selected.company && <p className="text-sm font-body font-light text-muted-foreground">{selected.company}</p>}
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="font-display text-2xl text-primary">{selected.contactCount}</p>
                  <p className="text-xs font-body font-light text-muted-foreground">Inquiries</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl text-primary">{selected.quoteCount}</p>
                  <p className="text-xs font-body font-light text-muted-foreground">Quotes</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl text-primary">${selected.totalQuoteValue.toLocaleString()}</p>
                  <p className="text-xs font-body font-light text-muted-foreground">Value</p>
                </div>
              </div>
            </div>
            {selected.services.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selected.services.map((s) => (
                  <span key={s} className="text-xs font-body font-light px-2 py-1 glass-surface text-muted-foreground">{s}</span>
                ))}
              </div>
            )}
          </div>

          {selectedContacts.length > 0 && (
            <div>
              <h3 className="text-sm font-body font-light tracking-[0.15em] uppercase text-primary mb-3">Contact History</h3>
              <div className="flex flex-col gap-2">
                {selectedContacts.map((c) => (
                  <div key={c.id} className="glass-surface p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-body font-light text-muted-foreground">{c.project_type || "General"}</span>
                      <span className="text-xs font-body font-light text-muted-foreground">{formatDate(c.created_at)}</span>
                    </div>
                    <p className="text-sm font-body font-light text-muted-foreground">{c.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedQuotes.length > 0 && (
            <div>
              <h3 className="text-sm font-body font-light tracking-[0.15em] uppercase text-primary mb-3">Quote History</h3>
              <div className="flex flex-col gap-2">
                {selectedQuotes.map((q) => (
                  <div key={q.id} className="glass-surface p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-body font-light text-foreground">
                        {q.project_classification} — {q.project_type}
                      </span>
                      <span className="font-display text-lg text-primary">${(q.estimated_price || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {q.selected_services.map((s) => (
                        <span key={s} className="text-xs font-body font-light px-2 py-0.5 bg-primary/10 text-primary">{s}</span>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className={`text-xs font-body px-2 py-0.5 ${q.status === "pending" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{q.status}</span>
                      <span className="text-xs font-body font-light text-muted-foreground">{formatDate(q.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.length === 0 ? (
            <p className="text-sm font-body font-light text-muted-foreground">No clients found.</p>
          ) : (
            filtered.map((client) => (
              <button
                key={client.email}
                onClick={() => setSelectedClient(client.email)}
                className="glass-surface p-4 flex items-center justify-between gap-4 text-left hover:border-primary/30 transition-colors w-full"
              >
                <div>
                  <p className="text-sm font-body text-foreground">{client.name}</p>
                  <p className="text-xs font-body font-light text-muted-foreground">
                    {client.email} {client.company && `· ${client.company}`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-body text-foreground">{client.contactCount + client.quoteCount}</p>
                    <p className="text-xs font-body font-light text-muted-foreground">Activity</p>
                  </div>
                  {client.totalQuoteValue > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-body text-primary">${client.totalQuoteValue.toLocaleString()}</p>
                      <p className="text-xs font-body font-light text-muted-foreground">Value</p>
                    </div>
                  )}
                  <span className="text-xs font-body font-light text-muted-foreground whitespace-nowrap">
                    {new Date(client.lastActivity).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ClientsTab;
