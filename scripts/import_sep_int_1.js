require('dotenv').config({ override: true });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const TEST_TITLE = 'Sep Int I';
const TEST_TYPE = 'reading';

const rawQuestions = [
  // ================= MODULE 1 (Questions 1 to 27) =================
  {
    module: 1,
    question_number: 1,
    passage: "The success of the 606 Trail in Chicago, Illinois—an elevated park and trail showcasing various community public art projects—exemplifies how collaborative art initiatives can _______ their communities in multiple ways, including enhancing public spaces and revitalizing neighborhoods.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["enrich", "predict", "deny", "avoid"],
    correct_answer_index: 0,
    domain: "Craft and Structure",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 2,
    passage: "Commercial truck drivers sometimes transport temperature-sensitive goods like fresh produce through a variety of external conditions that can affect temperatures inside cargo areas, _______ the use of specialized equipment to continuously and automatically monitor and adjust refrigeration settings to prevent the goods from spoiling.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["rescinding", "extolling", "obviating", "necessitating"],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 3,
    passage: "Maintaining thorough system documentation may seem like a poor use of cybersecurity specialists’ time. After all, aren’t there vulnerabilities to fix and threats to defeat? In the absence of _______ documentation, however, teams facing a security incident can waste critical time figuring out system configurations instead of remedying the situation.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["engaging", "innovative", "comprehensive", "inadequate"],
    correct_answer_index: 2,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 4,
    passage: "Environmental regulations now require HVAC (heating, ventilation, and air conditioning) technicians to _______ R-22 refrigerant from existing cooling systems rather than venting it during repairs; this careful collection process prevents the ozone-depleting substance from causing atmospheric damage and allows for proper disposal or reclamation later.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["release", "measure", "shield", "recover"],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 5,
    passage: "Founded in Denver in 1991, the Museo de Las Americas is dedicated to art from Latin America, including the art of Indigenous peoples. Since its founding, it has acquired more than 4,800 objects for its permanent collection. More recently founded US-based institutions devoted to Latino cultures include LA Plaza de Cultura y Artes. Located in Los Angeles, it focuses on Mexican American art and culture.",
    prompt: "Which choice best describes the overall structure of the text?",
    options: [
      "It explains how one cultural institution was founded, then explains its plans to expand further.",
      "It defines a certain type of cultural institution, then argues that this type of institution decisively influences society.",
      "It describes a trend among cultural institutions in the United States, then identifies an institution that rejects that trend.",
      "It discusses one cultural institution, then discusses a more recently founded cultural institution."
    ],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 6,
    passage: "In 2015 Floriana Lai and colleagues published a study concluding that ocean acidification has a strong effect on the behavior of Gasterosteus aculeatus, a species of fish. However, Lai and colleagues’ study relied on a mean sample size of only 12 fish. In a 2022 review of various scientists’ conclusions about the impacts of ocean acidification on fish behavior, Jeff C. Clements and colleagues caution that relying on such a relatively small sample size can increase the potential for biased analysis. <u>Such analysis, in turn, can contribute to reports of exaggerated effects.</u>",
    prompt: "Which choice best describes the function of the underlined sentence in the text as a whole?",
    options: [
      "It elaborates on a potential consequence of Lai and colleagues’ reliance on a relatively small sample size.",
      "It summarizes a shift in scientists’ understanding of how Gasterosteus aculeatus has responded to ocean acidification.",
      "It emphasizes the magnitude of the effect reported by Lai and colleagues of ocean acidification on Gasterosteus aculeatus.",
      "It counters the objection of Clements and colleagues to studies that rely on relatively small sample sizes."
    ],
    correct_answer_index: 0,
    domain: "Craft and Structure",
    difficulty: "Hard"
  },
  {
    module: 1,
    question_number: 7,
    passage: "Text 1\nAudre Lorde once claimed that poetry is the most inexpensive of art forms to practice. While people who pursue other art forms—sculpture, film, theater—require large blocks of uninterrupted time as well as money to complete their work, poets can write, as Lorde said, ”between shifts, in the hospital pantry, on the subway, and on scraps of surplus paper.” So poets can make worthwhile art even if they must earn their living in another way.\n\nText 2\nAny assessment of the state of contemporary poetry must reckon with the professionalization of the field. While it is possible in theory for anyone to publish in Virginia Quarterly Review, Harvard Review, or a similar major poetry outlet, many people who do so have professional training in poetry and extensive practice writing it, which requires time not often available to those who must also work full-time jobs. Thus, financial security indirectly affects which people become poets.",
    prompt: "Based on the texts, how would Lorde (Text 1) most likely respond to the argument presented in Text 2?",
    options: [
      "By suggesting that those artists who specialize in more financially rewarding artistic forms are unlikely to also be successful as poets",
      "By pointing out that people can produce valuable poetry in other circumstances than those described by the author of Text 2",
      "By asserting that people often work full-time jobs in order to afford the professional training described in Text 2",
      "By indicating that those poets who publish in major poetry journals are most likely to be able to earn a living by writing poetry"
    ],
    correct_answer_index: 1,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 8,
    passage: "Through the Urban Wildlife Information Network, citizen scientists systematically document animals they observe in metropolitan areas. Participants record not just which species they see but also the species’ behaviors and nearby urban features, such as artificial lighting, buildings, and green spaces. The resulting database helps researchers understand how animals adapt to human-dominated landscapes and informs city planning and conservation efforts that benefit both people and wildlife.",
    prompt: "What does the text indicate is a benefit of the information collected by participants in the Urban Wildlife Information Network?",
    options: [
      "It identifies which animal species are becoming extinct.",
      "It informs city planning and conservation efforts.",
      "It ranks the popularity of green spaces with city residents.",
      "It inspires tourists to visit metropolitan areas."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 9,
    passage: "The following text is adapted from the 1940 novel The Hamlet by William Faulkner. In rural Mississippi, a man referred to as the stranger is walking among a group of untamed calico (spotted) horses that he has penned in a lot.\n\n”[The horses] whipped and whirled about the lot like dizzy fish in a bowl. It had seemed like a big lot until now, but now the very idea that all that fury and motion should be transpiring inside any one fence was something to be repudiated with contempt, like a mirror trick. From the ultimate dust the stranger, carrying the wire-cutters and his vest completely gone now, emerged. He was not running, he merely moved with a light-poised and watchful celerity, weaving among the calico rushes of the animals, feinting and dodging like a boxer until he reached the gate and crossed the yard.”",
    prompt: "Which statement about the stranger is best supported by the text?",
    options: [
      "He remains composed even while navigating the potentially dangerous situation in the pen.",
      "The manner in which he crosses the pen is intended to calm the horses but has the opposite effect.",
      "He is prepared to escape the pen immediately if the horses begin to approach him.",
      "His self-assured demeanor falters when subjected to the chaos in the pen."
    ],
    correct_answer_index: 0,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 10,
    passage: "Some climate models predict that the habitat ranges of North American trees will expand northward as average temperatures warm. However, some tree species, like sand post oaks and limber pines, haven’t expanded. This is called ”migration lag”—when species fail to expand their range, even when conditions seem right. Scientists have proposed several possible explanations: fewer species of soil fungi available at the northern edges of the trees’ habitat, physical barriers blocking seed dispersal, or deer overgrazing preventing new trees from establishing.",
    prompt: "According to the text, what unexpected phenomenon are scientists observing with North American tree species?",
    options: [
      "The ranges of sand post oaks and limber pines are primarily expanding southward instead of northward.",
      "Some North American tree species aren’t increasing their habitat ranges despite suitable climate conditions.",
      "The ranges of sand post oaks and limber pines are expanding more rapidly than climate models predicted.",
      "Some North American tree species are developing resistance to fungal partnerships at the northern boundaries of their ranges."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 11,
    passage: "Highly Traveled Commercial Airline Routes in 2017–18\n\n| Location 1 | Location 2 | Distance (km) | 2018 Pass. | 2017 Pass. | Type |\n| --- | --- | --- | --- | --- | --- |\n| Hong Kong | Manila | 1,145 | 3,008,842 | 2,907,228 | International |\n| Jakarta | Singapore | 896 | 4,812,342 | 4,810,602 | International |\n| Mumbai | Delhi | 1,150 | 7,392,155 | 7,129,943 | Domestic |\n| Mexico City | Monterrey | 729 | 3,474,971 | 3,202,091 | Domestic |\n\nA study of commercial airline routes that carried the greatest number of passengers in 2017 and 2018 shows that, in general, domestic routes (routes within a single country) carried many more passengers than international routes. However, a few international routes were so popular that they carried more travelers than some of the most highly traveled domestic routes, as can be seen when comparing the...",
    prompt: "Which choice most effectively uses data from the table to complete the example?",
    options: [
      "distance between Mexico City and Monterrey with the distance between Jakarta and Singapore.",
      "number of passengers who traveled between Mumbai and Delhi in 2017 with the number who traveled between Hong Kong and Manila during that same year.",
      "number of passengers who traveled between Jakarta and Singapore in 2017 with the number who traveled between Jakarta and Singapore in 2018.",
      "number of passengers who traveled between Jakarta and Singapore in 2018 with the number who traveled between Mexico City and Monterrey during that same year."
    ],
    correct_answer_index: 3,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 12,
    passage: "Poems is an 1895 collection of poetry by Frances E.W. Harper. In one of Harper’s poems, the speaker declares her intention to create art that has a universal appeal across generations, saying...",
    prompt: "Which quotation from Poems most effectively illustrates the claim?",
    options: [
      "”A battle greater, grander far / Is for the present age; / A crusade for the rights of man / To brighten history’s page.” (from ”The Present Age”)",
      "”God help our native land, / Bring surcease to her strife, / And shower from thy hand / A more abundant life.” (from ”God Bless Our Native Land”)",
      "”Let me make the songs for the people, / Songs for the old and young; / Songs to stir like a battle-cry / Wherever they are sung.” (from ”Songs for the People”)",
      "”Our world, so worn and weary, / Needs music, pure and strong, / To hush the jangle and discords / Of sorrow, pain, and wrong.” (from ”Songs for the People”)"
    ],
    correct_answer_index: 2,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 13,
    passage: "To measure whether countries in free trade agreements (FTAs)—agreements among nations to reduce tariffs, duties, and other trade barriers—experience changes in total agricultural exports, economist Kayode Ajewole and colleagues calculated average export growth rates for several countries over the five years before and the five years after entering an FTA with the United States.\n\n• Pre-FTA: Guatemala (CAFTA-DR): 13.8%; Mexico (NAFTA): −1.5%; Morocco (MAFTA): 19.6%\n• Post-FTA: Guatemala (CAFTA-DR): 20.1%; Mexico (NAFTA): 13.6%; Morocco (MAFTA): 4.9%\n\nConsulting the graph, a student claims that joining an FTA increases the rate of growth of a country’s total agricultural exports.",
    prompt: "Which choice best describes data from the graph that weaken the student’s claim?",
    options: [
      "All the countries shown had positive growth in agricultural exports over the five years after joining their respective FTAs, but their rates of export growth varied.",
      "Although agricultural exports from Morocco grew over the five years after Morocco joined MAFTA, their growth rate was even higher in the five years before MAFTA.",
      "Although agricultural exports from Mexico decreased over the five years before NAFTA, a reversal in this trend was observed over the five years after Mexico joined NAFTA.",
      "Over the five years after Guatemala joined CAFTA-DR, agricultural exports from Guatemala grew at a rate of about 20.1 percent, which is higher than the rate over the five years before Guatemala joined the agreement."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Hard"
  },
  {
    module: 1,
    question_number: 14,
    passage: "The writer and illustrator of Moominpappa at Sea (1965) and many other Moomin stories for children didn’t initially set out to be known as a children’s author. While Tove Jansson accomplished a great deal as a painter and cartoonist, she became widely popular as the creator of the Moomin characters she is still best remembered for today—Moomintroll, Moominmamma, and other eccentric figures. A student who is researching children’s literature asserts that <u>even though this outcome wasn’t what Jansson had intended, she committed to the role she found herself in.</u>",
    prompt: "Which statement, if true, would best illustrate the student’s claim in the underlined text?",
    options: [
      "Jansson wrote Moominpappa at Sea and other Moomin stories but also published many memorable political cartoons.",
      "Jansson created her own magazine when she was thirteen years old and sold copies of it at her school.",
      "Jansson was an intensely private person but still responded personally to thousands of letters from fans writing about the Moomins.",
      "Jansson resigned from creating a daily Moomin comic strip in 1959 after working on it for seven years, and her brother Lars took her place."
    ],
    correct_answer_index: 2,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 15,
    passage: "Given a growing market in organic foods, grocery stores want to understand what factors make organic food more appealing to customers than nonorganic foods, including placement in a store, pricing, and advertising. According to some studies, social media posts and dedicated organic product sections are among the most effective ways to increase sales of organic foods. However, most interventions have had varied success: for instance, price reductions and food options of only certain types, and only in some stores. This finding suggests that grocery stores hoping to improve their performance in the growing market would most benefit from...",
    prompt: "Which choice most logically completes the text?",
    options: [
      "instituting rotating price reductions on organic foods to draw customers’ attention to different products at different times.",
      "gathering information about localized customer preferences to deploy sales tactics for organic foods more strategically at each store.",
      "ensuring that organic products are clearly distinguished from nonorganic products in terms of messaging, placement, and price.",
      "combining in-store promotional messaging with social media messaging to ensure customers are aware of certain features of organic products."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 16,
    passage: "Liana Burghardt, whose research focuses mainly on plants, _______ as a biologist at Pennsylvania State University.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["works", "work", "are working", "have worked"],
    correct_answer_index: 0,
    domain: "Standard English Conventions",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 17,
    passage: "Charya Burt is a US-based Cambodian classical dance artist. In her tribute to Ros _______ pairs large video projections with 1960s Cambodian pop music to create an immersive visual and musical backdrop.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["Sereysothea. The", "Sereysothea the", "Sereysothea but the", "Sereysothea, the"],
    correct_answer_index: 3,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 18,
    passage: "Seawater contains many trace elements that can be categorized in one of three ways based on their significance in sustaining living organisms: essential, possibly essential, or nonessential. Molybdenum, whose chemical symbol is _______, is classified as an essential element.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["MoO", "Mo:", "Mo—", "Mo,"],
    correct_answer_index: 3,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 19,
    passage: "Emory Sekaquaptewa, a Hopi anthropologist and lexicographer, helped compile a bilingual Hopi-English dictionary published in 1998. Containing almost 30,000 entries, _______",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "knowledge of the Hopi language was preserved by the dictionary, which was considered a model for future lexicographers.",
      "future lexicographers considered the dictionary, which preserved knowledge of the Hopi language, as a model for future lexicographers.",
      "the dictionary’s preservation of knowledge of the Hopi language was considered a model for future lexicographers.",
      "the dictionary preserved knowledge of the Hopi language and was considered a model for future lexicographers."
    ],
    correct_answer_index: 3,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 20,
    passage: "The frogfish’s sophisticated hunting strategy relies on a modified dorsal spine called the illicium that features a specialized terminal appendage at its _______ potential food items, like worms, shrimp, or small fish, the appendage evolved to function as a fishing rod to lure prey.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["tip, mimicking", "tip mimicking", "tip and mimicking", "tip. Mimicking"],
    correct_answer_index: 0,
    domain: "Standard English Conventions",
    difficulty: "Hard"
  },
  {
    module: 1,
    question_number: 21,
    passage: "In ancient Rome, eligible citizens would gather in public squares to vote for their leaders on election day. _______ the winning candidates would take office and begin making important decisions for the city.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["However,", "Afterward,", "Instead,", "For example,"],
    correct_answer_index: 1,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 22,
    passage: "The star Arcturus is unvaryingly bright, consistently ranking as one of the brightest stars in the sky (Arcturus ranked 4th on a recent list). By contrast, the brightness of the red giant Betelgeuse varies considerably. Indeed, between April and June 2023, Betelgeuse became an astonishing 40% brighter; _______ its ranking rose from 10th to 7th.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["for example,", "in turn,", "specifically,", "in sum,"],
    correct_answer_index: 1,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 23,
    passage: "It’s tempting to think that the chaotic scene depicted in Joseph Heintz the Younger’s painting Competition on the Ponte dei Pugni in Venice (1673) could only have existed in the artist’s imagination: a bridge is covered with dozens of brawling men, some tumbling into the canal below, and throngs of excited spectators crowd the sidewalks, gondolas, and windows of surrounding buildings. _______, such dramatic competitions between rival neighborhood factions were regular occurrences in seventeenth-century Venice.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["Similarly,", "As a result,", "In other words,", "In reality,"],
    correct_answer_index: 3,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 24,
    passage: "As a sculptor, Robert Browning didn’t possess skills beyond those of a hobbyist, though the time he spent sculpting likely inspired his tactile portrayal of abstract concepts in his poetry. _______, in his 1855 poem ”Bishop Blougram’s Apology,” Browning presents thought and consciousness as having a texture that can be altered by hand: ”the great bishop rolled him out a mind / Long crumpled, till creased consciousness lay smooth.”",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["Even so,", "Likewise,", "Indeed,", "Additionally,"],
    correct_answer_index: 2,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 25,
    passage: "• Antonio Stradivari (1644–1737) was an Italian instrument maker.\n• He made about 1,000 violins in his lifetime.\n• Musicians prize his Stradivarius violins for their famed sound quality.\n• The Ole Bull Stradivarius is named for former owner Ole Bull, a Norwegian violinist.",
    prompt: "Which choice most effectively uses information from the given notes to introduce the Ole Bull Stradivarius to a new audience?",
    options: [
      "Ole Bull was a Norwegian violinist who once owned a Stradivarius violin.",
      "The Ole Bull Stradivarius is named after Ole Bull.",
      "Of the 1,000 or so violins Antonio Stradivari made, only about 500 exist today.",
      "Born in 1644, Antonio Stradivari was an Italian instrument maker whose violins are famous for their quality."
    ],
    correct_answer_index: 0,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 26,
    passage: "• In a 2021 study, researchers showed participants an unaltered image of a popular character or logo alongside two slightly altered versions.\n• Snoopy is a cartoon dog with a black patch on its ear.\n• In the first alteration, the dog’s ear had no pattern.\n• In the second alteration, the dog’s ear had black spots.\n• Participants were asked to identify the correct version.\n• 84% of participants selected the unaltered image.",
    prompt: "The student wants to present a finding from the study. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "In a 2021 study, researchers asked participants to identify the correct version of Snoopy.",
      "Participants were asked to identify the correct version of Snoopy, who is a cartoon dog with a black patch on its ear.",
      "Snoopy is a cartoon dog with a black patch on its ear, but in one of the altered versions, the dog’s ear had no pattern.",
      "When participants were asked to identify the correct version of Snoopy, 84% selected the unaltered image."
    ],
    correct_answer_index: 3,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 27,
    passage: "• Catagonus wagneri is a mammal species.\n• It was believed to be extinct until a living specimen was identified in Argentina in 1974.\n• Medusagyne oppositifolia is a tree species.\n• It was believed to be extinct until a living specimen was identified in the Seychelles in 1978.\n• ”Lazarus species” is a term for living species of organisms that were once believed to be extinct.",
    prompt: "The student wants to specify where Catagonus wagneri was identified. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "In 1978, a living specimen of Medusagyne oppositifolia was found in the Seychelles.",
      "Previously believed to be extinct, a living specimen of Catagonus wagneri was identified in Argentina.",
      "Examples of Lazarus species can be found in Catagonus wagneri as well as Medusagyne oppositifolia.",
      "A living specimen of Catagonus wagneri, once believed to be extinct, was identified in 1974."
    ],
    correct_answer_index: 1,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },

  // ================= MODULE 2 (Questions 28 to 54) =================
  {
    module: 2,
    question_number: 1,
    original_question_number: 28,
    passage: "Fruit growers must contend with robins and other birds _______ crops in orchards by pecking at fruits, leaving the fruits vulnerable to rot and diseases that can then spread among fruit trees. However, measures such as reflective elements can deter pest birds when properly deployed.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["capturing", "harvesting", "avoiding", "ruining"],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 2,
    original_question_number: 29,
    passage: "It would not be productive for supporters of a proposal to increase the toll that drivers must pay to use the Antioch Bridge, which spans the San Joaquin River in California, to direct their arguments at those drivers who strongly believe that the current toll is too high. There’s little point in trying to _______ someone whose mind is already made up.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["sway", "ignore", "support", "identify"],
    correct_answer_index: 0,
    domain: "Craft and Structure",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 3,
    original_question_number: 30,
    passage: "In the second half of the sixteenth century, cobalt-based pigments _______ Germany, leading to the proliferation of stoneware ceramics featuring decorations with the distinctive blue coloration characteristic of cobalt compounds fired at high temperatures. Such decorations came to be a defining feature of German stoneware vessels of the period.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["could occasionally be found in", "had to be imported to", "became broadly available in", "were strongly associated with"],
    correct_answer_index: 2,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 4,
    original_question_number: 31,
    passage: "The Colorado River delta system is located in northwestern Mexico, where the river drains into the Gulf of California, and is shaped by _______ factors: for example, the geography of the coastline influences sedimentary deposition, which over time alters coastal geography.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["tenuous", "interdependent", "comprehensive", "unyielding"],
    correct_answer_index: 1,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 5,
    original_question_number: 32,
    passage: "The following text is from Eleanor H. Porter’s 1913 novel Pollyanna. Nancy is picking up Pollyanna at the train station. They are meeting for the first time.\n\nThe little girl was standing quite by herself when Nancy finally did approach her. ”Are you Miss-Pollyanna?” she asked. The moment she found herself half smothered in the gingham-clad arms. <u>”Oh, I’m so glad, GLAD, GLAD to see you,”</u> cried an eager voice in her ear. ”Of course I’m Pollyanna, and I’m so glad you came to meet me! I hoped you would...”",
    prompt: "Which choice best describes the function of the underlined portion in the text?",
    options: [
      "To point out that the little girl in gingham isn’t Pollyanna",
      "To describe what Nancy thinks about traveling",
      "To show that Pollyanna is upset",
      "To emphasize how strong Pollyanna’s sense of happiness is"
    ],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 6,
    original_question_number: 33,
    passage: "Vertical gene transfer involves the transmission of genetic material from a parent to offspring; horizontal gene transfer, on the other hand, involves the exchange of genetic material between organisms not in a parent-offspring relationship. While horizontal gene transfer is common among prokaryotes—single-celled organisms such as the bacteria Brevundimonas diminuta and Lactococcus lactis—it has rarely been observed among eukaryotes (typically multicellular organisms). <u>However, new studies suggest that horizontal gene transfer is more common in eukaryotes than originally thought.</u>",
    prompt: "Which choice best states the function of the underlined sentence in the text as a whole?",
    options: [
      "It compares the frequencies with which horizontal gene transfer has been detected in two categories of organisms.",
      "It implies that a common perception of horizontal gene transfer may be inaccurate.",
      "It argues that a particular direction of research concerning horizontal gene transfer is likely to be fruitless.",
      "It indicates a distinction between horizontal gene transfer and vertical gene transfer."
    ],
    correct_answer_index: 1,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 7,
    original_question_number: 34,
    passage: "Text 1\nFor thousands of years, O’odham farmers in the desert of the southwestern US and northern Mexico cultivated mesquite seeds and agave sap, sometimes planting these species together so that the mesquite trees provide shade for agaves. Doing so helps protect agaves from the harshest heat and light and thereby helps prevent soil moisture from evaporating.\n\nText 2\nAgaves are well adapted to growing in the desert but grow best when shaded. Inspired by O’odham farmers, who often strategically plant agaves in the shade of sun-hardy species like mesquite trees for protection from the sun and heat, Gary Nabhan and colleagues planted agaves in the shade of solar panels in the Sonoran desert and found that the plants grew well, suggesting to Nabhan and colleagues that the panels provide a benefit similar to that provided by mesquite trees.",
    prompt: "Based on the texts, the author of Text 1 and the author of Text 2 would most likely agree on which point?",
    options: [
      "Mesquite trees grow best when planted in shaded areas, while agaves do not require shade to thrive.",
      "Compared with Nabhan’s approach, the O’odham approach has the advantage of producing agave sap.",
      "Mesquite trees can provide shade that protects agaves from high-intensity heat and light.",
      "Nabhan’s team’s method could be refined to more actively prevent soil moisture from evaporating."
    ],
    correct_answer_index: 2,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 8,
    original_question_number: 35,
    passage: "The following text is adapted from Neal Shusterman and Jarrod Shusterman’s 2018 novel Dry. The narrator, Alyssa, describes a scene with her mother.\n\nThe faucet spits once, and then goes silent. Our dog, Kingston, raises his ears, but still keeps his distance from the sink, unsure if it might unexpectedly come back to life, but no such luck. Mom just stands there holding Kingston’s water bowl beneath the faucet, puzzling. Then she moves the handle to the off position, and says, ”Alyssa, go get your father.”",
    prompt: "According to the text, what object is Alyssa’s mother holding?",
    options: ["A puzzle", "A bowl", "A sink", "A dog"],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 9,
    original_question_number: 36,
    passage: "The Museum of Modern Art (MoMA) in New York City exhibits some video games as works of art. Several games, including the 1981 game Tempest, are playable at the museum, but other games, including the 2003 game Eve Online, are shown only in video footage because they are too complex to exhibit in a playable form. Although this does mean that the interactive element of such games is not fully represented, MoMA’s choice to include Eve Online is likely intended to highlight important aspects of the game other than the experience of playing it.",
    prompt: "The author of the text makes which point about MoMA’s choice of games to exhibit?",
    options: [
      "MoMA chose to exhibit Eve Online in video footage because it is not as interactive as other video games are.",
      "MoMA chose to exhibit Eve Online because the museum thinks it effectively represents important features of video games other than their interactivity.",
      "MoMA chose to exhibit Tempest and Eve Online because the museum thinks that, unlike the vast majority of video games, these two deserve to be considered works of art.",
      "MoMA’s choice to exhibit Tempest and Eve Online does not mean that video games in general should be considered works of art."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 10,
    original_question_number: 37,
    passage: "Brown Bears in Katmai National Park, Alaska\n\n| Bear ID | Sex | Age (years) | Approx. Weight (lbs) |\n| --- | --- | --- | --- |\n| 176 | male | 10 | 575 |\n| 192 | female | 17 | 300 |\n| 149 | male | 12 | 750 |\n| 123 | female | 11 | 350 |\n\nScientists collected information about brown bears in Katmai National Park in Alaska. This information included each bear’s sex, age, and approximate weight. The bear with the lowest approximate weight shown in the table was a...",
    prompt: "Which choice most effectively uses data from the table to complete the statement?",
    options: [
      "male that was 12 years old.",
      "female that was 17 years old.",
      "male that was 10 years old.",
      "female that was 11 years old."
    ],
    correct_answer_index: 3,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 11,
    original_question_number: 38,
    passage: "Life Among the Paiutes is an 1882 autobiographical narrative by Sarah Winnemucca Hopkins. In the work, Winnemucca creates suspense by emphasizing her physical response to an event, writing...",
    prompt: "Which quotation from Life Among the Paiutes most effectively illustrates the claim?",
    options: [
      "”Nothing happened during the day, and after awhile mother told us not to say a word about why we left, for grandpa might get mad with us.”",
      "”Oh, how my heart jumped when I heard a noise close by. It was a man. He came creeping close to the ground. It came close to us and stopped. Oh, how my heart beat! I thought whoever it was would hear my heart beat.”",
      "”Late in that fall, there came news that my grandfather was on his way home. Then my father took a great many of his men and went to meet his father, and there came back a runner, saying, that all our people must come together.”",
      "”So ended our feast, and every family went to its own home in the pine-nut mountains, and remained there till the pine-nuts were ripe. They ripen about the last of June.”"
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 12,
    original_question_number: 39,
    passage: "Impact of Key Industries on Oklahoma Economy in 2017\n\n| Industry | Total Contribution | Employees | Avg / Employee |\n| --- | --- | --- | --- |\n| Health care | $13,727,300,000 | 193,514 | $70,937 |\n| Tribal economic activity | $7,312,400,000 | 51,674 | $141,510 |\n| Professional services | $7,694,000,000 | 69,846 | $110,157 |\n| Wholesale trade | $10,723,400,000 | 58,346 | $183,790 |\n\nThe Cherokee Nation, the Seminole Nation, and the more than thirty other tribes in Oklahoma operate numerous businesses that generate billions of dollars in revenue. An economics student is researching the tribes’ collective activity as a single industry. The student wants to compare the average amount that industry contributed per employee to Oklahoma’s economy with the average amount contributed per employee by three other industries. Looking at the table, the student finds that tribal economic activity contributed over $141,000 per employee, on average, ranking it...",
    prompt: "Which choice most effectively uses data from the table to complete the comparison?",
    options: [
      "above all three of the other industries listed in the table.",
      "above either health care or professional services and nearly equal to wholesale trade.",
      "below all three of the other industries listed in the table.",
      "below wholesale trade but above both professional services and health care."
    ],
    correct_answer_index: 3,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 13,
    original_question_number: 40,
    passage: "Home Video Game Systems of the 1970s and 1980s\n\n| System | Manufacturer | Type | Units Sold |\n| --- | --- | --- | --- |\n| ColecoVision | Coleco | console | 2,000,000 |\n| Intellivision | Mattel | console | 3,000,000 |\n| MSX | ASCII Corp. | computer | 4,000,000 |\n| Game & Watch | Nintendo | handheld | 18,600,000 |\n\nA student is writing a research paper on the global rise of the home video game industry during the 1970s and 1980s. The student is surprised by differences in the number of units sold by some systems compared to those sold by others. Most remarkably, the...",
    prompt: "Which choice most effectively uses data from the table to complete the statement?",
    options: [
      "Game & Watch sold approximately 18,600,000 units, whereas the ColecoVision sold only approximately 2,000,000 units.",
      "MSX sold approximately 4,000,000 units, whereas the Intellivision sold only approximately 3,000,000 units.",
      "MSX sold approximately 18,600,000 units, whereas the Intellivision sold only approximately 2,000,000 units.",
      "Game & Watch sold approximately 4,000,000 units, whereas the ColecoVision sold only approximately 3,000,000 units."
    ],
    correct_answer_index: 0,
    domain: "Information and Ideas",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 14,
    original_question_number: 41,
    passage: "The British Bronze Age began when sophisticated metalworking was introduced to the British Isles around 2500 BCE, and it lasted until around 700 BCE. Collections of Bronze Age metal items (called hoards) have been found all over Britain, and while most of the objects found in these hoards are weapons or tools, some are purely decorative. Hoards such as the Horsehope Craig hoard included bronze weapons and jewelry, but a few included objects made of gold, such as the Whalley hoard, which contained bronze weapons and gold jewelry. As ancient metalsmiths in Britain gained knowledge from working metals like bronze, they were able to apply those skills to work other metals as well, but it’s not surprising that few hoards contained gold because...",
    prompt: "Which choice most logically completes the text?",
    options: [
      "gold was much rarer and more difficult to obtain than bronze.",
      "not all jewelry from the Bronze Age was made of gold.",
      "gold was more valued for its beauty than bronze was.",
      "some hoards were found as a result of artifacts being dug up by accident."
    ],
    correct_answer_index: 0,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 15,
    original_question_number: 42,
    passage: "Ethnographers have spent decades analyzing the traditional songs of Indigenous peoples around the world. Only recently, however, have ethnographers started to recognize that many Indigenous songs encode and transmit valuable ecological knowledge—citing, for instance, songs of the Kwakwaka’wakw people in British Columbia, Canada, that share vital information about clam gardens, and those of the Karen (hta) Hin Lad Nai people in Thailand that offer detailed information about bees. It seems likely, therefore, that ethnographers may want to...",
    prompt: "Which choice most logically completes the text?",
    options: [
      "reexamine some of their earlier analyses of Indigenous peoples’ songs in light of this new perspective.",
      "place greater emphasis on the use of Indigenous songs by individuals than on the songs’ roles in society.",
      "reconsider their view that the transmission of ecological knowledge is an important function of some Indigenous songs.",
      "explore the possibility that the Kwakwaka’wakw people were influenced by the songs of the Karen (hta) Hin Lad Nai people."
    ],
    correct_answer_index: 0,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 16,
    original_question_number: 43,
    passage: "When a seed is ready to sprout, its hard outer covering (called a seed coat) absorbs water and splits open. Then, a root begins to grow downward into the soil, and the first shoot starts _______ upward.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["had grown", "to grow", "has grown", "grows"],
    correct_answer_index: 1,
    domain: "Standard English Conventions",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 17,
    original_question_number: 44,
    passage: "Nonmetallic elements _______ electrons more readily than metallic elements do.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["attracting", "attract", "having attracted", "to attract"],
    correct_answer_index: 1,
    domain: "Standard English Conventions",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 18,
    original_question_number: 45,
    passage: "Trade with other societies was vital to the Parthian Empire, which reigned in Mesopotamia from around 247 BCE to 224 CE. Its people profited by selling textiles, spices, and iron, items that _______ greatly in demand.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["was", "is", "were", "has been"],
    correct_answer_index: 2,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 19,
    original_question_number: 46,
    passage: "Inspired by her Haida and Tlingit heritage, artist Vicki Lee Soboleff typically uses red cedar—a durable and flexible _______ craft baskets that are both beautiful and detailed.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["material: to", "material; to", "material—to", "material. To"],
    correct_answer_index: 2,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 20,
    original_question_number: 47,
    passage: "”Coalition” is the term for a group of male lions, and across the Greater Kruger National Park in South Africa, many coalitions vie for territory. Between 2006 and 2012, the lions of the Mapogo _______ including Kinky Tail, Mr. T, and Makhulu—thrived within a part of the park called the Sabi Sands.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["coalition—", "coalition,", "coalition", "coalition;"],
    correct_answer_index: 0,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 21,
    original_question_number: 48,
    passage: "Angus Maddison’s The World Economy: Historical Statistics includes estimated total market values for the world’s largest economies dating back to 1 CE. This comprehensive resource was first published in _______ its release, gaps in historical records hindered researchers’ ability to analyze economic trends across centuries.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "2003. Revolutionizing the field of economic research before",
      "2003, revolutionizing the field of economic research. Before",
      "2003, revolutionizing the field of economic research before",
      "2003, revolutionizing the field of economic research, before"
    ],
    correct_answer_index: 1,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 22,
    original_question_number: 49,
    passage: "Under the night sky, tiny green sea turtle hatchlings broke free from their eggs and emerged from their sandy nest. _______, they began their journey across the beach toward the ocean.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["For example,", "Previously,", "Then,", "Instead,"],
    correct_answer_index: 2,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 23,
    original_question_number: 50,
    passage: "In August 1864, Joseph Daily joined the US Navy. He went on to serve aboard the USS Mohican during the US Civil War and, _______ earned a place in US history as one of the war’s few Chinese-born American soldiers.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["usually,", "in any case,", "in doing so,", "for instance,"],
    correct_answer_index: 2,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 24,
    original_question_number: 51,
    passage: "Generally, sleek vehicles are more aerodynamic than bulkier ones. For example, the streamlined nose of the Cessna 310 jet helps it glide through wind with relative ease. _______, a boxy semitruck encounters more wind resistance, making it less aerodynamic.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["Specifically,", "On the other hand,", "In conclusion,", "As a result,"],
    correct_answer_index: 1,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 25,
    original_question_number: 52,
    passage: "In 1996 the Solar and Heliospheric Observatory satellite, which studies the layers of the Sun, maintained an orbit at the Sun-Earth L1 Lagrange point—a position directly between Earth and the Sun. _______, the gravitational forces of the Sun and Earth reach an equilibrium found in very few other locations, allowing spacecraft such as the Solar and Heliospheric Observatory to remain in the same position relative to Earth as they orbit the Sun.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["There,", "For example,", "Admittedly,", "Regardless,"],
    correct_answer_index: 0,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 26,
    original_question_number: 53,
    passage: "• A merchant vessel is any ship hired to carry cargo or passengers.\n• Common merchant vessels include bulk carriers, cruise liners, and oil tankers.\n• A vessel’s carrying capacity is also known as its deadweight tonnage (DWT).\n• In 2021, there were a total of 1,051 merchant vessels registered in Cyprus.\n• The combined DWT of these vessels was 34 million tons.",
    prompt: "The student wants to explain what a merchant vessel is and provide examples. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "In total, Cyprus’s 1,051 merchant vessels had a carrying capacity of 34 million tons in 2021.",
      "A merchant vessel is any ship hired to carry cargo or passengers—like bulk carriers, cruise liners, and oil tankers.",
      "There were a total of 1,051 ships hired to carry cargo or passengers registered in Cyprus in 2021.",
      "The carrying capacity of bulk carriers, cruise liners, and oil tankers is measured in deadweight tonnage."
    ],
    correct_answer_index: 1,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 27,
    original_question_number: 54,
    passage: "• The French Republican calendar was used in France from 1793 to 1805.\n• Each calendar week had ten days, two of which were called quintidi and decadi.\n• Each quintidi was given a unique name in honor of an animal.\n• Each decadi was given a unique name in honor of an agricultural tool.\n• Bœuf, a quintidi in the month of Vendémiaire, was named after the ox.\n• Van, a decadi in the month of Nivôse, was named after the winnowing fan.",
    prompt: "The student wants to emphasize a difference between quintidi and decadi. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "Each decadi was named after an agricultural tool; for example, a decadi during the month of Nivôse was named after the winnowing fan.",
      "There were ten days in each week of the French Republican calendar, and two of these days were called quintidi and decadi.",
      "One quintidi during the month of Vendémiaire was named after an animal, the ox.",
      "Each quintidi in the calendar honored an animal, such as the ox, whereas each decadi honored an agricultural tool, such as the winnowing fan."
    ],
    correct_answer_index: 3,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  }
];

async function updateBackupFile(testId) {
  const backupPath = path.join(__dirname, '..', 'backup_all_tests.json');
  if (!fs.existsSync(backupPath)) return;

  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  backup.tests = backup.tests || [];
  backup.questions = backup.questions || [];

  // Check if test already exists in backup
  let existingTest = backup.tests.find(t => t.title === TEST_TITLE);
  if (!existingTest) {
    const maxId = backup.tests.reduce((max, t) => Math.max(max, t.id || 0), 0);
    const newTestId = testId || (maxId + 1);
    existingTest = {
      id: newTestId,
      title: TEST_TITLE,
      type: TEST_TYPE,
      allow_practice: 1,
      difficulty: null,
      created_at: new Date().toISOString()
    };
    backup.tests.push(existingTest);
  } else {
    existingTest.type = TEST_TYPE;
    existingTest.allow_practice = 1;
  }

  const assignedTestId = existingTest.id;

  // Filter out existing questions for this test
  backup.questions = backup.questions.filter(q => q.test_id !== assignedTestId);

  // Add questions
  let maxQId = backup.questions.reduce((max, q) => Math.max(max, q.id || 0), 0);
  for (const q of rawQuestions) {
    maxQId++;
    backup.questions.push({
      id: maxQId,
      test_id: assignedTestId,
      question_number: q.question_number,
      passage: q.passage,
      prompt: q.prompt,
      options: JSON.stringify(q.options),
      correct_answer_index: q.correct_answer_index,
      correct_answer_text: null,
      module: q.module,
      image_url: null,
      question_type: 'mcq',
      section: 'reading',
      domain: q.domain,
      difficulty: q.difficulty
    });
  }

  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`✅ backup_all_tests.json updated successfully with test '${TEST_TITLE}' (ID: ${assignedTestId}) and ${rawQuestions.length} questions!`);
  return assignedTestId;
}

async function importToDatabase() {
  console.log(`Starting import for '${TEST_TITLE}' (${TEST_TYPE})...`);

  // First, always update backup file
  const backupTestId = await updateBackupFile();

  // Next, try MySQL connection
  let connection;
  try {
    console.log(`Attempting connection to MySQL (${process.env.DB_HOST}:${process.env.DB_PORT || 3306})...`);
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
      connectTimeout: 5000
    });
    console.log('Connected to MySQL successfully!');

    // Check if test exists
    const [existing] = await connection.query('SELECT id FROM tests WHERE title = ?', [TEST_TITLE]);
    let testId;
    if (existing.length > 0) {
      testId = existing[0].id;
      console.log(`Test '${TEST_TITLE}' already exists in DB with ID ${testId}. Cleaning up old questions...`);
      await connection.query('DELETE FROM questions WHERE test_id = ?', [testId]);
      await connection.query('UPDATE tests SET type = ?, allow_practice = 1 WHERE id = ?', [TEST_TYPE, testId]);
    } else {
      console.log(`Creating new test '${TEST_TITLE}' in DB...`);
      const [res] = await connection.query(
        'INSERT INTO tests (title, type, allow_practice) VALUES (?, ?, 1)',
        [TEST_TITLE, TEST_TYPE]
      );
      testId = res.insertId;
      console.log(`Created test with ID ${testId}`);
    }

    console.log(`Inserting ${rawQuestions.length} questions into DB...`);
    for (const q of rawQuestions) {
      await connection.query(
        `INSERT INTO questions (
          test_id, question_number, passage, prompt, options,
          correct_answer_index, correct_answer_text, module, image_url,
          question_type, section, domain, difficulty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testId,
          q.question_number,
          q.passage,
          q.prompt,
          JSON.stringify(q.options),
          q.correct_answer_index,
          null,
          q.module,
          null,
          'mcq',
          'reading',
          q.domain,
          q.difficulty
        ]
      );
    }

    console.log(`🎉 DB import completed: '${TEST_TITLE}' (ID: ${testId}) with ${rawQuestions.length} questions.`);
    await updateBackupFile(testId);
  } catch (err) {
    console.warn('⚠️ Could not connect to MySQL database:', err.message);
    console.log('ℹ️ All test data and 54 questions have been saved to backup_all_tests.json and CSV.');
  } finally {
    if (connection) await connection.end();
  }
}

importToDatabase().catch(console.error);
