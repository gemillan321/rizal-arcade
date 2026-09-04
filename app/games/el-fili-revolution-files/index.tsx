"use client";

/* Original archive artwork is intentionally served as a static game asset. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent } from "react";
import { defineChallengeBank, drawChallengeSet, shuffleList } from "../../challengeBank";
import { GameHeader, Results, useHighScore } from "../shared/ArcadeGameKit";
import type { GameProps } from "../types";
import { revolutionCases, revolutionRoleLabels } from "./content";

const roundSize = 6;
const maxExposure = 4;
const maxScore = 1275;

const revolutionBank = defineChallengeBank({
  id: "el-fili-revolution-files",
  topicId: "el-filibusterismo-reform-revolution-and-national-awakening",
  contentVersion: 1,
  items: revolutionCases,
});

type Phase = "building" | "debrief" | "finished";
type RevolutionCue = "pick" | "thread" | "reveal" | "resolve" | "alarm" | "finish";

type AudioRig = {
  context: AudioContext;
  master: GainNode;
  drone: OscillatorNode;
  droneGain: GainNode;
  undertone: OscillatorNode;
  undertoneGain: GainNode;
  noise: AudioBufferSourceNode;
  noiseGain: GainNode;
};

function drawFiles() {
  return drawChallengeSet(revolutionBank, roundSize);
}

function useRevolutionAudio(exposure: number) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    try { return window.localStorage.getItem("rizal-arcade-sound") !== "off"; } catch { return true; }
  });
  const rigRef = useRef<AudioRig | null>(null);

  const start = useCallback((force = false) => {
    if ((!enabled && !force) || typeof window === "undefined") return null;
    const current = rigRef.current;
    if (current) {
      if (current.context.state === "suspended") void current.context.resume();
      return current;
    }
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = .62;
    master.connect(context.destination);

    const drone = context.createOscillator();
    const droneGain = context.createGain();
    drone.type = "sine";
    const danger = maxExposure - exposure;
    drone.frequency.value = 55 + danger * 4.5;
    droneGain.gain.value = .025;
    drone.connect(droneGain).connect(master);
    drone.start();

    const undertone = context.createOscillator();
    const undertoneGain = context.createGain();
    const pulse = context.createOscillator();
    const pulseDepth = context.createGain();
    undertone.type = "triangle";
    undertone.frequency.value = 82.41 + danger * 3.2;
    undertoneGain.gain.value = .011;
    pulse.frequency.value = .085;
    pulseDepth.gain.value = .007;
    pulse.connect(pulseDepth).connect(undertoneGain.gain);
    undertone.connect(undertoneGain).connect(master);
    undertone.start();
    pulse.start();

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let index = 0; index < noiseData.length; index += 1) noiseData[index] = Math.random() * 2 - 1;
    const noise = context.createBufferSource();
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 920;
    noiseFilter.Q.value = .55;
    noiseGain.gain.value = .003 + danger * .0014;
    noise.connect(noiseFilter).connect(noiseGain).connect(master);
    noise.start();

    const rig = { context, master, drone, droneGain, undertone, undertoneGain, noise, noiseGain };
    rigRef.current = rig;
    return rig;
  }, [enabled, exposure]);

  const play = useCallback((cue: RevolutionCue, force = false) => {
    const rig = start(force);
    if (!rig) return;
    const { context, master } = rig;
    const patterns: Record<RevolutionCue, Array<[number, number, OscillatorType, number]>> = {
      pick: [[370, .045, "triangle", .04]],
      thread: [[196, .05, "sine", .045], [392, .11, "triangle", .055]],
      reveal: [[330, .06, "triangle", .045], [494, .08, "sine", .05], [659, .13, "triangle", .045]],
      resolve: [[196, .07, "sine", .045], [392, .08, "triangle", .055], [523, .1, "triangle", .06], [784, .22, "sine", .05]],
      alarm: [[147, .12, "sawtooth", .055], [131, .2, "sawtooth", .045]],
      finish: [[196, .08, "sine", .04], [294, .08, "triangle", .05], [392, .09, "triangle", .055], [587, .28, "sine", .055]],
    };
    let when = context.currentTime + .012;
    patterns[cue].forEach(([frequency, duration, type, volume]) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, when);
      gain.gain.setValueAtTime(.0001, when);
      gain.gain.exponentialRampToValueAtTime(volume, when + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, when + duration);
      oscillator.connect(gain).connect(master);
      oscillator.start(when);
      oscillator.stop(when + duration + .02);
      when += duration * .72;
    });
  }, [start]);

  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    try { window.localStorage.setItem("rizal-arcade-sound", next ? "on" : "off"); } catch { /* Optional preference. */ }
    if (next) {
      const rig = start(true);
      if (rig) rig.master.gain.setTargetAtTime(.62, rig.context.currentTime, .03);
      window.setTimeout(() => play("reveal", true), 0);
    } else if (rigRef.current) {
      rigRef.current.master.gain.setTargetAtTime(.0001, rigRef.current.context.currentTime, .025);
    }
  }, [enabled, play, start]);

  useEffect(() => {
    const rig = rigRef.current;
    if (!rig) return;
    const danger = maxExposure - exposure;
    const now = rig.context.currentTime;
    rig.drone.frequency.setTargetAtTime(55 + danger * 4.5, now, .35);
    rig.undertone.frequency.setTargetAtTime(82.41 + danger * 3.2, now, .35);
    rig.noiseGain.gain.setTargetAtTime(.003 + danger * .0014, now, .3);
  }, [exposure]);

  useEffect(() => () => {
    const rig = rigRef.current;
    if (!rig) return;
    try { rig.drone.stop(); rig.undertone.stop(); rig.noise.stop(); } catch { /* Already stopped. */ }
    void rig.context.close();
  }, []);

  return { enabled, play, toggle };
}

function fileProgressLabel(index: number, currentIndex: number, solved: number) {
  if (index < solved) return "Thread resolved";
  if (index === currentIndex) return "Active file";
  return "Sealed file";
}

export function ElFiliRevolutionGame({ onClose }: GameProps) {
  const [deck, setDeck] = useState(drawFiles);
  const [caseIndex, setCaseIndex] = useState(0);
  const [slots, setSlots] = useState<Array<string | null>>([null, null, null, null]);
  const [lockedSlots, setLockedSlots] = useState<number[]>([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("building");
  const [exposure, setExposure] = useState(maxExposure);
  const [insights, setInsights] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [announcement, setAnnouncement] = useState("Open an evidence card, then pin it into the causal chain.");
  const [best, saveBest] = useHighScore("revolution");
  const { enabled: soundEnabled, play, toggle: toggleSound } = useRevolutionAudio(exposure);
  const debriefRef = useRef<HTMLElement>(null);
  const current = deck[caseIndex];
  const evidence = useMemo(() => shuffleList([...current.chain, ...current.decoys]), [current]);
  const evidenceById = useMemo(() => new Map(evidence.map((item) => [item.id, item])), [evidence]);
  const slottedIds = useMemo(() => new Set(slots.filter((id): id is string => Boolean(id))), [slots]);
  const selectedEvidence = selectedEvidenceId ? evidenceById.get(selectedEvidenceId) : null;
  const isCaseSolved = phase === "debrief" && exposure > 0 && lockedSlots.length === current.chain.length;
  const operationOver = exposure <= 0 || (solved === roundSize && isCaseSolved);

  useEffect(() => {
    if (phase === "debrief") debriefRef.current?.focus({ preventScroll: true });
  }, [phase]);

  function selectEvidence(evidenceId: string) {
    if (phase !== "building") return;
    setSelectedEvidenceId((selected) => selected === evidenceId ? null : evidenceId);
    const item = evidenceById.get(evidenceId);
    setAnnouncement(item ? `Evidence selected: ${item.text} Choose an open position on the thread.` : "Evidence selected.");
    play("pick");
  }

  function placeEvidence(slotIndex: number, evidenceId: string | null = selectedEvidenceId) {
    if (phase !== "building" || lockedSlots.includes(slotIndex) || !evidenceId) return;
    setSlots((previous) => {
      const next = previous.map((id) => id === evidenceId ? null : id);
      next[slotIndex] = evidenceId;
      return next;
    });
    setSelectedEvidenceId(null);
    setAnnouncement(`Thread pinned at position ${slotIndex + 1}. Build the remaining links, then test the chain.`);
    play("thread");
  }

  function releaseSlot(slotIndex: number) {
    if (phase !== "building" || lockedSlots.includes(slotIndex)) return;
    const evidenceId = slots[slotIndex];
    setSlots((previous) => previous.map((id, index) => index === slotIndex ? null : id));
    setSelectedEvidenceId(evidenceId);
    setAnnouncement("That evidence is back in your hand. Pin it into another position.");
    play("pick");
  }

  function dropEvidence(event: DragEvent<HTMLButtonElement>, slotIndex: number) {
    event.preventDefault();
    placeEvidence(slotIndex, event.dataTransfer.getData("text/revolution-evidence"));
  }

  function testChain() {
    if (phase !== "building" || slots.some((slot) => !slot)) return;
    const correctSlots = current.chain.map((item, index) => slots[index] === item.id ? index : -1).filter((index) => index >= 0);
    if (correctSlots.length === current.chain.length) {
      const points = 150 + streak * 15 + (attempts === 0 ? 25 : 0);
      const nextScore = score + points;
      setScore(nextScore);
      setSolved((value) => value + 1);
      setStreak((value) => value + 1);
      setLockedSlots([0, 1, 2, 3]);
      setSelectedEvidenceId(null);
      setAnnouncement(`Causal chain verified. ${points} insight points secured.`);
      setPhase("debrief");
      if (caseIndex === roundSize - 1) saveBest(nextScore);
      play("resolve");
      return;
    }

    const nextExposure = exposure - 1;
    setExposure(nextExposure);
    setStreak(0);
    setAttempts((value) => value + 1);
    setLockedSlots(correctSlots);
    if (nextExposure <= 0) {
      setSlots(current.chain.map((item) => item.id));
      setLockedSlots([0, 1, 2, 3]);
      setSelectedEvidenceId(null);
      setAnnouncement("The operation was exposed. The archive has opened the verified chain for review.");
      setPhase("debrief");
      saveBest(score);
    } else {
      setSlots((previous) => previous.map((id, index) => correctSlots.includes(index) ? id : null));
      setAnnouncement(`${correctSlots.length} thread${correctSlots.length === 1 ? "" : "s"} held. The false links were removed; exposure rose by one.`);
    }
    play("alarm");
  }

  function illuminateThread() {
    if (phase !== "building" || insights <= 0) return;
    const slotIndex = current.chain.findIndex((item, index) => slots[index] !== item.id);
    if (slotIndex < 0) return;
    const evidenceId = current.chain[slotIndex].id;
    setSlots((previous) => {
      const next = previous.map((id) => id === evidenceId ? null : id);
      next[slotIndex] = evidenceId;
      return next;
    });
    setLockedSlots((previous) => previous.includes(slotIndex) ? previous : [...previous, slotIndex]);
    setInsights((value) => value - 1);
    setScore((value) => Math.max(0, value - 20));
    setAttempts((value) => value + 1);
    setSelectedEvidenceId(null);
    setAnnouncement(`Lamplight fixed thread ${slotIndex + 1}. Twenty points were spent.`);
    play("reveal");
  }

  function nextFile() {
    if (operationOver) {
      saveBest(score);
      setPhase("finished");
      play("finish");
      return;
    }
    setCaseIndex((value) => value + 1);
    setSlots([null, null, null, null]);
    setLockedSlots([]);
    setSelectedEvidenceId(null);
    setAttempts(0);
    setPhase("building");
    setAnnouncement("A new sealed file is open. Inspect the evidence and reconstruct its causal chain.");
    play("reveal");
  }

  function replay() {
    setDeck(drawFiles());
    setCaseIndex(0);
    setSlots([null, null, null, null]);
    setLockedSlots([]);
    setSelectedEvidenceId(null);
    setPhase("building");
    setExposure(maxExposure);
    setInsights(3);
    setScore(0);
    setStreak(0);
    setSolved(0);
    setAttempts(0);
    setAnnouncement("A fresh set of files is on the table. Build the first causal chain.");
    play("reveal");
  }

  if (phase === "finished") {
    return <><GameHeader title="El Fili: Revolution Files" status={[{ label: "Files", value: `${solved} / ${roundSize}` }, { label: "Exposure", value: String(exposure) }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} /><Results game="revolution" title="El Fili: Revolution Files" score={score} best={best} maxScore={maxScore} onReplay={replay} onClose={onClose} /></>;
  }

  return (
    <>
      <GameHeader title="El Fili: Revolution Files" status={[{ label: "Files", value: `${Math.min(caseIndex + 1, roundSize)} / ${roundSize}` }, { label: "Exposure", value: String(exposure) }, { label: "Score", value: String(score) }]} onClose={onClose} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      <main className={`revolution-game exposure-${maxExposure - exposure}`} aria-labelledby="revolution-title">
        <div className="revolution-atmosphere" aria-hidden="true"><i /><i /><i /></div>
        <header className="revolution-masthead">
          <div><p>Game 09 · Confidential archive</p><h2 id="revolution-title">Revolution <em>Files</em></h2></div>
          <div className="revolution-heat" aria-label={`${exposure} of ${maxExposure} exposure shields remaining`}>
            <span>Colonial exposure</span>
            <div>{Array.from({ length: maxExposure }, (_, index) => <i key={index} className={index >= exposure ? "is-burned" : ""} />)}</div>
            <small>{exposure === maxExposure ? "Unseen" : exposure > 1 ? "Watched" : exposure === 1 ? "Compromised" : "Exposed"}</small>
          </div>
        </header>

        <section className="revolution-table">
          <img className="revolution-table-art" src="/art/el-fili-revolution-table.webp" alt="" aria-hidden="true" draggable={false} />
          <aside className="revolution-file-rail" aria-label="Operation files">
            <span>Operation ledger</span>
            <ol>{deck.map((file, index) => <li key={file.id} className={index < solved ? "is-solved" : index === caseIndex ? "is-current" : ""}><b>{file.fileNumber}</b><div><strong>{index < solved ? "Resolved" : index === caseIndex ? "Open" : "Sealed"}</strong><small>{fileProgressLabel(index, caseIndex, solved)}</small></div></li>)}</ol>
          </aside>

          <div className="revolution-workspace">
            <section className="revolution-briefing">
              <div><span>Case file {current.fileNumber}</span><small>{current.chapter}</small></div>
              <h3>{current.title}</h3>
              <p>{current.briefing}</p>
            </section>

            <section className="revolution-chain" aria-label="Causal chain workspace">
              <div className="revolution-chain-line" aria-hidden="true" />
              <div className="revolution-chain-slots">
                {revolutionRoleLabels.map((role, index) => {
                  const item = slots[index] ? evidenceById.get(slots[index] as string) : null;
                  const isLocked = lockedSlots.includes(index);
                  return (
                    <button
                      key={role.role}
                      type="button"
                      className={`${item ? "is-filled" : ""} ${isLocked ? "is-locked" : ""} ${selectedEvidence ? "can-receive" : ""}`}
                      onClick={() => item ? releaseSlot(index) : placeEvidence(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => dropEvidence(event, index)}
                      disabled={phase !== "building" || isLocked}
                      aria-label={`${role.label}. ${item ? item.text : role.prompt}${isLocked ? ", verified" : ""}`}
                    >
                      <span>{role.label}</span>
                      {item ? <strong>{item.text}</strong> : <em>{selectedEvidence ? "Pin selected evidence here" : role.prompt}</em>}
                      <i aria-hidden="true">{isLocked ? "✓" : index + 1}</i>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="revolution-evidence" aria-label="Evidence tray">
              <div className="revolution-evidence-heading"><div><span>Loose evidence</span><strong>{evidence.length - slottedIds.size} fragments remain</strong></div><p>Select a fragment, then a position. Dragging also works.</p></div>
              <div className="revolution-evidence-tray">
                {evidence.filter((item) => !slottedIds.has(item.id)).map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={selectedEvidenceId === item.id ? "is-selected" : ""}
                    draggable={phase === "building"}
                    onDragStart={(event) => { event.dataTransfer.setData("text/revolution-evidence", item.id); setSelectedEvidenceId(item.id); play("pick"); }}
                    onClick={() => selectEvidence(item.id)}
                    disabled={phase !== "building"}
                    style={{ "--evidence-turn": `${(index % 5 - 2) * .36}deg` } as CSSProperties}
                  >
                    <span>EF · {String(index + 1).padStart(2, "0")}</span>
                    <strong>{item.text}</strong>
                    <i aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>

            <div className="revolution-controls">
              <button type="button" className="revolution-insight" onClick={illuminateThread} disabled={phase !== "building" || insights <= 0}><span aria-hidden="true">◈</span><strong>Illuminate a thread</strong><small>{insights} lamplight clues · −20 points</small></button>
              <button type="button" className="revolution-commit" onClick={testChain} disabled={phase !== "building" || slots.some((slot) => !slot)}><span>Test the chain</span><b aria-hidden="true">→</b></button>
            </div>
            <p className="revolution-announcement" aria-live="polite">{announcement}</p>
          </div>

          {phase === "debrief" && (
            <section className={`revolution-debrief ${isCaseSolved ? "is-resolved" : "is-exposed"}`} ref={debriefRef} tabIndex={-1} aria-live="polite">
              <div className="revolution-debrief-seal" aria-hidden="true">{isCaseSolved ? "VERIFIED" : "EXPOSED"}</div>
              <div className="revolution-debrief-copy">
                <p>{isCaseSolved ? "Causal chain verified" : "Archive intervention"}</p>
                <h3>{current.title}</h3>
                <span>{current.explanation}</span>
                <blockquote><strong>Strategic reading</strong>{current.strategicReading}</blockquote>
                <a href={current.sourceUrl} target="_blank" rel="noreferrer">Read the primary text: {current.source} ↗</a>
              </div>
              <button type="button" onClick={nextFile}>{operationOver ? "Open final assessment" : "Unseal next file"}<span aria-hidden="true">→</span></button>
            </section>
          )}
        </section>
      </main>
    </>
  );
}
