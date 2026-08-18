# Rizal Arcade

**History you can play.** Rizal Arcade is a mobile-friendly educational game portal about José Rizal’s life, novels, writings, civic ideas, and historical world.

The prototype takes the familiar pick-and-play feel of Friv or Y8 and gives it a more mature “living archive” identity for college Rizal Life classes. Students can play instantly without an account, complete a round in two to five minutes, and see a short explanation plus a source after every answer.

## Playable games

- **Values in Motion** — connect modern scenarios with ideas grounded in Rizal’s writings and La Liga Filipina. Every mapping is clearly labeled as an interpretation.
- **Novel Case Files** — identify characters from *Noli Me Tángere* and *El Filibusterismo* from progressively revealed clues.
- **Rizal Codebreaker** — solve Caesar-shift ciphers about works, places, organizations, and major milestones.

The home page also previews future modules for Rizal’s education and travels, documented relationships, and literary works.

## Classroom safeguards

- Facts and explanations link to primary texts, public-domain translations, or National Historical Commission of the Philippines markers.
- Interpretive claims are labeled instead of presented as direct quotations or uncontested facts.
- Alternate spellings and common translated titles are accepted in the codebreaker.
- The Basilio prompt specifies his adult role in *El Filibusterismo*, avoiding the misleading question of which single novel contains him.
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

## Technology

React 19, TypeScript, Tailwind CSS, and vinext. Scores are stored only in the player’s browser; the prototype has no accounts, database, ads, or tracking.

## Core references

- [NHCP Registry: José Rizal](https://philhistoricsites.nhcp.gov.ph/registry_database/jose-rizal-1861-1896-9/)
- [*Noli Me Tangere* / *The Social Cancer*](https://www.gutenberg.org/ebooks/6737)
- [*El Filibusterismo* / *The Reign of Greed*](https://www.gutenberg.org/ebooks/10676)
- [Letter to the Young Women of Malolos](https://www.gutenberg.org/ebooks/17116)
- [*The Indolence of the Filipino*](https://www.gutenberg.org/ebooks/6885)
- [NHCP Registry: La Liga Filipina](https://philhistoricsites.nhcp.gov.ph/registry_database/la-liga-filipina/)

This is an educational prototype, not an official publication of the NHCP or any school.
