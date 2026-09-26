require('dotenv').config({ override: true });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const TEST_TITLE = 'Sep Int II';
const TEST_TYPE = 'reading';

const rawQuestions = [
  // ================= MODULE 1 (Questions 1 to 27) =================
  {
    module: 1,
    question_number: 1,
    passage: "While researching a topic, a student has taken the following notes:\n• Van, a decadi in the month of Nivôse, was named after the winnowing fan.\n• There were ten days in each week of the French Republican calendar, and two of these days were called quintidi and decadi.\n• One quintidi during the month of Vendémiaire was named after an animal, the ox.",
    prompt: "The student wants to emphasize a difference between quintidi and decadi. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "Each decadi was named after an agricultural tool; for example, a decadi during the month of Nivôse was named after the winnowing fan.",
      "There were ten days in each week of the French Republican calendar, and two of these days were called quintidi and decadi.",
      "One quintidi during the month of Vendémiaire was named after an animal, the ox.",
      "Each quintidi in the calendar honored an animal, such as the ox, whereas each decadi honored an agricultural tool, such as the winnowing fan."
    ],
    correct_answer_index: 3,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 2,
    passage: "Noah Fierer and colleagues _______ sterilized soil with slurries of live microbes collected from soil in five sites across Colorado, including areas of ponderosa pine forest and dry pasture. Fierer and team then grew mustard plants in the pots to see if the different microbial slurries affected levels of spicy glucosinolates like 3-methylthiopropyl in the plants’ seeds.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["estimated", "precluded", "populated", "sanitized"],
    correct_answer_index: 2,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 3,
    passage: "Electricians confronting century-old wiring often find themselves playing detective, tracing circuits that were modified numerous times by different hands, each addressing—with varying levels of sophistication—immediate needs with little effort to maintain overall organization. What appears to be a simple fixture replacement can reveal a network that is truly _______.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["rudimentary", "fraudulent", "monotonous", "byzantine"],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 4,
    passage: "While some of the Mediterranean islands inhabited by prehistoric peoples were rich in resources and easily accessible from the mainland, others were resource-poor and could only be reached by grueling, hazardous, multiday voyages in rowboats. The motivations of the people who settled the latter are thus, from our modern perspective, _______.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["impulsive", "enigmatic", "ambivalent", "pragmatic"],
    correct_answer_index: 1,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 5,
    passage: "The following text is adapted from Virginia Woolf’s 1919 novel Night and Day.\n\nIn times gone by, Mrs. Hilbery had known all the poets, all the novelists. These being now either dead or secluded in their infirm glory, she made her house a meeting-place for her own relations, to whom she would lament the passing of the great days of the nineteenth century, when every department of letters and art was represented in England by two or three illustrious names.",
    prompt: "As used in the text, what does the word ”lament” most nearly mean?",
    options: ["Expect", "Dispute", "Enumerate", "Regret"],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 6,
    passage: "In 1879, in an effort to determine the longevity of certain seeds left in soil, botanist William Beal buried 20 glass bottles filled with sand and seeds from a variety of plants, including Verbascum, Anthemis cotula, and Rumex crispus. Since then, some of the bottles have been retrieved in periodic checks of seed viability researchers are conducting. After 60 years had elapsed, most of the seeds in those bottles stopped germinating, but Verbascum seeds have remained viable, including those from a bottle dug up in 2021 by Margaret Fleming, Lauren Stanley, and colleagues.",
    prompt: "Which choice best states the main purpose of the text?",
    options: [
      "To explain how to get rid of certain plants",
      "To compare two experiments addressing the same question",
      "To discuss an ongoing experiment",
      "To describe difficulties associated with preserving seeds"
    ],
    correct_answer_index: 2,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 7,
    passage: "When favorable environmental conditions trigger population blooms in the Wadden Sea intertidal zone, the single-celled foraminifer Ammonia confertitesta reaches exceptionally high densities of over 400 individuals per cubic centimeter in surface sediments. Each organism stores approximately 413 picomoles of phosphate internally. Scientists calculated that across the entire Wadden Sea coastal area (11,500 square kilometers), this one species collectively holds about 1,880 tons of phosphate in the top centimeter of sediment—<u>roughly 5% of Germany’s yearly phosphorous fertilizer usage.</u> Similar measurements from other regions show comparable storage by various foraminifera species.",
    prompt: "Which choice best describes the function of the underlined portion in the text as a whole?",
    options: [
      "It notes the extent of A. confertitesta’s phosphate storage to highlight the importance of the Wadden Sea intertidal zone in meeting Germany’s phosphorous needs.",
      "It quantifies phosphate storage by A. confertitesta in the Wadden Sea intertidal zone to emphasize that the species has an exceptionally high impact for a foraminifer.",
      "It offers a relative percentage to help convey the density of A. confertitesta in the Wadden Sea intertidal zone during population blooms.",
      "It introduces a point of comparison to illustrate the scale of the phosphate storage by A. confertitesta in the Wadden Sea intertidal zone."
    ],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Hard"
  },
  {
    module: 1,
    question_number: 8,
    passage: "Text 1\nFor thousands of years, O’odham farmers in the Sonoran desert of the southwestern US and northern Mexico have cultivated mesquite seeds and agave sap, sometimes planting these species together so that the mesquite trees provide shade for agaves. Doing so helps protect agaves from the harshest heat and light and thereby helps prevent soil moisture from evaporating.\n\nText 2\nAgaves are well adapted to growing in the desert but grow best when shaded. Inspired by O’odham farmers, who often strategically plant agaves in the shade of sun-hardy species like mesquite trees for protection from the sun and heat, Gary Nabhan and colleagues planted agaves in the shade of solar panels in the Sonoran desert and found that the plants grew well, suggesting to Nabhan and colleagues that the panels provide a benefit similar to that provided by mesquite trees.",
    prompt: "Based on the texts, the author of Text 1 and the author of Text 2 would most likely agree on which point?",
    options: [
      "Compared with Nabhan’s approach, the O’odham approach has the advantage of producing agave sap.",
      "Mesquite trees grow best when planted in shaded areas, while agaves do not require shade to thrive.",
      "Nabhan’s team’s method could be refined to more actively prevent soil moisture from evaporating.",
      "Mesquite trees can provide shade that protects agaves from high-intensity heat and light."
    ],
    correct_answer_index: 3,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 9,
    passage: "Ian Gilligan et al. claim that during the Ice Age, humans at Kamenka A in Siberia made fitted clothing by boring holes in pieces of hide and fur with a sharpened bone tool called an awl and then threading cord through the holes to bind the pieces together. Eventually, as evidenced by artifacts at Xiaogushan in East Asia, someone perforated the end of a bone awl to make an eye (hole) to hold the cord, thereby creating a sewing needle with which both steps could be performed in a single motion. This sped up the process of making clothing and, by freeing them from the need to push cord through holes manually, allowed artisans to make smaller holes and thus finer seams.",
    prompt: "Based on the text, what can be concluded about clothing made during the Ice Age?",
    options: [
      "Clothing made with awls at sites like Kamenka A likely had finer seams than clothing made with needles at sites like Xiaogushan did.",
      "Clothing made with awls at sites like Kamenka A likely had coarser seams than clothing made with needles at sites like Xiaogushan did.",
      "Clothing made with awls at sites like Kamenka A could likely be made more quickly than clothing made with needles at sites like Xiaogushan.",
      "Clothing made at sites like Kamenka A was likely made with needles, while clothing made at sites like Xiaogushan was likely made with awls."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 10,
    passage: "Home Video Game Systems of the 1970s and 1980s\n\n| System | Manufacturer | Type | Units Sold |\n| --- | --- | --- | --- |\n| ColecoVision | Coleco | console | 2,000,000 |\n| Intellivision | Mattel | console | 3,000,000 |\n| MSX | ASCII Corp. | computer | 4,000,000 |\n| Game & Watch | Nintendo | handheld | 18,600,000 |\n\nA student is writing a research paper on the global rise of the home video game industry during the 1970s and 1980s. The student is surprised by differences in the number of units sold by some systems compared to those sold by others. Most remarkably, the _______.",
    prompt: "Which choice most effectively uses data from the table to complete the statement?",
    options: [
      "MSX sold approximately 4,000,000 units, whereas the Intellivision sold only approximately 3,000,000 units.",
      "Game & Watch sold approximately 4,000,000 units, whereas the ColecoVision sold only approximately 3,000,000 units.",
      "Game & Watch sold approximately 18,600,000 units, whereas the ColecoVision sold only approximately 2,000,000 units.",
      "MSX sold approximately 18,600,000 units, whereas the Intellivision sold only approximately 2,000,000 units."
    ],
    correct_answer_index: 2,
    domain: "Information and Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 11,
    passage: "Percent of Leaf Area Consumed by Hornworms After 90 Minutes\n\n• Trial 1: Emitting leaves: 1.5%; Nonemitting leaves: 4.6%\n• Trial 2: Emitting leaves: 7.5%; Nonemitting leaves: 9.7%\n• Trial 3: Emitting leaves: 3.6%; Nonemitting leaves: 11.2%\n\nSome plants’ leaves emit a chemical compound (2-methyl-1,3-butadiene) that is thought to be a defense against insects. Researchers modified leaves of the same plant species so that some emitted the compound and others didn’t, then placed hornworms—leaf-eating insects—between leaves of both types and allowed the hornworms to feed for 90 minutes.",
    prompt: "Taken together, the text and graph best support which conclusion about 2-methyl-1,3-butadiene?",
    options: [
      "Although the compound’s emission deters most hornworms, a small percentage of hornworms appear insensitive to the compound and will consume leaves that emit it.",
      "Although the compound is toxic to hornworms, the insects will consume leaves that emit it even when leaves that don’t emit it are available.",
      "Although the compound’s emission does not entirely prevent leaf consumption by hornworms, its emission is associated with reduced leaf consumption.",
      "Although leaves emit the compound in response to insect feeding, it does not appear to significantly reduce leaf consumption by hornworms."
    ],
    correct_answer_index: 2,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 12,
    passage: "Monthly Temperatures and Wing Centroid Sizes of Fruit Fly Specimens\n\n| Month | High (°F) | Low (°F) | Male (mm) | Female (mm) |\n| --- | --- | --- | --- | --- |\n| May | 73 | 50 | 1.98 | 2.27 |\n| June | 80 | 56 | 2.01 | 2.31 |\n| July | 87 | 62 | 2.02 | 2.31 |\n| October | 67 | 44 | 1.98 | 2.29 |\n\nDrosophila (fruit flies) have generation times of 10–12 days, so seasonal changes in environmental conditions drive seasonal fluctuations in body size. Banu Şebnem Önder and Cansu Fidan Aksoy measured the wing sizes of members of a D. melanogaster population in Yeşilöz, Turkey. Their research suggests that Drosophila collected in relatively cooler months should tend to have lower reproductive fitness, as is illustrated by the finding that _______.",
    prompt: "Which choice most effectively uses data from the table to complete the assertion?",
    options: [
      "the average male wing centroid size was 1.98 mm in May but was 2.31 mm in June.",
      "the average female wing centroid size was smaller in May than in July.",
      "the average male wing centroid size was consistently smaller than the average female wing centroid size in all four months in the table.",
      "the average monthly low temperature was lower in May than in June."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 13,
    passage: "The bird species Cercomacra cinerascens (the gray antbird) shares territory with Thamnomanes caesius (the cinereous antshrike), which emits a loud alarm call when it detects predators. Biologist Ari Martínez and colleagues recorded T. caesius alarm calls and played them near wild C. cinerascens. Finding that the birds often froze or scattered into vegetation upon hearing the calls, they concluded that C. cinerascens associates T. caesius alarm calls with danger.",
    prompt: "Which finding, if true, would most directly support Martínez and colleagues’ conclusion?",
    options: [
      "Martínez and colleagues played alarm calls from different T. caesius individuals and observed no significant variation in the responses of C. cinerascens.",
      "When Martínez and colleagues played control sounds of random noise in the vicinity of C. cinerascens, the birds displayed no reaction.",
      "Other bird species than C. cinerascens also showed a tendency to freeze in place or scatter into vegetation when Martínez and colleagues played T. caesius alarm calls.",
      "In some instances, C. cinerascens froze in place or scattered into vegetation when Martínez and colleagues approached but before they began playing sounds."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 14,
    passage: "Ballet Nepantla of New York City is one of many dance companies devoted to baile folklórico. Although it represents the hybridization of Indigenous dance traditions of Mexico with Spanish dances, baile folklórico emerged with its present attributes only in the 1950s, when choreographer Amalia Hernández adapted participatory dances for passive theater audiences, interpolating elements of modern dance and classical ballet.",
    prompt: "Which quotation from a dance scholar would best support the text’s claim about the role of Amalia Hernández?",
    options: [
      "”The influence that modern dance and classical ballet exerted on Hernández can be seen in the complex and precisely orchestrated movements and spectator-focused orientation that continue to define baile folklórico.”",
      "”By reaffirming baile folklórico as a hybrid of Indigenous and colonial Spanish traditions, Hernández’s choreography had broad societal implications, fostering a sense of collective identity in Mexico and, later, in Mexican American communities.”",
      "”Hernández’s reliance on classical ballet and modern dance has been exaggerated; the subject matter and vocabulary of baile folklórico as popularized by her company remain rooted in the communal dances of Indigenous and colonial Spanish societies.”",
      "”Certain dances popularized by Hernández beginning in the 1950s appear in the repertoires of dance companies throughout Mexico and the United States but are nonetheless associated with specific Indigenous groups, specific colonial Spanish dances, or both.”"
    ],
    correct_answer_index: 0,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 15,
    passage: "In a study of groove, researchers expected that a song with a moderate-complexity rhythm, such as ”Space Cowboy” by the Steve Miller Band, would elicit higher groove ratings than a song with high-complexity rhythm, such as ”Soul Man” by Sam & Dave. This hypothesis was based on findings that moderate syncopation was associated with the highest groove ratings. Contrary to the hypothesis, the groove ratings participants gave for ”Space Cowboy” were generally _______.",
    prompt: "Which choice most logically completes the text?",
    options: [
      "higher than those for songs without syncopation.",
      "lower than those for ”Soul Man”.",
      "lowest among participants who were fans of the Steve Miller Band.",
      "highest among participants who were fans of Sam & Dave."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 16,
    passage: "Support for the argument that a ”consumer revolution” occurred in England between 1600 and 1750 has largely hinged on analyses of probate inventories. Reexamining these data, Gregory Clark notes that while inventories from the period appear consistent with the consumer-revolution argument, the proportion of the population whose wills included such documentation decreased considerably between 1600 and 1750, with this documentation increasingly representing more affluent individuals. Clark’s findings thus directly raise the possibility that _______.",
    prompt: "Which choice most logically completes the text?",
    options: [
      "scholars’ previous conclusions based on analysis of probate inventories from 1600 to 1750 overstated broader demographic shifts in the possession of consumer goods.",
      "wage increases in England between 1600 and 1750 did not account for the widespread acquisition of consumer goods among less-wealthy individuals.",
      "probate inventories from 1600 to 1750 that have been analyzed by scholars exaggerated the number of consumer goods that relatively prosperous individuals possessed.",
      "advocates of the consumer-revolution argument may have failed to account for the possibility that the increased acquisition of consumer goods in England between 1600 and 1750 was attributable to an increase in the proportion of wealthy individuals in the period."
    ],
    correct_answer_index: 0,
    domain: "Information and Ideas",
    difficulty: "Hard"
  },
  {
    module: 1,
    question_number: 17,
    passage: "Fulfilling their myriad duties with grace and goodwill, _______ in 2019.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "a total of 8,506,262 departing passengers were boarded by employees at Austin-Bergstrom International Airport",
      "Austin-Bergstrom International Airport saw a total of 8,506,262 departing passengers boarded by employees",
      "flights at Austin-Bergstrom International Airport were boarded by a total of 8,506,262 departing passengers",
      "employees at Austin-Bergstrom International Airport boarded a total of 8,506,262 departing passengers"
    ],
    correct_answer_index: 3,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 18,
    passage: "Early electronic telecommunications systems, like telegraphy, could only transmit basic text. The facsimile (or fax) system, developed in the 1980s, coupled rapid message transmission with the ability to accurately render formatting and _______ in legal transactions, for example, signed documents could now be transmitted across continents in minutes.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "handwriting-which",
      "handwriting,",
      "handwriting",
      "handwriting;"
    ],
    correct_answer_index: 3,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 19,
    passage: "Within Earth’s biomes, there are four main types of desert: arid, semiarid, coastal, and cold. The Great Salt Desert in western Asia is an arid desert, for _______ a total area of about 77,000 km², it is also one of the largest deserts of any type.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "example with",
      "example. With",
      "example, with",
      "example and with"
    ],
    correct_answer_index: 1,
    domain: "Standard English Conventions",
    difficulty: "Hard"
  },
  {
    module: 1,
    question_number: 20,
    passage: "There are numerous island nations and territories in the South Pacific region of _______ them Niue, an independent nation that is known as the Rock of Polynesia.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "Polynesia; among",
      "Polynesia among",
      "Polynesia, among",
      "Polynesia. Among"
    ],
    correct_answer_index: 2,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 21,
    passage: "Metagenomic analysis of chewed tree pitch unearthed at Sweden’s Huseby Klev archaeological site has revealed concrete information about Mesolithic humans’ dietary practices, the DNA analysis _______ consumption of hazelnuts, red deer, fish from the salmon family, and various bird species.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "will indicate",
      "indicates",
      "can indicate",
      "indicating"
    ],
    correct_answer_index: 3,
    domain: "Standard English Conventions",
    difficulty: "Hard"
  },
  {
    module: 1,
    question_number: 22,
    passage: "The process by which Colombian emeralds are created depends on specialized geological conditions, the gems typically _______ as hydrothermal fluids interact with carbon-rich black shales.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "can form",
      "will form",
      "forming",
      "form"
    ],
    correct_answer_index: 2,
    domain: "Standard English Conventions",
    difficulty: "Hard"
  },
  {
    module: 1,
    question_number: 23,
    passage: "Whereas humans have trichromatic vision (a function of having three types of cone cells in the retina), birds have tetrachromatic vision; _______ birds have a fourth type of cone cell in their retinas, one sensitive to ultraviolet (UV) light, which allows them to see UV-reflective patterns in plumage that reveal male-female distinctions invisible to human eyes.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: [
      "for example,",
      "likewise,",
      "in contrast,",
      "that is,"
    ],
    correct_answer_index: 3,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 24,
    passage: "Image-based modeling, used by digital artists to develop 3D assets for video games, yields objects with precise mathematical proportions. Granted, as they are formed from perfect geometric shapes, such 3D elements lack organic realism; _______ post-modeling processes such as surface texturing are needed to achieve the level of verisimilitude gamers expect.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: [
      "in sum,",
      "consequently,",
      "similarly,",
      "however,"
    ],
    correct_answer_index: 1,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 25,
    passage: "While researching a topic, a student has taken the following notes:\n• Merle Oberon (1911–1979) was an actress born in Mumbai (then known as Bombay), India.\n• She was of Indian, Maori, and Irish heritage.\n• She was the first Indian-born actress to be nominated for an Academy Award.\n• Early in her career, she played many nameless, uncredited roles, such as her role in The Three Passions (1928).\n• Later, she played many named, credited roles, such as Empress Josephine in Désirée (1954).",
    prompt: "The student wants to emphasize a similarity between the two films. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "The Three Passions and Désirée are both films that include Merle Oberon, the first Indian-born actress to be nominated for an Academy Award.",
      "The Three Passions (1928) was released early in Merle Oberon’s career, whereas Désirée (1954) came out later.",
      "In The Three Passions (1928), actress Merle Oberon played a nameless, uncredited role; however, in Désirée (1954), she played a credited role—that of Empress Josephine.",
      "Early in her career, Merle Oberon wasn’t listed in some film credits, such as the credits for the film The Three Passions, where she played a nameless, uncredited role."
    ],
    correct_answer_index: 0,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 26,
    passage: "While researching a topic, a student has taken the following notes:\n• Philosophers espousing presentism must contend with the truth-maker objection (TO): If past things don’t exist, what makes true statements about the past true?\n• 1996: Presentist philosopher John Bigelow proposed ”Lucretianism” (posits statements are made true by the world’s acceptance of past-tensed properties).\n• 2006: Presentist philosopher Craig Bourne proposed ”ersatz presentism” (posits statements are made true by an abstract ”ersatz” time outside temporal time).",
    prompt: "The student wants to distinguish Bourne’s proposed theory from Bigelow’s. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "The presentist approaches of Bigelow (1996) and Bourne (2006) differ in whether they consider truths about the past to be made true by anything at all.",
      "Following Bigelow’s 1996 proposal, Bourne accepted the existence of past-tensed properties to solve the truth-maker problem with one caveat.",
      "In contending with the truth-maker objection, ersatz presentism diverges from Lucretianism’s use of past-tensed properties by positing an ”ersatz” time-outside-time capable of representing past things.",
      "In 2006, Bourne proposed ersatz presentism, disagreeing with Bigelow’s earlier hypothesis that only present things exist."
    ],
    correct_answer_index: 2,
    domain: "Expression of Ideas",
    difficulty: "Hard"
  },
  {
    module: 1,
    question_number: 27,
    passage: "While researching a topic, a student has taken the following notes:\n• In 2011, Keller and Schubert asked thirty musicians to rate syncopated and unsyncopated rhythms.\n• Keller and Schubert: ”Syncopation produces expectancy violations...”\n• Keller and Schubert: ”Syncopated rhythms were enjoyed more and considered happier than unsyncopated rhythms.”\n• Ethan Hein: ”If you place your rhythmic accents where listeners expect them, then the music gets boring fast. If you place them where listeners don’t expect them, that’s where the fun starts.”",
    prompt: "The student wants to connect one of Keller and Schubert’s findings to Hein’s argument. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "Keller and Schubert’s finding that complexity ratings are not correlated significantly with enjoyment corroborates Hein’s argument that unsyncopated rhythms get ”boring fast.”",
      "Arguing that unsyncopated music ”gets boring fast,” Hein offers a possible reason why Keller and Schubert’s subjects enjoyed syncopated rhythms more than unsyncopated ones.",
      "Hein argues that syncopated rhythms are more exciting than unsyncopated ones, and indeed, Keller and Schubert’s subjects assessed syncopated rhythms for happiness and enjoyment.",
      "Happiness ratings were correlated with enjoyment in Keller and Schubert’s study, suggesting that syncopated rhythms are, in Hein’s words, ”where the fun starts.”"
    ],
    correct_answer_index: 1,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },

  // ================= MODULE 2 (Questions 28 to 54) =================
  {
    module: 2,
    question_number: 1,
    original_question_number: 28,
    passage: "More than fifty years ago, caiman lizards were brought from the tropical wetlands of Latin America to the United States. Caimans now thrive in southern Florida, where they are negatively affecting native species, from crowding out alligators and crocodiles to preying on turtles and snakes that are already _______ to ongoing stressors like habitat loss.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["threatening", "vulnerable", "sympathetic", "resistant"],
    correct_answer_index: 1,
    domain: "Craft and Structure",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 2,
    original_question_number: 29,
    passage: "The following text is from William Shakespeare’s circa 1601 play Twelfth Night. Viola is speaking to a Captain who has come to her aid.\n\nThere is a fair behaviour in thee Captain:\nAnd though that nature with a beauteous wall\nDoth oft close in pollution, yet of thee\nI will believe thou hast a mind that suits\nWith this thy fair and outward character.",
    prompt: "As used in the text, what do the first and second instances, respectively, of ”fair” most nearly mean?",
    options: [
      "Satisfactory, evenhanded",
      "Impartial, ample",
      "Honorable, pleasing",
      "Light, lawful"
    ],
    correct_answer_index: 2,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 3,
    original_question_number: 30,
    passage: "Researchers created data set J72T12G24 to train a machine learning model to select the best existing algorithm for determining manufacturers’ optimal production quantities while considering capacity constraints. Comprising 7,200 simulated production planning instances across twelve time periods, the data set systematically varies three critical factors: product demand patterns, production capacity utilization rates, and the balance between set-up and inventory holding costs.",
    prompt: "Which statement about data set J72T12G24 is best supported by the text?",
    options: [
      "The data set consists primarily of real manufacturing data collected from industrial settings, supplemented with simulated scenarios to fill gaps in production patterns.",
      "The data set was structured to primarily target unusual manufacturing conditions, including low production capacity utilization and fluctuating demand patterns.",
      "The data set was designed to ensure coverage of a range of hypothetical manufacturing situations in order to effectively teach the machine learning model.",
      "The data set represents the most frequently encountered manufacturing scenarios, assigning more significance to the most commonly occurring combinations of demand patterns."
    ],
    correct_answer_index: 2,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 4,
    original_question_number: 31,
    passage: "The Age of Innocence is a 1920 novel by Edith Wharton set in New York City in the 1870s. In the novel, Newland Archer attends an opera. Newland compares his intellect favorably to that of other men of New York City society who are in the audience.",
    prompt: "Which quotation from The Age of Innocence best illustrates the claim?",
    options: [
      "”Singly [the men around Newland] betrayed their inferiority; but grouped together they represented ’New York,’ and the habit of masculine solidarity made him accept their doctrine on all the issues called moral.”",
      "”Newland Archer felt himself distinctly the superior of these chosen specimens of old New York gentility; he had probably read more, thought more, and even seen a good deal more of the world, than any other man of the number.”",
      "”Though there was already talk...of a new Opera House which should compete in costliness and splendour with those of the great European capitals, the world of fashion was still content to reassemble every winter in the shabby red and gold boxes of the sociable old Academy [of Music].”",
      "”An unalterable and unquestioned law of the musical world required that the German text of French operas sung by Swedish artists should be translated into Italian for the clearer understanding of English-speaking audiences.”"
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 5,
    original_question_number: 32,
    passage: "The glossy ibis and the roseate spoonbill are long-legged birds that live in wetlands, like the Everglades in Florida. Laura D’Acunto and colleagues wanted to know how these birds choose an area in which to live. They looked at features of the birds’ habitats, such as the extent of tree-canopy coverage in the area and how deep the water is during breeding season. They found that although only glossy ibises prefer areas with deep water during breeding season, both glossy ibises and roseate spoonbills prefer areas that have standing water for at least 60 days per year. The researchers concluded that neither species is very drawn to areas where _______.",
    prompt: "Which choice most logically completes the text?",
    options: [
      "species with breeding seasons longer than 60 days are likely to be present.",
      "there is relatively deep water during the breeding season.",
      "there is standing water for far fewer than 60 days per year.",
      "there are any features that attract the other species."
    ],
    correct_answer_index: 2,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 6,
    original_question_number: 33,
    passage: "In a study of groove, researchers expected that a song with a moderate-complexity rhythm, such as ”Kashmir” by Led Zeppelin, would elicit higher groove ratings than a song with a high-complexity rhythm, such as ”Soul Man” by Sam & Dave. This hypothesis was based on findings that moderate syncopation was associated with the highest groove ratings. Contrary to the hypothesis, the groove ratings participants gave for ”Kashmir” were generally _______.",
    prompt: "Which choice most logically completes the text?",
    options: [
      "lower than those for ”Soul Man”.",
      "highest among participants who were fans of Sam & Dave.",
      "lowest among participants who were fans of Led Zeppelin.",
      "higher than those for songs without syncopation."
    ],
    correct_answer_index: 0,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 7,
    original_question_number: 34,
    passage: "Japanese bonsai artist Masashi Hirao has crafted an approach that transforms the acts of pruning, wiring, and planting trees into dynamic public performances. Audiences are entertained as they watch his creative process unfold, with Hirao rhythmically _______ trees to music.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["shape", "shapes", "shaping", "shaped"],
    correct_answer_index: 2,
    domain: "Standard English Conventions",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 8,
    original_question_number: 35,
    passage: "Seawater contains many trace elements that can be categorized in one of three ways based on their significance in sustaining living organisms: essential, possibly essential, or nonessential. Iodine, whose chemical symbol is _______ is classified as an essential element.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["I", "I:", "I,", "I–"],
    correct_answer_index: 2,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 9,
    original_question_number: 36,
    passage: "In 1856, nineteen-year-old chemist William Perkin attempted to synthesize artificial quinine from coal tar, an industrial waste product that, because of its availability and recently discovered amino _______ offered an economical alternative to expensive natural quinine extracted from tropical tree bark. Perkin’s failed experiments instead produced a brilliant purple solution that launched the synthetic dye industry.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["compounds,", "compounds", "compounds:", "compounds–"],
    correct_answer_index: 0,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 10,
    original_question_number: 37,
    passage: "The programming languages COBOL, developed by Grace Hopper in _______ developed by Evan Czaplicki in 2012, are all routinely translated into executable code by tools known as compilers.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "1959; Harbour, developed by Antonio Linares in 1999, and Elm,",
      "1959, Harbour developed by Antonio Linares in 1999; and Elm",
      "1959, Harbour; developed by Antonio Linares in 1999; and Elm,",
      "1959; Harbour, developed by Antonio Linares in 1999; and Elm,"
    ],
    correct_answer_index: 3,
    domain: "Standard English Conventions",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 11,
    original_question_number: 38,
    passage: "For her 2010 installation ”Dubling,” Brazilian artist Élida Tessler extracted every gerund from James Joyce’s novel _______ capped empty wine bottles and creating 4,311 postcards featuring images of Dublin’s River Liffey, she forged a visual connection between the flowing waters so central to Joyce’s narrative and the novel’s stream-of-consciousness style.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "Ulysses, stamping all 4,311 ”-ing” verbs onto individual corks. That",
      "Ulysses by stamping all 4,311 ”-ing” verbs onto individual corks that",
      "Ulysses. Stamping all 4,311 ”-ing” verbs onto individual corks that",
      "Ulysses, stamping all 4,311 ”-ing” verbs onto individual corks that"
    ],
    correct_answer_index: 2,
    domain: "Standard English Conventions",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 12,
    original_question_number: 39,
    passage: "Topographical prominence is a measure of a mountain’s independence from other mountains. Having 16,024 feet of prominence, _______.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "Puncak Jaya, a peak located in Indonesia, is ranked by geographers as the world’s 9th most prominent mountain.",
      "the ranking given by geographers to Puncak Jaya, a peak located in Indonesia, is 9th most prominent mountain in the world.",
      "the list of mountains geographers rank as the world’s most prominent includes Puncak Jaya, a peak located in Indonesia, at number 9.",
      "geographers have ranked Puncak Jaya, a peak in Indonesia, as the world’s 9th most prominent mountain."
    ],
    correct_answer_index: 0,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 13,
    original_question_number: 40,
    passage: "In January 1862, George Hitchings joined the US Navy. He went on to serve aboard the USS Kennebec during the US Civil War; _______ earned a place in US history as one of the war’s few Chinese-born American soldiers.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["usually,", "in any case,", "in doing so,", "for instance,"],
    correct_answer_index: 2,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 14,
    original_question_number: 41,
    passage: "When air near Earth’s surface is heated, it becomes less dense and rises upward. _______ cooler, denser air sinks downward, creating a circular movement of air called a convection current.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["In summary,", "As one example,", "As this occurs,", "Instead of that,"],
    correct_answer_index: 2,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 15,
    original_question_number: 42,
    passage: "The World Cup of men’s soccer, one of the biggest sporting events on the planet, brought 32 national teams from six continents to the host country, Russia, in 2018. _______ only 16 teams, most from Europe and the Americas, competed in the 1934 World Cup in Italy.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["In contrast,", "In other words,", "Therefore,", "For instance,"],
    correct_answer_index: 0,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 16,
    original_question_number: 43,
    passage: "The success of Career Path in Turku, Finland—an installation prompting viewers to think about what they wanted to be as a child and what they dream about today—exemplifies how collaborative art initiatives can _______ their communities in multiple ways, including enhancing public spaces and encouraging tourism.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["deny", "enrich", "predict", "avoid"],
    correct_answer_index: 1,
    domain: "Craft and Structure",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 17,
    original_question_number: 44,
    passage: "The following text is from Yung Wing’s 1909 memoir My Life in China and America. Yung Wing was the first person from China to graduate from a US university.\n\n<u>Little did I realize when in 1845 I wrote, while in the Morrison School, a composition on ”An Imaginary Voyage to New York and up the Hudson,” that I was to see New York in reality.</u> This incident leads me to the reflection that sometimes our imagination foreshadows what lies uppermost in our minds and brings possibilities within the sphere of realities.",
    prompt: "Which choice best describes the function of the underlined sentence in the text as a whole?",
    options: [
      "It indicates Yung’s unwillingness to distinguish between reality and fantasy as a child.",
      "It describes an event in Yung’s life that exemplifies a phenomenon.",
      "It illustrates the sense of adventure that Yung developed as a child.",
      "It foreshadows Yung’s eventual success as a writer."
    ],
    correct_answer_index: 1,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 18,
    original_question_number: 45,
    passage: "Economic interdependence means that different sectors of an economy rely on each other. For example, farmers need equipment manufacturers to produce tractors, while equipment manufacturers need farmers to buy their products. If a region’s farms have a successful harvest, farmers might earn more money and then purchase new equipment, benefiting the manufacturing sector. And if manufacturing businesses prosper, their employees might buy more food, benefiting farmers. However, interconnectedness also means that problems in one sector often affect other sectors.",
    prompt: "What is the main topic of the text?",
    options: [
      "How different economic sectors depend on each other",
      "The types of equipment that farmers need to grow crops",
      "Why different countries have different levels of economic growth",
      "The process of manufacturing farm equipment such as tractors"
    ],
    correct_answer_index: 0,
    domain: "Information and Ideas",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 19,
    original_question_number: 46,
    passage: "Poems is an 1895 collection of poetry by Frances E.W. Harper. In one of Harper’s poems, the speaker declares her intention to create art that has a universal appeal across generations.",
    prompt: "Which quotation from Poems most effectively illustrates the claim?",
    options: [
      "”Our world, so worn and weary, / Needs music, pure and strong, / To hush the jangle and discords / Of sorrow, pain, and wrong.” (from ”Songs for the People”)",
      "”God help our native land, / Bring surcease to her strife, / And shower from thy hand / A more abundant life.” (from ”God Bless Our Native Land”)",
      "”Let me make the songs for the people, / Songs for the old and young; / Songs to stir like a battle-cry / Wherever they are sung.” (from ”Songs for the People”)",
      "”There is the field, the vantage ground / For every earnest heart; / To side with justice, truth and right / And act a noble part.” (from ”The Present Age”)"
    ],
    correct_answer_index: 2,
    domain: "Information and Ideas",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 20,
    original_question_number: 47,
    passage: "In a study of the effects of music tempo (measured in beats per minute, or bpm) during exercise, participants rode a bicycle for 30 minutes while listening to Beyoncé’s ”Irreplaceable” (88 bpm) continuously. Researchers anticipated that when participants performed the same activity the following day while listening to Led Zeppelin’s ”Rock and Roll” (169 bpm), they would ride more quickly. Participants’ performance on the second day, however, may have been negatively affected by tiredness from the first day. Thus, _______.",
    prompt: "Which choice most logically completes the text?",
    options: [
      "the researchers were unable to accurately measure how quickly participants rode on the second day.",
      "participants’ prior familiarity with the songs may have contributed to differences in performance over the two days.",
      "participants demonstrated a preference for one song over the other.",
      "the results from the second day may lead to an underestimation of the effect of the faster song."
    ],
    correct_answer_index: 3,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 21,
    original_question_number: 48,
    passage: "In a study that focused on how dogs respond to other dogs’ facial expressions, researchers monitored the dogs’ heart rates to ensure the dogs were not distressed by the experiments _______. The researchers reported that the dogs’ heart rates remained stable, suggesting they were relaxed during the experiment.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["conducting", "to conduct", "conducts", "conducted"],
    correct_answer_index: 3,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 22,
    original_question_number: 49,
    passage: "The US Library of Congress holds the only surviving copy of Martin Waldseemüller’s 1507 world map, the first document to use the name ”America” to refer to land in the Western Hemisphere. Historians now regard this as one of the most significant _______ in early European cartography.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["developments,", "developments", "developments–", "developments:"],
    correct_answer_index: 1,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 23,
    original_question_number: 50,
    passage: "Laura Grieneisen, whose research focuses mainly on primates, _______ as a biologist at the University of Minnesota.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["have worked", "are working", "work", "works"],
    correct_answer_index: 3,
    domain: "Standard English Conventions",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 24,
    original_question_number: 51,
    passage: "The star Alnitak is unvaryingly bright, consistently ranking as one of the brightest stars in the sky (Alnitak ranked 32nd on a recent list). By contrast, the brightness of the red giant Betelgeuse varies considerably. Indeed, between April and June 2023, Betelgeuse became an astonishing 40% brighter; _______ its ranking rose from 10th to 7th.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["in turn,", "specifically,", "for example,", "in sum,"],
    correct_answer_index: 0,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 25,
    original_question_number: 52,
    passage: "During the Tournaisian, an age spanning 346.7 to 358.9 million years ago, Earth underwent many significant geologic and evolutionary changes. _______ it experienced not only glaciation in East Gondwana but also the proliferation of large lycopodian trees.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: ["In addition,", "Likewise,", "In particular,", "By comparison,"],
    correct_answer_index: 2,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 26,
    original_question_number: 53,
    passage: "While researching a topic, a student has taken the following notes:\n• For centuries in Japan, it was common practice for farmers to cultivate terraced rice fields (tanada).\n• Tanada were built by carving steep hillsides into flat steps to increase arable land.\n• The Ryōai tanada in Ōita Prefecture, Japan, was developed during the Edo period.\n• The Edo period (1603 CE–1867 CE) was characterized by peace and economic stability.\n• Active tanada cultivation has been in decline since the 1960s.",
    prompt: "The student wants to place the Ryōai rice field within its historical context. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "The Ryōai tanada was built when farmers carved a series of large, flat steps into the steep hillsides of Ōita Prefecture.",
      "With some dating back to the Edo period, the historic rice terraces of Japan have been in decline since the 1960s.",
      "For centuries, Japanese farmers cultivated terraced rice fields, or tanada, like the one in Ōita Prefecture.",
      "The Ryōai tanada was developed during the Edo period, a time of Japanese history characterized by peace and economic stability."
    ],
    correct_answer_index: 3,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 27,
    original_question_number: 54,
    passage: "Some astrobiologists have proposed that brine—water with a concentration of dissolved solids of more than 3.5%—may present conditions conducive to the evolution of life on extraterrestrial bodies. Unfortunately, remote observation is not sensitive enough to provide much information about the composition or existence of brines. Although studying meteorites found on Earth to infer information about brines from mineral deposits is possible in principle, interactions with Earth’s atmosphere have likely altered or eliminated most of those deposits.",
    prompt: "Which choice best describes the overall structure of the text?",
    options: [
      "It describes a proposal about extraterrestrial brines that some astrobiologists have advanced, then presents evidence calling that proposal into question.",
      "It discusses the difficulty of studying extraterrestrial brines directly, then suggests studying them via mineral deposits on meteorites.",
      "It explains why extraterrestrial brines are of interest to astrobiologists, then discusses why such brines are likely rare.",
      "It suggests the potential utility of studying extraterrestrial brines, then presents reasons why doing so is challenging."
    ],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Medium"
  }
];

// Helper to escape CSV values
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

// Generate CSV file matching standard format
function exportToCsv() {
  const csvPath = path.join(__dirname, '..', 'question', '2026_sep_int_2.csv');
  const headers = ['module', 'question_number', 'passage', 'prompt', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'image_url'];
  
  const rows = [headers.join(',')];
  for (const q of rawQuestions) {
    rows.push([
      escapeCsv(q.module),
      escapeCsv(q.question_number),
      escapeCsv(q.passage),
      escapeCsv(q.prompt),
      escapeCsv(q.options[0] || ''),
      escapeCsv(q.options[1] || ''),
      escapeCsv(q.options[2] || ''),
      escapeCsv(q.options[3] || ''),
      escapeCsv(q.correct_answer_index),
      escapeCsv('')
    ].join(','));
  }

  fs.writeFileSync(csvPath, rows.join('\n'), 'utf8');
  console.log(`✅ CSV exported successfully to: ${csvPath}`);
}

async function updateBackupFile(assignedTestId) {
  const backupPath = path.join(__dirname, '..', 'backup_all_tests.json');
  if (!fs.existsSync(backupPath)) {
    console.warn('backup_all_tests.json not found, skipping backup update.');
    return;
  }

  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

  // Determine or assign test id
  let testObj = backup.tests.find(t => t.title === TEST_TITLE);
  if (!testObj) {
    if (!assignedTestId) {
      const maxId = backup.tests.reduce((max, t) => Math.max(max, t.id || 0), 0);
      assignedTestId = maxId + 1;
    }
    testObj = {
      id: assignedTestId,
      title: TEST_TITLE,
      type: TEST_TYPE,
      allow_practice: 1,
      total_time_minutes: 64,
      total_questions: rawQuestions.length
    };
    backup.tests.push(testObj);
  } else {
    assignedTestId = testObj.id;
    testObj.total_time_minutes = 64;
    testObj.total_questions = rawQuestions.length;
  }

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

  // 1. Export CSV
  exportToCsv();

  // 2. Update backup JSON file
  const backupTestId = await updateBackupFile();

  // 3. Try MySQL connection if available
  let connection;
  try {
    if (!process.env.DB_HOST) {
      console.log('No DB_HOST defined in .env, skipping MySQL direct import.');
      return;
    }
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
