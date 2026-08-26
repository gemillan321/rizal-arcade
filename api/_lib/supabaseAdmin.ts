import { randomInt } from "node:crypto";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function getAdminClient() {
  const url = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.trim().replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) throw new Error("The server-side Supabase environment variables are missing.");
  if (!adminClient) {
    adminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return adminClient;
}

export function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) throw new Response(JSON.stringify({ error: "Admin sign-in required." }), { status: 401 });
  const supabase = getAdminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Response(JSON.stringify({ error: "The admin session is invalid or expired." }), { status: 401 });
  const { data: profile } = await supabase.from("rizal_arcade_profiles").select("role,active").eq("id", data.user.id).single();
  if (!profile || profile.role !== "admin" || !profile.active) throw new Response(JSON.stringify({ error: "This account is not a Rizal Arcade administrator." }), { status: 403 });
  return { supabase, user: data.user };
}

export function studentAuthEmail(studentId: string) {
  const localPart = studentId.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  if (!localPart) throw new Error("A valid Student ID is required.");
  return `${localPart}@students.rizal-arcade.invalid`;
}

export function temporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const take = () => alphabet[randomInt(0, alphabet.length)];
  return `Ra${take()}!${Array.from({ length: 8 }, take).join("")}`;
}

export async function findAuthUserByEmail(supabase: SupabaseClient, email: string): Promise<User | null> {
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const users = data.users as User[];
    const found = users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (users.length < 1000) return null;
  }
  return null;
}

export async function handleApiError(error: unknown) {
  if (error instanceof Response) return error;
  console.error("[admin-api] request failed", error);
  const message = error instanceof Error ? error.message : "The request could not be completed.";
  return json({ error: message }, 500);
}
