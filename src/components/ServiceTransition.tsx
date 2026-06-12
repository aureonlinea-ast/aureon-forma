import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Seamless transition between full-viewport service sections.
 * Pure tonal bleed — no contrasting color block, no labels, no random marks.
 * A single hairline scales in as it enters view, then fades as it leaves.
 */
const ServiceTransition = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Hairline draws in on entry, holds, then fades on exit.
  const lineScale = useTransform(scrollYProgress, [0, 0.45, 0.55, 1], [0, 1, 1, 1]);
  const lineOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);

  return (
    <div
      ref={ref}
      className="relative h-[14vh] sm:h-[16vh] w-full overflow-hidden bg-background"
      aria-hidden
    >
      {/* Pure tonal bleed — matches surrounding sections so the eye glides through */}
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--gold) / 0.04) 0%, transparent 65%)",
        }}
      />

      {/* Single drawn-in hairline — quiet rhythm marker, no text */}
      <motion.div
        style={{ scaleX: lineScale, opacity: lineOpacity }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-[42%] origin-center"
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, hsl(var(--gold) / 0.45) 50%, transparent 100%)",
          }}
        />
      </motion.div>

      {/* Geometric artwork — drifts slowly across the transition band */}
      <motion.svg
        aria-hidden
        style={{ opacity: lineOpacity }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] pointer-events-none"
        viewBox="0 0 100 100"
        fill="none"
      >
        <g
          stroke="hsl(var(--gold) / 0.35)"
          strokeWidth="0.3"
          style={{ transformOrigin: "50px 50px", animation: "spin 30s linear infinite" }}
        >
          <circle cx="50" cy="50" r="46" />
          <circle cx="50" cy="50" r="32" />
          <polygon points="50,8 88,72 12,72" />
          <polygon points="50,92 12,28 88,28" opacity="0.5" />
        </g>
      </motion.svg>
    </div>
  );
};

export default ServiceTransition;