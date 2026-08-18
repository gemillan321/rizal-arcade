# Rizal Arcade

**History you can play.** Rizal Arcade is a mobile-friendly educational game portal about José Rizal’s life, novels, writings, civic ideas, and historical world.

The prototype takes the familiar pick-and-play feel of Friv or Y8 and gives it a distinctly Filipino “historical arcade” identity for college Rizal Life classes. Students can play instantly without an account, complete a round in two to five minutes, and see a short explanation plus a source after every answer.

## Playable games

- **Rizal River Quest** — move a frog along a six-jump river route by choosing the value that best fits each modern scenario. Wrong answers cost a life and do not advance the frog. Every mapping is clearly labeled as an interpretation.
- **Novel Case Files** — play a 12-card memory game that pairs clearly labeled artistic character portraits and specific clues with names from *Noli Me Tángere* and *El Filibusterismo*.
- **Rizal Codebreaker** — manually decode an Atbash substitution cipher with the supplied alphabet key, then file the archive slip into the correct drawer.

All three games include optional, locally synthesized sound effects. They do not download audio or contact an external audio service while students play.

The home page also previews future modules for Rizal’s education and travels, documented relationships, and literary works.

## Classroom safeguards

- Facts and explanations link to primary texts, public-domain translations, or National Historical Commission of the Philippines markers.
- Interpretive claims are labeled instead of presented as direct quotations or uncontested facts.
- Alternate spellings and common translated titles are accepted in the codebreaker.
- Memory clues name the relevant person, relationship, and event directly instead of relying on unclear pronouns.
- A Rizal Life instructor should review wording, translations, and interpretations before formal classroom release.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Validate the production build with:

```bash
npm test
```

For Vercel, import the repository as a project. The included `vercel.json` uses the dedicated static build:

```bash
npm run build:vercel
```

The generated site is written to `vercel-dist/`. Games, device high scores, and device leaderboards work without environment variables or a paid service.

## Optional class leaderboard with Supabase

The site can reuse an existing Supabase project; a second project is not required.

1. Open the Supabase SQL Editor and run [`supabase/rizal_arcade_scores.sql`](supabase/rizal_arcade_scores.sql).
2. Copy `.env.example` to `.env.local` for local development.
3. Set `VITE_SUPABASE_URL` to the project URL and `VITE_SUPABASE_PUBLISHABLE_KEY` to the public publishable key.
4. Add the same two variables to the Vercel project and redeploy.

The browser receives only the public publishable key—never add a service-role key. Score writes go through a narrowly validated database function, while public reads expose only player name, game, score, and date. If Supabase is absent or temporarily unavailable, the site automatically keeps a device-only leaderboard.

This lightweight board is intended for friendly classroom play. Because each game runs in the student’s browser, it validates score ranges but is not cheat-proof; use server-verified gameplay and rate limiting before attaching grades or prizes to rankings.

## Technology

React 19, TypeScript, Tailwind CSS, vinext, and an optional Supabase leaderboard. The prototype has no required accounts, ads, or tracking.

## Visual archive

The arcade uses locally hosted public-domain or CC0 historical visuals, including an 1883 portrait of Rizal, an 1898 Manila map, a historic *Noli Me Tangere* cover, a handwritten Rizal letter, and period poster art. Full source and license notes are in [`ASSET_CREDITS.md`](ASSET_CREDITS.md).

## Core references

- [NHCP Registry: José Rizal](https://philhistoricsites.nhcp.gov.ph/registry_database/jose-rizal-1861-1896-9/)
- [*Noli Me Tangere* / *The Social Cancer*](https://www.gutenberg.org/ebooks/6737)
- [*El Filibusterismo* / *The Reign of Greed*](https://www.gutenberg.org/ebooks/10676)
- [Letter to the Young Women of Malolos](https://www.gutenberg.org/ebooks/17116)
- [*The Indolence of the Filipino*](https://www.gutenberg.org/ebooks/6885)
- [NHCP Registry: La Liga Filipina](https://philhistoricsites.nhcp.gov.ph/registry_database/la-liga-filipina/)

This is an educational prototype, not an official publication of the NHCP or any school.
