import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

import { scholarMemoryCards } from "../app/scholarMemoryCards.ts";

test("Scholar's Memory has a complete 50-record topic bank", () => {
  assert.equal(scholarMemoryCards.length, 50);
  assert.deepEqual(
    scholarMemoryCards.map((item) => item.id),
    Array.from({ length: 50 }, (_, index) => `S${String(index + 1).padStart(2, "0")}`),
  );
  assert.equal(new Set(scholarMemoryCards.map((item) => item.label.toLowerCase())).size, 50);
});

test("the scholar bank is balanced, specific, sourced, and media-ready", () => {
  const categories = ["Campus", "Discipline", "Language", "Mentor", "Research"];
  const counts = Object.fromEntries(categories.map((category) => [category, scholarMemoryCards.filter((item) => item.category === category).length]));
  assert.deepEqual(counts, { Campus: 10, Discipline: 10, Language: 10, Mentor: 10, Research: 10 });

  for (const card of scholarMemoryCards) {
    assert.ok(card.symbol.length >= 2 && card.symbol.length <= 3, `${card.id} needs a compact passport symbol`);
    assert.ok(card.memoryLine.length >= 16, `${card.id} needs a memorable study line`);
    assert.ok(card.prompt.length >= 65, `${card.id} needs a specific recall clue`);
    assert.ok(card.rationale.length >= 65, `${card.id} needs a useful review explanation`);
    assert.ok(card.source.trim(), `${card.id} needs a course or institutional source`);
    if (card.art) {
      assert.ok(card.art.startsWith("/art/"), `${card.id} should use a local classroom-safe image`);
      assert.ok(card.artAlt?.trim(), `${card.id} needs image alternative text`);
      assert.ok(existsSync(new URL(`../public${card.art}`, import.meta.url)), `${card.id} is missing its local image`);
    }
  }

  assert.ok(existsSync(new URL("../public/audio/scholar-page-turn.mp3", import.meta.url)), "the local page-turn effect is missing");
});
