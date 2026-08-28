"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { defineChallengeBank, drawChallengeSet } from "../../challengeBank";
import { codebreakerChallenges, type CodebreakerGroup } from "../../codebreakerChallenges";
import { FeedbackPanel, GameHeader, Results, useArcadeSound, useHighScore, type Feedback } from "../shared/ArcadeGameKit";

const codeBank = defineChallengeBank({ id: "codebreaker", topicId: "family-childhood-genealogy-early-education", contentVersion: 2, items: codebreakerChallenges });

function atbashText(value: string) {
  return value.toUpperCase().replace(/[A-Z]/g, (letter) => String.fromCharCode(90 - (letter.charCodeAt(0) - 65)));
}
function normalizeCodeAnswer(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

type ArchiveGroup = CodebreakerGroup;
const archiveGroups: ArchiveGroup[] = ["Family & roots", "Childhood", "Early education"];

function archiveGroupFor(item: (typeof codeBank.items)[number]): ArchiveGroup {
  return item.category;
}

export function CodebreakerGame({ onClose }: { onClose: () => void }) {
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
