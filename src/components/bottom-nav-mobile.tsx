"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ScanLine, 
  Dumbbell, 
  User, 
  History,
  BookOpen
} from "lucide-react";

interface BottomNavMobileProps {
  role: string;
}

export function BottomNavMobile({ role }: BottomNavMobileProps) {
  const pathname = usePathname();

  const menuItems = [];

  if (role === "admin") {
    menuItems.push(
      { href: "/admin", title: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", title: "Usuários", icon: Users },
      { href: "/admin/reports", title: "Relatórios", icon: FileText }
    );
  }

  if (role === "admin" || role === "monitor") {
    menuItems.push(
      { href: "/monitor/history", title: "Horas", icon: History },
      { href: "/monitor/workout", title: "Treino", icon: Dumbbell }
    );
  }

  menuItems.push(
    { href: "/aluno", title: "Perfil", icon: User },
    { href: "/aluno/principios", title: "Princípios", icon: BookOpen },
    { href: "/aluno/history", title: "Histórico", icon: History }
  );

  return (
    <nav
      className="md:hidden fixed bottom-4 left-4 right-4 z-50 rounded-2xl px-2 py-1.5 flex items-center justify-around"
      style={{
        background: "rgba(28,28,30,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center p-2 rounded-xl transition-all relative flex-1"
          >
            <div className="relative flex items-center justify-center">
              <IconComponent 
                className="w-5 h-5 transition-all duration-200"
                style={{
                  color: isActive ? "#dc2626" : "#8E8E93",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                }}
              />
            </div>
            <span
              className="text-[10px] mt-1 font-semibold transition-colors duration-200"
              style={{ color: isActive ? "#F2F2F7" : "#48484A" }}
            >
              {item.title}
            </span>
            {isActive && (
              <div
                className="absolute -bottom-1 w-6 h-[3px] rounded-full"
                style={{
                  background: "#dc2626",
                  boxShadow: "0 0 8px rgba(220,38,38,0.8)",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
