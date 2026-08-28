"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { defineChallengeBank, drawChallengeSet, shuffleList } from "../../challengeBank";
import { scholarJourneyStations, scholarMemoryCards, scholarStationCardIds } from "../../scholarMemoryCards";
import { FeedbackPanel, GameHeader, Results, useArcadeSound, useHighScore, type Feedback } from "../shared/ArcadeGameKit";

const scholarStationBanks = scholarJourneyStations.map((station) => ({
  station,
  bank: defineChallengeBank({
    id: `scholar-${station.id}`,
    topicId: "higher-education-and-scholarly-formation",
    contentVersion: 2,
    items: scholarMemoryCards.filter((card) => scholarStationCardIds[station.id].includes(card.id)),
  }),
}));

function buildScholarRound() {
  const stops = scholarStationBanks.map(({ station, bank }) => ({ station, card: drawChallengeSet(bank, 1)[0] }));
  return { stops, tokenIds: shuffleList(stops.map(({ card }) => card.id)) };
}
export function ScholarMemoryGame({ onClose }: { onClose: () => void }) {
  const [roundData, setRoundData] = useState(buildScholarRound);
  const [phase, setPhase] = useState<"study" | "recall" | "feedback" | "finished">("study");
  const [seconds, setSeconds] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [placedIds, setPlacedIds] = useState<string[]>([]);
  const [lives, setLives] = useState(4);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongStopId, setWrongStopId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [announcement, setAnnouncement] = useState("Study the scholarly record attached to each stop on Rizal’s academic journey.");
  const wrongTimer = useRef<number | null>(null);
  const finishTimer = useRef<number | null>(null);
  const recallPanelRef = useRef<HTMLElement>(null);
  const [best, saveBest] = useHighScore("scholar");
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound("/audio/arcade-adventure.mp3");
  const selectedStop = roundData.stops.find(({ card }) => card.id === selectedId);

  const beginRecall = useCallback(() => {
    setSeconds(0);
    setPhase("recall");
    setAnnouncement("The records have moved to your passport tray. Select one, then stamp its remembered journey stop.");
    play("page");
  }, [play]);

  useEffect(() => {
    if (phase !== "study") return;
    const timer = window.setTimeout(() => {
      if (seconds === 1) beginRecall();
      else setSeconds((value) => value - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [beginRecall, phase, seconds]);

  useEffect(() => {
    if (phase === "recall") recallPanelRef.current?.focus({ preventScroll: true });
  }, [phase, placedIds.length]);

  useEffect(() => () => {
    if (wrongTimer.current) window.clearTimeout(wrongTimer.current);
    if (finishTimer.current) window.clearTimeout(finishTimer.current);
  }, []);

  function selectScholarRecord(cardId: string) {
    if (phase !== "recall" || placedIds.includes(cardId)) return;
    setSelectedId(cardId);
    const record = roundData.stops.find(({ card }) => card.id === cardId)?.card;
    setAnnouncement(`${record?.label ?? "Record"} selected. Now choose its remembered journey stop.`);
    play("pickup");
  }

  function stampScholarStop(stopId: string) {
    if (phase !== "recall") return;
    if (!selectedStop) {
      setAnnouncement("Choose a passport record from the tray before selecting a journey stop.");
      play("wrong");
      return;
    }

    if (selectedStop.station.id === stopId) {
      const { card, station } = selectedStop;
      const nextScore = score + 120 + streak * 10;
      setScore(nextScore);
      setStreak((value) => value + 1);
      setPlacedIds((value) => [...value, card.id]);
      setFeedback({ correct: true, title: `${station.place} stamped · ${card.label}`, rationale: card.rationale, source: card.source, sourceUrl: card.sourceUrl });
      setAnnouncement(`Correct. ${card.label} belongs to the ${station.chapter} stop.`);
      setPhase("feedback");
      play("file");
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);
    setStreak(0);
    setWrongStopId(stopId);
    const attemptedStation = roundData.stops.find(({ station }) => station.id === stopId)?.station;
    setAnnouncement(`${attemptedStation?.place ?? "That stop"} is not where this record appeared. ${nextLives} lives remain.`);
    play("wrong");
    if (wrongTimer.current) window.clearTimeout(wrongTimer.current);
    wrongTimer.current = window.setTimeout(() => setWrongStopId(null), 650);
    if (nextLives === 0) {
      saveBest(score);
      finishTimer.current = window.setTimeout(() => {
        setPhase("finished");
        play("finish");
      }, 420);
    }
  }

  function continueScholarJourney() {
    setFeedback(null);
    setSelectedId(null);
    if (placedIds.length === roundData.stops.length) {
      saveBest(score);
      setPhase("finished");
      play("finish");
      return;
    }
    setPhase("recall");
    setAnnouncement("Choose another passport record and stamp its remembered journey stop.");
    play("page");
  }

  function replay() {
    saveBest(score);
    setRoundData(buildScholarRound());
    setPhase("study");
    setSeconds(20);
    setSelectedId(null);
    setPlacedIds([]);
    setLives(4);
    setScore(0);
    setStreak(0);
    setWrongStopId(null);
    setFeedback(null);
    setAnnouncement("Study the scholarly record attached to each stop on Rizal’s academic journey.");
  }

  if (phase === "finished") return <><GameHeader title="Scholar’s Journey" status={[{ label: "Stamped", value: `${placedIds.length} / 6` }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} /><Results game="scholar" title="Scholar’s Journey" score={score} best={best} maxScore={870} onReplay={replay} onClose={onClose} /></>;

  return (
    <>
      <GameHeader title="Scholar’s Journey" status={[{ label: "Route", value: phase === "study" ? "Study" : `${placedIds.length} / 6` }, { label: "Lives", value: "♥".repeat(lives) || "0" }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      <section className="scholar-game play-layout">
        <div className="scholar-heading">
          <div><p className="eyebrow">Module 5 · higher education and scholarly formation</p><h2>Study the route. Rebuild the journey.</h2></div>
          <img src="/art/universidad-central.jpg" alt="Buildings of the former Central University of Madrid" />
        </div>

        {phase === "study"
          ? <aside className="scholar-brief study-brief" ref={recallPanelRef} tabIndex={-1}><div><span>Study route</span><strong>{seconds}</strong></div><p>Memorize which scholarly record is pinned to each journey stop. The records will move into your passport tray.</p><button className="button button-dark" type="button" onClick={beginRecall}>Pack the records</button></aside>
          : <aside className="scholar-brief recall-brief" ref={recallPanelRef} tabIndex={-1} aria-live="polite"><div><span>Passport</span><strong>{placedIds.length}/6</strong></div><p>{selectedStop ? <><b>{selectedStop.card.label}</b> selected — stamp the journey stop where it appeared.</> : "Select a record from the passport tray, then stamp the journey stop where you remember seeing it."}</p></aside>}

        <div className="scholar-route" aria-label="Rizal academic journey with six learning stations">
          {roundData.stops.map(({ station, card }, index) => {
            const placed = placedIds.includes(card.id);
            return (
              <button
                key={station.id}
                className={`scholar-stop ${placed ? "is-stamped" : ""} ${wrongStopId === station.id ? "is-wrong" : ""}`}
                type="button"
                disabled={phase === "study" || phase === "feedback" || placed}
                onClick={() => stampScholarStop(station.id)}
                aria-label={phase === "study" ? `${station.place}: ${card.label}. ${card.memoryLine}` : placed ? `${station.place} stamped with ${card.label}` : `Stamp ${selectedStop?.card.label ?? "the selected record"} at ${station.place}`}
              >
                <span className="scholar-stop-index">0{index + 1}</span>
                <span className="scholar-stop-stamp" aria-hidden="true">{station.stamp}</span>
                <span className="scholar-stop-copy"><small>{station.years} · {station.chapter}</small><strong>{station.place}</strong><em>{station.note}</em></span>
                {phase === "study" ? <span className="scholar-pinned-record"><i>{card.symbol}</i><span><small>{card.category}</small><b>{card.label}</b><em>{card.memoryLine}</em></span></span>
                  : placed ? <span className="scholar-placed-record"><i>✓</i><b>{card.label}</b><small>Passport stamped</small></span>
                    : <span className="scholar-empty-stop"><i>＋</i><b>Stamp this stop</b></span>}
                {index === Math.min(placedIds.length, roundData.stops.length - 1) && phase !== "study" && <span className="scholar-traveller" aria-hidden="true"><img src="/art/rizal-student-18.jpg" alt="" /></span>}
              </button>
            );
          })}
        </div>

        {phase !== "study" && <div className="scholar-passport-tray" aria-label="Passport records waiting to be placed">
          <div className="tray-label"><span>Travel document</span><strong>Passport tray</strong><small>Tap a record, then tap its stop</small></div>
          <div className="scholar-tokens">{roundData.tokenIds.map((cardId) => {
            const stop = roundData.stops.find(({ card }) => card.id === cardId);
            if (!stop || placedIds.includes(cardId)) return null;
            return <button key={cardId} type="button" className={`scholar-token ${selectedId === cardId ? "is-selected" : ""}`} disabled={phase === "feedback"} aria-pressed={selectedId === cardId} onClick={() => selectScholarRecord(cardId)}><i>{stop.card.symbol}</i><span><small>{stop.card.category}</small><b>{stop.card.label}</b></span></button>;
          })}</div>
        </div>}
        <p className="scholar-announcement" aria-live="polite">{announcement}</p>
        {feedback && <div className="scholar-feedback"><FeedbackPanel feedback={feedback} onNext={continueScholarJourney} isLast={placedIds.length === roundData.stops.length} /></div>}
        <p className="scholar-route-note">Journey stops organize related learning chapters; they do not claim that every broad scholarly habit occurred only in that city.</p>
      </section>
    </>
  );
}
