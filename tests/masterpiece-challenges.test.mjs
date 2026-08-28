import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

import { masterpieceChallenges, museumGalleries, museumGalleriesById } from "../app/masterpieceChallenges.ts";

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
  }
});

test("Masterpiece Museum local art and audio are packaged for offline play", () => {
  for (const file of [
    "../public/art/masterpiece-museum.png",
    "../public/audio/arcade-waltz.mp3",
    "../public/audio/scholar-page-turn.mp3",
  ]) assert.ok(existsSync(new URL(file, import.meta.url)), `${file} is missing`);
});
