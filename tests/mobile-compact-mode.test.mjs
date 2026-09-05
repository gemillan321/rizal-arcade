import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const dapitanCss = await readFile(new URL("../app/games/dapitan-to-bagumbayan/dapitan.css", import.meta.url), "utf8");
const shared = await readFile(new URL("../app/games/shared/ArcadeGameKit.tsx", import.meta.url), "utf8");
const arcadeShell = await readFile(new URL("../app/RizalArcade.tsx", import.meta.url), "utf8");
const globalGame = await readFile(new URL("../app/games/global-sojourn/index.tsx", import.meta.url), "utf8");
const revolutionGame = await readFile(new URL("../app/games/el-fili-revolution-files/index.tsx", import.meta.url), "utf8");
const crosswordGame = await readFile(new URL("../app/games/rizal-crossword/index.tsx", import.meta.url), "utf8");
const codebreakerGame = await readFile(new URL("../app/games/codebreaker/index.tsx", import.meta.url), "utf8");
const heartsGame = await readFile(new URL("../app/games/hearts-and-horizons/index.tsx", import.meta.url), "utf8");
const museumGame = await readFile(new URL("../app/games/masterpiece-museum/index.tsx", import.meta.url), "utf8");

test("shared phone navigation exposes touch-friendly switchable panels", () => {
  assert.match(shared, /export function MobilePanelNav/);
  assert.match(css, /\.mobile-game-nav button\s*\{[^}]*min-height:\s*42px/s);
});

test("Global Sojourn separates telegram, map, and destination controls on phones", () => {
  assert.match(globalGame, /type MobileGlobalPanel = "map" \| "telegram"/);
  assert.match(globalGame, /global-mobile-destinations/);
  assert.match(css, /\.global-focus-lens,[\s\S]*?\.global-port-label\s*\{\s*display:\s*none/s);
  assert.match(css, /\.global-telegram\s*\{[^}]*position:\s*fixed/s);
});

test("Dapitan keeps the train viewport visible above an independently scrolling console", () => {
  assert.match(dapitanCss, /\.chronicle-game\s*\{[^}]*height:\s*calc\(100svh - 72px\)[^}]*grid-template-rows:\s*190px minmax\(0, 1fr\)/s);
  assert.match(dapitanCss, /\.chronicle-console\s*\{[^}]*overflow-y:\s*auto/s);
});

test("El Fili and Crossword use focused mobile work panels", () => {
  assert.match(revolutionGame, /type MobileRevolutionPanel = "case" \| "chain" \| "evidence"/);
  assert.match(crosswordGame, /type MobileCrosswordPanel = "answer" \| "puzzle" \| "clues"/);
  assert.match(css, /\.revolution-workspace > section\.is-mobile-active\s*\{\s*display:\s*block/s);
  assert.match(css, /\.crossword-editor\.is-mobile-clue-index/);
});

test("the pre-game How to Play screen keeps its own scroll even on games that lock the gameplay viewport", () => {
  // Regression test: an earlier revision scoped `overflow: hidden` to the bare
  // .game-{id} class, which is also the class on the outer <GameOverlay> that
  // wraps BOTH the instructions screen and the live game, making the Start
  // button unreachable on phones once the instructions text overflowed one
  // screen. The fix gates every such rule behind .is-playing, which the shell
  // only adds once the player has left the instructions screen.
  assert.match(arcadeShell, /className=\{`game-overlay game-\$\{game\} \$\{started \? "is-playing" : ""\}`\}/);
  for (const gameClass of ["game-values", "game-novels", "game-global", "game-revolution", "game-crossword"]) {
    assert.doesNotMatch(css, new RegExp(`(?<!\\.is-playing[^{]*)\\.${gameClass}\\s*\\{[^}]*overflow:\\s*hidden`, "s"), `${gameClass} must not lock overflow outside of .is-playing`);
    assert.match(css, new RegExp(`\\.${gameClass}\\.is-playing\\s*\\{[^}]*overflow:\\s*hidden`, "s"), `${gameClass}.is-playing should still lock the gameplay viewport`);
  }
});

test("Global Sojourn's on-map pins are locational reference only, not fiddly tap targets, on phones", () => {
  assert.match(css, /\.global-port, \.global-port-anchor \{ pointer-events: none; \}/);
});

test("Codebreaker splits the decode workbench and the clue telegram into phone tabs", () => {
  assert.match(codebreakerGame, /type MobileCodebreakerPanel = "decode" \| "clues"/);
  assert.match(codebreakerGame, /MobilePanelNav/);
  assert.match(css, /\.cipher-workbench, \.manual-code-grid \.clue-telegram \{ display: none;/);
});

test("Scholar's Journey keeps the brief and passport tray fixed while only the route scrolls", () => {
  assert.match(css, /\.scholar-game \{ height: calc\(100svh - 72px\)[^}]*grid-template-rows: auto auto minmax\(0, 1fr\) auto/s);
  assert.match(css, /\.scholar-route \{[^}]*overflow-y:\s*auto/s);
});

test("Hearts & Horizons and Masterpiece Museum become switchable evidence/choice panels on phones", () => {
  assert.match(heartsGame, /type MobileHeartsPanel = "evidence" \| "identity" \| "horizon"/);
  assert.match(museumGame, /type MobileMuseumPanel = "artifact" \| "gallery" \| "plaque"/);
  assert.match(css, /\.hearts-workspace, \.museum-workspace \{/);
  // The result panel must take over the workspace instead of competing with the (disabled) choice panels.
  assert.match(css, /\.hearts-workspace:has\(\.hearts-feedback\) \.hearts-desk,\s*\n\s*\.museum-workspace:has\(\.museum-feedback\) \.museum-floor \{ display: none; \}/);
});

