import { Metadata } from "next";
import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { listEvents, listAnnouncements } from "@/actions/events";
import { EventsClient } from "./events-client";

export const metadata: Metadata = {
  title: "Eventos e Avisos | JJCAC",
};

export default async function AdminEventsPage() {
  const sessionData = await getSession();

  if (!sessionData.success || !sessionData.data) {
    redirect("/auth/login");
  }

  const { profile } = sessionData.data;

  if (profile.role !== "admin") {
    redirect("/aluno");
  }

  const eventsRes = await listEvents();
  const announcementsRes = await listAnnouncements();

  const events = eventsRes.success && eventsRes.data ? eventsRes.data : [];
  const announcements = announcementsRes.success && announcementsRes.data ? announcementsRes.data : [];

  return <EventsClient initialEvents={events} initialAnnouncements={announcements} profileId={profile.id} />;
}
