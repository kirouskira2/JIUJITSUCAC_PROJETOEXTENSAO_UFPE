import { getTodayWorkout } from "@/actions/checkin";
import QRCode from "react-qr-code";
import Link from "next/link";
import { IconArrowLeft, IconMaximize, IconAlertTriangle } from "@tabler/icons-react";

export default async function MonitorWorkoutQrPage() {
  const { data: todayWorkoutData } = await getTodayWorkout();
  
  if (!todayWorkoutData?.workout) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
          <IconAlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="font-display text-2xl font-black uppercase text-red-500">Treino não encontrado</h2>
        <p className="text-sm text-neutral-400 max-w-sm">
          Você precisa registrar o treino do dia antes de poder gerar o QR Code para os alunos escanearem.
        </p>
        <Link 
          href="/monitor/workout"
          className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-colors"
        >
          Voltar para Treino
        </Link>
      </div>
    );
  }

  const qrData = JSON.stringify({
    type: "jjcac-workout",
    workoutId: todayWorkoutData.workout.id,
  });

  return (
    <div className="flex flex-col h-full items-center justify-center py-10 px-4 min-h-[80vh]">
      <div className="w-full max-w-md bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#2C2C2E] rounded-3xl p-8 flex flex-col items-center relative overflow-hidden shadow-2xl">
        
        {/* Glow effect */}
        <div className="absolute top-0 w-full h-32 bg-red-600/10 blur-3xl pointer-events-none" />

        <div className="w-full flex items-center justify-between mb-8 relative z-10">
          <Link
            href="/monitor/workout"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-[#1C1C1E] border border-neutral-200 dark:border-[#2C2C2E] text-red-600 dark:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <IconArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-right">
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">
              QR Code do Treino
            </h2>
            <p className="text-xs text-neutral-500 dark:text-[#8E8E93] uppercase font-bold tracking-widest">
              Deixe visível no CT
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl mb-8 relative z-10 shadow-lg">
          <QRCode
            value={qrData}
            size={250}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>

        <div className="text-center relative z-10">
          <h3 className="font-bold text-neutral-900 dark:text-[#F2F2F7] mb-1">
            {todayWorkoutData.workout.techniqueName}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-[#8E8E93] max-w-[280px]">
            Peça para os alunos escanearem este QR Code usando o próprio celular para registrar a presença.
          </p>
        </div>

      </div>
    </div>
  );
}
