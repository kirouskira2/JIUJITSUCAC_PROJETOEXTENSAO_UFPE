"use server";

import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

// Configure web-push with VAPID keys
// Estes valores devem vir do .env.local
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidEmail = "mailto:suporte@jiujitsucac.com"; // Change to valid email

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn("VAPID keys not configured. Web Push will not work.");
}

export async function broadcastPushNotification(title: string, body: string, url: string = "/") {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn("Skipping push notification: VAPID keys missing.");
      return { success: false, error: "VAPID missing" };
    }

    const supabase = await createClient();
    
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
