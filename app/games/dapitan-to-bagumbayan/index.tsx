"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FeedbackPanel,
  GameHeader,
  useArcadeSound,
  type Feedback,
} from "../shared/ArcadeGameKit";
import type { GameProps } from "../types";
import {
  dapitanChallenges,
  EVIDENCE_OPTIONS,
  THEME_OPTIONS,
  TIMELINE_OPTIONS,
  type DapitanChallenge,
} from "./content";
import {
  defineChallengeBank,
  drawChallengeSet,
} from "../../challengeBank";

const SESSION_LENGTH = 10;
const BEST_SCORE_KEY = "rizal-arcade-dapitan-to-bagumbayan";
const dapitanBank = defineChallengeBank({
  id: "dapitan-to-bagumbayan",
  topicId: "persecution-exile-trial-execution-and-legacy",
  contentVersion: 1,
  items: dapitanChallenges,
});

type GamePhase = "intro" | "playing" | "results";

function getOptions(challenge: DapitanChallenge) {
  if (challenge.task === "timeline") {
    return [...TIMELINE_OPTIONS];
  }

  if (challenge.task === "evidence") {
    return [...EVIDENCE_OPTIONS];
  }

  return [...THEME_OPTIONS];
}

function getTaskLabel(challenge: DapitanChallenge) {
  if (challenge.task === "timeline") {
    return "Timeline File";
  }

  if (challenge.task === "evidence") {
    return "Evidence Check";
  }

  return "Rizalian Theme";
}

function getTaskInstruction(challenge: DapitanChallenge) {
  if (challenge.task === "timeline") {
    return "File this event under the correct stage of Rizal's final years.";
  }

  if (challenge.task === "evidence") {
    return "Decide how the course module treats this historical claim.";
  }

  return "Connect this Rizalian idea to the correct theme.";
}

export function DapitanToBagumbayanGame({ onClose }: GameProps) {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [session, setSession] = useState<DapitanChallenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [best, setBest] = useState(0);

  const sound = useArcadeSound("/audio/arcade-mystery.mp3");

  const currentChallenge = session[currentIndex];

  const options = useMemo(
    () => (currentChallenge ? getOptions(currentChallenge) : []),
    [currentChallenge],
  );

  const startGame = useCallback(() => {
    const nextSession = drawChallengeSet(
      dapitanBank,
      Math.min(SESSION_LENGTH, dapitanChallenges.length),
    );

    setSession(nextSession);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setPhase("playing");
    sound.play("page");
  }, [sound]);

  const submitAnswer = useCallback(
    (selectedAnswer: string) => {
      if (!currentChallenge || feedback) {
        return;
      }

      const correct = selectedAnswer === currentChallenge.answer;

      if (correct) {
        const streakBonus = Math.min(streak, 4) * 20;
        const pointsEarned = 100 + streakBonus;

        setScore((current) => current + pointsEarned);
        setStreak((current) => current + 1);
        sound.play("seal");
      } else {
        setStreak(0);
        sound.play("wrong");
      }

      setFeedback({
        correct,
        title: correct
          ? "Evidence filed correctly."
          : `Correct file: ${currentChallenge.answer}`,
        rationale: currentChallenge.explanation,
        source: currentChallenge.source,
        sourceUrl: currentChallenge.sourceUrl,
      });
    },
    [currentChallenge, feedback, sound, streak],
  );

  const goToNext = useCallback(() => {
    if (!currentChallenge) {
      return;
    }

    const lastCard = currentIndex >= session.length - 1;

    if (lastCard) {
      const nextBest = Math.max(best, score);

      setBest(nextBest);

      try {
        window.localStorage.setItem(BEST_SCORE_KEY, String(nextBest));
      } catch {
        // Local best scores are optional on restricted school devices.
      }

      sound.play("finish");
      setPhase("results");
      return;
    }

    setCurrentIndex((current) => current + 1);
    setFeedback(null);
    sound.play("file");
  }, [
    best,
    currentChallenge,
    currentIndex,
    score,
    session.length,
    sound,
  ]);

  useEffect(() => {
  const frameId = window.requestAnimationFrame(() => {
    try {
      const stored = Number(
        window.localStorage.getItem(BEST_SCORE_KEY) ?? 0,
      );

      if (Number.isFinite(stored)) {
        setBest(stored);
      }
    } catch {
      // Local scores are optional on restricted school devices.
    }
  });

  return () => {
    window.cancelAnimationFrame(frameId);
  };
}, []);

  useEffect(() => {
    if (phase !== "playing") {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (feedback) {
        if (event.key === "Enter") {
          event.preventDefault();
          goToNext();
        }

        return;
      }

      const numericChoice = Number(event.key);

      if (
        Number.isInteger(numericChoice) &&
        numericChoice >= 1 &&
        numericChoice <= options.length
      ) {
        event.preventDefault();
        submitAnswer(options[numericChoice - 1]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [feedback, goToNext, options, phase, submitAnswer]);

  if (phase === "intro") {
    return (
      <>
        <GameHeader
          title="Dapitan to Bagumbayan"
          status={[
            { label: "Files", value: String(SESSION_LENGTH) },
            { label: "Best", value: String(best) },
          ]}
          onClose={onClose}
          soundEnabled={sound.enabled}
          onToggleSound={sound.toggle}
        />

        <section
          className="play-layout"
          aria-labelledby="dapitan-intro-title"
        >
          <p className="eyebrow">
            Module 6 · Rizal&apos;s final years
          </p>

          <h2
            id="dapitan-intro-title"
            style={{
              color: "#fff1c7",
              fontSize: "clamp(2.4rem, 6vw, 5rem)",
              lineHeight: 0.95,
              maxWidth: "900px",
            }}
          >
            Reconstruct the final journey.
          </h2>

          <p
            className="memory-instructions"
            style={{
              color: "#d8ddd5",
              fontSize: "1.05rem",
              lineHeight: 1.7,
              maxWidth: "850px",
            }}
          >
            You are a historical archivist. Examine each file and stamp it
            into the correct timeline stage, evidence category, or Rizalian
            theme.
          </p>

          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              margin: "1.5rem 0",
            }}
          >
            <article className="results-card">
              <p className="eyebrow">Timeline File</p>
              <strong>When did it belong?</strong>
              <p>
                Sort events from the road to exile through Rizal&apos;s
                martyrdom and legacy.
              </p>
            </article>

            <article className="results-card">
              <p className="eyebrow">Evidence Check</p>
              <strong>What does the module support?</strong>
              <p>
                Separate supported claims, debated issues, and statements
                contradicted by the course material.
              </p>
            </article>

            <article className="results-card">
              <p className="eyebrow">Rizalian Theme</p>
              <strong>What idea does it represent?</strong>
              <p>
                Connect Rizal&apos;s ideas with reform, education, nationhood,
                civic responsibility, or justice.
              </p>
            </article>
          </div>

          <p
            className="memory-instructions"
            style={{
              color: "#d8ddd5",
              lineHeight: 1.6,
            }}
          >
            Correct file: 100 points. Consecutive correct answers earn a
            streak bonus. Use the buttons or number keys 1–5.
          </p>

          <button
            className="button button-primary"
            type="button"
            onClick={startGame}
          >
            Open the archive
          </button>
        </section>
      </>
    );
  }

  if (phase === "results") {
  return (
    <>
      <GameHeader
        title="Dapitan to Bagumbayan"
        status={[
          { label: "Score", value: String(score) },
          { label: "Best", value: String(Math.max(best, score)) },
        ]}
        onClose={onClose}
        soundEnabled={sound.enabled}
        onToggleSound={sound.toggle}
      />

      <section
        className="results-shell"
        aria-labelledby="dapitan-results-title"
        style={{
          minHeight: "calc(100vh - 82px)",
          width: "100%",
          maxWidth: "none",
          margin: 0,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          justifyItems: "center",
          alignItems: "center",
          padding: "clamp(1rem, 4vw, 3rem)",
          boxSizing: "border-box",
        }}
              >
        <div
          className="results-card"
          style={{
            width: "min(900px, 100%)",
            maxWidth: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
            overflow: "hidden",
            padding: "clamp(1.5rem, 5vw, 4rem)",
          }}
        >
          <span className="results-seal">★</span>

          <p className="eyebrow">Archive complete</p>

          <h2
            id="dapitan-results-title"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
              lineHeight: 0.95,
              margin: "1rem auto",
              maxWidth: "720px",
              overflowWrap: "anywhere",
            }}
          >
            Final journey reconstructed.
          </h2>

          <p
            style={{
              maxWidth: "650px",
              margin: "1.5rem auto",
              lineHeight: 1.7,
              overflowWrap: "break-word",
            }}
          >
            You reviewed evidence from Rizal&apos;s exile, Dapitan years,
            trial, imprisonment, execution, and legacy.
          </p>

          <div
            className="score-pair"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              width: "100%",
              maxWidth: "680px",
              margin: "2rem auto",
            }}
          >
            <div
              style={{
                minWidth: 0,
                overflowWrap: "break-word",
              }}
            >
              <span>Score</span>
              <strong>{score}</strong>
            </div>

            <div
              style={{
                minWidth: 0,
                overflowWrap: "break-word",
              }}
            >
              <span>Best on this device</span>
              <strong>{Math.max(best, score)}</strong>
            </div>
          </div>

          <div
            className="results-actions"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.75rem",
              width: "100%",
            }}
          >
            <button
              className="button button-primary"
              type="button"
              onClick={startGame}
            >
              Reopen archive
            </button>

            <button
              className="button button-outline"
              type="button"
              onClick={onClose}
            >
              Back to arcade
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

  if (!currentChallenge) {
    return null;
  }

  return (
    <>
      <GameHeader
        title="Dapitan to Bagumbayan"
        status={[
          {
            label: "File",
            value: `${currentIndex + 1} / ${session.length}`,
          },
          { label: "Score", value: String(score) },
          { label: "Streak", value: String(streak) },
        ]}
        onClose={onClose}
        soundEnabled={sound.enabled}
        onToggleSound={sound.toggle}
      />

      <section
        className="play-layout"
        aria-labelledby="dapitan-file-title"
      >
        <p className="eyebrow">
          {getTaskLabel(currentChallenge)}
        </p>

        <h2
          id="dapitan-file-title"
          style={{
            color: "#fff1c7",
            fontSize: "clamp(2rem, 5vw, 4.25rem)",
            lineHeight: 1.05,
            maxWidth: "1050px",
            marginBottom: "1rem",
          }}
        >
          {currentChallenge.prompt}
        </h2>

        <p
          className="memory-instructions"
          style={{
            color: "#d8ddd5",
            fontSize: "1rem",
            lineHeight: 1.6,
          }}
        >
          {getTaskInstruction(currentChallenge)}
        </p>

        <div
          role="group"
          aria-label="Archive choices"
          style={{
            display: "grid",
            gap: "0.8rem",
            margin: "1.5rem 0",
          }}
        >
          {options.map((option, index) => (
            <button
              key={option}
              className="button button-outline"
              type="button"
              disabled={feedback !== null}
              onClick={() => submitAnswer(option)}
              style={{
                justifyContent: "flex-start",
                textAlign: "left",
                width: "100%",
                minHeight: "64px",
                padding: "1rem 1.25rem",
                background: feedback ? "#e8e0c6" : "#fff1c7",
                color: "#08232d",
                border: "2px solid #f5c342",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: 700,
                opacity: feedback ? 0.55 : 1,
                cursor: feedback ? "default" : "pointer",
              }}
            >
              <strong style={{ marginRight: "0.75rem" }}>
                {index + 1}.
              </strong>
              {option}
            </button>
          ))}
        </div>

        {!feedback && (
          <p
            className="memory-instructions"
            style={{
              color: "#aebdbd",
            }}
          >
            Select a file or press its number key.
          </p>
        )}

        {feedback && (
          <FeedbackPanel
            feedback={feedback}
            onNext={goToNext}
            isLast={currentIndex === session.length - 1}
          />
        )}
      </section>
    </>
  );
}