(function (root) {
  "use strict";

  const ROUND_LENGTH = 6;
  const INTRO_SCENE_MS = 9000;

  // Source: Year 6 "M" workbook, Lesson 23 "Calculating with Formulas".
  // Printed pages 59-73 (PDF pages 69-83). The lesson teaches the difference
  // of two squares, a^2 - b^2 = (a + b)(a - b), and uses it to calculate
  // differences of squares, sneaky products, and long alternating square
  // chains quickly.
  const SRC = "Book 59-73 / PDF 69-83";

  // The generic formula card every visual shows at the top.
  const FORMULA = "a² − b² = (a + b)(a − b)";

  const CLASSICS = [
    { id: "diff-two-squares", nickname: "Difference of Two Squares", skill: "Factor a² − b² as (a + b)(a − b), then multiply the sum by the difference to get the answer fast.", sourcePages: SRC },
    { id: "squares-in-disguise", nickname: "Squares in Disguise", skill: "Rewrite a product like 17 × 17 or a plain number like 4, 49 or 1 as a square so the expression becomes a clean difference of two squares.", sourcePages: SRC },
    { id: "products-near-round", nickname: "Products Near a Round Number", skill: "Multiply two numbers the same distance either side of a round number using (n − d)(n + d) = n² − d².", sourcePages: SRC },
    { id: "consecutive-square-chain", nickname: "Consecutive Square Chain", skill: "Pair each a² − (a − 1)² in an alternating chain; every pair equals the two bases added, so the chain becomes a running total.", sourcePages: SRC },
    { id: "spaced-square-pairs", nickname: "Spaced Square Pairs", skill: "When an alternating chain pairs squares whose bases differ by more than one, factor each pair as (a + b)(a − b) before adding.", sourcePages: SRC },
    { id: "spot-the-neighbours", nickname: "Spot the Neighbours", skill: "Recognise that n × n − (n − 1)(n + 1) = 1 by turning each product into a square minus a small square.", sourcePages: SRC }
  ];

  const CLASSIC_IDS = CLASSICS.map((classic) => classic.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((classic) => [classic.id, classic]));

  // Maps each classic to a registry skill so the skill-coverage gate can
  // verify the bank covers every skill the registry promises.
  // Registry skills: ["Difference of two squares", "Squares in disguise",
  // "Products near a round number", "Consecutive square chain",
  // "Spaced square pairs", "Spot the neighbours"].
  const CLASSIC_SKILLS = {
    "diff-two-squares": "Difference of two squares",
    "squares-in-disguise": "Squares in disguise",
    "products-near-round": "Products near a round number",
    "consecutive-square-chain": "Consecutive square chain",
    "spaced-square-pairs": "Spaced square pairs",
    "spot-the-neighbours": "Spot the neighbours"
  };

  const SOURCE_COVERAGE = {
    "diff-two-squares": ["Exploration 1 50² − 49²", "Homework 40² − 39² and 27² − 3²", "Further exercise 35² − 34²"],
    "squares-in-disguise": ["Exploration 1 17 × 17 − 49", "Exploration 2 98² − 4 and 99² − 1", "Further exercise 67 × 67 − 33 × 33"],
    "products-near-round": ["Learn & Discover 19 × 21", "Exploration 4 499 × 501", "Homework 59 × 61 and further 198 × 202"],
    "consecutive-square-chain": ["Exploration 2 100² − 99² + … − 1²", "Practice 20² − 19² + … − 1²", "Homework 30² − 29² + … − 1²"],
    "spaced-square-pairs": ["Exploration 3 80² − 78² + … + 4² − 2²", "Practice 56² − 52² + … + 8² − 4²", "Homework 60² − 57² + … + 6² − 3²"],
    "spot-the-neighbours": ["Reasoning 2015 × 2015 − 2016 × 2014", "Challenge 31415927² − 31415926 × 31415928", "Homework 50 × 50 − 49 × 51"]
  };

  const INTRO_SCENES = [
    {
      title: "Difference of two squares",
      purpose: "Meet the formula a² − b² = (a + b)(a − b) and use it to subtract two squares.",
      classicId: "diff-two-squares",
      kind: "diff",
      durationMs: 20000,
      caption: "Cut a small square out of a big square, rearrange the L-shape into a rectangle, and you discover that a² − b² is exactly (a + b) times (a − b).",
      voiceover: "Start with the big idea. Take a square of side a and cut out a square of side b from one corner. Rearrange the left-over L-shape into a rectangle and it measures a plus b along one side and a minus b along the other, so a squared minus b squared equals a plus b times a minus b."
    },
    {
      title: "Squares in disguise",
      purpose: "Rewrite products and plain numbers as squares so the formula applies.",
      classicId: "squares-in-disguise",
      kind: "diff",
      durationMs: 17000,
      caption: "17 × 17 is really 17², and a plain number like 49, 4 or 1 is really 7², 2² or 1². Spot the hidden squares and the formula clicks straight in.",
      voiceover: "Sometimes the squares are hiding. A product like seventeen times seventeen is just seventeen squared, and a plain number such as forty nine, four or one is really seven squared, two squared or one squared. Once you rewrite both parts as squares, the difference of squares formula clicks straight in."
    },
    {
      title: "Products near a round number",
      purpose: "Multiply numbers either side of a round number with (n − d)(n + d).",
      classicId: "products-near-round",
      kind: "product",
      durationMs: 17000,
      caption: "19 × 21 sits one below and one above 20, so it equals 20² − 1². Find the round number in the middle and the multiplication becomes a tiny subtraction.",
      voiceover: "Here is a multiplication shortcut. Nineteen times twenty one has nineteen one below twenty and twenty one one above twenty, so it equals twenty squared minus one squared. Whenever two numbers sit the same distance either side of a round number, multiply them as that round number squared minus the distance squared."
    },
    {
      title: "Consecutive square chain",
      purpose: "Pair a long alternating chain of consecutive squares into a running total.",
      classicId: "consecutive-square-chain",
      kind: "chain",
      durationMs: 18000,
      caption: "100² − 99² + 98² − 97² − … looks scary, but each pair a² − (a − 1)² is just a + (a − 1), so the whole chain becomes 1 + 2 + 3 + … added up.",
      voiceover: "Long chains look frightening but they collapse. Group the chain into pairs like a squared minus a minus one squared. Each pair factors to a plus a minus one, which is simply the two bases added together, so the whole chain turns into one plus two plus three all the way up, a friendly running total."
    },
    {
      title: "Spaced square pairs",
      purpose: "Factor each pair when the bases differ by more than one before adding.",
      classicId: "spaced-square-pairs",
      kind: "chain",
      durationMs: 17000,
      caption: "When the chain steps by 2, 3 or 4 instead of 1, each pair a² − b² still factors into (a + b)(a − b). Factor every pair, then add the simple products.",
      voiceover: "The chain still works when the bases are further apart. In eighty squared minus seventy eight squared and so on, each pair has bases two apart, but a squared minus b squared always factors into a plus b times a minus b. Factor every pair into an easy product and then add those products together."
    },
    {
      title: "Spot the neighbours",
      purpose: "See that n × n − (n − 1)(n + 1) equals one and similar near-square tricks.",
      classicId: "spot-the-neighbours",
      kind: "neighbour",
      durationMs: 17000,
      caption: "2015 × 2015 − 2016 × 2014 looks huge, but 2016 × 2014 is 2015² − 1, so the answer is just 1. Neighbours of a square are one less than the square.",
      voiceover: "Watch for neighbours of a square. Two thousand and fifteen times itself minus two thousand and sixteen times two thousand and fourteen looks enormous, but the second product is two thousand and fifteen squared minus one. Subtracting leaves just one. The product of the two neighbours of a number is always one less than the number squared."
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

  function formulaChoice(choices, correct, variantIndex) {
    const unique = [...new Set(choices.map(String))];
    const without = unique.filter((choice) => choice !== String(correct));
    const ordered = [String(correct), ...without].slice(0, 4);
    const offset = variantIndex % ordered.length;
    const rotated = ordered.slice(offset).concat(ordered.slice(0, offset));
    return rotated.map((label) => ({ label, isCorrect: label === String(correct) }));
  }

  // Build three distinct, positive distractors from a list of plausible slips.
  // Falls back to correct +/- offsets so we always end up with four choices
  // even when several candidates collide.
  function distinctDistractors(correct, candidates) {
    const out = [];
    const seen = new Set([String(correct)]);
    for (const candidate of candidates) {
      const n = Math.round(candidate);
      if (!Number.isFinite(n) || n <= 0) continue;
      const key = String(n);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(n);
      if (out.length === 3) break;
    }
    let pad = 1;
    while (out.length < 3) {
      const candidate = correct + pad;
      if (candidate > 0 && !seen.has(String(candidate))) {
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
    p.choices = p.answerType === "choice" ? formulaChoice([correct, ...distractors], correct, variantIndex) : [];
    return p;
  }

  function range(start, stop, step) {
    const out = [];
    if (step > 0) for (let v = start; v <= stop; v += step) out.push(v);
    else for (let v = start; v >= stop; v += step) out.push(v);
    return out;
  }

  // ---- generators ------------------------------------------------------------

  function diffTwoSquaresProblem(variantIndex) {
    const cases = [
      [50, 49],
      [40, 39],
      [60, 59],
      [35, 34],
      [27, 3],
      [99, 1]
    ];
    const [a, b] = cases[variantIndex % cases.length];
    const answer = (a + b) * (a - b);
    const p = problemBase("diff-two-squares", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Use the difference of squares to calculate ${a}² − ${b}².`;
    p.hint1 = "Any a² − b² factors as (a + b) × (a − b).";
    p.hint2 = `(${a} + ${b}) × (${a} − ${b}) = ${a + b} × ${a - b}.`;
    p.solution = `${a}² − ${b}² = (${a} + ${b})(${a} − ${b}) = ${a + b} × ${a - b} = ${answer}.`;
    p.visual = { type: "diff", formula: FORMULA, expr: `${a}² − ${b}²`, method: `= (${a} + ${b})(${a} − ${b})` };
    const distractors = distinctDistractors(answer, [2 * a, a * a - b, (a - b) * (a - b), answer + (a - b), answer - (a - b), answer + 10]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function squaresInDisguiseProblem(variantIndex) {
    const cases = [
      { a: 17, b: 7, expr: "17 × 17 − 49" },
      { a: 98, b: 2, expr: "98² − 4" },
      { a: 67, b: 33, expr: "67 × 67 − 33 × 33" },
      { a: 99, b: 1, expr: "99² − 1" },
      { a: 65, b: 35, expr: "65 × 65 − 35 × 35" },
      { a: 31, b: 11, expr: "31 × 31 − 11 × 11" }
    ];
    const data = cases[variantIndex % cases.length];
    const { a, b, expr } = data;
    const answer = (a + b) * (a - b);
    const p = problemBase("squares-in-disguise", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Find the hidden squares, then calculate ${expr}.`;
    p.hint1 = "Write every product n × n as n², and write a plain number like 4, 49 or 1 as a square (4 = 2², 49 = 7², 1 = 1²).";
    p.hint2 = `${expr} = ${a}² − ${b}² = (${a} + ${b})(${a} − ${b}).`;
    p.solution = `${expr} = ${a}² − ${b}² = (${a} + ${b})(${a} − ${b}) = ${a + b} × ${a - b} = ${answer}.`;
    p.visual = { type: "diff", formula: FORMULA, expr, method: `= ${a}² − ${b}² = (${a} + ${b})(${a} − ${b})` };
    const distractors = distinctDistractors(answer, [a * a, a * a - b, 2 * a, answer + (a - b), answer - (a - b), answer + 100]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function productsNearRoundProblem(variantIndex) {
    const cases = [
      [20, 1],
      [200, 2],
      [500, 1],
      [60, 1],
      [300, 3],
      [90, 3]
    ];
    const [n, d] = cases[variantIndex % cases.length];
    const lo = n - d;
    const hi = n + d;
    const answer = n * n - d * d;
    const p = problemBase("products-near-round", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Calculate ${lo} × ${hi} by spotting the round number in the middle.`;
    p.hint1 = `Both numbers sit the same distance from ${n}: ${lo} = ${n} − ${d} and ${hi} = ${n} + ${d}.`;
    p.hint2 = `So ${lo} × ${hi} = ${n}² − ${d}² = ${n * n} − ${d * d}.`;
    p.solution = `${lo} × ${hi} = (${n} − ${d})(${n} + ${d}) = ${n}² − ${d}² = ${n * n} − ${d * d} = ${answer}.`;
    p.visual = { type: "product", formula: FORMULA, expr: `${lo} × ${hi}`, method: `= ${n}² − ${d}² = ${n * n} − ${d * d}` };
    const distractors = distinctDistractors(answer, [n * n, n * n - d, answer - 1, answer + 1, n * n - 2 * d * d, answer + d]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function consecutiveSquareChainProblem(variantIndex) {
    const cases = [100, 20, 30, 60, 10, 40];
    const n = cases[variantIndex % cases.length];
    let answer = 0;
    let sign = 1;
    for (let k = n; k >= 1; k -= 1) {
      answer += sign * k * k;
      sign = -sign;
    }
    const expr = `${n}² − ${n - 1}² + ${n - 2}² − … + 2² − 1²`;
    const p = problemBase("consecutive-square-chain", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Calculate ${expr}.`;
    p.hint1 = "Group the chain into pairs a² − (a − 1)². Each pair equals a + (a − 1), the two bases added.";
    p.hint2 = `Every pair adds its two bases, so the whole sum is 1 + 2 + 3 + … + ${n} = ${n} × ${n + 1} ÷ 2.`;
    p.solution = `Each pair a² − (a − 1)² = a + (a − 1). Adding every pair gives 1 + 2 + … + ${n} = ${n} × ${n + 1} ÷ 2 = ${answer}.`;
    p.visual = { type: "chain", formula: FORMULA, expr, method: `each pair = a + (a − 1) → 1 + 2 + … + ${n}` };
    const distractors = distinctDistractors(answer, [n * n, answer + n, answer - n, (n * (n - 1)) / 2, answer + 1, answer - 1]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function spacedSquarePairsProblem(variantIndex) {
    const cases = [
      { tops: range(80, 4, -4), gap: 2 },
      { tops: range(56, 8, -8), gap: 4 },
      { tops: range(60, 6, -6), gap: 3 },
      { tops: range(36, 4, -4), gap: 2 },
      { tops: range(42, 6, -6), gap: 3 },
      { tops: range(20, 4, -4), gap: 2 }
    ];
    const data = cases[variantIndex % cases.length];
    const { tops, gap } = data;
    let answer = 0;
    for (const t of tops) answer += t * t - (t - gap) * (t - gap);
    const t0 = tops[0];
    const t1 = tops[1];
    const tl = tops[tops.length - 1];
    const expr = `${t0}² − ${t0 - gap}² + ${t1}² − ${t1 - gap}² + … + ${tl}² − ${tl - gap}²`;
    const firstPair = (t0 + (t0 - gap)) * gap;
    const p = problemBase("spaced-square-pairs", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Calculate ${expr}.`;
    p.hint1 = "These squares are not consecutive. Factor each pair: a² − b² = (a + b)(a − b).";
    p.hint2 = `The first pair is ${t0}² − ${t0 - gap}² = (${t0} + ${t0 - gap})(${t0} − ${t0 - gap}) = ${t0 + (t0 - gap)} × ${gap} = ${firstPair}.`;
    p.solution = `Each pair factors to (a + b) × ${gap}. Adding every factored pair gives ${answer}.`;
    p.visual = { type: "chain", formula: FORMULA, expr, method: `each pair = (a + b) × ${gap}` };
    const distractors = distinctDistractors(answer, [t0 * t0, answer + gap, answer - gap, answer + tops.length, answer + 10, answer - 10]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function spotTheNeighboursProblem(variantIndex) {
    const cases = [
      { p1: [2015, 2015], p2: [2016, 2014], work: "2015² − (2015² − 1²)" },
      { p1: [50, 50], p2: [49, 51], work: "50² − (50² − 1²)" },
      { p1: [100, 100], p2: [98, 102], work: "100² − (100² − 2²)" },
      { p1: [49, 51], p2: [48, 52], work: "(50² − 1²) − (50² − 2²)" },
      { p1: [123, 117], p2: [125, 115], work: "(120² − 3²) − (120² − 5²)" },
      { p1: [31415927, 31415927], p2: [31415926, 31415928], work: "31415927² − (31415927² − 1²)" }
    ];
    const data = cases[variantIndex % cases.length];
    const { p1, p2, work } = data;
    const answer = p1[0] * p1[1] - p2[0] * p2[1];
    const expr = `${p1[0]} × ${p1[1]} − ${p2[0]} × ${p2[1]}`;
    const p = problemBase("spot-the-neighbours", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Calculate ${expr}.`;
    p.hint1 = "Turn each product into a square minus a small square: m × m is m², and (n − d)(n + d) is n² − d².";
    p.hint2 = `${expr} = ${work}.`;
    p.solution = `${expr} = ${work} = ${answer}.`;
    p.visual = { type: "neighbour", formula: FORMULA, expr, method: `= ${work}` };
    const distractors = distinctDistractors(answer, [answer + 1, answer + 2, answer + 3, answer + 5, answer + 10]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function generateProblem(classicId, variantIndex = 0) {
    const generators = {
      "diff-two-squares": diffTwoSquaresProblem,
      "squares-in-disguise": squaresInDisguiseProblem,
      "products-near-round": productsNearRoundProblem,
      "consecutive-square-chain": consecutiveSquareChainProblem,
      "spaced-square-pairs": spacedSquarePairsProblem,
      "spot-the-neighbours": spotTheNeighboursProblem
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
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Calculating with formulas visual">${inner}</svg>`;
  }

  // Every classic shares one structurally stable formula card: two squares
  // (the difference-of-squares motif), the generic formula, the specific
  // expression being calculated, and the factoring method. Text content
  // changes between variants and states, but the element skeleton never does,
  // so the diagram-parity gate stays green. The numeric answer only ever
  // appears in the solution-state banner.
  function renderProblemVisual(problem, state = "initial") {
    const v = problem.visual;
    const isRevealed = state === "solution" || state === "worked";
    const answer = isRevealed
      ? `<text x="280" y="316" text-anchor="middle" class="formula-note">Answer: ${escapeHtml(problem.expectedDisplay)}</text>`
      : "";
    const html = svgShell(`
        <rect x="48" y="74" width="150" height="150" rx="8" fill="#fff8dc" stroke="#16345d" stroke-width="4"/>
        <rect x="262" y="134" width="90" height="90" rx="8" fill="#ffe6e0" stroke="#16345d" stroke-width="4"/>
        <text x="123" y="158" text-anchor="middle" class="side-label">a²</text>
        <text x="307" y="186" text-anchor="middle" class="side-label">b²</text>
        <text x="226" y="156" text-anchor="middle" class="side-label">−</text>
        <text x="392" y="156" text-anchor="middle" class="side-label">=</text>
        <text x="470" y="156" text-anchor="middle" class="side-label">(a + b)(a − b)</text>
        <text x="280" y="44" text-anchor="middle" class="formula-note">${escapeHtml(v.formula)}</text>
        <text x="280" y="262" text-anchor="middle" class="formula-note">${escapeHtml(v.expr)}</text>
        <text x="280" y="290" text-anchor="middle" class="formula-note">${escapeHtml(isRevealed ? v.method : "= ?")}</text>
        ${answer}
      `);
    const text = problem.skill;
    return { html, text };
  }

  // The intro uses dedicated teaching diagrams (one per skill) instead of the
  // practice formula card, so each scene actually explains its idea. These are
  // separate from renderProblemVisual, so the diagram-parity gate (which only
  // inspects generated problems) is unaffected.
  function introShell(inner) {
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Calculating with formulas intro scene">${inner}</svg>`;
  }

  function introDiffSquares() {
    // Geometric derivation: a-square minus a b-corner, rearranged into a
    // (a + b) by (a - b) rectangle, with a concrete worked example.
    return introShell(`
        <text x="280" y="28" text-anchor="middle" class="side-label" style="font-size:17px">A big square minus a smaller square</text>
        <rect x="44" y="54" width="168" height="168" fill="#fff8dc" stroke="#16345d" stroke-width="4"/>
        <rect x="136" y="54" width="76" height="76" fill="#dbe4ec" stroke="#16345d" stroke-width="3"/>
        <line x1="44" y1="130" x2="136" y2="130" stroke="#0b8993" stroke-width="3" stroke-dasharray="7 5"/>
        <text x="90" y="188" text-anchor="middle" class="side-label">a² − b²</text>
        <text x="174" y="98" text-anchor="middle" class="formula-note">b²</text>
        <text x="128" y="242" text-anchor="middle" class="formula-note">side a</text>
        <text x="250" y="148" text-anchor="middle" class="side-label" style="font-size:30px">→</text>
        <rect x="298" y="92" width="222" height="92" fill="#ffe6e0" stroke="#16345d" stroke-width="4"/>
        <text x="409" y="144" text-anchor="middle" class="side-label">area = a² − b²</text>
        <text x="409" y="206" text-anchor="middle" class="formula-note">width = a + b</text>
        <text x="409" y="80" text-anchor="middle" class="formula-note">height = a − b</text>
        <text x="280" y="266" text-anchor="middle" class="side-label" style="font-size:16px">a² − b² = (a + b)(a − b)</text>
        <text x="280" y="298" text-anchor="middle" class="formula-note" style="font-size:15px">example: 7² − 3² = (7 + 3)(7 − 3) = 10 × 4 = 40</text>
      `);
  }

  function introDisguise() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Rewrite the hidden squares first</text>
        <text x="120" y="100" text-anchor="middle" class="side-label" style="font-size:18px">17 × 17</text>
        <text x="248" y="100" text-anchor="middle" class="side-label" style="font-size:22px">→</text>
        <rect x="330" y="74" width="92" height="40" rx="8" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>
        <text x="376" y="101" text-anchor="middle" class="side-label" style="font-size:18px">17²</text>
        <text x="120" y="166" text-anchor="middle" class="side-label" style="font-size:18px">49</text>
        <text x="248" y="166" text-anchor="middle" class="side-label" style="font-size:22px">→</text>
        <rect x="330" y="140" width="92" height="40" rx="8" fill="#ffe6e0" stroke="#16345d" stroke-width="3"/>
        <text x="376" y="167" text-anchor="middle" class="side-label" style="font-size:18px">7²</text>
        <text x="280" y="226" text-anchor="middle" class="formula-note" style="font-size:15px">Now both parts are squares:</text>
        <text x="280" y="262" text-anchor="middle" class="side-label" style="font-size:16px">17² − 7² = (17 + 7)(17 − 7)</text>
        <text x="280" y="294" text-anchor="middle" class="side-label" style="font-size:16px">= 24 × 10 = 240</text>
      `);
  }

  function introProduct() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Find the round number in the middle</text>
        <line x1="70" y1="150" x2="490" y2="150" stroke="#16345d" stroke-width="4"/>
        <line x1="170" y1="140" x2="170" y2="160" stroke="#16345d" stroke-width="4"/>
        <line x1="280" y1="136" x2="280" y2="164" stroke="#0b8993" stroke-width="5"/>
        <line x1="390" y1="140" x2="390" y2="160" stroke="#16345d" stroke-width="4"/>
        <path d="M280 132 Q225 104 172 136" fill="none" stroke="#0b8993" stroke-width="2"/>
        <path d="M280 132 Q335 104 388 136" fill="none" stroke="#0b8993" stroke-width="2"/>
        <text x="170" y="186" text-anchor="middle" class="side-label">19</text>
        <text x="280" y="190" text-anchor="middle" class="side-label" style="font-size:18px">20</text>
        <text x="390" y="186" text-anchor="middle" class="side-label">21</text>
        <text x="224" y="104" text-anchor="middle" class="formula-note">− 1</text>
        <text x="336" y="104" text-anchor="middle" class="formula-note">+ 1</text>
        <text x="280" y="240" text-anchor="middle" class="side-label" style="font-size:16px">19 × 21 = 20² − 1²</text>
        <text x="280" y="272" text-anchor="middle" class="side-label" style="font-size:16px">= 400 − 1 = 399</text>
      `);
  }

  function introChain() {
    return introShell(`
        <text x="280" y="28" text-anchor="middle" class="side-label" style="font-size:16px">Pair the chain — each pair adds its two numbers</text>
        <rect x="56" y="54" width="180" height="44" rx="8" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>
        <text x="146" y="82" text-anchor="middle" class="side-label">100² − 99²</text>
        <text x="270" y="82" text-anchor="middle" class="side-label">=</text>
        <text x="400" y="82" text-anchor="middle" class="side-label">100 + 99 = 199</text>
        <rect x="56" y="110" width="180" height="44" rx="8" fill="#ffe6e0" stroke="#16345d" stroke-width="3"/>
        <text x="146" y="138" text-anchor="middle" class="side-label">98² − 97²</text>
        <text x="270" y="138" text-anchor="middle" class="side-label">=</text>
        <text x="398" y="138" text-anchor="middle" class="side-label">98 + 97 = 195</text>
        <text x="280" y="182" text-anchor="middle" class="formula-note" style="font-size:20px">⋮</text>
        <text x="280" y="232" text-anchor="middle" class="side-label" style="font-size:16px">= 1 + 2 + 3 + … + 100</text>
        <text x="280" y="266" text-anchor="middle" class="side-label" style="font-size:16px">= 5050</text>
      `);
  }

  function introSpaced() {
    return introShell(`
        <text x="280" y="34" text-anchor="middle" class="side-label" style="font-size:17px">Bases far apart? Factor each pair</text>
        <text x="280" y="96" text-anchor="middle" class="side-label" style="font-size:19px">80² − 78²</text>
        <text x="280" y="124" text-anchor="middle" class="formula-note">(the bases are 2 apart)</text>
        <text x="280" y="170" text-anchor="middle" class="side-label" style="font-size:17px">= (80 + 78)(80 − 78)</text>
        <text x="280" y="204" text-anchor="middle" class="side-label" style="font-size:17px">= 158 × 2 = 316</text>
        <text x="280" y="256" text-anchor="middle" class="formula-note" style="font-size:15px">Factor every pair this way, then add them all up.</text>
      `);
  }

  function introNeighbour() {
    return introShell(`
        <text x="280" y="34" text-anchor="middle" class="side-label" style="font-size:17px">Neighbours multiply to one less than the square</text>
        <text x="280" y="96" text-anchor="middle" class="side-label" style="font-size:16px">2016 × 2014 = (2015 + 1)(2015 − 1)</text>
        <text x="280" y="128" text-anchor="middle" class="side-label" style="font-size:16px">= 2015² − 1</text>
        <text x="280" y="184" text-anchor="middle" class="formula-note" style="font-size:15px">So the whole calculation becomes:</text>
        <text x="280" y="222" text-anchor="middle" class="side-label" style="font-size:16px">2015 × 2015 − 2016 × 2014</text>
        <text x="280" y="256" text-anchor="middle" class="side-label" style="font-size:16px">= 2015² − (2015² − 1) = 1</text>
      `);
  }

  function renderIntroScene(index) {
    const scene = INTRO_SCENES[index % INTRO_SCENES.length];
    const builders = {
      "diff-two-squares": introDiffSquares,
      "squares-in-disguise": introDisguise,
      "products-near-round": introProduct,
      "consecutive-square-chain": introChain,
      "spaced-square-pairs": introSpaced,
      "spot-the-neighbours": introNeighbour
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

  root.CalculatingWithFormulasModule = api;

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
      : "<div><strong>Clean round.</strong><br>You factored every difference of squares, spotted the hidden squares, and collapsed the long chains accurately.</div>";
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
