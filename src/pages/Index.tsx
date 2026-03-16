import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturedProjects from "@/components/FeaturedProjects";
import ServicesOverview from "@/components/ServicesOverview";
import Footer from "@/components/Footer";
import GetQuoteButton from "@/components/GetQuoteButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
