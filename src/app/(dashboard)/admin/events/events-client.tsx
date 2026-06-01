"use client";

import React, { useState } from "react";
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
import { MagicCard } from "@/components/ui/magic-card";
import { BlurFade } from "@/components/ui/blur-fade";

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
      // Aqui faríamos um re-fetch ou otimisticamente atualizaríamos o estado,
      // Como a action usa revalidatePath, a página será atualizada de qualquer forma.
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Eventos e Avisos</h2>
        <div className="flex items-center space-x-2">
          
          <Dialog open={isEventOpen} onOpenChange={setIsEventOpen}>
            <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20" />}>
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
            <DialogTrigger render={<Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500/10" />}>
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

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Calendário de Eventos</TabsTrigger>
          <TabsTrigger value="notices">Mural de Avisos</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground p-8">
                Nenhum evento programado.
              </div>
            ) : (
              events.map((evt, index) => (
                <BlurFade key={evt.id} delay={0.1 * index} inView>
                  <MagicCard className="cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="bg-blue-500/10 text-blue-500 p-2 rounded-full">
                          <CalendarIcon className="h-5 w-5" />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                          {new Date(evt.event_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <CardTitle className="mt-4">{evt.title}</CardTitle>
                      <CardDescription>{evt.type.toUpperCase()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {evt.description || "Sem descrição."}
                      </p>
                    </CardContent>
                  </MagicCard>
                </BlurFade>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="notices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {announcements.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground p-8">
                Nenhum aviso no mural.
              </div>
            ) : (
              announcements.map((notice, index) => (
                <BlurFade key={notice.id} delay={0.1 * index} inView>
                  <Card className={`border-l-4 ${notice.importance === 'urgent' ? 'border-l-red-500' : notice.importance === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {notice.importance === 'urgent' ? (
                          <BellRingIcon className="h-4 w-4 text-red-500" />
                        ) : (
                          <MegaphoneIcon className="h-4 w-4 text-zinc-500" />
                        )}
                        <CardTitle className="text-lg">{notice.title}</CardTitle>
                      </div>
                      <CardDescription>Publicado em {new Date(notice.created_at).toLocaleDateString('pt-BR')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{notice.message}</p>
                    </CardContent>
                  </Card>
                </BlurFade>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
