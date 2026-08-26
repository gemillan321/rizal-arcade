import assert from "node:assert/strict";
import test from "node:test";

import { defineChallengeBank, drawChallengeSet, shuffleList } from "../app/challengeBank.ts";

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

const bank = defineChallengeBank({
  id: "test-bank",
  topicId: "test-topic",
  contentVersion: 1,
  items: ["A", "B", "C", "D", "E"].map((id) => ({ id })),
});

test("shuffleList does not mutate its input", () => {
  const input = ["A", "B", "C", "D"];
  const shuffled = shuffleList(input, () => 0);
  assert.deepEqual(input, ["A", "B", "C", "D"]);
  assert.deepEqual([...shuffled].sort(), input);
  assert.notDeepEqual(shuffled, input);
});

test("persistent draws do not repeat until the bank is exhausted", () => {
  const storage = memoryStorage();
  const draw = (count) => drawChallengeSet(bank, count, { storage, random: () => 0.42 });
  const firstCycle = [...draw(2), ...draw(2), ...draw(1)].map((item) => item.id);

  assert.equal(new Set(firstCycle).size, bank.items.length);
  assert.deepEqual(new Set(firstCycle), new Set(bank.items.map((item) => item.id)));

  const nextCycle = draw(2).map((item) => item.id);
  assert.equal(new Set(nextCycle).size, 2);
});

test("a single draw never contains duplicate challenges", () => {
  const selected = drawChallengeSet(bank, bank.items.length, {
    storage: memoryStorage(),
    random: () => 0.75,
  });
  assert.equal(new Set(selected.map((item) => item.id)).size, bank.items.length);
});

test("defineChallengeBank rejects duplicate ids", () => {
  assert.throws(
    () => defineChallengeBank({
      id: "duplicates",
      topicId: "test-topic",
      contentVersion: 1,
      items: [{ id: "same" }, { id: "same" }],
    }),
    /duplicate item id/i,
  );
});
