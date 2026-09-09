import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const arcadeSource = await readFile(new URL("../app/RizalArcade.tsx", import.meta.url), "utf8");
const codebreakerSource = await readFile(new URL("../app/games/codebreaker/index.tsx", import.meta.url), "utf8");
const sharedGameSource = await readFile(new URL("../app/games/shared/ArcadeGameKit.tsx", import.meta.url), "utf8");

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
  // Every status item now lives in the same compact phone rail. There is no
  // first/last-child exception that can silently hide the middle Lives item.
  const phoneStatusRule = css.match(/@media \(max-width: 700px\) \{[\s\S]*?\.game-hud > span\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.match(phoneStatusRule, /display:\s*flex/);
  assert.doesNotMatch(phoneStatusRule, /display:\s*none/);
});

test("game progress is separated from the navigation row", () => {
  assert.match(sharedGameSource, /status\.length > 0 && <div className="game-hud" aria-label="Current game status">/);
  assert.doesNotMatch(sharedGameSource, /<div className="game-hud">\s*\{onToggleSound/);
  assert.match(css, /\.game-hud\s*\{[^}]*position:\s*absolute;[^}]*bottom:\s*0;[^}]*border-top:/s);
  assert.match(css, /\.game-header\.has-status\s*\{[^}]*height:\s*96px;[^}]*padding-bottom:\s*36px/s);
  assert.match(css, /@media \(max-width: 700px\) \{[\s\S]*?\.game-header\.has-status\s*\{[^}]*height:\s*84px;[^}]*padding-bottom:\s*36px/s);
  assert.match(css, /\.game-hud\s*\{[^}]*min-height:\s*36px;[^}]*border-top:\s*2px/s);
});

test("private-network dev previews can launch every game without weakening production auth", () => {
  assert.match(arcadeSource, /function isLocalPreviewHost\(hostname: string\)/);
  assert.match(arcadeSource, /env\?: \{ DEV\?: boolean \}/);
  assert.match(arcadeSource, /\^192\\\.168\\\./);
  assert.match(arcadeSource, /if \(!devMode\) return false/);
  assert.match(arcadeSource, /isLocalPreviewHost\(window\.location\.hostname\)/);
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

test("Codebreaker's substitution key keeps one continuous aligned A-Z lookup", () => {
  // Regression: the first spacing fix split the lookup into two boxed 13-letter
  // tables. That made users jump between separate CODE/TEXT pairs instead of
  // reading one direct A-Z-to-Z-A mapping. The key must remain two continuous
  // rows while equal grid columns supply the spacing and vertical alignment.
  assert.doesNotMatch(
    codebreakerSource,
    /<code>ABCDEFGHIJKLMNOPQRSTUVWXYZ<\/code>/,
    "the full alphabet must not render as one unbroken string",
  );
  assert.doesNotMatch(codebreakerSource, /ATBASH_GROUPS/, "the mapping must not split into multiple lookup tables");
  assert.match(codebreakerSource, /ATBASH_CODE_LETTERS\s*=\s*ATBASH_ALPHABET\.split\(""\)/);
  assert.match(codebreakerSource, /ATBASH_TEXT_LETTERS\s*=\s*ATBASH_MIRROR\.split\(""\)/);
  assert.match(
    codebreakerSource,
    /ATBASH_CODE_LETTERS\.map\(\(letter\) => <span key=\{letter\}>\{letter\}<\/span>\)/,
    "expected each CODE letter to render in the first continuous row",
  );
  assert.match(codebreakerSource, /ATBASH_TEXT_LETTERS\.map\(\(letter\) => <span key=\{letter\}>\{letter\}<\/span>\)/);
  assert.match(css, /\.cipher-key-letters\s*\{[^}]*grid-template-columns:\s*repeat\(26,/s, "expected 26 equal lookup columns");
  // The decorative letter grid is aria-hidden; the complete mapping must still
  // reach assistive tech via the container's aria-label.
  assert.match(codebreakerSource, /ATBASH_FULL_MAPPING\s*=\s*ATBASH_ALPHABET\.split\(""\)\.map/, "expected a computed full-mapping string");
  assert.match(codebreakerSource, /aria-label=\{`Atbash substitution key, full mapping: \$\{ATBASH_FULL_MAPPING\}`\}/);
  assert.match(codebreakerSource, /className="cipher-key-table" aria-hidden="true"/, "the letter grid itself must be aria-hidden");
});

test("Global Sojourn keeps the next-telegram action visible in the shallow phone map", () => {
  // Regression: the arrival card was scrollable as one block inside the phone
  // map. Its copy consumed the available height and placed the action below the
  // clipped surface. The action now owns a fixed second grid row while only the
  // copy column can scroll.
  const phoneSafeguards = css.slice(css.indexOf("/* Game 7: the map shrinks"));
  assert.match(phoneSafeguards, /\.global-arrival-scene\s*\{[^}]*top:\s*4px;[^}]*bottom:\s*4px;[^}]*overflow:\s*hidden;[^}]*grid-template-rows:\s*minmax\(0,\s*1fr\)\s*36px/s);
  assert.match(phoneSafeguards, /\.global-arrival-scene > div:nth-child\(2\)\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(phoneSafeguards, /\.global-arrival-scene > button\s*\{[^}]*min-height:\s*36px/s);
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
