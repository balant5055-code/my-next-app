"use client";

import dynamic from "next/dynamic";

const HeroCarousel = dynamic(() => import("@/components/slider/HeroCarousel"), {
  ssr: false,
});

export default function ClientHeroCarousel() {
  return <HeroCarousel />;
}
