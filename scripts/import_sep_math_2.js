require('dotenv').config({ override: true });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const TEST_TITLE = 'Sep Math II';
const TEST_TYPE = 'math';

const rawQuestions = [
  // ================= MODULE 1 =================
  {
    module: 1,
    question_number: 1,
    question_type: 'mcq',
    prompt: 'What value of \\(p\\) is the solution to the equation \\(\\frac{p}{2} - 9 = 11\\)?',
    options: ['20', '22', '40', '80'],
    correct_answer_index: 2, // C
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 2,
    question_type: 'spr',
    prompt: 'The function \\(f\\) is defined by \\(f(x) = 2x + 5\\). What is the value of \\(f(x)\\) when \\(x = 100\\)?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '205',
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 3,
    question_type: 'mcq',
    prompt: 'Each face of a fair 16-sided die is labeled with a number from 1 through 16, with a different number appearing on each face. If the die is rolled one time, what is the probability of rolling a 2?',
    options: [
      '\\(\\frac{15}{16}\\)',
      '\\(\\frac{14}{16}\\)',
      '\\(\\frac{2}{16}\\)',
      '\\(\\frac{1}{16}\\)'
    ],
    correct_answer_index: 3, // D
    correct_answer_text: null,
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 4,
    question_type: 'mcq',
    prompt: 'For the function \\(f\\), the table shows four values of \\(x\\) and their corresponding values of \\(f(x)\\).\n\n| \\(x\\) | \\(f(x)\\) |\n| :---: | :---: |\n| 1 | 2,000 |\n| 2 | 400 |\n| 3 | 80 |\n| 4 | 16 |\n\nWhich of the following could describe this function?',
    options: [
      'Decreasing exponential',
      'Increasing exponential',
      'Decreasing linear',
      'Increasing linear'
    ],
    correct_answer_index: 0, // A
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 5,
    question_type: 'spr',
    prompt: 'A rectangle has a length of 3 centimeters and a width of 2 centimeters. What is the perimeter, in centimeters, of this rectangle?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '10',
    image_url: null,
    domain: 'Geometry and Trigonometry',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 6,
    question_type: 'mcq',
    prompt: 'The function \\(f\\) is defined by \\(f(x) = -\\frac{4}{13}x + 13\\). What is the slope of the graph of \\(y = f(x)\\) in the xy-plane?',
    options: [
      '-13',
      '\\(-\\frac{4}{13}\\)',
      '\\(\\frac{1}{13}\\)',
      '4'
    ],
    correct_answer_index: 1, // B
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 7,
    question_type: 'mcq',
    prompt: 'Line \\(k\\) is defined by \\(y = 3x + 13\\). Line \\(j\\) is perpendicular to line \\(k\\) in the xy-plane. What is the slope of line \\(j\\)?',
    options: [
      '\\(-\\frac{1}{3}\\)',
      '\\(\\frac{1}{10}\\)',
      '\\(-\\frac{1}{16}\\)',
      '\\(\\frac{1}{39}\\)'
    ],
    correct_answer_index: 0, // A
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 8,
    question_type: 'mcq',
    prompt: 'The function \\(f(x) = 1,200(0.5)^{x/15}\\) gives the predicted intensity of a beam \\(f(x)\\), in number of photons in the beam, \\(x\\) millimeters below the surface of a certain material. What is the best interpretation of \\(f(15) = 600\\)?',
    options: [
      'A beam at the surface of the material has a predicted intensity of 15 photons in the beam.',
      'A beam at the surface of the material has a predicted intensity of 600 photons in the beam.',
      'A beam 15 millimeters below the surface of the material has a predicted intensity of 600 photons in the beam.',
      'A beam 600 millimeters below the surface of the material has a predicted intensity of 1,200 photons in the beam.'
    ],
    correct_answer_index: 2, // C
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 9,
    question_type: 'mcq',
    prompt: 'In triangle \\(ABC\\), the measure of angle \\(A\\) is \\(36^\\circ\\), the measure of angle \\(B\\) is \\(90^\\circ\\), and the measure of angle \\(C\\) is \\(\\left(\\frac{k}{2}\\right)^\\circ\\). What is the value of \\(k\\)?',
    options: ['45', '54', '72', '108'],
    correct_answer_index: 3, // D
    correct_answer_text: null,
    image_url: null,
    domain: 'Geometry and Trigonometry',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 10,
    question_type: 'mcq',
    prompt: 'For the exponential function \\(g\\), the table shows four values of \\(x\\) and their corresponding values of \\(g(x)\\).\n\n| \\(x\\) | \\(g(x)\\) |\n| :---: | :---: |\n| -1 | 42 |\n| 0 | 1 |\n| 1 | \\(\\frac{1}{42}\\) |\n| 2 | \\(\\frac{1}{1,764}\\) |\n\nWhich equation defines \\(g\\)?',
    options: [
      '\\(g(x) = -42^x\\)',
      '\\(g(x) = -\\left(\\frac{1}{42}\\right)^x\\)',
      '\\(g(x) = 42^x\\)',
      '\\(g(x) = \\left(\\frac{1}{42}\\right)^x\\)'
    ],
    correct_answer_index: 3, // D
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 11,
    question_type: 'spr',
    prompt: 'The expression \\((3x + 4)(x + 6)\\) can be written in the form \\(ax^2 + bx + c\\), where \\(a\\), \\(b\\), and \\(c\\) are constants. What is the value of \\(a + b + c\\)?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '49',
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 12,
    question_type: 'mcq',
    prompt: 'A space probe uses a square-shaped solar sail to move through space. The side length of the solar sail is \\(8.89w\\) meters, where \\(w\\) is the width, in meters, of the space probe. Which equation gives the area \\(A\\), in square meters, of the solar sail?',
    options: [
      '\\(A = (w + 8.89)(w + 8.89)\\)',
      '\\(A = (4)(8.89w)\\)',
      '\\(A = (8.89w)(8.89w)\\)',
      '\\(A = \\left(\\frac{8.89}{w}\\right)\\left(\\frac{8.89}{w}\\right)\\)'
    ],
    correct_answer_index: 2, // C
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 13,
    question_type: 'spr',
    prompt: 'Line \\(t\\) intersects both line \\(r\\) and line \\(s\\). In the figure, line \\(r\\) is parallel to line \\(s\\). At the intersection of line \\(t\\) and line \\(r\\), one angle is labeled \\(x^\\circ\\). At the intersection of line \\(t\\) and line \\(s\\), one angle is labeled \\(49^\\circ\\). What is the value of \\(x\\)?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '49',
    image_url: 'images/sep_math_2/m1_q13.png',
    domain: 'Geometry and Trigonometry',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 14,
    question_type: 'mcq',
    prompt: 'A farmer gave two groups of chickens different types of chicken feed for a month to measure the effect on egg production. The lists give the number of eggs collected from each chicken in each group:\n\n• Group G: 8, 16, 18, 18, 23\n• Group H: 16, 18, 18, 23\n\nWhich statement correctly compares the median number of eggs collected for group G and group H?',
    options: [
      'The median for group G is equal to the median for group H.',
      'The median for group G is greater than the median for group H.',
      'The median for group G is less than the median for group H.',
      'There is not enough information to compare the medians.'
    ],
    correct_answer_index: 0, // A
    correct_answer_text: null,
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 15,
    question_type: 'mcq',
    prompt: 'Given the equation \\(\\sqrt{28} = \\sqrt{\\frac{1}{x}}\\), what is the solution to the equation?',
    options: [
      '784',
      '28',
      '\\(\\frac{1}{28}\\)',
      '\\(\\frac{1}{784}\\)'
    ],
    correct_answer_index: 2, // C
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 16,
    question_type: 'mcq',
    prompt: 'Given \\(x^2 - 2x = 10\\), what is one of the solutions to the equation?',
    options: [
      '\\(\\sqrt{10}\\)',
      '\\(1 + \\sqrt{11}\\)',
      '11',
      '\\(10 + \\sqrt{2}\\)'
    ],
    correct_answer_index: 1, // B
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 17,
    question_type: 'mcq',
    prompt: 'The graph of the polynomial function \\(f\\) in the xy-plane, where \\(y = f(x)\\), passes through the point \\((7, 9)\\). What is the value of \\(f(7)\\)?',
    options: ['7', '9', '16', '63'],
    correct_answer_index: 1, // B
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Easy'
  },
  {
    module: 1,
    question_number: 18,
    question_type: 'mcq',
    prompt: 'A circuit consists of 7 resistors connected in series with a total resistance of 80 ohms. The resistance of each resistor is positive. The total resistance of 3 resistors in this circuit is 60 ohms. Which inequality best represents all possible values of the resistance \\(x\\), in ohms, of one of the remaining 4 resistors?',
    options: [
      '\\(20 < x < 80\\)',
      '\\(20 < x < 60\\)',
      '\\(0 < x < 20\\)',
      '\\(0 < x < 5\\)'
    ],
    correct_answer_index: 2, // C
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Medium'
  },
  {
    module: 1,
    question_number: 19,
    question_type: 'mcq',
    prompt: 'The measure of angle \\(A\\) is \\(\\frac{\\pi}{282}\\) radians. The measure of angle \\(B\\) is 47 times the measure of angle \\(A\\). What is the value of \\(\\cos B\\)?',
    options: [
      '0',
      '\\(\\frac{1}{2}\\)',
      '\\(\\frac{\\sqrt{2}}{2}\\)',
      '\\(\\frac{\\sqrt{3}}{2}\\)'
    ],
    correct_answer_index: 3, // D
    correct_answer_text: null,
    image_url: null,
    domain: 'Geometry and Trigonometry',
    difficulty: 'Hard'
  },
  {
    module: 1,
    question_number: 20,
    question_type: 'spr',
    prompt: 'On a plot of land, 52.0% of the square footage is farmland and the remaining square footage is pasture. There are buildings on exactly 23.5% of the farmland, and on 11.0% of the pasture. If there are buildings on \\(p\\%\\) of the total land, what is the value of \\(p\\)?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '17.5',
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Hard'
  },
  {
    module: 1,
    question_number: 21,
    question_type: 'mcq',
    prompt: 'In right triangle \\(QRS\\), angle \\(R\\) is a right angle, \\(QR < RS\\), and the length of side \\(RS\\) is 49. Which expression represents the length of segment \\(QS\\)?',
    options: [
      '\\(49\\cos Q\\)',
      '\\(49\\sin Q\\)',
      '\\(\\frac{49}{\\cos Q}\\)',
      '\\(\\frac{49}{\\sin Q}\\)'
    ],
    correct_answer_index: 3, // D
    correct_answer_text: null,
    image_url: 'images/sep_math_2/m1_q21.png',
    domain: 'Geometry and Trigonometry',
    difficulty: 'Hard'
  },
  {
    module: 1,
    question_number: 22,
    question_type: 'mcq',
    prompt: 'A moving truck rental company charges $165 for the first hour and $95 for each additional hour, plus the cost of gas used (\\(w\\)). Which equation represents the total cost \\(y\\) for \\(x\\) hours where \\(x \\ge 1\\)?',
    options: [
      '\\(y = 95(x - 1) + w\\)',
      '\\(y = 165 + 95 + w\\)',
      '\\(y = 165 + 95x + w\\)',
      '\\(y = 165 + 95(x - 1) + w\\)'
    ],
    correct_answer_index: 3, // D
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Medium'
  },

  // ================= MODULE 2 =================
  {
    module: 2,
    question_number: 1,
    question_type: 'mcq',
    prompt: 'From left to right, the values of the vertical bars in the box plot above are 3, 5, 6, 7, and 9, and it summarizes 15 data values. What is the median of this data set?',
    options: ['2', '3', '6', '7'],
    correct_answer_index: 2, // C
    correct_answer_text: null,
    image_url: 'images/sep_math_2/m2_q1.png',
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 2,
    question_type: 'spr',
    prompt: 'The graph of a function is shown in the xy-plane. What is the y-coordinate of the y-intercept of the graph?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '3',
    image_url: 'images/sep_math_2/m2_q2.png',
    domain: 'Advanced Math',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 3,
    question_type: 'mcq',
    prompt: 'A scatterplot shows data points with a line of best fit slanting up from left to right, passing through the approximate coordinates (10, 16.4), (8, 14.4), and (12, 18.4). Which equation best represents the line of best fit?',
    options: [
      '\\(y = -x - 6.4\\)',
      '\\(y = -x + 6.4\\)',
      '\\(y = x - 6.4\\)',
      '\\(y = x + 6.4\\)'
    ],
    correct_answer_index: 3, // D
    correct_answer_text: null,
    image_url: 'images/sep_math_2/m2_q3.png',
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 4,
    question_type: 'mcq',
    prompt: 'The function \\(f\\) is defined by \\(f(x) = 3x - 7\\). If \\(f(a) + 1 = 2a\\), what is the value of \\(a\\)?',
    options: ['-1', '1', '5', '6'],
    correct_answer_index: 3, // D
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 5,
    question_type: 'mcq',
    prompt: 'What is the area, in square centimeters, of a rectangle with a length of 38 centimeters and a width of 33 centimeters?',
    options: ['71', '142', '1,089', '1,254'],
    correct_answer_index: 3, // D
    correct_answer_text: null,
    image_url: null,
    domain: 'Geometry and Trigonometry',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 6,
    question_type: 'mcq',
    prompt: 'Given the equation \\(9x + x = 2x + x + 5\\), which of the following equations has the same solution?',
    options: [
      '\\(7x = -5\\)',
      '\\(7x = 5\\)',
      '\\(x = -5\\)',
      '\\(x = 5\\)'
    ],
    correct_answer_index: 1, // B
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 7,
    question_type: 'mcq',
    prompt: 'Which expression is equivalent to \\(1,024w^2 - 484\\)?',
    options: [
      '\\((32w - 22)(32w - 22)\\)',
      '\\((16w - 11)(16w + 11)\\)',
      '\\((16w - 11)(16w - 11)\\)',
      '\\((32w - 22)(32w + 22)\\)'
    ],
    correct_answer_index: 3, // D
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 8,
    question_type: 'mcq',
    prompt: 'The number of stamps in Levi’s collection is 125% of the number of stamps in Marissa’s collection. If there are 400 stamps in Marissa’s collection, how many stamps are in Levi’s collection?',
    options: ['100', '320', '500', '900'],
    correct_answer_index: 2, // C
    correct_answer_text: null,
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 9,
    question_type: 'spr',
    prompt: 'For a party, 41 hamburger buns are needed. Hamburger buns are sold in packages of 8. What is the minimum number of packages that should be bought for the party?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '6',
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 10,
    question_type: 'mcq',
    prompt: 'The function \\(f(x) = 5x + 360\\) gives the total mass, in grams, of a jar and the \\(x\\) marbles inside it. What is the best interpretation of \\(f(0) = 360\\)?',
    options: [
      'The mass of each marble is 0 grams.',
      'The mass of each marble is 360 grams.',
      'The total mass of the jar with 0 marbles inside is 360 grams.',
      'The total mass of the jar with 360 marbles inside is 0 grams.'
    ],
    correct_answer_index: 2, // C
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 11,
    question_type: 'mcq',
    prompt: 'For the linear function \\(f\\), the graph of \\(y = f(x)\\) in the xy-plane has a slope of -18 and passes through the point (0, 0). Which equation defines \\(f\\)?',
    options: [
      '\\(f(x) = -18x\\)',
      '\\(f(x) = -12x\\)',
      '\\(f(x) = -6x\\)',
      '\\(f(x) = x\\)'
    ],
    correct_answer_index: 0, // A
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 12,
    question_type: 'mcq',
    prompt: 'What is the x-intercept of the graph of \\(y = \\frac{33 - x}{ax + b}\\) in the xy-plane, where \\(a\\) and \\(b\\) are positive constants?',
    options: [
      '\\(\\left(-\\frac{b}{a}, 0\\right)\\)',
      '\\(\\left(0, \\frac{33}{b}\\right)\\)',
      '\\((0, -33)\\)',
      '\\((33, 0)\\)'
    ],
    correct_answer_index: 3, // D
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 13,
    question_type: 'spr',
    prompt: 'The function \\(f\\) is defined by \\(f(x) = 8x^3 + 5\\). What is the value of \\(f(2)\\)?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '69',
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 14,
    question_type: 'mcq',
    prompt: 'What are all possible solutions to the equation \\((z + 6)(z - 3) = 0\\)?',
    options: [
      '-6 and -3',
      '-6 and 3',
      '6 and -3',
      '6 and 3'
    ],
    correct_answer_index: 1, // B
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 15,
    question_type: 'spr',
    prompt: 'In the xy-plane, the graphs of \\(y = 3x + 10\\) and \\(y = 2x + 4\\) intersect at \\((x, y)\\). What is the value of \\(x\\)?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '-6',
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Easy'
  },
  {
    module: 2,
    question_number: 16,
    question_type: 'mcq',
    prompt: 'Triangle \\(CAE\\) is similar to triangle \\(CBD\\). Angle \\(CDB\\) and angle \\(CEA\\) are right angles. The measure of angle \\(CBD\\) is \\(55^\\circ\\), and \\(AE = 27\\). What is the measure of angle \\(CAE\\)?',
    options: [
      '\\((27 \\cdot 55)^\\circ\\)',
      '\\((27 + 55)^\\circ\\)',
      '\\(55^\\circ\\)',
      '\\(27^\\circ\\)'
    ],
    correct_answer_index: 2, // C
    correct_answer_text: null,
    image_url: 'images/sep_math_2/m2_q16.png',
    domain: 'Geometry and Trigonometry',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 17,
    question_type: 'mcq',
    prompt: 'The table shows four values of \\(x\\) and their corresponding values of \\(y\\). There is a linear relationship between \\(x\\) and \\(y\\).\n\n| \\(x\\) | \\(y\\) |\n| :---: | :---: |\n| -12 | 124 |\n| -6 | 88 |\n| 6 | 16 |\n| 12 | -20 |\n\nWhich of the following equations represents this relationship?',
    options: [
      '\\(36x + 6y = 52\\)',
      '\\(36x + 6y = 312\\)',
      '\\(6x + 36y = 52\\)',
      '\\(6x + 36y = 312\\)'
    ],
    correct_answer_index: 1, // B
    correct_answer_text: null,
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 18,
    question_type: 'mcq',
    prompt: 'The equation \\(r = \\frac{t^2 + 7a}{18}\\) relates positive variables \\(a\\), \\(r\\), and \\(t\\). Which equation correctly expresses \\(a\\) in terms of \\(r\\) and \\(t\\)?',
    options: [
      '\\(a = \\frac{18r - t^2}{7}\\)',
      '\\(a = \\frac{\\sqrt{18r} - t}{7}\\)',
      '\\(a = \\frac{\\sqrt{7r} + t}{18}\\)',
      '\\(a = \\frac{t^2 + 7r}{18}\\)'
    ],
    correct_answer_index: 0, // A
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 19,
    question_type: 'mcq',
    prompt: 'The function \\(f(x) = 510(0.92)^x\\) estimates the remaining mass in grams of paper bags \\(x\\) days after being placed in a bacteria environment. What is the best interpretation of the point \\((1, 469.20)\\) on the graph?',
    options: [
      'The estimated remaining mass 1 day after placement is 469.20 grams less than it was the day before.',
      'The mass is decreasing by 469.20 grams per day.',
      'The estimated remaining mass 1 day after placement is 469.20 grams.',
      'The estimated remaining mass 469.20 days after placement is 1 gram.'
    ],
    correct_answer_index: 2, // C
    correct_answer_text: null,
    image_url: null,
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    module: 2,
    question_number: 20,
    question_type: 'spr',
    prompt: 'Town A has a population density of 120 people per square mile and a population of 20,640. Town B has a density of 90 people per square mile and a population of 3,870. The area of Town A is \\(k\\) times the area of Town B. What is the value of \\(k\\)?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '4',
    image_url: null,
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Hard'
  },
  {
    module: 2,
    question_number: 21,
    question_type: 'mcq',
    prompt: 'A circle in the xy-plane has its center at \\((2, -5)\\) and passes through the point \\((7, 7)\\). What is the equation of the circle?',
    options: [
      '\\((x - 2)^2 + (y + 5)^2 = 169\\)',
      '\\((x + 2)^2 + (y - 5)^2 = 169\\)',
      '\\((x - 2)^2 + (y + 5)^2 = 13\\)',
      '\\((x + 2)^2 + (y - 5)^2 = 13\\)'
    ],
    correct_answer_index: 0, // A
    correct_answer_text: null,
    image_url: null,
    domain: 'Geometry and Trigonometry',
    difficulty: 'Hard'
  },
  {
    module: 2,
    question_number: 22,
    question_type: 'spr',
    prompt: 'If \\(3x + 2y = 12\\) and \\(x - y = 4\\), what is the value of \\(x + y\\)?',
    options: null,
    correct_answer_index: null,
    correct_answer_text: '4',
    image_url: null,
    domain: 'Algebra',
    difficulty: 'Medium'
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
      difficulty: null,
      created_at: new Date().toISOString()
    };
    backup.tests.push(existingTest);
  } else {
    existingTest.type = TEST_TYPE;
    existingTest.allow_practice = 1;
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
      passage: null,
      prompt: q.prompt,
      options: q.options ? JSON.stringify(q.options) : null,
      correct_answer_index: q.correct_answer_index,
      correct_answer_text: q.correct_answer_text,
      module: q.module,
      image_url: q.image_url,
      question_type: q.question_type,
      section: 'math',
      domain: q.domain,
      difficulty: q.difficulty
    });
  }

  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`✅ backup_all_tests.json updated successfully with test '${TEST_TITLE}' (ID: ${assignedTestId}) and ${rawQuestions.length} questions!`);
  return assignedTestId;
}

function exportCsv() {
  const csvDir = path.join(__dirname, '..', 'question', 'Math');
  os_ensureDir(csvDir);
  const csvPath = path.join(csvDir, 'Sep_Math_II.csv');
  
  const headers = 'module,question_number,prompt,option_a,option_b,option_c,option_d,correct_answer,correct_answer_text,image_url,question_type,domain,difficulty\n';
  const lines = rawQuestions.map(q => {
    const esc = (val) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };
    const opt = q.options || [];
    const ans = q.correct_answer_index !== null ? ['A', 'B', 'C', 'D'][q.correct_answer_index] : '';
    return [
      q.module,
      q.question_number,
      esc(q.prompt),
      esc(opt[0] || ''),
      esc(opt[1] || ''),
      esc(opt[2] || ''),
      esc(opt[3] || ''),
      esc(ans),
      esc(q.correct_answer_text || ''),
      esc(q.image_url || ''),
      esc(q.question_type),
      esc(q.domain),
      esc(q.difficulty)
    ].join(',');
  });

  fs.writeFileSync(csvPath, headers + lines.join('\n'), 'utf8');
  console.log(`✅ CSV exported to ${csvPath}`);
}

function os_ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function importToDatabase() {
  console.log(`Starting import for '${TEST_TITLE}' (${TEST_TYPE})...`);

  let assignedTestId = updateBackupFile();
  exportCsv();

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
      connectTimeout: 8000
    });
    console.log('Connected to MySQL successfully!');

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

    console.log(`Inserting ${rawQuestions.length} questions into DB via bulk insert...`);
    const values = rawQuestions.map(q => [
      testId,
      q.question_number,
      null,
      q.prompt,
      q.options ? JSON.stringify(q.options) : null,
      q.correct_answer_index,
      q.correct_answer_text,
      q.module,
      q.image_url,
      q.question_type,
      'math',
      q.domain,
      q.difficulty
    ]);

    await connection.query(
      `INSERT INTO questions (
        test_id, question_number, passage, prompt, options,
        correct_answer_index, correct_answer_text, module, image_url,
        question_type, section, domain, difficulty
      ) VALUES ?`,
      [values]
    );

    console.log(`🎉 DB import completed: '${TEST_TITLE}' (ID: ${testId}) with ${rawQuestions.length} questions.`);
    updateBackupFile(testId);
  } catch (err) {
    console.warn('⚠️ MySQL connection/import error:', err.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
}

importToDatabase().catch(console.error);
