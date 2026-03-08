"use client";
import { toPng } from "html-to-image";
import QRCodeCanvas from "react-qr-code";
import QRCode from "qrcode";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ClipboardDocumentIcon,
  TicketIcon,
  ReceiptPercentIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";
import confetti from "canvas-confetti";

import { secureFetch } from "@/lib/secureFetch";

const myConfetti = confetti.create(undefined, {
  resize: true,
  useWorker: false,
});

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const regId = searchParams.get("regId");

  const qrRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">(
    "desktop",
  );
  useEffect(() => {
    if (!regId) return;

    const fetchRegistration = async () => {
      try {
        const res = await fetch(`/api/get-registration?regId=${regId}`);
        const data = await res.json();

        if (data.success) {
          setRegistration(data.data);
          triggerConfetti();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const ua = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceType("ios");
    } else if (/android/.test(ua)) {
      setDeviceType("android");
    } else {
      setDeviceType("desktop");
    }
    fetchRegistration();
  }, [regId]);

  const copyToClipboard = (text: string | null, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
    };

    function fire(particleRatio: number, opts: any) {
      myConfetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const downloadQRAsPNG = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${registration.registrationId}.png`;
      link.click();
    };

    img.src = url;
  };
  const getEventJSDate = (): Date | null => {
    const raw = registration?.eventDate;
    if (!raw) return null;

    if (raw?._seconds) return new Date(raw._seconds * 1000);
    if (typeof raw === "string") return new Date(raw);
    if (raw instanceof Date) return raw;

    return null;
  };

  const eventJSDate = getEventJSDate();

  const formattedDate = eventJSDate
    ? eventJSDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  // GOOGLE CALENDAR (with 5 day reminder)
  const generateGoogleCalendarLinkWithReminder = () => {
    if (!eventJSDate) return "#";

    const start = eventJSDate.toISOString().replace(/[-:]/g, "").split(".")[0];

    const end = new Date(eventJSDate.getTime() + 3 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0];

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      registration.eventName || "Race Event",
    )}&dates=${start}/${end}&details=Race Event`;
  };

  // APPLE + OUTLOOK (.ICS FILE WITH 5 DAY REMINDER)
  const downloadICSCalendar = () => {
    if (!eventJSDate) return;

    const start = new Date(eventJSDate);
    const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);

    const formatDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = `
      BEGIN:VCALENDAR
      VERSION:2.0
      BEGIN:VEVENT
      SUMMARY:${registration.eventName}
      DESCRIPTION:Race Event
      DTSTART:${formatDate(start)}
      DTEND:${formatDate(end)}
      BEGIN:VALARM
      TRIGGER:-P5D
      ACTION:DISPLAY
      DESCRIPTION:Race Reminder
      END:VALARM
      END:VEVENT
      END:VCALENDAR
      `;

    const blob = new Blob([icsContent.trim()], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "race-event.ics";
    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Registration not found
      </div>
    );
  }

  const fullName = `${registration.participant?.firstName || ""} ${
    registration.participant?.lastName || ""
  }`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  const qrValue = `${baseUrl}/checkin/${registration.registrationId}`;

  const generateStoryCard = async () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // helper function to safely load images
      const loadImage = (src: string): Promise<HTMLImageElement | null> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
          img.onerror = () => {
            console.warn("Image failed to load:", src);
            resolve(null);
          };
        });
      };

      /* ---------------- BACKGROUND ---------------- */

      const bg = await loadImage("/story-bg.jpg");

      if (bg) {
        ctx.drawImage(bg, 0, 0, 1080, 1920);
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
        gradient.addColorStop(0, "#111111");
        gradient.addColorStop(1, "#7f1d1d");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1080, 1920);
      }

      /* ---------------- OVERLAY ---------------- */

      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, 1080, 1920);

      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";

      /* ---------------- LOGO ---------------- */

      const logo = await loadImage("/logo/raceline-in.png");

      if (logo) {
        const maxWidth = 320;
        const scale = maxWidth / logo.width;

        const logoWidth = logo.width * scale;
        const logoHeight = logo.height * scale;

        ctx.drawImage(logo, (1080 - logoWidth) / 2, 60, logoWidth, logoHeight);
      }

      /* ---------------- EVENT TITLE ---------------- */

      const eventTitle = registration?.eventName?.toUpperCase() || "MARATHON";

      ctx.font = "bold 90px sans-serif";
      ctx.fillText(eventTitle.slice(0, 22), 540, 420);

      /* ---------------- BADGE ---------------- */

      ctx.fillStyle = "#16a34a";
      ctx.fillRect(360, 600, 360, 70);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText("OFFICIAL RUNNER", 540, 645);

      /* ---------------- RUNNER NAME ---------------- */

      ctx.font = "bold 70px sans-serif";
      ctx.fillText(fullName.toUpperCase(), 540, 840);

      /* ---------------- CATEGORY ---------------- */

      ctx.font = "40px sans-serif";
      ctx.fillText(registration.category.toUpperCase(), 540, 920);

      /* ---------------- DATE ---------------- */

      ctx.font = "34px sans-serif";
      ctx.fillText(formattedDate, 540, 980);

      /* ---------------- MOTIVATION ---------------- */

      ctx.font = "bold 60px sans-serif";
      ctx.fillText("THE START LINE", 540, 1240);
      ctx.fillText("IS WAITING", 540, 1320);

      /* ---------------- HASHTAG ---------------- */

      ctx.font = "bold 44px sans-serif";
      ctx.fillText("#RunWithRaceline", 540, 1450);

      /* ---------------- QR LABEL ---------------- */

      ctx.font = "28px sans-serif";
      ctx.fillText("SCAN FOR RACE DETAILS", 540, 1550);

      /* ---------------- QR CODE ---------------- */

      const qrData = await QRCode.toDataURL(
        "https://www.racelineindia.com/events",
      );

      const qrImg = await loadImage(qrData);

      if (qrImg) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(420, 1580, 240, 240);
        ctx.drawImage(qrImg, 440, 1600, 200, 200);
      }

      /* ---------------- WEBSITE ---------------- */

      ctx.font = "30px sans-serif";
      ctx.fillText("www.racelineindia.com", 540, 1860);

      /* ---------------- DOWNLOAD ---------------- */

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve),
      );

      if (!blob) return;

      const file = new File([blob], "raceline-story.png", {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Race Registration",
            text: "I'm running this race!",
          });
          return;
        } catch {}
      }

      const link = document.createElement("a");
      link.download = "raceline-story.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Story generation failed:", err);
    }
  };

  return (
    <div className="bg-[#f8f7f3] flex justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl"
      >
        <div className="max-w-5xl w-full mx-auto mb-4">
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
              <CheckCircleIcon className="w-5 h-5" />
              You're officially in the race!
            </div>

            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-md">
              Raceline India
            </span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-sm">
          <div className="grid lg:grid-cols-2">
            {/* LEFT */}
            <div className="p-6 space-y-4">
              {/* HEADER */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>

                <div className="flex-1">
                  <h1 className="text-base  text-gray-900">
                    Registration Confirmed
                  </h1>

                  <p className="text-xs text-gray-500">{fullName}</p>
                </div>
              </div>

              {/* EVENT INFO */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-md">
                  <TicketIcon className="w-4 h-4 text-gray-500" />
                  {registration.category}
                </div>

                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-md">
                  <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                  {formattedDate}
                </div>

                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-md">
                  <ReceiptPercentIcon className="w-4 h-4 text-gray-500" />₹{" "}
                  {registration.amount}
                </div>
              </div>

              {/* EVENT NAME */}
              <h2 className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-md inline-block">
                {registration.eventName}
              </h2>

              {/* REGISTRATION ID */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">
                    Registration ID
                  </p>

                  <p className="text-sm font-mono font-semibold text-gray-900">
                    {registration.registrationId}
                  </p>
                </div>

                <button
                  onClick={() =>
                    copyToClipboard(registration.registrationId, "reg")
                  }
                  className="p-1.5 rounded-md hover:bg-white transition"
                >
                  <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* ACTION BUTTONS */}
              {/* ACTIONS SECTION */}
              <div className="space-y-3">
                {/* SHARE SECTION TITLE */}
                <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                  Share your race
                </p>

                {/* INSTAGRAM SHARE */}
                <button
                  onClick={generateStoryCard}
                  className="w-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium shadow hover:opacity-90 transition"
                >
                  <ShareIcon className="w-4 h-4" />
                  Share to Instagram Story
                </button>

                {/* REMINDER TITLE */}
                <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                  Add race reminder
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={generateGoogleCalendarLinkWithReminder()}
                    target="_blank"
                    className="bg-white border border-gray-200 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
                    Google
                  </a>

                  <button
                    onClick={downloadICSCalendar}
                    className="bg-white border border-gray-200 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <CalendarDaysIcon className="w-4 h-4 text-gray-800" />
                    Apple
                  </button>

                  <button
                    onClick={downloadICSCalendar}
                    className="bg-white border border-gray-200 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <CalendarDaysIcon className="w-4 h-4 text-sky-600" />
                    Outlook
                  </button>
                </div>

                {/* NAVIGATION */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/"
                    className="bg-gray-100 text-gray-800 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-medium hover:bg-gray-200"
                  >
                    ← Back Home
                  </Link>

                  <Link
                    href="/events"
                    className="bg-slate-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-medium hover:bg-slate-800 transition"
                  >
                    Explore Events
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT QR */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="border-l border-gray-200 flex items-center justify-center p-6"
            >
              <div
                ref={qrRef}
                className="relative w-full max-w-xs bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] overflow-hidden"
              >
                {/* TOP HEADER */}
                <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white text-center py-4">
                  <p className="text-[11px] tracking-wider opacity-80">
                    DIGITAL RACE ENTRY
                  </p>

                  <p className="text-xs font-mono mt-1">
                    #{registration.registrationId}
                  </p>
                </div>

                {/* TICKET CUT HOLES */}
                <div className="absolute -left-3 top-28 w-6 h-6 bg-gray-100 rounded-full"></div>
                <div className="absolute -right-3 top-28 w-6 h-6 bg-gray-100 rounded-full"></div>

                {/* QR SECTION */}
                <div className="px-6 py-6 text-center">
                  <div className="flex justify-center mb-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative flex justify-center"
                    >
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-2xl blur-xl animate-pulse"></div>

                      {/* QR container */}
                      <div className="relative bg-white border border-gray-200 p-3 rounded-xl shadow-md">
                        <QRCodeCanvas value={qrValue} size={160} />
                      </div>
                    </motion.div>
                  </div>

                  <p className="text-xs text-gray-500">Scan at race check-in</p>
                </div>

                {/* DIVIDER */}
                <div className="border-t border-dashed border-gray-200"></div>

                {/* ACTION BUTTONS */}
                <div className="p-4 flex flex-col gap-2">
                  <button
                    onClick={downloadQRAsPNG}
                    className="bg-slate-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-medium hover:bg-slate-800 transition"
                  >
                    Download QR
                  </button>

                  <a
                    href={`/api/download-receipt?id=${registration.registrationId}`}
                    className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 py-2.5 rounded-lg transition"
                  >
                    <ReceiptPercentIcon className="w-4 h-4 text-green-600" />
                    Download Receipt
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div
          ref={storyRef}
          style={{
            position: "fixed",
            top: "0",
            left: "200vw", // push it far right (outside screen)
            width: "1080px",
            height: "1920px",
            backgroundImage: "url('/story-bg.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "white",
            padding: "140px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* TOP */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "24px", letterSpacing: "4px" }}>
              RACELINE INDIA
            </p>

            <h1
              style={{ fontSize: "72px", fontWeight: "800", marginTop: "40px" }}
            >
              {registration.eventName}
            </h1>
          </div>

          {/* CENTER */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "32px" }}>RACE CONFIRMED 🏃</p>

            <p
              style={{ fontSize: "60px", fontWeight: "700", marginTop: "40px" }}
            >
              {fullName}
            </p>

            <p style={{ fontSize: "36px", marginTop: "20px" }}>
              {registration.category}
            </p>

            <p style={{ fontSize: "30px", marginTop: "20px" }}>
              {formattedDate}
            </p>
          </div>

          {/* BOTTOM */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "34px", fontWeight: "600" }}>
              See you at the starting line
            </p>

            <p
              style={{ fontSize: "38px", fontWeight: "700", marginTop: "30px" }}
            >
              #RunWithRaceline
            </p>

            <p style={{ fontSize: "22px", marginTop: "20px" }}>
              Powered by Raceline India
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
