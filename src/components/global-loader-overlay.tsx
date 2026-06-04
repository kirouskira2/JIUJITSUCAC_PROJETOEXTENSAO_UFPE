"use client";

import { LoaderOne } from "@/components/ui/loader";
import { useEffect } from "react";

interface GlobalLoaderOverlayProps {
  message?: string;
}

/**
 * Overlay de tela cheia para cobrir ações demoradas (ex: chamadas de API, processamento).
 * Impede múltiplos cliques do usuário e mostra feedback imediato.
 */
export function GlobalLoaderOverlay({ message = "Carregando..." }: GlobalLoaderOverlayProps) {
  // Previne rolagem enquanto carrega
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl flex flex-col items-center gap-4 shadow-2xl border border-neutral-200 dark:border-[#2C2C2E]">
        <LoaderOne className="my-2" />
        <p className="text-sm font-semibold text-neutral-900 dark:text-[#F2F2F7]">
          {message}
        </p>
      </div>
    </div>
  );
}
