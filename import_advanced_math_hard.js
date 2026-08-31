require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const TARGET_TOPIC_TITLE = 'Advanced Math';
const TARGET_DIFFICULTY = 'Hard';

const questions = [
  {
    question_number: 1,
    question_id: '512bd5b4',
    question_type: 'spr',
    prompt: '\\(f(x) = 27(1.20)^{\\frac{x}{3}}\\)\nFor the given function \\(f\\), the value of \\(f(x)\\) increases by \\(p\\%\\) for every increase of \\(x\\) by \\(6\\). What is the value of \\(p\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '44',
    image_url: ''
  },
  {
    question_number: 2,
    question_id: 'f01108a8',
    question_type: 'mcq',
    prompt: '\\(y = 9\\left(\\frac{a}{7}\\right)^{x+c} - b\\)\nHow many times does the graph of the given equation in the \\(xy\\)-plane cross the \\(x\\)-axis, where \\(a\\), \\(b\\), and \\(c\\) are positive constants such that \\(a > 7\\) and \\(b > c\\)?',
    option_a: 'Zero',
    option_b: 'One',
    option_c: 'Two',
    option_d: 'Three',
    correct_answer_index: 1,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 3,
    question_id: '02060533',
    question_type: 'mcq',
    prompt: 'The table shows three values of \\(x\\) and their corresponding values of \\(g(x)\\), where \\(g(x) = \\frac{f(x)}{x+3}\\) and \\(f\\) is a linear function. What is the \\(y\\)-intercept of the graph of \\(y = f(x)\\) in the \\(xy\\)-plane?\n\n| \\(x\\) | \\(g(x)\\) |\n| :--- | :--- |\n| \\(-27\\) | \\(3\\) |\n| \\(-9\\) | \\(0\\) |\n| \\(21\\) | \\(5\\) |',
    option_a: '\\((0, 36)\\)',
    option_b: '\\((0, 12)\\)',
    option_c: '\\((0, 4)\\)',
    option_d: '\\((0, -9)\\)',
    correct_answer_index: 0,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 4,
    question_id: '91e7ea5e',
    question_type: 'mcq',
    prompt: '\\(h(x) = 2(x - 4)^2 - 32\\)\nThe quadratic function \\(h\\) is defined as shown. In the \\(xy\\)-plane, the graph of \\(y = h(x)\\) intersects the \\(x\\)-axis at the points \\((0, 0)\\) and \\((t, 0)\\), where \\(t\\) is a constant. What is the value of \\(t\\)?',
    option_a: '\\(1\\)',
    option_b: '\\(2\\)',
    option_c: '\\(4\\)',
    option_d: '\\(8\\)',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 5,
    question_id: '358f18bc',
    question_type: 'spr',
    prompt: '\\(f(x) = x^2 - 48x + 2,304\\)\nWhat is the minimum value of the given function?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '1728',
    image_url: ''
  },
  {
    question_number: 6,
    question_id: '3a9d60b2',
    question_type: 'spr',
    prompt: '\\(2|4 - x| + 3|4 - x| = 25\\)\nWhat is the positive solution to the given equation?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '9',
    image_url: ''
  },
  {
    question_number: 7,
    question_id: '8490cc45',
    question_type: 'mcq',
    prompt: 'The function \\(f\\) is defined by \\(f(x) = (-8)(2)^x + 22\\). What is the \\(y\\)-intercept of the graph of \\(y = f(x)\\) in the \\(xy\\)-plane?',
    option_a: '\\((0, 14)\\)',
    option_b: '\\((0, 2)\\)',
    option_c: '\\((0, 22)\\)',
    option_d: '\\((0, -8)\\)',
    correct_answer_index: 0,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 8,
    question_id: 'ebed7dc6',
    question_type: 'mcq',
    prompt: 'An auditorium has seats for \\(1,800\\) people. Tickets to attend a show at the auditorium currently cost \\(\\$4.00\\). For each \\(\\$1.00\\) increase to the ticket price, \\(100\\) fewer tickets will be sold. This situation can be modeled by the equation \\(y = -100x^2 + 1,400x + 7,200\\), where \\(x\\) represents the increase in ticket price, in dollars, and \\(y\\) represents the revenue, in dollars, from ticket sales. If this equation is graphed in the \\(xy\\)-plane, at what value of \\(x\\) is the maximum of the graph?',
    option_a: '\\(4\\)',
    option_b: '\\(7\\)',
    option_c: '\\(14\\)',
    option_d: '\\(18\\)',
    correct_answer_index: 1,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 9,
    question_id: 'ba0edc30',
    question_type: 'mcq',
    prompt: '\\(x^2 - 2x - 9 = 0\\)\nOne solution to the given equation can be written as \\(1 + \\sqrt{k}\\), where \\(k\\) is a constant. What is the value of \\(k\\)?',
    option_a: '\\(8\\)',
    option_b: '\\(10\\)',
    option_c: '\\(20\\)',
    option_d: '\\(40\\)',
    correct_answer_index: 1,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 10,
    question_id: 'fc3d783a',
    question_type: 'spr',
    prompt: 'In the \\(xy\\)-plane, a line with equation \\(2y = 4.5\\) intersects a parabola at exactly one point. If the parabola has equation \\(y = -4x^2 + bx\\), where \\(b\\) is a positive constant, what is the value of \\(b\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '6',
    image_url: ''
  },
  {
    question_number: 11,
    question_id: 'a9084ca4',
    question_type: 'mcq',
    prompt: '\\(f(x) = 9,000(0.66)^x\\)\nThe given function \\(f\\) models the number of advertisements a company sent to its clients each year, where \\(x\\) represents the number of years since \\(1997\\), and \\(0 \\le x \\le 5\\). If \\(y = f(x)\\) is graphed in the \\(xy\\)-plane, which of the following is the best interpretation of the \\(y\\)-intercept of the graph in this context?',
    option_a: 'The minimum estimated number of advertisements the company sent to its clients during the 5 years was 1,708.',
    option_b: 'The minimum estimated number of advertisements the company sent to its clients during the 5 years was 9,000.',
    option_c: 'The estimated number of advertisements the company sent to its clients in 1997 was 1,708.',
    option_d: 'The estimated number of advertisements the company sent to its clients in 1997 was 9,000.',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 12,
    question_id: '2c6f214f',
    question_type: 'mcq',
    prompt: 'The first term of a sequence is \\(9\\). Each term after the first is \\(4\\) times the preceding term. If \\(w\\) represents the \\(n\\)th term of the sequence, which equation gives \\(w\\) in terms of \\(n\\)?',
    option_a: '\\(w = 4(9^n)\\)',
    option_b: '\\(w = 4(9^{n-1})\\)',
    option_c: '\\(w = 9(4^n)\\)',
    option_d: '\\(w = 9(4^{n-1})\\)',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 13,
    question_id: '781c2f6e',
    question_type: 'mcq',
    prompt: 'The function \\(f\\) is defined by \\(f(x) = a(2.2^x + 2.2^b)\\), where \\(a\\) and \\(b\\) are integer constants and \\(0 < a < b\\). The functions \\(g\\) and \\(h\\) are equivalent to function \\(f\\), where \\(k\\) and \\(m\\) are constants. Which of the following equations displays the \\(y\\)-coordinate of the \\(y\\)-intercept of the graph of \\(y = f(x)\\) in the \\(xy\\)-plane as a constant or coefficient?\nI. \\(g(x) = a(2.2^x + k)\\)\nII. \\(h(x) = a(2.2)^x + m\\)',
    option_a: 'I only',
    option_b: 'II only',
    option_c: 'I and II',
    option_d: 'Neither I nor II',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 14,
    question_id: '4661e2a9',
    question_type: 'mcq',
    prompt: '\\(x - y = 1\\)\n\\(x + y = x^2 - 3\\)\nWhich ordered pair is a solution to the system of equations above?',
    option_a: '\\((1 + \\sqrt{3}, \\sqrt{3})\\)',
    option_b: '\\((\\sqrt{3}, -\\sqrt{3})\\)',
    option_c: '\\((1 + \\sqrt{5}, \\sqrt{5})\\)',
    option_d: '\\((\\sqrt{5}, -1 + \\sqrt{5})\\)',
    correct_answer_index: 0,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 15,
    question_id: '371cbf6b',
    question_type: 'mcq',
    prompt: '\\((ax + 3)(5x^2 - bx + 4) = 20x^3 - 9x^2 - 2x + 12\\)\nThe equation above is true for all \\(x\\), where \\(a\\) and \\(b\\) are constants. What is the value of \\(ab\\)?',
    option_a: '\\(18\\)',
    option_b: '\\(20\\)',
    option_c: '\\(24\\)',
    option_d: '\\(40\\)',
    correct_answer_index: 2,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 16,
    question_id: 'c3b116d7',
    question_type: 'mcq',
    prompt: 'Which of the following expressions is(are) a factor of \\(3x^2 + 20x - 63\\)?\nI. \\(x - 9\\)\nII. \\(3x - 7\\)',
    option_a: 'I only',
    option_b: 'II only',
    option_c: 'I and II',
    option_d: 'Neither I nor II',
    correct_answer_index: 1,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 17,
    question_id: '40c09d66',
    question_type: 'spr',
    prompt: 'If \\(\\frac{\\sqrt{x^5}}{\\sqrt[3]{x^4}} = x^{\\frac{a}{b}}\\) for all positive values of \\(x\\), what is the value of \\(\\frac{a}{b}\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '7/6',
    image_url: ''
  },
  {
    question_number: 18,
    question_id: 'b8f13a3a',
    question_type: 'spr',
    prompt: 'Function \\(f\\) is defined by \\(f(x) = -a^x + b\\), where \\(a\\) and \\(b\\) are constants. In the \\(xy\\)-plane, the graph of \\(y = f(x) - 12\\) has a \\(y\\)-intercept at \\(\\left(0, -\\frac{75}{7}\\right)\\). The product of \\(a\\) and \\(b\\) is \\(\\frac{320}{7}\\). What is the value of \\(a\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '20',
    image_url: ''
  },
  {
    question_number: 19,
    question_id: '8e1da169',
    question_type: 'mcq',
    prompt: '\\(f(x) = (x - 44)(x - 46)\\)\nThe function \\(f\\) is defined by the given equation. For what value of \\(x\\) does \\(f(x)\\) reach its minimum?',
    option_a: '\\(46\\)',
    option_b: '\\(45\\)',
    option_c: '\\(44\\)',
    option_d: '\\(-1\\)',
    correct_answer_index: 1,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 20,
    question_id: '46308566',
    question_type: 'spr',
    prompt: '\\(r^2 + qr = 2r - 55\\)\nIn the given equation, \\(q\\) is an integer constant. The given equation has no real solutions. What is the largest possible value of \\(q\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '16',
    image_url: ''
  },
  {
    question_number: 21,
    question_id: 'f65288e8',
    question_type: 'mcq',
    prompt: '\\(\\frac{1}{x^2 + 10x + 25} = 4\\)\nIf \\(x\\) is a solution to the given equation, which of the following is a possible value of \\(x + 5\\)?',
    option_a: '\\(\\frac{1}{2}\\)',
    option_b: '\\(\\frac{5}{2}\\)',
    option_c: '\\(\\frac{9}{2}\\)',
    option_d: '\\(\\frac{11}{2}\\)',
    correct_answer_index: 0,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 22,
    question_id: '2c288148',
    question_type: 'spr',
    prompt: '\\(\\sqrt{k - x} = 58 - x\\)\nIn the given equation, \\(k\\) is a constant. The equation has exactly one real solution. What is the minimum possible value of \\(4k\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '231',
    image_url: ''
  },
  {
    question_number: 23,
    question_id: '40491607',
    question_type: 'spr',
    prompt: '\\(f(x) = (x - 1)(x + 3)(x - 2)\\)\nIn the \\(xy\\)-plane, when the graph of the function \\(f\\), where \\(f(x) = (x - 1)(x + 3)(x - 2)\\), is shifted up \\(6\\) units, the resulting graph is defined by the function \\(g\\). If the graph of \\(y = g(x)\\) crosses through the point \\((4, b)\\), where \\(b\\) is a constant, what is the value of \\(b\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '48',
    image_url: ''
  },
  {
    question_number: 24,
    question_id: '7902bed0',
    question_type: 'mcq',
    prompt: 'A machine launches a softball from ground level. The softball reaches a maximum height of \\(51.84\\) meters above the ground at \\(1.8\\) seconds and hits the ground at \\(3.6\\) seconds. Which equation represents the height above ground \\(h\\), in meters, of the softball \\(t\\) seconds after it is launched?',
    option_a: '\\(h = -t^2 + 3.6\\)',
    option_b: '\\(h = -t^2 + 51.84\\)',
    option_c: '\\(h = -16(t - 1.8)^2 - 3.6\\)',
    option_d: '\\(h = -16(t - 1.8)^2 + 51.84\\)',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 25,
    question_id: '38c90632',
    question_type: 'spr',
    prompt: 'The expression \\(\\frac{29x + 102}{x(x + 51)}\\) is equivalent to \\(\\frac{p}{x} + \\frac{w}{x + 51}\\), where \\(p\\) and \\(w\\) are constants. What is the value of \\(w\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '27',
    image_url: ''
  },
  {
    question_number: 26,
    question_id: '4a0d0399',
    question_type: 'spr',
    prompt: 'The function \\(f\\) is defined by \\(f(x) = a^x + b\\), where \\(a\\) and \\(b\\) are constants. In the \\(xy\\)-plane, the graph of \\(y = f(x)\\) has an \\(x\\)-intercept at \\((2, 0)\\) and a \\(y\\)-intercept at \\((0, -323)\\). What is the value of \\(b\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '-324',
    image_url: ''
  },
  {
    question_number: 27,
    question_id: 'f2f3fa00',
    question_type: 'spr',
    prompt: 'During a 5-second time interval, the average acceleration \\(a\\), in meters per second squared, of an object with an initial velocity of \\(12\\) meters per second is defined by the equation \\(a = \\frac{v_f - 12}{5}\\), where \\(v_f\\) is the final velocity of the object in meters per second. If the equation is rewritten in the form \\(v_f = xa + y\\), where \\(x\\) and \\(y\\) are constants, what is the value of \\(x\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '5',
    image_url: ''
  },
  {
    question_number: 28,
    question_id: '9654add7',
    question_type: 'mcq',
    prompt: '\\(f(x) = -500x^2 + 25,000x\\)\nThe revenue \\(f(x)\\), in dollars, that a company receives from sales of a product is given by the function \\(f\\) above, where \\(x\\) is the unit price, in dollars, of the product. The graph of \\(y = f(x)\\) in the \\(xy\\)-plane intersects the \\(x\\)-axis at \\(0\\) and \\(a\\). What does \\(a\\) represent?',
    option_a: 'The revenue, in dollars, when the unit price of the product is $0',
    option_b: 'The unit price, in dollars, of the product that will result in maximum revenue',
    option_c: 'The unit price, in dollars, of the product that will result in a revenue of $0',
    option_d: 'The maximum revenue, in dollars, that the company can make',
    correct_answer_index: 2,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 29,
    question_id: '34847f8a',
    question_type: 'mcq',
    prompt: '\\(\\frac{2}{x - 2} + \\frac{3}{x + 5} = \\frac{rx + t}{(x - 2)(x + 5)}\\)\nThe equation above is true for all \\(x > 2\\), where \\(r\\) and \\(t\\) are positive constants. What is the value of \\(rt\\)?',
    option_a: '\\(-20\\)',
    option_b: '\\(15\\)',
    option_c: '\\(20\\)',
    option_d: '\\(60\\)',
    correct_answer_index: 2,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 30,
    question_id: '263f9937',
    question_type: 'mcq',
    prompt: 'Growth of a Culture of Bacteria\n\n| Day | Number of bacteria per milliliter at end of day |\n| :--- | :--- |\n| \\(1\\) | \\(2.5 \\times 10^5\\) |\n| \\(2\\) | \\(5.0 \\times 10^5\\) |\n| \\(3\\) | \\(1.0 \\times 10^6\\) |\n\nA culture of bacteria is growing at an exponential rate, as shown in the table above. At this rate, on which day would the number of bacteria per milliliter reach \\(5.12 \\times 10^8\\)?',
    option_a: 'Day 5',
    option_b: 'Day 9',
    option_c: 'Day 11',
    option_d: 'Day 12',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 31,
    question_id: 'fada6b03',
    question_type: 'spr',
    prompt: '\\(2x^2 - 8x - 7 = 0\\)\nOne solution to the given equation can be written as \\(\\frac{8 - \\sqrt{k}}{4}\\), where \\(k\\) is a constant. What is the value of \\(k\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '120',
    image_url: ''
  },
  {
    question_number: 32,
    question_id: '137cc6fd',
    question_type: 'spr',
    prompt: '\\(\\sqrt[3]{70n\\left(\\sqrt[5]{70n}\\right)^2}\\)\nFor what value of \\(x\\) is the given expression equivalent to \\((70n)^{30x}\\), where \\(n > 1\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '4/225',
    image_url: ''
  },
  {
    question_number: 33,
    question_id: '6ce95fc8',
    question_type: 'mcq',
    prompt: '\\(2x^2 - 2 = 2x + 3\\)\nWhich of the following is a solution to the equation above?',
    option_a: '\\(2\\)',
    option_b: '\\(1 - \\sqrt{11}\\)',
    option_c: '\\(\\frac{1}{2} + \\sqrt{11}\\)',
    option_d: '\\(\\frac{1 + \\sqrt{11}}{2}\\)',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 34,
    question_id: '4dd4efcf',
    question_type: 'mcq',
    prompt: '\\(f(x) = ax^2 + 4x + c\\)\nIn the given quadratic function, \\(a\\) and \\(c\\) are constants. The graph of \\(y = f(x)\\) in the \\(xy\\)-plane is a parabola that opens upward and has a vertex at the point \\((h, k)\\), where \\(h\\) and \\(k\\) are constants. If \\(k < 0\\) and \\(f(-9) = f(3)\\), which of the following must be true?\nI. \\(c < 0\\)\nII. \\(a \\ge 1\\)',
    option_a: 'I only',
    option_b: 'II only',
    option_c: 'I and II',
    option_d: 'Neither I nor II',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 35,
    question_id: 'f5aa5040',
    question_type: 'spr',
    prompt: 'In the \\(xy\\)-plane, a line with equation \\(2y = c\\) for some constant \\(c\\) intersects a parabola at exactly one point. If the parabola has equation \\(y = -2x^2 + 9x\\), what is the value of \\(c\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '81/4',
    image_url: ''
  },
  {
    question_number: 36,
    question_id: '2992ac30',
    question_type: 'mcq',
    prompt: '\\(P(t) = 260(1.04)^{\\left(\\frac{2}{3}\\right)t}\\)\nThe function \\(P\\) models the population, in thousands, of a certain city \\(t\\) years after \\(2003\\). According to the model, the population is predicted to increase by \\(4\\%\\) every \\(n\\) months. What is the value of \\(n\\)?',
    option_a: '\\(8\\)',
    option_b: '\\(12\\)',
    option_c: '\\(18\\)',
    option_d: '\\(72\\)',
    correct_answer_index: 0,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 37,
    question_id: '841ef26c',
    question_type: 'mcq',
    prompt: '\\(f(x) = 4x^2 + 64x + 262\\)\nThe function \\(g\\) is defined by \\(g(x) = f(x + 5)\\). For what value of \\(x\\) does \\(g(x)\\) reach its minimum?',
    option_a: '\\(-13\\)',
    option_b: '\\(-8\\)',
    option_c: '\\(-5\\)',
    option_d: '\\(-3\\)',
    correct_answer_index: 0,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 38,
    question_id: 'ea6d05bb',
    question_type: 'spr',
    prompt: 'The expression \\((3x - 23)(19x + 6)\\) is equivalent to the expression \\(ax^2 + bx + c\\), where \\(a\\), \\(b\\), and \\(c\\) are constants. What is the value of \\(b\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '-419',
    image_url: ''
  },
  {
    question_number: 39,
    question_id: '09d21d79',
    question_type: 'spr',
    prompt: 'The graph of \\(y = 2x^2 + bx + c\\) is shown, where \\(b\\) and \\(c\\) are constants. What is the value of \\(bc\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '-24',
    image_url: 'images/adv_math_hard_q39.png'
  },
  {
    question_number: 40,
    question_id: '722de804',
    question_type: 'spr',
    prompt: '\\((x - 47)^2 = 1\\)\nWhat is the sum of the solutions to the given equation?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '94',
    image_url: ''
  },
  {
    question_number: 41,
    question_id: 'e833de9a',
    question_type: 'mcq',
    prompt: '\\(x^2 + y^2 = 36\\)\n\\(y = mx + \\frac{b}{4}\\)\nIn the given system of equations, \\(m\\) and \\(b\\) are negative constants. In the \\(xy\\)-plane, the graphs of the equations in the given system intersect at the point \\((-5, y)\\), where \\(y < 0\\). Which expression represents the value of \\(b\\)?',
    option_a: '\\(-\\frac{5m}{4} + \\frac{\\sqrt{11}}{4}\\)',
    option_b: '\\(\\frac{5m}{4} - \\frac{\\sqrt{11}}{4}\\)',
    option_c: '\\(-20m + 4\\sqrt{11}\\)',
    option_d: '\\(20m - 4\\sqrt{11}\\)',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 42,
    question_id: '433184f1',
    question_type: 'mcq',
    prompt: 'Which expression is equivalent to \\(\\frac{4}{4x - 5} - \\frac{1}{x + 1}\\)?',
    option_a: '\\(\\frac{1}{(x + 1)(4x - 5)}\\)',
    option_b: '\\(\\frac{3}{3x - 6}\\)',
    option_c: '\\(-\\frac{1}{(x + 1)(4x - 5)}\\)',
    option_d: '\\(\\frac{9}{(x + 1)(4x - 5)}\\)',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 43,
    question_id: 'd135f4bf',
    question_type: 'spr',
    prompt: 'The function \\(f\\) is defined by \\(f(x) = (x - 6)(x - 2)(x + 6)\\). In the \\(xy\\)-plane, the graph of \\(y = g(x)\\) is the result of translating the graph of \\(y = f(x)\\) up \\(4\\) units. What is the value of \\(g(0)\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '76',
    image_url: ''
  },
  {
    question_number: 44,
    question_id: 'b0543157',
    question_type: 'mcq',
    prompt: '\\(g(x) = \\frac{x^2 - x - a}{x^3 - x - b}\\)\nThe function \\(g\\) is defined by the given equation, where \\(a\\) and \\(b\\) are constants. In the \\(xy\\)-plane, the graph of \\(y = g(x)\\) passes through the point \\((0, 22)\\), and \\(g(-22) = 0\\). What is the value of \\(b\\)?',
    option_a: '\\(23\\)',
    option_b: '\\(22\\)',
    option_c: '\\(-22\\)',
    option_d: '\\(-23\\)',
    correct_answer_index: 0,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 45,
    question_id: 'd8789a4c',
    question_type: 'mcq',
    prompt: '\\(\\frac{x^2 - c}{x - b}\\)\nIn the expression above, \\(b\\) and \\(c\\) are positive integers. If the expression is equivalent to \\(x + b\\) and \\(x \\ne b\\), which of the following could be the value of \\(c\\)?',
    option_a: '\\(4\\)',
    option_b: '\\(6\\)',
    option_c: '\\(8\\)',
    option_d: '\\(10\\)',
    correct_answer_index: 0,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 46,
    question_id: 'd0a53ef5',
    question_type: 'spr',
    prompt: '\\(\\sqrt{(x - 2)^2} = \\sqrt{3x + 34}\\)\nWhat is the smallest solution to the given equation?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '-3',
    image_url: ''
  },
  {
    question_number: 47,
    question_id: '271ffad7',
    question_type: 'mcq',
    prompt: 'A quadratic function models a projectile\'s height, in meters, above the ground in terms of the time, in seconds, after it was launched. The model estimates that the projectile was launched from an initial height of \\(7\\) meters above the ground and reached a maximum height of \\(51.1\\) meters above the ground \\(3\\) seconds after the launch. How many seconds after the launch does the model estimate that the projectile will return to a height of \\(7\\) meters?',
    option_a: '\\(3\\)',
    option_b: '\\(6\\)',
    option_c: '\\(7\\)',
    option_d: '\\(9\\)',
    correct_answer_index: 1,
    correct_answer_text: '',
    image_url: ''
  },
  {
    question_number: 48,
    question_id: 'ee857afb',
    question_type: 'spr',
    prompt: '\\(y = x^2 - 14x + 22\\)\nThe given equation relates the variables \\(x\\) and \\(y\\). For what value of \\(x\\) does the value of \\(y\\) reach its minimum?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '7',
    image_url: ''
  }
];

function escapeCsv(val) {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
}

async function main() {
    // 1. Export CSV
    const csvHeader = 'module,question_number,prompt,option_a,option_b,option_c,option_d,correct_answer_index,correct_answer_text,image_url,question_type\n';
    const csvRows = questions.map(q => [
        escapeCsv(1),
        escapeCsv(q.question_number),
        escapeCsv(q.prompt),
        escapeCsv(q.option_a),
        escapeCsv(q.option_b),
        escapeCsv(q.option_c),
        escapeCsv(q.option_d),
        escapeCsv(q.question_type === 'mcq' ? q.correct_answer_index : ''),
        escapeCsv(q.question_type === 'spr' ? q.correct_answer_text : ''),
        escapeCsv(q.image_url),
        escapeCsv(q.question_type)
    ].join(','));
    
    const csvPath = path.join(__dirname, 'questions_advanced_math_hard.csv');
    fs.writeFileSync(csvPath, csvHeader + csvRows.join('\n'), 'utf8');
    console.log(`💾 Saved updated CSV to: ${csvPath}`);

    // 2. Export Raw JSON
    const jsonPath = path.join(__dirname, 'questions_advanced_math_hard_raw.json');
    fs.writeFileSync(jsonPath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`💾 Saved updated Raw JSON to: ${jsonPath}`);

    // 3. Connect to Database & Import
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'defaultdb',
        port: parseInt(process.env.DB_PORT || '18921'),
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 5
    });

    const connection = await pool.getConnection();
    try {
        // Find or create test
        const [testRows] = await connection.query(
            "SELECT id FROM tests WHERE title = ? AND type = 'topic' AND difficulty = ?",
            [TARGET_TOPIC_TITLE, TARGET_DIFFICULTY]
        );

        let testId;
        if (testRows.length > 0) {
            testId = testRows[0].id;
            console.log(`Found existing test with ID: ${testId}`);
        } else {
            const [insertRes] = await connection.query(
                "INSERT INTO tests (title, type, difficulty, allow_practice) VALUES (?, 'topic', ?, 1)",
                [TARGET_TOPIC_TITLE, TARGET_DIFFICULTY]
            );
            testId = insertRes.insertId;
            console.log(`Created new test "${TARGET_TOPIC_TITLE}" (${TARGET_DIFFICULTY}) with ID: ${testId}`);
        }

        // Delete existing questions
        await connection.query('DELETE FROM questions WHERE test_id = ?', [testId]);
        console.log(`Cleared existing questions for test ID: ${testId}`);

        // Bulk Insert
        await connection.beginTransaction();
        let count = 0;
        for (const q of questions) {
            const options = q.question_type === 'mcq' ? JSON.stringify([q.option_a || '', q.option_b || '', q.option_c || '', q.option_d || '']) : null;
            await connection.query(
                `INSERT INTO questions 
                (test_id, section, module, question_number, passage, prompt, options, correct_answer_index, correct_answer_text, image_url, question_type)
                VALUES (?, 'math', 1, ?, NULL, ?, ?, ?, ?, ?, ?)`,
                [
                    testId,
                    q.question_number,
                    q.prompt,
                    options,
                    q.question_type === 'mcq' ? q.correct_answer_index : null,
                    q.question_type === 'spr' ? (q.correct_answer_text || '') : null,
                    q.image_url || null,
                    q.question_type
                ]
            );
            count++;
        }

        await connection.commit();
        console.log(`🎉 Successfully replaced with all ${count} non-duplicate questions into test ID ${testId} ("${TARGET_TOPIC_TITLE}" - ${TARGET_DIFFICULTY})!`);

    } catch (err) {
        await connection.rollback();
        console.error('❌ Database insertion error:', err);
    } finally {
        connection.release();
        await pool.end();
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
