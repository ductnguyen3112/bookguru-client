// ... other imports

import Footer from "@/app/components/common/Footer";

export default function Layout({ children }) {
  return <main className="flex-grow">{children}
  <Footer />

  </main>;
}
