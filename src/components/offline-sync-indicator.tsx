'use client';

import React from 'react';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export function OfflineSyncIndicator() {
  const { isOnline, pendingCount, isSyncing, syncNow } = useOfflineSync();

  // Se estiver online e sem pendências, não precisa poluir a tela inteira,
  // ou mostramos um pequeno indicador discreto. Vamos fazer um indicador flutuante
  // elegante no canto inferior direito que se adapta.
  
  if (isOnline && pendingCount === 0) {
    return null; // Oculta se estiver tudo sincronizado e online
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-subtle">
      <div className={`flex flex-col gap-2 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${
        !isOnline 
          ? 'bg-red-500/10 border-red-500/20 text-red-200' 
          : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-amber-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400 animate-pulse" />
            )}
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
              isOnline ? 'bg-amber-500 animate-ping' : 'bg-red-500 animate-ping'
            }`} />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wide uppercase opacity-75">
              {isOnline ? 'Conexão Online' : 'Sem Conexão'}
            </span>
            <span className="text-sm font-bold">
              {pendingCount > 0 
                ? `${pendingCount} check-in(s) pendente(s)` 
                : 'Salvo localmente'}
            </span>
          </div>
        </div>

        {pendingCount > 0 && isOnline && (
          <button
            onClick={syncNow}
            disabled={isSyncing}
            className="mt-2 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
        )}

        {!isOnline && (
          <div className="mt-1 flex items-center gap-1.5 text-[11px] opacity-80">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span>Presença salva no dispositivo. Conecte-se para sincronizar.</span>
          </div>
        )}
      </div>
    </div>
  );
}
