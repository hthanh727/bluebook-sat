require('dotenv').config({ override: true });
const mysql = require('mysql2/promise');

const TEST_TITLE = 'T8 2026 Int I';
const TEST_TYPE = 'math';

const questions = [
  // ================= MODULE 1 =================
  {
    module: 1,
    question_number: 1,
    question_type: 'spr',
    prompt: 'Sphere A and Sphere B are tangent to each other at point \\(P\\). Segment \\(MP\\) is a diameter of Sphere A, segment \\(NP\\) is a diameter of Sphere B, and point \\(P\\) lies on line segment \\(MN\\). The radius of Sphere A is \\(5\\) times the radius of Sphere B. If the volume of Sphere B is \\(288\\pi\\text{ in.}^3\\), what is the length of segment \\(MN\\) in inches?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '72',
    image_url: null,
    domain: 'Geometry and Trigonometry',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 2,
    question_type: 'mcq',
    prompt: "To cut a lawn, Antwan charges a fee of \\(\\$10.00\\) for his equipment and \\(\\$8.50\\) per hour spent cutting a lawn. Taylor charges a fee of \\(\\$7.00\\) for his equipment and \\(\\$9.50\\) per hour spent cutting a lawn. If \\(x\\) represents the number of hours spent cutting a lawn, what are the values of \\(x\\) for which Taylor's total charge is greater than Antwan's total charge?",
    options: [
      '\\(2 \\le x \\le 3\\)',
      '\\(3 \\le x \\le 4\\)',
      '\\(x < 2\\)',
      '\\(x > 3\\)'
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 3,
    question_type: 'mcq',
    prompt: 'The relationship between the variables \\(x\\) and \\(y\\) is defined by an exponential equation. When \\(x = 0\\) the value of \\(y\\) is \\(30\\), and for every increase in the value of \\(x\\) by \\(1\\), the corresponding value of \\(y\\) increases by \\(70\\%\\) of its previous value. Which equation represents this relationship?',
    options: [
      '\\(y = 30(1.70)^x\\)',
      '\\(y = 30(1.07)^x\\)',
      '\\(y = 70(1.30)^x\\)',
      '\\(y = 70(1.03)^x\\)'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 4,
    question_type: 'mcq',
    prompt: 'In the figure shown, lines \\(a\\), \\(b\\), and \\(c\\) are parallel. If \\(201 < x + y + z < 212\\), which of the following could be true?\n\nI. \\(w - y = 22\\)\nII. \\(w - y = 32\\)',
    options: [
      'I only',
      'II only',
      'I and II',
      'Neither I nor II'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: 'images/t8_2026_int_1/m1_q4.png',
    domain: 'Geometry and Trigonometry',
    difficulty: 'Hard'
  },
  {
    module: 1,
    question_number: 5,
    question_type: 'mcq',
    prompt: 'A circle has center \\(O\\), and points \\(P\\) and \\(Q\\) lie on the circle such that segment \\(PQ\\) is a diameter of the circle. The length of arc \\(PQ\\) is \\(56\\) centimeters. What is the circumference, in centimeters, of the circle?',
    options: [
      '42',
      '56',
      '112',
      '224'
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    image_url: null,
    domain: 'Geometry and Trigonometry',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 6,
    question_type: 'mcq',
    prompt: 'In 2004, Aster earned \\(11\\%\\) more than in 2003, and in 2005 Aster earned \\(6\\%\\) more than in 2004. If Aster earned \\(y\\) times as much in 2003 as in 2005, which of the following is closest to the value of \\(y\\)?',
    options: [
      '0.5455',
      '0.6600',
      '0.8409',
      '1.1766'
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 7,
    question_type: 'mcq',
    prompt: 'A community organization surveyed a random sample of residents to estimate the percentage of residents who visit their local library at least once per month. The organization estimates that \\(19\\%\\) of residents visit the library at least once per month, with an associated margin of error of \\(3.7\\%\\). The organization repeated the survey with a random sample that was double the original sample size. Which of the following is true about the margin of error associated with the estimate from the larger sample?',
    options: [
      'The margin of error is less than 3.7%.',
      'The margin of error is 7.4%.',
      'The margin of error is greater than 19%.',
      'The margin of error is 38%.'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 8,
    question_type: 'mcq',
    prompt: 'Two data sets of \\(23\\) integers each are summarized in the histograms shown. For each of the histograms, the first interval represents the frequency of integers greater than or equal to \\(10\\), but less than \\(20\\). The second interval represents the frequency of integers greater than or equal to \\(20\\), but less than \\(30\\), and so on. What is the smallest possible difference between the mean of data set A and the mean of data set B?',
    options: [
      '0',
      '1',
      '10',
      '23'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: 'images/t8_2026_int_1/m1_q8.png',
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 9,
    question_type: 'spr',
    prompt: '\\(g(x) = (x + 14)(t - x)\\)\n\nThe function \\(g\\) is defined by the given equation, where \\(t\\) is a constant. In the \\(xy\\)-plane, the graph of \\(y = g(x)\\) passes through the point \\((18, 0)\\). What is the value of \\(g(0)\\)?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '252',
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 10,
    question_type: 'spr',
    prompt: 'In the ancient Roman measurement system, a leuga was a unit of length that was equal to \\(7{,}500\\) pedes. In this measurement system, how many pedes were equivalent to \\(4.2\\) leugas?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '31500',
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 11,
    question_type: 'mcq',
    prompt: '\\(y = \\frac{35 - x}{ax + b}\\)\n\nWhat is the \\(x\\)-intercept of the graph of the equation in the \\(xy\\)-plane, where \\(a\\) and \\(b\\) are positive constants?',
    options: [
      '\\((35, 0)\\)',
      '\\((0, -35)\\)',
      '\\(\\left(0, \\frac{35}{b}\\right)\\)',
      '\\(\\left(-\\frac{b}{a}, 0\\right)\\)'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 12,
    question_type: 'spr',
    prompt: 'A triathlon is a multisport race consisting of three different consecutive events. A triathlon participant plans to complete the cycling event with an average speed of \\(31{,}680\\) yards per hour. What is this average speed, in miles per hour? (\\(1\\text{ mile} = 1{,}760\\text{ yards}\\))',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '18',
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 13,
    question_type: 'spr',
    prompt: 'The figure shown is a right rectangular pyramid, where \\(l = 16\\) units, \\(w = 8\\) units, and \\(h = 18\\) units. What is the surface area, in square units, of the pyramid?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '581',
    image_url: 'images/t8_2026_int_1/m1_q13.png',
    domain: 'Geometry and Trigonometry',
    difficulty: 'Hard'
  },
  {
    module: 1,
    question_number: 14,
    question_type: 'mcq',
    prompt: '\\(f(x) = 18(2.80)^{\\frac{x}{2}}\\)\n\nThe function \\(f\\) is defined by the given equation. The value of \\(f(x)\\) increases by \\(p\\%\\) for every increase of \\(x\\) by \\(4\\). For which of the following functions, where \\(n\\) is a positive constant, does the value of \\(g(x)\\) increase by \\(p\\%\\) for every increase of \\(x\\) by \\(1\\)?',
    options: [
      '\\(g(x) = n(1.40)^x\\)',
      '\\(g(x) = n(2.80)^x\\)',
      '\\(g(x) = n(6.84)^x\\)',
      '\\(g(x) = n(7.84)^x\\)'
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Hard'
  },
  {
    module: 1,
    question_number: 15,
    question_type: 'mcq',
    prompt: 'The scatterplot shows \\(9\\) data points and their line of best fit. For how many of the \\(9\\) data points is the actual \\(y\\)-value greater than the \\(y\\)-value predicted by the line of best fit?',
    options: [
      '8',
      '7',
      '5',
      '2'
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    image_url: 'images/t8_2026_int_1/m1_q15.png',
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 16,
    question_type: 'mcq',
    prompt: 'In triangles \\(RST\\) and \\(XYZ\\) shown, \\(XY\\) is parallel to \\(TS\\) and \\(\\tan R = \\frac{160}{231}\\). What is the value of \\(\\sin X\\) in triangle \\(XYZ\\)?',
    options: [
      '\\(\\frac{160}{391}\\)',
      '\\(\\frac{160}{281}\\)',
      '\\(\\frac{231}{281}\\)',
      '\\(\\frac{231}{160}\\)'
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    image_url: 'images/t8_2026_int_1/m1_q16.png',
    domain: 'Geometry and Trigonometry',
    difficulty: 'Hard'
  },
  {
    module: 1,
    question_number: 17,
    question_type: 'mcq',
    prompt: '\\(f(x) = (x - 3)(x + 5)\\)\n\nThe function \\(f\\) is defined by the given equation. The function \\(g\\) is defined by \\(g(x) = f(x - 2) + 4\\). Which of the following equations is an equivalent form of \\(g(x)\\) that displays the minimum value of \\(g\\) as a constant or coefficient?',
    options: [
      '\\(g(x) = (x - 5)(x + 3) + 4\\)',
      '\\(g(x) = (x + 1)^2 - 12\\)',
      '\\(g(x) = (x - 1)^2 - 12\\)',
      '\\(g(x) = x^2 - 2x - 11\\)'
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 18,
    question_type: 'spr',
    prompt: 'A researcher investigated two species of mites: a predator and its prey. At the start of a week, there was an equal number of the two species. At the end of the week, the number of prey had increased by \\(1900\\%\\) of the number of prey at the start of the week, and the number of predators had increased by \\(220\\%\\) of the number of predators at the start of the week. The number of predators at the end of the week was \\(p\\%\\) less than the number of prey at the end of the week. What is the value of \\(p\\)?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '84',
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Hard'
  },
  {
    module: 1,
    question_number: 19,
    question_type: 'mcq',
    prompt: 'Each \\(3.0\\)-ounce serving of cheddar cheese and each \\(1.2\\)-ounce serving of tuna provides about \\(1\\) microgram of vitamin B12. If a total of \\(3.5\\) micrograms of vitamin B12 are consumed from eating \\(x\\) ounces of cheese and \\(y\\) ounces of tuna, which equation best represents this situation?',
    options: [
      '\\(0.33x + 0.33y = 3.5\\)',
      '\\(3.0x + 1.2y = 3.5\\)',
      '\\(1.2x + 3.0y = 3.5\\)',
      '\\(0.33x + 0.83y = 3.5\\)'
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 20,
    question_type: 'mcq',
    prompt: 'In triangle \\(RST\\), \\(RS = 504\\), \\(ST = 128\\), and \\(TR = 520\\). Triangle \\(RST\\) is similar to triangle \\(UVW\\), where \\(S\\) corresponds to \\(V\\) and \\(T\\) corresponds to \\(W\\). What is the value of \\(\\tan W\\)?',
    options: [
      '\\(\\frac{16}{65}\\)',
      '\\(\\frac{16}{63}\\)',
      '\\(\\frac{63}{65}\\)',
      '\\(\\frac{63}{16}\\)'
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    image_url: null,
    domain: 'Geometry and Trigonometry',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 21,
    question_type: 'mcq',
    prompt: 'Which of the following data sets has the largest standard deviation, where \\(p\\) is a constant?',
    options: [
      '\\(p - 10, p - 5, p, p - 2, p + 2\\)',
      '\\(p - 5, p - 5, p, p, p - 2\\)',
      '\\(p - 2, p + 2, p, p, p - 10\\)',
      '\\(p, p, p, p, p\\)'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Hard'
  },
  {
    module: 1,
    question_number: 22,
    question_type: 'mcq',
    prompt: 'In the equation \\(7x(x + 11) = r\\), \\(r\\) is a positive integer. How many distinct real solutions does the equation have for \\(x\\)?',
    options: [
      'Zero',
      'Exactly one',
      'Exactly two',
      'Infinitely many'
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },

  // ================= MODULE 2 =================
  {
    module: 2,
    question_number: 1,
    question_type: 'mcq',
    prompt: 'A rectangle is inscribed in a circle. If the length of the diagonal of the rectangle is \\(482\\sqrt{3}\\), what is the radius of the circle?',
    options: [
      '\\(241\\sqrt{3}\\)',
      '\\(482\\sqrt{3}\\)',
      '\\(964\\sqrt{3}\\)',
      '\\(241\\sqrt{6}\\)'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: null,
    domain: 'Geometry and Trigonometry',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 2,
    question_type: 'mcq',
    prompt: 'What is the sum of the solutions to the equation \\(x^2 - 90x - 18 = 0\\)?',
    options: [
      '-90',
      '-18',
      '18',
      '90'
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 3,
    question_type: 'mcq',
    prompt: 'In the \\(xy\\)-plane, the function \\(g(x)\\) is defined as \\(g(x) = \\frac{f(x)}{x+4}\\). If the \\(y\\)-intercept of the graph of \\(y = g(x)\\) is \\((0, 54)\\), what is the value of \\(f(0)\\)?',
    options: [
      '13.5',
      '54',
      '216',
      '220'
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 4,
    question_type: 'mcq',
    prompt: 'A square pyramid has a base side length of \\(a = 4\\) units and a height of \\(h = 6\\) units. What is the volume of the pyramid in cubic units?',
    options: [
      '8',
      '16',
      '32',
      '48'
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    image_url: null,
    domain: 'Geometry and Trigonometry',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 5,
    question_type: 'mcq',
    prompt: 'The graph of a quadratic function \\(y = f(x)\\) opens upward with its vertex located below the line \\(y = -9\\). Which of the following could be the number of real solutions to the equation \\(f(x) = -9\\)?',
    options: [
      'Zero',
      'Exactly one',
      'Exactly two',
      'Infinitely many'
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 6,
    question_type: 'mcq',
    prompt: 'If \\(7(x - 4)^2 = 700\\) and \\(x > 0\\), what is the value of \\(x\\)?',
    options: [
      '6',
      '10',
      '14',
      '104'
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 7,
    question_type: 'mcq',
    prompt: 'Line \\(j\\) passes through the points \\((12, 0)\\) and \\((8, 0)\\) in the \\(xy\\)-plane. Line \\(k\\) is perpendicular to line \\(j\\) and passes through the origin \\((0, 0)\\). At what \\(x\\)-coordinate do line \\(j\\) and line \\(k\\) intersect?',
    options: [
      '-12',
      '0',
      '8',
      '10'
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 8,
    question_type: 'mcq',
    prompt: 'A quadratic function \\(f(x)\\) satisfies \\(f(0) = 3\\) and \\(f(8) = 3\\). Which of the following equations could define \\(f(x)\\)?',
    options: [
      '\\(f(x) = x(x - 8) + 3\\)',
      '\\(f(x) = x(x + 8) + 3\\)',
      '\\(f(x) = (x - 3)(x - 8)\\)',
      '\\(f(x) = 3x^2 - 8x\\)'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 9,
    question_type: 'mcq',
    prompt: 'In \\(\\triangle ABC\\), angle \\(C\\) is a right angle (\\(\\angle C = 90^\\circ\\)). Point \\(E\\) lies on side \\(AC\\) such that \\(CE = 2 \\cdot AE\\), and point \\(D\\) lies on side \\(AB\\) such that segment \\(ED\\) is perpendicular to \\(AC\\). If \\(BC = 198\\), what is the length of segment \\(ED\\)?',
    options: [
      '66',
      '99',
      '132',
      '396'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: null,
    domain: 'Geometry and Trigonometry',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 10,
    question_type: 'mcq',
    prompt: '\\(f(x) = 16 - \\frac{x}{27}\\)\n\nThe function \\(f\\) is defined by the given equation. What is the value of \\(f(270)\\)?',
    options: [
      '-10',
      '6',
      '10',
      '26'
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 11,
    question_type: 'mcq',
    prompt: 'A system of linear equations is given:\n\n\\(\\begin{cases} y = 6 \\\\ y = -4x + 2 \\end{cases}\\)\n\nWhat is the solution \\((x, y)\\) to the system?',
    options: [
      '\\((-1, 6)\\)',
      '\\((1, 6)\\)',
      '\\((6, -1)\\)',
      '\\((6, 22)\\)'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 12,
    question_type: 'mcq',
    prompt: 'The total remaining distance, in miles, of a runner after \\(t\\) hours is modeled by the function \\(g(t) = 22 - 4t\\). What is the best interpretation of the number \\(22\\) in this context?',
    options: [
      'The speed of the runner in miles per hour',
      'The total time taken to finish the run',
      'The initial total distance, in miles, of the run',
      'The distance covered in the first hour'
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 13,
    question_type: 'mcq',
    prompt: 'A quantity decreases by \\(20\\%\\) every \\(5\\) seconds. If the initial value of the quantity is \\(340\\), which function \\(f(x)\\) represents the value of the quantity after \\(x\\) seconds?',
    options: [
      '\\(f(x) = 340(0.2)^{5x}\\)',
      '\\(f(x) = 340(0.8)^{5x}\\)',
      '\\(f(x) = 340(0.2)^{\\frac{x}{5}}\\)',
      '\\(f(x) = 340(0.8)^{\\frac{x}{5}}\\)'
    ],
    correct_answer_index: 3,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 14,
    question_type: 'mcq',
    prompt: "A company's annual revenue was \\(x\\) dollars in 2012. The revenue increased by \\(12\\%\\) from 2012 to 2013, and increased by \\(4\\%\\) from 2013 to 2014. If the revenue in 2014 was \\(y\\) times the revenue in 2012, which expression represents \\(y\\)?",
    options: [
      '\\((1.12)(1.04)\\)',
      '\\((1.12) + (1.04)\\)',
      '\\(\\frac{1.04}{1.12}\\)',
      '\\(\\frac{1}{(1.12)(1.04)}\\)'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 15,
    question_type: 'mcq',
    prompt: 'The table shows values of \\(x\\) and \\(y\\).\n\n| \\(x\\) | \\(y\\) |\n| :--- | :--- |\n| 1 | 4,000 |\n| 2 | 2,400 |\n| 3 | 1,440 |\n| 4 | 864 |\n\nWhich type of function best models the relationship between \\(x\\) and \\(y\\)?',
    options: [
      'Linear',
      'Exponential decay',
      'Quadratic',
      'Absolute value'
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 16,
    question_type: 'mcq',
    prompt: 'During a triathlon, an athlete swims at a rate of \\(31{,}152\\) inches per hour. Given that \\(1\\text{ yard} = 36\\text{ inches}\\), what is this speed in yards per hour?',
    options: [
      '17.7',
      '865.33',
      '1,760',
      '8,653.33'
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 17,
    question_type: 'mcq',
    prompt: 'The scatterplot shows the relationship between two variables, \\(x\\) and \\(y\\). A line of best fit is also shown. For \\(x = 5\\), how much greater is the \\(y\\)-value predicted by the line of best fit than the actual \\(y\\)-value of the data point?',
    options: [
      '1',
      '5',
      '6',
      '11'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: 'images/t8_2026_int_1/m2_q17.png',
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 18,
    question_type: 'mcq',
    prompt: '\\(g(x) = -\\sqrt{x^2 + bx + c}\\)\n\nThe function \\(g\\) is defined by the given equation, where \\(b\\) and \\(c\\) are integers. In the \\(xy\\)-plane, the graph of \\(y = g(x)\\) passes through the points \\((2, 0)\\) and \\((0, -\\sqrt{298})\\). If \\(m\\) is a value for which \\(g(m) = 0\\), what is the greatest possible value of \\(m\\)?',
    options: [
      '-150',
      '2',
      '149',
      '150'
    ],
    correct_answer_index: 2,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Hard'
  },
  {
    module: 2,
    question_number: 19,
    question_type: 'mcq',
    prompt: '\\(18p - 19p = 17\\)\n\nWhat is the value of \\(p\\) that satisfies the equation?',
    options: [
      '-17',
      '\\(-\\frac{1}{17}\\)',
      '17',
      '37'
    ],
    correct_answer_index: 0,
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 20,
    question_type: 'mcq',
    prompt: 'Points \\(A\\) and \\(B\\) lie on a circle centered at point \\(C\\). If the length of line segment \\(AC\\) is \\(34\\text{ mm}\\), what is the length of segment \\(BC\\)?',
    options: [
      '17 mm',
      '34 mm',
      '68 mm',
      '115.6 mm'
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    image_url: null,
    domain: 'Geometry and Trigonometry',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 21,
    question_type: 'mcq',
    prompt: 'Which of the following expressions is equivalent to \\(\\frac{4}{x - 5} - \\frac{4}{(x - 5)^2}\\) for all \\(x > 5\\)?',
    options: [
      '\\(\\frac{0}{(x - 5)^2}\\)',
      '\\(\\frac{4x - 24}{(x - 5)^2}\\)',
      '\\(\\frac{4x - 16}{(x - 5)^2}\\)',
      '\\(\\frac{4}{x - 5}\\)'
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 22,
    question_type: 'mcq',
    prompt: 'Consider the system of linear equations:\n\n\\(\\begin{cases} 3x = 2 + 8y \\\\ -3x = -5 + 8y \\end{cases}\\)\n\nWhat is the value of \\(6x\\)?',
    options: [
      '\\(\\frac{7}{2}\\)',
      '7',
      '14',
      '21'
    ],
    correct_answer_index: 1,
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Medium'
  }
];

async function importTest() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
  });

  try {
    console.log(`Checking if test '${TEST_TITLE}' already exists...`);
    const [existing] = await connection.query('SELECT id FROM tests WHERE title = ?', [TEST_TITLE]);

    let testId;
    if (existing.length > 0) {
      testId = existing[0].id;
      console.log(`Test '${TEST_TITLE}' already exists with ID ${testId}. Cleaning up old questions...`);
      await connection.query('DELETE FROM questions WHERE test_id = ?', [testId]);
      await connection.query('UPDATE tests SET type = ?, allow_practice = 1 WHERE id = ?', [TEST_TYPE, testId]);
    } else {
      console.log(`Creating new test '${TEST_TITLE}'...`);
      const [res] = await connection.query(
        'INSERT INTO tests (title, type, allow_practice) VALUES (?, ?, 1)',
        [TEST_TITLE, TEST_TYPE]
      );
      testId = res.insertId;
      console.log(`Created test with ID ${testId}`);
    }

    console.log(`Inserting ${questions.length} questions for test ID ${testId}...`);

    for (const q of questions) {
      const optionsJson = q.options ? JSON.stringify(q.options) : null;
      await connection.query(
        `INSERT INTO questions (
          test_id,
          question_number,
          passage,
          prompt,
          options,
          correct_answer_index,
          correct_answer_text,
          module,
          image_url,
          question_type,
          section,
          domain,
          difficulty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testId,
          q.question_number,
          null,
          q.prompt,
          optionsJson,
          q.correct_answer_index,
          q.correct_answer_text,
          q.module,
          q.image_url,
          q.question_type,
          'math',
          q.domain,
          q.difficulty
        ]
      );
    }

    console.log(`Successfully imported all ${questions.length} questions for '${TEST_TITLE}' (Test ID: ${testId})!`);
  } catch (err) {
    console.error('Error importing test:', err);
  } finally {
    await connection.end();
  }
}

importTest();
