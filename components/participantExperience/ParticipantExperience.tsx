"use client";

import { motion } from "framer-motion";
import {
  DevicePhoneMobileIcon,
  CreditCardIcon,
  QrCodeIcon,
  BellAlertIcon,
  TrophyIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import SectionHeader from "@/components/ui/SectionHeader";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const experiences = [
  {
    title: "Mobile-Friendly Registration",
    description: "Register for sports events easily from any mobile device.",
    icon: DevicePhoneMobileIcon,
    accent: "from-orange-400 to-orange-600",
  },
  {
    title: "Instant Payment Confirmation",
    description: "Secure online payments confirmed immediately after checkout.",
    icon: CreditCardIcon,
    accent: "from-blue-400 to-blue-600",
  },
  {
    title: "QR Ticket on Phone",
    description:
      "Receive a digital QR race ticket instantly after registration.",
    icon: QrCodeIcon,
    accent: "from-purple-400 to-purple-600",
  },
  {
    title: "WhatsApp & Email Updates",
    description: "Get real-time event notifications and race updates.",
    icon: BellAlertIcon,
    accent: "from-green-400 to-green-600",
  },
  {
    title: "Event Results",
    description:
      "View official race results once the sports event is completed.",
    icon: TrophyIcon,
    accent: "from-yellow-400 to-yellow-600",
  },
  {
    title: "Photos & Certificates",
    description: "Access event photos and download participation certificates.",
    icon: PhotoIcon,
    accent: "from-pink-400 to-pink-600",
  },
];

function Card({ item }: any) {
  const Icon = item.icon;

  return (
    <div className="h-full w-full">
      <div className="h-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div className="flex gap-3 items-start">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${item.accent}`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {item.title}
            </h3>

            <div
              className={`mt-2 mb-2 h-[2px] w-8 rounded-full bg-gradient-to-r ${item.accent}`}
            />

            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParticipantExperience() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 mt-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <SectionHeader
            label="Experience"
            icon={<TrophyIcon className="h-4 w-4 text-orange-500" />}
            title="A Smooth Experience for Every Participant"
            subtitle="Designed to make participation effortless from start to finish."
          />
        </motion.div>

        {/* ✅ FIXED CENTERED SLIDER */}
        <div className="w-full overflow-hidden">
         <Swiper
  modules={[Autoplay, Pagination]}
  spaceBetween={20}
  loop={true}
  speed={600}
  autoplay={{
    delay: 2500,
    disableOnInteraction: false,
  }}
  pagination={{ clickable: true }}
  slidesPerView={"auto"}
  className="w-full !pb-10 overflow-hidden"
>
  {experiences.map((item) => (
    <SwiperSlide
      key={item.title}
      className="!w-[280px] md:!w-[320px]"
    >
      <Card item={item} />
    </SwiperSlide>
  ))}
</Swiper>
        </div>

      </div>
    </div>
  );
}