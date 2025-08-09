import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/common/Footer";
import { ReduxProvider } from "./redux/provider";

import ClientModal from "./components/client/ClientModal";

import { Toaster } from "react-hot-toast";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ... other imports

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

          <ReduxProvider>
            <main className="flex-grow">{children}</main>
            <Toaster />
            <ClientModal/>
          </ReduxProvider>
   

      </body>
    </html>
  );
}
