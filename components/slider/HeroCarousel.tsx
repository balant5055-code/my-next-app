"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
type Direction = "next" | "prev";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
const marathonImages = [
  "https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?q=80&w=1920&auto=format&fit=crop",
];
import { LucideIcon } from "lucide-react";

type Slide = {
  title: string;
  headline: string;
  highlight?: string;
  text?: string;
  cta: string;
  bg: string;
  icon: LucideIcon;
};
import { User, Flag, Timer } from "lucide-react";
const baseSlides: Slide[] = [
  {
    title: "For Runners",
    headline:
      "Professional Marathon Timing & Event Registration Platform in India",
    text: "Discover marathons, half marathons, and 10K races across India.",
    cta: "Explore Races",
    bg: "https://images.unsplash.com/photo-1599058917212-d750089bc07b?q=80&w=1920&auto=format&fit=crop",
    icon: User,
  },
  {
    title: "For Event Organizers",
    headline:
      "Powerful Tools for Marathon Organizers & Seamless Race Event Management",
    text: "Manage registrations, payments, bibs, and race timing easily.",
    cta: "Host Your Event",
    bg: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?q=80&w=1920&auto=format&fit=crop",
    icon: Flag,
  },
  {
    title: "Professional Timing",
    headline:
      "Ultra-Accurate Race Timing Technology & Real-Time Results Publishing",
    text: "Deliver ultra-accurate chip timing and live leaderboards.",
    cta: "Timing Solutions",
    bg: "https://images.unsplash.com/photo-1546484959-f9a1e3f0f5c6?q=80&w=1920&auto=format&fit=crop",
    icon: Timer,
  },
];
export default function HeroSliderMatrixDirectional() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 40,
    damping: 20,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 40,
    damping: 20,
  });

  const rotateX = useTransform(smoothY, (v) => v * -0.08);
  const rotateY = useTransform(smoothX, (v) => v * 0.08);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<Direction>("next");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;

    const x = (e.clientX - innerWidth / 2) / innerWidth;
    const y = (e.clientY - innerHeight / 2) / innerHeight;

    mouseX.set(x * 60);
    mouseY.set(y * 60);
  };

  const contentX = useTransform(smoothX, (v) => v * -1);
  const contentY = useTransform(smoothY, (v) => v * -1);

  const [slides, setSlides] = useState<Slide[]>(baseSlides);
  /* AUTOPLAY */
  const startAuto = () => {
    stopAuto();
    timerRef.current = setInterval(() => {
      setDirection("next");
      setActive((p) => (p + 1) % slides.length);
    }, 6000);
  };

  const stopAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const next = () => {
    stopAuto();
    setDirection("next");
    setActive((p) => (p + 1) % slides.length);
    startAuto();
  };

  const prev = () => {
    stopAuto();
    setDirection("prev");
    setActive((p) => (p === 0 ? slides.length - 1 : p - 1));
    startAuto();
  };

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, []);

  useEffect(() => {
    const randomized = baseSlides.map((slide) => ({
      ...slide,
      bg: marathonImages[Math.floor(Math.random() * marathonImages.length)],
    }));

    setSlides(randomized);
  }, []);

  /* MATRIX */
  const getMatrix = (isActive: boolean) => {
    if (isActive) return "matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)";
    return direction === "next"
      ? "matrix3d(0.97,0,-0.12,0, 0,0.96,0,0, 0.12,0,0.9,0, 0,0,-180,1)"
      : "matrix3d(0.97,0,0.12,0, 0,0.96,0,0, -0.12,0,0.9,0, 0,0,-180,1)";
  };

  return (
    <motion.div
      aria-label="Raceline India marathon timing platform"
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
      }}
      className="
    relative
    min-h-[480px]
    md:min-h-[620px]
    overflow-hidden
    bg-black
    perspective-[1200px]
  "
    >
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,white_21px,transparent_22px)]" />
      </div>
      {slides.map((slide, index) => {
        const isActive = index === active;

        return (
          <div
            key={index}
            className="absolute inset-0 transition-[opacity,transform] duration-1000 ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 10 : 0,
              transform: getMatrix(isActive),
            }}
          >
            {/* BG */}
            <motion.div
              className="absolute inset-0 bg-cover bg-center filter contrast-110 saturate-110 brightness-90"
              style={{
                backgroundImage: `url(${slide.bg})`,
                x: useTransform(smoothX, (v) => v * 0.5),
                y: useTransform(smoothY, (v) => v * 0.5),
                scale: 1.15,
              }}
            />
            {/* PREMIUM GLOW */}
            <motion.div className="absolute inset-0 pointer-events-none">
              <motion.div
                className="absolute top-1/3 left-1/3 w-[700px] h-[700px] bg-orange-500/20 blur-[200px]"
                animate={{
                  x: [-150, 150],
                  y: [-80, 80],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            {/* SPEED STREAK EFFECT */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute top-0 left-[-50%] w-[60%] h-full 
  bg-gradient-to-r from-transparent via-orange-500/20 to-transparent
  animate-speedStreak"
              />
            </div>
            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/65" />

            {/* Racing Light Streak */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -left-1/3 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent animate-lightSweep" />
            </div>

            {/* CONTENT */}
            <motion.div
              className="relative z-20 h-full flex items-start pt-[100px] md:pt-[140px]"
              style={{
                x: contentX,
                y: contentY,
              }}
            >
              <div className="mx-auto w-full max-w-7xl px-6 text-white pb-[140px]">
                <div className="max-w-[880px]">
                  <div
                    className="inline-flex items-center gap-2 mb-5 rounded-full
border border-orange-500/40 bg-orange-500/15
px-5 py-1.5 text-xs tracking-wider font-semibold text-orange-400 backdrop-blur-md"
                  >
                    {slide.title}
                  </div>
                  {index === 0 ? (
                    <h1
                      className="font-extrabold leading-tight text-white 
  text-2xl sm:text-3xl lg:text-4xl xl:text-5xl max-w-3xl"
                    >
                      <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                        {slide.headline}
                      </span>
                    </h1>
                  ) : (
                    <h2
                      className="font-extrabold leading-tight text-white 
  text-2xl sm:text-3xl lg:text-4xl xl:text-5xl max-w-3xl"
                    >
                      <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                        {slide.headline}
                      </span>
                    </h2>
                  )}
                  <p className="mt-6 text-gray-300 max-w-2xl">{slide.text}</p>
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    <Link
                      href="/events"
                      className="inline-flex items-center justify-center
    bg-orange-500 text-white
    px-5 py-2 text-sm font-semibold
    rounded-md
    shadow-md shadow-orange-500/20
    hover:bg-orange-600 hover:shadow-orange-500/40
    transition-all duration-200"
                    >
                      Explore Events
                    </Link>

                    <Link
                      href="/organizer"
                      className="inline-flex items-center justify-center
    border border-white/30 text-white
    px-5 py-2 text-sm font-semibold
    rounded-md
    hover:bg-white hover:text-black
    transition-all duration-200"
                    >
                      Host Your Event
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })}

      {/* ARROWS */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2
             rounded-full bg-white/20 p-4 text-white hover:bg-white/40
             hidden md:flex"
      >
        ‹
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2
             rounded-full bg-white/20 p-4 text-white hover:bg-white/40
             hidden md:flex"
      >
        ›
      </button>

      {/* TILES */}
      {/* TILES */}
      <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
        {/* MOBILE: 1 2 3 DOTS */}
        <div className="flex md:hidden gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                stopAuto();
                setDirection(i > active ? "next" : "prev");
                setActive(i);
                startAuto();
              }}
              className={`
          w-10 h-10 rounded-full flex items-center justify-center
          text-sm font-bold transition
          ${
            active === i
              ? "bg-orange-500 text-white"
              : "bg-black/50 text-white border border-white/30"
          }
        `}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* DESKTOP / TABLET: FULL TILES */}
        <div
          className="
      hidden md:grid
      w-[94%] max-w-6xl
      grid-cols-1 md:grid-cols-3 gap-4
    "
        >
          {slides.map((s, i) => {
            const Icon = s.icon;

            return (
              <button
                key={i}
                onClick={() => {
                  stopAuto();
                  setDirection(i > active ? "next" : "prev");
                  setActive(i);
                  startAuto();
                }}
                className={`group relative rounded-lg border px-4 py-3 text-left
      backdrop-blur-lg transition-all duration-300
      ${
        active === i
          ? "border-orange-500/70 bg-black/70 shadow-md shadow-orange-500/20"
          : "border-white/20 bg-black/40 hover:bg-black/60 hover:border-white/40"
      }`}
              >
                {active === i && (
                  <span className="absolute left-0 top-0 h-full w-[3px] bg-orange-500 rounded-l-lg"></span>
                )}

                <div className="flex items-start gap-3">
                  {/* icon */}
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full
          ${
            active === i
              ? "bg-orange-500 text-white"
              : "bg-white/10 text-gray-300 group-hover:bg-white/20"
          }`}
                  >
                    <Icon size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white tracking-tight">
                      {s.title}
                    </p>

                    <p className="mt-1 text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {s.text}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {/* HERO BOTTOM FADE */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </motion.div>
  );
}
