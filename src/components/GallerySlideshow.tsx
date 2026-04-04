import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GallerySlideshowProps {
  images: string[];
  title: string;
}

const GallerySlideshow = ({ images, title }: GallerySlideshowProps) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  if (images.length <= 1) {
    return images.length === 1 ? (
      <img src={images[0]} alt={title} className="w-full aspect-[4/3] object-cover" loading="lazy" />
    ) : null;
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative w-full overflow-hidden">
        <div className="relative aspect-[4/3]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={current}
              src={images[current]}
              alt={`${title} - ${current + 1}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </AnimatePresence>
        </div>

        {/* Controls */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 glass-surface p-2 text-foreground hover:text-primary transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 glass-surface p-2 text-foreground hover:text-primary transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Counter */}
        <div className="absolute bottom-3 right-3 glass-surface px-3 py-1">
          <span className="text-xs font-body font-light text-foreground tracking-wider">
            {current + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden transition-all duration-300 ${
              i === current
                ? "ring-1 ring-primary opacity-100"
                : "opacity-50 hover:opacity-80"
            }`}
            aria-label={`Go to image ${i + 1}`}
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default GallerySlideshow;
