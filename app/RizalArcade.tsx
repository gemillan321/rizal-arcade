"use client";

/* Local archive artwork is intentionally served as static files in the Vercel/Vite build. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import AdminPortal from "./AdminPortal";
import { FirstPasswordPortal, LoginPortal } from "./AuthPortal";
import { gameInstructions } from "./gameInstructions";
import { gameCards, comingSoon, gameComponents, GameCardScene } from "./games/registry";
import { LeaderboardPanel } from "./games/shared/ArcadeGameKit";
import type { GameId } from "./games/types";
import {
  getAuthSnapshot,
  signOutOfArcade,
  subscribeToArcadeAuth,
  type ArcadeAuthSnapshot,
  type ArcadeProfile,
} from "./auth";

function useModalLifecycle(active: boolean, onClose: () => void, dialogRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!active || !dialog) return;
    const dialogElement = dialog;

    const modalRoot = dialogElement.closest<HTMLElement>("[role='dialog']") ?? dialogElement;
    const siblings = modalRoot.parentElement
      ? Array.from(modalRoot.parentElement.children).filter((element): element is HTMLElement => element instanceof HTMLElement && element !== modalRoot)
      : [];
    const previousInert = siblings.map((element) => element.hasAttribute("inert"));
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

    siblings.forEach((element) => element.setAttribute("inert", ""));
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      (dialogElement.querySelector<HTMLElement>("[data-dialog-close]") ?? dialogElement).focus({ preventScroll: true });
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogElement.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) {
        event.preventDefault();
        dialogElement.focus({ preventScroll: true });
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogElement)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      siblings.forEach((element, index) => {
        if (!previousInert[index]) element.removeAttribute("inert");
      });
      previousFocus?.focus({ preventScroll: true });
    };
  }, [active, dialogRef, onClose]);
}

function GameInstructions({ game, onStart, onClose }: { game: GameId; onStart: () => void; onClose: () => void }) {
  const instructions = gameInstructions[game];
  const titleRef = useRef<HTMLHeadingElement>(null);
  const card = gameCards.find((item) => item.id === game);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <section className={`game-intro game-intro-${game}`} aria-labelledby="game-instructions-title">
      <header className="intro-topbar">
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close instructions">×</button>
        <div>
          <span>Rizal Arcade</span>
          <strong>How to Play</strong>
        </div>
        <span className="intro-game-number">Game {card?.number}</span>
      </header>

      <div className="intro-shell">
        <div className="intro-visual" aria-hidden="true">
          <div className="intro-preview"><GameCardScene game={game} /></div>
          <span className="intro-topic">{instructions.topic}</span>
          <h2>{instructions.title}</h2>
          <p>{instructions.goal}</p>
        </div>

        <div className="intro-mechanics">
          <p className="eyebrow">Before you begin</p>
          <h1 id="game-instructions-title" ref={titleRef} tabIndex={-1}>How to play</h1>
          <ol>
            {instructions.steps.map((step, index) => (
              <li key={step}><span>{index + 1}</span><p>{step}</p></li>
            ))}
          </ol>
          <div className="intro-rule">
            <span aria-hidden="true">★</span>
            <p><strong>Score & lives</strong>{instructions.scoring}</p>
          </div>
          <div className="intro-tip">
            <strong>Player tip</strong>
            <p>{instructions.tip}</p>
          </div>
          <div className="intro-actions">
            <button className="intro-back-button" type="button" onClick={onClose}>Back to arcade</button>
            <button className="button intro-start-button" type="button" onClick={onStart}>Start game <span aria-hidden="true">▶</span></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function GameOverlay({ game, onClose }: { game: GameId; onClose: () => void }) {
  const [started, setStarted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const ActiveGame = gameComponents[game];
  useModalLifecycle(true, onClose, overlayRef);
  useEffect(() => {
    if (started) {
      overlayRef.current?.scrollTo({ top: 0, behavior: "auto" });
      overlayRef.current?.focus({ preventScroll: true });
    }
  }, [started]);
  return (
    <div ref={overlayRef} tabIndex={-1} className={`game-overlay game-${game} ${started ? "is-playing" : ""}`} role="dialog" aria-modal="true" aria-label={`${gameInstructions[game].title} game`}>
      {!started
        ? <GameInstructions game={game} onClose={onClose} onStart={() => setStarted(true)} />
        : <ActiveGame onClose={onClose} />}
    </div>
  );
}

function LeaderboardDrawer({ onClose }: { onClose: () => void }) {
  const [game, setGame] = useState<GameId>("values");
  const drawerRef = useRef<HTMLElement>(null);
  useModalLifecycle(true, onClose, drawerRef);
  return (
    <div className="source-overlay leaderboard-overlay" role="dialog" aria-modal="true" aria-labelledby="leaderboard-title">
      <button className="source-backdrop" aria-label="Close leaderboard" type="button" onClick={onClose} />
      <section className="source-drawer leaderboard-drawer" ref={drawerRef} tabIndex={-1}>
        <button className="icon-button" data-dialog-close type="button" onClick={onClose} aria-label="Close leaderboard">×</button>
        <p className="eyebrow">Hall of history</p>
        <h2 id="leaderboard-title">Your section leaderboard.</h2>
        <p>Choose a game to see your section’s top scores. Other sections cannot open or read this board.</p>
        <div className="leaderboard-tabs" role="group" aria-label="Choose leaderboard">
          {gameCards.map((item) => <button key={item.id} type="button" aria-pressed={game === item.id} className={game === item.id ? "active" : ""} onClick={() => setGame(item.id)}>{item.title}</button>)}
        </div>
        <LeaderboardPanel key={game} game={game} compact />
      </section>
    </div>
  );
}

function ArcadeHome({ profile, onRequestLogin, onSignOut, onOpenAdmin }: { profile: ArcadeProfile | null; onRequestLogin: () => void; onSignOut: () => void; onOpenAdmin: () => void }) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const sourceDrawerRef = useRef<HTMLElement>(null);
  const closeGame = useCallback(() => setActiveGame(null), []);
  const closeLeaderboard = useCallback(() => setShowLeaderboard(false), []);
  const closeSources = useCallback(() => setShowSources(false), []);
  const launchGame = useCallback((game: GameId) => {
    const localPreview = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (game === "global" || game === "dapitan" || localPreview) { setActiveGame(game); return; }
    if (!profile) { onRequestLogin(); return; }
    setActiveGame(game);
  }, [onRequestLogin, profile]);
  const openLeaderboard = useCallback(() => {
    if (!profile) { onRequestLogin(); return; }
    if (profile.role === "admin") { onOpenAdmin(); return; }
    setShowLeaderboard(true);
  }, [onOpenAdmin, onRequestLogin, profile]);
  useModalLifecycle(showSources, closeSources, sourceDrawerRef);
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Rizal Arcade home"><span className="brand-mark">RA</span><span>Rizal Arcade</span><small>Est. 1861</small></a>
        <nav aria-label="Primary navigation"><a href="#games">Games</a><button className="nav-link" type="button" onClick={openLeaderboard}>Leaderboard</button><a href="#classroom">Classroom</a><button className="nav-link" type="button" onClick={() => setShowSources(true)}>Sources</button>{profile ? <><button className="player-chip" type="button" onClick={profile.role === "admin" ? onOpenAdmin : openLeaderboard}><span>{profile.display_name}</span><small>{profile.role === "admin" ? "Admin" : profile.section?.section_code}</small></button><button className="nav-signout" type="button" onClick={onSignOut}>Sign out</button></> : <button className="nav-cta" type="button" onClick={onRequestLogin}>Sign in</button>}</nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="live-dot" />Now open for curious minds</div>
          <p className="eyebrow">The José Rizal history arcade</p>
          <h1>Press play through <em>José Rizal’s life, works, and legacy.</em></h1>
          <p className="hero-intro">Hop across ideas, match characters, and crack archive codes in quick games built from Rizal’s life, works, and world.</p>
          <div className="hero-actions"><button className="button button-primary" type="button" onClick={() => launchGame("values")}>Start playing <span>▶</span></button><span>10 games · Student sign-in · Games 7–8 guest preview</span></div>
          <div className="hero-proof"><span><strong>10</strong> playable games</span><span><strong>2–5</strong> minute rounds</span><span><strong>450+</strong> sourced challenges</span></div>
        </div>
        <div className="hero-art arcade-cabinet-wrap">
          <div className="arcade-cabinet">
            <div className="cabinet-marquee"><span>★</span> RIZAL QUEST <span>★</span></div>
            <div className="cabinet-screen">
              <img src="/art/rizal-portrait.webp" alt="1883 portrait of José Rizal painted by Félix Resurrección Hidalgo" fetchPriority="high" />
              <span className="screen-scanlines" aria-hidden="true" />
              <span className="screen-label">PLAYER ONE · JOSÉ RIZAL</span>
            </div>
            <div className="cabinet-controls" aria-hidden="true"><span className="joystick" /><i /><i /><i /></div>
          </div>
          <img className="rizal-signature" src="/art/rizal-signature.svg" alt="" />
          <span className="arcade-ticket ticket-one">CALAMBA · 1861</span>
          <span className="arcade-ticket ticket-two">HISTORY + PLAY</span>
        </div>
      </section>

      <section className="games-section" id="games">
        <div className="section-heading"><div><p className="eyebrow">Featured games</p><h2>Choose your next chapter.</h2></div><p>Built for quick classroom rounds, solo review, and curious minds. Every answer opens a brief explanation and a source.</p></div>
        <div className="game-grid">
          {gameCards.map((game) => (
            <article className={`game-card ${game.tone}`} key={game.title}>
              <button className="game-launch-visual" type="button" onClick={() => launchGame(game.id)} aria-label={`Play ${game.title}`}>
                <div className={`game-visual game-visual-${game.id}`}><span className="game-number">GAME {game.number}</span><span className="game-skill">{game.skill}</span><GameCardScene game={game.id} /><span className="game-gridline" /><span className="play-medallion">Play</span></div>
              </button>
              <div className="game-copy"><span className="game-meta">{game.meta}</span><h3>{game.title}</h3><p>{game.description}</p><button type="button" onClick={() => launchGame(game.id)} aria-label={`Play ${game.title}`}>Enter game <span>→</span></button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="leaderboard-band">
        <div><span className="score-live-dot" /><p>Classroom high scores</p><h2>Make history.<br />Make the board.</h2></div>
        <div className="scoreboard-preview" aria-hidden="true"><span>RANK</span><span>PLAYER</span><span>SCORE</span><b>01</b><strong>YOUR NAME</strong><em>---</em><b>02</b><strong>RIZALISTA</strong><em>---</em><b>03</b><strong>HISTORY ACE</strong><em>---</em></div>
        <button className="button leaderboard-button" type="button" onClick={openLeaderboard}>Open my section board <span>→</span></button>
      </section>

      <section className="classroom-section" id="classroom">
        <div className="classroom-copy"><p className="eyebrow">Made for real class time</p><h2>Sign in. Play. Discuss.</h2><p>Official roster accounts connect every score to the right student and section. Short rounds leave time for the conversation that matters.</p><ul><li><span>01</span>Student ID credentials</li><li><span>02</span>Keyboard and touch friendly</li><li><span>03</span>Evidence after every answer</li><li><span>04</span>Private section leaderboards</li></ul></div>
        <div className="classroom-panel"><span className="panel-label">A typical five-minute round</span><div className="timeline-row"><strong>00:00</strong><span>Sign in and choose a game</span></div><div className="timeline-row"><strong>00:30</strong><span>Hop, match, decode, or recall</span></div><div className="timeline-row"><strong>04:00</strong><span>Review the historical evidence</span></div><div className="timeline-row"><strong>05:00</strong><span>Save a section score and discuss</span></div><button className="button button-light" type="button" onClick={() => launchGame("values")}>Start River Quest</button></div>
      </section>

      {comingSoon.length > 0 ? <section className="coming-section">
        <div className="section-heading"><div><p className="eyebrow">Next in the archive</p><h2>The arcade can keep growing.</h2></div><p>A modular format makes it easy to add new games after your instructor reviews the learning content.</p></div>
        <div className="coming-grid">{comingSoon.map((game, index) => <article key={game.title}><div><img src={game.art} alt={game.alt} loading="lazy" /><span>{game.symbol}</span><small>{String(index + 11).padStart(2, "0")}</small></div><p>{game.label}</p><h3>{game.title}</h3><span className="soon-pill">Next cabinet</span></article>)}</div>
      </section> : null}

      <section className="manifesto"><img src="/art/rizal-poster.webp" alt="Public-domain poster reading Rizal died for you—be worthy of him" loading="lazy" /><div><p className="eyebrow">A new way into history</p><p>Not a quiz wearing a costume. Every room gives history a rule, a rhythm, and a reason to try again.</p><button type="button" onClick={() => setShowSources(true)}>How we handle historical accuracy <span>→</span></button></div></section>

      <footer><a className="brand footer-brand" href="#top"><span className="brand-mark">RA</span><span>Rizal Arcade</span></a><p>An educational arcade about José Rizal’s life, works, and ideas.</p><button type="button" onClick={openLeaderboard}>Leaderboard</button><button type="button" onClick={() => setShowSources(true)}>Sources & credits</button><span>Classroom edition · 2026</span></footer>

      {activeGame && <GameOverlay game={activeGame} onClose={closeGame} />}
      {showLeaderboard && <LeaderboardDrawer onClose={closeLeaderboard} />}
      {showSources && <div className="source-overlay" role="dialog" aria-modal="true" aria-labelledby="source-title"><button className="source-backdrop" aria-label="Close sources" type="button" onClick={closeSources} /><section className="source-drawer" ref={sourceDrawerRef} tabIndex={-1}><button className="icon-button" data-dialog-close type="button" onClick={closeSources} aria-label="Close sources">×</button><p className="eyebrow">Source desk</p><h2 id="source-title">Playful format. Careful history.</h2><p>Prompts are grounded in the instructor-provided course modules, primary texts, university archives, public-domain translations, and National Historical Commission of the Philippines markers. Every River Quest scenario is explicitly an interpretive, present-day application—not a quotation or historical event.</p><h3>Core references</h3><ul><li><a href="https://philhistoricsites.nhcp.gov.ph/registry_database/jose-rizal-1861-1896-9/" target="_blank" rel="noreferrer">NHCP Registry: José Rizal ↗</a></li><li><a href="https://books.ub.uni-heidelberg.de/heibooks/catalog/book/1635" target="_blank" rel="noreferrer">Heidelberg University: Tracing José Rizal ↗</a></li><li><a href="https://archivo.ust.edu.ph/about" target="_blank" rel="noreferrer">UST Archive: Rizal student records ↗</a></li><li><a href="https://research.ateneo.edu/en/publications/rizal-in-ateneo-ateneo-in-rizal/" target="_blank" rel="noreferrer">Ateneo archive: Rizal in Ateneo ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/6737" target="_blank" rel="noreferrer">Noli Me Tangere / The Social Cancer ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/10676" target="_blank" rel="noreferrer">El Filibusterismo / The Reign of Greed ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/17116" target="_blank" rel="noreferrer">Letter to the Young Women of Malolos ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/6885" target="_blank" rel="noreferrer">The Indolence of the Filipino ↗</a></li><li><a href="https://philhistoricsites.nhcp.gov.ph/registry_database/la-liga-filipina/" target="_blank" rel="noreferrer">NHCP Registry: La Liga Filipina ↗</a></li><li><a href="https://up.edu.ph/ilustrados-enamorados-del-japon/" target="_blank" rel="noreferrer">UP: Rizal and Seiko Usui in Japan ↗</a></li><li><a href="https://www.filipinaslibrary.org.ph/himig/rizals-verses-for-leonor-and-maria-clara/" target="_blank" rel="noreferrer">Filipinas Heritage Library: Rizal’s verses for Leonor ↗</a></li><li><a href="https://pia.gov.ph/regions/dapitan-pays-homage-to-rizals-unsung-muse/" target="_blank" rel="noreferrer">PIA / NHCP: Josephine Bracken and Dapitan ↗</a></li><li><a href="https://www.nationalmuseum.gov.ph/2024/12/30/nmp-exhibits-rizals-josephine-sleeping/" target="_blank" rel="noreferrer">National Museum: Josephine Sleeping ↗</a></li></ul><h3 className="visual-credit-title">Visual and audio archive</h3><ul><li><a href="https://commons.wikimedia.org/wiki/File:Portrait_of_Jos%C3%A9_Rizal_(1883)_with_frame.jpg" target="_blank" rel="noreferrer">1883 Rizal portrait · public domain / CC0 ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Rizal-18.jpg" target="_blank" rel="noreferrer">Rizal as an eighteen-year-old medical student · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Universidad_Central_e_Instituto_Cardenal_Cisneros.jpg" target="_blank" rel="noreferrer">Former Central University of Madrid · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Manila_and_suburbs_1898.jpg" target="_blank" rel="noreferrer">1898 Manila map · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Noli_Me_Tangere.jpg" target="_blank" rel="noreferrer">Historic Noli cover · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Rizal_letter.png" target="_blank" rel="noreferrer">1889 Rizal letter · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Crayon_sketch_of_Leonor_Rivera_by_Rizal.jpg" target="_blank" rel="noreferrer">Leonor Rivera crayon sketch · public domain ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Josephine_Bracken_BR.jpg" target="_blank" rel="noreferrer">Josephine Bracken portrait · public domain ↗</a></li><li>Remaining Hearts & Horizons cameos · original artistic interpretations, not documentary likenesses</li><li>Crossword Chronicle print room · original AI-assisted illustration created for this project</li><li>Revolution Files investigation table · original AI-assisted illustration; all playable labels are live text</li><li>Revolution Files adaptive drone, tension layer, and action cues · generated locally by the browser</li><li><a href="https://pixabay.com/sound-effects/film-special-effects-turn-a-page-336933/" target="_blank" rel="noreferrer">Turn a Page by CreatorsHome · Pixabay Content License ↗</a></li><li><a href="https://pixabay.com/music/adventure-adventure-movie-amp-animation-soundtrack-1230/" target="_blank" rel="noreferrer">Adventure by JuliusH · Pixabay Content License ↗</a></li><li><a href="https://pixabay.com/music/crime-scene-mystery-of-the-investigation-215184/" target="_blank" rel="noreferrer">Mystery Of The Investigation by PaoloArgento · Pixabay Content License ↗</a></li><li><a href="https://pixabay.com/music/modern-classical-background-sentimental-waltz-123818/" target="_blank" rel="noreferrer">Background Sentimental Waltz by MusicLFiles · Pixabay Content License ↗</a></li><li><a href="https://commons.wikimedia.org/wiki/File:Rizal_Died_for_You-_Be_Worthy_of_Him_-_NARA_-_5730063.jpg" target="_blank" rel="noreferrer">Historic Rizal poster · public domain ↗</a></li></ul><div className="review-note"><strong>Before formal classroom release</strong><p>A Rizal Life instructor should review translations, wording, interpretations, and accepted answers. The game records are structured so content can be updated without redesigning each game.</p></div></section></div>}
    </main>
  );
}

export default function RizalArcade() {
  const [auth, setAuth] = useState<ArcadeAuthSnapshot | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const snapshot = await getAuthSnapshot();
        if (active) setAuth(snapshot);
      } catch {
        if (active) setAuth(null);
      }
    }
    refresh();
    const unsubscribe = subscribeToArcadeAuth(refresh);
    return () => { active = false; unsubscribe(); };
  }, []);

  async function signOut() {
    await signOutOfArcade();
    setAuth(null);
    setShowAdmin(false);
  }

  if (auth?.profile.must_change_password) {
    return <FirstPasswordPortal profile={auth.profile} onComplete={(profile) => setAuth({ ...auth, profile })} onSignOut={signOut} />;
  }

  if (auth?.profile.role === "admin" && showAdmin) {
    return <AdminPortal profile={auth.profile} onClose={() => setShowAdmin(false)} onSignOut={signOut} />;
  }

  return (
    <>
      <ArcadeHome profile={auth?.profile ?? null} onRequestLogin={() => setShowLogin(true)} onSignOut={signOut} onOpenAdmin={() => setShowAdmin(true)} />
      {showLogin && <LoginPortal onClose={() => setShowLogin(false)} onAuthenticated={(snapshot) => { setAuth(snapshot); setShowLogin(false); if (snapshot.profile.role === "admin") setShowAdmin(true); }} />}
    </>
  );
}
