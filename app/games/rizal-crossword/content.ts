export type CrosswordTopic = "Rizal Law" | "19th-century Philippines" | "Heroism" | "National consciousness";

export type CrosswordClue = {
  id: string;
  answer: string;
  clue: string;
  topic: CrosswordTopic;
  explanation: string;
  source: string;
  sourceUrl: string;
};

type RawClue = [string, string, string, CrosswordTopic, string, "m2" | "m3c" | "m3h" | "m8"];

const sources = {
  m2: "Instructor Module 2: The Rizal Law and the Effectiveness of the Rizal Course",
  m3c: "Instructor Module 3: The Philippines in the 19th Century",
  m3h: "Instructor Module 3: José Rizal as a Hero Then and Now",
  m8: "Instructor Module 8: Filipino National Consciousness and Nation-Building",
} as const;

const rawClues: RawClue[] = [
  ["RC01", "Rizal Law", "Common name of the 1956 measure that requires the study of José Rizal’s life and works.", "Rizal Law", "Republic Act No. 1425 is commonly known by this name.", "m2"],
  ["RC02", "Recto", "Senator whose sponsorship placed the education bill at the center of the Senate debate.", "Rizal Law", "Claro M. Recto principally sponsored the measure in the Senate.", "m2"],
  ["RC03", "Laurel", "Senator associated with defending and supporting the education measure during its passage.", "Rizal Law", "José P. Laurel was one of the measure’s major supporters and sponsors.", "m2"],
  ["RC04", "Senate", "Legislative chamber in which Claro M. Recto principally sponsored the measure.", "Rizal Law", "The proposal became a major national debate in this legislative chamber.", "m2"],
  ["RC05", "Nationalism", "Commitment to the nation that the 1956 course requirement was designed to strengthen.", "Rizal Law", "The course requirement uses Rizal’s life and writings to deepen this national commitment.", "m2"],
  ["RC06", "Patriotism", "Love of country that the required course seeks to promote among learners.", "Rizal Law", "This civic value is one of the law’s central educational purposes.", "m2"],
  ["RC07", "Noli Me Tangere", "Rizal’s first novel, one of two works given special emphasis in the 1956 measure.", "Rizal Law", "The law gives particular attention to Rizal’s first novel and its social critique.", "m2"],
  ["RC08", "El Fili", "Short title of Rizal’s second novel, paired with his first novel in the required course.", "Rizal Law", "El Filibusterismo receives special attention together with Noli Me Tangere.", "m2"],
  ["RC09", "Curriculum", "The organized school program into which Rizal studies must be included.", "Rizal Law", "Schools comply by including Rizal studies in this formal program of learning.", "m2"],
  ["RC10", "Libraries", "School facilities where copies of Rizal’s writings must be made available.", "Rizal Law", "The measure calls for Rizal’s works to be accessible in these school collections.", "m2"],
  ["RC11", "Education", "The institution Rizal used—and the course continues to use—as a path toward informed citizenship.", "Rizal Law", "The module treats learning as a means of developing national awareness and responsible action.", "m2"],
  ["RC12", "Citizenship", "Public role strengthened when students become informed, responsible, and involved in their communities.", "Rizal Law", "The course connects historical study with informed and responsible public participation.", "m2"],
  ["RC13", "Critique", "Careful examination of society encouraged by studying the social problems in Rizal’s writings.", "Rizal Law", "The course asks students to examine evidence and social conditions rather than memorize facts alone.", "m2"],

  ["RC14", "Spain", "European power that ruled the Philippines through most of the century that shaped Rizal.", "19th-century Philippines", "Spanish colonial rule defined the political setting in which Rizal lived and wrote.", "m3c"],
  ["RC15", "Friars", "Religious figures who also held major social and political influence in the colony.", "19th-century Philippines", "The module identifies religious orders as holders of substantial colonial influence.", "m3c"],
  ["RC16", "Ilustrados", "Educated Filipinos who used learning and writing to advocate reforms.", "19th-century Philippines", "This educated group helped spread reform ideas and a wider national awareness.", "m3c"],
  ["RC17", "World Trade", "International exchange expanded when Philippine ports opened to more foreign commerce.", "19th-century Philippines", "Opening ports connected the colony more closely with foreign markets and ideas.", "m3c"],
  ["RC18", "Liberal Ideas", "European principles of rights and representation that reached educated Filipinos through travel and study.", "19th-century Philippines", "Exposure to these principles encouraged calls for reform and equality.", "m3c"],
  ["RC19", "Middle Class", "Growing social group whose education and resources helped widen political awareness.", "19th-century Philippines", "The rise of this group supported the emergence of educated reform advocates.", "m3c"],
  ["RC20", "Inequality", "Condition created by unequal social status, rights, and access under colonial rule.", "19th-century Philippines", "Unequal treatment was among the major problems that reformists confronted.", "m3c"],
  ["RC21", "Representation", "Political voice Filipinos sought in institutions such as the Spanish Cortes.", "19th-century Philippines", "Reformists demanded a meaningful voice and equal treatment under the law.", "m3c"],
  ["RC22", "Racial Bias", "Discriminatory treatment based on ancestry and colonial categories.", "19th-century Philippines", "The module identifies racial discrimination as a major injustice of the period.", "m3c"],
  ["RC23", "Reform", "Change Rizal pursued through learning, writing, and public argument rather than military command.", "19th-century Philippines", "Rizal’s principal advocacy sought peaceful institutional and social change.", "m3c"],
  ["RC24", "Dignity", "Human worth that Rizal defended against colonial prejudice and abuse.", "19th-century Philippines", "His writings asserted the worth and capabilities of Filipinos.", "m3c"],
  ["RC25", "Freedom", "National aspiration sharpened by restrictions, abuse, and the demand for equal rights.", "19th-century Philippines", "Historical conditions encouraged the pursuit of rights, reform, and eventual liberation.", "m3c"],
  ["RC26", "Awareness", "Recognition of social problems that Rizal’s novels and essays tried to awaken.", "19th-century Philippines", "His writing made colonial conditions visible and encouraged informed reflection.", "m3c"],

  ["RC27", "Integrity", "Quality shown by choosing truth and ethical conduct even when doing so is difficult.", "Heroism", "The module presents this moral consistency as central to Rizal and responsible citizens today.", "m3h"],
  ["RC28", "Service", "Work done for others and the community rather than for fame or self-interest.", "Heroism", "Both historical and modern heroism are linked with contribution to others.", "m3h"],
  ["RC29", "Evidence", "Documents, letters, and records historians examine before making claims about Rizal.", "Heroism", "Historical understanding should rest on verifiable sources rather than rumor.", "m3h"],
  ["RC30", "Fact Checking", "Practice of verifying a claim before sharing historical content online.", "Heroism", "The module connects responsible digital communication with historical accuracy.", "m3h"],
  ["RC31", "Teacher", "Modern profession that most directly reflects Rizal’s belief in learning as a tool for change.", "Heroism", "Educators extend the ideal that learning can improve individuals and society.", "m3h"],
  ["RC32", "Writings", "Novels, essays, and letters Rizal used to communicate criticism and inspire change.", "Heroism", "Rizal’s written works were his most influential instruments of reform.", "m3h"],
  ["RC33", "Peaceful Reform", "Approach to change based on reason, learning, and civic advocacy.", "Heroism", "Rizal is closely associated with nonviolent advocacy for institutional change.", "m3h"],
  ["RC34", "Community", "Local group whose problems responsible citizens and present-day heroes help address.", "Heroism", "Modern heroism can appear in practical action for people nearby.", "m3h"],
  ["RC35", "Responsibility", "Willingness to answer for one’s duties and act on public concerns.", "Heroism", "The module contrasts responsible action with indifference and avoidance.", "m3h"],
  ["RC36", "Records", "Archival materials historians compare with letters and documents to verify facts.", "Heroism", "Multiple documentary sources help historians test the accuracy of a claim.", "m3h"],
  ["RC37", "Social Change", "Improvement in society that Rizal pursued through ideas, learning, and public engagement.", "Heroism", "His intellectual work encouraged Filipinos to question injustice and imagine improvement.", "m3h"],
  ["RC38", "National Hero", "Public honor associated with Rizal because his life and works inspired national consciousness.", "Heroism", "Rizal is remembered for intellectual courage, reform advocacy, and service to the nation.", "m3h"],

  ["RC39", "Awakening", "Metaphor for the gradual growth of a shared Filipino identity during the nineteenth century.", "National consciousness", "The module describes national consciousness as a gradual coming-to-awareness of common identity.", "m8"],
  ["RC40", "Shared Identity", "Sense that people from different local communities belong to one Filipino nation.", "National consciousness", "A common identity helped people imagine themselves as members of a wider nation.", "m8"],
  ["RC41", "Nationhood", "Condition of understanding a people as a political and cultural nation.", "National consciousness", "Rizal’s work helped Filipinos develop a collective sense of being a nation.", "m8"],
  ["RC42", "Unity", "Working together across divisions for a common national purpose.", "National consciousness", "Rizal’s nation-building ideas emphasize cooperation and solidarity.", "m8"],
  ["RC43", "History", "The past Rizal urged Filipinos to study in order to understand their society and worth.", "National consciousness", "Knowledge of the past supports identity, critical judgment, and national dignity.", "m8"],
  ["RC44", "Culture", "Shared practices and heritage that Rizal encouraged Filipinos to value alongside their past.", "National consciousness", "Appreciating heritage strengthens national identity without erasing local difference.", "m8"],
  ["RC45", "Participation", "Active involvement of informed citizens in community and national affairs.", "National consciousness", "Nation-building requires citizens to take part rather than remain passive observers.", "m8"],
  ["RC46", "Common Good", "Welfare shared by the community, placed above narrow personal interest.", "National consciousness", "The module links national unity with cooperative action for everyone’s benefit.", "m8"],
  ["RC47", "Patriot", "Citizen whose love of country is expressed through responsible action.", "National consciousness", "Rizalian nationalism joins national affection with informed civic conduct.", "m8"],
  ["RC48", "Empowerment", "Capacity to act and create change that learning can develop in citizens.", "National consciousness", "Rizal viewed learning as a way to equip people for social progress.", "m8"],
  ["RC49", "Social Justice", "Principle that asks institutions and citizens to oppose abuse and unfairness.", "National consciousness", "A just nation protects dignity and addresses unequal treatment.", "m8"],
  ["RC50", "Nation Building", "Long-term work of creating a stronger country through informed, ethical, and united citizens.", "National consciousness", "The module grounds this work in learning, civic duty, integrity, and solidarity.", "m8"],
];

export const crosswordClues: CrosswordClue[] = rawClues.map(([id, answer, clue, topic, explanation, sourceId]) => ({
  id,
  answer,
  clue,
  topic,
  explanation,
  source: sources[sourceId],
  sourceUrl: "",
}));

export function normalizeCrosswordAnswer(answer: string): string {
  return answer.toLocaleUpperCase().replace(/[^A-Z0-9]/g, "");
}
