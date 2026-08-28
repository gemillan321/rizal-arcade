"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import { defineChallengeBank, drawChallengeSet, shuffleList } from "../../challengeBank";
import { masterpieceChallenges, museumGalleries, museumGalleriesById, type MuseumGalleryId } from "../../masterpieceChallenges";
import { FeedbackPanel, GameHeader, Results, useArcadeSound, useHighScore, type Feedback } from "../shared/ArcadeGameKit";

const museumBank = defineChallengeBank({ id: "museum", topicId: "essays-letters-annotations-and-other-works", contentVersion: 1, items: masterpieceChallenges });

export function MasterpieceMuseumGame({ onClose }: { onClose: () => void }) {
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
  const finishTimer = useRef<number | null>(null);
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
