import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Listings from "@/components/Listings";
import VirtualTour from "@/components/VirtualTour";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh" }}>
      <Navbar />
      <Hero />
      <Stats />
      <Listings />
      <VirtualTour />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
