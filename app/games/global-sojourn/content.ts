export type GlobalDestinationId = "barcelona" | "madrid" | "paris" | "heidelberg" | "berlin" | "litomerice" | "yokohama" | "london" | "brussels" | "biarritz" | "ghent" | "hong-kong";

export type GlobalDestination = { id: GlobalDestinationId; place: string; shortPlace: string; region: string; stamp: string };
export type GlobalSojournChallenge = {
  id: string;
  destinationId: GlobalDestinationId;
  period: string;
  mission: string;
  evidence: [string, string, string];
  explanation: string;
  source: string;
  sourceUrl: string;
};

export const globalDestinations: GlobalDestination[] = [
  { id: "barcelona", place: "Barcelona, Spain", shortPlace: "Barcelona", region: "Spain", stamp: "BCN" },
  { id: "madrid", place: "Madrid, Spain", shortPlace: "Madrid", region: "Spain", stamp: "MAD" },
  { id: "paris", place: "Paris, France", shortPlace: "Paris", region: "France", stamp: "PAR" },
  { id: "heidelberg", place: "Heidelberg, Germany", shortPlace: "Heidelberg", region: "Germany", stamp: "HD" },
  { id: "berlin", place: "Berlin, Germany", shortPlace: "Berlin", region: "Germany", stamp: "BER" },
  { id: "litomerice", place: "Litoměřice, Czech lands", shortPlace: "Litoměřice", region: "Czech lands", stamp: "LTM" },
  { id: "yokohama", place: "Yokohama, Japan", shortPlace: "Yokohama", region: "Japan", stamp: "YOK" },
  { id: "london", place: "London, United Kingdom", shortPlace: "London", region: "United Kingdom", stamp: "LON" },
  { id: "brussels", place: "Brussels, Belgium", shortPlace: "Brussels", region: "Belgium", stamp: "BRU" },
  { id: "biarritz", place: "Biarritz, France", shortPlace: "Biarritz", region: "France", stamp: "BIA" },
  { id: "ghent", place: "Ghent, Belgium", shortPlace: "Ghent", region: "Belgium", stamp: "GNT" },
  { id: "hong-kong", place: "Hong Kong", shortPlace: "Hong Kong", region: "East Asia", stamp: "HKG" },
];

export const globalDestinationsById = Object.fromEntries(globalDestinations.map((destination) => [destination.id, destination])) as Record<GlobalDestinationId, GlobalDestination>;

type RawChallenge = [string, GlobalDestinationId, string, string, string, string, string, string];
const rawChallenges: RawChallenge[] = [
  ["GS01", "barcelona", "1882", "File Rizal’s first patriotic essay written on Spanish soil.", "The article was titled Amor Patrio or Love of Country.", "It appeared in the bilingual newspaper Diariong Tagalog.", "Rizal used the pen name Laong Laan for the piece.", "Barcelona was Rizal’s first important Spanish stop and the place associated with Amor Patrio."],
  ["GS02", "barcelona", "June 1882", "Trace the opening station of Rizal’s European reform journey.", "This Mediterranean port was his first major Spanish destination.", "A Filipino community welcomed the newly arrived student-traveler.", "His early writing abroad quickly turned toward patriotism.", "Rizal began his European sojourn in Barcelona before moving inland to continue his studies."],
  ["GS03", "barcelona", "1882", "Locate the newsroom connected with Laong Laan’s early article.", "The clue points to Diariong Tagalog rather than La Solidaridad.", "The subject was love of the native land.", "The city lies on Spain’s Mediterranean coast.", "Diariong Tagalog, Amor Patrio, and Rizal’s first months in Spain identify Barcelona."],
  ["GS04", "barcelona", "1882", "Stamp the city where travel first became public advocacy.", "The voyage from Manila had just ended in Europe.", "The writer adopted a pseudonym for a nationalistic article.", "Madrid would become the next major academic station.", "Barcelona marks Rizal’s transition from secret departure to visible patriotic writing abroad."],
  ["GS05", "madrid", "1882–1885", "File the capital where Rizal pursued two university programs.", "He studied at the Universidad Central de Madrid.", "One program was Medicine.", "The other was Philosophy and Letters.", "Madrid became Rizal’s main academic base in Spain."],
  ["GS06", "madrid", "1884", "Locate the banquet speech honoring two Filipino painters.", "The honorees were Juan Luna and Félix Resurrección Hidalgo.", "Their prizes were treated as evidence of Filipino ability.", "Rizal challenged racial prejudice before a Spanish audience.", "Rizal delivered his celebrated toast to Luna and Hidalgo at a Madrid banquet."],
  ["GS07", "madrid", "1889–1890", "Trace the center of the Filipino reform campaign in Spain.", "Reformists debated representation and equal rights.", "La Solidaridad carried their arguments.", "Rizal sometimes differed with Marcelo H. del Pilar over strategy.", "Madrid was a major organizing center of the Propaganda Movement."],
  ["GS08", "madrid", "1882–1885", "Place the dossier about Rizal’s intellectual formation in Spain.", "Liberal and democratic ideas shaped his outlook.", "He observed Spanish political life at close range.", "Education became a tool for peaceful reform.", "Rizal’s Madrid years joined formal education with growing political awareness."],
  ["GS09", "madrid", "1884", "Find the city behind a speech connecting art and national dignity.", "Spoliarium had won recognition in Europe.", "The speech praised Filipino genius, not colonial hierarchy.", "The audience gathered in the Spanish capital.", "The Madrid art banquet converted cultural achievement into an argument for Filipino dignity."],
  ["GS10", "paris", "1885–1886", "Route the file to Rizal’s first major ophthalmic apprenticeship.", "He worked with the eye specialist Louis de Wecker.", "His goal was to improve treatment for his mother’s sight.", "The clinic was in the French capital.", "Paris gave Rizal advanced ophthalmology training under Louis de Wecker."],
  ["GS11", "paris", "1885", "Locate the studio where Rizal supported Filipino artists.", "Juan Luna was completing major paintings in this city.", "Rizal modeled for figures in Luna’s work.", "The expatriate circle mixed art and reform.", "In Paris, Rizal moved within Juan Luna’s artistic circle while studying medicine."],
  ["GS12", "paris", "1889", "File the club formed during an international exposition.", "The Exposition Universelle drew visitors from around the world.", "Rizal helped organize the Kidlat Club.", "The group later celebrated Filipino skill as the Indios Bravos.", "The 1889 Paris Exposition provided a setting for Rizal’s cultural nationalism."],
  ["GS13", "paris", "1890", "Trace the publication of Rizal’s annotated historical study.", "The base text was Antonio de Morga’s Sucesos.", "The annotations argued for precolonial Filipino civilization.", "The edition was issued in the French capital.", "Rizal’s annotated Morga was published in Paris to restore Filipino historical dignity."],
  ["GS14", "heidelberg", "1886", "Locate the university eye clinic connected with Otto Becker.", "Rizal continued specialized ophthalmology training.", "The city stands on the Neckar River.", "It later commemorated his literary presence.", "Professor Otto Becker and the university eye clinic identify Heidelberg."],
  ["GS15", "heidelberg", "1886", "Route a poem addressed to spring flowers.", "The poem is known as A las flores de Heidelberg.", "Its flowers awakened memories of the Philippines.", "Homesickness became patriotic reflection.", "Rizal composed A las flores de Heidelberg in the German university city."],
  ["GS16", "heidelberg", "February–August 1886", "Stamp the German station where medicine met literature.", "Rizal lived near a historic university.", "He trained in diseases of the eye.", "The Neckar landscape inspired a travel poem.", "The medical and literary clues converge on Heidelberg."],
  ["GS17", "heidelberg", "1886", "Find the city linked with nearby Wilhelmsfeld and Pastor Ullmer.", "Rizal improved his German through daily family life.", "Wilhelmsfeld lies near this university city.", "The stay offered quiet study outside the clinic.", "Rizal’s Heidelberg period included time with Pastor Karl Ullmer’s family."],
  ["GS18", "berlin", "1887", "Locate the printing city of Noli Me Tangere.", "The novel exposed abuses in colonial Philippine society.", "Máximo Viola helped finance its printing.", "The book appeared in Germany, not Spain.", "Noli Me Tangere was printed in Berlin with crucial help from Máximo Viola."],
  ["GS19", "berlin", "1886–1887", "File Rizal’s participation in German scholarly societies.", "He presented Philippine knowledge to European scholars.", "Anthropology and ethnology interested him.", "Rudolf Virchow belonged to the city’s scientific network.", "Berlin connected Rizal with scientific circles while he completed his novel."],
  ["GS20", "berlin", "1887", "Trace the emergency loan that saved a novel from delay.", "The manuscript was already complete.", "Printing stopped because Rizal lacked money.", "Máximo Viola’s assistance allowed work to continue.", "The funding crisis identifies the Berlin printing of Noli Me Tangere."],
  ["GS21", "berlin", "1886–1887", "Place a dossier combining hardship, scholarship, and publication.", "Rizal endured a severe European winter.", "He studied German society and science.", "His first novel finally left the press here.", "Berlin was both a difficult personal period and a major intellectual victory."],
  ["GS22", "litomerice", "1887", "Locate Rizal’s meeting with Ferdinand Blumentritt.", "Years of correspondence preceded their first meeting.", "Blumentritt was an Austrian scholar and loyal friend.", "The host city was then called Leitmeritz in German.", "Rizal met Ferdinand Blumentritt in Litoměřice during his 1887 tour."],
  ["GS23", "litomerice", "1887", "Route the friendship dossier marked Leitmeritz.", "The destination is in today’s Czech Republic.", "Blumentritt welcomed Rizal and Viola.", "Their intellectual friendship crossed national borders.", "Leitmeritz is the historical German name of Litoměřice."],
  ["GS24", "litomerice", "May 1887", "Stamp the city where letters became an in-person alliance.", "The two men had discussed Philippine society by mail.", "The scholar-host defended Filipino dignity in Europe.", "Rizal’s visit strengthened a lifelong friendship.", "The Litoměřice meeting turned correspondence into a personal alliance."],
  ["GS25", "litomerice", "1887", "Find the stop defined by Blumentritt rather than a university or press.", "This was not the site of either novel’s printing.", "The key figure was a school director and Philippines scholar.", "The stop followed Rizal’s Berlin publication.", "Blumentritt is the decisive clue for Litoměřice."],
  ["GS26", "yokohama", "Spring 1888", "Locate Rizal’s six-week Japanese stay.", "The port lies about forty kilometers south of Tokyo.", "He was traveling onward through the United States.", "Usui Seiko introduced him to Japanese culture.", "UP identifies Yokohama as the setting of Rizal’s six-week Japanese stay."],
  ["GS27", "yokohama", "1888", "Route the cultural dossier associated with O-Sei-San.", "Her documented name was Usui Seiko.", "She and Rizal conversed in French during walks.", "She introduced the visiting reformist to Japanese life.", "Usui Seiko met Rizal during his stay in Yokohama."],
  ["GS28", "yokohama", "1888", "Stamp the East Asian port before Rizal crossed the Pacific.", "The next long leg led toward San Francisco.", "The stay deepened his admiration for Japanese culture.", "The destination was a major international harbor.", "Yokohama was Rizal’s port before his trans-Pacific voyage."],
  ["GS29", "yokohama", "1888", "Find the destination joining travel, language, and affection.", "Rizal studied local customs instead of remaining isolated.", "A former samurai’s daughter became his guide.", "The visit lasted only several weeks.", "The cultural and personal clues point to Rizal’s Yokohama stay."],
  ["GS30", "london", "1888–1889", "Locate Rizal’s research base for Morga’s Sucesos.", "He consulted a rare 1609 historical work.", "The reading room belonged to the British Museum.", "His annotations challenged colonial claims about Filipino culture.", "London gave Rizal access to the Morga copy used for his annotations."],
  ["GS31", "london", "1888–1889", "Route the file connected with Reinhold Rost.", "Rost was a linguist and librarian-scholar.", "He supported Rizal’s historical research.", "Their work centered on a major British collection.", "Reinhold Rost and the British Museum identify Rizal’s London period."],
  ["GS32", "london", "1888–1889", "Stamp the city where Rizal stayed with the Beckett family.", "He lived in the Primrose Hill area.", "Gertrude Beckett became attached to the Filipino lodger.", "Research, not university enrollment, drove the stay.", "Rizal lodged with the Beckett family while researching in London."],
  ["GS33", "london", "1889", "Find the archive station used to defend precolonial achievement.", "The project was annotation rather than a new novel.", "The source author was Antonio de Morga.", "The goal was to correct colonial historical claims.", "The Morga project places this dossier in London."],
  ["GS34", "brussels", "1890", "Locate Rizal’s less expensive base while drafting El Filibusterismo.", "He moved away from costly Paris.", "The darker sequel demanded sustained writing time.", "The city was active in reform correspondence.", "Rizal moved to Brussels partly for lower living costs while writing El Fili."],
  ["GS35", "brussels", "1890", "Route the dossier mixing reform journalism and a novel in progress.", "La Solidaridad still carried reform arguments.", "Rizal’s second novel was not yet ready for the press.", "The Belgian capital offered a working base.", "In Brussels, Rizal balanced reform writing with the El Fili manuscript."],
  ["GS36", "brussels", "1890", "Stamp the Belgian city before the Biarritz retreat.", "The manuscript would later be completed in France.", "Printing would later move to Ghent.", "This earlier station was the Belgian capital.", "Brussels came before Biarritz and Ghent in El Fili’s final creation."],
  ["GS37", "brussels", "1890", "Find the city linked with the Jacoby household.", "Rizal rented modest lodging while controlling expenses.", "Suzanne Jacoby belonged to the remembered household.", "His main task was the sequel to Noli.", "The Jacoby household clue identifies Rizal’s Brussels residence."],
  ["GS38", "biarritz", "1891", "Locate the French retreat where the El Fili manuscript was completed.", "Rizal stayed with the Boustead family.", "The residence was Villa Eliada.", "The finished manuscript still needed a printer.", "Rizal completed the El Filibusterismo manuscript in Biarritz."],
  ["GS39", "biarritz", "March 1891", "Route the final-writing station rather than the printing station.", "The destination was a resort on France’s Atlantic coast.", "Nellie Boustead was part of Rizal’s circle there.", "Ghent would come later for presswork.", "Biarritz was the completion site; Ghent was the printing site."],
  ["GS40", "biarritz", "1891", "Stamp the Boustead family’s coastal destination.", "The visit offered distance from Madrid disputes.", "Rizal concentrated on finishing his second novel.", "The place was French, not Belgian.", "The Boustead family connection and the French coast identify Biarritz."],
  ["GS41", "biarritz", "1891", "Find the quiet stop between Brussels drafting and Ghent printing.", "The manuscript entered its final form here.", "The setting was a family villa near the sea.", "The next obstacle would be publication cost.", "Biarritz bridges the Brussels drafting and Ghent printing periods."],
  ["GS42", "ghent", "1891", "Locate the printing city of El Filibusterismo.", "The printer was F. Meyer-Van Loo.", "Rizal chose the city partly because printing cost less.", "The novel appeared in September 1891.", "El Filibusterismo was printed in Ghent after Rizal sought lower production costs."],
  ["GS43", "ghent", "1891", "Route Valentin Ventura’s financial rescue.", "Printing stopped before all copies were completed.", "Ventura sent money to continue production.", "The book was the sequel to Noli Me Tangere.", "Ventura’s help enabled Rizal to finish printing El Fili in Ghent."],
  ["GS44", "ghent", "September 1891", "Stamp the Belgian press that produced Rizal’s second novel.", "This was not the earlier Brussels drafting base.", "F. Meyer-Van Loo handled the printing.", "The finished work was dedicated to GOMBURZA.", "The printer and publication date identify Ghent."],
  ["GS45", "ghent", "1891", "Find the destination where economy shaped publication strategy.", "Rizal searched for affordable European printing.", "Financial strain nearly ended production.", "A friend’s remittance preserved the project.", "Ghent’s cheaper printing made it El Fili’s production station."],
  ["GS46", "hong-kong", "1891–1892", "Locate Rizal’s ophthalmic clinic and family reunion.", "Relatives escaping pressure in Calamba joined him.", "He practiced as an eye specialist.", "The British colony offered an Asian base.", "In Hong Kong, Rizal reunited with family and established a clinic."],
  ["GS47", "hong-kong", "1892", "Route the proposed agricultural colony in North Borneo.", "The planned settlement was connected with Sandakan.", "It aimed to relocate persecuted Filipino families.", "Rizal negotiated the idea from an Asian port.", "Rizal developed the North Borneo settlement proposal from Hong Kong."],
  ["GS48", "hong-kong", "1892", "Stamp the drafting place of La Liga Filipina’s constitution.", "The organization promoted unity and mutual aid.", "Rizal would launch it after returning to Manila.", "The document was prepared before that homecoming.", "Rizal drafted La Liga Filipina’s constitution while in Hong Kong."],
  ["GS49", "hong-kong", "1891–1892", "Find the Asian station combining medicine and civic planning.", "Ophthalmology supported Rizal and his family.", "The Sandakan proposal addressed displaced tenants.", "A reform organization’s constitution was prepared.", "Clinic, Borneo plan, and La Liga preparation identify Hong Kong."],
  ["GS50", "madrid", "1880s", "Locate the arena of the assimilation debate.", "Reformers sought representation in the Spanish Cortes.", "They demanded equal treatment under Spanish law.", "Rizal later recognized this strategy’s limits.", "The course module’s assimilation debate centered on the reform campaign in Madrid."],
];

function sourceFor(destinationId: GlobalDestinationId): Pick<GlobalSojournChallenge, "source" | "sourceUrl"> {
  if (destinationId === "yokohama") return { source: "University of the Philippines, Ilustrados Enamorados del Japón", sourceUrl: "https://up.edu.ph/ilustrados-enamorados-del-japon/" };
  if (["heidelberg", "berlin", "litomerice", "london"].includes(destinationId)) return { source: "Heidelberg University, Hero of the Nation and Citizen of the World", sourceUrl: "https://books.ub.uni-heidelberg.de/heibooks/catalog/book/1635" };
  if (destinationId === "hong-kong") return { source: "NHCP José Rizal registry and Instructor Module 5", sourceUrl: "https://philhistoricsites.nhcp.gov.ph/registry_database/jose-protacio-rizal-1861-1896/" };
  return { source: "Instructor Module 5: Rizal’s Global Sojourn", sourceUrl: "" };
}

export const globalSojournChallenges: GlobalSojournChallenge[] = rawChallenges.map(([id, destinationId, period, mission, first, second, third, explanation]) => ({
  id,
  destinationId,
  period,
  mission,
  evidence: [first, second, third],
  explanation,
  ...sourceFor(destinationId),
}));
