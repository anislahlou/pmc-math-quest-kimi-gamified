(function (root) {
  "use strict";

  // Maps each submodule to its zone-level registry skill. Registry skills
  // for u2t2_units are the five zones the year mission organises around:
  // ["Number zone", "Algebra zone", "Geometry zone",
  //  "Proportion/Data zone", "Exam arena"].
  // Each MODULES entry carries a `zone` field that maps directly to the
  // matching registry skill name (with the punctuation normalised).
  const CLASSIC_SKILLS = {
    "place-value-scales": "Number zone",
    "slick-sums-four-rules": "Number zone",
    "bidmas-powers": "Number zone",
    "fractions-decimals-percentages": "Number zone",
    "number-types-primes": "Number zone",
    "algebra-expressions": "Algebra zone",
    "brackets-formulae-substitution": "Algebra zone",
    "solving-forming-equations": "Algebra zone",
    "angles-shape-facts": "Geometry zone",
    "area-perimeter-units": "Geometry zone",
    "coordinates-area-challenges": "Geometry zone",
    "geometry-equations-challenge": "Geometry zone",
    "ratio-proportion": "Proportion/Data zone",
    "three-d-volume-speed": "Proportion/Data zone",
    "data-handling": "Proportion/Data zone",
    "word-problem-arena": "Exam arena",
    "review-prep-9-challenge": "Exam arena"
  };

  const MODULES = [
    {
      id: "place-value-scales",
      title: "Place Value & Scales",
      zone: "Number Zone",
      source: "U2 Unit 1 notes, Review Prep 1",
      intro: "Big numbers become easier when you know the value of each digit and the landmarks on a scale.",
      skills: ["Large numbers", "Digit value", "Rounding", "Scale arrows"]
    },
    {
      id: "slick-sums-four-rules",
      title: "Slick Sums & Four Rules",
      zone: "Number Zone",
      source: "U2 Unit 1 notes, Review Preps 1, 3, 4",
      intro: "A slick sum means you change the route without changing the answer.",
      skills: ["Rounding and adjusting", "Factors", "Decimals", "Missing values"]
    },
    {
      id: "bidmas-powers",
      title: "BIDMAS & Powers",
      zone: "Number Zone",
      source: "U2 Unit 1 notes, Review Preps 2, 4",
      intro: "BIDMAS is the order your calculation must follow, especially when powers and brackets appear.",
      skills: ["Brackets", "Indices", "Working layout", "Radar checks"]
    },
    {
      id: "fractions-decimals-percentages",
      title: "Fractions, Decimals & Percentages",
      zone: "Number Zone",
      source: "U2 Unit 1 and 3 notes, Review Preps 2, 4, 6",
      intro: "Fractions, decimals, and percentages are three costumes for the same amount.",
      skills: ["Fraction to decimal", "Decimal to fraction", "Percentages", "Simplify"]
    },
    {
      id: "number-types-primes",
      title: "Number Types, Divisibility & Primes",
      zone: "Number Zone",
      source: "U2 Unit 1 and 3 notes, Review Preps 2, 3",
      intro: "Before you calculate, classify the number: factor, multiple, square, cube, triangle, or prime.",
      skills: ["Factors", "Multiples", "Prime checks", "Prime factorisation"]
    },
    {
      id: "algebra-expressions",
      title: "Algebra Expressions",
      zone: "Algebra Zone",
      source: "U2 Unit 1 notes, Review Preps 3, 4",
      intro: "Algebra simplifies by the same four operations as number: add, subtract, multiply, divide.",
      skills: ["Like terms", "Index form", "No times signs", "Word to algebra"]
    },
    {
      id: "brackets-formulae-substitution",
      title: "Brackets, Formulae & Substitution",
      zone: "Algebra Zone",
      source: "U2 Unit 1 and 3 notes, Review Prep 6",
      intro: "When you substitute, replace the letter carefully first, then let BIDMAS take over.",
      skills: ["Expand brackets", "Formula flow", "Negative values", "Clean answers"]
    },
    {
      id: "solving-forming-equations",
      title: "Solving & Forming Equations",
      zone: "Algebra Zone",
      source: "U2 Unit 2 notes, Review Preps 5, 6",
      intro: "Equation problems are translation puzzles: define the unknown, write the balance, solve it.",
      skills: ["Balance moves", "Define x", "Perimeter equations", "Age problems"]
    },
    {
      id: "angles-shape-facts",
      title: "Angles & 2D Shape Facts",
      zone: "Geometry Zone",
      source: "U2 Unit 1 notes, Review Prep 2",
      intro: "Angle questions are easier when you name the fact before doing the subtraction.",
      skills: ["Line total", "Opposite angles", "Triangle total", "Shape facts"]
    },
    {
      id: "area-perimeter-units",
      title: "Area, Perimeter & Units",
      zone: "Geometry Zone",
      source: "U2 Unit 1 and 3 notes, Review Preps 3, 4, 5, 6",
      intro: "Perimeter goes around. Area fills the inside. Unit conversions change with the dimension.",
      skills: ["Composite shapes", "Triangle area", "Shaded regions", "Area units"]
    },
    {
      id: "coordinates-area-challenges",
      title: "Coordinates & Area Challenges",
      zone: "Geometry Zone",
      source: "Review Prep 6 question 10",
      intro: "Coordinate geometry becomes much friendlier when you spot vertical lines, horizontal lines, symmetry, and the base-height pair hiding in the grid.",
      skills: ["Coordinate points", "Parallel axes", "Isosceles symmetry", "Area from coordinates"]
    },
    {
      id: "geometry-equations-challenge",
      title: "Geometry Equations Challenge",
      zone: "Geometry Zone",
      source: "U2 equations, area, perimeter, volume notes; Review Preps 5 and 6",
      intro: "Some shape questions hide an equation. Name the unknown, build the shape formula, solve it, then use the answer for the final geometry step.",
      skills: ["Form equations", "Perimeter and area", "Volume equations", "Factor-pair reasoning"]
    },
    {
      id: "ratio-proportion",
      title: "Ratio & Proportion",
      zone: "Proportion/Data Zone",
      source: "U2 Unit 2 notes, Review Prep 4",
      intro: "Ratio parts are equal-sized chunks. Find one chunk and the rest usually unlocks.",
      skills: ["Ratio parts", "Share money", "Differences", "New ratio"]
    },
    {
      id: "three-d-volume-speed",
      title: "3D, Volume & Speed",
      zone: "Proportion/Data Zone",
      source: "U2 Unit 2 notes, Review Prep 6",
      intro: "3D questions need three dimensions. Speed questions need distance and time speaking the same language.",
      skills: ["Volume", "Unit cubes", "Conversions", "Speed"]
    },
    {
      id: "data-handling",
      title: "Data Handling",
      zone: "Proportion/Data Zone",
      source: "U2 Unit 2 and 3 notes, Review Prep 6",
      intro: "For mean, median, mode, and range, organise the data first. For charts, read the labels first.",
      skills: ["Mean", "Median", "Mode", "Range", "Charts"]
    },
    {
      id: "word-problem-arena",
      title: "Word Problem Arena",
      zone: "Exam Arena",
      source: "Review Preps 1-6 and answer papers",
      intro: "Mixed exam questions reward calm reading, choosing a method, and showing the steps.",
      skills: ["Read the story", "Choose a method", "Show working", "Check the answer"]
    },
    {
      id: "review-prep-9-challenge",
      title: "Review Prep 9 Exam Lab",
      zone: "Exam Arena",
      source: "U2T3W4 Review Prep 9 questions 1b, 3, 4, 5a, 6b, 7b",
      intro: "A refreshed exam-practice set built from Review Prep 9: formula substitution, metric conversions, percentage levels, cuboid surface area, prime-factor odd divisors, and changing pie charts.",
      skills: ["Formula substitution", "Metric conversion", "Percentage levels", "Surface area", "Prime factors", "Pie chart changes"]
    }
  ];

  const MODULE_IDS = MODULES.map((module) => module.id);
  const MODULE_BY_ID = Object.fromEntries(MODULES.map((module) => [module.id, module]));
  const ROUND_LENGTH = 8;
  const CHALLENGE_VARIANTS_PER_MODULE = 10;
  const CHALLENGE_VARIANTS_BY_MODULE = {
    "review-prep-9-challenge": 20
  };
  const CHALLENGE_DISABLED_MODULE_IDS = new Set(["review-prep-9-challenge"]);

  function hasChallengeBank(moduleId) {
    return !CHALLENGE_DISABLED_MODULE_IDS.has(moduleId);
  }

  function challengeVariantCount(moduleId) {
    if (!hasChallengeBank(moduleId)) return 0;
    return CHALLENGE_VARIANTS_BY_MODULE[moduleId] || CHALLENGE_VARIANTS_PER_MODULE;
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const t = y;
      y = x % y;
      x = t;
    }
    return x || 1;
  }

  function simplifyFraction(numerator, denominator) {
    const sign = denominator < 0 ? -1 : 1;
    const n = numerator * sign;
    const d = denominator * sign;
    const factor = gcd(n, d);
    return { numerator: n / factor, denominator: d / factor };
  }

  function simplifiedRatio(a, b) {
    const factor = gcd(a, b);
    return [a / factor, b / factor];
  }

  function triangular(n) {
    return (n * (n + 1)) / 2;
  }

  function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let factor = 3; factor * factor <= n; factor += 2) {
      if (n % factor === 0) return false;
    }
    return true;
  }

  function primeFactors(n) {
    const factors = [];
    let value = n;
    for (let factor = 2; factor * factor <= value; factor += factor === 2 ? 1 : 2) {
      while (value % factor === 0) {
        factors.push(factor);
        value /= factor;
      }
    }
    if (value > 1) factors.push(value);
    return factors;
  }

  function factorString(n) {
    const counts = {};
    primeFactors(n).forEach((factor) => {
      counts[factor] = (counts[factor] || 0) + 1;
    });
    return Object.keys(counts)
      .map((factor) => counts[factor] === 1 ? factor : factor + "^" + counts[factor])
      .join(" x ");
  }

  function largestOddDivisor(n) {
    let value = n;
    while (value % 2 === 0) value /= 2;
    return value;
  }

  function cuboidSurfaceArea(length, width, height) {
    return 2 * (length * width + length * height + width * height);
  }

  function formatNumber(value) {
    if (Number.isInteger(value)) return String(value);
    const rounded = Math.round(value * 1000000) / 1000000;
    return String(rounded);
  }

  function pick(items, variantIndex) {
    return items[Math.floor(variantIndex / 4) % items.length];
  }

  function parseNumber(value) {
    if (typeof value !== "string") return NaN;
    const cleaned = value.trim().replaceAll(",", "");
    if (!cleaned) return NaN;
    if (/^-?\d+\/-?\d+$/.test(cleaned)) {
      const parts = cleaned.split("/").map(Number);
      return parts[0] / parts[1];
    }
    return Number(cleaned);
  }

  function parseRatio(value) {
    if (typeof value !== "string") return null;
    const match = value.trim().toLowerCase().match(/^(-?\d+)\s*(?::|to)\s*(-?\d+)$/);
    if (!match) return null;
    const a = Number(match[1]);
    const b = Number(match[2]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a === 0 || b === 0) return null;
    const factor = gcd(a, b);
    return [a / factor, b / factor];
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/âˆ’/g, "-")
      .replace(/[^a-z0-9:/+.\-]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  const SUPERSCRIPTS = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "+": "⁺",
    "-": "⁻",
    "=": "⁼",
    "(": "⁽",
    ")": "⁾",
    a: "ᵃ",
    b: "ᵇ",
    c: "ᶜ",
    d: "ᵈ",
    e: "ᵉ",
    f: "ᶠ",
    g: "ᵍ",
    h: "ʰ",
    i: "ⁱ",
    j: "ʲ",
    k: "ᵏ",
    l: "ˡ",
    m: "ᵐ",
    n: "ⁿ",
    o: "ᵒ",
    p: "ᵖ",
    r: "ʳ",
    s: "ˢ",
    t: "ᵗ",
    u: "ᵘ",
    v: "ᵛ",
    w: "ʷ",
    x: "ˣ",
    y: "ʸ",
    z: "ᶻ"
  };
  const PLAIN_SUPERSCRIPTS = Object.fromEntries(Object.entries(SUPERSCRIPTS).map(([plain, raised]) => [raised, plain]));

  function toSuperscript(value) {
    return String(value)
      .replace(/\s+/g, "")
      .split("")
      .map((char) => SUPERSCRIPTS[char.toLowerCase()] || char)
      .join("");
  }

  function formatMathText(value) {
    return String(value)
      .replace(/\^\(([^)]{1,40})\)/g, (_, exponent) => toSuperscript("(" + exponent + ")"))
      .replace(/\^(-?\d+)/g, (_, exponent) => toSuperscript(exponent))
      .replace(/\^([a-zA-Z]+)/g, (_, exponent) => toSuperscript(exponent));
  }

  function plainMathText(value) {
    return String(value).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻ]+/g, (run) =>
      "^" + run.split("").map((char) => PLAIN_SUPERSCRIPTS[char] || char).join("")
    );
  }

  function normalizeExpression(value) {
    return plainMathText(String(value || ""))
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/\*/g, "")
      .replace(/âˆ’/g, "-");
  }

  function stableSeed(value) {
    return String(value || "").split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  }

  function rotate(items, offset) {
    if (!items.length) return items;
    const start = ((offset % items.length) + items.length) % items.length;
    return items.slice(start).concat(items.slice(0, start));
  }

  function orderChoices(choices, fields) {
    const seed = stableSeed((fields.classic || "") + "|" + (fields.prompt || ""));
    const ordered = rotate(choices, seed);
    return seed % 2 ? ordered.slice().reverse() : ordered;
  }

  function formatTerm(coefficient, variable, first) {
    const abs = Math.abs(coefficient);
    const body = (abs === 1 ? "" : abs) + variable;
    if (first) return coefficient < 0 ? "-" + body : body;
    return coefficient < 0 ? " - " + body : " + " + body;
  }

  function signedTerm(coefficient, variable) {
    const abs = Math.abs(coefficient);
    const body = (abs === 1 ? "" : abs) + variable;
    return coefficient < 0 ? " - " + body : " + " + body;
  }

  function numberWord(value) {
    return { 2: "twice", 3: "three", 4: "four", 5: "five", 6: "six" }[value] || String(value);
  }

  function ordinalWord(value) {
    return { 4: "fourth", 5: "fifth" }[value] || String(value) + "th";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function choiceProblem(fields) {
    const byValue = new Map();
    fields.choices.forEach((choice) => {
      const key = String(choice.value);
      if (!byValue.has(key)) {
        byValue.set(key, { ...choice });
        return;
      }
      if (choice.isCorrect) {
        byValue.set(key, { ...choice });
      }
    });
    const choices = orderChoices([...byValue.values()], fields);
    const correctChoice = choices.find((choice) => choice.isCorrect);
    return {
      ...fields,
      answerType: "choice",
      choices,
      answerMode: "choice",
      expectedDisplay: fields.expectedDisplay || correctChoice.label,
      correctInput: { choice: String(correctChoice.value) }
    };
  }

  function numberProblem(fields) {
    return {
      ...fields,
      answerType: "number",
      expectedDisplay: fields.expectedDisplay || formatNumber(fields.expected),
      correctInput: { value: fields.expectedDisplay || formatNumber(fields.expected) }
    };
  }

  function ratioProblem(fields) {
    return {
      ...fields,
      answerType: "ratio",
      expectedDisplay: fields.expected[0] + ":" + fields.expected[1],
      correctInput: { value: fields.expected[0] + ":" + fields.expected[1] }
    };
  }

  function expressionProblem(fields) {
    const choices = fields.choices.map((label) => ({
      value: label,
      label,
      isCorrect: normalizeExpression(label) === normalizeExpression(fields.expected)
    }));
    return choiceProblem({
      ...fields,
      fillableAnswerType: "expression",
      choices,
      expectedDisplay: fields.expected,
      correctInput: { choice: fields.expected }
    });
  }

  function textProblem(fields) {
    return {
      ...fields,
      answerType: "text",
      answerMode: "filled",
      expectedDisplay: fields.expectedDisplay,
      acceptedTextAnswers: fields.acceptedTextAnswers || [fields.expectedDisplay],
      correctInput: { value: fields.expectedDisplay }
    };
  }

  function makeChoices(correct, wrongs, formatter = formatNumber) {
    return [correct, ...wrongs].map((value) => ({
      value: formatter(value),
      label: formatter(value),
      isCorrect: value === correct
    }));
  }

  function numericChoiceProblem(problem) {
    const expected = problem.expected;
    const abs = Math.abs(expected);
    const step = Number.isInteger(expected)
      ? (abs >= 1000 ? 1000 : abs >= 100 ? 10 : 1)
      : (abs >= 1 ? 0.1 : 0.01);
    const wrongs = [
      expected + step,
      expected - step,
      expected * 2,
      expected === 0 ? step * 3 : expected / 2,
      expected * 10
    ].filter((value) => Number.isFinite(value) && Math.abs(value - expected) > 1e-8);
    return choiceProblem({
      ...problem,
      baseAnswerType: problem.answerType,
      formatHint: "Choose the answer that matches your working.",
      choices: makeChoices(expected, wrongs.slice(0, 4))
    });
  }

  function ratioChoiceProblem(problem) {
    const expected = problem.expected;
    const wrongs = [
      [expected[1], expected[0]],
      [expected[0], expected[0] + expected[1]],
      [expected[0] * 2, expected[1]],
      [expected[0], expected[1] * 2]
    ].map((ratio) => ratio[0] + ":" + ratio[1]);
    return choiceProblem({
      ...problem,
      baseAnswerType: problem.answerType,
      formatHint: "Choose the ratio in simplest form.",
      choices: [problem.expectedDisplay, ...wrongs].map((label) => ({
        value: label,
        label,
        isCorrect: label === problem.expectedDisplay
      }))
    });
  }

  function typedFromChoiceProblem(problem) {
    const expected = String(problem.expectedDisplay || "");
    const numericExpected = parseNumber(expected);
    if (problem.fillableAnswerType === "expression") {
      return {
        ...problem,
        answerType: "expression",
        answerMode: "filled",
        formatHint: "Type the simplified expression.",
        correctInput: { value: expected }
      };
    }
    if (Number.isFinite(numericExpected) && /^-?\d+(?:\.\d+)?$/.test(expected.replace(/,/g, ""))) {
      return {
        ...problem,
        answerType: "number",
        answerMode: "filled",
        expected: numericExpected,
        formatHint: "Type the number.",
        correctInput: { value: expected }
      };
    }
    return {
      ...problem,
      answerType: "text",
      answerMode: "filled",
      acceptedTextAnswers: [expected],
      formatHint: "Type the answer in words or symbols.",
      correctInput: { value: expected }
    };
  }

  function applyAnswerVariety(problem, variantIndex) {
    const seed = stableSeed(problem.moduleId + "|" + problem.classic);
    const sourceVariant = Math.floor(variantIndex / 4);
    const mode = (sourceVariant + seed) % 4;
    if (problem.answerType === "number" && mode === 0) {
      return numericChoiceProblem(problem);
    }
    if (problem.answerType === "ratio" && mode === 0) {
      return ratioChoiceProblem(problem);
    }
    if (problem.answerType === "choice" && mode === 1) {
      return typedFromChoiceProblem(problem);
    }
    return {
      ...problem,
      answerMode: problem.answerType === "choice" ? "choice" : "filled"
    };
  }

  function moduleProblem(moduleId, classic, fields) {
    const module = MODULE_BY_ID[moduleId];
    return {
      moduleId,
      moduleTitle: module.title,
      zone: module.zone,
      source: fields.source || module.source,
      classic,
      skill: fields.skill || classic,
      formatHint: fields.formatHint || "Enter the answer, then check it.",
      visual: fields.visual || { title: classic, lines: [fields.prompt] },
      ...fields
    };
  }

  function placeValueScales(v) {
    const templates = [
      () => {
        const digits = [
          { number: 72954034, digit: 9, place: 100000, label: "hundred-thousands" },
          { number: 8905345, digit: 9, place: 100000, label: "hundred-thousands" },
          { number: 6001.42, digit: 4, place: 0.1, label: "tenths" },
          { number: 508600017, digit: 8, place: 1000000, label: "millions" }
        ];
        const item = pick(digits, v);
        return numberProblem(moduleProblem("place-value-scales", "Digit Value", {
          prompt: "What is the value of the digit " + item.digit + " in " + item.number.toLocaleString("en-GB") + "?",
          expected: item.digit * item.place,
          hint1: "Find the column the digit is sitting in.",
          hint2: "The " + item.digit + " is in the " + item.label + " column.",
          solution: item.digit + " x " + item.place + " = " + formatNumber(item.digit * item.place) + ".",
          visual: { title: "Place value columns", lines: ["Digit: " + item.digit, "Place: " + item.label, "Value = digit x place"] }
        }));
      },
      () => {
        const items = [
          { number: 1026895602, nearest: 1000 },
          { number: 47038291, nearest: 10000 },
          { number: 608149, nearest: 100 },
          { number: 7250499, nearest: 1000 }
        ];
        const item = pick(items, v);
        const expected = Math.round(item.number / item.nearest) * item.nearest;
        return numberProblem(moduleProblem("place-value-scales", "Rounding", {
          prompt: "Round " + item.number.toLocaleString("en-GB") + " to the nearest " + item.nearest.toLocaleString("en-GB") + ".",
          expected,
          hint1: "Find the rounding column first.",
          hint2: "Look at the digit immediately to the right of that column.",
          solution: item.number.toLocaleString("en-GB") + " rounds to " + expected.toLocaleString("en-GB") + ".",
          visual: { title: "Rounding radar", lines: ["Target place: " + item.nearest, "Check the next digit", "Round up if it is 5 or more"] }
        }));
      },
      () => {
        const items = [
          { start: 12.02, op: "x", factor: 1000, expected: 12020 },
          { start: 0.0305, op: "/", factor: 10, expected: 0.00305 },
          { start: 11001, op: "/", factor: 10, expected: 1100.1 },
          { start: 42.7, op: "x", factor: 100, expected: 4270 }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("place-value-scales", "Powers Of Ten", {
          prompt: "Calculate " + item.start + " " + item.op + " " + item.factor + ".",
          expected: item.expected,
          hint1: "Multiplying by a power of 10 moves the digits left. Dividing moves them right.",
          hint2: item.factor + " has " + (String(item.factor).length - 1) + " zeroes, so move that many places.",
          solution: item.start + " " + item.op + " " + item.factor + " = " + formatNumber(item.expected) + ".",
          visual: { title: "Place-value shift", lines: ["Digits move columns", "The decimal point is your marker"] }
        }));
      },
      () => {
        const items = [
          { start: 240, step: 20, tick: 7 },
          { start: 4.5, step: 0.25, tick: 6 },
          { start: 1250, step: 50, tick: 5 },
          { start: -20, step: 5, tick: 9 }
        ];
        const item = pick(items, v);
        const expected = item.start + item.step * item.tick;
        return numberProblem(moduleProblem("place-value-scales", "Scale Arrows", {
          prompt: "A scale starts at " + item.start + " and each tick is worth " + item.step + ". What value is tick " + item.tick + "?",
          expected,
          hint1: "Count how many jumps from the start to the arrow.",
          hint2: "Use start + jumps x step size.",
          solution: item.start + " + " + item.tick + " x " + item.step + " = " + formatNumber(expected) + ".",
          visual: { type: "scale", title: "Scale", start: item.start, step: item.step, tick: item.tick, value: expected }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function slickSumsFourRules(v) {
    const templates = [
      () => {
        const items = [
          { values: [42, 17, 58], expected: 117, slick: "42 + 58 = 100 first" },
          { values: [73, -48, 17], expected: 42, slick: "73 + 17 = 90 first" },
          { values: [827, -76, 75], expected: 826, slick: "-76 + 75 = -1 first" },
          { values: [234, -45, 36, -105], expected: 120, slick: "234 + 36 and -45 -105" }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("slick-sums-four-rules", "Slick Addition And Subtraction", {
          prompt: "Calculate " + item.values.join(" + ").replace(/\+ -/g, "- ") + ".",
          expected: item.expected,
          hint1: "Look for numbers that make a friendly total.",
          hint2: item.slick + ".",
          solution: item.slick + ", so the total is " + item.expected + ".",
          visual: { title: "Slick route", lines: [item.slick, "Then finish the remaining part"] }
        }));
      },
      () => {
        const items = [
          { a: 22, b: 31, c: 28, expected: 1550 },
          { a: 888, b: 9, c: -88, expected: 7200 },
          { a: 16, b: 75, c: 24, expected: 3000 },
          { a: 42, b: 17, c: 58, expected: 1700 }
        ];
        const item = pick(items, v);
        const prompt = item.c < 0
          ? "(" + item.a + " x " + item.b + ") - (" + Math.abs(item.c) + " x " + item.b + ")"
          : "(" + item.a + " x " + item.b + ") + (" + item.b + " x " + item.c + ")";
        return numberProblem(moduleProblem("slick-sums-four-rules", "Common Factor", {
          prompt: "Calculate " + prompt + " using a common factor.",
          expected: item.expected,
          hint1: "Both parts have the same multiplier.",
          hint2: "Factor out " + item.b + " and combine the other numbers first.",
          solution: item.b + " x (" + item.a + (item.c < 0 ? " - " : " + ") + Math.abs(item.c) + ") = " + item.expected + ".",
          visual: { title: "Common factor", lines: ["Same multiplier: " + item.b, "Combine the other numbers first"] }
        }));
      },
      () => {
        const items = [
          { prompt: "238.3 - 29.8", expected: 208.5, route: "Subtract 30, then add back 0.2." },
          { prompt: "62.04 - 3.826", expected: 58.214, route: "Line up decimal places carefully." },
          { prompt: "700 x 0.14", expected: 98, route: "0.14 is 14 hundredths: 700 x 14 / 100." },
          { prompt: "21 / 400", expected: 0.0525, route: "Divide by 4, then divide by 100." }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("slick-sums-four-rules", "Decimals And Factors", {
          prompt: "Calculate " + item.prompt + ".",
          expected: item.expected,
          hint1: "Use a method that keeps the place value clear.",
          hint2: item.route,
          solution: item.route + " The answer is " + formatNumber(item.expected) + ".",
          visual: { title: "Decimal care", lines: [item.route, "Keep place value lined up"] }
        }));
      },
      () => {
        const items = [
          { prompt: "? - 9.007 = 14.1", expected: 23.107, route: "Add 9.007 to both sides." },
          { prompt: "? / 700 = 210000", expected: 147000000, route: "Multiply both sides by 700." },
          { prompt: "47.89 + ? = 1206.9", expected: 1159.01, route: "Subtract 47.89 from 1206.9." },
          { prompt: "50 x ? = 200000", expected: 4000, route: "Divide 200000 by 50." }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("slick-sums-four-rules", "Missing Number", {
          prompt: "Find the missing value: " + item.prompt + ".",
          expected: item.expected,
          hint1: "Undo the operation around the missing value.",
          hint2: item.route,
          solution: item.route + " The missing value is " + formatNumber(item.expected) + ".",
          visual: { title: "Undo move", lines: [item.prompt, item.route] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function bidmasPowers(v) {
    const templates = [
      () => {
        const items = [
          { prompt: "40 - 6 x 7", expected: -2, route: "Do 6 x 7 before subtracting." },
          { prompt: "90 - 8 x 11", expected: 2, route: "Do 8 x 11 before subtracting." },
          { prompt: "54 + 12 / 3", expected: 58, route: "Do 12 / 3 before adding." },
          { prompt: "100 - 36 / 4", expected: 91, route: "Do 36 / 4 before subtracting." }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("bidmas-powers", "Multiplication Before Addition", {
          prompt: "Calculate " + item.prompt + ".",
          expected: item.expected,
          hint1: "Multiplication and division happen before addition and subtraction.",
          hint2: item.route,
          solution: item.route + " The answer is " + item.expected + ".",
          visual: { title: "BIDMAS radar", lines: ["Brackets", "Indices", "Division/Multiplication", "Addition/Subtraction"] }
        }));
      },
      () => {
        const items = [
          { prompt: "13 + (7 - 2)^2 - 5 / 2", expected: 35.5, route: "(7 - 2)^2 = 25, and 5 / 2 = 2.5." },
          { prompt: "8 + (10 - 6)^2 - 12 / 3", expected: 20, route: "(10 - 6)^2 = 16, and 12 / 3 = 4." },
          { prompt: "6 + (9 - 4)^2 - 18 / 6", expected: 28, route: "(9 - 4)^2 = 25, and 18 / 6 = 3." },
          { prompt: "20 - (8 - 5)^2 + 16 / 4", expected: 15, route: "(8 - 5)^2 = 9, and 16 / 4 = 4." }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("bidmas-powers", "Brackets And Powers", {
          prompt: "Calculate " + item.prompt + ".",
          expected: item.expected,
          hint1: "Start inside the brackets, then handle the power.",
          hint2: item.route,
          solution: item.route + " Finish the adding/subtracting to get " + formatNumber(item.expected) + ".",
          visual: { title: "Bracket first", lines: ["1. Brackets", "2. Powers", "3. Divide/multiply", "4. Add/subtract"] }
        }));
      },
      () => {
        const items = [
          { prompt: "110 - 3 x 5^2", expected: 35, route: "5^2 = 25, then 3 x 25 = 75." },
          { prompt: "150 - 4 x 6^2", expected: 6, route: "6^2 = 36, then 4 x 36 = 144." },
          { prompt: "200 - 2 x 9^2", expected: 38, route: "9^2 = 81, then 2 x 81 = 162." },
          { prompt: "64 + 3 x 4^3", expected: 256, route: "4^3 = 64, then 3 x 64 = 192." }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("bidmas-powers", "Index First", {
          prompt: "Calculate " + item.prompt + ".",
          expected: item.expected,
          hint1: "The power is part of BIDMAS before multiplication.",
          hint2: item.route,
          solution: item.route + " The answer is " + item.expected + ".",
          visual: { title: "Power checkpoint", lines: [item.route, "Then finish the expression"] }
        }));
      },
      () => {
        const items = [
          { prompt: "1509 - (17 + 33^2 + 40)", expected: 363, route: "33^2 = 1089. Inside brackets: 17 + 1089 + 40 = 1146." },
          { prompt: "700 - (12 + 20^2 + 8)", expected: 280, route: "20^2 = 400. Inside brackets: 12 + 400 + 8 = 420." },
          { prompt: "1000 - (15 + 27^2 + 6)", expected: 250, route: "27^2 = 729. Inside brackets: 15 + 729 + 6 = 750." },
          { prompt: "500 - (9 + 18^2 + 17)", expected: 150, route: "18^2 = 324. Inside brackets: 9 + 324 + 17 = 350." }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("bidmas-powers", "Nested Bracket Total", {
          prompt: "Calculate " + item.prompt + ".",
          expected: item.expected,
          hint1: "Everything inside the brackets must be finished before subtracting.",
          hint2: item.route,
          solution: item.route + " Then subtract from the outside number to get " + item.expected + ".",
          visual: { title: "Bracket total", lines: ["Finish the bracket as one chunk", "Then subtract"] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function fractionsDecimalsPercentages(v) {
    const templates = [
      () => {
        const items = [
          { n: 19, d: 25, expected: 0.76 },
          { n: 200, d: 800, expected: 0.25 },
          { n: 13, d: 50, expected: 0.26 },
          { n: 7, d: 20, expected: 0.35 }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("fractions-decimals-percentages", "Fraction To Decimal", {
          prompt: "Convert " + item.n + "/" + item.d + " to a decimal.",
          expected: item.expected,
          hint1: "A fraction line means division.",
          hint2: "If you can, scale the denominator to 10, 100, or 1000.",
          solution: item.n + " / " + item.d + " = " + item.expected + ".",
          visual: { title: "Fraction line", lines: ["Fraction = division", item.n + " divided by " + item.d] }
        }));
      },
      () => {
        const items = [
          { decimal: "0.16", n: 4, d: 25 },
          { decimal: "0.005", n: 1, d: 200 },
          { decimal: "0.64", n: 16, d: 25 },
          { decimal: "0.015", n: 3, d: 200 }
        ];
        const item = pick(items, v);
        return choiceProblem(moduleProblem("fractions-decimals-percentages", "Decimal To Fraction", {
          prompt: "Convert " + item.decimal + " to a simplified fraction.",
          choices: [
            { value: item.n + "/" + item.d, label: item.n + "/" + item.d, isCorrect: true },
            { value: Number(item.decimal.replace(".", "")) + "/1000", label: Number(item.decimal.replace(".", "")) + "/1000", isCorrect: false },
            { value: item.n + "/" + (item.d / 2), label: item.n + "/" + (item.d / 2), isCorrect: false },
            { value: item.d + "/" + item.n, label: item.d + "/" + item.n, isCorrect: false }
          ],
          hint1: "Write the decimal over 10, 100, or 1000 first.",
          hint2: "Then simplify using a common factor.",
          solution: item.decimal + " = " + item.n + "/" + item.d + " in simplest form.",
          visual: { title: "Decimal place value", lines: ["Write over a power of 10", "Simplify"] }
        }));
      },
      () => {
        const items = [
          { percent: 19.2, expected: 0.192 },
          { percent: 230, expected: 2.3 },
          { percent: 0.3, expected: 0.003 },
          { percent: 12.5, expected: 0.125 }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("fractions-decimals-percentages", "Percentage To Decimal", {
          prompt: "Convert " + item.percent + "% to a decimal.",
          expected: item.expected,
          hint1: "Percent means out of 100.",
          hint2: "Divide the percentage by 100.",
          solution: item.percent + "% = " + formatNumber(item.expected) + ".",
          visual: { title: "Percent means per 100", lines: [item.percent + " / 100"] }
        }));
      },
      () => {
        const items = [
          { percent: 25, amount: 30, expected: 7.5 },
          { percent: 20, amount: 145, expected: 29 },
          { percent: 15, amount: 80, expected: 12 },
          { percent: 12.5, amount: 64, expected: 8 }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("fractions-decimals-percentages", "Percentage Of Amount", {
          prompt: "Calculate " + item.percent + "% of " + item.amount + ".",
          expected: item.expected,
          hint1: "Percent of means multiply by the percent as a decimal.",
          hint2: item.percent + "% = " + formatNumber(item.percent / 100) + ".",
          solution: formatNumber(item.percent / 100) + " x " + item.amount + " = " + formatNumber(item.expected) + ".",
          visual: { title: "Percent of", lines: ["Convert percent to decimal", "Then multiply"] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function numberTypesPrimes(v) {
    const templates = [
      () => {
        const items = [
          { range: "60 to 70", kind: "square number", choices: ["64", "65", "66", "68"], correct: "64", reason: "64 = 8^2, so it is square." },
          { range: "20 to 30", kind: "cube number", choices: ["21", "24", "25", "27"], correct: "27", reason: "27 = 3^3, so it is cube." },
          { range: "30 to 40", kind: "square number", choices: ["35", "36", "37", "39"], correct: "36", reason: "36 = 6^2, so it is square." },
          { range: "10 to 20", kind: "square number", choices: ["12", "16", "18", "20"], correct: "16", reason: "16 = 4^2 and is also 2^4." }
        ];
        const item = pick(items, v);
        return choiceProblem(moduleProblem("number-types-primes", "Square And Cube Numbers", {
          prompt: "Which " + item.kind + " is in the range " + item.range + "?",
          choices: item.choices.map((choice) => ({ value: choice, label: choice, isCorrect: choice === item.correct })),
          hint1: "Square numbers come from n x n. Cube numbers come from n x n x n.",
          hint2: "Try the familiar times tables and powers.",
          solution: item.reason,
          visual: { title: "Number type check", lines: ["Square: n x n", "Cube: n x n x n"] }
        }));
      },
      () => {
        const items = [
          { n: 847, expected: false, factor: 7 },
          { n: 419, expected: true, factor: null },
          { n: 91, expected: false, factor: 7 },
          { n: 97, expected: true, factor: null }
        ];
        const item = pick(items, v);
        return choiceProblem(moduleProblem("number-types-primes", "Prime Yes Or No", {
          prompt: "Is " + item.n + " a prime number?",
          choices: [
            { value: "yes", label: "Yes, prime", isCorrect: item.expected },
            { value: "no", label: "No, not prime", isCorrect: !item.expected }
          ],
          hint1: "Only test prime divisors up to the square root.",
          hint2: item.factor ? item.n + " is divisible by " + item.factor + "." : "No prime factor up to the square root divides it.",
          solution: item.expected ? item.n + " has no prime divisor up to its square root, so it is prime." : item.n + " = " + item.factor + " x " + (item.n / item.factor) + ", so it is not prime.",
          visual: { title: "Prime search", lines: ["Test 2, 3, 5, 7, 11...", "Stop once factor x factor is bigger than the number"] }
        }));
      },
      () => {
        const items = [
          { n: 84 },
          { n: 90 },
          { n: 108 },
          { n: 126 }
        ];
        const item = pick(items, v);
        const expected = factorString(item.n);
        return expressionProblem(moduleProblem("number-types-primes", "Prime Factorisation", {
          prompt: "Write the prime factorisation of " + item.n + ".",
          expected,
          choices: [expected, "2 x " + item.n / 2, "3 x " + item.n / 3, String(item.n)],
          hint1: "Use a division ladder with prime numbers only.",
          hint2: "Keep dividing by 2, then 3, then 5, then 7 where possible.",
          solution: item.n + " = " + expected + ".",
          visual: { title: "Division ladder", lines: ["Divide by prime numbers", "Stop when the last number is prime"] }
        }));
      },
      () => {
        const items = [
          { n: 130, divisor: 5, expected: true },
          { n: 731, divisor: 3, expected: false },
          { n: 1001, divisor: 7, expected: true },
          { n: 468, divisor: 9, expected: true }
        ];
        const item = pick(items, v);
        return choiceProblem(moduleProblem("number-types-primes", "Divisibility Rules", {
          prompt: "Is " + item.n + " divisible by " + item.divisor + "?",
          choices: [
            { value: "yes", label: "Yes", isCorrect: item.expected },
            { value: "no", label: "No", isCorrect: !item.expected }
          ],
          hint1: "Use a divisibility rule before long division.",
          hint2: item.divisor === 9 ? "For 9, the digit sum must be divisible by 9." : "Check the rule for " + item.divisor + ".",
          solution: item.expected ? "Yes, " + item.n + " is divisible by " + item.divisor + "." : "No, " + item.n + " is not divisible by " + item.divisor + ".",
          visual: { title: "Rule check", lines: ["Use the shortcut rule", "Then confirm if needed"] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function algebraExpressions(v) {
    const templates = [
      () => {
        const items = [
          { a: 14, x: "b", b: -3, y: "a", c: -2, d: 1 },
          { a: 9, x: "y", b: -2, y: "z", c: 6, d: -1 },
          { a: 5, x: "p", b: 4, y: "q", c: -8, d: -2 },
          { a: 11, x: "m", b: -7, y: "n", c: -3, d: 5 }
        ];
        const item = pick(items, v);
        const xTotal = item.a + item.c;
        const yTotal = item.b + item.d;
        const expected = formatTerm(xTotal, item.x, true) + formatTerm(yTotal, item.y, false);
        return expressionProblem(moduleProblem("algebra-expressions", "Collect Like Terms", {
          prompt: "Simplify " + item.a + item.x + signedTerm(item.b, item.y) + signedTerm(item.c, item.x) + signedTerm(item.d, item.y) + ".",
          expected,
          choices: [expected, formatTerm(xTotal, item.x, true) + formatTerm(item.b + item.c, item.y, false), (xTotal + yTotal) + item.x + item.y, item.a + item.x + signedTerm(item.c, item.x)],
          hint1: "Collect " + item.x + " terms with " + item.x + " terms and " + item.y + " terms with " + item.y + " terms.",
          hint2: item.a + item.x + signedTerm(item.c, item.x) + " = " + formatTerm(xTotal, item.x, true) + " and " + item.b + item.y + signedTerm(item.d, item.y) + " = " + formatTerm(yTotal, item.y, true) + ".",
          solution: "The simplified expression is " + expected + ".",
          visual: { title: "Like terms", lines: [item.x + " terms together", item.y + " terms together"] }
        }));
      },
      () => {
        const items = [
          { a: 6, b: 5, letter: "c" },
          { a: 3, b: 8, letter: "a" },
          { a: 7, b: 4, letter: "p" },
          { a: 9, b: 2, letter: "m" }
        ];
        const item = pick(items, v);
        const expected = item.a * item.b + item.letter + "^2";
        return expressionProblem(moduleProblem("algebra-expressions", "Multiply Algebra Terms", {
          prompt: "Simplify " + item.a + item.letter + " x " + item.b + item.letter + ".",
          expected,
          choices: [expected, (item.a + item.b) + item.letter, (item.a * item.b) + item.letter, (item.a * item.b) + item.letter + item.letter + "^2"],
          hint1: "Multiply the numbers, then multiply the letters.",
          hint2: item.letter + " x " + item.letter + " = " + item.letter + "^2.",
          solution: item.a + " x " + item.b + " = " + (item.a * item.b) + " and " + item.letter + " x " + item.letter + " = " + item.letter + "^2, so the answer is " + expected + ".",
          visual: { title: "Repeated multiply", lines: ["Number x number", "Letter x letter"] }
        }));
      },
      () => {
        const items = [
          { top: 75, bottom: 25, letter: "a" },
          { top: 84, bottom: 12, letter: "b" },
          { top: 96, bottom: 24, letter: "x" },
          { top: 63, bottom: 9, letter: "p" }
        ];
        const item = pick(items, v);
        const expected = item.top / item.bottom + item.letter;
        return expressionProblem(moduleProblem("algebra-expressions", "Algebra Division", {
          prompt: "Simplify " + item.top + item.letter + " / " + item.bottom + ".",
          expected,
          choices: [expected, (item.top - item.bottom) + item.letter, String(item.top / item.bottom), item.bottom + item.letter],
          hint1: "Divide the number part by " + item.bottom + ".",
          hint2: item.top + " / " + item.bottom + " = " + (item.top / item.bottom) + ", and the " + item.letter + " remains.",
          solution: item.top + item.letter + " / " + item.bottom + " = " + expected + ".",
          visual: { title: "Division as fraction", lines: [item.top + item.letter + " over " + item.bottom, "Simplify the number part"] }
        }));
      },
      () => {
        const items = [
          { letter: "m", divisor: 2, add: 5 },
          { letter: "d", divisor: 4, add: 7 },
          { letter: "c", divisor: 3, add: -6 },
          { letter: "t", divisor: 5, add: 9 }
        ];
        const item = pick(items, v);
        const expected = item.letter + "/" + item.divisor + (item.add >= 0 ? " + " + item.add : " - " + Math.abs(item.add));
        return expressionProblem(moduleProblem("algebra-expressions", "Words To Algebra", {
          prompt: "I think of a number " + item.letter + ", divide by " + item.divisor + ", then " + (item.add >= 0 ? "add " + item.add : "subtract " + Math.abs(item.add)) + ". Which expression matches?",
          expected,
          choices: [expected, item.letter + "/(" + item.divisor + (item.add >= 0 ? " + " + item.add : " - " + Math.abs(item.add)) + ")", item.divisor + item.letter + (item.add >= 0 ? " + " + item.add : " - " + Math.abs(item.add)), "(" + item.letter + (item.add >= 0 ? " + " + item.add : " - " + Math.abs(item.add)) + ")/" + item.divisor],
          hint1: "Follow the words in order.",
          hint2: "Divide " + item.letter + " by " + item.divisor + " first, then " + (item.add >= 0 ? "add " + item.add : "subtract " + Math.abs(item.add)) + ".",
          solution: "The expression is " + expected + ".",
          visual: { title: "Number machine", lines: [item.letter, "divide by " + item.divisor, item.add >= 0 ? "add " + item.add : "subtract " + Math.abs(item.add)] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function bracketsFormulaeSubstitution(v) {
    const templates = [
      () => {
        const items = [
          { multiplier: 5, letter: "a", add: 3 },
          { multiplier: 4, letter: "x", add: 7 },
          { multiplier: 6, letter: "p", add: 2 },
          { multiplier: 8, letter: "m", add: 5 }
        ];
        const item = pick(items, v);
        const expected = item.multiplier + item.letter + " + " + (item.multiplier * item.add);
        return expressionProblem(moduleProblem("brackets-formulae-substitution", "Expand One Bracket", {
          prompt: "Multiply out " + item.multiplier + "(" + item.letter + " + " + item.add + ").",
          expected,
          choices: [expected, item.multiplier + item.letter + " + " + item.add, item.letter + " + " + (item.multiplier * item.add), (item.multiplier + item.add) + item.letter],
          hint1: "The " + item.multiplier + " multiplies every term inside the bracket.",
          hint2: item.multiplier + " x " + item.letter + " and " + item.multiplier + " x " + item.add + ".",
          solution: item.multiplier + "(" + item.letter + " + " + item.add + ") = " + expected + ".",
          visual: { title: "Bracket arrows", lines: [item.multiplier + " x " + item.letter, item.multiplier + " x " + item.add] }
        }));
      },
      () => {
        const items = [
          { outside: 4, multiplier: 3, letter: "b", add: 4 },
          { outside: 5, multiplier: 2, letter: "y", add: 6 },
          { outside: 7, multiplier: 4, letter: "a", add: 3 },
          { outside: 9, multiplier: 5, letter: "n", add: 2 }
        ];
        const item = pick(items, v);
        const constant = item.outside + item.multiplier * item.add;
        const expected = item.multiplier + item.letter + " + " + constant;
        return expressionProblem(moduleProblem("brackets-formulae-substitution", "Simplify After Brackets", {
          prompt: "Simplify " + item.outside + " + " + item.multiplier + "(" + item.letter + " + " + item.add + ").",
          expected,
          choices: [expected, item.multiplier + item.letter + " + " + item.multiplier * item.add, (item.outside + item.multiplier) + item.letter + " + " + item.add, (item.outside * item.multiplier) + item.letter + " + " + item.add],
          hint1: "Expand the bracket first.",
          hint2: item.multiplier + "(" + item.letter + " + " + item.add + ") = " + item.multiplier + item.letter + " + " + (item.multiplier * item.add) + ". Then add the outside " + item.outside + ".",
          solution: item.outside + " + " + item.multiplier + item.letter + " + " + (item.multiplier * item.add) + " = " + expected + ".",
          visual: { title: "Expand then collect", lines: [item.multiplier + item.letter + " + " + (item.multiplier * item.add), "Add the outside " + item.outside] }
        }));
      },
      () => {
        const item = pick([
          { c: 5, d: -6, multiplier: 4 },
          { c: -3, d: 8, multiplier: 5 },
          { c: 7, d: -2, multiplier: 6 },
          { c: -4, d: -5, multiplier: 3 }
        ], v);
        return numberProblem(moduleProblem("brackets-formulae-substitution", "Negative Substitution", {
          prompt: "If c = " + item.c + " and d = " + item.d + ", find " + item.multiplier + "cd.",
          expected: item.multiplier * item.c * item.d,
          hint1: "Replace c and d before multiplying.",
          hint2: item.multiplier + " x " + item.c + " x " + item.d + " uses the sign rules for multiplication.",
          solution: item.multiplier + " x " + item.c + " x " + item.d + " = " + (item.multiplier * item.c * item.d) + ".",
          visual: { title: "Substitution", lines: ["c = " + item.c, "d = " + item.d, item.multiplier + "cd = " + item.multiplier + " x c x d"] }
        }));
      },
      () => {
        const item = pick([
          { a: 6, b: -7 },
          { a: -4, b: 5 },
          { a: 9, b: -3 },
          { a: -8, b: -2 }
        ], v);
        const a = item.a;
        const b = item.b;
        const expected = b * b - a + b;
        return numberProblem(moduleProblem("brackets-formulae-substitution", "Substitute Into Formula", {
          prompt: "If a = " + a + " and b = " + b + ", find b^2 - a + b.",
          expected,
          hint1: "Be careful: b^2 means (" + b + ") x (" + b + ").",
          hint2: "Then subtract a and add b.",
          solution: "(" + b + ")^2 - " + a + " + " + b + " = " + expected + ".",
          visual: { title: "Negative square", lines: ["b^2 means b x b", "Then finish left to right"] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function solvingFormingEquations(v) {
    const templates = [
      () => {
        const items = [
          { a: 3, b: 7, x: 8 },
          { a: 5, b: -4, x: 6 },
          { a: 4, b: 9, x: 11 },
          { a: 7, b: 2, x: 5 }
        ];
        const item = pick(items, v);
        const total = item.a * item.x + item.b;
        return numberProblem(moduleProblem("solving-forming-equations", "Balance Method", {
          prompt: "Solve " + item.a + "x " + (item.b >= 0 ? "+ " + item.b : "- " + Math.abs(item.b)) + " = " + total + ".",
          expected: item.x,
          hint1: "Undo the add/subtract first.",
          hint2: "Then divide by the number multiplying x.",
          solution: "Undo " + item.b + ", then divide by " + item.a + ". x = " + item.x + ".",
          visual: { title: "Balance moves", lines: ["Do the same to both sides", "Undo in reverse order"] }
        }));
      },
      () => {
        const item = pick([
          { multiplier: 15, add: 16, total: 50 },
          { multiplier: 12, add: 7, total: 43 },
          { multiplier: 8, add: 11, total: 67 },
          { multiplier: 9, add: 5, total: 41 }
        ], v);
        const numerator = item.total - item.add;
        const fraction = simplifyFraction(numerator, item.multiplier);
        const display = fraction.denominator === 1 ? String(fraction.numerator) : fraction.numerator + "/" + fraction.denominator;
        return numberProblem(moduleProblem("solving-forming-equations", "Form From Words", {
          prompt: "I multiply a number by " + item.multiplier + " and then add " + item.add + ". The answer is " + item.total + ". What is the number?",
          expected: numerator / item.multiplier,
          expectedDisplay: display,
          hint1: "Let the number be x.",
          hint2: "The equation is " + item.multiplier + "x + " + item.add + " = " + item.total + ".",
          solution: item.multiplier + "x + " + item.add + " = " + item.total + ", so " + item.multiplier + "x = " + numerator + " and x = " + display + ".",
          visual: { title: "Translate words", lines: ["x", "multiply by " + item.multiplier, "add " + item.add, "equals " + item.total] }
        }));
      },
      () => {
        const item = pick([
          { x: 7, lengthOffset: 3 },
          { x: 5, lengthOffset: 6 },
          { x: 9, lengthOffset: 4 },
          { x: 8, lengthOffset: 5 }
        ], v);
        const x = item.x;
        const lengthOffset = item.lengthOffset;
        const perimeter = 2 * (x + x + lengthOffset);
        return numberProblem(moduleProblem("solving-forming-equations", "Perimeter Equation", {
          prompt: "A rectangle has width x and length x + " + lengthOffset + ". Its perimeter is " + perimeter + " cm. Find x.",
          expected: x,
          hint1: "Perimeter adds all four sides.",
          hint2: "2x + 2(x + " + lengthOffset + ") = " + perimeter + ".",
          solution: "2x + 2x + " + (2 * lengthOffset) + " = " + perimeter + ", so 4x = " + (perimeter - 2 * lengthOffset) + " and x = " + x + ".",
          visual: { title: "Rectangle perimeter", lines: ["Two widths", "Two lengths", "Total perimeter"] }
        }));
      },
      () => {
        const item = pick([
          { multiplier: 3, loss: 5, now: 16 },
          { multiplier: 4, loss: 7, now: 21 },
          { multiplier: 5, loss: 6, now: 34 },
          { multiplier: 6, loss: 9, now: 33 }
        ], v);
        const expected = (item.now + item.loss) / item.multiplier;
        return numberProblem(moduleProblem("solving-forming-equations", "Marble Story", {
          prompt: "Lesley has " + numberWord(item.multiplier) + " times as many marbles as Mark. Lesley loses " + item.loss + " and now has " + item.now + ". How many marbles does Mark have?",
          expected,
          hint1: "Let Mark's marbles be x.",
          hint2: "Lesley starts with " + item.multiplier + "x. Then " + item.multiplier + "x - " + item.loss + " = " + item.now + ".",
          solution: item.multiplier + "x - " + item.loss + " = " + item.now + ", so " + item.multiplier + "x = " + (item.now + item.loss) + " and x = " + expected + ".",
          visual: { title: "Marble equation", lines: ["Mark = x", "Lesley = " + item.multiplier + "x", "After losing " + item.loss + ": " + item.now] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function anglesShapeFacts(v) {
    const templates = [
      () => {
        const shown = pick([63, 118, 47, 132], v);
        return numberProblem(moduleProblem("angles-shape-facts", "Straight Line Partner", {
          prompt: "An angle on a straight line is " + shown + " degrees. What is its partner angle?",
          expected: 180 - shown,
          hint1: "Angles on a straight line add to 180 degrees.",
          hint2: "Subtract the shown angle from 180.",
          solution: "180 - " + shown + " = " + (180 - shown) + " degrees.",
          visual: { type: "angle", title: "Straight line", lines: [shown + " degrees", "x degrees", "Total 180"] }
        }));
      },
      () => {
        const items = [
          { a: 42, b: 71 },
          { a: 35, b: 88 },
          { a: 59, b: 63 },
          { a: 48, b: 57 }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("angles-shape-facts", "Triangle Total", {
          prompt: "A triangle has angles " + item.a + " degrees and " + item.b + " degrees. Find the missing angle.",
          expected: 180 - item.a - item.b,
          hint1: "Angles in a triangle add to 180 degrees.",
          hint2: "Subtract both known angles from 180.",
          solution: "180 - " + item.a + " - " + item.b + " = " + (180 - item.a - item.b) + " degrees.",
          visual: { type: "triangle", title: "Triangle total", lines: [item.a + " degrees", item.b + " degrees", "x degrees"] }
        }));
      },
      () => {
        const angle = pick([74, 109, 58, 121], v);
        return numberProblem(moduleProblem("angles-shape-facts", "Vertically Opposite", {
          prompt: "Two straight lines cross. One angle is " + angle + " degrees. What is the vertically opposite angle?",
          expected: angle,
          hint1: "Vertically opposite angles are equal.",
          hint2: "The opposite angle matches the shown angle.",
          solution: "The vertically opposite angle is also " + angle + " degrees.",
          visual: { type: "angle", title: "Crossing lines", lines: ["Opposite angles match", angle + " degrees"] }
        }));
      },
      () => {
        const vertex = pick([50, 36, 84, 68], v);
        const expected = (180 - vertex) / 2;
        return numberProblem(moduleProblem("angles-shape-facts", "Isosceles Base Angles", {
          prompt: "An isosceles triangle has vertex angle " + vertex + " degrees. What is each base angle?",
          expected,
          hint1: "The two base angles are equal.",
          hint2: "First remove the vertex angle from 180, then split the rest in half.",
          solution: "(180 - " + vertex + ") / 2 = " + expected + " degrees.",
          visual: { type: "triangle", title: "Equal base angles", lines: ["Vertex " + vertex, "Base angles match"] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function areaPerimeterUnits(v) {
    const templates = [
      () => {
        const items = [
          { base: 12, height: 7 },
          { base: 9, height: 14 },
          { base: 18, height: 5 },
          { base: 16, height: 11 }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("area-perimeter-units", "Area Of Any Triangle", {
          prompt: "Find the area of a triangle with base " + item.base + " cm and height " + item.height + " cm.",
          expected: item.base * item.height / 2,
          hint1: "Triangle area is half of the matching rectangle/parallelogram.",
          hint2: "Use base x height / 2.",
          solution: item.base + " x " + item.height + " / 2 = " + (item.base * item.height / 2) + " cm^2.",
          visual: { type: "triangle", title: "Triangle area", lines: ["base " + item.base, "height " + item.height, "half the rectangle"] }
        }));
      },
      () => {
        const outer = pick([10, 12, 15, 14], v);
        const inner = pick([4, 5, 6, 3], v);
        return numberProblem(moduleProblem("area-perimeter-units", "Shaded Region", {
          prompt: "A square of side " + inner + " cm is inside a square of side " + outer + " cm. What is the shaded area outside the small square?",
          expected: outer * outer - inner * inner,
          hint1: "Find the big area and the small area.",
          hint2: "Subtract small from big.",
          solution: outer + "^2 - " + inner + "^2 = " + (outer * outer - inner * inner) + " cm^2.",
          visual: { title: "Shaded area", lines: ["Big square area", "Small square area", "Subtract"] }
        }));
      },
      () => {
        const item = pick([
          { small: 5, bigM: 2 },
          { small: 4, bigM: 1.2 },
          { small: 10, bigM: 3 },
          { small: 2, bigM: 0.8 }
        ], v);
        const bigCm = item.bigM * 100;
        const perSide = bigCm / item.small;
        const expected = perSide * perSide;
        return numberProblem(moduleProblem("area-perimeter-units", "Area Unit Conversion", {
          prompt: "How many squares of side length " + item.small + " cm fit into a square of side length " + item.bigM + " m?",
          expected,
          hint1: "Convert the " + item.bigM + " m side length into cm first.",
          hint2: item.bigM + " m = " + bigCm + " cm. Along one side: " + bigCm + " / " + item.small + " = " + perSide + " small squares.",
          solution: perSide + " fit along the width and " + perSide + " along the height. " + perSide + " x " + perSide + " = " + expected + ".",
          visual: { title: "Length to area", lines: ["Convert length first", "Then square the count"] }
        }));
      },
      () => {
        const item = pick([
          { offset: 3, multiplier: 2 },
          { offset: 5, multiplier: 3 },
          { offset: 4, multiplier: 4 },
          { offset: 6, multiplier: 5 }
        ], v);
        const xCoeff = 2 + 2 * item.multiplier;
        const constant = 2 * item.offset;
        const expected = xCoeff + "x + " + constant;
        return expressionProblem(moduleProblem("area-perimeter-units", "Algebraic Perimeter", {
          prompt: "A rectangle has sides x + " + item.offset + " and " + item.multiplier + "x. Which expression is its perimeter?",
          expected,
          choices: [expected, item.multiplier + "x^2 + " + (item.multiplier * item.offset) + "x", (item.multiplier + 1) + "x + " + item.offset, (2 * item.multiplier) + "x + " + constant],
          hint1: "Perimeter is all four sides.",
          hint2: "2(x + " + item.offset + ") + 2(" + item.multiplier + "x).",
          solution: "2x + " + constant + " + " + (2 * item.multiplier) + "x = " + expected + ".",
          visual: { title: "Perimeter not area", lines: ["Around the outside", "Add all four sides"] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function coordinatesAreaChallenges(v) {
    const templates = [
      () => {
        const item = pick([
          { x: -3, y1: 2, y2: 14 },
          { x: 5, y1: -6, y2: 7 },
          { x: -8, y1: -4, y2: 11 },
          { x: 2, y1: 9, y2: -5 }
        ], v);
        const expected = Math.abs(item.y2 - item.y1);
        return numberProblem(moduleProblem("coordinates-area-challenges", "Vertical Coordinate Distance", {
          prompt: "What is the distance between (" + item.x + ", " + item.y1 + ") and (" + item.x + ", " + item.y2 + ")?",
          expected,
          hint1: "The x-coordinate is the same, so the distance is vertical.",
          hint2: "Subtract the y-values and use the positive distance.",
          solution: "|" + item.y2 + " - " + item.y1 + "| = " + expected + ".",
          visual: { title: "Vertical distance", lines: ["same x-coordinate", "distance = change in y"] }
        }));
      },
      () => {
        const item = pick([
          { x1: -4, y1: -1, x2: 8, y2: 5 },
          { x1: 2, y1: -6, x2: 11, y2: 4 },
          { x1: -7, y1: 3, x2: 5, y2: 10 },
          { x1: -9, y1: -5, x2: -1, y2: 6 }
        ], v);
        const width = Math.abs(item.x2 - item.x1);
        const height = Math.abs(item.y2 - item.y1);
        return numberProblem(moduleProblem("coordinates-area-challenges", "Rectangle From Coordinates", {
          prompt: "A rectangle has opposite corners (" + item.x1 + ", " + item.y1 + ") and (" + item.x2 + ", " + item.y2 + "). Its sides are parallel to the axes. What is its area?",
          expected: width * height,
          hint1: "Find the horizontal width and vertical height separately.",
          hint2: "Width = " + width + " and height = " + height + ".",
          solution: "Area = " + width + " x " + height + " = " + (width * height) + " square units.",
          visual: { title: "Axis-parallel rectangle", lines: ["width " + width, "height " + height] }
        }));
      },
      () => {
        const item = pick([
          { x1: -6, y: 2, x2: 4, topX: -1, topY: 8 },
          { x1: 3, y: -4, x2: 15, topX: 9, topY: 1 },
          { x1: -9, y: -2, x2: 5, topX: -2, topY: 4 },
          { x1: 1, y: 6, x2: 11, topX: 6, topY: -2 }
        ], v);
        const base = Math.abs(item.x2 - item.x1);
        const height = Math.abs(item.topY - item.y);
        return numberProblem(moduleProblem("coordinates-area-challenges", "Coordinate Triangle Area", {
          prompt: "A triangle has base from (" + item.x1 + ", " + item.y + ") to (" + item.x2 + ", " + item.y + ") and third point (" + item.topX + ", " + item.topY + "). What is its area?",
          expected: base * height / 2,
          hint1: "The base is horizontal, so its length is the change in x.",
          hint2: "The height is the vertical change from the base line to the third point.",
          solution: "Area = " + base + " x " + height + " / 2 = " + (base * height / 2) + " square units.",
          visual: { type: "triangle", title: "Coordinate triangle", lines: ["base " + base, "height " + height] }
        }));
      },
      () => {
        const item = pick([
          { a: "(3, -2)", b: "(3, 6)", answer: "y-axis", choices: ["y-axis", "x-axis", "neither axis", "both axes"] },
          { a: "(-5, 4)", b: "(7, 4)", answer: "x-axis", choices: ["x-axis", "y-axis", "neither axis", "both axes"] },
          { a: "(-2, -1)", b: "(-2, 9)", answer: "y-axis", choices: ["y-axis", "x-axis", "neither axis", "both axes"] },
          { a: "(6, 8)", b: "(-3, 8)", answer: "x-axis", choices: ["x-axis", "y-axis", "neither axis", "both axes"] }
        ], v);
        return choiceProblem(moduleProblem("coordinates-area-challenges", "Parallel Axis Name", {
          prompt: "The line from " + item.a + " to " + item.b + " is parallel to which axis?",
          choices: item.choices.map((label) => ({ value: label, label, isCorrect: label === item.answer })),
          hint1: "Same x-coordinate means vertical. Same y-coordinate means horizontal.",
          hint2: "A vertical line is parallel to the y-axis; a horizontal line is parallel to the x-axis.",
          solution: "The correct axis is the " + item.answer + ".",
          visual: { title: "Axis direction", lines: [item.a + " to " + item.b, item.answer] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function geometryEquationsChallengeModule(v) {
    const templates = [
      () => {
        const item = pick([
          { a: 7, b: 2, perimeter: 46 },
          { a: 5, b: 3, perimeter: 48 },
          { a: 9, b: 1, perimeter: 56 },
          { a: 4, b: 6, perimeter: 60 }
        ], v);
        const expected = (item.perimeter - 2 * item.a - 2 * item.b) / 4;
        return numberProblem(moduleProblem("geometry-equations-challenge", "Perimeter Equation For x", {
          prompt: "Use the perimeter to solve x. A rectangle has length x + " + item.a + " cm and width x + " + item.b + " cm. Its total perimeter is " + item.perimeter + " cm. What is x?",
          expected,
          hint1: "Perimeter means the distance around the outside: 2 lengths plus 2 widths.",
          hint2: "2(x + " + item.a + ") + 2(x + " + item.b + ") = " + item.perimeter + ".",
          solution: "Perimeter equation: 2(x + " + item.a + ") + 2(x + " + item.b + ") = " + item.perimeter + ". This simplifies to 4x + " + (2 * item.a + 2 * item.b) + " = " + item.perimeter + ", so x = " + expected + ".",
          visual: { title: "Perimeter equation", lines: ["perimeter = around the outside", "2 lengths + 2 widths", "solve x"] }
        }));
      },
      () => {
        const item = pick([
          { a: 1, width: 6, area: 78 },
          { a: 3, width: 5, area: 95 },
          { a: 5, width: 4, area: 84 },
          { a: 7, width: 3, area: 87 }
        ], v);
        const expected = (item.area / item.width - item.a) / 2;
        return numberProblem(moduleProblem("geometry-equations-challenge", "Rectangle Area Equation For x", {
          prompt: "Use the area to solve x. A rectangle has length 2x + " + item.a + " cm and width " + item.width + " cm. Its area is " + item.area + " square cm. What is x?",
          expected,
          hint1: "Area means the space inside: length times width.",
          hint2: "(2x + " + item.a + ") x " + item.width + " = " + item.area + ".",
          solution: "Area equation: (2x + " + item.a + ") x " + item.width + " = " + item.area + ". Divide by " + item.width + " to get 2x + " + item.a + " = " + (item.area / item.width) + ", so x = " + expected + ".",
          visual: { title: "Area equation", lines: ["area = inside space", "length x width", "solve x"] }
        }));
      },
      () => {
        const item = pick([
          { a: 4, width: 5, height: 3, volume: 195 },
          { a: 6, width: 4, height: 5, volume: 300 },
          { a: 2, width: 7, height: 4, volume: 280 },
          { a: 8, width: 6, height: 2, volume: 216 }
        ], v);
        const expected = item.volume / (item.width * item.height) - item.a;
        return numberProblem(moduleProblem("geometry-equations-challenge", "Cuboid Volume Equation For x", {
          prompt: "Use the volume to solve x. A cuboid has length x + " + item.a + " cm, width " + item.width + " cm, height " + item.height + " cm, and volume " + item.volume + " cubic cm. What is x?",
          expected,
          hint1: "Volume means the space inside a 3D shape: length times width times height.",
          hint2: "(x + " + item.a + ") x " + item.width + " x " + item.height + " = " + item.volume + ".",
          solution: "Volume equation: (x + " + item.a + ") x " + item.width + " x " + item.height + " = " + item.volume + ". Divide by " + (item.width * item.height) + " to get x + " + item.a + " = " + (item.volume / (item.width * item.height)) + ", so x = " + expected + ".",
          visual: { title: "Volume equation", lines: ["volume = 3D inside space", "length x width x height", "solve x"] }
        }));
      },
      () => {
        const item = pick([
          { a: 5, height: 12, area: 102 },
          { a: 3, height: 10, area: 90 },
          { a: 7, height: 8, area: 92 },
          { a: 1, height: 14, area: 112 }
        ], v);
        const expected = (2 * item.area / item.height) - item.a;
        return numberProblem(moduleProblem("geometry-equations-challenge", "Triangle Area Equation For x", {
          prompt: "Use the triangle area to solve x. A triangle has base x + " + item.a + " cm, height " + item.height + " cm, and area " + item.area + " square cm. What is x?",
          expected,
          hint1: "Triangle area is half of base times height.",
          hint2: "(x + " + item.a + ") x " + item.height + " / 2 = " + item.area + ".",
          solution: "Triangle area equation: (x + " + item.a + ") x " + item.height + " / 2 = " + item.area + ". This gives x + " + item.a + " = " + (2 * item.area / item.height) + ", so x = " + expected + ".",
          visual: { type: "triangle", title: "Triangle area equation", lines: ["area = base x height / 2", "solve x"] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function ratioProportion(v) {
    const templates = [
      () => {
        const item = pick([
          { boys: 15, girls: 18 },
          { boys: 12, girls: 20 },
          { boys: 21, girls: 14 },
          { boys: 16, girls: 24 }
        ], v);
        const expected = simplifiedRatio(item.girls, item.boys + item.girls);
        return ratioProblem(moduleProblem("ratio-proportion", "Fraction From Ratio", {
          prompt: "The ratio of boys to girls is " + item.boys + ":" + item.girls + ". What fraction of the school are girls? Give the simplified ratio-style fraction as numerator:denominator.",
          expected,
          hint1: "Girls are " + item.girls + " parts out of " + item.boys + " + " + item.girls + " parts.",
          hint2: item.girls + " out of " + (item.boys + item.girls) + " simplifies to " + expected[0] + ":" + expected[1] + ".",
          solution: "Girls = " + item.girls + "/(" + item.boys + " + " + item.girls + ") = " + expected[0] + "/" + expected[1] + ". Enter as " + expected[0] + ":" + expected[1] + ".",
          visual: { title: "Parts to total", lines: [item.boys + " boys parts", item.girls + " girls parts", (item.boys + item.girls) + " total parts"] }
        }));
      },
      () => {
        const item = pick([
          { boyParts: 4, girlParts: 5, boys: 220 },
          { boyParts: 3, girlParts: 7, boys: 156 },
          { boyParts: 5, girlParts: 6, boys: 250 },
          { boyParts: 2, girlParts: 9, boys: 84 }
        ], v);
        const boys = item.boys;
        const boyParts = item.boyParts;
        const girlParts = item.girlParts;
        const onePart = boys / boyParts;
        return numberProblem(moduleProblem("ratio-proportion", "Known Part To Total", {
          prompt: "The ratio of boys to girls is " + boyParts + ":" + girlParts + ". There are " + boys + " boys. How many pupils are there in total?",
          expected: onePart * (boyParts + girlParts),
          hint1: boyParts + " parts represent " + boys + " boys.",
          hint2: "Find 1 part, then multiply by the total number of parts.",
          solution: "1 part = " + boys + " / " + boyParts + " = " + onePart + ". Total parts = " + (boyParts + girlParts) + ", so total pupils = " + onePart + " x " + (boyParts + girlParts) + " = " + (onePart * (boyParts + girlParts)) + ".",
          visual: { type: "ratio", title: "Ratio bars", lines: ["Boys: " + boyParts + " parts = " + boys, "Girls: " + girlParts + " parts"] }
        }));
      },
      () => {
        const item = pick([
          { boyParts: 4, girlParts: 7, difference: 51 },
          { boyParts: 3, girlParts: 5, difference: 42 },
          { boyParts: 5, girlParts: 8, difference: 66 },
          { boyParts: 2, girlParts: 6, difference: 72 }
        ], v);
        const onePart = item.difference / (item.girlParts - item.boyParts);
        const expected = onePart * (item.boyParts + item.girlParts);
        return numberProblem(moduleProblem("ratio-proportion", "Difference Between Parts", {
          prompt: "The ratio of boys to girls is " + item.boyParts + ":" + item.girlParts + ". There are " + item.difference + " more girls than boys. How many pupils are there in total?",
          expected,
          hint1: "The difference in ratio parts is " + item.girlParts + " - " + item.boyParts + " = " + (item.girlParts - item.boyParts) + " parts.",
          hint2: (item.girlParts - item.boyParts) + " parts represent " + item.difference + ", so 1 part represents " + onePart + ".",
          solution: "Total parts = " + (item.boyParts + item.girlParts) + ". One part = " + onePart + ". Total pupils = " + (item.boyParts + item.girlParts) + " x " + onePart + " = " + expected + ".",
          visual: { type: "ratio", title: "Difference parts", lines: ["Girls have " + (item.girlParts - item.boyParts) + " extra parts", (item.girlParts - item.boyParts) + " parts = " + item.difference] }
        }));
      },
      () => {
        const item = pick([
          { total: 55, lionParts: 3, tigerParts: 2, lionCubs: 12, tigerCubs: 5 },
          { total: 72, lionParts: 5, tigerParts: 4, lionCubs: 6, tigerCubs: 12 },
          { total: 63, lionParts: 2, tigerParts: 5, lionCubs: 10, tigerCubs: 3 },
          { total: 80, lionParts: 3, tigerParts: 5, lionCubs: 8, tigerCubs: 16 }
        ], v);
        const onePart = item.total / (item.lionParts + item.tigerParts);
        const lions = item.lionParts * onePart + item.lionCubs;
        const tigers = item.tigerParts * onePart + item.tigerCubs;
        const expected = simplifiedRatio(lions, tigers);
        return ratioProblem(moduleProblem("ratio-proportion", "New Ratio After Change", {
          prompt: "There are " + item.total + " big cats. Lions:tigers = " + item.lionParts + ":" + item.tigerParts + ". Then " + item.lionCubs + " lion cubs and " + item.tigerCubs + " tiger cubs are born. What is the new lion:tiger ratio?",
          expected,
          hint1: "First split " + item.total + " in the ratio " + item.lionParts + ":" + item.tigerParts + ".",
          hint2: (item.lionParts + item.tigerParts) + " parts = " + item.total + ", so one part = " + onePart + ". Then add the cubs.",
          solution: "Lions = " + (item.lionParts * onePart) + " + " + item.lionCubs + " = " + lions + ". Tigers = " + (item.tigerParts * onePart) + " + " + item.tigerCubs + " = " + tigers + ". New ratio = " + lions + ":" + tigers + ", which simplifies to " + expected[0] + ":" + expected[1] + ".",
          visual: { type: "ratio", title: "Ratio changes", lines: ["Start with " + item.lionParts + ":" + item.tigerParts, "Add new cubs", "Compare again"] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function threeDVolumeSpeed(v) {
    const templates = [
      () => {
        const items = [
          { l: 7, w: 4, h: 3 },
          { l: 12, w: 5, h: 2 },
          { l: 9, w: 6, h: 4 },
          { l: 8, w: 8, h: 5 }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("three-d-volume-speed", "Cuboid Volume", {
          prompt: "Find the volume of a cuboid with length " + item.l + " cm, width " + item.w + " cm, and height " + item.h + " cm.",
          expected: item.l * item.w * item.h,
          hint1: "Volume of a cuboid is length x width x height.",
          hint2: "Multiply all three dimensions.",
          solution: item.l + " x " + item.w + " x " + item.h + " = " + (item.l * item.w * item.h) + " cm^3.",
          visual: { title: "3D volume", lines: ["Length", "Width", "Height"] }
        }));
      },
      () => {
        const item = pick([
          { cubeSide: 0.5, bigM: 1 },
          { cubeSide: 1, bigM: 2 },
          { cubeSide: 2, bigM: 1 },
          { cubeSide: 2.5, bigM: 0.5 }
        ], v);
        const bigCm = item.bigM * 100;
        const perEdge = bigCm / item.cubeSide;
        const expected = perEdge ** 3;
        return numberProblem(moduleProblem("three-d-volume-speed", "Unit Cubes", {
          prompt: "How many cubes of side " + item.cubeSide + " cm fit into a cube of side " + item.bigM + " m?",
          expected,
          hint1: "Convert " + item.bigM + " m to " + bigCm + " cm first.",
          hint2: "Along one edge: " + bigCm + " / " + item.cubeSide + " = " + perEdge + " cubes.",
          solution: perEdge + " cubes fit along each edge. " + perEdge + " x " + perEdge + " x " + perEdge + " = " + expected + ".",
          visual: { title: "Cubic conversion", lines: [bigCm + " cm per edge", item.cubeSide + " cm cube edge", "Cube the edge count"] }
        }));
      },
      () => {
        const item = pick([
          { speed: 50, distance: 10 },
          { speed: 60, distance: 20 },
          { speed: 45, distance: 15 },
          { speed: 72, distance: 18 }
        ], v);
        const expected = item.distance / item.speed * 60;
        return numberProblem(moduleProblem("three-d-volume-speed", "Speed Time", {
          prompt: "Martha's speed is " + item.speed + " km/h. How many minutes does she take to travel " + item.distance + " km?",
          expected,
          hint1: item.speed + " km takes 1 hour, which is 60 minutes.",
          hint2: item.distance + " km is " + item.distance + "/" + item.speed + " of an hour.",
          solution: item.distance + " km takes " + item.distance + "/" + item.speed + " x 60 = " + expected + " minutes.",
          visual: { title: "Speed proportion", lines: [item.speed + " km -> 60 min", item.distance + " km -> ? min"] }
        }));
      },
      () => {
        const items = [
          { speed: 36, time: 20, expected: 12 },
          { speed: 72, time: 15, expected: 18 },
          { speed: 45, time: 40, expected: 30 },
          { speed: 60, time: 25, expected: 25 }
        ];
        const item = pick(items, v);
        return numberProblem(moduleProblem("three-d-volume-speed", "Distance From Speed", {
          prompt: "A journey is at " + item.speed + " km/h for " + item.time + " minutes. How many km is the journey?",
          expected: item.expected,
          hint1: "Convert minutes to a fraction of an hour.",
          hint2: item.time + " minutes = " + item.time + "/60 hours.",
          solution: item.speed + " x " + item.time + "/60 = " + item.expected + " km.",
          visual: { title: "Distance = speed x time", lines: ["Time must be in hours"] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function dataHandling(v) {
    const templates = [
      () => {
        const data = pick([
          [4, 8, 11, 13],
          [6, 7, 9, 18],
          [3, 5, 12, 20],
          [10, 10, 12, 16]
        ], v);
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        return numberProblem(moduleProblem("data-handling", "Mean", {
          prompt: "Find the mean of " + data.join(", ") + ".",
          expected: mean,
          hint1: "Mean = total divided by how many numbers.",
          hint2: "Add the values first.",
          solution: "Total = " + data.reduce((a, b) => a + b, 0) + ". Divide by " + data.length + " to get " + mean + ".",
          visual: { title: "Mean", lines: ["Total is your friend", "Divide by count"] }
        }));
      },
      () => {
        const data = pick([
          [8, 2, 5, 12, 9],
          [14, 3, 7, 7, 20],
          [11, 4, 15, 9, 6],
          [10, 18, 13, 12, 7]
        ], v);
        const sorted = data.slice().sort((a, b) => a - b);
        return numberProblem(moduleProblem("data-handling", "Median", {
          prompt: "Find the median of " + data.join(", ") + ".",
          expected: sorted[2],
          hint1: "Put the numbers in order first.",
          hint2: "The median is the middle value.",
          solution: "Ordered: " + sorted.join(", ") + ". The middle value is " + sorted[2] + ".",
          visual: { title: "Median", lines: ["Order first", "Find the middle"] }
        }));
      },
      () => {
        const data = pick([
          [4, 6, 6, 9, 10],
          [2, 3, 5, 5, 5, 8],
          [11, 12, 12, 14],
          [7, 7, 9, 10, 12]
        ], v);
        const counts = {};
        data.forEach((n) => counts[n] = (counts[n] || 0) + 1);
        const mode = Number(Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0]);
        return numberProblem(moduleProblem("data-handling", "Mode", {
          prompt: "Find the mode of " + data.join(", ") + ".",
          expected: mode,
          hint1: "The mode is the value that appears most often.",
          hint2: "Count repeats.",
          solution: mode + " appears the most, so the mode is " + mode + ".",
          visual: { title: "Mode", lines: ["Most often", "Count repeats"] }
        }));
      },
      () => {
        const aardvark = pick([8, 12, 15, 20], v);
        const cat = aardvark + 20;
        const bear = pick([10, 14, 18, 22], v);
        const total = aardvark + cat + bear;
        return numberProblem(moduleProblem("data-handling", "Chart Extraction", {
          prompt: "In a favourite-animal survey, Aardvark has " + aardvark + ", Cat has 20 more than Aardvark, and Black Bear has " + bear + ". How many children took part?",
          expected: total,
          hint1: "Find Cat first.",
          hint2: "Cat = " + aardvark + " + 20 = " + cat + ". Then add all categories.",
          solution: aardvark + " + " + cat + " + " + bear + " = " + total + ".",
          visual: { type: "bars", title: "Animal survey", bars: [{ label: "Aardvark", value: aardvark }, { label: "Cat", value: cat }, { label: "Bear", value: bear }] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function wordProblemArena(v) {
    const templates = [
      () => {
        const item = pick([
          { socks: [{ count: 4, colour: "grey" }, { count: 8, colour: "brown" }, { count: 6, colour: "blue" }] },
          { socks: [{ count: 5, colour: "black" }, { count: 7, colour: "white" }, { count: 3, colour: "green" }, { count: 9, colour: "red" }] },
          { socks: [{ count: 2, colour: "striped" }, { count: 10, colour: "navy" }, { count: 4, colour: "yellow" }] },
          { socks: [{ count: 6, colour: "purple" }, { count: 6, colour: "orange" }, { count: 6, colour: "silver" }, { count: 6, colour: "gold" }] }
        ], v);
        const list = item.socks.map((sock, index) => (index === item.socks.length - 1 ? "and " : "") + sock.count + " " + sock.colour + " socks").join(", ").replace(", and", " and");
        const expected = item.socks.length + 1;
        return numberProblem(moduleProblem("word-problem-arena", "Matching Pair Logic", {
          prompt: "A drawer has " + list + ". What is the least number of socks needed to be sure of a matching pair?",
          expected,
          hint1: "Think worst case first: one of each colour.",
          hint2: "There are " + item.socks.length + " colours, so after taking " + item.socks.length + " socks you might still have no pair.",
          solution: "The " + ordinalWord(expected) + " sock must match one of the " + item.socks.length + " colours already taken. Answer: " + expected + ".",
          visual: { title: "Worst case logic", lines: item.socks.map((sock) => sock.colour).concat([ordinalWord(expected) + " must match"]) }
        }));
      },
      () => {
        const item = pick([
          { small: 2, big: 5 },
          { small: 3, big: 7 },
          { small: 4, big: 9 },
          { small: 5, big: 8 }
        ], v);
        const expected = simplifiedRatio(item.small ** 2, item.big ** 2 - item.small ** 2);
        return ratioProblem(moduleProblem("word-problem-arena", "Small Square To Shaded Ratio", {
          prompt: "Two centred squares have side lengths " + item.small + " cm and " + item.big + " cm. What is the ratio of the small square area to the shaded region?",
          expected,
          hint1: "Find the two square areas.",
          hint2: "Small area = " + (item.small ** 2) + ". Big area = " + (item.big ** 2) + ". Shaded area = " + (item.big ** 2 - item.small ** 2) + ".",
          solution: "Small:shaded = " + expected[0] + ":" + expected[1] + ".",
          visual: { title: "Centred squares", lines: ["Small area " + item.small + "^2", "Big area " + item.big + "^2", "Shaded = big - small"] }
        }));
      },
      () => {
        const item = pick([
          { total: 125, multiplier: 2, offset: 5 },
          { total: 97, multiplier: 3, offset: 7 },
          { total: 82, multiplier: 2, offset: 10 },
          { total: 153, multiplier: 4, offset: 9 }
        ], v);
        const sam = (item.total - item.offset) / (item.multiplier + 2);
        const george = item.multiplier * sam;
        return numberProblem(moduleProblem("word-problem-arena", "Age Equation", {
          prompt: "George, Daniel, and Sam have ages totalling " + item.total + ". George is " + (item.multiplier === 2 ? "twice" : numberWord(item.multiplier) + " times") + " Sam. Daniel is " + item.offset + " years older than Sam. How old is George?",
          expected: george,
          hint1: "Let Sam be x.",
          hint2: "George = " + item.multiplier + "x and Daniel = x + " + item.offset + ".",
          solution: "x + " + item.multiplier + "x + (x + " + item.offset + ") = " + item.total + ", so " + (item.multiplier + 2) + "x = " + (item.total - item.offset) + " and x = " + sam + ". George = " + george + ".",
          visual: { title: "Age algebra", lines: ["Sam = x", "George = " + item.multiplier + "x", "Daniel = x + " + item.offset] }
        }));
      },
      () => {
        const item = pick([
          { x1: -7, y: 2, x2: 1, topX: -3, topY: 8 },
          { x1: -4, y: 1, x2: 6, topX: 1, topY: 7 },
          { x1: -9, y: -2, x2: 3, topX: -3, topY: 4 },
          { x1: 2, y: 3, x2: 12, topX: 7, topY: 9 }
        ], v);
        const base = Math.abs(item.x2 - item.x1);
        const height = Math.abs(item.topY - item.y);
        const expected = base * height / 2;
        return numberProblem(moduleProblem("word-problem-arena", "Coordinate Area", {
          prompt: "An isosceles triangle has base from (" + item.x1 + ", " + item.y + ") to (" + item.x2 + ", " + item.y + "), and top point (" + item.topX + ", " + item.topY + "). What is its area?",
          expected,
          hint1: "The base is horizontal. Find its length first.",
          hint2: "Base length = " + base + ". Height = " + item.topY + " - " + item.y + " = " + height + ".",
          solution: "Area = " + base + " x " + height + " / 2 = " + expected + " square units.",
          visual: { title: "Coordinate triangle", lines: ["Base length " + base, "Height " + height, "Use triangle area"] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function reviewPrep9ChallengeModule(v) {
    const sourceTag = "U2T3W4 Review Prep 9";
    const templates = [
      () => {
        const item = pick([
          { coeff: 4, p: -3, q: 7, y: 5 },
          { coeff: 6, p: -2, q: 8, y: 9 },
          { coeff: 5, p: -4, q: 6, y: 3 }
        ], v);
        const expected = item.coeff * item.q + item.p * item.y;
        return numberProblem(moduleProblem("review-prep-9-challenge", "Prep 9 Formula Substitution", {
          source: sourceTag + " question 1b",
          prompt: "Review Prep 9 style: If p = " + item.p + ", q = " + item.q + ", and y = " + item.y + ", find A = " + item.coeff + "q + py.",
          expected,
          hint1: "Substitute the values before doing any arithmetic.",
          hint2: item.coeff + "q = " + (item.coeff * item.q) + " and py = " + (item.p * item.y) + ".",
          solution: "A = " + item.coeff + " x " + item.q + " + (" + item.p + " x " + item.y + ") = " + expected + ".",
          visual: { title: "Formula substitution", lines: ["A = " + item.coeff + "q + py", "p = " + item.p + ", q = " + item.q + ", y = " + item.y, "watch the negative sign"] }
        }));
      },
      () => {
        const item = pick([
          { tonnes: 36000, grams: 0.6, object: "mini bars" },
          { tonnes: 18000, grams: 0.75, object: "sample packets" },
          { tonnes: 42000, grams: 1.2, object: "capsules" }
        ], v);
        const expected = item.tonnes * 1000000 / item.grams;
        return numberProblem(moduleProblem("review-prep-9-challenge", "Prep 9 Metric Unit Count", {
          source: sourceTag + " question 3",
          prompt: "Review Prep 9 style: A factory uses " + item.tonnes.toLocaleString("en-GB") + " tonnes of material. Each " + item.object + " uses " + item.grams + " g. How many " + item.object + " can be made?",
          expected,
          hint1: "Convert tonnes to grams first.",
          hint2: "1 tonne = 1,000,000 g, then divide by grams per item.",
          solution: item.tonnes.toLocaleString("en-GB") + " tonnes = " + (item.tonnes * 1000000).toLocaleString("en-GB") + " g. Divide by " + item.grams + " to get " + expected.toLocaleString("en-GB") + ".",
          visual: { title: "Metric unit count", lines: ["tonnes -> grams", "total grams / grams each", item.object] }
        }));
      },
      () => {
        const item = pick([
          { kind: "third", prompt: "Calculate 33 1/3% of 2460.", expected: 820, hint: "33 1/3% is one third." },
          { kind: "discount", prompt: "A jacket costs £180 before a 35% discount. What is the sale price?", expected: 117, hint: "A 35% discount leaves 65% of the price." },
          { kind: "grams", prompt: "Calculate 2.5% of 0.048 kg. Give your answer in grams.", expected: 1.2, hint: "Convert 0.048 kg to 48 g first." }
        ], v);
        return numberProblem(moduleProblem("review-prep-9-challenge", "Prep 9 Percentage Level", {
          source: sourceTag + " question 4",
          prompt: "Review Prep 9 style: " + item.prompt,
          expected: item.expected,
          hint1: item.hint,
          hint2: item.kind === "third" ? "2460 / 3 = 820." : item.kind === "discount" ? "65% of 180 is 0.65 x 180." : "2.5% means multiply by 0.025.",
          solution: item.kind === "third" ? "33 1/3% is one third, and 2460 / 3 = 820." : item.kind === "discount" ? "Sale price = 65% of £180 = £117." : "0.048 kg = 48 g, and 2.5% of 48 g is 1.2 g.",
          visual: { title: "Percentage level", lines: [item.kind, "choose the right percentage route", "then calculate"] }
        }));
      },
      () => {
        const item = pick([
          { length: 7, width: 8, height: 11 },
          { length: 4, width: 9, height: 10 },
          { length: 5, width: 6, height: 12 }
        ], v);
        const expected = cuboidSurfaceArea(item.length, item.width, item.height);
        return numberProblem(moduleProblem("review-prep-9-challenge", "Prep 9 Cuboid Surface Area", {
          source: sourceTag + " question 5a",
          prompt: "Review Prep 9 style: What is the total surface area of a cuboid measuring " + item.length + " cm by " + item.width + " cm by " + item.height + " cm?",
          expected,
          hint1: "A cuboid has three pairs of equal rectangular faces.",
          hint2: "Surface area = 2(lw + lh + wh).",
          solution: "Surface area = 2(" + (item.length * item.width) + " + " + (item.length * item.height) + " + " + (item.width * item.height) + ") = " + expected + " cm^2.",
          visual: { title: "Cuboid surface area", lines: ["front/back", "top/bottom", "left/right"] }
        }));
      },
      () => {
        const item = pick([
          { n: 420 },
          { n: 630 },
          { n: 2024 }
        ], v);
        const expected = largestOddDivisor(item.n);
        return numberProblem(moduleProblem("review-prep-9-challenge", "Prep 9 Largest Odd Divisor", {
          source: sourceTag + " question 6b",
          prompt: "Review Prep 9 style: " + item.n + " = " + factorString(item.n) + ". By considering the prime factorised form, what is the largest odd number that divides exactly into " + item.n + "?",
          expected,
          hint1: "Odd means remove every factor of 2.",
          hint2: "Keep all the odd prime factors.",
          solution: factorString(item.n) + " has all the powers of 2 removed, leaving " + expected + ".",
          visual: { title: "Largest odd divisor", lines: [factorString(item.n), "remove 2s", "keep odd factors"] }
        }));
      },
      () => {
        const item = pick([
          { boys: 6, angle: 108 },
          { boys: 9, angle: 135 },
          { boys: 13, angle: 120 }
        ], v);
        const total = 360 * item.boys / item.angle;
        const expected = 360 * (item.boys + 1) / (total + 1);
        return numberProblem(moduleProblem("review-prep-9-challenge", "Prep 9 Pie Chart Change", {
          source: sourceTag + " question 7b",
          prompt: "Review Prep 9 style: A class pie chart shows " + item.boys + " boys as " + item.angle + " degrees. The next day one more boy joins. What is the new angle for boys?",
          expected,
          hint1: "Use the old angle to find the old class total.",
          hint2: "Old total = 360 x boys / old angle.",
          solution: "Old total = 360 x " + item.boys + " / " + item.angle + " = " + total + ". New boys = " + (item.boys + 1) + " and new total = " + (total + 1) + ", so angle = " + expected + " degrees.",
          visual: { title: "Changing pie chart", lines: ["old angle -> old total", "add one boy", "new fraction x 360"] }
        }));
      }
    ];
    return templates[v % templates.length]();
  }

  function reviewPrep9RefreshedBankModule(v) {
    function formula(classic, coeff, p, q, y) {
      const expected = coeff * q + p * y;
      return numberProblem(moduleProblem("review-prep-9-challenge", classic, {
        source: "U2T3W4 Review Prep 9 question 1b",
        prompt: "Review Prep 9: If p = " + p + ", q = " + q + ", and y = " + y + ", find A = " + coeff + "q + py.",
        expected,
        hint1: "Substitute p, q, and y before doing the arithmetic.",
        hint2: coeff + "q = " + (coeff * q) + " and py = " + (p * y) + ".",
        solution: "A = " + coeff + " x " + q + " + (" + p + " x " + y + ") = " + expected + ".",
        visual: { title: "Prep 9 Q1b formula", lines: ["A = " + coeff + "q + py", "p = " + p + ", q = " + q + ", y = " + y, "keep the sign of p"] }
      }));
    }

    function metric(classic, amount, unit, gramsEach, object) {
      const grams = unit === "tonnes" ? amount * 1000000 : amount * 1000;
      const expected = grams / gramsEach;
      return numberProblem(moduleProblem("review-prep-9-challenge", classic, {
        source: "U2T3W4 Review Prep 9 question 3",
        prompt: "Review Prep 9: " + amount.toLocaleString("en-GB") + " " + unit + " of material is split into " + object + " of " + gramsEach + " g each. How many " + object + " can be made?",
        expected,
        hint1: unit === "tonnes" ? "Convert tonnes to grams first." : "Convert kilograms to grams first.",
        hint2: "Number made = total grams divided by grams per item.",
        solution: amount.toLocaleString("en-GB") + " " + unit + " = " + grams.toLocaleString("en-GB") + " g. Then " + grams.toLocaleString("en-GB") + " / " + gramsEach + " = " + expected.toLocaleString("en-GB") + ".",
        visual: { title: "Prep 9 Q3 metric units", lines: [unit + " -> grams", "total grams / grams each", object] }
      }));
    }

    function percentage(classic, prompt, expected, hint1, hint2, solution) {
      return numberProblem(moduleProblem("review-prep-9-challenge", classic, {
        source: "U2T3W4 Review Prep 9 question 4",
        prompt: "Review Prep 9: " + prompt,
        expected,
        hint1,
        hint2,
        solution,
        visual: { title: "Prep 9 Q4 percentage", lines: ["identify the percentage", "convert if needed", "calculate"] }
      }));
    }

    function surface(classic, length, width, height) {
      const expected = cuboidSurfaceArea(length, width, height);
      return numberProblem(moduleProblem("review-prep-9-challenge", classic, {
        source: "U2T3W4 Review Prep 9 question 5a",
        prompt: "Review Prep 9: A cuboid measuring " + length + " cm by " + width + " cm by " + height + " cm is painted on every face. What is its total surface area?",
        expected,
        hint1: "Painted on every face means surface area, not volume.",
        hint2: "Use 2(lw + lh + wh).",
        solution: "Surface area = 2(" + (length * width) + " + " + (length * height) + " + " + (width * height) + ") = " + expected + " cm^2.",
        visual: { title: "Prep 9 Q5a surface area", lines: ["2 x length x width", "2 x length x height", "2 x width x height"] }
      }));
    }

    function oddDivisor(classic, n) {
      const expected = largestOddDivisor(n);
      return numberProblem(moduleProblem("review-prep-9-challenge", classic, {
        source: "U2T3W4 Review Prep 9 question 6b",
        prompt: "Review Prep 9: " + n + " = " + factorString(n) + ". What is the largest odd number that divides exactly into " + n + "?",
        expected,
        hint1: "Odd numbers have no factor of 2.",
        hint2: "Remove all the 2s from the prime factorisation and multiply what is left.",
        solution: "From " + factorString(n) + ", remove every factor of 2. The largest odd divisor is " + expected + ".",
        visual: { title: "Prep 9 Q6b odd divisor", lines: [factorString(n), "remove all 2s", "multiply the odd factors"] }
      }));
    }

    function pieChange(classic, boys, oldAngle) {
      const oldTotal = 360 * boys / oldAngle;
      const newBoys = boys + 1;
      const newTotal = oldTotal + 1;
      const expected = 360 * newBoys / newTotal;
      return numberProblem(moduleProblem("review-prep-9-challenge", classic, {
        source: "U2T3W4 Review Prep 9 question 7b",
        prompt: "Review Prep 9: A pie chart shows " + boys + " boys as " + oldAngle + " degrees. One more boy joins the class. What is the new angle for boys?",
        expected,
        hint1: "Use the old angle to find the old class total.",
        hint2: "Old total = 360 x boys / old angle.",
        solution: "Old total = 360 x " + boys + " / " + oldAngle + " = " + oldTotal + ". New boys = " + newBoys + " and new total = " + newTotal + ". New angle = 360 x " + newBoys + " / " + newTotal + " = " + expected + " degrees.",
        visual: { title: "Prep 9 Q7b pie change", lines: ["old angle -> old total", "add one boy", "new fraction x 360"] }
      }));
    }

    const items = [
      formula("Prep 9 Q1b Formula Refresh A", 4, -5, 9, 6),
      formula("Prep 9 Q1b Formula Refresh B", 7, -3, 5, 8),
      formula("Prep 9 Q1b Formula Refresh C", 6, -4, 7, 9),
      formula("Prep 9 Q1b Formula Refresh D", 5, -6, 8, 4),
      metric("Prep 9 Q3 Tonnes Refresh A", 24000, "tonnes", 0.8, "mini bars"),
      metric("Prep 9 Q3 Kilograms Refresh B", 15000, "kilograms", 0.5, "sample packets"),
      metric("Prep 9 Q3 Tonnes Refresh C", 42, "tonnes", 0.7, "science capsules"),
      percentage("Prep 9 Q4a One Third Refresh A", "Calculate 33 1/3% of 2940.", 980, "33 1/3% is one third.", "Divide 2940 by 3.", "2940 / 3 = 980."),
      percentage("Prep 9 Q4a One Third Refresh B", "Calculate 33 1/3% of 1680.", 560, "33 1/3% is one third.", "Divide 1680 by 3.", "1680 / 3 = 560."),
      percentage("Prep 9 Q4b Sale Price Refresh A", "A jacket costs £240 before a 25% discount. What is the sale price?", 180, "A 25% discount leaves 75%.", "75% of 240 is 0.75 x 240.", "Sale price = £180."),
      percentage("Prep 9 Q4b Sale Price Refresh B", "A bike costs £360 before a 15% discount. What is the sale price?", 306, "A 15% discount leaves 85%.", "85% of 360 is 0.85 x 360.", "Sale price = £306."),
      percentage("Prep 9 Q4c Gram Percentage Refresh", "Calculate 4% of 0.075 kg. Give your answer in grams.", 3, "Convert 0.075 kg to 75 g first.", "4% is 0.04.", "0.04 x 75 g = 3 g."),
      surface("Prep 9 Q5a Surface Refresh A", 6, 7, 10),
      surface("Prep 9 Q5a Surface Refresh B", 8, 9, 5),
      surface("Prep 9 Q5a Surface Refresh C", 4, 11, 13),
      surface("Prep 9 Q5a Surface Refresh D", 12, 5, 6),
      oddDivisor("Prep 9 Q6b Odd Divisor Refresh A", 840),
      oddDivisor("Prep 9 Q6b Odd Divisor Refresh B", 2772),
      pieChange("Prep 9 Q7b Pie Change Refresh A", 9, 135),
      pieChange("Prep 9 Q7b Pie Change Refresh B", 5, 120)
    ];
    return items[v % items.length];
  }

  function challengeFields(moduleId, classic, fields) {
    const module = MODULE_BY_ID[moduleId];
    return moduleProblem(moduleId, "Challenge: " + classic, {
      isChallenge: true,
      source: fields.source || module.source + "; JMC/PMC-inspired challenge variation",
      skill: fields.skill || "Challenge reasoning: " + classic,
      formatHint: fields.formatHint || "Challenge question. Read carefully, choose a route, then check.",
      visual: fields.visual || { title: "Challenge: " + classic, lines: [fields.prompt, fields.hint1] },
      ...fields
    });
  }

  function challengeNumber(moduleId, classic, fields) {
    return numberProblem(challengeFields(moduleId, classic, fields));
  }

  function challengeRatio(moduleId, classic, fields) {
    return ratioProblem(challengeFields(moduleId, classic, fields));
  }

  function challengeExpression(moduleId, classic, fields) {
    return expressionProblem(challengeFields(moduleId, classic, fields));
  }

  function challengeChoice(moduleId, classic, fields) {
    return choiceProblem(challengeFields(moduleId, classic, fields));
  }

  function challengeText(moduleId, classic, fields) {
    return textProblem(challengeFields(moduleId, classic, fields));
  }

  function placeValueScalesChallenge(v) {
    const templates = [
      () => { const n = 6080402; return challengeNumber("place-value-scales", "Hidden Place Value Difference", { prompt: "Challenge: In " + n.toLocaleString("en-GB") + ", subtract the value of digit 8 from the value of digit 6.", expected: 5992000, hint1: "Find each digit's place value before subtracting.", hint2: "6 is worth 6,000,000 and 8 is worth 8,000.", solution: "6,000,000 - 8,000 = 5,992,000.", visual: { title: "Place-value gap", lines: ["6,000,000", "8,000", "subtract values"] } }); },
      () => { const a = 34850, b = 35149; return challengeNumber("place-value-scales", "Rounding Interval Count", { prompt: "Challenge: How many whole numbers from " + a.toLocaleString("en-GB") + " to " + b.toLocaleString("en-GB") + " inclusive round to 35,000 to the nearest thousand?", expected: 300, hint1: "Nearest-thousand interval for 35,000 is 34,500 to 35,499.", hint2: "Count only the overlap with the given range.", solution: "All numbers from 34,850 to 35,149 work, so there are 35,149 - 34,850 + 1 = 300.", visual: { type: "scale", start: 34500, step: 100, tick: 5 } }); },
      () => { const start = 2.4, step = 0.35, tick = 7; return challengeNumber("place-value-scales", "Decimal Scale Trap", { prompt: "Challenge: A scale starts at " + start + " and each tick is worth " + step + ". What is the value at tick " + tick + "?", expected: start + step * tick, hint1: "Do not count the start as tick 1.", hint2: "Add 7 steps of 0.35 to 2.4.", solution: "2.4 + 7 x 0.35 = 4.85.", visual: { type: "scale", start, step, tick } }); },
      () => { const n = 730605; return challengeNumber("place-value-scales", "Digit Value Sum", { prompt: "Challenge: In " + n.toLocaleString("en-GB") + ", add the values of all non-zero digits.", expected: n, hint1: "Zero digits add nothing, but the place values stay large.", hint2: "700,000 + 30,000 + 600 + 5.", solution: "The non-zero digit values add to 730,605.", visual: { title: "Non-zero place values", lines: ["700,000", "30,000", "600", "5"] } }); },
      () => { const low = 2500, high = 3499; return challengeNumber("place-value-scales", "Both Roundings", { prompt: "Challenge: How many whole numbers round to 3000 to the nearest 1000 and to 3000 to the nearest 100?", expected: 100, hint1: "Nearest 100 must be tighter than nearest 1000.", hint2: "Nearest 100 interval for 3000 is 2950 to 3049.", solution: "The nearest-100 interval sits inside the nearest-1000 interval, so 2950 to 3049 gives 100 numbers.", visual: { type: "scale", start: low, step: 100, tick: 5 } }); },
      () => { const n = 9123456; return challengeNumber("place-value-scales", "Middle Digit Removal", { prompt: "Challenge: Remove the digit 2 from " + n.toLocaleString("en-GB") + " and close the gap. How much smaller is the new number?", expected: 8210000, hint1: "Compare 9,123,456 with 913,456.", hint2: "Closing the gap changes every digit after the removed digit.", solution: "9,123,456 - 913,456 = 8,210,000.", visual: { title: "Remove a digit", lines: ["9,123,456", "913,456", "compare"] } }); },
      () => { const n = 407050; return challengeNumber("place-value-scales", "Ten Times Digit Value", { prompt: "Challenge: In " + n.toLocaleString("en-GB") + ", which digit value is ten times the value of the digit 7?", expected: 7000, hint1: "The 7 is worth 700.", hint2: "Ten times 700 is 7000.", solution: "The digit value needed is 7000.", visual: { title: "Times ten place jump", lines: ["7 hundreds", "ten times", "7 thousands"] } }); },
      () => { return challengeNumber("place-value-scales", "Scale Reverse Step", { prompt: "Challenge: Tick 3 on a scale is 18.5 and tick 9 is 41.5. What is the value of tick 0?", expected: 7, hint1: "Six tick steps take you from 18.5 to 41.5.", hint2: "One step is 23 / 6.", solution: "Step = (41.5 - 18.5) / 6 = 23/6. Tick 0 = 18.5 - 3 x 23/6 = 7.", visual: { type: "scale", start: 7, step: 23 / 6, tick: 3 } }); },
      () => { return challengeNumber("place-value-scales", "Smallest Rounded Number", { prompt: "Challenge: What is the smallest whole number that rounds to 72,000 to the nearest thousand and has digit sum 12?", expected: 72003, hint1: "The number must be from 71,500 to 72,499.", hint2: "Every 71,5xx number already has digit sum at least 13, so move to 72,000 upward.", solution: "71,500 is the first number in the rounding interval, but its digit sum is already 13. At 72,000 the digit sum is 9, so the smallest way to reach 12 is 72,003.", expectedDisplay: "72003", visual: { title: "Rounding and digit sum", lines: ["Allowed: 71,500 to 72,499", "Digit sum must be 12", "72,003 is first"] } }); },
      () => { return challengeNumber("place-value-scales", "Product Of Place Values", { prompt: "Challenge: In 5,042,030, divide the value of digit 5 by the value of digit 4.", expected: 125, hint1: "Use place values, not the digits themselves.", hint2: "5,000,000 / 40,000.", solution: "5,000,000 / 40,000 = 125.", visual: { title: "Place values divide", lines: ["5,000,000", "40,000", "divide"] } }); }
    ];
    return templates[v % templates.length]();
  }

  function slickSumsFourRulesChallenge(v) {
    const templates = [
      () => challengeNumber("slick-sums-four-rules", "Operation Chain", { prompt: "Challenge: Start with 18, multiply by 7, subtract 26, then divide by 5. What is the result?", expected: 20, hint1: "Keep the order exactly as written.", hint2: "18 x 7 = 126, then subtract 26.", solution: "(18 x 7 - 26) / 5 = 20." }),
      () => challengeNumber("slick-sums-four-rules", "Missing Digit Sum", { prompt: "Challenge: 4?6 + 2?8 = 705. The two ? digits are different. What is their sum?", expected: 9, hint1: "Use column addition.", hint2: "Units give 6 + 8 = 14, so carry 1.", solution: "Tens: a + b + 1 must end in 0 and carry 1, so a + b = 9. Hundreds 4 + 2 + 1 = 7. The sum is 9.", expectedDisplay: "9" }),
      () => challengeNumber("slick-sums-four-rules", "Factor Shortcut", { prompt: "Challenge: Calculate 37 x 48 + 63 x 48 without long multiplication.", expected: 4800, hint1: "Both terms share x 48.", hint2: "(37 + 63) x 48.", solution: "37 x 48 + 63 x 48 = 100 x 48 = 4800." }),
      () => challengeNumber("slick-sums-four-rules", "Reverse Remainder", { prompt: "Challenge: A number gives remainder 5 when divided by 9. What remainder does three times the number give when divided by 9?", expected: 6, hint1: "Use the remainder only.", hint2: "3 x 5 = 15, and 15 leaves remainder 6 on division by 9.", solution: "The remainder is 6." }),
      () => challengeNumber("slick-sums-four-rules", "Balanced Product", { prompt: "Challenge: Which number must replace ? so that 24 x 35 = 12 x ?", expected: 70, hint1: "24 is double 12.", hint2: "If one factor halves, the other must double.", solution: "24 x 35 = 12 x 70." }),
      () => challengeNumber("slick-sums-four-rules", "Decimal Compensation", { prompt: "Challenge: Calculate 19.8 x 25 mentally.", expected: 495, hint1: "25 is a quarter of 100.", hint2: "19.8 x 100 = 1980, then divide by 4.", solution: "19.8 x 25 = 495." }),
      () => challengeNumber("slick-sums-four-rules", "Two-Step Missing Number", { prompt: "Challenge: (? + 35) x 4 = 308. What is ?", expected: 42, hint1: "Undo multiplying by 4 first.", hint2: "308 / 4 = 77.", solution: "? + 35 = 77, so ? = 42." }),
      () => challengeNumber("slick-sums-four-rules", "Largest Result", { prompt: "Challenge: Put brackets into 6 + 8 x 5 - 3 to make the largest possible value. What is that value?", expected: 67, hint1: "Try making the addition happen before the multiplication.", hint2: "(6 + 8) x 5 - 3.", solution: "(6 + 8) x 5 - 3 = 67." }),
      () => challengeNumber("slick-sums-four-rules", "Difference Of Products", { prompt: "Challenge: Calculate 51 x 49 using a square-number shortcut.", expected: 2499, hint1: "51 x 49 is (50 + 1)(50 - 1).", hint2: "Use 50^2 - 1^2.", solution: "2500 - 1 = 2499." }),
      () => challengeNumber("slick-sums-four-rules", "Hidden Average", { prompt: "Challenge: The sum of five consecutive whole numbers is 365. What is the largest number?", expected: 75, hint1: "The middle number is the average.", hint2: "365 / 5 = 73.", solution: "The numbers are 71, 72, 73, 74, 75." })
    ];
    return templates[v % templates.length]();
  }

  function bidmasPowersChallenge(v) {
    const templates = [
      () => challengeNumber("bidmas-powers", "Power Bracket Trap", { prompt: "Challenge: Calculate 3 + 2^3 x (14 - 9).", expected: 43, hint1: "Brackets, powers, multiplication, addition.", hint2: "2^3 = 8 and 14 - 9 = 5.", solution: "3 + 8 x 5 = 43." }),
      () => challengeNumber("bidmas-powers", "Missing Bracket Value", { prompt: "Challenge: 4 x ( ? - 3 ) + 7 = 39. What is ?", expected: 11, hint1: "Undo +7, then divide by 4.", hint2: "? - 3 = 8.", solution: "Undoing the equation gives ? - 3 = 8, so ? = 11." }),
      () => challengeNumber("bidmas-powers", "Compare Powers", { prompt: "Challenge: How much larger is 5^3 than 3^4?", expected: 44, hint1: "Evaluate both powers first.", hint2: "5^3 = 125 and 3^4 = 81.", solution: "125 - 81 = 44." }),
      () => challengeNumber("bidmas-powers", "Nested BIDMAS", { prompt: "Challenge: Calculate (6 + 2)^2 - 3 x (4 + 5).", expected: 37, hint1: "Work inside brackets first.", hint2: "8^2 - 3 x 9.", solution: "64 - 27 = 37." }),
      () => challengeNumber("bidmas-powers", "Index Equation", { prompt: "Challenge: 2^? + 17 = 81. What is ?", expected: 6, hint1: "Subtract 17 first.", hint2: "2^? = 64.", solution: "2^6 = 64, so ? = 6." }),
      () => challengeNumber("bidmas-powers", "Power Of A Sum", { prompt: "Challenge: Calculate (4 + 3)^2 - 4^2 - 3^2.", expected: 24, hint1: "Do not square 4 and 3 separately first.", hint2: "7^2 - 16 - 9.", solution: "49 - 25 = 24." }),
      () => challengeNumber("bidmas-powers", "Repeated Operation", { prompt: "Challenge: Starting with 2, square it, add 5, then square the result. What do you get?", expected: 81, hint1: "Square 2 first.", hint2: "2^2 + 5 = 9.", solution: "First 2^2 + 5 = 9, then squaring 9 gives 81." }),
      () => challengeNumber("bidmas-powers", "Fraction BIDMAS", { prompt: "Challenge: Calculate 48 / (2^3 - 2).", expected: 8, hint1: "Find the bracket first.", hint2: "2^3 - 2 = 6.", solution: "48 / 6 = 8." }),
      () => challengeNumber("bidmas-powers", "Make 100", { prompt: "Challenge: What value of n makes 3 x n^2 + 25 = 100?", expected: 5, hint1: "Undo +25 then divide by 3.", hint2: "n^2 = 25.", solution: "The equation becomes n^2 = 25, so the positive value is n = 5." }),
      () => challengeNumber("bidmas-powers", "Order Difference", { prompt: "Challenge: What is the difference between 2 + 3 x 4^2 and (2 + 3 x 4)^2?", expected: 146, hint1: "Evaluate the two expressions separately.", hint2: "2 + 3 x 16 = 50; (2 + 12)^2 = 196.", solution: "196 - 50 = 146.", expectedDisplay: "146" })
    ];
    return templates[v % templates.length]();
  }

  function fractionsDecimalsPercentagesChallenge(v) {
    const templates = [
      () => challengeNumber("fractions-decimals-percentages", "Fraction Of Remainder", { prompt: "Challenge: A box has 120 sweets. Ali takes 1/3, then Bea takes 25% of what remains. How many sweets are left?", expected: 60, hint1: "Work in order; Bea takes a percentage of the remainder.", hint2: "After Ali, 80 remain. Bea takes 20.", solution: "120 - 40 - 20 = 60." }),
      () => challengeNumber("fractions-decimals-percentages", "Reverse Percentage", { prompt: "Challenge: After a 20% discount, a bag costs £36. What was the original price?", expected: 45, hint1: "£36 is 80% of the original.", hint2: "Divide by 0.8.", solution: "36 / 0.8 = 45." }),
      () => challengeNumber("fractions-decimals-percentages", "Percent Increase Then Decrease", { prompt: "Challenge: A number is increased by 50% and then decreased by 20%. If it starts at 70, what is the final number?", expected: 84, hint1: "Use multipliers.", hint2: "70 x 1.5 x 0.8.", solution: "70 x 1.5 x 0.8 = 84." }),
      () => challengeRatio("fractions-decimals-percentages", "Decimal To Ratio", { prompt: "Challenge: Write 0.375 as a ratio to 1 in simplest form.", expected: [3, 8], hint1: "0.375 = 375/1000.", hint2: "Simplify by 125.", solution: "0.375:1 = 3:8." }),
      () => challengeNumber("fractions-decimals-percentages", "Fraction Chain", { prompt: "Challenge: What is 2/3 of 3/5 of 150?", expected: 60, hint1: "Multiply in any order.", hint2: "3/5 of 150 is 90.", solution: "2/3 of 90 = 60." }),
      () => challengeNumber("fractions-decimals-percentages", "Missing Percent", { prompt: "Challenge: 18 is what percentage of 72?", expected: 25, hint1: "Use part / whole x 100.", hint2: "18/72 = 1/4.", solution: "18/72 simplifies to 1/4, which is 25%." }),
      () => challengeNumber("fractions-decimals-percentages", "Recurring Pattern", { prompt: "Challenge: Which is bigger: 5/8 or 0.62? Give the difference as a decimal.", expected: 0.005, hint1: "Convert 5/8 to a decimal.", hint2: "5/8 = 0.625.", solution: "0.625 - 0.62 = 0.005." }),
      () => challengeNumber("fractions-decimals-percentages", "Percent Of Percent", { prompt: "Challenge: 40% of a class are boys. 25% of the boys wear glasses. What percentage of the whole class are boys with glasses?", expected: 10, hint1: "Find 25% of 40%.", hint2: "0.25 x 40%.", solution: "10% of the whole class." }),
      () => challengeNumber("fractions-decimals-percentages", "Fraction Difference", { prompt: "Challenge: What is the difference between 3/4 of 96 and 5/8 of 96?", expected: 12, hint1: "Use the same whole.", hint2: "3/4 - 5/8 = 1/8.", solution: "1/8 of 96 = 12." }),
      () => challengeNumber("fractions-decimals-percentages", "Decimal Place Value", { prompt: "Challenge: Multiply 0.036 by 250.", expected: 9, hint1: "250 is 1000 divided by 4.", hint2: "0.036 x 1000 = 36, then divide by 4.", solution: "0.036 x 1000 = 36, and 36 / 4 = 9." })
    ];
    return templates[v % templates.length]();
  }

  function numberTypesPrimesChallenge(v) {
    const templates = [
      () => challengeNumber("number-types-primes", "Prime Interval Count", { prompt: "Challenge: How many prime numbers are there from 90 to 110 inclusive?", expected: 5, hint1: "Test only numbers with no factor 2, 3, 5, or 7.", hint2: "The primes are 97, 101, 103, 107, and 109.", solution: "There are 5 primes in the interval: 97, 101, 103, 107, and 109." }),
      () => challengeNumber("number-types-primes", "Prime Product", { prompt: "Challenge: A number is the product of the two primes 17 and 23. What is the number?", expected: 391, hint1: "This is a prime-factor product.", hint2: "17 x 23 = 17 x 20 + 17 x 3.", solution: "340 + 51 = 391." }),
      () => challengeNumber("number-types-primes", "LCM Above A Limit", { prompt: "Challenge: What is the smallest whole number greater than 250 that is divisible by 4, 6, and 9?", expected: 252, hint1: "Find the lowest common multiple first.", hint2: "LCM(4, 6, 9) = 36; then find the first multiple after 250.", solution: "36 x 6 = 216 and 36 x 7 = 252, so the answer is 252." }),
      () => challengeNumber("number-types-primes", "Square And Triangular", { prompt: "Challenge: Which number between 1 and 100 is both a square number and a triangular number, apart from 1?", expected: 36, hint1: "List triangular numbers and watch for square numbers.", hint2: "36 = 6^2 and also 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8.", solution: "36 is both square and triangular." }),
      () => challengeExpression("number-types-primes", "Prime Factor Form", { prompt: "Challenge: Write 756 as a product of prime factors using powers.", expected: "2^2 x 3^3 x 7", choices: ["2^2 x 3^3 x 7", "2 x 3^3 x 7", "2^2 x 3^2 x 7", "2^3 x 3^2 x 7"], hint1: "Divide by 2, then keep dividing by 3 while you can.", hint2: "756 = 4 x 189 = 2^2 x 3^3 x 7.", solution: "756 = 2^2 x 3^3 x 7." }),
      () => challengeNumber("number-types-primes", "Exactly Six Factors", { prompt: "Challenge: How many factors does 28 have?", expected: 6, hint1: "List them in pairs.", hint2: "1 x 28, 2 x 14, and 4 x 7.", solution: "The factors are 1, 2, 4, 7, 14, 28, so there are 6." }),
      () => challengeNumber("number-types-primes", "Highest Common Factor", { prompt: "Challenge: What is the highest common factor of 84 and 126?", expected: 42, hint1: "Use prime factors or common factor pairs.", hint2: "84 = 2 x 2 x 3 x 7 and 126 = 2 x 3 x 3 x 7.", solution: "The shared prime factors are 2 x 3 x 7 = 42." }),
      () => challengeNumber("number-types-primes", "Lowest Common Multiple", { prompt: "Challenge: What is the lowest common multiple of 18 and 24?", expected: 72, hint1: "Use the highest powers of all prime factors.", hint2: "18 = 2 x 3^2 and 24 = 2^3 x 3.", solution: "LCM = 2^3 x 3^2 = 72." }),
      () => challengeNumber("number-types-primes", "Square Cube Sum", { prompt: "Challenge: What is 7^2 + 4^3?", expected: 113, hint1: "Evaluate each power before adding.", hint2: "7^2 = 49 and 4^3 = 64.", solution: "49 + 64 = 113." }),
      () => challengeNumber("number-types-primes", "Divisibility Digit", { prompt: "Challenge: What is the largest digit that can replace ? so that 72?45 is divisible by 9?", expected: 9, hint1: "For divisibility by 9, digit sum must be a multiple of 9.", hint2: "7 + 2 + 4 + 5 = 18, so ? can be 0 or 9.", solution: "The largest possible digit is 9." })
    ];
    return templates[v % templates.length]();
  }

  function algebraExpressionsChallenge(v) {
    const templates = [
      () => challengeExpression("algebra-expressions", "Collect Two Variables", { prompt: "Challenge: Simplify 4x + 7y - 2x + 5y.", expected: "2x + 12y", choices: ["2x + 12y", "6x + 12y", "2x + 2y", "12y - 2x"], hint1: "Collect x terms and y terms separately.", hint2: "4x - 2x = 2x and 7y + 5y = 12y.", solution: "The simplified expression is 2x + 12y." }),
      () => challengeExpression("algebra-expressions", "Perimeter Expression", { prompt: "Challenge: A rectangle has length 3n + 2 and width n - 1. Write its perimeter in simplest form.", expected: "8n + 2", choices: ["8n + 2", "4n + 1", "6n + 4", "8n - 2"], hint1: "Perimeter is two lengths plus two widths.", hint2: "2(3n + 2) + 2(n - 1).", solution: "6n + 4 + 2n - 2 = 8n + 2." }),
      () => challengeExpression("algebra-expressions", "Nth Term", { prompt: "Challenge: The sequence 7, 11, 15, 19, ... has nth term what?", expected: "4n + 3", choices: ["4n + 3", "3n + 4", "4n + 7", "7n + 4"], hint1: "The difference is 4, so start with 4n.", hint2: "When n = 1, 4n is 4, so add 3.", solution: "The nth term is 4n + 3." }),
      () => challengeNumber("algebra-expressions", "Negative Substitution", { prompt: "Challenge: If a = 5 and b = -4, what is 3a - 2b?", expected: 23, hint1: "Substitute before calculating.", hint2: "3 x 5 - 2 x -4.", solution: "15 + 8 = 23." }),
      () => challengeExpression("algebra-expressions", "Bracket Then Collect", { prompt: "Challenge: Simplify 5p - 2(3p - 4) + 7.", expected: "15 - p", choices: ["15 - p", "p + 15", "-p - 1", "11p + 15"], hint1: "Multiply both terms in the bracket by -2.", hint2: "5p - 6p + 8 + 7.", solution: "5p - 6p + 15 = 15 - p." }),
      () => challengeExpression("algebra-expressions", "Index Product", { prompt: "Challenge: Simplify 3a x 4a^2.", expected: "12a^3", choices: ["12a^3", "7a^3", "12a^2", "12a^4"], hint1: "Multiply coefficients and add powers of the same letter.", hint2: "3 x 4 = 12 and a x a^2 = a^3.", solution: "The answer is 12a^3." }),
      () => challengeExpression("algebra-expressions", "Word To Algebra Trap", { prompt: "Challenge: Write 'three more than twice n, then square the result' as an expression.", expected: "(2n + 3)^2", choices: ["(2n + 3)^2", "2n + 3^2", "2(n + 3)^2", "2n^2 + 3"], hint1: "The whole result after adding 3 is squared.", hint2: "Build 2n + 3 first, then put it in brackets.", solution: "The expression is (2n + 3)^2." }),
      () => challengeNumber("algebra-expressions", "Two Equation Substitution", { prompt: "Challenge: If x + y = 12 and x - y = 4, what is 2x + 3y?", expected: 28, hint1: "Add the first two equations to find x.", hint2: "2x = 16, so x = 8 and y = 4.", solution: "2x + 3y = 16 + 12 = 28." }),
      () => challengeNumber("algebra-expressions", "Hidden Like Term", { prompt: "Challenge: If 5a + 5b = 40 and a = 3, what is b?", expected: 5, hint1: "Factor the left side or substitute first.", hint2: "15 + 5b = 40.", solution: "5b = 25, so b = 5." }),
      () => challengeExpression("algebra-expressions", "Subtracting Expressions", { prompt: "Challenge: Simplify (7x - 3) - (2x + 8).", expected: "5x - 11", choices: ["5x - 11", "5x + 5", "9x - 11", "5x - 5"], hint1: "The minus sign changes both terms in the second bracket.", hint2: "7x - 3 - 2x - 8.", solution: "The answer is 5x - 11." })
    ];
    return templates[v % templates.length]();
  }

  function bracketsFormulaeSubstitutionChallenge(v) {
    const templates = [
      () => challengeExpression("brackets-formulae-substitution", "Expand And Simplify", { prompt: "Challenge: Expand and simplify 3(2x + 5) - 2(x - 4).", expected: "4x + 23", choices: ["4x + 23", "4x + 7", "8x + 7", "8x + 23"], hint1: "Expand both brackets before collecting.", hint2: "6x + 15 - 2x + 8.", solution: "The expression simplifies to 4x + 23." }),
      () => challengeNumber("brackets-formulae-substitution", "Formula Flow", { prompt: "Challenge: T = 4a + 3b. What is T when a = 7 and b = 5?", expected: 43, hint1: "Replace a and b carefully.", hint2: "4 x 7 + 3 x 5.", solution: "28 + 15 = 43." }),
      () => challengeNumber("brackets-formulae-substitution", "Reverse Perimeter Formula", { prompt: "Challenge: P = 2l + 2w. If P = 50 and w = 8, what is l?", expected: 17, hint1: "Substitute P and w first.", hint2: "50 = 2l + 16.", solution: "2l = 34, so l = 17." }),
      () => challengeNumber("brackets-formulae-substitution", "Negative Square Substitute", { prompt: "Challenge: Find x^2 + 4x - 5 when x = -3.", expected: -8, hint1: "(-3)^2 is positive.", hint2: "9 + 4 x -3 - 5.", solution: "9 - 12 - 5 = -8." }),
      () => challengeExpression("brackets-formulae-substitution", "Make Subject", { prompt: "Challenge: Make y the subject of A = xy + 5.", expected: "(A - 5)/x", choices: ["(A - 5)/x", "A - 5x", "x/(A - 5)", "(A + 5)/x"], hint1: "Undo +5 first.", hint2: "A - 5 = xy, then divide by x.", solution: "y = (A - 5)/x." }),
      () => challengeExpression("brackets-formulae-substitution", "Double Brackets", { prompt: "Challenge: Expand (x + 4)(x + 3).", expected: "x^2 + 7x + 12", choices: ["x^2 + 7x + 12", "x^2 + 12", "2x + 7", "x^2 + 12x + 7"], hint1: "Multiply each term in the first bracket by each term in the second.", hint2: "x^2 + 3x + 4x + 12.", solution: "The answer is x^2 + 7x + 12." }),
      () => challengeNumber("brackets-formulae-substitution", "Nested Formula", { prompt: "Challenge: Calculate 2(n + 3)^2 when n = 5.", expected: 128, hint1: "Substitute first, then handle the bracket.", hint2: "After substitution, the expression is 2(8)^2.", solution: "2 x 64 = 128." }),
      () => challengeNumber("brackets-formulae-substitution", "Distance Formula", { prompt: "Challenge: d = st. What is d when s = 48 and t = 2.5?", expected: 120, hint1: "Distance equals speed times time.", hint2: "48 x 2.5 = 48 x 5 / 2.", solution: "48 x 2.5 = 120." }),
      () => challengeExpression("brackets-formulae-substitution", "Two Brackets Collect", { prompt: "Challenge: Expand and simplify 5(2p - 1) + 3(p + 4).", expected: "13p + 7", choices: ["13p + 7", "13p - 17", "7p + 7", "10p + 7"], hint1: "Expand each bracket first.", hint2: "10p - 5 + 3p + 12.", solution: "The simplified expression is 13p + 7." }),
      () => challengeNumber("brackets-formulae-substitution", "Missing Dimension Formula", { prompt: "Challenge: V = lwh. If V = 252, l = 7, and w = 6, what is h?", expected: 6, hint1: "Substitute the known dimensions.", hint2: "252 = 7 x 6 x h.", solution: "42h = 252, so h = 6." })
    ];
    return templates[v % templates.length]();
  }

  function solvingFormingEquationsChallenge(v) {
    const templates = [
      () => challengeNumber("solving-forming-equations", "Unknown Both Sides", { prompt: "Challenge: Solve 5x + 7 = 3x + 31.", expected: 12, hint1: "Move the smaller x term first.", hint2: "2x + 7 = 31.", solution: "2x = 24, so x = 12." }),
      () => challengeNumber("solving-forming-equations", "Perimeter Equation", { prompt: "Challenge: A rectangle has length x + 5 and width x - 1. Its perimeter is 44. What is x?", expected: 9, hint1: "Perimeter is 2 lengths and 2 widths.", hint2: "2(x + 5) + 2(x - 1) = 44.", solution: "4x + 8 = 44, so x = 9." }),
      () => challengeNumber("solving-forming-equations", "Consecutive Numbers", { prompt: "Challenge: Three consecutive whole numbers have sum 87. What is the middle number?", expected: 29, hint1: "The middle number is the average.", hint2: "87 / 3 = 29.", solution: "The numbers are 28, 29, and 30." }),
      () => challengeNumber("solving-forming-equations", "Age Equation Challenge", { prompt: "Challenge: A parent is four times as old as a child. In 6 years, the parent will be three times as old as the child. How old is the child now?", expected: 12, hint1: "Let the child be x now.", hint2: "4x + 6 = 3(x + 6).", solution: "4x + 6 = 3x + 18, so x = 12." }),
      () => challengeNumber("solving-forming-equations", "Ticket Mix", { prompt: "Challenge: 17 tickets cost 82 pounds. Adult tickets cost 6 pounds and child tickets cost 4 pounds. How many adult tickets were bought?", expected: 7, hint1: "Let adult tickets be a, so child tickets are 17 - a.", hint2: "6a + 4(17 - a) = 82.", solution: "6a + 68 - 4a = 82, so 2a = 14 and a = 7." }),
      () => challengeNumber("solving-forming-equations", "Fraction Equation", { prompt: "Challenge: Solve x/3 + 8 = 20.", expected: 36, hint1: "Undo +8 first.", hint2: "x/3 = 12.", solution: "Subtract 8 to get x/3 = 12, then multiply by 3, so x = 36." }),
      () => challengeNumber("solving-forming-equations", "Words To Equation", { prompt: "Challenge: A number doubled and then reduced by 9 is 5 more than the original number. What is the number?", expected: 14, hint1: "Let the number be x.", hint2: "2x - 9 = x + 5.", solution: "Solving 2x - 9 = x + 5 leaves x = 14." }),
      () => challengeNumber("solving-forming-equations", "Area Factor Pair", { prompt: "Challenge: A rectangle has area 84. Its length is 5 cm more than its width. What is the width?", expected: 7, hint1: "Look for factor pairs of 84 that differ by 5.", hint2: "7 and 12 multiply to 84.", solution: "The width is 7 cm." }),
      () => challengeNumber("solving-forming-equations", "Coin Equation", { prompt: "Challenge: There are 18 coins, some worth 50p and some worth 20p. Their total value is 690p. How many 50p coins are there?", expected: 11, hint1: "Let the number of 50p coins be x.", hint2: "50x + 20(18 - x) = 690.", solution: "50x + 360 - 20x = 690, so 30x = 330 and x = 11." }),
      () => challengeNumber("solving-forming-equations", "Balance Puzzle", { prompt: "Challenge: Three identical bags and 5 counters balance two identical bags and 17 counters. How many counters are in one bag?", expected: 12, hint1: "Remove two bags from both sides.", hint2: "One bag plus 5 counters equals 17 counters.", solution: "One bag is worth 12 counters." })
    ];
    return templates[v % templates.length]();
  }

  function anglesShapeFactsChallenge(v) {
    const templates = [
      () => challengeNumber("angles-shape-facts", "Isosceles Base Angle", { prompt: "Challenge: An isosceles triangle has vertex angle 44 degrees. What is each base angle?", expected: 68, hint1: "The two base angles are equal.", hint2: "180 - 44 = 136, then split equally.", solution: "Each base angle is 68 degrees.", visual: { type: "triangle", lines: ["vertex 44 degrees", "base angles equal"] } }),
      () => challengeNumber("angles-shape-facts", "Exterior Angle", { prompt: "Challenge: Two opposite interior angles of a triangle are 57 degrees and 68 degrees. What is the exterior angle at the third vertex?", expected: 125, hint1: "An exterior angle equals the sum of the two opposite interior angles.", hint2: "57 + 68.", solution: "The exterior angle is 125 degrees.", visual: { type: "angle", lines: ["57 degrees", "68 degrees", "exterior angle"] } }),
      () => challengeChoice("angles-shape-facts", "Regular Pentagon Interior", { prompt: "Challenge: What is one interior angle of a regular pentagon?", choices: makeChoices(108, [72, 90, 120, 540]), hint1: "Find the total interior angle sum first.", hint2: "(5 - 2) x 180 = 540.", solution: "540 / 5 = 108 degrees." }),
      () => challengeNumber("angles-shape-facts", "Parallel Line Partner", { prompt: "Challenge: Two co-interior angles on parallel lines add to 180 degrees. One is 116 degrees. What is the other?", expected: 64, hint1: "Co-interior angles are supplementary.", hint2: "180 - 116.", solution: "The other angle is 64 degrees.", visual: { type: "angle", lines: ["parallel lines", "co-interior pair"] } }),
      () => challengeNumber("angles-shape-facts", "Quadrilateral Missing Angle", { prompt: "Challenge: Three angles in a quadrilateral are 92 degrees, 107 degrees, and 88 degrees. What is the fourth angle?", expected: 73, hint1: "A quadrilateral has angle total 360 degrees.", hint2: "Add the three known angles first.", solution: "360 - (92 + 107 + 88) = 73 degrees." }),
      () => challengeNumber("angles-shape-facts", "Algebra On A Line", { prompt: "Challenge: Two angles on a straight line are 3x + 15 and 5x + 5 degrees. What is x?", expected: 20, hint1: "Angles on a straight line add to 180 degrees.", hint2: "3x + 15 + 5x + 5 = 180.", solution: "8x + 20 = 180, so x = 20." }),
      () => challengeNumber("angles-shape-facts", "Around A Point", { prompt: "Challenge: Angles around a point are 65 degrees, 122 degrees, 48 degrees, and one missing angle. What is the missing angle?", expected: 125, hint1: "Angles around a point add to 360 degrees.", hint2: "65 + 122 + 48 = 235.", solution: "360 - 235 = 125 degrees." }),
      () => challengeChoice("angles-shape-facts", "Triangle Ratio Angles", { prompt: "Challenge: The angles of a triangle are in the ratio 1:2:3. What is the largest angle?", choices: makeChoices(90, [30, 60, 120, 180]), hint1: "There are 6 equal angle parts.", hint2: "180 / 6 = 30 degrees per part.", solution: "The largest angle is 3 parts, so 90 degrees." }),
      () => challengeNumber("angles-shape-facts", "Regular Hexagon Exterior", { prompt: "Challenge: What is one exterior angle of a regular hexagon?", expected: 60, hint1: "Exterior angles of any polygon add to 360 degrees.", hint2: "360 / 6.", solution: "One exterior angle is 60 degrees." }),
      () => challengeNumber("angles-shape-facts", "Equal Angles On A Line", { prompt: "Challenge: Three angles sit on a straight line. One is 72 degrees and the other two are equal. What is each equal angle?", expected: 54, hint1: "The full line is 180 degrees.", hint2: "180 - 72 = 108, then split equally.", solution: "Each equal angle is 54 degrees." })
    ];
    return templates[v % templates.length]();
  }

  function areaPerimeterUnitsChallenge(v) {
    const templates = [
      () => challengeNumber("area-perimeter-units", "L Shape Subtraction", { prompt: "Challenge: A 12 cm by 8 cm rectangle has a 5 cm by 3 cm corner removed. What is the remaining area?", expected: 81, hint1: "Find the big rectangle area and subtract the missing corner.", hint2: "12 x 8 - 5 x 3.", solution: "96 - 15 = 81 cm^2." }),
      () => challengeNumber("area-perimeter-units", "Perimeter From Area", { prompt: "Challenge: A rectangle has area 84 cm^2 and side lengths 7 cm and 12 cm. What is its perimeter?", expected: 38, hint1: "Perimeter is two lengths plus two widths.", hint2: "2 x (7 + 12).", solution: "2 x 19 = 38 cm." }),
      () => challengeNumber("area-perimeter-units", "Triangle In Rectangle", { prompt: "Challenge: A diagonal cuts a 10 cm by 8 cm rectangle into two equal triangles. What is the area of one triangle?", expected: 40, hint1: "The diagonal halves the rectangle.", hint2: "Rectangle area is 10 x 8.", solution: "80 / 2 = 40 cm^2." }),
      () => challengeNumber("area-perimeter-units", "Area Unit Conversion", { prompt: "Challenge: Convert 0.35 m^2 into cm^2.", expected: 3500, hint1: "1 m is 100 cm, so 1 m^2 is 10,000 cm^2.", hint2: "0.35 x 10,000.", solution: "0.35 m^2 = 3500 cm^2." }),
      () => challengeNumber("area-perimeter-units", "Square From Perimeter", { prompt: "Challenge: A square has perimeter 52 cm. What is its area?", expected: 169, hint1: "Find one side first.", hint2: "52 / 4 = 13.", solution: "Area = 13 x 13 = 169 cm^2." }),
      () => challengeNumber("area-perimeter-units", "Trapezium Area", { prompt: "Challenge: A trapezium has parallel sides 9 cm and 15 cm, and height 8 cm. What is its area?", expected: 96, hint1: "Use average of the parallel sides times height.", hint2: "(9 + 15) / 2 x 8.", solution: "12 x 8 = 96 cm^2." }),
      () => challengeNumber("area-perimeter-units", "Joined Squares Perimeter", { prompt: "Challenge: Five squares of side 3 cm are joined in a straight row. What is the perimeter of the shape?", expected: 36, hint1: "The shape is a 15 cm by 3 cm rectangle.", hint2: "Perimeter = 2 x (15 + 3).", solution: "The perimeter is 36 cm." }),
      () => challengeNumber("area-perimeter-units", "Shaded Square Difference", { prompt: "Challenge: A 5 cm square sits inside a 13 cm square. What is the area outside the small square but inside the large square?", expected: 144, hint1: "Subtract the two square areas.", hint2: "13^2 - 5^2.", solution: "169 - 25 = 144 cm^2." }),
      () => challengeNumber("area-perimeter-units", "Reverse Triangle Height", { prompt: "Challenge: A triangle has area 84 cm^2 and base 14 cm. What is its height?", expected: 12, hint1: "Area = base x height / 2.", hint2: "84 = 14 x h / 2 = 7h.", solution: "84 = 7h, so the height is 12 cm." }),
      () => challengeNumber("area-perimeter-units", "Border Area", { prompt: "Challenge: A 10 m by 8 m rectangle has a centred 8 m by 6 m rectangle inside it. What is the border area?", expected: 32, hint1: "Subtract the inner rectangle from the outer rectangle.", hint2: "10 x 8 - 8 x 6.", solution: "80 - 48 = 32 m^2." })
    ];
    return templates[v % templates.length]();
  }

  function coordinatesAreaChallengesChallenge(v) {
    const templates = [
      () => challengeText("coordinates-area-challenges", "Source-Style Isosceles Coordinates", {
        prompt: "Challenge: In an isosceles triangle, one equal side joins (-3, 2) to (5, 8) and the other equal side joins (x, y) to (5, 8). The line from (x, y) to (-3, 2) is parallel to the y-axis. What are (x, y)?",
        expectedDisplay: "(-3, 14)",
        acceptedTextAnswers: ["(-3, 14)", "(-3,14)", "-3, 14", "-3,14"],
        hint1: "Parallel to the y-axis means the x-coordinate is unchanged.",
        hint2: "The apex of an isosceles triangle sits halfway up the vertical base.",
        solution: "The vertical base has x = -3. Since the apex y-value 8 is halfway between 2 and y, y = 14. So (x, y) = (-3, 14).",
        visual: { title: "Prep 6 isosceles coordinate move", lines: ["base is vertical", "x = -3", "8 is halfway between 2 and 14"] }
      }),
      () => challengeNumber("coordinates-area-challenges", "Source-Style Area From Missing Point", {
        prompt: "Challenge: A triangle has points A(2, -4), B(x, y), and C(9, 5). AB is parallel to the y-axis and CA = CB. What is the area of triangle ABC?",
        expected: 63,
        hint1: "AB is vertical, so x = 2. The apex y-coordinate is halfway between the two base y-values.",
        hint2: "5 is halfway between -4 and 14. The base is 18 and the horizontal height is 7.",
        solution: "B = (2, 14). The vertical base AB is 18 units and the perpendicular height to C is 7 units, so area = 18 x 7 / 2 = 63.",
        visual: { type: "triangle", title: "Coordinate base-height", lines: ["vertical base 18", "horizontal height 7"] }
      }),
      () => challengeNumber("coordinates-area-challenges", "Horizontal Isosceles Sum", {
        prompt: "Challenge: In an isosceles triangle, the line from (x, y) to (4, -1) is parallel to the x-axis. The other vertex is (10, 6), and the two sloping sides are equal. What is x + y?",
        expected: 15,
        hint1: "Parallel to the x-axis means the y-coordinate is unchanged.",
        hint2: "For equal sloping sides, the apex x-coordinate is halfway along the horizontal base.",
        solution: "y = -1. Since 10 is halfway between 4 and x, x = 16. Therefore x + y = 16 + (-1) = 15.",
        visual: { title: "Horizontal isosceles base", lines: ["y = -1", "10 is halfway between 4 and 16", "x + y"] }
      }),
      () => challengeNumber("coordinates-area-challenges", "Negative Coordinate Area", {
        prompt: "Challenge: A triangle has A(x, y), B(-5, -6), and C(3, -1). AB is vertical and CA = CB. What is x + y?",
        expected: -1,
        hint1: "AB vertical means A has the same x-coordinate as B.",
        hint2: "The apex y-coordinate -1 is halfway between -6 and y.",
        solution: "x = -5. Since -1 is halfway between -6 and y, y = 4. Therefore x + y = -5 + 4 = -1.",
        visual: { title: "Negative coordinate symmetry", lines: ["x = -5", "y = 4", "sum = -1"] }
      }),
      () => challengeNumber("coordinates-area-challenges", "Reverse Apex Coordinate", {
        prompt: "Challenge: A vertical base runs from (1, -5) to (1, 7). The apex is (k, 1), to the right of the base, and the area is 54 square units. What is k?",
        expected: 10,
        hint1: "The base length is the change in y-values.",
        hint2: "Area = base x horizontal height / 2.",
        solution: "The base is 12. So 54 = 12 x height / 2, giving height = 9. To the right of x = 1 means k = 10.",
        visual: { title: "Reverse coordinate height", lines: ["base 12", "area 54", "height 9 to the right"] }
      }),
      () => challengeNumber("coordinates-area-challenges", "Missing Y Coordinate", {
        prompt: "Challenge: Points A(x, y), B(6, -2), and C(-1, 4) form an isosceles triangle with AB vertical and CA = CB. What is y?",
        expected: 10,
        hint1: "AB vertical fixes x = 6.",
        hint2: "The apex y-coordinate 4 is halfway between -2 and y.",
        solution: "The midpoint of the vertical base has y-coordinate 4, so (-2 + y) / 2 = 4. Therefore y = 10.",
        visual: { title: "Midpoint on vertical base", lines: ["C is level with midpoint", "(-2 + y) / 2 = 4"] }
      }),
      () => challengeNumber("coordinates-area-challenges", "Midpoint Triangle Area", {
        prompt: "Challenge: A rectangle has corners (-4, -1), (8, -1), (8, 5), and (-4, 5). P is the midpoint of the top side. What is the area of the triangle with vertices (-4, -1), (8, -1), and P?",
        expected: 36,
        hint1: "Use the bottom side of the rectangle as the triangle base.",
        hint2: "The base is 12 and the height is 6.",
        solution: "The triangle has base 12 and height 6, so area = 12 x 6 / 2 = 36.",
        visual: { type: "triangle", title: "Midpoint does not change height", lines: ["base 12", "height 6"] }
      }),
      () => challengeNumber("coordinates-area-challenges", "Two Equal-Side Areas", {
        prompt: "Challenge: A vertical base runs from (0, -3) to (0, 9). One isosceles triangle has apex (8, 3), and another has apex (-5, 3). What is the difference between their areas?",
        expected: 18,
        hint1: "Both triangles share the same vertical base.",
        hint2: "Compare the horizontal heights 8 and 5.",
        solution: "The shared base is 12. Areas are 12 x 8 / 2 = 48 and 12 x 5 / 2 = 30. The difference is 18.",
        visual: { type: "triangle", title: "Shared base, different heights", lines: ["base 12", "heights 8 and 5"] }
      }),
      () => challengeChoice("coordinates-area-challenges", "Choose The Isosceles Apex", {
        prompt: "Challenge: The base of an isosceles triangle is from (2, -1) to (2, 9). Which point could be the apex if it is to the right of the base?",
        choices: [
          { value: "(7, 4)", label: "(7, 4)", isCorrect: true },
          { value: "(7, 5)", label: "(7, 5)", isCorrect: false },
          { value: "(4, 7)", label: "(4, 7)", isCorrect: false },
          { value: "(2, 4)", label: "(2, 4)", isCorrect: false }
        ],
        hint1: "The apex must be level with the midpoint of the vertical base.",
        hint2: "The midpoint y-coordinate is halfway between -1 and 9.",
        solution: "The midpoint y-coordinate is 4. To the right of x = 2, the point (7, 4) works.",
        visual: { title: "Apex on perpendicular bisector", lines: ["base midpoint y = 4", "apex to the right"] }
      }),
      () => challengeNumber("coordinates-area-challenges", "Area Then Coordinate Sum", {
        prompt: "Challenge: A triangle has base endpoints (-2, 3) and (-2, 19). Its apex is (4, 11). What is the sum of the triangle's area and the apex x-coordinate?",
        expected: 52,
        hint1: "The base is vertical, and the horizontal height is the distance from x = -2 to x = 4.",
        hint2: "Base = 16 and height = 6.",
        solution: "Area = 16 x 6 / 2 = 48. Add the apex x-coordinate 4 to get 52.",
        visual: { type: "triangle", title: "Area plus coordinate", lines: ["base 16", "height 6", "48 + 4"] }
      })
    ];
    return templates[v % templates.length]();
  }

  function geometryEquationsChallengeChallenge(v) {
    const templates = [
      () => challengeNumber("geometry-equations-challenge", "Volume Then Base Perimeter", {
        prompt: "Challenge: A cuboid has length x + 6 cm, width x cm, and height 4 cm. Its volume is 220 cubic cm. First use the volume to find x, then give the perimeter of the rectangular base.",
        expected: 32,
        hint1: "The volume equation unlocks x; the final answer is a perimeter, not a volume.",
        hint2: "Divide by 4: x(x + 6) = 55. The factor pair is 5 and 11.",
        solution: "Volume equation: x(x + 6) x 4 = 220. Divide by 4 to get x(x + 6) = 55, so x = 5. The base is 5 cm by 11 cm, so base perimeter = 2(5 + 11) = 32 cm.",
        visual: { title: "Volume unlocks perimeter", lines: ["volume equation first", "base 5 by 11", "perimeter = 2(l + w)"] }
      }),
      () => challengeNumber("geometry-equations-challenge", "Volume Factor Pair", {
        prompt: "Challenge: A cuboid has length x + 4 cm, width x + 1 cm, and height 3 cm. Its volume is 162 cubic cm. What is x?",
        expected: 5,
        hint1: "Divide the volume by 3 to get the base area.",
        hint2: "(x + 4)(x + 1) = 54. Look for factor pairs 3 apart.",
        solution: "Volume equation: (x + 4)(x + 1) x 3 = 162, so the base area is 54. The factor pair 6 and 9 is 3 apart, so x + 1 = 6 and x = 5.",
        visual: { title: "Factor-pair volume", lines: ["volume -> base area 54", "factor pair 6 and 9", "x = 5"] }
      }),
      () => challengeNumber("geometry-equations-challenge", "Perimeter And Area Pair", {
        prompt: "Challenge: A rectangle has perimeter 50 cm and area 150 square cm. The length is greater than the width. What is the difference between the length and the width?",
        expected: 5,
        hint1: "Use perimeter for the sum of the sides, and area for the product of the sides.",
        hint2: "Find two factors of 150 that add to 25.",
        solution: "Perimeter 50 means length + width = 25. Area 150 means length x width = 150. The sides are 15 cm and 10 cm, so the difference is 5 cm.",
        visual: { title: "Area and perimeter together", lines: ["perimeter -> sum 25", "area -> product 150", "difference 5"] }
      }),
      () => challengeNumber("geometry-equations-challenge", "Equal Area Equation", {
        prompt: "Challenge: A rectangle is 8 cm by x + 4 cm. A triangle has base 24 cm and height x + 1 cm. Their areas are equal. Use the equal areas to find x.",
        expected: 5,
        hint1: "Write both area formulae, then set them equal.",
        hint2: "8(x + 4) = 24(x + 1) / 2.",
        solution: "Rectangle area = 8(x + 4). Triangle area = 24(x + 1) / 2. Set them equal: 8x + 32 = 12x + 12, so x = 5.",
        visual: { title: "Equal area equation", lines: ["rectangle area", "triangle area", "set equal"] }
      }),
      () => challengeNumber("geometry-equations-challenge", "Volume Then Surface Area", {
        prompt: "Challenge: A cuboid has dimensions x cm, x + 3 cm, and 5 cm. Its volume is 200 cubic cm. First use the volume to find x, then find the total surface area.",
        expected: 210,
        hint1: "The given value is volume. The final answer is surface area.",
        hint2: "x(x + 3) = 40, so the dimensions are 5, 8, and 5.",
        solution: "Volume equation: x(x + 3) x 5 = 200, so x = 5. The dimensions are 5 cm, 8 cm, and 5 cm. Surface area = 2(5 x 8 + 5 x 5 + 8 x 5) = 210 square cm.",
        visual: { title: "Volume unlocks surface area", lines: ["volume gives dimensions", "then surface area", "2(lw + lh + wh)"] }
      }),
      () => challengeNumber("geometry-equations-challenge", "Perimeter Then Area", {
        prompt: "Challenge: A rectangle has length 2x + 3 cm and width x + 1 cm. Its perimeter is 44 cm. First use the perimeter to find x, then find the area.",
        expected: 105,
        hint1: "The given value is perimeter. The final answer is area.",
        hint2: "2(2x + 3) + 2(x + 1) = 44.",
        solution: "Perimeter equation: 2(2x + 3) + 2(x + 1) = 44, so x = 6. The sides are 15 cm and 7 cm. Area = 15 x 7 = 105 square cm.",
        visual: { title: "Perimeter unlocks area", lines: ["perimeter gives x", "area = length x width"] }
      }),
      () => challengeNumber("geometry-equations-challenge", "Triangle And Rectangle Equation", {
        prompt: "Challenge: A triangle has base 3x + 2 cm and height 8 cm. It has the same area as a 10 cm by 14 cm rectangle. Use the equal areas to find x.",
        expected: 11,
        hint1: "Find the rectangle area first.",
        hint2: "(3x + 2) x 8 / 2 = 140.",
        solution: "Rectangle area = 10 x 14 = 140. Triangle area equation: (3x + 2) x 8 / 2 = 140. That gives 12x + 8 = 140, so x = 11.",
        visual: { type: "triangle", title: "Triangle equals rectangle", lines: ["rectangle area 140", "triangle equation", "solve x"] }
      }),
      () => challengeNumber("geometry-equations-challenge", "Volume Then Removal", {
        prompt: "Challenge: A cuboid measures 3 cm by x cm by x + 5 cm and has volume 198 cubic cm. A 3 cm by 2 cm by 2 cm block is removed. What is the remaining volume?",
        expected: 186,
        hint1: "The first volume tells you x; the removed block is a second volume.",
        hint2: "x(x + 5) = 66, so the factor pair is 6 and 11.",
        solution: "Volume equation: 3x(x + 5) = 198, so x(x + 5) = 66 and x = 6. The removed block volume is 3 x 2 x 2 = 12. Remaining volume = 198 - 12 = 186 cubic cm.",
        visual: { title: "Solve, then subtract", lines: ["volume gives x", "removed volume 12", "remaining volume"] }
      }),
      () => challengeNumber("geometry-equations-challenge", "Square Frame Equation", {
        prompt: "Challenge: A square frame has outer side x + 4 cm and inner square side x cm. The shaded frame area, meaning the border area only, is 80 square cm. What is the outer perimeter, in cm?",
        expected: 48,
        hint1: "Use an area equation first; the final answer is a perimeter.",
        hint2: "(x + 4)^2 - x^2 = 80, which simplifies to 8x + 16 = 80.",
        solution: "The 80 is an area, so use (x + 4)^2 - x^2 = 80 to get x = 8. The outer side is 12 cm, so the outer perimeter is 4 x 12 = 48 cm.",
        visual: { title: "Square frame equation", lines: ["border area = outer area - inner area", "outer side 12", "perimeter = 4 x side"] }
      }),
      () => challengeNumber("geometry-equations-challenge", "Square-Base Volume Equation", {
        prompt: "Challenge: A cuboid has square base side x + 1 cm and height 6 cm. Its volume is 294 cubic cm. First use the volume to find the base side, then find the perimeter of the square base.",
        expected: 28,
        hint1: "The volume gives the square base area. The final answer is a perimeter.",
        hint2: "(x + 1)^2 = 49.",
        solution: "Use the volume first: square base area = 294 / 6 = 49, so the base side is 7 cm. The base perimeter is 4 x 7 = 28 cm.",
        visual: { title: "Square-base volume", lines: ["volume -> base area 49", "side 7", "perimeter = 4 x side"] }
      })
    ];
    return templates[v % templates.length]();
  }

  function ratioProportionChallenge(v) {
    const templates = [
      () => challengeNumber("ratio-proportion", "Larger Ratio Share", { prompt: "Challenge: 96 pounds is shared in the ratio 5:7. How much is the larger share?", expected: 56, hint1: "There are 12 parts in total.", hint2: "Each part is 96 / 12 = 8.", solution: "The larger share is 7 x 8 = 56 pounds." }),
      () => challengeNumber("ratio-proportion", "Difference Ratio", { prompt: "Challenge: Boys and girls are in the ratio 3:4. There are 9 more girls than boys. How many pupils are there altogether?", expected: 63, hint1: "One ratio part is the difference between 4 parts and 3 parts.", hint2: "1 part = 9.", solution: "Total = 7 parts = 63." }),
      () => challengeNumber("ratio-proportion", "Recipe Scale", { prompt: "Challenge: 240 g of flour makes 15 cakes. How many grams are needed for 35 cakes?", expected: 560, hint1: "Find flour per cake.", hint2: "240 / 15 = 16 g per cake.", solution: "35 x 16 = 560 g." }),
      () => challengeNumber("ratio-proportion", "Map Scale", { prompt: "Challenge: A map has scale 1:50,000. A road is 6 cm on the map. How many kilometres is it in real life?", expected: 3, hint1: "Multiply the map length by 50,000.", hint2: "300,000 cm = 3 km.", solution: "The real distance is 3 km." }),
      () => challengeNumber("ratio-proportion", "Changing Ratio", { prompt: "Challenge: Red and blue counters are in the ratio 2:3, with 40 counters altogether. How many red counters must be added to make the ratio 4:3?", expected: 16, hint1: "Find the original numbers first.", hint2: "There are 16 red and 24 blue; solve (16 + x):24 = 4:3.", solution: "3(16 + x) = 96, so x = 16." }),
      () => challengeNumber("ratio-proportion", "Inverse Workers", { prompt: "Challenge: 8 workers finish a job in 12 days. At the same rate, how many days would 6 workers take?", expected: 16, hint1: "The total worker-days stay the same.", hint2: "8 x 12 = 96 worker-days.", solution: "96 / 6 = 16 days." }),
      () => challengeNumber("ratio-proportion", "Unit Price", { prompt: "Challenge: 3 pens cost 240p. At the same price, how many pence do 5 pens cost?", expected: 400, hint1: "Find the cost of one pen.", hint2: "240 / 3 = 80p.", solution: "5 x 80p = 400p." }),
      () => challengeNumber("ratio-proportion", "Inverse Proportion", { prompt: "Challenge: y is inversely proportional to x. When x = 6, y = 24. What is y when x = 9?", expected: 16, hint1: "For inverse proportion, x times y stays constant.", hint2: "6 x 24 = 144.", solution: "144 / 9 = 16." }),
      () => challengeRatio("ratio-proportion", "Decimal Ratio", { prompt: "Challenge: Simplify the ratio 0.75:1.2.", expected: [5, 8], hint1: "Multiply both numbers by 100 to remove decimals.", hint2: "75:120 simplifies by 15.", solution: "0.75:1.2 = 75:120 = 5:8." }),
      () => challengeNumber("ratio-proportion", "Mixture Parts", { prompt: "Challenge: Juice and water are mixed in the ratio 2:5. A jug contains 630 ml. How many ml of juice are in it?", expected: 180, hint1: "There are 7 parts altogether.", hint2: "Each part is 630 / 7 = 90 ml.", solution: "Juice is 2 parts, so 180 ml." })
    ];
    return templates[v % templates.length]();
  }

  function threeDVolumeSpeedChallenge(v) {
    const templates = [
      () => challengeNumber("three-d-volume-speed", "Cuboid Volume", { prompt: "Challenge: A cuboid is 9 cm long, 5 cm wide, and 4 cm high. What is its volume?", expected: 180, hint1: "Volume of a cuboid is length x width x height.", hint2: "9 x 5 x 4.", solution: "The volume is 180 cm^3." }),
      () => challengeNumber("three-d-volume-speed", "Missing Length", { prompt: "Challenge: A cuboid has volume 288 cm^3, width 6 cm, and height 8 cm. What is its length?", expected: 6, hint1: "Divide volume by the two known dimensions.", hint2: "288 / (6 x 8).", solution: "288 / 48 = 6 cm." }),
      () => challengeNumber("three-d-volume-speed", "Cube Surface Area", { prompt: "Challenge: A cube has side length 5 cm. What is its total surface area?", expected: 150, hint1: "A cube has 6 equal square faces.", hint2: "Each face is 5 x 5 = 25.", solution: "6 x 25 = 150 cm^2." }),
      () => challengeNumber("three-d-volume-speed", "Speed Time Conversion", { prompt: "Challenge: A cyclist travels at 72 km/h. How many minutes does it take to travel 18 km?", expected: 15, hint1: "Time = distance / speed.", hint2: "18 / 72 = 1/4 hour.", solution: "1/4 hour is 15 minutes." }),
      () => challengeNumber("three-d-volume-speed", "Cubic Unit Conversion", { prompt: "Challenge: Convert 250,000 cm^3 into m^3.", expected: 0.25, hint1: "1 m^3 = 1,000,000 cm^3.", hint2: "250,000 / 1,000,000.", solution: "250,000 cm^3 = 0.25 m^3." }),
      () => challengeNumber("three-d-volume-speed", "Triangular Prism", { prompt: "Challenge: A triangular prism has triangular cross-section base 8 cm and height 6 cm, and length 10 cm. What is its volume?", expected: 240, hint1: "Find the triangle area first.", hint2: "Triangle area = 8 x 6 / 2 = 24.", solution: "Volume = 24 x 10 = 240 cm^3." }),
      () => challengeNumber("three-d-volume-speed", "Cube Stack Removal", { prompt: "Challenge: A block is 4 cubes long, 3 cubes wide, and 2 cubes high. Three cubes are removed. How many cubes remain?", expected: 21, hint1: "Count the full block first.", hint2: "4 x 3 x 2 = 24 cubes.", solution: "24 - 3 = 21 cubes." }),
      () => challengeNumber("three-d-volume-speed", "Fraction Full Container", { prompt: "Challenge: A tank is 12 cm by 10 cm by 8 cm. It is three quarters full. What volume of water is inside?", expected: 720, hint1: "Find full volume first.", hint2: "12 x 10 x 8 = 960.", solution: "Three quarters of 960 is 720 cm^3." }),
      () => challengeNumber("three-d-volume-speed", "Train Bridge", { prompt: "Challenge: A 90 m train travels at 15 m/s. How many seconds does it take to pass completely over a 210 m bridge?", expected: 20, hint1: "The train must cover its own length plus the bridge length.", hint2: "90 + 210 = 300 m.", solution: "300 / 15 = 20 seconds." }),
      () => challengeNumber("three-d-volume-speed", "Scale Volume", { prompt: "Challenge: If every length of a cuboid is doubled, by what factor is its volume multiplied?", expected: 8, hint1: "There are three dimensions.", hint2: "2 x 2 x 2.", solution: "The volume is multiplied by 8." })
    ];
    return templates[v % templates.length]();
  }

  function dataHandlingChallenge(v) {
    const templates = [
      () => challengeNumber("data-handling", "Missing Mean Value", { prompt: "Challenge: Six numbers have mean 12. Five of them add to 61. What is the missing number?", expected: 11, hint1: "Find the total of all six numbers first.", hint2: "6 x 12 = 72.", solution: "72 - 61 = 11." }),
      () => challengeNumber("data-handling", "Mean After Adding", { prompt: "Challenge: Five numbers have mean 11. A sixth number is added and the mean becomes 13. What number was added?", expected: 23, hint1: "Compare the old total with the new total.", hint2: "Old total = 55 and new total = 78.", solution: "78 - 55 = 23." }),
      () => challengeNumber("data-handling", "Range Missing Largest", { prompt: "Challenge: The numbers are 4, 8, 8, 11, 15, and x. If x is the largest and the range is 20, what is x?", expected: 24, hint1: "Range is largest minus smallest.", hint2: "x - 4 = 20.", solution: "The range equation is x - 4 = 20, so x = 24." }),
      () => challengeNumber("data-handling", "Bar Chart Missing Bar", { prompt: "Challenge: A survey has 90 votes. A has 24 votes, B has 30 votes, and C has the rest. How many votes does C have?", expected: 36, hint1: "Subtract the known bars from the total.", hint2: "24 + 30 = 54.", solution: "90 - 54 = 36.", visual: { type: "bars", title: "Survey bars", bars: [{ label: "A", value: 24 }, { label: "B", value: 30 }, { label: "C", value: 36 }] } }),
      () => challengeNumber("data-handling", "Pie Chart Total", { prompt: "Challenge: In a pie chart, 72 degrees represents 18 students. How many students are represented by the whole pie chart?", expected: 90, hint1: "A full pie chart is 360 degrees.", hint2: "360 is 5 times 72.", solution: "The total is 18 x 5 = 90 students." }),
      () => challengeNumber("data-handling", "Odd Number Mean", { prompt: "Challenge: Three consecutive odd numbers have mean 17. What is the largest number?", expected: 19, hint1: "The middle number is the mean.", hint2: "The numbers are 15, 17, 19.", solution: "The largest is 19." }),
      () => challengeNumber("data-handling", "Frequency Median", { prompt: "Challenge: A frequency table has value 1 appearing 3 times, value 2 appearing 5 times, value 3 appearing 4 times, and value 4 appearing 2 times. What is the median?", expected: 2, hint1: "There are 14 values, so use the 7th and 8th values.", hint2: "Positions 4 to 8 are all 2.", solution: "The median is 2." }),
      () => challengeNumber("data-handling", "Line Graph Rate", { prompt: "Challenge: A line graph rises from 12 to 27 over 3 hours. What is the average increase per hour?", expected: 5, hint1: "Find total increase first.", hint2: "27 - 12 = 15.", solution: "15 / 3 = 5 per hour." }),
      () => challengeNumber("data-handling", "Combined Mean", { prompt: "Challenge: Group A has 6 pupils with mean score 14. Group B has 4 pupils with mean score 19. What is the combined mean?", expected: 16, hint1: "Find each group total first.", hint2: "6 x 14 = 84 and 4 x 19 = 76.", solution: "Combined total = 160 over 10 pupils, so mean = 16." }),
      () => challengeNumber("data-handling", "Range From Ends", { prompt: "Challenge: A set of data has smallest value 6 and range 14. What is the largest value?", expected: 20, hint1: "Range = largest - smallest.", hint2: "Largest - 6 = 14.", solution: "Largest = 20." })
    ];
    return templates[v % templates.length]();
  }

  function wordProblemArenaChallenge(v) {
    const templates = [
      () => challengeNumber("word-problem-arena", "Guaranteed Two Pairs", { prompt: "Challenge: A drawer has red, blue, green, and yellow socks, with at least 6 of each colour. What is the least number of socks needed to be sure of getting two matching pairs?", expected: 6, hint1: "Think of the worst case before the second pair is forced.", hint2: "You could take one pair and one of each other colour: 5 socks with only one pair.", solution: "The 6th sock must either make a new pair or add to the existing pair, so two matching pairs are guaranteed." }),
      () => challengeNumber("word-problem-arena", "Handshake Count", { prompt: "Challenge: Six friends each shake hands with every other friend exactly once. How many handshakes are there?", expected: 15, hint1: "Do not count A with B and B with A separately.", hint2: "6 x 5 / 2.", solution: "There are 15 handshakes." }),
      () => challengeNumber("word-problem-arena", "Page Digit Count", { prompt: "Challenge: Pages are numbered from 1 to 120. How many times does the digit 7 appear?", expected: 22, hint1: "Count 7 in the ones place and in the tens place.", hint2: "Ones: 7, 17, ..., 117 gives 12. Tens: 70 to 79 gives 10 more.", solution: "The digit 7 appears 22 times." }),
      () => challengeNumber("word-problem-arena", "Coordinate Rectangle", { prompt: "Challenge: A rectangle has corners (-2, 3), (6, 3), (6, 9), and (-2, 9). What is its area?", expected: 48, hint1: "Find the horizontal and vertical side lengths.", hint2: "Width = 8 and height = 6.", solution: "Area = 8 x 6 = 48 square units." }),
      () => challengeNumber("word-problem-arena", "Consecutive Product", { prompt: "Challenge: Three consecutive whole numbers have sum 84. What is the product of the smallest and largest?", expected: 783, hint1: "The middle number is the average.", hint2: "84 / 3 = 28, so the numbers are 27, 28, 29.", solution: "27 x 29 = 783." }),
      () => challengeNumber("word-problem-arena", "Queue Position", { prompt: "Challenge: Sara is 8th from the front of a queue and 12th from the back. How many people are in the queue?", expected: 19, hint1: "Sara is counted in both positions.", hint2: "8 + 12 - 1.", solution: "There are 19 people in the queue." }),
      () => challengeNumber("word-problem-arena", "Grid Paths", { prompt: "Challenge: On a 3 by 2 grid, how many shortest paths go from the bottom-left corner to the top-right corner if you only move right or up?", expected: 10, hint1: "Each shortest path has 3 right moves and 2 up moves.", hint2: "Choose where the 2 up moves go among 5 moves.", solution: "There are 10 shortest paths." }),
      () => challengeNumber("word-problem-arena", "Clock Angle", { prompt: "Challenge: What is the smaller angle between the hands of a clock at 3:30?", expected: 75, hint1: "At 3:30, the minute hand is at 180 degrees.", hint2: "The hour hand is halfway between 3 and 4, so it is at 105 degrees.", solution: "180 - 105 = 75 degrees." }),
      () => challengeNumber("word-problem-arena", "Remainder Classic", { prompt: "Challenge: What is the smallest whole number greater than 100 that leaves remainder 2 when divided by 3, 4, and 5?", expected: 122, hint1: "Subtract 2 from the number and it must be divisible by 3, 4, and 5.", hint2: "LCM(3, 4, 5) = 60.", solution: "The first number greater than 100 of the form 60k + 2 is 122." }),
      () => challengeNumber("word-problem-arena", "Tournament Points", { prompt: "Challenge: A team plays 8 games, has no losses, and earns 20 points. A win is 3 points and a draw is 1 point. How many wins did the team have?", expected: 6, hint1: "Let wins be w and draws be 8 - w.", hint2: "3w + (8 - w) = 20.", solution: "2w + 8 = 20, so w = 6." })
    ];
    return templates[v % templates.length]();
  }

  const GENERATORS = {
    "place-value-scales": placeValueScales,
    "slick-sums-four-rules": slickSumsFourRules,
    "bidmas-powers": bidmasPowers,
    "fractions-decimals-percentages": fractionsDecimalsPercentages,
    "number-types-primes": numberTypesPrimes,
    "algebra-expressions": algebraExpressions,
    "brackets-formulae-substitution": bracketsFormulaeSubstitution,
    "solving-forming-equations": solvingFormingEquations,
    "angles-shape-facts": anglesShapeFacts,
    "area-perimeter-units": areaPerimeterUnits,
    "coordinates-area-challenges": coordinatesAreaChallenges,
    "geometry-equations-challenge": geometryEquationsChallengeModule,
    "ratio-proportion": ratioProportion,
    "three-d-volume-speed": threeDVolumeSpeed,
    "data-handling": dataHandling,
    "word-problem-arena": wordProblemArena,
    "review-prep-9-challenge": reviewPrep9RefreshedBankModule
  };

  const CHALLENGE_GENERATORS = {
    "place-value-scales": placeValueScalesChallenge,
    "slick-sums-four-rules": slickSumsFourRulesChallenge,
    "bidmas-powers": bidmasPowersChallenge,
    "fractions-decimals-percentages": fractionsDecimalsPercentagesChallenge,
    "number-types-primes": numberTypesPrimesChallenge,
    "algebra-expressions": algebraExpressionsChallenge,
    "brackets-formulae-substitution": bracketsFormulaeSubstitutionChallenge,
    "solving-forming-equations": solvingFormingEquationsChallenge,
    "angles-shape-facts": anglesShapeFactsChallenge,
    "area-perimeter-units": areaPerimeterUnitsChallenge,
    "coordinates-area-challenges": coordinatesAreaChallengesChallenge,
    "geometry-equations-challenge": geometryEquationsChallengeChallenge,
    "ratio-proportion": ratioProportionChallenge,
    "three-d-volume-speed": threeDVolumeSpeedChallenge,
    "data-handling": dataHandlingChallenge,
    "word-problem-arena": wordProblemArenaChallenge
  };

  function generateProblem(moduleId, variantIndex) {
    const id = GENERATORS[moduleId] ? moduleId : MODULE_IDS[0];
    const generator = GENERATORS[id];
    const problem = applyAnswerVariety(generator(variantIndex), variantIndex);
    problem.id = id + "-" + variantIndex;
    problem.variantIndex = variantIndex;
    if (CLASSIC_SKILLS[id]) problem.skillTag = CLASSIC_SKILLS[id];
    return problem;
  }

  function generateChallengeProblem(moduleId, variantIndex) {
    if (!hasChallengeBank(moduleId)) {
      return generateProblem(moduleId, variantIndex || 0);
    }
    const id = CHALLENGE_GENERATORS[moduleId] ? moduleId : MODULE_IDS[0];
    const generator = CHALLENGE_GENERATORS[id];
    const variantCount = challengeVariantCount(id);
    const challengeIndex = ((variantIndex || 0) % variantCount + variantCount) % variantCount;
    const problem = applyAnswerVariety(generator(challengeIndex), challengeIndex + 1000);
    problem.id = id + "-challenge-" + challengeIndex;
    problem.variantIndex = challengeIndex;
    problem.isChallenge = true;
    if (CLASSIC_SKILLS[id]) problem.skillTag = CLASSIC_SKILLS[id];
    return problem;
  }

  function checkAnswer(problem, input) {
    if (!problem) return { isCorrect: false, errorClass: "missing_problem", message: "No problem is loaded yet." };
    if (problem.answerType === "choice") {
      const actual = String(input.choice || "");
      const correct = String(problem.correctInput.choice);
      return actual === correct
        ? { isCorrect: true, message: "Correct. Nice work." }
        : { isCorrect: false, errorClass: "wrong_choice", message: "Not quite. Try the hint, then choose again." };
    }
    if (problem.answerType === "ratio") {
      const actual = parseRatio(input.value);
      const expected = problem.expected;
      if (!actual) return { isCorrect: false, errorClass: "bad_ratio_format", message: "Write the ratio like 4:21." };
      return actual[0] === expected[0] && actual[1] === expected[1]
        ? { isCorrect: true, message: "Correct. The ratio is in simplest form." }
        : { isCorrect: false, errorClass: "wrong_ratio", message: "Not quite. Check the parts and simplify." };
    }
    if (problem.answerType === "expression") {
      const actual = normalizeExpression(input.value);
      const expected = normalizeExpression(problem.expectedDisplay);
      if (!actual) return { isCorrect: false, errorClass: "bad_expression_format", message: "Type the expression you get after simplifying." };
      return actual === expected
        ? { isCorrect: true, message: "Correct. The expression is simplified." }
        : { isCorrect: false, errorClass: "wrong_expression", message: "Not quite. Check signs, letters, and like terms." };
    }
    if (problem.answerType === "text") {
      const actual = normalizeText(input.value);
      const accepted = (problem.acceptedTextAnswers || [problem.expectedDisplay]).map(normalizeText);
      if (!actual) return { isCorrect: false, errorClass: "bad_text_format", message: "Type an answer first." };
      return accepted.includes(actual)
        ? { isCorrect: true, message: "Correct. That answer checks out." }
        : { isCorrect: false, errorClass: "wrong_text", message: "Not quite. Check the wording and try again." };
    }
    const actual = parseNumber(input.value);
    if (!Number.isFinite(actual)) {
      return { isCorrect: false, errorClass: "bad_number_format", message: "Type a number. Fractions like 34/15 are okay." };
    }
    const expected = problem.expected;
    return Math.abs(actual - expected) < 1e-8
      ? { isCorrect: true, message: "Correct. That answer checks out." }
      : { isCorrect: false, errorClass: "wrong_number", message: "Not quite. Check the method and try again." };
  }

  function renderProblemVisual(problem, state) {
    const visual = problem.visual || {};
    const title = escapeHtml(visual.title || problem.classic);
    let body = "";
    if (visual.type === "bars") {
      const max = Math.max(...visual.bars.map((bar) => bar.value));
      body = visual.bars.map((bar) => {
        const width = Math.max(12, Math.round((bar.value / max) * 100));
        return '<div class="viz-bar-row"><span>' + escapeHtml(formatMathText(bar.label)) + '</span><div><i style="width:' + width + '%"></i></div><strong>' + escapeHtml(formatMathText(bar.value)) + '</strong></div>';
      }).join("");
    } else if (visual.type === "scale") {
      const ticks = Array.from({ length: 10 }, (_, index) => '<span class="' + (index === visual.tick ? "active" : "") + '">' + index + '</span>').join("");
      body = '<div class="viz-scale">' + ticks + '</div><p>start ' + visual.start + ', step ' + visual.step + '</p>';
    } else if (visual.type === "angle" || visual.type === "triangle") {
      body = '<div class="viz-diagram ' + visual.type + '"><span></span><span></span><span></span></div>';
      body += (visual.lines || []).map((line) => '<p>' + escapeHtml(formatMathText(line)) + '</p>').join("");
    } else {
      body = (visual.lines || [problem.prompt]).map((line) => '<p>' + escapeHtml(formatMathText(line)) + '</p>').join("");
    }
    if (state === "solution") {
      body += '<p class="viz-solution">Answer: ' + escapeHtml(formatMathText(problem.expectedDisplay)) + '</p>';
    }
    return {
      html: '<div class="viz-card" role="img" aria-label="' + title + ' visual"><strong>' + title + '</strong>' + body + '</div>',
      text: formatMathText((visual.lines || [problem.prompt]).join(" "))
    };
  }

  const api = {
    MODULES,
    MODULE_IDS,
    CLASSIC_SKILLS,
    ROUND_LENGTH,
    CHALLENGE_VARIANTS_PER_MODULE,
    CHALLENGE_VARIANTS_BY_MODULE,
    challengeVariantCount,
    hasChallengeBank,
    gcd,
    simplifyFraction,
    triangular,
    isPrime,
    primeFactors,
    factorString,
    parseNumber,
    parseRatio,
    normalizeExpression,
    formatMathText,
    generateProblem,
    generateChallengeProblem,
    checkAnswer,
    renderProblemVisual
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.U2T2Module = api;

  if (root.document) {
    initApp(api);
  }

  function initApp(mod) {
    const doc = root.document;
    const els = {
      moduleTitle: doc.getElementById("module-title"),
      moduleZone: doc.getElementById("module-zone"),
      moduleSource: doc.getElementById("module-source"),
      moduleIntro: doc.getElementById("module-intro"),
      skillGrid: doc.getElementById("skill-grid"),
      moduleChips: doc.getElementById("module-chips"),
      introScreen: doc.getElementById("intro-screen"),
      practiceGrid: doc.getElementById("practice-grid"),
      recap: doc.getElementById("round-recap"),
      trainButtons: doc.querySelectorAll("[data-action='train']"),
      challengeButtons: doc.querySelectorAll("[data-action='challenge']"),
      introButtons: doc.querySelectorAll("[data-action='intro']"),
      currentClassic: doc.getElementById("current-classic"),
      sessionCount: doc.getElementById("session-count"),
      prompt: doc.getElementById("problem-prompt"),
      formatHint: doc.getElementById("format-hint"),
      answerHost: doc.getElementById("answer-host"),
      check: doc.getElementById("check-button"),
      hint: doc.getElementById("hint-button"),
      why: doc.getElementById("why-button"),
      similar: doc.getElementById("similar-button"),
      next: doc.getElementById("next-button"),
      feedback: doc.getElementById("feedback"),
      hintLadder: doc.getElementById("hint-ladder"),
      visualFrame: doc.getElementById("visual-frame"),
      visualText: doc.getElementById("visual-text"),
      visualState: doc.getElementById("visual-state"),
      recapContent: doc.getElementById("recap-content"),
      freshRound: doc.getElementById("fresh-round-button")
    };

    const state = {
      moduleId: MODULE_IDS[0],
      variantIndex: 0,
      answeredInRound: 0,
      correct: 0,
      attempts: [],
      currentProblem: null,
      hintCount: 0,
      problemResolved: false,
      wrongOnCurrent: false,
      challengeMode: false
    };

    function moduleFromHash() {
      const hash = root.location.hash.replace("#", "");
      return MODULE_BY_ID[hash] ? hash : MODULE_IDS[0];
    }

    function renderModuleChips() {
      els.moduleChips.innerHTML = "";
      MODULES.forEach((module) => {
        const link = doc.createElement("a");
        link.href = "#" + module.id;
        link.className = "module-chip";
        link.dataset.id = module.id;
        link.innerHTML = "<strong>" + module.title + "</strong><span>" + module.zone + "</span>";
        els.moduleChips.appendChild(link);
      });
    }

    function setModule(moduleId) {
      state.moduleId = MODULE_BY_ID[moduleId] ? moduleId : MODULE_IDS[0];
      state.variantIndex = 0;
      state.answeredInRound = 0;
      state.correct = 0;
      state.attempts = [];
      state.challengeMode = false;
      const module = MODULE_BY_ID[state.moduleId];
      doc.title = module.title + " | U2T2 Training";
      els.moduleTitle.textContent = module.title;
      els.moduleZone.textContent = module.zone;
      els.moduleSource.textContent = module.source;
      els.moduleIntro.textContent = module.intro;
      els.skillGrid.innerHTML = "";
      module.skills.forEach((skill) => {
        const item = doc.createElement("div");
        item.innerHTML = "<strong>" + skill + "</strong><span>Practice, hints, and recap.</span>";
        els.skillGrid.appendChild(item);
      });
      doc.querySelectorAll(".module-chip").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.id === state.moduleId);
      });
      els.challengeButtons.forEach((button) => {
        button.hidden = !mod.hasChallengeBank(state.moduleId);
      });
      showIntro();
      loadProblem();
    }

    function showIntro() {
      els.introScreen.hidden = false;
      els.practiceGrid.hidden = true;
      els.recap.hidden = true;
    }

    function showPracticeSurface() {
      els.introScreen.hidden = true;
      els.practiceGrid.hidden = false;
      els.recap.hidden = true;
    }

    function resetRound(challengeMode) {
      state.challengeMode = challengeMode;
      state.variantIndex = 0;
      state.answeredInRound = 0;
      state.correct = 0;
      state.attempts = [];
      showPracticeSurface();
      loadProblem(challengeMode ? "Challenge mode: slower, trickier, and worth thinking through." : "Practice mode: build the skill first.");
    }

    function showPractice() {
      resetRound(false);
    }

    function showChallenge() {
      if (!mod.hasChallengeBank(state.moduleId)) {
        resetRound(false);
        return;
      }
      resetRound(true);
    }

    function loadProblem(statusMessage) {
      state.currentProblem = state.challengeMode
        ? mod.generateChallengeProblem(state.moduleId, state.variantIndex)
        : mod.generateProblem(state.moduleId, state.variantIndex);
      state.hintCount = 0;
      state.problemResolved = false;
      state.wrongOnCurrent = false;
      const problem = state.currentProblem;
      els.currentClassic.textContent = problem.classic;
      els.sessionCount.textContent = (state.answeredInRound + 1) + " of " + ROUND_LENGTH + (state.challengeMode ? " challenge" : "");
      els.prompt.textContent = formatMathText(problem.prompt);
      els.formatHint.textContent = formatMathText(problem.formatHint);
      els.feedback.className = "feedback-card muted";
      els.feedback.textContent = statusMessage || (problem.answerType === "choice" ? "Choose an answer, then check it." : "Type an answer, then check it.");
      els.hintLadder.innerHTML = "";
      els.next.disabled = true;
      els.check.disabled = false;
      els.why.disabled = false;
      els.similar.hidden = true;
      els.similar.disabled = true;
      renderAnswer(problem);
      setAnswerLocked(false);
      setVisual("initial");
    }

    function renderAnswer(problem) {
      els.answerHost.innerHTML = "";
      if (problem.answerType === "choice") {
        const grid = doc.createElement("div");
        grid.className = "choice-grid";
        problem.choices.forEach((choice) => {
          const label = doc.createElement("label");
          label.className = "choice-card";
          label.innerHTML = '<input type="radio" name="answer-choice" value="' + escapeHtml(String(choice.value)) + '"><span>' + escapeHtml(formatMathText(choice.label)) + '</span>';
          grid.appendChild(label);
        });
        els.answerHost.appendChild(grid);
        return;
      }
      const input = doc.createElement("input");
      input.id = "answer-input";
      input.name = "answer-input";
      input.autocomplete = "off";
      input.placeholder = problem.answerType === "ratio"
        ? "Example: 4:21"
        : problem.answerType === "expression"
          ? "Example: 3x + 8"
          : "Type your answer";
      els.answerHost.appendChild(input);
    }

    function setAnswerLocked(locked) {
      els.answerHost.querySelectorAll("input").forEach((input) => {
        input.disabled = locked;
      });
    }

    function collectInput(problem) {
      if (problem.answerType === "choice") {
        const checked = doc.querySelector("input[name='answer-choice']:checked");
        return { choice: checked ? checked.value : "" };
      }
      const input = doc.getElementById("answer-input");
      return { value: input ? input.value : "" };
    }

    function setFeedback(type, message) {
      els.feedback.className = "feedback-card " + type;
      els.feedback.textContent = formatMathText(message);
    }

    function setVisual(mode) {
      const rendered = mod.renderProblemVisual(state.currentProblem, mode);
      els.visualFrame.innerHTML = rendered.html;
      els.visualText.textContent = rendered.text;
      els.visualState.textContent = mode;
    }

    function checkCurrent(event) {
      event.preventDefault();
      if (state.problemResolved) {
        setFeedback("muted", "This one is already resolved. Use Next or try a similar repair question.");
        return;
      }
      const problem = state.currentProblem;
      const result = mod.checkAnswer(problem, collectInput(problem));
      if (result.isCorrect) {
        setFeedback("good", result.message);
        els.next.disabled = false;
        els.similar.hidden = true;
        els.similar.disabled = true;
        els.check.disabled = true;
        state.problemResolved = true;
        setAnswerLocked(true);
        state.correct += 1;
        state.attempts.push({ problem, correct: true, repaired: state.wrongOnCurrent, hintCount: state.hintCount });
        setVisual("solution");
      } else {
        setFeedback("bad", result.message + " You can retry here or take a similar one with fresh numbers.");
        els.similar.hidden = false;
        els.similar.disabled = false;
        if (!state.wrongOnCurrent) {
          state.attempts.push({ problem, correct: false, errorClass: result.errorClass, hintCount: state.hintCount });
          state.wrongOnCurrent = true;
        }
      }
    }

    function showHint() {
      state.hintCount += 1;
      const problem = state.currentProblem;
      const hint = state.hintCount === 1 ? problem.hint1 : problem.hint2;
      const item = doc.createElement("div");
      item.className = "hint-item";
      item.textContent = formatMathText(hint);
      els.hintLadder.appendChild(item);
      setFeedback("muted", hint);
      setVisual("hint");
    }

    function showWhy() {
      if (!state.problemResolved && !state.wrongOnCurrent) {
        state.attempts.push({ problem: state.currentProblem, correct: false, errorClass: "shown_solution", hintCount: state.hintCount });
      }
      const item = doc.createElement("div");
      item.className = "hint-item why";
      item.textContent = formatMathText(state.currentProblem.solution);
      els.hintLadder.appendChild(item);
      setFeedback("muted", state.currentProblem.solution);
      setVisual("solution");
      state.problemResolved = true;
      els.check.disabled = true;
      els.next.disabled = false;
      els.similar.hidden = false;
      els.similar.disabled = false;
      setAnswerLocked(true);
    }

    function findSimilarVariant(problem) {
      for (let offset = 1; offset <= 64; offset += 1) {
        const candidateIndex = state.variantIndex + offset;
        const candidate = state.challengeMode
          ? mod.generateChallengeProblem(problem.moduleId, candidateIndex)
          : mod.generateProblem(problem.moduleId, candidateIndex);
        if (state.challengeMode && candidate.prompt !== problem.prompt) {
          return candidateIndex;
        }
        if (!state.challengeMode && candidate.classic === problem.classic && candidate.prompt !== problem.prompt) {
          return candidateIndex;
        }
      }
      return state.variantIndex + 4;
    }

    function trySimilarProblem() {
      const oldProblem = state.currentProblem;
      state.variantIndex = findSimilarVariant(oldProblem);
      loadProblem(state.challengeMode ? "Fresh challenge. Use what you just learned." : "Same skill, fresh numbers. Repair it here.");
    }

    function nextProblem() {
      state.variantIndex += 1;
      state.answeredInRound += 1;
      if (state.answeredInRound >= ROUND_LENGTH) {
        showRecap();
        return;
      }
      loadProblem();
    }

    function showRecap() {
      els.introScreen.hidden = true;
      els.practiceGrid.hidden = true;
      els.recap.hidden = false;
      const misses = state.attempts.filter((attempt) => !attempt.correct);
      const uniqueMisses = [];
      const seen = new Set();
      misses.forEach((miss) => {
        const key = miss.problem.classic;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueMisses.push(miss);
        }
      });
      els.recapContent.innerHTML = "";
      const summary = doc.createElement("div");
      summary.className = "recap-card";
      summary.innerHTML = "<strong>Score: " + state.correct + " / " + ROUND_LENGTH + "</strong><p>" + (uniqueMisses.length ? "Repair these skills next:" : "Clean round. Try a fresh set to keep the streak alive.") + "</p>";
      els.recapContent.appendChild(summary);
      uniqueMisses.forEach((miss) => {
        const card = doc.createElement("div");
        card.className = "recap-card";
        card.innerHTML = "<strong>" + escapeHtml(miss.problem.classic) + "</strong><p>" + escapeHtml(formatMathText(miss.problem.hint1)) + "</p>";
        els.recapContent.appendChild(card);
      });
    }

    function freshRound() {
      state.variantIndex += 3;
      state.answeredInRound = 0;
      state.correct = 0;
      state.attempts = [];
      showPracticeSurface();
      loadProblem();
    }

    renderModuleChips();
    setModule(moduleFromHash());

    root.addEventListener("hashchange", () => setModule(moduleFromHash()));
    els.trainButtons.forEach((button) => button.addEventListener("click", showPractice));
    els.challengeButtons.forEach((button) => button.addEventListener("click", showChallenge));
    els.introButtons.forEach((button) => button.addEventListener("click", showIntro));
    doc.getElementById("answer-form").addEventListener("submit", checkCurrent);
    els.hint.addEventListener("click", showHint);
    els.why.addEventListener("click", showWhy);
    els.similar.addEventListener("click", trySimilarProblem);
    els.next.addEventListener("click", nextProblem);
    els.freshRound.addEventListener("click", freshRound);
  }
})(typeof window !== "undefined" ? window : globalThis);
