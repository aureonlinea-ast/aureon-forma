import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const services = [
  { title: "ArchViz", description: "High-end architectural visualization for developers and architecture firms. We produce photorealistic renders and cinematic animations that bring unbuilt spaces to life.", slug: "archviz" },
  { title: "Architectural Design", description: "Concept-driven architectural design blending form, light, and materiality. Every space is crafted as a narrative experience.", slug: "architectural-design" },
  { title: "3D Modelling", description: "High-precision 3D modeling services for architecture and product environments. Detail-obsessed geometry and surface accuracy.", slug: "modelling" },
  { title: "Product Visualization", description: "Premium product visualization with cinematic lighting and surface precision. From furniture to electronics, every angle matters.", slug: "product-visualization" },
  { title: "Branding & Marketing", description: "3D holographic displays, partner collaborations, billboards, 3D LED billboards, brochures, magazines, and posters.", slug: "branding" },
];

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h1 className="font-display font-light text-4xl lg:text-5xl text-foreground tracking-wide">
              Services
            </h1>
            <div className="w-12 h-[1px] bg-primary mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, i) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link
                  to={`/services/${service.slug}`}
                  className="group block glass-surface p-10 h-full transition-all duration-500 hover:border-primary/30"
                >
                  <h3 className="font-display text-2xl text-foreground font-light mb-4 group-hover:text-primary transition-colors duration-500">
                    {service.title}
                  </h3>
                  <p className="text-sm font-body font-light text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  <span className="inline-block mt-6 text-xs font-body font-light tracking-[0.2em] uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Learn More →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
