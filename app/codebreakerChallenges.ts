export type CodebreakerGroup = "Family & roots" | "Childhood" | "Early education";

export type CodebreakerChallenge = {
  id: string;
  answer: string;
  variants: string[];
  category: CodebreakerGroup;
  year: string;
  clues: [string, string, string];
  rationale: string;
  source: string;
  sourceUrl: string;
};

const courseSource = "Rizal Life Module 4: Rizal’s Family, Childhood, Genealogy, and Early Education";

function rootFile(
  id: string,
  answer: string,
  variants: string[],
  category: CodebreakerGroup,
  clues: [string, string, string],
  rationale: string,
): CodebreakerChallenge {
  return {
    id,
    answer,
    variants: [answer, ...variants],
    category,
    year: "Module 4",
    clues,
    rationale,
    source: courseSource,
    sourceUrl: "",
  };
}

export const codebreakerChallenges: CodebreakerChallenge[] = [
  rootFile("R01", "Calamba", [], "Family & roots", ["Decode a place connected to Rizal’s beginnings.", "It is a town in the province named in the next clue.", "José Rizal was born in this Laguna town."], "The module identifies Calamba as José Rizal’s birthplace and the setting of his early family life."),
  rootFile("R02", "Laguna", [], "Family & roots", ["Decode the province of Rizal’s birthplace.", "It contains the town where the Mercado family lived.", "Calamba belongs to this province."], "The module locates Rizal’s birthplace in Calamba, Laguna."),
  rootFile("R03", "Francisco Mercado", ["francisco mercado rizal"], "Family & roots", ["Decode the name of a member of Rizal’s immediate family.", "He was one of the parents who emphasized education and discipline.", "This man was José Rizal’s father in the Calamba household."], "Francisco Mercado was José Rizal’s father and part of the family environment that shaped his character."),
  rootFile("R04", "Teodora Alonzo", ["teodora alonso", "teodora alonso realonda", "teodora alonzo realonda"], "Family & roots", ["Decode the name of a member of Rizal’s immediate family.", "She taught him his earliest lessons at home.", "This woman was José Rizal’s mother and earliest home teacher."], "Teodora Alonzo was Rizal’s mother and his first guide in reading, prayer, and early learning."),
  rootFile("R05", "Eleven Children", ["eleven", "11 children"], "Family & roots", ["Decode a family-size phrase written in words.", "José belonged to a large household in Calamba.", "The module says the Rizal family had this many children."], "The module describes José Rizal as one of eleven children in the family."),
  rootFile("R06", "Seventh Child", ["seventh", "7th child"], "Family & roots", ["Decode José’s birth order written in words.", "The family had eleven children altogether.", "José held this position among the siblings."], "José Rizal was the seventh child in the family, according to the module’s family-tree section."),
  rootFile("R07", "Mercado", [], "Family & roots", ["Decode a surname connected to Rizal’s family.", "It was used by the family before José became widely known by another name.", "The module asks for the meaning of this Spanish family surname."], "Mercado was the family surname associated with José Rizal’s paternal line."),
  rootFile("R08", "Rizal", [], "Family & roots", ["Decode a surname adopted by José.", "It distinguishes the hero’s familiar historical name from the family surname Mercado.", "José became known to history by this surname."], "The module identifies Rizal as the family name later adopted by José."),
  rootFile("R09", "Merchant", ["market", "merchant market"], "Family & roots", ["Decode the English meaning connected to a Spanish surname.", "The clue concerns the word Mercado.", "The module gives this as the meaning of the family surname."], "The module explains Mercado through the meaning merchant or market."),
  rootFile("R10", "Educated Family", ["educated"], "Family & roots", ["Decode a description of the Rizal household.", "Learning was strongly valued in the home.", "The module pairs this quality with the family’s respected social position."], "The module describes Rizal as growing up in a well-respected and educated family."),
  rootFile("R11", "Diverse Roots", ["diverse cultural roots", "multicultural roots"], "Family & roots", ["Decode a phrase about Rizal’s ancestry.", "The module rejects the idea that his genealogy came from only one culture.", "His genealogy reflects these multicultural origins."], "Studying Rizal’s genealogy reveals the diverse cultural roots that contributed to his identity."),
  rootFile("R12", "Genealogy", [], "Family & roots", ["Decode a field of family study.", "It examines ancestry and relationships across generations.", "The module uses it to explain influences on Rizal’s identity."], "Genealogy helps students understand Rizal’s ancestry, family connections, and multicultural background."),
  rootFile("R13", "Family Heritage", ["heritage"], "Family & roots", ["Decode a phrase connecting ancestry with identity.", "It includes traditions and influences passed through a family.", "The module links Rizal’s genealogy to this inherited background."], "Rizal’s family heritage provides context for the values and influences present in his early life."),
  rootFile("R14", "Parents", [], "Family & roots", ["Decode a family relationship in plural form.", "Francisco and Teodora belong to this group.", "They strongly emphasized education in Rizal’s home."], "Rizal’s parents helped establish the learning, discipline, and values that shaped his childhood."),
  rootFile("R15", "Siblings", ["brothers and sisters"], "Family & roots", ["Decode a family relationship in plural form.", "José grew up with ten others in this group.", "Paciano was one member of this group of brothers and sisters."], "Rizal’s siblings formed part of the close family environment that influenced his development."),
  rootFile("R16", "Paciano", ["paciano rizal", "paciano mercado"], "Family & roots", ["Decode the first name of an influential sibling.", "He was José’s influential older brother in the Rizal family.", "The module connects him strongly with José’s developing nationalism."], "Paciano, Rizal’s older brother, greatly influenced José’s nationalist awareness."),
  rootFile("R17", "Discipline", [], "Family & roots", ["Decode a value cultivated in Rizal’s family environment.", "It supports consistent habits and responsible effort.", "The module lists it with learning, patriotism, and hard work."], "Discipline was one of the qualities valued in Rizal’s home and later reflected in his development."),
  rootFile("R18", "Hard Work", ["hardworking"], "Family & roots", ["Decode a two-word value practiced in the Rizal household.", "It concerns sustained effort rather than inherited talent alone.", "The module lists it among the values of his family environment."], "Hard work was one of the formative values present in Rizal’s childhood home."),

  rootFile("R19", "Mother", [], "Childhood", ["Decode an immediate-family role held by one of José’s parents.", "This person provided José’s earliest home lessons.", "Teodora held this relationship to Rizal."], "Rizal’s mother, Teodora Alonzo, was central to his earliest learning and moral formation."),
  rootFile("R20", "Read and Pray", ["reading and prayer"], "Childhood", ["Decode two early activities joined by the word AND.", "They were part of José’s first lessons at home.", "Teodora first taught him to do these."], "The module states that Teodora first taught the young Rizal how to read and pray."),
  rootFile("R21", "Nationalism", [], "Childhood", ["Decode an idea connected to love of nation.", "An older brother helped awaken it in José.", "Paciano strongly influenced the growth of this outlook."], "Paciano’s influence helped develop Rizal’s early nationalist awareness."),
  rootFile("R22", "Writing", [], "Childhood", ["Decode one talent Rizal showed when young.", "It later became central to his work as a reformist.", "The module pairs this childhood talent with drawing."], "The module identifies writing as one of the talents Rizal displayed at an early age."),
  rootFile("R23", "Drawing", [], "Childhood", ["Decode one visual talent Rizal showed when young.", "It uses lines and images rather than only words.", "The module pairs this childhood talent with writing."], "The module identifies drawing as another talent Rizal displayed during childhood."),
  rootFile("R24", "Leon Monroy", [], "Childhood", ["Decode the name of an early teacher.", "He taught José outside the immediate family home.", "The module calls him Rizal’s first teacher outside the home."], "Leon Monroy is identified in the module as Rizal’s first teacher outside the home."),
  rootFile("R25", "Colonial Injustice", ["injustice under colonial rule"], "Childhood", ["Decode a two-word historical condition.", "Experiences of abuse and unequal treatment made it visible.", "Awareness of this condition influenced Rizal’s developing outlook."], "The module connects Rizal’s early awareness of injustice with discrimination and abuse under colonial rule."),
  rootFile("R26", "Discrimination", [], "Childhood", ["Decode a form of unfair treatment.", "The module links it with abuse under colonial rule.", "Experiencing it helped awaken José’s awareness of injustice."], "Experiences of discrimination contributed to Rizal’s early recognition of colonial injustice."),
  rootFile("R27", "Character", [], "Childhood", ["Decode what values and habits gradually shape in a person.", "Family, teachers, and experience all contributed to it.", "The module connects early life with the formation of this personal quality."], "Rizal’s family environment and childhood experiences helped form his character."),
  rootFile("R28", "Intelligence", [], "Childhood", ["Decode a quality connected to understanding and learning.", "Rizal’s home environment helped nurture it.", "The module names it alongside character and love for country."], "The module says Rizal’s family and early experiences helped shape his intelligence."),
  rootFile("R29", "Love of Country", ["love for country"], "Childhood", ["Decode a three-word phrase about national affection.", "Family and early experience helped cultivate it.", "It later supported Rizal’s development as a patriot."], "Rizal’s early environment helped develop his love of country."),
  rootFile("R30", "Patriotism", [], "Childhood", ["Decode a value directed toward one’s nation.", "Rizal’s family environment encouraged it.", "The module links family and education with the making of a national hero through this value."], "Patriotism was among the values shaped by Rizal’s family background and early education."),
  rootFile("R31", "Perseverance", [], "Childhood", ["Decode a value about continuing despite difficulty.", "It supports growth through challenges.", "The module asks students to recognize its importance alongside discipline and lifelong learning."], "Perseverance is one of the formative values emphasized in the module’s study of Rizal’s early life."),
  rootFile("R32", "Curiosity", [], "Childhood", ["Decode a trait that motivates questions and discovery.", "It helped Rizal engage deeply with learning.", "The module pairs it with diligence as a reason he excelled in school."], "Curiosity helped Rizal learn actively and contributed to his early educational success."),
  rootFile("R33", "Diligence", [], "Childhood", ["Decode a trait involving careful, steady effort.", "It is more active than simply being naturally gifted.", "The module pairs it with curiosity as a reason Rizal excelled."], "Diligence describes the steady effort that supported Rizal’s success as a young student."),
  rootFile("R34", "Mentors", [], "Childhood", ["Decode a plural word for guiding individuals.", "Parents, teachers, and an older sibling can serve in this role.", "The module asks students to respect the people who guided Rizal’s development."], "Rizal’s parents, teachers, relatives, and other mentors helped shape his talents and aspirations."),

  rootFile("R35", "Biñan", ["binan"], "Early education", ["Decode a place connected to formal schooling.", "It is in Laguna, like Calamba.", "Rizal studied under Justiniano Aquino Cruz in this town."], "The module identifies Biñan as the place of Rizal’s early formal education."),
  rootFile("R36", "Justiniano Aquino Cruz", ["justiniano cruz"], "Early education", ["Decode the full name of one of Rizal’s early formal teachers.", "His school was outside Rizal’s Calamba home.", "He taught Rizal during his formal education in Biñan."], "Justiniano Aquino Cruz was Rizal’s teacher during his formal schooling in Biñan."),
  rootFile("R37", "Education", [], "Early education", ["Decode the value most strongly emphasized by Rizal’s parents.", "The module calls it a tool for personal and national development.", "It laid the groundwork for Rizal’s future achievements."], "Education was strongly valued in Rizal’s family and became a foundation for his intellectual development."),
  rootFile("R38", "Learning", [], "Early education", ["Decode an ongoing process of gaining knowledge and skill.", "Rizal’s home environment valued it.", "The module links it with discipline, perseverance, and later achievement."], "A strong culture of learning at home and school supported Rizal’s growth."),
  rootFile("R39", "Intellectual Abilities", ["intellectual ability"], "Early education", ["Decode a two-word phrase about powers of thought.", "Early lessons helped develop them.", "The module says schooling strengthened these together with character."], "Rizal’s early education developed the intellectual abilities that supported his later accomplishments."),
  rootFile("R40", "Lifelong Learning", [], "Early education", ["Decode a two-word principle extending beyond school years.", "It treats education as a continuing practice.", "The module includes it among the values students should recognize."], "The module presents lifelong learning as a value visible in Rizal’s educational development."),
  rootFile("R41", "Formal School", ["formal schooling"], "Early education", ["Decode a two-word type of learning environment.", "It differs from lessons given at home.", "Rizal experienced it in Biñan under Justiniano Aquino Cruz."], "Formal school in Biñan extended the education Rizal had first received at home."),
  rootFile("R42", "Home Education", ["education at home", "home schooling"], "Early education", ["Decode a two-word phrase for Rizal’s earliest learning setting.", "It came before his schooling in Biñan.", "His mother led these first lessons."], "Rizal’s home education under Teodora preceded and prepared him for formal schooling."),
  rootFile("R43", "Reading", [], "Early education", ["Decode a foundational literacy skill.", "Teodora introduced it during José’s earliest lessons.", "It later supported his development as a writer and scholar."], "Reading was among the earliest skills Rizal learned from his mother."),
  rootFile("R44", "Prayer", ["praying"], "Early education", ["Decode a practice included in Rizal’s earliest home lessons.", "It reflects the moral and religious side of his upbringing.", "Teodora taught it together with reading."], "Prayer formed part of the earliest instruction Rizal received from his mother."),
  rootFile("R45", "Teachers", [], "Early education", ["Decode a plural word for formal guides to learning.", "Leon Monroy and Justiniano Aquino Cruz belong to this group.", "The module asks students to respect these educational influences."], "Teachers outside the home extended Rizal’s education and helped develop his abilities."),
  rootFile("R46", "Character Formation", ["formation of character"], "Early education", ["Decode a two-word developmental process.", "It involves shaping values, habits, and judgment.", "The module links family and schooling to this process."], "Rizal’s early education contributed not only knowledge but also to character formation."),
  rootFile("R47", "Foundation", [], "Early education", ["Decode a word meaning the supporting base for later growth.", "Home lessons and formal schooling provided it.", "The module says early education served this role for Rizal’s later achievements."], "Rizal’s early education laid the foundation for his future work as a scholar, writer, physician, and nationalist."),
  rootFile("R48", "Scholar", [], "Early education", ["Decode a word for a person devoted to advanced learning.", "Rizal’s early schooling prepared him to become one.", "The module uses this role when describing his later development."], "The education Rizal received as a child helped prepare him for life as a brilliant scholar."),
  rootFile("R49", "Personal Development", [], "Early education", ["Decode a two-word phrase about an individual’s growth.", "Education can strengthen knowledge, values, and ability.", "The module presents education as a tool for this kind of development."], "Rizal’s early education demonstrates how learning can support personal development."),
  rootFile("R50", "National Development", [], "Early education", ["Decode a two-word phrase about a country’s progress.", "The module links it to the social purpose of learning.", "Education is presented as a tool for both personal growth and this wider goal."], "The module connects education not only with individual growth but also with national development."),
];
