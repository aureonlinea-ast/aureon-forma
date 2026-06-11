import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { allProjects } from "@/data/projects";

const beliefs = [
  {
    n: "I",
    word: "Light",
    line: "We do not add light to a scene. We listen for where it already lives.",
    quiet: "Sun, lamp, reflection, silence.",
  },
  {
    n: "II",
    word: "Restraint",
    line: "What you leave out is what makes the rest unforgettable.",
    quiet: "Less geometry. More intention.",
  },
  {
    n: "III",
    word: "Material",
    line: "Stone remembers. Brass remembers. So do the people who walk past them.",
    quiet: "Surface as memory.",
  },
  {
    n: "IV",
    word: "Time",
    line: "An image worth making is worth waiting for.",
    quiet: "Slow studio. Long shutter.",
  },
];

const clients = [
  "Boutique developers",
  "Hospitality groups",
  "Architects of record",
  "Private commissions",
  "Cultural institutions",
  "Luxury residences",
  "Diplomatic estates",
  "Family offices",
];

const AboutPage = () => {
  // Pull a few projects for the vision board so it stays in sync with /work.
  const visionBoard = allProjects.slice(0, 6);

  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Seo
        title="About — A Visionary Architectural Visualisation Studio | Aureon Forma"
        description="Aureon Forma is a premium, uncompromising architectural visualisation atelier — devoted to light, material and spatial storytelling. Based in Nairobi, working with developers, architects and cultural institutions worldwide."
        path="/about"
      />
      <Navigation />

      <main className="pt-28 pb-24">
        {/* Manifesto */}
        <section className="container mx-auto px-6 lg:px-12 pt-12 pb-24 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[1px] bg-primary" />
              <span className="text-[10px] sm:text-xs font-body font-light tracking-[0.35em] uppercase text-primary">
                Atelier — Est. Nairobi
              </span>
            </div>
            <h1 className="font-display font-light text-5xl sm:text-6xl lg:text-7xl text-foreground tracking-wide leading-[1.02]">
              We make light <em className="not-italic text-primary">behave</em>.
            </h1>
            <p className="mt-10 max-w-2xl text-base sm:text-lg font-body font-light text-muted-foreground leading-[1.9]">
              Aureon Forma is a small, uncompromising studio devoted to architectural visualisation
              and spatial storytelling. We work slowly, by hand, and only with clients who
              understand that an image, like a building, holds time.
            </p>
            <p className="mt-6 max-w-2xl text-sm font-body font-light text-muted-foreground/80 leading-[1.9]">
              Some of what we do is not on this page. By design.
            </p>
          </motion.div>
        </section>

        {/* On Light */}
        <section className="relative bg-secondary py-24 lg:py-32 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              background:
                "radial-gradient(ellipse at 20% 30%, hsl(var(--gold) / 0.10), transparent 55%)",
            }}
          />
          <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.9 }}
              className="lg:col-span-5"
            >
              <span className="text-[10px] font-body font-light tracking-[0.4em] uppercase text-primary">
                On Light
              </span>
              <h2 className="mt-6 font-display font-light text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-wide">
                The first material.
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="lg:col-span-7 space-y-6 text-sm sm:text-base font-body font-light text-muted-foreground leading-[1.95]"
            >
              <p>
                Before geometry, before render, before storyboard — there is light.
                We treat it as the building's first occupant. Long-exposure golden hour, the
                blue minute after dusk, the angle of a hallway at noon. These are not effects.
                They are decisions.
              </p>
              <p>
                Every Aureon image is composed to make light <em className="not-italic text-foreground">behave</em>:
                to land where the architecture wants it to land, to leave where silence
                should remain. The rest is craft.
              </p>
              <p className="text-muted-foreground/70 italic">
                Why this matters is the part we keep to ourselves.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Beliefs — hover-reveal cards */}
        <section className="container mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 max-w-2xl"
          >
            <span className="text-[10px] font-body font-light tracking-[0.4em] uppercase text-primary">
              Philosophy
            </span>
            <h2 className="mt-6 font-display font-light text-4xl sm:text-5xl text-foreground tracking-wide leading-[1.05]">
              Four beliefs we don't compromise.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/30">
            {beliefs.map((b, i) => (
              <motion.div
                key={b.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="relative group bg-background p-10 lg:p-14 overflow-hidden cursor-default"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-[1400ms]" />
                <span className="absolute top-0 left-0 w-8 h-[1px] bg-primary/0 group-hover:bg-primary transition-colors duration-[1200ms]" />
                <span className="absolute top-0 left-0 h-8 w-[1px] bg-primary/0 group-hover:bg-primary transition-colors duration-[1200ms]" />

                <div className="flex items-baseline gap-6">
                  <span className="font-display text-2xl text-primary/60 group-hover:text-primary transition-colors duration-[1000ms]">
                    {b.n}
                  </span>
                  <h3 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide">
                    {b.word}
                  </h3>
                </div>

                <p className="mt-8 text-base font-body font-light text-muted-foreground leading-[1.9] max-w-md">
                  {b.line}
                </p>

                <div className="mt-8 overflow-hidden h-6">
                  <div className="text-[10px] font-body font-light tracking-[0.35em] uppercase text-primary/0 translate-y-3 group-hover:translate-y-0 group-hover:text-primary/80 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                    {b.quiet}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Vision Board */}
        <section className="relative bg-background py-24 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="mb-16 max-w-2xl"
            >
              <span className="text-[10px] font-body font-light tracking-[0.4em] uppercase text-primary">
                Vision Board
              </span>
              <h2 className="mt-6 font-display font-light text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-wide">
                What we are looking for, before we know we have found it.
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {visionBoard.map((p, i) => {
                const tall = i % 5 === 0 || i % 5 === 3;
                return (
                  <motion.div
                    key={p.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.9, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative group overflow-hidden bg-secondary cursor-default ${
                      tall ? "row-span-2 aspect-[3/4] md:aspect-[3/4]" : "aspect-[4/3]"
                    }`}
                  >
                    {p.video ? (
                      <video
                        src={p.video}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                        onMouseLeave={(e) => (e.currentTarget as HTMLVideoElement).pause()}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                      />
                    ) : (
                      <img
                        src={p.image}
                        alt={p.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-[1500ms]" />

                    <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-body font-light tracking-[0.3em] uppercase text-primary/0 group-hover:text-primary translate-y-3 group-hover:translate-y-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                          {p.category}
                        </p>
                      </div>
                      <p className="mt-2 font-display text-lg sm:text-xl text-foreground tracking-wide">
                        {p.title}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Clients */}
        <section className="container mx-auto px-6 lg:px-12 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-4"
            >
              <span className="text-[10px] font-body font-light tracking-[0.4em] uppercase text-primary">
                Who we work with
              </span>
              <h2 className="mt-6 font-display font-light text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-wide">
                A short list, by choice.
              </h2>
              <p className="mt-6 text-sm font-body font-light text-muted-foreground/80 leading-[1.9] max-w-sm">
                We take on a small number of engagements each year. Names withheld
                until the work is built.
              </p>
            </motion.div>

            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-px bg-border/30">
              {clients.map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="group bg-background px-6 py-10 text-center cursor-default relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.04] transition-colors duration-[1200ms]" />
                  <span className="relative text-sm font-body font-light text-muted-foreground group-hover:text-foreground transition-colors duration-[1000ms]">
                    {c}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="container mx-auto px-6 lg:px-12 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="max-w-2xl"
          >
            <p className="text-sm font-body font-light text-muted-foreground/80 leading-[1.95]">
              Nairobi — working globally. By appointment.
            </p>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
