export type ScholarCategory = "Campus" | "Discipline" | "Language" | "Mentor" | "Research";

export type ScholarMemoryCard = {
  id: string;
  label: string;
  category: ScholarCategory;
  symbol: string;
  memoryLine: string;
  prompt: string;
  rationale: string;
  source: string;
  sourceUrl: string;
  art?: string;
  artAlt?: string;
};

const heidelbergBook = {
  source: "Heidelberg University: Hero of the Nation and Citizen of the World (2025)",
  sourceUrl: "https://books.ub.uni-heidelberg.de/heibooks/catalog/book/1635",
};

const heidelbergClinic = {
  source: "Heidelberg University: 150 Years of the University Eye Clinic",
  sourceUrl: "https://books.ub.uni-heidelberg.de/heibooks/catalog/book/436",
};

const ateneoArchive = {
  source: "Ateneo de Manila University: Rizal in Ateneo, Ateneo in Rizal",
  sourceUrl: "https://research.ateneo.edu/en/publications/rizal-in-ateneo-ateneo-in-rizal/",
};

const ustArchive = {
  source: "Archivo de la Universidad de Santo Tomas",
  sourceUrl: "https://archivo.ust.edu.ph/about",
};

function scholarCard(
  id: string,
  label: string,
  category: ScholarCategory,
  symbol: string,
  memoryLine: string,
  prompt: string,
  rationale: string,
  basis = heidelbergBook,
  art?: string,
  artAlt?: string,
): ScholarMemoryCard {
  return { id, label, category, symbol, memoryLine, prompt, rationale, ...basis, art, artAlt };
}

export const scholarMemoryCards: ScholarMemoryCard[] = [
  scholarCard("S01", "UST · Medicine", "Campus", "Rx", "Manila medical studies", "Which passport card identifies Rizal's medical studies at the University of Santo Tomas?", "Rizal studied medicine at the University of Santo Tomas before continuing his education in Spain.", ustArchive, "/art/rizal-student-18.jpg", "José Rizal at age eighteen while studying medicine at UST"),
  scholarCard("S02", "UST · Student records", "Campus", "AR", "Original records survive", "Which card points to the university archive that preserves original student records belonging to Rizal?", "The University of Santo Tomas archive lists Rizal's student records among its notable historical holdings.", ustArchive),
  scholarCard("S03", "Ateneo · Formation", "Campus", "AM", "Study changed the student", "Which Manila school did Rizal credit with gradually transforming him through study and self-analysis?", "In his recollection of Ateneo, Rizal described being transformed through study, self-analysis, aspiration, and correction.", ateneoArchive),
  scholarCard("S04", "Madrid · Central University", "Campus", "UC", "European degree center", "Which card names the Madrid university where Rizal continued medicine and Philosophy and Letters?", "At the Central University in Madrid, Rizal continued his studies and passed examinations in medicine and Philosophy and Letters.", heidelbergBook, "/art/universidad-central.jpg", "Buildings of the former Central University of Madrid"),
  scholarCard("S05", "Paris · Eye clinics", "Campus", "PA", "Training before Germany", "Which city gave Rizal ophthalmic experience before he continued his specialist training in Germany?", "Rizal visited Paris for ophthalmic study before continuing to Heidelberg and Berlin for further training.", heidelbergClinic),
  scholarCard("S06", "Heidelberg · Eye clinic", "Campus", "HD", "Lectures and clinical work", "Which university eye clinic allowed Rizal to attend lectures and participate in clinical work?", "Otto Becker permitted Rizal to attend lectures and clinical work at the University Eye Clinic in Heidelberg.", heidelbergClinic),
  scholarCard("S07", "Berlin · Further training", "Campus", "BE", "German medical study", "Which German city completes Rizal's specialist-learning route after Paris and Heidelberg?", "Rizal pursued further ophthalmological education in German lands, including Heidelberg and Berlin.", heidelbergClinic),
  scholarCard("S08", "Biblioteca Real · Madrid", "Campus", "BR", "Philippine sources in Spain", "Which Madrid library did Rizal consult while rebuilding his understanding of Philippine history?", "Rizal used the Biblioteca Real in Madrid as one of several European collections for research on the Philippines.", heidelbergBook),
  scholarCard("S09", "Bibliothèque Nationale · Paris", "Campus", "BN", "Research collection in France", "Which Paris research library appears among the European collections Rizal consulted about the Philippines?", "The Bibliothèque Nationale in Paris was one of the major libraries Rizal used for Philippine historical research.", heidelbergBook),
  scholarCard("S10", "British Museum · Reading Room", "Campus", "BM", "London research station", "Which London reading room supported Rizal's search for sources about the Philippine past?", "Rizal consulted the Reading Room of the British Museum while gathering material related to Philippine history.", heidelbergBook),

  scholarCard("S11", "Medicine · Degree work", "Discipline", "MD", "Study of health and disease", "Which field did Rizal continue in Madrid after beginning it at the University of Santo Tomas?", "Medicine formed one side of Rizal's university education and later led him toward specialist eye training.", heidelbergBook),
  scholarCard("S12", "Philosophy and Letters", "Discipline", "PL", "Humanities examination", "Which humanities field did Rizal study and complete examinations in alongside medicine in Madrid?", "Rizal passed examinations in the faculty known as Filosofia y Letras, commonly rendered Philosophy and Letters.", heidelbergBook),
  scholarCard("S13", "Ophthalmology", "Discipline", "OP", "Specialist study of the eye", "Which medical specialty connected Rizal's learning in Paris, Heidelberg, and Berlin?", "Rizal specialised in ophthalmology and sought advanced experience with leading European eye doctors and clinics.", heidelbergBook),
  scholarCard("S14", "Clinical work", "Discipline", "CL", "Learning with patients", "Which form of practical learning accompanied the lectures Rizal attended at Heidelberg's eye clinic?", "Heidelberg's clinic allowed Rizal to combine lectures with clinical work rather than study only from books.", heidelbergClinic),
  scholarCard("S15", "Philology", "Discipline", "PH", "Language as historical evidence", "Which discipline best describes Rizal's scholarly interest in languages, texts, and their historical development?", "Rizal's language study and historical reading show sustained philological curiosity alongside his medical training.", heidelbergBook),
  scholarCard("S16", "History · Philippine past", "Discipline", "HI", "Reconstructing the precolonial era", "Which field guided Rizal's search through European collections for evidence about the Philippines before colonisation?", "Rizal consulted many sources to reconstruct the precolonial past and challenge narrow colonial accounts of Filipinos.", heidelbergBook),
  scholarCard("S17", "Comparative education", "Discipline", "CE", "Schools observed across cities", "Which learning habit is represented by Rizal visiting educational institutions in the European cities where he stayed?", "Rizal observed educational institutions abroad, giving him points of comparison for thinking about education and reform.", heidelbergBook),
  scholarCard("S18", "Literature", "Discipline", "LT", "Ideas through original works", "Which broad field linked Rizal's reading of Virgil, Dante, Shakespeare, Voltaire, and Schiller?", "Rizal read widely across European literature and often approached major works in their original languages.", heidelbergBook),
  scholarCard("S19", "Rhetoric", "Discipline", "RT", "Training in persuasive expression", "Which subject in Rizal's formal schooling prepared students to construct and deliver arguments?", "Rhetoric was a major part of Rizal's formal education and contributed to his later work as an essayist and speaker.", heidelbergBook),
  scholarCard("S20", "Independent inquiry", "Discipline", "IQ", "Question, compare, verify", "Which scholarly practice ties together Rizal's library research, language learning, observation, and annotation?", "Rizal's education extended beyond credentials: he repeatedly compared sources, learned languages, and tested received claims.", heidelbergBook),

  scholarCard("S21", "Spanish", "Language", "ES", "Primary language of study", "Which language carried much of Rizal's university work, correspondence, essays, and major novels?", "Spanish was central to Rizal's formal education and to much of his writing for reform and scholarship.", heidelbergBook),
  scholarCard("S22", "Latin", "Language", "LA", "Classics and formal schooling", "Which classical language gave Rizal direct access to writers such as Virgil and Augustine?", "Rizal received formal education in Latin and read classical authors whose works shaped European intellectual traditions.", heidelbergBook),
  scholarCard("S23", "German", "Language", "DE", "Study, reading, correspondence", "Which language helped Rizal study in Heidelberg and communicate extensively with Ferdinand Blumentritt?", "Rizal cultivated German for scholarship and used it in much of his long correspondence with Blumentritt.", heidelbergBook),
  scholarCard("S24", "French", "Language", "FR", "Madrid course and Paris use", "Which language did Rizal study in Madrid and use while moving through intellectual and medical circles in France?", "French was among the language courses Rizal attended in Madrid and supported his later study and research in Paris.", heidelbergBook),
  scholarCard("S25", "Italian", "Language", "IT", "Reading European classics", "Which language helped Rizal approach authors such as Dante and Machiavelli closer to their original words?", "Italian was among Rizal's Madrid language studies and supported his interest in major works of European literature.", heidelbergBook),
  scholarCard("S26", "English", "Language", "EN", "Literature and global research", "Which language connected Rizal to Shakespeare and helped him work in English-speaking research settings?", "English belonged to Rizal's wide language study and gave access to literature and research resources beyond Spain.", heidelbergBook),
  scholarCard("S27", "Hebrew", "Language", "HE", "A Madrid language course", "Which ancient language appears in the list of courses Rizal attended while studying in Madrid?", "Heidelberg University's account includes Hebrew among the language courses Rizal attended at the Central University in Madrid.", heidelbergBook),
  scholarCard("S28", "Original-language reading", "Language", "OL", "Read ideas before translation", "Which practice let Rizal engage authors through the languages in which their works were written?", "Rizal improved several languages so he could read, quote, and compare important literary and scholarly works more directly.", heidelbergBook),
  scholarCard("S29", "German correspondence", "Language", "GC", "Letters from Heidelberg", "Which language practice became especially visible in Rizal's decade-long exchange with Blumentritt?", "Apart from a few Spanish exceptions, Rizal and Blumentritt conducted much of their correspondence in German.", heidelbergBook),
  scholarCard("S30", "Multilingual scholarship", "Language", "MS", "Languages working together", "Which phrase best describes Rizal using Spanish, Latin, German, French, Italian, English, and Hebrew in his formation?", "Rizal treated language learning as a scholarly tool for reading sources, entering new communities, and communicating ideas.", heidelbergBook),

  scholarCard("S31", "Teodora Alonso · First teacher", "Mentor", "TA", "Learning began at home", "Which family mentor introduced Rizal to reading before his education expanded into formal schools and universities?", "Rizal's mother, Teodora Alonso, is remembered as his first teacher and as an early influence on his love of learning.", { source: "Instructor-provided Module 4: Family, Childhood, Genealogy, and Early Education", sourceUrl: "" }),
  scholarCard("S32", "Fr. Francisco de Paula Sánchez", "Mentor", "FS", "Ateneo professor", "Which professor did Rizal credit with a beneficial influence on his gradual transformation as a student?", "Rizal explicitly credited the zealous Ateneo professor Fr. Francisco de Paula Sanchez with helping shape his development.", ateneoArchive),
  scholarCard("S33", "Otto Becker · Heidelberg", "Mentor", "OB", "Eye-clinic director", "Which Heidelberg ophthalmologist allowed Rizal to attend lectures and clinical work at the university eye clinic?", "Otto Becker directed Heidelberg's University Eye Clinic and supported Rizal's advanced ophthalmological learning there.", heidelbergClinic),
  scholarCard("S34", "Paris ophthalmologists", "Mentor", "PO", "Specialists before Heidelberg", "Which group of specialists belongs to the city Rizal visited before continuing eye training in Heidelberg?", "Rizal sought instruction and experience from ophthalmologists in Paris before pursuing further study in German clinics.", heidelbergClinic),
  scholarCard("S35", "Ferdinand Blumentritt", "Mentor", "FB", "Scholar and correspondent", "Which European scholar exchanged ideas with Rizal about history, language, politics, and human rights for roughly a decade?", "Blumentritt became Rizal's major scholarly correspondent and a partner in sustained discussion about the Philippines.", heidelbergBook),
  scholarCard("S36", "Virgil", "Mentor", "VG", "Latin classical author", "Which classical Roman poet represents the Latin authors Rizal read during his formal intellectual formation?", "Rizal read Latin classics including Virgil, strengthening the literary foundation behind his multilingual scholarship.", heidelbergBook),
  scholarCard("S37", "Dante", "Mentor", "DA", "Italian poet read directly", "Which Italian poet appears among the writers Rizal engaged as he improved his command of European languages?", "Dante belonged to the wide range of authors Rizal read in connection with his linguistic and literary development.", heidelbergBook),
  scholarCard("S38", "Shakespeare", "Mentor", "SH", "English literary study", "Which English dramatist appears in the record of major European authors Rizal read and quoted?", "Shakespeare was among the writers Rizal approached through his expanding language skills and literary study.", heidelbergBook),
  scholarCard("S39", "Schiller", "Mentor", "SC", "German literary study", "Which German writer joins Rizal's language learning with his close engagement in German intellectual life?", "Schiller appears among the writers Rizal read as part of the broad literary education he pursued in Europe.", heidelbergBook),
  scholarCard("S40", "Voltaire", "Mentor", "VO", "French Enlightenment writer", "Which French Enlightenment author appears among the European thinkers and writers read by Rizal?", "Voltaire formed part of the diverse European reading through which Rizal widened his intellectual frame of reference.", heidelbergBook),

  scholarCard("S41", "Family library", "Research", "FL", "A thousand-book foundation", "Which Calamba resource gave young Rizal unusually broad access to books, including works restricted by colonial authorities?", "Heidelberg University's account describes the Rizal family library as holding at least one thousand books, including banned works.", heidelbergBook),
  scholarCard("S42", "European libraries", "Research", "EL", "Collections across borders", "Which research network linked Madrid, Berlin, Paris, and London in Rizal's search for Philippine sources?", "Rizal did not depend on one collection; he compared materials held across several major European libraries.", heidelbergBook),
  scholarCard("S43", "Museums", "Research", "MU", "Learning from collections", "Which kind of institution did Rizal regularly visit to examine art, objects, and historical collections?", "Museums were among the institutions Rizal visited in European cities, making observation part of his continuing education.", heidelbergBook),
  scholarCard("S44", "Clinics", "Research", "CX", "Learning through practice", "Which institutions turned Rizal's medical study into direct specialist observation and practical experience?", "Clinics in Paris and the German cities supported Rizal's move from general medical training toward ophthalmology.", heidelbergBook),
  scholarCard("S45", "Educational institutions", "Research", "EI", "Compare systems abroad", "Which places did Rizal visit to observe how education worked outside the colonial Philippine setting?", "Rizal visited educational institutions throughout his travels and used those encounters to broaden his view of learning.", heidelbergBook),
  scholarCard("S46", "Philippine source hunt", "Research", "PS", "Recover a buried past", "What research mission drove Rizal to consult archives and libraries across several European capitals?", "Rizal searched for materials about the Philippines in order to reconstruct its past beyond the limits of colonial narratives.", heidelbergBook),
  scholarCard("S47", "Morga · Critical annotations", "Research", "MO", "History read against the grain", "Which scholarly project grew from Rizal's collection of historical evidence and his critical notes on an early Spanish chronicle?", "Rizal produced an annotated edition of Antonio de Morga's chronicle, using historical commentary to reassess the Philippine past.", heidelbergBook),
  scholarCard("S48", "To the Flowers of Heidelberg", "Research", "FH", "Poetry during medical study", "Which poem connects Rizal's literary creativity with his period of ophthalmological learning in Heidelberg?", "Rizal wrote the poem commonly known as To the Flowers of Heidelberg during his stay connected with the university city.", heidelbergClinic),
  scholarCard("S49", "Noli · Scholar and writer", "Research", "NO", "A novel shaped in Europe", "Which novel shows Rizal combining European study, observation, language, and writing into a critique of colonial society?", "While pursuing scholarship and medical training in Europe, Rizal worked on Noli Me Tangere, later published in Berlin.", heidelbergBook),
  scholarCard("S50", "Examine before accepting", "Research", "EV", "Evidence before conclusion", "Which principle best captures Rizal's scholarly habit of questioning claims, comparing sources, and analysing evidence?", "Rizal's formation in Europe reinforced a habit of discussion, doubt, examination, and analysis before accepting a claim.", heidelbergBook),
];
