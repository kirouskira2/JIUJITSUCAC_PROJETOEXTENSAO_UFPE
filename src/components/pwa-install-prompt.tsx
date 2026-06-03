"use client";

import React, { useEffect, useState } from "react";
import { DownloadIcon, ShareIcon, XIcon, PlusSquareIcon } from "lucide-react";

export function PwaInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // default true to avoid flash
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                           (window.navigator as any).standalone || 
                           document.referrer.includes("android-app://");
    
    setIsStandalone(checkStandalone);

    if (checkStandalone) return;

    // Has user dismissed the prompt before?
    if (localStorage.getItem("pwa-prompt-dismissed") === "true") {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // For iOS we just show the prompt
      setShowPrompt(true);
    } else {
      // For Android/Chrome we wait for the beforeinstallprompt event
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

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS can't trigger install programmatically, user must use Share -> Add to Home Screen
      // The banner itself acts as instructions
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-10">
      <div className="mx-auto max-w-md bg-[#1C1C1E]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 text-white relative">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <XIcon className="w-4 h-4 text-neutral-400" />
        </button>

        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-inner">
            <span className="font-display font-black text-xl text-white">S</span>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-[15px] mb-1 leading-tight">Instalar Aplicativo</h3>
            
            {isIOS ? (
              <div className="text-[13px] text-neutral-300 space-y-2 mt-1">
                <p>Para fácil acesso e notificações:</p>
                <ol className="list-decimal pl-4 space-y-1 text-neutral-400">
                  <li>Toque no ícone <ShareIcon className="w-3 h-3 inline text-blue-400" /> abaixo no Safari</li>
                  <li>Selecione <strong>"Adicionar à Tela de Início" <PlusSquareIcon className="w-3 h-3 inline" /></strong></li>
                </ol>
              </div>
            ) : (
              <>
                <p className="text-[13px] text-neutral-400 leading-snug mb-3">
                  Para fácil acesso e notificações.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm px-4 py-2 rounded-full flex items-center gap-2 transition-colors active:scale-95"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Instalar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
