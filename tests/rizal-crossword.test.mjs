import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { crosswordClues, normalizeCrosswordAnswer } from "../app/games/rizal-crossword/content.ts";
import { createCrosswordPuzzle, entryCellKey } from "../app/games/rizal-crossword/puzzle.ts";

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

test("Crossword Chronicle has 50 distinct, course-sourced clues", () => {
  assert.equal(crosswordClues.length, 50);
  assert.deepEqual(crosswordClues.map((item) => item.id), Array.from({ length: 50 }, (_, index) => `RC${String(index + 1).padStart(2, "0")}`));
  assert.equal(new Set(crosswordClues.map((item) => normalizeCrosswordAnswer(item.answer))).size, 50);
  assert.equal(new Set(crosswordClues.map((item) => item.topic)).size, 4);
  for (const item of crosswordClues) {
    const answer = normalizeCrosswordAnswer(item.answer);
    assert.ok(answer.length >= 4 && answer.length <= 15, `${item.id} has an impractical grid length`);
    assert.ok(item.clue.length >= 55, `${item.id} needs a specific clue`);
    assert.ok(item.explanation.length >= 45, `${item.id} needs useful feedback`);
    assert.match(item.source, /^Instructor Module /, `${item.id} needs a course source`);
    assert.ok(!item.clue.toLocaleUpperCase().replace(/[^A-Z0-9]/g, "").includes(answer), `${item.id} reveals its answer in the clue`);
  }
});

test("the composer makes a connected eight-entry crossword across repeated seeds", () => {
  for (let seed = 1; seed <= 60; seed += 1) {
    const puzzle = createCrosswordPuzzle(seededRandom(seed));
    assert.equal(puzzle.entries.length, 8, `seed ${seed} did not create eight entries`);
    assert.ok(puzzle.rows > 1 && puzzle.cols > 1);
    assert.ok(puzzle.rows <= 31 && puzzle.cols <= 31);
    assert.equal(new Set(puzzle.entries.map((entry) => entry.id)).size, 8);
    assert.ok(puzzle.entries.some((entry) => entry.direction === "across"));
    assert.ok(puzzle.entries.some((entry) => entry.direction === "down"));
    assert.ok(puzzle.cells.some((cell) => cell.entryIds.length > 1), "the grid needs a crossing");
    for (const entry of puzzle.entries) {
      for (let index = 0; index < entry.solution.length; index += 1) {
        const cell = puzzle.cells.find((candidate) => `${candidate.row}:${candidate.col}` === entryCellKey(entry, index));
        assert.equal(cell?.solution, entry.solution[index], `${entry.id} has a broken cell`);
      }
    }
  }
});

test("Crossword Chronicle packages its pressroom visual, audio, and mechanics", async () => {
  for (const file of ["../public/art/crossword-pressroom.jpg", "../public/audio/arcade-mystery.mp3", "../public/audio/scholar-page-turn.mp3"]) {
    assert.ok(existsSync(new URL(file, import.meta.url)), `${file} is missing`);
  }
  const implementation = await readFile(new URL("../app/games/rizal-crossword/index.tsx", import.meta.url), "utf8");
  assert.match(implementation, /createCrosswordPuzzle/);
  assert.match(implementation, /useArcadeSound\("\/audio\/arcade-mystery\.mp3"\)/);
  assert.match(implementation, /Results game="crossword"/);
  assert.match(implementation, /Reveal one letter/);
  assert.match(implementation, /Lock word/);
  assert.match(implementation, /crossword-grid/);
});
