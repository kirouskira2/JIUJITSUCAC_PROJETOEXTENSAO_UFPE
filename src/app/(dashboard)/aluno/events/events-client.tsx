"use client";

import React from "react";
import { Event, Announcement } from "@/actions/events";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, BellRingIcon, MegaphoneIcon } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";
import { BlurFade } from "@/components/ui/blur-fade";

export function StudentEventsClient({ 
  events, 
  announcements
}: { 
  events: Event[], 
  announcements: Announcement[]
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Eventos e Avisos</h2>
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
