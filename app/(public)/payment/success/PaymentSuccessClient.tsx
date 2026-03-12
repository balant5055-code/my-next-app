"use client";
import { toPng } from "html-to-image";
import QRCodeCanvas from "react-qr-code";
import QRCode from "qrcode";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ClipboardDocumentIcon,
  TicketIcon,
  ReceiptPercentIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ShareIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";
import confetti from "canvas-confetti";
import AlertModal from "@/components/ui/AlertModal";
import { secureFetch } from "@/lib/secureFetch";

const myConfetti = confetti.create(undefined, {
  resize: true,
  useWorker: false,
});

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [ticketIndex, setTicketIndex] = useState(0);
  const registration = registrations[ticketIndex];
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">(
    "desktop",
  );
  useEffect(() => {
    if (!orderId) return;

    const fetchRegistration = async () => {
      try {
        const res = await fetch(`/api/get-registration?orderId=${orderId}`);
        const data = await res.json();

        if (data.success) {
          setRegistrations(data.data);
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
  }, [orderId]);
  useEffect(() => {
    if (!registrations.length) return;

    const timer = setTimeout(() => {
      downloadAllRunnerQR();
    }, 1500);

    return () => clearTimeout(timer);
  }, [registrations]);
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

  const downloadQRAsPNG = async () => {
    if (!registration) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.textAlign = "center";

    /* ---------- WHITE BACKGROUND ---------- */

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1080, 1920);

    /* ---------- PREMIUM BORDER ---------- */

    ctx.strokeStyle = "rgba(220,38,38,0.25)";
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, 1000, 1840);

    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, 960, 1800);

    /* ---------- VECTOR STYLE PATTERN ---------- */

    ctx.strokeStyle = "rgba(220,38,38,0.08)";
    ctx.lineWidth = 4;

    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc(540, 400 + i * 150, 420, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* ---------- LOAD IMAGE HELPER ---------- */

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
      });

    /* ---------- RACELINE LOGO ---------- */

    const logo = await loadImage("/logo/raceline-in.png");

    const logoWidth = 300;
    const logoHeight = (logo.height / logo.width) * logoWidth;

    ctx.drawImage(logo, 540 - logoWidth / 2, 100, logoWidth, logoHeight);

    /* ---------- EVENT NAME ---------- */

    ctx.fillStyle = "#111";
    ctx.font = "bold 68px 'Inter', sans-serif";

    ctx.fillText(
      registration.eventName?.slice(0, 22) || "MARATHON EVENT",
      540,
      340,
    );

    /* ---------- RUNNER NAME ---------- */

    const fullName = `${registration.participant?.firstName || ""} ${
      registration.participant?.lastName || ""
    }`.trim();

    ctx.font = "bold 70px sans-serif";
    ctx.fillText(fullName.toUpperCase(), 540, 520);

    /* ---------- CATEGORY ---------- */

    ctx.fillStyle = "#dc2626";
    ctx.font = "42px sans-serif";

    ctx.fillText(registration.category.toUpperCase(), 540, 600);

    /* ---------- DATE ---------- */

    ctx.fillStyle = "#333";
    ctx.font = "36px sans-serif";

    if (formattedDate) {
      ctx.fillText(formattedDate, 540, 660);
    }

    /* ---------- REGISTRATION ID ---------- */

    ctx.font = "28px monospace";
    ctx.fillText(`#${registration.registrationId}`, 540, 720);

    /* ---------- QR CONTAINER ---------- */

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 30;

    ctx.fillRect(360, 820, 360, 360);

    ctx.shadowBlur = 0;

    /* ---------- QR CODE ---------- */

    const qrData = await QRCode.toDataURL(qrValue);
    const qrImg = await loadImage(qrData);

    ctx.drawImage(qrImg, 400, 860, 280, 280);

    /* ---------- QR LABEL ---------- */

    ctx.fillStyle = "#555";
    ctx.font = "30px sans-serif";

    ctx.fillText("SCAN AT RACE CHECK-IN", 540, 1260);

    /* ---------- MOTIVATION ---------- */

    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 54px sans-serif";

    ctx.fillText("ALL THE BEST!", 540, 1480);

    ctx.fillStyle = "#111";
    ctx.font = "bold 36px sans-serif";

    ctx.fillText("RACELINE INDIA", 540, 1560);

    /* ---------- DIVIDER ---------- */

    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(200, 1650);
    ctx.lineTo(880, 1650);
    ctx.stroke();

    /* ---------- WEBSITE ---------- */

    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 32px sans-serif";

    ctx.fillText("www.racelineindia.com", 540, 1700);

    /* ---------- DOWNLOAD ---------- */

    const link = document.createElement("a");
    link.download = `${registration.registrationId}-race-ticket.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllRunnerQR = async () => {
    try {
      const loadImage = (src: string) =>
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
        });

      const logo = await loadImage("/logo/raceline-in.png");

      for (const runner of registrations) {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1920;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas failed");

        ctx.textAlign = "center";

        /* ---------- WHITE BACKGROUND ---------- */

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1080, 1920);

        /* ---------- PREMIUM BORDER ---------- */

        ctx.strokeStyle = "rgba(220,38,38,0.25)";
        ctx.lineWidth = 6;
        ctx.strokeRect(40, 40, 1000, 1840);

        ctx.strokeStyle = "rgba(0,0,0,0.06)";
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 60, 960, 1800);

        /* ---------- VECTOR PATTERN ---------- */

        ctx.strokeStyle = "rgba(220,38,38,0.08)";
        ctx.lineWidth = 4;

        for (let i = 0; i < 12; i++) {
          ctx.beginPath();
          ctx.arc(540, 400 + i * 150, 420, 0, Math.PI * 2);
          ctx.stroke();
        }

        /* ---------- LOGO ---------- */

        const logoWidth = 300;
        const logoHeight = (logo.height / logo.width) * logoWidth;

        ctx.drawImage(logo, 540 - logoWidth / 2, 100, logoWidth, logoHeight);

        /* ---------- EVENT NAME ---------- */

        ctx.fillStyle = "#111";
        ctx.font = "bold 68px sans-serif";

        ctx.fillText(
          runner.eventName?.slice(0, 22) || "MARATHON EVENT",
          540,
          340,
        );

        /* ---------- RUNNER NAME ---------- */

        const runnerName = `${runner.participant?.firstName || ""} ${
          runner.participant?.lastName || ""
        }`.trim();

        ctx.font = "bold 70px sans-serif";
        ctx.fillText(runnerName.toUpperCase(), 540, 520);

        /* ---------- CATEGORY ---------- */

        ctx.fillStyle = "#dc2626";
        ctx.font = "42px sans-serif";

        ctx.fillText((runner.category || "").toUpperCase(), 540, 600);

        /* ---------- DATE ---------- */

        ctx.fillStyle = "#333";
        ctx.font = "36px sans-serif";

        if (formattedDate) {
          ctx.fillText(formattedDate, 540, 660);
        }

        /* ---------- REGISTRATION ID ---------- */

        ctx.font = "28px monospace";
        ctx.fillText(`#${runner.registrationId}`, 540, 720);

        /* ---------- QR BOX ---------- */

        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 30;

        ctx.fillRect(360, 820, 360, 360);

        ctx.shadowBlur = 0;

        /* ---------- QR CODE ---------- */

        const runnerQR = `${baseUrl}/checkin/${runner.registrationId}`;
        const qrData = await QRCode.toDataURL(runnerQR);

        const qrImg = await loadImage(qrData);

        ctx.drawImage(qrImg, 400, 860, 280, 280);

        /* ---------- QR LABEL ---------- */

        ctx.fillStyle = "#555";
        ctx.font = "30px sans-serif";

        ctx.fillText("SCAN AT RACE CHECK-IN", 540, 1260);

        /* ---------- MOTIVATION ---------- */

        ctx.fillStyle = "#dc2626";
        ctx.font = "bold 54px sans-serif";

        ctx.fillText("ALL THE BEST!", 540, 1480);

        ctx.fillStyle = "#111";
        ctx.font = "bold 36px sans-serif";

        ctx.fillText("RACELINE INDIA", 540, 1560);

        /* ---------- DIVIDER ---------- */

        ctx.strokeStyle = "rgba(0,0,0,0.08)";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(200, 1650);
        ctx.lineTo(880, 1650);
        ctx.stroke();

        /* ---------- WEBSITE ---------- */

        ctx.fillStyle = "#dc2626";
        ctx.font = "bold 32px sans-serif";

        ctx.fillText("www.racelineindia.com", 540, 1700);

        /* ---------- DOWNLOAD ---------- */

        const link = document.createElement("a");
        link.download = `${runner.registrationId}-race-ticket.png`;
        link.href = canvas.toDataURL("image/png");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await new Promise((r) => setTimeout(r, 900));
      }
    } catch (err) {
      console.error(err);

      setModalMessage(
        "Automatic ticket download failed. Please download each QR manually.",
      );

      setModalOpen(true);
    }
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

  if (!registrations.length) {
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

      ctx.textAlign = "center";

      /* ---------- WHITE BACKGROUND ---------- */

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1080, 1920);

      /* ---------- VECTOR RIBBON DESIGN ---------- */

      ctx.strokeStyle = "rgba(220,38,38,0.08)";
      ctx.lineWidth = 6;

      for (let i = 0; i < 5; i++) {
        ctx.beginPath();

        ctx.moveTo(-200, 300 + i * 320);

        ctx.bezierCurveTo(
          400,
          150 + i * 320,
          700,
          450 + i * 320,
          1280,
          280 + i * 320,
        );

        ctx.stroke();
      }

      /* ---------- EVENT TITLE ---------- */

      const eventTitle = registration?.eventName || "MARATHON EVENT";

      ctx.fillStyle = "#111";
      ctx.font = "bold 84px sans-serif";

      ctx.fillText(eventTitle.toUpperCase().slice(0, 22), 540, 340);

      /* ---------- RUNNER NAME ---------- */

      const fullName = `${registration?.participant?.firstName || ""} ${
        registration?.participant?.lastName || ""
      }`.trim();

      ctx.font = "bold 110px sans-serif";
      ctx.fillText(fullName.toUpperCase(), 540, 720);

      /* ---------- CATEGORY ---------- */

      ctx.fillStyle = "#dc2626";
      ctx.font = "56px sans-serif";

      ctx.fillText((registration?.category || "").toUpperCase(), 540, 840);

      /* ---------- DATE ---------- */

      ctx.fillStyle = "#555";
      ctx.font = "46px sans-serif";

      ctx.fillText(formattedDate || "", 540, 920);

      /* ---------- MOTIVATION ---------- */

      ctx.fillStyle = "#111";
      ctx.font = "bold 88px sans-serif";

      ctx.fillText("THE START LINE", 540, 1260);
      ctx.fillText("IS WAITING", 540, 1360);

      /* ---------- HASHTAG ---------- */

      ctx.fillStyle = "#16a34a";
      ctx.font = "bold 54px sans-serif";

      ctx.fillText("#RunWithRaceline", 540, 1500);

      /* ---------- FOOTER LINE ---------- */

      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(220, 1650);
      ctx.lineTo(860, 1650);
      ctx.stroke();

      /* ---------- WEBSITE ---------- */

      ctx.fillStyle = "#dc2626";
      ctx.font = "bold 40px sans-serif";

      ctx.fillText("racelineindia.com", 540, 1750);

      /* ---------- DOWNLOAD ---------- */

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
  const totalRunners = registrations.length;

  const totalAmount = registrations.reduce(
    (sum, r) => sum + (r.amount || 0),
    0,
  );
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

            <span className="text-sm bg-green-600 text-white px-2 py-1 rounded-md">
              Raceline India
            </span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-sm">
          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            {/* LEFT */}
            <div className="p-6 space-y-4">
              {/* HEADER */}
              {/* HEADER */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-gray-900">
                    <h1 className="text-md font-semibold">
                      Registration Confirmed
                    </h1>

                    <span className="text-gray-300">|</span>

                    <span className="text-sm font-medium text-gray-700 truncate">
                      {registration.eventName}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-0.5">{fullName}</p>
                </div>
              </div>

              {/* EVENT INFO */}
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
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
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white transition text-xs"
                >
                  {copied === "reg" ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* SHARE SECTION */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                  Share your race
                </p>

                <button
                  onClick={generateStoryCard}
                  className="w-full bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium shadow hover:opacity-90 transition"
                >
                  <ShareIcon className="w-4 h-4" />
                  Share to Instagram Story
                </button>

                <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                  Add race reminder
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={generateGoogleCalendarLinkWithReminder()}
                    target="_blank"
                    className="bg-white border border-gray-200 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
                    Google
                  </a>

                  <button
                    onClick={downloadICSCalendar}
                    className="bg-white border border-gray-200 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <CalendarDaysIcon className="w-4 h-4 text-gray-800" />
                    Apple
                  </button>

                  <button
                    onClick={downloadICSCalendar}
                    className="bg-white border border-gray-200 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <CalendarDaysIcon className="w-4 h-4 text-sky-600" />
                    Outlook
                  </button>
                </div>

                {/* PREMIUM SUMMARY FOOTER */}
                <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  {/* TOTAL RUNNERS */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-200">
                      <TicketIcon className="w-4 h-4 text-gray-600" />
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Total Runners
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {totalRunners}
                      </p>
                    </div>
                  </div>

                  {/* TOTAL PAID */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-200">
                      <ReceiptPercentIcon className="w-4 h-4 text-green-600" />
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Total Paid
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        ₹ {totalAmount}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/"
                    className="bg-gray-100 text-gray-800 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-gray-200"
                  >
                    ← Back Home
                  </Link>

                  <Link
                    href="/events"
                    className="bg-slate-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-800 transition"
                  >
                    Explore Events
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT QR */}
            {/* RIGHT QR */}
            <motion.div className="border-l border-gray-200 flex items-center justify-center px-4 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={registration?.registrationId}
                  drag="x"
                  dragElastic={0.25}
                  dragMomentum={false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, info) => {
                    if (
                      info.offset.x < -50 &&
                      ticketIndex < registrations.length - 1
                    ) {
                      setTicketIndex((prev) => prev + 1);
                    }

                    if (info.offset.x > 50 && ticketIndex > 0) {
                      setTicketIndex((prev) => prev - 1);
                    }
                  }}
                  initial={{ opacity: 0, x: 80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center"
                >
                  {/* TICKET CARD */}
                  <div
                    ref={qrRef}
                    className="relative w-[260px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden"
                  >
                    {/* HEADER */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white text-center py-4">
                      <div className="absolute inset-0 opacity-20 animate-pulse bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]"></div>

                      <p className="text-[11px] tracking-wider opacity-80">
                        DIGITAL RACE ENTRY
                      </p>

                      <p className="text-sm font-mono mt-1">
                        #{registration.registrationId}
                      </p>

                      <div className="mt-1 text-[10px] uppercase tracking-wider opacity-80">
                        Official Runner
                      </div>
                    </div>

                    {/* CUT HOLES */}
                    <div className="absolute -left-3 top-28 w-6 h-6 bg-gray-100 rounded-full"></div>
                    <div className="absolute -right-3 top-28 w-6 h-6 bg-gray-100 rounded-full"></div>

                    {/* QR */}
                    <div className="px-6 py-6 text-center">
                      <div className="flex justify-center mb-4">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4 }}
                          className="relative flex justify-center"
                        >
                          <div className="absolute inset-0 rounded-2xl blur-2xl animate-pulse"></div>

                          <div className="relative bg-white border border-gray-200 p-3 rounded-xl shadow-md">
                            <QRCodeCanvas value={qrValue} size={150} />
                          </div>
                        </motion.div>
                      </div>

                      <div className="mt-3 text-[10px] text-gray-400 uppercase tracking-wide">
                        Present this at race check-in
                      </div>

                      {registrations.length > 1 && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          ← Swipe for next runner →
                        </p>
                      )}
                    </div>

                    {/* DIVIDER */}
                    <div className="border-t border-dashed border-gray-200"></div>

                    {/* ACTION BUTTONS */}
                    <div className="p-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={downloadQRAsPNG}
                        className="bg-slate-700 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-800 transition"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        QR
                      </button>

                      <a
                        href={`/api/download-receipt?id=${registration.registrationId}`}
                        className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 py-2.5 rounded-lg transition"
                      >
                        <ReceiptPercentIcon className="w-4 h-4 text-green-600" />
                        Receipt
                      </a>
                    </div>
                  </div>

                  {/* RUNNER COUNT */}
                  {registrations.length > 1 && (
                    <div className="text-sm text-gray-500 mt-2">
                      Runner {ticketIndex + 1} of {registrations.length}
                    </div>
                  )}

                  {/* DOT INDICATOR */}
                  {registrations.length > 1 && (
                    <div className="flex justify-center gap-1 mt-2">
                      {registrations.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full transition-all ${
                            i === ticketIndex
                              ? "w-5 bg-gray-800"
                              : "w-2 bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
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
      <AlertModal
        open={modalOpen}
        title="QR Download Failed"
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
