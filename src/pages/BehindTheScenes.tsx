import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import beforeImg from "@/assets/bts/before-1.jpg";
import afterImg from "@/assets/bts/after-1.jpg";

const BehindTheScenesPage = () => {
  const videos = [
    { title: "Workflow Process", src: "/videos/behind-the-scenes.mp4" },
    { title: "Project Breakdown", src: "/videos/ins-project-2.mp4" },
    { title: "Rendering Pipeline", src: "/videos/vid-1.mp4" },
    { title: "Animation Study", src: "/videos/ins-project-3.mp4" },
  ];

  const comparisons = [
    { before: beforeImg, after: afterImg, title: "Rooftop Terrace — From Wireframe to Reality" },
  ];

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
              Behind The Scenes
            </h1>
            <div className="w-12 h-[1px] bg-primary mt-6" />
            <p className="mt-6 text-xs sm:text-sm font-body font-light text-muted-foreground max-w-lg leading-relaxed">
              A glimpse into our creative process — from concept sketches and half-rendered frames to the final cinematic result.
            </p>
          </motion.div>

          {/* Before / After Comparisons */}
          {comparisons.map((comp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <h3 className="font-display text-lg sm:text-xl text-foreground font-light mb-4">{comp.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative overflow-hidden">
                  <img src={comp.before} alt="Before" className="w-full aspect-video object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="glass-surface px-3 py-1 text-[10px] font-body font-light tracking-[0.15em] uppercase text-primary">Before</span>
                  </div>
                </div>
                <div className="relative overflow-hidden">
                  <img src={comp.after} alt="After" className="w-full aspect-video object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="glass-surface px-3 py-1 text-[10px] font-body font-light tracking-[0.15em] uppercase text-primary">After</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Videos */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {videos.map((video, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                className="relative overflow-hidden rounded-sm glass-surface w-full"
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-auto block"
                >
                  <source src={video.src} type="video/mp4" />
                </video>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-gradient-to-t from-background/70 to-transparent">
                  <h3 className="font-display text-base sm:text-lg text-foreground font-light">{video.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BehindTheScenesPage;
