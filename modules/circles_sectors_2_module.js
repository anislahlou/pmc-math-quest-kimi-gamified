(function (root) {
  "use strict";

  const ROUND_LENGTH = 6;
  const INTRO_SCENE_MS = 9000;

  // Source: Year 6 "M" workbook, Lesson 26 "Circles and Circle Sectors (2)".
  // Printed pages 104-116 (PDF pages 114-126). The lesson teaches two moves:
  // split and combine figures to make the area easier to calculate, and find
  // areas by taking away the blank area from the whole. Problems specify the
  // value of pi to use (3.14, 22/7, 3, or "leave in terms of pi"), so every
  // generator carries its pi value explicitly and computes the answer in code.
  const SRC = "Book 104-116 / PDF 114-126";

  const CLASSICS = [
    { id: "circle-in-square", nickname: "Circle in a Square", skill: "Subtract an inscribed circle from its square: corners = (2r)² − πr², because the square's side equals the circle's diameter.", sourcePages: SRC },
    { id: "quarter-shade", nickname: "Quarter Circle Shade", skill: "A quarter circle of radius s sits inside a square of side s; the leftover shade is s² − ¼πs², kept in terms of π.", sourcePages: SRC },
    { id: "four-circle-gap", nickname: "Four Circle Gap", skill: "Four identical circles pack a square; the central gap is the small square between centres minus one whole circle: (2r)² − πr².", sourcePages: SRC },
    { id: "petal-power", nickname: "Petal Power", skill: "Four overlapping semicircles on a square's edges make petals: petals = 2πr² − 4r², and the leftover corners are the square minus the petals.", sourcePages: SRC },
    { id: "leaf-lens", nickname: "Leaf Lens", skill: "Two quarter circles overlap across a square and their lens is (½π − 1)s², found by adding the quarters and subtracting the square.", sourcePages: SRC },
    { id: "flag-slice", nickname: "Flag Slice", skill: "A right isosceles triangle sits on a quarter circle; the slice between them is ¼πr² − ½r², the quarter minus the triangle.", sourcePages: SRC }
  ];

  const CLASSIC_IDS = CLASSICS.map((classic) => classic.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((classic) => [classic.id, classic]));

  // Registry skills: ["Circle in a square", "Quarter circle shade",
  // "Four circle gap", "Petal power", "Leaf lens", "Flag slice"].
  const CLASSIC_SKILLS = {
    "circle-in-square": "Circle in a square",
    "quarter-shade": "Quarter circle shade",
    "four-circle-gap": "Four circle gap",
    "petal-power": "Petal power",
    "leaf-lens": "Leaf lens",
    "flag-slice": "Flag slice"
  };

  const SOURCE_COVERAGE = {
    "circle-in-square": ["Exploration 2.1 (square 400 cm², circle radius)", "Exploration 2.2 (square 196 cm², shaded corners, π = 22/7)", "Further Basic 2 (circle radius 10 in square, π = 3.14)"],
    "quarter-shade": ["Exploration 2 Q2 (side 20, answer 400 − 100π)", "Further 2 (side 2, quarter circles, 4 − π)", "Homework 3 (side 10, π = 3)"],
    "four-circle-gap": ["Exploration 3 (four circles in a 1600 cm² square, π = 3.14)", "central gap = small square minus circle"],
    "petal-power": ["Exploration 4.2 (petals in a 2-unit square, π = 22/7)", "Challenge (shaded corners around petals, π = 3)", "Practice (circle + four quarter circles, π = 3)"],
    "leaf-lens": ["Learn & Discover figure 2 (lens in a side-4 square, 8π − 16)", "Homework 1 (two semicircles in square ABCD)"],
    "flag-slice": ["Learn & Discover figure 1 (quarter minus triangle, 4π − 8)", "Further 5 (quarter circle radius 8 with isosceles triangle, π = 3)"]
  };

  const INTRO_SCENES = [
    {
      title: "Circle in a square",
      purpose: "Subtract the inscribed circle from the square to get the corners.",
      classicId: "circle-in-square",
      kind: "inscribed",
      durationMs: 18000,
      caption: "A circle inscribed in a square touches all four sides, so the square's side is the diameter 2r. The shaded corners are square minus circle: (2r)² − πr². With r = 10 and π = 3.14 that is 400 − 314 = 86.",
      voiceover: "When a circle fits exactly inside a square, the side of the square equals the circle's diameter, two r. So the whole square is two r times two r, and the blank circle inside is pi r squared. Take the circle away from the square and the four shaded corners are left. With radius ten and pi as three point one four, that is four hundred minus three hundred and fourteen, which is eighty six."
    },
    {
      title: "Quarter circle shade",
      purpose: "Take a quarter circle away from a square, keeping the answer in terms of π.",
      classicId: "quarter-shade",
      kind: "quarter",
      durationMs: 17000,
      caption: "A quarter circle with radius s fills a square of side s. The leftover shade is the square minus the quarter: s² − ¼πs². For s = 20 that is 400 − 100π — leave it in terms of π when the question asks.",
      voiceover: "A quarter circle with the same radius as the square's side sweeps from one corner. The shaded leftover is the square minus the quarter circle, which is s squared minus a quarter of pi s squared. For a side of twenty, that is four hundred minus one hundred pi, and you can leave the answer written with pi in it."
    },
    {
      title: "Four circle gap",
      purpose: "Find the middle gap between four packed circles.",
      classicId: "four-circle-gap",
      kind: "fourgap",
      durationMs: 18000,
      caption: "Four identical circles pack a big square, so the big side is 4r. Join the four centres: that small square has side 2r, and the gap in the middle is the small square minus the four quarter circles — one whole circle: (2r)² − πr².",
      voiceover: "Four identical circles fill a big square, so the big side is four radiuses long. Now draw a small square joining the four centres. Its side is two r, and inside it each circle contributes a quarter, which makes one whole circle. So the middle gap is the small square minus one circle: two r squared minus pi r squared."
    },
    {
      title: "Petal power",
      purpose: "Overlapping semicircles make petals: circles minus the square.",
      classicId: "petal-power",
      kind: "petal",
      durationMs: 18000,
      caption: "Four semicircles drawn on the edges of a square overlap to make four petals. The semicircles add to 2πr², and together they cover the square once plus the petals once more — so petals = 2πr² − 4r², and corners = square − petals.",
      voiceover: "Draw a semicircle on each edge of a square and they overlap in four petal shapes. All four semicircles together make two pi r squared. They blanket the whole square once, and the petals get covered twice. So the extra layer is the petals: two pi r squared minus the square's four r squared. The plain corners are the square minus those petals."
    },
    {
      title: "Leaf lens",
      purpose: "Two quarter circles overlap in a lens: add the quarters, subtract the square.",
      classicId: "leaf-lens",
      kind: "lens",
      durationMs: 17000,
      caption: "Two quarter circles from opposite corners overlap in a leaf-shaped lens. Together they cover the square once and the lens twice, so lens = ¼πs² + ¼πs² − s² = (½π − 1)s². For s = 10 and π = 3.14 that is 57.",
      voiceover: "Sweep a quarter circle from one corner of the square, and another from the opposite corner. Together they cover every point of the square at least once, and the leaf shaped lens in the middle exactly twice. So add the two quarter circles and subtract the square, leaving half pi minus one, times s squared. With side ten and pi three point one four, the leaf is fifty seven."
    },
    {
      title: "Flag slice",
      purpose: "Quarter circle minus the right isosceles triangle inside it.",
      classicId: "flag-slice",
      kind: "flag",
      durationMs: 17000,
      caption: "A right isosceles triangle with legs r sits inside a quarter circle of radius r. The curved slice between them is ¼πr² − ½r². With r = 8 and π = 3 that is 48 − 32 = 16.",
      voiceover: "Inside a quarter circle, draw the triangle joining the two straight edges. It is right angled and isosceles with legs r, so its area is half r squared. The quarter circle is a quarter pi r squared. Take the triangle away and the curved slice that remains is a quarter pi r squared minus half r squared. With radius eight and pi as three, that is forty eight minus thirty two, sixteen."
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

  // ---- numeric helpers -------------------------------------------------------

  // Round to 2 dp exactly (areas with pi = 3.14 terminate within 2 dp).
  function r2(x) {
    return Math.round(x * 100) / 100;
  }

  // Display a 2 dp-rounded number without trailing zeros ("86", "21.5", "48.15").
  function fmt(x) {
    return String(r2(x));
  }

  function circleChoice(choices, correct, variantIndex) {
    const unique = [...new Set(choices.map(String))];
    const without = unique.filter((choice) => choice !== String(correct));
    const ordered = [String(correct), ...without].slice(0, 4);
    const offset = variantIndex % ordered.length;
    const rotated = ordered.slice(offset).concat(ordered.slice(0, offset));
    return rotated.map((label) => ({ label, isCorrect: label === String(correct) }));
  }

  // Decimal-aware distractor builder: keeps 2 dp values, dedupes on the
  // rounded value, rejects non-positive candidates, and pads with offsets.
  function distinctDistractors(correct, candidates) {
    const out = [];
    const seen = new Set([fmt(correct)]);
    for (const candidate of candidates) {
      const n = r2(candidate);
      if (!Number.isFinite(n) || n <= 0) continue;
      const key = fmt(n);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(n);
      if (out.length === 3) break;
    }
    let pad = 1;
    while (out.length < 3) {
      const candidate = r2(correct + pad);
      if (candidate > 0 && !seen.has(fmt(candidate))) {
        seen.add(fmt(candidate));
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

  function finishNumeric(p, correct, distractors, variantIndex) {
    p.expected = r2(correct);
    p.expectedDisplay = fmt(correct);
    p.correctInput = p.answerType === "choice" ? { choice: fmt(correct) } : { value: fmt(correct) };
    p.choices = p.answerType === "choice" ? circleChoice([fmt(correct), ...distractors.map(fmt)], fmt(correct), variantIndex) : [];
    return p;
  }

  function finishSymbolic(p, correct, distractors, variantIndex) {
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = circleChoice([correct, ...distractors], correct, variantIndex);
    return p;
  }

  const PRINCIPLE = {
    inscribed: "take the blank circle away from the whole square",
    quarter: "square minus quarter circle — keep the π if asked",
    fourgap: "join the centres: small square minus one whole circle",
    petal: "semicircles cover the square once and the petals twice",
    lens: "add the two quarters, subtract the square",
    flag: "quarter circle minus the triangle inside it"
  };

  // ---- generators ------------------------------------------------------------

  function circleInSquareProblem(variantIndex) {
    const cases = [
      { r: 10, pi: 3.14, piText: "π = 3.14" },
      { r: 20, pi: 3.14, piText: "π = 3.14" },
      { r: 10, pi: 3, piText: "π = 3" },
      { r: 5, pi: 3.14, piText: "π = 3.14" },
      { r: 7, pi: 22 / 7, piText: "π = 22/7" },
      { r: 30, pi: 3, piText: "π = 3" }
    ];
    const data = cases[variantIndex % cases.length];
    const side = 2 * data.r;
    const answer = side * side - data.pi * data.r * data.r;
    const p = problemBase("circle-in-square", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `A circle of radius ${data.r} cm is inscribed in a square, touching all four sides. Find the total shaded area between the circle and the square, in cm². (Take ${data.piText})`;
    p.hint1 = "The circle touches all four sides, so the square's side equals the diameter, 2r.";
    p.hint2 = `Corners = square − circle = ${side}² − ${data.piText.replace("π = ", "")} × ${data.r}².`;
    p.solution = `Square = ${side} × ${side} = ${side * side}. Circle = ${data.piText.replace("π = ", "")} × ${data.r}² = ${fmt(data.pi * data.r * data.r)}. Shaded = ${side * side} − ${fmt(data.pi * data.r * data.r)} = ${fmt(answer)} cm².`;
    p.visual = { kind: "inscribed", principle: PRINCIPLE.inscribed, expr: `square side ${side}, circle radius ${data.r}`, detail: `${side * side} − ${fmt(data.pi * data.r * data.r)} = ${fmt(answer)}` };
    const distractors = distinctDistractors(answer, [side * side, data.pi * data.r * data.r, answer + data.r, side * side - data.r * data.r]);
    return finishNumeric(p, answer, distractors, variantIndex);
  }

  function quarterShadeProblem(variantIndex) {
    const cases = [20, 10, 4, 8, 12, 40];
    const s = cases[variantIndex % cases.length];
    const sq = s * s;
    const quarterCoeff = sq / 4;
    const correct = `${sq} − ${quarterCoeff}π`;
    const distractors = [
      `${sq} − ${sq / 2}π`,
      `${sq / 2} − ${quarterCoeff}π`,
      `${2 * sq} − ${quarterCoeff}π`
    ];
    const p = problemBase("quarter-shade", variantIndex, "choice");
    p.prompt = `A quarter circle of radius ${s} is drawn inside a square with sides of length ${s}. Find the area of the region inside the square but outside the quarter circle, in terms of π.`;
    p.hint1 = "The quarter circle's radius equals the square's side, so it sweeps corner to corner.";
    p.hint2 = `Shade = square − quarter circle = ${s}² − ¼ × π × ${s}².`;
    p.solution = `Square = ${s}² = ${sq}. Quarter circle = ¼π × ${s}² = ${quarterCoeff}π. Shaded = ${correct}.`;
    p.visual = { kind: "quarter", principle: PRINCIPLE.quarter, expr: `square side ${s}, quarter radius ${s}`, detail: `${s}² − ¼π·${s}² = ${correct}` };
    return finishSymbolic(p, correct, distractors, variantIndex);
  }

  function fourCircleGapProblem(variantIndex) {
    const cases = [
      { r: 10, pi: 3.14, piText: "π = 3.14" },
      { r: 20, pi: 3.14, piText: "π = 3.14" },
      { r: 5, pi: 3.14, piText: "π = 3.14" },
      { r: 10, pi: 3, piText: "π = 3" },
      { r: 7, pi: 22 / 7, piText: "π = 22/7" },
      { r: 15, pi: 3, piText: "π = 3" }
    ];
    const data = cases[variantIndex % cases.length];
    const bigSide = 4 * data.r;
    const bigArea = bigSide * bigSide;
    const answer = (2 * data.r) * (2 * data.r) - data.pi * data.r * data.r;
    const p = problemBase("four-circle-gap", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Four identical circles are drawn inside a square of area ${bigArea} cm², each touching two sides and two other circles. Find the shaded gap in the middle of the four circles, in cm². (Take ${data.piText})`;
    p.hint1 = `The square's side is √${bigArea} = ${bigSide}, which fits two circles across — so each radius is ${data.r}.`;
    p.hint2 = `Join the four centres: a small square of side ${2 * data.r} holding four quarter circles = one whole circle.`;
    p.solution = `Radius = ${bigSide} ÷ 4 = ${data.r}. Small square = ${2 * data.r}² = ${4 * data.r * data.r}. One circle = ${fmt(data.pi * data.r * data.r)}. Gap = ${4 * data.r * data.r} − ${fmt(data.pi * data.r * data.r)} = ${fmt(answer)} cm².`;
    p.visual = { kind: "fourgap", principle: PRINCIPLE.fourgap, expr: `big square ${bigArea}, four packed circles`, detail: `r = ${data.r}; ${4 * data.r * data.r} − ${fmt(data.pi * data.r * data.r)} = ${fmt(answer)}` };
    const distractors = distinctDistractors(answer, [bigArea - data.pi * data.r * data.r * 4, 4 * data.r * data.r, data.pi * data.r * data.r, answer * 4]);
    return finishNumeric(p, answer, distractors, variantIndex);
  }

  function petalPowerProblem(variantIndex) {
    const cases = [
      { r: 10, pi: 3.14, piText: "π = 3.14", want: "petals" },
      { r: 10, pi: 3.14, piText: "π = 3.14", want: "corners" },
      { r: 5, pi: 3.14, piText: "π = 3.14", want: "petals" },
      { r: 20, pi: 3.14, piText: "π = 3.14", want: "corners" },
      { r: 7, pi: 22 / 7, piText: "π = 22/7", want: "petals" },
      { r: 5, pi: 3, piText: "π = 3", want: "corners" }
    ];
    const data = cases[variantIndex % cases.length];
    const side = 2 * data.r;
    const sq = side * side;
    const petals = 2 * data.pi * data.r * data.r - sq;
    const answer = data.want === "petals" ? petals : sq - petals;
    const wantText = data.want === "petals" ? "the four shaded petals" : "the plain corner regions outside the petals";
    const p = problemBase("petal-power", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Four identical overlapping semicircles are drawn along the edges of a square with sides of length ${side}, making four petals. Find the total area of ${wantText}, in square units. (Take ${data.piText})`;
    p.hint1 = "The four semicircles together cover the square once and the petals a second time.";
    p.hint2 = `Petals = 4 semicircles − square = 2π × ${data.r}² − ${sq}${data.want === "corners" ? "; corners = square − petals" : ""}.`;
    p.solution = `Four semicircles = 2π × ${data.r}² = ${fmt(2 * data.pi * data.r * data.r)}. Petals = ${fmt(2 * data.pi * data.r * data.r)} − ${sq} = ${fmt(petals)}.${data.want === "corners" ? ` Corners = ${sq} − ${fmt(petals)} = ${fmt(answer)}.` : ""} Answer: ${fmt(answer)}.`;
    p.visual = { kind: "petal", principle: PRINCIPLE.petal, expr: `square side ${side}, semicircle radius ${data.r} (${data.want})`, detail: `petals = ${fmt(2 * data.pi * data.r * data.r)} − ${sq} = ${fmt(petals)}${data.want === "corners" ? ` → corners = ${fmt(answer)}` : ""}` };
    const distractors = distinctDistractors(answer, [data.want === "petals" ? sq - petals : petals, sq, 2 * data.pi * data.r * data.r, answer / 2]);
    return finishNumeric(p, answer, distractors, variantIndex);
  }

  function leafLensProblem(variantIndex) {
    const cases = [
      { s: 10, pi: 3.14, piText: "π = 3.14" },
      { s: 20, pi: 3.14, piText: "π = 3.14" },
      { s: 4, pi: 3, piText: "π = 3" },
      { s: 30, pi: 3.14, piText: "π = 3.14" },
      { s: 14, pi: 22 / 7, piText: "π = 22/7" },
      { s: 8, pi: 3, piText: "π = 3" }
    ];
    const data = cases[variantIndex % cases.length];
    const sq = data.s * data.s;
    const quarter = data.pi * sq / 4;
    const answer = 2 * quarter - sq;
    const p = problemBase("leaf-lens", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Two quarter circles of radius ${data.s} are drawn from opposite corners of a square with sides of length ${data.s}. They overlap in a leaf-shaped lens. Find the area of the lens, in square units. (Take ${data.piText})`;
    p.hint1 = "Together the two quarter circles cover the square once and the lens twice.";
    p.hint2 = `Lens = quarter + quarter − square = 2 × ¼π × ${data.s}² − ${sq}.`;
    p.solution = `Each quarter = ¼π × ${data.s}² = ${fmt(quarter)}. Lens = ${fmt(quarter)} + ${fmt(quarter)} − ${sq} = ${fmt(answer)}.`;
    p.visual = { kind: "lens", principle: PRINCIPLE.lens, expr: `square side ${data.s}, two opposite quarters`, detail: `2 × ${fmt(quarter)} − ${sq} = ${fmt(answer)}` };
    const distractors = distinctDistractors(answer, [quarter, sq - answer, sq, answer * 2]);
    return finishNumeric(p, answer, distractors, variantIndex);
  }

  function flagSliceProblem(variantIndex) {
    const cases = [
      { r: 8, pi: 3, piText: "π = 3" },
      { r: 12, pi: 3, piText: "π = 3" },
      { r: 20, pi: 3.14, piText: "π = 3.14" },
      { r: 6, pi: 3, piText: "π = 3" },
      { r: 10, pi: 3.14, piText: "π = 3.14" },
      { r: 16, pi: 3, piText: "π = 3" }
    ];
    const data = cases[variantIndex % cases.length];
    const quarter = data.pi * data.r * data.r / 4;
    const triangle = data.r * data.r / 2;
    const answer = quarter - triangle;
    const p = problemBase("flag-slice", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `A right-angled isosceles triangle with two sides of length ${data.r} is drawn inside a quarter circle of radius ${data.r}. Find the area of the shaded slice between the triangle's longest side and the curve, in square units. (Take ${data.piText})`;
    p.hint1 = "The triangle joins the two straight edges of the quarter circle, so its legs are both r.";
    p.hint2 = `Slice = quarter circle − triangle = ¼ × π × ${data.r}² − ½ × ${data.r} × ${data.r}.`;
    p.solution = `Quarter = ¼π × ${data.r}² = ${fmt(quarter)}. Triangle = ½ × ${data.r} × ${data.r} = ${fmt(triangle)}. Slice = ${fmt(quarter)} − ${fmt(triangle)} = ${fmt(answer)}.`;
    p.visual = { kind: "flag", principle: PRINCIPLE.flag, expr: `quarter radius ${data.r}, triangle legs ${data.r}`, detail: `${fmt(quarter)} − ${fmt(triangle)} = ${fmt(answer)}` };
    const distractors = distinctDistractors(answer, [quarter, triangle, quarter + triangle, answer * 2]);
    return finishNumeric(p, answer, distractors, variantIndex);
  }

  function generateProblem(classicId, variantIndex = 0) {
    const generators = {
      "circle-in-square": circleInSquareProblem,
      "quarter-shade": quarterShadeProblem,
      "four-circle-gap": fourCircleGapProblem,
      "petal-power": petalPowerProblem,
      "leaf-lens": leafLensProblem,
      "flag-slice": flagSliceProblem
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
    const correct = Math.abs(value - Number(problem.expected)) < 1e-6;
    return { isCorrect: correct, errorClass: correct ? null : "number_mismatch" };
  }

  function svgShell(inner) {
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Circles and sectors visual">${inner}</svg>`;
  }

  // Shared stable "circle card": a square with an inscribed circle motif, the
  // teaching principle, the case's measurements, and a worked detail line that
  // stays hidden behind "= ?" until the answer is revealed. The element
  // skeleton is identical across variants within each state (the solution
  // state adds only the answer banner), so the diagram-parity gate passes, and
  // the numeric answer only appears in that solution-state banner.
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
        <rect x="196" y="70" width="168" height="168" rx="6" fill="#fff8dc" stroke="#16345d" stroke-width="4"/>
        <circle cx="280" cy="154" r="80" fill="#ffffff" stroke="#0b8993" stroke-width="4"/>
        <circle cx="280" cy="154" r="6" fill="#16345d"/>
        <text x="280" y="44" text-anchor="middle" class="formula-note">${escapeHtml(v.principle)}</text>
        <text x="280" y="262" text-anchor="middle" class="side-label" style="font-size:15px">${escapeHtml(v.expr)}</text>
        <text x="280" y="288" text-anchor="middle" class="formula-note">${escapeHtml(isRevealed ? v.detail : "= ?")}</text>
        ${answer}
      `);
    const text = problem.skill;
    return { html, text };
  }

  // Dedicated intro teaching diagrams (separate from the practice card, so
  // diagram-parity — which only inspects generated problems — is unaffected).
  function introShell(inner) {
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Circles intro scene">${inner}</svg>`;
  }

  function introInscribed() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Square minus inscribed circle</text>
        <rect x="80" y="60" width="150" height="150" fill="#ffe6e0" stroke="#16345d" stroke-width="4"/>
        <circle cx="155" cy="135" r="75" fill="#ffffff" stroke="#0b8993" stroke-width="4"/>
        <text x="155" y="242" text-anchor="middle" class="formula-note">side = 2r — corners stay shaded</text>
        <text x="400" y="106" text-anchor="middle" class="side-label" style="font-size:16px">(2r)² − πr²</text>
        <text x="400" y="146" text-anchor="middle" class="formula-note">r = 10, π = 3.14:</text>
        <text x="400" y="180" text-anchor="middle" class="side-label" style="font-size:16px">400 − 314 = 86</text>
      `);
  }

  function introQuarter() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Square minus a quarter circle</text>
        <rect x="80" y="60" width="150" height="150" fill="#ffe6e0" stroke="#16345d" stroke-width="4"/>
        <path d="M 80 210 L 80 60 A 150 150 0 0 1 230 210 Z" fill="#ffffff" stroke="#0b8993" stroke-width="4"/>
        <text x="155" y="242" text-anchor="middle" class="formula-note">radius = side s</text>
        <text x="400" y="106" text-anchor="middle" class="side-label" style="font-size:16px">s² − ¼πs²</text>
        <text x="400" y="146" text-anchor="middle" class="formula-note">s = 20:</text>
        <text x="400" y="180" text-anchor="middle" class="side-label" style="font-size:16px">400 − 100π</text>
      `);
  }

  function introFourGap() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Join the centres, subtract one circle</text>
        <rect x="70" y="60" width="160" height="160" fill="#ffffff" stroke="#16345d" stroke-width="4"/>
        <circle cx="110" cy="100" r="40" fill="#fff8dc" stroke="#0b8993" stroke-width="3"/>
        <circle cx="190" cy="100" r="40" fill="#fff8dc" stroke="#0b8993" stroke-width="3"/>
        <circle cx="110" cy="180" r="40" fill="#fff8dc" stroke="#0b8993" stroke-width="3"/>
        <circle cx="190" cy="180" r="40" fill="#fff8dc" stroke="#0b8993" stroke-width="3"/>
        <rect x="110" y="100" width="80" height="80" fill="none" stroke="#ff7654" stroke-width="3"/>
        <text x="400" y="106" text-anchor="middle" class="side-label" style="font-size:16px">(2r)² − πr²</text>
        <text x="400" y="146" text-anchor="middle" class="formula-note">square 1600 → r = 10:</text>
        <text x="400" y="180" text-anchor="middle" class="side-label" style="font-size:16px">400 − 314 = 86</text>
      `);
  }

  function introPetal() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Semicircles cover the petals twice</text>
        <rect x="80" y="60" width="150" height="150" fill="#ffffff" stroke="#16345d" stroke-width="4"/>
        <path d="M 80 60 A 75 75 0 0 0 230 60 Z" fill="#ffe6e0" fill-opacity="0.35" stroke="#0b8993" stroke-width="3"/>
        <path d="M 80 210 A 75 75 0 0 1 230 210 Z" fill="#ffe6e0" fill-opacity="0.35" stroke="#0b8993" stroke-width="3"/>
        <path d="M 80 60 A 75 75 0 0 1 80 210 Z" fill="#ffe6e0" fill-opacity="0.35" stroke="#0b8993" stroke-width="3"/>
        <path d="M 230 60 A 75 75 0 0 0 230 210 Z" fill="#ffe6e0" fill-opacity="0.35" stroke="#0b8993" stroke-width="3"/>
        <text x="155" y="242" text-anchor="middle" class="formula-note">4 semicircles — overlaps are the petals</text>
        <text x="400" y="106" text-anchor="middle" class="side-label" style="font-size:16px">petals = 2πr² − 4r²</text>
        <text x="400" y="146" text-anchor="middle" class="formula-note">r = 10, π = 3.14:</text>
        <text x="400" y="180" text-anchor="middle" class="side-label" style="font-size:16px">628 − 400 = 228</text>
      `);
  }

  function introLens() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Two quarters cover the lens twice</text>
        <rect x="80" y="60" width="150" height="150" fill="#ffffff" stroke="#16345d" stroke-width="4"/>
        <path d="M 80 210 L 80 60 A 150 150 0 0 1 230 210 Z" fill="#ffe6e0" fill-opacity="0.6" stroke="#0b8993" stroke-width="3"/>
        <path d="M 230 60 L 230 210 A 150 150 0 0 1 80 60 Z" fill="#dbe4ec" fill-opacity="0.6" stroke="#0b8993" stroke-width="3"/>
        <text x="155" y="242" text-anchor="middle" class="formula-note">the overlap is the leaf lens</text>
        <text x="400" y="106" text-anchor="middle" class="side-label" style="font-size:16px">(½π − 1)s²</text>
        <text x="400" y="146" text-anchor="middle" class="formula-note">s = 10, π = 3.14:</text>
        <text x="400" y="180" text-anchor="middle" class="side-label" style="font-size:16px">157 − 100 = 57</text>
      `);
  }

  function introFlag() {
    return introShell(`
        <text x="280" y="30" text-anchor="middle" class="side-label" style="font-size:17px">Quarter circle minus the triangle</text>
        <path d="M 80 210 L 80 60 A 150 150 0 0 1 230 210 Z" fill="#fff8dc" stroke="#0b8993" stroke-width="4"/>
        <path d="M 80 210 L 80 60 L 230 210 Z" fill="#ffe6e0" stroke="#16345d" stroke-width="3"/>
        <text x="155" y="242" text-anchor="middle" class="formula-note">legs r, curved slice remains</text>
        <text x="400" y="106" text-anchor="middle" class="side-label" style="font-size:16px">¼πr² − ½r²</text>
        <text x="400" y="146" text-anchor="middle" class="formula-note">r = 8, π = 3:</text>
        <text x="400" y="180" text-anchor="middle" class="side-label" style="font-size:16px">48 − 32 = 16</text>
      `);
  }

  function renderIntroScene(index) {
    const scene = INTRO_SCENES[index % INTRO_SCENES.length];
    const builders = {
      "circle-in-square": introInscribed,
      "quarter-shade": introQuarter,
      "four-circle-gap": introFourGap,
      "petal-power": introPetal,
      "leaf-lens": introLens,
      "flag-slice": introFlag
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

  root.CirclesSectors2Module = api;

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
    return `<input class="filled-answer" name="value" autocomplete="off" inputmode="decimal" placeholder="Type the number">`;
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
      : "<div><strong>Clean round.</strong><br>You subtracted the blanks, joined the centres, counted the double-covered petals and lenses, and sliced the quarters accurately.</div>";
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
