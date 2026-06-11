import { motion } from "framer-motion";
import type { ServiceInsight as Insight } from "@/data/serviceInsights";

interface Props {
  insight: Insight;
  reverse?: boolean;
}

/**
 * Editorial insight panel that sits between two ServiceStage sections.
 * Implies more than it explains — metrics, signals, and a single vision line.
 */
const ServiceInsightPanel = ({ insight, reverse = false }: Props) => {
  return (
    <section className="relative bg-background py-24 lg:py-32 overflow-hidden">
      {/* faint gold corner glow */}
      <div
        className={`absolute ${reverse ? "right-0" : "left-0"} top-0 h-full w-1/3 pointer-events-none opacity-40`}
        style={{
          background: `radial-gradient(circle at ${reverse ? "right" : "left"} center, hsl(var(--gold) / 0.08), transparent 70%)`,
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start ${reverse ? "lg:[direction:rtl]" : ""}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 [direction:ltr]"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[1px] bg-primary" />
              <span className="text-[10px] sm:text-xs font-body font-light tracking-[0.35em] uppercase text-primary">
                {insight.eyebrow}
              </span>
            </div>
            <h3 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.1] tracking-wide max-w-2xl">
              {insight.title}
            </h3>
            <p className="mt-8 max-w-xl text-sm sm:text-base font-body font-light text-muted-foreground leading-[1.85]">
              {insight.vision}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 [direction:ltr] flex flex-col gap-6"
          >
            <div className="grid grid-cols-3 gap-3">
              {insight.metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                  className="glass-surface p-4 sm:p-5 group transition-all duration-700 hover:border-primary/40"
                >
                  <div className="font-display text-2xl sm:text-3xl text-primary transition-all duration-700 group-hover:tracking-wider">
                    {m.value}
                  </div>
                  <div className="mt-2 text-[10px] font-body font-light tracking-[0.2em] uppercase text-muted-foreground">
                    {m.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="glass-surface p-5 sm:p-6">
              <div className="text-[10px] font-body font-light tracking-[0.3em] uppercase text-primary/80 mb-3">
                We work with
              </div>
              <div className="flex flex-wrap gap-2">
                {insight.signals.map((s) => (
                  <span
                    key={s}
                    className="text-xs font-body font-light text-muted-foreground border border-border/40 px-3 py-1.5 transition-all duration-500 hover:text-primary hover:border-primary/40"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServiceInsightPanel;