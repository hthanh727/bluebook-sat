const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ override: true });

const TEST_TITLE = 'MSET011 - Practice Math';
const TEST_TYPE = 'topic';
const TEST_DOMAIN = 'Problem-Solving and Data Analysis';

const rawQuestions = [
  {
    question_number: 1,
    prompt: "Ms. Mai is one of the music teachers at a High School, which has 1,200 students. She selected 50 of her music students at random and asked each whether they play an instrument. Of the 50 students surveyed, 39 play an instrument. Based on the design of the study, which of the following is the largest group of students to whom the results of Ms. Mai’s survey can be generalized?",
    passage: null,
    options: [
      "All of Ms. Mai’s music students at a high School",
      "All of the music students at a High School",
      "All of the students High School",
      "All of the music students in the city."
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 2,
    prompt: "An athletic trainer wants to determine whether a new exercise regimen improves the performance of members of high school athletic teams. To test whether the regimen improves performance, the trainer arranges for all the members of the boys track team at a local high school to use it for one season. The trainer will then compare this season’s performances to performances in previous years. Which of the following would NOT improve the quality of the study?",
    passage: null,
    options: [
      "Randomly assigning half of the track team to use the new regimen while the other half uses the current regimen",
      "Including members of all the boys’ athletic teams at the high school in the study",
      "Including members of the girls’ track team at the high school in the study",
      "Including students who are not on athletic teams at the high school in the study"
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 3,
    prompt: "To determine if gender and number of siblings are related to whether 10-year-old children like to read, Salma selected a random sample of 60 boys with fewer than 2 siblings and a random sample of 50 girls with 2 or more siblings from the 10-year-old children in her city. For each child, she recorded the child’s age, gender, and whether the child reported liking to read. Why is it inappropriate for Salma to draw a conclusion from her study?",
    passage: null,
    options: [
      "The two samples are not of equal size.",
      "The two samples should have been chosen from different cities.",
      "There is no upper bound on the number of siblings of the 50 girls.",
      "Salma will not be able to tell whether a difference in liking to read is related to the difference in gender or to the difference in number of siblings."
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 4,
    prompt: "A survey was given to a random sample of 100 high school students in Cairo. The results of this survey should be representative of which the following population?",
    passage: null,
    options: [
      "All high school students in Egypt.",
      "All high school students in Cairo.",
      "All students in Cairo.",
      "All students in Egypt."
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Easy"
  },
  {
    question_number: 5,
    prompt: "In a survey, 66 residents of a particular town were selected at random, and approximately 60% of them reported that they recycle regularly. If the reported percentage is used as an estimate for the proportion of all residents in the town who recycle regularly, the margin of error is 17%. Which of the following statements is appropriate based on the data provided?",
    passage: null,
    options: [
      "Less than 35% of all the town residents recycle regularly.",
      "Between 0% and 17% of all the town residents recycle regularly.",
      "Between 43% and 77% of all the town residents recycle regularly.",
      "Approximately 16.7% of the surveyed residents misstated how often they recycle."
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 6,
    prompt: "A survey was taken of the weight of students in the school, and it was found that the mean weight was 56 kg and the median weight was 65 kg. Which of the following situations could explain the difference between the mean and median weight in the school?",
    passage: null,
    options: [
      "The students have weights that are close to each other.",
      "There are a few students whose weights are less than the rest.",
      "There are a few students whose weights are much more than the rest.",
      "Many students have weights between 56 kg and 65 kg."
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 7,
    prompt: "What is the median number of children for all the families surveyed?",
    passage: "A researcher chose 50 families at random from the two towns and asked each family how many children they have. The results are shown in the table below.<br><br><table style=\"border-collapse: collapse; margin: 12px auto; text-align: center;\"><thead><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Number of children</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Town A</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Town B</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">0</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">4</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">2</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">1</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">7</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">8</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">2</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">9</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">6</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">3</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">5</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">9</td></tr></tbody></table>There is a total of 600 families at Town A and 900 families at Town B.",
    options: [
      "0",
      "1",
      "2",
      "3"
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 8,
    prompt: "Based on the survey data, which of the following most accurately compares the expected total number of families with 2 children at two towns?",
    passage: "A researcher chose 50 families at random from the two towns and asked each family how many children they have. The results are shown in the table below.<br><br><table style=\"border-collapse: collapse; margin: 12px auto; text-align: center;\"><thead><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Number of children</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Town A</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Town B</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">0</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">4</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">2</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">1</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">7</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">8</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">2</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">9</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">6</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">3</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">5</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">9</td></tr></tbody></table>There is a total of 600 families at Town A and 900 families at Town B.",
    options: [
      "The total number of families with 2 children is expected to be equal at two towns.",
      "The total number of families with 2 children at Town A is expected to be 3 more than at Town B.",
      "The total number of families with 2 children at Town B is expected to be 3 more than at Town A.",
      "The total number of families with 2 children at Town B is expected to be 300 more than at Town A."
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Hard"
  },
  {
    question_number: 9,
    prompt: "A survey was taken of the height of students in the school, and it was found that the median height was 168 cm and the mean height was 175 cm. Which of the following situations could explain the difference between the mean and median height in the school?",
    passage: null,
    options: [
      "The students have heights that are close to each other.",
      "There are a few students whose heights are less than the rest.",
      "There are a few students whose heights are much more than the rest.",
      "Many students have heights between 168 cm and 175 cm."
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 10,
    prompt: "According to the histogram shown above, which of the following is closest to the average (arithmetic mean) number of residents per apartment?",
    passage: null,
    options: [
      "3",
      "3.25",
      "3.5",
      "4"
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: "images/mset011/q10.png",
    difficulty: "Hard"
  },
  {
    question_number: 11,
    prompt: "What is the median number of pets for all the people surveyed?",
    passage: "A researcher chose 40 people at random from the two streets and asked each of them how many pets he/she has. The results are shown in the table below.<br><br><table style=\"border-collapse: collapse; margin: 12px auto; text-align: center;\"><thead><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Number of pets</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Street A</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Street B</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">0</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">7</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">4</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">1</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">6</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">7</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">2</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">5</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">5</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">3</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">2</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">4</td></tr></tbody></table>There are a total of 300 people at Street A and 200 people at Street B.",
    options: [
      "0",
      "1",
      "2",
      "3"
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 12,
    prompt: "Based on the survey data, which of the following most accurately compares the expected total number of people with 2 pets at two streets?",
    passage: "A researcher chose 40 people at random from the two streets and asked each of them how many pets he/she has. The results are shown in the table below.<br><br><table style=\"border-collapse: collapse; margin: 12px auto; text-align: center;\"><thead><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Number of pets</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Street A</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Street B</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">0</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">7</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">4</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">1</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">6</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">7</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">2</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">5</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">5</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">3</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">2</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">4</td></tr></tbody></table>There are a total of 300 people at Street A and 200 people at Street B.",
    options: [
      "The total number of people with 2 pets is expected to be equal at two streets.",
      "The total number of people with 2 pets at Street A is expected to be 25 more than at Street B.",
      "The total number of people with 2 pets at Street B is expected to be 25 more than at Street A.",
      "The total number of people with 2 pets at Street A is expected to be 100 more than at Street B."
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Hard"
  },
  {
    question_number: 13,
    prompt: "A theater owner wanted to determine whether local residents were more interested in seeing operas or symphonies. The theater owner asked 85 people who were in a shopping mall on a Sunday and 5 people declined to respond. Which of the following factors is the greatest flaw in the theater owner’s methodology in reaching a reliable conclusion about the local residents’ performance-viewing preferences?",
    passage: null,
    options: [
      "The size of the sample",
      "The location in which the survey was given",
      "The population of the area",
      "The residents who declined to respond"
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 14,
    prompt: "A medical study was conducted in order to determine whether product K could help people with hearing loss improve their hearing. The administrators of the study selected 200 subjects at random from a large group of people who had severe hearing loss. Half of the subjects were randomly assigned to be given product K and half were not. The resulting data demonstrated that subjects who were given product K had significantly improved hearing compared to those who were not given product K. Based on this study, which of the following conclusions is most appropriate?",
    passage: null,
    options: [
      "Product K will enable all people who take it to significantly improve their hearing.",
      "Product K is more effective than all other hearing-improvement products.",
      "Product K will help people significantly improve their hearing.",
      "Product K is likely to help people with severe hearing loss improve their hearing."
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 15,
    prompt: "The tables below show the distribution of scores of recent quizzes in English and Physics given to the same 33 students of a particular class.<br><br><div style=\"display:flex; justify-content:center; gap:24px; margin:12px 0;\"><table style=\"border-collapse:collapse;\"><thead><tr style=\"background:#f1f5f9;\"><th colspan=\"2\" style=\"border:1px solid #cbd5e1; padding:4px 14px;\">English Quiz</th></tr><tr style=\"background:#f8fafc;\"><th style=\"border:1px solid #cbd5e1; padding:4px 10px;\">Score</th><th style=\"border:1px solid #cbd5e1; padding:4px 10px;\">Frequency</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; text-align:center;\">1</td><td style=\"border:1px solid #cbd5e1; text-align:center;\">5</td></tr><tr><td style=\"border:1px solid #cbd5e1; text-align:center;\">2</td><td style=\"border:1px solid #cbd5e1; text-align:center;\">7</td></tr><tr><td style=\"border:1px solid #cbd5e1; text-align:center;\">3</td><td style=\"border:1px solid #cbd5e1; text-align:center;\">9</td></tr><tr><td style=\"border:1px solid #cbd5e1; text-align:center;\">4</td><td style=\"border:1px solid #cbd5e1; text-align:center;\">6</td></tr><tr><td style=\"border:1px solid #cbd5e1; text-align:center;\">5</td><td style=\"border:1px solid #cbd5e1; text-align:center;\">6</td></tr></tbody></table><table style=\"border-collapse:collapse;\"><thead><tr style=\"background:#f1f5f9;\"><th colspan=\"2\" style=\"border:1px solid #cbd5e1; padding:4px 14px;\">Physics Quiz</th></tr><tr style=\"background:#f8fafc;\"><th style=\"border:1px solid #cbd5e1; padding:4px 10px;\">Score</th><th style=\"border:1px solid #cbd5e1; padding:4px 10px;\">Frequency</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; text-align:center;\">1</td><td style=\"border:1px solid #cbd5e1; text-align:center;\">1</td></tr><tr><td style=\"border:1px solid #cbd5e1; text-align:center;\">2</td><td style=\"border:1px solid #cbd5e1; text-align:center;\">2</td></tr><tr><td style=\"border:1px solid #cbd5e1; text-align:center;\">3</td><td style=\"border:1px solid #cbd5e1; text-align:center;\">3</td></tr><tr><td style=\"border:1px solid #cbd5e1; text-align:center;\">4</td><td style=\"border:1px solid #cbd5e1; text-align:center;\">22</td></tr><tr><td style=\"border:1px solid #cbd5e1; text-align:center;\">5</td><td style=\"border:1px solid #cbd5e1; text-align:center;\">5</td></tr></tbody></table></div><br>Which of the following is true about the data provided for the 33 students?",
    passage: null,
    options: [
      "The standard deviation of the scores on the English quiz is larger.",
      "The standard deviation of scores on the Physics quiz is larger.",
      "The standard deviation of the scores on the English quiz is the same as that of the Physics quiz.",
      "The standard deviation for the scores on the two quizzes cannot be calculated from the data provided."
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Hard"
  },
  {
    question_number: 16,
    prompt: "In order to determine the effect that caffeinated beverage C would have on sleep, researchers conducted a study. From a large population of people without sleep disorders, 500 subjects were randomly selected. Half the subjects were randomly selected to consume beverage C and the rest did not consume beverage C. The results of the study showed that the subjects who consumed beverage C slept less than those who did not consume beverage C. Based on the design and results of the study, which of the following statements is the best conclusion?",
    passage: null,
    options: [
      "Beverage C will cause more loss in sleep than all other caffeinated beverages.",
      "Beverage C will cause a substantial loss in sleep.",
      "Beverage C is likely to reduce the amount of sleep of people without sleep disorders.",
      "Beverage C will reduce sleep of anyone who consumes it."
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 17,
    prompt: "The histogram above shows the distribution of the scores of 22 students on a recent biology test. Which of the following could be the median score of the 22 students represented in the histogram?",
    passage: null,
    options: [
      "68",
      "71",
      "77",
      "84"
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: "images/mset011/q17.png",
    difficulty: "Hard"
  },
  {
    question_number: 18,
    prompt: "A telephone survey was conducted in order to determine if people in City C are more likely to work 9-to-5 office jobs than other jobs. The research team called 5,000 random people between 12 P.M. to 4 P.M. on a Thursday. Of the 5,000 people called, 3,000 did not answer, and 250 refused to participate. Which of the following was the biggest flaw in the design of the survey?",
    passage: null,
    options: [
      "The time the survey was taken",
      "Population size",
      "Sample size",
      "The fact that the survey was done by telephone"
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 19,
    prompt: "A group of scientists designed a study to test the effectiveness of pesticide P at eradicating aphids from rose gardens. From a large group of botanists, 400 participants with aphid-infested rose gardens were randomly selected to participate in the study. Half of the 400 botanists sprayed their rose gardens with pesticide P, and the other half did not. The data showed that the rose gardens sprayed with pesticide P had significantly fewer aphids as compared to those that were not sprayed with pesticide P. Which of the following is an appropriate conclusion of the study?",
    passage: null,
    options: [
      "Pesticide P will decrease the number of aphids in any rose garden.",
      "Pesticide P is the best pesticide available for decreasing the number of aphids in a garden.",
      "Pesticide P will likely decrease the number of aphids in aphid-infested rose gardens.",
      "Pesticide P will kill substantial numbers of aphids present in a garden."
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 20,
    prompt: "Number of U.S. Presidents Aged 60 or Younger when Inaugurated<br><br><div style=\"overflow-x:auto;\"><table style=\"border-collapse: collapse; margin: 12px auto; font-size: 13px;\"><tbody><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 8px;\">Age</th><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">42</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">43</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">46</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">47</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">48</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">49</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">50</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">51</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">52</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">54</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">55</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">56</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">57</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">58</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">60</td></tr><tr><th style=\"border:1px solid #cbd5e1; padding:6px 8px;\">Frequency</th><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">1</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">1</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">2</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">2</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">1</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">2</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">1</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">5</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">2</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">5</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">4</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">3</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">4</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">1</td><td style=\"border:1px solid #cbd5e1; padding:6px 6px; text-align:center;\">1</td></tr></tbody></table></div><br>There are 35 U.S. Presidents who were 60 years old or younger when they were inaugurated, as shown in the table above. Based on the table, what was the median age for these 35 presidents?",
    passage: null,
    options: [
      "51",
      "52",
      "54",
      "55"
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 21,
    prompt: "The board of directors at a natural history museum decided to survey all of its scientists to determine if the new wing in the museum should feature an aquatic exhibit. The board met with a sample group of 30 marine biologists. The majority of the sample group were in favor of featuring an aquatic exhibit in the new wing. Which of the following is true about the board’s survey?",
    passage: null,
    options: [
      "The sample group should have included more marine biologists.",
      "It concludes that a majority of the scientists are in favor of featuring an aquatic exhibit in the new wing.",
      "The sample group is biased because it is not representative of all scientists.",
      "The sample group should have consisted only of scientists who are not marine biologists."
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 22,
    prompt: "A study was done on the circumferences of different types of trees in a forest. A random sample of trees were measured, and each tree was marked to guarantee that no tree was measured twice. The sample contained 250 red maple trees, of which 40% had a circumference less than 35 inches. Which of the following conclusions is best supported by the data?",
    passage: null,
    options: [
      "The average circumference of all the trees in the forest is approximately 35 inches.",
      "Approximately 40% of all the trees in the forest have circumferences less than 35 inches.",
      "Approximately 40% of all the red maple trees in the forest have circumferences less than 35 inches.",
      "The majority of all the trees in the forest have circumferences larger than 35 inches."
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 23,
    prompt: "A community advocacy group recently polled 500 people who were selected at random from a small town and asked each person, “Are you in favor of the referendum to increase the property tax rate?” Of those surveyed, 67 percent stated that they were opposed to the property tax referendum. Which of the following statements must be true based on the results of the poll?<br><br>I. If another 500 people selected at random from the town were polled, 67 percent of them would state they are opposed to the property tax referendum.<br>II. If 500 people selected at random from a different town were polled, 67 percent of them would report they are opposed to the property tax referendum.<br>III. Of all the people in the town, 67 percent are opposed to the property tax referendum.",
    passage: null,
    options: [
      "I only",
      "I and III only",
      "II and III only",
      "None"
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Hard"
  },
  {
    question_number: 24,
    prompt: "<table style=\"border-collapse: collapse; margin: 12px auto;\"><thead><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Name</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Time</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Amr</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">6 min 34 sec</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Ahmed</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">6 min 11 sec</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Maya</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">6 min 30 sec</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Ghada</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">6 min 52 sec</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Mohammed</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">8 min 12 sec</td></tr></tbody></table><br>Five students ran a mile, and their times are shown in the table above. If Mohammed’s time is removed from the data set, which of the following measures will change the least?",
    passage: null,
    options: [
      "Mean",
      "Median",
      "Maximum",
      "Range"
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 25,
    prompt: "The manager assigns the values shown below to each response choice to calculate a mean rating for the survey question: Strongly agree = 2, Agree = 1, Neither agree nor disagree = 0, Disagree = −1, Strongly disagree = −2. What is the mean rating for all 50 responses?",
    passage: "For one week, the manager of a restaurant gathered customer feedback by randomly selecting 50 customers and asking them to complete a survey question. A total of 700 customers ate at the restaurant during the week in which the survey was completed. The survey question asked: “To what extent do you agree or disagree with the following statement: ‘I would recommend this restaurant to others.’ (Select only one of the five choices.)”<br><br><table style=\"border-collapse: collapse; margin: 12px auto;\"><thead><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Response</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Number of customers</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Strongly agree</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">15</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Agree</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">13</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Neither agree nor disagree</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">12</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Disagree</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">6</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Strongly disagree</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">4</td></tr><tr style=\"font-weight:bold;\"><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Total</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">50</td></tr></tbody></table>",
    options: [
      "0.24",
      "0.26",
      "0.44",
      "0.92"
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Hard"
  },
  {
    question_number: 26,
    prompt: "Which of the following is an appropriate conclusion about the customers surveyed?",
    passage: "For one week, the manager of a restaurant gathered customer feedback by randomly selecting 50 customers and asking them to complete a survey question. A total of 700 customers ate at the restaurant during the week in which the survey was completed. The survey question asked: “To what extent do you agree or disagree with the following statement: ‘I would recommend this restaurant to others.’ (Select only one of the five choices.)”<br><br><table style=\"border-collapse: collapse; margin: 12px auto;\"><thead><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Response</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Number of customers</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Strongly agree</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">15</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Agree</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">13</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Neither agree nor disagree</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">12</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Disagree</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">6</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Strongly disagree</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">4</td></tr><tr style=\"font-weight:bold;\"><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Total</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">50</td></tr></tbody></table>",
    options: [
      "The majority of the customers would recommend the restaurant to others.",
      "The majority of the customers would not recommend the restaurant to others.",
      "The majority of the customers would neither recommend nor not recommend the restaurant to others.",
      "The number of customers who would recommend the restaurant to others is the same as the number of customers who would not recommend the restaurant to others."
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 27,
    prompt: "According to a study done by the Bureau of Labor Statistics on a typical day between the years 2009 and 2012, about 8% of Egyptians aged 12 and older exercised. The pie chart above shows the distribution of the length of time those people spent exercising each day. Based on the data shown, which of the following could be the median length of time spent exercising each day for those people who exercised?",
    passage: null,
    options: [
      "36 minutes",
      "55 minutes",
      "1 hour 25 minutes",
      "1 hour 40 minutes"
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: "images/mset011/q27.png",
    difficulty: "Hard"
  },
  {
    question_number: 28,
    prompt: "Ticket Prices by Row Number<br><br><table style=\"border-collapse: collapse; margin: 12px auto;\"><thead><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Row number</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Ticket price</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">1–2</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">$25</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">3–10</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">$20</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">11–20</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">$15</td></tr></tbody></table><br>The price of a ticket to a play is based on the row the seat is in, as shown in the table above. A group wants to purchase 10 tickets for the play: 3 tickets for seats in row 1, 2 tickets for seats in row 3, 2 tickets for seats in row 7, and 3 tickets for seats in row 12. What is the average (arithmetic mean) ticket price, in dollars, for the 10 tickets? (Disregard the $ sign when gridding your answer.)",
    passage: null,
    options: null,
    correct_answer_index: null,
    correct_answer_text: "20",
    question_type: "spr",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 29,
    prompt: "The mean weight of a group of 12 automobiles is 3,320 pounds. The weights, in pounds, of 4 of the automobiles in the group are: Automobile A: 1,950, Automobile B: 3,250, Automobile C: 3,350, Automobile D: 8,550. The removal of which of these automobiles from the group will have the largest impact on the mean weight of the group of automobiles?",
    passage: null,
    options: [
      "Automobile A",
      "Automobile B",
      "Automobile C",
      "Automobile D"
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 30,
    prompt: "Survey Results of Households<br><br><table style=\"border-collapse: collapse; margin: 12px auto;\"><thead><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Number of children per household</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Frequency</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">0</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">X</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">1</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">3</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">2</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">2</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">3</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">5</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">4</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">2</td></tr></tbody></table><br>In the table above, the median number of children per household is 2. What is one possible value of X?",
    passage: null,
    options: null,
    correct_answer_index: null,
    correct_answer_text: "3",
    question_type: "spr",
    image_url: null,
    difficulty: "Hard"
  },
  {
    question_number: 31,
    prompt: "A data set consists of the values 350, 420, 530, 552, 700, and 12,012. If the outlier is removed, what will happen to the value of the mean of the data set?",
    passage: null,
    options: [
      "The mean will remain the same.",
      "The mean will decrease.",
      "The mean will increase.",
      "There is not enough information to determine how the mean will change."
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Easy"
  },
  {
    question_number: 32,
    prompt: "The tallest student in Class X is 52 inches tall, and the tallest student in Class Y is 49 inches tall. Each class has 27 students, and the shortest student in each class is the same height. Which of the following statements must be true?<br><br>I. The range of the heights for students in Class X is greater than that in Class Y.<br>II. The median of the heights for students in Class X is greater than that in Class Y.<br>III. The mean of the heights for students in Class X is greater than that in Class Y.",
    passage: null,
    options: [
      "I only",
      "III only",
      "I and II only",
      "I, II, and III"
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 33,
    prompt: "A poll was conducted to find the percent of residents in a community who support an increase in taxes to help pay for the construction of alternative energy sources. Of the 1,600 residents selected at random to be polled, 53% were in favor of the tax increase. The poll had a margin of error of 4 percentage points. Which of the following conclusions is most appropriate about all residents of the community, based on the results of the poll?",
    passage: null,
    options: [
      "The percent of all residents who favor the tax increase is 53%.",
      "The percent of all residents who favor the tax increase is likely less than 50%.",
      "The percent of all residents who favor the tax increase is likely between 49% and 57%.",
      "The percent of all residents who favor the tax increase is likely either less than 49% or greater than 57%."
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 34,
    prompt: "Employee Absences<br><br><table style=\"border-collapse: collapse; margin: 12px auto;\"><thead><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Number of days</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Number of employees</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">0</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">8</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">1</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">4</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">2</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">3</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">4</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">4</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">5</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">5</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">13</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">1</td></tr></tbody></table><br>The frequency table above shows the distribution of the number of days each of the 25 employees of a company was absent last month. What is the median number of days absent for the 25 employees last month?",
    passage: null,
    options: [
      "1",
      "2",
      "4",
      "5"
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 35,
    prompt: "Researchers in Egypt carried out an experiment to determine if the color of a tea mug affects how people rate the flavor intensity of the tea. Volunteers were randomly assigned to taste tea in mugs that differed only by color, some white and some clear. The same type of tea was used in both mugs. The researchers concluded that the mean flavor intensity rating was significantly higher for those who drank tea in a white mug than for those who drank tea in a clear mug. Based on this study, which of the following statements is correct?",
    passage: null,
    options: [
      "The color of the mug was the cause of the difference in mean intensity rating for these volunteers, and this conclusion can be generalized to all tea drinkers.",
      "The color of the mug was the cause of the difference in mean intensity rating for these volunteers, but it is not reasonable to generalize this conclusion to all tea drinkers.",
      "It is not reasonable to conclude that the color of the mug was the cause of the difference in mean intensity rating for these volunteers.",
      "It is not possible to draw any conclusions from this experiment because volunteers were used."
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 36,
    prompt: "Masses (kilograms)<br><br><div style=\"overflow-x:auto;\"><table style=\"border-collapse: collapse; margin: 12px auto;\"><tbody><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 12px;\">Andria</th><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">2.6</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">2.3</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">3.5</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">3.2</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">2.6</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">2.6</td></tr><tr><th style=\"border:1px solid #cbd5e1; padding:6px 12px;\">Mariam</th><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">h</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">3.2</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">2.8</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">2.7</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">3.1</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">3.0</td></tr></tbody></table></div><br>Andria and Mariam each collected six rocks, and the masses of the rocks are shown in the table above. The mean of the masses of the rocks Mariam collected is 0.1 kilogram greater than the mean of the masses of the rocks Andria collected. What is the value of h?",
    passage: null,
    options: null,
    correct_answer_index: null,
    correct_answer_text: "2.6",
    question_type: "spr",
    image_url: null,
    difficulty: "Hard"
  },
  {
    question_number: 37,
    prompt: "The members of a city council wanted to assess the opinions of all city residents about converting an open field into a dog park. The council surveyed a sample of 500 city residents who do not own dogs. The survey showed that the majority of those sampled were in favor of the dog park. Which of the following is true about the city council’s survey?",
    passage: null,
    options: [
      "It shows that most city residents are in favor of the dog park.",
      "The survey sample should have included more residents who are dog owners.",
      "The survey sample should have consisted entirely of residents who do not own dogs.",
      "The survey sample is biased because it is not representative of all city residents."
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 38,
    prompt: "Donation Amounts in Dollars<br><br><table style=\"border-collapse: collapse; margin: 12px auto;\"><tbody><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 12px;\">Mail</th><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">20</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">40</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">5</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">25</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">10</td></tr><tr><th style=\"border:1px solid #cbd5e1; padding:6px 12px;\">Cell phone</th><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">8</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">7</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">16</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">5</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">14</td></tr></tbody></table><br>It is often possible to donate money to a charity by mail or by cell phone. The amounts of 5 mail donations and 5 cell phone donations are given in the table above. What is the positive difference, in dollars, in the mean donation amount for mail donations and for cell phone donations?",
    passage: null,
    options: [
      "0",
      "10",
      "25",
      "50"
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 39,
    prompt: "Of the following, which is closest to the ratio of the number aged 65 and over to the number aged 30 to 34?",
    passage: "In 2013, the total number of guests who used the bike ride at an amusement park was 55,994. The bar graph above shows the distribution of guests by age.",
    options: [
      "2 to 5",
      "1 to 4",
      "2 to 1",
      "1 to 2"
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: "images/mset011/q39_41.png",
    difficulty: "Hard"
  },
  {
    question_number: 40,
    prompt: "Which of the following age groups is closest to 40% smaller in number than the 1 to 4 group?",
    passage: "In 2013, the total number of guests who used the bike ride at an amusement park was 55,994. The bar graph above shows the distribution of guests by age.",
    options: [
      "35 to 39",
      "40 to 44",
      "45 to 49",
      "50 to 54"
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: "images/mset011/q39_41.png",
    difficulty: "Hard"
  },
  {
    question_number: 41,
    prompt: "Which of the following ages could be the median age of the groups in 2013?",
    passage: "In 2013, the total number of guests who used the bike ride at an amusement park was 55,994. The bar graph above shows the distribution of guests by age.",
    options: [
      "36",
      "32",
      "29",
      "22"
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: "images/mset011/q39_41.png",
    difficulty: "Hard"
  },
  {
    question_number: 42,
    prompt: "Amr would like to find the proportion of all houses in a large city that have a garage. Of the following, which sampling method would be the best in estimating this proportion?",
    passage: null,
    options: [
      "Research the 200 houses most recently sold in the city.",
      "Randomly select a small area within the city and research the houses in that area.",
      "Randomly select 50 houses from all the houses in the city.",
      "Randomly select 200 houses from all the houses in the city."
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 43,
    prompt: "A radar gun in Abu Dhabi was used to measure the speed of vehicles travelling along a highway. After all the data were collected, it was found that the radar gun had been calibrated incorrectly and was reporting each speed as 20 km per hour lower than the actual speed of the vehicles. Which of the following statistics will NOT change if the speeds are reported at their actual values?",
    passage: null,
    options: [
      "Mean",
      "Median",
      "Minimum",
      "Standard deviation"
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 44,
    prompt: "Price of Lunch Specials<br><br><table style=\"border-collapse: collapse; margin: 12px auto;\"><thead><tr style=\"background:#f1f5f9;\"><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Day</th><th style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Price</th></tr></thead><tbody><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Monday</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">$9.00</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Tuesday</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">$12.00</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Wednesday</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">$10.00</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Thursday</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">$8.00</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 16px;\">Friday</td><td style=\"border:1px solid #cbd5e1; padding:6px 16px; text-align:center;\">$10.00</td></tr></tbody></table><br>Based on the menu above, by how much does the price, in dollars, of the lunch special on Tuesday exceed the average (arithmetic mean) price of the lunch special for the 5 days shown? (Disregard the $ sign when gridding your answer.)",
    passage: null,
    options: null,
    correct_answer_index: null,
    correct_answer_text: "2.2",
    question_type: "spr",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 45,
    prompt: "A random sample of 300 Popcorn consumers was selected to taste Popcorn’s new caramel and chocolate covered popcorn. Of these consumers, 275 disliked the taste of the new popcorn flavor. Which of the following is the best inference to make from the results?",
    passage: null,
    options: [
      "It is likely that most people who have never eaten Popcorn would enjoy the new popcorn flavor.",
      "It is likely that most people who have eaten Popcorn would dislike the new popcorn flavor.",
      "On average, 96% of all popcorn eaters would dislike the new popcorn flavor.",
      "Of all the Popcorn eaters, exactly 96% of them would dislike the new popcorn flavor."
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 46,
    prompt: "A marketing executive plans to survey 500 potential car buyers to determine which car feature customers value most. Which of the following sample groups is most likely to represent all potential car buyers?",
    passage: null,
    options: [
      "500 first-time car buyers selected at random",
      "500 potential car buyers selected at random",
      "The first 500 first-time car buyers who enter a certain car dealership",
      "The first 500 potential car buyers who enter a certain car dealership"
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 47,
    prompt: "Ages of Participants<br><br><div style=\"overflow-x:auto;\"><table style=\"border-collapse: collapse; margin: 12px auto;\"><tbody><tr style=\"background:#f1f5f9;\"><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">52</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">37</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">54</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">41</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">24</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">15</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">32</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">26</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">38</td></tr><tr><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">48</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">44</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">39</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">68</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">14</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">36</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">76</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">32</td><td style=\"border:1px solid #cbd5e1; padding:6px 10px; text-align:center;\">73</td></tr></tbody></table></div><br>An article reported the mean age of participants in a study. The ages of the 18 participants in the study are given in the table above. Which of the following statements best describes why the mean age of participants alone may not be a useful measure of center for the distribution?",
    passage: null,
    options: [
      "Outliers may cause the distribution to be skewed.",
      "Repeated numbers may cause the distribution to be skewed.",
      "The number of participants is too small to calculate and report the mean.",
      "Sets containing an even number of data points may cause the distribution to be skewed."
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 48,
    prompt: "The weights, in kgs, for 21 horses in a stable were reported, and the mean, median, range, and standard deviation for the data were found. The horse with the lowest reported weight was found to actually weigh 20 kgs less than its reported weight. What value remains unchanged if the four values are reported using the corrected weight?",
    passage: null,
    options: [
      "Mean",
      "Median",
      "Range",
      "Standard deviation"
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 49,
    prompt: "Near the end of a US cable news show, the host invited viewers to respond to a poll on the show’s website that asked, “Do you support the new federal policy discussed during the show?” At the end of the show, the host reported that 28% responded “Yes,” and 70% responded “No.” Which of the following best explains why the results are unlikely to represent the sentiments of the population of the United States?",
    passage: null,
    options: [
      "The percentages do not add up to 100%, so any possible conclusions from the poll are invalid.",
      "Those who responded to the poll were not a random sample of the population of the United States.",
      "There were not 50% “Yes” responses and 50% “No” responses.",
      "The show did not allow viewers enough time to respond to the poll."
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: null,
    difficulty: "Medium"
  },
  {
    question_number: 50,
    prompt: "According to a local ordinance, no household in this area may own more than 3 dogs. What is the approximate percentage of households in this area that are in violation of the ordinance?",
    passage: null,
    options: [
      "9%",
      "17%",
      "26%",
      "83%"
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    question_type: "mcq",
    image_url: "images/mset011/q50.png",
    difficulty: "Hard"
  }
];

function updateBackupFile(testId) {
  const backupPath = path.join(__dirname, '..', 'backup_all_tests.json');
  if (!fs.existsSync(backupPath)) return;

  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  backup.tests = backup.tests || [];
  backup.questions = backup.questions || [];

  let existingTest = backup.tests.find(t => t.title === TEST_TITLE);
  if (!existingTest) {
    const maxId = backup.tests.reduce((max, t) => Math.max(max, t.id || 0), 0);
    const newTestId = testId || (maxId + 1);
    existingTest = {
      id: newTestId,
      title: TEST_TITLE,
      type: TEST_TYPE,
      allow_practice: 1,
      difficulty: 'Medium',
      created_at: new Date().toISOString()
    };
    backup.tests.push(existingTest);
  } else {
    existingTest.type = TEST_TYPE;
    existingTest.allow_practice = 1;
    existingTest.difficulty = 'Medium';
  }

  const assignedTestId = existingTest.id;

  backup.questions = backup.questions.filter(q => q.test_id !== assignedTestId);

  let maxQId = backup.questions.reduce((max, q) => Math.max(max, q.id || 0), 0);
  for (const q of rawQuestions) {
    maxQId++;
    backup.questions.push({
      id: maxQId,
      test_id: assignedTestId,
      question_number: q.question_number,
      passage: q.passage || null,
      prompt: q.prompt,
      options: q.options ? JSON.stringify(q.options) : null,
      correct_answer_index: q.correct_answer_index,
      correct_answer_text: q.correct_answer_text,
      module: 1,
      image_url: q.image_url,
      question_type: q.question_type,
      section: 'math',
      domain: TEST_DOMAIN,
      difficulty: q.difficulty
    });
  }

  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`✅ backup_all_tests.json updated successfully with test '${TEST_TITLE}' (ID: ${assignedTestId}) and ${rawQuestions.length} questions!`);
  return assignedTestId;
}

function exportCsv() {
  const csvDir = path.join(__dirname, '..', 'question', 'Math');
  if (!fs.existsSync(csvDir)) fs.mkdirSync(csvDir, { recursive: true });
  const csvPath = path.join(csvDir, 'MSET011_PSDA.csv');
  
  const headers = 'module,question_number,passage,prompt,option_a,option_b,option_c,option_d,correct_answer,correct_answer_text,image_url,question_type,domain,difficulty\n';
  const lines = rawQuestions.map(q => {
    const esc = (val) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };
    const opt = q.options || [];
    const ans = q.correct_answer_index !== null && q.correct_answer_index !== undefined ? ['A', 'B', 'C', 'D'][q.correct_answer_index] : '';
    return [
      1,
      q.question_number,
      esc(q.passage || ''),
      esc(q.prompt),
      esc(opt[0] || ''),
      esc(opt[1] || ''),
      esc(opt[2] || ''),
      esc(opt[3] || ''),
      esc(ans),
      esc(q.correct_answer_text || ''),
      esc(q.image_url || ''),
      esc(q.question_type),
      esc(TEST_DOMAIN),
      esc(q.difficulty)
    ].join(',');
  });

  fs.writeFileSync(csvPath, headers + lines.join('\n'), 'utf8');
  console.log(`✅ CSV exported to ${csvPath}`);
}

async function importToDatabase() {
  console.log(`Starting import for '${TEST_TITLE}' (${TEST_TYPE})...`);

  let assignedTestId = updateBackupFile();
  exportCsv();

  let connection;
  try {
    console.log(`Connecting to MySQL (${process.env.DB_HOST}:${process.env.DB_PORT})...`);
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });
    console.log('Connected to MySQL successfully!');

    const [existing] = await connection.query('SELECT id FROM tests WHERE title = ?', [TEST_TITLE]);
    let testId;
    if (existing.length > 0) {
      testId = existing[0].id;
      console.log(`Test '${TEST_TITLE}' already exists in DB with ID ${testId}. Cleaning up old questions...`);
      await connection.query('DELETE FROM questions WHERE test_id = ?', [testId]);
      await connection.query('UPDATE tests SET type = ?, allow_practice = 1, difficulty = ? WHERE id = ?', [TEST_TYPE, 'Medium', testId]);
    } else {
      console.log(`Creating new test '${TEST_TITLE}' in DB...`);
      const [res] = await connection.query(
        'INSERT INTO tests (title, type, allow_practice, difficulty) VALUES (?, ?, 1, ?)',
        [TEST_TITLE, TEST_TYPE, 'Medium']
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
          q.passage || null,
          q.prompt,
          q.options ? JSON.stringify(q.options) : null,
          q.correct_answer_index,
          q.correct_answer_text,
          1,
          q.image_url,
          q.question_type,
          'math',
          TEST_DOMAIN,
          q.difficulty
        ]
      );
    }

    console.log(`🎉 DB import completed: '${TEST_TITLE}' (ID: ${testId}) with ${rawQuestions.length} questions.`);
    updateBackupFile(testId);
  } catch (err) {
    console.error('⚠️ DB import error:', err);
  } finally {
    if (connection) await connection.end();
  }
}

importToDatabase().catch(console.error);
