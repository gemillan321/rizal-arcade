export type InstructionGameId = "values" | "novels" | "codebreaker" | "scholar" | "hearts" | "museum" | "global";

export type GameInstruction = {
  title: string;
  topic: string;
  goal: string;
  steps: [string, string, string];
  scoring: string;
  tip: string;
};

export const gameInstructions: Record<InstructionGameId, GameInstruction> = {
  values: {
    title: "Rizalian Values: River Quest",
    topic: "Rizal’s values and their relevance in modern life",
    goal: "Help the frog reach the finish line by choosing the Rizalian value that best fits each modern-day situation.",
    steps: [
      "Read the situation shown above the river.",
      "Choose one of the three labeled lily pads.",
      "A correct answer moves the frog forward. A wrong answer costs one life and the frog stays in place.",
    ],
    scoring: "Reach six correct jumps before all three lives are lost. Correct streaks increase the score.",
    tip: "Read the short explanation after every jump—it tells you why the value fits.",
  },
  novels: {
    title: "Noli Case Files",
    topic: "Characters, plot, and themes from Noli Me Tangere",
    goal: "Clear the archive by matching six visual clue cards with their correct character, event, or theme cards.",
    steps: [
      "Open one face-down card and study its clue or answer.",
      "Open a second card that you think belongs to the same case file.",
      "A matching pair stays open. A wrong pair turns face down so you can try again.",
    ],
    scoring: "Find all six pairs. Consecutive correct matches build a score streak; the Moves counter records each pair attempted.",
    tip: "A valid pair always contains one clue card and one answer card—not two clues or two answers.",
  },
  codebreaker: {
    title: "Rizal Roots: Codebreaker",
    topic: "Rizal’s family, childhood, genealogy, and early education",
    goal: "Manually decode six Atbash transmissions, then place each solved Rizal record in the correct archive drawer.",
    steps: [
      "Use the displayed alphabet key: A becomes Z, B becomes Y, C becomes X, and so on.",
      "Type the complete decoded answer and check it.",
      "Pick up the solved archive slip, then file it under Family & Roots, Childhood, or Early Education.",
    ],
    scoring: "Correct decoding and filing earn points. Opening extra clues helps, but each additional clue reduces the available score.",
    tip: "Decode every letter yourself—the encrypted word is not solved by repeatedly clicking a wheel.",
  },
  scholar: {
    title: "Scholar’s Journey",
    topic: "Rizal’s higher education and scholarly formation",
    goal: "Study six academic records for twenty seconds, then rebuild Rizal’s educational journey from memory.",
    steps: [
      "During Study Route, memorize the record attached to each place.",
      "When the records move to the passport tray, select one record.",
      "Stamp the selected record at the journey stop where you remember seeing it.",
    ],
    scoring: "Correct placements move the traveller and build a streak. A wrong stop costs one of four lives.",
    tip: "You may press “Pack the records” before the twenty seconds end when you are ready.",
  },
  hearts: {
    title: "Hearts & Horizons",
    topic: "Rizal’s documented relationships and the women he met",
    goal: "Use each three-clue portrait dossier to identify the woman and connect her with the correct place in Rizal’s journey.",
    steps: [
      "Read all three pieces of evidence in the center dossier.",
      "Choose an identity seal on the left and a journey postmark on the right.",
      "Press Seal & Send after both choices are selected.",
    ],
    scoring: "Complete six dossiers. A wrong identity, place, or both costs one of four lives; correct streaks earn bonus points.",
    tip: "Some portraits are artistic interpretations. Trust the written historical evidence, not appearance alone.",
  },
  museum: {
    title: "Masterpiece Museum",
    topic: "Rizal’s essays, letters, annotations, poems, plays, and visual art",
    goal: "Build a six-exhibit museum by placing each work in the right gallery and attaching the label that explains its significance.",
    steps: [
      "Inspect the artifact title, date, object type, and three evidence clues.",
      "Choose its gallery destination, then choose the correct curatorial plaque.",
      "Press Install Exhibit after both parts of the display are selected.",
    ],
    scoring: "Complete six exhibits. A wrong gallery, plaque, or both costs one of four lives; correct streaks earn bonus points.",
    tip: "Genre tells you where a work belongs; the evidence tells you which interpretation belongs on its plaque.",
  },
  global: {
    title: "Global Sojourn",
    topic: "Rizal’s international travels, reform work, medical training, and publications abroad",
    goal: "Build an eight-stop route by sending each historical travel dossier to the destination where its evidence belongs.",
    steps: [
      "Read the period, mission, and all three pieces of evidence in the travel dossier.",
      "Drag the dossier onto a destination station, or tap one of the three numbered stations.",
      "A correct station stamps the passport and advances the traveler. A wrong station costs one life and is ruled out.",
    ],
    scoring: "Complete eight randomized dossiers before four lives run out. Correct streaks and first-try routes earn bonus points.",
    tip: "Use keys 1, 2, and 3 when you prefer the keyboard. Connect people, publications, institutions, and dates—not geography alone.",
  },
};
