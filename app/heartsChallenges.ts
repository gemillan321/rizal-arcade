export type HeartsWomanId =
  | "segunda"
  | "valenzuela"
  | "rivera"
  | "consuelo"
  | "seiko"
  | "gertrude"
  | "nellie"
  | "suzanne"
  | "josephine";

export type HeartsProfile = {
  id: HeartsWomanId;
  name: string;
  place: string;
  period: string;
  chapter: string;
  routeCode: string;
  portraitIndex: number;
  art?: string;
  artAlt: string;
};

export type HeartsChallenge = {
  id: string;
  womanId: HeartsWomanId;
  evidenceTitle: string;
  evidence: [string, string, string];
  rationale: string;
  source: string;
  sourceUrl: string;
};

export const heartsProfiles: HeartsProfile[] = [
  { id: "segunda", name: "Segunda Katigbak", place: "Lipa & Manila", period: "Youthful chapter", chapter: "An early affection", routeCode: "LM", portraitIndex: 0, artAlt: "Artistic period interpretation representing Segunda Katigbak" },
  { id: "valenzuela", name: "Leonor Valenzuela", place: "Manila letters", period: "Student years", chapter: "The invisible-ink letters", routeCode: "ML", portraitIndex: 1, artAlt: "Artistic period interpretation representing Leonor Valenzuela" },
  { id: "rivera", name: "Leonor Rivera", place: "Camiling & Europe", period: "Long correspondence", chapter: "An interrupted engagement", routeCode: "CE", portraitIndex: 2, art: "/art/leonor-rivera-sketch.jpg", artAlt: "Crayon sketch of Leonor Rivera attributed to José Rizal" },
  { id: "consuelo", name: "Consuelo Ortiga y Pérez", place: "Madrid", period: "1880s", chapter: "A Madrid friendship", routeCode: "MD", portraitIndex: 3, artAlt: "Artistic period interpretation representing Consuelo Ortiga y Pérez" },
  { id: "seiko", name: "Seiko Usui (O-Sei-San)", place: "Yokohama", period: "1888", chapter: "A six-week Japanese sojourn", routeCode: "YK", portraitIndex: 4, artAlt: "Artistic period interpretation representing Seiko Usui" },
  { id: "gertrude", name: "Gertrude Beckett", place: "London", period: "1888–1889", chapter: "The Beckett household", routeCode: "LD", portraitIndex: 5, artAlt: "Artistic period interpretation representing Gertrude Beckett" },
  { id: "nellie", name: "Nellie Boustead", place: "Biarritz", period: "1891", chapter: "A possible marriage", routeCode: "BZ", portraitIndex: 6, artAlt: "Artistic period interpretation representing Nellie Boustead" },
  { id: "suzanne", name: "Suzanne Jacoby", place: "Brussels", period: "1890", chapter: "The Jacoby boarding house", routeCode: "BR", portraitIndex: 7, artAlt: "Artistic period interpretation representing Suzanne Jacoby" },
  { id: "josephine", name: "Josephine Bracken", place: "Dapitan", period: "1895–1896", chapter: "Rizal’s final life chapter", routeCode: "DP", portraitIndex: 8, art: "/art/josephine-bracken.jpg", artAlt: "Historic portrait of Josephine Bracken" },
];

const moduleSource = {
  source: "Instructor-provided Module 5: Rizal’s Love Interests and the Women He Met",
  sourceUrl: "",
};
const leonorSource = {
  source: "Filipinas Heritage Library: Rizal’s Verses for Leonor and Maria Clara",
  sourceUrl: "https://www.filipinaslibrary.org.ph/himig/rizals-verses-for-leonor-and-maria-clara/",
};
const seikoSource = {
  source: "University of the Philippines: Ilustrados Enamorados del Japón",
  sourceUrl: "https://up.edu.ph/ilustrados-enamorados-del-japon/",
};
const josephineSource = {
  source: "Philippine Information Agency / NHCP: Dapitan pays homage to Rizal’s unsung muse",
  sourceUrl: "https://pia.gov.ph/regions/dapitan-pays-homage-to-rizals-unsung-muse/",
};
const museumSource = {
  source: "National Museum of the Philippines: Rizal’s Josephine Sleeping",
  sourceUrl: "https://www.nationalmuseum.gov.ph/2024/12/30/nmp-exhibits-rizals-josephine-sleeping/",
};

function challenge(
  id: string,
  womanId: HeartsWomanId,
  evidenceTitle: string,
  evidence: [string, string, string],
  rationale: string,
  basis = moduleSource,
): HeartsChallenge {
  return { id, womanId, evidenceTitle, evidence, rationale, ...basis };
}

export const heartsChallenges: HeartsChallenge[] = [
  challenge("H01", "segunda", "A first affection", ["Rizal was still very young.", "She came from a prominent provincial family and was already promised to another man.", "Their brief affection could not become a lasting courtship."], "Segunda Katigbak is commonly presented in the course module as Rizal’s first love."),
  challenge("H02", "segunda", "A promise already made", ["The young admirer met her through family connections.", "She was already promised to another man.", "The relationship ended before it could deepen."], "Segunda’s prior engagement is the decisive clue that separates this early chapter from Rizal’s later relationships."),
  challenge("H03", "segunda", "A youthful memory", ["This chapter belongs before Rizal’s European years.", "Family visits in the Philippines created the brief opportunity to meet.", "Later accounts remember it as an early, short-lived affection."], "The Lipa-and-Manila setting and the youthful timing point to Segunda Katigbak."),
  challenge("H04", "segunda", "The earliest horizon", ["This episode predates Rizal’s overseas studies.", "Family visits made the meeting possible while he was still young.", "Her existing engagement kept the affection brief."], "Segunda belongs to the earliest Philippine chapter in the game’s relationship trail."),
  challenge("H05", "segunda", "The hometown connection", ["A provincial hometown distinguishes this episode from Rizal’s later city correspondence.", "The episode is remembered as brief.", "It came before the long correspondence with another woman of the same first name."], "Lipa and the brief first-love tradition identify Segunda Katigbak."),

  challenge("H06", "valenzuela", "Invisible ink", ["Letters carried the courtship.", "The writing could be revealed by applying heat.", "This belonged to Rizal’s student years before his European journey."], "The invisible-ink correspondence is the signature clue associated with Leonor Valenzuela."),
  challenge("H07", "valenzuela", "A revealing nickname", ["A familiar nickname and a concealed writing method distinguish her from Rizal’s long-time fiancée.", "Rizal used a secret method in his letters.", "Her chapter was brief rather than a years-long engagement."], "The nickname Orang and the secret letters point to Leonor Valenzuela, not Leonor Rivera."),
  challenge("H08", "valenzuela", "Heat reveals the message", ["The page looked blank at first.", "A household heat source could make the words appear.", "The clue describes a courtship through coded correspondence."], "Rizal’s use of invisible ink in letters is linked in the module to Leonor Valenzuela."),
  challenge("H09", "valenzuela", "A second Leonor", ["Her first name can cause confusion with Rizal’s long-time fiancée.", "Her distinguishing clue is invisible ink.", "The relationship belongs to Rizal’s Philippine student period."], "Leonor Valenzuela is identified by the invisible-ink clue; Leonor Rivera is identified by the long, interrupted correspondence."),
  challenge("H10", "valenzuela", "The secret correspondence", ["This dossier does not involve intercepted letters in Camiling.", "Its messages were deliberately hidden on the page.", "The sender and recipient shared a playful code."], "Hidden writing rather than family-intercepted mail distinguishes Leonor Valenzuela’s dossier."),

  challenge("H11", "rivera", "The long correspondence", ["Letters sustained the bond across distance.", "The relationship lasted for many years.", "Family opposition helped break the connection."], "Leonor Rivera was Rizal’s long-time love and fiancée, remembered through an extended but interrupted correspondence.", leonorSource),
  challenge("H12", "rivera", "A farewell in verse", ["Rizal wrote a song of parting bearing her first name.", "He was engaged to marry her.", "The surviving work is associated with separation."], "The Filipinas Heritage Library connects Rizal’s farewell composition ‘Leonor’ with Leonor Rivera.", leonorSource),
  challenge("H13", "rivera", "Letters kept apart", ["Distance was not the only obstacle.", "Some correspondence did not reach its intended reader.", "The relationship ended in another marriage."], "Interference with correspondence and Rivera’s later marriage ended this long relationship.", leonorSource),
  challenge("H14", "rivera", "A family-linked route", ["Her Tarlac family connection became important while Rizal was overseas.", "She and Rizal were relatives as well as sweethearts.", "Their story spans years of correspondence across distance."], "Camiling and the years-long European correspondence identify Leonor Rivera."),
  challenge("H15", "rivera", "Maria Clara tradition", ["Later readers often connect her with an idealized heroine.", "She was Rizal’s long-time fiancée.", "The comparison concerns Noli Me Tangere."], "Leonor Rivera is traditionally associated with the inspiration for Maria Clara, though a literary character should not be reduced to one real person."),
  challenge("H16", "rivera", "An engagement interrupted", ["The couple expected to marry.", "Their letters crossed great distance.", "Family decisions and silence changed the outcome."], "These clues describe Rizal’s engagement to Leonor Rivera and its painful interruption.", leonorSource),
  challenge("H17", "rivera", "The longer engagement", ["This dossier concerns years of correspondence, not concealed writing.", "Its identifying clue is the length of the relationship.", "A farewell composition and engagement belong to this file."], "The engagement and farewell verse identify Leonor Rivera; invisible ink identifies Leonor Valenzuela.", leonorSource),

  challenge("H18", "consuelo", "The expatriate circle", ["This chapter unfolds in Spain.", "Her family welcomed Filipino reformists and students.", "Rizal expressed admiration but did not pursue a lasting relationship."], "Consuelo Ortiga y Pérez belongs to Rizal’s Madrid social circle."),
  challenge("H19", "consuelo", "A friendship in Spain", ["The setting was the Spanish capital.", "Her father hosted gatherings attended by Filipino students and reformists.", "The connection remained part of Rizal’s European social life."], "Madrid and the Ortiga household identify Consuelo Ortiga y Pérez."),
  challenge("H20", "consuelo", "Reserved affection", ["Rizal was a guest in her family’s home.", "Another Filipino reformist also admired her.", "He chose not to turn the friendship into a lasting courtship."], "Consuelo’s dossier is marked by friendship and restraint within the Madrid circle."),
  challenge("H21", "consuelo", "A reformist salon", ["Filipino expatriates gathered at her family home.", "The setting is the Spanish capital.", "This was not the English boarding-house chapter."], "The Ortiga home in Madrid provides the decisive context for Consuelo."),
  challenge("H22", "consuelo", "A Spanish admiration", ["This relationship belongs after Rizal left the Philippines for study.", "The woman was Spanish.", "Its setting was the Spanish capital, not a French coastal residence."], "Consuelo Ortiga y Pérez represents a Madrid admiration, while Nellie Boustead belongs to the Biarritz chapter."),

  challenge("H23", "seiko", "The honorific nickname", ["She is often remembered in histories by an honorific nickname rather than only her personal name.", "She spoke with Rizal in French during afternoon strolls.", "She introduced him to aspects of Japanese culture."], "O-Sei-San was Seiko Usui, whom Rizal met during his 1888 stay in Japan.", seikoSource),
  challenge("H24", "seiko", "Six weeks in Japan", ["The meeting took place during Rizal’s journey in 1888.", "The Japanese chapter lasted for approximately six weeks.", "The postmark belongs to the port where Rizal stayed before sailing for America."], "UP’s account places Rizal and Seiko Usui’s friendship within his roughly six-week Japanese sojourn in 1888.", seikoSource),
  challenge("H25", "seiko", "Afternoon walks", ["They conversed in French.", "Their walks offered a close view of Japanese life.", "Rizal considered staying in the country."], "The shared language, afternoon walks, and Japanese setting identify this dossier with Seiko Usui.", seikoSource),
  challenge("H26", "seiko", "A Japanese horizon", ["This person was not part of Rizal’s European boarding-house circle.", "She helped him encounter local art and culture.", "The journey continued when Rizal left the Japanese port."], "The Japanese cultural setting distinguishes Seiko Usui’s chapter.", seikoSource),
  challenge("H27", "seiko", "A Japanese port dossier", ["The route code belongs to Rizal’s principal port of arrival in Japan.", "The short relationship occurred between larger journeys.", "She is remembered by both a personal name and an honorific nickname."], "Yokohama and the name O-Sei-San resolve the dossier as Seiko Usui.", seikoSource),

  challenge("H28", "gertrude", "The landlord’s household", ["Rizal lodged with her family.", "The city held the British Museum, where he pursued historical research.", "She assisted him while he worked on art and scholarship."], "Gertrude Beckett was a daughter of Rizal’s London landlord and belongs to his London chapter."),
  challenge("H29", "gertrude", "An English affection", ["This dossier is set in England.", "Her family name matches Rizal’s hosts.", "Rizal eventually left for continental Europe."], "The London setting and Beckett household identify Gertrude Beckett."),
  challenge("H30", "gertrude", "A studio companion", ["The relationship developed where Rizal was boarding.", "She showed affection while he pursued artistic and scholarly work.", "The chapter did not lead to marriage."], "Gertrude’s connection grew within the Beckett home during Rizal’s London stay."),
  challenge("H31", "gertrude", "English route", ["This was neither the Spanish-capital nor Belgian boarding-house chapter.", "Rizal was studying Philippine history during his British Museum period.", "She belonged to the family that hosted him during that research."], "The British Museum period and Beckett name point to Gertrude in London."),
  challenge("H32", "gertrude", "A goodbye from England", ["Her affection is associated with Rizal’s lodging.", "He did not remain in England.", "This relationship is usually described as unfulfilled."], "Gertrude Beckett represents an unfulfilled London affection in the course module."),

  challenge("H33", "nellie", "A possible marriage", ["Friends hoped this courtship might become permanent.", "The relationship became serious in France.", "Religious and personal differences complicated the match."], "Nellie Boustead was considered a possible wife, but their differences prevented marriage."),
  challenge("H34", "nellie", "The French coastal chapter", ["The route stamp points to the French coast.", "Rizal spent time with a well-connected Filipino-British family.", "A proposal was considered but not completed."], "Biarritz and the possibility of marriage identify Nellie Boustead."),
  challenge("H35", "nellie", "Faith and future", ["This dossier includes a question of religious commitment.", "Mutual respect did not remove every obstacle.", "The pair did not marry."], "The religious and personal conditions attached to marriage are key clues in Nellie Boustead’s story."),
  challenge("H36", "nellie", "The host family", ["Her family hosted Rizal on the French coast.", "She was intelligent and athletic in course accounts.", "The relationship followed the end of Rizal’s long engagement."], "The Boustead family and the serious French courtship identify Nellie."),
  challenge("H37", "nellie", "A respectful ending", ["The relationship was more serious than a passing admiration.", "Marriage was discussed.", "They separated without the years-long correspondence of Rizal’s earlier engagement."], "Nellie’s dossier centers on a possible marriage that did not proceed."),

  challenge("H38", "suzanne", "A Belgian boarding house", ["Rizal rented a room from her family.", "The setting was Belgium.", "She became attached to him during his stay."], "Suzanne Jacoby belongs to Rizal’s Brussels boarding-house chapter."),
  challenge("H39", "suzanne", "Belgian horizon", ["The route stamp belongs to Belgium’s capital.", "The connection developed under the same roof.", "Rizal later departed to continue his work and travels."], "The Brussels setting and Rizal’s stay in the Jacoby household identify this dossier with Suzanne Jacoby."),
  challenge("H40", "suzanne", "A landlady’s niece", ["She was connected to Rizal’s hosts.", "This is a continental European chapter.", "Her letters expressed that she missed him after he left."], "The family-host connection and later letters distinguish Suzanne Jacoby."),
  challenge("H41", "suzanne", "A boarding-house address", ["The clue is the street of Rizal’s Belgian residence.", "Rizal was writing and working in Belgium.", "The relationship did not become an engagement."], "The Brussels residence places this dossier with Suzanne Jacoby."),
  challenge("H42", "suzanne", "After Rizal departed", ["The relationship was short.", "Distance followed when Rizal moved on.", "The surviving story is one of attachment rather than marriage plans."], "Suzanne’s story is a brief Brussels attachment followed by Rizal’s departure."),

  challenge("H43", "josephine", "The exile companion", ["She arrived with her blind stepfather, who sought treatment.", "The relationship developed during Rizal’s exile.", "She shared his household in his final years."], "Josephine Bracken met Rizal in Dapitan and became his companion during the last chapter of his life.", josephineSource),
  challenge("H44", "josephine", "A patient’s daughter", ["The journey began with a medical consultation.", "Her stepfather was George Taufer.", "The route stamp belongs to Rizal’s place of exile in Mindanao."], "George Taufer’s visit for eye treatment brought Josephine Bracken to Rizal in Dapitan.", josephineSource),
  challenge("H45", "josephine", "Final love", ["The National Museum uses this phrase for her place in Rizal’s life.", "Rizal sculpted her resting figure during exile.", "The museum preserves the work as a sleeping figure of his final companion."], "The National Museum identifies Josephine Bracken as Rizal’s final love and preserves the context of his Dapitan sculpture.", museumSource),
  challenge("H46", "josephine", "After the exile years", ["She was present near the end of Rizal’s life.", "After his death, she joined revolutionary forces.", "Accounts describe her helping wounded fighters."], "Josephine’s later involvement with revolutionaries and care for the wounded extends her story beyond Dapitan.", josephineSource),
  challenge("H47", "josephine", "A shared life in exile", ["This chapter includes domestic life during exile.", "The couple experienced the loss of an infant son.", "Their union faced religious and legal obstacles."], "The Dapitan household and the couple’s personal loss identify Josephine Bracken."),
  challenge("H48", "josephine", "The last chapter", ["The relationship began in 1895.", "It continued through 1896.", "No other dossier sits as close to Rizal’s execution."], "The 1895–1896 timing makes Josephine Bracken the relationship in Rizal’s final life chapter.", josephineSource),
  challenge("H49", "josephine", "From Hong Kong to exile", ["She had been raised in Hong Kong.", "A journey for medical help brought her to Mindanao.", "She became Rizal’s partner during his exile."], "Josephine’s Hong Kong background and Dapitan arrival distinguish her from Rizal’s European acquaintances.", josephineSource),
  challenge("H50", "josephine", "The farewell horizon", ["A quiet domestic chapter unfolded far from Manila.", "Its setting included Rizal’s clinic, school, and farm in exile.", "She is remembered as his companion and common-law wife."], "The Dapitan setting and the final years of Rizal’s life identify this dossier with Josephine Bracken.", josephineSource),
];

export const heartsProfilesById = Object.fromEntries(
  heartsProfiles.map((profile) => [profile.id, profile]),
) as Record<HeartsWomanId, HeartsProfile>;
