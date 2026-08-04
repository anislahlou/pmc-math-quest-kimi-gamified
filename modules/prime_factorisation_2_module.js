(function (root) {
  "use strict";

  const ROUND_LENGTH = 6;
  const INTRO_SCENE_MS = 9000;

  // Source: Year 6 "M" workbook, Lesson 24 "Prime Factorisation (2)".
  // Printed pages 74-86 (PDF pages 84-96). The lesson teaches two ideas: a
  // trailing zero comes from a factor of 10 = 2 x 5, so the number of zeros a
  // product ends with is min(#2s, #5s) in its prime factorisation; and a set
  // of numbers can be split into groups of equal product because each group's
  // product is the square root of the total product.
  const SRC = "Book 74-86 / PDF 84-96";

  const CLASSICS = [
    { id: "zeros-product", nickname: "Count Zeros in a Product", skill: "Count the factors of 2 and 5 in a product; the number of trailing zeros is the smaller of the two counts.", sourcePages: SRC },
    { id: "zeros-factorial", nickname: "Zeros in a Factorial", skill: "Count the trailing zeros of 1 x 2 x ... x n by counting the factors of 5: floor(n/5) + floor(n/25) + floor(n/125) + ...", sourcePages: SRC },
    { id: "smallest-multiplier", nickname: "Smallest Missing Multiplier", skill: "Find the smallest number to multiply by so a product ends with a target number of zeros, supplying only the missing 2s and 5s.", sourcePages: SRC },
    { id: "equal-pairs", nickname: "Equal-Product Pairs", skill: "Split four numbers into two pairs with the same product, which equals the square root of the total product.", sourcePages: SRC },
    { id: "equal-triples", nickname: "Equal-Product Triples", skill: "Split six numbers into two groups of three with the same product, which equals the square root of the total product.", sourcePages: SRC },
    { id: "ones-digit", nickname: "Ones Digit of a Product", skill: "Find the ones digit of a product; a 2 paired with a 5 makes a 10, so the product ends in 0, otherwise the last digit follows a cycle.", sourcePages: SRC }
  ];

  const CLASSIC_IDS = CLASSICS.map((classic) => classic.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((classic) => [classic.id, classic]));

  // Maps each classic to a registry skill so the skill-coverage gate can
  // verify the bank covers every skill the registry promises.
  // Registry skills: ["Count zeros in a product", "Zeros in a factorial",
  // "Smallest missing multiplier", "Equal-product pairs",
  // "Equal-product triples", "Ones digit of a product"].
  const CLASSIC_SKILLS = {
    "zeros-product": "Count zeros in a product",
    "zeros-factorial": "Zeros in a factorial",
    "smallest-multiplier": "Smallest missing multiplier",
    "equal-pairs": "Equal-product pairs",
    "equal-triples": "Equal-product triples",
    "ones-digit": "Ones digit of a product"
  };

  const SOURCE_COVERAGE = {
    "zeros-product": ["Learn & Discover 14 x 15, 24 x 15, 28 x 25", "Exploration 2 11 x 2 x 33 x 4 x 5 x 10", "Further exercise 2 x 25 x 31 x 16 x 15"],
    "zeros-factorial": ["Learn & Discover 5!, 10!, 50!", "Exploration 3 product to 200", "Practice product to 500; Homework to 30 and 150"],
    "smallest-multiplier": ["Exploration 2 12 x 75 x 32 x ( )", "Homework 15 x 16 x 20 x ( ) and 10 x 11 x 25 x a", "Further exercise 35 x 15 x 32 x 45 x ( )"],
    "equal-pairs": ["Practice 15, 21, 14, 10", "Homework 24, 18, 27, 36", "Further exercise 24, 18, 27, 36"],
    "equal-triples": ["Exploration 1 14, 20, 40, 44, 63, 99", "Homework 2, 3, 24, 33, 55, 60", "Further exercise 3, 5, 22, 30, 77, 175"],
    "ones-digit": ["Further exercise 2 x 5 x 5 x 5 x 5 x 5 x 5 x 5", "Trailing-zero pattern 2 x 3 x 4 x 5", "Ones-digit cycles of repeated factors"]
  };

  const INTRO_SCENES = [
    {
      title: "Count zeros in a product",
      purpose: "See that each trailing zero is a factor of 10 = 2 x 5, so count the 2s and 5s.",
      classicId: "zeros-product",
      kind: "zeros",
      durationMs: 18000,
      caption: "A zero on the end of a product is a hidden 10, and 10 = 2 x 5. So break every number into primes, count the 2s and the 5s, and the number of zeros is whichever count is smaller.",
      voiceover: "Every zero on the end of a product is really a factor of ten, and ten is two times five. So break each number into its prime factors, count how many twos there are and how many fives there are. Each two pairs with a five to make a ten, so the number of trailing zeros is whichever count is smaller."
    },
    {
      title: "Zeros in a factorial",
      purpose: "Count zeros of 1 x 2 x ... x n by counting only the factors of 5.",
      classicId: "zeros-factorial",
      kind: "factorial",
      durationMs: 18000,
      caption: "In a long product like 1 x 2 x ... x 50 there are always more 2s than 5s, so the fives are what run out first. Count multiples of 5, then 25, then 125, and add them up.",
      voiceover: "When you multiply one times two times three all the way to a big number, there are always far more factors of two than of five. So the fives run out first and the fives decide the zeros. Count the multiples of five, then the multiples of twenty five, then one hundred and twenty five, and add those counts together."
    },
    {
      title: "Smallest missing multiplier",
      purpose: "Supply only the missing 2s and 5s to reach a target number of zeros.",
      classicId: "smallest-multiplier",
      kind: "missing",
      durationMs: 18000,
      caption: "To make a product end with more zeros, every new zero needs one more 2 and one more 5. Count what you already have, see what is missing, and multiply by only those primes.",
      voiceover: "Sometimes you want a product to end with a set number of zeros. Each zero needs a pair, one two and one five. Count the twos and fives you already have, work out how many of each are still missing, and multiply by the smallest number that supplies exactly those missing twos and fives, nothing more."
    },
    {
      title: "Equal-product pairs",
      purpose: "Split four numbers into two pairs that share the same product.",
      classicId: "equal-pairs",
      kind: "pairs",
      durationMs: 17000,
      caption: "Multiply all four numbers to get the total. Each equal pair must make the square root of that total, so look for two numbers whose product matches the other two.",
      voiceover: "To split four numbers into two pairs with equal products, first multiply all four together to get the total. Because the two equal groups multiply back to that total, each group must be the square root of it. So pair the numbers up until two of them multiply to the same value as the other two."
    },
    {
      title: "Equal-product triples",
      purpose: "Split six numbers into two groups of three with the same product.",
      classicId: "equal-triples",
      kind: "triples",
      durationMs: 17000,
      caption: "Prime-factorise all six numbers and share the primes evenly. Each group of three multiplies to the square root of the total product, just like the pairs but with three numbers in each group.",
      voiceover: "The same idea works with six numbers split into two groups of three. Prime factorise all six and share the prime factors out evenly between the two groups. Each group of three should multiply to the square root of the total product, exactly like the pairs but with three numbers in each group instead of two."
    },
    {
      title: "Ones digit of a product",
      purpose: "Use the 2-and-5 idea to find the ones digit of a product.",
      classicId: "ones-digit",
      kind: "ones",
      durationMs: 17000,
      caption: "If a product contains at least one 2 and one 5 it has a factor of 10, so its ones digit is 0. Otherwise the ones digit follows the repeating cycle of the last digits you multiply.",
      voiceover: "The two and five idea also tells you the ones digit. If a product has at least one factor of two and one factor of five, it contains a ten, so it must end in zero. If it does not, then just multiply the last digits together step by step, because the ones digit only depends on the ones digits being multiplied."
    }
  ];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatMathText(value) {
    return String(value)
      .replace(/\^1/g, "¹")
      .replace(/\^2/g, "²")
      .replace(/\^3/g, "³");
  }

  function parseNumber(value) {
    const text = String(value ?? "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
    return text ? Number(text[0]) : NaN;
  }

  // ---- number-theory helpers -------------------------------------------------

  // How many times the prime p divides n.
  function factorCount(n, p) {
    let count = 0;
    let value = Math.abs(n);
    while (value > 0 && value % p === 0) {
      value /= p;
      count += 1;
    }
    return count;
  }

  // Total factors of 2 and 5 across a list of multiplicands.
  function countTwosFives(factors) {
    let twos = 0;
    let fives = 0;
    for (const f of factors) {
      twos += factorCount(f, 2);
      fives += factorCount(f, 5);
    }
    return { twos, fives };
  }

  // Legendre terms floor(n / p^k) for k = 1, 2, ... while positive.
  function legendreTerms(n, p) {
    const terms = [];
    let power = p;
    while (power <= n) {
      terms.push(Math.floor(n / power));
      power *= p;
    }
    return terms;
  }

  // Ones digit of a product, computed iteratively modulo 10 (exact).
  function onesDigit(factors) {
    let digit = 1;
    for (const f of factors) {
      digit = (digit * (((f % 10) + 10) % 10)) % 10;
    }
    return digit;
  }

  function pf2Choice(choices, correct, variantIndex) {
    const unique = [...new Set(choices.map(String))];
    const without = unique.filter((choice) => choice !== String(correct));
    const ordered = [String(correct), ...without].slice(0, 4);
    const offset = variantIndex % ordered.length;
    const rotated = ordered.slice(offset).concat(ordered.slice(0, offset));
    return rotated.map((label) => ({ label, isCorrect: label === String(correct) }));
  }

  // Build three distinct, non-negative distractors from a list of plausible
  // slips. Falls back to correct + offsets so we always get four choices.
  function distinctDistractors(correct, candidates) {
    const out = [];
    const seen = new Set([String(correct)]);
    for (const candidate of candidates) {
      const n = Math.round(candidate);
      if (!Number.isFinite(n) || n < 0) continue;
      const key = String(n);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(n);
      if (out.length === 3) break;
    }
    let pad = 1;
    while (out.length < 3) {
      const candidate = correct + pad;
      if (candidate >= 0 && !seen.has(String(candidate))) {
        seen.add(String(candidate));
        out.push(candidate);
      }
      pad += 1;
    }
    return out;
  }

  function problemBase(classicId, variantIndex, answerType) {
    const classic = CLASSIC_BY_ID[classicId];
    return {
      id: `${classicId}-${variantIndex}`,
      classicId,
      classic: classic.nickname,
      skill: classic.skill,
      sourcePages: classic.sourcePages,
      variantIndex,
      answerType,
      answerMode: answerType === "choice" ? "choice" : "filled"
    };
  }

  function finishChoice(p, correct, distractors, variantIndex) {
    p.expected = correct;
    p.expectedDisplay = String(correct);
    p.correctInput = p.answerType === "choice" ? { choice: String(correct) } : { value: String(correct) };
    p.choices = p.answerType === "choice" ? pf2Choice([correct, ...distractors], correct, variantIndex) : [];
    return p;
  }

  const PRINCIPLE = {
    zeros: "trailing zeros = number of 10s = min( #2s , #5s )",
    factorial: "more 2s than 5s always — so just count the factors of 5",
    missing: "each new zero needs one more 2 and one more 5 — add only what is missing",
    pairs: "equal groups: each product is the square root of the total",
    triples: "equal groups: each product is the square root of the total",
    ones: "hunt for a hidden 2 × 5, then follow the last-digit cycle"
  };

  // ---- generators ------------------------------------------------------------

  function zerosProductProblem(variantIndex) {
    const cases = [
      { factors: [11, 2, 33, 4, 5, 10], display: "11 × 2 × 33 × 4 × 5 × 10" },
      { factors: [14, 15], display: "14 × 15" },
      { factors: [24, 15], display: "24 × 15" },
      { factors: [28, 25], display: "28 × 25" },
      { factors: [2, 25, 31, 16, 15], display: "2 × 25 × 31 × 16 × 15" },
      { factors: [2, 2, 2, 2, 3, 8, 5, 5, 7, 25, 25], display: "2 × 2 × 2 × 2 × 3 × 8 × 5 × 5 × 7 × 25 × 25" },
      { factors: [12, 12, 15, 15, 15], display: "12² × 15³" }
    ];
    const data = cases[variantIndex % cases.length];
    const { twos, fives } = countTwosFives(data.factors);
    const answer = Math.min(twos, fives);
    const p = problemBase("zeros-product", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `How many zeros does the product ${data.display} end with?`;
    p.hint1 = "A trailing zero is a factor of 10 = 2 × 5. Break each number into primes and count the 2s and the 5s.";
    p.hint2 = `Count the factors of 2 and the factors of 5; the number of zeros is the smaller count.`;
    p.solution = `${data.display} has ${twos} factor(s) of 2 and ${fives} factor(s) of 5, so it ends with min(${twos}, ${fives}) = ${answer} zero(s).`;
    p.visual = { kind: "zeros", principle: PRINCIPLE.zeros, expr: data.display, detail: `#2 = ${twos}, #5 = ${fives} → min = ${answer}` };
    const distractors = distinctDistractors(answer, [Math.max(twos, fives), twos, fives, answer + 1, answer + 2]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function zerosFactorialProblem(variantIndex) {
    const cases = [5, 10, 30, 50, 100, 150, 200, 500, 700, 800];
    const n = cases[variantIndex % cases.length];
    const terms = legendreTerms(n, 5);
    const answer = terms.reduce((sum, t) => sum + t, 0);
    const p = problemBase("zeros-factorial", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `How many zeros does the result of 1 × 2 × 3 × … × ${n} end with?`;
    p.hint1 = "In a long product there are always more 2s than 5s, so the number of zeros equals the number of factors of 5.";
    p.hint2 = `Count multiples of 5, then 25, then 125, …: ⌊${n}/5⌋ + ⌊${n}/25⌋ + ⌊${n}/125⌋ + …`;
    p.solution = `Factors of 5 in 1 × 2 × … × ${n} = ${terms.join(" + ")} = ${answer}, so the product ends with ${answer} zero(s).`;
    p.visual = { kind: "factorial", principle: PRINCIPLE.factorial, expr: `1 × 2 × … × ${n}`, detail: `${terms.join(" + ")} = ${answer}` };
    const distractors = distinctDistractors(answer, [terms[0], answer + 1, answer - 1, Math.floor(n / 5), answer + 2]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function smallestMultiplierProblem(variantIndex) {
    const cases = [
      { factors: [12, 75, 32], k: 4, display: "12 × 75 × 32" },
      { factors: [15, 16, 20], k: 3, display: "15 × 16 × 20" },
      { factors: [10, 11, 25], k: 3, display: "10 × 11 × 25" },
      { factors: [35, 15, 32, 45], k: 4, display: "35 × 15 × 32 × 45" },
      { factors: [8, 15, 15], k: 3, display: "8 × 15 × 15" },
      { factors: [4, 5, 5], k: 3, display: "4 × 5 × 5" }
    ];
    const data = cases[variantIndex % cases.length];
    const { twos, fives } = countTwosFives(data.factors);
    const needTwos = Math.max(0, data.k - twos);
    const needFives = Math.max(0, data.k - fives);
    const answer = Math.pow(2, needTwos) * Math.pow(5, needFives);
    const kWord = ["zero", "one", "two", "three", "four", "five", "six"][data.k] || `${data.k}`;
    const p = problemBase("smallest-multiplier", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `In ${data.display} × ( ? ), the last ${kWord} digits of the product are all zeros. What is the smallest value of ( ? )?`;
    p.hint1 = "Each trailing zero needs one 2 and one 5. Count the 2s and 5s you already have, then supply only the missing ones.";
    p.hint2 = `You need ${data.k} twos and ${data.k} fives. You already have ${twos} twos and ${fives} fives.`;
    p.solution = `${data.display} has ${twos} twos and ${fives} fives. For ${data.k} zeros you still need ${needTwos} twos and ${needFives} fives, so the smallest multiplier is 2^${needTwos} × 5^${needFives} = ${answer}.`;
    p.visual = { kind: "missing", principle: PRINCIPLE.missing, expr: `${data.display} × ( ? )`, detail: `missing ${needTwos} two(s), ${needFives} five(s) → × ${answer}` };
    const distractors = distinctDistractors(answer, [answer * 2, Math.pow(5, needFives + 1), answer + 5, data.k, answer * 5]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function equalPairsProblem(variantIndex) {
    const cases = [
      { nums: [15, 21, 14, 10], a: [15, 14], b: [21, 10] },
      { nums: [24, 18, 27, 36], a: [24, 27], b: [18, 36] },
      { nums: [6, 8, 12, 4], a: [6, 8], b: [12, 4] },
      { nums: [9, 10, 15, 6], a: [9, 10], b: [15, 6] },
      { nums: [8, 15, 20, 6], a: [8, 15], b: [20, 6] },
      { nums: [12, 35, 15, 28], a: [12, 35], b: [15, 28] }
    ];
    const data = cases[variantIndex % cases.length];
    const product = data.a[0] * data.a[1];
    const p = problemBase("equal-pairs", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Split ${data.nums.join(", ")} into two pairs that have the same product. What is that product?`;
    p.hint1 = "Multiply all four numbers together; each equal pair must make the square root of that total.";
    p.hint2 = `Look for two of the numbers whose product equals the product of the other two.`;
    p.solution = `${data.a[0]} × ${data.a[1]} = ${product} and ${data.b[0]} × ${data.b[1]} = ${product}, so the equal product is ${product}.`;
    p.visual = { kind: "pairs", principle: PRINCIPLE.pairs, expr: data.nums.join(", "), detail: `${data.a[0]} × ${data.a[1]} = ${product} = ${data.b[0]} × ${data.b[1]}` };
    const distractors = distinctDistractors(product, [data.a[0] * data.b[0], data.a[0] * data.b[1], product * 2, product + 10, data.a[1] * data.b[1]]);
    return finishChoice(p, product, distractors, variantIndex);
  }

  function equalTriplesProblem(variantIndex) {
    const cases = [
      { nums: [14, 20, 40, 44, 63, 99], a: [14, 40, 99], b: [20, 44, 63] },
      { nums: [3, 5, 22, 30, 77, 175], a: [5, 30, 77], b: [3, 22, 175] },
      { nums: [2, 3, 24, 33, 55, 60], a: [2, 33, 60], b: [3, 24, 55] },
      { nums: [4, 9, 10, 6, 12, 5], a: [4, 9, 10], b: [6, 12, 5] },
      { nums: [8, 9, 25, 10, 15, 12], a: [8, 9, 25], b: [10, 15, 12] },
      { nums: [6, 14, 15, 7, 9, 20], a: [6, 14, 15], b: [7, 9, 20] }
    ];
    const data = cases[variantIndex % cases.length];
    const product = data.a[0] * data.a[1] * data.a[2];
    const p = problemBase("equal-triples", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Split ${data.nums.join(", ")} into two groups of three with the same product. What is that product?`;
    p.hint1 = "Prime-factorise the numbers and share the primes evenly; each group's product is the square root of the total.";
    p.hint2 = `Find three of the numbers whose product equals the product of the other three.`;
    p.solution = `${data.a.join(" × ")} = ${product} and ${data.b.join(" × ")} = ${product}, so the equal product is ${product}.`;
    p.visual = { kind: "triples", principle: PRINCIPLE.triples, expr: data.nums.join(", "), detail: `${data.a.join(" × ")} = ${product} = ${data.b.join(" × ")}` };
    const distractors = distinctDistractors(product, [product * 2, data.a[0] * data.b[0] * data.a[1], product + 100, Math.round(product / 2), product + data.nums[0]]);
    return finishChoice(p, product, distractors, variantIndex);
  }

  function onesDigitProblem(variantIndex) {
    const cases = [
      { factors: [2, 5, 5, 5, 5, 5, 5, 5], display: "2 × 5 × 5 × 5 × 5 × 5 × 5 × 5" },
      { factors: [3, 3, 3, 3], display: "3 × 3 × 3 × 3" },
      { factors: [7, 7, 7], display: "7 × 7 × 7" },
      { factors: [2, 3, 4, 5], display: "2 × 3 × 4 × 5" },
      { factors: [9, 9, 9], display: "9 × 9 × 9" },
      { factors: [4, 4, 4], display: "4 × 4 × 4" }
    ];
    const data = cases[variantIndex % cases.length];
    const answer = onesDigit(data.factors);
    const { twos, fives } = countTwosFives(data.factors);
    const hasTen = twos >= 1 && fives >= 1;
    const p = problemBase("ones-digit", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `What is the ones (units) digit of ${data.display}?`;
    p.hint1 = "Check for a factor of 10 first: if the product has at least one 2 and one 5, it ends in 0.";
    p.hint2 = `Otherwise multiply the last digits together step by step — only the ones digit matters.`;
    p.solution = hasTen
      ? `${data.display} contains 2 × 5 = 10, so its ones digit is ${answer}.`
      : `Multiplying the last digits of ${data.display} step by step gives a ones digit of ${answer}.`;
    p.visual = { kind: "ones", principle: PRINCIPLE.ones, expr: data.display, detail: hasTen ? `has 2 × 5 = 10 → ones digit ${answer}` : `last digit works out to ${answer}` };
    const distractors = distinctDistractors(answer, [5, (answer + 5) % 10, answer + 1, 6, 2, 4, 8]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function generateProblem(classicId, variantIndex = 0) {
    const generators = {
      "zeros-product": zerosProductProblem,
      "zeros-factorial": zerosFactorialProblem,
      "smallest-multiplier": smallestMultiplierProblem,
      "equal-pairs": equalPairsProblem,
      "equal-triples": equalTriplesProblem,
      "ones-digit": onesDigitProblem
    };
    const generator = generators[classicId];
    if (!generator) return null;
    const problem = generator(variantIndex);
    if (problem && CLASSIC_SKILLS[classicId]) problem.skillTag = CLASSIC_SKILLS[classicId];
    return problem;
  }

  function validateProblemMath(problem) {
    return Number.isFinite(Number(problem.expected)) || typeof problem.expected === "string";
  }

  function checkAnswer(problem, input) {
    if (problem.answerType === "choice") {
      const value = String(input.choice ?? "");
      const correct = value === String(problem.expected);
      return { isCorrect: correct, errorClass: correct ? null : "choice_mismatch" };
    }
    const value = parseNumber(input.value);
    const correct = Math.abs(value - Number(problem.expected)) < 1e-8;
    return { isCorrect: correct, errorClass: correct ? null : "number_mismatch" };
  }

  function svgShell(inner) {
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Prime factorisation visual">${inner}</svg>`;
  }

  // Every classic shares one structurally stable "prime card": two prime tiles
  // (2 and 5, the building blocks of a trailing zero), the teaching principle,
  // the specific expression, and a worked detail line. Text content changes
  // between variants and states, but the element skeleton never does, so the
  // diagram-parity gate stays green. The detail line is hidden behind "= ?" and
  // the numeric answer only ever appears in the solution-state banner, so the
  // practice panel never leaks the answer.
  function renderProblemVisual(problem, state = "initial") {
    if (!problem || !problem.visual) {
      return { html: svgShell(`<text x="280" y="170" text-anchor="middle" class="formula-note">No problem to show.</text>`), text: "No problem to show." };
    }
    const v = problem.visual;
    const isRevealed = state === "solution" || state === "worked";
    const answer = isRevealed
      ? `<text x="280" y="306" text-anchor="middle" class="formula-note">Answer: ${escapeHtml(problem.expectedDisplay)}</text>`
      : "";
    const html = svgShell(`
        <rect x="40" y="86" width="104" height="104" rx="12" fill="#fff8dc" stroke="#16345d" stroke-width="4"/>
        <text x="92" y="156" text-anchor="middle" class="side-label" style="font-size:42px">2</text>
        <rect x="416" y="86" width="104" height="104" rx="12" fill="#ffe6e0" stroke="#16345d" stroke-width="4"/>
        <text x="468" y="156" text-anchor="middle" class="side-label" style="font-size:42px">5</text>
        <text x="280" y="124" text-anchor="middle" class="side-label" style="font-size:34px">×</text>
        <text x="280" y="164" text-anchor="middle" class="formula-note">2 × 5 = 10</text>
        <text x="280" y="44" text-anchor="middle" class="formula-note">${escapeHtml(v.principle)}</text>
        <text x="280" y="226" text-anchor="middle" class="side-label" style="font-size:16px">${escapeHtml(v.expr)}</text>
        <text x="280" y="258" text-anchor="middle" class="formula-note">${escapeHtml(isRevealed ? v.detail : "= ?")}</text>
        ${answer}
      `);
    const text = problem.skill;
    return { html, text };
  }

  // The intro uses dedicated teaching diagrams (one per skill). These are
  // separate from renderProblemVisual, so the diagram-parity gate (which only
  // inspects generated problems) is unaffected.
  function introShell(inner) {
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Prime factorisation intro scene">${inner}</svg>`;
  }

  function introZeros() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Each trailing zero is a hidden 10 = 2 × 5</text>
        <text x="280" y="84" text-anchor="middle" class="side-label" style="font-size:17px">28 × 25 = (2 × 2 × 7) × (5 × 5)</text>
        <rect x="120" y="108" width="150" height="46" rx="8" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>
        <text x="195" y="138" text-anchor="middle" class="side-label">#2 = 2</text>
        <rect x="300" y="108" width="150" height="46" rx="8" fill="#ffe6e0" stroke="#16345d" stroke-width="3"/>
        <text x="375" y="138" text-anchor="middle" class="side-label">#5 = 2</text>
        <text x="280" y="206" text-anchor="middle" class="formula-note" style="font-size:15px">pair each 2 with a 5 → min(2, 2) = 2</text>
        <text x="280" y="250" text-anchor="middle" class="side-label" style="font-size:16px">28 × 25 = 700 → 2 zeros</text>
      `);
  }

  function introFactorial() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Long products: just count the 5s</text>
        <text x="280" y="82" text-anchor="middle" class="side-label" style="font-size:17px">1 × 2 × 3 × … × 50</text>
        <rect x="96" y="104" width="170" height="44" rx="8" fill="#ffe6e0" stroke="#16345d" stroke-width="3"/>
        <text x="181" y="132" text-anchor="middle" class="side-label">⌊50/5⌋ = 10</text>
        <rect x="294" y="104" width="170" height="44" rx="8" fill="#ffe6e0" stroke="#16345d" stroke-width="3"/>
        <text x="379" y="132" text-anchor="middle" class="side-label">⌊50/25⌋ = 2</text>
        <text x="280" y="198" text-anchor="middle" class="formula-note" style="font-size:15px">add the counts of fives: 10 + 2</text>
        <text x="280" y="244" text-anchor="middle" class="side-label" style="font-size:16px">= 12 zeros</text>
      `);
  }

  function introMissing() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Add only the missing 2s and 5s</text>
        <text x="280" y="82" text-anchor="middle" class="side-label" style="font-size:16px">12 × 75 × 32 × ( ? ) → 4 zeros</text>
        <rect x="120" y="104" width="150" height="46" rx="8" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>
        <text x="195" y="134" text-anchor="middle" class="side-label">have #2 = 7</text>
        <rect x="300" y="104" width="150" height="46" rx="8" fill="#ffe6e0" stroke="#16345d" stroke-width="3"/>
        <text x="375" y="134" text-anchor="middle" class="side-label">have #5 = 2</text>
        <text x="280" y="200" text-anchor="middle" class="formula-note" style="font-size:15px">need 4 fives, missing 2 → multiply by 5 × 5</text>
        <text x="280" y="246" text-anchor="middle" class="side-label" style="font-size:16px">smallest ( ? ) = 25</text>
      `);
  }

  function introPairs() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Two pairs, one shared product</text>
        <text x="280" y="78" text-anchor="middle" class="side-label" style="font-size:17px">15, 21, 14, 10</text>
        <rect x="86" y="100" width="170" height="56" rx="10" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>
        <text x="171" y="134" text-anchor="middle" class="side-label">15 × 14 = 210</text>
        <rect x="304" y="100" width="170" height="56" rx="10" fill="#ffe6e0" stroke="#16345d" stroke-width="3"/>
        <text x="389" y="134" text-anchor="middle" class="side-label">21 × 10 = 210</text>
        <text x="280" y="208" text-anchor="middle" class="formula-note" style="font-size:15px">total = 44100, each pair = √44100</text>
        <text x="280" y="252" text-anchor="middle" class="side-label" style="font-size:16px">shared product = 210</text>
      `);
  }

  function introTriples() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Two groups of three, equal product</text>
        <text x="280" y="76" text-anchor="middle" class="side-label" style="font-size:16px">14, 20, 40, 44, 63, 99</text>
        <rect x="70" y="98" width="200" height="56" rx="10" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>
        <text x="170" y="132" text-anchor="middle" class="side-label">14 × 40 × 99</text>
        <rect x="290" y="98" width="200" height="56" rx="10" fill="#ffe6e0" stroke="#16345d" stroke-width="3"/>
        <text x="390" y="132" text-anchor="middle" class="side-label">20 × 44 × 63</text>
        <text x="280" y="206" text-anchor="middle" class="formula-note" style="font-size:15px">share the primes evenly between the groups</text>
        <text x="280" y="250" text-anchor="middle" class="side-label" style="font-size:16px">each group = 55440</text>
      `);
  }

  function introOnes() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">A 2 and a 5 force the ones digit to 0</text>
        <text x="280" y="84" text-anchor="middle" class="side-label" style="font-size:17px">2 × 5 × 5 × 5 × 5 × 5 × 5 × 5</text>
        <rect x="150" y="108" width="260" height="48" rx="8" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>
        <text x="280" y="138" text-anchor="middle" class="side-label">= 10 × (5 × 5 × 5 × 5 × 5 × 5)</text>
        <text x="280" y="204" text-anchor="middle" class="formula-note" style="font-size:15px">one factor of 10 makes it end in 0</text>
        <text x="280" y="248" text-anchor="middle" class="side-label" style="font-size:16px">ones digit = 0</text>
      `);
  }

  function renderIntroScene(index) {
    const scene = INTRO_SCENES[index % INTRO_SCENES.length];
    const builders = {
      "zeros-product": introZeros,
      "zeros-factorial": introFactorial,
      "smallest-multiplier": introMissing,
      "equal-pairs": introPairs,
      "equal-triples": introTriples,
      "ones-digit": introOnes
    };
    const build = builders[scene.classicId];
    if (build) return build();
    return renderProblemVisual(generateProblem(scene.classicId, index), "initial").html;
  }

  function createRound(offset = 0) {
    return CLASSIC_IDS.map((classicId, index) => generateProblem(classicId, offset + index));
  }

  const api = {
    CLASSICS,
    CLASSIC_IDS,
    CLASSIC_SKILLS,
    SOURCE_COVERAGE,
    INTRO_SCENES,
    INTRO_SCENE_MS,
    ROUND_LENGTH,
    formatMathText,
    parseNumber,
    generateProblem,
    validateProblemMath,
    checkAnswer,
    renderProblemVisual,
    renderIntroScene,
    createRound
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    return;
  }

  root.PrimeFactorisation2Module = api;

  // ---- browser UI driver -----------------------------------------------------

  const state = {
    introIndex: 0,
    introPlaying: false,
    introStartedAt: 0,
    introTimer: null,
    audioEnabled: true,
    currentUtterance: null,
    roundOffset: 0,
    round: createRound(0),
    current: 0,
    answers: [],
    hintCount: 0
  };

  const $ = (id) => document.getElementById(id);

  function speechEngine() {
    return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  }

  function chooseNarrationVoice() {
    const synth = speechEngine();
    if (!synth) return null;
    const voices = synth.getVoices();
    const englishVoices = voices.filter((voice) => /^en/i.test(voice.lang || ""));
    return englishVoices.find((voice) => /natural|online|neural|jenny|aria|sonia|libby/i.test(voice.name))
      || englishVoices.find((voice) => /microsoft|google/i.test(voice.name))
      || englishVoices[0]
      || voices[0]
      || null;
  }

  function updateAudioStatus(message) {
    const status = $("intro-audio-status");
    if (status) status.textContent = message;
    const button = $("intro-audio");
    if (button) button.textContent = state.audioEnabled ? "Audio on" : "Audio off";
  }

  function cancelIntroSpeech() {
    const synth = speechEngine();
    if (synth) synth.cancel();
    const audio = $("intro-audio-player");
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.onplay = null;
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch (error) {
        // Some browsers cannot reset currentTime until metadata has loaded.
      }
    }
    state.currentUtterance = null;
  }

  function speakIntroSceneFallback() {
    const synth = speechEngine();
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
      updateAudioStatus("Audio is not available in this browser, but the narration text is shown below the animation.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(INTRO_SCENES[state.introIndex].voiceover);
    const voice = chooseNarrationVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 0.94;
    utterance.pitch = 1.04;
    utterance.volume = 1;
    utterance.onstart = () => updateAudioStatus("Audio playing.");
    utterance.onend = () => {
      state.currentUtterance = null;
      updateAudioStatus(state.introPlaying ? "Audio ready for the next scene." : "Audio ready.");
    };
    utterance.onerror = () => {
      state.currentUtterance = null;
      updateAudioStatus("Audio was blocked by the browser. Press Play intro video again to restart it.");
    };
    state.currentUtterance = utterance;
    updateAudioStatus("Audio starting.");
    synth.speak(utterance);
  }

  function speakIntroScene() {
    if (!state.audioEnabled) {
      updateAudioStatus("Audio off. Turn it on to hear the narration.");
      return;
    }
    cancelIntroSpeech();
    const scene = INTRO_SCENES[state.introIndex];
    const audio = $("intro-audio-player");
    if (!audio || !scene.audio) {
      speakIntroSceneFallback();
      return;
    }
    let fallbackStarted = false;
    const startFallback = () => {
      if (fallbackStarted) return;
      fallbackStarted = true;
      updateAudioStatus("Audio file was blocked, so I am trying the browser narration instead.");
      speakIntroSceneFallback();
    };
    audio.src = scene.audio;
    try {
      audio.currentTime = 0;
    } catch (error) {
      // The browser may need metadata before accepting a seek.
    }
    audio.onplay = () => updateAudioStatus("Audio playing.");
    audio.onended = () => updateAudioStatus(state.introPlaying ? "Audio ready for the next scene." : "Audio ready.");
    audio.onerror = startFallback;
    updateAudioStatus("Audio starting.");
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") playAttempt.catch(startFallback);
  }

  function currentIntroDurationMs() {
    const scene = INTRO_SCENES[state.introIndex];
    return scene.durationMs || INTRO_SCENE_MS;
  }

  function toggleIntroAudio() {
    state.audioEnabled = !state.audioEnabled;
    if (!state.audioEnabled) {
      cancelIntroSpeech();
      updateAudioStatus("Audio off. The narration text remains visible.");
      return;
    }
    updateAudioStatus("Audio on. Press Play intro video to hear the narration.");
    if (state.introPlaying) speakIntroScene();
  }

  function renderIntro() {
    const scene = INTRO_SCENES[state.introIndex];
    $("intro-title").textContent = scene.title;
    $("intro-count").textContent = `${state.introIndex + 1} of ${INTRO_SCENES.length}`;
    $("intro-frame").innerHTML = renderIntroScene(state.introIndex);
    $("intro-frame").classList.toggle("playing", state.introPlaying);
    $("intro-voiceover").textContent = scene.voiceover;
    $("intro-caption").textContent = scene.caption;
    $("intro-storyboard").innerHTML = INTRO_SCENES.map((item, index) => `<li class="${index === state.introIndex ? "active" : ""}"><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.purpose)}</li>`).join("");
    $("intro-play").textContent = state.introPlaying ? "Pause intro" : (state.introIndex === INTRO_SCENES.length - 1 ? "Replay intro" : "Play intro video");
    updateAudioStatus(state.audioEnabled ? "Audio ready. Press Play intro video to hear the narration." : "Audio off. The narration text remains visible.");
  }

  function clearIntroTimer() {
    if (state.introTimer) {
      clearInterval(state.introTimer);
      state.introTimer = null;
    }
  }

  function setIntroProgress(percent) {
    const fill = $("intro-progress-fill");
    if (fill) fill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  }

  function stopIntroPlayback(progress = 0) {
    clearIntroTimer();
    cancelIntroSpeech();
    state.introPlaying = false;
    setIntroProgress(progress);
    renderIntro();
  }

  function advanceIntro(keepPlaying = false) {
    const atEnd = state.introIndex >= INTRO_SCENES.length - 1;
    if (atEnd && keepPlaying) {
      stopIntroPlayback(100);
      return;
    }
    state.introIndex = atEnd ? 0 : state.introIndex + 1;
    if (keepPlaying) startIntroPlayback();
    else {
      cancelIntroSpeech();
      state.introPlaying = false;
      setIntroProgress(0);
      renderIntro();
    }
  }

  function retreatIntro() {
    // Manual step backwards. Stepping always pauses autoplay so the learner
    // can dwell on the scene; wraps from the first scene round to the last.
    clearIntroTimer();
    cancelIntroSpeech();
    state.introPlaying = false;
    state.introIndex = state.introIndex <= 0 ? INTRO_SCENES.length - 1 : state.introIndex - 1;
    setIntroProgress(0);
    renderIntro();
  }

  function startIntroPlayback() {
    clearIntroTimer();
    if (state.introIndex >= INTRO_SCENES.length - 1 && !state.introPlaying) state.introIndex = 0;
    state.introPlaying = true;
    state.introStartedAt = Date.now();
    setIntroProgress(0);
    renderIntro();
    speakIntroScene();
    state.introTimer = setInterval(() => {
      const percent = ((Date.now() - state.introStartedAt) / currentIntroDurationMs()) * 100;
      setIntroProgress(percent);
      if (percent >= 100) advanceIntro(true);
    }, 80);
  }

  function toggleIntroPlayback() {
    if (state.introPlaying) stopIntroPlayback(Number($("intro-progress-fill").style.width.replace("%", "")) || 0);
    else startIntroPlayback();
  }

  function renderSkills() {
    $("intro-skill-grid").innerHTML = CLASSICS.map((classic) => `<div class="skill-tile"><strong>${escapeHtml(classic.nickname)}</strong><span>${escapeHtml(classic.skill)}</span></div>`).join("");
    $("mastery-chips").innerHTML = CLASSICS.map((classic) => `<div class="classic-chip"><strong>${escapeHtml(classic.nickname)}</strong></div>`).join("");
  }

  function showIntro() {
    $("intro-screen").hidden = false;
    $("practice-grid").hidden = true;
    $("round-recap").hidden = true;
    renderIntro();
  }

  function showPractice() {
    stopIntroPlayback(0);
    $("intro-screen").hidden = true;
    $("practice-grid").hidden = false;
    $("round-recap").hidden = true;
    renderProblem();
  }

  function currentProblem() {
    return state.round[state.current];
  }

  function renderAnswerHost(problem) {
    if (problem.answerType === "choice") {
      return `<div class="choice-grid">${problem.choices.map((choice) => `<label class="choice-card"><input type="radio" name="choice" value="${escapeHtml(choice.label)}"><span>${escapeHtml(formatMathText(choice.label))}</span></label>`).join("")}</div>`;
    }
    return `<input class="filled-answer" name="value" autocomplete="off" inputmode="numeric" placeholder="Type the number">`;
  }

  function renderProblem() {
    const problem = currentProblem();
    state.hintCount = 0;
    $("classic-label").textContent = problem.classic;
    $("session-count").textContent = `${state.current + 1} of ${state.round.length}`;
    $("problem-prompt").textContent = problem.prompt;
    $("answer-host").innerHTML = renderAnswerHost(problem);
    $("hint-ladder").innerHTML = "";
    $("feedback").className = "feedback-card muted";
    $("feedback").textContent = "Choose or type an answer, then check it.";
    $("similar-button").hidden = true;
    renderVisual("initial");
    renderScore();
  }

  function renderVisual(mode) {
    const rendered = renderProblemVisual(currentProblem(), mode);
    $("visual-frame").innerHTML = rendered.html;
    $("visual-text").textContent = rendered.text;
    $("visual-state").textContent = mode;
  }

  function renderScore() {
    const attempted = state.answers.filter(Boolean).length;
    const correct = state.answers.filter((answer) => answer && answer.isCorrect).length;
    $("live-score").textContent = `Score ${correct} / ${attempted} · Unanswered ${state.round.length - attempted}`;
  }

  function collectInput() {
    const form = new FormData($("answer-form"));
    return { choice: form.get("choice"), value: form.get("value") };
  }

  function checkCurrent(event) {
    event.preventDefault();
    const problem = currentProblem();
    const result = checkAnswer(problem, collectInput());
    state.answers[state.current] = result;
    $("feedback").className = `feedback-card ${result.isCorrect ? "correct" : "wrong"}`;
    $("feedback").textContent = result.isCorrect ? `Correct. ${problem.solution}` : `Not quite. ${problem.hint1}`;
    $("similar-button").hidden = result.isCorrect;
    renderVisual(result.isCorrect ? "solution" : "hint");
    renderScore();
  }

  function showHint() {
    const problem = currentProblem();
    state.hintCount += 1;
    const hint = state.hintCount === 1 ? problem.hint1 : problem.hint2;
    $("hint-ladder").insertAdjacentHTML("beforeend", `<div>${escapeHtml(formatMathText(hint))}</div>`);
    renderVisual("hint");
  }

  function showWhy() {
    $("feedback").className = "feedback-card";
    $("feedback").textContent = currentProblem().solution;
    renderVisual("solution");
  }

  function nextProblem() {
    if (state.current < state.round.length - 1) {
      state.current += 1;
      renderProblem();
    } else {
      showRecap();
    }
  }

  function showRecap() {
    $("practice-grid").hidden = true;
    $("round-recap").hidden = false;
    const missed = state.round.filter((_, index) => !state.answers[index]?.isCorrect);
    $("recap-content").innerHTML = missed.length
      ? missed.map((problem) => `<div><strong>${escapeHtml(problem.classic)}</strong><br>${escapeHtml(problem.skill)}</div>`).join("")
      : "<div><strong>Clean round.</strong><br>You counted the 2s and 5s, used factorials and missing multipliers, and split numbers into equal-product groups accurately.</div>";
  }

  function freshRound() {
    // Advance by 1 (coprime with every generator's case-list length) so a
    // fresh round shifts each classic to a genuinely different variant rather
    // than landing on the same case via variantIndex % cases.length.
    state.roundOffset += 1;
    state.round = createRound(state.roundOffset);
    state.current = 0;
    state.answers = [];
    showPractice();
  }

  function boot() {
    renderSkills();
    renderIntro();
    $("show-intro").addEventListener("click", showIntro);
    $("show-practice").addEventListener("click", showPractice);
    $("intro-start").addEventListener("click", showPractice);
    $("intro-audio").addEventListener("click", toggleIntroAudio);
    $("intro-prev").addEventListener("click", retreatIntro);
    $("intro-next").addEventListener("click", () => advanceIntro(false));
    $("intro-play").addEventListener("click", toggleIntroPlayback);
    $("answer-form").addEventListener("submit", checkCurrent);
    $("hint-button").addEventListener("click", showHint);
    $("why-button").addEventListener("click", showWhy);
    $("next-button").addEventListener("click", nextProblem);
    $("similar-button").addEventListener("click", () => {
      state.round[state.current] = generateProblem(currentProblem().classicId, currentProblem().variantIndex + 1);
      state.answers[state.current] = undefined;
      renderProblem();
    });
    $("fresh-round-button").addEventListener("click", freshRound);
    $("review-intro-button").addEventListener("click", showIntro);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
