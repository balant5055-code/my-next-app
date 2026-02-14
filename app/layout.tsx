import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import type { Metadata } from "next";
import TopBar from "@/components/topBar/TopBar";
export const metadata: Metadata = {
  title: "Eventure — Event Registration & Timing Platform",
  description:
    "Eventure is a complete event technology platform for marathons, cycling events, and walkathons with registration, payments, and results.",
  keywords: [
    "marathon registration",
    "event timing",
    "event management",
    "run events",
    "sports events",
    "online registration",
  ],
  authors: [{ name: "Eventure Team" }],
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {/* ===== SEMANTIC HEADER ===== */}
        <header>
            <TopBar/>
          <Navbar />
        </header>

        {/* ===== MAIN CONTENT AREA ===== */}
        <main id="main-content" role="main">
          {children}
        </main>

        {/* ===== SEMANTIC FOOTER ===== */}
        <Footer />
      </body>
    </html>
  );
}
