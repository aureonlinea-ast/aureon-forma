import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ViewportProjectCardProps {
  slug: string;
  title: string;
  category: string;
  status?: string;
  image?: string;
  video?: string;
  index: number;
  linkPrefix?: string;
}

const ViewportProjectCard = ({
  slug,
  title,
  category,
  status,
  image,
  video,
  index,
  linkPrefix = "/work",
}: ViewportProjectCardProps) => {
  const isMobile = useIsMobile();
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.15 });
  const parallaxRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], isMobile ? [60, -60] : [0, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], isMobile ? [0.92, 1, 0.92] : [1, 1, 1]);

  // Alternate slide direction on mobile: even index from left, odd from right
  const slideFromLeft = index % 2 === 0;
  const mobileInitialX = isMobile ? (slideFromLeft ? -80 : 80) : 0;

  return (
    <motion.div
      ref={parallaxRef}
      style={isMobile ? { y, scale } : {}}
      className="h-full"
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: isMobile ? 20 : 40, x: mobileInitialX }}
        animate={inView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: isMobile ? 20 : 40, x: mobileInitialX }}
        transition={{
          duration: isMobile ? 1.4 : 0.7,
          delay: isMobile ? 0 : index * 0.08,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="h-full"
      >
        <Link
          to={`${linkPrefix}/${slug}`}
          className="group block relative overflow-hidden h-full"
        >
          {video ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
            >
              <source src={video} type="video/mp4" />
            </video>
          ) : (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              loading="lazy"
            />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          {/* Status badge */}
          {status && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <span className="glass-surface px-2 py-1 sm:px-3 text-[9px] sm:text-[10px] font-body font-light tracking-[0.15em] uppercase text-primary">
                {status}
              </span>
            </div>
          )}
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <p className="text-[10px] sm:text-xs font-body font-light tracking-[0.15em] uppercase text-primary mb-1 sm:mb-2">
              {category}
            </p>
            <h3 className="font-display text-lg sm:text-xl lg:text-2xl text-foreground font-light">
              {title}
            </h3>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default ViewportProjectCard;
