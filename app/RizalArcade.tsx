"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type GameId = "values" | "novels" | "codebreaker";
type Feedback = { correct: boolean; title: string; rationale: string; source: string; sourceUrl: string };

const gameCards: Array<{
  id: GameId;
  number: string;
  title: string;
  description: string;
  meta: string;
  tone: string;
  symbol: string;
  skill: string;
}> = [
  {
    id: "values",
    number: "01",
    title: "Values in Motion",
    description: "Sort present-day choices through ideas found in Rizal’s writings and civic work.",
    meta: "Sort & decide · 3 min",
    tone: "burgundy",
    symbol: "V",
    skill: "Evidence-based judgment",
  },
  {
    id: "novels",
    number: "02",
    title: "Novel Case Files",
    description: "Follow the clues. Identify characters from Noli Me Tángere and El Filibusterismo.",
    meta: "Mystery · 5 min",
    tone: "indigo",
    symbol: "N",
    skill: "Character & theme recall",
  },
  {
    id: "codebreaker",
    number: "03",
    title: "Rizal Codebreaker",
    description: "Decode works, places, and turning points hidden inside an archive cipher.",
    meta: "Cipher puzzle · 4 min",
    tone: "ochre",
    symbol: "C",
    skill: "Chronology & context",
  },
];

const comingSoon = [
  { title: "Scholar’s Memory", label: "Education & travels", symbol: "M" },
  { title: "Hearts & Horizons", label: "Letters & relationships", symbol: "H" },
  { title: "Masterpiece Museum", label: "Works & genres", symbol: "A" },
];

const valuesData = [
  {
    id: "V01",
    scenario: "A student hears a dramatic claim about Rizal, checks the original text and reliable references, then shares only what the evidence supports.",
    value: "Independent judgment",
    rationale: "Interpretive mapping: Rizal’s Malolos letter urges readers to use reason and choose what they judge to be right instead of following blindly.",
    source: "Letter to the Young Women of Malolos (1889)",
    sourceUrl: "https://www.gutenberg.org/ebooks/17116",
  },
  {
    id: "V02",
    scenario: "A classmate is told history and public discussion are “not for girls,” so you help her access materials and present her research.",
    value: "Education as empowerment",
    rationale: "Interpretive mapping: the Malolos letter praises women pursuing education, moral courage, and independent thought.",
    source: "Letter to the Young Women of Malolos (1889)",
    sourceUrl: "https://www.gutenberg.org/ebooks/17116",
  },
  {
    id: "V03",
    scenario: "After a typhoon ruins several classmates’ notebooks, the class creates a shared supply fund for anyone in need.",
    value: "Mutual aid",
    rationale: "Interpretive mapping: the Liga Filipina statutes name mutual protection in hardship and need among the organization’s aims.",
    source: "La Liga Filipina statutes (1892)",
    sourceUrl: "https://www.gutenberg.org/ebooks/20855",
  },
  {
    id: "V04",
    scenario: "Students from different Philippine regions combine their local-history findings into one exhibit and share credit.",
    value: "Unity and cooperation",
    rationale: "Interpretive mapping: the Liga’s aims begin with uniting people into a strong, cohesive body and include collective study and action.",
    source: "La Liga Filipina statutes (1892)",
    sourceUrl: "https://www.gutenberg.org/ebooks/20855",
  },
  {
    id: "V05",
    scenario: "Your team’s favorite answer has no support, so you mark it uncertain instead of inventing a citation.",
    value: "Integrity and truthfulness",
    rationale: "Interpretive mapping: Liga duties call for communication that is sincere, truthful, and meticulous.",
    source: "La Liga Filipina statutes (1892)",
    sourceUrl: "https://www.gutenberg.org/ebooks/20855",
  },
  {
    id: "V06",
    scenario: "During a heated debate, you firmly defend your position but refuse to bully or humiliate the other side.",
    value: "Human dignity and respect",
    rationale: "Interpretive mapping: a Liga duty rejects both accepting humiliation and treating others with arrogance or contempt.",
    source: "La Liga Filipina statutes (1892)",
    sourceUrl: "https://www.gutenberg.org/ebooks/20855",
  },
  {
    id: "V07",
    scenario: "Instead of calling a struggling community “lazy,” you examine working conditions, education, policy, and historical causes.",
    value: "Evidence-based social analysis",
    rationale: "Interpretive mapping: Rizal’s essay investigates structural and historical causes rather than treating indolence as an inherited racial trait.",
    source: "The Indolence of the Filipino (1890)",
    sourceUrl: "https://www.gutenberg.org/ebooks/6885",
  },
  {
    id: "V08",
    scenario: "A student newspaper respectfully explains why a campus rule is unfair and proposes a practical change.",
    value: "Civic responsibility",
    rationale: "Interpretive mapping: Rizal argued for channels through which truth, complaints, representation, and reform could reach government.",
    source: "The Philippines a Century Hence",
    sourceUrl: "https://www.gutenberg.org/ebooks/35899",
  },
];

const novelData = [
  {
    id: "N01", character: "Crisóstomo Ibarra", novel: "Noli Me Tángere",
    clues: ["I have recently returned from Europe.", "I learn of my father’s death.", "I pursue a plan to build a school in San Diego."],
    rationale: "Don Rafael’s son returns from Europe, and his school project drives a major part of Noli Me Tángere.",
    source: "Noli Me Tangere / The Social Cancer", sourceUrl: "https://www.gutenberg.org/ebooks/6737",
  },
  {
    id: "N02", character: "Sisa", novel: "Noli Me Tángere",
    clues: ["I am a mother in San Diego.", "My sons are sacristans.", "I search for Basilio and Crispin after they fail to return."],
    rationale: "Chapter XVI centers on Sisa’s loss and her search for her two sons.",
    source: "Noli Me Tangere / The Social Cancer", sourceUrl: "https://www.gutenberg.org/ebooks/6737",
  },
  {
    id: "N03", character: "Elias", novel: "Noli Me Tángere",
    clues: ["I first appear as a pilot and boatman.", "I warn Ibarra about his enemies.", "I later help him escape pursuit."],
    rationale: "The mysterious pilot becomes Ibarra’s ally and warns him of danger.",
    source: "Noli Me Tangere / The Social Cancer", sourceUrl: "https://www.gutenberg.org/ebooks/6737",
  },
  {
    id: "N04", character: "María Clara", novel: "Noli Me Tángere",
    clues: ["I was raised in Capitán Tiago’s household.", "I sing during a lakeside outing.", "I am Ibarra’s intended bride."],
    rationale: "These details identify María Clara without relying on the novel’s later parentage revelation.",
    source: "Noli Me Tangere / The Social Cancer", sourceUrl: "https://www.gutenberg.org/ebooks/6737",
  },
  {
    id: "F01", character: "Simoun", novel: "El Filibusterismo",
    clues: ["I wear blue spectacles.", "I am a wealthy jeweler with influence over the Captain-General.", "I conceal an identity from the earlier novel."],
    rationale: "Simoun is the jeweler at the center of El Filibusterismo; his identity is revealed in Chapter VII.",
    source: "El Filibusterismo / The Reign of Greed", sourceUrl: "https://www.gutenberg.org/ebooks/10676",
  },
  {
    id: "F02", character: "Basilio", novel: "El Filibusterismo",
    clues: ["I appeared as a child in the earlier novel.", "I am now a medical student.", "Thirteen years later, I visit my mother’s grave."],
    rationale: "This case asks for Basilio’s adult role in El Filibusterismo; he also appears as a child in Noli Me Tángere.",
    source: "El Filibusterismo / The Reign of Greed", sourceUrl: "https://www.gutenberg.org/ebooks/10676",
  },
  {
    id: "F03", character: "Isagani", novel: "El Filibusterismo",
    clues: ["I am known as an idealistic student-poet.", "I support an academy for teaching Spanish.", "Padre Florentino is my uncle."],
    rationale: "The proposed academy and relationship to Padre Florentino identify Isagani.",
    source: "El Filibusterismo / The Reign of Greed", sourceUrl: "https://www.gutenberg.org/ebooks/10676",
  },
  {
    id: "F04", character: "Cabesang Tales", novel: "El Filibusterismo",
    clues: ["I clear and cultivate difficult land.", "I dispute a friar estate’s claim to it.", "I later become the outlaw Matanglawin."],
    rationale: "His land conflict and transformation form a major subplot in El Filibusterismo.",
    source: "El Filibusterismo / The Reign of Greed", sourceUrl: "https://www.gutenberg.org/ebooks/10676",
  },
];

const codeData = [
  {
    id: "C01", answer: "Calamba", variants: ["calamba", "calamba laguna"], category: "Place", year: "1861",
    clues: ["A town in Laguna.", "José Rizal was born here on June 19, 1861.", "His birthplace is preserved as a national shrine."],
    rationale: "Rizal was born in Calamba, Laguna, on June 19, 1861.", source: "NHCP: Rizal Shrine, Calamba", sourceUrl: "https://philhistoricsites.nhcp.gov.ph/registry_database/rizal-shrine-calamba/",
  },
  {
    id: "C02", answer: "Noli Me Tangere", variants: ["noli me tangere", "the social cancer"], category: "Novel", year: "1887",
    clues: ["Ibarra returns from Europe in this novel.", "Much of its story centers on San Diego.", "It was printed in Berlin in 1887."],
    rationale: "Noli Me Tángere was published in Berlin in 1887.", source: "NHCP: José Rizal historical marker", sourceUrl: "https://philhistoricsites.nhcp.gov.ph/registry_database/jose-rizal-1861-1896-9/",
  },
  {
    id: "C03", answer: "El Filibusterismo", variants: ["el filibusterismo", "el fili", "the reign of greed"], category: "Novel", year: "1891",
    clues: ["I continue Noli Me Tángere.", "Simoun the jeweler drives my central plot.", "My original title page reads Gent, 1891."],
    rationale: "El Filibusterismo, the sequel to Noli, was published in Ghent in 1891.", source: "El Filibusterismo, original edition", sourceUrl: "https://www.gutenberg.org/ebooks/30903",
  },
  {
    id: "C04", answer: "La Liga Filipina", variants: ["la liga filipina", "liga filipina"], category: "Civic organization", year: "1892",
    clues: ["Rizal founded me in Manila on July 3.", "My aims included unity and mutual protection.", "I promoted education, agriculture, industry, commerce, and reform."],
    rationale: "Rizal founded La Liga Filipina on July 3, 1892, as a civic organization for unity and mutual aid.", source: "NHCP: La Liga Filipina", sourceUrl: "https://philhistoricsites.nhcp.gov.ph/registry_database/la-liga-filipina/",
  },
  {
    id: "C05", answer: "Dapitan", variants: ["dapitan", "dapitan city"], category: "Place / exile", year: "1892–1896",
    clues: ["I am in present-day Zamboanga del Norte.", "Rizal lived here in exile for more than four years.", "He taught, practiced medicine, and worked on community projects here."],
    rationale: "Rizal lived in exile in Dapitan from 1892 to 1896.", source: "NHCP: Liwasan ng Dapitan", sourceUrl: "https://philhistoricsites.nhcp.gov.ph/registry_database/liwasan-ng-dapitan/",
  },
  {
    id: "C06", answer: "Mi Ultimo Adios", variants: ["mi ultimo adios", "my last farewell"], category: "Poem", year: "1896",
    clues: ["Rizal finished this untitled poem in his prison cell.", "He hid it in an alcohol stove before his execution.", "It became known by a Spanish title meaning ‘My Last Farewell.’"],
    rationale: "The untitled farewell poem hidden in an alcohol stove became known as Mi Último Adiós.", source: "Museo ni Rizal, Fort Santiago", sourceUrl: "https://intramuros.gov.ph/mnr/",
  },
  {
    id: "C07", answer: "The Indolence of the Filipino", variants: ["the indolence of the filipino", "la indolencia de los filipinos", "sobre la indolencia de los filipinos"], category: "Essay", year: "1890",
    clues: ["I answer claims about Filipino ‘laziness.’", "I examine historical and social causes.", "I argue that education and liberty are necessary remedies."],
    rationale: "The essay challenges racial explanations and investigates the historical conditions behind indolence.", source: "The Indolence of the Filipino", sourceUrl: "https://www.gutenberg.org/ebooks/6885",
  },
  {
    id: "C08", answer: "Young Women of Malolos", variants: ["young women of malolos", "to the young women of malolos", "letter to the young women of malolos", "sa mga kababayang dalaga sa malolos"], category: "Letter", year: "1889",
    clues: ["I am dated February 1889.", "I address women in a Bulacan town.", "I praise education, moral courage, and independent judgment."],
    rationale: "Rizal’s letter responds to the women of Malolos and their effort to pursue education.", source: "Letter to the Young Women of Malolos", sourceUrl: "https://www.gutenberg.org/ebooks/17116",
  },
];

function shuffle<T>(input: T[], salt = 0): T[] {
  const result = [...input];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = (index * 7 + salt * 5 + 3) % (index + 1);
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function normalizeAnswer(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function cipher(value: string) {
  return value.toUpperCase().replace(/[A-Z]/g, (letter) =>
    String.fromCharCode(((letter.charCodeAt(0) - 65 + 3) % 26) + 65),
  );
}

function useHighScore(game: GameId, score: number, finished: boolean) {
  const [best, setBest] = useState(0);
  useEffect(() => {
    const saved = Number(window.localStorage.getItem(`rizal-arcade-${game}`) || 0);
    setBest(saved);
  }, [game]);
  useEffect(() => {
    if (finished && score > best) {
      window.localStorage.setItem(`rizal-arcade-${game}`, String(score));
      setBest(score);
    }
  }, [best, finished, game, score]);
  return best;
}

function FeedbackPanel({ feedback, onNext, isLast }: { feedback: Feedback; onNext: () => void; isLast: boolean }) {
  return (
    <div className={`feedback-panel ${feedback.correct ? "correct" : "incorrect"}`} aria-live="polite">
      <div className="feedback-heading">
        <span>{feedback.correct ? "Correct" : "Not this time"}</span>
        <strong>{feedback.title}</strong>
      </div>
      <p>{feedback.rationale}</p>
      <div className="feedback-footer">
        <a href={feedback.sourceUrl} target="_blank" rel="noreferrer">Check the source: {feedback.source} ↗</a>
        <button className="button button-dark" type="button" onClick={onNext}>{isLast ? "See results" : "Next file"}</button>
      </div>
    </div>
  );
}

function Results({ title, score, best, onReplay, onClose }: { title: string; score: number; best: number; onReplay: () => void; onClose: () => void }) {
  const takeaway = score >= 650 ? "Archive expert" : score >= 400 ? "Sharp researcher" : "Curious explorer";
  return (
    <section className="results-card" aria-labelledby="results-title">
      <span className="results-seal">R</span>
      <p className="eyebrow">Round complete</p>
      <h2 id="results-title">{takeaway}</h2>
      <p>You finished <strong>{title}</strong>. Review the explanations and try again—the order and answer choices will change.</p>
      <div className="score-pair">
        <div><span>Score</span><strong>{score}</strong></div>
        <div><span>Best on this device</span><strong>{Math.max(score, best)}</strong></div>
      </div>
      <div className="results-actions">
        <button className="button button-primary" type="button" onClick={onReplay}>Play again</button>
        <button className="button button-outline" type="button" onClick={onClose}>Back to arcade</button>
      </div>
    </section>
  );
}

function GameHeader({ title, round, total, score, onClose }: { title: string; round: number; total: number; score: number; onClose: () => void }) {
  return (
    <header className="game-header">
      <button className="icon-button" type="button" onClick={onClose} aria-label="Close game">×</button>
      <div className="game-header-title"><span>Rizal Arcade</span><strong>{title}</strong></div>
      <div className="game-hud"><span>{Math.min(round + 1, total)} / {total}</span><strong>{score} pts</strong></div>
    </header>
  );
}

function ValuesGame({ onClose }: { onClose: () => void }) {
  const [run, setRun] = useState(0);
  const deck = useMemo(() => shuffle(valuesData, run).slice(0, 6), [run]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const finished = round >= deck.length;
  const best = useHighScore("values", score, finished);
  const current = deck[Math.min(round, deck.length - 1)];
  const choices = useMemo(() => shuffle([current.value, ...shuffle(valuesData.filter((item) => item.value !== current.value), round + run).slice(0, 3).map((item) => item.value)], round), [current, round, run]);

  function answer(choice: string) {
    if (feedback) return;
    const correct = choice === current.value;
    if (correct) { setScore((value) => value + 100 + streak * 15); setStreak((value) => value + 1); }
    else setStreak(0);
    setFeedback({ correct, title: correct ? current.value : `Best fit: ${current.value}`, rationale: current.rationale, source: current.source, sourceUrl: current.sourceUrl });
  }

  function next() { setFeedback(null); setRound((value) => value + 1); }
  function replay() { setRun((value) => value + 1); setRound(0); setScore(0); setStreak(0); setFeedback(null); }

  if (finished) return <><GameHeader title="Values in Motion" round={deck.length - 1} total={deck.length} score={score} onClose={onClose} /><Results title="Values in Motion" score={score} best={best} onReplay={replay} onClose={onClose} /></>;
  return (
    <>
      <GameHeader title="Values in Motion" round={round} total={deck.length} score={score} onClose={onClose} />
      <section className="play-layout values-play">
        <div className="play-intro">
          <span className="case-index">Case {current.id}</span>
          <p className="eyebrow">Interpretive value</p>
          <h2>Which idea is most clearly in motion?</h2>
          <p>These are modern scenarios—not quotations or events from Rizal’s life. Choose the strongest evidence-based connection.</p>
        </div>
        <div className="scenario-card"><span>Present-day scenario</span><p>{current.scenario}</p></div>
        <div className="choice-grid" aria-label="Answer choices">
          {choices.map((choice, index) => <button key={choice} disabled={Boolean(feedback)} onClick={() => answer(choice)} type="button"><span>{String.fromCharCode(65 + index)}</span>{choice}</button>)}
        </div>
        {feedback && <FeedbackPanel feedback={feedback} onNext={next} isLast={round === deck.length - 1} />}
      </section>
    </>
  );
}

function NovelsGame({ onClose }: { onClose: () => void }) {
  const [run, setRun] = useState(0);
  const deck = useMemo(() => shuffle(novelData, run).slice(0, 6), [run]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(1);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const finished = round >= deck.length;
  const best = useHighScore("novels", score, finished);
  const current = deck[Math.min(round, deck.length - 1)];
  const choices = useMemo(() => shuffle([current.character, ...shuffle(novelData.filter((item) => item.character !== current.character), round + run).slice(0, 3).map((item) => item.character)], round + 4), [current, round, run]);

  function answer(choice: string) {
    if (feedback) return;
    const correct = choice === current.character;
    if (correct) setScore((value) => value + 150 - (revealed - 1) * 25);
    setFeedback({ correct, title: correct ? current.character : `Case solved: ${current.character}`, rationale: current.rationale, source: current.source, sourceUrl: current.sourceUrl });
  }
  function next() { setFeedback(null); setRevealed(1); setRound((value) => value + 1); }
  function replay() { setRun((value) => value + 1); setRound(0); setScore(0); setRevealed(1); setFeedback(null); }

  if (finished) return <><GameHeader title="Novel Case Files" round={deck.length - 1} total={deck.length} score={score} onClose={onClose} /><Results title="Novel Case Files" score={score} best={best} onReplay={replay} onClose={onClose} /></>;
  return (
    <>
      <GameHeader title="Novel Case Files" round={round} total={deck.length} score={score} onClose={onClose} />
      <section className="play-layout novels-play">
        <div className="dossier-head">
          <div><span className="case-index">File {current.id}</span><p className="eyebrow">{current.novel}</p><h2>Who fits this case file?</h2></div>
          <span className="confidence">{revealed === 1 ? "150" : revealed === 2 ? "125" : "100"} pts available</span>
        </div>
        <div className="clue-board">
          {current.clues.map((clue, index) => (
            <div className={index < revealed ? "clue revealed" : "clue locked"} key={clue}>
              <span>{index + 1}</span><p>{index < revealed ? clue : "Clue sealed"}</p>
            </div>
          ))}
        </div>
        {revealed < current.clues.length && !feedback && <button className="text-button" type="button" onClick={() => setRevealed((value) => value + 1)}>Reveal another clue (−25 pts)</button>}
        <div className="choice-grid compact" aria-label="Suspects">
          {choices.map((choice, index) => <button key={choice} disabled={Boolean(feedback)} onClick={() => answer(choice)} type="button"><span>{String(index + 1).padStart(2, "0")}</span>{choice}</button>)}
        </div>
        {feedback && <FeedbackPanel feedback={feedback} onNext={next} isLast={round === deck.length - 1} />}
      </section>
    </>
  );
}

function CodebreakerGame({ onClose }: { onClose: () => void }) {
  const [run, setRun] = useState(0);
  const deck = useMemo(() => shuffle(codeData, run).slice(0, 6), [run]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(1);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const finished = round >= deck.length;
  const best = useHighScore("codebreaker", score, finished);
  const current = deck[Math.min(round, deck.length - 1)];
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, [round]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (feedback || !input.trim()) return;
    const candidate = normalizeAnswer(input);
    const correct = current.variants.map(normalizeAnswer).includes(candidate);
    if (correct) setScore((value) => value + 175 - (revealed - 1) * 30);
    setFeedback({ correct, title: correct ? current.answer : `Decoded: ${current.answer}`, rationale: current.rationale, source: current.source, sourceUrl: current.sourceUrl });
  }
  function revealAnswer() { if (!feedback) setFeedback({ correct: false, title: `Decoded: ${current.answer}`, rationale: current.rationale, source: current.source, sourceUrl: current.sourceUrl }); }
  function next() { setFeedback(null); setRevealed(1); setInput(""); setRound((value) => value + 1); }
  function replay() { setRun((value) => value + 1); setRound(0); setScore(0); setRevealed(1); setInput(""); setFeedback(null); }

  if (finished) return <><GameHeader title="Rizal Codebreaker" round={deck.length - 1} total={deck.length} score={score} onClose={onClose} /><Results title="Rizal Codebreaker" score={score} best={best} onReplay={replay} onClose={onClose} /></>;
  return (
    <>
      <GameHeader title="Rizal Codebreaker" round={round} total={deck.length} score={score} onClose={onClose} />
      <section className="play-layout code-play">
        <div className="cipher-card">
          <div className="cipher-meta"><span>{current.category}</span><strong>{current.year}</strong></div>
          <p className="eyebrow">Caesar shift · move each letter back 3</p>
          <div className="cipher-text" aria-label={`Encoded answer: ${cipher(current.answer)}`}>{cipher(current.answer)}</div>
        </div>
        <div className="code-workbench">
          <div className="clue-stack">
            <h2>Decode the archive entry.</h2>
            {current.clues.slice(0, revealed).map((clue, index) => <p key={clue}><span>{index + 1}</span>{clue}</p>)}
            {revealed < current.clues.length && !feedback && <button className="text-button" type="button" onClick={() => setRevealed((value) => value + 1)}>Open another clue (−30 pts)</button>}
          </div>
          <form className="code-form" onSubmit={submit}>
            <label htmlFor="decoded-answer">Your decoded answer</label>
            <input ref={inputRef} id="decoded-answer" value={input} onChange={(event) => setInput(event.target.value)} disabled={Boolean(feedback)} autoComplete="off" placeholder="Type the title, place, or name" />
            <div><button className="button button-primary" type="submit" disabled={Boolean(feedback) || !input.trim()}>Submit answer</button><button className="text-button" type="button" onClick={revealAnswer} disabled={Boolean(feedback)}>Reveal answer</button></div>
          </form>
        </div>
        {feedback && <FeedbackPanel feedback={feedback} onNext={next} isLast={round === deck.length - 1} />}
      </section>
    </>
  );
}

function GameOverlay({ game, onClose }: { game: GameId; onClose: () => void }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  return <div className={`game-overlay game-${game}`} role="dialog" aria-modal="true" aria-label={`${game} game`}>{game === "values" ? <ValuesGame onClose={onClose} /> : game === "novels" ? <NovelsGame onClose={onClose} /> : <CodebreakerGame onClose={onClose} />}</div>;
}

export default function RizalArcade() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [showSources, setShowSources] = useState(false);
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Rizal Arcade home"><span className="brand-mark">R</span><span>Rizal Arcade</span></a>
        <nav aria-label="Primary navigation"><a href="#games">Games</a><a href="#classroom">Classroom</a><button className="nav-link" type="button" onClick={() => setShowSources(true)}>Sources</button><a className="nav-cta" href="#games">Play now</a></nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">History you can play</p>
          <h1>Meet Rizal beyond the textbook.</h1>
          <p className="hero-intro">Quick games. Sharp stories. A living archive of José Rizal’s ideas, journeys, works, and world.</p>
          <div className="hero-actions"><button className="button button-primary" type="button" onClick={() => setActiveGame("novels")}>Play a featured game <span>→</span></button><span>No account · Free to play</span></div>
          <div className="hero-proof"><span><strong>3</strong> playable games</span><span><strong>2–5</strong> minute rounds</span><span><strong>24</strong> sourced prompts</span></div>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="sun-disc" /><div className="portrait-frame"><span className="portrait-monogram">JR</span><span className="portrait-caption">1861 — 1896</span></div><span className="stamp stamp-one">CALAMBA</span><span className="stamp stamp-two">MANILA</span><span className="route-line" /><span className="folio-note">Ideas travel.<br />History moves.</span></div>
      </section>

      <section className="games-section" id="games">
        <div className="section-heading"><div><p className="eyebrow">Featured games</p><h2>Choose your next chapter.</h2></div><p>Built for quick classroom rounds, solo review, and curious minds. Every answer opens a brief explanation and a source.</p></div>
        <div className="game-grid">
          {gameCards.map((game) => (
            <article className={`game-card ${game.tone}`} key={game.title}>
              <button className="game-launch-visual" type="button" onClick={() => setActiveGame(game.id)} aria-label={`Play ${game.title}`}>
                <div className="game-visual"><span className="game-number">{game.number}</span><span className="game-skill">{game.skill}</span><span className="game-symbol">{game.symbol}</span><span className="game-gridline" /><span className="play-medallion">Play</span></div>
              </button>
              <div className="game-copy"><span className="game-meta">{game.meta}</span><h3>{game.title}</h3><p>{game.description}</p><button type="button" onClick={() => setActiveGame(game.id)} aria-label={`Play ${game.title}`}>Enter game <span>→</span></button></div>
            </article>
          ))}
        </div>
      </section>

      <section className="classroom-section" id="classroom">
        <div className="classroom-copy"><p className="eyebrow">Made for real class time</p><h2>Open. Play. Discuss.</h2><p>Students can start without an account on a phone, laptop, or classroom screen. Short rounds leave time for the conversation that matters.</p><ul><li><span>01</span>Instant guest play</li><li><span>02</span>Keyboard and touch friendly</li><li><span>03</span>Evidence after every answer</li><li><span>04</span>Scores saved only on this device</li></ul></div>
        <div className="classroom-panel"><span className="panel-label">A typical five-minute round</span><div className="timeline-row"><strong>00:00</strong><span>Choose a game</span></div><div className="timeline-row"><strong>00:30</strong><span>Read, decide, decode</span></div><div className="timeline-row"><strong>04:00</strong><span>Review the evidence</span></div><div className="timeline-row"><strong>05:00</strong><span>Discuss what changed your mind</span></div><button className="button button-light" type="button" onClick={() => setActiveGame("values")}>Start a classroom round</button></div>
      </section>

      <section className="coming-section">
        <div className="section-heading"><div><p className="eyebrow">Next in the archive</p><h2>The arcade can keep growing.</h2></div><p>A modular format makes it easy to add new games after your instructor reviews the learning content.</p></div>
        <div className="coming-grid">{comingSoon.map((game, index) => <article key={game.title}><div><span>{game.symbol}</span><small>0{index + 4}</small></div><p>{game.label}</p><h3>{game.title}</h3><span className="soon-pill">Concept queued</span></article>)}</div>
      </section>

      <section className="manifesto"><p className="eyebrow">A new way into history</p><p>Not a quiz wearing a costume. Every round turns evidence, context, and interpretation into something you can explore.</p><button type="button" onClick={() => setShowSources(true)}>How we handle historical accuracy <span>→</span></button></section>

      <footer><a className="brand footer-brand" href="#top"><span className="brand-mark">R</span><span>Rizal Arcade</span></a><p>An educational prototype about José Rizal’s life, works, and ideas.</p><button type="button" onClick={() => setShowSources(true)}>Sources & accuracy</button><span>Prototype · 2026</span></footer>

      {activeGame && <GameOverlay game={activeGame} onClose={() => setActiveGame(null)} />}
      {showSources && <div className="source-overlay" role="dialog" aria-modal="true" aria-labelledby="source-title"><button className="source-backdrop" aria-label="Close sources" type="button" onClick={() => setShowSources(false)} /><section className="source-drawer"><button className="icon-button" type="button" onClick={() => setShowSources(false)} aria-label="Close sources">×</button><p className="eyebrow">Source desk</p><h2 id="source-title">Playful format. Careful history.</h2><p>Prototype prompts are grounded in primary texts, public-domain translations, and National Historical Commission of the Philippines markers. Every Values in Motion scenario is explicitly an interpretive, present-day application—not a quotation or historical event.</p><h3>Core references</h3><ul><li><a href="https://philhistoricsites.nhcp.gov.ph/registry_database/jose-rizal-1861-1896-9/" target="_blank" rel="noreferrer">NHCP Registry: José Rizal ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/6737" target="_blank" rel="noreferrer">Noli Me Tangere / The Social Cancer ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/10676" target="_blank" rel="noreferrer">El Filibusterismo / The Reign of Greed ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/17116" target="_blank" rel="noreferrer">Letter to the Young Women of Malolos ↗</a></li><li><a href="https://www.gutenberg.org/ebooks/6885" target="_blank" rel="noreferrer">The Indolence of the Filipino ↗</a></li><li><a href="https://philhistoricsites.nhcp.gov.ph/registry_database/la-liga-filipina/" target="_blank" rel="noreferrer">NHCP Registry: La Liga Filipina ↗</a></li></ul><div className="review-note"><strong>Before formal classroom release</strong><p>A Rizal Life instructor should review translations, wording, interpretations, and accepted answers. The game records are structured so content can be updated without redesigning each game.</p></div></section></div>}
    </main>
  );
}
