import { authConfigured, getAuthSnapshot, getSupabaseClient } from "./auth";

export type LeaderboardGame = "values" | "novels" | "codebreaker" | "scholar" | "hearts" | "museum" | "global" | "revolution" | "crossword";

export type LeaderboardEntry = {
  player_name: string;
  game_id: LeaderboardGame;
  score: number;
  achieved_at: string;
};

export type LeaderboardState = {
  entries: LeaderboardEntry[];
  mode: "section" | "signed-out" | "admin";
  status: "ok" | "disabled" | "failed";
  sectionLabel: string;
};

export const leaderboardConfigured = authConfigured;

export async function loadLeaderboard(game: LeaderboardGame, adminSectionId?: string): Promise<LeaderboardState> {
  if (!authConfigured) return { entries: [], mode: "signed-out", status: "disabled", sectionLabel: "Not configured" };
  try {
    const snapshot = await getAuthSnapshot();
    if (!snapshot) return { entries: [], mode: "signed-out", status: "disabled", sectionLabel: "Sign in required" };
    if (snapshot.profile.role === "admin" && !adminSectionId) {
      return { entries: [], mode: "admin", status: "ok", sectionLabel: "Choose a section in Admin" };
    }
    let query = getSupabaseClient()
      .from("rizal_arcade_scores")
      .select("player_name,game_id,score,achieved_at")
      .eq("game_id", game)
      .order("score", { ascending: false })
      .order("achieved_at", { ascending: true })
      .limit(10);
    if (adminSectionId) query = query.eq("section_id", adminSectionId);
    const { data, error } = await query;
    if (error) throw error;
    return {
      entries: (data ?? []) as LeaderboardEntry[],
      mode: snapshot.profile.role === "admin" ? "admin" : "section",
      status: "ok",
      sectionLabel: snapshot.profile.role === "admin" ? "Selected section" : snapshot.profile.section?.section_code ?? "Your section",
    };
  } catch {
    return { entries: [], mode: "signed-out", status: "failed", sectionLabel: "Unavailable" };
  }
}

export async function submitLeaderboardScore(game: LeaderboardGame, score: number): Promise<LeaderboardState> {
  const snapshot = await getAuthSnapshot();
  if (!snapshot || snapshot.profile.role !== "student") throw new Error("Only signed-in student scores are placed on section leaderboards.");
  if (snapshot.profile.must_change_password) throw new Error("Change your temporary password before saving scores.");
  const { error } = await getSupabaseClient().rpc("submit_rizal_arcade_score", { p_game_id: game, p_score: score });
  if (error) throw new Error("The score could not be saved. Please try again.");
  return loadLeaderboard(game);
}
