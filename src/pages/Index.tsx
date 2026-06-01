import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturedProjects from "@/components/FeaturedProjects";
import ServicesOverview from "@/components/ServicesOverview";
import Footer from "@/components/Footer";
import GetQuoteButton from "@/components/GetQuoteButton";
import Seo from "@/components/Seo";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Aureon Forma — Architectural Visualisation Atelier"
        description="Premium architectural visualisation atelier crafting photoreal renders, cinematic animation, planning, and brand identity for developers and architects."
        path="/"
      />
      <Navigation />
      <HeroSection />
      <FeaturedProjects />
      <ServicesOverview />
      <div className="container mx-auto px-6 lg:px-12 py-16 flex justify-center">
        <GetQuoteButton />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
