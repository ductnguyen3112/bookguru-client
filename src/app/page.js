

import Header from "./components/home/Header";
import Hero from "./components/home/Hero";
import About from "./components/home/About";
import Feature from "./components/home/Feature";
import End from "./components/home/End";
import Footer from "./components/common/Footer";


export default function HomePage() {

  return (
    <div className="bg-white">
      <Header />
      <Hero />
      <About />
      <Feature />
      <End />
     <Footer />

    </div>
  );
}
