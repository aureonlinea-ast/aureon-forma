import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { allServices } from "@/data/services";

const ServicesOverview = () => {
  return (
    <section className="bg-secondary py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12 lg:mb-16"
        >
          <h2 className="font-display font-light text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-wide">
            Services
          </h2>
          <div className="w-12 h-[1px] bg-primary mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allServices.map((service, i) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to={`/services/${service.slug}`}
                className="group block glass-surface p-6 sm:p-8 h-full transition-all duration-500 hover:border-primary/30"
              >
                <h3 className="font-display text-lg sm:text-xl text-foreground font-light mb-3 group-hover:text-primary transition-colors duration-500">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm font-body font-light text-muted-foreground leading-relaxed">
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
