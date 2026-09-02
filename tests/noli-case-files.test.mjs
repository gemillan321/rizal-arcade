import assert from "node:assert/strict";
import test from "node:test";

import { noliCaseFiles } from "../app/noliCaseFiles.ts";

test("Noli Case Files has a complete 50-pair topic bank", () => {
  assert.equal(noliCaseFiles.length, 50);
  assert.deepEqual(
    noliCaseFiles.map((item) => item.id),
    Array.from({ length: 50 }, (_, index) => `N${String(index + 1).padStart(2, "0")}`),
  );
  assert.equal(new Set(noliCaseFiles.map((item) => item.answer.toLowerCase())).size, 50);
});

test("the Noli pool balances characters, plot, and themes without El Fili answers", () => {
  const expectedCounts = { Character: 20, "Plot & background": 15, "Theme & context": 15 };
  const actualCounts = Object.fromEntries(Object.keys(expectedCounts).map((type) => [type, noliCaseFiles.filter((item) => item.caseType === type).length]));
  assert.deepEqual(actualCounts, expectedCounts);

  for (const file of noliCaseFiles) {
    assert.ok(file.visual.length >= 2 && file.visual.length <= 3, `${file.id} needs a compact visual seal`);
    assert.ok(file.hint.length >= 70, `${file.id} needs specific identifying clues`);
    assert.ok(file.rationale.length >= 55, `${file.id} needs a review explanation`);
    assert.ok(file.source.trim(), `${file.id} needs a course or primary source basis`);
    assert.ok(!file.hint.toLocaleLowerCase().includes(file.answer.toLocaleLowerCase()), `${file.id} prints its matching answer inside the hint`);
    if (file.portraitIndex !== undefined) assert.ok(file.portraitIndex >= 0 && file.portraitIndex <= 3, `${file.id} uses a non-Noli sprite portrait`);
  }

  const characterAnswers = noliCaseFiles
    .filter((item) => item.caseType === "Character")
    .map((item) => item.answer)
    .join(" ");
  const allAnswers = noliCaseFiles.map((item) => item.answer).join(" ");

  assert.doesNotMatch(characterAnswers, /\b(?:Simoun|Isagani)\b/i);
  assert.doesNotMatch(allAnswers, /\b(?:El Fili|Filibusterismo)\b/i);
});
