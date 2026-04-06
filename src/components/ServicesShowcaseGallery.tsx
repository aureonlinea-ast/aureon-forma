import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { allProjects } from "@/data/projects";

const showcaseSlugs = [
  "eden-terrace",
  "blue-horizon-estate",
  "hillside-retreat",
  "flora-heights",
  "civic-pavilion",
  "luna-residence",
  "vertex-hub",
  "the-ridge",
  "leaf-line",
  "the-monolith",
];

const showcaseItems = allProjects
  .filter((p) => showcaseSlugs.includes(p.slug) && p.image)
  .map((p) => ({ image: p.image!, title: p.title, category: p.category }));

const ServicesShowcaseGallery = () => {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const next = useCallback(() => {
    setActive((c) => (c + 1) % showcaseItems.length);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(next, 4000);
    return () => clearInterval(intervalRef.current);
  }, [next]);

  const handleSelect = (i: number) => {
    setActive(i);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 4000);
  };

  if (showcaseItems.length === 0) return null;

  const displayItem = hovered !== null ? showcaseItems[hovered] : showcaseItems[active];

  return (
    <section className="mt-16 mb-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <h2 className="font-display font-light text-2xl sm:text-3xl text-foreground tracking-wide">
          Our Work
        </h2>
        <div className="w-12 h-[1px] bg-primary mt-4" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4 lg:gap-6">
        {/* Thumbnail grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2">
          {showcaseItems.map((item, i) => (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className={`relative aspect-square overflow-hidden transition-all duration-500 ${
                active === i
                  ? "ring-1 ring-primary ring-offset-1 ring-offset-background"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              {active === i && (
                <motion.div
                  layoutId="gallery-indicator"
                  className="absolute inset-0 border border-primary/40"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Featured display */}
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[400px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayItem.title}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img
                src={displayItem.image}
                alt={displayItem.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <p className="text-[10px] sm:text-xs font-body font-light tracking-[0.15em] uppercase text-primary mb-1">
                  {displayItem.category}
                </p>
                <h3 className="font-display text-lg sm:text-xl lg:text-2xl text-foreground font-light">
                  {displayItem.title}
                </h3>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcaseGallery;
