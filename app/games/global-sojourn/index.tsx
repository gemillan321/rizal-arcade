"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { defineChallengeBank, drawChallengeSet, shuffleList } from "../../challengeBank";
import { GameHeader, Results, useArcadeSound, useHighScore, type Feedback } from "../shared/ArcadeGameKit";
import type { GameProps } from "../types";
import {
  globalDestinations,
  globalDestinationsById,
  globalSojournChallenges,
  type GlobalDestination,
  type GlobalDestinationId,
} from "./content";

const roundSize = 8;
const MANILA = { x: 83, y: 60 };
type MapPoint = { x: number; y: number };
type RouteSegment = { from: MapPoint; to: MapPoint; destinationId: GlobalDestinationId };
type PlottedDestination = GlobalDestination & { plot: MapPoint };
type GamePhase = "routing" | "traveling" | "arrival" | "finished";

const globalBank = defineChallengeBank({
  id: "global-sojourn",
  topicId: "rizal-travels-reform-and-intellectual-networks",
  contentVersion: 3,
  items: globalSojournChallenges,
});

function drawRoute() {
  return drawChallengeSet(globalBank, roundSize);
}

function routePath(from: MapPoint, to: MapPoint) {
  const startX = from.x * 10;
  const startY = from.y * 6;
  const endX = to.x * 10;
  const endY = to.y * 6;
  const arc = Math.min(95, Math.max(35, Math.abs(endX - startX) * .13));
  return "M " + startX + " " + startY + " Q " + ((startX + endX) / 2) + " " + (Math.min(startY, endY) - arc) + " " + endX + " " + endY;
}

export function GlobalSojournGame({ onClose }: GameProps) {
  const [deck, setDeck] = useState(drawRoute);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [permits, setPermits] = useState(4);
  const [phase, setPhase] = useState<GamePhase>("routing");
  const [routes, setRoutes] = useState<RouteSegment[]>([]);
  const [currentPosition, setCurrentPosition] = useState<MapPoint>(MANILA);
  const [blocked, setBlocked] = useState<GlobalDestinationId[]>([]);
  const [wrongRoute, setWrongRoute] = useState<{ from: MapPoint; to: MapPoint } | null>(null);
  const [dragPoint, setDragPoint] = useState<MapPoint | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [travelingDestination, setTravelingDestination] = useState<GlobalDestinationId | null>(null);
  const [compactMap, setCompactMap] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [announcement, setAnnouncement] = useState("A telegram has arrived. Read its clues, then chart a route from Rizal to the correct port.");
  const boardRef = useRef<HTMLDivElement>(null);
  const arrivalRef = useRef<HTMLElement>(null);
  const travelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [best, saveBest] = useHighScore("global");
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound("/audio/arcade-adventure.mp3");
  const current = deck[round];
  const correctDestination = globalDestinationsById[current.destinationId];

  const options = useMemo<GlobalDestination[]>(() => {
    const distractors = shuffleList(globalDestinations.filter((destination) => destination.id !== current.destinationId)).slice(0, 2);
    return shuffleList([correctDestination, ...distractors]);
  }, [correctDestination, current.destinationId]);
  const plottedOptions = useMemo<PlottedDestination[]>(() => {
    const crowded = options.some((destination, index) => options.some((other, otherIndex) => (
      index !== otherIndex && Math.hypot(destination.map.x - other.map.x, destination.map.y - other.map.y) < 9
    )));
    if (!compactMap || !crowded) return options.map((destination) => ({ ...destination, plot: destination.map }));
    const center = options.reduce((point, destination) => ({ x: point.x + destination.map.x / options.length, y: point.y + destination.map.y / options.length }), { x: 0, y: 0 });
    const offsets = [{ x: -6, y: 3 }, { x: 6, y: 3 }, { x: 0, y: -8 }];
    return options.map((destination, index) => ({
      ...destination,
      plot: {
        x: Math.max(41, Math.min(57, center.x + offsets[index].x)),
        y: Math.max(20, Math.min(46, center.y + offsets[index].y)),
      },
    }));
  }, [compactMap, options]);

  useEffect(() => () => {
    if (travelTimerRef.current) clearTimeout(travelTimerRef.current);
    if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 980px)");
    const update = () => setCompactMap(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (phase === "arrival") arrivalRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const chooseDestination = useCallback((destinationId: GlobalDestinationId) => {
    if (phase !== "routing" || blocked.includes(destinationId)) return;
    const destination = globalDestinationsById[destinationId];
    const targetPoint = plottedOptions.find((option) => option.id === destinationId)?.plot ?? destination.map;
    if (destinationId === current.destinationId) {
      const nextStreak = streak + 1;
      const points = 120 + Math.min(streak, 4) * 25 + Math.max(0, 20 - blocked.length * 10);
      setScore((value) => value + points);
      setStreak(nextStreak);
      setRoutes((value) => [...value, { from: currentPosition, to: targetPoint, destinationId }]);
      setTravelingDestination(destinationId);
      setCurrentPosition(targetPoint);
      setFeedback({
        correct: true,
        title: "Arrived in " + destination.place,
        rationale: current.explanation + " You earned " + points + " navigation points" + (nextStreak > 1 ? " with a ×" + nextStreak + " streak." : "."),
        source: current.source,
        sourceUrl: current.sourceUrl,
      });
      setAnnouncement("Route confirmed. Rizal is traveling to " + destination.shortPlace + ".");
      setPhase("traveling");
      play("jump");
      travelTimerRef.current = setTimeout(() => {
        setTravelingDestination(null);
        setPhase("arrival");
        setAnnouncement(destination.shortPlace + " reached. The city has been stamped onto your chart.");
        play("seal");
      }, 900);
      return;
    }

    const nextPermits = permits - 1;
    setPermits(nextPermits);
    setStreak(0);
    setBlocked((value) => [...value, destinationId]);
    setWrongRoute({ from: currentPosition, to: targetPoint });
    setAnnouncement(destination.shortPlace + " conflicts with the telegram. That route has been crossed out and one travel permit was punched.");
    play("wrong");
    wrongTimerRef.current = setTimeout(() => setWrongRoute(null), 1050);
    if (nextPermits <= 0) {
      setFeedback({
        correct: false,
        title: "The final permit was lost before " + correctDestination.shortPlace,
        rationale: "The correct port was " + correctDestination.place + ". " + current.explanation,
        source: current.source,
        sourceUrl: current.sourceUrl,
      });
      setPhase("arrival");
    }
  }, [blocked, correctDestination, current, currentPosition, permits, phase, play, plottedOptions, streak]);

  useEffect(() => {
    function useNumberKey(event: KeyboardEvent) {
      if (phase !== "routing") return;
      const optionIndex = Number(event.key) - 1;
      if (optionIndex >= 0 && optionIndex < options.length) chooseDestination(options[optionIndex].id);
    }
    window.addEventListener("keydown", useNumberKey);
    return () => window.removeEventListener("keydown", useNumberKey);
  }, [chooseDestination, options, phase]);

  function pointFromPointer(clientX: number, clientY: number): MapPoint | null {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  }

  function startRoute(event: ReactPointerEvent<HTMLButtonElement>) {
    if (phase !== "routing") return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDrawing(true);
    setDragPoint(currentPosition);
    setAnnouncement("Route pencil active—drag toward one of the three glowing ports and release.");
    play("pickup");
  }

  function moveRoute(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDrawing) return;
    const point = pointFromPointer(event.clientX, event.clientY);
    if (point) setDragPoint(point);
  }

  function finishRoute(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDrawing) return;
    const point = pointFromPointer(event.clientX, event.clientY);
    setIsDrawing(false);
    setDragPoint(null);
    if (!point) return;
    const nearest = plottedOptions
      .filter((destination) => !blocked.includes(destination.id))
      .map((destination) => ({ destination, distance: Math.hypot(point.x - destination.plot.x, point.y - destination.plot.y) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (nearest && nearest.distance <= 9) chooseDestination(nearest.destination.id);
    else {
      setAnnouncement("The pencil missed a port. Start from Rizal again, then release inside a glowing destination marker.");
      play("flip");
    }
  }

  function nextTelegram() {
    if (permits <= 0 || round >= deck.length - 1) {
      saveBest(score);
      setPhase("finished");
      play("finish");
      return;
    }
    setRound((value) => value + 1);
    setBlocked([]);
    setWrongRoute(null);
    setFeedback(null);
    setAnnouncement("New telegram received. Compare all three clues before charting the next leg.");
    setPhase("routing");
    play("decode");
  }

  function replay() {
    if (travelTimerRef.current) clearTimeout(travelTimerRef.current);
    if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    setDeck(drawRoute());
    setRound(0);
    setScore(0);
    setStreak(0);
    setPermits(4);
    setPhase("routing");
    setRoutes([]);
    setCurrentPosition(MANILA);
    setBlocked([]);
    setWrongRoute(null);
    setDragPoint(null);
    setIsDrawing(false);
    setTravelingDestination(null);
    setFeedback(null);
    setAnnouncement("A fresh chart is open. Read the first telegram and draw Rizal’s route.");
    play("page");
  }

  if (phase === "finished") {
    return (
      <>
        <GameHeader title="Global Sojourn — Chart the Journey" status={[]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
        <Results game="global" title="Global Sojourn — Chart the Journey" score={score} best={best} maxScore={1670} onReplay={replay} onClose={onClose} />
      </>
    );
  }

  const routeStyle = { "--traveler-x": currentPosition.x + "%", "--traveler-y": currentPosition.y + "%" } as CSSProperties;

  return (
    <>
      <GameHeader title="Global Sojourn — Chart the Journey" status={[]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      <main className="global-game" aria-labelledby="global-game-title">
        <h2 id="global-game-title" className="sr-only">Chart José Rizal’s global journey</h2>
        <section className="global-atlas-shell">
          <div
            className={"global-atlas-surface " + (isDrawing ? "is-charting" : "")}
            ref={boardRef}
            onPointerMove={moveRoute}
            onPointerUp={finishRoute}
            onPointerCancel={() => { setIsDrawing(false); setDragPoint(null); }}
          >
            <div className="global-atlas-title" aria-hidden="true"><span>Rizal’s</span><strong>World Chart</strong><small>1882–1892</small></div>
            <div className="global-permits" aria-label={permits + " of 4 travel permits remaining"}>
              <span>Travel permits</span>
              <div>{Array.from({ length: 4 }, (_, index) => <i key={index} className={index >= permits ? "is-punched" : ""}>✦</i>)}</div>
            </div>
            <div className="global-compass-score" aria-label={"Score " + score + ", streak " + streak}>
              <span>N</span><strong>{score}</strong><small>points · ×{streak}</small>
            </div>

            <svg className="global-route-layer" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <filter id="route-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              {routes.map((segment, index) => <path key={segment.destinationId + "-" + index} className="global-route-complete" d={routePath(segment.from, segment.to)} />)}
              {wrongRoute && <path className="global-route-wrong" d={routePath(wrongRoute.from, wrongRoute.to)} />}
              {dragPoint && <path className="global-route-drawing" d={routePath(currentPosition, dragPoint)} />}
            </svg>

            <span className="global-origin-pin" style={{ left: MANILA.x + "%", top: MANILA.y + "%" }}><b>Manila</b></span>
            {routes.map((segment, index) => {
              const destination = globalDestinationsById[segment.destinationId];
              return <span key={segment.destinationId + "-stamp-" + index} className="global-visited-stamp" style={{ left: segment.to.x + "%", top: segment.to.y + "%" }} aria-label={destination.shortPlace + " visited"}><b>{destination.stamp}</b></span>;
            })}

            {plottedOptions.map((destination, index) => {
              const isBlocked = blocked.includes(destination.id);
              return (
                <button
                  key={destination.id}
                  type="button"
                  className={"global-port global-port-" + (index + 1) + (isBlocked ? " is-blocked" : "")}
                  style={{ left: destination.plot.x + "%", top: destination.plot.y + "%" }}
                  disabled={phase !== "routing" || isBlocked}
                  onClick={() => chooseDestination(destination.id)}
                  aria-label={(index + 1) + ". Chart a route to " + destination.place + (isBlocked ? ", crossed out" : "")}
                >
                  <span className="global-port-beacon">{index + 1}</span>
                  <span className="global-port-label"><strong>{destination.shortPlace}</strong><small>{destination.region}</small></span>
                </button>
              );
            })}

            <button
              type="button"
              className={"global-traveler " + (travelingDestination ? "is-traveling" : "")}
              style={routeStyle}
              onPointerDown={startRoute}
              disabled={phase !== "routing"}
              aria-label="Rizal’s traveler token. Drag from here to a glowing port."
            >
              <span aria-hidden="true">⛵</span><small>Rizal</small>
            </button>
            <p className="global-map-announcement" aria-live="polite">{announcement}</p>

            {phase === "arrival" && feedback && (
              <section className={"global-arrival-scene " + (feedback.correct ? "is-correct" : "is-failed")} ref={arrivalRef} tabIndex={-1} aria-live="polite">
                <div className="global-arrival-stamp" aria-hidden="true">{feedback.correct ? correctDestination.stamp : "X"}</div>
                <div>
                  <p>{feedback.correct ? "Port of arrival · field note" : "Journey interrupted"}</p>
                  <h3>{feedback.title}</h3>
                  <span>{feedback.rationale}</span>
                  {feedback.sourceUrl
                    ? <a href={feedback.sourceUrl} target="_blank" rel="noreferrer">Source: {feedback.source} ↗</a>
                    : <small>Course basis: {feedback.source}</small>}
                </div>
                <button type="button" onClick={nextTelegram}>{permits <= 0 || round === deck.length - 1 ? "See expedition results" : "Open next telegram"}</button>
              </section>
            )}
          </div>

          <section className="global-telegram" aria-labelledby="global-telegram-title">
            <div className="global-telegram-heading">
              <span aria-hidden="true">··· — ···</span>
              <div><p>Incoming telegram · {current.period}</p><h3 id="global-telegram-title">{current.mission}</h3></div>
              <b>{current.id}</b>
            </div>
            <ol>
              {current.evidence.map((clue, index) => <li key={clue}><span>{index + 1}</span><p>{clue}</p></li>)}
            </ol>
            <div className="global-telegram-help"><span>Drag the Rizal ship to a glowing port</span><small>Tap a port or press 1–3 as an alternative.</small></div>
          </section>
        </section>
      </main>
    </>
  );
}
