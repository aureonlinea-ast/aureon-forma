import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const services = [
  { title: "ArchViz", description: "High-end architectural visualization for developers and architecture firms.", slug: "archviz" },
  { title: "Architectural Design", description: "Concept-driven design blending form, light, and materiality.", slug: "architectural-design" },
  { title: "3D Modelling", description: "High-precision 3D modeling for architecture and product environments.", slug: "modelling" },
  { title: "Product Visualization", description: "Premium product visualization with cinematic lighting and precision.", slug: "product-visualization" },
  { title: "Branding & Marketing", description: "Holographic displays, billboards, 3D LED, brochures, and more.", slug: "branding" },
];

const ServicesOverview = () => {
  return (
    <section className="bg-secondary py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="font-display font-light text-3xl lg:text-4xl text-foreground tracking-wide">
            Services
          </h2>
          <div className="w-12 h-[1px] bg-primary mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to={`/services/${service.slug}`}
                className="group block glass-surface p-8 h-full transition-all duration-500 hover:border-primary/30"
              >
                <h3 className="font-display text-xl text-foreground font-light mb-3 group-hover:text-primary transition-colors duration-500">
                  {service.title}
                </h3>
                <p className="text-sm font-body font-light text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
