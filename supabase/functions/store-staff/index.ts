// خطوة التوصيل — supermarket staff logins, created by the owner from the admin.
// Only an admin may call this. It uses the service key that Supabase gives every function
// (never shown in any page). Actions:
//   create   {email, password, name}  → new staff login + store_staff row
//   password {user_id, password}      → new password, ONLY for logins listed in store_staff
import { createClient } from "npm:@supabase/supabase-js@2.117.1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    // 1) the caller must be an admin (checked with the caller's own login)
    const caller = createClient(url, anon, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
      auth: { persistSession: false },
    });
    const { data: isAdmin, error: e1 } = await caller.rpc("is_admin");
    if (e1 || isAdmin !== true) return json({ error: "not allowed" }, 403);

    const body = await req.json().catch(() => ({}));
    const admin = createClient(url, service, { auth: { persistSession: false } });

    if (body.action === "create") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      const name = String(body.name ?? "").trim().slice(0, 60);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "bad email" }, 400);
      if (password.length < 8) return json({ error: "password too short" }, 400);
      const { data, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { role: "store_staff", name },
      });
      if (error || !data?.user) return json({ error: error?.message ?? "could not create" }, 400);
      const { error: e2 } = await admin.from("store_staff").insert({ user_id: data.user.id, name, email });
      if (e2) {
        await admin.auth.admin.deleteUser(data.user.id); // undo the half-made login
        return json({ error: e2.message }, 400);
      }
      return json({ ok: true, user_id: data.user.id });
    }

    if (body.action === "password") {
      const uid = String(body.user_id ?? "");
      const password = String(body.password ?? "");
      if (password.length < 8) return json({ error: "password too short" }, 400);
      const { data: row } = await admin.from("store_staff").select("user_id").eq("user_id", uid).maybeSingle();
      if (!row) return json({ error: "not a staff account" }, 404); // never touches the owner's or anyone else's login
      const { error } = await admin.auth.admin.updateUserById(uid, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "unknown action" }, 400);
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
