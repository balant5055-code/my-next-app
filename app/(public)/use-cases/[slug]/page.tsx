import { notFound } from "next/navigation";
import Image from "next/image";
import {
  CheckCircleIcon,
  BoltIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

import PageContainer from "@/components/layout/PageContainer";

import Breadcrumb from "@/components/ui/Breadcrumb";

const data: any = {
  "marathon-events": {
    title: "Marathon Event Management",
    desc: "We handle complete marathon operations — from registrations to final result publishing using bibs and RFID timing systems.",
    image: "https://images.unsplash.com/photo-1540539234-c14a20fb7c7b",
    flow: [
      "Online Registration Setup",
      "Category & Distance Configuration",
      "Bib Assignment & Printing",
      "RFID Chip Timing Setup",
      "Race Day Live Tracking",
      "Result Processing & Publishing",
    ],
    features: [
      "Custom Registration Website",
      "Bib & Category Management",
      "RFID Timing Integration",
      "Live Leaderboard",
      "Certificates & Photos",
    ],
    benefits: [
      "Zero manual work",
      "Accurate results without errors",
      "Professional event execution",
      "Better participant experience",
    ],
  },

  "cycling-events": {
    title: "Cycling Event Management",
    desc: "End-to-end cycling event support including rider tracking, checkpoint timing, and result processing.",
    image: "https://images.unsplash.com/photo-1508780709619-79562169bc64",
    flow: [
      "Participant Registration",
      "Rider ID & Tracking Setup",
      "Checkpoint Monitoring",
      "Live Tracking System",
      "Finish Line Timing",
      "Result Publishing",
    ],
    features: [
      "Accurate Rider Tracking",
      "Checkpoint Timing",
      "Live Dashboard",
      "Leaderboard System",
      "Automated Results",
    ],
    benefits: [
      "No tracking errors",
      "Smooth race management",
      "Live visibility for organizers",
      "Professional experience",
    ],
  },

  "registration-events": {
    title: "Event Registration System",
    desc: "We provide fast and secure registration systems for conferences, meetings, and private events.",
    image: "https://images.unsplash.com/photo-1515169067868-5387ec356754",
    flow: [
      "Custom Form Creation",
      "Online Registration Launch",
      "Payment Integration",
      "QR Ticket Generation",
      "Email & WhatsApp Confirmation",
    ],
    features: [
      "Secure Payment Gateway",
      "QR Ticket System",
      "Instant Confirmation",
      "Admin Dashboard",
      "Real-time Data Access",
    ],
    benefits: [
      "No manual data handling",
      "Fast participant onboarding",
      "Secure transactions",
      "Professional event setup",
    ],
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = data[slug];

  if (!item) return notFound();

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <Breadcrumb />

      <div className="relative h-[240px] sm:h-[300px] md:h-[360px] rounded-2xl overflow-hidden mb-10">
        {/* IMAGE */}
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/60" />

        {/* GRADIENT GLOW */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20" />

        {/* 🔥 CENTER CONTENT */}
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-xl">
            {/* TOP LABEL */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrophyIcon className="w-5 h-5 text-orange-400" />
              <span className="text-xs uppercase tracking-wider text-orange-400">
                Use Case
              </span>
            </div>

            {/* TITLE */}
            <h1 className="text-xl sm:text-2xl md:text-4xl font-semibold text-white tracking-tight">
              {item.title}
            </h1>

            {/* LINE */}
            <div className="mx-auto mt-3 h-[2px] w-12 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-full" />

            {/* DESC */}
            <p className="mt-3 text-gray-200 text-sm sm:text-base leading-relaxed">
              {item.desc}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-4 pb-12 space-y-12">
        {/* FLOW */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Process</h3>

          <div className="space-y-3">
            {item.flow.map((step: string, i: number) => (
              <div key={step} className="flex gap-3 items-start">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                  {i + 1}
                </div>

                <p className="text-sm text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Features</h3>

          <div className="space-y-3">
            {item.features.map((f: string) => (
              <div key={f} className="flex gap-3 items-start">
                <CheckCircleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                <p className="text-sm text-gray-700">{f}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BENEFITS */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Why Us</h3>

          <div className="space-y-3">
            {item.benefits.map((b: string) => (
              <div key={b} className="flex gap-3 items-start">
                <TrophyIcon className="h-5 w-5 text-orange-500 mt-0.5" />
                <p className="text-sm text-gray-700">{b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="pt-4">
          <a
            href={`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(
              `Hi, I am interested in ${item.title}`,
            )}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition
            bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"
          >
            <BoltIcon className="h-5 w-5" />
            Plan My Event
          </a>

          <p className="text-xs text-gray-400 mt-2">
            Fast response • Professional support
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
