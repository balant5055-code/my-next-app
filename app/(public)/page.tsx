import ClientHeroCarousel from "@/components/ClientHeroCarousel";
import OurProcess from "@/components/ourProcess/OurProcess";
import EventsPage from "@/app/(public)/events/page";
import UseCases from "@/components/useCases/UseCases";
import HowItWorks from "@/components/howItWorks/HowItWorks";
import OrganizerBenefits from "@/components/organizerBenefits/OrganizerBenefits";
import ParticipantExperience from "@/components/participantExperience/ParticipantExperience";
import HappyParticipants from "@/components/HappyParticipants";
import CTAContactSection from "@/components/ctaContact/CTAContactSection";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import Script from "next/script";
import TrustedBy from "@/components/sections/TrustedBy";
export const metadata = {
  title: "Raceline India | Marathon Timing & Event Registration Platform",
  description:
    "Raceline India provides professional marathon timing, race management, and online event registration solutions for running events across India. Discover races or host your own event with Raceline.",
  keywords: [
    "marathon registration India",
    "running events India",
    "race timing India",
    "marathon timing company India",
    "running event platform India",
    "marathon timing system India",
  ],

  openGraph: {
    title: "Raceline India | Marathon Timing & Event Registration Platform",
    description:
      "Professional marathon timing, race management, and event registration platform for running events across India.",
    url: "https://www.racelineindia.com",
    siteName: "Raceline India",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Raceline India Marathon Platform",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Raceline India | Marathon Timing Platform",
    description:
      "Discover running events or host your own marathon with Raceline India's event platform.",
    images: ["/og-image.jpg"],
  },
};

export default function Home() {
  return (
    <main id="main-content" role="main" className="flex flex-col">
      <Script
        id="event-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Raceline India",
            url: "https://www.racelineindia.com",
            logo: "https://www.racelineindia.com/logo/raceline-in.png",
            sameAs: ["https://www.instagram.com/", "https://www.facebook.com/"],
          }),
        }}
      />

      {/* HOME */}
      <section id="home" className="scroll-mt-20">
        <ClientHeroCarousel />
      </section>

      {/* EVENTS */}
      <section id="events" className="scroll-mt-20 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4">
          <EventsPage />
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-20 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 space-y-8 md:space-y-10">
          {/*   <OurProcess /> */}
          <UseCases />
        </div>
      </section>
      <section className="py-8 md:py-10">
        <HowItWorks />{" "}
      </section>
      <HappyParticipants />
      {/* ABOUT */}
      <section id="about" className="scroll-mt-20 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 space-y-8 md:space-y-10">
          <OrganizerBenefits />
        </div>
      </section>
      <section className="py-8 md:py-10">
        <TrustedBy />{" "}
      </section>
      <section className="py-8 md:py-10">
        <ParticipantExperience />{" "}
      </section>
      {/* CONTACT */}
      <section id="contact" className="scroll-mt-20 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4">
          <CTAContactSection />
        </div>
      </section>

      <WhatsAppFloat />
    </main>
  );
}
