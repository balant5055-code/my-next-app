import HeroCarousel from "@/components/slider/HeroCarousel";
import OurProcess from "@/components/ourProcess/OurProcess";
import EventsPage from "@/app/(public)/events/page";
import UseCases from "@/components/useCases/UseCases";
import HowItWorks from "@/components/howItWorks/HowItWorks";
import OrganizerBenefits from "@/components/organizerBenefits/OrganizerBenefits";
import ParticipantExperience from "@/components/participantExperience/ParticipantExperience";
import HappyParticipants from "@/components/HappyParticipants";
import CTAContactSection from "@/components/ctaContact/CTAContactSection";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import TrustSection from "@/components/sections/TrustSection";
export default function Home() {
  return (
    <>
      <article>
        <HeroCarousel />

        <EventsPage />

        <OurProcess />

        <UseCases />

        <HowItWorks />

        <OrganizerBenefits />

        <HappyParticipants />

        <ParticipantExperience />

        <CTAContactSection />

        {/*   <TrustSection /> */}

        <WhatsAppFloat />
      </article>
    </>
  );
}
