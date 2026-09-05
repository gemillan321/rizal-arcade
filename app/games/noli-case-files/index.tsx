"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { defineChallengeBank, drawChallengeSet, shuffleList } from "../../challengeBank";
import { noliCaseFiles } from "../../noliCaseFiles";
import { GameHeader, Results, useArcadeSound, useHighScore, type Feedback } from "../shared/ArcadeGameKit";

const novelBank = defineChallengeBank({ id: "novels", topicId: "noli-social-awakening", contentVersion: 2, items: noliCaseFiles });

type MemoryCard = {
  uid: string;
  pairId: string;
  face: "clue" | "name";
  text: string;
  portraitIndex?: number;
  visual: string;
  caseType: string;
  rationale: string;
  source: string;
  sourceUrl: string;
};

function buildMemoryDeck(): MemoryCard[] {
  const pairs = drawChallengeSet(novelBank, 6);
  return shuffleList(pairs.flatMap((item) => [
    { uid: `${item.id}-clue`, pairId: item.id, face: "clue" as const, text: item.hint, portraitIndex: item.portraitIndex, visual: item.visual, caseType: item.caseType, rationale: item.rationale, source: item.source, sourceUrl: item.sourceUrl },
    { uid: `${item.id}-name`, pairId: item.id, face: "name" as const, text: item.answer, visual: item.visual, caseType: item.caseType, rationale: item.rationale, source: item.source, sourceUrl: item.sourceUrl },
  ]));
}
export function NovelsGame({ onClose }: { onClose: () => void }) {
  const [cards, setCards] = useState<MemoryCard[]>(buildMemoryDeck);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [boardLocked, setBoardLocked] = useState(false);
  const [matchedFact, setMatchedFact] = useState<Feedback | null>(null);
  const [announcement, setAnnouncement] = useState("Find a visual clue card and its matching Noli case answer.");
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const matchNoteRef = useRef<HTMLElement>(null);
  const finished = matchedPairs.length === 6 && matchedFact === null;
  const [best, saveBest] = useHighScore("novels");
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound("/audio/arcade-mystery.mp3");

  useEffect(() => () => { if (flipTimer.current) clearTimeout(flipTimer.current); }, []);
  useEffect(() => {
    if (matchedFact) matchNoteRef.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
  }, [matchedFact]);

  function flipCard(card: MemoryCard) {
    if (boardLocked || openIds.includes(card.uid) || matchedPairs.includes(card.pairId)) return;
    play("flip");
    const nextOpen = [...openIds, card.uid];
    setOpenIds(nextOpen);
    if (nextOpen.length < 2) return;
    const first = cards.find((item) => item.uid === nextOpen[0]);
    const isMatch = first?.pairId === card.pairId && first.face !== card.face;
    setMoves((value) => value + 1);
    setBoardLocked(true);
    flipTimer.current = setTimeout(() => {
      if (isMatch) {
        const answerCard = [first, card].find((item) => item?.face === "name");
        const answerName = answerCard?.text ?? card.text;
        const nextScore = score + 120 + streak * 10;
        setMatchedPairs((value) => [...value, card.pairId]);
        setScore(nextScore);
        if (matchedPairs.length === 5) saveBest(nextScore);
        setStreak((value) => value + 1);
        setMatchedFact({ correct: true, title: `${answerName} · ${card.caseType}`, rationale: card.rationale, source: card.source, sourceUrl: card.sourceUrl });
        setAnnouncement(`Matched the ${answerName} case file.`);
        play("match");
      } else {
        setStreak(0);
        setAnnouncement("Those cards do not belong to the same case. Try again.");
        setBoardLocked(false);
        play("wrong");
      }
      setOpenIds([]);
    }, isMatch ? 420 : 760);
  }

  function dismissMatchedFact() {
    if (matchedPairs.length === 6) play("finish");
    setMatchedFact(null);
    setBoardLocked(false);
    window.requestAnimationFrame(() => boardRef.current?.querySelector<HTMLButtonElement>(".memory-card:not(.is-matched)")?.focus());
  }

  function replay() {
    saveBest(score);
    setCards(buildMemoryDeck());
    setOpenIds([]);
    setMatchedPairs([]);
    setMoves(0);
    setScore(0);
    setStreak(0);
    setBoardLocked(false);
    setMatchedFact(null);
    setAnnouncement("Find a visual clue card and its matching Noli case answer.");
  }

  if (finished) return <><GameHeader title="Noli Case Files" status={[{ label: "Pairs", value: "6 / 6" }, { label: "Moves", value: String(moves) }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} /><Results game="novels" title="Noli Case Files" score={score} best={best} maxScore={870} onReplay={replay} onClose={onClose} /></>;
  const mobileOpenCards = cards.filter((card) => openIds.includes(card.uid));
  return (
    <>
      <GameHeader title="Noli Case Files" status={[{ label: "Pairs", value: `${matchedPairs.length} / 6` }, { label: "Moves", value: String(moves) }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      <section className="memory-game play-layout">
        <div className="memory-title"><div><p className="eyebrow">Noli memory archive · Module 7</p><h2>Match each visual clue card to its correct case answer.</h2></div><img src="/art/noli-cover.jpg" alt="Historic cover of Noli Me Tangere" /></div>
        <p className="memory-instructions">Character portraits are artistic interpretations; other files use archive seals. Match specific clues to a character, plot file, or theme.</p>
        <div className="memory-board" aria-label="Noli Me Tangere case-file memory cards" ref={boardRef}>
          {cards.map((card, index) => {
            const faceUp = openIds.includes(card.uid) || matchedPairs.includes(card.pairId);
            return (
              <button key={card.uid} className={`memory-card ${faceUp ? "is-flipped" : ""} ${matchedPairs.includes(card.pairId) ? "is-matched" : ""}`} type="button" onClick={() => flipCard(card)} aria-label={`Card ${index + 1}, ${faceUp ? `${card.face}: ${card.text}` : "face down"}`} aria-pressed={faceUp}>
                <span className="memory-card-inner">
                  <span className="memory-card-back"><img src="/art/rizal-signature.svg" alt="" /><b>{String(index + 1).padStart(2, "0")}</b></span>
                  <span className={`memory-card-front memory-${card.face}`}>
                    <small>{card.face === "clue" ? `${card.caseType} clues` : "Case answer"}</small>
                    {card.face === "clue"
                      ? <>{card.portraitIndex !== undefined
                        ? <span className="character-portrait" aria-hidden="true" style={{ backgroundPosition: `${(card.portraitIndex % 3) * 50}% ${Math.floor(card.portraitIndex / 3) * 100}%` }} />
                        : <span className={`case-file-visual case-${card.caseType.toLowerCase().replace(/[^a-z]+/g, "-")}`} aria-hidden="true">{card.visual}</span>}<strong className="portrait-hint">{card.text}</strong></>
                      : <><strong className="name-card-title">{card.text}</strong><span className="name-card-prompt">Match this answer to its visual clue card.</span></>}
                    <em>{card.face === "clue" && card.portraitIndex !== undefined ? "Artistic portrait · Noli Me Tangere" : `${card.caseType} · Noli Me Tangere`}</em>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <aside className={`memory-mobile-inspector ${mobileOpenCards.length ? "has-cards" : ""}`} aria-live="polite">
          {mobileOpenCards.length === 0
            ? <p>Tap two cards to compare their case details.</p>
            : mobileOpenCards.map((card) => <div key={card.uid}><span>{card.face === "clue" ? `${card.caseType} clue` : "Case answer"}</span><strong>{card.text}</strong></div>)}
        </aside>
        <p className="sr-announcement" aria-live="polite">{announcement}</p>
        {matchedFact && <aside className="match-note" ref={matchNoteRef} role="status"><span>Case ledger updated</span><strong>{matchedFact.title}</strong><p>{matchedFact.rationale}</p><div>{matchedFact.sourceUrl ? <a href={matchedFact.sourceUrl} target="_blank" rel="noreferrer">Read the source: {matchedFact.source} ↗</a> : <span>Course basis: {matchedFact.source}</span>}<button className="button button-dark" type="button" onClick={dismissMatchedFact}>Keep matching</button></div></aside>}
      </section>
    </>
  );
}
