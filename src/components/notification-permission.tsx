"use client";

import { useEffect, useState } from "react";
import { BellRingIcon, XIcon } from "lucide-react";

/**
 * Componente que registra o Service Worker e solicita permissão de notificação
 * ao usuário na primeira vez. Exibe um banner discreto no topo se a permissão
 * ainda não foi concedida (ou negada).
 */
export function NotificationPermission() {
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Registra o service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW registration failed:", err);
      });
    }

    // Verifica se precisa pedir permissão
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        // Ainda não pediu — exibe o banner
        const alreadyDismissed = localStorage.getItem("jjcac-notif-dismissed");
        if (!alreadyDismissed) {
          setShowBanner(true);
        }
      }
    }
  }, []);

  async function handleAllow() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Mostra uma notificação de teste
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification("JIU JITSU CAC", {
            body: "Notificações ativadas com sucesso! 🥋",
            icon: "/logo.jpg",
            badge: "/logo.jpg",
          });
        }
      }
    } catch (err) {
      console.warn("Notification permission error:", err);
    }
    setShowBanner(false);
  }

  function handleDismiss() {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("jjcac-notif-dismissed", "true");
  }

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[200] animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#2C2C2E] rounded-2xl p-4 shadow-2xl dark:shadow-black/40 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
          <BellRingIcon className="w-5 h-5 text-red-600 dark:text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-bold text-sm text-neutral-900 dark:text-[#F2F2F7]">
            Ativar notificações?
          </h4>
          <p className="text-xs text-neutral-500 dark:text-[#8E8E93] mt-0.5 leading-relaxed">
            Receba avisos de treinos, eventos e mudanças de horário em tempo real.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAllow}
              className="flex-1 h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Ativar
            </button>
            <button
              onClick={handleDismiss}
              className="h-9 px-3 rounded-lg border border-neutral-200 dark:border-[#2C2C2E] text-xs font-semibold text-neutral-500 dark:text-[#8E8E93] hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors shrink-0"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
