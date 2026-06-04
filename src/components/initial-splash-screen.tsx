"use client";

import { useEffect, useState } from "react";
import { LoaderTwo } from "@/components/ui/loader";

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
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
            {/* Splash Logo */}
            <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/20">
              <span className="text-white font-display font-black text-3xl tracking-tighter">
                JJCAC
              </span>
            </div>
            
            {/* Animated Loader (LoaderTwo) */}
            <LoaderTwo className="w-10 h-10" />

            {/* Brand Name */}
            <div className="mt-4 flex flex-col items-center gap-1 text-center">
              <h1 className="font-display text-2xl font-black uppercase tracking-widest text-neutral-900 dark:text-[#F2F2F7]">
                Jiu Jitsu Cac
              </h1>
              <p className="text-xs text-neutral-500 dark:text-[#8E8E93] font-semibold tracking-wider">
                PROJETO DE EXTENSÃO
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
