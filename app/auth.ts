import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

export type ArcadeRole = "admin" | "student";

export type ArcadeSection = {
  id: string;
  section_code: string;
  school_year: string;
  term: string;
};

export type ArcadeProfile = {
  id: string;
  role: ArcadeRole;
  student_id: string | null;
  first_name: string;
  last_name: string;
  display_name: string;
  must_change_password: boolean;
  active: boolean;
  section: ArcadeSection | null;
};

export type ArcadeAuthSnapshot = {
  session: Session;
  profile: ArcadeProfile;
};

const browserEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const supabaseUrl = browserEnv.VITE_SUPABASE_URL?.trim().replace(/\/$/, "");
const publishableKey = browserEnv.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const authConfigured = Boolean(supabaseUrl && publishableKey);

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabaseUrl || !publishableKey) throw new Error("The classroom login service is not configured yet.");
  if (!client) {
    client = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

export function studentLoginEmail(studentId: string) {
  const localPart = studentId.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  if (!localPart) throw new Error("Enter a valid Student ID.");
  return `${localPart}@students.rizal-arcade.invalid`;
}

function normalizeSection(value: unknown): ArcadeSection | null {
  const section = Array.isArray(value) ? value[0] : value;
  if (!section || typeof section !== "object") return null;
  const item = section as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.section_code !== "string") return null;
  return {
    id: item.id,
    section_code: item.section_code,
    school_year: typeof item.school_year === "string" ? item.school_year : "",
    term: typeof item.term === "string" ? item.term : "",
  };
}

export async function loadProfile(userId: string): Promise<ArcadeProfile> {
  const { data, error } = await getSupabaseClient()
    .from("rizal_arcade_profiles")
    .select("id,role,student_id,first_name,last_name,display_name,must_change_password,active,section:rizal_arcade_sections(id,section_code,school_year,term)")
    .eq("id", userId)
    .single();
  if (error || !data) throw new Error("This account is not assigned to Rizal Arcade. Ask the administrator to import or activate it.");
  return { ...(data as Omit<ArcadeProfile, "section">), section: normalizeSection(data.section) };
}

export async function getAuthSnapshot(): Promise<ArcadeAuthSnapshot | null> {
  if (!authConfigured) return null;
  const { data } = await getSupabaseClient().auth.getSession();
  if (!data.session) return null;
  return { session: data.session, profile: await loadProfile(data.session.user.id) };
}

export async function signInToArcade(identifier: string, password: string) {
  const cleanIdentifier = identifier.trim();
  const email = cleanIdentifier.includes("@") ? cleanIdentifier.toLowerCase() : studentLoginEmail(cleanIdentifier);
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error("The Student ID/email or password is incorrect.");
  try {
    return { session: data.session, profile: await loadProfile(data.session.user.id) };
  } catch (profileError) {
    await getSupabaseClient().auth.signOut();
    throw profileError;
  }
}

export async function signOutOfArcade() {
  if (!authConfigured) return;
  await getSupabaseClient().auth.signOut();
}

export async function changeFirstPassword(password: string) {
  if (password.length < 10) throw new Error("Use at least 10 characters for the new password.");
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  const { error: profileError } = await supabase.rpc("complete_rizal_arcade_first_login");
  if (profileError) throw new Error("The password changed, but the profile could not be unlocked. Please sign in again.");
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Please sign in again with the new password.");
  return loadProfile(data.user.id);
}

export function subscribeToArcadeAuth(onChange: () => void) {
  if (!authConfigured) return () => undefined;
  const { data } = getSupabaseClient().auth.onAuthStateChange(() => onChange());
  return () => data.subscription.unsubscribe();
}

export async function getAccessToken() {
  const { data } = await getSupabaseClient().auth.getSession();
  if (!data.session) throw new Error("Your admin session expired. Please sign in again.");
  return data.session.access_token;
}
