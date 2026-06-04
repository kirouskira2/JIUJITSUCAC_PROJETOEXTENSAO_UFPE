"use client";

import React, { useState, useMemo } from "react";
import { Event, Announcement, createEvent, createAnnouncement, deleteEvent, deleteAnnouncement } from "@/actions/events";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, BellRingIcon, PlusIcon, MegaphoneIcon, Trash2Icon } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export function EventsClient({ 
  initialEvents, 
  initialAnnouncements,
  profileId 
}: { 
  initialEvents: Event[], 
  initialAnnouncements: Announcement[],
  profileId: string
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = useMemo(() => {
    return events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [events, searchTerm]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [announcements, searchTerm]);

  async function handleCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      event_date: new Date(formData.get("event_date") as string).toISOString(),
      type: formData.get("type") as "tournament" | "graduation" | "seminar" | "other"
    };

    const res = await createEvent(eventData);
    if (res.success) {
      toast.success("Evento criado com sucesso!");
      setIsEventOpen(false);
      router.refresh(); 
    } else {
      toast.error(res.error || "Erro ao criar evento");
    }
    setLoading(false);
  }

  async function handleCreateNotice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title: formData.get("title") as string,
      message: formData.get("message") as string,
      importance: formData.get("importance") as "info" | "warning" | "urgent"
    };

    const res = await createAnnouncement(data);
    if (res.success) {
      toast.success("Aviso criado com sucesso!");
      setIsNoticeOpen(false);
      router.refresh(); 
    } else {
      toast.error(res.error || "Erro ao criar aviso");
    }
    setLoading(false);
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Tem certeza que deseja apagar este evento?")) return;
    setLoading(true);
    const res = await deleteEvent(id);
    if (res.success) {
      toast.success("Evento apagado com sucesso!");
      setEvents(events.filter(e => e.id !== id));
    } else {
      toast.error(res.error || "Erro ao apagar evento");
    }
    setLoading(false);
  }

  async function handleDeleteNotice(id: string) {
    if (!confirm("Tem certeza que deseja apagar este aviso?")) return;
    setLoading(true);
    const res = await deleteAnnouncement(id);
    if (res.success) {
      toast.success("Aviso apagado com sucesso!");
      setAnnouncements(announcements.filter(a => a.id !== id));
    } else {
      toast.error(res.error || "Erro ao apagar aviso");
    }
    setLoading(false);
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">
            Eventos e Avisos
          </h1>
          <p className="text-sm mt-1 text-neutral-500 dark:text-[#8E8E93]">
            Gerencie o calendário e mural de recados da equipe.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Dialog open={isEventOpen} onOpenChange={setIsEventOpen}>
            <DialogTrigger render={<button className="inline-flex items-center gap-2 h-11 px-5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20" />}>
              <PlusIcon className="h-4 w-4" />
              Novo Evento
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-black uppercase text-neutral-900 dark:text-white">Criar Novo Evento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ev-title" className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">Título do Evento</label>
                  <input id="ev-title" name="title" required placeholder="Ex: Torneio Interno"
                    className="h-12 w-full rounded-xl px-4 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600 placeholder:text-neutral-400 dark:placeholder:text-[#636366]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ev-desc" className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">Descrição</label>
                  <input id="ev-desc" name="description" placeholder="Opcional"
                    className="h-12 w-full rounded-xl px-4 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600 placeholder:text-neutral-400 dark:placeholder:text-[#636366]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ev-date" className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">Data e Hora</label>
                  <input id="ev-date" name="event_date" type="datetime-local" required
                    className="h-12 w-full rounded-xl px-4 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ev-type" className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">Tipo</label>
                  <select name="type" id="ev-type" defaultValue="other" required
                    className="h-12 w-full rounded-xl px-3 pr-8 text-sm font-medium outline-none border appearance-none cursor-pointer transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-red-600 dark:focus:border-red-600"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                  >
                    <option value="tournament">Torneio</option>
                    <option value="graduation">Graduação</option>
                    <option value="seminar">Seminário</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <button type="submit" disabled={loading}
                  className="h-12 w-full rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors mt-1"
                >
                  {loading ? "Criando..." : "Criar Evento"}
                </button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isNoticeOpen} onOpenChange={setIsNoticeOpen}>
            <DialogTrigger render={<button className="inline-flex items-center gap-2 h-11 px-5 rounded-xl font-bold text-sm text-blue-500 bg-blue-500/10 border border-blue-500 hover:bg-blue-500/20 transition-colors" />}>
              <MegaphoneIcon className="h-4 w-4" />
              Novo Aviso
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-black uppercase text-neutral-900 dark:text-white">Criar Aviso no Mural</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateNotice} className="flex flex-col gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="no-title" className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">Título do Aviso</label>
                  <input id="no-title" name="title" required placeholder="Ex: Mudança de Horário"
                    className="h-12 w-full rounded-xl px-4 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-blue-600 dark:focus:border-blue-600 placeholder:text-neutral-400 dark:placeholder:text-[#636366]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="no-msg" className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">Mensagem</label>
                  <input id="no-msg" name="message" required placeholder="Detalhes do aviso..."
                    className="h-12 w-full rounded-xl px-4 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-blue-600 dark:focus:border-blue-600 placeholder:text-neutral-400 dark:placeholder:text-[#636366]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="no-imp" className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-[#8E8E93]">Importância</label>
                  <select name="importance" id="no-imp" defaultValue="info" required
                    className="h-12 w-full rounded-xl px-3 pr-8 text-sm font-medium outline-none border appearance-none cursor-pointer transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-blue-600 dark:focus:border-blue-600"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                  >
                    <option value="info">Informativo</option>
                    <option value="warning">Atenção</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <button type="submit" disabled={loading}
                  className="h-12 w-full rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors mt-1"
                >
                  {loading ? "Criando..." : "Publicar Aviso"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Unified Filters (Like Reports) */}
      <div className="rounded-3xl border p-6 relative overflow-hidden group transition-colors bg-surface-container border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-[#0A84FF]">
            <IconSearch className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-xl uppercase tracking-tight text-neutral-900 dark:text-[#F2F2F7]">Busca</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider ml-1 text-neutral-500 dark:text-[#8E8E93]">Buscar por título</label>
            <input 
              type="text"
              placeholder="Digite o que procura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 rounded-lg px-4 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-border text-neutral-900 dark:text-[#F2F2F7] focus:border-blue-600 dark:focus:border-[#0A84FF]"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="bg-neutral-100 dark:bg-[#0F0F0F] border border-border">
          <TabsTrigger value="events">Calendário de Eventos</TabsTrigger>
          <TabsTrigger value="notices">Mural de Avisos</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground p-12 bg-surface-container rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
                Nenhum evento encontrado.
              </div>
            ) : (
              filteredEvents.map((evt, index) => (
                <BlurFade key={evt.id} delay={0.1 * index} inView>
                  <div className="bg-surface-container border border-border rounded-3xl p-6 relative w-full h-full flex flex-col hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors group">
                    <button 
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                      title="Apagar evento"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                    <div className="flex justify-between items-start mb-4 pr-10">
                      <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 p-2.5 rounded-full">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        {new Date(evt.event_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-neutral-900 dark:text-[#F2F2F7]">{evt.title}</h3>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 mt-1 mb-3">
                      {evt.type}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-[#8E8E93] leading-relaxed flex-1">
                      {evt.description || "Sem descrição."}
                    </p>
                  </div>
                </BlurFade>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="notices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredAnnouncements.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground p-12 bg-surface-container rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
                Nenhum aviso encontrado.
              </div>
            ) : (
              filteredAnnouncements.map((notice, index) => (
                <BlurFade key={notice.id} delay={0.1 * index} inView>
                  <div className={`bg-surface-container border border-border border-l-4 ${notice.importance === 'urgent' ? 'border-l-red-500' : notice.importance === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500'} rounded-2xl p-6 relative w-full h-full flex flex-col group`}>
                    <button 
                      onClick={() => handleDeleteNotice(notice.id)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                      title="Apagar aviso"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3 mb-2 pr-10">
                      <div className={`p-2 rounded-full ${notice.importance === 'urgent' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : notice.importance === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-500'}`}>
                        {notice.importance === 'urgent' ? (
                          <BellRingIcon className="h-5 w-5" />
                        ) : (
                          <MegaphoneIcon className="h-5 w-5" />
                        )}
                      </div>
                      <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-[#F2F2F7]">{notice.title}</h3>
                    </div>
                    <p className="text-xs text-neutral-400 dark:text-[#8E8E93] mb-4">
                      Publicado em {new Date(notice.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="bg-surface-container rounded-xl p-4 border border-neutral-100 dark:border-[#2C2C2E] flex-1">
                      <p className="text-sm text-neutral-600 dark:text-[#F2F2F7] leading-relaxed">
                        {notice.message}
                      </p>
                    </div>
                  </div>
                </BlurFade>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
