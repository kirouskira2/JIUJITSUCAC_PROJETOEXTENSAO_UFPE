import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { HygieneModal } from "@/components/hygiene-modal";
import { PrincipleCard } from "@/components/principle-card";
import { CheckCircle2, ScanLine, XCircle, AlertCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { OfflineSyncIndicator } from "@/components/offline-sync-indicator";

interface QRScannerProps {
  workoutId: string | null;
  profileName: string;
}

interface PrincipleData {
  number: number;
  titlePt: string;
  titleEn: string;
  description: string;
  category?: string | null;
}

export function QRScanner({ workoutId, profileName }: QRScannerProps) {
  const [showHygieneModal, setShowHygieneModal] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [principleOfDay, setPrincipleOfDay] = useState<PrincipleData | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const [scannedToken, setScannedToken] = useState<string>("JJCAC-TATAME-UFPE");

  const onScanSuccess = useCallback((decodedText: string) => {
    // Agora aceita o token criptografado (HMAC) ou o estático se estiver em fallback
    if (decodedText.length > 10) {
      setScannedToken(decodedText);
      if (!workoutId) {
        setScanError("QR Code lido com sucesso! Porém, o professor ainda não registrou o treino de hoje.");
        return;
      }
      // Pare o scanner se encontrou o código correto
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
      setShowHygieneModal(true);
    } else {
      setScanError("QR Code inválido. Aponte para o QR Code oficial do tatame.");
    }
  }, [workoutId]);

  const onScanFailure = useCallback((error: unknown) => {
    // Falhas de leitura acontecem constantemente enquanto a câmera tenta focar.
    // Ignoramos a maioria, mas limpamos o erro se houver
    if (scanError) setScanError(null);
  }, [scanError]);

  useEffect(() => {
    if (checkedIn) return;

    // Inicializa o scanner de forma headless (sem UI padrão)
    html5QrCodeRef.current = new Html5Qrcode("qr-reader");
    
    html5QrCodeRef.current.start(
      { facingMode: "environment" }, // Força a câmera traseira
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 }
      },
      onScanSuccess,
      onScanFailure
    ).catch(err => {
      console.warn("Camera permission or initialization error:", err);
      // Se der erro (ex: usuário negou a câmera)
      if (err?.name === "NotAllowedError") {
        setScanError("Permissão de câmera negada. Por favor, libere o acesso nas configurações do navegador.");
      }
    });

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [checkedIn, onScanSuccess, onScanFailure]);

  const handleCheckinSuccess = useCallback((principle: PrincipleData | null) => {
    setCheckedIn(true);
    if (principle) {
      setPrincipleOfDay(principle);
    }
  }, []);

  if (checkedIn) {
    return (
      <div className="flex flex-col gap-6 w-full items-center">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(229,9,20,0.4)]">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground">
            {principleOfDay ? "Presença Confirmada!" : "Check-in Registrado Offline! 📴"}
          </h2>
          <p className="text-muted-foreground font-sans mt-2">
            {principleOfDay 
              ? `Oss! Bom treino, ${profileName}! 🥋` 
              : `Sua presença foi salva localmente e será sincronizada assim que a conexão retornar. Oss, ${profileName}! 🥋`}
          </p>
        </div>

        {principleOfDay ? (
          <PrincipleCard
            number={principleOfDay.number}
            titlePt={principleOfDay.titlePt}
            titleEn={principleOfDay.titleEn}
            description={principleOfDay.description}
            category={principleOfDay.category}
          />
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 text-center max-w-md">
            <h3 className="font-semibold text-amber-300">Modo Offline Ativo</h3>
            <p className="text-sm text-neutral-300 mt-2 font-sans">
              O princípio do dia será exibido assim que o dispositivo estiver online e a sincronização automática for concluída.
            </p>
          </div>
        )}
        <OfflineSyncIndicator />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full gap-4">
        <div className="bg-surface-container border border-border rounded-3xl p-4 sm:p-8 w-full flex flex-col items-center justify-center relative shadow-2xl overflow-hidden group transition-all duration-300">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20"></div>
          
          <div className="text-center mb-6">
            <h3 className="font-display text-2xl font-black text-foreground uppercase">Scanner de Tatame</h3>
            <p className="text-sm text-muted-foreground mt-1">Aponte a câmera para o QR Code fixo na parede do tatame para registrar sua presença.</p>
          </div>

          <div className="w-full max-w-[320px] mx-auto rounded-xl overflow-hidden shadow-inner bg-black border-2 border-border" id="qr-reader-container">
            {/* O html5-qrcode injeta os elementos dentro deste div */}
            <div id="qr-reader" className="w-full"></div>
          </div>
          
          {!workoutId && (
            <div className="mt-4 bg-surface border border-border rounded-xl p-3 text-center w-full">
              <p className="font-sans font-semibold text-foreground text-sm">Aviso: Nenhum treino aberto</p>
              <p className="font-sans text-xs text-muted-foreground mt-1">Você pode ler o QR Code, mas o check-in só será efetivado quando o professor abrir o treino.</p>
            </div>
          )}

          {scanError && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3 w-full animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{scanError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Ecologia Integral */}
      {workoutId && (
        <HygieneModal
          open={showHygieneModal}
          onOpenChange={(open) => {
            setShowHygieneModal(open);
            // Se o usuário fechar o modal sem concluir, reinicia o scanner
            if (!open && !checkedIn) {
              setScanError(null);
              // Força o componente a remontar o scanner no próximo tick
              setTimeout(() => {
                if (html5QrCodeRef.current && !html5QrCodeRef.current.isScanning) {
                  html5QrCodeRef.current.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    onScanSuccess,
                    onScanFailure
                  ).catch(console.error);
                }
              }, 300);
            }
          }}
          profileId={undefined} // Undefined significa que a Action usará o usuário logado via RLS/Session
          workoutId={workoutId}
          qrCodeToken={scannedToken}
          onSuccess={handleCheckinSuccess}
        />
      )}
      <OfflineSyncIndicator />
    </>
  );
}
