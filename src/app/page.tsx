import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Hero } from "@/components/marketing/sections/hero";
import { TrustBar } from "@/components/marketing/sections/trust-bar";
import { Features } from "@/components/marketing/sections/features";
import { HowItWorks } from "@/components/marketing/sections/how-it-works";
import { Benefits } from "@/components/marketing/sections/benefits";
import { Stats } from "@/components/marketing/sections/stats";
import { Testimonials } from "@/components/marketing/sections/testimonials";
import { Pricing } from "@/components/marketing/sections/pricing";
import { Faq } from "@/components/marketing/sections/faq";
import { Cta } from "@/components/marketing/sections/cta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Benefits />
        <Stats />
        <Testimonials />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
