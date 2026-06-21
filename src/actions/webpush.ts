"use server";

import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

const vapidEmail = "mailto:suporte@jiujitsucac.com";

/**
 * Retorna a chave pública VAPID para uso no Service Worker.
 * Lê da variável de ambiente NEXT_PUBLIC_VAPID_PUBLIC_KEY.
 * 
 * Nota: Essa function é uma server action chamada pelo client para obter a
 * chave pública. Embora a env var seja NEXT_PUBLIC_ (acessível no client),
 * manter a server action como wrapper garante retrocompatibilidade com o
 * componente NotificationPermission existente.
 */
export async function getVapidPublicKey(): Promise<string | null> {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
}

/**
 * Dispara notificações push para todos os usuários inscritos.
 * 
 * As chaves VAPID são lidas de variáveis de ambiente (melhor prática):
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY: chave pública (exposta ao browser)
 * - VAPID_PRIVATE_KEY: chave privada (apenas server-side)
 * 
 * Isso elimina a necessidade de queries ao banco para obter as chaves,
 * tornando o push independente de RLS/policies e de roles do usuário.
 */
export async function broadcastPushNotification(title: string, body: string, url: string = "/") {
  try {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn("Skipping push notification: VAPID keys missing in environment variables.");
      return { success: false, error: "VAPID missing" };
    }

    // Configurar o web-push com as chaves VAPID
    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

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
