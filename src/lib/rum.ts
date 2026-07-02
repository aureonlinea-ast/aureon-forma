import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight Real User Monitoring for Core Web Vitals.
 *
 * Captures LCP + CLS (and FCP as a bonus) using the native
 * PerformanceObserver API — no web-vitals dependency — and streams
 * samples into `public.perf_metrics`. Insert-only from the client;
 * reads are gated behind service-role.
 *
 * Call `startRUM(route)` once per route mount. It flushes on
 * `visibilitychange -> hidden` and `pagehide` so we don't lose the
 * final CLS shift on mobile Safari tab-switches.
 */

type Metric = "LCP" | "CLS" | "FCP" | "INP";

interface Sample {
  route: string;
  metric: Metric;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  device: "mobile" | "tablet" | "desktop";
  connection: string | null;
  viewport_w: number;
  viewport_h: number;
  user_agent: string;
}

const rate = (metric: Metric, v: number): Sample["rating"] => {
  // Google CWV thresholds
  if (metric === "LCP") return v <= 2500 ? "good" : v <= 4000 ? "needs-improvement" : "poor";
  if (metric === "CLS") return v <= 0.1 ? "good" : v <= 0.25 ? "needs-improvement" : "poor";
  if (metric === "FCP") return v <= 1800 ? "good" : v <= 3000 ? "needs-improvement" : "poor";
  return v <= 200 ? "good" : v <= 500 ? "needs-improvement" : "poor";
};

const deviceClass = (w: number): Sample["device"] =>
  w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";

const getConnection = (): string | null => {
  const c = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
  return c?.effectiveType ?? null;
};

const buildSample = (route: string, metric: Metric, value: number): Sample => ({
  route,
  metric,
  value,
  rating: rate(metric, value),
  device: deviceClass(window.innerWidth),
  connection: getConnection(),
  viewport_w: window.innerWidth,
  viewport_h: window.innerHeight,
  user_agent: navigator.userAgent.slice(0, 512),
});

const send = (sample: Sample) => {
  // Fire-and-forget. Failures never affect the app.
  void supabase
    .from("perf_metrics")
    .insert(sample)
    .then(({ error }) => {
      if (error && import.meta.env.DEV) {
        console.warn("[rum] insert failed", error.message);
      }
    });
};

export function startRUM(route: string): () => void {
  if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") {
    return () => {};
  }

  const observers: PerformanceObserver[] = [];
  let lcpValue = 0;
  let clsValue = 0;
  let fcpValue = 0;
  let flushed = false;

  const observe = (type: string, cb: (list: PerformanceObserverEntryList) => void) => {
    try {
      const po = new PerformanceObserver(cb);
      po.observe({ type, buffered: true } as PerformanceObserverInit);
      observers.push(po);
    } catch {
      /* type unsupported (e.g. Safari on `layout-shift`) */
    }
  };

  observe("largest-contentful-paint", (list) => {
    const entries = list.getEntries() as PerformanceEntry[];
    const last = entries[entries.length - 1];
    if (last) lcpValue = last.startTime;
  });

  observe("layout-shift", (list) => {
    for (const entry of list.getEntries() as (PerformanceEntry & {
      value: number;
      hadRecentInput: boolean;
    })[]) {
      if (!entry.hadRecentInput) clsValue += entry.value;
    }
  });

  observe("paint", (list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === "first-contentful-paint") fcpValue = entry.startTime;
    }
  });

  const flush = () => {
    if (flushed) return;
    flushed = true;
    if (lcpValue) send(buildSample(route, "LCP", lcpValue));
    send(buildSample(route, "CLS", clsValue));
    if (fcpValue) send(buildSample(route, "FCP", fcpValue));
    observers.forEach((o) => o.disconnect());
  };

  const onHide = () => {
    if (document.visibilityState === "hidden") flush();
  };
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", flush);

  return () => {
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", flush);
    flush();
  };
}