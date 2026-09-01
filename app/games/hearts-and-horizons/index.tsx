"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import { defineChallengeBank, drawChallengeSet, shuffleList } from "../../challengeBank";
import { heartsChallenges, heartsProfiles, heartsProfilesById, type HeartsWomanId } from "../../heartsChallenges";
import { FeedbackPanel, GameHeader, Results, useArcadeSound, useHighScore, type Feedback } from "../shared/ArcadeGameKit";

const heartsBank = defineChallengeBank({ id: "hearts", topicId: "love-interests-and-women-rizal-met", contentVersion: 1, items: heartsChallenges });

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
export function HeartsGame({ onClose }: { onClose: () => void }) {
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
  const wrongTimer = useRef<number | null>(null);
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
            <div className="dossier-topline"><span>{current.id} · confidential correspondence</span><b>Archive copy · identity sealed</b></div>
            <AnonymousDossierArt />
            <div className="dossier-copy"><p className="eyebrow">Evidence file</p><h3>{current.evidenceTitle}</h3><ol>{current.evidence.map((clue, index) => <li key={clue}><span>0{index + 1}</span>{clue}</li>)}</ol></div>
            <span className="dossier-thread" aria-hidden="true" />
            <span className="dossier-stamp" aria-hidden="true">RA<br />ARCHIVE</span>
          </article>

          <aside className={`hearts-choice-panel horizon-panel ${wrongSelection === "place" || wrongSelection === "both" ? "is-wrong" : ""}`}>
            <span className="hearts-panel-label">02 · Journey postmark</span>
            <h3>Where does this chapter belong?</h3>
            <div role="group" aria-label="Choose the place associated with the dossier">
              {options.places.map((profile) => <button key={profile.id} type="button" className={selectedPlace === profile.id ? "is-selected" : ""} aria-pressed={selectedPlace === profile.id} disabled={phase !== "selecting"} onClick={() => selectHorizon(profile.id)}><i>{profile.routeCode}</i><span><strong>{profile.place}</strong><small>Journey postmark</small></span></button>)}
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

function AnonymousDossierArt() {
  return (
    <div className="anonymous-dossier-art" aria-label="Anonymous correspondence evidence; identity withheld until the answer is sealed">
      <span className="anonymous-cameo" aria-hidden="true"><i /></span>
      <span className="anonymous-letter" aria-hidden="true"><b>?</b><i /></span>
      <strong>Identity withheld</strong>
      <small>Use the written evidence—not a matching portrait.</small>
    </div>
  );
}
