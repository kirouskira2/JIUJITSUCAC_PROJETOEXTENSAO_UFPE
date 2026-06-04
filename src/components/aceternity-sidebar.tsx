"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarDays,
  Dumbbell,
  User,
  History,
  LogOut,
  Award,
  Settings,
  ScanLine,
  Home,
  Megaphone
} from "lucide-react";
import { 
  IconDashboard, 
  IconHistory, 
  IconReportAnalytics, 
  IconCalendarEvent 
} from "@tabler/icons-react";
import { signOut } from "@/actions/auth";

interface AceternitySidebarProps {
  role: string;
  fullName: string;
}

export function AceternitySidebar({ role, fullName }: AceternitySidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Mapear os itens baseado no role
  const menuItems: { href: string; label: string; icon: React.ReactNode }[] = [];

  if (role === "admin") {
    // Admin tem menu próprio
    menuItems.push(
      { href: "/admin", label: "Dashboard", icon: <IconDashboard className="h-5 w-5 flex-shrink-0" /> },
      { href: "/admin/history", label: "Histórico Geral", icon: <IconHistory className="h-5 w-5 flex-shrink-0" /> },
      { href: "/admin/reports", label: "Relatórios Gerais", icon: <IconReportAnalytics className="h-5 w-5 shrink-0" /> },
      { href: "/admin/users", label: "Alunos", icon: <Users className="h-5 w-5 shrink-0" /> },
      { href: "/admin/workouts", label: "Treinos", icon: <Dumbbell className="h-5 w-5 shrink-0" /> },
      { href: "/admin/qr", label: "Tatame QR", icon: <ScanLine className="h-5 w-5 shrink-0" /> },
      { href: "/aluno/settings", label: "Configurações", icon: <Settings className="h-5 w-5 shrink-0" /> }
    );
  } else if (role === "monitor") {
    menuItems.push(
      { href: "/monitor", label: "Dashboard", icon: <Home className="h-5 w-5 shrink-0" /> },
      { href: "/monitor/history", label: "Minhas Horas", icon: <CalendarDays className="h-5 w-5 shrink-0" /> },
      { href: "/monitor/reports", label: "Relatório (PDF)", icon: <IconReportAnalytics className="h-5 w-5 shrink-0" /> },
      { href: "/monitor/workout", label: "Treino do Dia", icon: <Dumbbell className="h-5 w-5 shrink-0" /> },
      { href: "/aluno/events", label: "Avisos", icon: <Megaphone className="h-5 w-5 shrink-0" /> },
      { href: "/aluno/settings", label: "Configurações", icon: <Settings className="h-5 w-5 shrink-0" /> }
    );
  } else {
    // Aluno
    menuItems.push(
      { href: "/aluno", label: "Dashboard", icon: <Home className="h-5 w-5 shrink-0" /> },
      { href: "/aluno/history", label: "Histórico", icon: <History className="h-5 w-5 shrink-0" /> },
      { href: "/aluno/principios", label: "32 Princípios", icon: <FileText className="h-5 w-5 shrink-0" /> },
      { href: "/aluno/events", label: "Avisos", icon: <Megaphone className="h-5 w-5 shrink-0" /> },
      { href: "/aluno/settings", label: "Configurações", icon: <Settings className="h-5 w-5 shrink-0" /> }
    );
  }

  // Ocultar a sidebar no mobile se não for admin
  const sidebarContainerClass = role !== "admin" ? "hidden md:flex h-full" : "flex h-full";

  return (
    <div className={sidebarContainerClass}>
      <Sidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between gap-10 bg-neutral-100 dark:bg-[#111111] border-r border-border">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo Section */}
          <Link 
            href={role === "admin" ? "/admin" : role === "monitor" ? "/monitor" : "/aluno"} 
            className="flex items-center gap-3 py-2 px-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className={`rounded-full overflow-hidden shrink-0 border border-border transition-all duration-300 ${open ? "w-16 h-16" : "w-10 h-10"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="Logo JJCAC" className="w-full h-full object-cover" />
            </div>
            {open && (
              <span className="font-display font-bold text-base leading-tight tracking-tighter text-neutral-900 dark:text-[#F2F2F7] truncate">
                {role === "admin" ? `Olá Mestre ${fullName.split(" ")[0]}` : `Olá ${fullName.split(" ")[0]}`}
              </span>
            )}
          </Link>

          <div className="mt-8 flex flex-col gap-2">
            {menuItems.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <SidebarLink
                  key={idx}
                  link={item}
                  className={isActive ? "bg-red-600/20 text-red-500 font-medium rounded-lg" : ""}
                />
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0 bg-neutral-200 dark:bg-[#1C1C1E] border-border">
              <span className="font-bold text-[10px] text-neutral-900 dark:text-[#F2F2F7]">
                {fullName.charAt(0)}
              </span>
            </div>
            {open && (
              <div className="flex flex-col flex-1 overflow-hidden whitespace-nowrap">
                <span className="text-sm font-semibold truncate text-neutral-900 dark:text-[#F2F2F7]">{fullName}</span>
                <span className="text-xs uppercase text-neutral-500 dark:text-[#8E8E93]">{role}</span>
              </div>
            )}
            {open && (
              <button
                onClick={() => signOut()}
                className="p-1 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
    </div>
  );
}
