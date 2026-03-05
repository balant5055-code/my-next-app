"use client";

import { useEffect, useRef, useState } from "react";

type Direction = "next" | "prev";

const marathonImages = [
  "https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?q=80&w=1920&auto=format&fit=crop",
];
const baseSlides = [
  {
    title: "High-Precision Sports Timing",
    headline: "EVERY SECOND. EVERY ATHLETE.",
    text: "Professional timing solutions for marathons, cycling, triathlons, and competitive sports with ultra-accurate tracking and instant results.",
    cta: "Timing Solutions",
    bg: "https://images.unsplash.com/photo-1599058917212-d750089bc07b?q=80&w=1920&auto=format&fit=crop",
  },
  {
    title: "Built for Organizers",
    headline: "HOST EVENTS. SCALE WITH CONFIDENCE.",
    text: "Create events faster, manage participants effortlessly, and deliver a world-class experience for athletes and sponsors.",
    cta: "Host an Event",
    bg: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?q=80&w=1920&auto=format&fit=crop",
  },
  {
    title: "From Registration to Results",
    headline: "ONE PLATFORM. TOTAL CONTROL.",
    text: "Manage registrations, payments, live race timing, leaderboards, and results publishing from one powerful event platform.",
    cta: "Explore Platform",
    bg: "https://images.unsplash.com/photo-1546484959-f9a1e3f0f5c6?q=80&w=1920&auto=format&fit=crop",
  },
];

export default function HeroSliderMatrixDirectional() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<Direction>("next");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;

    const x = (e.clientX - innerWidth / 2) / innerWidth;
    const y = (e.clientY - innerHeight / 2) / innerHeight;

    setMousePos({ x, y });
  };
  const [slides, setSlides] = useState(baseSlides);
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
    <section
      onMouseMove={handleMouseMove}
      className="
    relative
    min-h-[480px]
    md:min-h-[620px]
    overflow-hidden
    bg-black
    perspective-[1200px]
  "
      id="home"
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
            <div
              className="absolute inset-0 bg-cover bg-center filter contrast-110 saturate-110 brightness-90 transition-transform duration-300 ease-out"
              style={{
                backgroundImage: `url(${slide.bg})`,
                transform: isActive
                  ? `scale(1.1) translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`
                  : "scale(1)",
              }}
            />

            {/* DARK OVERLAY */}
            <div className="absolute inset-0 bg-black/65" />

            {/* Racing Light Streak */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -left-1/3 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent animate-lightSweep" />
            </div>

            {/* CONTENT */}
            <div className="relative z-20 h-full flex items-start pt-[100px] md:pt-[140px]">
              <div className="mx-auto w-full max-w-7xl px-6 text-white pb-[140px]">
                <div className="max-w-[880px]">
                  <div
                    className="inline-flex items-center gap-2 mb-4 rounded-full
                                  border border-orange-400/40 bg-orange-500/10
                                  px-4 py-1 text-sm font-semibold text-orange-400"
                  >
                    {slide.title}
                  </div>

                  <h1
                    className="font-extrabold leading-tight text-orange-500
    text-3xl sm:text-4xl lg:text-5xl xl:text-6xl"
                  >
                    {slide.headline}
                  </h1>

                  <p className="mt-6 text-gray-300 max-w-2xl">{slide.text}</p>

                  <button
                    className="mt-8 bg-orange-500 px-8 py-3 font-semibold
                                     shadow-xl hover:bg-orange-600 transition"
                  >
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
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
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                stopAuto();
                setDirection(i > active ? "next" : "prev");
                setActive(i);
                startAuto();
              }}
              className={`rounded-xl border p-4 text-left backdrop-blur-md transition ${
                active === i
                  ? "border-orange-500 bg-black/60"
                  : "border-white/30 bg-black/40 hover:bg-black/60"
              }`}
            >
              <p className="text-sm font-semibold text-white">{s.title}</p>
              <p className="mt-1 text-xs text-gray-300 line-clamp-2">
                {s.text}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
