export type GlobalSojournChallenge = {
  id: string;
  place: string;
  period: string;
  mission: string;
  evidence: [string, string, string];
  source: string;
  sourceUrl: string;
};

/** Add reviewed module-based challenges here. The game is not registered until this bank is complete. */
export const globalSojournChallenges: GlobalSojournChallenge[] = [];
