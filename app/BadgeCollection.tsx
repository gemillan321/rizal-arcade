"use client";
/* The supplied medal artwork is served as local SVG files. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import type { ArcadeProfile } from "./auth";
import { collectionProgress, gameBadges, type BadgeAward } from "./badgeCatalog";
import { loadMyBadges } from "./badges";
import type { GameId } from "./games/types";

function Medal({ art, locked = false }: { art: string; locked?: boolean }) {
  return <span className={`badge-medal ${locked ? "is-locked" : ""}`}>
    <img src={`/art/badges/${art}.svg`} width="200" height="200" alt="" loading="lazy" />
    {locked && <img className="badge-lock" src="/art/badges/lockSeal.svg" width="44" height="44" alt="" loading="lazy" />}
  </span>;
}

function useAwards(enabled: boolean, refreshKey: string) {
  const [awards, setAwards] = useState<BadgeAward[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    async function refresh() {
      setError("");
      try {
        const next = await loadMyBadges();
        if (active) setAwards(next);
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Your badges could not be loaded.");
      }
    }
    void refresh();
    window.addEventListener("focus", refresh);
    return () => { active = false; window.removeEventListener("focus", refresh); };
  }, [enabled, refreshKey, attempt]);
  return { awards, error, retry: () => setAttempt((value) => value + 1) };
}

export function BadgeAwardNotice({ game }: { game: GameId }) {
  const { awards, error, retry } = useAwards(true, game);
  const badge = gameBadges.find((item) => item.game === game)!;
  if (error) return <div className="badge-award" role="status"><p>Your score is saved. {error}</p><button className="button button-outline" type="button" onClick={retry}>Retry loading badge</button></div>;
  if (!awards) return <p role="status">Checking your badge collection…</p>;
  if (!awards.some((award) => award.game_id === game)) return <p role="status">Your score is saved. Your badge is not available yet. <button type="button" onClick={retry}>Check again</button></p>;
  const { complete } = collectionProgress(awards);
  return <div className="badge-award" role="status">
    <Medal art={badge.art} />
    <div><p className="eyebrow">Badge earned</p><h3>{badge.name}</h3><p>Saved to your collection.</p>{complete && <p className="badge-master-earned">All ten collected · Keeper of Rizal’s Legacy</p>}</div>
  </div>;
}

export default function BadgeCollection({ profile, refreshKey, onPlay, onSignIn }: { profile: ArcadeProfile | null; refreshKey: string; onPlay: (game: GameId) => void; onSignIn: () => void }) {
  const student = profile?.role === "student";
  const { awards, error, retry } = useAwards(student, refreshKey);
  const { earned, count, complete } = collectionProgress(student ? awards ?? [] : []);
  const pending = student && !awards;
  return <section className="badge-collection" id="badges" aria-labelledby="badge-collection-title">
    <div className="section-heading"><div><p className="eyebrow">Your historical archive</p><h2 id="badge-collection-title">Every chapter earns a seal.</h2></div><p>Finish a round in each game to collect its medal. Ten games, ten seals, one legacy.</p></div>
    <div className={`badge-laureate ${complete ? "is-complete" : ""}`}>
      <Medal art="bFinal" locked={!complete} />
      <div><p className="eyebrow">The complete collection</p><h3>Keeper of Rizal’s Legacy</h3><p>Collect all ten game badges to become a Rizal Arcade Master.</p>
        <p className="badge-count" role="status">{error ? "Collection temporarily unavailable" : pending ? "Loading your collection…" : complete ? "All ten seals earned" : `${count} of 10 seals collected`}</p>
        {!pending && !error && <progress value={count} max={10} aria-label="Game badges collected">{count} of 10</progress>}
        {!profile && <button type="button" className="button button-outline" onClick={onSignIn}>Sign in to collect badges</button>}
        {profile?.role === "admin" && <p>Badges are awarded to student accounts.</p>}
        {error && <button className="button button-outline" type="button" onClick={retry}>Retry loading badges</button>}
      </div>
    </div>
    <div className="badge-grid">{gameBadges.map((badge) => {
      const unlocked = earned.has(badge.game);
      const award = student ? awards?.find((item) => item.game_id === badge.game) : undefined;
      return <article className={`badge-card ${unlocked ? "is-earned" : ""}`} key={badge.game}>
        <Medal art={badge.art} locked={!unlocked} /><p className="badge-game">{badge.title}</p><h3>{badge.name}</h3>
        <p className="badge-state">{error ? "Status unavailable" : pending ? "Loading…" : unlocked ? "Earned" : "Locked · Finish a round"}</p>
        {award && <time dateTime={award.awarded_at}>{new Date(award.awarded_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</time>}
        <button type="button" onClick={() => onPlay(badge.game)} aria-label={`${unlocked ? "Replay" : "Play"} ${badge.title}`}>{unlocked ? "Play again" : "Play to collect"}<span aria-hidden="true"> →</span></button>
      </article>;
    })}</div>
  </section>;
}
