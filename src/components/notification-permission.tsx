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
        try {
          const alreadyDismissed = localStorage.getItem("jjcac-notif-dismissed");
          if (!alreadyDismissed) {
            setShowBanner(true);
          }
        } catch (e) {
          setShowBanner(true);
        }
      } else if (Notification.permission === "granted") {
        // Já tem permissão, vamos tentar inscrever silenciosamente no background
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then(async (reg) => {
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (vapidPublicKey) {
              try {
                // Checar se já tem inscrição para evitar chamadas de rede desnecessárias
                const existingSub = await reg.pushManager.getSubscription();
                if (!existingSub) {
                  const subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                  });
                  await fetch("/api/push/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(subscription),
                  });
                }
              } catch (e) {
                console.warn("Silent subscription failed", e);
              }
            }
          });
        }
      }
    }
  }, []);

  // Utilitário para converter a chave VAPID
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  async function handleAllow() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          
          // Inscrever no PushManager
          const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (vapidPublicKey) {
            try {
              const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
              });

              // Enviar a inscrição para o servidor
              await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(subscription),
              });
            } catch (subErr) {
              console.warn("Failed to subscribe to PushManager:", subErr);
            }
          }

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
    try {
      localStorage.setItem("jjcac-notif-dismissed", "true");
    } catch (e) {}
  }

  if (!showBanner || dismissed) return null;

  return (
    <div className="w-full mb-6 animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#2C2C2E] rounded-2xl p-4 shadow-sm flex items-start gap-3">
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
