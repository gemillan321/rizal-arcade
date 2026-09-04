export type DapitanTask = "timeline" | "evidence" | "theme";

export type DapitanChallenge = {
  id: string;
  task: DapitanTask;
  prompt: string;
  answer: string;
  explanation: string;
  source: string;
  sourceUrl: string;
};

export const TIMELINE_OPTIONS = [
  "Road to Exile",
  "Life in Dapitan",
  "Trial and Imprisonment",
  "Martyrdom and Legacy",
] as const;

export const EVIDENCE_OPTIONS = [
  "Supported",
  "Debated",
  "Contradicted by the Module",
] as const;

export const THEME_OPTIONS = [
  "Reform",
  "Education",
  "Nationhood",
  "Civic Responsibility",
  "Justice",
] as const;

const MODULE_SOURCE =
  "RizLife Module 6 — Rizal's Persecution, Entrapment, Exile, Trial, Execution, and Legacy";

export const dapitanChallenges: DapitanChallenge[] = [
  {
    id: "dapitan-001",
    task: "timeline",
    prompt: "José Rizal established La Liga Filipina in 1892.",
    answer: "Road to Exile",
    explanation:
      "The module places the establishment of La Liga Filipina among the events leading to Rizal's exile.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-002",
    task: "timeline",
    prompt: "Spanish authorities exiled Rizal to Dapitan.",
    answer: "Road to Exile",
    explanation:
      "Rizal's exile to Dapitan is one of the central events in the module's Road to Exile section.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-003",
    task: "timeline",
    prompt: "Rizal worked as a physician and community leader.",
    answer: "Life in Dapitan",
    explanation:
      "The module describes Rizal's work during exile as that of a physician and community leader.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-004",
    task: "timeline",
    prompt: "Rizal established a school for local children.",
    answer: "Life in Dapitan",
    explanation:
      "The school for local children is presented as one of Rizal's productive activities during his exile.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-005",
    task: "timeline",
    prompt: "Rizal participated in agricultural projects.",
    answer: "Life in Dapitan",
    explanation:
      "Agricultural projects are identified in the module as part of Rizal's activities in Dapitan.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-006",
    task: "timeline",
    prompt: "Josephine Bracken became Rizal's companion during his exile.",
    answer: "Life in Dapitan",
    explanation:
      "The module identifies Josephine Bracken as Rizal's companion during his Dapitan exile.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-007",
    task: "timeline",
    prompt: "Rizal was tried by a military court.",
    answer: "Trial and Imprisonment",
    explanation:
      "The module states that Rizal's trial was conducted by a military court.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-008",
    task: "timeline",
    prompt: "Rizal was imprisoned at Fort Santiago before his execution.",
    answer: "Trial and Imprisonment",
    explanation:
      "Fort Santiago is identified by the module as Rizal's place of imprisonment before execution.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-009",
    task: "timeline",
    prompt: "Rizal reportedly wrote Mi Último Adiós during his final hours.",
    answer: "Trial and Imprisonment",
    explanation:
      "The module places Mi Último Adiós among the events connected with Rizal's final hours.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-010",
    task: "timeline",
    prompt: "Rizal was executed on December 30, 1896.",
    answer: "Martyrdom and Legacy",
    explanation:
      "The module gives December 30, 1896 as the date of Rizal's execution.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },

  {
    id: "dapitan-011",
    task: "evidence",
    prompt:
      "La Liga Filipina promoted social unity and peaceful reforms.",
    answer: "Supported",
    explanation:
      "The module identifies social unity and peaceful reform as the primary aim of La Liga Filipina.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-012",
    task: "evidence",
    prompt:
      "Rizal spent his exile in Dapitan idle and inactive in the community.",
    answer: "Contradicted by the Module",
    explanation:
      "The module describes Rizal's Dapitan life as productive and dedicated to community service.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-013",
    task: "evidence",
    prompt:
      "Rizal led military attacks while he was living in Dapitan.",
    answer: "Contradicted by the Module",
    explanation:
      "The module instead describes his Dapitan activities as community service, education, medicine, and agriculture.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-014",
    task: "evidence",
    prompt:
      "Rizal's alleged retraction remains debated among historians.",
    answer: "Debated",
    explanation:
      "The course material explicitly identifies Rizal's alleged retraction as a debated historical issue.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-015",
    task: "evidence",
    prompt:
      "Rizal was tried by a civil court.",
    answer: "Contradicted by the Module",
    explanation:
      "The module identifies a military court, not a civil court, as the court that tried Rizal.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-016",
    task: "evidence",
    prompt:
      "The module identifies Fort Santiago as Rizal's place of imprisonment before his execution.",
    answer: "Supported",
    explanation:
      "Fort Santiago is explicitly identified in the module as his place of imprisonment.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-017",
    task: "evidence",
    prompt:
      "Rizal was executed in Luneta, Manila.",
    answer: "Supported",
    explanation:
      "The module identifies Luneta, Manila as the site of Rizal's execution.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-018",
    task: "evidence",
    prompt:
      "Rizal's execution reduced Filipino nationalist sentiment.",
    answer: "Contradicted by the Module",
    explanation:
      "The module states that Rizal's execution strengthened Filipino nationalism.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-019",
    task: "evidence",
    prompt:
      "Rizal's death helped strengthen Filipino nationalism.",
    answer: "Supported",
    explanation:
      "The module presents strengthened nationalism as a major effect of Rizal's execution.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-020",
    task: "evidence",
    prompt:
      "Rizal advocated peaceful reform rather than violent revolution.",
    answer: "Supported",
    explanation:
      "The module describes Rizal as an advocate of peaceful reforms even though colonial authorities regarded him as a threat.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },

  {
    id: "dapitan-021",
    task: "theme",
    prompt: "Equal rights for Filipinos",
    answer: "Reform",
    explanation:
      "The module's theme-matching activity connects equal rights for Filipinos with Reform.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-022",
    task: "theme",
    prompt: "Importance of learning",
    answer: "Education",
    explanation:
      "The module connects the importance of learning with Education.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-023",
    task: "theme",
    prompt: "Love of country",
    answer: "Nationhood",
    explanation:
      "The module connects love of country with Nationhood.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-024",
    task: "theme",
    prompt: "Active participation in society",
    answer: "Civic Responsibility",
    explanation:
      "The module connects active participation in society with Civic Responsibility.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-025",
    task: "theme",
    prompt: "Fair treatment under the law",
    answer: "Justice",
    explanation:
      "The module connects fair treatment under the law with Justice.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
    {
    id: "dapitan-026",
    task: "timeline",
    prompt: "Rizal's community projects demonstrated his commitment to public service and education.",
    answer: "Life in Dapitan",
    explanation:
      "The module presents Rizal's Dapitan community projects as evidence of his commitment to public service and education.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-027",
    task: "timeline",
    prompt: "Spanish authorities accused Rizal of encouraging rebellion against Spain.",
    answer: "Trial and Imprisonment",
    explanation:
      "The accusation of encouraging rebellion belongs to the events surrounding Rizal's arrest and trial.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-028",
    task: "timeline",
    prompt: "The issue of Rizal's alleged retraction became part of the historical discussion surrounding his final days.",
    answer: "Trial and Imprisonment",
    explanation:
      "The module discusses the alleged retraction in connection with Rizal's imprisonment and final days.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-029",
    task: "timeline",
    prompt: "Rizal's martyrdom became a national symbol after his execution.",
    answer: "Martyrdom and Legacy",
    explanation:
      "The module explains that Rizal's execution transformed him into a national symbol.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-030",
    task: "timeline",
    prompt: "Rizal's death influenced the Philippine Revolution and the growth of nationalism.",
    answer: "Martyrdom and Legacy",
    explanation:
      "The lesson connects Rizal's execution with stronger Filipino nationalism and revolutionary sentiment.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },

  {
    id: "dapitan-031",
    task: "evidence",
    prompt: "Rizal founded the Katipunan in 1892.",
    answer: "Contradicted by the Module",
    explanation:
      "The module identifies La Liga Filipina, not the Katipunan, as the organization established by Rizal in 1892.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-032",
    task: "evidence",
    prompt: "The primary aim of La Liga Filipina was social unity and peaceful reform.",
    answer: "Supported",
    explanation:
      "The module explicitly describes social unity and peaceful reforms as the organization's primary aim.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-033",
    task: "evidence",
    prompt: "Spanish authorities considered Rizal's writings and reform activities dangerous.",
    answer: "Supported",
    explanation:
      "The module explains that Spanish authorities viewed Rizal's writings and reform work as a threat.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-034",
    task: "evidence",
    prompt: "Rizal established a military academy while exiled in Dapitan.",
    answer: "Contradicted by the Module",
    explanation:
      "The module identifies a school for local children, not a military academy, among Rizal's Dapitan projects.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-035",
    task: "evidence",
    prompt: "Rizal's life in Dapitan included community service.",
    answer: "Supported",
    explanation:
      "The module describes his exile as productive and dedicated to community service.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-036",
    task: "evidence",
    prompt: "Josephine Bracken was Rizal's companion during his exile in Dapitan.",
    answer: "Supported",
    explanation:
      "Josephine Bracken is explicitly identified as Rizal's companion during his exile.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-037",
    task: "evidence",
    prompt: "Rizal focused mainly on colonial administration while living in Dapitan.",
    answer: "Contradicted by the Module",
    explanation:
      "The module instead emphasizes medicine, education, agriculture, and community service.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-038",
    task: "evidence",
    prompt: "Rizal was accused of encouraging rebellion against Spain.",
    answer: "Supported",
    explanation:
      "The module identifies encouraging rebellion against Spain as the accusation brought against Rizal.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-039",
    task: "evidence",
    prompt: "Historians universally agree on the truth of Rizal's alleged retraction.",
    answer: "Contradicted by the Module",
    explanation:
      "The module explicitly presents the alleged retraction as an issue that remains debated among historians.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-040",
    task: "evidence",
    prompt: "Mi Último Adiós is connected with Rizal's final hours.",
    answer: "Supported",
    explanation:
      "The module identifies Mi Último Adiós as the poem Rizal reportedly wrote during his final hours.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-041",
    task: "evidence",
    prompt: "Rizal was executed on December 30, 1898.",
    answer: "Contradicted by the Module",
    explanation:
      "The course material gives December 30, 1896 as the date of Rizal's execution.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-042",
    task: "evidence",
    prompt: "The module identifies Luneta, Manila as Rizal's place of execution.",
    answer: "Supported",
    explanation:
      "Luneta, Manila is the execution site identified in the course material.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-043",
    task: "evidence",
    prompt: "Rizal's martyrdom ended Filipino interest in reform and nationalism.",
    answer: "Contradicted by the Module",
    explanation:
      "The module instead states that his execution strengthened Filipino nationalism.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-044",
    task: "evidence",
    prompt: "Rizal's advocacy for education is presented as a path toward national progress.",
    answer: "Supported",
    explanation:
      "The module explicitly connects Rizal's advocacy for education with national progress.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-045",
    task: "evidence",
    prompt: "Rizal's final years are presented only as a story of imprisonment and contain no examples of public service.",
    answer: "Contradicted by the Module",
    explanation:
      "His productive years in Dapitan include medicine, education, agriculture, and community projects.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },

  {
    id: "dapitan-046",
    task: "theme",
    prompt: "Working toward equal rights through peaceful social change",
    answer: "Reform",
    explanation:
      "The module associates equal rights for Filipinos with the theme of Reform.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-047",
    task: "theme",
    prompt: "Using learning as a path toward national progress",
    answer: "Education",
    explanation:
      "Education is presented in the module as an important path toward national progress.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-048",
    task: "theme",
    prompt: "Patriotism and love for the Filipino nation",
    answer: "Nationhood",
    explanation:
      "The module's theme activity connects love of country with Nationhood.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-049",
    task: "theme",
    prompt: "Serving communities and taking an active role in society",
    answer: "Civic Responsibility",
    explanation:
      "Active participation in society is identified as Civic Responsibility.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
  {
    id: "dapitan-050",
    task: "theme",
    prompt: "Protecting people's right to fair treatment under the law",
    answer: "Justice",
    explanation:
      "The module's theme activity connects fair treatment under the law with Justice.",
    source: MODULE_SOURCE,
    sourceUrl: "",
  },
];