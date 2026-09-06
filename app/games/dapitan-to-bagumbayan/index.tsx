"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  GameHeader,
  useArcadeSound,
  useHighScore,
  type Feedback,
} from "../shared/ArcadeGameKit";
import type { GameProps } from "../types";
import {
  EVIDENCE_OPTIONS,
  THEME_OPTIONS,
  TIMELINE_OPTIONS,
  type DapitanChallenge,
} from "./content";
import { drawDapitanSession } from "./session";
import "./dapitan.css";

const SESSION_LENGTH = 10;
const STARTING_PRESSURE = 72;

type GamePhase = "loading" | "playing" | "results";
type SceneName = "dapitan" | "fort" | "bagumbayan";

type StyleWithVariables = CSSProperties & {
  "--journey"?: string;
  "--lever-x"?: string;
  "--signal-y"?: string;
  "--signal-angle"?: string;
  "--crane-x"?: string;
};

const SCENE_COPY: Record<
  SceneName,
  { eyebrow: string; title: string; subtitle: string }
> = {
  dapitan: {
    eyebrow: "Dapitan Sector",
    title: "Service under exile",
    subtitle: "The Chronicle Line begins beside the coast.",
  },
  fort: {
    eyebrow: "Fort Santiago Sector",
    title: "Trial under pressure",
    subtitle: "Stone walls close around the historical record.",
  },
  bagumbayan: {
    eyebrow: "Bagumbayan Sector",
    title: "The final approach",
    subtitle: "The line carries the record toward martyrdom and legacy.",
  },
};

const TIMELINE_ROUTE_CUES = [
  "La Liga · arrest · exile order",
  "Exile · service · education · community",
  "Fort Santiago · charges · military trial",
  "Execution · Bagumbayan · national legacy",
] as const;

function shuffle<T>(items: readonly T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }

  return copy;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getTaskLabel(challenge: DapitanChallenge) {
  if (challenge.task === "timeline") {
    return "Track Routing";
  }

  if (challenge.task === "evidence") {
    return "Signal Verification";
  }

  return "Manifest Loading";
}

function getTaskCode(challenge: DapitanChallenge) {
  if (challenge.task === "timeline") {
    return "SWITCH";
  }

  if (challenge.task === "evidence") {
    return "SIGNAL";
  }

  return "CARGO";
}

function getTaskInstruction(challenge: DapitanChallenge) {
  if (challenge.task === "timeline") {
    return "Choose the historical stage for this record, then confirm your answer. You can change your selection first.";
  }

  if (challenge.task === "evidence") {
    return "Decide whether the record is supported, debated, or contradicted, then confirm your answer.";
  }

  return "Choose the theme that best fits this record, then confirm your answer.";
}

function getScene(progress: number): SceneName {
  if (progress >= 0.7) {
    return "bagumbayan";
  }

  if (progress >= 0.36) {
    return "fort";
  }

  return "dapitan";
}

function getPressureLabel(pressure: number) {
  if (pressure >= 88) {
    return "FULL STEAM";
  }

  if (pressure >= 68) {
    return "STEADY";
  }

  if (pressure >= 48) {
    return "LOW PRESSURE";
  }

  return "STRUGGLING";
}

function getFinalRank(pressure: number, score: number) {
  if (pressure >= 88 && score >= 1100) {
    return "Full Steam Archivist";
  }

  if (pressure >= 65 && score >= 800) {
    return "Chronicle Engineer";
  }

  return "Persistent Route Keeper";
}

export function DapitanToBagumbayanGame({ onClose }: GameProps) {
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [session, setSession] = useState<DapitanChallenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pressure, setPressure] = useState(STARTING_PRESSURE);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [, saveBest] = useHighScore("dapitan");
  const [resolvedResults, setResolvedResults] = useState<boolean[]>([]);
  const [resolving, setResolving] = useState(false);
  const [trainMoving, setTrainMoving] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<string | null>(null);

  const [timelineLeverIndex, setTimelineLeverIndex] = useState(1);
  const [signalIndex, setSignalIndex] = useState(1);
  const [themeOrder, setThemeOrder] = useState<string[]>([
    ...THEME_OPTIONS,
  ]);
  const [selectedCargo, setSelectedCargo] = useState<string | null>(null);
  const [cargoLoaded, setCargoLoaded] = useState(false);

  const resolutionTimerRef = useRef<number | null>(null);
  const movementTimerRef = useRef<number | null>(null);

  const {
    enabled: soundEnabled,
    play: playSound,
    toggle: toggleSound,
  } = useArcadeSound("/audio/arcade-mystery.mp3");

  const currentChallenge = session[currentIndex];
  const solvedCount = resolvedResults.length;
  const journeyRatio = session.length > 0 ? solvedCount / session.length : 0;
  const journeyPercent = Math.round(journeyRatio * 100);
  const scene = getScene(journeyRatio);
  const sceneCopy = SCENE_COPY[scene];

  const scoreStatus = useMemo(
    () => [
      {
        label: "File",
        value: `${Math.min(currentIndex + 1, SESSION_LENGTH)} / ${SESSION_LENGTH}`,
      },
      { label: "Steam", value: `${pressure}%` },
      { label: "Score", value: String(score) },
    ],
    [currentIndex, pressure, score],
  );

  const resetControls = useCallback(() => {
    resolutionTimerRef.current = null;
    setTimelineLeverIndex(1);
    setSignalIndex(1);
    setPendingChoice(null);
    setSelectedCargo(null);
    setCargoLoaded(false);
    setFeedback(null);
    setResolving(false);
  }, []);

  const beginSession = useCallback(
    (withSound: boolean) => {
      const nextSession = drawDapitanSession();

      setSession(nextSession);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setPressure(STARTING_PRESSURE);
      setResolvedResults([]);
      setThemeOrder(shuffle(THEME_OPTIONS));
      setTrainMoving(false);
      resetControls();
      setPhase("playing");

      if (withSound) {
        playSound("page");
      }
    },
    [playSound, resetControls],
  );

  useEffect(() => {
    const startupTimer = window.setTimeout(() => {
      beginSession(false);
    }, 0);

    return () => {
      window.clearTimeout(startupTimer);
    };
  }, [beginSession]);

  useEffect(() => {
    return () => {
      if (resolutionTimerRef.current !== null) {
        window.clearTimeout(resolutionTimerRef.current);
      }

      if (movementTimerRef.current !== null) {
        window.clearTimeout(movementTimerRef.current);
      }
    };
  }, []);

  const resolveChoice = useCallback(
    (selected: string) => {
      if (!currentChallenge || feedback || resolving || resolutionTimerRef.current !== null) {
        return;
      }

      const correct = selected === currentChallenge.answer;

      setResolving(true);

      if (currentChallenge.task === "timeline") {
        playSound("file");
      } else if (currentChallenge.task === "evidence") {
        playSound("seal");
      } else {
        setCargoLoaded(true);
        playSound("pickup");
      }

      resolutionTimerRef.current = window.setTimeout(() => {
        if (correct) {
          const nextStreak = streak + 1;
          const streakBonus = Math.min(streak, 4) * 20;
          const pointsEarned = 100 + streakBonus;
          const pressureGain = 5 + (nextStreak >= 3 ? 3 : 0);

          setScore((current) => current + pointsEarned);
          setStreak(nextStreak);
          setPressure((current) => clamp(current + pressureGain, 0, 100));
          playSound(nextStreak >= 3 ? "curate" : "correct");
        } else {
          setStreak(0);
          setPressure((current) => clamp(current - 12, 18, 100));
          playSound("wrong");
        }

        setResolvedResults((current) => [...current, correct]);
        setFeedback({
          correct,
          title: correct
            ? currentChallenge.task === "timeline"
              ? "Track aligned. Chronicle Express cleared."
              : currentChallenge.task === "evidence"
                ? "Signal verified. Proceed with caution."
                : "Manifest accepted. Cargo secured."
            : currentChallenge.task === "timeline"
              ? `Switch misaligned. Correct route: ${currentChallenge.answer}`
              : currentChallenge.task === "evidence"
                ? `Signal conflict. Correct state: ${currentChallenge.answer}`
                : `Cargo rejected. Correct manifest: ${currentChallenge.answer}`,
          rationale: currentChallenge.explanation,
          source: currentChallenge.source,
          sourceUrl: currentChallenge.sourceUrl,
        });
        setResolving(false);
      }, currentChallenge.task === "theme" ? 430 : 280);
    },
    [currentChallenge, feedback, playSound, resolving, streak],
  );

  const goToNext = useCallback(() => {
    if (!currentChallenge || trainMoving) {
      return;
    }

    const lastFile = currentIndex >= session.length - 1;

    setTrainMoving(true);
    playSound(lastFile ? "finish" : "page");

    movementTimerRef.current = window.setTimeout(() => {
      if (lastFile) {
        saveBest(score);
        setPhase("results");
        setTrainMoving(false);
        return;
      }

      setCurrentIndex((current) => current + 1);
      setThemeOrder(shuffle(THEME_OPTIONS));
      resetControls();
      setTrainMoving(false);
    }, 720);
  }, [
    currentChallenge,
    currentIndex,
    playSound,
    resetControls,
    saveBest,
    score,
    session.length,
    trainMoving,
  ]);

  function resolvePointerIndex(
    event: ReactPointerEvent<HTMLElement>,
    orientation: "horizontal" | "vertical",
    count: number,
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio =
      orientation === "horizontal"
        ? (event.clientX - rect.left) / rect.width
        : (event.clientY - rect.top) / rect.height;

    return clamp(Math.round(ratio * (count - 1)), 0, count - 1);
  }

  function handleTimelinePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (feedback || resolving) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    const nextIndex = resolvePointerIndex(
      event,
      "horizontal",
      TIMELINE_OPTIONS.length,
    );
    setTimelineLeverIndex(nextIndex);
    setPendingChoice(TIMELINE_OPTIONS[nextIndex]);
    playSound("pickup");
  }

  function handleTimelinePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      feedback ||
      resolving ||
      !event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      return;
    }

    const index = resolvePointerIndex(event, "horizontal", TIMELINE_OPTIONS.length);
    setTimelineLeverIndex(index);
    setPendingChoice(TIMELINE_OPTIONS[index]);
  }

  function handleTimelinePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (feedback || resolving) {
      return;
    }

    const nextIndex = resolvePointerIndex(
      event,
      "horizontal",
      TIMELINE_OPTIONS.length,
    );
    setTimelineLeverIndex(nextIndex);
    setPendingChoice(TIMELINE_OPTIONS[nextIndex]);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleSignalPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (feedback || resolving) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    const nextIndex = resolvePointerIndex(
      event,
      "vertical",
      EVIDENCE_OPTIONS.length,
    );
    setSignalIndex(nextIndex);
    setPendingChoice(EVIDENCE_OPTIONS[nextIndex]);
    playSound("pickup");
  }

  function handleSignalPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      feedback ||
      resolving ||
      !event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      return;
    }

    const index = resolvePointerIndex(event, "vertical", EVIDENCE_OPTIONS.length);
    setSignalIndex(index);
    setPendingChoice(EVIDENCE_OPTIONS[index]);
  }

  function handleSignalPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (feedback || resolving) {
      return;
    }

    const nextIndex = resolvePointerIndex(
      event,
      "vertical",
      EVIDENCE_OPTIONS.length,
    );
    setSignalIndex(nextIndex);
    setPendingChoice(EVIDENCE_OPTIONS[nextIndex]);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  const selectCargo = useCallback(
    (option: string) => {
      if (feedback || resolving) {
        return;
      }

      setSelectedCargo(option);
      setPendingChoice(option);
      playSound("pickup");
    },
    [feedback, playSound, resolving],
  );

  function handleCargoDragStart(
    event: ReactDragEvent<HTMLButtonElement>,
    option: string,
  ) {
    if (feedback || resolving) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", option);
    setSelectedCargo(option);
    setPendingChoice(option);
    playSound("pickup");
  }

  function handleCargoDrop(event: ReactDragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (feedback || resolving) {
      return;
    }

    const option = event.dataTransfer.getData("text/plain") || selectedCargo;

    if (option && THEME_OPTIONS.includes(option as (typeof THEME_OPTIONS)[number])) {
      setSelectedCargo(option);
      setPendingChoice(option);
      playSound("pickup");
    }
  }

  const loadSelectedCargo = useCallback(() => {
    if (!selectedCargo || feedback || resolving) {
      return;
    }

    resolveChoice(selectedCargo);
  }, [feedback, resolveChoice, resolving, selectedCargo]);
  useEffect(() => {
    if (phase !== "playing") return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat || (event.target instanceof HTMLElement && event.target.closest('button, input, textarea, select, [role="slider"], [role="button"], a'))) return;
      if (feedback) {
        if (event.key === "Enter") { event.preventDefault(); goToNext(); }
        return;
      }
      if (!currentChallenge || resolving) return;
      if (event.key === "Enter" && pendingChoice) {
        event.preventDefault();
        resolveChoice(pendingChoice);
        return;
      }
      const options = currentChallenge.task === "timeline" ? TIMELINE_OPTIONS : currentChallenge.task === "evidence" ? EVIDENCE_OPTIONS : themeOrder;
      const index = Number(event.key) - 1;
      if (!Number.isInteger(index) || index < 0 || index >= options.length) return;
      event.preventDefault();
      setPendingChoice(options[index]);
      if (currentChallenge.task === "timeline") setTimelineLeverIndex(index);
      else if (currentChallenge.task === "evidence") setSignalIndex(index);
      else selectCargo(options[index]);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentChallenge, feedback, goToNext, pendingChoice, phase, resolveChoice, resolving, selectCargo, themeOrder]);

  if (phase === "loading") {
    return (
      <>
        <GameHeader
          title="Dapitan to Bagumbayan"
          status={[{ label: "Line", value: "Warming up" }]}
          onClose={onClose}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
        <main className="chronicle-loading">
          <div className="chronicle-loading-engine" aria-hidden="true">
            <span className="chronicle-loading-wheel" />
            <span className="chronicle-loading-wheel" />
          </div>
          <p>Building steam on the Chronicle Line…</p>
        </main>
      </>
    );
  }

  if (phase === "results") {
    const finalRank = getFinalRank(pressure, score);

    return (
      <>
        <GameHeader
          title="Dapitan to Bagumbayan"
          status={[
            { label: "Line", value: "Arrived" },
            { label: "Steam", value: `${pressure}%` },
            { label: "Score", value: String(score) },
          ]}
          onClose={onClose}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />

        <main className="chronicle-results">
          <div className="chronicle-results-sky" aria-hidden="true">
            <span className="chronicle-results-sun" />
          </div>

          <section className="chronicle-results-station">
            <div className="station-sign">
              <span>END OF THE CHRONICLE LINE</span>
              <strong>BAGUMBAYAN</strong>
            </div>

            <div className="chronicle-results-train" aria-hidden="true">
              <TrainComposition
                results={resolvedResults}
                moving={false}
                complete
              />
            </div>

            <div className="station-board">
              <p className="station-board-kicker">Journey complete</p>
              <h2>{finalRank}</h2>
              <p>
                You operated the symbolic Chronicle Express through Rizal&apos;s
                final historical record—from exile and service to trial,
                martyrdom, and legacy.
              </p>

              <div className="station-board-stats">
                <div>
                  <span>Final score</span>
                  <strong>{score}</strong>
                </div>
                <div>
                  <span>Steam pressure</span>
                  <strong>{pressure}%</strong>
                </div>
                <div>
                  <span>Files carried</span>
                  <strong>{resolvedResults.length} / {SESSION_LENGTH}</strong>
                </div>
              </div>

              <div className="station-board-actions">
                <button
                  className="chronicle-action-button"
                  type="button"
                  onClick={() => beginSession(true)}
                >
                  Run the line again
                </button>
                <button
                  className="chronicle-action-button is-secondary"
                  type="button"
                  onClick={onClose}
                >
                  Back to arcade
                </button>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (!currentChallenge) {
    return null;
  }

  const worldStyle: StyleWithVariables = {
    "--journey": `${journeyPercent}%`,
  };

  return (
    <>
      <GameHeader
        title="Dapitan to Bagumbayan"
        status={scoreStatus}
        onClose={onClose}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      <main
        className={`chronicle-game scene-${scene} ${
          trainMoving ? "is-advancing" : ""
        }`}
        style={worldStyle}
      >
        <section className="chronicle-world" aria-label="Chronicle Express journey">
          <div className="chronicle-sky" aria-hidden="true">
            <span className="chronicle-sun" />
            <span className="chronicle-cloud cloud-a" />
            <span className="chronicle-cloud cloud-b" />
            <span className="chronicle-cloud cloud-c" />
          </div>

          <div className="chronicle-horizon far" aria-hidden="true" />
          <div className="chronicle-horizon near" aria-hidden="true" />
          <div className="chronicle-landmark" aria-hidden="true">
            <span className="landmark-shape" />
          </div>
          <div className="telegraph-poles" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>

          <div className="chronicle-scene-caption">
            <span>{sceneCopy.eyebrow}</span>
            <strong>{sceneCopy.title}</strong>
            <small>{sceneCopy.subtitle}</small>
          </div>

          <div className="chronicle-progress-board">
            <span>Chronicle line</span>
            <strong>{solvedCount} / {SESSION_LENGTH}</strong>
            <div className="chronicle-progress-track">
              <i style={{ width: `${journeyPercent}%` }} />
            </div>
            <small>Dapitan → Fort Santiago → Bagumbayan · symbolic reconstruction route</small>
          </div>

          <div className="chronicle-track-bed" aria-hidden="true">
            <div className="chronicle-rail rail-top" />
            <div className="chronicle-sleepers" />
            <div className="chronicle-rail rail-bottom" />
          </div>

          <div className="chronicle-train-wrap" aria-hidden="true">
            <TrainComposition
              results={resolvedResults}
              moving={trainMoving}
              complete={false}
            />
          </div>
        </section>

        <section className="chronicle-console" aria-labelledby="chronicle-file-title">
          <header className="chronicle-dispatch">
            <div className="dispatch-id">
              <span>INCOMING FILE</span>
              <strong>
                {getTaskCode(currentChallenge)}-
                {String(currentIndex + 1).padStart(2, "0")}
              </strong>
            </div>

            <div className="dispatch-message">
              <span>{getTaskLabel(currentChallenge)}</span>
              <h2 id="chronicle-file-title">{currentChallenge.prompt}</h2>
              <p>{getTaskInstruction(currentChallenge)}</p>
            </div>

            <div className="boiler-gauge" aria-label={`Steam pressure ${pressure}%`}>
              <span>BOILER</span>
              <div className="boiler-dial">
                <i style={{ transform: `rotate(${pressure * 1.8 - 90}deg)` }} />
              </div>
              <strong>{pressure}%</strong>
              <small>{getPressureLabel(pressure)}</small>
            </div>
          </header>

          {!feedback && <div className="chronicle-phone-choices" role="group" aria-label="Choose your answer">
            <p>Choose an answer. Confirm when you’re ready.</p>
            {(currentChallenge.task === "timeline" ? TIMELINE_OPTIONS : currentChallenge.task === "evidence" ? EVIDENCE_OPTIONS : themeOrder).map((option, index) => <button type="button" key={option} aria-pressed={pendingChoice === option} disabled={resolving} onClick={() => {
              setPendingChoice(option);
              if (currentChallenge.task === "timeline") setTimelineLeverIndex(index);
              else if (currentChallenge.task === "evidence") setSignalIndex(index);
              else selectCargo(option);
            }}><b>{index + 1}</b><span>{option}</span></button>)}
          </div>}

          {!feedback && currentChallenge.task === "timeline" && (
            <TimelineSwitch
              index={timelineLeverIndex}
              onSelect={(index) => { setTimelineLeverIndex(index); setPendingChoice(TIMELINE_OPTIONS[index]); }}
              onPointerDown={handleTimelinePointerDown}
              onPointerMove={handleTimelinePointerMove}
              onPointerUp={handleTimelinePointerUp}
              disabled={resolving}
            />
          )}

          {!feedback && currentChallenge.task === "evidence" && (
            <SemaphoreControl
              index={signalIndex}
              onSelect={(index) => { setSignalIndex(index); setPendingChoice(EVIDENCE_OPTIONS[index]); }}
              onPointerDown={handleSignalPointerDown}
              onPointerMove={handleSignalPointerMove}
              onPointerUp={handleSignalPointerUp}
              disabled={resolving}
            />
          )}

          {!feedback && currentChallenge.task === "theme" && (
            <CargoCrane
              order={themeOrder}
              selected={selectedCargo}
              loaded={cargoLoaded}
              disabled={resolving}
              onSelect={selectCargo}
              onDragStart={handleCargoDragStart}
              onDrop={handleCargoDrop}
              onLoad={loadSelectedCargo}
            />
          )}

          {!feedback && <div className={`chronicle-confirmation ${currentChallenge.task === "theme" ? "is-cargo" : ""}`}>
            <p aria-live="polite">{pendingChoice ? `Selected: ${pendingChoice}` : "Select an answer to continue."}</p>
            <button type="button" className="chronicle-action-button" disabled={!pendingChoice || resolving} onClick={() => { if (pendingChoice) resolveChoice(pendingChoice); }}>{resolving ? "Checking…" : "Confirm answer"}</button>
          </div>}

          {feedback && (
            <section
              className={`chronicle-resolution ${
                feedback.correct ? "is-correct" : "is-wrong"
              }`}
              aria-live="polite"
            >
              <div className="resolution-signal" aria-hidden="true">
                <span />
              </div>
              <div className="resolution-copy">
                <span>
                  {feedback.correct ? "LINE CLEAR" : "BRAKES APPLIED"}
                </span>
                <h3>{feedback.title}</h3>
                <p>{feedback.rationale}</p>
                <small>Course basis: {feedback.source}</small>
              </div>
              <button
                className="chronicle-action-button"
                type="button"
                onClick={goToNext}
                disabled={trainMoving}
              >
                {currentIndex === session.length - 1
                  ? "Enter Bagumbayan station"
                  : trainMoving
                    ? "Train advancing…"
                    : "Release brakes"}
              </button>
            </section>
          )}

          <footer className="chronicle-console-footer">
            <span>
              {currentChallenge.task === "timeline"
                ? "Keyboard: 1–4 selects a track · Enter confirms"
                : currentChallenge.task === "evidence"
                  ? "Keyboard: 1–3 selects a signal · Enter confirms"
                  : "Keyboard: 1–5 selects cargo · Enter loads it"}
            </span>
            <span>Streak × {streak}</span>
          </footer>
        </section>
      </main>
    </>
  );
}
function TrainComposition({
  results,
  moving,
  complete,
}: {
  results: boolean[];
  moving: boolean;
  complete: boolean;
}) {
  return (
    <div className={`steam-train ${moving ? "is-moving" : ""}`}>
      <div className="train-carriages">
        {results.map((correct, index) => (
          <div
            className={`train-carriage ${correct ? "is-correct" : "is-wrong"}`}
            key={`carriage-${index}`}
          >
            <span className="carriage-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="carriage-window" />
            <span className="train-wheel" />
            <span className="train-wheel" />
          </div>
        ))}

        {!complete && results.length < SESSION_LENGTH && (
          <div className="train-carriage is-next" aria-hidden="true">
            <span className="carriage-number">NEXT</span>
            <span className="carriage-window" />
            <span className="train-wheel" />
            <span className="train-wheel" />
          </div>
        )}
      </div>

      <div className="steam-locomotive">
        <span className="steam-smoke smoke-1" />
        <span className="steam-smoke smoke-2" />
        <span className="steam-smoke smoke-3" />
        <span className="locomotive-chimney" />
        <span className="locomotive-cab" />
        <span className="locomotive-boiler" />
        <span className="locomotive-front" />
        <span className="locomotive-lamp" />
        <span className="train-wheel wheel-a" />
        <span className="train-wheel wheel-b" />
        <span className="train-rod" />
      </div>
    </div>
  );
}

function TimelineSwitch({
  index,
  onSelect,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  disabled,
}: {
  index: number;
  onSelect: (index: number) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  disabled: boolean;
}) {
  const style: StyleWithVariables = {
    "--lever-x": `${(index / (TIMELINE_OPTIONS.length - 1)) * 100}%`,
  };

  return (
    <section className="switchboard-panel">
      <div className="switchboard-title">
        <span>MECHANICAL ROUTING FRAME</span>
        <strong>Choose a track, then confirm below</strong>
      </div>

      <div className="junction-map" aria-hidden="true">
        <div className="junction-main" />
        {TIMELINE_OPTIONS.map((option, optionIndex) => (
          <div
            className={`junction-branch branch-${optionIndex + 1} ${
              index === optionIndex ? "is-active" : ""
            }`}
            key={option}
          >
            <span>{option}</span>
          </div>
        ))}
        <span className="junction-engine">ENGINE</span>
      </div>

      <div
        className="route-selection-readout"
        aria-live="polite"
        style={{
          display: "grid",
          gap: "0.35rem",
          margin: "0.85rem 0.55rem 1rem",
          padding: "0.8rem 0.95rem",
        }}
      >
        <span className="route-readout-kicker">
          SELECTED HISTORICAL ROUTE
        </span>

        <strong className="route-readout-value">
          <b>{index + 1}</b>
          <span>{TIMELINE_OPTIONS[index]}</span>
        </strong>

        <small className="route-readout-cue">
          Historical cue: {TIMELINE_ROUTE_CUES[index]}.
        </small>

        <small className="route-readout-instruction">
          Move the lever or tap a destination. Confirm your answer below.
        </small>
      </div>

      <div
        className="switch-destination-signs"
        aria-label="Historical route destinations"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "0.65rem",
          margin: "0 0.55rem 1rem",
        }}
      >
        {TIMELINE_OPTIONS.map((option, optionIndex) => (
          <button
            type="button" disabled={disabled} aria-pressed={index === optionIndex} onClick={() => onSelect(optionIndex)}
            className={`destination-sign ${
              index === optionIndex ? "is-active" : ""
            }`}
            key={option}
          >
            <div className="destination-sign-topline">
              <b>{optionIndex + 1}</b>
              <span>{option}</span>
            </div>

            <small>{TIMELINE_ROUTE_CUES[optionIndex]}</small>

            {index === optionIndex && (
              <em>TRACK SELECTED</em>
            )}
          </button>
        ))}
      </div>

      <div
        className={`switch-lever-track ${disabled ? "is-disabled" : ""}`}
        style={style}
        role="slider"
        aria-label="Historical track switch"
        aria-valuemin={1}
        aria-valuemax={TIMELINE_OPTIONS.length}
        aria-valuenow={index + 1}
        aria-valuetext={TIMELINE_OPTIONS[index]}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onKeyDown={(event) => {
          if (disabled) return;
          const next = event.key === "ArrowRight" ? Math.min(index + 1, TIMELINE_OPTIONS.length - 1) : event.key === "ArrowLeft" ? Math.max(index - 1, 0) : event.key === "Home" ? 0 : event.key === "End" ? TIMELINE_OPTIONS.length - 1 : null;
          if (next !== null) { event.preventDefault(); onSelect(next); }
        }}
        onPointerCancel={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="switch-detents" aria-hidden="true">
          {TIMELINE_OPTIONS.map((option, optionIndex) => (
            <span
              className={index === optionIndex ? "is-active" : ""}
              key={option}
            >
              {optionIndex + 1}
            </span>
          ))}
        </div>
        <div className="brass-lever">
          <span className="lever-grip" />
          <span className="lever-stem" />
          <strong>{index + 1}</strong>
        </div>
      </div>
    </section>
  );
}

function SemaphoreControl({
  index,
  onSelect,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  disabled,
}: {
  index: number;
  onSelect: (index: number) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  disabled: boolean;
}) {
  const angles = [-42, 0, 42];
  const style: StyleWithVariables = {
    "--signal-y": `${(index / (EVIDENCE_OPTIONS.length - 1)) * 100}%`,
    "--signal-angle": `${angles[index]}deg`,
  };

  return (
    <section className="signal-panel" style={style}>
      <div className="signal-machine" aria-hidden="true">
        <div className="semaphore-post">
          <span className="semaphore-arm" />
          <span className="semaphore-lamp" />
        </div>
        <div className="signal-track-mini">
          <i />
        </div>
      </div>

      <div className="signal-controls">
        <div className="switchboard-title">
          <span>SEMAPHORE VERIFICATION</span>
          <strong>Set the signal, then confirm below</strong>
        </div>

        <div className="signal-control-row">
          <div className="signal-labels" aria-hidden="true">
            {EVIDENCE_OPTIONS.map((option, optionIndex) => (
              <span
                className={index === optionIndex ? "is-active" : ""}
                key={option}
              >
                <b>{optionIndex + 1}</b>
                {option}
              </span>
            ))}
          </div>

          <div
            className={`signal-lever-slot ${disabled ? "is-disabled" : ""}`}
            role="slider"
            aria-label="Evidence semaphore"
            aria-valuemin={1}
            aria-valuemax={EVIDENCE_OPTIONS.length}
            aria-valuenow={index + 1}
            aria-valuetext={EVIDENCE_OPTIONS[index]}
            tabIndex={disabled ? -1 : 0}
            aria-orientation="vertical"
            aria-disabled={disabled}
            onKeyDown={(event) => {
              if (disabled) return;
              const next = event.key === "ArrowDown" ? Math.min(index + 1, EVIDENCE_OPTIONS.length - 1) : event.key === "ArrowUp" ? Math.max(index - 1, 0) : event.key === "Home" ? 0 : event.key === "End" ? EVIDENCE_OPTIONS.length - 1 : null;
              if (next !== null) { event.preventDefault(); onSelect(next); }
            }}
            onPointerCancel={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <span className="signal-lever-handle">
              <i />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CargoCrane({
  order,
  selected,
  loaded,
  disabled,
  onSelect,
  onDragStart,
  onDrop,
  onLoad,
}: {
  order: string[];
  selected: string | null;
  loaded: boolean;
  disabled: boolean;
  onSelect: (option: string) => void;
  onDragStart: (event: ReactDragEvent<HTMLButtonElement>, option: string) => void;
  onDrop: (event: ReactDragEvent<HTMLDivElement>) => void;
  onLoad: () => void;
}) {
  const selectedIndex = selected ? order.indexOf(selected) : 0;
  const craneX =
    order.length > 1 ? (Math.max(0, selectedIndex) / (order.length - 1)) * 100 : 0;
  const style: StyleWithVariables = {
    "--crane-x": `${craneX}%`,
  };

  return (
    <section className="cargo-yard" style={style}>
      <div className="cargo-yard-title">
        <span>CHRONICLE FREIGHT YARD</span>
        <strong>Load the value that belongs on this historical manifest</strong>
      </div>

      <div className="crane-gantry" aria-hidden="true">
        <span className="gantry-beam" />
        <span className={`crane-trolley ${selected ? "has-cargo" : ""}`}>
          <i className="crane-cable" />
          <i className="crane-hook" />
          {selected && <b>{selected}</b>}
        </span>
      </div>

      <div className="cargo-platform">
        {order.map((option, index) => (
          <button
            className={`theme-crate ${selected === option ? "is-selected" : ""}`}
            type="button"
            key={option}
            draggable={!disabled}
            disabled={disabled}
            onClick={() => onSelect(option)}
            onDragStart={(event) => onDragStart(event, option)}
          >
            <span>CRATE {index + 1}</span>
            <strong>{option}</strong>
            <small>{index + 1}</small>
          </button>
        ))}
      </div>

      <div
        className={`cargo-carriage-drop ${selected ? "is-armed" : ""} ${
          loaded ? "is-loaded" : ""
        }`}
        role="button"
        tabIndex={selected && !disabled ? 0 : -1}
        aria-label="Load selected theme cargo into Chronicle carriage"
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        onClick={onLoad}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onLoad();
          }
        }}
      >
        <span className="cargo-carriage-door" />
        <div>
          <small>MANIFEST BAY</small>
          <strong>{selected ? `Load ${selected}` : "Select a crate first"}</strong>
        </div>
        <span className="cargo-wheel" />
        <span className="cargo-wheel" />
      </div>
    </section>
  );
}
