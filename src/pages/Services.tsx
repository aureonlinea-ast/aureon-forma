import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { allServices } from "@/data/services";
import { useIsMobile } from "@/hooks/use-mobile";
import astoriaBg from "@/assets/projects/astoria-2.jpg";
import GetQuoteButton from "@/components/GetQuoteButton";
import ServicesShowcaseGallery from "@/components/ServicesShowcaseGallery";
import Seo from "@/components/Seo";
import Scrollytelling from "@/components/Scrollytelling";

const serviceChapters = [
  {
    eyebrow: "Discipline 01",
    title: "Architectural Visualisation.",
    body: "Cinematic stills and films that let your project be experienced before a brick is laid.",
    media: "/videos/lumina.mp4",
  },
  {
    eyebrow: "Discipline 02",
    title: "Design & 3D Modelling.",
    body: "Form-finding, façade studies, and high-fidelity geometry tuned for both render and production.",
    media: "/videos/echelon.mp4",
  },
  {
    eyebrow: "Discipline 03",
    title: "Product & Brand Visualisation.",
    body: "Objects and identities rendered with the same patience as buildings — material, light, restraint.",
    media: "/videos/holographic-display.mp4",
  },
  {
    eyebrow: "Discipline 04",
    title: "A studio, end to end.",
    body: "Concept to release. Choose a single service or hand us the whole arc.",
    media: "/videos/hero-2.mp4",
  },
];

const ServicesPage = () => {
  const isMobile = useIsMobile();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: isMobile ? 0.15 : 0.08,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Seo
        title="Services — ArchViz, Design, Modelling, Branding | Aureon Forma"
        description="Architectural visualisation, design, 3D modelling, product visualisation, and brand identity services for developers, architects, and considered brands."
        path="/services"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: allServices.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.title,
            url: `https://aureon-forma.lovable.app/services/${s.slug}`,
          })),
        }}
      />
      <Navigation />
      <main className="pt-32 pb-24 relative">
        <Scrollytelling label="The Services" chapters={serviceChapters} className="-mt-8" />

        {/* Faint building background */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url(${astoriaBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-24 mb-12 lg:mb-16"
          >
            <h1 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-wide">
              Services
            </h1>
            <div className="w-12 h-[1px] bg-primary mt-6" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {allServices.map((service) => (
              <motion.div key={service.slug} variants={itemVariants}>
                <Link
                  to={`/services/${service.slug}`}
                  className="group block glass-surface p-6 sm:p-10 h-full transition-all duration-500 hover:border-primary/30"
                >
                  <h3 className="font-display text-xl sm:text-2xl text-foreground font-light mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-500">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-body font-light text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  <span className="inline-block mt-4 sm:mt-6 text-xs font-body font-light tracking-[0.2em] uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Learn More →
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <ServicesShowcaseGallery />

          <div className="mt-12 flex justify-center">
            <GetQuoteButton />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
