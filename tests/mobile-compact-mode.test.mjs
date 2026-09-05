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

test("Global Sojourn shows the map, destinations, and telegram together instead of behind a tab", () => {
  // Regression: the map/telegram tab toggle was removed after feedback that the
  // telegram fit in the available space without needing to switch away from the map.
  assert.doesNotMatch(globalGame, /MobilePanelNav/);
  assert.match(globalGame, /global-mobile-destinations/);
  assert.match(css, /\.global-focus-lens,[\s\S]*?\.global-port-label\s*\{\s*display:\s*none/s);
  assert.doesNotMatch(css, /\.global-telegram\s*\{[^}]*position:\s*fixed/s);
  assert.match(css, /\.global-atlas-shell\s*\{[^}]*display:\s*flex/s);
});

test("Dapitan keeps the train viewport visible above an independently scrolling console", () => {
  assert.match(dapitanCss, /\.chronicle-game\s*\{[^}]*height:\s*calc\(100svh - 72px\)[^}]*grid-template-rows:\s*190px minmax\(0, 1fr\)/s);
  assert.match(dapitanCss, /\.chronicle-console\s*\{[^}]*overflow-y:\s*auto/s);
});

test("El Fili keeps the chain and evidence tray both on screen, with the case file as a collapsible toggle", () => {
  // Regression: the case/chain/evidence 3-tab nav was replaced because the chain
  // and evidence tray are the actual gameplay and shouldn't require switching
  // away from each other; only the read-once case briefing collapses now.
  // It starts closed so a first-time player sees the actual game immediately.
  assert.doesNotMatch(revolutionGame, /MobilePanelNav/);
  assert.match(revolutionGame, /const \[briefingOpen, setBriefingOpen\] = useState\(false\)/);
  assert.match(css, /\.revolution-chain\s*\{[^}]*flex:\s*0 0 auto/s);
  assert.match(css, /\.revolution-briefing\.is-mobile-open/);
});

test("El Fili's workspace scrolls as one piece instead of squeezing the evidence tray to invisible", () => {
  // Regression: chain had a fixed max-height and didn't shrink (flex: 0 0 auto)
  // while evidence absorbed "whatever's left" (flex: 1 1 auto; min-height: 0),
  // which could compress the evidence tray to a sliver with no visible scroll
  // affordance — reported as "wasn't able to see fragments". The fix makes the
  // whole workspace the one scroll container and lets every section size to
  // its natural height, so nothing is ever silently squeezed away.
  assert.match(css, /\.revolution-workspace\s*\{[^}]*overflow-y:\s*auto/s);
  assert.doesNotMatch(css, /\.revolution-chain\s*\{[^}]*max-height/s);
  assert.doesNotMatch(css, /\.revolution-evidence\s*\{[^}]*flex:\s*1 1 auto/s);
  assert.match(css, /\.revolution-controls\s*\{[^}]*position:\s*sticky/s);
});

test("Crossword keeps the puzzle grid and answer desk both on screen, with the clue list as a collapsible toggle", () => {
  // Regression: tapping any grid cell already selects its clue, so the clue list
  // is a supplementary browse view, not a required tab alongside puzzle/answer.
  assert.doesNotMatch(crosswordGame, /MobilePanelNav/);
  assert.match(crosswordGame, /clueListOpen/);
  assert.match(css, /\.crossword-clue-index\.is-mobile-open/);
  assert.match(css, /\.crossword-broadsheet\s*\{[^}]*flex:\s*0 0 auto/s);
  assert.match(css, /\.crossword-editor\s*\{[^}]*flex:\s*1 1 auto/s);
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

test("Hearts & Horizons and Masterpiece Museum advance through their two choices automatically instead of via manual tabs", () => {
  // Regression: the evidence/identity/horizon (and artifact/gallery/plaque) tab
  // nav was replaced by a derived step that advances on its own as picks are
  // made, so a first-time player never has to decide which tab to open next.
  assert.doesNotMatch(heartsGame, /MobilePanelNav/);
  assert.match(heartsGame, /const mobileStep: "identity" \| "horizon" \| "ready"/);
  assert.doesNotMatch(museumGame, /MobilePanelNav/);
  assert.match(museumGame, /const mobileStep: "gallery" \| "plaque" \| "ready"/);
  assert.match(css, /\.hearts-workspace, \.museum-workspace \{/);
  assert.match(css, /grid-template-areas:\s*"nav" "evidence" "panel" "actions"/);
  // The result panel must take over the workspace instead of competing with the (disabled) choice panels.
  assert.match(css, /\.hearts-workspace:has\(\.hearts-feedback\) \.hearts-desk,\s*\n\s*\.museum-workspace:has\(\.museum-feedback\) \.museum-floor \{ display: none; \}/);
});

test("Hearts & Horizons keeps identity-panel, dossier, horizon-panel in that DOM order for the desktop 3-column layout", () => {
  // Regression: .hearts-desk on desktop is `grid-template-columns: 218px 1fr 218px`
  // with no grid-area assignment, so column placement is purely by source order.
  // An earlier revision reordered the dossier to be first (for an approach the
  // mobile-area CSS didn't actually need), which squeezed the wide dossier into
  // the narrow first column and stretched the identity panel into the middle —
  // reported as "broken" on desktop.
  const identityIndex = heartsGame.indexOf("identity-panel");
  const dossierIndex = heartsGame.indexOf("hearts-dossier");
  const horizonIndex = heartsGame.indexOf("horizon-panel");
  assert.ok(identityIndex < dossierIndex, "identity-panel must come before hearts-dossier in the JSX");
  assert.ok(dossierIndex < horizonIndex, "hearts-dossier must come before horizon-panel in the JSX");
});

test("Masterpiece Museum drops the decorative interior illustration on phones to declutter the first glance", () => {
  assert.match(css, /\.museum-art-window\s*\{\s*display:\s*none;\s*\}/);
  assert.match(css, /\.museum-mobile-step\s*\{[^}]*text-transform:\s*none/s);
});

