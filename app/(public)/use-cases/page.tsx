import Image from "next/image";
import Link from "next/link";
import {
  TrophyIcon,
  BoltIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

import PageContainer from "@/components/layout/PageContainer";
import Breadcrumb from "@/components/ui/Breadcrumb";

const useCases = [
  {
    slug: "marathon-events",
    title: "Marathons & Walkathons",
    desc: "Complete race management with timing, bibs, and results.",
    image: "https://images.unsplash.com/photo-1540539234-c14a20fb7c7b",
    icon: TrophyIcon,
  },
  {
    slug: "cycling-events",
    title: "Cycling Events",
    desc: "Accurate rider tracking and real-time performance insights.",
    image: "https://images.unsplash.com/photo-1508780709619-79562169bc64",
    icon: BoltIcon,
  },
  {
    slug: "registration-events",
    title: "Registration Only",
    desc: "Fast and secure registration systems for any event.",
    image: "https://images.unsplash.com/photo-1515169067868-5387ec356754",
    icon: BuildingOfficeIcon,
  },
];

export default function Page() {
  return (
    <PageContainer>
      <Breadcrumb />

      {/* HEADER */}
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-10 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
          Event Solutions
        </h1>

        <p className="text-sm text-gray-500 mt-2">
          Choose your event type and explore how we manage it end-to-end
        </p>

        <div className="mx-auto mt-4 h-[2px] w-14 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-full" />
      </div>

      {/* GRID */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.slug}
                href={`/use-cases/${item.slug}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300">
                  {/* IMAGE */}
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-orange-500" />
                      <h3 className="text-base font-semibold text-gray-900">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>

                    {/* CTA */}
                    <div className="mt-4 text-sm font-medium text-orange-500 group-hover:translate-x-1 transition">
                      Explore →
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
