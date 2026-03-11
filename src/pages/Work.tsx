import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { allProjects } from "@/data/projects";

const WorkPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 lg:mb-16"
          >
            <h1 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-wide">
              Work
            </h1>
            <div className="w-12 h-[1px] bg-primary mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {allProjects.map((project, i) => (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <Link to={`/work/${project.slug}`} className="group block relative overflow-hidden aspect-[3/4]">
                  {project.video ? (
                    <video autoPlay muted loop playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]">
                      <source src={project.video} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <span className="glass-surface px-2 py-1 sm:px-3 text-[9px] sm:text-[10px] font-body font-light tracking-[0.15em] uppercase text-primary">
                      {project.status}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[10px] sm:text-xs font-body font-light tracking-[0.15em] uppercase text-primary mb-1 sm:mb-2">{project.category}</p>
                    <h3 className="font-display text-lg sm:text-xl text-foreground font-light">{project.title}</h3>
                  </div>
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

export default WorkPage;
