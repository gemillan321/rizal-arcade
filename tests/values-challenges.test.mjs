import assert from "node:assert/strict";
import test from "node:test";

import { valuesChallenges } from "../app/valuesChallenges.ts";

test("River Quest has a complete 50-challenge topic bank", () => {
  assert.equal(valuesChallenges.length, 50);
  assert.equal(new Set(valuesChallenges.map((item) => item.id)).size, 50);
  assert.deepEqual(
    valuesChallenges.map((item) => item.id),
    Array.from({ length: 50 }, (_, index) => `V${String(index + 1).padStart(2, "0")}`),
  );
});

test("every River Quest challenge contains reviewable learning content", () => {
  for (const challenge of valuesChallenges) {
    assert.ok(challenge.scenario.length >= 45, `${challenge.id} needs a specific scenario`);
    assert.ok(challenge.value.trim(), `${challenge.id} needs a value`);
    assert.ok(challenge.rationale.length >= 45, `${challenge.id} needs an explanation`);
    assert.ok(challenge.source.trim(), `${challenge.id} needs a source or course basis`);
  }
  assert.ok(new Set(valuesChallenges.map((item) => item.value)).size >= 10);
});
