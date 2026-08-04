(function (root) {
  "use strict";

  const ROUND_LENGTH = 6;
  const INTRO_SCENE_MS = 9000;

  // Source: Year 6 "M" workbook, Lesson 25 "Inequalities".
  // Printed pages 90-103 (PDF pages 100-113). The lesson teaches the four
  // inequality symbols, the properties of inequalities (adding/subtracting the
  // same value, and multiplying/dividing by a positive number, keep the
  // direction), solving linear inequalities for the smallest or largest
  // integer, and turning word problems into inequalities. All worked examples
  // use positive coefficients, so the inequality direction never flips.
  const SRC = "Book 90-103 / PDF 100-113";

  const CLASSICS = [
    { id: "recognise-symbols", nickname: "Recognise Inequality Symbols", skill: "Read the four symbols: < and > are strict, while ≤ and ≥ also allow the two sides to be equal.", sourcePages: SRC },
    { id: "inequality-properties", nickname: "Inequality Properties", skill: "Adding or subtracting the same value, or multiplying or dividing by a positive number, keeps an inequality pointing the same way.", sourcePages: SRC },
    { id: "solve-smallest", nickname: "Smallest Integer Solution", skill: "Solve a linear inequality like an equation, then take the smallest integer, remembering a strict > excludes the boundary value.", sourcePages: SRC },
    { id: "solve-largest", nickname: "Largest Integer Solution", skill: "Solve a linear inequality like an equation, then take the largest integer, remembering a strict < excludes the boundary value.", sourcePages: SRC },
    { id: "word-minimum", nickname: "Inequality Word Problems", skill: "Translate a real-world 'at least / more than' situation into an inequality, solve it, then round up to the smallest whole number of items.", sourcePages: SRC },
    { id: "count-solutions", nickname: "Count Integer Solutions", skill: "Solve a linear inequality to find the range, then count how many positive whole numbers fall inside that range.", sourcePages: SRC }
  ];

  const CLASSIC_IDS = CLASSICS.map((classic) => classic.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((classic) => [classic.id, classic]));

  // Maps each classic to a registry skill so the skill-coverage gate can
  // verify the bank covers every skill the registry promises.
  // Registry skills: ["Recognise inequality symbols", "Inequality properties",
  // "Smallest integer solution", "Largest integer solution",
  // "Inequality word problems", "Count integer solutions"].
  const CLASSIC_SKILLS = {
    "recognise-symbols": "Recognise inequality symbols",
    "inequality-properties": "Inequality properties",
    "solve-smallest": "Smallest integer solution",
    "solve-largest": "Largest integer solution",
    "word-minimum": "Inequality word problems",
    "count-solutions": "Count integer solutions"
  };

  const SOURCE_COVERAGE = {
    "recognise-symbols": ["Learn & Discover 1 (which statement is true?)", "Symbol meanings <, >, ≤, ≥", "75 ≤ 75 is true because equality is allowed"],
    "inequality-properties": ["Learn & Discover 2 (a + 3 vs b + 3)", "Learn & Discover 3 (3a vs 3b, a vs 5b)", "add/subtract same; multiply/divide by a positive"],
    "solve-smallest": ["Exploration 1 (7a − 12 > 51)", "Exploration 2 (4(x+10) > 100)", "Reasoning 'Is Pip correct?' boundary trap; Homework"],
    "solve-largest": ["Exploration 1 (14b + 6 < 4b + 150)", "Practice (3(m+2) − 8 < 20)", "Teaching Time (3y + 11 ≤ 56); Homework"],
    "word-minimum": ["Exploration 3 (Zoey's lollipops)", "Exploration 4 (farmers' profit)", "Practice / Homework (purifiers, stamps, days)"],
    "count-solutions": ["Further Basic 2 (15x − 64 < 9x + 8)", "Range of positive integer solutions", "Extensive exercises"]
  };

  const INTRO_SCENES = [
    {
      title: "Recognise inequality symbols",
      purpose: "Read the four symbols and know that ≤ and ≥ also allow equality.",
      classicId: "recognise-symbols",
      kind: "recognise",
      durationMs: 17000,
      caption: "There are four symbols: < (less than), > (greater than), ≤ (less than or equal to), ≥ (greater than or equal to). The line under ≤ and ≥ means the two sides are allowed to be equal, so 75 ≤ 75 is true.",
      voiceover: "There are four inequality symbols to know. Less than, greater than, less than or equal to, and greater than or equal to. The little line underneath the last two means equal is allowed, so a statement like seventy five is less than or equal to seventy five is actually true, because the two sides are equal."
    },
    {
      title: "Inequality properties",
      purpose: "Do the same thing to both sides and the arrow keeps its direction.",
      classicId: "inequality-properties",
      kind: "properties",
      durationMs: 17000,
      caption: "Whatever you do to one side, do to the other. Adding or subtracting the same number, or multiplying or dividing by a positive number, keeps the inequality pointing the same way: if a > b then a + 3 > b + 3, and if a < b then 3a < 3b.",
      voiceover: "Inequalities behave like balance scales. Whatever you do to one side you must do to the other. Adding or subtracting the same number keeps the arrow pointing the same way, and so does multiplying or dividing both sides by a positive number. So if a is greater than b, then a plus three is still greater than b plus three."
    },
    {
      title: "Smallest integer solution",
      purpose: "Solve like an equation, then watch the boundary for strict > .",
      classicId: "solve-smallest",
      kind: "smallest",
      durationMs: 18000,
      caption: "Solve the inequality just like an equation to get something like x > 9. Then pick the smallest whole number that works. Because > is strict, 9 itself does not count, so the smallest integer is 10.",
      voiceover: "To find the smallest whole number, solve the inequality exactly as if it were an equation, collecting the letters on one side and the numbers on the other. Suppose you reach x is greater than nine. Because the symbol is strict greater than, nine itself does not count, so the smallest whole number that works is ten."
    },
    {
      title: "Largest integer solution",
      purpose: "Solve, then step just inside the boundary for the largest value.",
      classicId: "solve-largest",
      kind: "largest",
      durationMs: 18000,
      caption: "Solve to get something like x ≤ 8 or x < 12. For ≤ the boundary is included, so the largest is 8; for a strict < 12 the boundary is excluded, so the largest whole number is 11.",
      voiceover: "Finding the largest whole number works the same way. Solve the inequality to get something like x is less than or equal to eight, where eight itself is allowed and is the largest. But for a strict less than twelve, twelve is not allowed, so the largest whole number that fits is eleven, one step inside the boundary."
    },
    {
      title: "Inequality word problems",
      purpose: "Turn an 'at least' story into an inequality and round up.",
      classicId: "word-minimum",
      kind: "word",
      durationMs: 18000,
      caption: "Read the story and build an inequality. Zoey needs 33 × 5 = 165 lollipops, has 12, and buys packs of 7, so 12 + 7p ≥ 165, giving p ≥ 21.86. You cannot buy part of a pack, so round up to 22 packs.",
      voiceover: "Word problems become inequalities. Zoey wants to give thirty three friends at least five lollipops each, so she needs one hundred and sixty five. She already has twelve and buys packs of seven, which gives twelve plus seven p is at least one hundred and sixty five. Solving gives p at least about twenty one point nine, and since you cannot buy part of a pack you round up to twenty two."
    },
    {
      title: "Count integer solutions",
      purpose: "Solve for the range, then count the whole numbers inside it.",
      classicId: "count-solutions",
      kind: "count",
      durationMs: 17000,
      caption: "Solve to find the range, like 6x < 72 giving x < 12. Then count the positive whole numbers that fit: 1, 2, 3, all the way to 11, which is 11 different positive integers.",
      voiceover: "Some questions ask how many whole numbers fit. Solve the inequality to find the range. For example fifteen x minus sixty four less than nine x plus eight becomes six x less than seventy two, so x is less than twelve. The positive whole numbers that fit are one, two, three, up to eleven, which is eleven values in total."
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

  // ---- inequality helpers ----------------------------------------------------

  function opTrue(a, op, b) {
    if (op === "<") return a < b;
    if (op === ">") return a > b;
    if (op === "≤") return a <= b;
    if (op === "≥") return a >= b;
    return false;
  }

  // Smallest integer x satisfying A*x > C (strict) or A*x >= C (A > 0).
  function minInt(A, C, strict) {
    const r = C / A;
    return strict ? Math.floor(r) + 1 : Math.ceil(r);
  }

  // Largest integer x satisfying A*x < C (strict) or A*x <= C (A > 0).
  function maxInt(A, C, strict) {
    const r = C / A;
    return strict ? Math.ceil(r) - 1 : Math.floor(r);
  }

  // Count of positive integers x (x >= 1) satisfying A*x < C (strict) or <= C.
  function countPositiveLess(A, C, strict) {
    return Math.max(0, maxInt(A, C, strict));
  }

  function fmtNum(x) {
    if (Number.isInteger(x)) return String(x);
    return String(Math.round(x * 100) / 100);
  }

  function pf2Choice(choices, correct, variantIndex) {
    const unique = [...new Set(choices.map(String))];
    const without = unique.filter((choice) => choice !== String(correct));
    const ordered = [String(correct), ...without].slice(0, 4);
    const offset = variantIndex % ordered.length;
    const rotated = ordered.slice(offset).concat(ordered.slice(0, offset));
    return rotated.map((label) => ({ label, isCorrect: label === String(correct) }));
  }

  // Build three distinct, non-negative numeric distractors from a list of
  // plausible slips. Falls back to correct + offsets so we always get four
  // choices even when several candidates collide.
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
    recognise: "≤ and ≥ allow equals; < and > are strict (no equals)",
    properties: "add, subtract, or × ÷ by a positive — the arrow keeps its direction",
    smallest: "solve like an equation, then check if the boundary is included",
    largest: "solve like an equation, then step just inside the boundary",
    word: "turn the words into an inequality, solve, then round up to a whole item",
    count: "solve for the range, then count the whole numbers inside"
  };

  // ---- generators ------------------------------------------------------------

  function recogniseSymbolsProblem(variantIndex) {
    const cases = [
      [[75, "≤", 75], [27, ">", 72], [25, "≤", 1], [23, "≥", 32]],
      [[8, "≥", 8], [9, "<", 4], [5, "≥", 12], [10, ">", 20]],
      [[14, ">", 9], [6, "≥", 13], [3, "<", 3], [20, "≤", 11]],
      [[12, "≤", 30], [7, ">", 7], [40, "<", 8], [5, "≥", 19]],
      [[18, "≥", 5], [2, ">", 11], [9, "≤", 4], [30, "<", 13]],
      [[50, "<", 60], [4, "≥", 9], [8, ">", 15], [7, "≤", 6]]
    ];
    const rows = cases[variantIndex % cases.length];
    const labels = rows.map(([a, op, b]) => `${a} ${op} ${b}`);
    const trueIdx = rows.findIndex(([a, op, b]) => opTrue(a, op, b));
    const correct = labels[trueIdx];
    const distractors = labels.filter((_, i) => i !== trueIdx);
    const p = problemBase("recognise-symbols", variantIndex, "choice");
    p.prompt = `Exactly one of these statements is true. Which one?  ${labels.join("   ·   ")}`;
    p.hint1 = "Remember < means strictly less than and > strictly greater than, while ≤ and ≥ also allow the two sides to be equal.";
    p.hint2 = `Check each statement. A statement like n ≤ n is true because the two sides are equal.`;
    p.solution = `${correct} is the true statement (the others are false).`;
    p.visual = { kind: "recognise", principle: PRINCIPLE.recognise, expr: "which row is true?", detail: `${correct} is true` };
    return finishChoice(p, correct, distractors, variantIndex);
  }

  function inequalityPropertiesProblem(variantIndex) {
    const cases = [
      { premise: "a > b", expr: "a + 3 ▢ b + 3", answer: ">" },
      { premise: "a < b", expr: "a − 2 ▢ b − 2", answer: "<" },
      { premise: "a < b", expr: "3a ▢ 3b", answer: "<" },
      { premise: "a > b", expr: "5a ▢ 5b", answer: ">" },
      { premise: "2a < 10b", expr: "a ▢ 5b", answer: "<" },
      { premise: "a > b", expr: "a − 7 ▢ b − 7", answer: ">" }
    ];
    const data = cases[variantIndex % cases.length];
    const filled = data.expr.replace("▢", data.answer);
    const p = problemBase("inequality-properties", variantIndex, "choice");
    p.prompt = `If ${data.premise}, fill in the blank with < or > :   ${data.expr.replace("▢", "____")}`;
    p.hint1 = "Doing the same thing to both sides keeps the inequality pointing the same way (as long as you only multiply or divide by a positive number).";
    p.hint2 = `Start from ${data.premise} and apply the same change to each side.`;
    p.solution = `Doing the same to both sides of ${data.premise} gives ${filled}, so the blank is ${data.answer}.`;
    p.visual = { kind: "properties", principle: PRINCIPLE.properties, expr: "same step on both sides — which way does the arrow point?", detail: `${data.premise}  ⟹  ${filled}` };
    return finishChoice(p, data.answer, [">", "<", "≤", "≥"].filter((s) => s !== data.answer), variantIndex);
  }

  function solveSmallestProblem(variantIndex) {
    const cases = [
      { display: "7a − 12 > 51", varName: "a", A: 7, C: 63, strict: true },
      { display: "12c − 79 ≥ 8c − 43", varName: "c", A: 4, C: 36, strict: false },
      { display: "4(x + 10) > 22 + 78", varName: "x", A: 4, C: 60, strict: true },
      { display: "300k + 80(20 − k) > 2100", varName: "k", A: 220, C: 500, strict: true },
      { display: "5p + 7 + 9p ≥ 210", varName: "p", A: 14, C: 203, strict: false },
      { display: "9x − 43 > 4x − 1", varName: "x", A: 5, C: 42, strict: true }
    ];
    const data = cases[variantIndex % cases.length];
    const op = data.strict ? ">" : "≥";
    const answer = minInt(data.A, data.C, data.strict);
    const p = problemBase("solve-smallest", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `${data.varName} is an integer with ${data.display}. What is the smallest value of ${data.varName}?`;
    p.hint1 = "Solve it like an equation: collect the letters on one side and the numbers on the other.";
    p.hint2 = `You should reach ${data.A}${data.varName} ${op} ${data.C}, then divide by ${data.A}.`;
    p.solution = `${data.display} gives ${data.A}${data.varName} ${op} ${data.C}, so ${data.varName} ${op} ${fmtNum(data.C / data.A)}. The smallest integer is ${answer}.`;
    p.visual = { kind: "smallest", principle: PRINCIPLE.smallest, expr: data.display, detail: `${data.varName} ${op} ${fmtNum(data.C / data.A)} → smallest = ${answer}` };
    const distractors = distinctDistractors(answer, [answer - 1, answer + 1, answer + 2, answer - 2]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function solveLargestProblem(variantIndex) {
    const cases = [
      { display: "14b + 6 < 4b + 150", varName: "b", A: 10, C: 144, strict: true },
      { display: "6x ≤ 48", varName: "x", A: 6, C: 48, strict: false },
      { display: "3(m + 2) − 8 < 20", varName: "m", A: 3, C: 22, strict: true },
      { display: "3y + 11 ≤ 56", varName: "y", A: 3, C: 45, strict: false },
      { display: "8(2p − 5) < 76", varName: "p", A: 16, C: 116, strict: true },
      { display: "6x + 15 < 3x + 35", varName: "x", A: 3, C: 20, strict: true }
    ];
    const data = cases[variantIndex % cases.length];
    const op = data.strict ? "<" : "≤";
    const answer = maxInt(data.A, data.C, data.strict);
    const p = problemBase("solve-largest", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `${data.varName} is an integer with ${data.display}. What is the largest value of ${data.varName}?`;
    p.hint1 = "Solve it like an equation: collect the letters on one side and the numbers on the other.";
    p.hint2 = `You should reach ${data.A}${data.varName} ${op} ${data.C}, then divide by ${data.A}.`;
    p.solution = `${data.display} gives ${data.A}${data.varName} ${op} ${data.C}, so ${data.varName} ${op} ${fmtNum(data.C / data.A)}. The largest integer is ${answer}.`;
    p.visual = { kind: "largest", principle: PRINCIPLE.largest, expr: data.display, detail: `${data.varName} ${op} ${fmtNum(data.C / data.A)} → largest = ${answer}` };
    const distractors = distinctDistractors(answer, [answer + 1, answer - 1, answer + 2, answer - 2]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function wordMinimumProblem(variantIndex) {
    const cases = [
      { scenario: "Zoey wants to give 33 friends at least 5 lollipops each. She already has 12 lollipops and buys more in packs of 7. What is the smallest number of packs she needs?", model: "12 + 7p ≥ 165", A: 7, C: 153, strict: false },
      { scenario: "James wants to give 6 friends at least 15 stamps each. He has 25 stamps and can buy 8 more each week. What is the least number of weeks he needs?", model: "25 + 8w ≥ 90", A: 8, C: 65, strict: false },
      { scenario: "Emma wants a school bag costing £20 and ten books costing £12 each. She earns £12 a day. What is the minimum number of days to earn enough?", model: "12d ≥ 140", A: 12, C: 140, strict: false },
      { scenario: "A factory buys 15 machines. Machine A makes 700 screws a day and Machine B makes 400. It must make no fewer than 8100 screws a day. At least how many Machine A must it buy?", model: "700a + 400(15 − a) ≥ 8100", A: 300, C: 2100, strict: false },
      { scenario: "There are 10 farmers; each plants 3 acres of eggplant (£800 per acre) or 2 acres of chili (£500 per acre). For a total profit of more than £15600, the minimum number planting eggplant is?", model: "1400e > 5600", A: 1400, C: 5600, strict: true },
      { scenario: "Andy wants a pair of rackets costing £16 and 24 tennis balls costing £5 each. He earns £25 a day. What is the minimum number of days to earn enough?", model: "25d ≥ 136", A: 25, C: 136, strict: false }
    ];
    const data = cases[variantIndex % cases.length];
    const op = data.strict ? ">" : "≥";
    const answer = minInt(data.A, data.C, data.strict);
    const p = problemBase("word-minimum", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = data.scenario;
    p.hint1 = "Write the situation as an inequality, with the unknown number of items as the letter.";
    p.hint2 = `This becomes ${data.model}. Solve it, then round up because you need a whole number of items.`;
    p.solution = `${data.model} simplifies so the unknown ${op} ${fmtNum(data.C / data.A)}. Rounding up to a whole number gives ${answer}.`;
    p.visual = { kind: "word", principle: PRINCIPLE.word, expr: "words → inequality → round up", detail: `${data.model} → ${fmtNum(data.C / data.A)} → ${answer}` };
    const distractors = distinctDistractors(answer, [answer - 1, answer + 1, answer + 2, Math.floor(data.C / data.A)]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function countSolutionsProblem(variantIndex) {
    const cases = [
      { display: "15x − 64 < 9x + 8", A: 6, C: 72 },
      { display: "5x < 37", A: 5, C: 37 },
      { display: "4x + 3 < 43", A: 4, C: 40 },
      { display: "3x − 2 < 28", A: 3, C: 30 },
      { display: "9x < 100", A: 9, C: 100 },
      { display: "2x + 1 < 30", A: 2, C: 29 }
    ];
    const data = cases[variantIndex % cases.length];
    const answer = countPositiveLess(data.A, data.C, true);
    const p = problemBase("count-solutions", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `How many positive integers x satisfy ${data.display}?`;
    p.hint1 = "Solve the inequality to find the range, then list the positive whole numbers that fit.";
    p.hint2 = `This becomes ${data.A}x < ${data.C}, so x < ${fmtNum(data.C / data.A)}. Count from x = 1 upwards.`;
    p.solution = `${data.display} gives ${data.A}x < ${data.C}, so x < ${fmtNum(data.C / data.A)}. The positive integers 1, 2, …, ${answer} all work, which is ${answer} values.`;
    p.visual = { kind: "count", principle: PRINCIPLE.count, expr: data.display, detail: `x < ${fmtNum(data.C / data.A)} → 1 … ${answer} → ${answer} values` };
    const distractors = distinctDistractors(answer, [answer + 1, answer - 1, Math.ceil(data.C / data.A), answer + 2]);
    return finishChoice(p, answer, distractors, variantIndex);
  }

  function generateProblem(classicId, variantIndex = 0) {
    const generators = {
      "recognise-symbols": recogniseSymbolsProblem,
      "inequality-properties": inequalityPropertiesProblem,
      "solve-smallest": solveSmallestProblem,
      "solve-largest": solveLargestProblem,
      "word-minimum": wordMinimumProblem,
      "count-solutions": countSolutionsProblem
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
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Inequalities visual">${inner}</svg>`;
  }

  // Every classic shares one structurally stable "symbol card": two symbol
  // tiles (< and >), a legend, the teaching principle, the specific
  // expression, and a worked detail line. Text content changes between
  // variants and states, but the element skeleton never does, so the
  // diagram-parity gate stays green. The detail line is hidden behind "= ?"
  // and the answer only ever appears in the solution-state banner, so the
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
        <text x="92" y="160" text-anchor="middle" class="side-label" style="font-size:46px">&lt;</text>
        <rect x="416" y="86" width="104" height="104" rx="12" fill="#ffe6e0" stroke="#16345d" stroke-width="4"/>
        <text x="468" y="160" text-anchor="middle" class="side-label" style="font-size:46px">&gt;</text>
        <text x="280" y="118" text-anchor="middle" class="side-label" style="font-size:24px">vs</text>
        <text x="280" y="160" text-anchor="middle" class="formula-note">≤  ≥  &lt;  &gt;</text>
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
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Inequalities intro scene">${inner}</svg>`;
  }

  function introRecognise() {
    return introShell(`
        <text x="280" y="32" text-anchor="middle" class="side-label" style="font-size:17px">Four symbols to know</text>
        <text x="280" y="78" text-anchor="middle" class="side-label" style="font-size:16px">&lt;  less than          &gt;  greater than</text>
        <text x="280" y="112" text-anchor="middle" class="side-label" style="font-size:16px">≤  less or equal     ≥  greater or equal</text>
        <rect x="150" y="138" width="260" height="48" rx="10" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>
        <text x="280" y="168" text-anchor="middle" class="side-label">the line means "equal is allowed"</text>
        <text x="280" y="232" text-anchor="middle" class="side-label" style="font-size:17px">75 ≤ 75 is TRUE</text>
        <text x="280" y="266" text-anchor="middle" class="formula-note" style="font-size:15px">because the two sides are equal</text>
      `);
  }

  function introProperties() {
    return introShell(`
        <text x="280" y="34" text-anchor="middle" class="side-label" style="font-size:17px">Do the same to both sides — the arrow stays</text>
        <rect x="70" y="74" width="200" height="56" rx="10" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>
        <text x="170" y="100" text-anchor="middle" class="side-label">a &gt; b</text>
        <text x="170" y="122" text-anchor="middle" class="formula-note">add 3 to each side</text>
        <rect x="290" y="74" width="200" height="56" rx="10" fill="#ffe6e0" stroke="#16345d" stroke-width="3"/>
        <text x="390" y="108" text-anchor="middle" class="side-label">a + 3 &gt; b + 3</text>
        <text x="280" y="186" text-anchor="middle" class="side-label" style="font-size:16px">a &lt; b   →(× 3)→   3a &lt; 3b</text>
        <text x="280" y="240" text-anchor="middle" class="formula-note" style="font-size:15px">only flips if you × or ÷ by a negative (not here)</text>
      `);
  }

  function introSmallest() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Solve, then check the boundary</text>
        <text x="280" y="74" text-anchor="middle" class="side-label" style="font-size:16px">7a − 12 &gt; 51  →  7a &gt; 63  →  a &gt; 9</text>
        <line x1="60" y1="150" x2="500" y2="150" stroke="#16345d" stroke-width="4"/>
        <circle cx="250" cy="150" r="12" fill="#ffffff" stroke="#16345d" stroke-width="4"/>
        <circle cx="320" cy="150" r="11" fill="#ff7654" stroke="#16345d" stroke-width="3"/>
        <text x="250" y="184" text-anchor="middle" class="side-label">9</text>
        <text x="320" y="184" text-anchor="middle" class="side-label">10</text>
        <text x="250" y="120" text-anchor="middle" class="formula-note">open: 9 excluded</text>
        <text x="280" y="244" text-anchor="middle" class="side-label" style="font-size:17px">smallest integer = 10</text>
      `);
  }

  function introLargest() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Solve, then step inside the boundary</text>
        <text x="280" y="74" text-anchor="middle" class="side-label" style="font-size:16px">6x ≤ 48  →  x ≤ 8</text>
        <line x1="60" y1="150" x2="500" y2="150" stroke="#16345d" stroke-width="4"/>
        <circle cx="360" cy="150" r="12" fill="#ff7654" stroke="#16345d" stroke-width="4"/>
        <text x="360" y="184" text-anchor="middle" class="side-label">8</text>
        <text x="360" y="120" text-anchor="middle" class="formula-note">closed: 8 included</text>
        <text x="280" y="240" text-anchor="middle" class="side-label" style="font-size:17px">largest integer = 8</text>
      `);
  }

  function introWord() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Turn the story into an inequality</text>
        <text x="280" y="74" text-anchor="middle" class="formula-note" style="font-size:15px">Zoey: 33 × 5 = 165 needed, has 12, packs of 7</text>
        <rect x="120" y="96" width="320" height="48" rx="10" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>
        <text x="280" y="126" text-anchor="middle" class="side-label">12 + 7p ≥ 165</text>
        <text x="280" y="188" text-anchor="middle" class="side-label" style="font-size:16px">7p ≥ 153  →  p ≥ 21.86</text>
        <text x="280" y="226" text-anchor="middle" class="formula-note" style="font-size:15px">round up — you can't buy part of a pack</text>
        <text x="280" y="262" text-anchor="middle" class="side-label" style="font-size:17px">22 packs</text>
      `);
  }

  function introCount() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Find the range, then count</text>
        <text x="280" y="74" text-anchor="middle" class="side-label" style="font-size:16px">6x &lt; 72  →  x &lt; 12</text>
        <line x1="60" y1="150" x2="500" y2="150" stroke="#16345d" stroke-width="4"/>
        <circle cx="100" cy="150" r="7" fill="#ff7654"/>
        <circle cx="135" cy="150" r="7" fill="#ff7654"/>
        <circle cx="170" cy="150" r="7" fill="#ff7654"/>
        <circle cx="205" cy="150" r="7" fill="#ff7654"/>
        <circle cx="240" cy="150" r="7" fill="#ff7654"/>
        <circle cx="430" cy="150" r="12" fill="#ffffff" stroke="#16345d" stroke-width="4"/>
        <text x="100" y="180" text-anchor="middle" class="formula-note">1</text>
        <text x="430" y="184" text-anchor="middle" class="side-label">12</text>
        <text x="280" y="222" text-anchor="middle" class="formula-note" style="font-size:15px">positive integers 1, 2, 3, … , 11</text>
        <text x="280" y="258" text-anchor="middle" class="side-label" style="font-size:17px">11 values</text>
      `);
  }

  function renderIntroScene(index) {
    const scene = INTRO_SCENES[index % INTRO_SCENES.length];
    const builders = {
      "recognise-symbols": introRecognise,
      "inequality-properties": introProperties,
      "solve-smallest": introSmallest,
      "solve-largest": introLargest,
      "word-minimum": introWord,
      "count-solutions": introCount
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

  root.InequalitiesModule = api;

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
      : "<div><strong>Clean round.</strong><br>You read the symbols, used the properties, solved for the smallest and largest integers, and turned word problems into inequalities accurately.</div>";
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
