import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 });
    }

    // Tentar fazer upsert (ou insert ignorando conflito de endpoint)
    // O mais seguro é verificar se existe o endpoint, se sim atualizar o usuário, se não inserir.
    
    // Deleta inscrições antigas desse endpoint caso pertencesse a outro usuário
    await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);

    // Insere a nova
    const { error } = await supabase.from("push_subscriptions").insert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth
    });

    if (error) {
      console.error("Failed to save subscription to DB:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Push subscribe error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
