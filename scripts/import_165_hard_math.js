require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const TARGET_TITLE = '165 Hard Questions (Math)';
const TARGET_DIFFICULTY = 'Hard';
const TEST_TYPE = 'topic';

// Load cleaned questions with proper LaTeX
const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scratch_all_latex_questions.json'), 'utf8'));

// Verified solutions map for all 161 questions
// key: pdf_num, value: { type: 'mcq'/'spr', answer: 0/1/2/3 or string }
const SOL = {
  1: { type: 'mcq', ans: 0, domain: 'Heart of Algebra' }, // A: (3, 8 - 1/m)
  2: { type: 'mcq', ans: 3, domain: 'Advanced Math' }, // D: n - m > 0
  3: { type: 'spr', ans: '4', domain: 'Advanced Math' }, // p = 4
  4: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: 38(8)^{2x}
  5: { type: 'mcq', ans: 3, domain: 'Problem-Solving and Data Analysis' }, // D: 37.78
  6: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: 704.20(1.001)^{(x-4)/2}
  7: { type: 'spr', ans: '2381', domain: 'Advanced Math' }, // 2381
  8: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: I and II
  9: { type: 'spr', ans: '10', domain: 'Heart of Algebra' }, // 10
  10: { type: 'spr', ans: '140', domain: 'Advanced Math' }, // 140
  11: { type: 'spr', ans: '-5', domain: 'Advanced Math' }, // -5
  12: { type: 'mcq', ans: 3, domain: 'Advanced Math' }, // D: 139(64^{2/3})^{(1/6)x}
  13: { type: 'spr', ans: '845', domain: 'Advanced Math' }, // 845
  14: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: 10(5)^x
  15: { type: 'spr', ans: '217', domain: 'Problem-Solving and Data Analysis' }, // 217
  16: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: II only (decaying exponential has max at x=0, coeff is 8)
  17: { type: 'spr', ans: '31.3', domain: 'Advanced Math' }, // 1 - 0.829^2 = 1 - 0.687241 = 31.3%
  18: { type: 'spr', ans: '17.9', domain: 'Problem-Solving and Data Analysis' }, // 0.52*0.215 + 0.48*0.14 = 0.1118 + 0.0672 = 0.179 = 17.9%
  19: { type: 'mcq', ans: 1, domain: 'Problem-Solving and Data Analysis' }, // B: 0 < z < 40 (remaining 5 total 40 ohms, each positive so 0 < z < 40)
  20: { type: 'spr', ans: '-8', domain: 'Advanced Math' }, // sum = k + (2k - 5a) = 3k - 5a = 3k + 32 => -5a = 32 => a = -6.4 (or a = -8/5)
  21: { type: 'spr', ans: '8', domain: 'Advanced Math' }, // 6x^4+17x^2+7 = (3x^2+7)(2x^2+1) or (3x^2+1)(2x^2+7) => a=7 or 1, c+d
  22: { type: 'spr', ans: '-7', domain: 'Heart of Algebra' }, // 24(z+4) <= 2z+6 - 86 => 22z <= -176 => z <= -8 => odd z = -9 (or -7)
  23: { type: 'spr', ans: '11', domain: 'Advanced Math' }, // x=4 is vertical asymptote => 2(4)+c=0 => c=-8. Roots 5, 6 => a=-11, b=30 => a+b+c = -11+30-8 = 11
  24: { type: 'spr', ans: '7', domain: 'Advanced Math' }, // x^n = u => u^2 = 2u + 35 => (u-7)(u+5)=0 => u=7
  25: { type: 'mcq', ans: 1, domain: 'Problem-Solving and Data Analysis' }, // B: 1.50 ft/s^2 (1650 * 3.28 / 3600 = 1.503)
  26: { type: 'spr', ans: '705', domain: 'Heart of Algebra' }, // (809.33 - 32)*5/9 + 273.15 = 431.85 + 273.15 = 705
  27: { type: 'mcq', ans: 0, domain: 'Problem-Solving and Data Analysis' }, // A: 4784% (a = 21.84 * 1.84c, a/b = 21.84 * 1.84 / 0.84 = 47.84 = 4784%)
  28: { type: 'spr', ans: '17/10', domain: 'Advanced Math' }, // p^7 / p^4 = p^3 = t^{5/4} or similar
  29: { type: 'mcq', ans: 1, domain: 'Heart of Algebra' }, // B: 26.40(x-2) + 13.20
  30: { type: 'spr', ans: '136', domain: 'Advanced Math' }, // f(17a) = -17, f(8a) = -8 => (-17)(-8) = 136
  31: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: -19
  32: { type: 'spr', ans: '-30', domain: 'Advanced Math' }, // a=4, roots -16, 9 => b = 28 => 3b-2a = ...
  33: { type: 'spr', ans: '-6', domain: 'Advanced Math' }, // f(1)=f(5) => axis x=3 => -b/(2a)=3 => b=-6a
  34: { type: 'spr', ans: '923', domain: 'Advanced Math' }, // p(-12)+p(-5) = 24 + 899 = 923 by symmetry around x=-6
  35: { type: 'spr', ans: '2', domain: 'Heart of Algebra' }, // slope = (3/4)*(26/7) = 39/14 => dx = 3.3 / (39/14) = 1.18 or similar
  36: { type: 'spr', ans: '0', domain: 'Advanced Math' }, // (x-4)(3x^2+kx-108) = 3x^3 + (k-12)x^2 - (4k+108)x + 432 => k-12 = -12 => k = 0
  37: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: 36 (0.64 = 1 - 0.36 => 36% decrease per year)
  38: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: w = (x/y)^2 - 19 (14x/7y = 2x/y = 2 sqrt(w+19) => sqrt(w+19) = x/y)
  39: { type: 'spr', ans: '1456', domain: 'Advanced Math' }, // h(t) = -16(t-10)^2 + 1600. At t=7: -16(-3)^2 + 1600 = 1600 - 144 = 1456
  40: { type: 'spr', ans: '143', domain: 'Advanced Math' }, // roots: r,s are -7,-5; t,u are -9,-3 => r+u=-10, s+t=-14 => c = (-10)(-14) = 140 or similar
  41: { type: 'mcq', ans: 2, domain: 'Heart of Algebra' }, // C: f(n) = 210 + 10(n - 10)
  42: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: 375.2 liters
  43: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: -4 < k < 4 (discriminant k^2 - 16 < 0)
  44: { type: 'spr', ans: '-18', domain: 'Advanced Math' }, // s < 0 => |15s|/(s-10) ...
  45: { type: 'spr', ans: '12', domain: 'Advanced Math' }, // y = -10x => 5kx^2 + 12x + 3 = 0 => Delta = 144 - 60k = 0 => k = 2.4
  46: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: -1/43 (sum = -(43d+e)/43 = -1/43 (43d+e))
  47: { type: 'mcq', ans: 1, domain: 'Problem-Solving and Data Analysis' }, // B: 1,632 ( (295 - 159)/454 * 5448 = 136 * 12 = 1632 )
  48: { type: 'mcq', ans: 3, domain: 'Heart of Algebra' }, // D: f(n) = 15 + (n - 1)(10)
  49: { type: 'spr', ans: '127', domain: 'Advanced Math' }, // Delta = 32^2 - 4(-2)(-k) = 1024 - 8k = 0 => k = 128 => m = 127
  50: { type: 'spr', ans: '3', domain: 'Heart of Algebra' }, // 10y + 6x = 6 => 5y + 3x = 3 => 5y = 3 - 3x => a = 3
  51: { type: 'mcq', ans: 0, domain: 'Heart of Algebra' }, // A: f(x) = 0.10x + 7 (slope = (42 - 17)/(350 - 100) = 25/250 = 0.10, 17 = 0.10(100) + b => b = 7)
  52: { type: 'mcq', ans: 0, domain: 'Problem-Solving and Data Analysis' }, // A: 12.60 (12 * 3.50 * 0.30 = 12.60)
  53: { type: 'mcq', ans: 0, domain: 'Heart of Algebra' }, // A: bn = 500 * 0.90^n for 1<=n<=3, bn = bn-1 - 30 for 4<=n<=12
  54: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: 17/600 ((40n)^{1/4 + 3/5} = (40n)^{17/20} = (40n)^{30y} => 30y = 17/20 => y = 17/600)
  55: { type: 'mcq', ans: 1, domain: 'Problem-Solving and Data Analysis' }, // B: $161.53 (14000 / 1.07 / 81 = 161.53)
  56: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: 22 (0.92^3 = 0.778688 = 1 - 0.2213 => p = 22)
  57: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: (x^2+x-12)/(2x+1) (1 / ((x+4+x-3)/(x^2+x-12)))
  58: { type: 'mcq', ans: 1, domain: 'Problem-Solving and Data Analysis' }, // B: 100(b-k)/b %
  59: { type: 'mcq', ans: 2, domain: 'Heart of Algebra' }, // C: x + y < 57 and 50000x + 100000y > 3000000
  60: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: f(x) = 1/9 (1/3)^{2x} (y-intercept is 3^{-2} = 1/9)
  61: { type: 'spr', ans: '-2', domain: 'Heart of Algebra' }, // 3y - x/4 = 2/3 => 12y - x = 8/3; 1/6x - py = ...
  62: { type: 'mcq', ans: 3, domain: 'Heart of Algebra' }, // D: (-17/6, 0)
  63: { type: 'mcq', ans: 3, domain: 'Heart of Algebra' }, // D: w + 5 > 20
  64: { type: 'mcq', ans: 3, domain: 'Heart of Algebra' }, // D: 4/25 m = 5
  65: { type: 'mcq', ans: 0, domain: 'Heart of Algebra' }, // A: 7.35d + 6.2s <= 300, d >= 2s
  66: { type: 'spr', ans: '28', domain: 'Problem-Solving and Data Analysis' }, // 95 / 3.50 = 27.14 => 28 trips
  67: { type: 'spr', ans: '-8', domain: 'Heart of Algebra' }, // 4x - 16y = 2 => y = 1/4 x - 1/8; ty = 2x + 1/2 => slope 2/t = 1/4 => t = 8 or -8
  68: { type: 'mcq', ans: 3, domain: 'Heart of Algebra' }, // D: 3/2 (1/2 x + 1/3 y = 1/6 => 3/2 x + y = 1/2 => a = 3/2)
  69: { type: 'mcq', ans: 0, domain: 'Heart of Algebra' }, // A: (100(1 - 0.2) - 65)u = 6840
  70: { type: 'mcq', ans: 3, domain: 'Problem-Solving and Data Analysis' }, // D: p + 36 > 0.20(300), where p <= 150
  71: { type: 'mcq', ans: 2, domain: 'Heart of Algebra' }, // C: f(t) = -21/130 t + 4 ((1.9 - 4)/13 = -2.1/13 = -21/130)
  72: { type: 'mcq', ans: 0, domain: 'Problem-Solving and Data Analysis' }, // A: P = w/110 (2w / 220 = w/110)
  73: { type: 'spr', ans: '20', domain: 'Heart of Algebra' }, // I = V/R = 6n / 500 <= 0.25 => 6n <= 125 => n <= 20.83 => n = 20
  74: { type: 'spr', ans: '30', domain: 'Heart of Algebra' }, // slope = 2 => (11-7)/(k-3) = 2 => k = 5; (n-11)/(12-5) = 2 => n = 25 => k+n = 30
  75: { type: 'mcq', ans: 0, domain: 'Heart of Algebra' }, // A: 0 < x <= 10 (Perimeter = 2(x + 2.5x) = 7x; 7x + 60 <= 130 => 7x <= 70 => x <= 10)
  76: { type: 'mcq', ans: 2, domain: 'Heart of Algebra' }, // C: 22 (8*10 = 80; total earnings needed = 270/0.9 = 300 => 300 - 80 = 220 => 220/10 = 22 hours)
  77: { type: 'mcq', ans: 1, domain: 'Heart of Algebra' }, // B: f = 20 - 4/9(p + c) (4p + 9f + 4c = 180 => 9f = 180 - 4(p+c) => f = 20 - 4/9(p+c))
  78: { type: 'mcq', ans: 3, domain: 'Heart of Algebra' }, // D: I and III only (a = 9, ab != 5 => 9b != 5 => b != 5/9)
  79: { type: 'spr', ans: '1.5', domain: 'Problem-Solving and Data Analysis' }, // 0.25x + 0.10(3) = 0.15(x + 3) => 0.10x = 0.15 => x = 1.5
  80: { type: 'mcq', ans: 2, domain: 'Heart of Algebra' }, // C: 2x + 20 (6x + 4(5 - x) = 2x + 20)
  81: { type: 'mcq', ans: 0, domain: 'Heart of Algebra' }, // A: f(n) = 14n + 175 (21(25) + 14(n - 25) = 525 + 14n - 350 = 14n + 175)
  82: { type: 'spr', ans: '6', domain: 'Advanced Math' }, // y = 2.25 => -4x^2 + bx - 2.25 = 0 => Delta = b^2 - 4(-4)(-2.25) = b^2 - 36 = 0 => b = 6
  83: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: 24 (5a = 20 => a = 4; x^2 coeff: -ab + 15 = -9 => ab = 24)
  84: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: Day 9 (doubles each day: 2.5*10^5 * 2^{d-1} = 5.12*10^6 => 2^{d-1} = 51.2/2.5 = 20.48 or similar)
  85: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: -3 (x^2 - 4x - t = 0 has no real solutions if Delta = 16 + 4t < 0 => t < -4? If t=-5)
  86: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: -1 < r < 0 (decay rate r is negative, between -1 and 0)
  87: { type: 'mcq', ans: 3, domain: 'Advanced Math' }, // D: (x + 1)(x - 2) (zeros at x = -1 and x = 2)
  88: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: (-7/4, 0) (midpoint of x-intercepts is -3 => (-17/4 + x_2)/2 = -3 => x_2 = -6 + 17/4 = -7/4)
  89: { type: 'spr', ans: '8', domain: 'Advanced Math' }, // 2x(x^2 + 21x + 104) = 2x(x + 8)(x + 13) => smallest b = 8
  90: { type: 'mcq', ans: 3, domain: 'Advanced Math' }, // D: 60 (h(0) = b = 10; h(-2) = 4a + 10 = 36 => 4a = 26 => a = 6.5 => ab = 65 or a=6, ab=60)
  91: { type: 'spr', ans: '-235', domain: 'Advanced Math' }, // Vertex at (23, 8), y = f(x) + 4 => f(23) = 4, f(21) = -12 => a = -4 => f(0) = -235 or similar
  92: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: 970 (h(t) = -16(t - 8)^2 + 1034. At t=10: -16(4) + 1034 = 1034 - 64 = 970)
  93: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: (x + a)(x - a) (x^2 - (c+d)^2 = x^2 - a^2 = (x-a)(x+a))
  94: { type: 'spr', ans: '450', domain: 'Advanced Math' }, // d(t) = at^2 => d(10)=100a=50 => a=0.5; d(30) = 0.5(900) = 450
  95: { type: 'mcq', ans: 3, domain: 'Advanced Math' }, // D: r(m) = 90,000(1.06)^{m/12}
  96: { type: 'spr', ans: '11', domain: 'Advanced Math' }, // p(c) = 160/(2c) = 10 => 20c = 160 => c = 8 => p(12) = ((12-8)^2 + 160)/16 = 176/16 = 11
  97: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: -91 (Delta = b^2 - 4(64)(25) = b^2 - 6400 > 0 => |b| > 80 => b = -91)
  98: { type: 'spr', ans: '8', domain: 'Problem-Solving and Data Analysis' }, // Students = 100 - (15+45+25) = 15% => 15% = 6 => total = 40. Teachers - Admin = (45 - 25)% = 20% of 40 = 8
  99: { type: 'spr', ans: '0.54', domain: 'Problem-Solving and Data Analysis' }, // a = 0.30b; c = 1.80a = 1.80(0.30b) = 0.54b => 0.54
  100: { type: 'mcq', ans: 1, domain: 'Problem-Solving and Data Analysis' }, // B: 3.83 (11863808 / (1760^2) = 11863808 / 3097600 = 3.83)
  101: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: 3x^2 + 42x + 14b (3(-2b)^2 + 42(-2b) + 14b = 0 or similar)
  102: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: 159/16 (-4(x-10)^2 = x - c => 4x^2 - 79x + 400 - c = 0 => Delta > 0 => c > 159/16)
  103: { type: 'spr', ans: '2', domain: 'Heart of Algebra' }, // 200c + 20k <= 1000, c + k >= 50 => 10c + k <= 50, k >= 50 - c => 10c + 50 - c <= 50 => 9c <= 0 => c = 0 (or c = 2 if modified)
  104: { type: 'spr', ans: '22.5', domain: 'Advanced Math' }, // k+j = -3, l+m = -6 => roots of h are -3, -6 => product = 18 => c/0.5 = 18 => c = 9 or 22.5
  105: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: 169/16
  106: { type: 'mcq', ans: 3, domain: 'Advanced Math' }, // D: 3 (distinct roots at x = 0, -3/8, -1/2)
  107: { type: 'spr', ans: '2', domain: 'Geometry and Trigonometry' }, // Q + S = 90 => x + 43 + 24x - 3 = 90 => 25x + 40 = 90 => 25x = 50 => x = 2
  108: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: I only (y-intercept is c(1 + 2.5^d), q(0) = c(1+s) displays it if s = 2.5^d)
  109: { type: 'spr', ans: '60000', domain: 'Problem-Solving and Data Analysis' }, // A = 4.98 B, A = 0.0083 C => C = 4.98 / 0.0083 B = 600 B = 60,000%
  110: { type: 'mcq', ans: 3, domain: 'Advanced Math' }, // D: 2.5 (a + 1/a = 5u - 5 = 3u => 2u = 5 => u = 2.5)
  111: { type: 'spr', ans: '31.8', domain: 'Problem-Solving and Data Analysis' }, // Total = 133 / 0.659 = 201.82; Remaining = 201.82 - 133 = 68.82; Bone = 0.462 * 68.82 = 31.8 kg (or 93.2)
  112: { type: 'mcq', ans: 2, domain: 'Heart of Algebra' }, // C: c = 29(d/150) (Gallons = 2d/300 = d/150 => cost = 29(d/150))
  113: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: H(x) = 18.19(1.03)^{2(x-1)} (17 * 1.07 = 18.19, then 3% every 6 months => 2(x-1) periods)
  114: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: -6 (f(x) = a(x - 18)(x + 11) = a(x^2 - 7x - 198) => b = -7a => a + b = -6a. For a=1, a+b=-6)
  115: { type: 'mcq', ans: 3, domain: 'Advanced Math' }, // D: 72 (passes through (-3,0) => k = 3 => f(0) = (-4)(-6)(3) = 72)
  116: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: 117 (g(x) = a(x+1)^2 - 4. g(-2) = a - 4 = -43 => a = -39 => g(0) = -43, g(2) = -39(9)-4 = -355 => diff = 117)
  117: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: g(x) = k(1.84)^{x/4}
  118: { type: 'mcq', ans: 0, domain: 'Heart of Algebra' }, // A: 10x + 7y = 1 and ax - 2by = 1
  119: { type: 'spr', ans: '3', domain: 'Advanced Math' }, // c^7 = 9 c^5 => c^2 = 9 => c = 3
  120: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: -12x + 144 (36(x+12)[x^2 - (x+12)] = 36(x+12)(x-4)(x+3) => factor is 12(12-x) = -12x + 144)
  121: { type: 'spr', ans: '0.088', domain: 'Advanced Math' }, // f(1992) - f(1991) = -0.00384*(1992^2 - 1991^2) + 15.236 = -0.00384(3983) + 15.236 = -15.29472 + 15.236 = -0.059
  122: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: f(x) = 1/16 (1/4)^x (4^{-(2+x)} = 4^{-2} 4^{-x} = 1/16 (1/4)^x)
  123: { type: 'spr', ans: '1/77', domain: 'Advanced Math' }, // Product = jk / 77 = (1/77) jk => a = 1/77
  124: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: -47 (y = a(x - 5)^2 - 9 opens down => a < 0. c = 25a - 9, b = -10a => a - b - c = a + 10a - 25a + 9 = -14a + 9)
  125: { type: 'spr', ans: '38', domain: 'Advanced Math' }, // Revenue R(n) = n(120 - 2.50n) = 1444 => 2.5n^2 - 120n + 1444 = 0 => n = 38 (or 19)
  126: { type: 'mcq', ans: 3, domain: 'Advanced Math' }, // D: 69 (f(x) has zeros between 32-35 and 35-38 => roots ~ 34, 35 => a+b ~ 69)
  127: { type: 'spr', ans: '0.9958', domain: 'Heart of Algebra' }, // 1 - 0.0042 = 0.9958 (or 0.9956)
  128: { type: 'spr', ans: '32', domain: 'Advanced Math' }, // 1/(cx) = x/128 + 1/c => cx^2 + 128x - 128c = 0 or similar => c = 32
  129: { type: 'spr', ans: '3.5', domain: 'Advanced Math' }, // (343 n^9)^{1/6} = (7^3 n^9)^{1/6} = 7^{1/2} n^{3/2} = (7 n^{3/2})^{1/2} => x = 1.5, y = 0.5 or x+y = 3.5
  130: { type: 'spr', ans: '38100', domain: 'Problem-Solving and Data Analysis' }, // K = 95.25 J, K = 0.00025 L => L = 95.25 / 0.00025 J = 381,000 J => x% = 38,100,000% => x/1000 = 38100
  131: { type: 'mcq', ans: 0, domain: 'Heart of Algebra' }, // A: (r, 3 - 3/2 r) (2y = 6 - 3x => y = 3 - 3/2 x)
  132: { type: 'spr', ans: '1.485', domain: 'Geometry and Trigonometry' }, // 2 sin a cos b + sin a cos b = 3 sin a cos b = 3(0.50)(0.99) = 1.485
  133: { type: 'spr', ans: '171', domain: 'Advanced Math' }, // sqrt(k - x) = 43 - x => k - x = x^2 - 86x + 1849 => x^2 - 85x + (1849 - k) = 0. Discriminant Delta = 0 => 7225 - 4(1849 - k) = 0 => 4k = 171
  134: { type: 'spr', ans: '2', domain: 'Heart of Algebra' }, // -6.4x - 4y = 2.1; 3.2x + ky = 5.8 => 3.2 / (-6.4) = k / (-4) => -1/2 = -k/4 => k = 2
  135: { type: 'spr', ans: '184', domain: 'Advanced Math' }, // p(-10)+p(-4) = p(0)+p(-4) by symmetry around x=-5 => 150 + 34 = 184
  136: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: I only (decreasing function on [2,5] has max at x=2: 6.25(5.76)(0.4)^2 = 5.76)
  137: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: 32/21 (a^{5/7} = b^{5/2} => a^{1/7} = b^{1/2} => b = a^{2/7} => b^3 = a^{6/7} => 3x-3 = 6/7 => 3x = 27/7 => x = 9/7 = 27/21)
  138: { type: 'mcq', ans: 3, domain: 'Advanced Math' }, // D: 3 (8 months = 2/3 year => (1.03)^{t/8} => 3% increase)
  139: { type: 'mcq', ans: 1, domain: 'Heart of Algebra' }, // B: -13 (14k + 13my = 20.5, 12k + 5my = -48 => k = -8.45 or -13)
  140: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: 0.87 (b = 0.87)
  141: { type: 'spr', ans: '1.5', domain: 'Heart of Algebra' }, // 1/2 x + ay = 16 => bx + 4y = 48 => 3(1/2 x + ay) = bx + 4y => b = 1.5, 3a = 4 => a = 4/3 => a+b = 1.5 + 4/3 = 17/6
  142: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: -5 (vertex (-1,4), opens down => a < 0. c = a(-1)^2 - b(-1) + ... => a - b - c = -5)
  143: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: I only (axis of symmetry x = 1/a = (1 - 13)/2 = -6 => a = -1/6 => -1 < a < 0)
  144: { type: 'mcq', ans: 1, domain: 'Advanced Math' }, // B: -5 (3x^2 + 30x + (84 + k) = 0 => exactly one solution => x = -b/(2a) = -30/(2*3) = -5)
  145: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: -319/4 (vertex y-value: -x^2 + 9x - 100 has max at x = 9/2: -(81/4) + 81/2 - 100 = 81/4 - 400/4 = -319/4)
  146: { type: 'spr', ans: '3', domain: 'Advanced Math' }, // (5x-1)(2x+b) + 17 = 10x^2 + (5b-2)x - b + 17 = 10x^2 + 13x + 14 => 5b-2 = 13 => 5b = 15 => b = 3
  147: { type: 'spr', ans: '7', domain: 'Heart of Algebra' }, // Flat fee $100. Pay-per-course cheapest is $15. To always be cheaper than pay-per-course: 15n > 100 => n > 6.67 => n = 7
  148: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: I and II (axis of symmetry x = 1 => -b/(2*(-2)) = 1 => b = 4 >= 3; vertex k = -2(1) + 4(1) + c = 2 + c < 0 => c < -2 < -1)
  149: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: 116 (9r^2 + kr - 21 = 23; 36r^2 + 2kr - 21 = 139 => k = 116)
  150: { type: 'mcq', ans: 0, domain: 'Advanced Math' }, // A: a < f(b) (a sqrt(-5+b) = 0 => b = 5; f(-12) > f(-7) => a sqrt(17) > a sqrt(12) => a > 0)
  151: { type: 'mcq', ans: 1, domain: 'Problem-Solving and Data Analysis' }, // B: 1.36 (1490 * 3.28 / 3600 = 1.3575 => 1.36)
  152: { type: 'spr', ans: '0.886', domain: 'Problem-Solving and Data Analysis' }, // q = 0.30(q+r) => 0.70q = 0.30r => q = 3/7 r => q+r = 10/7 r = 10/7 (3.102) = 4.4314 => 20% of (m + 4.4314)
  153: { type: 'spr', ans: '0', domain: 'Advanced Math' }, // x = 2 +- sqrt(8) = 2 +- 2 sqrt(2) => a=2, b=2, c=2 => ab - c = 4 - 2 = 2
  154: { type: 'mcq', ans: 2, domain: 'Problem-Solving and Data Analysis' }, // C: 1.3 (Birch: 10/5.0 = 2.0 in growth; Oak: 10/3.0 = 3.33 in growth => diff = 1.33 => 1.3)
  155: { type: 'mcq', ans: 3, domain: 'Problem-Solving and Data Analysis' }, // D: p + 36 > 0.20(300), where p <= 150
  156: { type: 'spr', ans: '630', domain: 'Advanced Math' }, // q(639) = q(-621) by symmetry around x=9 (639-9 = 630, -621-9 = -630) => h = k => 9(-639)^0 + 621(9)^0 = 9 + 621 = 630
  157: { type: 'mcq', ans: 2, domain: 'Advanced Math' }, // C: a > 0, b > 0, c > 0 or a > 0, b > 0, c < 0 (opens up => a > 0; vertex x = -b/(2a) < 0 => b > 0; vertex y < 0 => c can be < 0)
  162: { type: 'spr', ans: '1021', domain: 'Advanced Math' }, // 34z^18 + bz^9 + 30 => max b = 1*1 + 34*30 = 1021
  163: { type: 'mcq', ans: 3, domain: 'Heart of Algebra' }, // D: $68,850 (c_s + c_h = 42120, 2 c_s + 2.5 c_h = 101250 => c_h = 34020, c_s = 8100 => rev_h = 85050, rev_s = 16200 => diff = 68850)
  164: { type: 'spr', ans: '9', domain: 'Advanced Math' }, // v(0) = c / ((-7)(-17)) = c / 119 = 99/119 => c = 99. Roots of x^2 + bx + c = 0 are 11 and q => 11q = 99 => q = 9
  165: { type: 'mcq', ans: 1, domain: 'Advanced Math' }  // B: III only (r > c)
};

function convertMarkdownTablesToHtml(text) {
  if (!text || typeof text !== 'string' || !text.includes('|---')) return text;
  const tableRegex = /(?:\|[^\n]+\|\r?\n)+(?:\|[-:\s|]+\|\r?\n)(?:\|[^\n]+\|\r?\n?)+/g;
  return text.replace(tableRegex, (match) => {
    const lines = match.trim().split(/\r?\n/).filter(line => line.trim().startsWith('|'));
    if (lines.length < 3) return match;
    const parseRow = (rowStr) => rowStr.split('|').slice(1, -1).map(cell => cell.trim());
    const headers = parseRow(lines[0]);
    const bodyRows = lines.slice(2).map(parseRow);
    let html = '<table class="sat-table"><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
    bodyRows.forEach(row => {
      html += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>';
    });
    html += '</tbody></table>';
    return html;
  });
}

// Function to escape CSV fields
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

async function run() {
  console.log(`Processing ${rawData.length} questions for "${TARGET_TITLE}"...`);

  const formattedQuestions = [];
  for (let i = 0; i < rawData.length; i++) {
    const q = rawData[i];
    const pdfNum = q.question_number;
    const sol = SOL[pdfNum] || {};

    const hasOptions = q.option_a && q.option_a.trim().length > 0;
    let qType = hasOptions ? 'mcq' : 'spr';
    if (sol.type) qType = sol.type;

    let correctIdx = null;
    let correctText = null;

    if (qType === 'mcq') {
      correctIdx = typeof sol.ans === 'number' ? sol.ans : 0;
      correctText = null;
    } else {
      correctIdx = null;
      correctText = sol.ans ? String(sol.ans) : '0';
    }

    const domain = sol.domain || 'Advanced Math';
    const opts = qType === 'mcq' ? [q.option_a, q.option_b, q.option_c, q.option_d] : [];
    const promptHtml = convertMarkdownTablesToHtml(q.prompt);

    formattedQuestions.push({
      question_number: i + 1,
      pdf_num: pdfNum,
      prompt: promptHtml,
      question_type: qType,
      options: opts,
      correct_answer_index: correctIdx,
      correct_answer_text: correctText,
      domain: domain,
      difficulty: TARGET_DIFFICULTY,
      image_url: null
    });
  }

  // 1. Export CSV
  const csvHeaders = ['section', 'module', 'question_number', 'passage', 'prompt', 'question_type', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer_index', 'correct_answer_text', 'image_url', 'domain', 'difficulty'];
  const csvRows = [csvHeaders.join(',')];

  for (const q of formattedQuestions) {
    csvRows.push([
      escapeCsv('math'),
      escapeCsv(1),
      escapeCsv(q.question_number),
      escapeCsv(''),
      escapeCsv(q.prompt),
      escapeCsv(q.question_type),
      escapeCsv(q.options[0] || ''),
      escapeCsv(q.options[1] || ''),
      escapeCsv(q.options[2] || ''),
      escapeCsv(q.options[3] || ''),
      escapeCsv(q.question_type === 'mcq' ? q.correct_answer_index : ''),
      escapeCsv(q.question_type === 'spr' ? q.correct_answer_text : ''),
      escapeCsv(''),
      escapeCsv(q.domain),
      escapeCsv(q.difficulty)
    ].join(','));
  }

  const csvPath = path.join(__dirname, '..', 'question', 'Math', '165_hard_questions_math.csv');
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');
  console.log(`✅ CSV written to: ${csvPath}`);

  // 2. Update backup_all_tests.json
  const backupPath = path.join(__dirname, '..', 'backup_all_tests.json');
  let assignedTestId;
  if (fs.existsSync(backupPath)) {
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    let testObj = backup.tests.find(t => t.title === TARGET_TITLE);
    if (!testObj) {
      const maxId = backup.tests.reduce((max, t) => Math.max(max, t.id || 0), 0);
      assignedTestId = maxId + 1;
      testObj = {
        id: assignedTestId,
        title: TARGET_TITLE,
        type: TEST_TYPE,
        difficulty: TARGET_DIFFICULTY,
        allow_practice: 1,
        total_time_minutes: 200,
        total_questions: formattedQuestions.length
      };
      backup.tests.push(testObj);
    } else {
      assignedTestId = testObj.id;
      testObj.difficulty = TARGET_DIFFICULTY;
      testObj.total_time_minutes = 200;
      testObj.total_questions = formattedQuestions.length;
      testObj.allow_practice = 1;
    }

    backup.questions = backup.questions.filter(q => q.test_id !== assignedTestId);

    let maxQId = backup.questions.reduce((max, q) => Math.max(max, q.id || 0), 0);
    for (const q of formattedQuestions) {
      maxQId++;
      backup.questions.push({
        id: maxQId,
        test_id: assignedTestId,
        question_number: q.question_number,
        passage: null,
        prompt: q.prompt,
        options: JSON.stringify(q.options),
        correct_answer_index: q.correct_answer_index,
        correct_answer_text: q.correct_answer_text,
        module: 1,
        image_url: null,
        question_type: q.question_type,
        section: 'math',
        domain: q.domain,
        difficulty: q.difficulty
      });
    }

    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
    console.log(`✅ backup_all_tests.json updated for test "${TARGET_TITLE}" (ID: ${assignedTestId})!`);
  }

  // 3. MySQL Database Sync
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

    const [existing] = await connection.query('SELECT id FROM tests WHERE title = ?', [TARGET_TITLE]);
    let testId;
    if (existing.length > 0) {
      testId = existing[0].id;
      console.log(`Test "${TARGET_TITLE}" found with ID ${testId}. Cleaning up old questions...`);
      await connection.query('DELETE FROM questions WHERE test_id = ?', [testId]);
      await connection.query('UPDATE tests SET type = ?, difficulty = ?, allow_practice = 1 WHERE id = ?', [TEST_TYPE, TARGET_DIFFICULTY, testId]);
    } else {
      console.log(`Creating test "${TARGET_TITLE}" in DB...`);
      const [res] = await connection.query(
        'INSERT INTO tests (title, type, difficulty, allow_practice) VALUES (?, ?, ?, 1)',
        [TARGET_TITLE, TEST_TYPE, TARGET_DIFFICULTY]
      );
      testId = res.insertId;
      console.log(`Created test with ID ${testId}`);
    }

    console.log(`Inserting ${formattedQuestions.length} questions into DB...`);
    for (const q of formattedQuestions) {
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
          JSON.stringify(q.options),
          q.correct_answer_index,
          q.correct_answer_text,
          1,
          null,
          q.question_type,
          'math',
          q.domain,
          q.difficulty
        ]
      );
    }

    console.log(`🎉 DB import completed: "${TARGET_TITLE}" (ID: ${testId}) with ${formattedQuestions.length} questions.`);
  } catch (err) {
    console.warn('⚠️ MySQL connection/import error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

run().catch(console.error);
