"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defineChallengeBank, drawChallengeSet, shuffleList } from "../../challengeBank";
import { FeedbackPanel, GameHeader, Results, useArcadeSound, useHighScore, type Feedback } from "../shared/ArcadeGameKit";
import type { GameProps } from "../types";
import {
  globalDestinations,
  globalDestinationsById,
  globalSojournChallenges,
  type GlobalDestination,
  type GlobalDestinationId,
} from "./content";

const roundSize = 8;
const globalBank = defineChallengeBank({
  id: "global-sojourn",
  topicId: "rizal-travels-reform-and-intellectual-networks",
  contentVersion: 2,
  items: globalSojournChallenges,
});

function drawRoute() {
  return drawChallengeSet(globalBank, roundSize);
}

export function GlobalSojournGame({ onClose }: GameProps) {
  const [deck, setDeck] = useState(drawRoute);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(4);
  const [phase, setPhase] = useState<"routing" | "feedback" | "finished">("routing");
  const [route, setRoute] = useState<GlobalDestinationId[]>([]);
  const [blocked, setBlocked] = useState<GlobalDestinationId[]>([]);
  const [wrongDestination, setWrongDestination] = useState<GlobalDestinationId | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [announcement, setAnnouncement] = useState("Read the travel dossier, then send it to the matching destination station.");
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [best, saveBest] = useHighScore("global");
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound("/audio/arcade-adventure.mp3");
  const current = deck[round];
  const correctDestination = globalDestinationsById[current.destinationId];
  const options = useMemo<GlobalDestination[]>(() => {
    const distractors = shuffleList(globalDestinations.filter((destination) => destination.id !== current.destinationId)).slice(0, 2);
    return shuffleList([correctDestination, ...distractors]);
  }, [correctDestination, current]);

  useEffect(() => {
    if (phase === "feedback") feedbackRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const chooseDestination = useCallback((destinationId: GlobalDestinationId) => {
    if (phase !== "routing" || blocked.includes(destinationId)) return;
    if (destinationId === current.destinationId) {
      const nextStreak = streak + 1;
      const points = 120 + Math.min(streak, 4) * 25 + Math.max(0, 20 - blocked.length * 10);
      setScore((value) => value + points);
      setStreak(nextStreak);
      setRoute((value) => [...value, destinationId]);
      setFeedback({
        correct: true,
        title: `Passport stamped: ${correctDestination.place}`,
        rationale: `${current.explanation} You earned ${points} route points${nextStreak > 1 ? ` with a ×${nextStreak} streak` : ""}.`,
        source: current.source,
        sourceUrl: current.sourceUrl,
      });
      setAnnouncement(`${correctDestination.place} confirmed. The route has advanced.`);
      setPhase("feedback");
      play("correct");
      return;
    }

    const destination = globalDestinationsById[destinationId];
    const nextLives = lives - 1;
    setLives(nextLives);
    setStreak(0);
    setBlocked((value) => [...value, destinationId]);
    setWrongDestination(destinationId);
    setAnnouncement(`${destination.shortPlace} does not fit all three clues. One life lost—compare the remaining stations.`);
    play("wrong");
    if (nextLives <= 0) {
      setFeedback({
        correct: false,
        title: `The route ended before ${correctDestination.shortPlace}`,
        rationale: `The correct station was ${correctDestination.place}. ${current.explanation}`,
        source: current.source,
        sourceUrl: current.sourceUrl,
      });
      setPhase("feedback");
    }
  }, [blocked, correctDestination, current, lives, phase, play, streak]);

  useEffect(() => {
    function useNumberKey(event: KeyboardEvent) {
      if (phase !== "routing") return;
      const optionIndex = Number(event.key) - 1;
      if (optionIndex >= 0 && optionIndex < options.length) chooseDestination(options[optionIndex].id);
    }
    window.addEventListener("keydown", useNumberKey);
    return () => window.removeEventListener("keydown", useNumberKey);
  }, [chooseDestination, options, phase]);

  function nextDossier() {
    feedbackRef.current?.closest<HTMLElement>(".game-overlay")?.scrollTo({ top: 0, behavior: "auto" });
    if (lives <= 0 || round >= deck.length - 1) {
      saveBest(score);
      play("finish");
      setPhase("finished");
      return;
    }
    setRound((value) => value + 1);
    setBlocked([]);
    setWrongDestination(null);
    setFeedback(null);
    setAnnouncement("New dossier opened. Compare every clue before choosing a station.");
    setPhase("routing");
    play("page");
  }

  function replay() {
    setDeck(drawRoute());
    setRound(0);
    setScore(0);
    setStreak(0);
    setLives(4);
    setPhase("routing");
    setRoute([]);
    setBlocked([]);
    setWrongDestination(null);
    setFeedback(null);
    setAnnouncement("A new route is ready. Read the first dossier and choose its destination.");
    play("page");
  }

  function dropDossier(event: React.DragEvent<HTMLButtonElement>, destinationId: GlobalDestinationId) {
    event.preventDefault();
    if (event.dataTransfer.getData("text/plain") === current.id) chooseDestination(destinationId);
  }

  if (phase === "finished") {
    return (
      <>
        <GameHeader title="Global Sojourn" status={[{ label: "Stops", value: `${route.length} / ${roundSize}` }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
        <Results game="global" title="Global Sojourn" score={score} best={best} maxScore={1670} onReplay={replay} onClose={onClose} />
      </>
    );
  }

  return (
    <>
      <GameHeader
        title="Global Sojourn"
        status={[
          { label: "Lives", value: `${"♥".repeat(lives)}${"♡".repeat(4 - lives)}` },
          { label: "Dossier", value: `${round + 1} / ${deck.length}` },
          { label: "Score", value: String(score) },
        ]}
        onClose={onClose}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      <main className="global-game" aria-labelledby="global-game-title">
        <section className="global-map-board">
          <div className="global-map-heading">
            <div>
              <p className="eyebrow">Game 07 · route-building archive</p>
              <h2 id="global-game-title">Plot Rizal’s global sojourn.</h2>
            </div>
            <div className="global-streak" aria-label={`Current streak ${streak}`}><span>Route streak</span><strong>×{streak}</strong></div>
          </div>

          <div className="global-route" aria-label={`${route.length} of ${roundSize} route stamps collected`}>
            <span className="global-route-line" aria-hidden="true" />
            {deck.map((challenge, index) => {
              const destination = route[index] ? globalDestinationsById[route[index]] : null;
              return (
                <span key={challenge.id} className={index < route.length ? "is-stamped" : index === round ? "is-current" : ""}>
                  <b>{destination?.stamp ?? String(index + 1).padStart(2, "0")}</b>
                  <small>{destination?.shortPlace ?? (index === round ? "Current file" : "Sealed")}</small>
                </span>
              );
            })}
            <span className="global-traveler" style={{ "--route-progress": `${Math.min(100, (route.length / roundSize) * 100)}%` } as React.CSSProperties} aria-hidden="true">✦</span>
          </div>
        </section>

        <section className="global-worktable">
          <article
            className="travel-dossier"
            draggable={phase === "routing"}
            onDragStart={(event) => { event.dataTransfer.setData("text/plain", current.id); play("pickup"); }}
          >
            <div className="travel-dossier-topline"><span>Confidential travel dossier</span><b>{current.id}</b></div>
            <div className="travel-date"><span>Period</span><strong>{current.period}</strong></div>
            <p className="eyebrow">Mission brief</p>
            <h3>{current.mission}</h3>
            <ol>
              {current.evidence.map((clue, index) => <li key={clue}><span>0{index + 1}</span><p>{clue}</p></li>)}
            </ol>
            <div className="travel-drag-note"><span aria-hidden="true">✥</span><p>Drag this dossier onto a station—or tap a numbered station.</p></div>
          </article>

          <section className="destination-board" aria-labelledby="destination-board-title">
            <div className="destination-board-heading">
              <span aria-hidden="true">⌖</span>
              <div><p>Choose the arrival station</p><h3 id="destination-board-title">Where does this evidence belong?</h3></div>
            </div>
            <div className="destination-stations">
              {options.map((destination, index) => {
                const isBlocked = blocked.includes(destination.id);
                return (
                  <button
                    key={destination.id}
                    type="button"
                    className={`${isBlocked ? "is-blocked" : ""} ${wrongDestination === destination.id ? "is-wrong" : ""}`}
                    disabled={phase !== "routing" || isBlocked}
                    onClick={() => chooseDestination(destination.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => dropDossier(event, destination.id)}
                    aria-label={`${index + 1}. Send dossier to ${destination.place}${isBlocked ? ", ruled out" : ""}`}
                  >
                    <span className="station-number">{index + 1}</span>
                    <span className="station-stamp" aria-hidden="true">{destination.stamp}</span>
                    <span className="station-copy"><strong>{destination.shortPlace}</strong><small>{destination.region}</small></span>
                    <span className="station-action">{isBlocked ? "Ruled out" : "Send dossier"}</span>
                  </button>
                );
              })}
            </div>
            <p className="global-announcement" aria-live="polite">{announcement}</p>
          </section>
        </section>

        <p className="global-source-note">Historical dossiers draw from your instructor’s Module 5 and linked institutional sources. Instructor review remains required before formal classroom release.</p>
      </main>

      {phase === "feedback" && feedback && (
        <div className="global-feedback" ref={feedbackRef} tabIndex={-1}>
          <FeedbackPanel feedback={feedback} onNext={nextDossier} isLast={lives <= 0 || round === deck.length - 1} />
        </div>
      )}
    </>
  );
}
