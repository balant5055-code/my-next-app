"use client";

import { ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
};

export default function PageContainer({ children }: Props) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* PARALLAX BACKGROUND */}

      <div className="absolute inset-0 pointer-events-none">
        {/* SHAPE 1 */}

        <div
          className="absolute top-[10%] left-[5%] w-[400px] h-[400px] opacity-[0.05]"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <circle cx="200" cy="200" r="200" fill="#ef4444" />
          </svg>
        </div>

        {/* SHAPE 2 */}

        <div
          className="absolute top-[40%] right-[8%] w-[300px] h-[300px] opacity-[0.06]"
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
        >
          <svg viewBox="0 0 300 300" className="w-full h-full">
            <rect width="300" height="300" fill="#f97316" rx="60" />
          </svg>
        </div>

        {/* SHAPE 3 */}

        <div
          className="absolute bottom-[5%] left-[30%] w-[350px] h-[350px] opacity-[0.05]"
          style={{ transform: `translateY(${scrollY * 0.03}px)` }}
        >
          <svg viewBox="0 0 350 350" className="w-full h-full">
            <polygon points="175,0 350,175 175,350 0,175" fill="#dc2626" />
          </svg>
        </div>
      </div>

      {/* PAGE CONTENT */}

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-10 lg:py-12">
        {children}
      </div>
    </div>
  );
}
