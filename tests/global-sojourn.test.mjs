import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { globalDestinations, globalDestinationsById, globalSojournChallenges } from "../app/games/global-sojourn/content.ts";

test("Global Sojourn has 50 distinct sourced travel dossiers", () => {
  assert.equal(globalSojournChallenges.length, 50);
  assert.deepEqual(globalSojournChallenges.map((item) => item.id), Array.from({ length: 50 }, (_, index) => `GS${String(index + 1).padStart(2, "0")}`));
  assert.equal(new Set(globalSojournChallenges.map((item) => item.id)).size, 50);
  for (const dossier of globalSojournChallenges) {
    assert.equal(dossier.evidence.length, 3, `${dossier.id} needs three clues`);
    assert.ok(dossier.evidence.every((clue) => clue.length >= 25), `${dossier.id} needs specific clues`);
    assert.ok(dossier.mission.length >= 35, `${dossier.id} needs a clear mission`);
    assert.ok(dossier.explanation.length >= 45, `${dossier.id} needs review feedback`);
    assert.ok(dossier.source.length >= 25, `${dossier.id} needs a named source`);
    assert.doesNotMatch(dossier.sourceUrl, /example\.com/i, `${dossier.id} still uses a placeholder source`);
    assert.ok(globalDestinationsById[dossier.destinationId], `${dossier.id} has an unknown destination`);
    const visibleClues = `${dossier.mission} ${dossier.evidence.join(" ")}`.toLocaleLowerCase();
    const answerLabel = globalDestinationsById[dossier.destinationId].shortPlace.toLocaleLowerCase();
    assert.ok(!visibleClues.includes(answerLabel), `${dossier.id} reveals its destination label before the player answers`);
  }
});

test("Global Sojourn provides a varied destination pool", () => {
  assert.equal(globalDestinations.length, 12);
  assert.equal(new Set(globalDestinations.map((destination) => destination.id)).size, 12);
  assert.ok(globalDestinations.every((destination) => destination.place && destination.region && destination.stamp && destination.map.x > 0 && destination.map.y > 0));
  assert.ok(new Set(globalSojournChallenges.map((item) => item.destinationId)).size >= 10);
});

test("Global Sojourn packages visual and audio assets and complete mechanics", async () => {
  for (const file of ["../public/art/global-sojourn-atlas-v2.webp", "../public/audio/arcade-adventure.mp3", "../public/audio/scholar-page-turn.mp3"]) {
    assert.ok(existsSync(new URL(file, import.meta.url)), `${file} is missing`);
  }
  const implementation = await readFile(new URL("../app/games/global-sojourn/index.tsx", import.meta.url), "utf8");
  assert.match(implementation, /drawChallengeSet\(globalBank, roundSize\)/);
  assert.match(implementation, /useArcadeSound\("\/audio\/arcade-adventure\.mp3"\)/);
  assert.match(implementation, /Results game="global"/);
  assert.match(implementation, /onPointerMove=/);
  assert.match(implementation, /onPointerUp=/);
  assert.match(implementation, /routePath/);
  assert.match(implementation, /global-telegram/);
  assert.match(implementation, /keydown/);
});
