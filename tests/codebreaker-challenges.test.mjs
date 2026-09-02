import assert from "node:assert/strict";
import test from "node:test";

import { codebreakerChallenges } from "../app/codebreakerChallenges.ts";

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

test("Rizal Roots has a complete 50-file codebreaker bank", () => {
  assert.equal(codebreakerChallenges.length, 50);
  assert.deepEqual(
    codebreakerChallenges.map((item) => item.id),
    Array.from({ length: 50 }, (_, index) => `R${String(index + 1).padStart(2, "0")}`),
  );
  assert.equal(new Set(codebreakerChallenges.map((item) => normalize(item.answer))).size, 50);
});

test("every roots file is complete and belongs to one focused topic drawer", () => {
  const groups = new Set(["Family & roots", "Childhood", "Early education"]);
  for (const challenge of codebreakerChallenges) {
    assert.ok(groups.has(challenge.category), `${challenge.id} has an unexpected category`);
    assert.equal(challenge.clues.length, 3, `${challenge.id} needs exactly three clues`);
    assert.ok(challenge.clues.every((clue) => clue.length >= 30), `${challenge.id} has an unclear clue`);
    assert.ok(challenge.rationale.length >= 55, `${challenge.id} needs a review explanation`);
    assert.ok(challenge.variants.map(normalize).includes(normalize(challenge.answer)), `${challenge.id} must accept its display answer`);
    assert.ok(challenge.source.includes("Module 4"), `${challenge.id} needs its course basis`);
    assert.doesNotMatch(challenge.answer, /\d/, `${challenge.id} exposes digits that Atbash would not encode`);
    assert.ok(!normalize(challenge.clues.join(" ")).includes(normalize(challenge.answer)), `${challenge.id} prints its decoded answer inside the clues`);
  }

  const counts = Object.fromEntries([...groups].map((group) => [group, codebreakerChallenges.filter((item) => item.category === group).length]));
  assert.deepEqual(counts, { "Family & roots": 18, Childhood: 16, "Early education": 16 });
});
