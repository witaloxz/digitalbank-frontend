import LandingHeader from "@/components/landing/LandingHeader";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Features from "@/components/landing/Features";
import Benefits from "@/components/landing/Benefits";
import Services from "@/components/landing/Services";
import Security from "@/components/landing/Security";
import Testimonials from "@/components/landing/Testimonials";
import CTASession from "@/components/landing/CTASession";
import LandingFooter from "@/components/landing/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <Hero />
      <Stats />
      <Features />
      <Benefits />
      <Services />
      <Security />
      <Testimonials />
      <CTASession />
      <LandingFooter />
    </div>
  );
};

export default Index;