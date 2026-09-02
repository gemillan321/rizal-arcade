import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";

import { heartsChallenges, heartsProfiles, heartsProfilesById } from "../app/heartsChallenges.ts";

test("Hearts & Horizons has a complete 50-dossier topic bank", () => {
  assert.equal(heartsChallenges.length, 50);
  assert.deepEqual(
    heartsChallenges.map((item) => item.id),
    Array.from({ length: 50 }, (_, index) => `H${String(index + 1).padStart(2, "0")}`),
  );
  assert.equal(new Set(heartsChallenges.map((item) => item.id)).size, 50);
});

test("every relationship dossier maps to a distinct identity and historical horizon", () => {
  assert.equal(heartsProfiles.length, 9);
  assert.equal(new Set(heartsProfiles.map((profile) => profile.name)).size, 9);
  assert.equal(new Set(heartsProfiles.map((profile) => profile.place)).size, 9);
  assert.equal(new Set(heartsProfiles.map((profile) => profile.routeCode)).size, 9);

  for (const dossier of heartsChallenges) {
    assert.ok(heartsProfilesById[dossier.womanId], `${dossier.id} needs a valid relationship profile`);
    assert.equal(dossier.evidence.length, 3, `${dossier.id} needs exactly three evidence strips`);
    assert.ok(dossier.evidence.every((clue) => clue.length >= 20), `${dossier.id} needs clear, specific evidence`);
    assert.ok(dossier.rationale.length >= 60, `${dossier.id} needs a useful review explanation`);
    assert.ok(dossier.source.trim(), `${dossier.id} needs a course or institutional source`);

    const answerTerms = {
      segunda: ["segunda", "katigbak", "lipa"],
      valenzuela: ["valenzuela", "orang", "manila"],
      rivera: ["rivera", "camiling"],
      consuelo: ["consuelo", "ortiga", "madrid"],
      seiko: ["seiko", "usui", "o-sei-san", "yokohama"],
      gertrude: ["gertrude", "beckett", "london"],
      nellie: ["nellie", "boustead", "biarritz"],
      suzanne: ["suzanne", "jacoby", "brussels"],
      josephine: ["josephine", "bracken", "dapitan"],
    }[dossier.womanId];
    const visibleClues = `${dossier.evidenceTitle} ${dossier.evidence.join(" ")}`.toLocaleLowerCase();
    for (const term of answerTerms) assert.ok(!visibleClues.includes(term), `${dossier.id} reveals “${term}” before the player answers`);
  }
});

test("relationship profiles and soundtracks have local, classroom-safe assets", () => {
  for (const profile of heartsProfiles) {
    assert.ok(profile.artAlt.length >= 24, `${profile.id} needs clear alternative text`);
    if (profile.art) assert.ok(existsSync(new URL(`../public${profile.art}`, import.meta.url)), `${profile.id} is missing its archival portrait`);
  }
  for (const file of [
    "../public/art/rizal-women-portrait-sprite.png",
    "../public/audio/arcade-adventure.mp3",
    "../public/audio/arcade-mystery.mp3",
    "../public/audio/arcade-waltz.mp3",
  ]) assert.ok(existsSync(new URL(file, import.meta.url)), `${file} is missing`);
});
