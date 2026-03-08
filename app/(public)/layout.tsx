"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/components/topBar/TopBar";
import FloatingSocial from "@/components/FloatingSocial";
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideFooter = pathname.includes("/register");

  return (
    <>
      <FloatingSocial />
      {/* ===== SEMANTIC HEADER ===== */}
      <header>
        <TopBar />
        <Navbar />
      </header>

      {/* ===== MAIN CONTENT AREA ===== */}

      {children}

      {/* ===== SEMANTIC FOOTER ===== */}
      {!hideFooter && <Footer />}
    </>
  );
}
