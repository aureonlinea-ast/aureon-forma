import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Transition between full-viewport service sections.
 * Large triangular shapes form a complex but minimal pattern,
 * drifting slowly to give the band a sense of breath.
 */
const ServiceTransition = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const fieldOpacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 1, 1, 0]);
  const parallaxA = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const parallaxB = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  const rotateSlow = useTransform(scrollYProgress, [0, 1], [-3, 3]);

  return (
    <div
      ref={ref}
      className="relative h-[26vh] sm:h-[34vh] w-full overflow-hidden bg-background"
      aria-hidden
    >
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--gold) / 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Triangular field — large overlapping shapes, slow drift */}
      <motion.svg
        style={{ opacity: fieldOpacity, y: parallaxA, rotate: rotateSlow }}
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke="hsl(var(--gold) / 0.32)" strokeWidth="0.6" strokeLinejoin="round">
          <polygon points="120,360 380,40 640,360" />
          <polygon points="560,360 820,40 1080,360" opacity="0.7" />
          <polygon points="340,360 600,120 860,360" opacity="0.5" />
        </g>
        <g fill="hsl(var(--gold) / 0.04)">
          <polygon points="380,40 640,360 120,360" />
          <polygon points="820,40 1080,360 560,360" />
        </g>
      </motion.svg>

      <motion.svg
        style={{ opacity: fieldOpacity, y: parallaxB }}
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke="hsl(var(--gold) / 0.18)" strokeWidth="0.4">
          <polygon points="0,360 220,80 440,360" />
          <polygon points="760,360 980,80 1200,360" />
          <polygon points="220,80 440,360 760,360 980,80" opacity="0.4" />
        </g>
      </motion.svg>

      {/* Hairline anchor */}
      <motion.div
        style={{ opacity: fieldOpacity }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-[28%]"
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(to right, transparent 0%, hsl(var(--gold) / 0.5) 50%, transparent 100%)",
          }}
        />
      </motion.div>
    </div>
  );
};

export default ServiceTransition;