import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { allProjects } from "@/data/projects";
import ViewportProjectCard from "@/components/ViewportProjectCard";
import GetQuoteButton from "@/components/GetQuoteButton";
import Seo from "@/components/Seo";
import Scrollytelling from "@/components/Scrollytelling";

const workChapters = [
  {
    eyebrow: "Chapter 01 — Brief",
    title: "Every project begins as a question.",
    body: "A site, a brief, an ambition. We listen first — to the architect, to the developer, to the land itself — before a single pixel is drawn.",
    media: "/videos/hero-1.mp4",
  },
  {
    eyebrow: "Chapter 02 — Form",
    title: "Form is found, not forced.",
    body: "Massing studies, light analysis, material logic. We translate intent into geometry, refining proportion until the building feels inevitable.",
    media: "/videos/lumina.mp4",
  },
  {
    eyebrow: "Chapter 03 — Atmosphere",
    title: "Atmosphere is the architecture you can feel.",
    body: "Hour of day, weather, the breath of inhabitants. Atmosphere is what turns a render into a memory.",
    media: "/videos/civic-cinematic.mp4",
  },
  {
    eyebrow: "Chapter 04 — Narrative",
    title: "A portfolio of spatial narratives.",
    body: "Each project below is the closing frame of a much longer story. Scroll on to step inside.",
    media: "/videos/mar-a-lago.mp4",
  },
];

const WorkPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Seo
        title="Work — Architectural Visualisation Portfolio | Aureon Forma"
        description="Portfolio of spatial narratives: residential, commercial, masterplanning, and civic architectural visualisation projects by Aureon Forma."
        path="/work"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Aureon Forma — Work",
          description: "Portfolio of architectural visualisation projects.",
          url: "https://aureon-forma.lovable.app/work",
        }}
      />
      <Navigation />
      <main className="pt-24 pb-24">
        <Scrollytelling label="The Work" chapters={workChapters} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-12 lg:mb-16"
          >
            <h1 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-wide">
              Portfolio of Spatial Narratives
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
