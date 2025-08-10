
import Header from "./components/home/Header";
import Hero from "./components/home/Hero";
import About from "./components/home/About";
import Feature from "./components/home/Feature";
import End from "./components/home/End";
import Footer from "./components/common/Footer";
import Meta from "@/app/components/common/Meta";


export default function HomePage() {
  const metaData = {
    businessName: "BookGuru",
    businessAddress: "Book salons and spas near you",
    businessDescription:
      "Discover and book salon and spa appointments with BookGuru. Find professionals, compare services, and reserve your spot in seconds.",
  };

  return (
    <div className="bg-white">
      <Meta data={metaData} />
      <Header />
      <Hero />
      <About />
      <Feature />
      <End />
     <Footer />

    </div>
  );
}
