import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./component/Footer";
import { ReduxProvider } from "./redux/provider";
import ClientModal from "./component/client/ClientModal";
import GetUserData from "./component/GetUserData";
import {Toaster} from "react-hot-toast";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <main className="flex-grow">{children}</main>
          <ClientModal/>
          <GetUserData />
          <Toaster />
        </ReduxProvider>
        <Footer />
      </body>
    </html>
  );
}
