import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./component/Footer";
import { ReduxProvider } from "./redux/provider";

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
        </ReduxProvider>
        <Footer />
      </body>
    </html>
  );
}
