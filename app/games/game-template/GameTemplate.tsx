"use client";

import { useState } from "react";
import { GameHeader } from "../shared/ArcadeGameKit";
import type { GameProps } from "../types";

/** Copy this folder, rename the component, and replace the sample round with the approved mechanic. */
export function GameTemplate({ onClose }: GameProps) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  return (
    <>
      <GameHeader
        title="New Rizal Game"
        status={[{ label: "Round", value: `${round} / 6` }, { label: "Score", value: String(score) }]}
        onClose={onClose}
      />
      <section className="play-layout" aria-labelledby="template-game-title">
        <p className="eyebrow">Module number · focused topic</p>
        <h2 id="template-game-title">Replace this with one clear player goal.</h2>
        <p className="memory-instructions">Explain what the player should inspect, move, match, build, or solve.</p>
        <button
          className="button button-dark"
          type="button"
          onClick={() => {
            setScore((current) => current + 100);
            setRound((current) => Math.min(6, current + 1));
          }}
        >
          Sample correct action
        </button>
      </section>
    </>
  );
}
