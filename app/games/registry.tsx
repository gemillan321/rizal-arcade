/* eslint-disable @next/next/no-img-element */
import type { ComponentType } from "react";
import { CodebreakerGame } from "./codebreaker";
import { GlobalSojournGame } from "./global-sojourn";
import { HeartsGame } from "./hearts-and-horizons";
import { MasterpieceMuseumGame } from "./masterpiece-museum";
import { NovelsGame } from "./noli-case-files";
import { ValuesGame } from "./river-quest";
import { ScholarMemoryGame } from "./scholars-journey";
import type { GameId, GameProps } from "./types";

export const gameCards: Array<{
  id: GameId;
  number: string;
  title: string;
  description: string;
  meta: string;
  tone: string;
  symbol: string;
  skill: string;
}> = [
  {
    id: "values",
    number: "01",
    title: "Rizalian Values: River Quest",
    description: "Answer correctly to move the frog pad by pad toward the finish line before its lives run out.",
    meta: "River route · 3 min",
    tone: "burgundy",
    symbol: "🐸",
    skill: "Values & evidence",
  },
  {
    id: "novels",
    number: "02",
    title: "Noli Case Files",
    description: "Match visual clue cards to characters, events, and ideas from Rizal’s novel of social awakening.",
    meta: "Module 7 memory · 5 min",
    tone: "indigo",
    symbol: "✦",
    skill: "Noli characters, plot & themes",
  },
  {
    id: "codebreaker",
    number: "03",
    title: "Rizal Roots: Codebreaker",
    description: "Decode files about Rizal’s family, childhood, genealogy, and early education, then sort each clue into its roots archive.",
    meta: "Module 4 cipher · 4 min",
    tone: "ochre",
    symbol: "⌁",
    skill: "Family roots & early education",
  },
  {
    id: "scholar",
    number: "04",
    title: "Scholar’s Journey",
    description: "Study Rizal’s academic route, then rebuild it by stamping scholarly records at six journey stations.",
    meta: "Module 5 journey · 4 min",
    tone: "teal",
    symbol: "M",
    skill: "Higher education & scholarship",
  },
  {
    id: "hearts",
    number: "05",
    title: "Hearts & Horizons",
    description: "Read a portrait dossier, identify the woman, match her to the right place in Rizal’s journey, then seal and send the evidence.",
    meta: "Module 5 correspondence · 4 min",
    tone: "rose",
    symbol: "H",
    skill: "Relationships, setting & evidence",
  },
  {
    id: "museum",
    number: "06",
    title: "Masterpiece Museum",
    description: "Inspect an artifact, choose its gallery, attach the right curatorial plaque, and build a six-exhibit Rizal collection.",
    meta: "Module 7 curation · 4 min",
    tone: "museum",
    symbol: "A",
    skill: "Works, genres & significance",
  },
  {
    id: "global",
    number: "07",
    title: "Global Sojourn",
    description: "Route evidence dossiers through Rizal’s travels, stamp the right destinations, and rebuild his international journey.",
    meta: "50 dossiers · 5 min",
    tone: "teal",
    symbol: "G",
    skill: "Travels & reform work",
  },
];

export const comingSoon = [
  { title: "Trial & Legacy", label: "Exile, trial & execution", symbol: "T", art: "/art/rizal-poster.webp", alt: "Historic public-domain José Rizal poster" },
];


export const gameComponents: Record<GameId, ComponentType<GameProps>> = {
  values: ValuesGame,
  novels: NovelsGame,
  codebreaker: CodebreakerGame,
  scholar: ScholarMemoryGame,
  hearts: HeartsGame,
  museum: MasterpieceMuseumGame,
  global: GlobalSojournGame,
};

export function GameCardScene({ game }: { game: GameId }) {
  if (game === "values") return <div className="card-scene pond-card-scene"><span className="mini-cloud" /><span className="mini-lily lily-a" /><span className="mini-lily lily-b" /><span className="mini-lily lily-c" /><span className="mini-frog">●</span><strong>HOP!</strong></div>;
  if (game === "novels") return <div className="card-scene memory-card-scene"><img src="/art/noli-cover.jpg" alt="" /><span className="mini-card card-a">MC</span><span className="mini-card card-b">?</span><span className="mini-card card-c">IB</span><strong>Match the file</strong></div>;
  if (game === "codebreaker") return <div className="card-scene code-card-scene"><span className="mini-code">IRAZO</span><span className="mini-wheel">A=Z</span><span className="mini-drawer">ROOTS</span><strong>Read · Decode · File</strong></div>;
  if (game === "scholar") return <div className="card-scene scholar-card-scene"><img src="/art/universidad-central.jpg" alt="" /><span className="mini-passport passport-a">01</span><span className="mini-passport passport-b">?</span><span className="mini-passport passport-c">06</span><strong>Study · Close · Recall</strong></div>;
  if (game === "hearts") return <div className="card-scene hearts-card-scene"><img src="/art/rizal-letter.webp" alt="" /><span className="mini-envelope envelope-a">?</span><span className="mini-envelope envelope-b">YK</span><span className="mini-wax">RA</span><strong>Read · Seal · Send</strong></div>;
  if (game === "global") return <div className="card-scene museum-card-scene"><img src="/art/global-sojourn-map.webp" alt="" /><span className="mini-frame frame-a">1882</span><span className="mini-frame frame-b">1892</span><span className="mini-plaque">ROUTE</span><strong>Read · Route · Stamp</strong></div>;
  return <div className="card-scene museum-card-scene"><img src="/art/masterpiece-museum.png" alt="" /><span className="mini-frame frame-a">✉</span><span className="mini-frame frame-b">❧</span><span className="mini-plaque">CURATE</span><strong>Inspect · Label · Install</strong></div>;
}
