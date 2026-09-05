"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadLeaderboard, submitLeaderboardScore, type LeaderboardGame, type LeaderboardState } from "../../leaderboard";

export type GameId = LeaderboardGame;
export type Feedback = { correct: boolean; title: string; rationale: string; source: string; sourceUrl: string };

export type SoundCue = "jump" | "correct" | "wrong" | "flip" | "match" | "decode" | "pickup" | "file" | "finish" | "page" | "seal" | "curate";

export function useArcadeSound(musicSrc: string) {
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
    if (contextRef.current?.state === "closed") contextRef.current = null;
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
      const context = contextRef.current;
      contextRef.current = null;
      if (context && context.state !== "closed") void context.close().catch(() => { /* Already closing. */ });
  }, []);
  return { enabled, play, toggle };
}
export function useHighScore(game: GameId) {
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


export function FeedbackPanel({ feedback, onNext, isLast }: { feedback: Feedback; onNext: () => void; isLast: boolean }) {
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

export function LeaderboardPanel({ game, score, compact = false }: { game: GameId; score?: number; compact?: boolean }) {
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

export function Results({ game, title, score, best, maxScore, onReplay, onClose }: { game: GameId; title: string; score: number; best: number; maxScore: number; onReplay: () => void; onClose: () => void }) {
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

export function GameHeader({ title, status, onClose, soundEnabled, onToggleSound }: { title: string; status: Array<{ label: string; value: string }>; onClose: () => void; soundEnabled?: boolean; onToggleSound?: () => void }) {
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
