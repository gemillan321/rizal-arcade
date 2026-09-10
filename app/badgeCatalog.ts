import type { GameId } from "./games/types";

export const gameBadges = [
  { game: "values", name: "Ford of Virtues", title: "River Quest", art: "b1" },
  { game: "novels", name: "The Noli Dossier", title: "Noli Case Files", art: "b2" },
  { game: "codebreaker", name: "Seal of Origins", title: "Rizal Roots: Codebreaker", art: "b3" },
  { game: "scholar", name: "Six Stations", title: "Scholar’s Journey", art: "b4" },
  { game: "hearts", name: "Sealed Correspondence", title: "Hearts & Horizons", art: "b5" },
  { game: "museum", name: "Curator’s Plaque", title: "Masterpiece Museum", art: "b6" },
  { game: "global", name: "Chart the Journey", title: "Global Sojourn", art: "b7" },
  { game: "dapitan", name: "Dawn at Bagumbayan", title: "Dapitan to Bagumbayan", art: "b10" },
  { game: "revolution", name: "Broken Chain", title: "El Fili: Revolution Files", art: "b8" },
  { game: "crossword", name: "Chronicle Grid", title: "Crossword Chronicle", art: "b9" },
] as const satisfies readonly { game: GameId; name: string; title: string; art: string }[];

export type BadgeAward = { game_id: GameId; awarded_at: string };

export function collectionProgress(awards: readonly BadgeAward[]) {
  const earned = new Set(awards.map((award) => award.game_id));
  const count = gameBadges.filter((badge) => earned.has(badge.game)).length;
  return { earned, count, complete: count === gameBadges.length };
}
