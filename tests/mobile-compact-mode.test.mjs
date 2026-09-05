import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const dapitanCss = await readFile(new URL("../app/games/dapitan-to-bagumbayan/dapitan.css", import.meta.url), "utf8");
const shared = await readFile(new URL("../app/games/shared/ArcadeGameKit.tsx", import.meta.url), "utf8");
const globalGame = await readFile(new URL("../app/games/global-sojourn/index.tsx", import.meta.url), "utf8");
const revolutionGame = await readFile(new URL("../app/games/el-fili-revolution-files/index.tsx", import.meta.url), "utf8");
const crosswordGame = await readFile(new URL("../app/games/rizal-crossword/index.tsx", import.meta.url), "utf8");

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

