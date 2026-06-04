import { listEvents, listAnnouncements, type Event, type Announcement } from "@/actions/events";
import { IconCalendarEvent, IconSpeakerphone, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatRelative(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    if (days < 7) return `${days} dias atrás`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
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

export async function EventsFeed() {
  const [eventsRes, announcementsRes] = await Promise.all([
    listEvents(),
    listAnnouncements(),
  ]);

  const events = eventsRes.success && eventsRes.data ? eventsRes.data : [];
  const announcements = announcementsRes.success && announcementsRes.data ? announcementsRes.data : [];

  // Combinar e ordenar por data mais recente
  type FeedItem = 
    | { kind: "event"; data: Event; sortDate: string }
    | { kind: "announcement"; data: Announcement; sortDate: string };

  const feed: FeedItem[] = [
    ...events.map((e) => ({ kind: "event" as const, data: e, sortDate: e.event_date })),
    ...announcements.map((a) => ({ kind: "announcement" as const, data: a, sortDate: a.created_at })),
  ].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());

  if (feed.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-[#2C2C2E] p-6 text-center flex flex-col items-center justify-center gap-2 bg-neutral-50/50 dark:bg-black/20">
        <IconSpeakerphone className="w-8 h-8 text-neutral-400 dark:text-[#8E8E93]" />
        <p className="text-sm text-neutral-500 dark:text-[#8E8E93]">
          Nenhum aviso ou evento no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7] flex items-center gap-2">
        <IconSpeakerphone className="w-5 h-5 text-red-600 dark:text-red-500" />
        Mural de Avisos
      </h3>

      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
        {feed.slice(0, 8).map((item) => {
          if (item.kind === "announcement") {
            const a = item.data;
            const style = IMPORTANCE_STYLES[a.importance] || IMPORTANCE_STYLES.info;
            return (
              <div
                key={`ann-${a.id}`}
                className={`rounded-xl border p-4 ${style.bg} ${style.border} transition-colors`}
              >
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
                    <p className="text-xs text-neutral-600 dark:text-[#8E8E93] mt-1 leading-relaxed line-clamp-3">{a.message}</p>
                    <span className="text-[10px] text-neutral-400 dark:text-[#636366] mt-2 block">{formatRelative(a.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          }

          const e = item.data;
          return (
            <div
              key={`evt-${e.id}`}
              className="rounded-xl border border-neutral-200 dark:border-[#2C2C2E] p-4 bg-white dark:bg-[#111111] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <IconCalendarEvent className="w-5 h-5 text-red-600 dark:text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-[#F2F2F7]">{e.title}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1C1C1E] text-neutral-500 dark:text-[#8E8E93]">
                      {EVENT_TYPE_LABELS[e.type] || e.type}
                    </span>
                  </div>
                  {e.description && (
                    <p className="text-xs text-neutral-600 dark:text-[#8E8E93] mt-1 leading-relaxed line-clamp-2">{e.description}</p>
                  )}
                  <span className="text-[10px] text-neutral-400 dark:text-[#636366] mt-2 block">
                    📅 {formatDate(e.event_date)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
