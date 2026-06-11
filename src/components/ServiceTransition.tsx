import { motion } from "framer-motion";

/**
 * Smooth textured transition between full-viewport service sections.
 * Uses a layered radial-noise SVG + animated gold thread for material feel.
 */
const ServiceTransition = () => {
  return (
    <div
      className="relative h-[18vh] sm:h-[20vh] w-full overflow-hidden bg-background"
      aria-hidden
    >
      {/* Vertical fade so the previous and next sections breathe in */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/40 to-background" />

      {/* Grain / texture layer */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.18] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="aureon-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#aureon-grain)" />
      </svg>

      {/* Slow drifting gold thread */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: false, margin: "-10%" }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[1px] w-[60%] origin-center"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, hsl(var(--gold) / 0.5) 50%, transparent 100%)",
        }}
      />

      {/* Tiny chapter mark */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-3 text-[9px] tracking-[0.4em] uppercase font-body font-light text-primary/60"
      >
        ·
      </motion.div>
    </div>
  );
};

export default ServiceTransition;