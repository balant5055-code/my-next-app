"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  ClipboardDocumentIcon,
  TicketIcon,
  ReceiptPercentIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

import confetti from "canvas-confetti";
import { useRef } from "react";
import { secureFetch } from "@/lib/secureFetch";

const myConfetti = confetti.create(undefined, {
  resize: true,
  useWorker: false, // ✅ disable worker here (correct place)
});
export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const regId = searchParams.get("regId");
  const qrRef = useRef<HTMLDivElement>(null);

  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => {
    if (!regId) return;

    const fetchRegistration = async () => {
      try {
        const res = await fetch(`/api/get-registration?regId=${regId}`);
        const data = await res.json();

        if (data.success) {
          setRegistration(data.data);

          // 🔥 Trigger Premium Confetti After Success
          triggerConfetti();
        }
      } catch (err) {
        console.error("Error fetching registration", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistration();
  }, [regId]);

  const copyToClipboard = (text: string | null, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // 🔥 SAFELY PARSE EVENT DATE
  const getEventJSDate = (): Date | null => {
    const raw = registration?.eventDate;
    if (!raw) return null;

    // Firestore Timestamp
    if (raw?._seconds) {
      return new Date(raw._seconds * 1000);
    }

    // ISO String
    if (typeof raw === "string") {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    }

    // Already Date
    if (raw instanceof Date) {
      return isNaN(raw.getTime()) ? null : raw;
    }

    return null;
  };

  const eventJSDate = getEventJSDate();

  const formattedDate =
    eventJSDate &&
    eventJSDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  // 🔥 SAFE GOOGLE CALENDAR LINK
  const generateGoogleCalendarLink = () => {
    if (!eventJSDate) return "#";

    const start = eventJSDate.toISOString().replace(/[-:]/g, "").split(".")[0];

    const end = new Date(eventJSDate.getTime() + 3 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0];

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      registration.eventName || "Race Event",
    )}&dates=${start}/${end}&details=Registered via Raceline India&location=${encodeURIComponent(
      registration.venue || "",
    )}`;
  };

  const handleAppleCalendarDownload = async () => {
    if (!eventJSDate || !registration) return;

    try {
      const res = await secureFetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: registration.eventName,
          description: `Registered via Raceline India\nCategory: ${registration.category}`,
          location: registration.venue || "",
          startDate: eventJSDate.toISOString(), // API handles IST
          durationMinutes: 180,
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${registration.eventName?.replace(/\s+/g, "-")}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Calendar download failed", error);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#16a34a", "#22c55e", "#10b981", "#facc15"];

    (function frame() {
      myConfetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });

      myConfetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
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
      // Retina quality (2x scale)
      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx?.scale(scale, scale);
      ctx?.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${registration.registrationId}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src = url;
  };

  // 🔥 WHATSAPP SHARE
  const generateWhatsAppLink = () => {
    if (!registration) return "#";

    const eventName = registration.eventName;
    const category = registration.category;
    const raceDate = formattedDate || "";
    const location = registration.venue
      ? `${registration.venue}${registration.city ? `, ${registration.city}` : ""}`
      : "";

    const lines = [
      `I am pleased to confirm my participation in "${eventName}".`,
      "",
      raceDate ? `Event Date: ${raceDate}` : null,
      category ? `Category: ${category}` : null,
      location ? `Venue: ${location}` : null,
      "",
      "This event represents excellence in organization and community engagement.",
      "I invite you to be part of this premium experience.",
      "",
      `Secure your registration: ${window.location.origin}/events`,
    ].filter(Boolean);

    const message = lines.join("\n");

    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading confirmation...
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        Registration not found.
      </div>
    );
  }

  const fullName = `${registration.participant?.firstName || ""} ${
    registration.participant?.lastName || ""
  }`;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-8 relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=90&w=2400')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full max-w-6xl">
        <div className="w-full max-w-6xl">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* LEFT PANEL */}
              <div className="lg:w-1/2 bg-gradient-to-br from-green-600 to-emerald-600 text-white p-12 flex flex-col justify-center items-center text-center">
                <div className="bg-white/20 p-6 rounded-full mb-6 shadow-xl">
                  <CheckCircleIcon className="w-16 h-16" />
                </div>

                <h1 className="text-3xl font-bold">
                  Registration Confirmed 🎉
                </h1>

                <p className="mt-4 text-green-100 text-base max-w-md leading-relaxed">
                  Congratulations{" "}
                  <span className="font-semibold text-white">{fullName}</span>
                  <br />
                  You are successfully registered for:
                </p>

                <div className="mt-6 text-center">
                  {/* Event Name */}
                  <h2 className="text-xl md:text-2xl font-semibold text-white">
                    {registration.eventName}
                  </h2>

                  {/* Desktop View (Single Line with Icons) */}
                  <div className="hidden md:flex items-center justify-center gap-4 text-green-100 text-sm mt-3">
                    <div className="flex items-center gap-1">
                      <TicketIcon className="w-4 h-4 opacity-80" />
                      <span>{registration.category}</span>
                    </div>

                    <span className="opacity-50">•</span>

                    <div className="flex items-center gap-1">
                      <CalendarDaysIcon className="w-4 h-4 opacity-80" />
                      <span>{formattedDate}</span>
                    </div>

                    <span className="opacity-50">•</span>

                    <div className="flex items-center gap-1">
                      <ReceiptPercentIcon className="w-4 h-4 opacity-80" />
                      <span>₹ {registration.amount}</span>
                    </div>
                  </div>

                  {/* Mobile View (Stacked with Icons) */}
                  <div className="md:hidden flex flex-col items-center text-green-100 text-sm mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <TicketIcon className="w-4 h-4 opacity-80" />
                      <span>{registration.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="w-4 h-4 opacity-80" />
                      <span>{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ReceiptPercentIcon className="w-4 h-4 opacity-80" />
                      <span>₹ {registration.amount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="lg:w-1/2 p-8 space-y-6">
                {/* REGISTRATION ID */}
                <InfoCard
                  icon={<TicketIcon className="w-5 h-5 text-green-600" />}
                  label="Registration ID"
                  value={registration.registrationId}
                  copied={copied === "reg"}
                  onCopy={() =>
                    copyToClipboard(registration.registrationId, "reg")
                  }
                />

                {/* ACTION BUTTONS */}
                <div className="space-y-3 pt-2">
                  <a
                    href={`/api/download-receipt?id=${registration.registrationId}`}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition shadow-md"
                  >
                    <ReceiptPercentIcon className="w-5 h-5" />
                    Download Receipt
                  </a>

                  <a
                    href={generateGoogleCalendarLink()}
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-md"
                  >
                    <CalendarDaysIcon className="w-5 h-5" />
                    Add to Google Calendar
                  </a>
                  <button
                    onClick={handleAppleCalendarDownload}
                    className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition shadow-md"
                  >
                    <CalendarDaysIcon className="w-5 h-5" />
                    Add to Apple / Outlook Calendar
                  </button>
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition shadow-md"
                  >
                    <ShareIcon className="w-5 h-5" />
                    Share on WhatsApp
                  </a>

                  <Link
                    href="/events"
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
                  >
                    Explore More Events
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Detail Row */
function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

/* Info Card */
function InfoCard({
  icon,
  label,
  value,
  onCopy,
  copied,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="font-semibold text-gray-800 break-all">{value}</p>
        </div>
      </div>

      <button
        onClick={onCopy}
        className="text-gray-400 hover:text-green-600 transition flex items-center"
      >
        <ClipboardDocumentIcon className="w-5 h-5" />
        {copied && (
          <span className="ml-2 text-xs text-green-600 font-medium">
            Copied
          </span>
        )}
      </button>
    </div>
  );
}
