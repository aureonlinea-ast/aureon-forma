import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Service } from "@/data/services";

interface ServiceStageProps {
  service: Service;
  index: number;
}

/**
 * Full-viewport service "stage":
 * - Section is ~180vh tall.
 * - Sticky media stage pinned for the duration.
 * - Text + CTA crossfade and parallax in/out.
 * - Alternating layout (left/right) for rhythm.
 */
const ServiceStage = ({ service, index }: ServiceStageProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Media parallax / zoom across the section
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1.12, 1.0]);
  const mediaY = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

  // Text reveal: enter early, hold center, fade at end
  const textOpacity = useTransform(
    scrollYProgress,
    [0.05, 0.25, 0.7, 0.95],
    [0, 1, 1, 0]
  );
  const textY = useTransform(scrollYProgress, [0.05, 0.5, 0.95], [60, 0, -60]);

  const media = service.headerVideo ?? service.gallery?.[0] ?? service.headerImage;
  const isVideo = !!media && /\.(mp4|webm|mov)$/i.test(media);
  const isReverse = index % 2 === 1;

  return (
    <section
      ref={ref}
      className="relative w-full"
      style={{ height: "180vh" }}
      aria-label={service.title}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Media layer */}
        <motion.div
          style={{ scale: mediaScale, y: mediaY }}
          className="absolute inset-0 will-change-transform"
        >
          {media ? (
            isVideo ? (
              <video
                src={media}
                autoPlay
                muted
                loop
                playsInline
                preload={index === 0 ? "auto" : "metadata"}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={media}
                alt={service.title}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-background via-background to-primary/10" />
          )}
        </motion.div>

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background/95 pointer-events-none" />
        <div
          className={`absolute inset-0 pointer-events-none bg-gradient-to-${
            isReverse ? "l" : "r"
          } from-background/80 via-background/30 to-transparent`}
        />

        {/* Content */}
        <div className="relative z-10 h-full container mx-auto px-4 sm:px-6 lg:px-12 flex items-center">
          <motion.div
            style={{ opacity: textOpacity, y: textY }}
            className={`max-w-xl w-full ${isReverse ? "ml-auto text-right" : ""}`}
          >
            <div
              className={`mb-6 flex items-center gap-3 ${
                isReverse ? "justify-end" : ""
              }`}
            >
              <span className="text-[10px] sm:text-xs font-body font-light tracking-[0.35em] uppercase text-primary">
                Service {String(index + 1).padStart(2, "0")}
              </span>
              <span className="w-10 h-[1px] bg-primary" />
            </div>

            <h2 className="font-display font-light text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-wide leading-[1.05]">
              {service.title}
            </h2>

            <p className="mt-6 text-sm sm:text-base font-body font-light text-muted-foreground leading-relaxed">
              {service.description}
            </p>

            <div
              className={`mt-10 flex flex-wrap gap-3 ${
                isReverse ? "justify-end" : ""
              }`}
            >
              <Link
                to={`/services/${service.slug}#request`}
                className="inline-block glass-surface px-7 py-4 text-xs sm:text-sm font-body font-light tracking-[0.25em] uppercase text-foreground hover:text-primary hover:border-primary/60 transition-all duration-500 hover:shadow-[0_0_30px_hsl(var(--gold)/0.18)]"
              >
                Request Service
              </Link>
              <Link
                to={`/services/${service.slug}`}
                className="inline-block px-2 py-4 text-xs sm:text-sm font-body font-light tracking-[0.25em] uppercase text-muted-foreground hover:text-primary transition-colors duration-500"
              >
                Explore →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServiceStage;