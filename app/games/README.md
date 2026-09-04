# Rizal Arcade game modules

Every game owns one folder. Contributors should work only inside the folder assigned to them unless the pull request explicitly explains a shared-file change.

## Current modules

| Folder | Game | Status |
| --- | --- | --- |
| `river-quest/` | Rizalian Values: River Quest | Live |
| `noli-case-files/` | Noli Case Files | Live |
| `codebreaker/` | Rizal Roots: Codebreaker | Live |
| `scholars-journey/` | Scholar's Journey | Live |
| `hearts-and-horizons/` | Hearts & Horizons | Live |
| `masterpiece-museum/` | Masterpiece Museum | Live |
| `global-sojourn/` | Global Sojourn | Live route-building game with 50 travel dossiers |
| `el-fili-revolution-files/` | El Fili: Revolution Files | Live causal-chain strategy game with 12 sourced case files |
| `rizal-crossword/` | Rizal & the Nation: Crossword Chronicle | Live randomized connected crossword |
| `game-template/` | Reusable starter | Copy this for a new game |

## Architecture

- `shared/ArcadeGameKit.tsx` contains the approved audio, header, results, local-best, and leaderboard behavior.
- `types.ts` contains the small component contract every game follows.
- `registry.tsx` is the only integration point for live games and their arcade cards.
- Each game folder contains its full React gameplay component.
- Historical challenge banks remain typed data modules so content can be reviewed separately from mechanics.

## Safe contributor workflow

1. Start from the latest `main` branch and create a branch named `game/<short-game-name>`.
2. Copy `game-template/` into a new folder or work only in the game folder assigned to you.
3. Do not edit `registry.tsx`, authentication, leaderboards, API routes, Supabase files, or Vercel settings. The project integrator connects an approved game.
4. Do not commit `.env` files, passwords, Supabase secrets, or downloaded copyrighted media.
5. Run `npm run lint` and `npm test` before opening a pull request.
6. Include sources and asset licenses in the pull request.
