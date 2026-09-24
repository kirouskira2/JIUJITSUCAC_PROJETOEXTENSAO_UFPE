"use client";

import { useEffect } from "react";

/**
 * KeepAlivePing — Anti-Hibernação do Supabase Free Tier
 *
 * O plano gratuito do Supabase entra em hibernação após 7 dias sem atividade.
 * Este componente faz uma requisição leve ao endpoint /api/keep-alive a cada
 * 3 dias (72 horas), mantendo o banco ativo sem sobrecarregar a infra.
 *
 * A última data de ping é persistida no localStorage para evitar chamadas
 * desnecessárias em cada visita do usuário.
 */

const KEEP_ALIVE_KEY = "jjcac_last_keep_alive_ping";
const PING_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000; // 3 dias em milissegundos

export function KeepAlivePing() {
  useEffect(() => {
    const checkAndPing = async () => {
      try {
        const lastPingStr = localStorage.getItem(KEEP_ALIVE_KEY);
        const now = Date.now();

        // Só dispara se nunca pingou ou se passaram mais de 3 dias
        if (!lastPingStr || now - parseInt(lastPingStr, 10) > PING_INTERVAL_MS) {
          const res = await fetch("/api/keep-alive");
          if (res.ok) {
            localStorage.setItem(KEEP_ALIVE_KEY, String(now));
            console.debug("[KeepAlive] Ping enviado com sucesso:", new Date(now).toISOString());
          }
        }
      } catch {
        // Silencioso — falha no keep-alive não deve afetar o usuário
      }
    };

    // Executa na montagem do componente (carregamento da página)
    checkAndPing();

    // Também verifica a cada hora enquanto o app estiver aberto
    // (cobre o caso de o usuário deixar o app aberto por muito tempo)
    const interval = setInterval(checkAndPing, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Componente invisível — não renderiza nada
  return null;
}
