import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Listen",
    body: "A site visit. A long conversation. The brief beneath the brief.",
    keep: "Notes, sketches, references.",
  },
  {
    n: "02",
    title: "Frame",
    body: "Camera positions chosen before pixels. The architecture decides the lens.",
    keep: "Storyboards, shot lists.",
  },
  {
    n: "03",
    title: "Build",
    body: "Geometry, materials, light rigs. Calibrated until the model breathes on its own.",
    keep: "Mesh, UVs, library.",
  },
  {
    n: "04",
    title: "Light",
    body: "Sun, shadow, the second between dusk and night. Light is the silent character.",
    keep: "HDRIs, exposure ladders.",
  },
  {
    n: "05",
    title: "Render",
    body: "Passes stacked — diffuse, reflection, atmosphere — composed frame by frame.",
    keep: "EXRs, AOVs, ACES.",
  },
  {
    n: "06",
    title: "Edit",
    body: "Cut, score, restraint. The film leaves the studio only when nothing else can be removed.",
    keep: "DCP, web, print.",
  },
];

const BehindTheScenesIntro = () => {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-[1px] bg-primary" />
            <span className="text-[10px] sm:text-xs font-body font-light tracking-[0.35em] uppercase text-primary">
              The Procedure
            </span>
          </div>
          <h2 className="font-display font-light text-3xl sm:text-4xl lg:text-5xl text-foreground tracking-wide leading-[1.1]">
            Six rooms. One film.
          </h2>
          <p className="mt-6 text-sm sm:text-base font-body font-light text-muted-foreground leading-[1.85]">
            Every cinematic, render, and walkthrough passes through the same six rooms.
            None can be skipped. None can be hurried.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="relative group bg-background p-7 lg:p-9 overflow-hidden cursor-default"
            >
              {/* hover veil */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-[1200ms] pointer-events-none" />
              {/* gold corner mark */}
              <span className="absolute top-0 left-0 w-6 h-[1px] bg-primary/0 group-hover:bg-primary/70 transition-colors duration-[1000ms]" />
              <span className="absolute top-0 left-0 h-6 w-[1px] bg-primary/0 group-hover:bg-primary/70 transition-colors duration-[1000ms]" />

              <div className="flex items-baseline gap-4">
                <span className="font-display text-4xl text-primary/70 group-hover:text-primary transition-colors duration-[900ms]">
                  {s.n}
                </span>
                <h3 className="font-display text-2xl text-foreground tracking-wide">
                  {s.title}
                </h3>
              </div>
              <p className="mt-5 text-sm font-body font-light text-muted-foreground leading-[1.8]">
                {s.body}
              </p>

              {/* implied detail — slow reveal on hover */}
              <div className="mt-6 overflow-hidden">
                <div className="text-[10px] font-body font-light tracking-[0.3em] uppercase text-primary/0 group-hover:text-primary/80 translate-y-2 group-hover:translate-y-0 transition-all duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                  Tools we keep
                </div>
                <div className="text-xs font-body font-light text-muted-foreground/0 group-hover:text-muted-foreground translate-y-2 group-hover:translate-y-0 transition-all duration-[1300ms] ease-[cubic-bezier(0.16,1,0.3,1)] mt-1">
                  {s.keep}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BehindTheScenesIntro;