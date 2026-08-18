export type LeaderboardGame = "values" | "novels" | "codebreaker";

export type LeaderboardEntry = {
  player_name: string;
  game_id: LeaderboardGame;
  score: number;
  achieved_at: string;
};

export type LeaderboardState = {
  entries: LeaderboardEntry[];
  mode: "global" | "device";
  status: "ok" | "disabled" | "failed";
};

const browserEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const supabaseUrl = browserEnv.VITE_SUPABASE_URL?.trim().replace(/\/$/, "");
const publishableKey = browserEnv.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const leaderboardConfigured = Boolean(supabaseUrl && publishableKey);

const LOCAL_SCORE_KEY = "rizal-arcade-leaderboard";
const PLAYER_KEYS = "rizal-arcade-player-keys";
const PLAYER_NAME_KEY = "rizal-arcade-player-name";

function readLocalEntries(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_SCORE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalEntry(entry: LeaderboardEntry) {
  try {
    const entries = readLocalEntries();
    const existing = entries.findIndex((item) => item.game_id === entry.game_id && item.player_name.toLowerCase() === entry.player_name.toLowerCase());
    if (existing >= 0) {
      if (entry.score >= entries[existing].score) entries[existing] = entry;
    } else {
      entries.push(entry);
    }
    window.localStorage.setItem(LOCAL_SCORE_KEY, JSON.stringify(entries));
  } catch {
    // Device storage is a convenience only; a blocked browser store must not break a round.
  }
}

function localTopTen(game: LeaderboardGame) {
  return readLocalEntries()
    .filter((entry) => entry.game_id === game)
    .sort((a, b) => b.score - a.score || a.achieved_at.localeCompare(b.achieved_at))
    .slice(0, 10);
}

function generatePlayerKey() {
  if (typeof window.crypto?.randomUUID === "function") return window.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (typeof window.crypto?.getRandomValues === "function") {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function getPlayerKey(playerName: string) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PLAYER_KEYS) ?? "{}");
    const keys = stored && typeof stored === "object" && !Array.isArray(stored) ? stored as Record<string, string> : {};
    const identity = normalizePlayerName(playerName).toLocaleLowerCase();
    if (typeof keys[identity] === "string" && keys[identity]) return keys[identity];
    const generated = generatePlayerKey();
    keys[identity] = generated;
    window.localStorage.setItem(PLAYER_KEYS, JSON.stringify(keys));
    return generated;
  } catch {
    return generatePlayerKey();
  }
}

export function getSavedPlayerName() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(PLAYER_NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function normalizePlayerName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function validatePlayerName(name: string) {
  const normalized = normalizePlayerName(name);
  const hasUnsafeCharacter = [...normalized].some((character) => character === "<" || character === ">" || character.charCodeAt(0) < 32);
  if (normalized.length < 2 || normalized.length > 24 || hasUnsafeCharacter) {
    return "Use a nickname or first name with 2–24 characters.";
  }
  return "";
}

export async function loadLeaderboard(game: LeaderboardGame): Promise<LeaderboardState> {
  const fallback = localTopTen(game);
  if (!leaderboardConfigured || !supabaseUrl || !publishableKey) {
    return { entries: fallback, mode: "device", status: "disabled" };
  }

  try {
    const query = new URLSearchParams({
      select: "player_name,game_id,score,achieved_at",
      game_id: `eq.${game}`,
      order: "score.desc,achieved_at.asc",
      limit: "10",
    });
    const response = await fetch(`${supabaseUrl}/rest/v1/rizal_arcade_scores?${query}`, {
      headers: { apikey: publishableKey },
    });
    if (!response.ok) throw new Error("Leaderboard request failed");
    const entries = (await response.json()) as LeaderboardEntry[];
    return { entries, mode: "global", status: "ok" };
  } catch {
    return { entries: fallback, mode: "device", status: "failed" };
  }
}

export async function submitLeaderboardScore(game: LeaderboardGame, name: string, score: number): Promise<LeaderboardState> {
  const playerName = normalizePlayerName(name);
  const nameError = validatePlayerName(playerName);
  if (nameError) throw new Error(nameError);

  const localEntry: LeaderboardEntry = {
    player_name: playerName,
    game_id: game,
    score,
    achieved_at: new Date().toISOString(),
  };
  writeLocalEntry(localEntry);
  try { window.localStorage.setItem(PLAYER_NAME_KEY, playerName); } catch { /* optional */ }

  if (!leaderboardConfigured || !supabaseUrl || !publishableKey) {
    return { entries: localTopTen(game), mode: "device", status: "disabled" };
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/submit_rizal_arcade_score`, {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_player_key: getPlayerKey(playerName),
        p_player_name: playerName,
        p_game_id: game,
        p_score: score,
      }),
    });
    if (!response.ok) throw new Error("Score submission failed");
    return loadLeaderboard(game);
  } catch {
    return { entries: localTopTen(game), mode: "device", status: "failed" };
  }
}
