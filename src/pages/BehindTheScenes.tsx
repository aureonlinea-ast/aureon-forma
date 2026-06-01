import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ViewportProjectCard from "@/components/ViewportProjectCard";
import Seo from "@/components/Seo";

/* ── BTS media items displayed as viewport-filling cards ── */
const btsItems = [
  {
    slug: "wireframe-to-reality",
    title: "From Wireframe to Reality",
    category: "Process",
    video: "/videos/behind-the-scenes.mp4",
  },
  {
    slug: "workflow-process",
    title: "Workflow Process",
    category: "Pipeline",
    video: "/videos/behind-the-scenes.mp4",
  },
  {
    slug: "project-breakdown",
    title: "Project Breakdown",
    category: "Deep Dive",
    video: "/videos/ins-project-2.mp4",
  },
  {
    slug: "rendering-pipeline",
    title: "Rendering Pipeline",
    category: "Technical",
    video: "/videos/vid-1.mp4",
  },
  {
    slug: "animation-study",
    title: "Animation Study",
    category: "Motion",
    video: "/videos/ins-project-3.mp4",
  },
  {
    slug: "studio-session",
    title: "Studio Session",
    category: "Behind The Scenes",
    video: "/videos/bts-3-2.mp4",
  },
  {
    slug: "creative-tour",
    title: "Creative Tour",
    category: "Studio",
    video: "/videos/tour.mp4",
  },
  {
    slug: "process-documentary",
    title: "Process Documentary",
    category: "Documentary",
    video: "/videos/behind-the-scenes-2.mp4",
  },
];

const BehindTheScenesPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Seo
        title="Behind The Scenes — Process & Craft | Aureon Forma"
        description="A glimpse into Aureon Forma's creative process — from concept sketches and wireframes to cinematic architectural output."
        path="/behind-the-scenes"
      />
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
              Behind The Scenes
            </h1>
            <p className="mt-4 text-sm font-body font-light text-muted-foreground max-w-lg leading-relaxed">
              A glimpse into our creative process — from concept sketches to cinematic output.
            </p>
            <div className="w-12 h-[1px] bg-primary mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {btsItems.map((item, i) => (
              <div key={item.slug} className="h-[85vh] md:h-[75vh] lg:h-[80vh]">
                <ViewportProjectCard
                  slug={item.slug}
                  title={item.title}
                  category={item.category}
                  video={item.video}
                  index={i}
                  linkPrefix="/behind-the-scenes"
                />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BehindTheScenesPage;
