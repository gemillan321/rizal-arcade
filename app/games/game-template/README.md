# New game template

1. Copy this entire folder and rename it with a short kebab-case game name.
2. Rename `GameTemplate` to the real game component.
3. Define the focused module topic before writing mechanics.
4. Replace the sample content type with the game's real challenge schema.
5. Build and test only inside the new folder.
6. Add local, licensed assets under `public/art/` or `public/audio/` and document their credits.
7. Open a pull request without editing `app/games/registry.tsx`; the project integrator registers approved games.

Every finished game must include instructions, at least 50 sourced challenges, randomized rounds, readable responsive text, keyboard and touch controls, audio controls, scoring, results, replay, and content tests.
