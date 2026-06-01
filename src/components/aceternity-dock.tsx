"use client";

import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ScanLine, 
  Dumbbell, 
  User, 
  History,
  Award,
  Calendar
} from "lucide-react";

interface AceternityDockProps {
  role: string;
}

export function AceternityDock({ role }: AceternityDockProps) {
  const menuItems: { href: string; title: string; icon: React.ReactNode }[] = [];

  if (role === "admin") {
    menuItems.push(
      { href: "/admin", title: "Dashboard", icon: <LayoutDashboard className="h-full w-full text-zinc-500 dark:text-zinc-300" /> },
      { href: "/admin/users", title: "Usuários", icon: <Users className="h-full w-full text-zinc-500 dark:text-zinc-300" /> },
      { href: "/admin/reports", title: "Relatórios", icon: <FileText className="h-full w-full text-zinc-500 dark:text-zinc-300" /> },
      { href: "/admin/events", title: "Eventos", icon: <Calendar className="h-full w-full text-zinc-500 dark:text-zinc-300" /> }
    );
  }

  if (role === "admin" || role === "monitor") {
    menuItems.push(
      { href: "/monitor/history", title: "Horas", icon: <History className="h-full w-full text-zinc-500 dark:text-zinc-300" /> },
      { href: "/monitor/workout", title: "Treino", icon: <Dumbbell className="h-full w-full text-zinc-500 dark:text-zinc-300" /> }
    );
  }

  menuItems.push(
    { href: "/aluno", title: "Perfil", icon: <User className="h-full w-full text-zinc-500 dark:text-zinc-300" /> },
    { href: "/aluno/history", title: "Histórico", icon: <History className="h-full w-full text-zinc-500 dark:text-zinc-300" /> },
    { href: "/aluno/principios", title: "Princípios", icon: <FileText className="h-full w-full text-zinc-500 dark:text-zinc-300" /> },
    { href: "/aluno/events", title: "Eventos", icon: <Calendar className="h-full w-full text-zinc-500 dark:text-zinc-300" /> }
  );

  return (
    <div className="fixed bottom-4 w-full z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto">
        <FloatingDock
          mobileClassName="translate-y-0" // The Aceternity component opens its menu up from the button on mobile
          items={menuItems}
        />
      </div>
    </div>
  );
}
