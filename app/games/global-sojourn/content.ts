export type GlobalSojournChallenge = {
  id: string;
  place: string;
  period: string;
  mission: string;
  evidence: [string, string, string];
  source: string;
  sourceUrl: string;
};

/** Add reviewed module-based challenges here. The game is not registered until this bank is complete. */
export const globalSojournChallenges: GlobalSojournChallenge[] = [
  {
    id: "gs-01",
    place: "Barcelona, Spain",
    period: "1882",
    mission: "Write the first nationalistic essay abroad.",
    evidence: ["Published in Diariong Tagalog", "Used pen name: Laong Laan", "Title of work: Amor Patrio"],
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "#"
  },
  {
    id: "gs-02",
    place: "Madrid, Spain",
    period: "1882-1885",
    mission: "Complete dual degrees in higher education.",
    evidence: ["Universidad Central de Madrid", "Licentiate in Medicine", "Licentiate in Philosophy and Letters"],
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "#"
  },
  {
    id: "gs-03",
    place: "Paris, France",
    period: "1885-1886",
    mission: "Specialize in Ophthalmology to cure his mother's eyes.",
    evidence: ["Assistant to Dr. Louis de Weckert", "Model for Juan Luna's painting", "Frequented Pardo de Tavera home"],
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "#"
  },
  {
    id: "gs-04",
    place: "Heidelberg, Germany",
    period: "1886",
    mission: "Advance medical training and compose nostalgic poetry.",
    evidence: ["University Eye Hospital", "Studied under Dr. Otto Becker", "Composed 'A las flores de...'"],
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "#"
  },
  {
    id: "gs-05",
    place: "Berlin, Germany",
    period: "1886-1887",
    mission: "Publish the first major socio-political novel.",
    evidence: ["Berliner Buchdruckerei-Action-Gesellschaft", "Funded by Maximo Viola", "Publication of Noli Me Tangere"],
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "#"
  },
  {
    id: "gs-06",
    place: "Tokyo, Japan",
    period: "1888",
    mission: "Study local culture, language, and theater.",
    evidence: ["Stayed at the Spanish Legation", "Romance with O-Sei-San", "Studied Kabuki and Noh"],
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "#"
  },
  {
    id: "gs-07",
    place: "London, United Kingdom",
    period: "1888-1889",
    mission: "Research and annotate pre-colonial Philippine history.",
    evidence: ["British Museum Library", "Mentored by Dr. Reinhold Rost", "Annotated Sucesos de las Islas Filipinas"],
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "#"
  },
  {
    id: "gs-08",
    place: "Biarritz, France",
    period: "1891",
    mission: "Finish the manuscript for the second novel.",
    evidence: ["Vacationed at Boustead family villa", "Romance with Nellie Boustead", "Completed El Filibusterismo manuscript"],
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "#"
  },
  {
    id: "gs-09",
    place: "Ghent, Belgium",
    period: "1891",
    mission: "Print the sequel novel on a tight budget.",
    evidence: ["F. Meyer-Van Loo Press", "Financial aid from Valentin Ventura", "Publication of El Filibusterismo"],
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "#"
  },
  {
    id: "gs-10",
    place: "Hong Kong",
    period: "1891-1892",
    mission: "Establish medical practice and draft a civic organization.",
    evidence: ["Worked as an Ophthalmic surgeon", "Planned Borneo Colonization Project", "Drafted La Liga Filipina constitution"],
    source: "Module 4: Travels & The Propaganda Movement",
    sourceUrl: "#"
  }
];
