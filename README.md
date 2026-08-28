# Rizal Arcade

**History you can play.** Rizal Arcade is a mobile-friendly educational game portal about José Rizal’s life, novels, writings, civic ideas, and historical world.

The classroom edition takes the familiar pick-and-play feel of Friv or Y8 and gives it a distinctly Filipino “historical arcade” identity for college Rizal Life classes. Official roster accounts connect each two-to-five-minute round to the correct student and section, while every answer still opens a short explanation plus a source.

## Playable games

- **Rizal River Quest** — move a frog along a six-jump river route by choosing the value that best fits each modern scenario. Wrong answers cost a life and do not advance the frog. Every mapping is clearly labeled as an interpretation.
- **Novel Case Files** — play a 12-card memory game that pairs clearly labeled artistic character portraits and specific clues with names from *Noli Me Tángere* and *El Filibusterismo*.
- **Rizal Codebreaker** — manually decode an Atbash substitution cipher with the supplied alphabet key, then file the archive slip into the correct drawer.
- **Scholar’s Journey** — study six records along Rizal’s academic route, pack them into a passport tray, then stamp each record at its remembered learning station. Correct placements move the Rizal traveller forward.
- **Hearts & Horizons** — inspect a portrait dossier, match the woman to the evidence and place in Rizal’s journey, then seal and send the correspondence.
- **Masterpiece Museum** — inspect an artifact, choose among five genre galleries, attach the historically accurate curatorial plaque, and install a randomized six-exhibit collection.

All six games include optional sound effects and locally hosted background music. Scholar’s Journey adds a licensed page-turn recording; the remaining action cues are synthesized by the browser. Nothing is downloaded from an external audio service while students play.

The home page also previews future modules about Rizal’s global journeys, trial, and legacy.

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

The generated site is written to `vercel-dist/`. The public landing page builds without environment variables, but student sign-in, roster import, score saving, and leaderboards require the Supabase configuration below.

## Classroom accounts and section leaderboards with Supabase

The site can reuse an existing Supabase project; a second project is not required.

1. Open the Supabase SQL Editor and run [`supabase/rizal_arcade_scores.sql`](supabase/rizal_arcade_scores.sql). This replaces the old prototype nickname leaderboard and removes its unverified scores.
2. In Supabase Authentication, create the single administrator as an email/password user.
3. In the SQL Editor, promote that user with `select public.promote_rizal_arcade_admin('professor@school.edu', 'Professor');`, replacing both values.
4. Copy `.env.example` to `.env.local` for local development.
5. Set the browser-safe `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` values.
6. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the protected roster-import functions.
7. Add all four variables to the Vercel project. Mark `SUPABASE_SERVICE_ROLE_KEY` as sensitive, keep it server-only, and redeploy.

The browser receives only the public publishable key. The service-role key exists only inside Vercel Functions and must never use the `VITE_` prefix. The protected import endpoint verifies the signed-in administrator before it creates accounts. Students sign in with Student ID plus a temporary password, change that password on first use, and can read only their assigned section’s scores through row-level security.

Uploading the same section again updates matching Student IDs without resetting their passwords. Newly created credentials are returned once for CSV download. Password resets generate a fresh temporary password and require another first-login change.

The board is intended for friendly classroom play. Because each game runs in the student’s browser, score ranges and identity are validated but gameplay is not cheat-proof; add server-verified rounds before attaching grades or prizes to rankings.

## Technology

React 19, TypeScript, Tailwind CSS, vinext, Vercel Functions, and Supabase Auth/Postgres. The classroom edition has no ads or tracking.

## Visual archive

The arcade uses locally hosted public-domain or CC0 historical visuals, including an 1883 portrait of Rizal, an image of him at eighteen, Madrid university buildings, an 1898 Manila map, a historic *Noli Me Tangere* cover, a handwritten Rizal letter, and period poster art. Full source and license notes are in [`ASSET_CREDITS.md`](ASSET_CREDITS.md).

## Core references

- [NHCP Registry: José Rizal](https://philhistoricsites.nhcp.gov.ph/registry_database/jose-rizal-1861-1896-9/)
- [*Noli Me Tangere* / *The Social Cancer*](https://www.gutenberg.org/ebooks/6737)
- [*El Filibusterismo* / *The Reign of Greed*](https://www.gutenberg.org/ebooks/10676)
- [Letter to the Young Women of Malolos](https://www.gutenberg.org/ebooks/17116)
- [*The Indolence of the Filipino*](https://www.gutenberg.org/ebooks/6885)
- [*The Philippines a Century Hence*](https://www.gutenberg.org/ebooks/35899)
- [Museo ni Rizal](https://intramuros.gov.ph/mnr/)
- [National Museum: Dr. José Rizal Hall](https://www.nationalmuseum.gov.ph/exhibitions/fine-arts/galley-5/)
- [NHCP Registry: La Liga Filipina](https://philhistoricsites.nhcp.gov.ph/registry_database/la-liga-filipina/)

This is an educational prototype, not an official publication of the NHCP or any school.
