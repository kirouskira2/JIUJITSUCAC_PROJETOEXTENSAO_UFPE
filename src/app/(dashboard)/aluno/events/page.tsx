import { Metadata } from "next";
import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { listEvents, listAnnouncements } from "@/actions/events";
import Link from "next/link";
import { IconArrowLeft, IconCalendarEvent, IconSpeakerphone, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Eventos e Avisos | JJCAC",
};

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch { return dateStr; }
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  tournament: "Campeonato",
  graduation: "Graduação",
  seminar: "Seminário",
  other: "Evento",
};

const IMPORTANCE_STYLES: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  urgent: { bg: "bg-red-500/5", border: "border-red-500/20", icon: "text-red-500", badge: "bg-red-500/10 text-red-500" },
  warning: { bg: "bg-amber-500/5", border: "border-amber-500/20", icon: "text-amber-500", badge: "bg-amber-500/10 text-amber-500" },
  info: { bg: "bg-blue-500/5", border: "border-blue-500/20", icon: "text-blue-500", badge: "bg-blue-500/10 text-blue-500" },
};

export default async function AlunoEventsPage() {
  const { data: sessionData } = await getSession();
  if (!sessionData?.profile) redirect("/login");

  const [eventsRes, announcementsRes] = await Promise.all([listEvents(), listAnnouncements()]);
  const events = eventsRes.success && eventsRes.data ? eventsRes.data : [];
  const announcements = announcementsRes.success && announcementsRes.data ? announcementsRes.data : [];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-6 px-4 md:px-0">
      <div className="flex items-center gap-4 pb-4 border-b border-neutral-200 dark:border-[#2C2C2E]">
        <Link
          href="/aluno"
          className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors hover:border-red-500 bg-white dark:bg-[#1C1C1E] border-neutral-200 dark:border-[#2C2C2E] text-red-600"
        >
          <IconArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tighter text-neutral-900 dark:text-[#F2F2F7]">
            Eventos e Avisos
          </h1>
          <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">
            Fique por dentro de tudo que acontece no projeto.
          </p>
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-lg font-black uppercase text-neutral-900 dark:text-[#F2F2F7] flex items-center gap-2">
            <IconSpeakerphone className="w-5 h-5 text-red-600 dark:text-red-500" />
            Avisos
          </h3>
          {announcements.map((a) => {
            const style = IMPORTANCE_STYLES[a.importance] || IMPORTANCE_STYLES.info;
            return (
              <div key={a.id} className={`rounded-xl border p-4 ${style.bg} ${style.border}`}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {a.importance === "urgent" ? (
                      <IconAlertTriangle className={`w-5 h-5 ${style.icon}`} />
                    ) : (
                      <IconInfoCircle className={`w-5 h-5 ${style.icon}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-[#F2F2F7]">{a.title}</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badge}`}>
                        {a.importance === "urgent" ? "Urgente" : a.importance === "warning" ? "Atenção" : "Info"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-[#8E8E93] mt-1 leading-relaxed">{a.message}</p>
                    <span className="text-[10px] text-neutral-400 dark:text-[#636366] mt-2 block">{formatDate(a.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Events */}
      {events.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-lg font-black uppercase text-neutral-900 dark:text-[#F2F2F7] flex items-center gap-2">
            <IconCalendarEvent className="w-5 h-5 text-red-600 dark:text-red-500" />
            Próximos Eventos
          </h3>
          {events.map((e) => (
            <div key={e.id} className="rounded-xl border border-neutral-200 dark:border-[#2C2C2E] p-4 bg-white dark:bg-[#111111]">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <IconCalendarEvent className="w-5 h-5 text-red-600 dark:text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-[#F2F2F7]">{e.title}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1C1C1E] text-neutral-500">
                      {EVENT_TYPE_LABELS[e.type] || e.type}
                    </span>
                  </div>
                  {e.description && (
                    <p className="text-xs text-neutral-600 dark:text-[#8E8E93] mt-1 leading-relaxed">{e.description}</p>
                  )}
                  <span className="text-[10px] text-neutral-400 dark:text-[#636366] mt-2 block">📅 {formatDate(e.event_date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {events.length === 0 && announcements.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-[#2C2C2E] p-8 text-center flex flex-col items-center gap-2 bg-neutral-50/50 dark:bg-black/20">
          <IconSpeakerphone className="w-8 h-8 text-neutral-400 dark:text-[#8E8E93]" />
          <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">Nenhum aviso ou evento no momento.</p>
        </div>
      )}
    </div>
  );
}
