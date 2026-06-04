"use server";

import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

const vapidEmail = "mailto:suporte@jiujitsucac.com"; // Change to valid email

export async function getVapidPublicKey(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", "vapid_public_key").single();
  return data?.value || null;
}

export async function broadcastPushNotification(title: string, body: string, url: string = "/") {
  try {
    const supabase = await createClient();
    
    // Obter as chaves do banco de dados
    const { data: pubData } = await supabase.from("app_settings").select("value").eq("key", "vapid_public_key").single();
    const { data: privData } = await supabase.from("app_settings").select("value").eq("key", "vapid_private_key").single();
    
    const vapidPublicKey = pubData?.value;
    const vapidPrivateKey = privData?.value;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn("Skipping push notification: VAPID keys missing in app_settings.");
      return { success: false, error: "VAPID missing" };
    }

    // Configurar o web-push dinamicamente
    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
    
    // Obter todas as inscrições válidas
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth");

    if (error) {
      console.error("Error fetching push subscriptions:", error);
      return { success: false, error: error.message };
    }

    if (!subscriptions || subscriptions.length === 0) {
      return { success: true, count: 0 };
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
      icon: "/logo.jpg"
    });

    let successCount = 0;

    // Disparar notificações em paralelo
    const promises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        successCount++;
      } catch (err: any) {
        console.error("Error sending push to endpoint:", sub.endpoint, err);
        // Se a inscrição expirou ou for inválida (Status 410 / 404), remova do banco
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    });

    await Promise.all(promises);

    return { success: true, count: successCount };
  } catch (error: any) {
    console.error("Broadcast push error:", error);
    return { success: false, error: error.message };
  }
}
