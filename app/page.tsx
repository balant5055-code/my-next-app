import HeroCarousel from "@/components/slider/HeroCarousel";
import OurProcess from "@/components/ourProcess/OurProcess";
import EventsPage from "@/app/events/page";
import UseCases from "@/components/useCases/UseCases";
import HowItWorks from "@/components/howItWorks/HowItWorks";
import OrganizerBenefits from "@/components/organizerBenefits/OrganizerBenefits";
import ParticipantExperience from "@/components/participantExperience/ParticipantExperience";
import StrongCTA from "@/components/strongCTA/StrongCTA";
import HappyParticipants from "@/components/HappyParticipants";
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
   

  
        <ParticipantExperience />
      <HappyParticipants />
       <StrongCTA />
       </article>
    
    </>
  );
}
