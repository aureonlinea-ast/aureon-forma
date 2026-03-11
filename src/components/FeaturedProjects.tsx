import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { allProjects } from "@/data/projects";

const featuredSlugs = [
  "jardins-tower",
  "blue-horizon-estate",
  "bts-studio-tour",
  "lumina-tower",
  "mar-a-lago",
  "skyline-residences",
  "echelon-heights",
  "virelle",
  "silverwood",
];
const featured = allProjects.filter((p) => featuredSlugs.includes(p.slug));

const ProjectCard = ({
  project,
  index,
}: {
  project: (typeof featured)[number];
  index: number;
}) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/work/${project.slug}`}
        className="group block relative overflow-hidden aspect-video"
      >
        {project.video ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
          >
            <source src={project.video} type="video/mp4" />
          </video>
        ) : (
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        {/* Title — fades in on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <p className="text-[10px] sm:text-xs font-body font-light tracking-[0.15em] uppercase text-primary mb-1">
            {project.category}
          </p>
          <h3 className="font-display text-lg sm:text-xl lg:text-2xl text-foreground font-light">
            {project.title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
};

const FeaturedProjects = () => {
  return (
    <section className="bg-background py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12 lg:mb-16"
        >
          <h2 className="font-display font-light text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-wide">
            Featured Work
          </h2>
          <div className="w-12 h-[1px] bg-primary mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {featured.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 lg:mt-16 text-center"
        >
          <Link
            to="/work"
            className="gold-underline text-sm font-body font-light tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors pb-1"
          >
            View All Projects
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
