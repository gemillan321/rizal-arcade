import type { MasterpieceChallenge } from "../../masterpieceChallenges";

export type LabelDecision = "keep" | "replace";
export type LabelInspection = { work: MasterpieceChallenge; label: string; accurate: boolean };

export function createLabelInspection(work: MasterpieceChallenge, accurate: boolean): LabelInspection {
  return { work, accurate, label: accurate ? work.correctPlaque : work.distractorPlaques[Math.floor(Math.random() * work.distractorPlaques.length)] };
}

export function judgeLabelInspection(inspection: LabelInspection, decision: LabelDecision, score: number, streak: number, lives: number) {
  const correct = (decision === "keep") === inspection.accurate;
  return {
    correct,
    score: correct ? score + 160 + streak * 10 : score,
    streak: correct ? streak + 1 : 0,
    lives: correct ? lives : Math.max(0, lives - 1),
  };
}
