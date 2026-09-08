import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const codebreakerSource = await readFile(new URL("../app/games/codebreaker/index.tsx", import.meta.url), "utf8");

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

test("Codebreaker's substitution key renders every letter as its own cell instead of a compressed string", () => {
  // Regression: CODE and TEXT each rendered as a single unbroken 26-character
  // <code> string relying only on `letter-spacing` for separation, which read as
  // a near-solid block (and got even tighter under a phone-width letter-spacing
  // override). The key now maps each letter into its own grid cell across two
  // 13-letter groups, so CODE/TEXT stay aligned and legible without ever
  // shrinking past readability or overflowing at 320px.
  assert.doesNotMatch(
    codebreakerSource,
    /<code>ABCDEFGHIJKLMNOPQRSTUVWXYZ<\/code>/,
    "the full alphabet must not render as one unbroken string",
  );
  assert.match(codebreakerSource, /ATBASH_GROUPS\s*=\s*\[0,\s*13\]\.map/, "expected the key to split into two 13-letter groups");
  assert.match(codebreakerSource, /className="cipher-key-letters"/, "expected a per-letter grid container");
  assert.match(
    codebreakerSource,
    /group\.code\.map\(\(letter, index\) => <span key=\{index\}>\{letter\}<\/span>\)/,
    "expected each CODE letter to render as its own <span> cell",
  );
  // The decorative letter grid is aria-hidden; the complete mapping must still
  // reach assistive tech via the container's aria-label.
  assert.match(codebreakerSource, /ATBASH_FULL_MAPPING\s*=\s*ATBASH_ALPHABET\.split\(""\)\.map/, "expected a computed full-mapping string");
  assert.match(codebreakerSource, /aria-label=\{`Atbash substitution key, full mapping: \$\{ATBASH_FULL_MAPPING\}`\}/);
  assert.match(codebreakerSource, /className="cipher-key-table" aria-hidden="true"/, "the letter grid itself must be aria-hidden");
});

test("Global Sojourn's traveler token never covers a destination pin or the Manila label while idle", () => {
  // Regression: the traveler token always renders exactly on the player's
  // currentPosition (Manila at the start of every round), as a large fixed-size
  // icon (up to 60px) positioned by map percentage — so on a map surface under
  // roughly 1200px wide/tall (i.e. almost every real viewport), its footprint
  // reliably swallowed the tiny Manila origin pin/label and, when a round's
  // option sat close by on the map (e.g. Hong Kong, 5 map-units from Manila),
  // that option's own numbered pin too. The idle marker is now small (20px)
  // *and* painted below (lower z-index than) .global-origin-pin and .global-port,
  // so whichever destination marker it coincides with always renders on top and
  // stays fully legible; the full-size ship returns only for the .is-traveling
  // animation between ports.
  // `.global-traveler { ... }` also appears, unrelated, in an older dead-code
  // layout block earlier in the stylesheet — anchor on --traveler-x, which only
  // the real (percentage-positioned) rule declares, to find the right one.
  const idleRule = css.match(/\.global-traveler \{([^}]*--traveler-x[^}]*)\}/s);
  assert.ok(idleRule, "expected a base .global-traveler rule");
  const idleWidth = Number(idleRule[1].match(/width:\s*(\d+)px/)?.[1]);
  const idleZ = Number(idleRule[1].match(/z-index:\s*(-?\d+)/)?.[1]);
  assert.ok(idleWidth > 0 && idleWidth <= 28, `idle traveler must be a small marker, got ${idleWidth}px`);

  const portZ = Number(css.match(/\.global-port \{[^}]*z-index:\s*(-?\d+)/s)?.[1]);
  const originZ = Number(css.match(/\.global-origin-pin \{[^}]*z-index:\s*(-?\d+)/s)?.[1]);
  assert.ok(Number.isFinite(portZ) && Number.isFinite(originZ), "expected z-index on .global-port and .global-origin-pin");
  assert.ok(idleZ < portZ, `idle traveler (z-index ${idleZ}) must paint below .global-port (z-index ${portZ})`);
  assert.ok(idleZ < originZ, `idle traveler (z-index ${idleZ}) must paint below .global-origin-pin (z-index ${originZ})`);

  const travelingRule = css.match(/\.global-traveler\.is-traveling \{([^}]*)\}/s);
  assert.ok(travelingRule, "expected a .global-traveler.is-traveling rule restoring the full ship");
  const travelingWidth = Number(travelingRule[1].match(/width:\s*(\d+)px/)?.[1]);
  assert.ok(travelingWidth >= 50, `the ship should still be prominent while traveling, got ${travelingWidth}px`);
});
