(function (root) {
  "use strict";

  const ROUND_LENGTH = 10;
  const INTRO_SCENE_MS = 9800;

  const CLASSICS = [
    {
      id: "area-formula",
      nickname: "Half Rectangle",
      skill: "Use base x height / 2 only after identifying the perpendicular height.",
      sourcePages: "Book Lesson 17 area review; PDF source-informed archetype, exact visual replica not claimed"
    },
    {
      id: "equal-height-base-ratio",
      nickname: "Base Ratio Mirror",
      skill: "When triangles have the same height, their areas follow their bases in the same ratio.",
      sourcePages: "Book Lesson 17 area review; PDF source-informed archetype, exact visual replica not claimed",
      // Question mode alternates per variant by design (variant 0 = "find the ratio" leaves both area labels blank; variant 1 = "find Area B given Area A" labels Area A only). The diagram skeleton is the same; the label set differs because the question differs.
      variantStability: false
    },
    {
      id: "same-base-height",
      nickname: "Sliding Apex Twin",
      skill: "Different-looking triangles can have equal area when the base and height match.",
      sourcePages: "Book Lesson 17 area review; PDF source-informed archetype, exact visual replica not claimed"
    },
    {
      id: "reverse-from-area",
      nickname: "Double Then Divide",
      skill: "Reverse area = base x height / 2 by doubling the area before dividing.",
      sourcePages: "Book Lesson 17 reverse area; PDF source-informed archetype, exact visual replica not claimed"
    },
    {
      id: "multi-triangle-height",
      nickname: "Area Order Line",
      skill: "Compare three or more same-height triangles by comparing their base lengths.",
      sourcePages: "Book Lesson 17 mixed area reasoning; PDF source-informed archetype, exact visual replica not claimed",
      // Question mode alternates per variant by design (variant 0 = "find the largest area given the smallest" labels area-0; variant 1 = "which is largest?" omits all area labels). Same three-triangle skeleton, different labels because the question differs.
      variantStability: false
    },
    {
      id: "shared-base-split",
      nickname: "Split Base Shares",
      skill: "A common apex over a split base gives equal height, so base parts split the area.",
      sourcePages: "Book Lesson 17 shared-height triangle chase; PDF source-informed archetype, exact visual replica not claimed"
    },
    {
      id: "compound-difference",
      nickname: "Shaded Difference",
      skill: "Subtract same-height triangle areas by using the difference between their bases.",
      sourcePages: "Book Lesson 17 area extension; PDF source-informed archetype, exact visual replica not claimed"
    },
    {
      id: "algebraic-targets",
      nickname: "Expression Area Chase",
      skill: "Turn equal-height area facts into an equation, then answer the exact requested target.",
      sourcePages: "Book Lesson 17 algebraic extension; PDF source-informed archetype, exact visual replica not claimed",
      // Question mode alternates per variant by design (variant 0 = "equal areas, solve for x" uses pure labels; variant 1 = "find a + b given the two areas" labels both areas). Same two-triangle skeleton, different label set per question type.
      variantStability: false
    },
    {
      id: "equal-area-reverse",
      nickname: "Equal Area Equal Base",
      skill: "If same-height triangles have equal areas, their matching bases must be equal.",
      sourcePages: "Book Lesson 17 equal-area reasoning; PDF source-informed archetype, exact visual replica not claimed"
    },
    {
      id: "diagram-interpretation",
      nickname: "Height Detective",
      skill: "Choose the perpendicular height, not a sloping side or a decorative label.",
      sourcePages: "Book Lesson 17 diagram reading; PDF source-informed archetype, exact visual replica not claimed"
    }
  ];

  const CLASSIC_IDS = CLASSICS.map((classic) => classic.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((classic) => [classic.id, classic]));

  // Maps each classic to a registry skill so the skill-coverage gate can
  // verify the bank covers every skill the registry promises.
  // Registry skills: ["Height detective", "Area ratios", "Split bases",
  // "Reverse formula", "Algebra targets"].
  const CLASSIC_SKILLS = {
    "area-formula": "Height detective",
    "equal-height-base-ratio": "Area ratios",
    "same-base-height": "Area ratios",
    "reverse-from-area": "Reverse formula",
    "multi-triangle-height": "Area ratios",
    "shared-base-split": "Split bases",
    "compound-difference": "Split bases",
    "algebraic-targets": "Algebra targets",
    "equal-area-reverse": "Reverse formula",
    "diagram-interpretation": "Height detective"
  };

  const SOURCE_COVERAGE = {
    "area-formula": ["Triangle area rule: area = base x perpendicular height / 2", "Misconception: sloping side is not the height"],
    "equal-height-base-ratio": ["Same-height area comparison derived from the common 1/2 x height factor"],
    "same-base-height": ["Triangles between the same parallel lines keep the same perpendicular height"],
    "reverse-from-area": ["Reverse area work: double area first, then divide by known length"],
    "multi-triangle-height": ["Three or more triangles on one base line or between the same parallels"],
    "shared-base-split": ["Common apex over split base: area split follows base split"],
    "compound-difference": ["Shaded or nested same-height triangles use the base difference"],
    "algebraic-targets": ["Equal-height area statements can become equations in x, a, b, or a + b"],
    "equal-area-reverse": ["Same height and equal area force equal matching bases"],
    "diagram-interpretation": ["Height labels must attach to the perpendicular, not the slanted side"]
  };

  const INTRO_SCENES = [
    {
      title: "Same Height Spotter",
      purpose: "Height detective work: see what equal height actually means.",
      classicId: "diagram-interpretation",
      kind: "height-spotter",
      audio: "audio/intro_01_same_height_spotter.wav",
      durationMs: 17300,
      caption: "Height is the straight perpendicular distance to the base. The sloping side can be longer, but it is not the height.",
      voiceover: "First, we train the eye. A triangle height is not the sloping side. It is the straight drop to the base, marked by a square corner. Once you can spot that height, the rest of the lesson becomes much calmer."
    },
    {
      title: "Half Rectangle",
      purpose: "Build the area rule visually.",
      classicId: "area-formula",
      kind: "half-rectangle",
      audio: "audio/intro_02_half_rectangle.wav",
      durationMs: 15950,
      caption: "A triangle is half of a matching rectangle, so area is base x height / 2.",
      voiceover: "Now place the triangle inside a matching rectangle. Same base, same height. The triangle takes half of that rectangle, so the area rule is base times height, then divide by two."
    },
    {
      title: "Base Ratio Mirror",
      purpose: "Connect equal height to base ratios.",
      classicId: "equal-height-base-ratio",
      kind: "ratio-mirror",
      audio: "audio/intro_03_base_ratio_mirror.wav",
      durationMs: 16500,
      caption: "If two triangles share the same height, the common part is 1/2 x height. Only the base changes.",
      voiceover: "Here is the key move. If two triangles have the same height, both areas contain the same half times height. That shared part cancels from the comparison. So the area ratio mirrors the base ratio."
    },
    {
      title: "Sliding Apex Twin",
      purpose: "Stop judging by shape alone.",
      classicId: "same-base-height",
      kind: "sliding-apex",
      audio: "audio/intro_04_sliding_apex_twin.wav",
      durationMs: 15650,
      caption: "Move the top point along a parallel line. The triangle changes shape, but the base and height stay fixed.",
      voiceover: "This is the surprise. Slide the top point sideways along a line parallel to the base. The triangle looks different, but the base and height have not changed, so the area has not changed either."
    },
    {
      title: "Double Then Divide",
      purpose: "Reverse formula: undo area = base x height / 2 safely.",
      classicId: "reverse-from-area",
      kind: "reverse",
      audio: "audio/intro_05_double_then_divide.wav",
      durationMs: 15350,
      caption: "To find a missing base or height, double the area first, then divide by the known length.",
      voiceover: "When the area is already known, reverse the formula in the right order. Because the formula divides by two, undo that first. Double the area, then divide by the known base or height."
    },
    {
      title: "Split Base Shares",
      purpose: "Use one apex over a split base.",
      classicId: "shared-base-split",
      kind: "split-base",
      audio: "audio/intro_06_split_base_shares.wav",
      durationMs: 12700,
      caption: "One apex above one straight base line gives one shared height. The base pieces split the area.",
      voiceover: "If several triangles share one top point and sit on the same straight base line, they share the same height. That means the base pieces tell you how the area is split."
    },
    {
      title: "Area Order Line",
      purpose: "Rank several same-height triangles.",
      classicId: "multi-triangle-height",
      kind: "multi-line",
      audio: "audio/intro_07_area_order_line.wav",
      durationMs: 17900,
      caption: "With equal height, the triangle with the longest base has the greatest area.",
      voiceover: "For three or more triangles with the same height, do not guess from the slant. Line up the bases. Short base, small area. Long base, large area. The order follows the base lengths."
    },
    {
      title: "Shaded Difference",
      purpose: "Subtract same-height areas.",
      classicId: "compound-difference",
      kind: "difference",
      audio: "audio/intro_08_shaded_difference.wav",
      durationMs: 13400,
      caption: "Same height lets you subtract the bases first, then multiply by the common height and halve.",
      voiceover: "For a shaded gap between two same-height triangles, use the base difference. Subtract the bases first, then multiply by the shared height, and divide by two."
    },
    {
      title: "Expression Area Chase",
      purpose: "Turn the picture into an equation.",
      classicId: "algebraic-targets",
      kind: "algebra",
      audio: "audio/intro_09_expression_area_chase.wav",
      durationMs: 19100,
      caption: "Equal height and equal area can let you set base expressions equal. Then answer the exact target.",
      voiceover: "Sometimes the base is not just a number. It might be x plus three, or two x minus five. If the heights and areas match, set the matching base expressions equal. Then check whether the question wants x, a base, or a plus b."
    },
    {
      title: "Ready To Train",
      purpose: "Name every move before practice starts.",
      classicId: "equal-area-reverse",
      kind: "ready",
      audio: "audio/intro_10_ready_to_train.wav",
      durationMs: 18650,
      caption: "You will now practise area, ratios, reverse questions, split bases, diagrams, shaded differences, and algebra targets.",
      voiceover: "You are ready for the training round. The problems will ask you to find areas, compare ratios, reverse the formula, split a base, read a tricky diagram, solve an equation, and explain why equal-height triangles behave this way."
    }
  ];

  const WARMUP_QUESTIONS = [
    {
      id: "height",
      prompt: "Which label is the real height of the triangle?",
      choices: ["the perpendicular drop", "the longest sloping side", "any side label"],
      correct: "the perpendicular drop",
      repairClassic: "Height Detective"
    },
    {
      id: "ratio",
      prompt: "Two triangles have the same height. Their bases are in the ratio 2:5. What is the area ratio?",
      choices: ["2:5", "5:2", "4:25"],
      correct: "2:5",
      repairClassic: "Base Ratio Mirror"
    },
    {
      id: "reverse",
      prompt: "A triangle has area 36 cm^2 and height 9 cm. What do you do first to find the base?",
      choices: ["double 36", "divide 36 by 9", "add 36 and 9"],
      correct: "double 36",
      repairClassic: "Double Then Divide"
    },
    {
      id: "shape",
      prompt: "Two triangles have the same base and sit between the same parallel lines. What is true?",
      choices: ["their areas are equal", "the more tilted one has bigger area", "their sloping sides must be equal"],
      correct: "their areas are equal",
      repairClassic: "Sliding Apex Twin"
    }
  ];

  const heightPool = [4, 5, 6, 8, 9, 10, 12, 15];
  const ratioPairs = [[1, 2], [2, 3], [3, 4], [3, 5], [4, 7], [5, 8]];

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatMathText(value) {
    return String(value)
      .replace(/\^3/g, "\u00b3")
      .replace(/\^2/g, "\u00b2")
      .replace(/\bcm2\b/g, "cm\u00b2")
      .replace(/\bcm3\b/g, "cm\u00b3");
  }

  function plainMathText(value) {
    return String(value ?? "")
      .replace(/\u00b2/g, "^2")
      .replace(/\u00b3/g, "^3")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseNumber(value) {
    const text = plainMathText(value).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
    return text ? Number(text[0]) : NaN;
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

  function ratioParts(a, b) {
    const g = gcd(a, b);
    return [a / g, b / g];
  }

  function ratioText(a, b) {
    const [left, right] = ratioParts(a, b);
    return `${left}:${right}`;
  }

  function normaliseRatio(value) {
    const text = plainMathText(value).toLowerCase().replace(/\s+to\s+/g, ":").replace(/\s+/g, "");
    const match = text.match(/^(-?\d+)(?::|\/)(-?\d+)$/);
    if (!match) return "";
    const left = Number(match[1]);
    const right = Number(match[2]);
    if (!Number.isFinite(left) || !Number.isFinite(right) || right === 0) return "";
    return ratioText(left, right);
  }

  function sameText(left, right) {
    return plainMathText(left).toLowerCase().replace(/\s+/g, "") === plainMathText(right).toLowerCase().replace(/\s+/g, "");
  }

  function displayValue(value, unit) {
    const rounded = Math.round(value * 100) / 100;
    const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    return unit ? `${text} ${unit}` : text;
  }

  function rotateChoices(values, correct, variantIndex) {
    const labels = [];
    [correct, ...values].forEach((value) => {
      const label = String(value);
      if (!labels.includes(label)) labels.push(label);
    });
    const four = labels.slice(0, 4);
    while (four.length < 4) four.push(String(Number(correct) + four.length + 1));
    const offset = variantIndex % four.length;
    return four.slice(offset).concat(four.slice(0, offset)).map((label) => ({
      label,
      value: label,
      isCorrect: label === String(correct)
    }));
  }

  function problemBase(classicId, variantIndex, answerType, stage = "routine") {
    const classic = CLASSIC_BY_ID[classicId];
    return {
      id: `${classicId}-${stage}-${variantIndex}`,
      classicId,
      classic: classic.nickname,
      skill: classic.skill,
      sourcePages: classic.sourcePages,
      variantIndex,
      answerType,
      answerMode: answerType === "choice" ? "choice" : answerType === "multi" ? "select-all" : answerType === "ratio" ? "ratio" : "filled",
      stage
    };
  }

  function completeNumberProblem(p, expected, unit, distractors) {
    p.expected = expected;
    p.expectedDisplay = displayValue(expected, unit);
    p.correctInput = p.answerType === "choice" ? { choice: String(expected) } : { value: String(expected) };
    const wrongDistractors = distractors.filter((value) => String(value) !== String(expected));
    p.choices = p.answerType === "choice" ? rotateChoices(wrongDistractors.map(String), String(expected), p.variantIndex) : [];
    p.commonWrongInputs = wrongDistractors.slice(0, 3).map((value) => ({ value: String(value), choice: String(value) }));
    return p;
  }

  function completeChoiceProblem(p, expected, choices) {
    p.expected = expected;
    p.expectedDisplay = String(expected);
    p.correctInput = { choice: String(expected) };
    p.choices = rotateChoices(choices.map(String), String(expected), p.variantIndex);
    p.commonWrongInputs = choices.filter((choice) => String(choice) !== String(expected)).slice(0, 3).map((choice) => ({ choice: String(choice) }));
    return p;
  }

  function completeRatioProblem(p, left, right, distractors) {
    const expected = ratioText(left, right);
    p.expected = expected;
    p.expectedDisplay = expected;
    p.correctInput = { value: expected };
    p.choices = [];
    p.commonWrongInputs = distractors.map((item) => ({ value: item }));
    return p;
  }

  function completeMultiProblem(p, expectedValues, choices) {
    p.expected = expectedValues.slice().sort();
    p.expectedDisplay = expectedValues.join(", ");
    p.correctInput = { choices: expectedValues };
    p.choices = choices.map((choice) => ({
      label: choice,
      value: choice,
      isCorrect: expectedValues.includes(choice)
    }));
    p.commonWrongInputs = [
      { choices: expectedValues.slice(0, -1) },
      { choices: choices.slice(0, expectedValues.length) },
      { choices: [] }
    ];
    return p;
  }

  function areaFormulaProblem(variantIndex) {
    const base = 6 + ((variantIndex * 4) % 17);
    const height = heightPool[variantIndex % heightPool.length];
    const adjustedBase = (base * height) % 2 === 0 ? base : base + 1;
    const area = adjustedBase * height / 2;
    const p = problemBase("area-formula", variantIndex, variantIndex % 2 === 0 ? "filled" : "choice");
    p.prompt = `Find the area of the triangle with base ${adjustedBase} cm and perpendicular height ${height} cm.`;
    p.hint1 = "The height is the perpendicular drop, not a sloping side.";
    p.hint2 = `Use area = ${adjustedBase} x ${height} / 2.`;
    p.solution = `Area = ${adjustedBase} x ${height} / 2 = ${area} cm^2.`;
    p.visual = { type: "directArea", base: adjustedBase, height, slant: height + 3 + (variantIndex % 4) };
    p.audit = { kind: "area", base: adjustedBase, height };
    return completeNumberProblem(p, area, "cm^2", [adjustedBase * height, adjustedBase + height, Math.abs(adjustedBase - height), area + height]);
  }

  function baseRatioProblem(variantIndex) {
    const pair = ratioPairs[variantIndex % ratioPairs.length];
    const unit = 2 + (variantIndex % 5);
    const baseA = pair[0] * unit;
    const baseB = pair[1] * unit;
    const areaPart = 6 + ((variantIndex * 3) % 8);
    const areaA = pair[0] * areaPart;
    const areaB = pair[1] * areaPart;
    if (variantIndex % 3 === 0) {
      const p = problemBase("equal-height-base-ratio", variantIndex, "ratio");
      p.prompt = `Triangles A and B have the same height. Their bases are ${baseA} cm and ${baseB} cm. What is Area A : Area B?`;
      p.hint1 = "Same height means the area ratio follows the base ratio.";
      p.hint2 = `Base ratio = ${baseA}:${baseB}, then simplify.`;
      p.solution = `Area A : Area B = ${ratioText(baseA, baseB)} because the shared 1/2 x height cancels.`;
      p.visual = { type: "ratioParallel", baseA, baseB, areaA: null, areaB: null, ratio: ratioText(baseA, baseB) };
      p.audit = { kind: "ratio", left: baseA, right: baseB };
      return completeRatioProblem(p, baseA, baseB, [ratioText(baseB, baseA), `${baseA * baseA}:${baseB * baseB}`, `${baseA + baseB}:${baseB}`]);
    }
    const p = problemBase("equal-height-base-ratio", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Triangles A and B have the same height. Their bases are ${baseA} cm and ${baseB} cm. Area A is ${areaA} cm^2. Find Area B.`;
    p.hint1 = "The bases and areas scale by the same multiplier.";
    p.hint2 = `Base B is ${pair[1]}/${pair[0]} of base A, so Area B is ${pair[1]}/${pair[0]} of ${areaA}.`;
    p.solution = `Area B = ${areaA} x ${pair[1]} / ${pair[0]} = ${areaB} cm^2.`;
    p.visual = { type: "ratioParallel", baseA, baseB, areaA, areaB: null, ratio: ratioText(baseA, baseB) };
    p.audit = { kind: "scaled-area", areaA, left: pair[0], right: pair[1] };
    return completeNumberProblem(p, areaB, "cm^2", [areaA, areaA + areaB, Math.round(areaA * pair[0] / pair[1]), baseB]);
  }

  function sameBaseHeightProblem(variantIndex) {
    const base = 8 + (variantIndex % 8) * 2;
    const height = heightPool[(variantIndex + 2) % heightPool.length];
    const area = base * height / 2;
    const p = problemBase("same-base-height", variantIndex, variantIndex % 2 === 0 ? "choice" : "filled");
    p.prompt = `Triangle A and Triangle B have the same ${base} cm base and their top points sit on the same parallel line. Triangle A has area ${area} cm^2. What is Triangle B's area?`;
    p.hint1 = "The top point slides, but the perpendicular distance to the base stays the same.";
    p.hint2 = "Same base plus same height gives equal area.";
    p.solution = `Triangle B also has area ${area} cm^2 because the base and height match.`;
    p.visual = { type: "slidingApex", base, height, areaA: area };
    p.audit = { kind: "equal-area", expected: area };
    return completeNumberProblem(p, area, "cm^2", [area + height, area - height, base * height, base + height]);
  }

  function reverseAreaProblem(variantIndex) {
    const height = heightPool[(variantIndex + 3) % heightPool.length];
    const base = 5 + ((variantIndex * 5) % 16);
    const adjustedBase = (base === height ? base + 2 : base);
    const area = adjustedBase * height / 2;
    const askingBase = variantIndex % 2 === 0;
    const expected = askingBase ? adjustedBase : height;
    const known = askingBase ? height : adjustedBase;
    const p = problemBase("reverse-from-area", variantIndex, variantIndex % 3 === 0 ? "choice" : "filled");
    p.prompt = askingBase
      ? `A triangle has area ${area} cm^2 and perpendicular height ${height} cm. Find its base.`
      : `A triangle has area ${area} cm^2 and base ${adjustedBase} cm. Find its perpendicular height.`;
    p.hint1 = "Undo the divide by 2 first: double the area.";
    p.hint2 = `2 x ${area} = ${2 * area}. Now divide by ${known}.`;
    p.solution = askingBase
      ? `Base = 2 x ${area} / ${height} = ${expected} cm, after undoing the half in the area formula.`
      : `Height = 2 x ${area} / ${adjustedBase} = ${expected} cm, after undoing the half in the area formula.`;
    p.visual = { type: "reverseArea", area, base: askingBase ? null : adjustedBase, height: askingBase ? height : null, target: askingBase ? "base" : "height" };
    p.audit = { kind: "reverse", area, known, expected };
    return completeNumberProblem(p, expected, "cm", [Math.round(area / known), Math.round(area + known), Math.round(2 * area), Math.round(expected + 2)]);
  }

  function multiTriangleProblem(variantIndex) {
    const ratios = [[2, 3, 5], [1, 4, 6], [3, 5, 7], [2, 5, 8]][variantIndex % 4];
    const unit = 2 + (variantIndex % 4);
    const bases = ratios.map((n) => n * unit);
    const areaPart = 5 + (variantIndex % 5);
    const areas = ratios.map((n) => n * areaPart);
    if (variantIndex % 4 === 1) {
      const p = problemBase("multi-triangle-height", variantIndex, "choice");
      p.prompt = `Three same-height triangles have bases ${bases.join(" cm, ")} cm. Which triangle has the greatest area?`;
      p.hint1 = "With the same height, area order follows base order.";
      p.hint2 = `Compare bases ${bases.join(", ")}.`;
      p.solution = `Triangle C has the greatest area because ${bases[2]} cm is the longest base.`;
      p.visual = { type: "multiLine", bases, areas: [null, null, null], givenIndex: null };
      p.audit = { kind: "choice", expected: "Triangle C" };
      return completeChoiceProblem(p, "Triangle C", ["Triangle A", "Triangle B", "Triangle C", "all equal"]);
    }
    const p = problemBase("multi-triangle-height", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Three triangles share the same height. Their bases are in the ratio ${ratios.join(":")}. The smallest triangle has area ${areas[0]} cm^2. Find the largest triangle's area.`;
    p.hint1 = "The areas follow the same ratio as the bases.";
    p.hint2 = `Smallest to largest is ${ratios[0]}:${ratios[2]}.`;
    p.solution = `Largest area = ${areas[0]} x ${ratios[2]} / ${ratios[0]} = ${areas[2]} cm^2.`;
    p.visual = { type: "multiLine", bases, areas: [areas[0], null, null], givenIndex: 0 };
    p.audit = { kind: "scaled-area", areaA: areas[0], left: ratios[0], right: ratios[2] };
    return completeNumberProblem(p, areas[2], "cm^2", [areas[1], areas[0] + areas[1], areas[0] * 3, bases[2]]);
  }

  function splitBaseProblem(variantIndex) {
    const left = 4 + (variantIndex % 6);
    const right = 7 + ((variantIndex * 2) % 9);
    const areaPart = 6 + (variantIndex % 5);
    const leftArea = left * areaPart;
    const rightArea = right * areaPart;
    const totalArea = leftArea + rightArea;
    const asksTotal = variantIndex % 4 === 2;
    const expected = asksTotal ? totalArea : rightArea;
    const p = problemBase("shared-base-split", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = asksTotal
      ? `One apex sits above a straight base split into ${left} cm and ${right} cm. The left small triangle has area ${leftArea} cm^2. Find the whole triangle's area.`
      : `One apex sits above a straight base split into ${left} cm and ${right} cm. The left small triangle has area ${leftArea} cm^2. Find the right small triangle's area.`;
    p.hint1 = "Both small triangles share the same height from the common apex.";
    p.hint2 = `The area split follows the base split ${left}:${right}.`;
    p.solution = asksTotal
      ? `Right area = ${leftArea} x ${right} / ${left} = ${rightArea} cm^2, so total area = ${totalArea} cm^2.`
      : `Right area = ${leftArea} x ${right} / ${left} = ${rightArea} cm^2.`;
    p.visual = { type: "splitBase", left, right, leftArea, rightArea: null, total: asksTotal };
    p.audit = asksTotal
      ? { kind: "sum", values: [leftArea, rightArea], expected }
      : { kind: "scaled-area", areaA: leftArea, left, right };
    return completeNumberProblem(p, expected, "cm^2", [leftArea, leftArea + right, Math.round(leftArea * left / right), left + right]);
  }

  function differenceProblem(variantIndex) {
    const height = heightPool[(variantIndex + 1) % heightPool.length];
    const small = 5 + (variantIndex % 7);
    const gap = 3 + ((variantIndex * 2) % 8);
    const large = small + gap;
    const expected = gap * height / 2;
    const p = problemBase("compound-difference", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Two triangles have the same height ${height} cm. Their bases are ${large} cm and ${small} cm. Find the difference between their areas.`;
    p.hint1 = "Same height lets you subtract the bases first.";
    p.hint2 = `Base difference = ${large} - ${small} = ${gap}. Then use gap x height / 2.`;
    p.solution = `Difference = (${large} - ${small}) x ${height} / 2 = ${expected} cm^2.`;
    p.visual = { type: "difference", large, small, height, gap };
    p.audit = { kind: "difference", large, small, height };
    return completeNumberProblem(p, expected, "cm^2", [gap * height, large * height / 2, small * height / 2, large - small]);
  }

  function algebraProblem(variantIndex) {
    if (variantIndex % 3 === 1) {
      const a = 6 + (variantIndex % 5);
      const b = 9 + (variantIndex % 7);
      const areaPart = 4 + (variantIndex % 4);
      const areaA = a * areaPart;
      const areaB = b * areaPart;
      const expected = a + b;
      const p = problemBase("algebraic-targets", variantIndex, variantIndex % 2 ? "filled" : "choice");
      p.prompt = `Same-height triangles have base lengths a and b. Their areas are ${areaA} cm^2 and ${areaB} cm^2. If a = ${a} cm, find a + b.`;
      p.hint1 = "Same height means the area ratio is the base ratio.";
      p.hint2 = `Area ratio ${areaA}:${areaB} matches base ratio ${a}:b.`;
      p.solution = `b = ${b} cm, so a + b = ${a} + ${b} = ${expected} cm.`;
      p.visual = { type: "algebra", labelA: "a", labelB: "b", areaA, areaB, equality: false };
      p.audit = { kind: "target-sum", a, b, expected };
      return completeNumberProblem(p, expected, "cm", [b, a, areaA + areaB, expected + 2]);
    }
    const x = 3 + (variantIndex % 9);
    const add = 2 + (variantIndex % 5);
    const known = x + add;
    const p = problemBase("algebraic-targets", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Two same-height triangles have equal areas. One base is x + ${add} cm and the other base is ${known} cm. Find x.`;
    p.hint1 = "Equal height and equal area mean the matching bases are equal.";
    p.hint2 = `Set the matching bases equal: x + ${add} = ${known}.`;
    p.solution = `x + ${add} = ${known}, so x = ${x}. The equal-height area fact has turned into a base equation.`;
    p.visual = { type: "algebra", labelA: `x + ${add}`, labelB: String(known), equality: true };
    p.audit = { kind: "expression", x, add, known, expected: x };
    return completeNumberProblem(p, x, "", [known, x + add + known, add, x + 1]);
  }

  function equalAreaReverseProblem(variantIndex) {
    const base = 7 + ((variantIndex * 3) % 14);
    const p = problemBase("equal-area-reverse", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Triangles A and B have the same height and equal areas. Triangle A has base ${base} cm. What must Triangle B's matching base be?`;
    p.hint1 = "Same height means area changes only when the base changes.";
    p.hint2 = "If the areas stayed equal, the matching bases must be equal too.";
    p.solution = `Triangle B's base must be ${base} cm. Equal height plus equal area forces equal base.`;
    p.visual = { type: "equalAreaReverse", baseA: base, baseB: null };
    p.audit = { kind: "equal-area", expected: base };
    return completeNumberProblem(p, base, "cm", [base + 2, Math.max(1, base - 2), base * 2, Math.round(base / 2)]);
  }

  function diagramInterpretationProblem(variantIndex) {
    const base = 8 + (variantIndex % 8) * 2;
    const height = heightPool[variantIndex % heightPool.length];
    const slant = height + 5 + (variantIndex % 5);
    const area = base * height / 2;
    if (variantIndex % 3 === 0) {
      const p = problemBase("diagram-interpretation", variantIndex, "choice");
      p.prompt = `The diagram labels a sloping side ${slant} cm and a perpendicular drop ${height} cm. Which length is the height for the area formula?`;
      p.hint1 = "Look for the square corner.";
      p.hint2 = "The perpendicular drop is the height.";
      p.solution = `${height} cm is the height because it meets the base at 90 degrees.`;
      p.visual = { type: "heightDetective", base, height, slant };
      p.audit = { kind: "choice", expected: `${height} cm` };
      return completeChoiceProblem(p, `${height} cm`, [`${slant} cm`, `${base} cm`, "the longest side"]);
    }
    const p = problemBase("diagram-interpretation", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `A triangle has base ${base} cm, perpendicular height ${height} cm, and a sloping side labelled ${slant} cm. Find its area.`;
    p.hint1 = "Ignore the sloping side for area unless it is perpendicular to the base.";
    p.hint2 = `Use ${base} x ${height} / 2.`;
    p.solution = `Area = ${base} x ${height} / 2 = ${area} cm^2. The sloping side ${slant} cm was a trap.`;
    p.visual = { type: "heightDetective", base, height, slant };
    p.audit = { kind: "area", base, height };
    return completeNumberProblem(p, area, "cm^2", [base * slant / 2, base * height, slant * height / 2, base + height + slant]);
  }

  const GENERATORS = {
    "area-formula": areaFormulaProblem,
    "equal-height-base-ratio": baseRatioProblem,
    "same-base-height": sameBaseHeightProblem,
    "reverse-from-area": reverseAreaProblem,
    "multi-triangle-height": multiTriangleProblem,
    "shared-base-split": splitBaseProblem,
    "compound-difference": differenceProblem,
    "algebraic-targets": algebraProblem,
    "equal-area-reverse": equalAreaReverseProblem,
    "diagram-interpretation": diagramInterpretationProblem
  };

  function challengeProblem(variantIndex) {
    const type = variantIndex % 12;
    if (type === 0) {
      const bc = 6 + (variantIndex % 5);
      const areaBC = bc * 4;
      const areaAB = areaBC + 8;
      const ab = areaAB / 4;
      const p = problemBase("shared-base-split", variantIndex, "filled", "challenge");
      p.classic = "Challenge: Hidden Split Base";
      p.prompt = `Challenge: A common apex stands above a split base. Segment BC is ${bc} cm and its triangle area is ${areaBC} cm^2. The triangle on AB has area ${areaAB} cm^2. Find AB.`;
      p.hint1 = "Both triangles share the same height, so base ratio equals area ratio.";
      p.hint2 = `AB / ${bc} = ${areaAB} / ${areaBC}.`;
      p.solution = `AB = ${bc} x ${areaAB} / ${areaBC} = ${ab} cm.`;
      p.visual = { type: "splitBase", left: null, right: bc, leftArea: areaAB, rightArea: areaBC, total: false };
      p.audit = { kind: "reverse-ratio", knownBase: bc, knownArea: areaBC, targetArea: areaAB, expected: ab };
      return completeNumberProblem(p, ab, "cm", [bc, areaAB - areaBC, areaAB / bc, ab + 2]);
    }
    if (type === 1) {
      const total = 60 + (variantIndex % 4) * 20;
      const ratios = [2, 3, 5];
      const expected = total * ratios[1] / 10;
      const p = problemBase("multi-triangle-height", variantIndex, "choice", "challenge");
      p.classic = "Challenge: Same Height Total Area";
      p.prompt = `Challenge: Three same-height triangles have base ratio 2:3:5. Their total area is ${total} cm^2. Find the middle triangle's area.`;
      p.hint1 = "The total ratio parts are 2 + 3 + 5.";
      p.hint2 = `The middle triangle gets 3/10 of ${total}.`;
      p.solution = `Middle area = ${total} x 3 / 10 = ${expected} cm^2.`;
      p.visual = { type: "multiLine", bases: ratios, areas: [null, null, null], givenIndex: null, totalArea: total };
      p.audit = { kind: "part-of-total", total, part: 3, parts: 10, expected };
      return completeNumberProblem(p, expected, "cm^2", [total / 3, total * 2 / 10, total * 5 / 10, total - expected]);
    }
    if (type === 2) {
      const x = 8 + (variantIndex % 5);
      const leftAdd = 3;
      const rightSubtract = x - leftAdd;
      const knownExpr = `2x - ${rightSubtract}`;
      const p = problemBase("algebraic-targets", variantIndex, "filled", "challenge");
      p.classic = "Challenge: Equal Area Expression";
      p.prompt = `Challenge: Two same-height triangles have equal areas. Their bases are x + ${leftAdd} and ${knownExpr}. Find x.`;
      p.hint1 = "Equal height and equal area mean the base expressions match.";
      p.hint2 = `Set x + ${leftAdd} = ${knownExpr}.`;
      p.solution = `x + ${leftAdd} = ${knownExpr}. Subtract x from both sides: ${leftAdd} = x - ${rightSubtract}, so x = ${x}.`;
      p.visual = { type: "algebra", labelA: `x + ${leftAdd}`, labelB: knownExpr, equality: true };
      p.audit = { kind: "linear-equality", leftAdd, rightSubtract, expected: x };
      return completeNumberProblem(p, x, "", [x + leftAdd, 2 * x - rightSubtract, rightSubtract, x + 1]);
    }
    if (type === 3) {
      const base = 10 + (variantIndex % 5) * 2;
      const height = 6 + (variantIndex % 4);
      const area = base * height / 2;
      const multiplier = 2;
      const expected = height * multiplier;
      const p = problemBase("reverse-from-area", variantIndex, "filled", "challenge");
      p.classic = "Challenge: Reverse Height From Ratio";
      p.prompt = `Challenge: Triangle A has base ${base} cm and height ${height} cm. Triangle B has the same base but twice the area. Find Triangle B's height.`;
      p.hint1 = "With the same base, area changes with height.";
      p.hint2 = `Twice the area means twice the height. Triangle A area is ${area} cm^2.`;
      p.solution = `Triangle B's height is ${expected} cm.`;
      p.visual = { type: "reverseArea", area: area * multiplier, base, height: null, target: "height" };
      p.audit = { kind: "same-base-height-scale", height, multiplier, expected };
      return completeNumberProblem(p, expected, "cm", [height, base, area, expected + 2]);
    }
    if (type === 4) {
      return differenceProblem(variantIndex + 30);
    }
    if (type === 5) {
      return algebraProblem(variantIndex + 31);
    }
    if (type === 6) {
      const area = 90;
      const height = 9 + (variantIndex % 3);
      const expected = 2 * area / height;
      const p = problemBase("equal-area-reverse", variantIndex, "choice", "challenge");
      p.classic = "Challenge: Equal Area, Different Height";
      p.prompt = `Challenge: Triangle P has area ${area} cm^2. Triangle Q has the same area and height ${height} cm. Find Triangle Q's base.`;
      p.hint1 = "Equal area does not always mean equal base if heights differ.";
      p.hint2 = `Base = 2 x ${area} / ${height}.`;
      p.solution = `Base = ${expected} cm.`;
      p.visual = { type: "reverseArea", area, base: null, height, target: "base" };
      p.audit = { kind: "reverse", area, known: height, expected };
      return completeNumberProblem(p, expected, "cm", [height, area / height, expected / 2, expected + 4]);
    }
    if (type === 7) {
      const p = problemBase("equal-height-base-ratio", variantIndex, "ratio", "challenge");
      p.classic = "Challenge: Diagram-Only Area Ratio";
      p.prompt = "Challenge: The diagram shows three same-height triangles with base marks 1, 2, and 4. What is Area A : Area C?";
      p.hint1 = "The base marks are the ratio parts.";
      p.hint2 = "Use A:C, not C:A.";
      p.solution = "Area A : Area C = 1:4.";
      p.visual = { type: "multiLine", bases: [1, 2, 4], areas: [null, null, null], givenIndex: null };
      p.audit = { kind: "ratio", left: 1, right: 4 };
      return completeRatioProblem(p, 1, 4, ["4:1", "1:2", "3:4"]);
    }
    if (type === 8) {
      return diagramInterpretationProblem(variantIndex + 28);
    }
    if (type === 9) {
      const x = 6 + (variantIndex % 5);
      const height = 8;
      const totalArea = (x + x + 6) * height / 2;
      const p = problemBase("algebraic-targets", variantIndex, "filled", "challenge");
      p.classic = "Challenge: Reverse Total With Equal Heights";
      p.prompt = `Challenge: Two same-height triangles have bases x and x + 6. Their total area is ${totalArea} cm^2 and the shared height is ${height} cm. Find x.`;
      p.hint1 = "Add the bases before using the shared height.";
      p.hint2 = `(x + x + 6) x ${height} / 2 = ${totalArea}.`;
      p.solution = `2x + 6 = ${totalArea * 2 / height}, so x = ${x}.`;
      p.visual = { type: "algebra", labelA: "x", labelB: "x + 6", areaA: null, areaB: null, equality: false, totalArea };
      p.audit = { kind: "reverse-total-expression", height, totalArea, offset: 6, expected: x };
      return completeNumberProblem(p, x, "", [x + 6, 2 * x + 6, totalArea / height, x - 1]);
    }
    if (type === 10) {
      const p = problemBase("same-base-height", variantIndex, "multi", "challenge");
      p.classic = "Challenge: Which Triangles Must Be Equal?";
      p.prompt = "Challenge: Choose every triangle pair that must have equal area from the diagram.";
      p.hint1 = "Look for equal base and equal height, not equal-looking sloping sides.";
      p.hint2 = "Pairs A and B share base and parallel height; C has a different base.";
      p.solution = "A and B must have equal area. C does not have enough matching information.";
      p.visual = { type: "equalPairs", base: 12, height: 7 };
      p.audit = { kind: "multi", expected: ["A and B"] };
      return completeMultiProblem(p, ["A and B"], ["A and B", "A and C", "B and C"]);
    }
    const p = problemBase("equal-height-base-ratio", variantIndex, "filled", "challenge");
    p.classic = "Challenge: Area Ratio Backwards";
    p.prompt = "Challenge: Two same-height triangles have areas in the ratio 3:7. The larger triangle has base 21 cm. Find the smaller base.";
    p.hint1 = "Match the larger base to the 7 parts.";
    p.hint2 = "One part is 21 / 7.";
    p.solution = "Smaller base = 3 x (21 / 7) = 9 cm.";
    p.visual = { type: "ratioParallel", baseA: null, baseB: 21, areaA: 3, areaB: 7, ratio: "3:7" };
    p.audit = { kind: "reverse-ratio", knownBase: 21, knownArea: 7, targetArea: 3, expected: 9 };
    return completeNumberProblem(p, 9, "cm", [21, 49, 7, 12]);
  }

  function generateProblem(classicId, variantIndex) {
    const id = GENERATORS[classicId] ? classicId : CLASSIC_IDS[0];
    const generator = GENERATORS[id];
    const problem = generator(variantIndex || 0);
    if (problem && CLASSIC_SKILLS[id]) problem.skillTag = CLASSIC_SKILLS[id];
    return problem;
  }

  function generateChallengeProblem(variantIndex) {
    const problem = challengeProblem(variantIndex || 0);
    problem.source = "JMC/PMC-inspired challenge variation";
    if (!problem.prompt.startsWith("Challenge:")) problem.prompt = `Challenge: ${problem.prompt}`;
    if (!problem.classic.startsWith("Challenge:")) problem.classic = `Challenge: ${problem.classic}`;
    return problem;
  }

  function validateProblemMath(problem) {
    const audit = problem.audit || {};
    const expected = problem.expected;
    const close = (a, b) => Math.abs(Number(a) - Number(b)) < 0.000001;
    if (audit.kind === "area") return close(expected, audit.base * audit.height / 2);
    if (audit.kind === "scaled-area") return close(expected, audit.areaA * audit.right / audit.left);
    if (audit.kind === "ratio") return expected === ratioText(audit.left, audit.right);
    if (audit.kind === "equal-area") return close(expected, audit.expected);
    if (audit.kind === "reverse") return close(expected, 2 * audit.area / audit.known);
    if (audit.kind === "sum") return close(expected, audit.values.reduce((a, b) => a + b, 0));
    if (audit.kind === "difference") return close(expected, (audit.large - audit.small) * audit.height / 2);
    if (audit.kind === "target-sum") return close(expected, audit.a + audit.b);
    if (audit.kind === "expression") return close(expected, audit.known - audit.add);
    if (audit.kind === "part-of-total") return close(expected, audit.total * audit.part / audit.parts);
    if (audit.kind === "reverse-ratio") return close(expected, audit.knownBase * audit.targetArea / audit.knownArea);
    if (audit.kind === "same-base-height-scale") return close(expected, audit.height * audit.multiplier);
    if (audit.kind === "choice") return String(expected) === String(audit.expected);
    if (audit.kind === "multi") return JSON.stringify(expected) === JSON.stringify(audit.expected.slice().sort());
    if (audit.kind === "linear-equality") return close(expected + audit.leftAdd, 2 * expected - audit.rightSubtract) && close(expected, audit.expected);
    if (audit.kind === "reverse-total-expression") return close((expected + expected + audit.offset) * audit.height / 2, audit.totalArea) && close(expected, audit.expected);
    return expected !== undefined;
  }

  function checkAnswer(problem, input) {
    if (problem.answerType === "choice") {
      const given = input?.choice ?? input?.value;
      return { isCorrect: sameText(given, problem.expected), expected: problem.expectedDisplay, repairClassic: problem.classic };
    }
    if (problem.answerType === "ratio") {
      const given = normaliseRatio(input?.value ?? input?.choice);
      return { isCorrect: given === normaliseRatio(problem.expected), expected: problem.expectedDisplay, repairClassic: problem.classic };
    }
    if (problem.answerType === "multi") {
      const selected = Array.isArray(input?.choices) ? input.choices.slice() : [input?.choice].filter(Boolean);
      const got = selected.map(String).sort();
      const expected = problem.expected.slice().sort();
      return { isCorrect: JSON.stringify(got) === JSON.stringify(expected), expected: problem.expectedDisplay, repairClassic: problem.classic };
    }
    const value = parseNumber(input?.value ?? input?.choice);
    return { isCorrect: Math.abs(value - Number(problem.expected)) < 0.000001, expected: problem.expectedDisplay, repairClassic: problem.classic };
  }

  function svgShell(content, extra = "") {
    return `<svg viewBox="0 0 640 390" role="img" aria-label="Equal height triangle explainer" ${extra}>
      <rect width="640" height="390" rx="8" fill="#fffdf8"></rect>
      ${content}
    </svg>`;
  }

  function label(x, y, text, anchorId, anchorType, extra = "") {
    return `<text x="${x}" y="${y}" class="diagram-label" data-label-for="${anchorId}" data-anchor-id="${anchorId}" data-anchor-type="${anchorType}" ${extra}>${escapeHtml(formatMathText(text))}</text>`;
  }

  function answerBanner(problem, mode) {
    return mode === "solution"
      ? `<g data-derived-value="answer"><rect x="398" y="22" width="210" height="42" rx="8" fill="#dff7e8" stroke="#27764f" stroke-width="2"></rect>${label(416, 49, `Answer: ${problem.expectedDisplay}`, "answer", "worked")}</g>`
      : "";
  }

  function heightOverlay(mode, x = 320, y1 = 94, y2 = 296, text = "same height") {
    if (mode === "initial") return "";
    return `<g class="hint-layer" data-visual-state="${mode}">
      <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#f36f45" stroke-width="4" stroke-dasharray="8 7" data-label-for="height" data-anchor-id="height" data-anchor-type="height"></line>
      <path d="M${x} ${y2 - 20} h20 v20" fill="none" stroke="#f36f45" stroke-width="4" data-label-for="right-angle"></path>
      ${label(x + 12, (y1 + y2) / 2, text, "height", "height")}
    </g>`;
  }

  function renderProblemVisual(problem, mode = "initial") {
    const v = problem.visual || {};
    const answer = answerBanner(problem, mode);
    let html = "";
    let text = "";

    if (v.type === "directArea") {
      html = svgShell(`
        ${mode !== "initial" ? '<rect x="122" y="86" width="348" height="212" fill="none" stroke="#a8c4cf" stroke-width="3" stroke-dasharray="9 7" data-label-for="matching-rectangle" data-anchor-id="matching-rectangle" data-anchor-type="guide"></rect>' : ""}
        <polygon points="122,298 470,298 238,86" fill="#fff8dc" stroke="#0d263f" stroke-width="4" data-shape="area-triangle"></polygon>
        <line x1="238" y1="86" x2="238" y2="298" stroke="#f36f45" stroke-width="4" stroke-dasharray="8 7" data-label-for="height"></line>
        <path d="M238 276 h22 v22" fill="none" stroke="#f36f45" stroke-width="4"></path>
        ${label(270, 194, `${v.height} cm`, "height", "height")}
        ${label(274, 324, `base ${v.base} cm`, "base", "base", 'text-anchor="middle"')}
        ${label(118, 176, `sloping side ${v.slant} cm`, "sloping-side", "side")}
        ${mode !== "initial" ? label(118, 48, "half of matching rectangle", "formula", "worked") : ""}
        ${answer}
      `, 'data-visual-type="directArea"');
      text = "The perpendicular drop, not the sloping side, is paired with the base.";
    } else if (v.type === "ratioParallel") {
      const baseALabel = v.baseA == null ? "base ?" : `${v.baseA} cm`;
      const baseBLabel = v.baseB == null ? "21 cm" : `${v.baseB} cm`;
      const areaALabel = v.areaA == null ? "" : label(178, 188, `Area A ${v.areaA} cm^2`, "area-a", "area");
      const areaBLabel = v.areaB == null ? "" : label(432, 188, `Area B ${v.areaB} cm^2`, "area-b", "area");
      html = svgShell(`
        <line x1="82" y1="94" x2="558" y2="94" stroke="#a8c4cf" stroke-width="3" data-label-for="parallel-top"></line>
        <line x1="82" y1="296" x2="558" y2="296" stroke="#a8c4cf" stroke-width="3" data-label-for="parallel-base"></line>
        <path d="M112 86 l18 8 l-18 8" fill="none" stroke="#0d263f" stroke-width="3"></path>
        <path d="M522 86 l18 8 l-18 8" fill="none" stroke="#0d263f" stroke-width="3"></path>
        <path d="M112 288 l18 8 l-18 8" fill="none" stroke="#0d263f" stroke-width="3"></path>
        <path d="M522 288 l18 8 l-18 8" fill="none" stroke="#0d263f" stroke-width="3"></path>
        <polygon points="112,296 246,296 176,94" fill="#e8f6ff" stroke="#0d263f" stroke-width="4" data-shape="same-height-a"></polygon>
        <polygon points="346,296 542,296 430,94" fill="#fff1eb" stroke="#0d263f" stroke-width="4" data-shape="same-height-b"></polygon>
        ${label(154, 324, baseALabel, "base-a", "base", 'text-anchor="middle"')}
        ${label(444, 324, baseBLabel, "base-b", "base", 'text-anchor="middle"')}
        ${areaALabel}
        ${areaBLabel}
        ${heightOverlay(mode, 306, 94, 296, "same height")}
        ${mode === "solution" ? label(162, 56, `areas follow bases ${v.ratio || ""}`, "ratio-rule", "worked") : ""}
        ${answer}
      `, 'data-visual-type="ratioParallel"');
      text = "The parallel lines keep both triangle heights equal, so the base comparison controls the area comparison.";
    } else if (v.type === "slidingApex") {
      html = svgShell(`
        <line x1="92" y1="92" x2="552" y2="92" stroke="#a8c4cf" stroke-width="3" data-label-for="parallel-top"></line>
        <line x1="92" y1="300" x2="552" y2="300" stroke="#a8c4cf" stroke-width="3" data-label-for="parallel-base"></line>
        <polygon points="158,300 482,300 244,92" fill="#e8f6ff" stroke="#0d263f" stroke-width="4" data-shape="sliding-a"></polygon>
        <polygon points="158,300 482,300 398,92" fill="#fff1eb" stroke="#0d263f" stroke-width="4" data-shape="sliding-b" opacity="0.86"></polygon>
        ${label(314, 326, `same base ${v.base} cm`, "shared-base", "base", 'text-anchor="middle"')}
        ${label(206, 188, `Area A ${v.areaA} cm^2`, "area-a", "area")}
        ${heightOverlay(mode, 536, 92, 300, "same height")}
        ${mode === "solution" ? label(166, 55, "same base + same height = same area", "equal-area-rule", "worked") : ""}
        ${answer}
      `, 'data-visual-type="slidingApex"');
      text = "The top point moves sideways, but the perpendicular distance between the parallel lines does not change.";
    } else if (v.type === "reverseArea") {
      const baseLabel = v.base == null ? "base ?" : `base ${v.base} cm`;
      const heightLabel = v.height == null ? "height ?" : `height ${v.height} cm`;
      html = svgShell(`
        <polygon points="130,298 486,298 232,88" fill="#fff8dc" stroke="#0d263f" stroke-width="4" data-shape="reverse-triangle"></polygon>
        <line x1="232" y1="88" x2="232" y2="298" stroke="#f36f45" stroke-width="4" stroke-dasharray="8 7" data-label-for="height"></line>
        <path d="M232 276 h22 v22" fill="none" stroke="#f36f45" stroke-width="4"></path>
        ${label(264, 198, heightLabel, "height", "height")}
        ${label(308, 326, baseLabel, "base", "base", 'text-anchor="middle"')}
        ${label(266, 184, `area ${v.area} cm^2`, "area", "area")}
        ${mode !== "initial" ? label(124, 58, "double the area before dividing", "reverse-rule", "worked") : ""}
        ${answer}
      `, 'data-visual-type="reverseArea"');
      text = "Reverse questions undo the divide by two first.";
    } else if (v.type === "multiLine") {
      const bases = v.bases || [2, 3, 5];
      const total = bases.reduce((a, b) => a + b, 0);
      let x = 86;
      const segments = bases.map((base, index) => {
        const width = 410 * base / total;
        const mid = x + width / 2;
        const apexX = mid + (index - 1) * 15;
        const color = ["#e8f6ff", "#fff1eb", "#dff7e8"][index % 3];
        const area = v.areas && v.areas[index] ? label(mid - 24, 195, `Area ${String.fromCharCode(65 + index)} ${v.areas[index]} cm^2`, `area-${index}`, "area") : "";
        const part = `
          <polygon points="${x},300 ${x + width},300 ${apexX},94" fill="${color}" stroke="#0d263f" stroke-width="4" data-shape="multi-${index}"></polygon>
          ${label(mid, 326, `${base}`, `base-${index}`, "base", 'text-anchor="middle"')}
          ${label(apexX - 10, 84, String.fromCharCode(65 + index), `apex-${index}`, "apex")}
          ${area}
        `;
        x += width;
        return part;
      }).join("");
      html = svgShell(`
        <line x1="70" y1="94" x2="560" y2="94" stroke="#a8c4cf" stroke-width="3"></line>
        <line x1="70" y1="300" x2="560" y2="300" stroke="#a8c4cf" stroke-width="3"></line>
        ${segments}
        ${v.totalArea ? label(238, 54, `total area ${v.totalArea} cm^2`, "total-area", "area") : ""}
        ${heightOverlay(mode, 574, 94, 300, "same height")}
        ${answer}
      `, 'data-visual-type="multiLine"');
      text = "Several triangles share one height, so the base labels order the areas.";
    } else if (v.type === "splitBase") {
      const leftText = v.left == null ? "AB ?" : `${v.left} cm`;
      const rightText = v.right == null ? "BC ?" : `${v.right} cm`;
      html = svgShell(`
        <polygon points="118,300 506,300 306,80" fill="#fff8dc" stroke="#0d263f" stroke-width="4" data-shape="split-whole"></polygon>
        <line x1="306" y1="80" x2="306" y2="300" stroke="#0d263f" stroke-width="3" data-label-for="split-line"></line>
        <circle cx="306" cy="80" r="5" fill="#0d263f"></circle>
        ${label(292, 66, "Apex", "apex", "apex")}
        ${label(210, 326, leftText, "base-left", "base", 'text-anchor="middle"')}
        ${label(406, 326, rightText, "base-right", "base", 'text-anchor="middle"')}
        ${label(178, 196, `area ${v.leftArea} cm^2`, "area-left", "area")}
        ${v.rightArea ? label(384, 196, `area ${v.rightArea} cm^2`, "area-right", "area") : label(394, 196, "area ?", "area-right", "area")}
        ${heightOverlay(mode, 548, 80, 300, "same height")}
        ${answer}
      `, 'data-visual-type="splitBase"');
      text = "One apex over one straight base line gives both smaller triangles the same height.";
    } else if (v.type === "difference") {
      html = svgShell(`
        <polygon points="100,300 526,300 298,84" fill="#fff1eb" stroke="#0d263f" stroke-width="4" data-shape="large-triangle"></polygon>
        <polygon points="208,300 526,300 298,84" fill="#fffdf8" stroke="#0d263f" stroke-width="4" data-shape="small-triangle"></polygon>
        <path d="M100 300 L208 300 L298 84 Z" fill="#f7d08a" opacity="0.8" stroke="#f36f45" stroke-width="3" data-shape="shaded-difference"></path>
        ${label(312, 326, `large base ${v.large} cm`, "large-base", "base", 'text-anchor="middle"')}
        ${label(404, 354, `small base ${v.small} cm`, "small-base", "base", 'text-anchor="middle"')}
        ${heightOverlay(mode, 552, 84, 300, `height ${v.height} cm`)}
        ${mode !== "initial" ? label(118, 58, `base difference ${v.gap} cm`, "gap", "worked") : ""}
        ${answer}
      `, 'data-visual-type="difference"');
      text = "The shaded part is the difference between two triangles with the same height.";
    } else if (v.type === "algebra") {
      html = svgShell(`
        <line x1="88" y1="94" x2="552" y2="94" stroke="#a8c4cf" stroke-width="3"></line>
        <line x1="88" y1="300" x2="552" y2="300" stroke="#a8c4cf" stroke-width="3"></line>
        <polygon points="116,300 286,300 196,94" fill="#e8f6ff" stroke="#0d263f" stroke-width="4" data-shape="algebra-a"></polygon>
        <polygon points="356,300 530,300 438,94" fill="#fff1eb" stroke="#0d263f" stroke-width="4" data-shape="algebra-b"></polygon>
        ${label(190, 326, v.labelA || "a", "base-a", "base", 'text-anchor="middle"')}
        ${label(444, 326, v.labelB || "b", "base-b", "base", 'text-anchor="middle"')}
        ${v.equality ? label(260, 58, "equal areas given", "equal-area-given", "area") : ""}
        ${v.areaA ? label(154, 188, `area ${v.areaA} cm^2`, "area-a", "area") : ""}
        ${v.areaB ? label(398, 188, `area ${v.areaB} cm^2`, "area-b", "area") : ""}
        ${v.totalArea ? label(228, 58, `total area ${v.totalArea} cm^2`, "total-area", "area") : ""}
        ${heightOverlay(mode, 320, 94, 300, "same height")}
        ${mode === "solution" ? label(160, 60, "make the equation from matching bases or areas", "equation-rule", "worked") : ""}
        ${answer}
      `, 'data-visual-type="algebra"');
      text = "The equation comes from the diagram relationship, then the final target must be checked.";
    } else if (v.type === "equalAreaReverse") {
      html = svgShell(`
        <line x1="90" y1="96" x2="552" y2="96" stroke="#a8c4cf" stroke-width="3"></line>
        <line x1="90" y1="300" x2="552" y2="300" stroke="#a8c4cf" stroke-width="3"></line>
        <polygon points="126,300 300,300 206,96" fill="#e8f6ff" stroke="#0d263f" stroke-width="4" data-shape="equal-a"></polygon>
        <polygon points="356,300 530,300 456,96" fill="#fff1eb" stroke="#0d263f" stroke-width="4" data-shape="equal-b"></polygon>
        ${label(210, 326, `base ${v.baseA} cm`, "base-a", "base", 'text-anchor="middle"')}
        ${label(444, 326, "base ?", "base-b", "base", 'text-anchor="middle"')}
        ${label(168, 184, "equal area", "area-a", "area")}
        ${label(410, 184, "equal area", "area-b", "area")}
        ${heightOverlay(mode, 320, 96, 300, "same height")}
        ${answer}
      `, 'data-visual-type="equalAreaReverse"');
      text = "If the height is the same and the area is the same, the matching base cannot change.";
    } else if (v.type === "heightDetective") {
      html = svgShell(`
        <polygon points="126,300 500,300 256,82" fill="#fff8dc" stroke="#0d263f" stroke-width="4" data-shape="height-detective"></polygon>
        <line x1="256" y1="82" x2="256" y2="300" stroke="#f36f45" stroke-width="4" stroke-dasharray="8 7" data-label-for="height"></line>
        <path d="M256 278 h22 v22" fill="none" stroke="#f36f45" stroke-width="4"></path>
        <line x1="256" y1="82" x2="500" y2="300" stroke="#1790a6" stroke-width="5" data-label-for="sloping-side"></line>
        ${label(302, 194, `${v.height} cm`, "height", "height")}
        ${label(388, 182, `${v.slant} cm`, "sloping-side", "side")}
        ${label(312, 326, `base ${v.base} cm`, "base", "base", 'text-anchor="middle"')}
        ${mode === "solution" ? label(118, 58, "use the length with the square corner", "height-rule", "worked") : ""}
        ${answer}
      `, 'data-visual-type="heightDetective"');
      text = "The correct height is the line that meets the base at a right angle.";
    } else if (v.type === "equalPairs") {
      html = svgShell(`
        <line x1="80" y1="92" x2="560" y2="92" stroke="#a8c4cf" stroke-width="3"></line>
        <line x1="80" y1="300" x2="560" y2="300" stroke="#a8c4cf" stroke-width="3"></line>
        <polygon points="108,300 278,300 188,92" fill="#e8f6ff" stroke="#0d263f" stroke-width="4"></polygon>
        <polygon points="108,300 278,300 244,92" fill="#fff1eb" stroke="#0d263f" stroke-width="4" opacity="0.86"></polygon>
        <polygon points="348,300 536,300 442,92" fill="#dff7e8" stroke="#0d263f" stroke-width="4"></polygon>
        ${label(184, 326, "same base", "base-ab", "base", 'text-anchor="middle"')}
        ${label(442, 326, "different base", "base-c", "base", 'text-anchor="middle"')}
        ${label(150, 84, "A", "apex-a", "apex")}
        ${label(248, 84, "B", "apex-b", "apex")}
        ${label(444, 84, "C", "apex-c", "apex")}
        ${heightOverlay(mode, 576, 92, 300, "same height")}
        ${answer}
      `, 'data-visual-type="equalPairs"');
      text = "Select only the pair with both equal base and equal height.";
    } else {
      html = svgShell(`${label(180, 190, "Diagram coming next", "placeholder", "worked")}${answer}`);
      text = "A visual explainer will appear here.";
    }

    return { html, text };
  }

  function renderIntroScene(index) {
    const scene = INTRO_SCENES[index % INTRO_SCENES.length];
    const sample = scene.classicId ? generateProblem(scene.classicId, index + 1) : generateProblem(CLASSIC_IDS[index % CLASSIC_IDS.length], index);
    const mode = ["height-spotter", "half-rectangle"].includes(scene.kind) ? "hint" : "initial";
    return renderProblemVisual(sample, mode).html;
  }

  function createRound(offset = 0, challenge = false) {
    if (challenge) return Array.from({ length: ROUND_LENGTH }, (_, index) => generateChallengeProblem(offset + index));
    return CLASSIC_IDS.map((classicId, index) => generateProblem(classicId, offset + index));
  }

  function findSimilarVariant(problem, offset = 0) {
    return (problem.variantIndex || 0) + CLASSIC_IDS.length + 1 + offset;
  }

  const api = {
    CLASSICS,
    CLASSIC_IDS,
    CLASSIC_SKILLS,
    SOURCE_COVERAGE,
    INTRO_SCENES,
    INTRO_SCENE_MS,
    WARMUP_QUESTIONS,
    ROUND_LENGTH,
    formatMathText,
    plainMathText,
    parseNumber,
    normaliseRatio,
    generateProblem,
    generateChallengeProblem,
    validateProblemMath,
    checkAnswer,
    renderProblemVisual,
    renderIntroScene,
    createRound,
    findSimilarVariant
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    return;
  }

  root.EqualHeightTrianglesModule = api;

  const state = {
    introIndex: 0,
    introPlaying: false,
    introStartedAt: 0,
    introTimer: null,
    audioEnabled: true,
    currentUtterance: null,
    warmupPassed: false,
    roundOffset: 0,
    challengeMode: false,
    round: createRound(0, false),
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
        // Metadata may not be loaded yet.
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
    utterance.rate = 0.93;
    utterance.pitch = 1.03;
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
      // The browser may need metadata first.
    }
    audio.onplay = () => updateAudioStatus("Audio playing.");
    audio.onended = () => updateAudioStatus(state.introPlaying ? "Audio ready for the next scene." : "Audio ready.");
    audio.onerror = startFallback;
    updateAudioStatus("Audio starting.");
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === "function") playAttempt.catch(startFallback);
  }

  function currentIntroDurationMs() {
    return INTRO_SCENES[state.introIndex].durationMs || INTRO_SCENE_MS;
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
    $("intro-play").textContent = state.introPlaying ? "Pause intro" : "Play intro video";
    $("intro-start").disabled = !state.warmupPassed;
    $("show-practice").disabled = !state.warmupPassed;
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

  function renderWarmup() {
    $("warmup-gate").innerHTML = WARMUP_QUESTIONS.map((question, index) => `
      <fieldset class="warmup-card" data-warmup-id="${escapeHtml(question.id)}">
        <legend>${index + 1}. ${escapeHtml(formatMathText(question.prompt))}</legend>
        ${question.choices.map((choice) => `
          <label><input type="radio" name="warmup-${escapeHtml(question.id)}" value="${escapeHtml(choice)}"><span>${escapeHtml(formatMathText(choice))}</span></label>
        `).join("")}
      </fieldset>
    `).join("");
    updateWarmupStatus("Pass the four warmup checks to unlock the exercises.");
  }

  function updateWarmupStatus(message) {
    const status = $("warmup-status");
    if (status) status.textContent = message;
  }

  function checkWarmup() {
    const form = new FormData($("warmup-form"));
    const missed = WARMUP_QUESTIONS.filter((question) => form.get(`warmup-${question.id}`) !== question.correct);
    state.warmupPassed = missed.length === 0;
    if (state.warmupPassed) {
      updateWarmupStatus("Warmup passed. Exercises are unlocked.");
    } else {
      updateWarmupStatus(`Not yet. Review: ${missed.map((question) => question.repairClassic).join(", ")}.`);
    }
    renderIntro();
  }

  function showIntro() {
    $("intro-screen").hidden = false;
    $("practice-grid").hidden = true;
    $("round-recap").hidden = true;
    renderIntro();
  }

  function showPractice() {
    if (!state.warmupPassed) {
      showIntro();
      updateWarmupStatus("Do the four warmup checks first. They make sure the diagrams will make sense.");
      return;
    }
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
      return `<div class="choice-grid">${problem.choices.map((choice) => `<label class="choice-card"><input type="radio" name="choice" value="${escapeHtml(choice.value)}"><span>${escapeHtml(formatMathText(choice.label))}</span></label>`).join("")}</div>`;
    }
    if (problem.answerType === "multi") {
      return `<div class="choice-grid">${problem.choices.map((choice) => `<label class="choice-card"><input type="checkbox" name="choices" value="${escapeHtml(choice.value)}"><span>${escapeHtml(formatMathText(choice.label))}</span></label>`).join("")}</div>`;
    }
    const placeholder = problem.answerType === "ratio" ? "Example: 2:5" : "Type the number";
    return `<input class="filled-answer" name="value" autocomplete="off" inputmode="decimal" placeholder="${placeholder}">`;
  }

  function renderProblem() {
    const problem = currentProblem();
    state.hintCount = 0;
    $("classic-label").textContent = problem.classic;
    $("session-count").textContent = `${state.current + 1} of ${state.round.length}`;
    $("problem-prompt").textContent = formatMathText(problem.prompt);
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
    $("live-score").textContent = `Score ${correct} / ${attempted} - Unanswered ${state.round.length - attempted}`;
  }

  function collectInput() {
    const form = new FormData($("answer-form"));
    return {
      choice: form.get("choice"),
      value: form.get("value"),
      choices: form.getAll("choices")
    };
  }

  function checkCurrent(event) {
    event.preventDefault();
    const problem = currentProblem();
    const result = checkAnswer(problem, collectInput());
    state.answers[state.current] = result;
    $("feedback").className = `feedback-card ${result.isCorrect ? "correct" : "wrong"}`;
    $("feedback").textContent = formatMathText(result.isCorrect ? `Correct. ${problem.solution}` : `Not quite. ${problem.hint1}`);
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
    $("feedback").textContent = formatMathText(currentProblem().solution);
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
      ? missed.map((problem) => `<div><strong>${escapeHtml(problem.classic)}</strong><br>${escapeHtml(problem.skill)}<br><span>${escapeHtml(formatMathText(problem.hint2))}</span></div>`).join("")
      : "<div><strong>Clean round.</strong><br>You spotted heights, ratios, reverse moves, split bases, and diagram traps accurately.</div>";
  }

  function freshRound(challenge = state.challengeMode) {
    state.roundOffset += 11;
    state.challengeMode = challenge;
    state.round = createRound(state.roundOffset, state.challengeMode);
    state.current = 0;
    state.answers = [];
    showPractice();
  }

  function trySimilar() {
    const problem = currentProblem();
    const nextIndex = findSimilarVariant(problem, state.roundOffset);
    state.round[state.current] = state.challengeMode ? generateChallengeProblem(nextIndex) : generateProblem(problem.classicId, nextIndex);
    state.answers[state.current] = null;
    renderProblem();
  }

  function boot() {
    renderSkills();
    renderWarmup();
    renderIntro();
    $("show-intro").addEventListener("click", showIntro);
    $("show-practice").addEventListener("click", showPractice);
    $("intro-start").addEventListener("click", showPractice);
    $("intro-audio").addEventListener("click", toggleIntroAudio);
    $("intro-next").addEventListener("click", () => advanceIntro(false));
    $("intro-play").addEventListener("click", toggleIntroPlayback);
    $("warmup-form").addEventListener("submit", (event) => {
      event.preventDefault();
      checkWarmup();
    });
    $("answer-form").addEventListener("submit", checkCurrent);
    $("hint-button").addEventListener("click", showHint);
    $("why-button").addEventListener("click", showWhy);
    $("next-button").addEventListener("click", nextProblem);
    $("similar-button").addEventListener("click", trySimilar);
    $("fresh-round-button").addEventListener("click", () => freshRound(false));
    $("challenge-round-button").addEventListener("click", () => freshRound(true));
    $("review-intro-button").addEventListener("click", showIntro);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
