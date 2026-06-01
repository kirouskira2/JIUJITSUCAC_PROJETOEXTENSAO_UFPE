'use client';

import { useState, useEffect, useCallback } from 'react';
import { OfflineCheckinStore, PendingCheckin } from '@/lib/offline-checkin-store';
import { registerCheckin } from '@/actions/checkin';
import { useToast } from '@/hooks/use-toast';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const { toast } = useToast();

  // Função para atualizar a contagem de itens pendentes
  const updatePendingCount = useCallback(async () => {
    const count = await OfflineCheckinStore.countPending();
    setPendingCount(count);
  }, []);

  // Função para sincronizar todos os check-ins pendentes
  const syncNow = useCallback(async () => {
    if (isSyncing) return;
    
    const pending = await OfflineCheckinStore.getPending();
    if (pending.length === 0) return;

    setIsSyncing(true);
    toast({
      title: 'Sincronização iniciada',
      description: `Sincronizando ${pending.length} presença(s) pendente(s) com o servidor...`,
    });

    let successCount = 0;
    let failCount = 0;

    for (const item of pending) {
      try {
        const response = await registerCheckin({
          profileId: item.profileId,
          workoutId: item.workoutId,
          hygieneConfirmed: item.hygieneConfirmed,
          qrCodeToken: item.qrCodeToken,
        });

        if (response.success) {
          await OfflineCheckinStore.removePending(item.id);
          successCount++;
        } else {
          // Se for erro de duplicidade, removemos do banco local pois a presença já foi computada
          if (response.error?.includes('já fez check-in') || response.error?.includes('UNIQUE')) {
            await OfflineCheckinStore.removePending(item.id);
            successCount++;
          } else {
            await OfflineCheckinStore.markFailed(item.id, response.error || 'Erro desconhecido');
            failCount++;
          }
        }
      } catch (err: any) {
        await OfflineCheckinStore.markFailed(item.id, err.message || 'Erro de conexão');
        failCount++;
      }
    }

    await updatePendingCount();
    setIsSyncing(false);

    if (successCount > 0) {
      toast({
        title: 'Presenças sincronizadas!',
        description: `${successCount} presença(s) foram salvas com sucesso no tatame!`,
      });
    }

    if (failCount > 0) {
      toast({
        title: 'Erro de sincronização',
        description: `Não foi possível sincronizar ${failCount} presença(s). Tente novamente mais tarde.`,
        variant: 'destructive',
      });
    }
  }, [isSyncing, toast, updatePendingCount]);

  // Efeito para monitorar o status da conexão à internet e atualizar contagem
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    updatePendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Conexão restaurada!',
        description: 'Você está online novamente. Iniciando sincronização...',
      });
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Você está offline',
        description: 'Os check-ins feitos no tatame serão salvos localmente no dispositivo.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Polling opcional para garantir contagem atualizada caso outro componente salve pendentes
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [syncNow, updatePendingCount, toast]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    syncNow,
    updatePendingCount,
  };
}
