export type RevolutionThreadRole = "actor" | "pressure" | "move" | "consequence";

export type RevolutionEvidence = {
  id: string;
  text: string;
  role: RevolutionThreadRole | "decoy";
};

export type RevolutionCase = {
  id: string;
  fileNumber: string;
  title: string;
  chapter: string;
  briefing: string;
  chain: [RevolutionEvidence, RevolutionEvidence, RevolutionEvidence, RevolutionEvidence];
  decoys: RevolutionEvidence[];
  explanation: string;
  strategicReading: string;
  source: string;
  sourceUrl: string;
};

const sourceUrl = "https://www.gutenberg.org/files/10676/10676-h/10676-h.htm";

function caseFile(
  id: string,
  fileNumber: string,
  title: string,
  chapter: string,
  briefing: string,
  chain: [string, string, string, string],
  decoys: string[],
  explanation: string,
  strategicReading: string,
): RevolutionCase {
  const roles: RevolutionThreadRole[] = ["actor", "pressure", "move", "consequence"];
  return {
    id,
    fileNumber,
    title,
    chapter,
    briefing,
    chain: chain.map((text, index) => ({ id: `${id}-thread-${index + 1}`, text, role: roles[index] })) as RevolutionCase["chain"],
    decoys: decoys.map((text, index) => ({ id: `${id}-decoy-${index + 1}`, text, role: "decoy" })),
    explanation,
    strategicReading,
    source: `José Rizal, El Filibusterismo / The Reign of Greed, ${chapter}`,
    sourceUrl,
  };
}

export const revolutionCases: RevolutionCase[] = [
  caseFile(
    "EF01", "01", "The Man Behind the Lenses", "Chapters VII and XXXIX",
    "Reconstruct how a former reformer returns inside the colonial elite and turns influence into a weapon.",
    [
      "Simoun moves among officials as a wealthy jeweler and adviser.",
      "He is Crisostomo Ibarra, returned in disguise after thirteen years.",
      "He encourages abuses so that suffering will drive the country toward revolt.",
      "His campaign replaces Ibarra’s earlier reform project with vengeance and forced revolution.",
    ],
    [
      "Basilio intends to avoid politics and complete his medical studies.",
      "The students petition for an academy where Castilian can be taught.",
      "Isagani interrupts the wedding feast to save the people inside.",
      "Padre Florentino throws a chest of jewels into the sea.",
    ],
    "Simoun’s access to the Captain-General is not merely social status. It lets the disguised Ibarra intensify a corrupt system in the hope that desperation will produce an uprising.",
    "Power without a moral limit can reproduce the oppression it claims to fight.",
  ),
  caseFile(
    "EF02", "02", "The Ship of State", "Chapters I and II",
    "Trace the social structure hidden inside the opening journey of the Bapor Tabo.",
    [
      "Officials, friars, and favored passengers occupy the comfortable upper deck.",
      "Filipino and Chinese passengers crowd the lower deck among cargo and merchandise.",
      "The steamer labors around the same bends and sandbars while leaders debate grand remedies.",
      "The divided, stalled vessel becomes an allegory of colonial society and blocked progress.",
    ],
    [
      "Quiroga hides rifles in his warehouse in exchange for Simoun’s influence.",
      "Kabesang Tales patrols the fields that his family cleared.",
      "The wedding lamp begins to lose its light during the feast.",
      "The students celebrate the rejection of their academy with a bitter supper.",
    ],
    "Rizal arranges the passengers vertically: privilege above and labor below. The cumbersome steamer’s failure to advance turns physical movement into political criticism.",
    "A system can advertise progress while its structure keeps most people below deck.",
  ),
  caseFile(
    "EF03", "03", "Land Becomes Rebellion", "Chapters IV and X",
    "Follow the pressure that transforms Kabesang Tales from farmer and legal claimant into an outlaw.",
    [
      "Tales clears difficult land and builds a productive farm through years of family labor.",
      "The friar estate raises the rent, claims the fields, and produces no title deed.",
      "The courts still decide against Tales, while officials strip away his means of defense.",
      "He takes Simoun’s revolver, joins the tulisanes, and becomes Matanglawin.",
    ],
    [
      "Simoun reveals his identity beside the grave of Ibarra’s ancestors.",
      "Makaraig offers his house as the students’ meeting place.",
      "Paulita Gómez chooses Juanito Peláez over Isagani.",
      "Ben-Zayb rewrites the failed lamp plot as a flattering official story.",
    ],
    "The chain begins with productive labor, not criminality. Rent, dispossession, a failed lawsuit, and coercive policing steadily close the legal paths available to Tales.",
    "The novel asks what happens when institutions repeatedly make justice unreachable.",
  ),
  caseFile(
    "EF04", "04", "The Academy Petition", "Chapters XIV, XX, and XXV",
    "Rebuild the students’ campaign for education and the machinery that neutralizes it.",
    [
      "Makaraig, Isagani, and their companions seek an academy for teaching Castilian.",
      "They organize a petition and pursue patrons who claim access to the authorities.",
      "The proposal is delayed, opposed, and handed to Don Custodio for a hollow compromise.",
      "A peaceful reform effort ends in frustration and exposes institutional bad faith.",
    ],
    [
      "Simoun supplies a lamp as a wedding gift to Capitan Tiago’s household.",
      "Juli pawns herself to raise the ransom demanded for her father.",
      "Basilio treats Capitan Tiago while preparing to become a physician.",
      "Padre Florentino receives a wounded fugitive at his seaside home.",
    ],
    "The academy is a concrete student-led reform, but decision-makers keep shifting responsibility until the proposal is emptied of its purpose. The process matters as much as the rejection.",
    "Blocked reform can create political pressure, but frustration alone does not justify every response.",
  ),
  caseFile(
    "EF05", "05", "The Pasquinade Trap", "Chapters XXVI, XXVIII, and XXXII",
    "Identify how anonymous posters turn legal student organizing into evidence of rebellion.",
    [
      "Anonymous pasquinades appear on the university doors after the academy campaign.",
      "Authorities treat the posters as a pretext to suspect the reform-minded students.",
      "Students are arrested; Basilio is jailed despite avoiding the celebration and the posters.",
      "The label of filibusterism converts association and suspicion into punishment.",
    ],
    [
      "The Bapor Tabo runs aground while its upper-deck passengers debate public works.",
      "Tales exchanges Maria Clara’s locket for Simoun’s revolver.",
      "Isagani throws an explosive lamp from the wedding house.",
      "Simoun drinks poison rather than allow the Civil Guard to capture him.",
    ],
    "The posters’ authorship is uncertain, but repression does not wait for proof. Basilio’s imprisonment shows how the category of ‘filibuster’ can be manufactured around a convenient target.",
    "When accusation replaces evidence, institutions can turn dissent into guilt by proximity.",
  ),
  caseFile(
    "EF06", "06", "Juli’s Last Door", "Chapters XXX and XXXII",
    "Handle this file carefully: connect the pressures surrounding Juli without blaming her for the abuse she faces.",
    [
      "Basilio remains imprisoned after better-connected students secure their release.",
      "Juli is told that Padre Camorra’s intervention may be the only way to free him.",
      "At the convento, she leaps from a window rather than submit to Camorra’s abuse.",
      "Her death reveals the human cost of power operating without accountability.",
    ],
    [
      "Paulita and Juanito’s wedding gathers officials in one decorated house.",
      "Quiroga asks Simoun to help him become a consul.",
      "The students propose to teach Castilian in a private academy.",
      "Padre Florentino sinks Simoun’s jewels beyond the reach of future seekers.",
    ],
    "Juli is cornered by unequal power, poverty, and the failure of lawful help. The novel places responsibility on the abusive and complicit system—not on the person trying to escape it.",
    "A responsible reading names coercion clearly and keeps accountability with those who wield power.",
  ),
  caseFile(
    "EF07", "07", "Basilio Crosses the Line", "Chapters XXXIII and XXXIV",
    "Trace why a student who once rejected Simoun’s project finally enters the conspiracy.",
    [
      "Basilio leaves prison to discover that Juli died while trying to secure his freedom.",
      "His hope for a medical career and peaceful future collapses into grief and anger.",
      "He seeks Simoun, asks for a weapon, and declares himself ready for revolution.",
      "Private loss becomes fuel for a political act he had previously refused.",
    ],
    [
      "Isagani argues that language can connect Filipinos to public life.",
      "The Captain-General consults Simoun about public appointments and favors.",
      "Tales is kidnapped by outlaws who demand a ransom from his family.",
      "A mysterious parchment at the feast bears Ibarra’s name.",
    ],
    "Basilio initially chooses education and personal advancement over conspiracy. His reversal follows imprisonment and Juli’s death, making radicalization a chain of losses rather than a fixed trait.",
    "Strategy must account for grief and injustice without treating suffering as permission for indiscriminate harm.",
  ),
  caseFile(
    "EF08", "08", "The Warehouse Network", "Chapter XVI",
    "Expose how ambition, debt, and patronage turn a merchant’s warehouse into part of Simoun’s network.",
    [
      "Quiroga wants official recognition and asks Simoun to help him obtain a consulship.",
      "Simoun uses the merchant’s debts and political ambition as leverage.",
      "Cases of rifles are secretly stored in Quiroga’s warehouse.",
      "A favor-trading relationship becomes logistical cover for the planned uprising.",
    ],
    [
      "Basilio studies medicine while living under Capitan Tiago’s protection.",
      "Padre Camorra turns a student petition into a university investigation.",
      "The upper deck of the steamer holds passengers close to colonial power.",
      "Isagani dives into the river after removing the lamp from the feast.",
    ],
    "Quiroga’s warehouse shows that the conspiracy depends on ordinary systems of commerce and patronage. Simoun recruits infrastructure by exploiting aspirations already tied to colonial power.",
    "Networks are built through leverage; tracing who benefits reveals where power can hide.",
  ),
  caseFile(
    "EF09", "09", "The Lamp at the Feast", "Chapters XXXIV and XXXV",
    "Assemble the mechanism that turns a society wedding into Simoun’s intended signal for revolt.",
    [
      "Paulita Gómez and Juanito Peláez’s wedding gathers officials, friars, and social elites.",
      "Simoun sends an ornate lamp as the centerpiece of the feast.",
      "The lamp conceals explosives designed to ignite when its weakening light is adjusted.",
      "The planned blast is meant to remove leaders and trigger an armed uprising outside.",
    ],
    [
      "The students ask Señor Pasta to support their language academy.",
      "Kabesang Tales loses a lawsuit over land his family developed.",
      "Capitan Tiago’s death leaves Basilio without his expected inheritance.",
      "Padre Florentino questions whether freedom can be founded on crime and hatred.",
    ],
    "The lamp is both object and strategy: spectacle hides violence, the gathered elite concentrates targets, and armed groups are expected to act once the explosion creates chaos.",
    "The elegance of a plan does not resolve the moral cost imposed on people who never chose it.",
  ),
  caseFile(
    "EF10", "10", "Isagani Breaks the Fuse", "Chapter XXXV",
    "Recover the seconds in which a warning, a personal bond, and a decisive act prevent the feast from becoming a massacre.",
    [
      "Basilio warns Isagani to leave the area because the wedding house is in danger.",
      "Isagani realizes that Paulita is among the people inside the feast.",
      "He rushes in, seizes the fading lamp, and throws it into the river.",
      "The explosion and Simoun’s immediate uprising are prevented.",
    ],
    [
      "Makaraig hosts the students who are organizing the academy petition.",
      "Simoun encourages the Captain-General to deepen corruption and abuse.",
      "Tandang Selo loses his speech as calamities overtake his family.",
      "Quiroga accepts hidden rifles in exchange for promised influence.",
    ],
    "Isagani does not dismantle the wider colonial system, but his intervention changes the immediate course of the plot. One informed action saves both targets and bystanders.",
    "Refusing indiscriminate violence is itself a consequential political choice.",
  ),
  caseFile(
    "EF11", "11", "The Failed Architect", "Chapters XXXVIII and XXXIX",
    "Complete Simoun’s final chain from hunted conspirator to confession at Padre Florentino’s home.",
    [
      "The failed plot leaves Simoun wounded, exposed, and pursued by the Civil Guard.",
      "At Padre Florentino’s house, he takes poison rather than be captured alive.",
      "He confesses his identity, accumulated wealth, and attempt to force a revolution.",
      "Padre Florentino challenges the vengeance and corrupt means before Simoun dies.",
    ],
    [
      "The lower deck of the Bapor Tabo carries passengers beside cargo.",
      "Basilio refuses Simoun’s first invitation and returns to his studies.",
      "Paulita chooses the fashionable Juanito as her husband.",
      "The university posters are blamed on students seeking lawful reform.",
    ],
    "The confession makes the revolutionary strategist answer for his design. Padre Florentino condemns oppression but also rejects liberation pursued through manipulation, corruption, and mass killing.",
    "A just end cannot make every method just; means shape the freedom they claim to create.",
  ),
  caseFile(
    "EF12", "12", "Treasure for Another Dawn", "Chapter XXXIX",
    "Trace the novel’s final image and decide what kind of future its hidden wealth is asked to await.",
    [
      "After Simoun’s death, Padre Florentino opens the steel chest left behind.",
      "Inside are jewels and wealth assembled to finance influence and revolution.",
      "The priest carries the chest to the cliff and hurls it into the Pacific.",
      "The ending reserves such power for a future cause grounded in justice and sacrifice.",
    ],
    [
      "Basilio agrees to coordinate Simoun’s armed groups around the city.",
      "Don Custodio reshapes the academy petition into an impractical proposal.",
      "The friar estate demands rising rent from Kabesang Tales.",
      "The lamp’s fading light is the signal that its mechanism is near ignition.",
    ],
    "Padre Florentino refuses to let Simoun’s fortune simply pass to another ambitious claimant. His final appeal imagines freedom as something earned by courage, justice, and self-giving.",
    "National awakening is not only resistance to oppression; it is preparation to use power responsibly.",
  ),
];

export const revolutionRoleLabels: Array<{ role: RevolutionThreadRole; label: string; prompt: string }> = [
  { role: "actor", label: "I · Position", prompt: "Where the chain begins" },
  { role: "pressure", label: "II · Pressure", prompt: "What changes the stakes" },
  { role: "move", label: "III · Move", prompt: "The decisive action" },
  { role: "consequence", label: "IV · Consequence", prompt: "What the action produces" },
];
