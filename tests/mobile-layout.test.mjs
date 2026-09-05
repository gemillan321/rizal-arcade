import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const phoneSafeguards = css.slice(css.indexOf("/* Final phone safeguards."));

test("the document itself may shrink below legacy 320px layout widths", () => {
  assert.match(css, /body\s*\{[^}]*min-width:\s*0/s);
  assert.doesNotMatch(css, /body\s*\{[^}]*min-width:\s*320px/s);
});

test("the final phone cascade forces one full-width arcade card per row", () => {
  assert.match(phoneSafeguards, /@media \(max-width: 700px\)/);
  assert.match(phoneSafeguards, /\.game-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)\s*!important/s);
  assert.match(phoneSafeguards, /\.game-grid > \.game-card[\s\S]*?width:\s*100%/);
  assert.match(phoneSafeguards, /\.game-copy h3\s*\{[^}]*overflow-wrap:\s*anywhere/s);
});

test("phone card labels use separate lanes instead of overlapping artwork text", () => {
  assert.match(phoneSafeguards, /\.game-skill\s*\{[^}]*bottom:\s*0[^}]*width:\s*100%/s);
  assert.match(phoneSafeguards, /\.card-scene > strong\s*\{[^}]*bottom:\s*55px/s);
});

test("Game 9 replaces its sideways phone ledger with a compact grid", () => {
  assert.match(phoneSafeguards, /\.revolution-file-rail\s*\{[^}]*overflow-x:\s*visible/s);
  assert.match(phoneSafeguards, /\.revolution-file-rail ol\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s);
});
