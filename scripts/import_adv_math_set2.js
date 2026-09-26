require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const TARGET_TOPIC_TITLE = 'Advanced Math - Set 2';
const TARGET_DIFFICULTY = 'Hard';
const TEST_TYPE = 'topic';

const questions = [
  {
    question_number: 1,
    question_type: 'mcq',
    prompt: 'A square map has a side length of 45 inches, and 1 inch on the map represents an actual distance of 13 miles. A smaller version of the same map is printed as a square with the side length 70% shorter than the side length of the previous map. On the smaller map, which of the following is closest to the actual distance, in miles, represented by 1 inch?',
    option_a: '3.90',
    option_b: '7.65',
    option_c: '31.50',
    option_d: '43.33',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: '',
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Hard'
  },
  {
    question_number: 2,
    question_type: 'mcq',
    prompt: 'The graph of \\(y = f(x) + 2\\) is shown below. Which equation defines the function \\(f(x)\\)?',
    option_a: '\\(f(x) = -5^x + 1\\)',
    option_b: '\\(f(x) = -5^x + 3\\)',
    option_c: '\\(f(x) = -5^x + 4\\)',
    option_d: '\\(f(x) = -5^x + 5\\)',
    correct_answer_index: 1,
    correct_answer_text: '',
    image_url: '/images/adv_math_set2/q2.png',
    domain: 'Advanced Math',
    difficulty: 'Hard'
  },
  {
    question_number: 3,
    question_type: 'spr',
    prompt: 'Right rectangular prism \\(X\\) is similar to right rectangular prism \\(Y\\). The surface area of right rectangular prism \\(X\\) is 59 square centimeters (\\(\\text{cm}^2\\)), and the surface area of right rectangular prism \\(Y\\) is 1,475 \\(\\text{cm}^2\\). The volume of right rectangular prism \\(Y\\) is 1,500 \\(\\text{cm}^3\\). What is the sum of the volumes, in \\(\\text{cm}^3\\), of right rectangular prism \\(X\\) and right rectangular prism \\(Y\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '1512',
    image_url: '',
    domain: 'Geometry and Trigonometry',
    difficulty: 'Hard'
  },
  {
    question_number: 4,
    question_type: 'spr',
    prompt: 'The function \\(f\\) is defined by \\(f(x) = ab^{\\frac{x}{n}}\\), where \\(a\\), \\(b\\), and \\(n\\) are constants, and \\(b\\) and \\(n\\) are integers. If \\(f(2) = 6\\) and \\(f(5) = 162\\), what is the value of \\(f(7)\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '1458',
    image_url: '',
    domain: 'Advanced Math',
    difficulty: 'Hard'
  },
  {
    question_number: 5,
    question_type: 'mcq',
    prompt: 'The function \\(f\\) is a quadratic function. In the \\(xy\\)-plane, the graph of \\(y = f(x)\\) has a vertex at \\((1, 6)\\) and passes through the points \\((2, 40)\\) and \\((-1, 142)\\). What is the value of \\(f(-2) - f(0)\\)?',
    option_a: '108',
    option_b: '176',
    option_c: '272',
    option_d: '312',
    correct_answer_index: 2,
    correct_answer_text: '',
    image_url: '',
    domain: 'Advanced Math',
    difficulty: 'Hard'
  },
  {
    question_number: 6,
    question_type: 'mcq',
    prompt: 'The function \\(f\\) is defined by the equation \\(f(x) = \\sqrt{3x + 8}\\). If \\(f(a) = -9a\\), where \\(a\\) is a constant, what is the value of \\(a\\)?',
    option_a: '\\(\\frac{1}{3}\\)',
    option_b: '\\(\\frac{8}{27}\\)',
    option_c: '\\(-\\frac{8}{27}\\)',
    option_d: '\\(-\\frac{1}{3}\\)',
    correct_answer_index: 2,
    correct_answer_text: '',
    image_url: '',
    domain: 'Advanced Math',
    difficulty: 'Hard'
  },
  {
    question_number: 7,
    question_type: 'spr',
    prompt: 'In the given equation, \\(a\\) and \\(b\\) are positive constants.\n\n$$24x^2 - (12a + 2b)x + ab = 0$$\n\nThe sum of the solutions to the given equation is \\(k(6a + b)\\), where \\(k\\) is a constant. What is the value of \\(k\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '1/12',
    image_url: '',
    domain: 'Advanced Math',
    difficulty: 'Hard'
  },
  {
    question_number: 8,
    question_type: 'spr',
    prompt: 'For the right circular cone shown, \\(B\\) is a point on the circumference of the base, and the length of segment \\(AB\\) (not shown) is 84 centimeters. If the height of the cone is 42 centimeters and the volume of the cone is \\(k\\pi\\) cubic centimeters, what is the value of \\(k\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '74088',
    image_url: '/images/adv_math_set2/q8.png',
    domain: 'Geometry and Trigonometry',
    difficulty: 'Hard'
  },
  {
    question_number: 9,
    question_type: 'spr',
    prompt: 'The function \\(f\\) is defined by \\(f(x) = \\frac{|x|}{a} - 14\\), where \\(a < 0\\). What is the product of \\(f(15a)\\) and \\(f(8a)\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '638',
    image_url: '',
    domain: 'Advanced Math',
    difficulty: 'Hard'
  },
  {
    question_number: 10,
    question_type: 'spr',
    prompt: 'The perimeter of an equilateral triangle is 876 centimeters. The three vertices of the triangle lie on a circle. The radius of the circle is \\(w\\sqrt{3}\\) centimeters. What is the value of \\(w\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '292/3',
    image_url: '',
    domain: 'Geometry and Trigonometry',
    difficulty: 'Hard'
  },
  {
    question_number: 11,
    question_type: 'mcq',
    prompt: 'In triangle \\(ABC\\), the measure of angle \\(A\\) is \\(52^\\circ\\) and \\(AC = 35\\). In triangle \\(PQR\\), the measure of angle \\(P\\) is \\(52^\\circ\\) and \\(PR = 105\\). Which additional piece of information is sufficient to prove that triangle \\(ABC\\) is similar to triangle \\(PQR\\)?',
    option_a: '\\(AB = 30\\) and \\(PQ = 30\\).',
    option_b: '\\(AB = 30\\) and \\(QR = 90\\).',
    option_c: 'The measures of angle \\(B\\) and angle \\(R\\) are \\(34^\\circ\\) and \\(94^\\circ\\), respectively.',
    option_d: 'The measures of angle \\(B\\) and angle \\(Q\\) are \\(52^\\circ\\) and \\(34^\\circ\\), respectively.',
    correct_answer_index: 2,
    correct_answer_text: '',
    image_url: '',
    domain: 'Geometry and Trigonometry',
    difficulty: 'Medium'
  },
  {
    question_number: 12,
    question_type: 'mcq',
    prompt: 'A cooking school is offering a promotion where the first class is free, the second class is half off the regular price, and the remaining classes are regularly priced. If the regular price of a class is \\$22.80, which function \\(f\\) gives the total cost, in dollars, of \\(x\\) classes taken using this promotion, where \\(x \\ge 2\\)?',
    option_a: '\\(f(x) = 22.80(x - 1) + 11.40\\)',
    option_b: '\\(f(x) = 22.80(x - 2) + 11.40\\)',
    option_c: '\\(f(x) = 22.80(x - 1) + 11.40(x - 2)\\)',
    option_d: '\\(f(x) = 22.80(x - 2) + 11.40(x - 1)\\)',
    correct_answer_index: 1,
    correct_answer_text: '',
    image_url: '',
    domain: 'Heart of Algebra',
    difficulty: 'Medium'
  },
  {
    question_number: 13,
    question_type: 'mcq',
    prompt: 'The shaded region shown represents the solutions to \\(rx + ty \\ge -77\\), where \\(r\\) and \\(t\\) are constants. What is the value of \\(r + t\\)?',
    option_a: '8',
    option_b: '6',
    option_c: '-6',
    option_d: '-7',
    correct_answer_index: 0,
    correct_answer_text: '',
    image_url: '/images/adv_math_set2/q13.png',
    domain: 'Heart of Algebra',
    difficulty: 'Hard'
  },
  {
    question_number: 14,
    question_type: 'mcq',
    prompt: 'The positive number \\(a\\) is 2,047% of the sum of the positive numbers \\(b\\) and \\(c\\), and \\(b\\) is 89% of \\(c\\). What percent of \\(b\\) is \\(a\\)?',
    option_a: '21.36%',
    option_b: '38.69%',
    option_c: '2,300%',
    option_d: '4,347%',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: '',
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Hard'
  },
  {
    question_number: 15,
    question_type: 'mcq',
    prompt: '$$y = x - c$$\n$$y = -6(x - 12)^2$$\n\nIn the given system of equations, \\(c\\) is a constant. The system has two distinct real solutions. Which of the following could be the value of \\(c\\)?',
    option_a: '7',
    option_b: '11',
    option_c: '\\(\\frac{287}{24}\\)',
    option_d: '17',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: '',
    domain: 'Advanced Math',
    difficulty: 'Hard'
  },
  {
    question_number: 16,
    question_type: 'spr',
    prompt: 'In triangle \\(RST\\), the measure of angle \\(R\\) is \\(39^\\circ\\), the measure of angle \\(S\\) is \\(x^\\circ\\), and the measure of angle \\(T\\) is \\((5x - 3)^\\circ\\). Point \\(L\\) lies on \\(RS\\), point \\(K\\) lies on \\(ST\\), and \\(\\overline{LK}\\) is parallel to \\(\\overline{RT}\\). What is the measure, in degrees, of angle \\(\\angle SKL\\)?\n(Disregard the degree symbol when entering your answer.)',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '117',
    image_url: '',
    domain: 'Geometry and Trigonometry',
    difficulty: 'Medium'
  },
  {
    question_number: 17,
    question_type: 'mcq',
    prompt: 'The function is defined by \\(f(x) = -10(2)^{\\frac{x}{3}}\\). Which table gives four values of \\(x\\) and their corresponding values of \\(f(x)\\) for the given exponential function?',
    option_a: '| \\(x\\) | -3 | 0 | 3 | 6 |\n| :--- | :--- | :--- | :--- | :--- |\n| \\(f(x)\\) | -5 | 0 | -20 | -40 |',
    option_b: '| \\(x\\) | -3 | 0 | 3 | 6 |\n| :--- | :--- | :--- | :--- | :--- |\n| \\(f(x)\\) | -5 | -10 | -20 | -40 |',
    option_c: '| \\(x\\) | -3 | 0 | 3 | 6 |\n| :--- | :--- | :--- | :--- | :--- |\n| \\(f(x)\\) | 5 | 10 | -20 | -40 |',
    option_d: '| \\(x\\) | -3 | 0 | 3 | 6 |\n| :--- | :--- | :--- | :--- | :--- |\n| \\(f(x)\\) | -5 | 0 | -20 | -30 |',
    correct_answer_index: 1,
    correct_answer_text: '',
    image_url: '',
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    question_number: 18,
    question_type: 'spr',
    prompt: '$$\\sqrt{p^4} = t^{\\frac{5}{6}}$$\n\nIn the given equation, \\(p > 1\\) and \\(t > 1\\). If \\(t = p^{2n-1}\\), where \\(n\\) is a constant, what is the value of \\(n\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '17/10',
    image_url: '',
    domain: 'Advanced Math',
    difficulty: 'Hard'
  },
  {
    question_number: 19,
    question_type: 'spr',
    prompt: 'A clothing store buys shirts at a wholesale price of \\$6.00 each and resells them each at a retail price that is 310% of the wholesale price. At the end of the season, any remaining shirts are marked at a discounted price that is 75% off the retail price. What is the discounted price of each remaining shirt, in dollars?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '4.65',
    image_url: '',
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Medium'
  },
  {
    question_number: 20,
    question_type: 'mcq',
    prompt: 'A right rectangular prism has a base area of \\(16t\\) square centimeters (\\(\\text{cm}^2\\)). The length of the base of the rectangular prism is \\(\\frac{8}{3}\\) cm, and the height of the rectangular prism is 9 cm. Which expression represents the surface area, in \\(\\text{cm}^2\\), of the right rectangular prism?',
    option_a: '\\(32t + 96\\)',
    option_b: '\\(140t + 48\\)',
    option_c: '\\(800t + 48\\)',
    option_d: '\\(144t\\)',
    correct_answer_index: 1,
    correct_answer_text: '',
    image_url: '',
    domain: 'Geometry and Trigonometry',
    difficulty: 'Medium'
  },
  {
    question_number: 21,
    question_type: 'mcq',
    prompt: 'The function \\(f\\) is defined by \\(f(x) = 53(0.15)^x\\). For any positive integer \\(n\\), the value of \\(f(n)\\) is \\(p\\%\\) less than the value of \\(f(n - 1)\\). What is the value of \\(p\\)?',
    option_a: '15',
    option_b: '47',
    option_c: '53',
    option_d: '85',
    correct_answer_index: 3,
    correct_answer_text: '',
    image_url: '',
    domain: 'Advanced Math',
    difficulty: 'Medium'
  },
  {
    question_number: 22,
    question_type: 'mcq',
    prompt: 'The dot plots represent the distributions of values in data sets A and B.\n\nWhich of the following statements must be true?\n\nI. The median of data set A is equal to the median of data set B.\nII. The standard deviation of data set A is equal to the standard deviation of data set B.',
    option_a: 'I and II',
    option_b: 'I only',
    option_c: 'II only',
    option_d: 'Neither I nor II',
    correct_answer_index: 1,
    correct_answer_text: '',
    image_url: '/images/adv_math_set2/q22.png',
    domain: 'Problem-Solving and Data Analysis',
    difficulty: 'Hard'
  },
  {
    question_number: 23,
    question_type: 'spr',
    prompt: 'In a set of four consecutive odd integers, where the integers are ordered from least to greatest, the first integer is represented by \\(x\\). The product of 28 and the third odd integer in the set is at most the value of 50 less than the sum of the first and fourth odd integers in the set. What is the greatest possible value of \\(x\\)?',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer_index: -1,
    correct_answer_text: '-7',
    image_url: '',
    domain: 'Heart of Algebra',
    difficulty: 'Hard'
  },
  {
    question_number: 24,
    question_type: 'mcq',
    prompt: 'The figure shows a rectangular pool surrounded by a concrete path that is \\(x\\) feet wide on all sides. The pool is 21 ft long and 13 ft wide. The area of the concrete path is \\(240\\text{ ft}^2\\). What is the value of \\(x\\)?',
    option_a: '3',
    option_b: '6',
    option_c: '20',
    option_d: '40',
    correct_answer_index: 0,
    correct_answer_text: '',
    image_url: '/images/adv_math_set2/q25.png',
    domain: 'Advanced Math',
    difficulty: 'Medium'
  }
];

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

function exportCsv() {
  const csvHeaders = ['section', 'module', 'question_number', 'passage', 'prompt', 'question_type', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer_index', 'correct_answer_text', 'image_url', 'domain', 'difficulty'];
  const rows = [csvHeaders.join(',')];

  for (const q of questions) {
    rows.push([
      escapeCsv('math'),
      escapeCsv(1),
      escapeCsv(q.question_number),
      escapeCsv(''),
      escapeCsv(q.prompt),
      escapeCsv(q.question_type),
      escapeCsv(q.option_a || ''),
      escapeCsv(q.option_b || ''),
      escapeCsv(q.option_c || ''),
      escapeCsv(q.option_d || ''),
      escapeCsv(q.question_type === 'mcq' ? q.correct_answer_index : ''),
      escapeCsv(q.question_type === 'spr' ? q.correct_answer_text : ''),
      escapeCsv(q.image_url || ''),
      escapeCsv(q.domain || ''),
      escapeCsv(q.difficulty || '')
    ].join(','));
  }

  const csvPath = path.join(__dirname, '..', 'question', 'Math', 'advanced_math_set2.csv');
  fs.writeFileSync(csvPath, rows.join('\n'), 'utf8');
  console.log(`✅ CSV exported to: ${csvPath}`);
}

async function updateBackupFile(assignedTestId) {
  const backupPath = path.join(__dirname, '..', 'backup_all_tests.json');
  if (!fs.existsSync(backupPath)) return;

  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

  let testObj = backup.tests.find(t => t.title === TARGET_TOPIC_TITLE);
  if (!testObj) {
    if (!assignedTestId) {
      const maxId = backup.tests.reduce((max, t) => Math.max(max, t.id || 0), 0);
      assignedTestId = maxId + 1;
    }
    testObj = {
      id: assignedTestId,
      title: TARGET_TOPIC_TITLE,
      type: TEST_TYPE,
      difficulty: TARGET_DIFFICULTY,
      allow_practice: 1,
      total_time_minutes: 35,
      total_questions: questions.length
    };
    backup.tests.push(testObj);
  } else {
    assignedTestId = testObj.id;
    testObj.difficulty = TARGET_DIFFICULTY;
    testObj.total_time_minutes = 35;
    testObj.total_questions = questions.length;
    testObj.allow_practice = 1;
  }

  backup.questions = backup.questions.filter(q => q.test_id !== assignedTestId);

  let maxQId = backup.questions.reduce((max, q) => Math.max(max, q.id || 0), 0);
  for (const q of questions) {
    maxQId++;
    const options = q.question_type === 'mcq' ? [q.option_a, q.option_b, q.option_c, q.option_d] : [];
    backup.questions.push({
      id: maxQId,
      test_id: assignedTestId,
      question_number: q.question_number,
      passage: null,
      prompt: q.prompt,
      options: JSON.stringify(options),
      correct_answer_index: q.question_type === 'mcq' ? q.correct_answer_index : null,
      correct_answer_text: q.question_type === 'spr' ? q.correct_answer_text : null,
      module: 1,
      image_url: q.image_url || null,
      question_type: q.question_type,
      section: 'math',
      domain: q.domain,
      difficulty: q.difficulty
    });
  }

  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`✅ backup_all_tests.json updated successfully with test '${TARGET_TOPIC_TITLE}' (ID: ${assignedTestId})!`);
  return assignedTestId;
}

async function importToDatabase() {
  console.log(`Starting import for '${TARGET_TOPIC_TITLE}' (${TARGET_DIFFICULTY})...`);
  
  exportCsv();
  let assignedTestId = await updateBackupFile();

  let connection;
  try {
    console.log(`Connecting to MySQL (${process.env.DB_HOST}:${process.env.DB_PORT || 3306})...`);
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
    const [existing] = await connection.query(
      'SELECT id FROM tests WHERE title = ?',
      [TARGET_TOPIC_TITLE]
    );

    let testId;
    if (existing.length > 0) {
      testId = existing[0].id;
      console.log(`Test '${TARGET_TOPIC_TITLE}' exists in DB with ID ${testId}. Cleaning up old questions...`);
      await connection.query('DELETE FROM questions WHERE test_id = ?', [testId]);
      await connection.query('UPDATE tests SET type = ?, difficulty = ?, allow_practice = 1 WHERE id = ?', [TEST_TYPE, TARGET_DIFFICULTY, testId]);
    } else {
      console.log(`Creating test '${TARGET_TOPIC_TITLE}' in DB...`);
      const [res] = await connection.query(
        'INSERT INTO tests (title, type, difficulty, allow_practice) VALUES (?, ?, ?, 1)',
        [TARGET_TOPIC_TITLE, TEST_TYPE, TARGET_DIFFICULTY]
      );
      testId = res.insertId;
      console.log(`Created test with ID ${testId}`);
    }

    console.log(`Inserting ${questions.length} questions into DB...`);
    for (const q of questions) {
      const options = q.question_type === 'mcq' ? JSON.stringify([q.option_a, q.option_b, q.option_c, q.option_d]) : JSON.stringify([]);
      await connection.query(
        `INSERT INTO questions (
          test_id, question_number, passage, prompt, options,
          correct_answer_index, correct_answer_text, module, image_url,
          question_type, section, domain, difficulty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testId,
          q.question_number,
          null,
          q.prompt,
          options,
          q.question_type === 'mcq' ? q.correct_answer_index : null,
          q.question_type === 'spr' ? q.correct_answer_text : null,
          1,
          q.image_url || null,
          q.question_type,
          'math',
          q.domain,
          q.difficulty
        ]
      );
    }

    console.log(`🎉 DB import completed: '${TARGET_TOPIC_TITLE}' (ID: ${testId}) with ${questions.length} questions.`);
    await updateBackupFile(testId);
  } catch (err) {
    console.warn('⚠️ MySQL connection/import error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

importToDatabase().catch(console.error);
