"use client";

import { useEffect, useRef, useState } from "react";
import { defineChallengeBank, drawChallengeSet, shuffleList } from "../../challengeBank";
import { masterpieceChallenges, museumGalleriesById } from "../../masterpieceChallenges";
import { FeedbackPanel, GameHeader, Results, useArcadeSound, useHighScore, type Feedback } from "../shared/ArcadeGameKit";
import { createLabelInspection, judgeLabelInspection, type LabelDecision } from "./inspection";
import "./museum.css";

const museumBank = defineChallengeBank({ id: "museum", topicId: "essays-letters-annotations-and-other-works", contentVersion: 1, items: masterpieceChallenges });

function drawCollection() {
  const accurateLabels = shuffleList([true, true, true, false, false, false]);
  return drawChallengeSet(museumBank, 6).map((work, index) => createLabelInspection(work, accurateLabels[index]));
}

export function MasterpieceMuseumGame({ onClose }: { onClose: () => void }) {
  const [collection, setCollection] = useState(drawCollection);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(4);
  const [decision, setDecision] = useState<LabelDecision | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [finished, setFinished] = useState(false);
  const [inspected, setInspected] = useState<boolean[]>([]);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const submittedRef = useRef(false);
  const [best, saveBest] = useHighScore("museum");
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound("/audio/arcade-waltz.mp3");
  const current = collection[round];
  const work = current.work;

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus({ preventScroll: true });
  }, [feedback]);

  function confirmInspection() {
    if (!decision || feedback || submittedRef.current) return;
    submittedRef.current = true;
    const result = judgeLabelInspection(current, decision, score, streak, lives);
    setScore(result.score);
    setStreak(result.streak);
    setLives(result.lives);
    setInspected((items) => [...items, result.correct]);
    setFeedback({
      correct: result.correct,
      title: result.correct
        ? current.accurate ? "Label approved." : "Misleading label caught."
        : current.accurate ? "This label was accurate." : "That label changes the history.",
      rationale: `${work.correctPlaque} ${work.rationale}`,
      source: work.source,
      sourceUrl: work.sourceUrl,
    });
    play(result.correct ? "curate" : "wrong");
  }

  function nextExhibit() {
    if (round === collection.length - 1 || lives === 0) {
      saveBest(score);
      setFinished(true);
      play("finish");
      return;
    }
    setRound((value) => value + 1);
    setDecision(null);
    setFeedback(null);
    submittedRef.current = false;
    play("page");
  }

  function replay() {
    setCollection(drawCollection());
    setRound(0);
    setScore(0);
    setStreak(0);
    setLives(4);
    setDecision(null);
    setFeedback(null);
    setFinished(false);
    setInspected([]);
    submittedRef.current = false;
  }

  return <>
    <GameHeader title="Masterpiece Museum" status={[{ label: "Lives", value: "♥".repeat(lives) || "0" }, { label: "Exhibit", value: `${round + 1} / 6` }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
    {finished ? <Results game="museum" title="Masterpiece Museum" score={score} best={best} maxScore={1110} onReplay={replay} onClose={onClose} /> : (
      <main className="museum-inspection">
        <header className="museum-inspection-heading">
          <div><p>Masterpiece Museum · Label inspection</p><h2>Does the label tell the truth?</h2></div>
          <ol className="museum-collection" aria-label="Inspection progress">
            {collection.map((item, index) => <li key={item.work.id} aria-label={`Exhibit ${index + 1}: ${index < inspected.length ? inspected[index] ? "correct" : "missed" : index === round ? "current" : "waiting"}`} aria-current={index === round ? "step" : undefined} className={index < inspected.length ? inspected[index] ? "is-approved" : "is-missed" : ""}>{index < inspected.length ? inspected[index] ? "✓" : "×" : index + 1}</li>)}
          </ol>
        </header>
        <div className="museum-inspection-desk" key={work.id}>
          <article className="museum-source-card">
            <p className="museum-card-kicker">Exhibit {round + 1} · {work.dateLabel}</p>
            <h3>{work.workTitle}</h3>
            <p className="museum-object-caption">{work.objectLabel}</p>
            <h4>Evidence from the archive</h4>
            <ol>{work.evidence.map((clue, index) => <li key={clue}><span aria-hidden="true">{index + 1}</span><p>{clue}</p></li>)}</ol>
          </article>
          <section className="museum-inspection-station" aria-label="Inspect the proposed label">
            {!feedback ? <>
              <div className="museum-proposed-label"><p>Proposed museum label</p><blockquote>{current.label}</blockquote></div>
              <p className="museum-inspection-prompt">Compare it with the evidence. Should this label stay?</p>
              <div className="museum-verdicts" role="group" aria-label="Your label inspection">
                <button type="button" aria-pressed={decision === "keep"} onClick={() => { setDecision("keep"); play("pickup"); }}><span aria-hidden="true">✓</span><strong>Keep the label</strong><small>The evidence supports it</small></button>
                <button type="button" aria-pressed={decision === "replace"} onClick={() => { setDecision("replace"); play("pickup"); }}><span aria-hidden="true">↺</span><strong>Replace the label</strong><small>It misrepresents the work</small></button>
              </div>
              <button className="button museum-confirm" type="button" disabled={!decision} onClick={confirmInspection}>Confirm inspection</button>
            </> : <div className="museum-inspection-feedback" ref={feedbackRef} tabIndex={-1}>
              <p className="museum-card-kicker">{museumGalleriesById[work.galleryId].title} · Inspection complete</p>
              <FeedbackPanel feedback={feedback} onNext={nextExhibit} isLast={round === collection.length - 1 || lives === 0} />
            </div>}
          </section>
        </div>
      </main>
    )}
  </>;
}
