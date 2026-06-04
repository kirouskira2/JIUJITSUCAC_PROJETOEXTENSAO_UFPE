"use client";

import { useEffect, useState } from "react";
import { LoaderOne } from "@/components/ui/loader";
import Image from "next/image";

export function InitialSplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [renderSplash, setRenderSplash] = useState(true);

  useEffect(() => {
    // Controla para exibir a tela de abertura apenas 1x por sessão (quando o usuário abre o PWA)
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    
    if (hasSeenSplash) {
      setShowSplash(false);
      setRenderSplash(false);
    } else {
      const timer = setTimeout(() => {
        setShowSplash(false); // Inicia o fade out
        sessionStorage.setItem("hasSeenSplash", "true");
        
        // Remove totalmente do DOM após a transição de opacidade
        setTimeout(() => setRenderSplash(false), 500);
      }, 2500); // Fica na tela por 2.5 segundos

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {renderSplash && (
        <div 
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-[#111111] transition-opacity duration-500 ease-in-out ${showSplash ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
            {/* Splash Logo Real */}
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-2xl shadow-red-500/20 border-4 border-white dark:border-[#1C1C1E]">
              <Image 
                src="/logo.jpg" 
                alt="Logo Jiu Jitsu Cac" 
                fill 
                className="object-cover"
                priority
              />
            </div>
            
            {/* Animated Loader (LoaderOne - Pontinhos) */}
            <div className="mt-4">
              <LoaderOne />
            </div>

            {/* Brand Name */}
            <div className="mt-6 flex flex-col items-center gap-1.5 text-center">
              <h1 className="font-sans text-3xl font-black uppercase tracking-widest text-neutral-900 dark:text-[#F2F2F7]">
                Jiu Jitsu Cac
              </h1>
              <p className="text-sm text-neutral-500 dark:text-[#8E8E93] font-bold tracking-[0.2em]">
                OSS!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* O app renderiza embaixo e fica pronto para uso assim que a splash sumir */}
      {children}
    </>
  );
}
