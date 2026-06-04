"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, History, Megaphone, ScanLine } from "lucide-react";

interface BottomNavBarProps {
  role: string;
}

export function BottomNavBar({ role }: BottomNavBarProps) {
  const pathname = usePathname();

  // Se for admin, a sidebar do Aceternity já faz o trabalho no mobile também (ou podemos desativar se quiser, mas focaremos em aluno/monitor)
  if (role === "admin") return null;

  const items = role === "monitor" 
    ? [
        { href: "/monitor", label: "Início", icon: Home },
        { href: "/monitor/history", label: "Minhas Horas", icon: History },
        { href: "/monitor/workout", label: "Treino", icon: CalendarDays },
        { href: "/monitor/workout/qr", label: "Escanear", icon: ScanLine },
      ]
    : [
        { href: "/aluno", label: "Início", icon: Home },
        { href: "/aluno/history", label: "Histórico", icon: History },
        { href: "/aluno/events", label: "Avisos", icon: Megaphone },
        { href: "/aluno/scanner", label: "Escanear", icon: ScanLine },
      ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111]/90 backdrop-blur-xl border-t border-[#2C2C2E] pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-red-500" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? "bg-red-500/10" : ""}`}>
                <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium font-sans">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
