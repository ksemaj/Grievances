// supabase/functions/notify-discord/index.ts
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders() });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders() });

  try {
    const { userId, type, title, description } = await req.json();
    const webhook = Deno.env.get("DISCORD_WEBHOOK_URL");
    if (!webhook) return new Response("Missing webhook", { status: 500, headers: corsHeaders() });

    const base = title ? `New grievance: ${title}` : "A new grievance was submitted.";
    const extra = description ? `\n> ${description}` : "";
    const content =
      type === "attention"
        ? `<@${userId}> 🚨 ATTENTION NEEDED 🚨\n${base}${extra}`
        : `<@${userId}> ${base}${extra}`;

    const payload: any = {
      content,
      // Only allow mentioning the provided userId (prevents @everyone)
      allowed_mentions: { parse: [], users: [userId] }
    };

    const resp = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    return new Response(text || "ok", { status: resp.status, headers: corsHeaders() });
  } catch (e) {
    return new Response(`Bad Request: ${e}`, { status: 400, headers: corsHeaders() });
  }
});
