import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import beforeImg from "@/assets/bts/before-1.jpg";
import afterImg from "@/assets/bts/after-1.jpg";

/* ── hero background videos (crossfade loop) ── */
const heroVideos = [
  "/videos/behind-the-scenes.mp4",
  "/videos/bts-3-2.mp4",
  "/videos/behind-the-scenes-2.mp4",
];

/* ── content sections ── */
const mediaItems = [
  {
    type: "comparison" as const,
    title: "From Wireframe to Reality",
    before: beforeImg,
    after: afterImg,
    description:
      "Raw wireframes transform into photorealistic renders through meticulous material development and lighting design.",
  },
  {
    type: "video" as const,
    title: "Workflow Process",
    src: "/videos/behind-the-scenes.mp4",
    description:
      "Our end-to-end visualization pipeline — from concept ideation through modeling, texturing, and final cinematic output.",
  },
  {
    type: "video" as const,
    title: "Project Breakdown",
    src: "/videos/ins-project-2.mp4",
    description:
      "A deep dive into the technical decisions behind one of our flagship projects.",
  },
  {
    type: "video" as const,
    title: "Rendering Pipeline",
    src: "/videos/vid-1.mp4",
    description:
      "From raw geometry to final frame — V-Ray, Lumion, and Unreal Engine at cinematic quality.",
  },
  {
    type: "video" as const,
    title: "Animation Study",
    src: "/videos/ins-project-3.mp4",
    description:
      "Exploring camera motion, pacing, and atmospheric effects that bring architectural narratives to life.",
  },
  {
    type: "video" as const,
    title: "Studio Session",
    src: "/videos/bts-3-2.mp4",
    description:
      "A candid look at the creative environment — tools, screens, and collaborative energy.",
  },
  {
    type: "video" as const,
    title: "Creative Tour",
    src: "/videos/tour.mp4",
    description:
      "Walk through our studio space and see where architectural visions come to life.",
  },
  {
    type: "video" as const,
    title: "Process Documentary",
    src: "/videos/behind-the-scenes-2.mp4",
    description:
      "A cinematic documentary capturing the passion and precision that defines our creative process.",
  },
];

/* ── Crossfade Hero ── */
const HeroCrossfade = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % heroVideos.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0">
      {heroVideos.map((src, i) => (
        <video
          key={src}
          ref={(el) => { videoRefs.current[i] = el; }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out"
          style={{ opacity: i === activeIdx ? 1 : 0 }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ))}
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
    </div>
  );
};

/* ── Scroll-reveal media row ── */
interface MediaRowProps {
  item: (typeof mediaItems)[number];
  index: number;
}

const MediaRow = ({ item, index }: MediaRowProps) => {
  const isEven = index % 2 === 0;
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-[60vh] lg:min-h-screen flex items-center"
    >
      <div
        className={`w-full grid grid-cols-1 lg:grid-cols-2 gap-0 items-center ${
          isEven ? "" : "lg:[direction:rtl]"
        }`}
      >
        {/* Media */}
        <div
          className={`relative overflow-hidden ${
            isEven ? "" : "lg:[direction:ltr]"
          }`}
        >
          {item.type === "comparison" ? (
            <div className="grid grid-cols-2 gap-1">
              <div className="relative">
                <img
                  src={item.before}
                  alt="Before"
                  className="w-full aspect-video object-cover"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 glass-surface px-2 py-1 text-[9px] font-body font-light tracking-[0.15em] uppercase text-primary">
                  Before
                </span>
              </div>
              <div className="relative">
                <img
                  src={item.after}
                  alt="After"
                  className="w-full aspect-video object-cover"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 glass-surface px-2 py-1 text-[9px] font-body font-light tracking-[0.15em] uppercase text-primary">
                  After
                </span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full aspect-video object-cover"
              >
                <source src={item.src} type="video/mp4" />
              </video>
              {/* Bottom fade on mobile */}
              <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-background to-transparent lg:hidden" />
              {/* Side gradient blend on desktop */}
              <div
                className={`hidden lg:block absolute top-0 bottom-0 w-24 ${
                  isEven
                    ? "right-0 bg-gradient-to-l"
                    : "left-0 bg-gradient-to-r"
                } from-background to-transparent`}
              />
            </div>
          )}
        </div>

        {/* Text — hidden on mobile per spec */}
        <div
          className={`hidden lg:flex flex-col justify-center px-12 xl:px-20 ${
            isEven ? "" : "lg:[direction:ltr]"
          }`}
        >
          <h3 className="font-display text-2xl xl:text-3xl text-foreground font-light mb-4">
            {item.title}
          </h3>
          <div className="w-8 h-[1px] bg-primary mb-5" />
          <p className="text-sm font-body font-light text-muted-foreground leading-relaxed max-w-md">
            {item.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Page ── */
const BehindTheScenesPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      {/* ── Immersive Hero (100vh) ── */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <HeroCrossfade />
        <div className="relative z-10 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-light text-4xl sm:text-5xl lg:text-7xl text-foreground tracking-wide"
          >
            Behind The Scenes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-6 text-sm font-body font-light text-muted-foreground max-w-lg mx-auto leading-relaxed"
          >
            A glimpse into our creative process — from concept sketches to
            cinematic output.
          </motion.p>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="mt-10 font-display font-light text-xl sm:text-2xl lg:text-3xl text-primary tracking-wide"
          >
            See Us in Action
          </motion.h2>
        </div>
      </section>

      {/* ── Scroll-driven media sections ── */}
      <main>
        {mediaItems.map((item, i) => (
          <MediaRow key={i} item={item} index={i} />
        ))}
      </main>

      <Footer />
    </div>
  );
};

export default BehindTheScenesPage;
