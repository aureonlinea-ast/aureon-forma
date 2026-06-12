import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  MotionValue,
} from "framer-motion";

export interface ScrollyChapter {
  eyebrow?: string;
  title: string;
  body?: string;
  /** Optional media URL — image or video (.mp4/.webm) shown in the sticky stage */
  media?: string;
}

interface ScrollytellingProps {
  chapters: ScrollyChapter[];
  /** Accent label above the whole sequence */
  label?: string;
  /** Height multiplier per chapter (in vh). */
  perChapterVh?: number;
  className?: string;
}

/**
 * Sticky-stage scrollytelling: a tall scroll container with a pinned
 * cinematic stage. Chapters cross-fade and parallax as the user scrolls.
 */
const Scrollytelling = ({
  chapters,
  label,
  perChapterVh = 55,
  className = "",
}: ScrollytellingProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const n = chapters.length;
  const totalVh = Math.max(perChapterVh * n, perChapterVh);
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Virtualise: only mount the active chapter + its immediate neighbours.
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    if (i !== active) setActive(i);
  });

  return (
    <section
      ref={ref}
      className={`relative ${className}`}
      style={{ height: `${totalVh}vh` }}
      aria-label="Scrollytelling sequence"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          {chapters.map((c, i) => (
            <ChapterMedia
              key={`m-${i}`}
              index={i}
              total={n}
              media={c.media}
              progress={scrollYProgress}
              shouldLoad={Math.abs(i - active) <= 1}
              eager={i === 0}
            />
          ))}
          {/* Persistent base so the stage never reads as a flat black gap */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/40 to-background pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/35 to-background/85 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 h-full container mx-auto px-4 sm:px-6 lg:px-12 flex items-center">
          <div className="max-w-2xl w-full">
            {label && (
              <div className="mb-8 flex items-center gap-3">
                <span className="w-8 h-[1px] bg-primary" />
                <span className="text-[10px] sm:text-xs font-body font-light tracking-[0.3em] uppercase text-primary">
                  {label}
                </span>
              </div>
            )}
            <div className="relative min-h-[60vh]">
              {chapters.map((c, i) => (
                <ChapterText
                  key={`t-${i}`}
                  index={i}
                  total={n}
                  chapter={c}
                  progress={scrollYProgress}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 h-40 sm:h-56 w-[2px] bg-white/10 overflow-hidden rounded-full"
          aria-hidden
        >
          <motion.div
            className="origin-top w-full h-full bg-primary"
            style={{ scaleY: railScale }}
          />
        </div>

        <ChapterCounter total={n} progress={scrollYProgress} />
      </div>
    </section>
  );
};

const ChapterMedia = ({
  index,
  total,
  media,
  progress,
  shouldLoad,
  eager,
}: {
  index: number;
  total: number;
  media?: string;
  progress: MotionValue<number>;
  shouldLoad: boolean;
  eager: boolean;
}) => {
  const slot = 1 / total;
  const start = index * slot;
  const end = start + slot;
  const mid = start + slot / 2;

  const isFirst = index === 0;
  const isLast = index === total - 1;
  // Keep the first frame visible (opacity 1 at progress 0) and the last
  // frame visible at progress 1 — so the stage is never blank.
  const opacity = useTransform(
    progress,
    [Math.max(0, start - slot * 0.25), mid, Math.min(1, end + slot * 0.25)],
    [isFirst ? 1 : 0, 1, isLast ? 1 : 0]
  );
  const scale = useTransform(progress, [start, end], [1.08, 1.0]);
  const y = useTransform(progress, [start, end], ["3%", "-3%"]);

  const isVideo = media && /\.(mp4|webm|mov)$/i.test(media);

  if (!media) {
    return (
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"
      />
    );
  }

  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <motion.div style={{ scale, y }} className="absolute inset-0 will-change-transform">
        {!shouldLoad ? (
          <ChapterSkeleton index={index} />
        ) : isVideo ? (
          <video
            src={media}
            autoPlay
            muted
            loop
            playsInline
            preload={eager ? "auto" : "metadata"}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={media}
            alt=""
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "low"}
            decoding="async"
            className="w-full h-full object-cover"
          />
        )}
      </motion.div>
    </motion.div>
  );
};

/**
 * Deliberate skeleton placeholder shown while a chapter's media is still
 * fetching. Uses a soft gold/secondary gradient + slow shimmer so mobile
 * never sees a flat black gap during slow-network loads.
 */
const ChapterSkeleton = ({ index }: { index: number }) => {
  const angle = (index * 27) % 360;
  return (
    <div className="relative w-full h-full overflow-hidden bg-secondary/40">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${angle}deg, hsl(var(--background)) 0%, hsl(var(--secondary)) 50%, hsl(var(--background)) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, hsl(var(--gold) / 0.10), transparent 60%)",
        }}
      />
      <div className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer_2.4s_ease-in-out_infinite]" />
    </div>
  );
};

const ChapterText = ({
  index,
  total,
  chapter,
  progress,
}: {
  index: number;
  total: number;
  chapter: ScrollyChapter;
  progress: MotionValue<number>;
}) => {
  const slot = 1 / total;
  const start = index * slot;
  const end = start + slot;
  const mid = start + slot / 2;

  const opacity = useTransform(
    progress,
    [start, mid - slot * 0.15, mid + slot * 0.15, end],
    [index === 0 ? 1 : 0, 1, 1, index === total - 1 ? 1 : 0]
  );
  const y = useTransform(progress, [start, end], [40, -40]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center"
    >
      {chapter.eyebrow && (
        <span className="mb-4 text-[10px] sm:text-xs font-body font-light tracking-[0.3em] uppercase text-primary/80">
          {chapter.eyebrow}
        </span>
      )}
      <h2 className="font-display font-light text-3xl sm:text-5xl lg:text-6xl text-foreground tracking-wide leading-[1.05]">
        {chapter.title}
      </h2>
      {chapter.body && (
        <p className="mt-6 max-w-xl text-sm sm:text-base font-body font-light text-muted-foreground leading-relaxed">
          {chapter.body}
        </p>
      )}
    </motion.div>
  );
};

const ChapterCounter = ({
  total,
  progress,
}: {
  total: number;
  progress: MotionValue<number>;
}) => {
  const current = useTransform(progress, (p) => {
    const i = Math.min(total, Math.max(1, Math.floor(p * total) + 1));
    return `${String(i).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  });
  return (
    <div
      className="absolute bottom-8 left-6 sm:left-10 text-[10px] sm:text-xs font-body font-light tracking-[0.3em] uppercase text-muted-foreground"
      aria-hidden
    >
      <motion.span>{current}</motion.span>
    </div>
  );
};

export default Scrollytelling;
