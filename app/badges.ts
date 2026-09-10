import { getAuthSnapshot, getSupabaseClient } from "./auth";
import type { BadgeAward } from "./badgeCatalog";

export async function loadMyBadges(): Promise<BadgeAward[]> {
  const snapshot = await getAuthSnapshot();
  if (!snapshot || snapshot.profile.role !== "student" || !snapshot.profile.active || snapshot.profile.must_change_password) return [];
  const { data, error } = await getSupabaseClient()
    .from("rizal_arcade_badges")
    .select("game_id,awarded_at")
    .eq("student_id", snapshot.profile.id);
  if (error) throw new Error("Your badges could not be loaded. Please try again.");
  return (data ?? []) as BadgeAward[];
}
