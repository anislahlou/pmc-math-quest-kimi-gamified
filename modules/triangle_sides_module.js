(function (root) {
  "use strict";

  const ROUND_LENGTH = 8;
  const INTRO_SCENE_MS = 9000;

  const CLASSICS = [
    { id: "triangle-gate", nickname: "Triangle Gate", skill: "Check whether the two shorter sides add to more than the longest side.", sourcePages: "Book 118, 127 / PDF 128, 137" },
    { id: "isosceles-choice", nickname: "Isosceles Choice", skill: "Choose the valid repeated side in an isosceles triangle, then find the perimeter.", sourcePages: "Book 119, 125, 127 / PDF 129, 135, 137" },
    { id: "hypotenuse-builder", nickname: "Hypotenuse Builder", skill: "Use a^2 + b^2 = c^2 to find the hypotenuse from two legs.", sourcePages: "Book 120-122 / PDF 130-132" },
    { id: "missing-leg", nickname: "Missing Leg", skill: "Subtract squares to find a missing leg from the hypotenuse and the other leg.", sourcePages: "Book 121-122, 128 / PDF 131-132, 138" },
    { id: "shared-height-chase", nickname: "Shared Height Chase", skill: "Use one altitude as the shared height of two right triangles.", sourcePages: "Book 122-123, 126-128 / PDF 132-133, 136-138" },
    { id: "isosceles-split-area", nickname: "Isosceles Split Area", skill: "Split an isosceles triangle in half, find the height, then calculate area.", sourcePages: "Book 123, 126, 128 / PDF 133, 136, 138" },
    { id: "area-to-perimeter", nickname: "Area To Perimeter", skill: "Reverse from area and base to height, then use Pythagoras to find the perimeter.", sourcePages: "Book 124 / PDF 134" },
    { id: "right-turn-path", nickname: "Right-Turn Path", skill: "Group alternating 90 degree moves into two perpendicular totals, then use Pythagoras.", sourcePages: "Book 124 / PDF 134" }
  ];

  const CLASSIC_IDS = CLASSICS.map((classic) => classic.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((classic) => [classic.id, classic]));

  // Maps each classic to a registry skill so the skill-coverage gate can
  // verify the bank covers every skill the registry promises.
  // Registry skills: ["Triangle inequality", "Isosceles choice",
  // "Pythagoras", "Missing leg", "Area chase"].
  const CLASSIC_SKILLS = {
    "triangle-gate": "Triangle inequality",
    "isosceles-choice": "Isosceles choice",
    "hypotenuse-builder": "Pythagoras",
    "missing-leg": "Missing leg",
    "shared-height-chase": "Area chase",
    "isosceles-split-area": "Area chase",
    "area-to-perimeter": "Pythagoras",
    "right-turn-path": "Pythagoras"
  };

  const SOURCE_COVERAGE = {
    "triangle-gate": ["Map shortest path triangle inequality", "Further exercise side-set choice"],
    "isosceles-choice": ["Exploration 1 two side lengths", "Homework isosceles perimeter"],
    "hypotenuse-builder": ["Pythagorean theorem proof", "Right-triangle missing hypotenuse"],
    "missing-leg": ["Exploration 2 missing right-triangle sides", "Further exercise 40-41-9 form"],
    "shared-height-chase": ["Exploration 3 AB=13, BH=5, AC=15 area", "Practice AC=15, AD=9, BD=16 perimeter", "Homework AC=30, AD=18, BC=40"],
    "isosceles-split-area": ["Isosceles 5,5,8 area", "Isosceles 13,13,10 area"],
    "area-to-perimeter": ["Isosceles area 48 and base 12 perimeter"],
    "right-turn-path": ["Caterpillar 90 degree turn maximum distance"]
  };

  const INTRO_SCENES = [
    {
      title: "Triangle Inequality",
      purpose: "Check whether three lengths can close into a triangle.",
      classicId: "triangle-gate",
      kind: "gate",
      audio: "audio/intro_01_triangle_gate.wav",
      durationMs: 12200,
      caption: "Order the sides, then test short + short > longest. If the shorter pair cannot pass the longest side, no triangle forms.",
      voiceover: "Start with the triangle inequality. Put the three side lengths in order. Then ask one question: do the two shorter sides reach farther than the longest side?"
    },
    {
      title: "Isosceles Choice",
      purpose: "Pick the equal side that makes a real triangle.",
      classicId: "isosceles-choice",
      kind: "iso-choice",
      audio: "audio/intro_02_isosceles_choice.wav",
      durationMs: 12250,
      caption: "When two sides are equal, the repeated side must still pass the triangle inequality before you add the perimeter.",
      voiceover: "For an isosceles triangle, two sides are equal. But do not repeat a side blindly. The two equal sides still have to close around the base."
    },
    {
      title: "Pythagoras",
      purpose: "Build the side across the right angle.",
      classicId: "hypotenuse-builder",
      kind: "hyp",
      audio: "audio/intro_03_hypotenuse_builder.wav",
      durationMs: 13200,
      caption: "The hypotenuse is opposite the square corner. Square the two legs, add, then take the square root.",
      voiceover: "Now look for the square corner. The side opposite it is the hypotenuse. To build that side, square the two legs, add the squares, then take the square root."
    },
    {
      title: "Missing Leg",
      purpose: "Reverse Pythagoras when the hypotenuse is known.",
      classicId: "missing-leg",
      kind: "leg",
      audio: "audio/intro_04_missing_leg.wav",
      durationMs: 12000,
      caption: "If the hypotenuse is known, subtract the known leg square from the hypotenuse square.",
      voiceover: "If the hypotenuse is already known, reverse the move. Start with the hypotenuse square, subtract the known leg square, then take the square root."
    },
    {
      title: "Shared Height Chase",
      purpose: "Reuse one shared height across the right triangles inside a bigger figure.",
      classicId: "shared-height-chase",
      kind: "shared",
      audio: "audio/intro_05_shared_height.wav",
      durationMs: 12350,
      caption: "One dropped height can belong to two smaller right triangles. Solve one side, then reuse the same height to chase the area.",
      voiceover: "Some diagrams hide two right triangles that share one perpendicular height. Drop a perpendicular into the bigger triangle, solve the first small right triangle to find that height, then carry the same height into the second small right triangle to finish the area."
    },
    {
      title: "Isosceles Split Area",
      purpose: "Halve the base, find the height, then calculate area.",
      classicId: "isosceles-split-area",
      kind: "iso",
      audio: "audio/intro_06_isosceles_split_area.wav",
      durationMs: 12000,
      caption: "The height in an isosceles triangle splits the base in half, making a right triangle you can solve.",
      voiceover: "In an isosceles triangle, the equal sides let the height split the base in half. That gives a right triangle, so you can find the height and then the area."
    },
    {
      title: "Area To Perimeter",
      purpose: "Reverse area into height, then find the equal side.",
      classicId: "area-to-perimeter",
      kind: "area",
      audio: "audio/intro_07_area_to_perimeter.wav",
      durationMs: 12400,
      caption: "Area gives height when base is known: height = 2 x area / base. Then Pythagoras finds the sloping equal side.",
      voiceover: "Sometimes the book gives area first. Use the area formula backwards to find the height. Then use the half-base and height to find the equal side and the perimeter."
    },
    {
      title: "Right-Turn Path",
      purpose: "Turn a zigzag path into one big right triangle.",
      classicId: "right-turn-path",
      kind: "path",
      audio: "audio/intro_08_right_turn.wav",
      durationMs: 12700,
      caption: "For a 90 degree path, combine all moves in one direction, combine all moves in the other direction, then use Pythagoras for the final distance.",
      voiceover: "For right-turn paths, do not add every step as the answer. Combine the sideways moves, combine the upward moves, then make one final right triangle."
    }
  ];

  const triples = [
    [3, 4, 5], [5, 12, 13], [6, 8, 10], [7, 24, 25], [8, 15, 17],
    [9, 12, 15], [9, 40, 41], [10, 24, 26], [12, 16, 20], [15, 20, 25]
  ];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatMathText(value) {
    return String(value).replace(/\^2/g, "²");
  }

  function parseNumber(value) {
    const text = String(value ?? "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
    return text ? Number(text[0]) : NaN;
  }

  function triangularChoice(choices, correct, variantIndex) {
    const unique = [...new Set(choices.map(String))];
    const without = unique.filter((choice) => choice !== String(correct));
    const ordered = [String(correct), ...without].slice(0, 4);
    const offset = variantIndex % ordered.length;
    const rotated = ordered.slice(offset).concat(ordered.slice(0, offset));
    return rotated.map((label) => ({ label, isCorrect: label === String(correct) }));
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

  function triangleInequalityProblem(variantIndex) {
    const sets = [
      { sides: [4, 5, 6], ok: true },
      { sides: [2, 2, 4], ok: false },
      { sides: [7, 10, 19], ok: false },
      { sides: [5, 8, 12], ok: true },
      { sides: [15, 16, 32], ok: false },
      { sides: [9, 11, 18], ok: true },
      { sides: [3, 3, 6], ok: false },
      { sides: [6, 14, 19], ok: true }
    ];
    const data = sets[variantIndex % sets.length];
    const p = problemBase("triangle-gate", variantIndex, "choice");
    p.prompt = `Which answer is correct for side lengths ${data.sides.join(" cm, ")} cm?`;
    p.expected = data.ok ? "can form a triangle" : "cannot form a triangle";
    p.expectedDisplay = p.expected;
    p.correctInput = { choice: p.expected };
    p.choices = triangularChoice(["can form a triangle", "cannot form a triangle", "only if it is right-angled", "only if it is isosceles"], p.expected, variantIndex);
    const sorted = [...data.sides].sort((a, b) => a - b);
    p.hint1 = `Put the sides in order: ${sorted.join(", ")}.`;
    p.hint2 = `Test ${sorted[0]} + ${sorted[1]} against ${sorted[2]}.`;
    p.solution = `${sorted[0]} + ${sorted[1]} = ${sorted[0] + sorted[1]}. The longest side is ${sorted[2]}, so the triangle ${data.ok ? "can" : "cannot"} close.`;
    p.visual = { type: "gate", sides: data.sides, ok: data.ok };
    return p;
  }

  function isoscelesChoiceProblem(variantIndex) {
    const pairs = [
      [4, 9], [12, 15], [5, 10], [5, 12], [6, 14], [9, 11], [7, 20], [8, 13]
    ];
    const [a, b] = pairs[variantIndex % pairs.length];
    const small = Math.min(a, b);
    const big = Math.max(a, b);
    const repeated = 2 * small > big ? small : big;
    const base = repeated === small ? big : small;
    const expected = 2 * repeated + base;
    const p = problemBase("isosceles-choice", variantIndex, variantIndex % 2 ? "filled" : "choice");
    p.prompt = `Two sides of an isosceles triangle measure ${a} cm and ${b} cm. What is its perimeter?`;
    p.expected = expected;
    p.expectedDisplay = `${expected} cm`;
    p.correctInput = p.answerType === "choice" ? { choice: String(expected) } : { value: String(expected) };
    p.choices = p.answerType === "choice" ? triangularChoice([expected, a + 2 * b, 2 * a + b, a + b], expected, variantIndex) : [];
    p.hint1 = "In an isosceles triangle, two sides are equal.";
    p.hint2 = `The repeated side must be ${repeated} cm because ${small} + ${small} ${2 * small > big ? ">" : "="} ${big}.`;
    p.solution = `The equal sides are ${repeated} cm and ${repeated} cm, with base ${base} cm. Perimeter = ${repeated} + ${repeated} + ${base} = ${expected} cm.`;
    p.visual = { type: "isoscelesChoice", values: [a, b], equal: repeated, base };
    return p;
  }

  function hypotenuseProblem(variantIndex) {
    const [a, b, c] = triples[(variantIndex + 2) % triples.length];
    const p = problemBase("hypotenuse-builder", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `A right-angled triangle has perpendicular sides ${a} cm and ${b} cm. What is the hypotenuse?`;
    p.expected = c;
    p.expectedDisplay = `${c} cm`;
    p.correctInput = p.answerType === "choice" ? { choice: String(c) } : { value: String(c) };
    p.choices = p.answerType === "choice" ? triangularChoice([c, a + b, Math.abs(b - a), c + 1], c, variantIndex) : [];
    p.hint1 = "The hypotenuse is opposite the right angle.";
    p.hint2 = `Use ${a}^2 + ${b}^2 = c^2.`;
    p.solution = `${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}, so c = ${c} cm.`;
    p.visual = { type: "right", a, b, c, missing: "c" };
    return p;
  }

  function missingLegProblem(variantIndex) {
    const [a, b, c] = triples[(variantIndex + 1) % triples.length];
    const missingA = variantIndex % 2 === 0;
    const missing = missingA ? a : b;
    const known = missingA ? b : a;
    const p = problemBase("missing-leg", variantIndex, variantIndex % 2 ? "filled" : "choice");
    p.prompt = `A right-angled triangle has hypotenuse ${c} cm and one leg ${known} cm. What is the missing leg?`;
    p.expected = missing;
    p.expectedDisplay = `${missing} cm`;
    p.correctInput = p.answerType === "choice" ? { choice: String(missing) } : { value: String(missing) };
    p.choices = p.answerType === "choice" ? triangularChoice([missing, c - known, c + known, known], missing, variantIndex) : [];
    p.hint1 = "You are finding a leg, so subtract the known square from the hypotenuse square.";
    p.hint2 = `${c}^2 - ${known}^2 = ${c * c - known * known}.`;
    p.solution = `${c}^2 - ${known}^2 = ${c * c} - ${known * known} = ${missing * missing}, so the missing leg is ${missing} cm.`;
    p.visual = { type: "right", a: missingA ? null : known, b: missingA ? known : null, c, missing: missingA ? "a" : "b" };
    return p;
  }

  function sharedHeightProblem(variantIndex) {
    const cases = [
      { leftHyp: 13, leftBase: 5, rightHyp: 15, ask: "area", expected: 84 },
      { leftHyp: 15, leftBase: 9, rightBase: 16, ask: "perimeter", expected: 60 },
      { leftHyp: 30, leftBase: 18, rightHyp: 40, ask: "rightBase", expected: 32 },
      { leftBase: 3, height: 4, rightHyp: 13, ask: "rightBase", expected: 12 }
    ];
    const data = cases[variantIndex % cases.length];
    const height = data.height ?? Math.sqrt(data.leftHyp ** 2 - data.leftBase ** 2);
    const rightBase = data.rightBase ?? Math.sqrt((data.rightHyp ?? 13) ** 2 - height ** 2);
    const rightHyp = data.rightHyp ?? Math.sqrt(height ** 2 + rightBase ** 2);
    const leftHyp = data.leftHyp ?? Math.sqrt(height ** 2 + data.leftBase ** 2);
    const totalBase = data.leftBase + rightBase;
    const p = problemBase("shared-height-chase", variantIndex, variantIndex % 2 ? "choice" : "filled");
    if (data.ask === "area") {
      p.prompt = `A triangle is split by a perpendicular height. The left small right triangle has hypotenuse ${leftHyp} and base ${data.leftBase}. The right sloping side is ${rightHyp}. What is the area of the whole triangle?`;
    } else if (data.ask === "perimeter") {
      p.prompt = `CD is perpendicular to AB. AC = ${leftHyp}, AD = ${data.leftBase}, and DB = ${rightBase}. What is the perimeter of triangle ABC?`;
    } else {
      p.prompt = `Two right triangles share a height. One has hypotenuse ${leftHyp} and base ${data.leftBase}; the other has hypotenuse ${rightHyp}. What is the hidden right-base length?`;
    }
    p.expected = data.expected;
    p.expectedDisplay = String(data.expected);
    p.correctInput = p.answerType === "choice" ? { choice: String(data.expected) } : { value: String(data.expected) };
    p.choices = p.answerType === "choice" ? triangularChoice([data.expected, Math.round(height), Math.round(totalBase), Math.round(leftHyp + rightHyp)], data.expected, variantIndex) : [];
    p.hint1 = "Use the left right triangle first to find the shared height.";
    p.hint2 = `Shared height = ${Math.round(height)}. Then use the other right triangle or the area/perimeter rule.`;
    p.solution = `The shared height is ${Math.round(height)}. The hidden right base is ${Math.round(rightBase)}. ${data.ask === "area" ? `Area = ${totalBase} x ${height} / 2 = ${data.expected}.` : data.ask === "perimeter" ? `Perimeter = ${totalBase} + ${leftHyp} + ${rightHyp} = ${data.expected}.` : `The hidden base is ${data.expected}.`}`;
    p.visual = {
      type: "shared",
      leftBase: data.leftBase,
      height: Math.round(height),
      rightBase: Math.round(rightBase),
      leftHyp: Math.round(leftHyp),
      rightHyp: Math.round(rightHyp),
      ask: data.ask,
      showRightBase: data.ask === "perimeter",
      showRightHyp: data.ask !== "perimeter"
    };
    return p;
  }

  function isoscelesAreaProblem(variantIndex) {
    const cases = [[5, 8, 12], [13, 10, 60], [17, 16, 120], [10, 12, 48]];
    const [equal, base, expected] = cases[variantIndex % cases.length];
    const half = base / 2;
    const height = Math.sqrt(equal ** 2 - half ** 2);
    const p = problemBase("isosceles-split-area", variantIndex, variantIndex % 2 ? "filled" : "choice");
    p.prompt = `An isosceles triangle has sides ${equal} cm, ${equal} cm and ${base} cm. What is its area?`;
    p.expected = expected;
    p.expectedDisplay = `${expected} cm²`;
    p.correctInput = p.answerType === "choice" ? { choice: String(expected) } : { value: String(expected) };
    p.choices = p.answerType === "choice" ? triangularChoice([expected, equal * base, (equal * base) / 2, base + equal + equal], expected, variantIndex) : [];
    p.hint1 = `Split the base into ${half} cm and ${half} cm.`;
    p.hint2 = `Use ${equal}^2 - ${half}^2 to find the height.`;
    p.solution = `Half the base is ${half} cm. Height = ${Math.round(height)} cm. Area = ${base} x ${Math.round(height)} / 2 = ${expected} cm².`;
    p.visual = { type: "isoArea", equal, base, height: Math.round(height) };
    return p;
  }

  function areaToPerimeterProblem(variantIndex) {
    const cases = [
      { area: 48, base: 12, height: 8, equal: 10, expected: 32 },
      { area: 60, base: 10, height: 12, equal: 13, expected: 36 },
      { area: 120, base: 16, height: 15, equal: 17, expected: 50 },
      { area: 84, base: 14, height: 12, equal: 13, expected: 40 }
    ];
    const data = cases[variantIndex % cases.length];
    const p = problemBase("area-to-perimeter", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `An isosceles triangle has area ${data.area} cm² and base ${data.base} cm. What is its perimeter?`;
    p.expected = data.expected;
    p.expectedDisplay = `${data.expected} cm`;
    p.correctInput = p.answerType === "choice" ? { choice: String(data.expected) } : { value: String(data.expected) };
    p.choices = p.answerType === "choice" ? triangularChoice([data.expected, data.area + data.base, data.equal * 2, data.base + data.height], data.expected, variantIndex) : [];
    p.hint1 = "Reverse the area formula to find the height.";
    p.hint2 = `Height = 2 x ${data.area} / ${data.base} = ${data.height}; half-base = ${data.base / 2}.`;
    p.solution = `Height = ${data.height}. Half the base is ${data.base / 2}. Equal side = sqrt(${data.height}^2 + ${data.base / 2}^2) = ${data.equal}. Perimeter = ${data.equal} + ${data.equal} + ${data.base} = ${data.expected} cm.`;
    p.visual = { type: "areaPerimeter", area: data.area, base: data.base, height: data.height, equal: data.equal };
    return p;
  }

  function rightTurnPathProblem(variantIndex) {
    const sequences = [
      [2, 3, 4, 5, 6, 7, 8],
      [1, 2, 3, 4, 5, 6],
      [3, 4, 5, 6, 7, 8],
      [4, 5, 6, 7, 8]
    ];
    const moves = sequences[variantIndex % sequences.length];
    const x = moves.filter((_, index) => index % 2 === 0).reduce((a, b) => a + b, 0);
    const y = moves.filter((_, index) => index % 2 === 1).reduce((a, b) => a + b, 0);
    const expected = Math.round(Math.sqrt(x * x + y * y));
    const p = problemBase("right-turn-path", variantIndex, "choice");
    p.prompt = `A path turns 90° after each move. The move lengths are ${moves.join(", ")} metres. What is the greatest possible distance from the start?`;
    p.expected = expected;
    p.expectedDisplay = `${expected} m`;
    p.correctInput = { choice: String(expected) };
    p.choices = triangularChoice([expected, moves.reduce((a, b) => a + b, 0), Math.max(x, y), Math.abs(x - y)], expected, variantIndex);
    p.hint1 = "Put alternate moves into two perpendicular directions.";
    p.hint2 = `One direction can total ${x} m and the other can total ${y} m.`;
    p.solution = `The greatest straight-line distance is sqrt(${x}^2 + ${y}^2) = ${expected} m.`;
    p.visual = { type: "path", moves, x, y, expected };
    return p;
  }

  function generateProblem(classicId, variantIndex = 0) {
    const generators = {
      "triangle-gate": triangleInequalityProblem,
      "isosceles-choice": isoscelesChoiceProblem,
      "hypotenuse-builder": hypotenuseProblem,
      "missing-leg": missingLegProblem,
      "shared-height-chase": sharedHeightProblem,
      "isosceles-split-area": isoscelesAreaProblem,
      "area-to-perimeter": areaToPerimeterProblem,
      "right-turn-path": rightTurnPathProblem
    };
    const problem = generators[classicId](variantIndex);
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
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Triangle sides visual">${inner}</svg>`;
  }

  function renderProblemVisual(problem, state = "initial") {
    const v = problem.visual;
    const isInitial = state === "initial";
    const isRevealed = state === "solution" || state === "worked";
    const isSupported = !isInitial;
    const answer = state === "solution" || state === "worked" ? `<text x="280" y="306" text-anchor="middle" class="formula-note">Answer: ${escapeHtml(problem.expectedDisplay)}</text>` : "";
    let html = "";
    let text = problem.skill;
    if (v.type === "gate") {
      const sorted = [...v.sides].sort((a, b) => a - b);
      const comparator = isSupported ? (v.ok ? ">" : "≤") : "?";
      html = svgShell(`
        <line x1="90" y1="210" x2="470" y2="210" stroke="#16345d" stroke-width="6" data-label-for="longest-side"/>
        <line x1="110" y1="130" x2="250" y2="210" stroke="#ff7654" stroke-width="6"/>
        <line x1="450" y1="130" x2="250" y2="210" stroke="#0b8993" stroke-width="6"/>
        <text x="280" y="238" text-anchor="middle" class="side-label">longest ${sorted[2]}</text>
        <text x="130" y="120" class="side-label">${sorted[0]}</text>
        <text x="428" y="120" class="side-label">${sorted[1]}</text>
        <text x="280" y="64" text-anchor="middle" class="formula-note">${sorted[0]} + ${sorted[1]} ${comparator} ${sorted[2]}</text>
        ${answer}
      `);
      text = "The two shorter sides must add to more than the longest side.";
    } else if (v.type === "right") {
      const aLabel = v.a ?? "?";
      const bLabel = v.b ?? "?";
      const cLabel = v.missing === "c" && !isRevealed ? "?" : (v.c ?? "?");
      html = svgShell(`
        <polygon points="130,240 130,80 410,240" fill="#fff8dc" stroke="#16345d" stroke-width="4"/>
        <path d="M130 216 H154 V240" fill="none" stroke="#ff7654" stroke-width="4" data-label-for="right-angle"/>
        <text x="112" y="165" class="side-label">${aLabel}</text>
        <text x="270" y="264" text-anchor="middle" class="side-label">${bLabel}</text>
        <text x="286" y="145" class="side-label">${cLabel}</text>
        <text x="280" y="52" text-anchor="middle" class="formula-note">a² + b² = c²</text>
        ${answer}
      `);
      text = "The hypotenuse is opposite the right angle.";
    } else if (v.type === "isoscelesChoice") {
      const solutionLabels = `
        <text x="178" y="158" class="side-label">${v.equal}</text>
        <text x="366" y="158" class="side-label">${v.equal}</text>
        <text x="280" y="274" text-anchor="middle" class="side-label">base ${v.base}</text>
      `;
      const neutralLabels = `
        <text x="176" y="158" class="side-label">given ${v.values[0]}</text>
        <text x="348" y="158" class="side-label">given ${v.values[1]}</text>
        <text x="280" y="274" text-anchor="middle" class="side-label">which side repeats?</text>
      `;
      html = svgShell(`
        <polygon points="280,70 140,250 420,250" fill="#fff8dc" stroke="#16345d" stroke-width="4"/>
        <text x="280" y="52" text-anchor="middle" class="formula-note">choose the valid repeated side</text>
        ${isRevealed ? solutionLabels : neutralLabels}
        ${answer}
      `);
      text = isRevealed ? "The valid repeated side is shown only after the answer is checked." : "The diagram shows the two given lengths without revealing which one must repeat.";
    } else if (v.type === "isosceles" || v.type === "isoArea") {
      const heightLabel = isRevealed && v.height ? `<text x="294" y="168" class="side-label">height ${v.height}</text>` : "";
      html = svgShell(`
        <polygon points="280,70 140,250 420,250" fill="#fff8dc" stroke="#16345d" stroke-width="4"/>
        <line x1="280" y1="70" x2="280" y2="250" stroke="#ff7654" stroke-width="4" stroke-dasharray="8 8" data-label-for="height"/>
        <text x="178" y="158" class="side-label">${v.equal}</text>
        <text x="366" y="158" class="side-label">${v.equal}</text>
        <text x="280" y="274" text-anchor="middle" class="side-label">base ${v.base}</text>
        ${heightLabel}
        ${answer}
      `);
      text = "The height splits an isosceles base into two equal halves.";
    } else if (v.type === "areaPerimeter") {
      const revealedLabels = `
        <text x="178" y="158" class="side-label">${v.equal}</text>
        <text x="366" y="158" class="side-label">${v.equal}</text>
        <text x="294" y="168" class="side-label">height ${v.height}</text>
      `;
      const initialLabels = `
        <text x="176" y="158" class="side-label">equal side ?</text>
        <text x="348" y="158" class="side-label">equal side ?</text>
        <text x="294" y="168" class="side-label">height ?</text>
      `;
      html = svgShell(`
        <polygon points="280,70 140,250 420,250" fill="#fff8dc" stroke="#16345d" stroke-width="4"/>
        <line x1="280" y1="70" x2="280" y2="250" stroke="#ff7654" stroke-width="4" stroke-dasharray="8 8" data-label-for="height"/>
        <text x="280" y="52" text-anchor="middle" class="formula-note">area ${v.area}; find perimeter</text>
        <text x="280" y="274" text-anchor="middle" class="side-label">base ${v.base}</text>
        ${isRevealed ? revealedLabels : initialLabels}
        ${answer}
      `);
      text = "Use the area and base to find the height before revealing the equal sides.";
    } else if (v.type === "shared") {
      const heightLabel = isRevealed ? `h ${v.height}` : "h ?";
      const rightBaseLabel = isRevealed || v.showRightBase ? v.rightBase : "?";
      const rightHypLabel = isRevealed || v.showRightHyp ? v.rightHyp : "?";
      html = svgShell(`
        <polygon points="150,250 280,90 450,250" fill="#fff8dc" stroke="#16345d" stroke-width="4"/>
        <line x1="280" y1="90" x2="280" y2="250" stroke="#ff7654" stroke-width="4" data-label-for="shared-height"/>
        <path d="M280 228 H302 V250" fill="none" stroke="#ff7654" stroke-width="4"/>
        <text x="210" y="164" class="side-label">${v.leftHyp}</text>
        <text x="365" y="164" class="side-label">${rightHypLabel}</text>
        <text x="214" y="274" class="side-label">${v.leftBase}</text>
        <text x="362" y="274" class="side-label">${rightBaseLabel}</text>
        <text x="294" y="174" class="side-label">${heightLabel}</text>
        ${answer}
      `);
      text = "Find the shared height first, then use the second right triangle.";
    } else {
      const totals = isSupported ? `perpendicular totals: ${v.x} and ${v.y}` : "sort the moves into two directions";
      html = svgShell(`
        <polyline points="120,250 210,250 210,180 330,180 330,110 450,110" fill="none" stroke="#16345d" stroke-width="8" stroke-linejoin="round"/>
        <line x1="120" y1="250" x2="450" y2="110" stroke="#ff7654" stroke-width="4" stroke-dasharray="8 8" data-label-for="final-distance"/>
        <text x="280" y="74" text-anchor="middle" class="formula-note">${totals}</text>
        ${answer}
      `);
      text = "Alternate turns make two perpendicular totals.";
    }
    return { html, text };
  }

  function renderIntroScene(index) {
    const scene = INTRO_SCENES[index % INTRO_SCENES.length];
    const fakeProblem = generateProblem(scene.classicId || CLASSIC_IDS[index % CLASSIC_IDS.length], index);
    return renderProblemVisual({ ...fakeProblem, expectedDisplay: scene.title }, "initial").html;
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

  root.TriangleSidesModule = api;

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
      return `<div class="choice-grid">${problem.choices.map((choice, index) => `<label class="choice-card"><input type="radio" name="choice" value="${escapeHtml(choice.label)}"><span>${escapeHtml(formatMathText(choice.label))}</span></label>`).join("")}</div>`;
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
      : "<div><strong>Clean round.</strong><br>You used the triangle gate, Pythagoras, and isosceles splitting accurately.</div>";
  }

  function freshRound() {
    state.roundOffset += 8;
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
    $("intro-next").addEventListener("click", () => advanceIntro(false));
    $("intro-play").addEventListener("click", toggleIntroPlayback);
    $("answer-form").addEventListener("submit", checkCurrent);
    $("hint-button").addEventListener("click", showHint);
    $("why-button").addEventListener("click", showWhy);
    $("next-button").addEventListener("click", nextProblem);
    $("similar-button").addEventListener("click", () => { state.round[state.current] = generateProblem(currentProblem().classicId, currentProblem().variantIndex + 8); renderProblem(); });
    $("fresh-round-button").addEventListener("click", freshRound);
    $("review-intro-button").addEventListener("click", showIntro);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
