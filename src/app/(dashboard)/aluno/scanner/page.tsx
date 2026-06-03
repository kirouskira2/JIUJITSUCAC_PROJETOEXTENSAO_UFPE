"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTodayWorkout } from "@/actions/checkin";
import { QRScanner } from "@/components/qr-scanner";

export default function AlunoScannerPage() {
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("Aluno");

  useEffect(() => {
    const fetchWorkout = async () => {
      const { data, success } = await getTodayWorkout();
      if (success && data?.workout) {
        setWorkoutId(data.workout.id);
      }
    };
    
    const fetchProfile = async () => {
      const { getSession } = await import('@/actions/auth');
      const { data } = await getSession();
      if (data?.profile?.fullName) {
        setProfileName(data.profile.fullName.split(' ')[0]);
      }
    };
    
    fetchWorkout();
    fetchProfile().catch(() => {});
  }, []);

  return (
    <div className="flex flex-col flex-1 h-full w-full font-sans" style={{ background: "#050505" }}>
      {/* Top Header */}
      <header
        className="w-full z-40 px-6 h-14 flex items-center justify-between border-b sticky top-0"
        style={{ background: "rgba(28,28,30,0.70)", backdropFilter: "blur(24px)", borderColor: "#2C2C2E" }}
      >
        <Link
          href="/aluno"
          className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-white/5"
          style={{ color: "#dc2626" }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex flex-col items-center">
          <span className="font-display text-lg font-black uppercase tracking-tight" style={{ color: "#F2F2F7" }}>
            Check-in
          </span>
        </div>
        <div className="w-10" />
      </header>

      {/* Main Scanner Area */}
      <main className="flex-1 flex flex-col items-center p-4">
        <div className="w-full max-w-md mt-4">
           <QRScanner workoutId={workoutId} profileName={profileName} />
        </div>
      </main>
    </div>
  );
}
