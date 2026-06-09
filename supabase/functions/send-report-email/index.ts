import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "junsik3848@gmail.com";
const POST_TYPE_LABEL: Record<string, string> = {
  catch: "조과 게시글",
  market: "장터 게시글",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { postId, postType, reason, detail, reporterUserId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: reporter } = await supabase
      .from("users")
      .select("username")
      .eq("id", reporterUserId)
      .single();

    const postUrl = `https://lunker-app-omega.vercel.app/${postType === "market" ? "market" : "post"}/${postId}`;
    const typeLabel = POST_TYPE_LABEL[postType] ?? postType;
    const reporterName = reporter?.username ?? reporterUserId;

    const html = `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#131313;color:#e5e2e1;border-radius:12px;">
  <h2 style="color:#00e1ab;margin-top:0;">🚨 LUNKER 신고 접수</h2>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:8px 0;color:#83958c;width:100px;">게시글 유형</td><td style="padding:8px 0;">${typeLabel}</td></tr>
    <tr><td style="padding:8px 0;color:#83958c;">신고 사유</td><td style="padding:8px 0;color:#ffb4ab;font-weight:bold;">${reason}</td></tr>
    <tr><td style="padding:8px 0;color:#83958c;">신고자</td><td style="padding:8px 0;">${reporterName}</td></tr>
    <tr><td style="padding:8px 0;color:#83958c;">상세 내용</td><td style="padding:8px 0;">${detail ?? "(없음)"}</td></tr>
    <tr><td style="padding:8px 0;color:#83958c;">게시글 ID</td><td style="padding:8px 0;font-size:12px;color:#83958c;">${postId}</td></tr>
  </table>
  <a href="${postUrl}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#00e1ab;color:#003828;font-weight:bold;text-decoration:none;border-radius:8px;">게시글 바로가기</a>
</div>`;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not set");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LUNKER 신고 시스템 <onboarding@resend.dev>",
        to: ADMIN_EMAIL,
        subject: `[LUNKER 신고] ${typeLabel} - ${reason}`,
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
