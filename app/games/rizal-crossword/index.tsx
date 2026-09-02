"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FeedbackPanel, GameHeader, Results, useArcadeSound, useHighScore, type Feedback } from "../shared/ArcadeGameKit";
import type { GameProps } from "../types";
import { createCrosswordPuzzle, entryCellKey, type CrosswordCell, type CrosswordEntry } from "./puzzle";
import type { CrosswordTopic } from "./content";

const entryCount = 8;
const maxScore = 1080;

function newRound() {
  const puzzle = createCrosswordPuzzle();
  return { puzzle, selectedId: puzzle.entries[0].id };
}

function entryIndexAtCell(entry: CrosswordEntry, cell: Pick<CrosswordCell, "row" | "col">): number {
  return entry.direction === "across" ? cell.col - entry.col : cell.row - entry.row;
}

function archiveLabel(topic: CrosswordTopic): string {
  if (topic === "Rizal Law") return "Archive I · Course";
  if (topic === "19th-century Philippines") return "Archive II · Context";
  if (topic === "Heroism") return "Archive III · Heroism";
  return "Archive IV · Nation";
}

export function RizalCrosswordGame({ onClose }: GameProps) {
  const [round, setRound] = useState(newRound);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [lives, setLives] = useState(4);
  const [hints, setHints] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const [announcement, setAnnouncement] = useState("The press is ready. Choose a clue and typeset its answer into the crossword.");
  const answerRef = useRef<HTMLInputElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [best, saveBest] = useHighScore("crossword");
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound("/audio/arcade-mystery.mp3");
  const { puzzle, selectedId } = round;
  const selected = puzzle.entries.find((entry) => entry.id === selectedId) ?? puzzle.entries[0];
  const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);
  const entriesById = useMemo(() => new Map(puzzle.entries.map((entry) => [entry.id, entry])), [puzzle]);
  const cellsByKey = useMemo(() => new Map(puzzle.cells.map((cell) => [`${cell.row}:${cell.col}`, cell])), [puzzle]);
  const across = useMemo(() => puzzle.entries.filter((entry) => entry.direction === "across").sort((a, b) => a.number - b.number), [puzzle]);
  const down = useMemo(() => puzzle.entries.filter((entry) => entry.direction === "down").sort((a, b) => a.number - b.number), [puzzle]);
  const finished = (solvedIds.length === entryCount || lives === 0) && feedback === null;

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus({ preventScroll: true });
  }, [feedback]);

  useEffect(() => {
    if (!feedback && !finished) answerRef.current?.focus({ preventScroll: true });
  }, [feedback, finished, selectedId]);

  function chooseEntry(entryId: string) {
    if (feedback) return;
    setRound((current) => ({ ...current, selectedId: entryId }));
    setWrongAttempt(false);
    const entry = entriesById.get(entryId);
    if (entry) setAnnouncement(`${entry.number} ${entry.direction}. ${archiveLabel(entry.topic)}. ${entry.solution.length} letters.`);
    play("flip");
  }

  function updateDraft(value: string) {
    const normalized = value.toLocaleUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, selected.solution.length);
    setDrafts((current) => ({ ...current, [selected.id]: normalized }));
    setWrongAttempt(false);
  }

  function checkWord() {
    if (feedback || solvedSet.has(selected.id)) return;
    const attempt = drafts[selected.id] ?? "";
    if (attempt !== selected.solution) {
      const nextLives = Math.max(0, lives - 1);
      setLives(nextLives);
      setStreak(0);
      setWrongAttempt(true);
      setAnnouncement(nextLives === 0 ? "The final ink ribbon was used. The edition is closing." : "That typesetting does not fit the clue. Check the crossings and try again.");
      play("wrong");
      return;
    }

    const nextSolved = [...solvedIds, selected.id];
    const nextScore = score + 100 + streak * 10;
    setSolvedIds(nextSolved);
    setScore(nextScore);
    setStreak((current) => current + 1);
    setWrongAttempt(false);
    setFeedback({ correct: true, title: `${selected.number} ${selected.direction} · ${selected.answer}`, rationale: selected.explanation, source: selected.source, sourceUrl: selected.sourceUrl });
    setAnnouncement(`${selected.answer} is locked into the printing form.`);
    if (nextSolved.length === entryCount) saveBest(nextScore);
    const nextEntry = puzzle.entries.find((entry) => !nextSolved.includes(entry.id));
    if (nextEntry) setRound((current) => ({ ...current, selectedId: nextEntry.id }));
    play("curate");
  }

  function revealLetter() {
    if (feedback || hints === 0 || solvedSet.has(selected.id)) return;
    const draft = (drafts[selected.id] ?? "").padEnd(selected.solution.length, " ").split("");
    const index = selected.solution.split("").findIndex((letter, letterIndex) => {
      const cell = cellsByKey.get(entryCellKey(selected, letterIndex));
      const crossingSolved = cell?.entryIds.some((id) => id !== selected.id && solvedSet.has(id));
      return !crossingSolved && draft[letterIndex] !== letter;
    });
    if (index < 0) return;
    draft[index] = selected.solution[index];
    setDrafts((current) => ({ ...current, [selected.id]: draft.join("").trimEnd() }));
    setHints((current) => current - 1);
    setScore((current) => Math.max(0, current - 20));
    setWrongAttempt(false);
    setAnnouncement(`The compositor revealed letter ${index + 1}. Two points of type are now aligned.`);
    play("pickup");
  }

  function nextClue() {
    const selectedIndex = puzzle.entries.findIndex((entry) => entry.id === selected.id);
    const next = [...puzzle.entries.slice(selectedIndex + 1), ...puzzle.entries.slice(0, selectedIndex + 1)].find((entry) => !solvedSet.has(entry.id));
    if (next) chooseEntry(next.id);
  }

  function dismissFeedback() {
    if (solvedIds.length === entryCount) play("finish");
    setFeedback(null);
  }

  function replay() {
    saveBest(score);
    setRound(newRound());
    setDrafts({});
    setSolvedIds([]);
    setLives(4);
    setHints(3);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setWrongAttempt(false);
    setAnnouncement("A new edition is on the press. Choose a clue and begin typesetting.");
  }

  function cellLetter(cell: CrosswordCell): string {
    if (cell.entryIds.some((entryId) => solvedSet.has(entryId))) return cell.solution;
    const orderedIds = cell.entryIds.includes(selected.id) ? [selected.id, ...cell.entryIds.filter((id) => id !== selected.id)] : cell.entryIds;
    for (const entryId of orderedIds) {
      const entry = entriesById.get(entryId);
      if (!entry) continue;
      const draft = drafts[entryId] ?? "";
      const letter = draft[entryIndexAtCell(entry, cell)];
      if (letter) return letter;
    }
    return "";
  }

  function selectCell(cell: CrosswordCell) {
    const entryId = cell.entryIds.find((id) => !solvedSet.has(id)) ?? cell.entryIds[0];
    if (entryId) chooseEntry(entryId);
  }

  const pattern = selected.solution.split("").map((letter, index) => {
    const cellKey = entryCellKey(selected, index);
    const cell = cellsByKey.get(cellKey);
    const crossingSolved = cell?.entryIds.some((id) => id !== selected.id && solvedSet.has(id));
    return crossingSolved ? letter : (drafts[selected.id]?.[index] ?? "·");
  }).join(" ");
  const gridStyle = { "--crossword-cols": puzzle.cols, "--crossword-rows": puzzle.rows } as CSSProperties;

  if (finished) return <><GameHeader title="Crossword Chronicle" status={[{ label: "Words", value: `${solvedIds.length} / ${entryCount}` }, { label: "Ink", value: String(lives) }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} /><Results game="crossword" title="Rizal & the Nation: Crossword Chronicle" score={score} best={best} maxScore={maxScore} onReplay={replay} onClose={onClose} /></>;

  return (
    <>
      <GameHeader title="Crossword Chronicle" status={[{ label: "Words", value: `${solvedIds.length} / ${entryCount}` }, { label: "Ink", value: String(lives) }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      <section className="crossword-game play-layout">
        <div className="crossword-masthead">
          <div><p className="eyebrow">Game 10 · Special classroom edition</p><h2>Rizal & the Nation</h2></div>
          <p>Complete the printing form before the press runs out of ink.</p>
        </div>

        <div className="crossword-pressroom">
          <section className="crossword-broadsheet" aria-label="Interactive crossword printing form">
            <header><span>The Crossword Chronicle</span><strong>National consciousness edition</strong><i>Eight entries · new layout every round</i></header>
            <div className="crossword-grid-scroll">
              <div className="crossword-grid" style={gridStyle}>
                {Array.from({ length: puzzle.rows * puzzle.cols }, (_, index) => {
                  const row = Math.floor(index / puzzle.cols);
                  const col = index % puzzle.cols;
                  const cell = cellsByKey.get(`${row}:${col}`);
                  if (!cell) return <span className="crossword-void" key={`${row}:${col}`} aria-hidden="true" />;
                  const active = cell.entryIds.includes(selected.id);
                  const solved = cell.entryIds.some((id) => solvedSet.has(id));
                  return <button className={`crossword-cell ${active ? "is-active" : ""} ${solved ? "is-solved" : ""}`} key={`${row}:${col}`} type="button" onClick={() => selectCell(cell)} aria-label={`${cell.number ? `Clue ${cell.number}, ` : ""}${cellLetter(cell) || "blank"}`}><small>{cell.number}</small><strong>{cellLetter(cell)}</strong></button>;
                })}
              </div>
            </div>
            <footer><span>THE LIFE AND WORKS OF JOSÉ RIZAL</span><b>{puzzle.entries.map((entry) => archiveLabel(entry.topic)).filter((topic, index, topics) => topics.indexOf(topic) === index).join(" · ")}</b></footer>
          </section>

          <aside className={`crossword-editor ${wrongAttempt ? "is-wrong" : ""}`}>
            <div className="editor-clip" aria-hidden="true" />
            <p className="eyebrow">Compositor’s desk</p>
            <div className="active-clue-heading"><span>{selected.number}</span><div><small>{selected.direction} · {selected.solution.length} letters</small><strong>{archiveLabel(selected.topic)}</strong></div></div>
            <p className="active-crossword-clue">{selected.clue}</p>
            <output className="crossword-pattern" aria-label="Current letter pattern">{pattern}</output>
            <label className="crossword-answer"><span>Typeset the answer</span><input ref={answerRef} value={drafts[selected.id] ?? ""} onChange={(event) => updateDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") checkWord(); }} maxLength={selected.solution.length} disabled={solvedSet.has(selected.id)} autoComplete="off" spellCheck={false} inputMode="text" /></label>
            <div className="crossword-actions"><button type="button" onClick={revealLetter} disabled={hints === 0 || solvedSet.has(selected.id)}>Reveal one letter <span>{hints} left</span></button><button type="button" onClick={checkWord} disabled={solvedSet.has(selected.id)}>Lock word</button></div>
            {wrongAttempt && <p className="typeset-warning" role="alert"><strong>Typeset rejected.</strong> The word does not fit this clue. Correct it before another ink ribbon is used.</p>}
            <button className="next-crossword-clue" type="button" onClick={nextClue}>Skip to another clue →</button>

            <div className="crossword-clue-index">
              {[{ label: "Across", entries: across }, { label: "Down", entries: down }].map((group) => <section key={group.label}><h3>{group.label}</h3><ol>{group.entries.map((entry) => <li key={entry.id}><button type="button" className={entry.id === selected.id ? "is-current" : ""} onClick={() => chooseEntry(entry.id)}><b>{entry.number}</b><span>{entry.clue}</span>{solvedSet.has(entry.id) && <i aria-label="Solved">✓</i>}</button></li>)}</ol></section>)}
            </div>
          </aside>
        </div>
        <p className="crossword-announcement" aria-live="polite">{announcement}</p>
        {feedback && <div className="crossword-feedback" ref={feedbackRef} tabIndex={-1}><FeedbackPanel feedback={feedback} onNext={dismissFeedback} isLast={solvedIds.length === entryCount} /></div>}
      </section>
    </>
  );
}
