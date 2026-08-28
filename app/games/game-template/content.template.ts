export type TemplateChallenge = {
  id: string;
  prompt: string;
  answer: string;
  explanation: string;
  source: string;
  sourceUrl: string;
};

export const templateChallenges: TemplateChallenge[] = [
  {
    id: "replace-001",
    prompt: "Replace this with a precise, module-based challenge.",
    answer: "Replace this answer",
    explanation: "Explain why the answer is historically correct.",
    source: "Course module or named primary/institutional source",
    sourceUrl: "",
  },
];
