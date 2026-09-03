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
  ["RC01", "Rizal Law", "What is the common name of Republic Act No. 1425, passed in 1956?", "Rizal Law", "Republic Act No. 1425 is commonly known by this name.", "m2"],
  ["RC02", "Recto", "Which senator was the principal sponsor of Senate Bill No. 438?", "Rizal Law", "Claro M. Recto principally sponsored the measure in the Senate.", "m2"],
  ["RC03", "Laurel", "Which senator helped defend and sponsor the Rizal education measure?", "Rizal Law", "José P. Laurel was one of the measure’s major supporters and sponsors.", "m2"],
  ["RC04", "Senate", "In which lawmaking chamber did Claro M. Recto sponsor the bill?", "Rizal Law", "The proposal became a major national debate in this legislative chamber.", "m2"],
  ["RC05", "Nationalism", "What term means loyalty and commitment to one’s nation?", "Rizal Law", "The course requirement uses Rizal’s life and writings to deepen this national commitment.", "m2"],
  ["RC06", "Patriotism", "What word means love of country, a value promoted by the Rizal course?", "Rizal Law", "This civic value is one of the law’s central educational purposes.", "m2"],
  ["RC07", "Noli Me Tangere", "Which first novel by Rizal receives special attention under the 1956 law?", "Rizal Law", "The law gives particular attention to Rizal’s first novel and its social critique.", "m2"],
  ["RC08", "El Fili", "What short title is commonly used for Rizal’s second novel?", "Rizal Law", "El Filibusterismo receives special attention together with Noli Me Tangere.", "m2"],
  ["RC09", "Curriculum", "What do we call the organized set of subjects taught by a school?", "Rizal Law", "Schools comply by including Rizal studies in this formal program of learning.", "m2"],
  ["RC10", "Libraries", "Where must schools make copies of Rizal’s writings available to students?", "Rizal Law", "The measure calls for Rizal’s works to be accessible in these school collections.", "m2"],
  ["RC11", "Education", "What process of teaching and learning did Rizal see as a path to progress?", "Rizal Law", "The module treats learning as a means of developing national awareness and responsible action.", "m2"],
  ["RC12", "Citizenship", "What public role involves being a responsible member of a country?", "Rizal Law", "The course connects historical study with informed and responsible public participation.", "m2"],
  ["RC13", "Critique", "What word means a careful examination of ideas, society, or a written work?", "Rizal Law", "The course asks students to examine evidence and social conditions rather than memorize facts alone.", "m2"],

  ["RC14", "Spain", "Which European country ruled the Philippines during Rizal’s lifetime?", "19th-century Philippines", "Spanish colonial rule defined the political setting in which Rizal lived and wrote.", "m3c"],
  ["RC15", "Friars", "What religious group held strong social and political influence in the colony?", "19th-century Philippines", "The module identifies religious orders as holders of substantial colonial influence.", "m3c"],
  ["RC16", "Ilustrados", "What name was given to educated Filipinos who campaigned for reforms?", "19th-century Philippines", "This educated group helped spread reform ideas and a wider national awareness.", "m3c"],
  ["RC17", "World Trade", "What kind of international commerce grew when Philippine ports were opened?", "19th-century Philippines", "Opening ports connected the colony more closely with foreign markets and ideas.", "m3c"],
  ["RC18", "Liberal Ideas", "What European beliefs about rights and representation influenced Filipino reformists?", "19th-century Philippines", "Exposure to these principles encouraged calls for reform and equality.", "m3c"],
  ["RC19", "Middle Class", "Which growing social group gained education and helped spread political awareness?", "19th-century Philippines", "The rise of this group supported the emergence of educated reform advocates.", "m3c"],
  ["RC20", "Inequality", "What condition exists when people do not receive equal rights or opportunities?", "19th-century Philippines", "Unequal treatment was among the major problems that reformists confronted.", "m3c"],
  ["RC21", "Representation", "What political voice did Filipino reformists seek in the Spanish Cortes?", "19th-century Philippines", "Reformists demanded a meaningful voice and equal treatment under the law.", "m3c"],
  ["RC22", "Racial Bias", "What term describes unfair treatment because of race or ancestry?", "19th-century Philippines", "The module identifies racial discrimination as a major injustice of the period.", "m3c"],
  ["RC23", "Reform", "What kind of peaceful improvement did Rizal seek through writing and education?", "19th-century Philippines", "Rizal’s principal advocacy sought peaceful institutional and social change.", "m3c"],
  ["RC24", "Dignity", "What word means the worth and respect every person deserves?", "19th-century Philippines", "His writings asserted the worth and capabilities of Filipinos.", "m3c"],
  ["RC25", "Freedom", "What aspiration means being free from unfair control and restrictions?", "19th-century Philippines", "Historical conditions encouraged the pursuit of rights, reform, and eventual liberation.", "m3c"],
  ["RC26", "Awareness", "What word means recognizing and understanding the problems around you?", "19th-century Philippines", "His writing made colonial conditions visible and encouraged informed reflection.", "m3c"],

  ["RC27", "Integrity", "What quality means doing what is right even when it is difficult?", "Heroism", "The module presents this moral consistency as central to Rizal and responsible citizens today.", "m3h"],
  ["RC28", "Service", "What do we call work done to help other people or the community?", "Heroism", "Both historical and modern heroism are linked with contribution to others.", "m3h"],
  ["RC29", "Evidence", "What do historians use to support a claim about the past?", "Heroism", "Historical understanding should rest on verifiable sources rather than rumor.", "m3h"],
  ["RC30", "Fact Checking", "What practice verifies information before it is shared online?", "Heroism", "The module connects responsible digital communication with historical accuracy.", "m3h"],
  ["RC31", "Teacher", "Which profession reflects Rizal’s belief that learning can change society?", "Heroism", "Educators extend the ideal that learning can improve individuals and society.", "m3h"],
  ["RC32", "Writings", "What collective term covers Rizal’s novels, essays, and letters?", "Heroism", "Rizal’s written works were his most influential instruments of reform.", "m3h"],
  ["RC33", "Peaceful Reform", "What approach seeks change through reason and education instead of violence?", "Heroism", "Rizal is closely associated with nonviolent advocacy for institutional change.", "m3h"],
  ["RC34", "Community", "What local group of people can be helped through responsible action?", "Heroism", "Modern heroism can appear in practical action for people nearby.", "m3h"],
  ["RC35", "Responsibility", "What value means accepting your duties and being accountable for your actions?", "Heroism", "The module contrasts responsible action with indifference and avoidance.", "m3h"],
  ["RC36", "Records", "What archived materials do historians examine to verify past events?", "Heroism", "Multiple documentary sources help historians test the accuracy of a claim.", "m3h"],
  ["RC37", "Social Change", "What phrase means improving society through ideas, learning, and action?", "Heroism", "His intellectual work encouraged Filipinos to question injustice and imagine improvement.", "m3h"],
  ["RC38", "National Hero", "What public title is widely associated with José Rizal?", "Heroism", "Rizal is remembered for intellectual courage, reform advocacy, and service to the nation.", "m3h"],

  ["RC39", "Awakening", "What metaphor describes Filipinos gradually becoming conscious of a shared identity?", "National consciousness", "The module describes national consciousness as a gradual coming-to-awareness of common identity.", "m8"],
  ["RC40", "Shared Identity", "What phrase means feeling that different communities belong to one nation?", "National consciousness", "A common identity helped people imagine themselves as members of a wider nation.", "m8"],
  ["RC41", "Nationhood", "What term means the state of being recognized as one political and cultural nation?", "National consciousness", "Rizal’s work helped Filipinos develop a collective sense of being a nation.", "m8"],
  ["RC42", "Unity", "What value means working together for a common national purpose?", "National consciousness", "Rizal’s nation-building ideas emphasize cooperation and solidarity.", "m8"],
  ["RC43", "History", "What subject studies the past and helps people understand their society?", "National consciousness", "Knowledge of the past supports identity, critical judgment, and national dignity.", "m8"],
  ["RC44", "Culture", "What term includes a people’s shared traditions, practices, and heritage?", "National consciousness", "Appreciating heritage strengthens national identity without erasing local difference.", "m8"],
  ["RC45", "Participation", "What word means actively taking part in community and national affairs?", "National consciousness", "Nation-building requires citizens to take part rather than remain passive observers.", "m8"],
  ["RC46", "Common Good", "What phrase means the welfare and benefit shared by the whole community?", "National consciousness", "The module links national unity with cooperative action for everyone’s benefit.", "m8"],
  ["RC47", "Patriot", "What do we call a person who loves and responsibly serves the country?", "National consciousness", "Rizalian nationalism joins national affection with informed civic conduct.", "m8"],
  ["RC48", "Empowerment", "What term means gaining the ability and confidence to create change?", "National consciousness", "Rizal viewed learning as a way to equip people for social progress.", "m8"],
  ["RC49", "Social Justice", "What principle promotes fairness and opposes abuse in society?", "National consciousness", "A just nation protects dignity and addresses unequal treatment.", "m8"],
  ["RC50", "Nation Building", "What phrase describes the long-term work of creating a stronger country?", "National consciousness", "The module grounds this work in learning, civic duty, integrity, and solidarity.", "m8"],
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
  return answer.toLocaleUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();
}
