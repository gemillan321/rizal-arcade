export type ValuesChallenge = {
  id: string;
  scenario: string;
  value: string;
  rationale: string;
  source: string;
  sourceUrl: string;
};

const courseSource = "Rizal Life Module 8: Rizal’s Values and Their Relevance in Modern Society";

function moduleChallenge(
  id: string,
  scenario: string,
  value: string,
  rationale: string,
): ValuesChallenge {
  return { id, scenario, value, rationale, source: courseSource, sourceUrl: "" };
}

export const valuesChallenges: ValuesChallenge[] = [
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
    value: "Education",
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
    value: "Integrity",
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

  moduleChallenge("V09", "A student learns a regional folk song and explains how it contributes to the Philippines’ shared cultural heritage.", "Patriotism", "Patriotism includes valuing the country’s culture and helping others understand why it matters."),
  moduleChallenge("V10", "A youth group buys from local farmers during a community fair and explains how the choice supports Filipino livelihoods.", "Patriotism", "Supporting local communities and connecting personal choices to national welfare is a practical expression of love of country."),
  moduleChallenge("V11", "Before Independence Day, a class studies the meaning of the commemoration instead of treating it only as a holiday.", "Patriotism", "Informed national pride grows from understanding the country’s history, struggles, and achievements."),
  moduleChallenge("V12", "A student respectfully corrects a post that mocks a Philippine language and shares reliable information about its history.", "Patriotism", "Defending Philippine cultural heritage with accurate information reflects informed love of country."),
  moduleChallenge("V13", "After studying Rizal, a learner asks how their future profession could contribute to the Philippines rather than only to personal success.", "Patriotism", "The scenario puts service to the nation alongside personal ambition, which is central to patriotism."),

  moduleChallenge("V14", "A student who struggled with a lesson attends a tutorial, reviews the feedback, and tries a new study method.", "Education", "The action treats learning as a continuing path toward personal growth rather than as a one-time grade."),
  moduleChallenge("V15", "A campus organization converts its research guide into an accessible format so more students can use it.", "Education", "Making knowledge accessible reflects the module’s view of education as a tool for empowering people and society."),
  moduleChallenge("V16", "Instead of copying a summary, a learner reads the assigned source and writes questions about ideas they do not understand.", "Education", "Active reading and inquiry show genuine commitment to learning."),
  moduleChallenge("V17", "An older sibling teaches a younger child how to verify online information rather than simply giving the answers.", "Education", "Teaching someone how to think and learn gives them lasting intellectual independence."),
  moduleChallenge("V18", "After graduation, a student plans to keep developing professional skills and studying social issues.", "Education", "The module identifies dedication to learning as a lifelong value, not something that ends with school."),

  moduleChallenge("V19", "A group discovers that a chart in its presentation contains an error and corrects it before reporting, even though nobody else noticed.", "Integrity", "Correcting a hidden mistake shows honesty and commitment to truth even without external pressure."),
  moduleChallenge("V20", "A student returns extra change accidentally given by the school cashier.", "Integrity", "Choosing what is honest when keeping silent would be easier is a direct expression of integrity."),
  moduleChallenge("V21", "During peer evaluation, a learner reports each member’s contribution fairly instead of favoring close friends.", "Integrity", "Fair and truthful reporting places principle above personal relationships."),
  moduleChallenge("V22", "A researcher clearly labels which ideas came from other authors and provides the proper citations.", "Integrity", "Giving accurate credit protects intellectual honesty and avoids presenting another person’s work as one’s own."),
  moduleChallenge("V23", "When asked about an unfinished task, a class officer admits the delay and gives an accurate update instead of inventing an excuse.", "Integrity", "Owning the truth and accepting responsibility demonstrate integrity."),

  moduleChallenge("V24", "After receiving a low quiz score, a student reviews every mistake and prepares again for the next assessment.", "Perseverance", "Continuing to work after disappointment is the defining action in perseverance."),
  moduleChallenge("V25", "A research team receives several rejected proposals but improves its method and submits a stronger version.", "Perseverance", "The team responds to setbacks with sustained effort and improvement instead of quitting."),
  moduleChallenge("V26", "A learner practices a difficult speech repeatedly until it can be delivered clearly and confidently.", "Perseverance", "Repeated effort toward a difficult goal demonstrates perseverance."),
  moduleChallenge("V27", "Technical problems erase part of a project, so the group reconstructs the missing work and creates a backup system.", "Perseverance", "Recovering from a setback and continuing the task shows perseverance combined with practical learning."),
  moduleChallenge("V28", "A working student follows a realistic study schedule and keeps progressing despite limited time.", "Perseverance", "Steady effort despite difficult circumstances reflects the persistence emphasized in the module."),

  moduleChallenge("V29", "Students notice an unsafe pedestrian crossing near campus and submit a documented proposal to the local government.", "Civic responsibility", "They identify a community problem and participate constructively in seeking a public solution."),
  moduleChallenge("V30", "A learner verifies candidates’ records and platforms before voting in a student election.", "Civic responsibility", "Responsible participation requires informed choices rather than popularity or rumor."),
  moduleChallenge("V31", "A class separates its waste correctly and helps explain the system to new students.", "Civic responsibility", "Caring for a shared environment and helping others participate are forms of responsible citizenship."),
  moduleChallenge("V32", "During a barangay consultation, a student listens to residents, takes notes, and offers a practical youth project.", "Civic responsibility", "Constructive participation in community affairs reflects civic responsibility."),
  moduleChallenge("V33", "A campus journalist reports a student concern accurately and gives the affected office an opportunity to respond.", "Civic responsibility", "Responsible public participation combines accountability, evidence, and fairness."),

  moduleChallenge("V34", "A witness calmly reports repeated bullying even after friends tell them to stay silent.", "Moral courage", "Speaking against wrongdoing despite social pressure requires moral courage."),
  moduleChallenge("V35", "A class representative respectfully challenges a discriminatory rule and proposes an inclusive replacement.", "Moral courage", "The student accepts personal risk in order to defend fairness and human dignity."),
  moduleChallenge("V36", "A team member refuses to alter research results to make the project look more successful.", "Moral courage", "Defending truth when others want a convenient falsehood demonstrates moral courage."),
  moduleChallenge("V37", "When a cruel joke targets a classmate, a student interrupts it and explains why it is harmful.", "Moral courage", "The action confronts harmful behavior instead of remaining comfortably silent."),
  moduleChallenge("V38", "A student leader publicly accepts responsibility for a poor decision and presents a plan to repair the harm.", "Moral courage", "Honest accountability can be difficult; facing it directly requires moral courage."),

  moduleChallenge("V39", "A class organizes notes and recorded explanations for a student recovering from illness.", "Compassion", "The response recognizes another person’s difficulty and provides practical care."),
  moduleChallenge("V40", "During group work, students adjust the task so a member with a disability can participate meaningfully.", "Compassion", "Compassion goes beyond sympathy by removing a barrier and protecting another person’s dignity."),
  moduleChallenge("V41", "A volunteer listens to displaced families before deciding what supplies to collect for them.", "Compassion", "Listening first helps assistance respond to people’s actual needs rather than assumptions."),
  moduleChallenge("V42", "A learner notices a new student eating alone and invites them into a welcoming conversation without pressuring them.", "Compassion", "The action responds sensitively to possible isolation while respecting the other person’s choice."),
  moduleChallenge("V43", "When a classmate misses a deadline because of a family emergency, the group helps reorganize the work fairly.", "Compassion", "A humane response considers real hardship while still addressing the shared responsibility."),

  moduleChallenge("V44", "Students compare accounts from several regions before deciding how to describe a national event.", "Open-mindedness", "Considering perspectives beyond one’s own helps produce a fuller and fairer understanding."),
  moduleChallenge("V45", "During a cultural exchange, a learner asks respectful questions instead of treating unfamiliar customs as inferior.", "Open-mindedness", "Curiosity without prejudice reflects respect for cultural difference."),
  moduleChallenge("V46", "A debate participant revises an opinion after another team presents stronger evidence.", "Open-mindedness", "Being willing to change one’s view in response to evidence is a core form of open-mindedness."),
  moduleChallenge("V47", "A project group invites feedback from students with different courses and experiences before finalizing its solution.", "Open-mindedness", "Seeking varied perspectives reduces blind spots and strengthens decisions."),

  moduleChallenge("V48", "A student follows a study routine and turns off distracting notifications during the scheduled work period.", "Discipline", "Consistently managing attention and habits in service of a goal demonstrates discipline."),
  moduleChallenge("V49", "A varsity player balances training and coursework by planning ahead and honoring both commitments.", "Discipline", "Responsible self-management and consistent follow-through are signs of discipline."),
  moduleChallenge("V50", "A class officer keeps organized records and completes routine duties even when no recognition is offered.", "Discipline", "Doing necessary work consistently without depending on praise reflects disciplined responsibility."),
];
