// Principle of Addition and Multiplication (2) — Lesson 21.
// Source: PDF p43-55 / Book p33-45. Seven classics ladder from simple
// position-by-position counting to multi-bundle arrangement problems.
// Source images: source/source_page_images/addition_multiplication_2/.
(function (root) {
  "use strict";

  const ROUND_LENGTH = 7;
  const INTRO_SCENE_MS = 12000;

  // Seven classics: C1-C2 are warmups (position counting with/without zero),
  // C3 is the no-repeat decrement, C4-C5 introduce odd/even via last-digit
  // case-splits (C5 is the "Pip mistake" canonical), and C6-C7 cover the
  // Bundling Method (single bundle and multi-bundle challenge).
  const CLASSICS = [
    {
      id: "digits-with-repeats",
      nickname: "Position Counting",
      skill: "Treat each position as a separate choice and multiply the number of options together.",
      sourcePages: "Book 33-37 / PDF 43-47 (Lesson 21 warmup: forming numbers with no zero)",
      // Variants vary the digit-set size AND the number of positions, so the
      // SVG row legitimately has different numbers of boxes per variant — that
      // shape variation IS part of the lesson.
      variantStability: false
    },
    {
      id: "zero-leading-constraint",
      nickname: "Zero-Leading Block",
      skill: "Apply the leading-digit-not-zero rule by subtracting one from the first position's option count.",
      sourcePages: "Book 33-37 / PDF 43-47 (Lesson 21 in-class: digit set contains 0)",
      variantStability: false
    },
    {
      id: "no-repeat-distinct-digits",
      nickname: "No-Repeat Decrement",
      skill: "Decrease the option count by one for each subsequent position when digits cannot repeat.",
      sourcePages: "Book 34-37 / PDF 44-47 (Lesson 21 in-class: no-repeat variant)",
      variantStability: false
    },
    {
      id: "odd-by-last-digit-repeats",
      nickname: "Odd Last Digit (Repeats)",
      skill: "Fix the last position first using the odd/even rule, then count the remaining positions.",
      sourcePages: "Book 38-40 / PDF 48-50 (Lesson 21 reasoning: odd/even number forming, repeats allowed)",
      variantStability: false
    },
    {
      id: "odd-or-even-no-repeats",
      nickname: "Pip's Mistake (Case-Split)",
      skill: "Case-split the last position when zero is in the digit set so the leading zero rule is respected.",
      sourcePages: "Book 38-40 / PDF 48-50 (Lesson 21 reasoning: 'Pip's wrong answer' worked example)",
      variantStability: false
    },
    {
      id: "bundling-adjacent",
      nickname: "Bundling Method",
      skill: "Bundling method: glue adjacent items together as one unit and multiply by the bundle's internal orderings.",
      sourcePages: "Book 41-43 / PDF 51-53 (Lesson 21 bundling: APPLE letters, PP adjacent)",
      // Variants vary the number of items (5..6) so the row of letter/name
      // boxes legitimately changes shape — shape variation is the lesson.
      variantStability: false
    },
    {
      id: "bundling-multi-restriction",
      nickname: "Multi-Bundle Challenge",
      skill: "Bundling method: handle two adjacent bundles together by multiplying each bundle's internal orderings.",
      sourcePages: "Book 43-45 / PDF 53-55 (Lesson 21 challenge: two-bundle student-row problem)",
      variantStability: false
    }
  ];

  const CLASSIC_IDS = CLASSICS.map((classic) => classic.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((classic) => [classic.id, classic]));

  // Registry skill mapping. Five named skills cover the bank; each must
  // appear on >= 4 problems across all variants.
  // Registry skills:
  //   "Position-by-position counting"
  //   "Zero-leading constraint"
  //   "No-repeat decrement"
  //   "Odd/even via last digit"
  //   "Bundling method"
  const CLASSIC_SKILLS = {
    "digits-with-repeats": "Position-by-position counting",
    "zero-leading-constraint": "Zero-leading constraint",
    "no-repeat-distinct-digits": "No-repeat decrement",
    "odd-by-last-digit-repeats": "Odd/even via last digit",
    "odd-or-even-no-repeats": "Odd/even via last digit",
    "bundling-adjacent": "Bundling method",
    "bundling-multi-restriction": "Bundling method"
  };

  const SOURCE_COVERAGE = {
    "digits-with-repeats": ["Lesson 21 warmup: position-by-position counting with no zero in the set"],
    "zero-leading-constraint": ["Lesson 21 in-class: 0 can be in the set but cannot lead a multi-digit number"],
    "no-repeat-distinct-digits": ["Lesson 21 in-class: digits used at most once, decrement choice count per position"],
    "odd-by-last-digit-repeats": ["Lesson 21 reasoning: fix the last position first when the number must be odd or even"],
    "odd-or-even-no-repeats": ["Lesson 21 reasoning: Pip's wrong answer — case-split when zero is in the set and the number must be odd or even"],
    "bundling-adjacent": ["Lesson 21 bundling: glue adjacent items as one bundle and multiply by the bundle's internal orderings"],
    "bundling-multi-restriction": ["Lesson 21 challenge: two adjacent bundles, multiply each bundle's internal orderings together"]
  };

  const INTRO_SCENES = [
    {
      title: "Position-By-Position Counting",
      purpose: "Treat each digit position as a separate choice and multiply the choice counts together.",
      classicId: "digits-with-repeats",
      kind: "warmup",
      durationMs: 12000,
      caption: "Each position is a separate choice. Multiply the choices together.",
      voiceover: "Open with a row of empty boxes, one for each digit we need. Above the boxes, write the digit set we can pull from. The number of choices for each box is the size of that set. Multiply those numbers together and you have every possible number you can build."
    },
    {
      title: "Zero-Leading Constraint",
      purpose: "Subtract one from the leading position when zero is in the digit set, because numbers cannot start with zero.",
      classicId: "zero-leading-constraint",
      kind: "warmup",
      durationMs: 12000,
      caption: "Leading digit can't be zero. Subtract one from the leading position's options.",
      voiceover: "Now drop a zero into the digit set. The trailing boxes can still take any digit, including zero. But the leading box is special. A number cannot begin with zero, so the leading box has one fewer choice. The total drops accordingly."
    },
    {
      title: "No-Repeat Decrement",
      purpose: "Decrease the option count by one each step when digits are used at most once.",
      classicId: "no-repeat-distinct-digits",
      kind: "core",
      durationMs: 12000,
      caption: "Each digit used once. Options drop by one each step.",
      voiceover: "Switch to the no-repeat rule. Once a digit is placed in one box, it cannot appear again. The first box has five choices, the second has four, the third has three, and so on. Multiply the dropping numbers together to get the total."
    },
    {
      title: "Odd/Even Via Last Digit",
      purpose: "Fix the LAST position first when the number must be odd or even, then fill the other positions.",
      classicId: "odd-by-last-digit-repeats",
      kind: "core",
      durationMs: 12500,
      caption: "Fix the LAST position first when there's an odd/even rule.",
      voiceover: "Watch what Pip almost got wrong. The number must be odd, which is a rule about the last digit. So we fix the last box first, counting only the odd choices available. Then we go back to fill the leading box and the middle boxes. Always fix the constrained box first."
    },
    {
      title: "Bundling Method",
      purpose: "Glue two adjacent items together as one bundle, then multiply by the bundle's internal orderings.",
      classicId: "bundling-adjacent",
      kind: "challenge",
      durationMs: 12500,
      caption: "Glue adjacent items into one bundle. Count, then multiply by the bundle's internal orderings.",
      voiceover: "Switch to arranging items in a line. The word APPLE has two P letters that must sit together. Glue them into one bundle. Now we have four units to arrange instead of five, giving four factorial arrangements. Multiply by the bundle's own two orderings if the items are distinct."
    },
    {
      title: "Multi-Bundle Challenge",
      purpose: "When two bundles must each be adjacent, multiply each bundle's internal orderings by the arrangement of the bundles plus loose items.",
      classicId: "bundling-multi-restriction",
      kind: "challenge",
      durationMs: 13000,
      caption: "Two bundles? Multiply: bundles' internal orderings times the rest.",
      voiceover: "Now add a second bundle. Seven students stand in a row, A B C must be together, and D E must be together. Glue both groups. We now arrange five units, then multiply by the three factorial for the A B C bundle and the two factorial for the D E bundle. That gives one thousand four hundred and forty arrangements."
    }
  ];

  // ---- shared helpers -------------------------------------------------------

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

  function factorial(n) {
    if (n < 0) return NaN;
    let acc = 1;
    for (let i = 2; i <= n; i += 1) acc *= i;
    return acc;
  }

  function rotateChoice(choices, correct, variantIndex) {
    const unique = [...new Set(choices.map(String))];
    const without = unique.filter((choice) => choice !== String(correct));
    const ordered = [String(correct), ...without].slice(0, 4);
    while (ordered.length < 4) {
      const filler = String(Number(correct) + ordered.length + 7);
      if (!ordered.includes(filler)) ordered.push(filler);
    }
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

  function digitSetText(digits) {
    return `{${digits.join(", ")}}`;
  }

  // ---- C1: digits-with-repeats (digit set has no zero) ---------------------
  // Answer = s^n where s = digit set size and n = number of positions.
  function digitsWithRepeatsProblem(variantIndex) {
    const cases = [
      { digits: [1, 2, 3, 4], n: 2 },       // 4^2 = 16
      { digits: [1, 3, 5, 7, 9], n: 3 },    // 5^3 = 125
      { digits: [2, 4, 6, 8], n: 3 },       // 4^3 = 64
      { digits: [1, 2, 3, 5, 7, 9], n: 2 }  // 6^2 = 36
    ];
    const data = cases[variantIndex % cases.length];
    const s = data.digits.length;
    const answer = Math.pow(s, data.n);
    const p = problemBase("digits-with-repeats", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Using the digits ${digitSetText(data.digits)}, how many ${data.n}-digit numbers can be made if digits can be repeated?`;
    p.expected = answer;
    p.expectedDisplay = `${answer}`;
    p.correctInput = p.answerType === "choice" ? { choice: String(answer) } : { value: String(answer) };
    p.choices = p.answerType === "choice"
      ? rotateChoice([answer, s * data.n, Math.pow(s, data.n - 1) * (s - 1), answer + s], answer, variantIndex)
      : [];
    p.hint1 = `Each of the ${data.n} positions can be any of the ${s} digits. So the count is ${s} × ${s}${data.n >= 3 ? ` × ${s}` : ""}${data.n >= 4 ? ` × ${s}` : ""}.`;
    p.hint2 = `Compute ${s}^${data.n} = ${answer}.`;
    p.solution = `Each position has ${s} choices and repeats are allowed. So the count is ${s}^${data.n} = ${answer}.`;
    p.visual = {
      type: "digitSlots",
      digits: data.digits,
      slots: Array.from({ length: data.n }, () => ({ count: s, mode: "any" })),
      result: answer,
      caption: `${s}${" × " + s}${data.n >= 3 ? " × " + s : ""}${data.n >= 4 ? " × " + s : ""} = ${answer}`
    };
    return p;
  }

  // ---- C2: zero-leading-constraint ------------------------------------------
  // Set INCLUDES zero. Leading position: (s-1). Others: s. Answer = (s-1)*s^(n-1).
  function zeroLeadingProblem(variantIndex) {
    const cases = [
      { digits: [0, 1, 2, 3], n: 2 },          // 3*4 = 12 (source canonical)
      { digits: [0, 1, 2, 3, 4], n: 3 },       // 4*25 = 100
      { digits: [0, 2, 4, 6, 8], n: 2 },       // 4*5 = 20
      { digits: [0, 1, 2, 3, 4, 5], n: 3 }     // 5*36 = 180
    ];
    const data = cases[variantIndex % cases.length];
    const s = data.digits.length;
    const answer = (s - 1) * Math.pow(s, data.n - 1);
    const p = problemBase("zero-leading-constraint", variantIndex, variantIndex % 2 ? "filled" : "choice");
    p.prompt = `Using the digits ${digitSetText(data.digits)}, how many ${data.n}-digit numbers can be made if digits can be repeated?`;
    p.expected = answer;
    p.expectedDisplay = `${answer}`;
    p.correctInput = p.answerType === "choice" ? { choice: String(answer) } : { value: String(answer) };
    p.choices = p.answerType === "choice"
      ? rotateChoice([answer, Math.pow(s, data.n), (s - 1) * data.n, answer + (s - 1)], answer, variantIndex)
      : [];
    p.hint1 = `The leading digit cannot be 0, so it has ${s - 1} choices. The other ${data.n - 1} position${data.n - 1 === 1 ? "" : "s"} can be any of the ${s} digits.`;
    p.hint2 = `Compute ${s - 1} × ${s}${data.n >= 3 ? ` × ${s}` : ""}${data.n >= 4 ? ` × ${s}` : ""} = ${answer}.`;
    p.solution = `Leading position has ${s - 1} choices (no zero). Each of the other ${data.n - 1} position${data.n - 1 === 1 ? "" : "s"} has ${s} choices. Total = ${s - 1} × ${s}^${data.n - 1} = ${answer}.`;
    p.visual = {
      type: "digitSlots",
      digits: data.digits,
      slots: [{ count: s - 1, mode: "no-zero" }].concat(
        Array.from({ length: data.n - 1 }, () => ({ count: s, mode: "any" }))
      ),
      result: answer,
      caption: `${s - 1}${Array.from({ length: data.n - 1 }, () => " × " + s).join("")} = ${answer}`
    };
    return p;
  }

  // ---- C3: no-repeat-distinct-digits ----------------------------------------
  // Set may or may not contain zero. Each position can't reuse a placed digit.
  // No zero in set: s × (s-1) × (s-2) × ...
  // With zero: leading (s-1) × any-of-remaining (s-1) × (s-2) × ...
  //   (leading takes s-1 because zero is excluded;
  //    then any of the remaining s-1 digits can fill next position, etc.)
  function noRepeatProblem(variantIndex) {
    const cases = [
      { digits: [0, 1, 2, 3], n: 2, hasZero: true },        // 3*3 = 9 (source canonical)
      { digits: [1, 2, 3, 4, 5], n: 3, hasZero: false },    // 5*4*3 = 60
      { digits: [0, 1, 2, 3, 4], n: 3, hasZero: true },     // 4*4*3 = 48
      { digits: [1, 2, 3, 4, 5, 6], n: 4, hasZero: false }  // 6*5*4*3 = 360
    ];
    const data = cases[variantIndex % cases.length];
    const s = data.digits.length;

    let answer;
    let slotCounts;
    if (data.hasZero) {
      // Leading position: (s-1). Remaining: each successive position has one fewer.
      slotCounts = [s - 1];
      for (let i = 1; i < data.n; i += 1) slotCounts.push(s - i);
      answer = slotCounts.reduce((a, b) => a * b, 1);
    } else {
      slotCounts = [];
      for (let i = 0; i < data.n; i += 1) slotCounts.push(s - i);
      answer = slotCounts.reduce((a, b) => a * b, 1);
    }
    const p = problemBase("no-repeat-distinct-digits", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Using the digits ${digitSetText(data.digits)}, how many ${data.n}-digit numbers can be made if no digit is repeated?`;
    p.expected = answer;
    p.expectedDisplay = `${answer}`;
    p.correctInput = p.answerType === "choice" ? { choice: String(answer) } : { value: String(answer) };
    p.choices = p.answerType === "choice"
      ? rotateChoice([answer, answer + s, Math.pow(s, data.n) - answer, answer - 1], answer, variantIndex)
      : [];
    if (data.hasZero) {
      p.hint1 = `Leading digit: ${s - 1} choices (no zero). Then each next position drops by one because no digit can repeat.`;
      p.hint2 = `Compute ${slotCounts.join(" × ")} = ${answer}.`;
      p.solution = `Leading position has ${s - 1} choices (no zero). After placing it, the remaining digits cannot repeat, so the next position has ${s - 1} choices${data.n >= 3 ? `, then ${s - 2}` : ""}${data.n >= 4 ? `, then ${s - 3}` : ""}. Total = ${slotCounts.join(" × ")} = ${answer}.`;
    } else {
      p.hint1 = `Every digit is non-zero, so the leading slot can be any of ${s}. Each later position has one fewer choice (no repeats).`;
      p.hint2 = `Compute ${slotCounts.join(" × ")} = ${answer}.`;
      p.solution = `No zero is in the set, so the leading position has ${s} choices. Each later position loses one option because digits cannot repeat. Total = ${slotCounts.join(" × ")} = ${answer}.`;
    }
    p.visual = {
      type: "digitSlots",
      digits: data.digits,
      slots: slotCounts.map((count, i) => ({
        count,
        mode: data.hasZero && i === 0 ? "no-zero" : "any"
      })),
      result: answer,
      caption: `${slotCounts.join(" × ")} = ${answer}`
    };
    return p;
  }

  // ---- C4: odd-by-last-digit-repeats (repeats allowed, set has no zero) ----
  // Last must be odd: fix it first to (#odd digits in set). Other positions
  // are unrestricted with repeats so they are (s) each.
  // We keep the digit set zero-free here to keep this warmup clean.
  function oddRepeatsProblem(variantIndex) {
    const cases = [
      { digits: [1, 5, 6, 7, 8], n: 3, target: "odd" },     // 3 odd × 5 × 5 = 75 (matches source check)
      { digits: [1, 2, 3, 4, 5], n: 3, target: "odd" },     // 3 odd × 5 × 5 = 75
      { digits: [2, 4, 5, 6, 8], n: 2, target: "even" },    // 4 even × 5 = 20
      { digits: [1, 3, 5, 7, 9], n: 3, target: "odd" }      // 5 odd × 5 × 5 = 125
    ];
    const data = cases[variantIndex % cases.length];
    const s = data.digits.length;
    const lastSet = data.digits.filter((d) => (data.target === "odd" ? d % 2 === 1 : d % 2 === 0));
    const lastCount = lastSet.length;
    const otherChoices = s;
    const answer = lastCount * Math.pow(otherChoices, data.n - 1);
    const p = problemBase("odd-by-last-digit-repeats", variantIndex, variantIndex % 2 ? "filled" : "choice");
    p.prompt = `Using the digits ${digitSetText(data.digits)}, how many ${data.n}-digit ${data.target} numbers can be made if digits can be repeated?`;
    p.expected = answer;
    p.expectedDisplay = `${answer}`;
    p.correctInput = p.answerType === "choice" ? { choice: String(answer) } : { value: String(answer) };
    p.choices = p.answerType === "choice"
      ? rotateChoice([answer, Math.pow(s, data.n), s * (data.n - 1), answer + lastCount], answer, variantIndex)
      : [];
    p.hint1 = `Fix the last position FIRST: it must be ${data.target}, so it has ${lastCount} choice${lastCount === 1 ? "" : "s"} (the ${data.target} digits ${digitSetText(lastSet)}).`;
    p.hint2 = `Each of the other ${data.n - 1} position${data.n - 1 === 1 ? "" : "s"} has ${otherChoices} choices. Multiply: ${lastCount} × ${otherChoices}^${data.n - 1} = ${answer}.`;
    p.solution = `${data.target.charAt(0).toUpperCase() + data.target.slice(1)} numbers depend on the LAST digit. The ${data.target} digits in the set are ${digitSetText(lastSet)}, giving ${lastCount} choices for the last position. Each of the other ${data.n - 1} position${data.n - 1 === 1 ? "" : "s"} can be any of the ${otherChoices} digits. Total = ${lastCount} × ${otherChoices}${data.n >= 3 ? ` × ${otherChoices}` : ""} = ${answer}.`;
    const slots = Array.from({ length: data.n - 1 }, () => ({ count: otherChoices, mode: "any" }));
    slots.push({ count: lastCount, mode: data.target });
    p.visual = {
      type: "digitSlots",
      digits: data.digits,
      slots,
      result: answer,
      caption: `${slots.map((sl) => sl.count).join(" × ")} = ${answer}`,
      highlightLast: true
    };
    return p;
  }

  // ---- C5: odd-or-even-no-repeats (Pip's mistake canonical) ---------------
  // Digit set INCLUDES 0. No repeats. Number must be odd or even.
  // Canonical (Pip's): digits {0..5}, 3-digit ODD, no repeats.
  //   Last must be odd: 3 choices (1, 3, 5)
  //   Leading must be non-zero AND not equal to the last digit: 4 choices (digits left, minus zero)
  //   Middle: any of the remaining 4 digits (six minus the two already placed)
  //   Total: 3 * 4 * 4 = 48
  // (Pip wrongly said 5*5*3 = 75 — that's what we contrast in the intro/hint.)
  //
  // For even with zero in the set, we case-split:
  //   Case A: last digit is 0 -> leading has (s-1) choices, middle has (s-2) choices.
  //   Case B: last digit is a non-zero even -> for each such choice:
  //     leading is non-zero AND != last: (s - 2) choices
  //     middle: (s - 2) remaining choices
  //   Aggregate.
  function oddEvenNoRepeatProblem(variantIndex) {
    const cases = [
      { digits: [0, 1, 2, 3, 4, 5], n: 3, target: "odd" },   // canonical Pip = 48
      { digits: [0, 1, 2, 3, 4, 5], n: 3, target: "even" },  // case-split: see below
      { digits: [0, 1, 2, 3, 4], n: 3, target: "odd" },      // 2 odd (1,3) × 3 (leading non-zero non-last) × 3 (middle) = 18
      { digits: [0, 1, 2, 3, 4, 5], n: 4, target: "odd" }    // 3 × 4 × 4 × 3 = 144
    ];
    const data = cases[variantIndex % cases.length];
    const s = data.digits.length;
    const nonZeroDigits = data.digits.filter((d) => d !== 0);
    const targetIsOdd = data.target === "odd";
    let answer;
    let solutionLines = [];
    let slotPlan;
    if (targetIsOdd) {
      // Last is odd & non-zero. Leading non-zero & != last. Middle: any remaining.
      const lastSet = data.digits.filter((d) => d % 2 === 1);
      const lastCount = lastSet.length;
      // After placing last (an odd non-zero), leading has (s - 1) digits left,
      // but must also exclude zero. So leading = (s - 1) - 1 = (s - 2). Each
      // middle position has (s - 2) choices, (s - 3), ...
      const leadCount = s - 2;
      const middleCounts = [];
      for (let i = 1; i < data.n - 1; i += 1) middleCounts.push(s - 1 - i);
      const productMiddle = middleCounts.reduce((a, b) => a * b, 1);
      answer = lastCount * leadCount * productMiddle;
      solutionLines.push(`Fix the LAST digit first: it must be odd. The odd digits in ${digitSetText(data.digits)} are ${digitSetText(lastSet)} (${lastCount} choices).`);
      solutionLines.push(`Leading digit: cannot be zero and cannot equal the last digit. That leaves ${leadCount} choices.`);
      if (data.n >= 3) {
        const middleDescr = middleCounts.map((c, i) => `${data.n === 3 ? "middle" : `middle position ${i + 1}`}: ${c} choices`).join("; ");
        solutionLines.push(`Other positions (no repeats): ${middleDescr}.`);
      }
      solutionLines.push(`Total = ${lastCount} × ${leadCount}${data.n >= 3 ? ` × ${middleCounts.join(" × ")}` : ""} = ${answer}.`);
      slotPlan = { lead: leadCount, middles: middleCounts, last: lastCount, lastSet, mode: "odd" };
    } else {
      // EVEN with zero present. Case-split.
      const nonZeroEven = data.digits.filter((d) => d !== 0 && d % 2 === 0);
      // Case A: last = 0
      // Leading: (s - 1) (any non-zero, since 0 is already placed) -- actually
      // any of the remaining s-1 digits except 0 itself. Since 0 IS the last,
      // leading just picks from the (s-1) remaining non-zero digits = (s-1).
      const caseA_lead = s - 1;
      const caseA_middles = [];
      for (let i = 1; i < data.n - 1; i += 1) caseA_middles.push(s - 1 - i);
      const caseA = caseA_lead * caseA_middles.reduce((a, b) => a * b, 1);
      // Case B: last = some non-zero even (nonZeroEven.length choices)
      // Leading: cannot be zero, cannot be last → (s - 2) choices.
      // Other positions: each drops by one more.
      const caseB_lead = s - 2;
      const caseB_middles = [];
      for (let i = 1; i < data.n - 1; i += 1) caseB_middles.push(s - 1 - i);
      const caseB = nonZeroEven.length * caseB_lead * caseB_middles.reduce((a, b) => a * b, 1);
      answer = caseA + caseB;
      solutionLines.push(`Even numbers end in 0, 2, 4, 6, or 8. Case-split on the last digit because the leading-digit-not-zero rule changes.`);
      solutionLines.push(`Case A — last = 0: leading has ${caseA_lead} choices (any non-zero), middle has ${caseA_middles.join(" × ") || "no other"} choices. Subtotal = ${caseA}.`);
      solutionLines.push(`Case B — last = non-zero even (${nonZeroEven.length} choices): leading has ${caseB_lead} choices, middle has ${caseB_middles.join(" × ") || "no other"} choices. Subtotal = ${caseB}.`);
      solutionLines.push(`Total = ${caseA} + ${caseB} = ${answer}.`);
      slotPlan = {
        lead: `${caseA_lead} or ${caseB_lead}`,
        middles: caseA_middles,
        last: `0 or ${nonZeroEven.length}`,
        mode: "even-case-split"
      };
    }
    const p = problemBase("odd-or-even-no-repeats", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `Using the digits ${digitSetText(data.digits)}, how many ${data.n}-digit ${data.target} numbers can be made if no digit is repeated?`;
    p.expected = answer;
    p.expectedDisplay = `${answer}`;
    p.correctInput = p.answerType === "choice" ? { choice: String(answer) } : { value: String(answer) };
    // Distractor: the "Pip mistake" naive answer. For the canonical case it's 75.
    const pipNaive = targetIsOdd
      ? data.digits.filter((d) => d % 2 === 1).length * Math.pow(s - 1, data.n - 1)
      : data.digits.filter((d) => d % 2 === 0).length * Math.pow(s - 1, data.n - 1);
    p.choices = p.answerType === "choice"
      ? rotateChoice([answer, pipNaive, answer + 10, Math.max(1, answer - 5)], answer, variantIndex)
      : [];
    p.hint1 = targetIsOdd
      ? `Watch out for Pip's mistake: he wrote 5 × 5 × 3 = 75 without checking that the leading digit can't be zero.`
      : `Even numbers end in 0, 2, 4, ... When 0 IS available as a last digit, the leading-digit-not-zero rule no longer overlaps. Case-split.`;
    p.hint2 = targetIsOdd
      ? `Fix the last (odd) first: ${data.digits.filter((d) => d % 2 === 1).length} choices. Then the leading digit must avoid zero AND the last digit.`
      : `Case A: last = 0. Case B: last = a non-zero even. Sum the case totals.`;
    p.solution = solutionLines.join(" ");
    // Visual: same shape as C3/C4 but with a "case split" caption when needed.
    p.visual = {
      type: "digitSlots",
      digits: data.digits,
      slots: targetIsOdd
        ? (function () {
            const slots = [];
            slots.push({ count: slotPlan.lead, mode: "no-zero-no-last" });
            for (const m of slotPlan.middles) slots.push({ count: m, mode: "any" });
            slots.push({ count: slotPlan.last, mode: "odd" });
            return slots;
          })()
        : [
            { count: `${s - 1}/${s - 2}`, mode: "case-split" },
            ...Array.from({ length: data.n - 2 }, () => ({ count: s - 2, mode: "any" })),
            { count: `0/${nonZeroDigits.filter((d) => d % 2 === 0).length}`, mode: "even-case-split" }
          ],
      result: answer,
      caption: targetIsOdd
        ? `${slotPlan.last} × ${slotPlan.lead}${slotPlan.middles.length ? " × " + slotPlan.middles.join(" × ") : ""} = ${answer}`
        : `case A + case B = ${answer}`,
      highlightLast: true
    };
    return p;
  }

  // ---- C6: bundling-adjacent (single bundle) -------------------------------
  // Items in a line, one pair must be adjacent. For distinct items: (n-1)! * 2.
  // For the APPLE case: n=5 letters, but two are identical P's, so we glue the
  // two Ps and only multiply once. Effective n=4 → 4! = 24.
  function bundlingAdjacentProblem(variantIndex) {
    const cases = [
      { kind: "letters", item: "APPLE", letters: ["A", "P", "P", "L", "E"], pair: ["P", "P"], pairDistinct: false }, // 4! = 24
      { kind: "people", names: ["Pip", "Bud", "Sam", "Lia", "Tom"], pair: ["Pip", "Bud"], pairDistinct: true },       // 4! * 2 = 48
      { kind: "letters", item: "PEACH", letters: ["P", "E", "A", "C", "H"], pair: ["E", "A"], pairDistinct: true },   // 4! * 2 = 48
      { kind: "people", names: ["Ana", "Bo", "Cy", "Di", "Em", "Fi"], pair: ["Ana", "Bo"], pairDistinct: true }       // 5! * 2 = 240
    ];
    const data = cases[variantIndex % cases.length];
    const items = data.kind === "letters" ? data.letters : data.names;
    const n = items.length;
    const effectiveN = n - 1; // bundle counts as one unit
    const pairOrderings = data.pairDistinct ? 2 : 1;
    const answer = factorial(effectiveN) * pairOrderings;
    const p = problemBase("bundling-adjacent", variantIndex, variantIndex % 2 ? "choice" : "filled");
    if (data.kind === "letters") {
      p.prompt = `How many ways can the letters of "${data.item}" be arranged in a row if the two ${data.pair.join(" and ")}${data.pairDistinct ? "" : "s"} must be adjacent?`;
    } else {
      p.prompt = `${data.names.join(", ")} line up for a photo. How many arrangements are possible if ${data.pair[0]} and ${data.pair[1]} must stand next to each other?`;
    }
    p.expected = answer;
    p.expectedDisplay = `${answer}`;
    p.correctInput = p.answerType === "choice" ? { choice: String(answer) } : { value: String(answer) };
    p.choices = p.answerType === "choice"
      ? rotateChoice([answer, factorial(n), factorial(n - 1), answer + factorial(n - 2)], answer, variantIndex)
      : [];
    p.hint1 = `Glue ${data.pair.join(" and ")} into ONE bundle. Now you are arranging ${effectiveN} units instead of ${n}.`;
    p.hint2 = data.pairDistinct
      ? `That gives ${effectiveN}! = ${factorial(effectiveN)} arrangements of the units, then multiply by 2 because ${data.pair[0]}-${data.pair[1]} and ${data.pair[1]}-${data.pair[0]} are different. Total = ${factorial(effectiveN)} × 2 = ${answer}.`
      : `That gives ${effectiveN}! = ${factorial(effectiveN)} arrangements. The two ${data.pair[0]}s are identical so we do NOT multiply by 2. Answer = ${answer}.`;
    p.solution = `Bundling method. Glue ${data.pair.join(" and ")} as one unit. Effective items: ${effectiveN}. Arrangements: ${effectiveN}! = ${factorial(effectiveN)}.${data.pairDistinct ? ` Multiply by 2 for the bundle's internal order. Total = ${answer}.` : ` The two ${data.pair[0]}s are identical, so no internal multiplier. Total = ${answer}.`}`;
    p.visual = {
      type: "bundleLine",
      items,
      bundle: data.pair,
      bundleDistinct: data.pairDistinct,
      result: answer,
      caption: `${effectiveN}! ${data.pairDistinct ? "× 2 " : ""}= ${answer}`
    };
    return p;
  }

  // ---- C7: bundling-multi-restriction (challenge) --------------------------
  // n items, two disjoint adjacency bundles. Each bundle becomes ONE unit.
  // Effective items = n - (sum of bundle sizes) + (number of bundles).
  // Answer = (effective)! × ∏ (bundle size)! across bundles.
  function bundlingMultiProblem(variantIndex) {
    const cases = [
      // canonical (source p39 challenge): 7 students with {A,B,C} together + {D,E} together → effective 4 units → 4! * 3! * 2! = 288
      { total: 7, bundleSizes: [3, 2], story: "students-row" },
      { total: 8, bundleSizes: [3, 2], story: "students-row" },   // effective 5 → 5! * 3! * 2! = 1440
      { total: 6, bundleSizes: [2, 2], story: "students-row" },   // effective 4 → 4! * 2! * 2! = 96
      { total: 6, bundleSizes: [3, 2], story: "students-row" }    // effective 3 → 3! * 3! * 2! = 72
    ];
    const data = cases[variantIndex % cases.length];
    const bundleSizesSum = data.bundleSizes.reduce((a, b) => a + b, 0);
    const effective = data.total - bundleSizesSum + data.bundleSizes.length;
    const bundleProduct = data.bundleSizes.reduce((a, b) => a * factorial(b), 1);
    const answer = factorial(effective) * bundleProduct;
    const p = problemBase("bundling-multi-restriction", variantIndex, variantIndex % 2 ? "filled" : "choice");
    const namesPool = ["Ana", "Bo", "Cy", "Di", "Em", "Fi", "Gi", "Ha"];
    const bundleA = namesPool.slice(0, data.bundleSizes[0]);
    const bundleB = namesPool.slice(data.bundleSizes[0], data.bundleSizes[0] + data.bundleSizes[1]);
    p.prompt = `${data.total} students line up in a row. ${bundleA.join(", ")} must stand together (in any order), and ${bundleB.join(", ")} must also stand together (in any order). How many arrangements are possible?`;
    p.expected = answer;
    p.expectedDisplay = `${answer}`;
    p.correctInput = p.answerType === "choice" ? { choice: String(answer) } : { value: String(answer) };
    p.choices = p.answerType === "choice"
      ? rotateChoice([answer, factorial(data.total), factorial(effective), answer + bundleProduct], answer, variantIndex)
      : [];
    p.hint1 = `Glue ${bundleA.join("/")} into bundle A and ${bundleB.join("/")} into bundle B. Effective number of units in the row: ${data.total} − ${bundleSizesSum} + ${data.bundleSizes.length} = ${effective}.`;
    p.hint2 = `Arrangements of ${effective} units: ${effective}! = ${factorial(effective)}. Multiply by ${data.bundleSizes[0]}! for bundle A's internal order and by ${data.bundleSizes[1]}! for bundle B. Total = ${factorial(effective)} × ${factorial(data.bundleSizes[0])} × ${factorial(data.bundleSizes[1])} = ${answer}.`;
    p.solution = `Bundling method with two bundles. Effective units in the row: ${effective}. That gives ${effective}! = ${factorial(effective)} arrangements. Multiply by ${data.bundleSizes[0]}! = ${factorial(data.bundleSizes[0])} (bundle A internal order) and ${data.bundleSizes[1]}! = ${factorial(data.bundleSizes[1])} (bundle B internal order). Total = ${factorial(effective)} × ${factorial(data.bundleSizes[0])} × ${factorial(data.bundleSizes[1])} = ${answer}.`;
    p.visual = {
      type: "bundleLine",
      items: namesPool.slice(0, data.total),
      bundle: bundleA,
      bundle2: bundleB,
      bundleDistinct: true,
      result: answer,
      caption: `${effective}! × ${data.bundleSizes[0]}! × ${data.bundleSizes[1]}! = ${answer}`
    };
    return p;
  }

  // ---- dispatcher -----------------------------------------------------------

  function generateProblem(classicId, variantIndex = 0) {
    const generators = {
      "digits-with-repeats": digitsWithRepeatsProblem,
      "zero-leading-constraint": zeroLeadingProblem,
      "no-repeat-distinct-digits": noRepeatProblem,
      "odd-by-last-digit-repeats": oddRepeatsProblem,
      "odd-or-even-no-repeats": oddEvenNoRepeatProblem,
      "bundling-adjacent": bundlingAdjacentProblem,
      "bundling-multi-restriction": bundlingMultiProblem
    };
    const gen = generators[classicId];
    if (!gen) return null;
    const problem = gen(variantIndex);
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

  // ---- visuals --------------------------------------------------------------
  // Two diagram families:
  //   digitSlots — boxes for each digit position with the digit-set above
  //                (C1-C5)
  //   bundleLine — items in a row with a bracket/ring around the bundle(s)
  //                (C6, C7)
  // Both use the same 560x330 viewBox.

  function svgShell(inner, ariaLabel) {
    return `<svg viewBox="0 0 560 330" role="img" aria-label="${ariaLabel}">${inner}</svg>`;
  }

  function digitSlotsSvg(v, isRevealed, answerText) {
    const slots = v.slots || [];
    const slotsCount = slots.length;
    const slotWidth = 70;
    const slotGap = 30;
    const totalWidth = slotsCount * slotWidth + (slotsCount - 1) * slotGap;
    const startX = Math.max(20, (560 - totalWidth) / 2);
    const slotY = 170;

    // digit set legend at top
    const digitSet = (v.digits || []).join(", ");
    const legend = `<rect x="40" y="40" width="480" height="50" rx="10" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>` +
      `<text x="280" y="72" text-anchor="middle" class="formula-note">digits: { ${escapeHtml(digitSet)} }</text>`;

    // slots
    const slotEls = [];
    for (let i = 0; i < slotsCount; i += 1) {
      const x = startX + i * (slotWidth + slotGap);
      const isLast = i === slotsCount - 1;
      const isFirst = i === 0;
      const slot = slots[i];
      const fill = (v.highlightLast && isLast) ? "#fff1d2" :
                   (slot.mode === "no-zero" || slot.mode === "no-zero-no-last") ? "#ffe6e0" :
                   (slot.mode === "odd" || slot.mode === "even" || slot.mode === "case-split" || slot.mode === "even-case-split") ? "#fff1d2" :
                   "#fff8dc";
      slotEls.push(
        `<rect x="${x}" y="${slotY}" width="${slotWidth}" height="${slotWidth}" rx="10" fill="${fill}" stroke="#16345d" stroke-width="3"/>` +
        `<text x="${x + slotWidth / 2}" y="${slotY + slotWidth / 2 + 6}" text-anchor="middle" class="formula-note">${escapeHtml(String(slot.count))}</text>`
      );
      // position label below
      const posLabel = isFirst ? "leading" : isLast ? "last" : "middle";
      slotEls.push(
        `<text x="${x + slotWidth / 2}" y="${slotY + slotWidth + 22}" text-anchor="middle" class="side-label">${escapeHtml(posLabel)}</text>`
      );
      // multiplication × between slots
      if (i < slotsCount - 1) {
        const midX = x + slotWidth + slotGap / 2;
        slotEls.push(`<text x="${midX}" y="${slotY + slotWidth / 2 + 6}" text-anchor="middle" class="formula-note">×</text>`);
      }
    }

    const captionY = 285;
    const captionEl = `<text x="280" y="${captionY}" text-anchor="middle" class="formula-note">${escapeHtml(v.caption || "")}</text>`;

    return legend + slotEls.join("") + captionEl + answerText;
  }

  function bundleLineSvg(v, isRevealed, answerText) {
    const items = v.items || [];
    const itemCount = items.length;
    const boxWidth = Math.min(60, Math.floor(480 / Math.max(itemCount, 1)));
    const boxGap = 8;
    const totalWidth = itemCount * boxWidth + (itemCount - 1) * boxGap;
    const startX = Math.max(20, (560 - totalWidth) / 2);
    const rowY = 165;
    const boxHeight = 60;

    const bundle = v.bundle || [];
    const bundle2 = v.bundle2 || [];
    const bundleIndices = bundle.map((b) => items.indexOf(b)).filter((i) => i >= 0);
    const bundle2Indices = bundle2.map((b) => items.indexOf(b)).filter((i) => i >= 0);

    const boxes = [];
    for (let i = 0; i < itemCount; i += 1) {
      const x = startX + i * (boxWidth + boxGap);
      const inBundle1 = bundleIndices.includes(i);
      const inBundle2 = bundle2Indices.includes(i);
      const fill = inBundle1 ? "#ffe6e0" : inBundle2 ? "#e0f0ff" : "#fff8dc";
      boxes.push(
        `<rect x="${x}" y="${rowY}" width="${boxWidth}" height="${boxHeight}" rx="10" fill="${fill}" stroke="#16345d" stroke-width="3"/>` +
        `<text x="${x + boxWidth / 2}" y="${rowY + boxHeight / 2 + 6}" text-anchor="middle" class="formula-note">${escapeHtml(items[i])}</text>`
      );
    }

    // Bundle brackets
    function bracket(indices, colour, label) {
      if (indices.length < 2) return "";
      const minIdx = Math.min(...indices);
      const maxIdx = Math.max(...indices);
      const left = startX + minIdx * (boxWidth + boxGap) - 4;
      const right = startX + maxIdx * (boxWidth + boxGap) + boxWidth + 4;
      const top = rowY - 12;
      const labelX = (left + right) / 2;
      return `<path d="M ${left} ${rowY + boxHeight + 18} L ${left} ${top} L ${right} ${top} L ${right} ${rowY + boxHeight + 18}" fill="none" stroke="${colour}" stroke-width="3"/>` +
        `<text x="${labelX}" y="${top - 8}" text-anchor="middle" class="side-label">${escapeHtml(label)}</text>`;
    }

    const heading = `<text x="280" y="50" text-anchor="middle" class="formula-note">${isRevealed ? "Bundled arrangement" : "Bundle the adjacent items"}</text>`;
    const bundlesSvg = bracket(bundleIndices, "#cc4f2c", "bundle A") + bracket(bundle2Indices, "#1790a6", "bundle B");
    const captionEl = `<text x="280" y="290" text-anchor="middle" class="formula-note">${escapeHtml(v.caption || "")}</text>`;

    return heading + bundlesSvg + boxes.join("") + captionEl + answerText;
  }

  function renderProblemVisual(problem, state = "initial") {
    const v = problem.visual || {};
    const isRevealed = state === "solution" || state === "worked";
    const answerText = isRevealed
      ? `<text x="280" y="318" text-anchor="middle" class="formula-note">Answer: ${escapeHtml(problem.expectedDisplay)}</text>`
      : "";
    let html;
    let text;
    if (v.type === "digitSlots") {
      html = svgShell(digitSlotsSvg(v, isRevealed, answerText), "Digit position counting visual");
      text = "Each box shows the number of choices for that position. Multiply across the row to get the count.";
    } else if (v.type === "bundleLine") {
      html = svgShell(bundleLineSvg(v, isRevealed, answerText), "Bundle arrangement visual");
      text = "Items in a line. Brackets ring the items that must stand together as one bundle.";
    } else {
      html = svgShell(`<rect x="60" y="60" width="440" height="200" fill="#fff8dc" stroke="#16345d" stroke-width="4"/><text x="280" y="170" text-anchor="middle" class="formula-note">Counting puzzle</text>${answerText}`, "Counting puzzle placeholder");
      text = "Counting puzzle placeholder.";
    }
    return { html, text };
  }

  function renderIntroScene(index) {
    const scene = INTRO_SCENES[index % INTRO_SCENES.length];
    const classicId = scene.classicId || CLASSIC_IDS[index % CLASSIC_IDS.length];
    const fakeProblem = generateProblem(classicId, index);
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
    factorial,
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

  root.AdditionMultiplication2Module = api;

  // ---- runtime (browser only) ---------------------------------------------
  // Mirrors the intro player + practice loop used by algebraic_word_puzzles.
  // Reads INTRO_SCENES (no per-scene audio files — fallback to SpeechSynthesis).

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
      : "<div><strong>Clean round.</strong><br>You used position-by-position counting, the leading-zero rule, no-repeat decrements, odd/even via the last digit, and the bundling method.</div>";
  }

  function freshRound() {
    state.roundOffset += ROUND_LENGTH;
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
    $("similar-button").addEventListener("click", () => { state.round[state.current] = generateProblem(currentProblem().classicId, currentProblem().variantIndex + ROUND_LENGTH); renderProblem(); });
    $("fresh-round-button").addEventListener("click", freshRound);
    $("review-intro-button").addEventListener("click", showIntro);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
