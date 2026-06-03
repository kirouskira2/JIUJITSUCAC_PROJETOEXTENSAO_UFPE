"use client";

import React, { useEffect, useState } from "react";
import { DownloadIcon, ShareIcon, XIcon, PlusSquareIcon } from "lucide-react";

export function PwaInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches || 
                           (window.navigator as any).standalone || 
                           (document.referrer || "").includes("android-app://");
    
    setIsStandalone(checkStandalone);

    if (checkStandalone) return;
    try {
      if (localStorage.getItem("pwa-banner-dismissed") === "true") {
        setDismissed(true);
        return;
      }
    } catch (e) {
      // Ignora erro de segurança do Safari no modo privado
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      setShowPrompt(true);
    } else {
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS can't trigger install programmatically, open drawer instructions
      setShowDrawer(true);
      return;
    }

    if (!deferredPrompt) {
      // Falha silenciosa no Android se não houver prompt nativo
      setShowDrawer(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const closeBanner = () => {
    setShowPrompt(false);
    setDismissed(true);
    try {
      localStorage.setItem("pwa-banner-dismissed", "true");
    } catch (e) {}
  };

  if (!showPrompt || isStandalone || dismissed) return null;

  return (
    <>
      {/* HEADER BANNER MOBILE */}
      <div className="flex items-center justify-between w-full h-16 md:hidden px-2 bg-[#1C1C1E] border-b border-[#2C2C2E] shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-2">
          <button onClick={closeBanner} className="p-1 hover:bg-white/10 rounded-full text-neutral-400 mr-1 transition-colors">
            <XIcon className="w-4 h-4" />
          </button>
          <img src="/favicon.ico" alt="App Icon" className="size-9 rounded-xl object-cover bg-black" />
          <div className="flex flex-col justify-center h-full">
            <span className="text-sm font-semibold text-white leading-tight">Instalar aplicativo</span>
            <span className="text-xs text-neutral-400 leading-tight mt-[2px]">Para fácil acesso e notificações</span>
          </div>
        </div>
        <button 
          onClick={handleInstallClick}
          className="flex items-center gap-2 font-medium transition-all duration-300 cursor-pointer rounded-[28px] hover:opacity-70 bg-gradient-to-br from-red-600 via-red-500 to-red-400 text-white font-semibold shadow-md active:scale-95 w-9 h-9 justify-center"
        >
          <div className="w-full rounded-full px-0 justify-center inline-flex w-full items-center">
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 18 18" style={{ fontSize: '18px' }}>
              <g fill="none"><g fill="#fff">
                <path d="M7.41 13.591a2.25 2.25 0 0 0 3.182 0l2.409-2.408a.75.75 0 0 0-1.06-1.058L9.745 12.32 9.75.75A.75.75 0 0 0 9 0a.75.75 0 0 0-.75.75l-.007 11.556-2.182-2.181a.75.75 0 1 0-1.06 1.061l2.407 2.405z"></path>
                <path d="M17.25 12a.75.75 0 0 0-.75.75v3a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1-.75-.75v-3a.75.75 0 1 0-1.5 0v3A2.25 2.25 0 0 0 2.25 18h13.5A2.25 2.25 0 0 0 18 15.75v-3a.75.75 0 0 0-.75-.75z"></path>
              </g></g>
            </svg>
          </div>
        </button>
      </div>

      {/* BOTTOM DRAWER */}
      {showDrawer && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setShowDrawer(false)} />
          <div className="relative flex flex-col items-center justify-center px-4 pt-10 pb-10 rounded-t-3xl md:rounded-3xl bg-[#1C1C1E] border-t border-white/10 shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] overflow-y-auto w-full max-w-md mx-auto">
            
            <button 
              onClick={() => setShowDrawer(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-neutral-300 hover:bg-white/20 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-white text-xl font-medium text-center mb-5">Instale o aplicativo e nunca perca notificações.</h3>
            
            <div className="flex flex-col items-center w-full">
              <div className="relative mb-5">
                <div className="w-[140px] h-[140px] mx-auto bg-[#2C2C2E]/50 rounded-3xl flex flex-col items-center justify-center p-4 shadow-inner border border-white/5">
                   <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-3">
                     <DownloadIcon className="w-8 h-8 text-white" />
                   </div>
                   <span className="text-white font-display font-bold">JJCAC</span>
                </div>
              </div>

              <div className="w-full text-center space-y-4 px-2">
                {isIOS ? (
                  <>
                    <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                      Para instalar no iPhone ou iPad:
                    </p>
                    <div className="bg-black/30 rounded-2xl p-5 flex flex-col gap-4 text-left w-full border border-white/5">
                      <p className="text-neutral-300 text-sm flex items-center gap-3">
                        <span className="bg-neutral-800 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-inner">1</span>
                        <span>Toque em <ShareIcon className="w-4 h-4 text-blue-400 mx-1 inline" /> <strong className="text-white">Compartilhar</strong> no Safari.</span>
                      </p>
                      <p className="text-neutral-300 text-sm flex items-center gap-3">
                        <span className="bg-neutral-800 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-inner">2</span>
                        <span>Selecione <strong className="text-white">"Adicionar à Tela de Início"</strong> <PlusSquareIcon className="w-4 h-4 mx-1 inline" /></span>
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-black/30 rounded-2xl p-5 border border-white/5 text-left">
                    <p className="text-neutral-300 text-sm leading-relaxed">
                      Toque no menu do seu navegador (três pontos no canto superior) e selecione <strong className="text-white">"Instalar aplicativo"</strong> ou <strong className="text-white">"Adicionar à Tela Inicial"</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
