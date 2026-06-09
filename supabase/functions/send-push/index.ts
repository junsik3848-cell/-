import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT")!,
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

type NotifyType = "message" | "like" | "comment" | "follow";

const NOTIFY_FIELD: Record<NotifyType, string> = {
  message: "notify_messages",
  like: "notify_likes",
  comment: "notify_comments",
  follow: "notify_follows",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { targetUserId, type, title, body, url } = await req.json() as {
      targetUserId: string;
      type: NotifyType;
      title: string;
      body: string;
      url?: string;
    };

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const notifyField = NOTIFY_FIELD[type];
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", targetUserId)
      .eq(notifyField, true);

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const payload = JSON.stringify({ title, body, url: url ?? "/feed" });
    const results = await Promise.allSettled(
      subs.map((row) => webpush.sendNotification(row.subscription, payload))
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return new Response(JSON.stringify({ sent }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
