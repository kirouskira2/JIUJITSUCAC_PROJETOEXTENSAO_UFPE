"use client";

import React, { useEffect, useState } from "react";
import { getMyNotifications, markNotificationAsRead } from "@/actions/events";

interface NotificationItem {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}
import { BellIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifs() {
      const res = await getMyNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);

        // Se houver notificações não lidas E permissão concedida, exibe push local
        const unread = res.data.filter((n) => !n.is_read);
        if (
          unread.length > 0 &&
          "Notification" in window &&
          Notification.permission === "granted" &&
          "serviceWorker" in navigator
        ) {
          try {
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification("JIU JITSU CAC", {
              body: `Você tem ${unread.length} aviso(s) não lido(s).`,
              icon: "/logo.jpg",
              badge: "/logo.jpg",
              tag: "jjcac-unread", // evita spam (mesmo tag substitui)
            });
          } catch {
            // SW pode não estar pronto ainda, ignora
          }
        }
      }
      setLoading(false);
    }
    loadNotifs();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleMarkAsRead(id: string) {
    const res = await markNotificationAsRead(id);
    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } else {
      toast.error("Erro ao marcar notificação como lida");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative group hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full h-10 w-10 transition-colors">
          <BellIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400 group-hover:text-blue-500 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white dark:border-black"></span>
            </span>
          )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 dark:from-blue-500/20 dark:to-indigo-500/10 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center backdrop-blur-md">
          <span className="font-semibold text-lg text-foreground flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-blue-500" />
            Notificações
          </span>
          {unreadCount > 0 && (
            <span className="text-xs font-bold bg-blue-500 text-white shadow-md shadow-blue-500/20 px-2.5 py-1 rounded-full animate-in fade-in zoom-in duration-300">
              {unreadCount} novas
            </span>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-neutral-500">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center text-neutral-500">
              <BellIcon className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  "p-4 cursor-default transition-all duration-300 ease-in-out focus:bg-neutral-50 dark:focus:bg-neutral-800/50 flex items-start gap-3 border-b border-neutral-100 dark:border-neutral-800/50 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/30",
                  !n.is_read ? "bg-blue-50/40 dark:bg-blue-900/10" : "opacity-80 hover:opacity-100"
                )}
                onSelect={(e) => e.preventDefault()}
              >
                <div className={cn("mt-1.5 flex-shrink-0 h-2 w-2 rounded-full shadow-sm transition-all duration-300", !n.is_read ? "bg-blue-500 shadow-blue-500/50" : "bg-transparent")} />
                <div className="flex-1 space-y-1.5">
                  <p className={cn("text-sm font-medium leading-none", !n.is_read ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-600 dark:text-neutral-400")}>
                    {n.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    {new Date(n.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                {!n.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-blue-500 hover:text-white hover:bg-blue-500 transition-all duration-300 flex-shrink-0 rounded-full group/btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(n.id);
                    }}
                    title="Marcar como lida"
                  >
                    <CheckIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                  </Button>
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
