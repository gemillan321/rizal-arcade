export type GlobalSojournChallenge = {
  id: string;
  place: string;
  coordinates: { top: string; left: string };
  period: string;
  mission: string;
  evidence: [string, string, string];
  explanation: string;
  source: string;
  sourceUrl: string;
};

export const globalSojournChallenges: GlobalSojournChallenge[] = [
  {
    id: "gs-01",
    place: "Barcelona, Spain",
    coordinates: { top: "34%", left: "46%" },
    period: "1882",
    mission: "Write the first nationalistic essay abroad.",
    evidence: ["Published in Diariong Tagalog", "Used pen name: Laong Laan", "Title of work: Amor Patrio"],
    explanation: "Upon arriving in Spain, Rizal wrote 'Amor Patrio' (Love of Country) under a pseudonym to urge Filipinos to love their motherland, marking his transition into active reform work.",
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "https://example.com/module4"
  },
  {
    id: "gs-02",
    place: "Madrid, Spain",
    coordinates: { top: "35%", left: "45%" },
    period: "1882-1885",
    mission: "Complete dual degrees in higher education.",
    evidence: ["Universidad Central de Madrid", "Licentiate in Medicine", "Licentiate in Philosophy and Letters"],
    explanation: "Rizal rigorously balanced his time in the Spanish capital to obtain degrees in both Medicine and Philosophy, laying the educational groundwork for his literary and scientific careers.",
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "https://example.com/module4"
  },
  {
    id: "gs-03",
    place: "Paris, France",
    coordinates: { top: "30%", left: "47%" },
    period: "1885-1886",
    mission: "Specialize in Ophthalmology to cure his mother's eyes.",
    evidence: ["Assistant to Dr. Louis de Weckert", "Model for Juan Luna's painting", "Frequented Pardo de Tavera home"],
    explanation: "Seeking the best medical training to treat his mother's failing sight, Rizal apprenticed under Dr. de Weckert, one of Europe's leading ophthalmologists.",
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "https://example.com/module4"
  },
  {
    id: "gs-04",
    place: "Heidelberg, Germany",
    coordinates: { top: "28%", left: "50%" },
    period: "1886",
    mission: "Advance medical training and compose nostalgic poetry.",
    evidence: ["University Eye Hospital", "Studied under Dr. Otto Becker", "Composed 'A las flores de...'"],
    explanation: "While continuing his eye specialization, Rizal experienced severe homesickness, leading him to write 'A las flores de Heidelberg' while gazing at the Neckar River.",
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "https://example.com/module4"
  },
  {
    id: "gs-05",
    place: "Berlin, Germany",
    coordinates: { top: "25%", left: "51%" },
    period: "1886-1887",
    mission: "Publish the first major socio-political novel.",
    evidence: ["Berliner Buchdruckerei-Action-Gesellschaft", "Funded by Maximo Viola", "Publication of Noli Me Tangere"],
    explanation: "Living in poverty and suffering from suspected tuberculosis, Rizal finished and printed Noli Me Tangere here only after his friend Maximo Viola loaned him the necessary funds.",
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "https://example.com/module4"
  },
  {
    id: "gs-06",
    place: "Tokyo, Japan",
    coordinates: { top: "35%", left: "85%" },
    period: "1888",
    mission: "Study local culture, language, and theater.",
    evidence: ["Stayed at the Spanish Legation", "Romance with O-Sei-San", "Studied Kabuki and Noh"],
    explanation: "Rizal spent over a month in Japan immersing himself in the language and arts, guided by Seiko Usui, before deciding to leave to continue his political mission.",
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "https://example.com/module4"
  },
  {
    id: "gs-07",
    place: "London, United Kingdom",
    coordinates: { top: "27%", left: "45%" },
    period: "1888-1889",
    mission: "Research and annotate pre-colonial Philippine history.",
    evidence: ["British Museum Library", "Mentored by Dr. Reinhold Rost", "Annotated Sucesos de las Islas Filipinas"],
    explanation: "To counter Spanish claims that Filipinos lacked culture before colonization, Rizal spent months meticulously hand-copying and annotating Morga's 1609 historical text.",
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "https://example.com/module4"
  },
  {
    id: "gs-08",
    place: "Biarritz, France",
    coordinates: { top: "33%", left: "46%" },
    period: "1891",
    mission: "Finish the manuscript for the second novel.",
    evidence: ["Vacationed at Boustead family villa", "Romance with Nellie Boustead", "Completed El Filibusterismo manuscript"],
    explanation: "Seeking respite from political infighting in Madrid, Rizal retreated to the French Riviera where he finalized the darker, more revolutionary sequel to his first novel.",
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "https://example.com/module4"
  },
  {
    id: "gs-09",
    place: "Ghent, Belgium",
    coordinates: { top: "28%", left: "48%" },
    period: "1891",
    mission: "Print the sequel novel on a tight budget.",
    evidence: ["F. Meyer-Van Loo Press", "Financial aid from Valentin Ventura", "Publication of El Filibusterismo"],
    explanation: "Rizal moved to Ghent because printing costs were cheaper. He nearly burned the manuscript out of frustration until Valentin Ventura sent money to finish the printing.",
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "https://example.com/module4"
  },
  {
    id: "gs-10",
    place: "Hong Kong",
    coordinates: { top: "45%", left: "80%" },
    period: "1891-1892",
    mission: "Establish medical practice and draft a civic organization.",
    evidence: ["Worked as an Ophthalmic surgeon", "Planned Borneo Colonization Project", "Drafted La Liga Filipina constitution"],
    explanation: "Rizal reunited with his family here, built a successful eye clinic, and drafted the constitution for La Liga Filipina to unite the archipelago for mutual protection and reform.",
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "https://example.com/module4"
  }
];
