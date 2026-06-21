import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { AceternitySidebar } from "@/components/aceternity-sidebar";
import { AceternityDock } from "@/components/aceternity-dock";
import { LogoutButton } from "./logout-button";
import { BottomNavBar } from "@/components/bottom-nav-bar";
import { HexagonPattern } from "@/components/ui/hexagon-pattern";
import { NotificationsBell } from "@/components/notifications-bell";
import { NotificationPermission } from "@/components/notification-permission";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data } = await getSession();

  if (!data?.session) {
    redirect("/login");
  }

  const { profile } = data;

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] md:h-screen w-full md:overflow-hidden bg-neutral-50 dark:bg-[#050505] text-neutral-900 dark:text-neutral-50">
      
      {/* PWA Mobile Banner - Shows only when logged in on browser */}
      <PwaInstallPrompt />

      {/* Menu Lateral (Desktop e Mobile) */}
      <AceternitySidebar role={profile.role} fullName={profile.fullName} />

      {/* Main Content Wrapper */}
      <div className="flex-1 md:p-2 md:pl-0 flex flex-col min-w-0 overflow-hidden bg-neutral-100 dark:bg-[#050505]">
        
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4 h-16 bg-surface-container border-b border-border z-40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-red-600 overflow-hidden relative">
              <Image src="/logo.jpg" alt="JJCAC Logo" fill className="object-cover" />
            </div>
            <span className="font-display font-black tracking-tighter text-red-600 uppercase">JJCAC</span>
          </div>
          <NotificationsBell />
        </div>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative md:rounded-[2rem] border-0 bg-surface-container md:shadow-2xl">
          {/* Hexagon Pattern Background */}
          <HexagonPattern
            className={cn(
              "[mask-image:radial-gradient(1200px_circle_at_center,white,transparent)]",
              "absolute inset-0 w-full h-full z-0 opacity-60 dark:opacity-30"
            )}
            radius={56}
          />

          {/* Global Page Container */}
          <div className="flex-1 w-full px-4 md:px-8 py-6 md:py-8 relative z-10 md:overflow-y-auto pb-20 md:pb-8">
            {/* Desktop: Notification bell top-right */}
            <div className="hidden md:block absolute top-8 right-8 z-50">
              <NotificationsBell />
            </div>

            <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
              {/* Notification permission banner */}
              <NotificationPermission />
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Navegação Inferior para Alunos e Monitores (Mobile) */}
      <BottomNavBar role={profile.role} />
    </div>
  );
}
