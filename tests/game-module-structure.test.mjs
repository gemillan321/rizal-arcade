import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const modules = [
  "river-quest/index.tsx",
  "noli-case-files/index.tsx",
  "codebreaker/index.tsx",
  "scholars-journey/index.tsx",
  "hearts-and-horizons/index.tsx",
  "masterpiece-museum/index.tsx",
  "global-sojourn/index.tsx",
  "game-template/GameTemplate.tsx",
];

test("every current and planned game has an isolated module folder", async () => {
  await Promise.all(modules.map((modulePath) => access(new URL(`../app/games/${modulePath}`, import.meta.url))));
});
test("the arcade shell mounts games through the registry instead of owning gameplay", async () => {
  const shell = await readFile(new URL("../app/RizalArcade.tsx", import.meta.url), "utf8");
  assert.match(shell, /gameComponents\[game\]/);
  for (const implementation of ["ValuesGame", "NovelsGame", "CodebreakerGame", "ScholarMemoryGame", "HeartsGame", "MasterpieceMuseumGame"]) {
    assert.doesNotMatch(shell, new RegExp(`function ${implementation}`));
  }
});

test("unfinished contributor scaffolds cannot appear in the live registry", async () => {
  const registry = await readFile(new URL("../app/games/registry.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(registry, /GlobalSojournGame|GameTemplate/);
  assert.match(registry, /museum: MasterpieceMuseumGame/);
});
