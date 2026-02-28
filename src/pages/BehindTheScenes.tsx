import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const BehindTheScenesPage = () => {
  const videos = [
    { title: "Workflow Process", src: "/videos/behind-the-scenes.mp4" },
    { title: "Project Breakdown", src: "/videos/ins-project-2.mp4" },
    { title: "Rendering Pipeline", src: "/videos/vid-1.mp4" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h1 className="font-display font-light text-4xl lg:text-5xl text-foreground tracking-wide">
              Behind The Scenes
            </h1>
            <div className="w-12 h-[1px] bg-primary mt-6" />
            <p className="mt-6 text-sm font-body font-light text-muted-foreground max-w-lg leading-relaxed">
              A glimpse into our creative process — from concept sketches and half-rendered frames to the final cinematic result.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videos.map((video, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative overflow-hidden aspect-video glass-surface"
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src={video.src} type="video/mp4" />
                </video>
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background/70 to-transparent">
                  <h3 className="font-display text-lg text-foreground font-light">{video.title}</h3>
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
