require('dotenv').config({ override: true });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const TEST_TITLE = '10 2026 I';
const TEST_TYPE = 'reading';

const rawQuestions = [
  // ================= MODULE 1 (Questions 1 to 27) =================
  {
    module: 1,
    question_number: 1,
    original_question_number: 1,
    passage: "The following text is from Jacqueline Woodson’s 2018 novel Harbor Me.\n\nI’ve pulled the voice recorder from my closet and have it sitting on the middle of my bed now. When I press play, Esteban’s voice fills my room.",
    prompt: "As used in the text, what does the word “pulled” most nearly mean?",
    options: [
      "Attracted",
      "Developed",
      "Taken",
      "Surprised"
    ],
    correct_answer_index: 2,
    domain: "Craft and Structure",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 2,
    original_question_number: 2,
    passage: "Nancy Bird-Walton, who was an aviation pioneer, undoubtedly accomplished much, but to gain a lasting place in our historical memory, there is little that can _______ being the first to do something. For example, people will always remember that Amelia Earhart was the first woman to fly solo across the Atlantic Ocean.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: [
      "overreach by",
      "constrain within",
      "prevail over",
      "fluctuate with"
    ],
    correct_answer_index: 2,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 3,
    original_question_number: 3,
    passage: "Car manufacturers increasingly label certain vehicle components as “lifetime” parts that supposedly never need replacement. Mechanics tend to greet such assertions _______, as ample experience has shown them that environmental factors, varied driving conditions, and intensive use will likely lead to the eventual failure of these components.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: [
      "ambivalently",
      "skeptically",
      "hastily",
      "unreasonably"
    ],
    correct_answer_index: 1,
    domain: "Craft and Structure",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 4,
    original_question_number: 4,
    passage: "From mosaics like Four Seasons by Marc Chagall, found at Chase Tower, to street art like Joseph “Sentrock” Perez’s mural Fly Higher on South Wood Street, Chicago offers an array of works to _______ the tastes of art lovers.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: [
      "mitigate",
      "supplant",
      "venerate",
      "satiate"
    ],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 5,
    original_question_number: 5,
    passage: "With examples ranging from Dean’s Blue Hole in the Bahamas to Nancy’s Blue Hole in the Abaco Islands, blue holes are large underwater sinkholes: pits filled with dark blue water that contrasts with lighter blue shallower waters surrounding them. The formation of blue holes typically involves several natural processes, including sea level changes. Currently, the deepest blue hole on record is the Taam Ja’ Blue Hole in Chetumal Bay, Mexico, which is reported by Teresa Álvarez-Legorreta and colleagues as extending at least 420 meters below sea level.",
    prompt: "Which choice best describes the overall structure of the text?",
    options: [
      "It defines a kind of sinkhole, describes its typical appearance and formation, and provides information about the deepest known sinkhole.",
      "It describes the appearance of a particular type of sinkhole, compares the formations of two sinkholes of that type, and then names the researchers who discovered the deepest known sinkhole of that type.",
      "It explains how a particular sinkhole formed, evaluates that sinkhole’s unusual appearance, and names a research team that is studying the sinkhole.",
      "It compares a deep sinkhole to a shallower one, details the processes by which both sinkholes formed, and emphasizes the remarkable depth of the deeper sinkhole."
    ],
    correct_answer_index: 0,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 6,
    original_question_number: 6,
    passage: "Text 1\nThe novels of Henry James changed stylistically starting in 1902, becoming more demanding and featuring a much more measured pace than his earlier works. <u>This style places a burden on readers that they may not be prepared for: James’s late novels are some of the best he wrote, but they are not for everyone.</u>\n\nText 2\nThe films of Martin Scorsese released starting in 2016 have the same place in his filmography that the late novels of Henry James have in his bibliography. Both are works by proven masters—James had published The American (1877); Scorsese had directed Taxi Driver (1976)—who began to make demanding works, such as James’s The Ambassadors (1903) and Scorsese’s Silence (2016), that ask more of their audiences than their earlier works do but give more in return.",
    prompt: "Based on the texts, how would the author of Text 2 most likely respond to the underlined claim in Text 1?",
    options: [
      "By asserting that both James and Scorsese ought to be considered masters of their chosen art forms",
      "By conceding that James’s The American is a superior novel to The Ambassadors",
      "By arguing that James’s novels cannot be fully understood without also considering Scorsese’s films",
      "By agreeing that James’s late novels are excellent but can be challenging for their readers"
    ],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Hard"
  },
  {
    module: 1,
    question_number: 7,
    original_question_number: 7,
    passage: "The following text is from Hilda Eunice Burgos’s 2018 novel Ana María Reyes Does Not Live in a Castle. The narrator is in sixth grade.\n\nThe next day I went to my piano lesson, as I did every Tuesday after school. My piano teacher, Doña Dulce Sánchez, lived two blocks from my school, in the opposite direction from my house.",
    prompt: "According to the text, where did the narrator’s piano teacher live?",
    options: [
      "Near the center of town",
      "Two blocks from the narrator’s school",
      "Five blocks from the narrator’s home",
      "Next to where the narrator’s home is"
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 8,
    original_question_number: 8,
    passage: "From polar bears to aphid wasps, many animals practice some form of brood care (caring for offspring). Yanzhe Fu and colleagues claim to have found the earliest evidence of this behavior in insects in 163.5-million-year-old remains from the Haifanggou Formation in China, a location that has yielded many fossils, including those of feathered dinosaurs. Fu and team examined 157 specimens of the extinct water boatman species Karataviella popovi and noted thirty individuals that appear to carry eggs on one of their legs. This finding establishes brood care in insects approximately 38 million years earlier than previously known.",
    prompt: "Which choice best states the main idea of the text?",
    options: [
      "The Haifanggou Formation is an abundant source of fossilized dinosaurs and K. popovi.",
      "Fu and team concluded that K. popovi likely carried their offspring on one of their legs.",
      "Fu and team’s study of K. popovi fossils suggests that brood care in insects began earlier than formerly established.",
      "Research shows that feathered dinosaurs inhabited the location that is now the Haifanggou Formation long before K. popovi did."
    ],
    correct_answer_index: 2,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 9,
    original_question_number: 9,
    passage: "Peter Pan is a 1911 novel by J.M. Barrie. In the fantasy novel, a young boy named Peter lives on a mythical island. The narrator indicates that Peter does not know that pretend things are not real:",
    prompt: "Which quotation about Peter from Peter Pan best supports the claim?",
    options: [
      "“To him make-believe and true were exactly the same thing.”",
      "“In his absence things are usually quiet on the island.”",
      "“His careless manner had gone at last.”",
      "“He was stealing across the island with one finger to his lips.”"
    ],
    correct_answer_index: 0,
    domain: "Information and Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 10,
    original_question_number: 10,
    passage: "**Characteristics of Wave-Made Ripples and Current-Made Ripples**\n\n| Feature | Wave-made | Current-made |\n| --- | --- | --- |\n| Shape | even | uneven |\n| Movement | mostly stay in place | slowly in the direction of the current |\n| Formation time | seconds to hours | hours to days |\n\nWhen water moves over sandy areas, like riverbeds and seafloors, it shapes the sand into small ridges called ripples. Ripples form in two main ways: from waves or from currents. Waves move back and forth, like at the ocean shore. Currents move in one direction, like in a river. These movements make different ripples. A student is comparing wave-made ripples and current-made ripples and notes that",
    prompt: "Which choice most effectively uses information from the table to complete the statement?",
    options: [
      "wave-made ripples move quickly in one direction and current-made ripples stay still.",
      "wave-made ripples are even and current-made ripples are uneven.",
      "the formation time for both types of ripples is seconds to hours.",
      "both types of ripples mostly stay in place."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 11,
    original_question_number: 11,
    passage: "**Highest Major Summits in India**\n\n| Summit | Elevation (meters) | Mountain range | Prominence (meters) |\n| --- | --- | --- | --- |\n| Rimo I | 7,385 | Rimo Karakoram | 1,438 |\n| Nanda Devi | 7,816 | Himalayas | 3,139 |\n| Panchchuli II | 6,904 | Garhwal Himalaya | 1,614 |\n| Saser Kangri I / K22 | 7,672 | Saser Karakoram | 2,304 |\n| Langpo | 6,965 | Sikkim Himalaya | 560 |\n\nMountain summits are often described in terms of their elevation, or height above sea level. But a summit’s elevation may not be as good an indication of how high the mountain appears to observers as is the summit’s prominence, or its height above its surroundings, and these values can differ significantly. For example, the Indian mountain of",
    prompt: "Which choice most effectively uses data from the table to complete the example?",
    options: [
      "Saser Kangri I / K22 has an elevation of 7,672 meters and is considered the highest mountain from the Saser Karakoram range.",
      "Nanda Devi has a much higher prominence than does Langpo.",
      "Nanda Devi has a high prominence but is from a different mountain range than Rimo I, which has a lower prominence.",
      "Nanda Devi has an elevation of 7,816 meters but a considerably lower prominence of 3,139 meters."
    ],
    correct_answer_index: 3,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 12,
    original_question_number: 12,
    passage: "**Home Video Game Systems of the 1970s and 1980s**\n\n| System | Manufacturer | Approximate units sold worldwide |\n| --- | --- | --- |\n| Apple II | Apple Inc. | 4,487,000 |\n| Amstrad CPC | Amstrad | 2,000,000 |\n| Atari 2600 | Atari | 18,450,000 |\n| TurboGrafx-16 | NEC | 2,650,000 |\n\nA student is researching the Amstrad CPC and other important gaming systems that were part of the global rise of the home video game industry during the 1970s and 1980s. The student is surprised to find that the Amstrad CPC sold relatively few units worldwide, with only about",
    prompt: "Which choice most effectively uses data from the table to complete the statement?",
    options: [
      "2,650,000 units sold compared to the approximately 4,487,000 units sold of the Atari 2600.",
      "2,650,000 units sold compared to the approximately 4,487,000 units sold of the Apple II.",
      "2,000,000 units sold compared to the approximately 18,450,000 units sold of the TurboGrafx-16.",
      "2,000,000 units sold compared to the approximately 18,450,000 units sold of the Atari 2600."
    ],
    correct_answer_index: 3,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 13,
    original_question_number: 13,
    passage: "Brittle stars are sea animals that move along the ocean floor using their five arms. Unlike most animals, brittle stars have 70%–80% of their weight in their arms. To better understand the benefits of this unusual design, scientists built a soft robot inspired by the brittle star’s body structure. The robot has a middle disk and five arms whose weights can be changed. When the scientists made the arms heavier, the arms pressed down more firmly on the ground. This stronger grip kept the arms from slipping and allowed the robot to move more steadily across the ocean floor. Based on these results, the scientists hypothesize that",
    prompt: "Which choice most logically completes the text?",
    options: [
      "having most of their weight in their arms allows brittle stars to climb steep underwater cliffs.",
      "brittle stars have most of the weight in their arms because that is where they store nutrients.",
      "having most of their weight in their arms helps brittle stars move across the ocean floor.",
      "brittle stars have most of their weight in their arms so they can scare off predators."
    ],
    correct_answer_index: 2,
    domain: "Information and Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 14,
    original_question_number: 14,
    passage: "The state of Colorado has classified the rusty crayfish as an invasive species that could harm some of the state’s native species. But researchers Alejandro Camacho and Jason McLachlan have pointed out that Earth’s climate is changing in ways that challenge such classifications. Climate changes may force animals from their current ranges. Climate changes may also create good habitats in areas where a species couldn’t live previously. These observations suggest that",
    prompt: "Which choice most logically completes the text?",
    options: [
      "it’s useful at present for Colorado to distinguish between invasive and native species in some instances but not in the case of the rusty crayfish.",
      "Colorado was previously home to some rusty crayfish but they were outcompeted by invading species.",
      "labels like the one that Colorado has applied to the rusty crayfish reflect environmental conditions that may not persist.",
      "even if Earth’s climate doesn’t change in the way scientists predict, the rusty crayfish will likely establish itself in Colorado."
    ],
    correct_answer_index: 2,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 15,
    original_question_number: 15,
    passage: "Whereas Charles B. Ferster’s 1957 study of a captive chimpanzee reported more right-handedness than left-handedness, William C. McGrew and colleagues’ 1999 study of wild chimpanzees did not. According to a meta-analysis of studies of non-human primates, captive populations are more likely to be described as right-handed than wild populations are. Statistical analysis indicates a handedness study would need a minimum of 176 individuals to show a representative result; however, the study by Ferster included a total population of 1, and the study by McGrew and colleagues included a total population of 13. This suggests that",
    prompt: "Which choice most logically completes the text?",
    options: [
      "the study by Ferster reliably represents handedness in captive primates but not in wild primates.",
      "the study by Ferster reliably represents handedness in captive primates, but the study by McGrew and colleagues likely does not reliably represent handedness in wild primates.",
      "neither the study by Ferster nor the study by McGrew and colleagues provides sufficient evidence to make a meaningful comparison about handedness in primates.",
      "McGrew and colleagues likely underestimated the prevalence of right-handedness among the wild chimpanzees in the study."
    ],
    correct_answer_index: 2,
    domain: "Information and Ideas",
    difficulty: "Hard"
  },
  {
    module: 1,
    question_number: 16,
    original_question_number: 16,
    passage: "In the tapestries Blessing of Rain and Intended Vermillion, Diné textile artist D.Y. Begay uses _______ and yellows extracted from cochineal insects from Peru as well as local hollyhocks, coreopsis, and chamisa plants gathered from her Tsélání homeland in Arizona.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "reds greens,",
      "reds, greens,",
      "reds; greens,",
      "reds greens"
    ],
    correct_answer_index: 1,
    domain: "Standard English Conventions",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 17,
    original_question_number: 17,
    passage: "Although Spanish artist Pablo Picasso (1881–1973) is famous mainly for his paintings, he worked in other art forms as well. Picasso _______ experimenting with sculpture as a young man and eventually created hundreds of innovative pieces, many of which he kept in his home.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "beginning",
      "began",
      "having begun",
      "to begin"
    ],
    correct_answer_index: 1,
    domain: "Standard English Conventions",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 18,
    original_question_number: 18,
    passage: "Rock carvings found on islands around the lower Susquehanna River in Maryland repeatedly feature the same stylized face. Experts are divided on whether the face represents the head of a _______ a human, or a mythical figure.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "fish. A serpent,",
      "fish, a serpent,",
      "fish: a serpent",
      "fish a serpent,"
    ],
    correct_answer_index: 1,
    domain: "Standard English Conventions",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 19,
    original_question_number: 19,
    passage: "Commercial failures when they were first introduced in 1909, Billy Possums—stuffed toy opossums named after the newly elected president, William Taft—now sell for thousands of dollars at auction. The extreme rarity of these once unpopular toys explains why _______",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "they have increased in value.",
      "have they increased in value?",
      "they have increased in value?",
      "have they increased in value."
    ],
    correct_answer_index: 0,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 20,
    original_question_number: 20,
    passage: "During the early twentieth century, few women were trained to learn aviation skills—a notable exception being Gladys Ingle. An aviator who _______ the fourth licensed female pilot in the United States, she is memorialized in photos and film from the 1920s and 1930s at the Smithsonian Air and Space Museum.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "is becoming",
      "became",
      "will have become",
      "has become"
    ],
    correct_answer_index: 1,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 21,
    original_question_number: 21,
    passage: "A recent study _______ by biologists Brandi Pessman and Eileen Hebets at the University of Nebraska–Lincoln found that in noisy environments, some funnel-weaving spiders built webs that amplified the sound of incoming vibrations at a particular frequency, allowing the spiders “to better hear certain signals above the noise,” according to Pessman.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "was conducted",
      "had been conducted",
      "is conducted",
      "conducted"
    ],
    correct_answer_index: 3,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 22,
    original_question_number: 22,
    passage: "How does a clear evening become foggy? First, the ground releases heat, which radiates upward. This causes the air near the ground to cool. _______ tiny water droplets begin to form as the cooling air reaches its dew point and can no longer hold its moisture as invisible vapor. Finally, as more droplets accumulate, a visible layer of fog develops close to the ground.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: [
      "Next,",
      "Lastly,",
      "Instead,",
      "Similarly,"
    ],
    correct_answer_index: 0,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 23,
    original_question_number: 23,
    passage: "In 2005, notoriously shy American singer-songwriter Ray LaMontagne saw his life change with the success of his hit single “Trouble.” That year, he performed more than thirty live sets, including at The Warfield in San Francisco, United States, and Scala in London, England; _______ he’d performed fewer than a dozen times in 2004.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: [
      "similarly,",
      "additionally,",
      "on the other hand,",
      "often,"
    ],
    correct_answer_index: 2,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 24,
    original_question_number: 24,
    passage: "In Greenland, the Greenlandic Parliament is elected via a proportional representation (PR) system. In PR elections, votes are cast (not for specific candidates, as they are in single-member plurality systems, but for political parties) and then tabulated; _______ each qualifying party is awarded a number of seats proportional to the number of votes it received.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: [
      "by contrast,",
      "second of all,",
      "accordingly,",
      "in fact,"
    ],
    correct_answer_index: 2,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 25,
    original_question_number: 25,
    passage: "One might assume that Germany’s Wikinger offshore wind farm produces the same amount of energy as land-based wind farms of a similar size. _______ because wind speeds over open water are generally higher than those over land, Wikinger’s turbines turn faster and produce more energy than do most land farms’ turbines.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: [
      "Therefore,",
      "For example,",
      "Actually,",
      "Finally,"
    ],
    correct_answer_index: 2,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 1,
    question_number: 26,
    original_question_number: 26,
    passage: "While researching a topic, a student has taken the following notes:\n• Cinematographers work with cameras and lighting.\n• They help translate film directors’ ideas into visual images.\n• Brokeback Mountain (2005) was directed by Ang Lee.\n• Rodrigo Prieto was the film’s cinematographer.",
    prompt: "The student wants to provide an example of a film Prieto worked on. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "Cinematographer Rodrigo Prieto and director Ang Lee have worked together.",
      "As cinematographer, Rodrigo Prieto works with cameras and lighting to translate the film director’s ideas into visual images.",
      "One example of Rodrigo Prieto’s work as a cinematographer is the 2005 film Brokeback Mountain.",
      "In filmmaking, directors work with others to translate their ideas into the visual images that we encounter on the screen."
    ],
    correct_answer_index: 2,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 1,
    question_number: 27,
    original_question_number: 27,
    passage: "While researching a topic, a student has taken the following notes:\n• In Greek mythology, Prometheus was the god of forethought.\n• The theory that myths are exaggerated tales of actual people and events from the past is known as euhemerism.\n• Euhemerism is associated with the Greek writer Euhemerus (fourth century BCE).\n• Euhemerus argued that the Greek gods and goddesses were based on real people.",
    prompt: "The student wants to connect Prometheus and Euhemerus. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "The theory that myths are exaggerated tales of actual people and events from the past can be applied to Prometheus, the god of forethought in Greek mythology.",
      "Euhemerus theorized that Prometheus, an actual person from the past, was the god of forethought.",
      "According to Euhemerus, whose theory of mythology is known as euhemerism, the mythological figure Prometheus was based on a real person.",
      "Euhemerism gets its name from Euhemerus, who argued that the Greek gods and goddesses were based on real people."
    ],
    correct_answer_index: 2,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },

  // ================= MODULE 2 (Questions 28 to 54) =================
  {
    module: 2,
    question_number: 1,
    original_question_number: 28,
    passage: "Weather patterns, market trends, input costs, labor availability, equipment maintenance, and biological cycles are all variables that farmers must consider separately and in terms of how they may affect each other, and it is this _______ of factors in particular that makes successful farm management so challenging.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: [
      "interplay",
      "resolution",
      "neglect",
      "misinterpretation"
    ],
    correct_answer_index: 0,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 2,
    original_question_number: 29,
    passage: "To maximize _______, package distribution centers employ advanced scheduling systems and strategic staging areas that allow for goods received from warehouses to be immediately transferred to trucks for delivery to their final destinations. Some centers are so efficient that even the largest delivery trucks can be filled in a matter of minutes.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: [
      "liability",
      "overhead",
      "staffing",
      "throughput"
    ],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 3,
    original_question_number: 30,
    passage: "Researchers have developed algorithms that take into account how various _______ influence production schedules, allowing rapid solution generation for manufacturing planning problems. The algorithms help identify efficient production schedules by processing those quantifiable inputs (e.g., demand patterns and capacity constraints) without exhaustively testing all possible scenarios.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: [
      "anomalies",
      "optimizations",
      "parameters",
      "predictions"
    ],
    correct_answer_index: 2,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 4,
    original_question_number: 31,
    passage: "The Invisible Girl’s ability to turn invisible is illustrative of the lamentably lackluster powers bestowed on many female superheroes, but even those with more formidable powers have been subject to unflattering portrayals that often serve as _______: as the Phoenix, Jean Grey loses control of a cosmic force and destroys an entire planet, showing the corrupting influence of power.",
    prompt: "Which choice completes the text with the most logical and precise word or phrase?",
    options: [
      "exonerations",
      "admonitions",
      "obfuscations",
      "venerations"
    ],
    correct_answer_index: 1,
    domain: "Craft and Structure",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 5,
    original_question_number: 32,
    passage: "Research on minor solar eruptions in magnetically quiet regions has revealed an interesting pattern. <u>Material expelled during these events follows a narrow arc trajectory back to the Sun’s surface.</u> High-resolution images show these eruptions produce thin streams of hot gas moving at speeds between 55 and 200 kilometers per second. Although these are impressive velocities, they are not sufficient to overcome the confining forces of the Sun’s gravity and magnetic field, so the material is pulled back down.",
    prompt: "Which choice best describes the function of the underlined sentence in the text as a whole?",
    options: [
      "It acknowledges an exception to the pattern described in the first sentence of the text.",
      "It describes a natural phenomenon that is explained later in the text.",
      "It discusses a natural occurrence that leads to the consequences explained later in the text.",
      "It presents a research finding that challenges the view mentioned in the first sentence of the text."
    ],
    correct_answer_index: 1,
    domain: "Craft and Structure",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 6,
    original_question_number: 33,
    passage: "In Dave Eggers’s novel The Every, protagonist Delaney Wells infiltrates a monopolistic technology company with the intention to destroy it. Instead, she becomes ensnared in its corporate ideology. <u>She even helps the company launch an app that awards points for sustainable purchases while publicly shaming users with high carbon footprints.</u> Through this satirical portrayal, Eggers drives home his central message: digital dystopia spreads not through coercion but through willing participation in technologies that promise social change but that encourage self-centered and moralizing behavior rather than collective action to bring about systemic improvements.",
    prompt: "Which choice best describes the function of the underlined sentence in the text as a whole?",
    options: [
      "It provides a specific illustration of the point the novel’s author makes about the spread of digital dystopia.",
      "It describes an example of a technological solution that the novel presents as environmentally conscious but that in actuality would prevent meaningful systemic change.",
      "It explains how the protagonist’s perspective on the company evolves from sincere to cynical over the course of the novel’s plot.",
      "It conveys how the novel’s central message is advanced through a series of increasingly satirical anecdotes."
    ],
    correct_answer_index: 0,
    domain: "Craft and Structure",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 7,
    original_question_number: 34,
    passage: "Text 1 is from George Eliot’s 1860 novel The Mill on the Floss. Text 2 is from Rabindranath Tagore’s 1921 nonfiction book Glimpses of Bengal.\n\nText 1\nThe wood I walk in on this mild May day, with the young yellow-brown foliage of the oaks between me and the blue sky, the white star-flowers and the blue-eyed speedwell and the ground ivy at my feet, what grove of tropic palms, what strange ferns or splendid broad-petalled blossoms, could ever thrill such deep and delicate fibres within me as this home scene?\n\nText 2\nMy feelings seem to be those of our ancient earth in the daily ecstasy of its sun-kissed life; my own consciousness seems to stream through each blade of grass, each sucking root, to rise with the sap through the trees, to break out with joyous thrills in the waving fields of corn, in the rustling palm leaves.",
    prompt: "Which choice best describes a notable difference in how the references to palm trees function in Text 1 and Text 2?",
    options: [
      "While the narrator of Text 1 and the author of Text 2 both discuss palm trees to suggest the value of experiencing the natural world, only the narrator of Text 1 alludes to the labor that goes into cultivating real palm trees.",
      "While palm trees form part of a series conveying the variety of the natural world in both texts, only the author of Text 2 recognizes how closely interconnected palm trees are with other plants in their environment.",
      "While the narrator of Text 1 and the author of Text 2 both refer to metaphorical palm trees, only the narrator of Text 1 suggests that the palm trees are representative of home.",
      "While palm trees serve to evoke natural beauty in both texts, only the author of Text 2 expresses a close sense of identification with palm trees."
    ],
    correct_answer_index: 3,
    domain: "Craft and Structure",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 8,
    original_question_number: 35,
    passage: "In the Mexican dialect of Spanish, the consonant s is pronounced with greater tension in the tongue than it is in Castilian, the dominant dialect in Spain, resulting in a sharper sound. Margarita Hidalgo, a linguist at San Diego State University, argues that Mexican Spanish acquired this pronunciation from Nahuatl, the language of the Nahua people in Central Mexico: as the Spanish colonizers of Mexico incorporated Nahuatl words into their speech, and as more and more Nahuas spoke Spanish as a second language, the Nahuatl pronunciation of the s consonant replaced the Castilian pronunciation.",
    prompt: "Information in the text best supports which statement about the consonant s?",
    options: [
      "The pronunciation of this consonant in Nahuatl may have been affected by its pronunciation in Mexican Spanish.",
      "The pronunciation of this consonant requires greater tension in the tongue in Nahuatl than in Castilian.",
      "This consonant appears in a higher percentage of Nahuatl vocabulary than of Castilian vocabulary.",
      "The pronunciation of this consonant is the principal difference between the Mexican and Castilian dialects of Spanish."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 9,
    original_question_number: 36,
    passage: "Editor Jared Shurin’s enormous 2023 anthology The Big Book of Cyberpunk comprises 108 stories. Shurin’s volume is chronologically expansive, featuring such stories as James Tiptree Jr.’s “The Girl Who Was Plugged In” (1973) and Lavanya Lakshminarayan’s “Études” (2020). In his introduction, Shurin defines cyberpunk as a subgenre of speculative fiction concerning “the influence of technology on the scale, the pace, or the pattern of human affairs”; however, <u>some critics assert that cyberpunk is a literary movement that is in large part aesthetic rather than idea driven.</u>",
    prompt: "Which quotation from a literary critic would be the most effective evidence in support of the underlined claim?",
    options: [
      "“Not all the stories anthologized in The Big Book of Cyberpunk were first published as stand-alone short stories in magazines or journals: for example, qntm’s 2021 story ‘Lena’ was originally self-published on the author’s site qntm.org.”",
      "“The stories in The Big Book of Cyberpunk share a number of common themes indicative of cyberpunk as a whole: body modification; resistance to authority; the ways in which technological advancements alter human behavior.”",
      "“Shurin’s characterization of cyberpunk is remarkably generous: it is a categorization that might well serve for the entire field of science fiction in general, rather than cyberpunk in particular.”",
      "“A key component of cyberpunk that differentiates it from other subgenres of science fiction is an affection for the totems of 1980s pop culture, such as the mirrored sunglasses that were then popular.”"
    ],
    correct_answer_index: 3,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 10,
    original_question_number: 37,
    passage: "**T-values and P-values for the Relationship between Recording Position and Change in Song Characteristics**\n\n| Song characteristic | T-value | P-value |\n| --- | --- | --- |\n| Change in peak frequency (Hz) | −1.0 | 0.4 |\n| Change in song rate (songs/min) | −2.2 | 0.03 |\n| Change in song duration (s) | −3.2 | 0.002 |\n\nErin Grabarczyk and Sharon Gill analyzed changes in house wrens’ song characteristics following playback of serialized recordings mimicking environmental noise. Because recordings earlier in a series may have carryover effects that influence vocal responses to later recordings, the effects of a recording’s position within a series on changes in song characteristics were also evaluated. Larger absolute t-values indicate stronger evidence that song characteristics change systematically with recording position (negative t-values show that characteristics decreased), while p-values below 0.05 suggest that the effects of recording position on song characteristics are statistically significant. The researchers concluded that the possibility of carryover effects cannot be excluded, given that",
    prompt: "Which choice most effectively uses data from the table to complete the text?",
    options: [
      "vocal responses to later recordings were on average 3.2 seconds longer than responses to earlier recordings, a change that was statistically significant.",
      "later recordings had a more significant effect on change in peak frequency than on change in song duration, as shown by p-values of 0.4 and 0.002, respectively.",
      "vocal responses were likely affected by extraneous factors in addition to the position of recordings, as shown by the wider range of t-values relative to the narrower range of p-values.",
      "the position of recordings had a significant effect on change in song rate and change in song duration, as shown by p-values of 0.03 and 0.002, respectively."
    ],
    correct_answer_index: 3,
    domain: "Information and Ideas",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 11,
    original_question_number: 38,
    passage: "The 2021 poetry collection Double Trio continues Nathaniel Mackey’s “long song,” a sprawling work that consists of a pair of serialized poems called Song of the Andoumboulou and Mu, whose joint publication spans multiple installments over several decades. In this long song, Mackey actualizes what he calls “discrepant engagement,” a compositional strategy that involves continuously revising and remixing diverse cultural references to illuminate the complex interconnectedness of global cultures. <u>Mackey’s long song’s open-endedness is essential to the way it manifests discrepant engagement—that is, the work’s associative logic and resistance to linear narrative prevent readers from imposing a definitive and coherent interpretation on its presentation of world cultures.</u>",
    prompt: "Which quotation from a literary scholar would most directly support the underlined claim?",
    options: [
      "“Seriality in Mackey’s long song operates recursively, meaning that, in combination with the work’s marshaling of an eclectic array of cultural allusions, it endlessly reiterates and recontextualizes the same archetypal images and narrative incidents, uncovering in these elements new and unexpected meanings with each repetition.”",
      "“The intellectual scope of Mackey’s work is capacious, drawing on such wide-ranging cultural influences as the traditional stories of the Dogon people of West Africa, philosophical schools of the ancient Mediterranean, the history of the African diaspora, quantum mechanics, modernist poetry, and experimental jazz music.”",
      "“Though nominally an epic whose band of wandering travelers evoke the ancient Greek epic hero Odysseus, unlike traditional Western epics, which often conclude with the hero’s return home, Mackey’s long song possesses an open-endedness that renders the final homecoming elusive.”",
      "“Though at the outset of his project Mackey conceived of Song of the Andoumboulou and Mu as two discrete series, in the preface of 2006’s Splay Anthem, Mackey indicates that their seriality eventually enabled his realization that they were in fact two facets of a single work.”"
    ],
    correct_answer_index: 0,
    domain: "Information and Ideas",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 12,
    original_question_number: 39,
    passage: "**Highest Major Summits in India**\n\n| Summit | Elevation (meters) | Mountain range | Prominence (meters) |\n| --- | --- | --- | --- |\n| Rimo I | 7,385 | Rimo Karakoram | 1,438 |\n| Nanda Devi | 7,816 | Himalayas | 3,139 |\n| Panchchuli II | 6,904 | Garhwal Himalaya | 1,614 |\n| Saser Kangri I / K22 | 7,672 | Saser Karakoram | 2,304 |\n| Langpo | 6,965 | Sikkim Himalaya | 560 |\n\nMountain summits are often described in terms of their elevation, or height above sea level. But a summit’s elevation may not be as good an indication of how high the mountain appears to observers as is the summit’s prominence, or its height above its surroundings, and these values can differ significantly. For example, the Indian mountain of",
    prompt: "Which choice most effectively uses data from the table to complete the example?",
    options: [
      "Saser Kangri I / K22 has an elevation of 7,672 meters and is considered the highest mountain from the Saser Karakoram range.",
      "Nanda Devi has a much higher prominence than does Langpo.",
      "Nanda Devi has a high prominence but is from a different mountain range than Rimo I, which has a lower prominence.",
      "Nanda Devi has an elevation of 7,816 meters but a considerably lower prominence of 3,139 meters."
    ],
    correct_answer_index: 3,
    domain: "Information and Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 13,
    original_question_number: 40,
    passage: "Whereas Charles B. Ferster’s 1957 study of a captive chimpanzee reported more right-handedness than left-handedness, William C. McGrew and colleagues’ 1999 study of wild chimpanzees did not. According to a meta-analysis of studies of non-human primates, captive populations are more likely to be described as right-handed than wild populations are. Statistical analysis indicates a handedness study would need a minimum of 176 individuals to show a representative result; however, the study by Ferster included a total population of 1, and the study by McGrew and colleagues included a total population of 13. This suggests that",
    prompt: "Which choice most logically completes the text?",
    options: [
      "the study by Ferster reliably represents handedness in captive primates but not in wild primates.",
      "neither the study by Ferster nor the study by McGrew and colleagues provides sufficient evidence to make a meaningful comparison about handedness in primates.",
      "the study by Ferster reliably represents handedness in captive primates, but the study by McGrew and colleagues likely does not reliably represent handedness in wild primates.",
      "McGrew and colleagues likely underestimated the prevalence of right-handedness among the wild chimpanzees in the study."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 14,
    original_question_number: 41,
    passage: "While the brain regions most strongly associated with language tasks have some modularity in that different language tasks activate these areas to varying degrees, comprehension also invokes other areas of the brain more strongly associated with nonlinguistic functions. For example, understanding a description of a person performing physical actions might call on parts of the listener’s brain associated with sensory-motor functions, whereas a highly emotive account will likely activate areas associated with affective processing. Thus, beyond the areas most strongly associated with linguistic functions,",
    prompt: "Which choice most logically completes the text?",
    options: [
      "the brain regions associated with sensory-motor functions are often involved in general comprehension, even in contexts that don’t involve descriptions of physical movement.",
      "the specific combination of brain regions involved in comprehending speech is likely contingent on the total context in which the speech is embedded.",
      "the areas of the brain that activate when processing speech will typically include areas primarily responsible for nonlinguistic functions, although the exact combination of areas may be impossible to determine.",
      "the brain regions most strongly associated with affective processing activate whenever a listener believes an utterance has emotional connotations, even if the speaker did not intend those connotations."
    ],
    correct_answer_index: 1,
    domain: "Information and Ideas",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 15,
    original_question_number: 42,
    passage: "Rare species advantage (RSA) describes the situation in which there are few conspecifics (other members of the same species) in an organism’s immediate surroundings, enabling the organism to avoid competition with conspecifics for the same resources; RSA is widely believed to play a crucial role in maintaining ecological stability. Among tree species in the Xishuangbanna rainforest plot (latitude 21.61° N) and other tropical forest sites, there is little correlation between conspecific aggregation and the abundance of a given species in the wider local area, so RSA is expected, but in the Harvard Forest (latitude 42.54° N) and other temperate forest sites, the aggregation-abundance correlation for tree species is strongly negative. Mathematical modeling suggests, however, that niche distinction may mitigate the apparent risk to temperate ecological stability engendered by this pattern:",
    prompt: "Which choice most logically completes the text?",
    options: [
      "as a tree species in temperate forests becomes more abundant, individuals of that species are more likely to be found near conspecifics, enabling abundant species to exploit localized resources to a greater extent than rare species can.",
      "while an increase in abundance in one tree species often leads to a reduction in abundance of nearby species, temperate tree species tend to play different roles in the same ecosystem, reducing the expected effect of abundance on aggregation.",
      "although rare tree species in temperate forests encounter relatively high local competition from conspecifics, they can thrive by exploiting resources that are under-exploited by other local species.",
      "even though rare tree species in temperate forests tend to cluster with conspecifics more than rare tree species in tropical forests do, they are sufficiently rare locally that they benefit from RSA more than rare tropical species do."
    ],
    correct_answer_index: 2,
    domain: "Information and Ideas",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 16,
    original_question_number: 43,
    passage: "Extensive radiocarbon dating of reed samples from Caral confirmed Ruth Shady Solís’s hypothesis about the Peruvian site’s _______ nearly 5,000 years ago, the ancient city preceded the Olmec civilization to the north by a full millennium, a revelation that fundamentally altered our understanding of urban development in the Western Hemisphere.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "age and built",
      "age, built",
      "age: built",
      "age built"
    ],
    correct_answer_index: 2,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 17,
    original_question_number: 44,
    passage: "Chemists investigating the properties of coal tar in the mid-nineteenth century discovered compounds that led to the creation of vibrant artificial colorants. Commercial applications of this new synthetic dye technology—beginning with the purple dye called mauve, discovered by William Perkin in 1856—_______ responsible for launching what one science historian calls a “manufacturing revolution based on chemistry.”",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "is",
      "has been",
      "was",
      "were"
    ],
    correct_answer_index: 3,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 18,
    original_question_number: 45,
    passage: "The statement “all cats have whiskers” is scientific because it could be proved false by a single observation to the contrary, according to Karl Popper. Popper’s theory _______ that scientific hypotheses must be refutable, termed the criterion of falsifiability, rejects the confirmationist position that uses verifiability as the standard for scientific hypotheses.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "dictates",
      "dictating",
      "dictated",
      "was dictating"
    ],
    correct_answer_index: 1,
    domain: "Standard English Conventions",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 19,
    original_question_number: 46,
    passage: "During a recent investigation, archaeologists _______ an explanation for the consistent and seemingly deliberate placement of petroglyphs (rock carvings) near water analyzed several sites on Caribbean islands. They discovered that many of the pools near petroglyphs had consistent water levels year-round, creating perfect reflecting surfaces for the carved symbols on the rocks.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "seeking",
      "had sought",
      "sought",
      "were seeking"
    ],
    correct_answer_index: 0,
    domain: "Standard English Conventions",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 20,
    original_question_number: 47,
    passage: "For his mash-up “Smells Like Rockin’ Robin,” DJ Mark Vidler layered Kurt Cobain’s minor-key vocals from “Smells Like Teen Spirit” over the Jackson 5’s major-key blues progression from “Rockin’ _______ by inserting the grunge singer’s vocals as pitch-shifted “blue notes” within the pop-soul group’s harmonic framework, creates an intensified “bluesy” feeling and subverts the expectations of listeners familiar with either musical source.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "Robin,” a technique that",
      "Robin.” A technique that",
      "Robin”—a technique that,",
      "Robin”; a technique that,"
    ],
    correct_answer_index: 2,
    domain: "Standard English Conventions",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 21,
    original_question_number: 48,
    passage: "Named for the year in which it was detected by American astronomers, SN 2008D was a supernova (the explosion of a massive _______ in the constellation Lynx, 88 million light-years from Earth, the transient yet powerful blast propelled particles and debris into space at extremely high speeds.",
    prompt: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: [
      "star). Occurring",
      "star), occurring",
      "star) and occurring",
      "star) occurring"
    ],
    correct_answer_index: 0,
    domain: "Standard English Conventions",
    difficulty: "Hard"
  },
  {
    module: 2,
    question_number: 22,
    original_question_number: 49,
    passage: "The Hornbostel-Sachs system classifies musical instruments by how they produce sound. For example, an instrument that is popular in Myanmar called the saung-gauk produces sound primarily through the vibration of its strings. _______ under the Hornbostel-Sachs system, the saung-gauk is a chordophone.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: [
      "Thus,",
      "Furthermore,",
      "Instead,",
      "Similarly,"
    ],
    correct_answer_index: 0,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 23,
    original_question_number: 50,
    passage: "Generally, sleek vehicles are more aerodynamic than bulkier ones. The streamlined nose of the Northrop F-5 jet, _______ helps it glide through wind with relative ease, while a boxy semitruck encounters more wind resistance, making it less aerodynamic.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: [
      "however,",
      "for example,",
      "meanwhile,",
      "additionally,"
    ],
    correct_answer_index: 1,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 24,
    original_question_number: 51,
    passage: "Japanese conceptual artist On Kawara focused his artistic career on recording the passage of time in simple ways. For example, MAY 22, 1979 is one of over three thousand paintings by Kawara on which he recorded the date in bold white strokes on a monochrome background. _______ I Got Up at 8.18 A.M., Jun 22 1977 is one of a series of postcards—this one of New York City’s Greenwich Village—that Kawara titled after the postcard’s message, which informed a friend of when Kawara got up that day.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: [
      "In fact,",
      "Similarly,",
      "Regardless,",
      "First of all,"
    ],
    correct_answer_index: 1,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 25,
    original_question_number: 52,
    passage: "On August 22, 1928, US Olympians received a ticker-tape parade in New York City in recognition of their participation in the 1928 Olympic Games. Of the 206 ticker-tape parades held between 1886 and 2022, a number were for achievements in sports. _______ the 1928 Olympians’ parade was just one of 7 honoring Olympic athletes.",
    prompt: "Which choice completes the text with the most logical transition?",
    options: [
      "In addition,",
      "Indeed,",
      "Therefore,",
      "Nevertheless,"
    ],
    correct_answer_index: 1,
    domain: "Expression of Ideas",
    difficulty: "Medium"
  },
  {
    module: 2,
    question_number: 26,
    original_question_number: 53,
    passage: "While researching a topic, a student has taken the following notes:\n• Hyde Park is a 1931 color linocut print by Canadian artist Sybil Andrews.\n• It depicts a tranquil, everyday scene (a spring day in a city park).\n• ¡Sera toda nuestra! (“It will all be ours!”) is a 1977 color linocut print by Mexican American artist Carlos Cortéz.\n• It features a scene with an explicitly political point of view (a group of laborers preparing to go on strike).\n• Relief printing is a technique in which an image is carved onto a printing block, covered in ink or paint, and stamped onto paper.\n• Lino cutting is a type of relief printing that uses linoleum tile as the printing block.",
    prompt: "The student wants to contrast the subject matter of the two prints. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "The scenes depicted in both works were first carved onto a printing block, then stamped onto paper; however, one work is a linocut, while the other is a relief print.",
      "The print by Cortéz is a color linocut; by contrast, Andrews’s is a relief print.",
      "Andrews made Hyde Park in 1931, while Cortéz made ¡Sera toda nuestra! (“It will all be ours!”) later, in 1977.",
      "Cortéz’s print expresses an explicitly political point of view, while Andrews’s depicts a tranquil, everyday scene."
    ],
    correct_answer_index: 3,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  },
  {
    module: 2,
    question_number: 27,
    original_question_number: 54,
    passage: "While researching a topic, a student has taken the following notes:\n• Enhanced rock weathering (ERW) is a method of spreading crushed basalt on farmland to capture carbon dioxide (CO2) and improve soil health.\n• ERW increases crop yields and removes harmful CO2 from the air.\n• ERW offers a low-cost, low-tech alternative to expensive, energy-intensive carbon capture methods.\n• The CO2 captured by ERW becomes stable bicarbonate in soil water, which eventually streams into the ocean to remain safely stored for hundreds of years.\n• ERW can improve rural economies by reducing farmers’ need for fertilizers and increasing their earnings from carbon credits.",
    prompt: "The student wants to explain why ERW is a superior method for capturing CO2. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    options: [
      "ERW improves soil health and helps farmers increase their income from selling carbon credits.",
      "ERW removes CO2 from the air in a way that is both low-cost and low-tech.",
      "ERW is a method of spreading crushed basalt on farmland to capture CO2, improving rural economies.",
      "The CO2 captured by ERW becomes stable bicarbonate, which improves soil health by remaining in the ocean for hundreds of years."
    ],
    correct_answer_index: 1,
    domain: "Expression of Ideas",
    difficulty: "Easy"
  }
];

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

function exportToCsv() {
  const dirPath = path.join(__dirname, '..', 'question');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const csvPath = path.join(dirPath, '2026_oct_int_1.csv');
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
      total_questions: rawQuestions.length,
      created_at: new Date().toISOString()
    };
    backup.tests.push(testObj);
  } else {
    testObj.type = TEST_TYPE;
    testObj.allow_practice = 1;
    testObj.total_time_minutes = 64;
    testObj.total_questions = rawQuestions.length;
    assignedTestId = testObj.id;
  }

  // Remove existing questions for this test
  backup.questions = (backup.questions || []).filter(q => q.test_id !== assignedTestId);

  let maxQId = backup.questions.reduce((max, q) => Math.max(max, q.id || 0), 0);

  for (const q of rawQuestions) {
    maxQId++;
    backup.questions.push({
      id: maxQId,
      test_id: assignedTestId,
      question_number: q.question_number,
      original_question_number: q.original_question_number,
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

  // Export CSV
  exportToCsv();

  // Update backup file
  const backupTestId = await updateBackupFile();

  // Connect to MySQL
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
      connectTimeout: 7000
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
