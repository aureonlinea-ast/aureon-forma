import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { allServices } from "@/data/services";
import GetQuoteButton from "@/components/GetQuoteButton";
import Seo from "@/components/Seo";
import ServiceStage from "@/components/ServiceStage";
import ServiceInsightPanel from "@/components/ServiceInsight";
import ServiceTransition from "@/components/ServiceTransition";
import { serviceInsights } from "@/data/serviceInsights";

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Seo
        title="Services — ArchViz, Design, Modelling, Branding | Aureon Forma"
        description="Architectural visualisation, design, 3D modelling, product visualisation, and brand identity services for developers, architects, and considered brands."
        path="/services"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: allServices.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.title,
            url: `https://aureon-forma.lovable.app/services/${s.slug}`,
          })),
        }}
      />
      <Navigation />
      <main className="pt-24 pb-24">
        {/* Page intro */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] sm:text-xs font-body font-light tracking-[0.35em] uppercase text-primary">
              The Services
            </span>
            <h1 className="mt-4 font-display font-light text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-wide leading-[1.05]">
              A studio, end to end.
            </h1>
            <p className="mt-6 max-w-xl text-sm sm:text-base font-body font-light text-muted-foreground leading-relaxed">
              Five disciplines, one cinematic standard. Scroll through each — request a single service, or hand us the entire arc.
            </p>
            <div className="w-12 h-[1px] bg-primary mt-8" />
          </motion.div>
        </div>

        {/* Per-service full-viewport stages interleaved with insight panels + textured transitions */}
        {allServices.map((service, i) => {
          const insight = serviceInsights.find((x) => x.after === service.slug);
          const isLast = i === allServices.length - 1;
          return (
            <div key={service.slug}>
              <ServiceStage service={service} index={i} />
              {insight && (
                <>
                  <ServiceTransition />
                  <ServiceInsightPanel insight={insight} reverse={i % 2 === 1} />
                  {!isLast && <ServiceTransition />}
                </>
              )}
            </div>
          );
        })}

        <div className="mt-20 flex justify-center">
          <GetQuoteButton />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServicesPage;
