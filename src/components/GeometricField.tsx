import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Ambient geometric field that drifts behind an entire page.
 * Renders as a fixed full-viewport SVG with very low opacity so triangles
 * remain faintly visible behind populated sections, without ever feeling
 * like a discrete band. Edges fade via a radial mask so nothing terminates
 * on an abrupt line.
 */
const GeometricField = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const drift = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const rot = useTransform(scrollYProgress, [0, 1], [-2, 2]);
  const driftB = useTransform(scrollYProgress, [0, 1], ["2%", "-4%"]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        WebkitMaskImage:
          "radial-gradient(ellipse 90% 70% at 50% 50%, black 40%, transparent 100%)",
        maskImage:
          "radial-gradient(ellipse 90% 70% at 50% 50%, black 40%, transparent 100%)",
      }}
    >
      <motion.svg
        style={{ y: drift, rotate: rot }}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g
          stroke="hsl(var(--gold) / 0.10)"
          strokeWidth="0.5"
          strokeLinejoin="round"
        >
          <polygon points="100,720 420,80 740,720" />
          <polygon points="520,720 840,80 1160,720" />
          <polygon points="300,720 600,240 900,720" />
        </g>
        <g fill="hsl(var(--gold) / 0.015)">
          <polygon points="420,80 740,720 100,720" />
          <polygon points="840,80 1160,720 520,720" />
        </g>
      </motion.svg>

      <motion.svg
        style={{ y: driftB }}
        className="absolute inset-0 w-full h-full mix-blend-screen"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke="hsl(var(--gold) / 0.06)" strokeWidth="0.4">
          <polygon points="-40,720 200,160 460,720" />
          <polygon points="760,720 1000,160 1240,720" />
        </g>
      </motion.svg>
    </div>
  );
};

export default GeometricField;