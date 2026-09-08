import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("River Quest's keyboard focus ring never reads as the brass 'correct answer' reveal", () => {
  // Regression: the site-wide `button:focus-visible` rule outlines in var(--brass),
  // the same color .lily-pad.correct-pad uses for its reveal ring. Since the game
  // auto-focuses the first lily pad after every question, a keyboard player would
  // see a brass ring around whichever pad landed in slot one — and when the
  // shuffle happened to put the correct answer there, it looked pre-highlighted
  // before any answer was chosen. Lily pads now get the same plain white focus
  // ring already used elsewhere in the arcade (.global-port, .scholar-stop).
  assert.match(css, /\.lily-pad:focus-visible\s*\{[^}]*outline-color:\s*#fff/s);
});

test("Scholar's Journey keeps its full HUD (including Lives) visible on phone widths", () => {
  // Regression: the legacy `.game-hud > span { display: none }` rule at max-width:
  // 700px only re-shows the first and last stat (`:first-child`/`:last-child`),
  // and every GameHeader always renders a sound-toggle button before the stat
  // spans, so no span is ever truly :first-child. That silently hid Scholar's
  // Journey's middle stat — its Lives counter — on phones. Hearts, Museum,
  // Dapitan, and Crossword already got an explicit phone-HUD fix restoring every
  // stat; Scholar's Journey needs the same fix, not a bespoke Lives implementation.
  const phoneSafeguards = css.slice(css.indexOf("/* Final phone safeguards."));
  const hudFixRule = /:is\(([^)]*)\)\s*\.game-hud > span\s*\{\s*display:\s*flex/;
  const match = phoneSafeguards.match(hudFixRule);
  assert.ok(match, "expected a phone-HUD fix restoring every .game-hud > span");
  assert.ok(match[1].includes("game-scholar"), "Scholar's Journey (.game-scholar) must be included in the phone HUD fix");
});

test("Hearts & Horizons choice buttons never light up in the same gold used for the active-stage trail", () => {
  // Regression: the site-wide `button:focus-visible` rule outlines in var(--brass),
  // which is close in hue to the "current stage" gold this game already uses for
  // its dossier trail (`.hearts-route .is-current`) and its journey-postmark
  // badges (`.horizon-panel button > i`, background #e4ad53). Tabbing to an
  // unselected identity/place option showed the same warm gold ring, so a
  // keyboard player could read a merely-focused (not yet chosen) option as the
  // active stage. Choice buttons now get the same plain white focus ring used
  // elsewhere in the arcade instead of the site-wide brass default.
  assert.match(css, /\.hearts-choice-panel button:focus-visible\s*\{[^}]*outline-color:\s*#fff/s);
});

test("Global Sojourn's compass score readout is never crossed out by its own decorative rose", () => {
  // Regression: the compass badge's decorative crest (two diagonal bars forming
  // an X, meant to evoke a compass rose) ran the full diameter of the circle in
  // solid var(--brass)-toned color, passing directly behind the score digits it
  // sits behind — reading as if the score were struck through / crossed out. The
  // bars now fade to transparent across their middle so they never overlap the
  // text they surround.
  assert.match(
    css,
    /\.global-compass-score::before, \.global-compass-score::after \{[^}]*background:\s*linear-gradient\(to bottom,[^}]*transparent[^}]*\)/s,
  );
});
