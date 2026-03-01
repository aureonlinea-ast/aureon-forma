import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import beforeImg from "@/assets/bts/before-1.jpg";
import afterImg from "@/assets/bts/after-1.jpg";

const BehindTheScenesPage = () => {
  const mediaItems = [
    {
      type: "comparison" as const,
      title: "Rooftop Terrace — From Wireframe to Reality",
      before: beforeImg,
      after: afterImg,
      description: "See how raw wireframes transform into photorealistic renders through meticulous material development and lighting design.",
    },
    {
      type: "video" as const,
      title: "Workflow Process",
      src: "/videos/behind-the-scenes.mp4",
      description: "Our end-to-end visualization pipeline — from concept ideation through modeling, texturing, and final cinematic output.",
    },
    {
      type: "video" as const,
      title: "Project Breakdown",
      src: "/videos/ins-project-2.mp4",
      description: "A deep dive into the technical decisions behind one of our flagship projects, exploring geometry, materials, and atmosphere.",
    },
    {
      type: "video" as const,
      title: "Rendering Pipeline",
      src: "/videos/vid-1.mp4",
      description: "From raw geometry to final frame — how we leverage V-Ray, Lumion, and Unreal Engine to produce cinematic-quality visuals.",
    },
    {
      type: "video" as const,
      title: "Animation Study",
      src: "/videos/ins-project-3.mp4",
      description: "Exploring camera motion, pacing, and atmospheric effects that bring architectural narratives to life.",
    },
    {
      type: "video" as const,
      title: "Studio Session",
      src: "/videos/bts-3-2.mp4",
      description: "A candid look at the creative environment — tools, screens, and the collaborative energy behind every project.",
    },
    {
      type: "video" as const,
      title: "Creative Tour",
      src: "/videos/tour.mp4",
      description: "Walk through our studio space and see where architectural visions come to life.",
    },
    {
      type: "video" as const,
      title: "Process Documentary",
      src: "/videos/behind-the-scenes-2.mp4",
      description: "A cinematic documentary capturing the passion and precision that defines our creative process.",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 lg:mb-20"
          >
            <h1 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-wide">
              Behind The Scenes
            </h1>
            <div className="w-12 h-[1px] bg-primary mt-6" />
            <p className="mt-6 text-xs sm:text-sm font-body font-light text-muted-foreground max-w-lg leading-relaxed">
              A glimpse into our creative process — from concept sketches and half-rendered frames to the final cinematic result.
            </p>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-10 font-display font-light text-xl sm:text-2xl lg:text-3xl text-primary tracking-wide"
            >
              See Us in Action
            </motion.h2>
          </motion.div>

          {/* Alternating grid rows */}
          <div className="flex flex-col gap-16 lg:gap-24">
            {mediaItems.map((item, i) => {
              const isEven = i % 2 === 0;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center ${isEven ? "" : "lg:[direction:rtl]"}`}
                >
                  {/* Media */}
                  <div className={`relative overflow-hidden rounded-sm ${isEven ? "" : "lg:[direction:ltr]"}`}>
                    {item.type === "comparison" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <img src={item.before} alt="Before" className="w-full aspect-video object-cover" loading="lazy" />
                          <span className="absolute top-2 left-2 glass-surface px-2 py-1 text-[9px] font-body font-light tracking-[0.15em] uppercase text-primary">Before</span>
                        </div>
                        <div className="relative">
                          <img src={item.after} alt="After" className="w-full aspect-video object-cover" loading="lazy" />
                          <span className="absolute top-2 left-2 glass-surface px-2 py-1 text-[9px] font-body font-light tracking-[0.15em] uppercase text-primary">After</span>
                        </div>
                      </div>
                    ) : (
                      <video autoPlay muted loop playsInline className="w-full h-auto block rounded-sm">
                        <source src={item.src} type="video/mp4" />
                      </video>
                    )}
                  </div>

                  {/* Text */}
                  <div className={`${isEven ? "" : "lg:[direction:ltr]"}`}>
                    <h3 className="font-display text-lg sm:text-xl lg:text-2xl text-foreground font-light mb-3">
                      {item.title}
                    </h3>
                    <div className="w-8 h-[1px] bg-primary mb-4" />
                    <p className="text-sm font-body font-light text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BehindTheScenesPage;
