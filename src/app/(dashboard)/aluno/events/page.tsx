import { Metadata } from "next";
import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { listEvents, listAnnouncements } from "@/actions/events";
import { StudentEventsClient } from "./events-client";

export const metadata: Metadata = {
  title: "Eventos e Avisos | JJCAC",
};

export default async function StudentEventsPage() {
  const sessionData = await getSession();

  if (!sessionData.success || !sessionData.data) {
    redirect("/auth/login");
  }

  const eventsRes = await listEvents();
  const announcementsRes = await listAnnouncements();

  const events = eventsRes.success && eventsRes.data ? eventsRes.data : [];
  const announcements = announcementsRes.success && announcementsRes.data ? announcementsRes.data : [];

  return <StudentEventsClient events={events} announcements={announcements} />;
}
