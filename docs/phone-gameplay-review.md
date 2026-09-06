# Phone gameplay review

Reviewed Claude’s commits `0db9900`, `525b414`, and `5fc444d` on `preview/mobile-compact-games`. The fix branch starts at `5fc444d`.

## Findings and changes

- **Crossword:** the 27px cells made wide puzzles overflow. The initial phone view now fits both the grid width and available height, with an optional enlarge control. The answer desk stays below it, and selecting a clue does not open the phone keyboard automatically.
- **Dapitan:** pointer-up handlers submitted the answer immediately; numeric keyboard shortcuts did too. Selecting and submitting are now separate. Phones use large answer buttons with the question always visible. Desktop keeps the railway controls, with confirmation after a lever selection and deliberate cargo loading. Slider arrow keys work, canceled pointers do not submit, and a synchronous guard prevents repeated confirmation from awarding points twice.
- **Hearts:** the anonymous illustration occupied almost all of a dossier capped at 34svh. On phones the decoration is removed and all three written clues sit above the active choices. The evidence no longer has a separate scrollbar. An incorrect choice previously resurfaced for only 700ms; it now stays open until corrected, preserving any correct choice. Desktop keeps the original three-column order.
- **Museum:** the five gallery choices and three plaque choices still required two independent matches, despite the sequential phone presentation. Replaced this with six label inspections: compare a proposed label with three archive clues, choose Keep or Replace, then explicitly confirm. Each decision reveals the accurate interpretation and source. A session mixes three accurate and three misleading labels; four lives and the existing 1110-point ceiling remain. Museum uses the same rules on phone and desktop.
- **Header:** legacy selectors hid the audio icon and selected the sound button as the first HUD child, hiding lives and round progress on phones. The four revised games now show compact status details beneath their titles; the sound icon is visible throughout the arcade.

Global Sojourn, Scholar’s Journey, Codebreaker, Noli Case Files, River Quest, and Revolution Files retain their gameplay.

## Validation

- Both production builds and all 64 repository tests pass.
- ESLint passes for the changed React and TypeScript modules.
- Chromium checks at 320×568, 360×640, 390×844, and 430×932: no sideways page overflow; full crossword visible in fit mode; Hearts evidence has no inner scroll.
- Completed six Hearts dossiers (including a wrong answer and correction), six Museum inspections, and all ten Dapitan files across its three task types.
- Checked crossword enlargement, clue navigation, wrong-answer feedback, and a solved word.
- Desktop checks at 1440×900, including actual pointer releases, arrow keys, and separate confirmation for both Dapitan levers.
- Browser console has no runtime errors. Physical iOS/Android devices have not been tested; their keyboard and browser chrome can differ from Chromium viewport emulation.

The existing project-wide `tsc --noEmit` check reports missing Cloudflare Worker globals (`cloudflare:workers`, `Fetcher`, and `D1Database`). The changed modules introduce no additional diagnostics; the normal build and test scripts pass.

## Repeating the browser checks

Start the Vercel development entry with `node node_modules/vite/bin/vite.js --config vite.vercel.config.ts --host 127.0.0.1 --port 5173`. Set `AGENT_BROWSER_CLI` to an installed agent-browser JavaScript entry point, then run `node tests/phone-gameplay.browser.mjs`. Optional `TEST_URL` selects a different preview; `TEST_FROM=crossword` or `TEST_FROM=controls` resumes those later checks. Screenshots go to the ignored `work/phone-review` directory.

This change targets a branch preview. Production hosting and authentication configuration are unchanged.
