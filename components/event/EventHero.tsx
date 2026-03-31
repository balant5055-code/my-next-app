"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  MapPinIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { LinkIcon, CheckIcon } from "@heroicons/react/24/outline";
import {
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/solid";
import { EventData } from "@/types/event";

interface Props {
  event?: EventData;
}
import { BoltIcon } from "@heroicons/react/24/solid";
import Breadcrumb from "@/components/ui/Breadcrumb";
export default function EventHero({ event }: Props) {
  if (!event) return null;
  const categories = Array.isArray(event.categories)
    ? event.categories
    : Object.values(event.categories || {});
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const eventDate =
    event?.date && !isNaN(new Date(event.date).getTime())
      ? new Date(event.date)
      : null;
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const background = event.bannerURL || "/ONLINE_POSTER.jpg";
  const registrationEnd =
    event?.registration?.end &&
    !isNaN(new Date(event.registration.end).getTime())
      ? new Date(event.registration.end)
      : null;
  useEffect(() => {
    if (!registrationEnd) return;

    const interval = setInterval(() => {
      const diff = registrationEnd.getTime() - Date.now();

      if (diff <= 0) return;

      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [registrationEnd]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const shareEvent = () => {
    const url = `${window.location.origin}/events/${event.slug}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${event.name}\n${url}`)}`,
      "_blank",
    );
  };

  const downloadPoster = async () => {
    try {
      const response = await fetch(background);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${event.slug}-poster.jpg`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setDownloaded(true);

      setTimeout(() => {
        setDownloaded(false);
      }, 2000);
    } catch (error) {
      console.error("Poster download failed:", error);
    }
  };
  const copyEventLink = async () => {
    try {
      const url = `${window.location.origin}/events/${event.slug}`;

      await navigator.clipboard.writeText(url);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const getCalendarLinks = () => {
    if (!eventDate || isNaN(eventDate.getTime())) return {};

    const start =
      eventDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 3);

    const end = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const title = encodeURIComponent(event.name);
    const location = encodeURIComponent(`${event.venue}, ${event.city}`);

    return {
      google: `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}`,
    };
  };

  const downloadICS = () => {
    if (!eventDate || isNaN(eventDate.getTime())) return;

    const start =
      eventDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 3);

    const end = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const reminderMinutes = 5 * 24 * 60;

    const ics = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.name}
DTSTART:${start}
DTEND:${end}
LOCATION:${event.venue}, ${event.city}
BEGIN:VALARM
TRIGGER:-PT${reminderMinutes}M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.slug}.ics`;
    link.click();
  };
  const calendar = getCalendarLinks();

  return (
    <section className="bg-white pt-8 pb-10">
      <div className="max-w-6xl mx-auto px-5">
        <Breadcrumb />
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <div className="flex items-center gap-3">
            {/* icon */}

            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md">
              <BoltIcon className="w-5 h-5" />
            </div>

            {/* title */}

            <h1 className="text-xl md:text-2xl bg-gradient-to-r from-[#9f2a25] via-[#c1342d] to-[#e0473f] bg-clip-text text-transparent animate-gradientMove">
              <span className="text-gray-900">{event.name.split(" ")[0]} </span>

              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 bg-[length:200%_100%] bg-clip-text text-transparent animate-gradientMove">
                {event.name.split(" ").slice(1).join(" ")}
              </span>
            </h1>

            {event.tagline && (
              <p className="mt-1 text-sm md:text-base text-gray-600 font-medium">
                {event.tagline}
              </p>
            )}
          </div>

          {/* animated underline */}

          <motion.div
            className="h-[2px] w-24 bg-gradient-to-r from-orange-500 to-red-500 mt-2 rounded-full"
            animate={{ width: [40, 90, 40] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>
        {/* HERO IMAGE */}

        <motion.div
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="relative h-[220px] md:h-[250px] rounded-2xl overflow-hidden"
        >
          {/* animated glow frame */}

          {/* image */}

          <div className="absolute inset-[2px] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={background}
              alt={event.name}
              fill
              className="object-cover"
            />
          </div>
        </motion.div>

        {/* CONTENT CARD */}

        <div className="relative -mt-16 bg-white  rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-5 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_auto] gap-6 items-start">
            {/* LEFT SIDE */}

            <div className="space-y-3">
              {/* LOCATION + DATE */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-700">
                {/* Location */}

                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-orange-500 shrink-0" />

                  <span className="font-medium truncate">{event.city}</span>
                </div>

                {/* divider (desktop only) */}

                <div className="hidden sm:block w-[4px] h-[4px] rounded-full bg-gray-300" />

                {/* Date */}

                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 text-orange-500 shrink-0" />

                  <span className="font-medium">
                    {eventDate?.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              {/* RACE CATEGORIES */}

              {/* RACE CATEGORIES */}

              <div className="pt-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Race Categories
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((cat: any, index: number) => (
                    <RaceCard
                      key={cat.id ?? cat.title ?? cat.distance ?? index}
                      distance={Number(cat.distance)}
                      title={cat.title}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}

            <div className="flex flex-col items-start md:items-start lg:items-end gap-3 w-full">
              {/* COUNTDOWN */}

              {/* COUNTDOWN SECTION */}

              <div className="flex flex-col gap-2 items-start lg:items-end">
                {/* urgency label */}

                <div className="text-[11px] font-medium text-orange-600 flex items-center gap-1">
                  ⏳ Registration closes on{" "}
                  {registrationEnd?.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>

                {/* timer */}

                <div className="flex gap-2 bg-gray-50 p-2 rounded-xl shadow-sm">
                  <Countdown label="DAYS" value={time.days} />
                  <Countdown label="HRS" value={time.hours} />
                  <Countdown label="MIN" value={time.minutes} />
                  <Countdown label="SEC" value={time.seconds} />
                </div>
              </div>

              {/* ACTION AREA */}
              {/* ACTION BAR */}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {/* PRIMARY CTA */}
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  href={`/events/${event.slug}/register`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-medium
bg-gradient-to-r from-orange-500 to-red-500 shadow-sm hover:shadow-md
transition whitespace-nowrap"
                >
                  <ClockIcon className="w-4 h-4" />
                  Register Now
                </motion.a>

                {/* SECONDARY ACTIONS */}
                <div className="flex items-center gap-2">
                  {/* CALENDAR */}
                  <div className="relative" ref={calendarRef}>
                    <button
                      onClick={() => setShowCalendar((prev) => !prev)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg
        border border-gray-200 bg-white text-gray-700 text-sm
        hover:bg-gray-50 transition"
                    >
                      <CalendarDaysIcon className="w-4 h-4 text-orange-500" />
                      <span className="hidden sm:inline">Calendar</span>
                    </button>

                    {showCalendar && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-30"
                      >
                        <a
                          href={calendar.google}
                          target="_blank"
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          <GlobeAltIcon className="w-4 h-4 text-red-500" />
                          Google Calendar
                        </a>

                        <button
                          onClick={downloadICS}
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left"
                        >
                          <DevicePhoneMobileIcon className="w-4 h-4 text-gray-600" />
                          Apple Calendar
                        </button>

                        <button
                          onClick={downloadICS}
                          className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left"
                        >
                          <ComputerDesktopIcon className="w-4 h-4 text-blue-500" />
                          Outlook
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* SHARE */}
                  <button
                    onClick={shareEvent}
                    className="flex items-center justify-center w-9 h-9 rounded-lg
      border border-gray-200 bg-white text-gray-700
      hover:bg-gray-50 transition"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </button>

                  {/* POSTER */}
                  <button
                    onClick={downloadPoster}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg border transition
  ${
    downloaded
      ? "border-green-300 bg-green-50 text-green-600"
      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
  }`}
                  >
                    {downloaded ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={copyEventLink}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg
  border transition
  ${
    copied
      ? "border-green-300 bg-green-50 text-green-600"
      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
  }`}
                  >
                    {copied ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <LinkIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Countdown({ label, value }: { label: string; value: number }) {
  const formatted = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center w-[58px] h-[52px] rounded-lg bg-white border border-gray-200 shadow-sm">
      <motion.div
        key={formatted}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="text-lg font-bold text-gray-900 leading-none"
      >
        {formatted}
      </motion.div>

      <div className="text-[10px] text-gray-500 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

function RaceCard({ distance, title }: { distance: number; title?: string }) {
  const getColor = (km: number) => {
    if (km <= 3) return "from-blue-500 to-blue-600";
    if (km <= 5) return "from-green-500 to-emerald-600";
    if (km <= 10) return "from-purple-500 to-pink-500";
    if (km <= 21) return "from-orange-500 to-red-500";
    return "from-red-600 to-rose-600";
  };

  const getLabelFromTitle = (title?: string) => {
    if (!title) return "";

    // Remove "40 KM", "10KM", etc.
    return title
      .replace(/\d+\s*KM/i, "") // remove "40 KM"
      .replace(/\d+/g, "") // remove any numbers
      .trim();
  };

  const gradient = getColor(distance);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.06 }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col items-center justify-center w-[75px] h-[60px] rounded-xl bg-white shadow-sm border border-gray-100 cursor-pointer overflow-hidden"
    >
      {/* top color bar */}

      <div
        className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient}`}
      />

      {/* distance */}

      <div className="text-sm font-bold text-gray-900">{distance}K</div>

      {/* label */}

      <div className="text-[10px] text-gray-500 text-center leading-tight line-clamp-2">
        {getLabelFromTitle(title)}
      </div>

      {/* hover glow */}

      <div
        className={`absolute inset-0 opacity-0 hover:opacity-10 bg-gradient-to-r ${gradient} transition`}
      />
    </motion.div>
  );
}
