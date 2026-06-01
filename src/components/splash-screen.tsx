"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("has_seen_splash");
    if (hasSeenSplash) {
      setShow(false);
    } else {
      sessionStorage.setItem("has_seen_splash", "true");

      // Começa a desaparecer aos 2 segundos
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2000);

      // Remove do DOM aos 2.5 segundos
      const removeTimer = setTimeout(() => {
        setShow(false);
      }, 2500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-background text-foreground flex flex-col items-center justify-center overflow-hidden antialiased transition-opacity duration-500 ${isFadingOut ? "opacity-0" : "opacity-100"}`}
      style={{ background: "radial-gradient(circle at center, rgba(30,30,30,0.8) 0%, rgba(5,5,5,1) 100%)" }}
    >
      <main className="flex-1 flex flex-col items-center justify-center w-full px-6 relative z-10">

        {/* Logo Container with Animation */}
        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">

          <div className="relative w-64 h-64 mb-8 rounded-full overflow-hidden border border-border/50 shadow-2xl flex items-center justify-center" style={{ background: "#1C1C1E" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="JJCAC Logo"
              className="w-full h-full object-cover opacity-80 mix-blend-screen"
              src="/logo.jpg?v=2"
            />
            <div className="absolute inset-0 border-2 rounded-full opacity-30 blur-sm" style={{ borderColor: "#dc2626" }} />
          </div>

          {/* Typography Brand */}
          <div className="flex flex-col items-center tracking-wide text-center">
            <h1 className="font-display text-4xl uppercase tracking-widest font-medium opacity-90" style={{ color: "#F2F2F7" }}>
              JIU JITSU
            </h1>
            <h2
              className="font-display text-[64px] leading-none font-black -mt-2 tracking-tighter"
              style={{ color: "#dc2626", textShadow: "0 0 20px rgba(220, 38, 38, 0.5)" }}
            >
              CAC
            </h2>
          </div>

          <p className="mt-8 font-sans text-lg text-center max-w-[280px]" style={{ color: "#8E8E93" }}>
            Jiu-Jitsu para Todos — UFPE/CAC
          </p>
        </div>

        {/* Bottom Progress Indicator */}
        <div className="absolute bottom-12 w-full max-w-[200px] px-6">
          <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "#2a2a2a" }}>
            <div
              className="h-full rounded-full origin-left animate-in slide-in-from-left duration-1000 fill-mode-forwards"
              style={{ background: "#dc2626", width: "100%", animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
          </div>
          <p className="text-center mt-3 font-sans text-xs uppercase tracking-widest" style={{ color: "#48484A" }}>
            Iniciando
          </p>
        </div>
      </main>
    </div>
  );
}
