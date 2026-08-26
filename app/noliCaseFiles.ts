export type NoliCaseType = "Character" | "Plot & background" | "Theme & context";

export type NoliCaseFile = {
  id: string;
  answer: string;
  caseType: NoliCaseType;
  visual: string;
  portraitIndex?: number;
  hint: string;
  rationale: string;
  source: string;
  sourceUrl: string;
};

const moduleSource = "Rizal Life Module 7: Noli Me Tangere — Rizal’s Novel of Social Awakening";
const novelSource = "Noli Me Tangere / The Social Cancer";
const novelUrl = "https://www.gutenberg.org/ebooks/6737";

function noliFile(
  id: string,
  answer: string,
  caseType: NoliCaseType,
  visual: string,
  hint: string,
  rationale: string,
  basis: "module" | "novel" = "module",
  portraitIndex?: number,
): NoliCaseFile {
  return {
    id,
    answer,
    caseType,
    visual,
    portraitIndex,
    hint,
    rationale,
    source: basis === "module" ? moduleSource : novelSource,
    sourceUrl: basis === "module" ? "" : novelUrl,
  };
}

export const noliCaseFiles: NoliCaseFile[] = [
  noliFile("N01", "Crisóstomo Ibarra", "Character", "CI", "Don Rafael’s son · returns from Europe · plans a public school in San Diego", "Ibarra is the novel’s central protagonist, and his school project represents his reformist faith in education.", "module", 0),
  noliFile("N02", "María Clara", "Character", "MC", "Raised in Capitán Tiago’s home · Ibarra’s beloved · later enters a convent", "María Clara is Ibarra’s beloved and one of the novel’s central figures.", "module", 1),
  noliFile("N03", "Elias", "Character", "EL", "Boatman and pilot · warns Ibarra · helps him escape from pursuing guards", "Elias is Ibarra’s reform-minded guide and ally, representing hope for deeper social change.", "module", 3),
  noliFile("N04", "Sisa", "Character", "SA", "Mother of Basilio and Crispin · searches for her sons · symbolizes suffering motherhood", "Sisa’s tragedy embodies the suffering imposed on vulnerable Filipino families.", "module", 2),
  noliFile("N05", "Basilio", "Character", "BA", "Sisa’s son · young sacristan · survives and later meets Elias near the forest", "Basilio is one of Sisa’s sons and survives the violence that destroys his family.", "novel"),
  noliFile("N06", "Crispin", "Character", "CR", "Sisa’s younger son · accused of theft · abused while serving as a sacristan", "Crispin’s disappearance exposes the cruelty and powerlessness suffered by children under abusive authority.", "novel"),
  noliFile("N07", "Padre Dámaso", "Character", "PD", "Former curate of San Diego · openly opposes Ibarra · influential friar and antagonist", "Padre Dámaso is the powerful friar who repeatedly obstructs Ibarra and embodies clerical abuse.", "module"),
  noliFile("N08", "Padre Salvi", "Character", "PS", "Curate of San Diego · quiet and watchful · political rival of the alférez", "Padre Salvi succeeds Dámaso as curate and exercises influence through secrecy and fear.", "novel"),
  noliFile("N09", "Capitán Tiago", "Character", "CT", "Wealthy host in Binondo · guardian and legal father of María Clara · close to the friars", "Capitán Tiago’s status and loyalties show how colonial society rewarded accommodation to powerful institutions.", "novel"),
  noliFile("N10", "Pilosopo Tasyo", "Character", "PT", "Elderly scholar · called mad by some townspeople · advises Ibarra about society", "Tasyo is the reflective philosopher whose observations reveal contradictions in colonial society.", "novel"),
  noliFile("N11", "Don Rafael Ibarra", "Character", "DR", "Father of Crisóstomo · imprisoned after a dispute · dies before his son returns", "Don Rafael’s fate motivates Ibarra and reveals how reputation and justice can be manipulated by those in power.", "novel"),
  noliFile("N12", "Doña Victorina", "Character", "DV", "Filipina social climber · imitates Spanish manners · wife of Don Tiburcio", "Doña Victorina satirizes colonial mentality and the desire to appear socially superior through imitation.", "novel"),
  noliFile("N13", "Don Tiburcio de Espadaña", "Character", "DT", "Spanish quack doctor · timid husband of Doña Victorina · associated with false social prestige", "Don Tiburcio’s pretended medical standing helps the novel satirize fraud and colonial social ambition.", "novel"),
  noliFile("N14", "Alfonso Linares", "Character", "AL", "Young Spaniard introduced by Doña Victorina · considered as a husband for María Clara", "Linares becomes part of the pressure placed on María Clara after Ibarra’s downfall.", "novel"),
  noliFile("N15", "Tiya Isabel", "Character", "TI", "Relative in Capitán Tiago’s household · cares for María Clara · accompanies the young women", "Tiya Isabel serves as María Clara’s practical caretaker within Capitán Tiago’s home.", "novel"),
  noliFile("N16", "Doña Consolación", "Character", "DC", "Wife of the alférez · ashamed of her origins · cruelly mistreats the vulnerable Sisa", "Doña Consolación shows how borrowed authority can become cruelty toward someone more vulnerable.", "novel"),
  noliFile("N17", "The Alférez", "Character", "AF", "Commander of the Civil Guard · husband of Doña Consolación · rival of the town curate", "The alférez represents armed colonial authority and its rivalry with religious power in San Diego.", "novel"),
  noliFile("N18", "Lieutenant Guevara", "Character", "LG", "Civil Guard officer · respected Don Rafael · tells Ibarra what happened to his father", "Lieutenant Guevara gives Ibarra the crucial account of Don Rafael’s persecution and death.", "novel"),
  noliFile("N19", "Don Filipo", "Character", "DF", "Vice-mayor of San Diego · liberal-minded official · participates in the town’s debates", "Don Filipo represents a local official willing to question prevailing practices and discuss reform.", "novel"),
  noliFile("N20", "Sinang", "Character", "SI", "María Clara’s lively friend · daughter of Capitán Basilio · joins the young women’s outings", "Sinang is part of María Clara’s close circle and helps connect several social scenes in San Diego.", "novel"),

  noliFile("N21", "José Rizal", "Plot & background", "JR", "Filipino writer and reformist · author of the novel · used literature to awaken social awareness", "José Rizal wrote Noli Me Tangere as a peaceful but forceful critique of colonial abuses.", "module"),
  noliFile("N22", "Noli Me Tangere", "Plot & background", "NMT", "Latin title meaning Touch Me Not · Rizal’s first novel · exposes colonial injustice", "Noli Me Tangere is Rizal’s 1887 novel of social awakening and peaceful reform.", "module"),
  noliFile("N23", "1887", "Plot & background", "87", "Publication year · comes before El Filibusterismo · belongs to the late Spanish colonial period", "The module identifies 1887 as the year Noli Me Tangere was published.", "module"),
  noliFile("N24", "Berlin", "Plot & background", "BE", "European city · place where the novel was printed · linked with Rizal’s first novel", "Noli Me Tangere was published in Berlin, an important detail in the novel’s historical background.", "module"),
  noliFile("N25", "Máximo Viola", "Plot & background", "MV", "Friend of Rizal · provided financial assistance · helped make the novel’s publication possible", "Máximo Viola helped finance the printing of Noli Me Tangere.", "module"),
  noliFile("N26", "San Diego", "Plot & background", "SD", "Fictional town · setting of Ibarra’s school project · home of many central characters", "San Diego is the principal fictional town through which the novel portrays colonial Philippine society.", "novel"),
  noliFile("N27", "Ibarra’s Return", "Plot & background", "IR", "Journey home from Europe · begins the protagonist’s renewed contact with his country · reveals his father’s fate", "Ibarra’s return brings his reformist hopes into conflict with the realities of San Diego.", "module"),
  noliFile("N28", "Public School", "Plot & background", "SC", "Education project · planned by Ibarra · intended to serve the people of San Diego", "Ibarra’s proposed public school represents education as a path toward peaceful social improvement.", "module"),
  noliFile("N29", "Don Rafael’s Imprisonment", "Plot & background", "RI", "Punishment before Ibarra’s return · follows accusations and conflict · ends with death in jail", "Don Rafael’s imprisonment and death demonstrate the novel’s criticism of distorted justice and abusive influence.", "module"),
  noliFile("N30", "Lake Picnic", "Plot & background", "LP", "Outing with Ibarra and María Clara · takes place on the water · includes a dangerous animal encounter", "The lake picnic gathers the young characters and leads to the crocodile episode in which Elias intervenes.", "novel"),
  noliFile("N31", "Crocodile", "Plot & background", "CR", "Danger beneath the water · encountered during the picnic · fought by Elias before Ibarra joins", "The crocodile episode highlights Elias’s courage and Ibarra’s willingness to help him.", "novel"),
  noliFile("N32", "Cornerstone Ceremony", "Plot & background", "CC", "Celebration for Ibarra’s project · involves a suspended stone · becomes an attempted killing", "The cornerstone ceremony turns Ibarra’s school project into a scene of danger and hidden opposition.", "novel"),
  noliFile("N33", "San Diego Fiesta", "Plot & background", "SF", "Town celebration · brings together religious and civil authorities · exposes status and rivalry", "The San Diego fiesta provides a public stage for the novel’s social hierarchy and conflicts.", "novel"),
  noliFile("N34", "Ibarra’s Escape", "Plot & background", "IE", "Flight from pursuing guards · aided by Elias · occurs near the end of the novel", "Elias helps Ibarra escape, completing one of the module’s most important plot events.", "module"),
  noliFile("N35", "Elias’s Sacrifice", "Plot & background", "ES", "Final act of an ally · protects Ibarra during the escape · expresses commitment to a better future", "Elias risks and ultimately gives his life while helping Ibarra, embodying selfless hope for change.", "novel"),

  noliFile("N36", "Social Justice", "Theme & context", "SJ", "Concern for fairness · central theme of the module · opposed to abuse and inequality", "Social justice is a major theme through which the novel asks readers to recognize unfair systems and human suffering.", "module"),
  noliFile("N37", "Education", "Theme & context", "ED", "Represented by Ibarra’s school · tool for critical thinking · path toward social development", "The school project makes education one of the novel’s clearest instruments for peaceful reform.", "module"),
  noliFile("N38", "Corruption", "Theme & context", "CO", "Misuse of entrusted power · linked with self-interest · criticized through colonial institutions", "The module identifies corruption as one of the abuses exposed by the novel.", "module"),
  noliFile("N39", "Abuse of Power", "Theme & context", "AP", "Authority used to harm rather than protect · visible in official and clerical actions · major social criticism", "Noli Me Tangere repeatedly shows how unchecked authority harms individuals and communities.", "module"),
  noliFile("N40", "Colonial Inequality", "Theme & context", "CI", "Unequal status under foreign rule · shapes opportunities and justice · affects Filipino characters", "The novel exposes inequalities built into Spanish colonial society.", "module"),
  noliFile("N41", "Discrimination", "Theme & context", "DI", "Unfair treatment based on social identity · experienced by Filipinos · reinforced by colonial hierarchy", "Discrimination is among the social injustices the module says Rizal exposed.", "module"),
  noliFile("N42", "Human Rights", "Theme & context", "HR", "Protection of dignity and freedom · violated by abuse and cruelty · remains relevant today", "The module connects the novel’s suffering characters with continuing questions of human rights.", "module"),
  noliFile("N43", "Patriotism", "Theme & context", "PA", "Love of country joined with responsibility · encouraged through awareness · directed toward national improvement", "The novel links patriotic feeling with understanding social problems and working for the country’s welfare.", "module"),
  noliFile("N44", "Civic Responsibility", "Theme & context", "CR", "Duty to participate in society · requires awareness of public problems · seeks positive change", "The module asks students to connect the novel with responsible participation in community and national life.", "module"),
  noliFile("N45", "Peaceful Reform", "Theme & context", "PR", "Change pursued through knowledge and institutions · reflected in the school project · contrasted with abuse", "Rizal used the novel and Ibarra’s educational project to explore peaceful approaches to reform.", "module"),
  noliFile("N46", "Filipino Nationalism", "Theme & context", "FN", "Growing shared national awareness · strengthened by recognizing injustice · major historical impact of the novel", "Noli Me Tangere helped inspire Filipino nationalism by making colonial problems visible to readers.", "module"),
  noliFile("N47", "Social Awareness", "Theme & context", "SA", "Recognition of society’s problems · goal of the novel · necessary before constructive action", "The module presents social awakening as a central purpose and continuing lesson of Noli Me Tangere.", "module"),
  noliFile("N48", "Literature for Change", "Theme & context", "LC", "Writing used beyond entertainment · exposes injustice · encourages readers to reflect and respond", "Noli Me Tangere demonstrates how literature can question harmful systems and promote social change.", "module"),
  noliFile("N49", "Hope for Reform", "Theme & context", "HF", "Symbolized by Elias in the module · seeks a better society · survives despite severe injustice", "The module interprets Elias as a symbol of hope for reform and social change.", "module"),
  noliFile("N50", "Suffering Motherhood", "Theme & context", "SM", "Embodied by Sisa · shaped by the loss of her sons · represents victimized Filipino families", "Sisa’s story symbolizes suffering motherhood and the human cost of abusive institutions.", "module"),
];
