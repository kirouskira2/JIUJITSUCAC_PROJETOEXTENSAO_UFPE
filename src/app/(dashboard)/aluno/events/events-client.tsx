"use client";

import React, { useState } from "react";
import { Event, Announcement } from "@/actions/events";
import { CalendarIcon, BellRingIcon, MegaphoneIcon } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";

export function StudentEventsClient({ 
  events, 
  announcements
}: { 
  events: Event[], 
  announcements: Announcement[]
}) {
  const [activeTab, setActiveTab] = useState<"events" | "notices">("events");

  const importanceBadge = (importance: string) => {
    if (importance === "urgent") return { label: "URGENTE", cls: "bg-red-500/10 text-red-500 border-red-500/20" };
    if (importance === "warning") return { label: "ATENÇÃO", cls: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" };
    return { label: "AVISO", cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
  };

  const borderColor = (importance: string) => {
    if (importance === "urgent") return "border-l-red-500";
    if (importance === "warning") return "border-l-yellow-500";
    return "border-l-blue-500";
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 py-6">

      {/* === Header === */}
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
          Eventos &amp; Avisos
        </h1>
        <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">
          Fique por dentro das novidades e acontecimentos da academia.
        </p>
      </div>

      {/* === Tabs customizadas === */}
      <div className="flex gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-[#1C1C1E] border border-border">
        <button
          onClick={() => setActiveTab("events")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === "events"
              ? "bg-surface-container text-neutral-900 dark:text-[#F2F2F7] shadow-sm border border-border"
              : "text-neutral-500 dark:text-[#8E8E93] hover:text-neutral-700 dark:hover:text-[#EBEBF5]"
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Calendário de Eventos
          {events.length > 0 && (
            <span className="ml-1 text-[10px] font-bold bg-red-600 text-white rounded-full px-1.5 py-0.5 leading-none">
              {events.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("notices")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === "notices"
              ? "bg-surface-container text-neutral-900 dark:text-[#F2F2F7] shadow-sm border border-border"
              : "text-neutral-500 dark:text-[#8E8E93] hover:text-neutral-700 dark:hover:text-[#EBEBF5]"
          }`}
        >
          <MegaphoneIcon className="w-4 h-4" />
          Mural de Avisos
          {announcements.length > 0 && (
            <span className="ml-1 text-[10px] font-bold bg-red-600 text-white rounded-full px-1.5 py-0.5 leading-none">
              {announcements.length}
            </span>
          )}
        </button>
      </div>

      {/* === Calendário de Eventos === */}
      {activeTab === "events" && (
        <div>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center rounded-3xl border border-dashed border-border bg-neutral-50 dark:bg-[#111111]">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-[#1C1C1E]">
                <CalendarIcon className="w-7 h-7 text-neutral-400 dark:text-[#48484A]" />
              </div>
              <p className="text-sm font-semibold text-neutral-500 dark:text-[#8E8E93]">Nenhum evento programado</p>
              <p className="text-xs text-neutral-400 dark:text-[#636366]">Novos eventos aparecerão aqui quando forem criados.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((evt, index) => (
                <BlurFade key={evt.id} delay={0.08 * index} inView>
                  <div className="group rounded-3xl border border-border bg-surface-container p-5 flex flex-col gap-4 hover:border-red-500/40 transition-colors h-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-5 h-5 text-red-600 dark:text-red-500" />
                      </div>
                      <span className="text-xs font-mono font-bold text-neutral-500 dark:text-[#8E8E93] bg-neutral-100 dark:bg-[#1C1C1E] border border-border px-2 py-1 rounded-lg whitespace-nowrap">
                        {new Date(evt.event_date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
                        {evt.type.toUpperCase()}
                      </span>
                      <h3 className="font-display font-black text-lg uppercase leading-tight text-neutral-900 dark:text-[#F2F2F7]">
                        {evt.title}
                      </h3>
                      {evt.description && (
                        <p className="text-sm text-neutral-500 dark:text-[#8E8E93] leading-relaxed line-clamp-3 mt-1">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === Mural de Avisos === */}
      {activeTab === "notices" && (
        <div>
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center rounded-3xl border border-dashed border-border bg-neutral-50 dark:bg-[#111111]">
              <div className="w-14 h-14 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-[#1C1C1E]">
                <MegaphoneIcon className="w-7 h-7 text-neutral-400 dark:text-[#48484A]" />
              </div>
              <p className="text-sm font-semibold text-neutral-500 dark:text-[#8E8E93]">Nenhum aviso no mural</p>
              <p className="text-xs text-neutral-400 dark:text-[#636366]">Avisos da academia aparecerão aqui.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {announcements.map((notice, index) => {
                const badge = importanceBadge(notice.importance);
                return (
                  <BlurFade key={notice.id} delay={0.08 * index} inView>
                    <div className={`rounded-3xl border-l-4 border border-border bg-surface-container p-5 flex items-start gap-4 ${borderColor(notice.importance)}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${badge.cls}`}>
                        {notice.importance === "urgent" ? (
                          <BellRingIcon className="w-4 h-4" />
                        ) : (
                          <MegaphoneIcon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${badge.cls}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-[#636366]">
                            {new Date(notice.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <h4 className="font-display font-black text-base uppercase leading-snug text-neutral-900 dark:text-[#F2F2F7] mb-1">
                          {notice.title}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-[#8E8E93] leading-relaxed">
                          {notice.message}
                        </p>
                      </div>
                    </div>
                  </BlurFade>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
