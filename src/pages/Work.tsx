import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { allProjects } from "@/data/projects";
import ViewportProjectCard from "@/components/ViewportProjectCard";
import GetQuoteButton from "@/components/GetQuoteButton";

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {allProjects.map((project, i) => (
              <div key={project.slug} className="h-[85vh] md:h-[75vh] lg:h-[80vh]">
                <ViewportProjectCard
                  slug={project.slug}
                  title={project.title}
                  category={project.category}
                  status={project.status}
                  image={project.image}
                  video={project.video}
                  index={i}
                />
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <GetQuoteButton />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WorkPage;
