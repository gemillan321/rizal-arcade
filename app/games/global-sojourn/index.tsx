"use client";

import { useState, useEffect } from "react";
import { GameHeader } from "../shared/ArcadeGameKit";
import type { GameProps } from "../types";
import { globalSojournChallenges } from "./content";

export function GlobalSojournGame({ onClose }: GameProps) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentChallenge = globalSojournChallenges[currentIndex];
  const maxRounds = 6; // Set to 6 to match the template standard

  useEffect(() => {
    if (currentChallenge) {
      // Generate 1 correct answer and 3 random wrong answers
      const wrongPlaces = globalSojournChallenges
        .map((c) => c.place)
        .filter((p) => p !== currentChallenge.place)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      setOptions([currentChallenge.place, ...wrongPlaces].sort(() => 0.5 - Math.random()));
    }
  }, [currentIndex, currentChallenge]);

  const handleAnswer = (selectedPlace: string) => {
    if (selectedPlace === currentChallenge.place) {
      setScore((prev) => prev + 100);
    }

    if (round < maxRounds) {
      setRound((prev) => prev + 1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  if (isGameOver) {
    return (
      <>
        <GameHeader title="Global Sojourn" status={[{ label: "Final Score", value: String(score) }]} onClose={onClose} />
        <section className="play-layout" aria-labelledby="global-sojourn-title">
          <h2 id="global-sojourn-title">Journey Complete!</h2>
          <p className="memory-instructions">You scored {score} points tracing Rizal's travels.</p>
          <button className="button button-dark" type="button" onClick={onClose}>
            Return to Arcade
          </button>
        </section>
      </>
    );
  }

  if (!currentChallenge) return null;

  return (
    <>
      <GameHeader
        title="Global Sojourn"
        status={[
          { label: "Round", value: `${round} / ${maxRounds}` },
          { label: "Score", value: String(score) }
        ]}
        onClose={onClose}
      />
      <section className="play-layout" aria-labelledby="global-sojourn-title">
        <p className="eyebrow">Game 07 · Travels and Reform Work</p>
        <h2 id="global-sojourn-title">Where did this take place?</h2>
        
        <div style={{ background: "#1f2937", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid #374151" }}>
            <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Period: {currentChallenge.period}</p>
            <p style={{ fontWeight: "bold", marginBottom: "1rem" }}>Mission: {currentChallenge.mission}</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "#d1d5db" }}>
              <li>{currentChallenge.evidence[0]}</li>
              <li>{currentChallenge.evidence[1]}</li>
              <li>{currentChallenge.evidence[2]}</li>
            </ul>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {options.map((place) => (
            <button
              key={place}
              className="button button-dark"
              type="button"
              onClick={() => handleAnswer(place)}
              style={{ textAlign: "left", padding: "12px 16px", justifyContent: "flex-start" }}
            >
              {place}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
