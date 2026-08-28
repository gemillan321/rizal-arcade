"use client";

/* Local archive artwork is intentionally served as static files in the Vercel/Vite build. */
/* eslint-disable @next/next/no-img-element */

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import AdminPortal from "./AdminPortal";
import { FirstPasswordPortal, LoginPortal } from "./AuthPortal";
import { defineChallengeBank, drawChallengeSet, shuffleList } from "./challengeBank";
import { codebreakerChallenges, type CodebreakerGroup } from "./codebreakerChallenges";
import { heartsChallenges, heartsProfiles, heartsProfilesById, type HeartsWomanId } from "./heartsChallenges";
import { masterpieceChallenges, museumGalleries, museumGalleriesById, type MuseumGalleryId } from "./masterpieceChallenges";
import { noliCaseFiles } from "./noliCaseFiles";
import { scholarJourneyStations, scholarMemoryCards, scholarStationCardIds } from "./scholarMemoryCards";
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
];

const comingSoon = [
  { title: "Global Sojourn", label: "Travels & reform work", symbol: "G", art: "/art/manila-map.webp", alt: "Historic map representing Rizal’s journeys" },
  { title: "Trial & Legacy", label: "Exile, trial & execution", symbol: "T", art: "/art/rizal-poster.webp", alt: "Historic public-domain José Rizal poster" },
];

const valuesBank = defineChallengeBank({ id: "values", topicId: "rizalian-values", contentVersion: 2, items: valuesChallenges });
const novelBank = defineChallengeBank({ id: "novels", topicId: "noli-social-awakening", contentVersion: 2, items: noliCaseFiles });
const codeBank = defineChallengeBank({ id: "codebreaker", topicId: "family-childhood-genealogy-early-education", contentVersion: 2, items: codebreakerChallenges });
const heartsBank = defineChallengeBank({ id: "hearts", topicId: "love-interests-and-women-rizal-met", contentVersion: 1, items: heartsChallenges });
const museumBank = defineChallengeBank({ id: "museum", topicId: "essays-letters-annotations-and-other-works", contentVersion: 1, items: masterpieceChallenges });
const scholarStationBanks = scholarJourneyStations.map((station) => ({
  station,
  bank: defineChallengeBank({
    id: `scholar-${station.id}`,
    topicId: "higher-education-and-scholarly-formation",
    contentVersion: 2,
    items: scholarMemoryCards.filter((card) => scholarStationCardIds[station.id].includes(card.id)),
  }),
}));

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

type SoundCue = "jump" | "correct" | "wrong" | "flip" | "match" | "decode" | "pickup" | "file" | "finish" | "page" | "seal" | "curate";

function useArcadeSound(musicSrc: string) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    try { return window.localStorage.getItem("rizal-arcade-sound") !== "off"; } catch { return true; }
  });
  const contextRef = useRef<AudioContext | null>(null);
  const pageTurnRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const startMusic = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    const music = musicRef.current ?? new Audio(musicSrc);
    musicRef.current = music;
    music.loop = true;
    music.preload = "auto";
    music.volume = .1;
    void music.play().catch(() => { /* The next direct game interaction will try again. */ });
  }, [enabled, musicSrc]);

  const play = useCallback((cue: SoundCue, force = false) => {
    if ((!enabled && !force) || typeof window === "undefined") return;
    startMusic();
    if (cue === "page") {
      const pageTurn = pageTurnRef.current ?? new Audio("/audio/scholar-page-turn.mp3");
      pageTurnRef.current = pageTurn;
      pageTurn.volume = .32;
      pageTurn.currentTime = 0;
      void pageTurn.play().catch(() => { /* Browsers may block audio until the next direct interaction. */ });
      return;
    }
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = contextRef.current ?? new AudioContextClass();
    contextRef.current = context;
    if (context.state === "suspended") void context.resume();
    const patterns: Partial<Record<SoundCue, Array<[number, number, OscillatorType]>>> = {
      jump: [[330, .07, "sine"], [520, .11, "sine"]],
      correct: [[523, .08, "triangle"], [659, .08, "triangle"], [784, .14, "triangle"]],
      wrong: [[220, .12, "sawtooth"], [165, .18, "sawtooth"]],
      flip: [[610, .055, "triangle"]],
      match: [[440, .08, "triangle"], [660, .15, "triangle"]],
      decode: [[392, .07, "square"], [523, .07, "square"], [784, .14, "square"]],
      pickup: [[680, .07, "sine"], [820, .09, "sine"]],
      file: [[294, .08, "triangle"], [392, .13, "triangle"]],
      finish: [[523, .09, "triangle"], [659, .09, "triangle"], [784, .09, "triangle"], [1047, .22, "triangle"]],
      seal: [[392, .07, "triangle"], [494, .09, "triangle"], [659, .16, "sine"]],
      curate: [[349, .06, "triangle"], [523, .08, "sine"], [698, .13, "triangle"]],
    };
    let start = context.currentTime + .01;
    patterns[cue]?.forEach(([frequency, duration, type]) => {
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
  }, [enabled, startMusic]);

  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    try { window.localStorage.setItem("rizal-arcade-sound", next ? "on" : "off"); } catch { /* Optional preference. */ }
    if (next) {
      window.setTimeout(() => {
        const music = musicRef.current ?? new Audio(musicSrc);
        musicRef.current = music;
        music.loop = true;
        music.volume = .1;
        void music.play().catch(() => { /* Optional background audio. */ });
        play("correct", true);
      }, 0);
    } else {
      musicRef.current?.pause();
    }
  }, [enabled, musicSrc, play]);

  useEffect(() => { startMusic(); }, [startMusic]);

  useEffect(() => () => {
      musicRef.current?.pause();
      if (musicRef.current) musicRef.current.currentTime = 0;
      void contextRef.current?.close();
  }, []);
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
        {onToggleSound && <button className="sound-toggle" type="button" onClick={onToggleSound} aria-pressed={soundEnabled} aria-label={`${soundEnabled ? "Mute" : "Turn on"} game audio`}><span aria-hidden="true">{soundEnabled ? "♪" : "×"}</span><small>Audio</small></button>}
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
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound("/audio/arcade-adventure.mp3");
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

function NovelsGame({ onClose }: { onClose: () => void }) {
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
        <p className="sr-announcement" aria-live="polite">{announcement}</p>
        {matchedFact && <aside className="match-note" ref={matchNoteRef} role="status"><span>Case ledger updated</span><strong>{matchedFact.title}</strong><p>{matchedFact.rationale}</p><div>{matchedFact.sourceUrl ? <a href={matchedFact.sourceUrl} target="_blank" rel="noreferrer">Read the source: {matchedFact.source} ↗</a> : <span>Course basis: {matchedFact.source}</span>}<button className="button button-dark" type="button" onClick={dismissMatchedFact}>Keep matching</button></div></aside>}
      </section>
    </>
  );
}

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
  const wrongTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const finishTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);
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

function HeartsPortrait({ womanId, decorative = false }: { womanId: HeartsWomanId; decorative?: boolean }) {
  const profile = heartsProfilesById[womanId];
  if (profile.art) return <img className="hearts-portrait-image" src={profile.art} alt={decorative ? "" : profile.artAlt} />;
  const column = profile.portraitIndex % 3;
  const row = Math.floor(profile.portraitIndex / 3);
  return (
    <span
      className="hearts-portrait-sprite"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : profile.artAlt}
      aria-hidden={decorative ? "true" : undefined}
      style={{ backgroundPosition: `${column * 50}% ${row * 50}%` }}
    />
  );
}

function HeartsGame({ onClose }: { onClose: () => void }) {
  const roundSize = 6;
  const [deck, setDeck] = useState(() => drawChallengeSet(heartsBank, roundSize));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(4);
  const [selectedWoman, setSelectedWoman] = useState<HeartsWomanId | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<HeartsWomanId | null>(null);
  const [phase, setPhase] = useState<"selecting" | "feedback" | "finished">("selecting");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [announcement, setAnnouncement] = useState("Read the dossier, choose an identity seal and a journey postmark, then seal the letter.");
  const [wrongSelection, setWrongSelection] = useState<"identity" | "place" | "both" | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const wrongTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const [best, saveBest] = useHighScore("hearts");
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound("/audio/arcade-waltz.mp3");
  const current = deck[round];
  const currentProfile = heartsProfilesById[current.womanId];
  const options = useMemo(() => {
    const others = shuffleList(heartsProfiles.filter((profile) => profile.id !== current.womanId)).slice(0, 4);
    return {
      identities: shuffleList([currentProfile, ...others.slice(0, 2)]),
      places: shuffleList([currentProfile, ...others.slice(2, 4)]),
    };
  }, [current.womanId, currentProfile]);

  useEffect(() => {
    if (phase === "feedback") feedbackRef.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => () => {
    if (wrongTimer.current) window.clearTimeout(wrongTimer.current);
  }, []);

  function selectIdentity(womanId: HeartsWomanId) {
    if (phase !== "selecting") return;
    setSelectedWoman(womanId);
    setWrongSelection(null);
    setAnnouncement(`${heartsProfilesById[womanId].name} selected. Now confirm the journey postmark.`);
    play("pickup");
  }

  function selectHorizon(womanId: HeartsWomanId) {
    if (phase !== "selecting") return;
    setSelectedPlace(womanId);
    setWrongSelection(null);
    setAnnouncement(`${heartsProfilesById[womanId].place} selected. Seal the letter when both choices are ready.`);
    play("page");
  }

  function sealLetter() {
    if (phase !== "selecting") return;
    if (!selectedWoman || !selectedPlace) {
      setAnnouncement("The envelope needs both an identity seal and a journey postmark.");
      play("wrong");
      return;
    }
    const identityCorrect = selectedWoman === current.womanId;
    const placeCorrect = selectedPlace === current.womanId;
    if (identityCorrect && placeCorrect) {
      const nextScore = score + 160 + streak * 10;
      setScore(nextScore);
      setStreak((value) => value + 1);
      setFeedback({
        correct: true,
        title: `${currentProfile.name} · ${currentProfile.place}`,
        rationale: current.rationale,
        source: current.source,
        sourceUrl: current.sourceUrl,
      });
      setAnnouncement(`Letter sealed. ${currentProfile.name} belongs to the ${currentProfile.place} horizon.`);
      setPhase("feedback");
      play("seal");
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);
    setStreak(0);
    setWrongSelection(!identityCorrect && !placeCorrect ? "both" : identityCorrect ? "place" : "identity");
    setAnnouncement(
      identityCorrect
        ? `The identity seal fits, but the journey postmark does not. ${nextLives} lives remain.`
        : placeCorrect
          ? `The journey postmark fits, but the identity seal does not. ${nextLives} lives remain.`
          : `Neither seal fits this dossier yet. Re-read the evidence. ${nextLives} lives remain.`,
    );
    play("wrong");
    if (wrongTimer.current) window.clearTimeout(wrongTimer.current);
    wrongTimer.current = window.setTimeout(() => setWrongSelection(null), 700);
    if (nextLives === 0) {
      saveBest(score);
      window.setTimeout(() => {
        setPhase("finished");
        play("finish");
      }, 500);
    }
  }

  function nextDossier() {
    setFeedback(null);
    setSelectedWoman(null);
    setSelectedPlace(null);
    setWrongSelection(null);
    if (round === deck.length - 1) {
      saveBest(score);
      setPhase("finished");
      play("finish");
      return;
    }
    setRound((value) => value + 1);
    setPhase("selecting");
    setAnnouncement("New dossier opened. Match its identity and horizon before sealing the letter.");
    play("page");
  }

  function replay() {
    saveBest(score);
    setDeck(drawChallengeSet(heartsBank, roundSize));
    setRound(0);
    setScore(0);
    setStreak(0);
    setLives(4);
    setSelectedWoman(null);
    setSelectedPlace(null);
    setFeedback(null);
    setWrongSelection(null);
    setPhase("selecting");
    setAnnouncement("Read the dossier, choose an identity seal and a journey postmark, then seal the letter.");
  }

  if (phase === "finished") return <><GameHeader title="Hearts & Horizons" status={[{ label: "Letters", value: `${lives > 0 ? round + 1 : round} / 6` }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} /><Results game="hearts" title="Hearts & Horizons" score={score} best={best} maxScore={1110} onReplay={replay} onClose={onClose} /></>;

  return (
    <>
      <GameHeader title="Hearts & Horizons" status={[{ label: "Lives", value: "♥".repeat(lives) || "0" }, { label: "Dossier", value: `${round + 1} / ${deck.length}` }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      <section className="hearts-game play-layout">
        <div className="hearts-heading">
          <div><p className="eyebrow">Module 5 · relationships and the women Rizal met</p><h2>Read the evidence. Route the letter.</h2></div>
          <p>Portraits are archival where available; the remaining cameos are clearly labeled artistic interpretations.</p>
        </div>

        <div className="hearts-route" aria-label={`${round} of ${deck.length} letters sent`}>
          {deck.map((item, index) => <span key={item.id} className={index < round ? "is-sent" : index === round ? "is-current" : ""}><i>{index < round ? "✓" : index + 1}</i><small>{index < round ? "Sent" : index === round ? "Desk" : "Waiting"}</small>{index === round && <b aria-hidden="true">✉</b>}</span>)}
        </div>

        <div className="hearts-desk">
          <aside className={`hearts-choice-panel identity-panel ${wrongSelection === "identity" || wrongSelection === "both" ? "is-wrong" : ""}`}>
            <span className="hearts-panel-label">01 · Identity seal</span>
            <h3>Who belongs to this dossier?</h3>
            <div role="group" aria-label="Choose the woman described by the dossier">
              {options.identities.map((profile) => <button key={profile.id} type="button" className={selectedWoman === profile.id ? "is-selected" : ""} aria-pressed={selectedWoman === profile.id} disabled={phase !== "selecting"} onClick={() => selectIdentity(profile.id)}><span className="mini-profile"><HeartsPortrait womanId={profile.id} decorative /></span><strong>{profile.name}</strong><small>Press into wax</small></button>)}
            </div>
          </aside>

          <article className="hearts-dossier">
            <div className="dossier-topline"><span>{current.id} · confidential correspondence</span><b>{currentProfile.period}</b></div>
            <div className="dossier-portrait"><HeartsPortrait womanId={current.womanId} /><span>{currentProfile.art ? "Archival portrait" : "Artistic interpretation"}</span></div>
            <div className="dossier-copy"><p className="eyebrow">Evidence file</p><h3>{current.evidenceTitle}</h3><ol>{current.evidence.map((clue, index) => <li key={clue}><span>0{index + 1}</span>{clue}</li>)}</ol></div>
            <span className="dossier-thread" aria-hidden="true" />
            <span className="dossier-stamp" aria-hidden="true">RA<br />ARCHIVE</span>
          </article>

          <aside className={`hearts-choice-panel horizon-panel ${wrongSelection === "place" || wrongSelection === "both" ? "is-wrong" : ""}`}>
            <span className="hearts-panel-label">02 · Journey postmark</span>
            <h3>Where does this chapter belong?</h3>
            <div role="group" aria-label="Choose the place associated with the dossier">
              {options.places.map((profile) => <button key={profile.id} type="button" className={selectedPlace === profile.id ? "is-selected" : ""} aria-pressed={selectedPlace === profile.id} disabled={phase !== "selecting"} onClick={() => selectHorizon(profile.id)}><i>{profile.routeCode}</i><span><strong>{profile.place}</strong><small>{profile.period}</small></span></button>)}
            </div>
          </aside>
        </div>

        <div className="hearts-actions"><p aria-live="polite">{announcement}</p><button className="button hearts-seal-button" type="button" disabled={phase !== "selecting"} onClick={sealLetter}><span aria-hidden="true">✦</span> Seal & send</button></div>
        {feedback && <div className="hearts-feedback" ref={feedbackRef} tabIndex={-1}><FeedbackPanel feedback={feedback} onNext={nextDossier} isLast={round === deck.length - 1} /></div>}
        <p className="hearts-accuracy-note">Relationship histories can contain later recollections and disputed details. This game uses the course module and named institutional sources, and avoids presenting artistic cameos as documentary likenesses.</p>
      </section>
    </>
  );
}

function MasterpieceMuseumGame({ onClose }: { onClose: () => void }) {
  const roundSize = 6;
  const [deck, setDeck] = useState(() => drawChallengeSet(museumBank, roundSize));
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(4);
  const [selectedGallery, setSelectedGallery] = useState<MuseumGalleryId | null>(null);
  const [selectedPlaque, setSelectedPlaque] = useState<string | null>(null);
  const [phase, setPhase] = useState<"curating" | "feedback" | "finished">("curating");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [announcement, setAnnouncement] = useState("Inspect the artifact, choose its gallery, then attach the plaque that explains why it matters.");
  const [wrongSelection, setWrongSelection] = useState<"gallery" | "plaque" | "both" | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const finishTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const [best, saveBest] = useHighScore("museum");
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound("/audio/arcade-waltz.mp3");
  const current = deck[round];
  const currentGallery = museumGalleriesById[current.galleryId];
  const plaqueOptions = useMemo(
    () => shuffleList([current.correctPlaque, ...current.distractorPlaques]),
    [current.correctPlaque, current.distractorPlaques],
  );

  useEffect(() => {
    if (phase === "feedback") feedbackRef.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => () => {
    if (finishTimer.current) window.clearTimeout(finishTimer.current);
  }, []);

  function chooseGallery(galleryId: MuseumGalleryId) {
    if (phase !== "curating") return;
    setSelectedGallery(galleryId);
    setWrongSelection(null);
    setAnnouncement(`${museumGalleriesById[galleryId].title} selected. Now choose the exhibit plaque.`);
    play("pickup");
  }

  function choosePlaque(plaque: string) {
    if (phase !== "curating") return;
    setSelectedPlaque(plaque);
    setWrongSelection(null);
    setAnnouncement("Plaque prepared. Install the exhibit when both choices are ready.");
    play("page");
  }

  function installExhibit() {
    if (phase !== "curating") return;
    if (!selectedGallery || !selectedPlaque) {
      setAnnouncement("The exhibit needs both a gallery destination and a curatorial plaque.");
      play("wrong");
      return;
    }
    const galleryCorrect = selectedGallery === current.galleryId;
    const plaqueCorrect = selectedPlaque === current.correctPlaque;
    if (galleryCorrect && plaqueCorrect) {
      const nextScore = score + 160 + streak * 10;
      setScore(nextScore);
      setStreak((value) => value + 1);
      setFeedback({
        correct: true,
        title: `${current.workTitle} · ${currentGallery.title}`,
        rationale: current.rationale,
        source: current.source,
        sourceUrl: current.sourceUrl,
      });
      setAnnouncement(`Exhibit installed in ${currentGallery.title}.`);
      setPhase("feedback");
      play("curate");
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);
    setStreak(0);
    setWrongSelection(!galleryCorrect && !plaqueCorrect ? "both" : galleryCorrect ? "plaque" : "gallery");
    setAnnouncement(
      galleryCorrect
        ? `The gallery is right, but that plaque changes the work’s meaning. ${nextLives} lives remain.`
        : plaqueCorrect
          ? `The plaque fits, but this artifact belongs in another gallery. ${nextLives} lives remain.`
          : `Both parts of the installation need another look. ${nextLives} lives remain.`,
    );
    play("wrong");
    window.setTimeout(() => setWrongSelection(null), 650);
    if (nextLives === 0) {
      saveBest(score);
      finishTimer.current = window.setTimeout(() => {
        setPhase("finished");
        play("finish");
      }, 500);
    }
  }

  function nextExhibit() {
    setFeedback(null);
    setSelectedGallery(null);
    setSelectedPlaque(null);
    setWrongSelection(null);
    if (round === deck.length - 1) {
      saveBest(score);
      setPhase("finished");
      play("finish");
      return;
    }
    setRound((value) => value + 1);
    setPhase("curating");
    setAnnouncement("A new artifact has arrived. Build its museum label and choose its gallery.");
    play("page");
  }

  function replay() {
    saveBest(score);
    setDeck(drawChallengeSet(museumBank, roundSize));
    setRound(0);
    setScore(0);
    setStreak(0);
    setLives(4);
    setSelectedGallery(null);
    setSelectedPlaque(null);
    setFeedback(null);
    setWrongSelection(null);
    setPhase("curating");
    setAnnouncement("Inspect the artifact, choose its gallery, then attach the plaque that explains why it matters.");
  }

  if (phase === "finished") return <><GameHeader title="Masterpiece Museum" status={[{ label: "Exhibits", value: `${lives > 0 ? round + 1 : round} / 6` }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} /><Results game="museum" title="Masterpiece Museum" score={score} best={best} maxScore={1110} onReplay={replay} onClose={onClose} /></>;

  return (
    <>
      <GameHeader title="Masterpiece Museum" status={[{ label: "Lives", value: "♥".repeat(lives) || "0" }, { label: "Exhibit", value: `${round + 1} / ${deck.length}` }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      <section className="museum-game play-layout">
        <div className="museum-heading">
          <div><p className="eyebrow">Module 7 · essays, letters, annotations, and other works</p><h2>Curate Rizal’s many forms.</h2></div>
          <div className="museum-progress" aria-label={`${round} of ${deck.length} exhibits installed`}>
            {deck.map((item, index) => <span key={item.id} className={index < round ? "is-installed" : index === round ? "is-current" : ""}>{index < round ? "✓" : index + 1}</span>)}
          </div>
        </div>

        <div className="museum-floor">
          <article className="museum-artifact">
            <div className="museum-art-window"><img src="/art/masterpiece-museum.png" alt="Original illustrated museum interior with books, letters, poetry, and sculpture" /><span>{currentGallery.symbol}</span></div>
            <div className="museum-object-tag"><small>{current.id} · incoming object</small><strong>{current.objectLabel}</strong><span>{current.dateLabel}</span></div>
            <div className="museum-clue-copy"><p className="eyebrow">{current.clueTitle}</p><h3>{current.workTitle}</h3><ol>{current.evidence.map((clue, index) => <li key={clue}><span>0{index + 1}</span>{clue}</li>)}</ol></div>
          </article>

          <section className={`museum-gallery-map ${wrongSelection === "gallery" || wrongSelection === "both" ? "is-wrong" : ""}`} aria-labelledby="gallery-choice-title">
            <div className="museum-section-label"><span>01</span><div><small>Gallery destination</small><h3 id="gallery-choice-title">Where should it hang?</h3></div></div>
            <div className="museum-doors" role="group" aria-label="Choose a museum gallery">
              {museumGalleries.map((gallery) => <button key={gallery.id} type="button" className={selectedGallery === gallery.id ? "is-selected" : ""} aria-pressed={selectedGallery === gallery.id} disabled={phase !== "curating"} onClick={() => chooseGallery(gallery.id)}><i>{gallery.symbol}</i><span><strong>{gallery.shortTitle}</strong><small>{gallery.description}</small></span></button>)}
            </div>
          </section>

          <section className={`museum-plaque-rack ${wrongSelection === "plaque" || wrongSelection === "both" ? "is-wrong" : ""}`} aria-labelledby="plaque-choice-title">
            <div className="museum-section-label"><span>02</span><div><small>Curatorial meaning</small><h3 id="plaque-choice-title">Which label belongs?</h3></div></div>
            <div role="group" aria-label="Choose the exhibit’s curatorial label">
              {plaqueOptions.map((plaque, index) => <button key={plaque} type="button" className={selectedPlaque === plaque ? "is-selected" : ""} aria-pressed={selectedPlaque === plaque} disabled={phase !== "curating"} onClick={() => choosePlaque(plaque)}><i>{String.fromCharCode(65 + index)}</i><span>{plaque}</span></button>)}
            </div>
          </section>
        </div>

        <div className="museum-actions"><p aria-live="polite">{announcement}</p><button className="button museum-install-button" type="button" disabled={phase !== "curating"} onClick={installExhibit}><span aria-hidden="true">◆</span> Install exhibit</button></div>
        {feedback && <div className="museum-feedback" ref={feedbackRef} tabIndex={-1}><FeedbackPanel feedback={feedback} onNext={nextExhibit} isLast={round === deck.length - 1} /></div>}
        <p className="museum-note">Artwork is an original period-inspired illustration. Exhibit facts use the instructor module and the named institutional or primary-text sources.</p>
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
  const { enabled: soundEnabled, play, toggle: toggleSound } = useArcadeSound("/audio/arcade-mystery.mp3");
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
  return <div ref={overlayRef} tabIndex={-1} className={`game-overlay game-${game}`} role="dialog" aria-modal="true" aria-label={`${game} game`}>{game === "values" ? <ValuesGame onClose={onClose} /> : game === "novels" ? <NovelsGame onClose={onClose} /> : game === "codebreaker" ? <CodebreakerGame onClose={onClose} /> : game === "scholar" ? <ScholarMemoryGame onClose={onClose} /> : game === "hearts" ? <HeartsGame onClose={onClose} /> : <MasterpieceMuseumGame onClose={onClose} />}</div>;
}

function GameCardScene({ game }: { game: GameId }) {
  if (game === "values") return <div className="card-scene pond-card-scene"><span className="mini-cloud" /><span className="mini-lily lily-a" /><span className="mini-lily lily-b" /><span className="mini-lily lily-c" /><span className="mini-frog">●</span><strong>HOP!</strong></div>;
  if (game === "novels") return <div className="card-scene memory-card-scene"><img src="/art/noli-cover.jpg" alt="" /><span className="mini-card card-a">MC</span><span className="mini-card card-b">?</span><span className="mini-card card-c">IB</span><strong>Match the file</strong></div>;
  if (game === "codebreaker") return <div className="card-scene code-card-scene"><span className="mini-code">IRAZO</span><span className="mini-wheel">A=Z</span><span className="mini-drawer">ROOTS</span><strong>Read · Decode · File</strong></div>;
  if (game === "scholar") return <div className="card-scene scholar-card-scene"><img src="/art/universidad-central.jpg" alt="" /><span className="mini-passport passport-a">01</span><span className="mini-passport passport-b">?</span><span className="mini-passport passport-c">06</span><strong>Study · Close · Recall</strong></div>;
  if (game === "hearts") return <div className="card-scene hearts-card-scene"><img src="/art/rizal-letter.webp" alt="" /><span className="mini-envelope envelope-a">?</span><span className="mini-envelope envelope-b">YK</span><span className="mini-wax">RA</span><strong>Read · Seal · Send</strong></div>;
  return <div className="card-scene museum-card-scene"><img src="/art/masterpiece-museum.png" alt="" /><span className="mini-frame frame-a">✉</span><span className="mini-frame frame-b">❧</span><span className="mini-plaque">CURATE</span><strong>Inspect · Label · Install</strong></div>;
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
          <div className="hero-actions"><button className="button button-primary" type="button" onClick={() => launchGame("values")}>Start playing <span>▶</span></button><span>6 games · Student sign-in · Section scores</span></div>
          <div className="hero-proof"><span><strong>6</strong> playable games</span><span><strong>2–5</strong> minute rounds</span><span><strong>300</strong> sourced challenges</span></div>
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
        <div className="classroom-panel"><span className="panel-label">A typical five-minute round</span><div className="timeline-row"><strong>00:00</strong><span>Sign in and choose a game</span></div><div className="timeline-row"><strong>00:30</strong><span>Hop, match, decode, or recall</span></div><div className="timeline-row"><strong>04:00</strong><span>Review the historical evidence</span></div><div className="timeline-row"><strong>05:00</strong><span>Save a section score and discuss</span></div><button className="button button-light" type="button" onClick={() => launchGame("values")}>Start River Quest</button></div>
      </section>

      <section className="coming-section">
        <div className="section-heading"><div><p className="eyebrow">Next in the archive</p><h2>The arcade can keep growing.</h2></div><p>A modular format makes it easy to add new games after your instructor reviews the learning content.</p></div>
        <div className="coming-grid">{comingSoon.map((game, index) => <article key={game.title}><div><img src={game.art} alt={game.alt} loading="lazy" /><span>{game.symbol}</span><small>0{index + 7}</small></div><p>{game.label}</p><h3>{game.title}</h3><span className="soon-pill">Next cabinet</span></article>)}</div>
      </section>

      <section className="manifesto"><img src="/art/rizal-poster.webp" alt="Public-domain poster reading Rizal died for you—be worthy of him" loading="lazy" /><div><p className="eyebrow">A new way into history</p><p>Not a quiz wearing a costume. Every room gives history a rule, a rhythm, and a reason to try again.</p><button type="button" onClick={() => setShowSources(true)}>How we handle historical accuracy <span>→</span></button></div></section>

      <footer><a className="brand footer-brand" href="#top"><span className="brand-mark">RA</span><span>Rizal Arcade</span></a><p>An educational arcade about José Rizal’s life, works, and ideas.</p><button type="button" onClick={openLeaderboard}>Leaderboard</button><button type="button" onClick={() => setShowSources(true)}>Sources & credits</button><span>Classroom edition · 2026</span></footer>

      {activeGame && <GameOverlay game={activeGame} onClose={closeGame} />}
      {showLeaderboard && <LeaderboardDrawer onClose={closeLeaderboard} />}
      {showSources && <div className="source-overlay" role="dialog" aria-modal="true" aria-labelledby="source-title"><button className="source-backdrop" aria-label="Close sources" type="button" onClick={closeSources} /><section className="source-drawer" ref={sourceDrawerRef} tabIndex={-1}><button className="icon-button" data-dialog-close type="button" onClick={closeSources} aria-label="Close sources">×</button><p className="eyebrow">Source desk</p><h2 id="source-title">Playful format. Careful history.</h2><p>Prompts are grounded in the instructor-provided course modules, primary texts, university archives, public-domain translations, and National Historical Commission of the Philippines markers. Every River Quest scenario is explicitly an interpretive, present-day application—not a quotation or historical event.</p><h3>Core references</h3><ul><li><a href="https://philhistoricsites.nhcp.gov.ph/registry_database/jose-rizal-1861-1896-9/" target="_blank" rel="noreferrer">NHCP Registry: José Rizal ↗</a></li><li><a href="https://books.ub.uni-heidelberg.de/heibooks/catalog/book/1635" target="_blank" rel="noreferrer">Heidelberg University: Tracing José Rizal ↗</a></li><li><a href="https://archivo.ust.edu.ph/about" target="_blank" rel="noreferrer">UST Archive: Rizal student records ↗</a></li><li><a href="https://research.ateneo.edu/en/publications/rizal-in-ateneo-ateneo-in-rizal/" target="_blank" rel="noreferrer">Ateneo archive: Rizal in Ateneo ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/6737" target="_blank" rel="noreferrer">Noli Me Tangere / The Social Cancer ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/10676" target="_blank" rel="noreferrer">El Filibusterismo / The Reign of Greed ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/17116" target="_blank" rel="noreferrer">Letter to the Young Women of Malolos ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/6885" target="_blank" rel="noreferrer">The Indolence of the Filipino ↗</a></li><li><a href="https://philhistoricsites.nhcp.gov.ph/registry_database/la-liga-filipina/" target="_blank" rel="noreferrer">NHCP Registry: La Liga Filipina ↗</a></li><li><a href="https://up.edu.ph/ilustrados-enamorados-del-japon/" target="_blank" rel="noreferrer">UP: Rizal and Seiko Usui in Japan ↗</a></li><li><a href="https://www.filipinaslibrary.org.ph/himig/rizals-verses-for-leonor-and-maria-clara/" target="_blank" rel="noreferrer">Filipinas Heritage Library: Rizal’s verses for Leonor ↗</a></li><li><a href="https://pia.gov.ph/regions/dapitan-pays-homage-to-rizals-unsung-muse/" target="_blank" rel="noreferrer">PIA / NHCP: Josephine Bracken and Dapitan ↗</a></li><li><a href="https://www.nationalmuseum.gov.ph/2024/12/30/nmp-exhibits-rizals-josephine-sleeping/" target="_blank" rel="noreferrer">National Museum: Josephine Sleeping ↗</a></li></ul><h3 className="visual-credit-title">Visual and audio archive</h3><ul><li><a href="https://commons.wikimedia.org/wiki/File:Portrait_of_Jos%C3%A9_Rizal_(1883)_with_frame.jpg" target="_blank" rel="noreferrer">1883 Rizal portrait · public domain / CC0 ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Rizal-18.jpg" target="_blank" rel="noreferrer">Rizal as an eighteen-year-old medical student · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Universidad_Central_e_Instituto_Cardenal_Cisneros.jpg" target="_blank" rel="noreferrer">Former Central University of Madrid · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Manila_and_suburbs_1898.jpg" target="_blank" rel="noreferrer">1898 Manila map · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Noli_Me_Tangere.jpg" target="_blank" rel="noreferrer">Historic Noli cover · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Rizal_letter.png" target="_blank" rel="noreferrer">1889 Rizal letter · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Crayon_sketch_of_Leonor_Rivera_by_Rizal.jpg" target="_blank" rel="noreferrer">Leonor Rivera crayon sketch · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Josephine_Bracken_BR.jpg" target="_blank" rel="noreferrer">Josephine Bracken portrait · public domain ↗</a></li><li>Remaining Hearts & Horizons cameos · original artistic interpretations, not documentary likenesses</li><li><a href="https://pixabay.com/sound-effects/film-special-effects-turn-a-page-336933/" target="_blank" rel="noreferrer">Turn a Page by CreatorsHome · Pixabay Content License ↗</a></li><li><a href="https://pixabay.com/music/adventure-adventure-movie-amp-animation-soundtrack-1230/" target="_blank" rel="noreferrer">Adventure by JuliusH · Pixabay Content License ↗</a></li><li><a href="https://pixabay.com/music/crime-scene-mystery-of-the-investigation-215184/" target="_blank" rel="noreferrer">Mystery Of The Investigation by PaoloArgento · Pixabay Content License ↗</a></li><li><a href="https://pixabay.com/music/modern-classical-background-sentimental-waltz-123818/" target="_blank" rel="noreferrer">Background Sentimental Waltz by MusicLFiles · Pixabay Content License ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Rizal_Died_for_You-_Be_Worthy_of_Him_-_NARA_-_5730063.jpg" target="_blank" rel="noreferrer">Historic Rizal poster · public domain ↗</a></li></ul><div className="review-note"><strong>Before formal classroom release</strong><p>A Rizal Life instructor should review translations, wording, interpretations, and accepted answers. The game records are structured so content can be updated without redesigning each game.</p></div></section></div>}
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
