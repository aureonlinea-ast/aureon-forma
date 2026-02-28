import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import aureonLogo from "@/assets/aureon-logo.png";

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover md:object-cover object-center animate-slow-zoom"
          style={{ minWidth: '100%', minHeight: '100%' }}
        >
          <source src="/videos/hero-1.mp4" type="video/mp4" />
        </video>
        <div className="gradient-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-background/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        <motion.img
          src={aureonLogo}
          alt="Aureon"
          className="h-[108px] lg:h-[150px] w-auto mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8 }}
        />

        <motion.h1
          className="font-display font-light text-2xl md:text-4xl lg:text-5xl text-foreground max-w-3xl leading-relaxed tracking-wide text-balance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Aureon crafts spatial narratives through architecture, light, and form.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
        >
          <Link
            to="/work"
            className="mt-12 inline-block glass-surface px-8 py-3 text-sm font-body font-light tracking-[0.2em] uppercase text-foreground hover:text-primary transition-colors duration-500"
          >
            View Projects
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
