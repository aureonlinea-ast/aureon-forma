import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import GallerySlideshow from "@/components/GallerySlideshow";
import { allProjects } from "@/data/projects";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = allProjects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">Project Not Found</h1>
          <Link to="/work" className="text-primary font-body text-sm tracking-widest uppercase">
            ← Back to Work
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

      {/* Hero */}
      <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden">
        {project.video ? (
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={project.video} type="video/mp4" />
          </video>
        ) : (
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs font-body font-light tracking-[0.2em] uppercase text-primary mb-3"
          >
            {project.category}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-display font-light text-3xl md:text-5xl lg:text-6xl text-foreground"
          >
            {project.title}
          </motion.h1>
        </div>
      </div>

      <main className="container mx-auto px-6 lg:px-12 py-16 max-w-4xl">
        {/* Meta */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {[
            { label: "Location", value: project.location },
            { label: "Status", value: project.status },
            { label: "Completion", value: project.completionDate },
            { label: "Category", value: project.category },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] font-body font-light tracking-[0.2em] uppercase text-primary mb-1">{item.label}</p>
              <p className="text-sm font-body font-light text-foreground">{item.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Description */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={sectionVariants} className="mb-16">
          <p className="text-base font-body font-light text-muted-foreground leading-[1.8]">
            {project.detailedDescription}
          </p>
        </motion.div>

        {/* Concept */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={sectionVariants} className="mb-16">
          <h2 className="font-display text-2xl text-foreground font-light mb-4">Concept</h2>
          <div className="w-8 h-[1px] bg-primary mb-6" />
          <p className="text-sm font-body font-light text-muted-foreground leading-[1.8]">{project.concept}</p>
        </motion.div>

        {/* Design Inspiration */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={sectionVariants} className="mb-16">
          <h2 className="font-display text-2xl text-foreground font-light mb-4">Design Inspiration</h2>
          <div className="w-8 h-[1px] bg-primary mb-6" />
          <p className="text-sm font-body font-light text-muted-foreground leading-[1.8]">{project.designInspiration}</p>
        </motion.div>

        {/* Rendering */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={sectionVariants} className="mb-16">
          <h2 className="font-display text-2xl text-foreground font-light mb-4">Rendering</h2>
          <div className="w-8 h-[1px] bg-primary mb-6" />
          <p className="text-sm font-body font-light text-muted-foreground leading-[1.8]">{project.rendering}</p>
        </motion.div>

        {/* Gallery Slideshow */}
        {project.gallery.length > 0 && (
          <motion.div custom={5} initial="hidden" animate="visible" variants={sectionVariants}>
            <h2 className="font-display text-2xl text-foreground font-light mb-4">Gallery</h2>
            <div className="w-8 h-[1px] bg-primary mb-6" />
            <GallerySlideshow images={project.gallery} title={project.title} />
          </motion.div>
        )}

        <motion.div custom={6} initial="hidden" animate="visible" variants={sectionVariants} className="mt-16">
          <Link
            to="/work"
            className="gold-underline text-sm font-body font-light tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors pb-1"
          >
            ← All Projects
          </Link>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
