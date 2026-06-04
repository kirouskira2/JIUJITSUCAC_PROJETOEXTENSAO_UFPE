"use client";

import { useEffect, useState } from "react";
import { LoaderOne } from "@/components/ui/loader";
import Image from "next/image";

export function InitialSplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [renderSplash, setRenderSplash] = useState(true);

  useEffect(() => {
    // Mantemos forçado para garantir que você visualize
    const timer = setTimeout(() => {
      setShowSplash(false);
      setTimeout(() => setRenderSplash(false), 500);
    }, 2500); // tempo estendido para apreciar a animação

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {renderSplash && (
        <div 
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ease-in-out ${showSplash ? "opacity-100" : "opacity-0"}`}
          style={{
            // CSS Pattern que simula a textura de um tecido (kimono/gi)
            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 4px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 4px)`,
            backgroundSize: '12px 12px',
          }}
        >
          {/* Sombra de vinheta radial por cima da textura */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/40 via-transparent to-[#000000]/90" />

          <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
            {/* White Circle Logo Area (Exatamente como na imagem) */}
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
            <div className="flex flex-col items-center text-center">
              <h1 className="font-display text-[3.5rem] leading-none font-bold uppercase tracking-tight text-[#F2F2F7]">
                JIU JITSU CAC
              </h1>
              <p className="text-xl text-[#F2F2F7] font-sans font-light tracking-[0.5em] mt-3 opacity-90">
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
