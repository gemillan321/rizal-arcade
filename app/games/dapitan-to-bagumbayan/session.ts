import {
  defineChallengeBank,
  drawChallengeSet,
  shuffleList,
  type ChallengeStorage,
} from "../../challengeBank.ts";
import { dapitanChallenges, type DapitanChallenge, type DapitanTask } from "./content.ts";

type SessionOptions = {
  storage?: ChallengeStorage | null;
  random?: () => number;
};

const SESSION_PLAN: Array<{ task: DapitanTask; count: number }> = [
  { task: "timeline", count: 3 },
  { task: "evidence", count: 4 },
  { task: "theme", count: 3 },
];

const taskBanks = new Map(
  SESSION_PLAN.map(({ task }) => [
    task,
    defineChallengeBank({
      id: `dapitan-to-bagumbayan-${task}`,
      topicId: "persecution-exile-trial-execution-and-legacy",
      contentVersion: 1,
      items: dapitanChallenges.filter((challenge) => challenge.task === task),
    }),
  ]),
);

export function drawDapitanSession(options: SessionOptions = {}): DapitanChallenge[] {
  const selected = SESSION_PLAN.flatMap(({ task, count }) => {
    const bank = taskBanks.get(task);
    if (!bank) throw new Error(`Missing Dapitan challenge bank for ${task}.`);
    return drawChallengeSet(bank, count, options);
  });

  return shuffleList(selected, options.random);
}
