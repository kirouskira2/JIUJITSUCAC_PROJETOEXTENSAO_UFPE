"use client";

import { useEffect, useState } from "react";
import { LoaderOne } from "@/components/ui/loader";
import Image from "next/image";

export function InitialSplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [renderSplash, setRenderSplash] = useState(true);
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    // Pre-carrega a imagem de fundo antes de exibir o splash
    const img = new window.Image();
    img.src = "/kimono-bg.png";
    img.onload = () => setBgLoaded(true);
    // Fallback caso a imagem demore demais
    const fallbackTimer = setTimeout(() => setBgLoaded(true), 800);

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    if (!bgLoaded) return;
    const timer = setTimeout(() => {
      setShowSplash(false);
      setTimeout(() => setRenderSplash(false), 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [bgLoaded]);

  return (
    <>
      {renderSplash && (
        <div 
          className={`print:hidden fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${showSplash && bgLoaded ? "opacity-100" : !bgLoaded ? "opacity-100" : "opacity-0"}`}
          style={{
            backgroundImage: bgLoaded ? `url('/kimono-bg.png')` : 'none',
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

            {/* Animação do Loader (Compact) */}
            <div className="mt-12">
              <LoaderOne />
            </div>
          </div>
        </div>
      )}
      
      {/* O app renderiza embaixo e fica pronto para uso assim que a splash sumir */}
      {children}
    </>
  );
}
