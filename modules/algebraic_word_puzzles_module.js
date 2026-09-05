// Algebraic Word Puzzles module — Lesson 8 Extensive Challenges (Optional).
// Source: PDF p154 / Book p144. Two source classics (hat counting,
// four-people pair sums) are ladder-built with four warm-up classics so
// 11-year-olds can climb to the original challenge problems.
(function (root) {
  "use strict";

  const ROUND_LENGTH = 6;
  const INTRO_SCENE_MS = 9500;

  // Six classics scaffold from easier to harder. C1..C4 cover the
  // hat-counting family (self-exclusion + system of equations); C5..C6
  // cover the pair-sums family. Source pages stay identical because every
  // classic is anchored in the same Extensive Challenges box.
  const CLASSICS = [
    {
      id: "two-group-difference",
      nickname: "Two-Group Warmup",
      skill: "Use a single 'I see' statement and the self-exclusion (n-1) trick to find a missing count.",
      sourcePages: "Book 144 / PDF 154 (Lesson 8 Extensive Challenges Optional, warmup)",
      // Each variant has a different group total n, so the count of stick-figure
      // glyphs in the row legitimately changes — that count IS the lesson.
      variantStability: false
    },
    {
      id: "three-group-ratio",
      nickname: "Three-Group Ratio",
      skill: "Use one 'twice as many' or 'half as many' statement to find a missing count from a stated total.",
      sourcePages: "Book 144 / PDF 154 (Lesson 8 Extensive Challenges Optional, warmup)",
      // Variants change the ratio multiplier and known count, so the number of
      // stick figures drawn in each row varies by design.
      variantStability: false
    },
    {
      id: "hat-system-2-statement",
      nickname: "Hat System (2 statements)",
      skill: "Combine two self-exclusion statements into a system of two equations in two unknowns.",
      sourcePages: "Book 144 / PDF 154 (Lesson 8 Extensive Challenges Optional, medium step)"
    },
    {
      id: "hat-system-3-statement",
      nickname: "Hat System (3 statements)",
      skill: "Combine three self-exclusion statements into a system of three equations and solve for every count.",
      sourcePages: "Book 144 / PDF 154 (Lesson 8 Extensive Challenges Optional, source challenge 1)"
    },
    {
      id: "three-people-pair-sums",
      nickname: "Three-People Pair Sums",
      skill: "Use pair-sum decomposition: sum of all three pair sums equals 2 times the total weight.",
      sourcePages: "Book 144 / PDF 154 (Lesson 8 Extensive Challenges Optional, warmup)"
    },
    {
      id: "four-people-five-sums",
      nickname: "Four-People Missing Pair",
      skill: "Find the missing pair sum from 5 of 6 weights (3S - total) and report the heavier of the missing pair.",
      sourcePages: "Book 144 / PDF 154 (Lesson 8 Extensive Challenges Optional, source challenge 2)",
      // Variants intentionally change which pair is missing across the
      // sorted list; the skeleton stays four-people-with-weighed-lines
      // but which lines are drawn varies — that IS the lesson.
      variantStability: false
    }
  ];

  const CLASSIC_IDS = CLASSICS.map((classic) => classic.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((classic) => [classic.id, classic]));

  // Registry skill mapping. Five named skills cover the bank; each must
  // appear on >= 4 problems across all variants.
  // Registry skills:
  //   "Variable substitution"
  //   "Self-exclusion counting"
  //   "System of equations"
  //   "Pair-sum decomposition"
  //   "Missing-pair logic"
  const CLASSIC_SKILLS = {
    "two-group-difference": "Self-exclusion counting",
    "three-group-ratio": "Variable substitution",
    "hat-system-2-statement": "System of equations",
    "hat-system-3-statement": "System of equations",
    "three-people-pair-sums": "Pair-sum decomposition",
    "four-people-five-sums": "Missing-pair logic"
  };

  const SOURCE_COVERAGE = {
    "two-group-difference": ["Lesson 8 Extensive Challenges warmup: one-statement 'I see' problems"],
    "three-group-ratio": ["Lesson 8 Extensive Challenges warmup: 'twice as many' / ratio statements"],
    "hat-system-2-statement": ["Lesson 8 Extensive Challenges (source challenge 1, simplified to two statements)"],
    "hat-system-3-statement": ["Lesson 8 Extensive Challenges source challenge 1 (hat counting, three statements)"],
    "three-people-pair-sums": ["Lesson 8 Extensive Challenges warmup: pair-sum decomposition for three people"],
    "four-people-five-sums": ["Lesson 8 Extensive Challenges source challenge 2 (four people, five pair sums)"]
  };

  const INTRO_SCENES = [
    {
      title: "Self-Exclusion Counting",
      purpose: "Show that a speaker sees one less of their own kind, so a count must be reduced by 1 inside the statement.",
      classicId: "two-group-difference",
      kind: "warmup",
      durationMs: 11500,
      caption: "When a boy reports what he sees, he does not count himself. His own hat is invisible, so the boy total must drop by one inside that statement.",
      voiceover: "Start with the trick that makes every word puzzle on this page work. When somebody describes what they can see, they cannot see their own hat. So the count for their own group must be reduced by one inside that statement. Hold on to this idea while we build the rest."
    },
    {
      title: "Variable Substitution",
      purpose: "Introduce letters B, G, T for totals and replace 'twice as many' wording with an equation.",
      classicId: "three-group-ratio",
      kind: "warmup",
      durationMs: 11500,
      caption: "Let B be the number of boys, G the number of girls, T the number of teachers. Now every English statement becomes a short equation we can move around.",
      voiceover: "Now we name what we are looking for. Let capital B be the number of boys, capital G the number of girls, capital T the number of teachers. The English sentence twice as many girls as teachers becomes the short equation G equals two T. Variable substitution is the bridge from words to algebra."
    },
    {
      title: "System of Equations",
      purpose: "Combine two of the three statements into two equations and solve by substitution.",
      classicId: "hat-system-2-statement",
      kind: "medium",
      durationMs: 12500,
      caption: "Two statements give two equations. Substitute one into the other and the unknown drops out cleanly.",
      voiceover: "Take two of the three statements and turn each one into an equation. We now have a system of two equations in two unknowns. Substitute one equation into the other, and one variable disappears. The other variable falls out as a clean whole number."
    },
    {
      title: "Three-Statement System",
      purpose: "Walk through the full source problem: solve B, G, T from all three statements.",
      classicId: "hat-system-3-statement",
      kind: "core",
      durationMs: 13500,
      caption: "Three statements give three equations: B minus G equals a number, G equals two T plus one, B equals T plus a number. Substitute downwards until only T is left.",
      voiceover: "The original source problem is here. Each speaker gives one equation. The boy gives B minus G equals two. The girl gives G equals two T plus one. The teacher gives B equals T plus ten. Substitute the third into the first, then use the second, and T pops out as a whole number. From there B and G follow in one line each."
    },
    {
      title: "Pair-Sum Decomposition",
      purpose: "Show that for three people, the sum of all three pair sums equals two times the total weight.",
      classicId: "three-people-pair-sums",
      kind: "medium",
      durationMs: 12000,
      caption: "Each person sits in exactly two of the three pair sums. So adding the three pair sums counts every weight twice — divide by two to get the total.",
      voiceover: "Switch to weights. Three people make three pair sums. Notice that every single person appears in exactly two of those three pair sums. So if you add all three pair sums together, you get twice the total of all three weights. Divide by two and you have S, the sum of every weight."
    },
    {
      title: "Missing-Pair Logic",
      purpose: "Four people make six pair sums; if only five are given, the missing one is three times S minus the given total.",
      classicId: "four-people-five-sums",
      kind: "core",
      durationMs: 13500,
      caption: "Four people make six pair sums. Each weight sits in three sums. The total of all six pair sums equals three times S. So missing pair equals three S minus the sum of the five given.",
      voiceover: "Four people make six pair sums. Each person now appears in exactly three pair sums. The total of all six sums equals three times the total weight S. So if only five are given, the missing sum equals three times S minus the total of the five given sums. Once you have all six sums, the smallest is the lightest pair and the largest is the heaviest pair, and the rest fall out."
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

  function rotateChoice(choices, correct, variantIndex) {
    const unique = [...new Set(choices.map(String))];
    const without = unique.filter((choice) => choice !== String(correct));
    const ordered = [String(correct), ...without].slice(0, 4);
    while (ordered.length < 4) {
      // synthesize plausible filler if the dedupe shrank the list
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

  // ---- C1: two-group-difference --------------------------------------------
  // "Each X says: 'I see k more X-hats than Y-hats.' There are n total X.
  //  How many Y?" Speaker sees (n-1) of own kind, so equation is
  //  (n-1) - y = k, giving y = n - 1 - k.
  function twoGroupDifferenceProblem(variantIndex) {
    const cases = [
      { groupX: "boys", colourX: "red", groupY: "girls", colourY: "yellow", n: 10, k: 3 },
      { groupX: "girls", colourX: "yellow", groupY: "boys", colourY: "red", n: 12, k: 2 },
      { groupX: "boys", colourX: "red", groupY: "teachers", colourY: "blue", n: 15, k: 4 },
      { groupX: "girls", colourX: "yellow", groupY: "teachers", colourY: "blue", n: 9, k: 1 }
    ];
    const data = cases[variantIndex % cases.length];
    const answer = data.n - 1 - data.k;
    const p = problemBase("two-group-difference", variantIndex, variantIndex % 2 ? "filled" : "choice");
    p.prompt = `In a maths club, each ${data.groupX.replace(/s$/, "")} wears a ${data.colourX} hat and each ${data.groupY.replace(/s$/, "")} wears a ${data.colourY} hat. There are ${data.n} ${data.groupX} in the club. One ${data.groupX.replace(/s$/, "")} says: "I see ${data.k} more ${data.colourX} hats than ${data.colourY} hats." How many ${data.groupY} are there?`;
    p.expected = answer;
    p.expectedDisplay = `${answer} ${data.groupY}`;
    p.correctInput = p.answerType === "choice" ? { choice: String(answer) } : { value: String(answer) };
    p.choices = p.answerType === "choice"
      ? rotateChoice([answer, data.n - data.k, data.n + data.k, Math.max(1, answer - 1)], answer, variantIndex)
      : [];
    p.hint1 = `The speaker cannot see their own hat, so they only see ${data.n - 1} ${data.colourX} hats.`;
    p.hint2 = `Write (n-1) - y = k. So y = ${data.n - 1} - ${data.k}.`;
    p.solution = `The ${data.groupX.replace(/s$/, "")} sees ${data.n - 1} ${data.colourX} hats (not their own). The statement says (${data.n - 1}) - y = ${data.k}, so y = ${answer}. There are ${answer} ${data.groupY}.`;
    p.visual = {
      type: "hatRow",
      rowsX: data.n,
      rowsY: answer,
      colourX: data.colourX,
      colourY: data.colourY,
      labelX: `${data.groupX} (${data.n})`,
      labelY: `${data.groupY} (?)`
    };
    return p;
  }

  // ---- C2: three-group-ratio ------------------------------------------------
  // The speaker is in a separate group (group A) from the two compared
  // groups (B and C). The speaker sees ALL of B and ALL of C, so the
  // statement gives the clean equation B = mult * C.
  function threeGroupRatioProblem(variantIndex) {
    const cases = [
      { groupA: "boys", groupB: "girls", groupC: "teachers", mult: 2, c: 3 },
      { groupA: "teachers", groupB: "girls", groupC: "boys", mult: 2, c: 5 },
      { groupA: "girls", groupB: "boys", groupC: "teachers", mult: 3, c: 4 },
      { groupA: "boys", groupB: "girls", groupC: "teachers", mult: 2, c: 6 }
    ];
    const data = cases[variantIndex % cases.length];
    const b = data.mult * data.c;
    const p = problemBase("three-group-ratio", variantIndex, variantIndex % 2 ? "choice" : "filled");
    const multWord = data.mult === 2 ? "twice" : data.mult === 3 ? "three times" : `${data.mult} times`;
    p.prompt = `In a maths club, each ${data.groupA.replace(/s$/, "")} says: "I see ${multWord} as many ${data.groupB} as ${data.groupC}." If there are ${data.c} ${data.groupC}, how many ${data.groupB} are there?`;
    p.expected = b;
    p.expectedDisplay = `${b} ${data.groupB}`;
    p.correctInput = p.answerType === "choice" ? { choice: String(b) } : { value: String(b) };
    p.choices = p.answerType === "choice"
      ? rotateChoice([b, data.c + data.mult, data.c * (data.mult + 1), b + 1], b, variantIndex)
      : [];
    p.hint1 = `Let B = number of ${data.groupB}, C = number of ${data.groupC}. The speaker is a ${data.groupA.replace(/s$/, "")}, NOT a ${data.groupB.replace(/s$/, "")} or ${data.groupC.replace(/s$/, "")}, so they see every ${data.groupB.replace(/s$/, "")} and every ${data.groupC.replace(/s$/, "")}.`;
    p.hint2 = `Write B = ${data.mult} x C. Substitute C = ${data.c}.`;
    p.solution = `Let B = number of ${data.groupB}, C = number of ${data.groupC} = ${data.c}. The speaker (a ${data.groupA.replace(/s$/, "")}) sees every ${data.groupB.replace(/s$/, "")} and every ${data.groupC.replace(/s$/, "")}, so the statement gives B = ${data.mult} x ${data.c} = ${b}.`;
    p.visual = {
      type: "hatRow",
      rowsX: b,
      rowsY: data.c,
      colourX: data.groupB === "girls" ? "yellow" : data.groupB === "boys" ? "red" : "blue",
      colourY: data.groupC === "teachers" ? "blue" : data.groupC === "girls" ? "yellow" : "red",
      labelX: `${data.groupB} = ${multWord} ${data.groupC}`,
      labelY: `${data.groupC} = ${data.c}`
    };
    return p;
  }

  // ---- C3: hat-system-2-statement ------------------------------------------
  // Boy + Teacher statements give two equations in B, G, T. We supply B
  // (total boys) as a third fact, so the system becomes 2 equations in 2
  // unknowns. The student solves for the asked unknown (G or T).
  function hatSystem2Problem(variantIndex) {
    const cases = [
      { k1: 2, k2: 11, totalB: 16, askFor: "G" }, // matches source numerics
      { k1: 3, k2: 8, totalB: 14, askFor: "G" },
      { k1: 1, k2: 6, totalB: 10, askFor: "T" },
      { k1: 4, k2: 9, totalB: 18, askFor: "G" }
    ];
    const data = cases[variantIndex % cases.length];
    // Boy: (B-1) - G = k1 -> G = B - (k1 + 1)
    // Teacher: B - (T-1) = k2 -> T = B - (k2 - 1)
    const G = data.totalB - (data.k1 + 1);
    const T = data.totalB - (data.k2 - 1);
    const answer = data.askFor === "G" ? G : T;
    const askName = data.askFor === "G" ? "girls" : "teachers";
    const p = problemBase("hat-system-2-statement", variantIndex, variantIndex % 2 ? "filled" : "choice");
    p.prompt = `In a maths club, each boy wears red, each girl wears yellow, each teacher wears blue. There are ${data.totalB} boys. A boy says: "I see ${data.k1} more red hats than yellow hats." A teacher says: "I see ${data.k2} fewer blue hats than red hats." How many ${askName} are there?`;
    p.expected = answer;
    p.expectedDisplay = `${answer} ${askName}`;
    p.correctInput = p.answerType === "choice" ? { choice: String(answer) } : { value: String(answer) };
    p.choices = p.answerType === "choice"
      ? rotateChoice([answer, data.totalB - data.k1, data.totalB - data.k2, answer + 1], answer, variantIndex)
      : [];
    p.hint1 = `Boy statement: (B-1) - G = ${data.k1}. Teacher statement: B - (T-1) = ${data.k2}.`;
    p.hint2 = `Rewrite as G = B - ${data.k1 + 1} and T = B - ${data.k2 - 1}. Substitute B = ${data.totalB}.`;
    p.solution = `Boy gives B - G = ${data.k1 + 1}, so G = ${data.totalB} - ${data.k1 + 1} = ${G}. Teacher gives B - T = ${data.k2 - 1}, so T = ${data.totalB} - ${data.k2 - 1} = ${T}. Answer: ${answer} ${askName}.`;
    p.visual = {
      type: "equations",
      lines: [
        `B = ${data.totalB}`,
        `(B - 1) - G = ${data.k1}  ->  G = ${G}`,
        `B - (T - 1) = ${data.k2}  ->  T = ${T}`
      ],
      highlight: data.askFor
    };
    return p;
  }

  // ---- C4: hat-system-3-statement (canonical source problem) ---------------
  // Boy: (B-1) - G = k1 -> B - G = k1 + 1
  // Girl: (G-1) = m * T -> G = m*T + 1
  // Teacher: B - (T-1) = k2 -> B = T + k2 - 1
  // Sub teacher into boy: (T + k2 - 1) - G = k1 + 1 -> G = T + k2 - k1 - 2
  // Then girl: m*T + 1 = T + k2 - k1 - 2 -> T*(m - 1) = k2 - k1 - 3
  //   T = (k2 - k1 - 3) / (m - 1)
  // For source: k1=2, m=2, k2=11 -> T = (11 - 2 - 3) / 1 = 6, G = 13, B = 16.
  function hatSystem3Problem(variantIndex) {
    const cases = [
      { k1: 2, m: 2, k2: 11, askFor: "G" }, // canonical: T=6, G=13, B=16
      { k1: 3, m: 2, k2: 10, askFor: "G" }, // T=4, G=9, B=12
      { k1: 1, m: 3, k2: 8, askFor: "T" },  // T = (8-1-3)/2 = 2, G=7, B=9
      { k1: 4, m: 2, k2: 9, askFor: "B" }   // T=2, G=5, B=10
    ];
    const data = cases[variantIndex % cases.length];
    const T = (data.k2 - data.k1 - 3) / (data.m - 1);
    const G = data.m * T + 1;
    const B = T + data.k2 - 1;
    if (!Number.isInteger(T) || T <= 0 || !Number.isInteger(G) || !Number.isInteger(B)) {
      throw new Error(`hat-system-3 variant ${variantIndex} produced non-integer: T=${T}, G=${G}, B=${B}`);
    }
    const answer = data.askFor === "G" ? G : data.askFor === "T" ? T : B;
    const askName = data.askFor === "G" ? "girls" : data.askFor === "T" ? "teachers" : "boys";
    const multWord = data.m === 2 ? "twice" : data.m === 3 ? "three times" : `${data.m} times`;
    const p = problemBase("hat-system-3-statement", variantIndex, variantIndex % 2 ? "choice" : "filled");
    p.prompt = `In a maths club, each boy wears a red hat, each girl wears a yellow hat, each teacher wears a blue hat. A boy says: "I see ${data.k1} more red hats than yellow hats." A girl says: "I see ${multWord} as many yellow hats as blue hats." A teacher says: "I see ${data.k2} fewer blue hats than red hats." How many ${askName} are there?`;
    p.expected = answer;
    p.expectedDisplay = `${answer} ${askName}`;
    p.correctInput = p.answerType === "choice" ? { choice: String(answer) } : { value: String(answer) };
    p.choices = p.answerType === "choice"
      ? rotateChoice([answer, T, G, B].filter((x, i, arr) => arr.indexOf(x) === i), answer, variantIndex)
      : [];
    p.hint1 = `Boy: B - G = ${data.k1 + 1}. Girl: G = ${data.m}T + 1. Teacher: B = T + ${data.k2 - 1}.`;
    p.hint2 = `Substitute teacher into boy to get G in terms of T, then use the girl equation to solve T.`;
    p.solution = `Boy gives B - G = ${data.k1 + 1}. Girl gives G = ${data.m}T + 1. Teacher gives B = T + ${data.k2 - 1}. Sub: (T + ${data.k2 - 1}) - (${data.m}T + 1) = ${data.k1 + 1}, so T = ${T}. Then G = ${data.m} x ${T} + 1 = ${G} and B = ${T} + ${data.k2 - 1} = ${B}. Answer: ${answer} ${askName}.`;
    p.visual = {
      type: "equations",
      lines: [
        `Boy: (B - 1) - G = ${data.k1}    ->  B - G = ${data.k1 + 1}`,
        `Girl: (G - 1) = ${data.m}T         ->  G = ${data.m}T + 1`,
        `Teacher: B - (T - 1) = ${data.k2}  ->  B = T + ${data.k2 - 1}`
      ],
      highlight: data.askFor
    };
    return p;
  }

  // ---- C5: three-people-pair-sums -------------------------------------------
  // Three people a<=b<=c, three pair sums S1=a+b, S2=a+c, S3=b+c.
  // a = (S1 + S2 - S3) / 2, c = (S2 + S3 - S1) / 2, b = (S1 + S3 - S2) / 2.
  function threePeoplePairSumsProblem(variantIndex) {
    const cases = [
      { a: 30, b: 40, c: 50, askFor: "heaviest" }, // sums 70, 80, 90
      { a: 25, b: 35, c: 45, askFor: "lightest" }, // 60, 70, 80
      { a: 20, b: 28, c: 36, askFor: "middle" },   // 48, 56, 64
      { a: 18, b: 32, c: 50, askFor: "heaviest" }  // 50, 68, 82
    ];
    const data = cases[variantIndex % cases.length];
    const s1 = data.a + data.b;
    const s2 = data.a + data.c;
    const s3 = data.b + data.c;
    const answer = data.askFor === "lightest" ? data.a : data.askFor === "middle" ? data.b : data.c;
    const askWord = data.askFor === "lightest" ? "lightest person" : data.askFor === "middle" ? "middle person" : "heaviest person";
    const p = problemBase("three-people-pair-sums", variantIndex, variantIndex % 2 ? "filled" : "choice");
    p.prompt = `Three people step onto a scale in pairs. The pair weights are ${s1} kg, ${s2} kg and ${s3} kg. How much does the ${askWord} weigh?`;
    p.expected = answer;
    p.expectedDisplay = `${answer} kg`;
    p.correctInput = p.answerType === "choice" ? { choice: String(answer) } : { value: String(answer) };
    p.choices = p.answerType === "choice"
      ? rotateChoice([answer, data.a, data.b, data.c].filter((x, i, arr) => arr.indexOf(x) === i), answer, variantIndex)
      : [];
    p.hint1 = `Add all three pair sums: ${s1} + ${s2} + ${s3} = ${s1 + s2 + s3}. That equals 2 x (a + b + c).`;
    p.hint2 = `So a + b + c = ${(s1 + s2 + s3) / 2}. Subtract the matching pair sum to isolate the person you want.`;
    p.solution = `S = a + b + c = (${s1} + ${s2} + ${s3}) / 2 = ${(s1 + s2 + s3) / 2}. Smallest pair = a + b = ${s1}, so c = S - ${s1} = ${data.c}. Largest pair = b + c = ${s3}, so a = S - ${s3} = ${data.a}. Then b = ${data.b}. The ${askWord} weighs ${answer} kg.`;
    p.visual = {
      type: "tripleWeigh",
      sums: [s1, s2, s3],
      labels: ["A+B", "A+C", "B+C"],
      askFor: data.askFor
    };
    return p;
  }

  // ---- C6: four-people-five-sums (canonical Problem 2) ---------------------
  function fourPeopleProblem(variantIndex) {
    // Four canonical (a,b,c,d) integer cases. We pre-compute which pair is
    // missing across variants so the diagram varies (variantStability=false).
    const cases = [
      { a: 47, b: 52, c: 66, d: 78, missingPair: [1, 2] }, // canonical: b+c=118 missing
      { a: 20, b: 25, c: 30, d: 40, missingPair: [0, 3] }, // a+d=60 missing
      { a: 10, b: 18, c: 22, d: 30, missingPair: [1, 2] }, // b+c=40 missing
      { a: 50, b: 55, c: 70, d: 85, missingPair: [0, 2] }  // a+c=120 missing
    ];
    const data = cases[variantIndex % cases.length];
    const w = [data.a, data.b, data.c, data.d];
    const allPairs = [];
    for (let i = 0; i < 4; i += 1) {
      for (let j = i + 1; j < 4; j += 1) {
        allPairs.push({ i, j, sum: w[i] + w[j] });
      }
    }
    const missingIdx = allPairs.findIndex((pp) => pp.i === data.missingPair[0] && pp.j === data.missingPair[1]);
    const givenSums = allPairs.filter((_, idx) => idx !== missingIdx).map((pp) => pp.sum);
    const givenTotal = givenSums.reduce((a, b) => a + b, 0);
    const S = data.a + data.b + data.c + data.d;
    const missingSum = 3 * S - givenTotal;
    if (missingSum !== allPairs[missingIdx].sum) {
      throw new Error(`four-people variant ${variantIndex} math mismatch`);
    }
    // Answer: the HEAVIER of the missing pair.
    const heavier = w[data.missingPair[1]];
    const p = problemBase("four-people-five-sums", variantIndex, variantIndex % 2 ? "choice" : "filled");
    const sortedGiven = [...givenSums].sort((a, b) => a - b);
    p.prompt = `Four people, each with a whole-number weight in kilograms, step onto a scale in pairs. The five recorded pair weights are ${sortedGiven.join(", ")} kg. Two of the four people never weighed together. How heavy is the heavier of those two?`;
    p.expected = heavier;
    p.expectedDisplay = `${heavier} kg`;
    p.correctInput = p.answerType === "choice" ? { choice: String(heavier) } : { value: String(heavier) };
    p.choices = p.answerType === "choice"
      ? rotateChoice([heavier, data.a, data.b, data.c, data.d].filter((x, i, arr) => arr.indexOf(x) === i), heavier, variantIndex)
      : [];
    p.hint1 = `Four people make 6 pair sums. The sum of all 6 equals 3 x (total weight S). The five given sums total ${givenTotal}.`;
    p.hint2 = `Smallest given pair = a+b = ${sortedGiven[0]}. Largest given pair = c+d = ${sortedGiven[sortedGiven.length - 1]}. So S = ${sortedGiven[0]} + ${sortedGiven[sortedGiven.length - 1]} = ${sortedGiven[0] + sortedGiven[sortedGiven.length - 1]}. Missing = 3 x ${S} - ${givenTotal} = ${missingSum}.`;
    p.solution = `S = a + b + c + d = ${S} (from smallest pair ${sortedGiven[0]} + largest pair ${sortedGiven[sortedGiven.length - 1]}). Missing sum = 3 x ${S} - ${givenTotal} = ${missingSum}. Decompose all six sums to get a = ${data.a}, b = ${data.b}, c = ${data.c}, d = ${data.d}. The missing pair is (${w[data.missingPair[0]]}, ${w[data.missingPair[1]]}); the heavier is ${heavier} kg.`;
    p.visual = {
      type: "fourPeople",
      weights: w,
      allPairs: allPairs.map((pp) => ({ i: pp.i, j: pp.j, sum: pp.sum })),
      missingIdx,
      heavier
    };
    return p;
  }

  // ---- dispatcher -----------------------------------------------------------

  function generateProblem(classicId, variantIndex = 0) {
    const generators = {
      "two-group-difference": twoGroupDifferenceProblem,
      "three-group-ratio": threeGroupRatioProblem,
      "hat-system-2-statement": hatSystem2Problem,
      "hat-system-3-statement": hatSystem3Problem,
      "three-people-pair-sums": threePeoplePairSumsProblem,
      "four-people-five-sums": fourPeopleProblem
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
  // Diagram families:
  //   hatRow      — two rows of stick figures (C1, C2)
  //   equations   — chalkboard with equation lines (C3, C4)
  //   tripleWeigh — three people, three pair-sum lines (C5)
  //   fourPeople  — four people, six pair-sum lines, one optionally hidden (C6)
  // Every diagram uses the same 560x330 viewBox.

  const COLOUR_FILL = { red: "#ff7654", yellow: "#f3d24f", blue: "#5b9bd5" };

  function svgShell(inner, ariaLabel) {
    return `<svg viewBox="0 0 560 330" role="img" aria-label="${ariaLabel}">${inner}</svg>`;
  }

  function hatRowSvg(v, isRevealed, answerText) {
    const drawRow = (count, colour, yBase, labelText, isUnknown) => {
      const cap = Math.min(count, 8);
      const fillColour = COLOUR_FILL[colour] || "#999";
      const figures = [];
      const startX = 110;
      const spacing = cap <= 1 ? 0 : (390) / Math.max(1, cap - 1);
      for (let i = 0; i < cap; i += 1) {
        const x = cap === 1 ? 305 : startX + i * spacing;
        figures.push(
          `<circle cx="${x}" cy="${yBase}" r="14" fill="#fff8dc" stroke="#16345d" stroke-width="2"/>`
        );
        figures.push(
          `<path d="M ${x - 16} ${yBase - 4} A 16 16 0 0 1 ${x + 16} ${yBase - 4} Z" fill="${fillColour}" stroke="#16345d" stroke-width="2"/>`
        );
      }
      const ellipsis = count > cap ? `<text x="515" y="${yBase + 5}" class="formula-note">+more</text>` : "";
      const showCount = isUnknown && !isRevealed ? "?" : count;
      return figures.join("") + ellipsis +
        `<text x="20" y="${yBase + 5}" class="formula-note">${escapeHtml(labelText)} (${showCount})</text>`;
    };

    const labelX = v.labelX || "row X";
    const labelY = v.labelY || "row Y";
    const isXUnknown = labelX.includes("?");
    const isYUnknown = labelY.includes("?");
    const rowX = drawRow(v.rowsX, v.colourX, 110, labelX.replace(/\s*\(.*\)\s*/, "").trim(), isXUnknown);
    const rowY = drawRow(v.rowsY, v.colourY, 220, labelY.replace(/\s*\(.*\)\s*/, "").trim(), isYUnknown);
    return rowX + rowY + answerText;
  }

  function equationsSvg(v, isRevealed, answerText) {
    const lines = v.lines || [];
    const els = lines.map((ln, i) => {
      const yPos = 130 + i * 50;
      return `<text x="40" y="${yPos}" class="formula-note">${escapeHtml(ln)}</text>`;
    }).join("");
    const frame = `<rect x="20" y="55" width="520" height="220" rx="14" fill="#fff8dc" stroke="#16345d" stroke-width="4"/>`;
    const banner = `<text x="280" y="90" text-anchor="middle" class="formula-note">${isRevealed ? "Solved system" : "System of equations"}</text>`;
    return frame + banner + els + answerText;
  }

  function tripleWeighSvg(v, isRevealed, answerText) {
    const personPos = [
      { x: 110, y: 100, name: "A" },
      { x: 450, y: 100, name: "B" },
      { x: 280, y: 240, name: "C" }
    ];
    const persons = personPos.map((p) =>
      `<rect x="${p.x - 30}" y="${p.y - 30}" width="60" height="60" rx="10" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>` +
      `<text x="${p.x}" y="${p.y + 6}" text-anchor="middle" class="formula-note">${p.name}</text>`
    ).join("");
    const pairs = [
      { from: 0, to: 1, label: v.sums[0], mid: { x: 280, y: 85 } },
      { from: 0, to: 2, label: v.sums[1], mid: { x: 185, y: 175 } },
      { from: 1, to: 2, label: v.sums[2], mid: { x: 380, y: 175 } }
    ];
    const lines = pairs.map((p) => {
      const from = personPos[p.from];
      const to = personPos[p.to];
      return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#1790a6" stroke-width="3"/>` +
        `<text x="${p.mid.x}" y="${p.mid.y}" text-anchor="middle" class="side-label">${p.label}</text>`;
    }).join("");
    const heading = `<text x="280" y="40" text-anchor="middle" class="formula-note">${isRevealed ? "Pair sums identified" : "Three pair sums"}</text>`;
    return heading + lines + persons + answerText;
  }

  function fourPeopleSvg(v, isRevealed, answerText) {
    const personPos = [
      { x: 130, y: 100, name: "a", w: v.weights[0] },
      { x: 430, y: 100, name: "b", w: v.weights[1] },
      { x: 130, y: 240, name: "c", w: v.weights[2] },
      { x: 430, y: 240, name: "d", w: v.weights[3] }
    ];
    const lines = v.allPairs.map((pair, idx) => {
      const isMissing = idx === v.missingIdx;
      const from = personPos[pair.i];
      const to = personPos[pair.j];
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      const stroke = isMissing && !isRevealed ? "#a3b1c1" : "#1790a6";
      const dash = isMissing && !isRevealed ? `stroke-dasharray="6 6"` : "";
      const labelText = isMissing && !isRevealed ? "?" : pair.sum;
      return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${stroke}" stroke-width="3" ${dash}/>` +
        `<text x="${mx}" y="${my - 6}" text-anchor="middle" class="side-label">${labelText}</text>`;
    }).join("");
    const persons = personPos.map((pp) => {
      const inner = isRevealed ? `${pp.name}=${pp.w}` : pp.name;
      return `<rect x="${pp.x - 32}" y="${pp.y - 32}" width="64" height="64" rx="10" fill="#fff8dc" stroke="#16345d" stroke-width="3"/>` +
        `<text x="${pp.x}" y="${pp.y + 6}" text-anchor="middle" class="formula-note">${inner}</text>`;
    }).join("");
    const heading = `<text x="280" y="40" text-anchor="middle" class="formula-note">${isRevealed ? "Six pair sums recovered" : "Five pair sums given"}</text>`;
    return heading + lines + persons + answerText;
  }

  function renderProblemVisual(problem, state = "initial") {
    const v = problem.visual || {};
    const isRevealed = state === "solution" || state === "worked";
    const answerText = isRevealed
      ? `<text x="280" y="318" text-anchor="middle" class="formula-note">Answer: ${escapeHtml(problem.expectedDisplay)}</text>`
      : "";
    let html;
    let text;
    if (v.type === "hatRow") {
      html = svgShell(hatRowSvg(v, isRevealed, answerText), "Hat-counting word puzzle");
      text = "Two rows of stick figures show the totals. The speaker cannot see their own hat.";
    } else if (v.type === "equations") {
      html = svgShell(equationsSvg(v, isRevealed, answerText), "System of equations from word statements");
      text = "Each 'I see' sentence becomes one equation. Solve by substitution.";
    } else if (v.type === "tripleWeigh") {
      html = svgShell(tripleWeighSvg(v, isRevealed, answerText), "Three-people pair-sum visualisation");
      text = "Three people, three pair sums. Each person sits in exactly two of the three sums.";
    } else if (v.type === "fourPeople") {
      html = svgShell(fourPeopleSvg(v, isRevealed, answerText), "Four-people pair-sum visualisation");
      text = "Four people, six pair sums. The dashed line shows the pair that never weighed together.";
    } else {
      html = svgShell(`<rect x="60" y="60" width="440" height="200" fill="#fff8dc" stroke="#16345d" stroke-width="4"/><text x="280" y="170" text-anchor="middle" class="formula-note">Word puzzle</text>${answerText}`, "Word puzzle placeholder");
      text = "Word puzzle visual placeholder.";
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

  root.AlgebraicWordPuzzlesModule = api;

  // ---- runtime (browser only) ---------------------------------------------
  // Mirrors the intro player + practice loop used by triangle_sides. Adapted
  // to read from this module's INTRO_SCENES (which omit per-scene audio
  // files — scenes fall through to the SpeechSynthesis fallback).

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
      : "<div><strong>Clean round.</strong><br>You used self-exclusion counting, systems of equations, and pair-sum decomposition accurately.</div>";
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
