"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Header from "./components/home/Header";
import Hero from "./components/home/Hero";
import About from "./components/home/About";
import Feature from "./components/home/Feature";
import End from "./components/home/End";
import Footer from "./components/common/Footer";

const navigation = [
  { name: "Features", href: "#" },
  { name: "Pricing", href: "#" },
  { name: "Contact", href: "#" },
  { name: "About Us", href: "#" },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
