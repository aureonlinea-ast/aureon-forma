import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { allProjects } from "@/data/projects";
import ViewportProjectCard from "@/components/ViewportProjectCard";
import { useIsMobile } from "@/hooks/use-mobile";

const featuredSlugs = [
  "luna-residence",
  "eden-terrace",
  "blue-horizon-estate",
  "bts-studio-tour",
  "lumina-tower",
  "mar-a-lago",
  "skyline-residences",
  "echelon-heights",
  "virelle",
  "silverwood",
];
const mobileExclude = ["blue-horizon-estate"];
const allFeatured = allProjects.filter((p) => featuredSlugs.includes(p.slug));

const FeaturedProjects = () => {
  const isMobile = useIsMobile();
  const featured = isMobile
    ? allFeatured.filter((p) => !mobileExclude.includes(p.slug))
    : allFeatured;

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {featured.map((project, i) => (
            <div key={project.slug} className="h-[85vh] md:h-[75vh] lg:h-[80vh]">
              <ViewportProjectCard
                slug={project.slug}
                title={project.title}
                category={project.category}
                image={project.image}
                video={project.video}
                index={i}
              />
            </div>
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
