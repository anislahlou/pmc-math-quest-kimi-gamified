/* Rational Numbers & Number Line module (G1 Lesson 1, Think Academy Secondary G1 Term A).
   Dialect A (train-style): CLASSICS + generateProblem + checkAnswer +
   renderProblemVisual + INTRO_SCENES + createRound.
   All generators are procedural with exact, audit-clean answers; distractors
   target the lesson's known misconceptions (sign flips, π-is-rational,
   left-is-bigger, mirror slips, |x|=a has one answer). */
(function (root) {
  "use strict";

  const CLASSICS = [
    { id: "sign-sense", nickname: "Sign Sense", skill: "Use positive and negative numbers for real-world opposite quantities.", sourcePages: "Book 1-3 / PDF 9-11" },
    { id: "rational-detective", nickname: "Rational Detective", skill: "Sort numbers into positive rational, negative rational, and not rational.", sourcePages: "Book 5-6 / PDF 13-14" },
    { id: "line-reader", nickname: "Line Reader", skill: "Read and compare values on the number line.", sourcePages: "Book 7-8 / PDF 15-16" },
    { id: "line-moves", nickname: "Number Line Moves", skill: "Add right moves and subtract left moves on the number line.", sourcePages: "Book 8-10 / PDF 16-18" },
    { id: "inverse-mirror", nickname: "Mirror Numbers", skill: "Use additive inverses: mirrored around zero and summing to zero.", sourcePages: "Book 10-12 / PDF 18-20" },
    { id: "absolute-value", nickname: "Absolute Value", skill: "Use absolute value as distance from zero — never negative.", sourcePages: "Book 13-16 / PDF 21-24" }
  ];
  const CLASSIC_IDS = CLASSICS.map((c) => c.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((c) => [c.id, c]));
  const CLASSIC_SKILLS = {
    "sign-sense": "Positive & negative in context",
    "rational-detective": "What counts as rational",
    "line-reader": "Read the number line",
    "line-moves": "Moves on the line",
    "inverse-mirror": "Additive inverses",
    "absolute-value": "Absolute value"
  };
  const SOURCE_COVERAGE = {
    "sign-sense": ["Let's Get Ready temperature/altitude/money contexts"],
    "rational-detective": ["Exploration 1 classify list", "Investigate true statements"],
    "line-reader": ["Number Line notes", "read points and compare"],
    "line-moves": ["Exercise moving points", "Challenge bug walk", "count integers between"],
    "inverse-mirror": ["Exploration 5 mirror points", "Learn and Discover inverse tables"],
    "absolute-value": ["Absolute value notes", "range and |x|=a exercises"]
  };
  const INTRO_SCENE_MS = 9000;
  const ROUND_LENGTH = 6;

  /* ---------------- helpers ---------------- */
  const MINUS = "−";
  function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }
  function formatMathText(value) {
    return String(value).replace(/\^2/g, "²");
  }
  function parseNumber(value) {
    const text = String(value ?? "").replaceAll(MINUS, "-").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
    return text ? Number(text[0]) : NaN;
  }
  function mag(n) { // magnitude as display string, trailing zeros trimmed
    const v = Math.abs(n);
    return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
  }
  function sx(n) { // signed display with proper minus
    return (n < 0 ? MINUS : "") + mag(n);
  }
  function pick(arr, i) { return arr[((i % arr.length) + arr.length) % arr.length]; }
  function shuffleRotate(arr, i) {
    const k = ((i % arr.length) + arr.length) % arr.length;
    return arr.slice(k).concat(arr.slice(0, k));
  }
  // Build exactly 4 unique choices with exactly one correct.
  function makeChoices(correct, wrongs, fallbacks, variantIndex) {
    const seen = new Set([String(correct)]);
    const out = [{ label: String(correct), isCorrect: true }];
    for (const w of [...wrongs, ...fallbacks]) {
      const s = String(w);
      if (seen.has(s)) continue;
      seen.add(s);
      out.push({ label: s, isCorrect: false });
      if (out.length === 4) break;
    }
    if (out.length < 4) throw new Error("choice pool exhausted for " + correct);
    return shuffleRotate(out, variantIndex);
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

  /* ---------------- generic number-line SVG ---------------- */
  const NAVY = "#16345d", CORAL = "#ff7654", TEAL = "#0b8993", AMBER = "#e8a20c", PURPLE = "#7a4fd0";
  function svgShell(inner) {
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Number line visual">${inner}</svg>`;
  }
  // cfg: {min, max, unit (label step), sub (subdivisions), points:[{v,label,color,show}], arcs:[{from,to,text,color}], mirror, brace:{a,b,text}, note}
  function numberLineSvg(cfg) {
    const W = 560, PAD = 42, Y = 190;
    const x = (v) => PAD + ((v - cfg.min) / (cfg.max - cfg.min)) * (W - 2 * PAD);
    let s = `<line x1="${PAD - 18}" y1="${Y}" x2="${W - PAD + 24}" y2="${Y}" stroke="${NAVY}" stroke-width="4"/>`;
    s += `<polygon points="${W - PAD + 24},${Y - 7} ${W - PAD + 40},${Y} ${W - PAD + 24},${Y + 7}" fill="${NAVY}"/>`;
    const step = cfg.unit / (cfg.sub || 1);
    for (let v = cfg.min; v <= cfg.max + 1e-9; v += step) {
      const isMain = Math.abs(v / cfg.unit - Math.round(v / cfg.unit)) < 1e-9;
      const X = x(v);
      s += `<line x1="${X}" y1="${Y - (isMain ? 10 : 6)}" x2="${X}" y2="${Y + (isMain ? 10 : 6)}" stroke="${NAVY}" stroke-width="${isMain ? 3 : 2}"/>`;
      if (isMain) {
        const lv = Math.round(v / cfg.unit) * cfg.unit;
        s += `<text x="${X}" y="${Y + 30}" text-anchor="middle" font-size="15" fill="${NAVY}">${sx(lv)}</text>`;
      }
    }
    if (cfg.mirror) {
      s += `<line x1="${x(0)}" y1="60" x2="${x(0)}" y2="${Y - 18}" stroke="${AMBER}" stroke-width="3" stroke-dasharray="7 7"/>`;
      s += `<text x="${x(0)}" y="52" text-anchor="middle" font-size="14" fill="${AMBER}">mirror at 0</text>`;
    }
    for (const arc of cfg.arcs || []) {
      const x1 = x(arc.from), x2 = x(arc.to), xm = (x1 + x2) / 2;
      const lift = Math.min(70, 34 + Math.abs(x2 - x1) / 6);
      const dir = arc.to > arc.from ? 1 : -1;
      s += `<path d="M ${x1} ${Y - 14} Q ${xm} ${Y - 14 - lift} ${x2} ${Y - 14}" fill="none" stroke="${arc.color || CORAL}" stroke-width="4"/>`;
      s += `<polygon points="${x2},${Y - 14} ${x2 - dir * 11},${Y - 21} ${x2 - dir * 11},${Y - 7}" fill="${arc.color || CORAL}"/>`;
      s += `<text x="${xm}" y="${Y - 22 - lift}" text-anchor="middle" font-size="16" font-weight="bold" fill="${arc.color || CORAL}">${escapeHtml(arc.text)}</text>`;
    }
    for (const p of cfg.points || []) {
      const X = x(p.v);
      s += `<circle cx="${X}" cy="${Y}" r="8" fill="${p.color || CORAL}" stroke="white" stroke-width="3"/>`;
      if (p.label) s += `<text x="${X}" y="${Y - 16}" text-anchor="middle" font-size="17" font-weight="bold" fill="${p.color || CORAL}">${escapeHtml(p.label)}</text>`;
      if (p.show) s += `<text x="${X}" y="${Y + 52}" text-anchor="middle" font-size="16" font-weight="bold" fill="${NAVY}">${escapeHtml(p.show)}</text>`;
    }
    if (cfg.brace) {
      const x1 = x(cfg.brace.a), x2 = x(cfg.brace.b), yb = Y + 66;
      s += `<line x1="${x1}" y1="${yb}" x2="${x2}" y2="${yb}" stroke="${TEAL}" stroke-width="4"/>`;
      s += `<line x1="${x1}" y1="${yb - 7}" x2="${x1}" y2="${yb + 7}" stroke="${TEAL}" stroke-width="4"/>`;
      s += `<line x1="${x2}" y1="${yb - 7}" x2="${x2}" y2="${yb + 7}" stroke="${TEAL}" stroke-width="4"/>`;
      s += `<text x="${(x1 + x2) / 2}" y="${yb + 24}" text-anchor="middle" font-size="16" font-weight="bold" fill="${TEAL}">${escapeHtml(cfg.brace.text)}</text>`;
    }
    if (cfg.note) s += `<text x="280" y="34" text-anchor="middle" font-size="16" fill="${NAVY}">${escapeHtml(cfg.note)}</text>`;
    return svgShell(s);
  }
  function thermoSvg(value, unitLabel, revealed) {
    const cx = 280, top = 60, bot = 250, mid = (top + bot) / 2;
    const scale = (bot - top) / 2 / 20; // ±20 range
    const yv = mid - Math.max(-20, Math.min(20, value)) * scale;
    let s = `<rect x="${cx - 26}" y="${top - 20}" width="52" height="${bot - top + 40}" rx="26" fill="#eef4ff" stroke="${NAVY}" stroke-width="4"/>`;
    s += `<line x1="${cx - 60}" y1="${mid}" x2="${cx + 60}" y2="${mid}" stroke="${CORAL}" stroke-width="4"/>`;
    s += `<text x="${cx + 72}" y="${mid + 5}" font-size="17" font-weight="bold" fill="${CORAL}">0${unitLabel}</text>`;
    for (const t of [-20, -10, 10, 20]) {
      const Y = mid - t * scale;
      s += `<line x1="${cx - 40}" y1="${Y}" x2="${cx - 26}" y2="${Y}" stroke="${NAVY}" stroke-width="2"/>`;
      s += `<text x="${cx - 48}" y="${Y + 5}" text-anchor="end" font-size="13" fill="${NAVY}">${sx(t)}</text>`;
    }
    s += `<circle cx="${cx}" cy="${yv}" r="11" fill="${revealed ? CORAL : "#9db4d6"}" stroke="white" stroke-width="3"/>`;
    s += `<text x="${cx}" y="${yv - 20}" text-anchor="middle" font-size="19" font-weight="bold" fill="${revealed ? CORAL : "#9db4d6"}">${revealed ? sx(value) + unitLabel : "?"}</text>`;
    s += `<text x="${cx}" y="44" text-anchor="middle" font-size="16" fill="${NAVY}">where does the marker sit?</text>`;
    return svgShell(s);
  }
  function bucketsSvg(chip, revealed, correctBucket) {
    const labels = ["Positive rational", "Negative rational", "Not rational"];
    const colors = [TEAL, CORAL, PURPLE];
    let s = "";
    for (let i = 0; i < 3; i++) {
      const bx = 36 + i * 172;
      s += `<rect x="${bx}" y="150" width="150" height="110" rx="16" fill="white" stroke="${colors[i]}" stroke-width="${revealed && i === correctBucket ? 6 : 3}"/>`;
      s += `<text x="${bx + 75}" y="186" text-anchor="middle" font-size="15" font-weight="bold" fill="${colors[i]}">${labels[i].split(" ")[0]}</text>`;
      s += `<text x="${bx + 75}" y="208" text-anchor="middle" font-size="15" fill="${colors[i]}">${labels[i].split(" ")[1] || ""}</text>`;
    }
    const chipX = revealed ? 36 + correctBucket * 172 + 75 : 280;
    const chipY = revealed ? 232 : 92;
    s += `<rect x="${chipX - 66}" y="${chipY - 24}" width="132" height="48" rx="24" fill="${NAVY}"/>`;
    s += `<text x="${chipX}" y="${chipY + 7}" text-anchor="middle" font-size="19" font-weight="bold" fill="white">${escapeHtml(chip)}</text>`;
    if (!revealed) s += `<text x="280" y="44" text-anchor="middle" font-size="16" fill="${NAVY}">which bucket does this number belong in?</text>`;
    return svgShell(s);
  }

  /* ---------------- 1. sign-sense ---------------- */
  function signSenseProblem(variantIndex) {
    const scenarios = [
      { unit: " °C", pos: (n) => `The temperature is ${n} degrees above zero. Write it as a signed number.`, neg: (n) => `The temperature is ${n} degrees below zero. Write it as a signed number.`, n: [3, 5, 8, 12, 15, 7] },
      { unit: " m", pos: (n) => `A climber is ${n} m above sea level. Write the elevation as a signed number.`, neg: (n) => `A diver is ${n} m below sea level. Write the elevation as a signed number.`, n: [15, 30, 50, 120, 200, 45] },
      { unit: "", pos: (n) => `Pip earns £${n}. Write it as a signed number.`, neg: (n) => `Pip spends £${n}. Write it as a signed number.`, n: [5, 12, 20, 35, 8, 50] },
      { unit: "%", pos: (n) => `Sales increased by ${n}%. Write the change as a signed number.`, neg: (n) => `Sales decreased by ${n}%. Write the change as a signed number.`, n: [4, 10, 15, 25, 6, 30] },
      { unit: " m", pos: (n) => `Walking east is positive. Pip walks ${n} m east. Write it as a signed number.`, neg: (n) => `Walking east is positive. Pip walks ${n} m west. Write it as a signed number.`, n: [6, 9, 14, 20, 11, 25] }
    ];
    const sc = pick(scenarios, variantIndex);
    const n = pick(sc.n, variantIndex * 2 + 1);
    const isNeg = variantIndex % 2 === 1;
    const correct = (isNeg ? MINUS : "+") + n + sc.unit;
    const wrongs = [
      (isNeg ? "+" : MINUS) + n + sc.unit,
      "0" + sc.unit,
      (isNeg ? MINUS : "+") + n * 2 + sc.unit
    ];
    const p = problemBase("sign-sense", variantIndex, "choice");
    p.prompt = isNeg ? sc.neg(n) : sc.pos(n);
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = makeChoices(correct, wrongs, ["+1" + sc.unit, MINUS + "1" + sc.unit, "+100" + sc.unit], variantIndex);
    p.hint1 = "Above, earning, increasing and east are positive. Below, spending, decreasing and west are negative.";
    p.hint2 = `This situation is on the ${isNeg ? "negative" : "positive"} side of zero, and the size is ${n}.`;
    p.solution = `${isNeg ? "Below zero (or spending, decreasing, west) means a negative sign" : "Above zero (or earning, increasing, east) means a positive sign"}: ${correct}. Zero would mean nothing happened at all.`;
    p.visual = { type: "thermo", value: isNeg ? -n : n, unit: sc.unit.trim() || "" };
    p.data = { n, isNeg };
    return p;
  }

  /* ---------------- 2. rational-detective ---------------- */
  const RATIONALS = ["−3/4", "11.11111", "0", "+2004", "−2", "95.5777…", "2.5", "−1/11", "0.333…", "−17", "3/7", "0.125"];
  const IRRATIONALS = ["π", "π/8", MINUS + "π", "1.12122122212222…", "0.1010010001…", MINUS + "2.131331333…", "π/2", "0.1234567891011…"];
  const TRUE_STMTS = [
    "Every integer is a rational number",
    "Terminating decimals are rational numbers",
    "Recurring decimals are rational numbers",
    "Zero is a rational number",
    "Every fraction a/b (b ≠ 0) is a rational number"
  ];
  const FALSE_STMTS = [
    "All decimals are rational numbers",
    "Rational numbers are integers",
    "Zero is a negative rational number",
    "The square of π is a rational number",
    "π can be written as a fraction of two integers"
  ];
  function rationalDetectiveProblem(variantIndex) {
    const form = variantIndex % 3;
    const p = problemBase("rational-detective", variantIndex, "choice");
    let correct, wrongs, bucket;
    if (form === 0) {
      correct = pick(IRRATIONALS, variantIndex);
      wrongs = [pick(RATIONALS, variantIndex), pick(RATIONALS, variantIndex + 5), pick(RATIONALS, variantIndex + 8)];
      p.prompt = "Which of these numbers is NOT a rational number?";
      p.hint1 = "A rational number can be written as one integer over another: integers, fractions, and decimals that stop or repeat.";
      p.hint2 = "Watch for decimals that never repeat and never stop, and anything built from π.";
      p.solution = `${correct} cannot be written as a fraction of two integers — it never terminates and never repeats, so it is not rational. The others all can.`;
      bucket = 2;
    } else if (form === 1) {
      const negs = ["−2/3", "−1/11", "−17", "−0.75", "−3/4", "−2.5"];
      correct = pick(negs, variantIndex);
      wrongs = [pick(IRRATIONALS, variantIndex + 3).startsWith(MINUS) ? pick(IRRATIONALS, variantIndex + 3) : MINUS + "π", "+5", "0"];
      p.prompt = "Which of these is a negative rational number?";
      p.hint1 = "It must be below zero AND writable as a fraction of two integers.";
      p.hint2 = "π is never rational, and zero is neither positive nor negative.";
      p.solution = `${correct} is below zero and can be written as a fraction of two integers, so it is a negative rational number. π-based numbers are not rational, and zero is neither positive nor negative.`;
      bucket = 1;
    } else {
      correct = pick(TRUE_STMTS, variantIndex);
      wrongs = [pick(FALSE_STMTS, variantIndex), pick(FALSE_STMTS, variantIndex + 2), pick(FALSE_STMTS, variantIndex + 4)];
      p.prompt = "Which statement is TRUE?";
      p.hint1 = "Integers, fractions, terminating decimals and recurring decimals are all rational.";
      p.hint2 = "π is the classic impostor: it is a decimal, but never repeats, so it is not rational.";
      p.solution = `True: ${correct}. The others fail because π and non-repeating decimals are not rational, zero is neither positive nor negative, and most rationals are not integers.`;
      bucket = -1;
    }
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = makeChoices(correct, wrongs, ["1/2", MINUS + "1/2", "π/3", "Zero is neither positive nor negative"], variantIndex);
    p.visual = { type: "buckets", chip: correct, bucket: bucket >= 0 ? bucket : 1 };
    p.data = { form };
    return p;
  }

  /* ---------------- 3. line-reader ---------------- */
  function fracStr(num, den) { // signed improper fraction display
    const sign = num < 0 ? MINUS : "";
    return `${sign}${Math.abs(num)}/${den}`;
  }
  function lineReaderProblem(variantIndex) {
    const form = variantIndex % 3;
    const p = problemBase("line-reader", variantIndex, "choice");
    if (form === 0) {
      // read a marked point with subdivisions
      const scales = [
        { den: 2, style: "frac" }, { den: 3, style: "frac" }, { den: 4, style: "frac" },
        { den: 2, style: "dec" }, { den: 5, style: "dec" }
      ];
      const sc = pick(scales, variantIndex);
      let k = (pick([3, 5, 7, -3, -5, -7, 1, -1, 9, -9], variantIndex * 2));
      const maxK = 4 * sc.den;
      if (Math.abs(k) > maxK) k = Math.sign(k) * maxK;
      if (k === 0) k = 3;
      const num = k, den = sc.den;
      let correct, neighbor, flip, fourth;
      if (sc.style === "frac") {
        correct = fracStr(num, den);
        neighbor = fracStr(num + Math.sign(num), den);
        flip = fracStr(-num, den);
        fourth = fracStr(Math.sign(num) * den, Math.abs(num)); // inverted fraction trap (3/2 → 2/3)
        if (Math.abs(num) === den || fourth === correct) fourth = fracStr(num + 2 * Math.sign(num), den);
      } else {
        const v = num / den;
        correct = sx(v);
        neighbor = sx((num + Math.sign(num)) / den);
        flip = sx(-v);
        fourth = sx(v + 1);
      }
      p.prompt = `The number line is split into equal parts. What number does point A show?`;
      p.expected = correct;
      p.visual = { type: "line", min: -4, max: 4, unit: 1, sub: den, points: [{ v: num / den, label: "A", color: CORAL, show: correct }] };
      p.hint1 = "Count how many equal parts fit between 0 and 1 — that tells you the size of one tick.";
      p.hint2 = `Each tick is 1/${den}. Count the ticks from zero to point A and watch its sign.`;
      p.solution = `Each tick is 1/${den}, and point A sits ${Math.abs(num)} ticks ${num < 0 ? "left" : "right"} of zero, so A is ${correct}.`;
      p.choices = makeChoices(correct, [neighbor, flip, fourth], ["1", MINUS + "1", "0"], variantIndex);
      p.data = { num, den };
    } else if (form === 1) {
      // compare two points
      const pairs = [[-3, 2], [-5, -1], [0, 3], [-4, -2], [1, 4], [-2, 0]];
      const [a, b] = pick(pairs, variantIndex);
      p.prompt = "Point A shows " + sx(a) + " and point B shows " + sx(b) + " on the number line. Which symbol goes between them: A ? B";
      const correct = a < b ? "<" : ">";
      p.expected = correct;
      p.visual = { type: "line", min: -6, max: 6, unit: 1, sub: 1, points: [{ v: a, label: "A", color: CORAL }, { v: b, label: "B", color: TEAL }] };
      p.hint1 = "On the number line, a number on the left is less than a number on the right.";
      p.hint2 = `Point A is to the ${a < b ? "left" : "right"} of point B.`;
      p.solution = `A is ${a < b ? "left" : "right"} of B on the line, and left means less: ${sx(a)} ${correct} ${sx(b)}.`;
      p.choices = makeChoices(correct, [a < b ? ">" : "<", "=", "≤"], [], variantIndex);
      p.data = { a, b };
    } else {
      // smallest of three
      const triples = [[-4, 1, -2], [0, -3, 2], [-5, -1, -3], [3, -2, 0], [-1, -4, 2]];
      const vals = pick(triples, variantIndex);
      const names = ["A", "B", "C"];
      const colors = [CORAL, TEAL, PURPLE];
      const minI = vals.indexOf(Math.min(...vals));
      const correct = names[minI];
      p.prompt = "Which point shows the smallest number?";
      p.expected = correct;
      p.visual = { type: "line", min: -6, max: 6, unit: 1, sub: 1, points: vals.map((v, i) => ({ v, label: names[i], color: colors[i], show: sx(v) })) };
      p.hint1 = "The smallest number is the one furthest to the left.";
      p.hint2 = `Read each value: A is ${sx(vals[0])}, B is ${sx(vals[1])}, C is ${sx(vals[2])}.`;
      p.solution = `Point ${correct} is furthest left on the line, so it shows the smallest number (${sx(vals[minI])}).`;
      p.choices = makeChoices(correct, names.filter((n) => n !== correct).concat(["They're equal"]), [], variantIndex);
      p.data = { vals };
    }
    p.expectedDisplay = p.expected;
    p.correctInput = { choice: String(p.expected) };
    return p;
  }

  /* ---------------- 4. line-moves ---------------- */
  function lineMovesProblem(variantIndex) {
    const form = variantIndex % 4;
    const useChoice = form === 3 || variantIndex % 2 === 0; // form 3 answers are phrases, always choice
    const p = problemBase("line-moves", variantIndex, useChoice ? "choice" : "filled");
    let expected, wrongs, solution, visual, hint1, hint2, prompt;
    if (form === 0 || form === 2) {
      const a = pick([-8, -5, -3, -1, 2, 4, -6, 3], variantIndex * 3 + form);
      const r = pick([5, 7, 9, 4, 11, 6, 8, 10], variantIndex + 1);
      const l = pick([3, 4, 6, 2, 8, 5, 7, 9], variantIndex * 2 + 3);
      expected = a + r - l;
      prompt = `Point A is at ${sx(a)} on the number line. It moves ${r} units to the right, then ${l} units to the left. Where does it land?`;
      wrongs = [a + r + l, a - r - l, a + r];
      hint1 = "Right moves add, left moves subtract.";
      hint2 = `Compute ${sx(a)} + ${r} − ${l} step by step.`;
      solution = `End = ${sx(a)} + ${r} − ${l} = ${sx(expected)}.`;
      visual = { type: "line", min: Math.min(a, expected, a + r) - 2, max: Math.max(a, expected, a + r) + 2, unit: 1, sub: 1, points: [{ v: a, label: "A", color: NAVY, show: sx(a) }], arcs: [{ from: a, to: a + r, text: `+${r}`, color: TEAL }, { from: a + r, to: expected, text: MINUS + String(l), color: CORAL }] };
      p.data = { a, r, l };
    } else if (form === 1) {
      const m = pick([-7, -4, -2, 0, 3, -9], variantIndex);
      const n = pick([8, 12, 6, 15, 10, 20], variantIndex + 2);
      expected = n - m - 1;
      prompt = `How many integers are there strictly between ${sx(m)} and ${n} on the number line?`;
      wrongs = [n - m, n - m + 1, n - m - 2];
      hint1 = "Strictly between means the two endpoints do not count.";
      hint2 = `From ${sx(m)} to ${n} there are ${n} − (${sx(m)}) gaps; remove the two endpoints.`;
      solution = `Count = ${n} − (${sx(m)}) − 1 = ${expected} integers between ${sx(m)} and ${n}.`;
      visual = { type: "line", min: m - 1, max: n + 1, unit: Math.max(1, Math.round((n - m) / 12)), sub: 1, points: [{ v: m, label: String(sx(m)), color: CORAL }, { v: n, label: String(n), color: TEAL }] };
      p.data = { m, n };
    } else {
      const a = pick([-6, -2, 1, 3, -4, 5], variantIndex + 1);
      const d = pick([5, 8, 3, 10, 6, 4], variantIndex * 2);
      const goRight = variantIndex % 2 === 1;
      const b = goRight ? a + d : a - d;
      const correct = `${d} units ${goRight ? "right" : "left"}`;
      p.prompt = `Point P is at ${sx(a)}. After one move it is at ${sx(b)}. What was the move?`;
      p.expected = correct;
      p.expectedDisplay = correct;
      p.correctInput = { choice: correct };
      p.choices = makeChoices(correct, [`${d} units ${goRight ? "left" : "right"}`, `${Math.abs(a) + Math.abs(b)} units right`, `${Math.abs(d - 2)} units ${goRight ? "right" : "left"}`], ["1 unit left", "2 units right"], variantIndex);
      p.hint1 = "Compare where P started and where it finished: bigger means it went right.";
      p.hint2 = `The distance is ${sx(b)} − (${sx(a)}).`;
      p.solution = `Move = ${sx(b)} − (${sx(a)}) = ${sx(b - a)}, so P moved ${correct}.`;
      p.visual = { type: "line", min: Math.min(a, b) - 2, max: Math.max(a, b) + 2, unit: 1, sub: 1, points: [{ v: a, label: "P", color: NAVY, show: sx(a) }, { v: b, label: "P′", color: CORAL, show: sx(b) }], arcs: [{ from: a, to: b, text: "?", color: CORAL }] };
      p.data = { a, b };
      return p; // choice-only form, fields already set
    }
    p.prompt = prompt;
    p.expected = expected;
    p.expectedDisplay = sx(expected);
    p.correctInput = useChoice ? { choice: String(expected) } : { value: String(expected) };
    p.choices = useChoice ? makeChoices(String(expected), wrongs.map(String), [String(expected + 2), String(expected - 2)], variantIndex) : [];
    p.hint1 = hint1;
    p.hint2 = hint2;
    p.solution = solution;
    p.visual = visual;
    return p;
  }

  /* ---------------- 5. inverse-mirror ---------------- */
  function inverseMirrorProblem(variantIndex) {
    const form = variantIndex % 4;
    const p = problemBase("inverse-mirror", variantIndex, "choice");
    let correct, wrongs;
    if (form === 0) {
      const xs = [7, -12, 2.5, -0.9, 45, -6, 3.5, -21];
      const x = pick(xs, variantIndex);
      const xsStr = sx(x);
      correct = sx(-x);
      wrongs = [xsStr, "0", sx(-2 * x)];
      p.prompt = `What is the additive inverse of ${xsStr}?`;
      p.hint1 = "The additive inverse is the mirror image on the other side of zero.";
      p.hint2 = `Keep the distance ${mag(x)} from zero, but flip the side.`;
      p.solution = `The mirror of ${xsStr} is ${correct}: same distance from zero, opposite side. Together they add to 0.`;
      p.visual = { type: "line", min: -Math.max(6, Math.ceil(Math.abs(x)) + 2), max: Math.max(6, Math.ceil(Math.abs(x)) + 2), unit: Math.max(1, Math.ceil(Math.abs(x) / 5)), sub: 1, mirror: true, points: [{ v: x, label: xsStr, color: NAVY }, { v: -x, label: "?", color: CORAL }] };
      p.data = { x };
    } else if (form === 1) {
      const a = pick([3, 8, 12, 5, 20, 7], variantIndex + 2);
      const forms = [
        { text: `−(−${a})`, ans: a },
        { text: `−(+${a})`, ans: -a },
        { text: `+(−${a})`, ans: -a },
        { text: `−(−(−${a}))`, ans: -a }
      ];
      const f = pick(forms, variantIndex);
      correct = sx(f.ans);
      wrongs = [sx(-f.ans), "0", sx(2 * f.ans)];
      p.prompt = `Simplify: ${f.text}`;
      p.hint1 = "Count the minus signs: an even number of them cancels out.";
      p.hint2 = "Work from the inside out, one sign at a time.";
      p.solution = `${f.text} = ${correct} — the mirror of the mirror brings you back home.`;
      p.visual = { type: "line", min: -a - 3, max: a + 3, unit: Math.max(1, Math.ceil(a / 6)), sub: 1, mirror: true, points: [{ v: f.ans, label: "?", color: CORAL }] };
      p.data = { a, f: f.text };
    } else if (form === 2) {
      const a = pick([4, 9, 6, 11, 15, 2], variantIndex);
      correct = `${sx(a)} and ${sx(-a)}`;
      wrongs = [`${sx(a)} and ${sx(a)}`, `${sx(a)} and 0`, `${sx(a)} and 1/${a}`];
      p.prompt = "Which pair of numbers are additive inverses?";
      p.hint1 = "Additive inverses are the same distance from zero, on opposite sides.";
      p.hint2 = `The mirror of ${sx(a)} is ${sx(-a)}.`;
      p.solution = `${sx(a)} and ${sx(-a)} are mirrors around zero and add to 0, so they are additive inverses.`;
      p.visual = { type: "line", min: -a - 3, max: a + 3, unit: Math.max(1, Math.ceil(a / 6)), sub: 1, mirror: true, points: [{ v: a, label: sx(a), color: TEAL }, { v: -a, label: sx(-a), color: CORAL, secret: true }] };
      p.data = { a };
    } else {
      const d = pick([6, 8, 10, 12, 14, 4], variantIndex); // even distance
      correct = sx(-d / 2);
      wrongs = [sx(d / 2), sx(-d), sx(d)];
      p.prompt = `A point moves ${d} units to the right and lands exactly on its additive inverse. Where did it start?`;
      p.hint1 = "The start and the finish are mirrors, so zero sits exactly halfway along the move.";
      p.hint2 = `Half the move: ${d} / 2 = ${d / 2}. It moved right, so the start is the negative one.`;
      p.solution = `Half the move is ${d} / 2 = ${d / 2}. Moving right from the start to its mirror means the start is ${correct}.`;
      p.visual = { type: "line", min: -d / 2 - 3, max: d / 2 + 3, unit: 1, sub: 1, mirror: true, points: [{ v: -d / 2, label: "start?", color: NAVY }, { v: d / 2, label: sx(d / 2), color: CORAL }], arcs: [{ from: -d / 2, to: d / 2, text: `+${d}`, color: TEAL }] };
      p.data = { d };
    }
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = makeChoices(correct, wrongs, ["1", MINUS + "1", "2"], variantIndex);
    return p;
  }

  /* ---------------- 6. absolute-value ---------------- */
  function absoluteValueProblem(variantIndex) {
    const form = variantIndex % 4;
    const useChoice = form !== 0 || variantIndex % 2 === 0;
    const p = problemBase("absolute-value", variantIndex, useChoice ? "choice" : "filled");
    let correct, wrongs;
    if (form === 0) {
      const xs = [-9, 2.5, -156, 2000, -7, 14, -3.5, 60];
      let x = pick(xs, variantIndex);
      if (!useChoice && !Number.isInteger(Math.abs(x))) x = -9; // filled variants stay integer-clean
      correct = mag(x);
      wrongs = [sx(-Math.abs(x)), "0", mag(2 * x)];
      p.prompt = `Find the absolute value |${sx(x)}|.`;
      p.hint1 = "Absolute value is the distance from zero — distance is never negative.";
      p.hint2 = `How far is ${sx(x)} from 0?`;
      p.solution = `|${sx(x)}| = ${correct} because ${sx(x)} is exactly ${correct} away from zero.`;
      p.visual = { type: "line", min: -Math.max(6, Math.ceil(Math.abs(x)) + 2), max: Math.max(6, Math.ceil(Math.abs(x)) + 2), unit: Math.max(1, Math.ceil(Math.abs(x) / 5)), sub: 1, points: [{ v: x, label: sx(x), color: CORAL }], brace: { a: Math.min(0, x), b: Math.max(0, x), text: `distance ${correct}` } };
      p.data = { x };
    } else if (form === 1) {
      const cases = [{ p: 2.4, q: 5 }, { p: 1.4, q: 4 }, { p: 3.4, q: 6 }, { p: 4.5, q: 7 }];
      const c = pick(cases, variantIndex);
      const lo = Math.floor(c.p) + 1, hi = Math.ceil(c.q) - 1; // integers k with p < k < q... but careful with |x| range
      const vals = [];
      for (let k = lo; k <= hi; k++) vals.push(-k);
      correct = vals.map(sx).join(" and ");
      wrongs = [
        vals.concat([-Math.round(c.q)]).map(sx).join(", ").replace(/, ([^,]*)$/, " and $1"),
        vals.map((v) => sx(-v)).join(" and "),
        [-(lo - 1) === 0 ? -1 : -(lo - 1), -lo].map(sx).join(" and ")
      ];
      p.prompt = `Find all the negative integers whose absolute value is greater than ${c.p} and smaller than ${c.q}.`;
      p.hint1 = "Translate to absolute values first: which integers k satisfy the range? Then take the negative ones.";
      p.hint2 = `The allowed absolute values are the integers from ${lo} to ${hi}.`;
      p.solution = `The absolute values allowed are ${lo} through ${hi}, and we need the negative integers: ${correct}. (Strict bounds, so ${sx(-Math.round(c.q))} is not included.)`;
      p.visual = { type: "line", min: -Math.round(c.q) - 1, max: Math.round(c.q) + 1, unit: 1, sub: 1, points: vals.map((v) => ({ v, label: sx(v), color: CORAL, secret: true })) };
      p.data = { p: c.p, q: c.q };
    } else if (form === 2) {
      const a = pick([5, 3, 8, 6, 10, 4], variantIndex + 1);
      correct = `${a} or ${MINUS}${a}`;
      wrongs = [`${a} only`, `${MINUS}${a} only`, "0"];
      p.prompt = `Given |x| = ${a}, what are the possible values of x?`;
      p.hint1 = "How many points on the number line are at that exact distance from zero?";
      p.hint2 = "One hides on the right of zero, the other on the left.";
      p.solution = `Two points are at distance ${a} from zero: x = ${a} or x = ${MINUS}${a}.`;
      p.visual = { type: "line", min: -a - 3, max: a + 3, unit: 1, sub: 1, points: [{ v: a, label: sx(a), color: TEAL, secret: true }, { v: -a, label: sx(-a), color: CORAL, secret: true }], brace: { a: -a, b: 0, text: `distance ${a}` } };
      p.data = { a };
    } else {
      const pairs = [[2, 3], [3, 4], [2, 5], [1, 4], [3, 5]];
      const [m, n] = pick(pairs, variantIndex);
      const hi = m + n, lo = Math.abs(m - n);
      correct = `${hi}, ${lo}, ${MINUS}${lo} or ${MINUS}${hi}`;
      wrongs = [`${hi} only`, `${hi} or ${MINUS}${hi} only`, `${lo} or ${MINUS}${lo} only`];
      p.prompt = `Given |a| = ${m} and |b| = ${n}, what are the possible values of a + b?`;
      p.hint1 = "Each letter has two hiding places, so there are four combinations to check.";
      p.hint2 = `a is ${m} or ${MINUS}${m}; b is ${n} or ${MINUS}${n}. Add every pair.`;
      p.solution = `The four sums are ${hi}, ${lo}, ${MINUS}${lo} and ${MINUS}${hi} — so a + b can be ${correct}.`;
      p.visual = { type: "line", min: -hi - 1, max: hi + 1, unit: 1, sub: 1, points: [{ v: hi, label: sx(hi), color: TEAL, secret: true }, { v: lo, label: sx(lo), color: AMBER, secret: true }, { v: -lo, label: sx(-lo), color: AMBER, secret: true }, { v: -hi, label: sx(-hi), color: CORAL, secret: true }] };
      p.data = { m, n };
    }
    p.expected = useChoice ? correct : Number(correct);
    p.expectedDisplay = String(correct);
    p.correctInput = useChoice ? { choice: String(correct) } : { value: String(correct) };
    p.choices = useChoice ? makeChoices(String(correct), wrongs.map(String), ["1", MINUS + "2", "0"], variantIndex) : [];
    return p;
  }

  /* ---------------- engine ---------------- */
  const GENERATORS = {
    "sign-sense": signSenseProblem,
    "rational-detective": rationalDetectiveProblem,
    "line-reader": lineReaderProblem,
    "line-moves": lineMovesProblem,
    "inverse-mirror": inverseMirrorProblem,
    "absolute-value": absoluteValueProblem
  };
  function generateProblem(classicId, variantIndex) {
    const id = CLASSIC_BY_ID[classicId] ? classicId : CLASSIC_IDS[0];
    const problem = GENERATORS[id](variantIndex || 0);
    if (problem && CLASSIC_SKILLS[id]) problem.skillTag = CLASSIC_SKILLS[id];
    return problem;
  }
  function checkAnswer(problem, input) {
    if (!problem) return { isCorrect: false, errorClass: "missing_problem" };
    if (problem.answerType === "choice") {
      const value = String(input.choice ?? input.value ?? "");
      const correct = value === String(problem.correctInput.choice ?? problem.expected);
      return { isCorrect: correct, errorClass: correct ? null : "choice_mismatch" };
    }
    const value = parseNumber(input.value ?? input.choice);
    const correct = Number.isFinite(value) && Math.abs(value - Number(problem.expected)) < 1e-8;
    return { isCorrect: correct, errorClass: correct ? null : "number_mismatch" };
  }
  function validateProblemMath(problem) {
    const d = problem.data || {};
    switch (problem.classicId) {
      case "sign-sense": return Number.isFinite(d.n);
      case "line-reader": return d.a !== undefined ? (problem.expected === (d.a < d.b ? "<" : ">")) : true;
      case "line-moves": {
        if (d.a !== undefined && d.b !== undefined) return Math.abs((d.b - d.a)) > 0;
        if (d.m !== undefined) return problem.expected === d.n - d.m - 1;
        if (d.r !== undefined) return problem.expected === d.a + d.r - d.l;
        return true;
      }
      case "inverse-mirror": return true;
      case "absolute-value": return d.x !== undefined ? Math.abs(Number(problem.expected) - Math.abs(d.x)) < 1e-9 : true;
      default: return problem.expected !== undefined;
    }
  }

  /* ---------------- visuals ---------------- */
  function renderProblemVisual(problem, state = "initial") {
    const v = problem.visual || {};
    const revealed = state === "solution" || state === "worked";
    const answer = revealed ? `<text x="280" y="316" text-anchor="middle" font-size="16" font-weight="bold" fill="${NAVY}">Answer: ${escapeHtml(problem.expectedDisplay)}</text>` : "";
    let html = "";
    let text = problem.skill;
    if (v.type === "thermo") {
      html = thermoSvg(revealed ? v.value : v.value, v.unit, revealed) .replace("</svg>", answer + "</svg>");
      text = revealed ? "The marker sits on the signed value." : "Decide the sign first, then the size.";
    } else if (v.type === "buckets") {
      html = bucketsSvg(v.chip, revealed, v.bucket).replace("</svg>", answer + "</svg>");
      text = revealed ? "The chip drops into its bucket." : "Sort the number into the right bucket.";
    } else if (v.type === "line") {
      const cfg = { min: v.min, max: v.max, unit: v.unit, sub: v.sub, mirror: v.mirror, arcs: v.arcs, brace: revealed ? v.brace : undefined, points: (v.points || []).map((pt) => ({ ...pt, label: !revealed && pt.secret ? "?" : pt.label, show: revealed ? (pt.show || (pt.secret ? pt.label : undefined)) : undefined })) };
      html = numberLineSvg(cfg).replace("</svg>", answer + "</svg>");
      text = revealed ? "The line shows the answer." : "Read the line carefully: left is less, right is more.";
    }
    return { html, text };
  }

  /* ---------------- intro scenes ---------------- */
  const INTRO_SCENES = [
    {
      title: "Below Zero",
      purpose: "Meet positive and negative numbers as two sides of zero.",
      classicId: "sign-sense",
      caption: "Above zero is positive, below zero is negative — and zero itself is neither.",
      voiceover: "What is colder than zero? Today Pip stands next to a giant thermometer and discovers that numbers can dive below zero: frosty temperatures, divers under the sea, and money you owe all live on the negative side, while above zero everything is positive. Zero itself is the quiet boundary — neither positive nor negative."
    },
    {
      title: "The Rational Club",
      purpose: "Know exactly which numbers count as rational — and which are impostors.",
      classicId: "rational-detective",
      caption: "Integers, fractions, and decimals that stop or repeat: welcome to the club. π stays outside.",
      voiceover: "Some numbers belong to a big friendly club called the rationals: every integer, every fraction, and decimals that stop or repeat forever. But watch out for impostors! Pi and strange decimals that never repeat and never stop cannot join, because a rational number can always be written as one integer over another."
    },
    {
      title: "The Number Road",
      purpose: "See every rational number owning an address on the number line.",
      classicId: "line-reader",
      caption: "Left is less, right is more — comparing numbers becomes reading a map.",
      voiceover: "Imagine a road that runs forever in both directions. Every rational number owns an address on it: integers, halves, thirds, even tricky decimals. The golden rule of the road: a number on the left is always less than a number on the right, so comparing numbers becomes as easy as reading a map."
    },
    {
      title: "Hopping Along",
      purpose: "Turn right and left moves into adding and subtracting.",
      classicId: "line-moves",
      caption: "Hop right to add, hop left to subtract — then count the integers between two fences.",
      voiceover: "Pip the grasshopper loves the number road. Every hop to the right adds, and every hop to the left subtracts. Chain the hops carefully and you can land exactly where you want — or work backwards from where Pip landed to figure out where his journey secretly began."
    },
    {
      title: "Mirror Mirror",
      purpose: "Additive inverses as mirror twins around zero, summing to zero.",
      classicId: "inverse-mirror",
      caption: "Same distance, opposite side: mirror twins always add to zero.",
      voiceover: "Every number has a mirror twin on the other side of zero, exactly the same distance away. These twins are called additive inverses, and together they always add to zero. Beware the double negative: the mirror of the mirror brings you right back home."
    },
    {
      title: "Distance Never Lies",
      purpose: "Absolute value as distance from zero — and the two-answer trap.",
      classicId: "absolute-value",
      caption: "Distance is never negative — so |x| = 5 has two hiding places, not one.",
      voiceover: "How far is negative seven from zero? Exactly seven steps. Distance never comes with a minus sign, and that is the whole idea of absolute value. It also explains a famous trap: when the absolute value of x equals five, x has two possible hiding places, not one."
    }
  ];
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
  root.RationalNumbersModule = api;
})(typeof window !== "undefined" ? window : globalThis);
