import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/components/topBar/TopBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ===== SEMANTIC HEADER ===== */}
      <header>
        <TopBar />
        <Navbar />
      </header>

      {/* ===== MAIN CONTENT AREA ===== */}
      <main id="main-content" role="main">
        {children}
      </main>

      {/* ===== SEMANTIC FOOTER ===== */}
      <Footer />
    </>
  );
}
