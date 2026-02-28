import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import santaMaria from "@/assets/projects/santa-maria.jpg";
import modernVilla from "@/assets/projects/modern-villa.jpg";

const projects = [
  {
    title: "Hospital Santa Maria",
    category: "Commercial Architecture",
    image: santaMaria,
    slug: "hospital-santa-maria",
  },
  {
    title: "Modern Villa Residence",
    category: "Residential Design",
    image: modernVilla,
    slug: "modern-villa",
  },
  {
    title: "Lumina Tower",
    category: "ArchViz",
    video: "/videos/lumina.mp4",
    slug: "lumina-tower",
  },
];

const FeaturedProjects = () => {
  return (
    <section className="bg-background py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="font-display font-light text-3xl lg:text-4xl text-foreground tracking-wide">
            Featured Work
          </h2>
          <div className="w-12 h-[1px] bg-primary mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Link
                to={`/work/${project.slug}`}
                className="group block relative overflow-hidden aspect-[3/4]"
              >
                {project.video ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  >
                    <source src={project.video} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-xs font-body font-light tracking-[0.15em] uppercase text-primary mb-2">
                    {project.category}
                  </p>
                  <h3 className="font-display text-xl lg:text-2xl text-foreground font-light">
                    {project.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
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
