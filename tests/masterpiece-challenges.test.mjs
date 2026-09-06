import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

import { masterpieceChallenges, museumGalleries, museumGalleriesById } from "../app/masterpieceChallenges.ts";
import { createLabelInspection, judgeLabelInspection } from "../app/games/masterpiece-museum/inspection.ts";

test("label inspections judge both supported and misleading labels using the source bank", () => {
  for (const work of masterpieceChallenges) {
    for (const accurate of [true, false]) {
      const inspection = createLabelInspection(work, accurate);
      assert.ok(accurate ? inspection.label === work.correctPlaque : work.distractorPlaques.includes(inspection.label));
      const right = accurate ? "keep" : "replace";
      assert.deepEqual(judgeLabelInspection(inspection, right, 160, 1, 4), { correct: true, score: 330, streak: 2, lives: 4 });
      assert.deepEqual(judgeLabelInspection(inspection, right === "keep" ? "replace" : "keep", 160, 1, 4), { correct: false, score: 160, streak: 0, lives: 3 });
    }
  }
});

test("six correct inspections retain the 1110-point ceiling and mistakes reset the streak", () => {
  const inspection = createLabelInspection(masterpieceChallenges[0], true);
  let state = { score: 0, streak: 0, lives: 4 };
  for (let round = 0; round < 6; round++) state = judgeLabelInspection(inspection, "keep", state.score, state.streak, state.lives);
  assert.equal(state.score, 1110);
  for (let miss = 0; miss < 5; miss++) state = judgeLabelInspection(inspection, "replace", state.score, state.streak, state.lives);
  assert.equal(state.lives, 0);
  assert.equal(state.score, 1110);
  assert.equal(state.streak, 0);
});

test("Masterpiece Museum has a complete 50-exhibit topic bank", () => {
  assert.equal(masterpieceChallenges.length, 50);
  assert.deepEqual(
    masterpieceChallenges.map((item) => item.id),
    Array.from({ length: 50 }, (_, index) => `M${String(index + 1).padStart(2, "0")}`),
  );
  assert.equal(new Set(masterpieceChallenges.map((item) => item.id)).size, 50);
});

test("the five museum galleries are balanced and fully described", () => {
  assert.equal(museumGalleries.length, 5);
  assert.equal(new Set(museumGalleries.map((gallery) => gallery.id)).size, 5);
  for (const gallery of museumGalleries) {
    assert.equal(masterpieceChallenges.filter((item) => item.galleryId === gallery.id).length, 10);
    assert.equal(museumGalleriesById[gallery.id], gallery);
    assert.ok(gallery.description.length >= 35, `${gallery.id} needs a useful gallery description`);
  }
});

test("every exhibit has specific evidence, a meaningful plaque, and review material", () => {
  for (const exhibit of masterpieceChallenges) {
    assert.ok(exhibit.workTitle.length >= 10, `${exhibit.id} needs a specific work title`);
    assert.equal(exhibit.evidence.length, 3);
    assert.ok(exhibit.evidence.every((clue) => clue.length >= 35), `${exhibit.id} needs three specific evidence clues`);
    assert.equal(new Set([exhibit.correctPlaque, ...exhibit.distractorPlaques]).size, 3, `${exhibit.id} repeats a plaque`);
    assert.ok(exhibit.correctPlaque.length >= 45, `${exhibit.id} needs a substantive curatorial plaque`);
    assert.ok(exhibit.rationale.length >= 65, `${exhibit.id} needs a useful review explanation`);
    assert.ok(exhibit.source.length >= 20, `${exhibit.id} needs a named source`);
    const visibleClues = `${exhibit.clueTitle} ${exhibit.evidence.join(" ")}`.toLocaleLowerCase();
    const galleryLabel = museumGalleriesById[exhibit.galleryId].shortTitle.toLocaleLowerCase();
    assert.ok(!visibleClues.includes(galleryLabel), `${exhibit.id} prints its gallery label inside the clues`);
  }
});

test("Masterpiece Museum local art and audio are packaged for offline play", () => {
  for (const file of [
    "../public/art/masterpiece-museum.png",
    "../public/audio/arcade-waltz.mp3",
    "../public/audio/scholar-page-turn.mp3",
  ]) assert.ok(existsSync(new URL(file, import.meta.url)), `${file} is missing`);
});
