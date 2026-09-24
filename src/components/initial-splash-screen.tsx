"use client";

import { useEffect, useState, useRef } from "react";
import { LoaderOne } from "@/components/ui/loader";
import Image from "next/image";

export function InitialSplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"loading-bg" | "visible" | "fading" | "done">("loading-bg");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Pre-carrega a imagem de fundo do kimono
    const img = new window.Image();
    img.src = "/kimono-bg.png";
    
    const showSplash = () => {
      setPhase("visible");
      // Depois de exibir por 2.5s, inicia o fade-out
      timerRef.current = setTimeout(() => {
        setPhase("fading");
        setTimeout(() => setPhase("done"), 500);
      }, 2500);
    };

    if (img.complete) {
      // Imagem já estava em cache
      showSplash();
    } else {
      img.onload = showSplash;
      // Se demorar mais de 600ms para carregar, pula direto para "done" (sem splash)
      timerRef.current = setTimeout(() => {
        img.onload = null;
        setPhase("done");
      }, 600);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (phase === "done") {
    return <>{children}</>;
  }

  return (
    <>
      {phase !== "done" && phase !== "loading-bg" && (
        <div 
          className={`print:hidden fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${phase === "fading" ? "opacity-0" : "opacity-100"}`}
          style={{
            backgroundImage: `url('/kimono-bg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#0a0a0a',
          }}
        >
          {/* Sombra de vinheta radial por cima da textura */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/40 via-transparent to-[#000000]/90" />

          <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
            {/* White Circle Logo Area */}
            <div className="relative w-44 h-44 rounded-full bg-white flex items-center justify-center shadow-2xl mb-8 p-2">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                <Image 
                  src="/logo.jpg" 
                  alt="Logo Jiu Jitsu Cac" 
                  fill 
                  className="object-cover scale-[1.05]"
                  priority
                />
              </div>
            </div>

            {/* Brand Name */}
            <div className="flex flex-col items-center text-center mt-2">
              <h1 
                className="font-display text-[4rem] md:text-[4.5rem] leading-none font-bold uppercase tracking-tight text-[#F2F2F7]"
                style={{ fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif' }}
              >
                JIU JITSU CAC
              </h1>
              <p 
                className="text-[1.35rem] text-[#F2F2F7] font-sans font-light tracking-[0.45em] mt-3 opacity-90 ml-2"
                style={{ fontFamily: 'var(--font-dm-sans), "DM Sans", sans-serif' }}
              >
                O S S !
              </p>
            </div>

            {/* Animação do Loader */}
            <div className="mt-12">
              <LoaderOne />
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
