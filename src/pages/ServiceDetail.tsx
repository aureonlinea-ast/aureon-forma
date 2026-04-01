import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { allServices } from "@/data/services";

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = allServices.find((s) => s.slug === slug);

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">Service Not Found</h1>
          <Link to="/services" className="text-primary font-body text-sm tracking-widest uppercase">
            ← Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: i * 0.15 },
    }),
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />

      {/* Hero Video or Image */}
      {service.headerVideo && (
        <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={service.headerVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-display font-light text-3xl md:text-5xl text-foreground"
            >
              {service.title}
            </motion.h1>
          </div>
        </div>
      )}

      {/* Hero Image (for services without video) */}
      {!service.headerVideo && service.headerImage && (
        <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
          <img src={service.headerImage} alt={service.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-display font-light text-3xl md:text-5xl text-foreground"
            >
              {service.title}
            </motion.h1>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 lg:px-12 py-16 max-w-3xl">
        {!service.headerVideo && !service.headerImage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="font-display font-light text-4xl lg:text-5xl text-foreground tracking-wide">
              {service.title}
            </h1>
            <div className="w-12 h-[1px] bg-primary mt-6" />
          </motion.div>
        )}

        <motion.p
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-base font-body font-light text-muted-foreground leading-[1.8] mb-16"
        >
          {service.detailedDescription}
        </motion.p>

        {/* Capabilities */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants} className="mb-16">
          <h2 className="font-display text-2xl text-foreground font-light mb-4">Capabilities</h2>
          <div className="w-8 h-[1px] bg-primary mb-6" />
          <ul className="space-y-3">
            {service.capabilities.map((cap, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                <span className="text-sm font-body font-light text-muted-foreground">{cap}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Process */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants} className="mb-16">
          <h2 className="font-display text-2xl text-foreground font-light mb-4">Our Process</h2>
          <div className="w-8 h-[1px] bg-primary mb-6" />
          <div className="space-y-4">
            {service.process.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="text-xs font-body font-light text-primary tracking-widest min-w-[2rem]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-body font-light text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
          <Link
            to="/services"
            className="gold-underline text-sm font-body font-light tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors pb-1"
          >
            ← All Services
          </Link>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
