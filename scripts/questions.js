// ====================================
// SAT Questions Data – 27 Questions
// ====================================

const SAT_QUESTIONS = [
  {
    id: 1,
    passage: `Janis Joplin's raw, soulful vocals cemented her status as one of the most iconic rock artists of the 1960s. However, prior to her meteoric rise to fame with Big Brother and the Holding Company, Joplin had been a dedicated student of the blues, deeply influenced by earlier artists like Bessie Smith and Lead Belly. This musical foundation _______ her later performance style, giving her the emotional depth that captivated millions.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["contradicted", "informed", "stifled", "mimicked"],
    answer: 1
  },
  {
    id: 2,
    passage: `In a study of urban green spaces, researchers found that cities with more parks and tree-lined streets had significantly lower rates of stress-related illnesses among residents. The study controlled for income levels, access to healthcare, and other socioeconomic factors. The researchers concluded that urban greenery provides a _______ effect on mental health, reducing cortisol levels and promoting psychological well-being.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["detrimental", "negligible", "restorative", "paradoxical"],
    answer: 2
  },
  {
    id: 3,
    passage: `The following text is from Charlotte Brontë's 1847 novel <em>Jane Eyre</em>.\n\nI could not unlove him now, merely because I found that he had ceased to notice me—because I might pass hours in his presence, and he would never once turn his eyes in my direction—because I saw all his attentions appropriated by a great lady, who scorned to touch me with the hem of her robes as she passed.`,
    question: "Which choice best states the main idea of the text?",
    options: [
      "The narrator is angry at being ignored by someone she cares about.",
      "The narrator's feelings persist despite a lack of reciprocation.",
      "The narrator is jealous of a woman who receives more attention.",
      "The narrator regrets having developed feelings for someone unavailable."
    ],
    answer: 1
  },
  {
    id: 4,
    passage: `Coral reefs, often called the "rainforests of the sea," support approximately 25% of all marine species despite covering less than 1% of the ocean floor. Marine biologist Dr. Elena Vasquez has been studying the symbiotic relationship between coral polyps and zooxanthellae algae. Her research indicates that rising ocean temperatures disrupt this partnership, causing the coral to expel the algae in a process known as bleaching. Without the algae, the coral loses its primary source of nutrition and its vibrant coloration, leaving it _______ and vulnerable to disease.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["embellished", "diminished", "fortified", "replicated"],
    answer: 1
  },
  {
    id: 5,
    passage: `Text 1:\nSociologist James Harrison argues that social media platforms have fundamentally altered how communities form and maintain bonds. He contends that online interactions, while different from face-to-face communication, create meaningful and lasting connections that transcend geographic boundaries.\n\nText 2:\nPsychologist Maria Chen's research suggests that heavy social media use is correlated with increased feelings of isolation and loneliness. Her longitudinal study of 2,000 participants found that those who spent more than three hours daily on social platforms reported lower satisfaction with their real-world relationships.`,
    question: "Based on the texts, how would Chen (Text 2) most likely respond to Harrison's argument in Text 1?",
    options: [
      "By agreeing that online connections are as meaningful as in-person relationships.",
      "By suggesting that the quality of online connections may not compensate for reduced in-person interaction.",
      "By arguing that social media should be banned to protect mental health.",
      "By proposing that geographic boundaries are irrelevant to forming communities."
    ],
    answer: 1
  },
  {
    id: 6,
    passage: `The development of CRISPR-Cas9 gene editing technology has revolutionized molecular biology. Scientists can now make precise modifications to DNA sequences with unprecedented accuracy. However, the technology raises significant ethical questions, particularly regarding its potential use in human germline editing—changes that would be _______ to future generations.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["confined", "transmitted", "restricted", "attributed"],
    answer: 1
  },
  {
    id: 7,
    passage: `The ancient city of Petra, carved into rose-red cliffs in modern-day Jordan, was the capital of the Nabataean Kingdom from roughly the 4th century BCE to the 1st century CE. The Nabataeans were master hydraulic engineers who constructed an elaborate system of dams, cisterns, and water channels to sustain their desert city. This infrastructure allowed Petra to support a population of approximately 30,000 people in an environment that receives less than six inches of rainfall annually—a remarkable feat of engineering that _______ the conventional assumption that large urban centers cannot thrive in arid regions.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["reinforces", "validates", "challenges", "presupposes"],
    answer: 2
  },
  {
    id: 8,
    passage: `While researching a topic, a student has taken the following notes:\n\n• The Giant's Causeway is a geological formation on the coast of Northern Ireland.\n• It consists of approximately 40,000 interlocking basalt columns.\n• The columns formed 50–60 million years ago during a period of intense volcanic activity.\n• Most columns are hexagonal, though some have four, five, seven, or eight sides.\n• According to Irish legend, the giant Fionn mac Cumhaill built the causeway to cross the sea to Scotland.`,
    question: "The student wants to emphasize the scientific explanation for the Giant's Causeway. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "The Giant's Causeway, a formation of approximately 40,000 basalt columns, is located on the coast of Northern Ireland.",
      "Irish legend attributes the Giant's Causeway to the giant Fionn mac Cumhaill, who supposedly built it to reach Scotland.",
      "The Giant's Causeway's approximately 40,000 interlocking basalt columns were formed by intense volcanic activity 50–60 million years ago.",
      "Most of the Giant's Causeway's columns are hexagonal, but some have four, five, seven, or eight sides."
    ],
    answer: 2
  },
  {
    id: 9,
    passage: `Recent archaeological discoveries in Göbekli Tepe, Turkey, have forced historians to reconsider the timeline of human civilization. The site, dating to approximately 9600 BCE, contains elaborate stone pillars arranged in circles, carved with intricate animal reliefs. What makes this discovery particularly _______ is that it predates the development of agriculture by at least a millennium, suggesting that complex ritual behavior and monumental architecture may have preceded, rather than followed, the transition to farming.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["predictable", "controversial", "significant", "conventional"],
    answer: 2
  },
  {
    id: 10,
    passage: `The following text is from Langston Hughes's 1926 essay "The Negro Artist and the Racial Mountain."\n\nWe younger Negro artists who create now intend to express our individual dark-skinned selves without fear or shame. If white people are pleased we are glad. If they are not, it doesn't matter. We know we are beautiful. And ugly too. The tom-tom cries and the tom-tom laughs. If colored people are pleased we are glad. If they are not, their displeasure doesn't matter either.`,
    question: "Which choice best describes the function of the underlined sentence in the text as a whole?",
    options: [
      "It establishes the author's desire for approval from all audiences.",
      "It conveys the artists' commitment to authentic self-expression regardless of external opinion.",
      "It suggests that the artists are indifferent to the quality of their work.",
      "It reveals a conflict between different audience expectations."
    ],
    answer: 1
  },
  {
    id: 11,
    passage: `A team of astronomers studying exoplanets has identified a rocky planet, designated K2-18b, orbiting within the habitable zone of its star. Spectroscopic analysis of the planet's atmosphere revealed the presence of water vapor and, more surprisingly, dimethyl sulfide—a molecule that on Earth is produced primarily by living organisms. While the researchers caution that non-biological processes could potentially account for the dimethyl sulfide, they acknowledge that the finding _______ the possibility that the planet may harbor some form of life.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["eliminates", "bolsters", "undermines", "resolves"],
    answer: 1
  },
  {
    id: 12,
    passage: `The Harlem Renaissance of the 1920s and 1930s produced an extraordinary flowering of African American art, literature, and music. Among its most celebrated figures was Zora Neale Hurston, whose novel <em>Their Eyes Were Watching God</em> (1937) drew heavily on the folk traditions and vernacular speech of the rural Black South. Although the novel was initially criticized by some contemporaries—notably Richard Wright, who dismissed it as lacking social protest—later scholars have recognized Hurston's work as a pioneering exploration of Black women's interiority and autonomy.`,
    question: "According to the text, Richard Wright's criticism of Hurston's novel was based on the idea that the work",
    options: [
      "failed to accurately represent Southern folk traditions.",
      "was too focused on urban experiences.",
      "did not sufficiently address social and political issues.",
      "lacked literary merit compared to other Harlem Renaissance works."
    ],
    answer: 2
  },
  {
    id: 13,
    passage: `In economics, the concept of "moral hazard" refers to the tendency of individuals or institutions to take on greater risks when they are insulated from the consequences of those risks. During the 2008 financial crisis, many critics argued that the government's bailout of major banks created a moral hazard: by rescuing institutions deemed "too big to fail," the government effectively _______ future reckless behavior, since banks could reasonably expect to be rescued again.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["discouraged", "incentivized", "penalized", "overlooked"],
    answer: 1
  },
  {
    id: 14,
    passage: `While researching a topic, a student has taken the following notes:\n\n• Maria Sibylla Merian (1647–1717) was a German-born naturalist and scientific illustrator.\n• She is best known for her detailed illustrations of insects and plants.\n• In 1699, at age 52, she traveled to Suriname in South America to study tropical insects.\n• Her two-year expedition resulted in the publication of <em>Metamorphosis Insectorum Surinamensium</em> (1705).\n• The book contained 60 detailed engravings showing insects in their natural habitats alongside the plants they fed on.`,
    question: "The student wants to highlight the uniqueness of Merian's expedition. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "Maria Sibylla Merian was a German-born naturalist who created detailed illustrations of insects and plants.",
      "Merian's book Metamorphosis Insectorum Surinamensium contained 60 detailed engravings of insects in their natural habitats.",
      "At the age of 52, Merian undertook a remarkable two-year expedition to Suriname—an unusual journey for a European woman in the late 17th century—to study and document tropical insects.",
      "Merian is remembered as one of the most important scientific illustrators of the early modern period."
    ],
    answer: 2
  },
  {
    id: 15,
    passage: `The octopus is widely regarded as the most intelligent invertebrate. Studies have demonstrated that octopuses can solve complex puzzles, use tools, and even exhibit what appears to be play behavior. Their neural architecture is remarkably different from that of vertebrates: rather than concentrating neurons in the brain, octopuses distribute roughly two-thirds of their neurons throughout their eight arms. This decentralized nervous system means that each arm can _______ taste, touch, and make basic decisions semi-independently, even when severed from the body.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["process", "ignore", "transmit", "generate"],
    answer: 0
  },
  {
    id: 16,
    passage: `The following text is from F. Scott Fitzgerald's 1925 novel <em>The Great Gatsby</em>.\n\nIn my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. "Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven't had the advantages that you've had."`,
    question: "Based on the text, the narrator's father's advice primarily encourages the narrator to",
    options: [
      "avoid forming opinions about other people entirely.",
      "recognize that differences in circumstances may account for differences in behavior.",
      "pursue opportunities that others have not had access to.",
      "criticize only those who have had similar advantages."
    ],
    answer: 1
  },
  {
    id: 17,
    passage: `Text 1:\nLinguist Noam Chomsky has long argued that the human capacity for language is innate—that our brains contain a "universal grammar" that provides the foundational structure for all human languages. According to this view, children do not learn language purely through imitation but rather activate an inborn linguistic framework.\n\nText 2:\nCognitive scientist Michael Tomasello contends that language acquisition is fundamentally a social process. His research on child language development emphasizes the role of joint attention, shared intentionality, and cultural learning. Tomasello argues that children learn language through pattern recognition and social interaction, without needing to posit an innate grammatical module.`,
    question: "Based on the texts, both Chomsky and Tomasello would most likely agree that",
    options: [
      "children learn language exclusively through imitation of adult speech.",
      "language development involves cognitive processes that go beyond simple imitation.",
      "universal grammar is the primary mechanism underlying language acquisition.",
      "social interaction plays no role in language development."
    ],
    answer: 1
  },
  {
    id: 18,
    passage: `Researchers studying the microbiome—the trillions of microorganisms living in and on the human body—have discovered that the composition of gut bacteria can significantly influence mood and behavior. In one experiment, mice raised in sterile environments (and thus lacking gut bacteria) displayed elevated levels of anxiety-like behavior compared to mice with normal gut flora. When the sterile mice were colonized with bacteria from calm mice, their anxiety-like behavior _______, suggesting a direct link between gut microbiota and psychological states.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["intensified", "persisted", "diminished", "fluctuated"],
    answer: 2
  },
  {
    id: 19,
    passage: `The concept of "desire paths"—the unofficial trails worn into landscapes by pedestrians who deviate from paved walkways—has become an influential metaphor in urban planning. Some architects now deliberately delay installing permanent paths in new developments, instead allowing foot traffic to create desire paths over several months. The resulting trails are then paved, producing a layout that _______ reflects how people actually use the space rather than how planners imagine they will.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["approximately", "organically", "temporarily", "artificially"],
    answer: 1
  },
  {
    id: 20,
    passage: `The Ming Dynasty (1368–1644) is often celebrated for its cultural achievements, particularly in the production of porcelain and the construction of the Forbidden City. However, historian Timothy Brook argues that the dynasty's most transformative legacy may be its role in establishing early global trade networks. Through maritime expeditions led by Admiral Zheng He and the expansion of overland Silk Road routes, Ming China became a central node in an increasingly interconnected world economy. Brook suggests that understanding this commercial _______ is essential for appreciating how the modern global economy emerged.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["isolation", "infrastructure", "competition", "decline"],
    answer: 1
  },
  {
    id: 21,
    passage: `The following text is adapted from Virginia Woolf's 1929 essay <em>A Room of One's Own</em>.\n\nA woman must have money and a room of her own if she is to write fiction. This may sound simple enough, but it carries profound implications when set against the history of women's material circumstances. For most of recorded history, women have been denied both financial independence and private space—two conditions that Woolf regarded as prerequisites for creative work.`,
    question: "Which choice best states the main idea of the text?",
    options: [
      "Women have historically been more creative than men despite having fewer resources.",
      "Financial independence and personal space are presented as necessary conditions for women's literary production.",
      "Woolf believed that fiction writing requires no special resources.",
      "The quality of fiction depends primarily on the author's financial situation."
    ],
    answer: 1
  },
  {
    id: 22,
    passage: `Quantum entanglement—a phenomenon Albert Einstein famously dismissed as "spooky action at a distance"—occurs when two particles become correlated in such a way that measuring the state of one particle instantaneously determines the state of the other, regardless of the distance between them. While this might seem to violate the principle that nothing can travel faster than light, physicists emphasize that entanglement cannot be used to transmit information, thereby preserving the _______ of Einstein's theory of relativity.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["ambiguity", "integrity", "complexity", "novelty"],
    answer: 1
  },
  {
    id: 23,
    passage: `While researching a topic, a student has taken the following notes:\n\n• The axolotl is a salamander native to Lake Xochimilco in Mexico City.\n• Unlike most amphibians, axolotls retain their larval features throughout adulthood (a condition called neoteny).\n• Axolotls can regenerate lost limbs, heart tissue, and even portions of their brains.\n• Scientists are studying axolotl regeneration to develop potential treatments for human injuries.\n• The species is critically endangered in the wild due to habitat destruction and invasive species.`,
    question: "The student wants to emphasize the potential medical applications of studying axolotls. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "The axolotl, a salamander native to Mexico City's Lake Xochimilco, is critically endangered due to habitat loss.",
      "Axolotls are unusual among amphibians because they retain their larval features throughout their lives.",
      "Scientists are studying the axolotl's remarkable ability to regenerate limbs, heart tissue, and brain matter in hopes of developing new treatments for human injuries.",
      "The axolotl's habitat in Lake Xochimilco has been threatened by urbanization and the introduction of invasive species."
    ],
    answer: 2
  },
  {
    id: 24,
    passage: `In 1848, a railroad construction foreman named Phineas Gage survived a dramatic accident in which an iron rod was driven through his skull, destroying much of his left frontal lobe. Although Gage recovered physically and retained his cognitive abilities, his personality reportedly changed dramatically—he became impulsive, irreverent, and unable to follow through on plans. The case of Phineas Gage was _______ in the history of neuroscience because it provided some of the earliest evidence that specific brain regions are associated with personality and decision-making.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["inconsequential", "redundant", "pivotal", "contentious"],
    answer: 2
  },
  {
    id: 25,
    passage: `Text 1:\nEconomist Thomas Piketty argues in <em>Capital in the Twenty-First Century</em> that the rate of return on capital consistently exceeds the rate of economic growth, leading to an inevitable concentration of wealth among those who already possess capital. He proposes a global wealth tax as the most effective remedy.\n\nText 2:\nEconomist Daron Acemoglu contends that while wealth inequality is a genuine concern, Piketty's analysis overlooks the role of political institutions. Acemoglu argues that inequality is primarily driven by extractive political systems that allow elites to shape economic rules in their favor, and that institutional reform—rather than taxation alone—is the key to addressing inequality.`,
    question: "Based on the texts, Acemoglu would most likely characterize Piketty's proposed solution as",
    options: [
      "unnecessarily radical in its scope.",
      "addressing a symptom rather than the underlying cause of inequality.",
      "effective but politically unfeasible.",
      "based on a misunderstanding of how capital markets function."
    ],
    answer: 1
  },
  {
    id: 26,
    passage: `The baobab tree, native to Africa and Australia, has evolved remarkable adaptations for surviving in arid environments. Its massive trunk can store up to 32,000 gallons of water, and its leaves are deciduous—shed during the dry season to minimize water loss through transpiration. The tree's thick, fire-resistant bark provides further protection against the bushfires common in savanna ecosystems. These adaptations have allowed the baobab to thrive in conditions that would be _______ to most other tree species.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["hospitable", "advantageous", "inhospitable", "imperceptible"],
    answer: 2
  },
  {
    id: 27,
    passage: `The Japanese concept of <em>wabi-sabi</em> embraces imperfection, impermanence, and incompleteness as fundamental aspects of beauty. Rooted in Zen Buddhist philosophy, <em>wabi-sabi</em> finds aesthetic value in objects that bear the marks of age, wear, and natural processes—a cracked ceramic bowl repaired with gold (<em>kintsugi</em>), for example, is considered more beautiful than an unblemished one. This perspective stands in stark _______ to Western aesthetic traditions that have historically prized symmetry, permanence, and flawlessness.`,
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["harmony", "contrast", "alignment", "proportion"],
    answer: 1
  }
];

const SAT_MATH_QUESTIONS = Array.from({ length: 44 }).map((_, i) => {
  const existing = [
    {
      id: 1,
      question: "If 3x - y = 12 and y = 3, what is the value of x?",
      options: ["3", "4", "5", "6"],
      answer: 2
    },
    {
      id: 2,
      question: "A line in the xy-plane passes through the origin and has a slope of 1/7. Which of the following points lies on the line?",
      options: ["(0, 7)", "(1, 7)", "(7, 1)", "(14, 2)"],
      answer: 2
    },
    {
      id: 3,
      question: "If f(x) = -2x + 5, what is f(-3x) equal to?",
      options: ["-6x + 5", "6x + 5", "6x - 5", "-6x - 5"],
      answer: 1
    },
    {
      id: 4,
      question: "In the xy-plane, the graph of the quadratic function y = ax^2 + c is a parabola that opens upward and has its vertex at the origin. Which of the following must be true?",
      options: ["a < 0 and c = 0", "a > 0 and c = 0", "a > 0 and c > 0", "a < 0 and c < 0"],
      answer: 1
    },
    {
      id: 5,
      question: "A cylinder has a radius of 4 and a height of 10. A cone has the same base radius and height. What is the ratio of the volume of the cone to the volume of the cylinder?",
      options: ["1:3", "1:2", "2:3", "3:4"],
      answer: 0
    },
    {
      id: 6,
      question: "The function g(x) = x^2 - 4x + 3 is graphed in the xy-plane. What are the x-intercepts of the graph?",
      options: ["(1, 0) and (3, 0)", "(-1, 0) and (-3, 0)", "(0, 1) and (0, 3)", "(-1, 0) and (3, 0)"],
      answer: 0
    }
  ];
  return existing[i] || {
    id: i + 1,
    question: `Dummy Math Question ${i + 1}: Solve for x: 2x = ${2 * (i + 1)}`,
    options: [`${i}`, `${i + 1}`, `${i + 2}`, `${i + 3}`],
    answer: 1
  };
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SAT_QUESTIONS, SAT_MATH_QUESTIONS };
}
