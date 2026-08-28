import type { LeaderboardGame } from "../leaderboard";

export type GameId = LeaderboardGame;

export type GameProps = {
  onClose: () => void;
};
