"use client";

import React, { useState, useMemo } from "react";
import { Event, Announcement, createEvent, createAnnouncement } from "@/actions/events";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, BellRingIcon, PlusIcon, MegaphoneIcon } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { IconSearch } from "@tabler/icons-react";

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
      window.location.reload(); 
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
      window.location.reload(); 
    } else {
      toast.error(res.error || "Erro ao criar aviso");
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
            <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 h-[44px]" />}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Novo Evento
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Evento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Evento</Label>
                  <Input id="title" name="title" required placeholder="Ex: Torneio Interno" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input id="description" name="description" placeholder="Opcional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_date">Data e Hora</Label>
                  <Input id="event_date" name="event_date" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select name="type" defaultValue="other" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tournament">Torneio</SelectItem>
                      <SelectItem value="graduation">Graduação</SelectItem>
                      <SelectItem value="seminar">Seminário</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Criando..." : "Criar Evento"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isNoticeOpen} onOpenChange={setIsNoticeOpen}>
            <DialogTrigger render={<Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500/10 h-[44px]" />}>
              <MegaphoneIcon className="mr-2 h-4 w-4" />
              Novo Aviso
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Aviso no Mural</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateNotice} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Aviso</Label>
                  <Input id="title" name="title" required placeholder="Ex: Mudança de Horário" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Input id="message" name="message" required placeholder="Detalhes do aviso..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="importance">Importância</Label>
                  <Select name="importance" defaultValue="info" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a importância" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informativo</SelectItem>
                      <SelectItem value="warning">Atenção</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Criando..." : "Publicar Aviso"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Unified Filters (Like Reports) */}
      <div className="rounded-2xl border p-6 relative overflow-hidden group transition-colors bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#2C2C2E]">
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
              className="w-full h-12 rounded-lg px-4 text-sm font-medium outline-none border transition-colors bg-neutral-100 dark:bg-[#0F0F0F] border-neutral-200 dark:border-[#2C2C2E] text-neutral-900 dark:text-[#F2F2F7] focus:border-blue-600 dark:focus:border-[#0A84FF]"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="bg-neutral-100 dark:bg-[#0F0F0F] border border-neutral-200 dark:border-[#2C2C2E]">
          <TabsTrigger value="events">Calendário de Eventos</TabsTrigger>
          <TabsTrigger value="notices">Mural de Avisos</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground p-12 bg-white/50 dark:bg-black/20 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                Nenhum evento encontrado.
              </div>
            ) : (
              filteredEvents.map((evt, index) => (
                <BlurFade key={evt.id} delay={0.1 * index} inView>
                  <div className="bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#2C2C2E] rounded-2xl p-6 relative w-full h-full flex flex-col hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                    <div className="flex justify-between items-start mb-4">
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
              <div className="col-span-full text-center text-muted-foreground p-12 bg-white/50 dark:bg-black/20 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                Nenhum aviso encontrado.
              </div>
            ) : (
              filteredAnnouncements.map((notice, index) => (
                <BlurFade key={notice.id} delay={0.1 * index} inView>
                  <div className={`bg-white dark:bg-[#111111] border border-neutral-200 dark:border-[#2C2C2E] border-l-4 ${notice.importance === 'urgent' ? 'border-l-red-500' : notice.importance === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500'} rounded-2xl p-6 relative w-full h-full flex flex-col`}>
                    <div className="flex items-center gap-3 mb-2">
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
                    <div className="bg-neutral-50 dark:bg-[#1C1C1E] rounded-xl p-4 border border-neutral-100 dark:border-[#2C2C2E] flex-1">
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
