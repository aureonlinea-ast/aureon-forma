import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display font-light text-4xl lg:text-5xl text-foreground tracking-wide mb-4">
              About Aureon
            </h1>
            <div className="w-12 h-[1px] bg-primary mb-12" />
          </motion.div>

          <div className="space-y-8">
            {[
              "Aureon is a design studio dedicated to the art of spatial storytelling. We transform architectural visions into immersive visual experiences through precision, restraint, and cinematic sensibility.",
              "Our work spans architectural visualization, conceptual design, product rendering, and brand identity — each project approached as a narrative composition of light, material, and form.",
              "We believe architecture is not merely built — it is experienced. Every pixel, every shadow, every surface finish carries intention. Our process is slow, deliberate, and uncompromising.",
              "Based in Nairobi, working globally.",
            ].map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
                className="text-base font-body font-light text-muted-foreground leading-[1.8]"
              >
                {text}
              </motion.p>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
