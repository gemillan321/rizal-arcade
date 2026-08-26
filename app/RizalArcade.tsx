"use client";

/* Local archive artwork is intentionally served as static files in the Vercel/Vite build. */
/* eslint-disable @next/next/no-img-element */

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import AdminPortal from "./AdminPortal";
import { FirstPasswordPortal, LoginPortal } from "./AuthPortal";
import { defineChallengeBank, drawChallengeSet, shuffleList } from "./challengeBank";
import { codebreakerChallenges, type CodebreakerGroup } from "./codebreakerChallenges";
import { valuesChallenges } from "./valuesChallenges";
import {
  getAuthSnapshot,
  signOutOfArcade,
  subscribeToArcadeAuth,
  type ArcadeAuthSnapshot,
  type ArcadeProfile,
} from "./auth";
import {
  loadLeaderboard,
  submitLeaderboardScore,
  type LeaderboardGame,
  type LeaderboardState,
} from "./leaderboard";

type GameId = LeaderboardGame;
type Feedback = { correct: boolean; title: string; rationale: string; source: string; sourceUrl: string };

const gameCards: Array<{
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
    title: "Novel Case Files",
    description: "Match illustrated clue cards to six clearly identified characters from Noli and El Fili.",
    meta: "Portrait memory · 5 min",
    tone: "indigo",
    symbol: "✦",
    skill: "Character & theme recall",
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
];

const comingSoon = [
  { title: "Scholar’s Memory", label: "Education & travels", symbol: "M", art: "/art/calamba-shrine.webp", alt: "Rizal Shrine in Calamba" },
  { title: "Hearts & Horizons", label: "Letters & relationships", symbol: "H", art: "/art/rizal-letter.webp", alt: "A handwritten letter by José Rizal" },
  { title: "Masterpiece Museum", label: "Works & genres", symbol: "A", art: "/art/rizal-poster.webp", alt: "Historic public-domain José Rizal poster" },
];

const novelData = [
  {
    id: "N01", character: "Crisóstomo Ibarra", novel: "Noli Me Tángere",
    portraitIndex: 0,
    hint: "Don Rafael’s son · returns from Europe · plans a school in San Diego",
    rationale: "Don Rafael’s son returns from Europe, and his school project drives a major part of Noli Me Tángere.",
    source: "Noli Me Tangere / The Social Cancer", sourceUrl: "https://www.gutenberg.org/ebooks/6737",
  },
  {
    id: "N02", character: "Sisa", novel: "Noli Me Tángere",
    portraitIndex: 2,
    hint: "Mother of Basilio and Crispin · searches San Diego for her missing sons",
    rationale: "Chapter XVI centers on Sisa’s loss and her search for her two sons.",
    source: "Noli Me Tangere / The Social Cancer", sourceUrl: "https://www.gutenberg.org/ebooks/6737",
  },
  {
    id: "N03", character: "Elias", novel: "Noli Me Tángere",
    portraitIndex: 3,
    hint: "Boatman and pilot · warns Crisóstomo Ibarra · helps Ibarra escape the guards pursuing him",
    rationale: "Elias, the mysterious pilot and boatman, becomes Crisóstomo Ibarra’s ally, warns him about danger, and helps him escape from pursuing guards.",
    source: "Noli Me Tangere / The Social Cancer", sourceUrl: "https://www.gutenberg.org/ebooks/6737",
  },
  {
    id: "N04", character: "María Clara", novel: "Noli Me Tángere",
    portraitIndex: 1,
    hint: "Raised in Capitán Tiago’s home · Crisóstomo Ibarra’s fiancée · sings during the lake outing",
    rationale: "These details identify María Clara without relying on the novel’s later parentage revelation.",
    source: "Noli Me Tangere / The Social Cancer", sourceUrl: "https://www.gutenberg.org/ebooks/6737",
  },
  {
    id: "F01", character: "Simoun", novel: "El Filibusterismo",
    portraitIndex: 4,
    hint: "Wealthy jeweler · wears blue spectacles · influences the Captain-General",
    rationale: "Simoun is the jeweler at the center of El Filibusterismo; his identity is revealed in Chapter VII.",
    source: "El Filibusterismo / The Reign of Greed", sourceUrl: "https://www.gutenberg.org/ebooks/10676",
  },
  {
    id: "F03", character: "Isagani", novel: "El Filibusterismo",
    portraitIndex: 5,
    hint: "Idealistic student-poet · Padre Florentino’s nephew · supports the Spanish academy",
    rationale: "The proposed academy and relationship to Padre Florentino identify Isagani.",
    source: "El Filibusterismo / The Reign of Greed", sourceUrl: "https://www.gutenberg.org/ebooks/10676",
  },
];

const valuesBank = defineChallengeBank({ id: "values", topicId: "rizalian-values", contentVersion: 2, items: valuesChallenges });
const novelBank = defineChallengeBank({ id: "novels", topicId: "noli-and-el-fili-characters", contentVersion: 1, items: novelData });
const codeBank = defineChallengeBank({ id: "codebreaker", topicId: "family-childhood-genealogy-early-education", contentVersion: 2, items: codebreakerChallenges });

function atbashText(value: string) {
  return value.toUpperCase().replace(/[A-Z]/g, (letter) =>
    String.fromCharCode(90 - (letter.charCodeAt(0) - 65)),
  );
}

function normalizeCodeAnswer(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

type SoundCue = "jump" | "correct" | "wrong" | "flip" | "match" | "decode" | "pickup" | "file" | "finish";

function useArcadeSound() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    try { return window.localStorage.getItem("rizal-arcade-sound") !== "off"; } catch { return true; }
  });
  const contextRef = useRef<AudioContext | null>(null);

  const play = useCallback((cue: SoundCue, force = false) => {
    if ((!enabled && !force) || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = contextRef.current ?? new AudioContextClass();
    contextRef.current = context;
    if (context.state === "suspended") void context.resume();
    const patterns: Record<SoundCue, Array<[number, number, OscillatorType]>> = {
      jump: [[330, .07, "sine"], [520, .11, "sine"]],
      correct: [[523, .08, "triangle"], [659, .08, "triangle"], [784, .14, "triangle"]],
      wrong: [[220, .12, "sawtooth"], [165, .18, "sawtooth"]],
      flip: [[610, .055, "triangle"]],
      match: [[440, .08, "triangle"], [660, .15, "triangle"]],
      decode: [[392, .07, "square"], [523, .07, "square"], [784, .14, "square"]],
      pickup: [[680, .07, "sine"], [820, .09, "sine"]],
      file: [[294, .08, "triangle"], [392, .13, "triangle"]],
      finish: [[523, .09, "triangle"], [659, .09, "triangle"], [784, .09, "triangle"], [1047, .22, "triangle"]],
    };
    let start = context.currentTime + .01;
    patterns[cue].forEach(([frequency, duration, type]) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.08, start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + .02);
      start += duration * .78;
    });
  }, [enabled]);

  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    try { window.localStorage.setItem("rizal-arcade-sound", next ? "on" : "off"); } catch { /* Optional preference. */ }
    if (next) window.setTimeout(() => play("correct", true), 0);
  }, [enabled, play]);

  useEffect(() => () => { void contextRef.current?.close(); }, []);
  return { enabled, play, toggle };
}

function useHighScore(game: GameId) {
  const [best, setBest] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      const stored = Number(window.localStorage.getItem(`rizal-arcade-${game}`) || 0);
      return Number.isFinite(stored) && stored > 0 ? stored : 0;
    } catch {
      return 0;
    }
  });
  const saveBest = useCallback((nextScore: number) => {
    setBest((currentBest) => Math.max(currentBest, nextScore));
    try {
      const storedBest = Number(window.localStorage.getItem(`rizal-arcade-${game}`) || 0);
      if (!Number.isFinite(storedBest) || nextScore > storedBest) window.localStorage.setItem(`rizal-arcade-${game}`, String(nextScore));
    } catch {
      // High scores are optional on storage-restricted school devices.
    }
  }, [game]);
  return [best, saveBest] as const;
}

function useModalLifecycle(active: boolean, onClose: () => void, dialogRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!active || !dialog) return;
    const dialogElement = dialog;

    const modalRoot = dialogElement.closest<HTMLElement>("[role='dialog']") ?? dialogElement;
    const siblings = modalRoot.parentElement
      ? Array.from(modalRoot.parentElement.children).filter((element): element is HTMLElement => element instanceof HTMLElement && element !== modalRoot)
      : [];
    const previousInert = siblings.map((element) => element.hasAttribute("inert"));
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

    siblings.forEach((element) => element.setAttribute("inert", ""));
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      (dialogElement.querySelector<HTMLElement>("[data-dialog-close]") ?? dialogElement).focus({ preventScroll: true });
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogElement.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogElement.focus({ preventScroll: true });
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogElement)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      siblings.forEach((element, index) => {
        if (!previousInert[index]) element.removeAttribute("inert");
      });
      previousFocus?.focus({ preventScroll: true });
    };
  }, [active, dialogRef, onClose]);
}

function FeedbackPanel({ feedback, onNext, isLast }: { feedback: Feedback; onNext: () => void; isLast: boolean }) {
  return (
    <div className={`feedback-panel ${feedback.correct ? "correct" : "incorrect"}`} aria-live="polite">
      <div className="feedback-heading">
        <span>{feedback.correct ? "Correct" : "Not this time"}</span>
        <strong>{feedback.title}</strong>
      </div>
      <p>{feedback.rationale}</p>
      <div className="feedback-footer">
        {feedback.sourceUrl
          ? <a href={feedback.sourceUrl} target="_blank" rel="noreferrer">Check the source: {feedback.source} ↗</a>
          : <span>Course basis: {feedback.source}</span>}
        <button className="button button-dark" type="button" onClick={onNext}>{isLast ? "See results" : "Next file"}</button>
      </div>
    </div>
  );
}

function LeaderboardPanel({ game, score, compact = false }: { game: GameId; score?: number; compact?: boolean }) {
  const [board, setBoard] = useState<LeaderboardState | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const submittedScore = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    async function refresh() {
      if (score !== undefined && submittedScore.current !== score) {
        submittedScore.current = score;
        setSaving(true);
        try {
          const next = await submitLeaderboardScore(game, score);
          if (active) {
            setBoard(next);
            setMessage("Your personal best is saved to your section leaderboard.");
          }
        } catch (error) {
          if (active) {
            setBoard(await loadLeaderboard(game));
            setMessage(error instanceof Error ? error.message : "The score could not be saved.");
          }
        } finally {
          if (active) setSaving(false);
        }
        return;
      }
      const next = await loadLeaderboard(game);
      if (active) setBoard(next);
    }
    refresh();
    return () => { active = false; };
  }, [game, score]);

  const boardMessage = board?.status === "failed"
    ? "Your section leaderboard is temporarily unavailable."
    : board?.mode === "section"
      ? `${board.sectionLabel} · Students in other sections cannot view this board.`
      : board?.mode === "admin"
        ? "Choose a section from the Admin Desk to avoid mixing classes."
        : "Sign in with an assigned student account to view scores.";

  return (
    <section className={`leaderboard-panel ${compact ? "compact-board" : ""}`} aria-label="Leaderboard">
      <div className="leaderboard-heading">
        <div><span className="score-live-dot" />{board?.mode === "section" ? board.sectionLabel : "Classroom scores"}</div>
        <strong>{saving ? "Saving score…" : "Top players"}</strong>
      </div>
      <p className="board-mode">{boardMessage}</p>
      <ol className="leaderboard-list">
        {board === null ? <li className="board-empty">Loading scores…</li> : board.entries.length === 0 ? <li className="board-empty">No scores yet. Claim the first spot.</li> : board.entries.map((entry, index) => (
          <li key={`${entry.player_name}-${entry.achieved_at}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{entry.player_name}</strong><b>{entry.score}</b></li>
        ))}
      </ol>
      {message && <p className="score-message" aria-live="polite">{message}</p>}
    </section>
  );
}

function Results({ game, title, score, best, maxScore, onReplay, onClose }: { game: GameId; title: string; score: number; best: number; maxScore: number; onReplay: () => void; onClose: () => void }) {
  const progress = score / maxScore;
  const takeaway = progress >= .75 ? "Arcade legend" : progress >= .45 ? "History high-scorer" : "Curious explorer";
  const resultsRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    resultsRef.current?.closest<HTMLElement>(".game-overlay")?.scrollTo({ top: 0, behavior: "auto" });
    titleRef.current?.focus({ preventScroll: true });
  }, []);
  return (
    <section className="results-shell" aria-labelledby="results-title" ref={resultsRef}>
      <div className="results-card">
        <span className="results-seal">★</span>
        <p className="eyebrow">Round complete</p>
        <h2 id="results-title" ref={titleRef} tabIndex={-1}>{takeaway}</h2>
        <p>You finished <strong>{title}</strong>. Replay to meet a new order of cases, cards, and archive clues.</p>
        <div className="score-pair">
          <div><span>Score</span><strong>{score}</strong></div>
          <div><span>Best on this device</span><strong>{Math.max(score, best)}</strong></div>
        </div>
        <div className="results-actions">
          <button className="button button-primary" type="button" onClick={onReplay}>Play again</button>
          <button className="button button-outline" type="button" onClick={onClose}>Back to arcade</button>
        </div>
      </div>
      <LeaderboardPanel game={game} score={score} />
    </section>
  );
}

function GameHeader({ title, status, onClose, soundEnabled, onToggleSound }: { title: string; status: Array<{ label: string; value: string }>; onClose: () => void; soundEnabled?: boolean; onToggleSound?: () => void }) {
  return (
    <header className="game-header">
      <button className="icon-button" data-dialog-close type="button" onClick={onClose} aria-label="Close game">×</button>
      <div className="game-header-title"><span>Rizal Arcade</span><strong>{title}</strong></div>
      <div className="game-hud">
        {onToggleSound && <button className="sound-toggle" type="button" onClick={onToggleSound} aria-pressed={soundEnabled} aria-label={`${soundEnabled ? "Mute" : "Turn on"} game sounds`}><span aria-hidden="true">{soundEnabled ? "♪" : "×"}</span><small>Sound</small></button>}
        {status.map((item) => <span key={item.label}><small>{item.label}</small><strong>{item.value}</strong></span>)}
      </div>
    </header>
  );
}

function FrogAvatar({ target, splashed }: { target: number | null; splashed: boolean }) {
  return (
    <div className={`frog-avatar ${target === null ? "frog-home" : `frog-pad-${target}`} ${splashed ? "frog-splashed" : ""}`} aria-hidden="true">
      <span className="frog-eye frog-eye-left"><i /></span><span className="frog-eye frog-eye-right"><i /></span>
      <span className="frog-smile" /><span className="frog-belly">R</span>
      <span className="frog-foot frog-foot-left" /><span className="frog-foot frog-foot-right" />
    </div>
  );
}

function RiverCourse({ progress, goal }: { progress: number; goal: number }) {
  return (
    <div className="river-course" role="img" aria-label={`The frog has completed ${progress} of ${goal} jumps toward the finish line.`}>
      <span className="course-label course-start">Start</span>
      {Array.from({ length: goal + 1 }, (_, index) => {
        const left = 7 + (index * 86) / goal;
        const top = index % 2 === 0 ? 58 : 20;
        return <i key={index} className={`course-pad ${index < progress ? "is-crossed" : ""} ${index === progress ? "is-current" : ""} ${index === goal ? "is-finish" : ""}`} style={{ left: `${left}%`, top: `${top}%` }}>{index === goal ? "⚑" : index + 1}</i>;
      })}
      <span className="course-frog" aria-hidden="true" style={{ left: `${7 + (progress * 86) / goal}%`, top: `${progress % 2 === 0 ? 58 : 20}%` }}>🐸</span>
      <span className="course-label course-finish">Finish</span>
    </div>
  );
}

function ValuesGame({ onClose }: { onClose: () => void }) {
  const goal = 6;
  const roundSize = goal + 2;
  const [deck, setDeck] = useState(() => drawChallengeSet(valuesBank, roundSize));
  const [caseIndex, setCaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [phase, setPhase] = useState<"ready" | "jumping" | "feedback">("ready");
  const [selectedPad, setSelectedPad] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const jumpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const returnToQuestion = useRef(false);
  const finished = progress >= goal || lives <= 0;
  const [best, saveBest] = useHighScore("values");
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound();
  const current = deck[caseIndex % deck.length];
  const choices = useMemo(() => {
    const distractors = [...new Set(valuesBank.items.map((item) => item.value))].filter((value) => value !== current.value);
    return shuffleList([current.value, ...shuffleList(distractors).slice(0, 2)]);
  }, [current]);

  const answer = useCallback((choice: string, index: number) => {
    if (phase !== "ready") return;
    const correct = choice === current.value;
    setSelectedPad(index);
    setPhase("jumping");
    play("jump");
    jumpTimer.current = setTimeout(() => {
      if (correct) {
        setScore((value) => value + 100 + streak * 20);
        setStreak((value) => value + 1);
        play("correct");
      } else {
        setLives((value) => Math.max(0, value - 1));
        setStreak(0);
        play("wrong");
      }
      setFeedback({ correct, title: correct ? current.value : `Best fit: ${current.value}`, rationale: current.rationale, source: current.source, sourceUrl: current.sourceUrl });
      setPhase("feedback");
    }, 620);
  }, [current, phase, play, streak]);

  useEffect(() => () => { if (jumpTimer.current) clearTimeout(jumpTimer.current); }, []);
  useEffect(() => {
    if (phase !== "feedback" || !feedbackRef.current) return;
    feedbackRef.current.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
  }, [phase]);
  useEffect(() => {
    if (phase !== "ready" || !returnToQuestion.current || !questionRef.current) return;
    returnToQuestion.current = false;
    window.requestAnimationFrame(() => questionRef.current?.parentElement?.querySelector<HTMLButtonElement>(".lily-pad")?.focus({ preventScroll: true }));
  }, [caseIndex, phase]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const index = Number(event.key) - 1;
      if (phase === "ready" && index >= 0 && index < choices.length) answer(choices[index], index);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, choices, phase]);

  function next() {
    if (feedback?.correct) {
      const nextProgress = progress + 1;
      setProgress(nextProgress);
      if (nextProgress >= goal) {
        saveBest(score);
        play("finish");
      }
    } else if (lives <= 0) {
      saveBest(score);
    }
    returnToQuestion.current = true;
    setFeedback(null);
    setSelectedPad(null);
    setPhase("ready");
    setCaseIndex((value) => value + 1);
  }
  function replay() {
    saveBest(score);
    setDeck(drawChallengeSet(valuesBank, roundSize));
    setCaseIndex(0);
    setProgress(0);
    setScore(0);
    setStreak(0);
    setLives(3);
    setSelectedPad(null);
    setPhase("ready");
    setFeedback(null);
  }

  if (finished) return <><GameHeader title="Rizalian Values: River Quest" status={[{ label: "Lives", value: `${"♥".repeat(lives)}${"♡".repeat(3 - lives)}` }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} /><Results game="values" title="Rizalian Values: River Quest" score={score} best={best} maxScore={900} onReplay={replay} onClose={onClose} /></>;
  return (
    <>
      <GameHeader title="Rizalian Values: River Quest" status={[{ label: "Lives", value: `${"♥".repeat(lives)}${"♡".repeat(3 - lives)}` }, { label: "To finish", value: `${progress} / ${goal}` }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      <section className="river-game">
        <RiverCourse progress={progress} goal={goal} />
        <div className="river-question" ref={questionRef}>
          <span>Interpretive value · Case {current.id}</span>
          <h2>Choose the value that best fits this action.</h2>
          <p>{current.scenario}</p>
        </div>
        <div className="pond-stage">
          <div className="pond-sun" /><div className="pond-reeds reeds-left" /><div className="pond-reeds reeds-right" />
          <div className="lily-lane" aria-label="Answer lily pads">
            {choices.map((choice, index) => {
              const correctPad = feedback && choice === current.value;
              const selectedWrong = feedback && selectedPad === index && choice !== current.value;
              return <button className={`lily-pad ${correctPad ? "correct-pad" : ""} ${selectedWrong ? "wrong-pad" : ""}`} key={choice} disabled={phase !== "ready"} onClick={() => answer(choice, index)} type="button"><small>{index + 1}</small><span>{choice}</span></button>;
            })}
          </div>
          <FrogAvatar target={selectedPad} splashed={Boolean(feedback && !feedback.correct)} />
          <div className="water-ripple ripple-one" /><div className="water-ripple ripple-two" />
          <div className="river-tip">Tap a lily pad or press 1, 2, or 3</div>
        </div>
        {feedback && <div className="river-feedback" ref={feedbackRef}><FeedbackPanel feedback={feedback} onNext={next} isLast={(feedback.correct && progress === goal - 1) || lives <= 0} /></div>}
      </section>
    </>
  );
}

type MemoryCard = {
  uid: string;
  pairId: string;
  face: "portrait" | "name";
  text: string;
  portraitIndex?: number;
  novel: string;
  rationale: string;
  source: string;
  sourceUrl: string;
};

function buildMemoryDeck(): MemoryCard[] {
  const pairs = drawChallengeSet(novelBank, 6);
  return shuffleList(pairs.flatMap((item) => [
    { uid: `${item.id}-portrait`, pairId: item.id, face: "portrait" as const, text: item.hint, portraitIndex: item.portraitIndex, novel: item.novel, rationale: item.rationale, source: item.source, sourceUrl: item.sourceUrl },
    { uid: `${item.id}-name`, pairId: item.id, face: "name" as const, text: item.character, novel: item.novel, rationale: item.rationale, source: item.source, sourceUrl: item.sourceUrl },
  ]));
}

function NovelsGame({ onClose }: { onClose: () => void }) {
  const [cards, setCards] = useState<MemoryCard[]>(buildMemoryDeck);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [boardLocked, setBoardLocked] = useState(false);
  const [matchedFact, setMatchedFact] = useState<Feedback | null>(null);
  const [announcement, setAnnouncement] = useState("Find an illustrated clue card and the matching character name.");
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const matchNoteRef = useRef<HTMLElement>(null);
  const finished = matchedPairs.length === 6 && matchedFact === null;
  const [best, saveBest] = useHighScore("novels");
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound();

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
        const character = [first, card].find((item) => item?.face === "name");
        const characterName = character?.text ?? card.text;
        const nextScore = score + 120 + streak * 10;
        setMatchedPairs((value) => [...value, card.pairId]);
        setScore(nextScore);
        if (matchedPairs.length === 5) saveBest(nextScore);
        setStreak((value) => value + 1);
        setMatchedFact({ correct: true, title: `${characterName} · ${card.novel}`, rationale: card.rationale, source: card.source, sourceUrl: card.sourceUrl });
        setAnnouncement(`Matched ${characterName} in ${card.novel}.`);
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
    setAnnouncement("Find an illustrated clue card and the matching character name.");
  }

  if (finished) return <><GameHeader title="Novel Case Files" status={[{ label: "Pairs", value: "6 / 6" }, { label: "Moves", value: String(moves) }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} /><Results game="novels" title="Novel Case Files" score={score} best={best} maxScore={870} onReplay={replay} onClose={onClose} /></>;
  return (
    <>
      <GameHeader title="Novel Case Files" status={[{ label: "Pairs", value: `${matchedPairs.length} / 6` }, { label: "Moves", value: String(moves) }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      <section className="memory-game play-layout">
        <div className="memory-title"><div><p className="eyebrow">Noli + El Fili portrait room</p><h2>Match each illustrated clue card to the character’s name.</h2></div><img src="/art/noli-cover.jpg" alt="Historic cover of Noli Me Tangere" /></div>
        <p className="memory-instructions">The portraits are artistic interpretations, not historical photographs. Use the specific clues printed below each portrait.</p>
        <div className="memory-board" aria-label="Character memory cards" ref={boardRef}>
          {cards.map((card, index) => {
            const faceUp = openIds.includes(card.uid) || matchedPairs.includes(card.pairId);
            return (
              <button key={card.uid} className={`memory-card ${faceUp ? "is-flipped" : ""} ${matchedPairs.includes(card.pairId) ? "is-matched" : ""}`} type="button" onClick={() => flipCard(card)} aria-label={`Card ${index + 1}, ${faceUp ? `${card.face}: ${card.text}` : "face down"}`} aria-pressed={faceUp}>
                <span className="memory-card-inner">
                  <span className="memory-card-back"><img src="/art/rizal-signature.svg" alt="" /><b>{String(index + 1).padStart(2, "0")}</b></span>
                  <span className={`memory-card-front memory-${card.face}`}>
                    <small>{card.face === "portrait" ? "Portrait + clues" : "Character name"}</small>
                    {card.face === "portrait" && card.portraitIndex !== undefined
                      ? <><span className="character-portrait" aria-hidden="true" style={{ backgroundPosition: `${(card.portraitIndex % 3) * 50}% ${Math.floor(card.portraitIndex / 3) * 100}%` }} /><strong className="portrait-hint">{card.text}</strong></>
                      : <><strong className="name-card-title">{card.text}</strong><span className="name-card-prompt">Match this name to its illustrated clue card.</span></>}
                    <em>{card.face === "portrait" ? `Artistic interpretation · ${card.novel}` : card.novel}</em>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="sr-announcement" aria-live="polite">{announcement}</p>
        {matchedFact && <aside className="match-note" ref={matchNoteRef} role="status"><span>Case ledger updated</span><strong>{matchedFact.title}</strong><p>{matchedFact.rationale}</p><div><a href={matchedFact.sourceUrl} target="_blank" rel="noreferrer">Read the source: {matchedFact.source} ↗</a><button className="button button-dark" type="button" onClick={dismissMatchedFact}>Keep matching</button></div></aside>}
      </section>
    </>
  );
}

type ArchiveGroup = CodebreakerGroup;
const archiveGroups: ArchiveGroup[] = ["Family & roots", "Childhood", "Early education"];

function archiveGroupFor(item: (typeof codeBank.items)[number]): ArchiveGroup {
  return item.category;
}

function CodebreakerGame({ onClose }: { onClose: () => void }) {
  const [deck, setDeck] = useState(() => drawChallengeSet(codeBank, 6));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(1);
  const [phase, setPhase] = useState<"decoding" | "filing" | "feedback">("decoding");
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [slipSelected, setSlipSelected] = useState(false);
  const [wrongDrawer, setWrongDrawer] = useState<ArchiveGroup | null>(null);
  const [answerWrong, setAnswerWrong] = useState(false);
  const [announcement, setAnnouncement] = useState("Use the substitution key to decode the Rizal roots file manually.");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const decoderTopRef = useRef<HTMLDivElement>(null);
  const decodeInputRef = useRef<HTMLInputElement>(null);
  const archiveSlipRef = useRef<HTMLButtonElement>(null);
  const archiveDrawersRef = useRef<HTMLDivElement>(null);
  const codeFeedbackRef = useRef<HTMLDivElement>(null);
  const returnToDecoder = useRef(false);
  const finished = round >= deck.length;
  const [best, saveBest] = useHighScore("codebreaker");
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound();
  const current = deck[Math.min(round, deck.length - 1)];
  const encoded = atbashText(current.answer);
  const correctGroup = archiveGroupFor(current);

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);
  useEffect(() => {
    if (phase !== "filing") return;
    const target = slipSelected
      ? archiveDrawersRef.current?.querySelector<HTMLButtonElement>("button:not([disabled])")
      : archiveSlipRef.current;
    if (!target) return;
    target.focus({ preventScroll: true });
  }, [phase, slipSelected]);
  useEffect(() => {
    if (phase !== "feedback" || !codeFeedbackRef.current) return;
    codeFeedbackRef.current.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
  }, [phase]);
  useEffect(() => {
    if (phase !== "decoding" || !returnToDecoder.current || !decoderTopRef.current) return;
    returnToDecoder.current = false;
    window.requestAnimationFrame(() => decodeInputRef.current?.focus({ preventScroll: true }));
  }, [phase, round]);

  function submitDecode(event: FormEvent) {
    event.preventDefault();
    const normalized = normalizeCodeAnswer(guess);
    const accepted = current.variants.map(normalizeCodeAnswer);
    if (accepted.includes(normalized)) {
      setScore((value) => value + Math.max(90, 150 - attempts * 15 - (revealed - 1) * 15));
      setPhase("filing");
      setAnswerWrong(false);
      setAnnouncement(`Code cracked: ${current.answer}. Pick up the archive slip, then choose its drawer.`);
      play("decode");
      return;
    }
    setAttempts((value) => value + 1);
    setAnswerWrong(true);
    setAnnouncement(normalized ? "That decoding does not match the transmission. Check each letter against the key." : "Type your decoded answer before checking it.");
    play("wrong");
    resetTimer.current = setTimeout(() => setAnswerWrong(false), 430);
  }

  function fileSlip(group: ArchiveGroup) {
    if (phase !== "filing" || !slipSelected) return;
    if (group === correctGroup) {
      setScore((value) => value + 50);
      setFeedback({ correct: true, title: `${current.answer} filed`, rationale: current.rationale, source: current.source, sourceUrl: current.sourceUrl });
      setPhase("feedback");
      setAnnouncement(`${current.answer} filed under ${group}.`);
      play("file");
      return;
    }
    setWrongDrawer(group);
    setAnnouncement(`${group} is not the right drawer. Try another.`);
    play("wrong");
    resetTimer.current = setTimeout(() => setWrongDrawer(null), 470);
  }

  function next() {
    if (round === deck.length - 1) saveBest(score);
    returnToDecoder.current = true;
    setFeedback(null);
    setRevealed(1);
    setGuess("");
    setAttempts(0);
    setSlipSelected(false);
    setWrongDrawer(null);
    setPhase("decoding");
    setAnnouncement("Use the substitution key to decode the Rizal roots file manually.");
    setRound((value) => value + 1);
  }
  function replay() {
    saveBest(score);
    setDeck(drawChallengeSet(codeBank, 6));
    setRound(0);
    setScore(0);
    setRevealed(1);
    setGuess("");
    setAttempts(0);
    setSlipSelected(false);
    setWrongDrawer(null);
    setAnswerWrong(false);
    setPhase("decoding");
    setFeedback(null);
    setAnnouncement("Use the substitution key to decode the Rizal roots file manually.");
  }

  if (finished) return <><GameHeader title="Rizal Roots: Codebreaker" status={[{ label: "Files", value: "6 / 6" }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} /><Results game="codebreaker" title="Rizal Roots: Codebreaker" score={score} best={best} maxScore={1200} onReplay={replay} onClose={onClose} /></>;
  return (
    <>
      <GameHeader title="Rizal Roots: Codebreaker" status={[{ label: "File", value: `${round + 1} / ${deck.length}` }, { label: "Stage", value: phase === "decoding" ? "Decode" : phase === "filing" ? "File" : "Solved" }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      <section className="decoder-game play-layout">
        <div className="decoder-heading"><div><p className="eyebrow">Archive cipher room · {current.year}</p><h2>Use the key. Decode it yourself.</h2></div><span>File {current.id}</span></div>

        {phase === "decoding" && <div className="manual-code-grid" ref={decoderTopRef}>
          <form className={`cipher-workbench ${answerWrong ? "answer-wrong" : ""}`} onSubmit={submitDecode}>
            <div className="cipher-readout"><small>Encrypted transmission</small><strong>{encoded}</strong></div>
            <div className="cipher-key" aria-label="Atbash substitution key">
              <span>Substitution formula</span>
              <div><b>CODE</b><code>ABCDEFGHIJKLMNOPQRSTUVWXYZ</code></div>
              <div><b>TEXT</b><code>ZYXWVUTSRQPONMLKJIHGFEDCBA</code></div>
              <p><strong>A = Z</strong>, <strong>B = Y</strong>, <strong>C = X</strong> … Decode every letter manually.</p>
            </div>
            <label className="decode-answer" htmlFor={`decode-answer-${current.id}`}>
              <span>Your decoded roots answer</span>
              <input ref={decodeInputRef} id={`decode-answer-${current.id}`} value={guess} onChange={(event) => setGuess(event.target.value)} autoComplete="off" autoCapitalize="words" spellCheck={false} placeholder="Type the complete answer" />
            </label>
            <button className="check-code-button" type="submit">Check my decoding</button>
          </form>
          <aside className="clue-telegram">
            <span>Clue telegram</span>
            {current.clues.slice(0, revealed).map((clue, index) => <p key={clue}><b>{index + 1}</b>{clue}</p>)}
            {revealed < current.clues.length && <button type="button" onClick={() => { setRevealed((value) => value + 1); play("flip"); }}>Open another clue (−15 pts)</button>}
          </aside>
        </div>}

        {phase === "filing" && <div className="manual-file-stage">
          <div className="decoded-stamp"><span>Code cracked</span><strong>{current.answer}</strong><small>Now file this answer in the correct roots drawer.</small></div>
          <div className="filing-station">
            <button className={`archive-slip ${slipSelected ? "is-selected" : ""}`} ref={archiveSlipRef} type="button" onClick={() => { setSlipSelected(true); play("pickup"); }}><small>Decoded archive slip</small><strong>{current.answer}</strong><span>{slipSelected ? "Selected — choose a drawer" : "Tap to pick up"}</span></button>
            <div className="archive-drawers" ref={archiveDrawersRef}>
              {archiveGroups.map((group, index) => <button key={group} className={wrongDrawer === group ? "wrong-drawer" : ""} type="button" disabled={!slipSelected} onClick={() => fileSlip(group)}><span>0{index + 1}</span><strong>{group}</strong><i /></button>)}
            </div>
          </div>
        </div>}

        {phase === "feedback" && <div className="solved-file-summary" aria-hidden="true"><span>Archive filed</span><strong>{current.answer}</strong><small>{current.year} · {correctGroup}</small></div>}
        <p className="decoder-announcement" aria-live="polite">{announcement}</p>
        {feedback && <div className="code-feedback" ref={codeFeedbackRef}><FeedbackPanel feedback={feedback} onNext={next} isLast={round === deck.length - 1} /></div>}
      </section>
    </>
  );
}

function GameOverlay({ game, onClose }: { game: GameId; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useModalLifecycle(true, onClose, overlayRef);
  return <div ref={overlayRef} tabIndex={-1} className={`game-overlay game-${game}`} role="dialog" aria-modal="true" aria-label={`${game} game`}>{game === "values" ? <ValuesGame onClose={onClose} /> : game === "novels" ? <NovelsGame onClose={onClose} /> : <CodebreakerGame onClose={onClose} />}</div>;
}

function GameCardScene({ game }: { game: GameId }) {
  if (game === "values") return <div className="card-scene pond-card-scene"><span className="mini-cloud" /><span className="mini-lily lily-a" /><span className="mini-lily lily-b" /><span className="mini-lily lily-c" /><span className="mini-frog">●</span><strong>HOP!</strong></div>;
  if (game === "novels") return <div className="card-scene memory-card-scene"><img src="/art/noli-cover.jpg" alt="" /><span className="mini-card card-a">MC</span><span className="mini-card card-b">?</span><span className="mini-card card-c">IB</span><strong>Match the file</strong></div>;
  return <div className="card-scene code-card-scene"><span className="mini-code">IRAZO</span><span className="mini-wheel">A=Z</span><span className="mini-drawer">ROOTS</span><strong>Read · Decode · File</strong></div>;
}

function LeaderboardDrawer({ onClose }: { onClose: () => void }) {
  const [game, setGame] = useState<GameId>("values");
  const drawerRef = useRef<HTMLElement>(null);
  useModalLifecycle(true, onClose, drawerRef);
  return (
    <div className="source-overlay leaderboard-overlay" role="dialog" aria-modal="true" aria-labelledby="leaderboard-title">
      <button className="source-backdrop" aria-label="Close leaderboard" type="button" onClick={onClose} />
      <section className="source-drawer leaderboard-drawer" ref={drawerRef} tabIndex={-1}>
        <button className="icon-button" data-dialog-close type="button" onClick={onClose} aria-label="Close leaderboard">×</button>
        <p className="eyebrow">Hall of history</p>
        <h2 id="leaderboard-title">Your section leaderboard.</h2>
        <p>Choose a game to see your section’s top scores. Other sections cannot open or read this board.</p>
        <div className="leaderboard-tabs" role="group" aria-label="Choose leaderboard">
          {gameCards.map((item) => <button key={item.id} type="button" aria-pressed={game === item.id} className={game === item.id ? "active" : ""} onClick={() => setGame(item.id)}>{item.title}</button>)}
        </div>
        <LeaderboardPanel key={game} game={game} compact />
      </section>
    </div>
  );
}

function ArcadeHome({ profile, onRequestLogin, onSignOut, onOpenAdmin }: { profile: ArcadeProfile | null; onRequestLogin: () => void; onSignOut: () => void; onOpenAdmin: () => void }) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const sourceDrawerRef = useRef<HTMLElement>(null);
  const closeGame = useCallback(() => setActiveGame(null), []);
  const closeLeaderboard = useCallback(() => setShowLeaderboard(false), []);
  const closeSources = useCallback(() => setShowSources(false), []);
  const launchGame = useCallback((game: GameId) => {
    if (!profile) { onRequestLogin(); return; }
    setActiveGame(game);
  }, [onRequestLogin, profile]);
  const openLeaderboard = useCallback(() => {
    if (!profile) { onRequestLogin(); return; }
    if (profile.role === "admin") { onOpenAdmin(); return; }
    setShowLeaderboard(true);
  }, [onOpenAdmin, onRequestLogin, profile]);
  useModalLifecycle(showSources, closeSources, sourceDrawerRef);
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Rizal Arcade home"><span className="brand-mark">RA</span><span>Rizal Arcade</span><small>Est. 1861</small></a>
        <nav aria-label="Primary navigation"><a href="#games">Games</a><button className="nav-link" type="button" onClick={openLeaderboard}>Leaderboard</button><a href="#classroom">Classroom</a><button className="nav-link" type="button" onClick={() => setShowSources(true)}>Sources</button>{profile ? <><button className="player-chip" type="button" onClick={profile.role === "admin" ? onOpenAdmin : openLeaderboard}><span>{profile.display_name}</span><small>{profile.role === "admin" ? "Admin" : profile.section?.section_code}</small></button><button className="nav-signout" type="button" onClick={onSignOut}>Sign out</button></> : <button className="nav-cta" type="button" onClick={onRequestLogin}>Sign in</button>}</nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="live-dot" />Now open for curious minds</div>
          <p className="eyebrow">The José Rizal history arcade</p>
          <h1>Press play through <em>José Rizal’s life, works, and legacy.</em></h1>
          <p className="hero-intro">Hop across ideas, match characters, and crack archive codes in quick games built from Rizal’s life, works, and world.</p>
          <div className="hero-actions"><button className="button button-primary" type="button" onClick={() => launchGame("values")}>Start playing <span>▶</span></button><span>3 games · Student sign-in · Section scores</span></div>
          <div className="hero-proof"><span><strong>3</strong> playable games</span><span><strong>2–5</strong> minute rounds</span><span><strong>106</strong> sourced challenges</span></div>
        </div>
        <div className="hero-art arcade-cabinet-wrap">
          <div className="arcade-cabinet">
            <div className="cabinet-marquee"><span>★</span> RIZAL QUEST <span>★</span></div>
            <div className="cabinet-screen">
              <img src="/art/rizal-portrait.webp" alt="1883 portrait of José Rizal painted by Félix Resurrección Hidalgo" fetchPriority="high" />
              <span className="screen-scanlines" aria-hidden="true" />
              <span className="screen-label">PLAYER ONE · JOSÉ RIZAL</span>
            </div>
            <div className="cabinet-controls" aria-hidden="true"><span className="joystick" /><i /><i /><i /></div>
          </div>
          <img className="rizal-signature" src="/art/rizal-signature.svg" alt="" />
          <span className="arcade-ticket ticket-one">CALAMBA · 1861</span>
          <span className="arcade-ticket ticket-two">HISTORY + PLAY</span>
        </div>
      </section>

      <section className="games-section" id="games">
        <div className="section-heading"><div><p className="eyebrow">Featured games</p><h2>Choose your next chapter.</h2></div><p>Built for quick classroom rounds, solo review, and curious minds. Every answer opens a brief explanation and a source.</p></div>
        <div className="game-grid">
          {gameCards.map((game) => (
            <article className={`game-card ${game.tone}`} key={game.title}>
              <button className="game-launch-visual" type="button" onClick={() => launchGame(game.id)} aria-label={`Play ${game.title}`}>
                <div className={`game-visual game-visual-${game.id}`}><span className="game-number">GAME {game.number}</span><span className="game-skill">{game.skill}</span><GameCardScene game={game.id} /><span className="game-gridline" /><span className="play-medallion">Play</span></div>
              </button>
              <div className="game-copy"><span className="game-meta">{game.meta}</span><h3>{game.title}</h3><p>{game.description}</p><button type="button" onClick={() => launchGame(game.id)} aria-label={`Play ${game.title}`}>Enter game <span>→</span></button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="leaderboard-band">
        <div><span className="score-live-dot" /><p>Classroom high scores</p><h2>Make history.<br />Make the board.</h2></div>
        <div className="scoreboard-preview" aria-hidden="true"><span>RANK</span><span>PLAYER</span><span>SCORE</span><b>01</b><strong>YOUR NAME</strong><em>---</em><b>02</b><strong>RIZALISTA</strong><em>---</em><b>03</b><strong>HISTORY ACE</strong><em>---</em></div>
        <button className="button leaderboard-button" type="button" onClick={openLeaderboard}>Open my section board <span>→</span></button>
      </section>

      <section className="classroom-section" id="classroom">
        <div className="classroom-copy"><p className="eyebrow">Made for real class time</p><h2>Sign in. Play. Discuss.</h2><p>Official roster accounts connect every score to the right student and section. Short rounds leave time for the conversation that matters.</p><ul><li><span>01</span>Student ID credentials</li><li><span>02</span>Keyboard and touch friendly</li><li><span>03</span>Evidence after every answer</li><li><span>04</span>Private section leaderboards</li></ul></div>
        <div className="classroom-panel"><span className="panel-label">A typical five-minute round</span><div className="timeline-row"><strong>00:00</strong><span>Sign in and choose a game</span></div><div className="timeline-row"><strong>00:30</strong><span>Hop, match, or decode</span></div><div className="timeline-row"><strong>04:00</strong><span>Review the historical evidence</span></div><div className="timeline-row"><strong>05:00</strong><span>Save a section score and discuss</span></div><button className="button button-light" type="button" onClick={() => launchGame("values")}>Start River Quest</button></div>
      </section>

      <section className="coming-section">
        <div className="section-heading"><div><p className="eyebrow">Next in the archive</p><h2>The arcade can keep growing.</h2></div><p>A modular format makes it easy to add new games after your instructor reviews the learning content.</p></div>
        <div className="coming-grid">{comingSoon.map((game, index) => <article key={game.title}><div><img src={game.art} alt={game.alt} loading="lazy" /><span>{game.symbol}</span><small>0{index + 4}</small></div><p>{game.label}</p><h3>{game.title}</h3><span className="soon-pill">Next cabinet</span></article>)}</div>
      </section>

      <section className="manifesto"><img src="/art/rizal-poster.webp" alt="Public-domain poster reading Rizal died for you—be worthy of him" loading="lazy" /><div><p className="eyebrow">A new way into history</p><p>Not a quiz wearing a costume. Every room gives history a rule, a rhythm, and a reason to try again.</p><button type="button" onClick={() => setShowSources(true)}>How we handle historical accuracy <span>→</span></button></div></section>

      <footer><a className="brand footer-brand" href="#top"><span className="brand-mark">RA</span><span>Rizal Arcade</span></a><p>An educational arcade about José Rizal’s life, works, and ideas.</p><button type="button" onClick={openLeaderboard}>Leaderboard</button><button type="button" onClick={() => setShowSources(true)}>Sources & credits</button><span>Classroom edition · 2026</span></footer>

      {activeGame && <GameOverlay game={activeGame} onClose={closeGame} />}
      {showLeaderboard && <LeaderboardDrawer onClose={closeLeaderboard} />}
      {showSources && <div className="source-overlay" role="dialog" aria-modal="true" aria-labelledby="source-title"><button className="source-backdrop" aria-label="Close sources" type="button" onClick={closeSources} /><section className="source-drawer" ref={sourceDrawerRef} tabIndex={-1}><button className="icon-button" data-dialog-close type="button" onClick={closeSources} aria-label="Close sources">×</button><p className="eyebrow">Source desk</p><h2 id="source-title">Playful format. Careful history.</h2><p>Prompts are grounded in the instructor-provided course modules, primary texts, public-domain translations, and National Historical Commission of the Philippines markers. Every River Quest scenario is explicitly an interpretive, present-day application—not a quotation or historical event.</p><h3>Core references</h3><ul><li><a href="https://philhistoricsites.nhcp.gov.ph/registry_database/jose-rizal-1861-1896-9/" target="_blank" rel="noreferrer">NHCP Registry: José Rizal ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/6737" target="_blank" rel="noreferrer">Noli Me Tangere / The Social Cancer ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/10676" target="_blank" rel="noreferrer">El Filibusterismo / The Reign of Greed ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/17116" target="_blank" rel="noreferrer">Letter to the Young Women of Malolos ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/6885" target="_blank" rel="noreferrer">The Indolence of the Filipino ↗</a></li><li><a href="https://philhistoricsites.nhcp.gov.ph/registry_database/la-liga-filipina/" target="_blank" rel="noreferrer">NHCP Registry: La Liga Filipina ↗</a></li></ul><h3 className="visual-credit-title">Visual archive</h3><ul><li><a href="https://commons.wikimedia.org/wiki/File:Portrait_of_Jos%C3%A9_Rizal_(1883)_with_frame.jpg" target="_blank" rel="noreferrer">1883 Rizal portrait · public domain / CC0 ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Manila_and_suburbs_1898.jpg" target="_blank" rel="noreferrer">1898 Manila map · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Noli_Me_Tangere.jpg" target="_blank" rel="noreferrer">Historic Noli cover · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Rizal_letter.png" target="_blank" rel="noreferrer">1889 Rizal letter · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Rizal_Died_for_You-_Be_Worthy_of_Him_-_NARA_-_5730063.jpg" target="_blank" rel="noreferrer">Historic Rizal poster · public domain ↗</a></li></ul><div className="review-note"><strong>Before formal classroom release</strong><p>A Rizal Life instructor should review translations, wording, interpretations, and accepted answers. The game records are structured so content can be updated without redesigning each game.</p></div></section></div>}
    </main>
  );
}

export default function RizalArcade() {
  const [auth, setAuth] = useState<ArcadeAuthSnapshot | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const snapshot = await getAuthSnapshot();
        if (active) setAuth(snapshot);
      } catch {
        if (active) setAuth(null);
      }
    }
    refresh();
    const unsubscribe = subscribeToArcadeAuth(refresh);
    return () => { active = false; unsubscribe(); };
  }, []);

  async function signOut() {
    await signOutOfArcade();
    setAuth(null);
    setShowAdmin(false);
  }

  if (auth?.profile.must_change_password) {
    return <FirstPasswordPortal profile={auth.profile} onComplete={(profile) => setAuth({ ...auth, profile })} onSignOut={signOut} />;
  }

  if (auth?.profile.role === "admin" && showAdmin) {
    return <AdminPortal profile={auth.profile} onClose={() => setShowAdmin(false)} onSignOut={signOut} />;
  }

  return (
    <>
      <ArcadeHome profile={auth?.profile ?? null} onRequestLogin={() => setShowLogin(true)} onSignOut={signOut} onOpenAdmin={() => setShowAdmin(true)} />
      {showLogin && <LoginPortal onClose={() => setShowLogin(false)} onAuthenticated={(snapshot) => { setAuth(snapshot); setShowLogin(false); if (snapshot.profile.role === "admin") setShowAdmin(true); }} />}
    </>
  );
}
