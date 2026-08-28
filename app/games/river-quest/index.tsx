"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defineChallengeBank, drawChallengeSet, shuffleList } from "../../challengeBank";
import { valuesChallenges } from "../../valuesChallenges";
import { FeedbackPanel, GameHeader, Results, useArcadeSound, useHighScore, type Feedback } from "../shared/ArcadeGameKit";

const valuesBank = defineChallengeBank({ id: "values", topicId: "rizalian-values", contentVersion: 2, items: valuesChallenges });

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

export function ValuesGame({ onClose }: { onClose: () => void }) {
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
