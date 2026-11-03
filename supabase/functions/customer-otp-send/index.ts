// customer-otp-send — sends a 6-digit login code to a customer's WhatsApp (security step C).
// The browser posts { phone, device }. The database (customer_otp_create, service role only) makes the code and
// applies all limits; this function only delivers it with the approved AUTHENTICATION template and never returns
// the code to the browser. Separate from the CRM / WhatsApp functions (whatsapp-*, wa-*): own name, own token.
//
// Secrets (Supabase → Project Settings → Edge Functions → Secrets), set by the owner, never in code:
//   WA_OTP_TOKEN      Meta system-user token (whatsapp_business_messaging)
//   WA_OTP_PHONE_ID   Phone number ID of the number that sends the codes
//   WA_OTP_TEMPLATE   optional, default ds_login_code      WA_OTP_LANG  optional, default ar
import { createClient } from "npm:@supabase/supabase-js@2";

const ORIGINS = ["https://deliverystep.app", "https://www.deliverystep.app"];
const GRAPH = "https://graph.facebook.com/v21.0";

function cors(req: Request) {
  const o = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.includes(o) ? o : ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
const json = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, { ok: false, why: "method" }, 405);

  const token = Deno.env.get("WA_OTP_TOKEN"), phoneId = Deno.env.get("WA_OTP_PHONE_ID");
  if (!token || !phoneId) return json(req, { ok: false, why: "not_configured" });

  let body: { phone?: string; device?: string } = {};
  try { body = await req.json(); } catch { return json(req, { ok: false, why: "bad_phone" }); }
  const ip = (req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb.rpc("customer_otp_create", {
    p_phone: String(body.phone ?? "").slice(0, 32), p_ip: ip || null, p_device: String(body.device ?? "").slice(0, 64) || null,
  });
  if (error) { console.error("otp_create", error.message); return json(req, { ok: false, why: "error" }); }
  if (!data?.ok) return json(req, { ok: false, why: data?.why ?? "error", seconds: data?.seconds });

  const code = String(data.code);
  const r = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: data.to,
      type: "template",
      template: {
        name: Deno.env.get("WA_OTP_TEMPLATE") ?? "ds_login_code",
        language: { code: Deno.env.get("WA_OTP_LANG") ?? "ar" },
        components: [
          { type: "body", parameters: [{ type: "text", text: code }] },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] },
        ],
      },
    }),
  });
  if (!r.ok) {   // log Meta's error, never the code or the phone
    let why = ""; try { const e = await r.json(); why = `${e?.error?.code ?? ""} ${e?.error?.message ?? ""}`; } catch { /* ignore */ }
    console.error("wa_send", r.status, why.slice(0, 200));
    return json(req, { ok: false, why: "send_failed" });
  }
  return json(req, { ok: true });
});
