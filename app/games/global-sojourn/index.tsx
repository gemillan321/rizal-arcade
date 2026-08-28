"use client";

import { GameHeader } from "../shared/ArcadeGameKit";
import type { GameProps } from "../types";

/**
 * Contributor starting point for Game 07.
 * This component is intentionally not registered in the live arcade yet.
 */
export function GlobalSojournGame({ onClose }: GameProps) {
  return (
    <>
      <GameHeader title="Global Sojourn" status={[{ label: "Status", value: "Prototype" }]} onClose={onClose} />
      <section className="play-layout" aria-labelledby="global-sojourn-title">
        <p className="eyebrow">Game 07 · travels and reform work</p>
        <h2 id="global-sojourn-title">Build Rizal&apos;s route across the world.</h2>
        <p className="memory-instructions">
          Replace this scaffold with the approved Global Sojourn mechanics. Keep the topic focused on Rizal&apos;s travels,
          intellectual networks, publications, and reform work.
        </p>
      </section>
    </>
  );
}
