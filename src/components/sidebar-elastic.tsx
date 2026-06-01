"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/actions/auth";
import {
  LayoutDashboard,
  Users,
  FileText,
  ScanLine,
  Dumbbell,
  User,
  History,
  LogOut,
  Award,
  CalendarDays
} from "lucide-react";

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  href: string;
}

interface SidebarElasticProps {
  role: string;
  fullName: string;
}

export function SidebarElastic({ role, fullName }: SidebarElasticProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const pathname = usePathname();

  // Mapear os itens baseado no role
  const menuItems: SidebarItem[] = [];

  if (role === "admin") {
    menuItems.push(
      { href: "/admin", title: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", title: "Usuários", icon: Users },
      { href: "/admin/reports", title: "Relatórios", icon: FileText },
      { href: "/admin/graduation", title: "Módulo de Graduação", icon: Award }
    );
  }

  if (role === "admin" || role === "monitor") {
    menuItems.push(
      { href: "/monitor/workout", title: "Treino do Dia", icon: Dumbbell },
      { href: "/monitor/history", title: "Minhas Horas", icon: CalendarDays }
    );
  }

  menuItems.push(
    { href: "/aluno", title: "Meu Perfil", icon: User },
    { href: "/aluno/history", title: "Histórico", icon: History },
    { href: "/aluno/principios", title: "32 Princípios", icon: FileText }
  );

  const collapsedWidth = 76;
  const expandedWidth = 240;

  return (
    <>
      {/* Espaçador invisível para o layout flex, já que a sidebar é fixed */}
      <div
        className="hidden md:block transition-all duration-300 ease-in-out shrink-0"
        style={{ width: isExpanded ? expandedWidth : collapsedWidth }}
      />

      <motion.aside
        role="navigation"
        aria-label="Menu principal"
        className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border hidden md:flex flex-col z-50 overflow-hidden"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false);
          setHoveredTab(null);
        }}
        animate={{
          width: isExpanded ? expandedWidth : collapsedWidth,
        }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 20,
          restDelta: 0.5,
        }}
      >
        {/* HEADER DA LOGO */}
        <div className="h-20 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg?v=2" alt="Logo JJCAC" className="w-full h-full object-cover" />
            </div>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="text-foreground font-bold tracking-tight whitespace-nowrap text-lg"
                >
                  JJCAC
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ITENS DO MENU */}
        <nav className="flex-grow p-4 space-y-2 relative">
          {menuItems.map((item) => {
            // Em Next.js App Router, pathname corresponde exatamente ao href
            const isActive = pathname === item.href;
            const isHovered = hoveredTab === item.href;
            const IconComponent = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredTab(item.href)}
                className={`relative flex items-center gap-4 w-full h-11 px-3 rounded-xl transition-colors duration-150 outline-none group ${isActive
                    ? "text-primary dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}
              >
                {/* --- BACKGROUND HOVER (Pílula translúcida) --- */}
                {isHovered && !isActive && (
                  <motion.div
                    layoutId="hoverBackground"
                    className="absolute inset-0 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl -z-10"
                    transition={{ duration: 0.15 }}
                  />
                )}

                {/* --- INDICADOR DE ATIVO (Dynamic Sliding Pill) --- */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/[0.02] dark:from-primary/20 dark:to-primary/[0.04] border border-primary/20 dark:border-primary/30 rounded-xl -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                  />
                )}

                <div className="relative flex items-center justify-center min-w-[20px]">
                  <IconComponent
                    className={`w-5 h-5 transition-colors duration-200 ${isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300"
                      }`}
                  />
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* ALTERNADOR DE TEMA */}
        <div className="mt-auto pt-4 flex flex-col gap-2">
          {/* Pode adicionar outros botões de rodapé aqui futuramente se precisar */}
        </div>

        {/* RODAPÉ: PERFIL E LOGOUT */}
        <div className="p-4 border-t border-sidebar-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
            <span className="text-secondary-foreground font-bold text-xs">{fullName.charAt(0)}</span>
          </div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col whitespace-nowrap overflow-hidden flex-1"
              >
                <span className="text-sm font-semibold truncate text-foreground">{fullName}</span>
                <span className="text-xs text-muted-foreground uppercase">{role}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => signOut()}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 rounded-full transition-colors ml-auto shrink-0"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
