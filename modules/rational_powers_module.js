/* Powers & Standard Form module (G1 Lesson 4, Think Academy G1M L1-L8 study book).
   Dialect A (train-style): CLASSICS + generateProblem + checkAnswer +
   renderProblemVisual + INTRO_SCENES + createRound.
   All generators are procedural with exact, audit-clean answers (integers are
   filled-or-choice; every fraction, decimal-root, standard-form and word answer
   is a choice-mode string). Distractors target the lesson's known misconceptions:
   √ symbol vs both square roots, sign flips with negative bases, (−a)ⁿ vs −aⁿ,
   powering only the top of a fraction, A outside 1..10 in standard form, and
   exponent off-by-one point jumps (book Lessons: squares/cubes & roots 51-55,
   powers of positive/negative numbers 56-57, standard form 58-61, Stage Test 64-66). */
(function (root) {
  "use strict";

  const CLASSICS = [
    { id: "root-rocket", nickname: "Root Rocket", skill: "Squares, cubes, square roots and cube roots — including decimals, fractions and negatives.", sourcePages: "Book 51-55+64 / PDF 59-63+72" },
    { id: "sign-of-power", nickname: "Sign of the Power", skill: "Powers of negative numbers: odd powers stay negative, even powers turn positive.", sourcePages: "Book 56-57 / PDF 64-65" },
    { id: "fraction-powers", nickname: "Fraction Power Tower", skill: "Power the top AND the bottom; spot where the minus and the exponent really sit.", sourcePages: "Book 56-57 / PDF 64-65" },
    { id: "standard-writer", nickname: "Standard Form Scribe", skill: "Write huge and tiny numbers as A × 10ⁿ with 1 ≤ A < 10 — and back again.", sourcePages: "Book 58-61+64 / PDF 66-69+72" },
    { id: "standard-compare", nickname: "Compare the Cosmos", skill: "Compare, order and compute with standard-form numbers from satellites and stars.", sourcePages: "Book 60-61+64-65 / PDF 68-69+72-73" },
    { id: "power-capstone", nickname: "Power Capstone", skill: "Two-step roots, light-year leaps, sign ladders and ordering mixed powers.", sourcePages: "Book 54-55+57+65-66 / PDF 62-63+65+73-74" }
  ];
  const CLASSIC_IDS = CLASSICS.map((c) => c.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((c) => [c.id, c]));
  const CLASSIC_SKILLS = {
    "root-rocket": "Roots & perfect powers",
    "sign-of-power": "Sign of the power",
    "fraction-powers": "Power top & bottom",
    "standard-writer": "A × 10ⁿ scribe",
    "standard-compare": "Compare & compute",
    "power-capstone": "Two-step capstone"
  };
  const SOURCE_COVERAGE = {
    "root-rocket": ["Let's Get Ready squares & cubes (book 52)", "Learn and Discover roots (book 52-53)", "After Class roots 1-6 (book 54-55)", "Stage Test 1-4 (book 64)"],
    "sign-of-power": ["Learn and Discover 3⁴ vs (−3)⁴ (book 56)", "Notes sign rules (book 56)", "After Class odd/even powers (book 57)", "Extensive (−1)ⁿ sums (book 66)"],
    "fraction-powers": ["Learn and Discover (−3/5)⁴ vs −(3/5)⁴ vs 3⁴/5 (book 56)", "After Class 1-3 (book 57)", "Extensive zero-sum puzzles |x−3|+(y+2)²=0 (book 57)"],
    "standard-writer": ["Learn and Discover A × 10ⁿ (book 58)", "Notes 1 ≤ A < 10 (book 59)", "After Class 1-4 (book 60-61)", "Stage Test 5-8 (book 64)"],
    "standard-compare": ["Exploration satellite & star (book 60)", "After Class compare & order (book 61)", "Extensive zeros count + Pierre (book 64-65)"],
    "power-capstone": ["Two-step roots (book 54-55)", "Ordering powers of −0.6 (book 56)", "Proxima light-year (book 65)", "Stage Test capstones (book 65-66)"]
  };
  const INTRO_SCENE_MS = 20000;
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
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
  function fracStr(num, den) { // signed fraction display, reduced
    const g = gcd(num, den);
    const rn = num / g, rd = den / g;
    const sign = rn < 0 ? MINUS : "";
    if (rd === 1) return sign + Math.abs(rn);
    return `${sign}${Math.abs(rn)}/${rd}`;
  }
  // Exact rational arithmetic: F(n,d) is a normalized fraction {n,d}, d > 0.
  function F(n, d = 1) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  }
  function fmul(a, b) { return F(a.n * b.n, a.d * b.d); }
  function fneg(a) { return F(-a.n, a.d); }
  function fstr(f) { return fracStr(f.n, f.d); }
  function Fdisp(f) { return f.d === 1 ? f.n : fstr(f); } // number for integers, "a/b" string otherwise
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
  // Attach numeric-answer fields (filled or choice by flag).
  function finishNumeric(p, expected, wrongs, fallbacks, useChoice, variantIndex) {
    const disp = (w) => (typeof w === "number" ? sx(w) : String(w)); // unify minus signs before dedup
    p.expected = expected; // always the raw number — validators/audit rely on it
    p.expectedDisplay = sx(expected);
    p.correctInput = useChoice ? { choice: sx(expected) } : { value: String(expected) };
    p.choices = useChoice ? makeChoices(sx(expected), wrongs.map(disp), fallbacks.map(disp), variantIndex) : [];
    return p;
  }
  // Attach a rational answer: integer answers may be filled (or choice by flag);
  // non-integer fraction answers are ALWAYS choice-mode strings (module convention).
  function finishFraction(p, ansF, wrongs, fallbacks, useChoice, variantIndex) {
    if (ansF.d === 1 && !useChoice) {
      return finishNumeric(p, ansF.n, wrongs.map(Fdisp), fallbacks.map(Fdisp), false, variantIndex);
    }
    const correct = String(Fdisp(ansF));
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = makeChoices(correct, wrongs.map(Fdisp).map(String), fallbacks.map(Fdisp).map(String), variantIndex);
    return p;
  }
  // Choice-mode string answer (standard form, sign words, relations, expressions…).
  function finishChoice(p, correct, wrongs, fallbacks, variantIndex) {
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = makeChoices(correct, wrongs, fallbacks, variantIndex);
    return p;
  }

  /* ---------------- powers & standard-form helpers ---------------- */
  const SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  function sup(n) { return String(n).split("").map((ch) => SUP[ch] || ch).join(""); } // −4 → ⁻⁴
  function sfStr(a, n) { return `${a} × 10${sup(n)}`; } // a is a STRING coefficient
  function powF(f, k) { // exact rational power via repeated multiplication
    let r = F(1, 1);
    for (let i = 0; i < k; i++) r = fmul(r, f);
    return r;
  }
  // Move the decimal point of a clean digit string one place right ("5.2" → "52", "4.21" → "42.1", "7" → "70").
  function shiftPointRight(aStr) {
    const dot = aStr.indexOf(".");
    if (dot === -1) return aStr + "0";
    const digits = aStr.replace(".", "");
    const pos = dot + 1;
    if (pos >= digits.length) return digits + "0".repeat(pos - digits.length);
    return digits.slice(0, pos) + "." + digits.slice(pos);
  }
  // Expand A × 10ⁿ to a plain digit string (exact, no floats). aStr clean like "4.21", n any int.
  function expandSF(aStr, n) {
    let s = String(aStr), neg = false;
    if (s.startsWith("-") || s.startsWith(MINUS)) { neg = true; s = s.slice(1); }
    const dot = s.indexOf(".");
    const digits = s.replace(".", "");
    const point = dot === -1 ? s.length : dot;
    const newPoint = point + n;
    let out;
    if (newPoint <= 0) out = "0." + "0".repeat(-newPoint) + digits;
    else if (newPoint >= digits.length) out = digits + "0".repeat(newPoint - digits.length);
    else out = digits.slice(0, newPoint) + "." + digits.slice(newPoint);
    return (neg ? MINUS : "") + out;
  }
  // Parse a plain numeric string ("−9/16", "2/3", "0.7", "−8") to a float — validation only.
  function evalPlain(s) {
    const t = String(s).replaceAll(MINUS, "-").trim();
    if (t.includes("/")) {
      const [a, b] = t.split("/");
      return parseFloat(a) / parseFloat(b);
    }
    return parseFloat(t);
  }

  /* ---------------- generic SVG bits ---------------- */
  const NAVY = "#16345d", CORAL = "#ff7654", TEAL = "#0b8993", AMBER = "#e8a20c", PURPLE = "#7a4fd0";
  const RED = "#ff8a94", BLUE = "#7fb7ff";
  function svgShell(inner) {
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Problem visual">${inner}</svg>`;
  }
  // White working card. v = {title, expr, lines[], steps[] (shown when revealed)}
  function cardSvg(v, revealed) {
    let s = `<rect x="0" y="0" width="560" height="330" fill="#f4f9ff"/>`;
    s += `<rect x="52" y="50" width="456" height="230" rx="20" fill="white" stroke="${NAVY}" stroke-width="4"/>`;
    if (v.title) s += `<text x="280" y="88" text-anchor="middle" font-size="15" font-weight="bold" fill="${PURPLE}">${escapeHtml(v.title)}</text>`;
    s += `<text x="280" y="${v.title ? 132 : 118}" text-anchor="middle" font-size="${(v.expr || "").length > 26 ? 19 : 24}" font-weight="800" fill="${NAVY}">${escapeHtml(v.expr)}</text>`;
    const rows = (revealed && v.steps ? v.steps : v.lines || []).slice(0, 4);
    rows.forEach((ln, i) => {
      s += `<text x="280" y="${178 + i * 26}" text-anchor="middle" font-size="16" fill="${revealed && v.steps ? TEAL : "#4a5578"}" ${revealed && v.steps ? 'font-weight="bold"' : ""}>${escapeHtml(ln)}</text>`;
    });
    return svgShell(s);
  }
  // Sign-flip power ladder: 1, base, base², … with red=positive / blue=negative boxes.
  // v = {title, base (display string), values[] (display strings, starting at 1), note}
  function ladderSvg(v, revealed) {
    let s = `<rect x="0" y="0" width="560" height="330" fill="#f4f9ff"/>`;
    if (v.title) s += `<text x="280" y="40" text-anchor="middle" font-size="15" font-weight="bold" fill="${PURPLE}">${escapeHtml(v.title)}</text>`;
    const vals = v.values.slice(0, 7);
    const n = vals.length;
    const bw = Math.min(86, 500 / n - 8), bh = 46;
    const gap = (500 - n * bw) / (n - 1 || 1);
    const y = 150;
    vals.forEach((val, i) => {
      const x = 30 + i * (bw + gap);
      const isNeg = String(val).startsWith(MINUS) || String(val).startsWith("-");
      const last = i === n - 1;
      s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="10" fill="${isNeg ? BLUE : RED}" stroke="${last && revealed ? AMBER : NAVY}" stroke-width="${last && revealed ? 4 : 2}"/>`;
      s += `<text x="${x + bw / 2}" y="${y + bh / 2 + 6}" text-anchor="middle" font-size="${String(val).length > 4 ? 15 : 19}" font-weight="800" fill="${NAVY}">${escapeHtml(val)}</text>`;
      if (i < n - 1) {
        const ax = x + bw + gap / 2;
        s += `<text x="${ax}" y="${y - 12}" text-anchor="middle" font-size="13" font-weight="bold" fill="${CORAL}">× ${escapeHtml(v.base)}</text>`;
        s += `<line x1="${x + bw + 3}" y1="${y + bh / 2}" x2="${x + bw + gap - 3}" y2="${y + bh / 2}" stroke="${NAVY}" stroke-width="2"/>`;
      }
      s += `<text x="${x + bw / 2}" y="${y + bh + 22}" text-anchor="middle" font-size="12" fill="#4a5578">${i === 0 ? "start" : `${escapeHtml(v.base)}${sup(i)}`}</text>`;
    });
    const note = revealed && v.note ? v.note : "watch the sign flip-flop as the power grows";
    s += `<text x="280" y="246" text-anchor="middle" font-size="15" font-weight="${revealed ? "bold" : "normal"}" fill="${revealed ? TEAL : "#4a5578"}">${escapeHtml(note)}</text>`;
    return svgShell(s);
  }
  // Decimal-point rocket: digit string with a jump arc from old point to new point.
  // v = {title, digits, pointFrom (index of char AFTER which the point sits), pointTo, places, result (revealed)}
  function zoomSvg(v, revealed) {
    let s = `<rect x="0" y="0" width="560" height="330" fill="#f4f9ff"/>`;
    s += `<rect x="52" y="50" width="456" height="230" rx="20" fill="white" stroke="${NAVY}" stroke-width="4"/>`;
    if (v.title) s += `<text x="280" y="88" text-anchor="middle" font-size="15" font-weight="bold" fill="${PURPLE}">${escapeHtml(v.title)}</text>`;
    const cw = Math.min(26, 400 / Math.max(v.digits.length, 8));
    const x0 = 280 - ((v.digits.length - 1) * cw) / 2;
    const y = 150;
    for (let i = 0; i < v.digits.length; i++) {
      s += `<text x="${x0 + i * cw}" y="${y}" text-anchor="middle" font-size="26" font-weight="800" fill="${NAVY}" font-family="monospace">${escapeHtml(v.digits[i])}</text>`;
    }
    const px = (idx) => x0 + idx * cw + cw / 2;
    const fromX = px(v.pointFrom), toX = px(v.pointTo);
    s += `<circle cx="${fromX}" cy="${y + 14}" r="5" fill="${CORAL}"/>`;
    if (revealed) {
      const midY = y + 62;
      s += `<path d="M ${fromX} ${y + 26} Q ${(fromX + toX) / 2} ${midY + 26} ${toX} ${y + 26}" fill="none" stroke="${AMBER}" stroke-width="3" stroke-dasharray="7 5" marker-end="url(#none)"/>`;
      s += `<circle cx="${toX}" cy="${y + 14}" r="6" fill="${AMBER}" stroke="${NAVY}" stroke-width="1.5"/>`;
      s += `<text x="${(fromX + toX) / 2}" y="${midY + 22}" text-anchor="middle" font-size="15" font-weight="bold" fill="${AMBER}">${escapeHtml(v.places)}</text>`;
      s += `<text x="280" y="248" text-anchor="middle" font-size="19" font-weight="800" fill="${TEAL}">${escapeHtml(v.result)}</text>`;
    } else {
      s += `<text x="280" y="248" text-anchor="middle" font-size="15" fill="#4a5578">where does the point land? count the jumps</text>`;
    }
    return svgShell(s);
  }

  /* ---------------- 1. root-rocket ---------------- */
  const RR_POWERS = [[8, 2], [15, 2], [9, 3], [20, 3], [12, 2], [7, 3], [11, 2], [6, 3], [13, 2], [4, 3], [16, 2], [5, 3]];
  const RR_BASES = [[49, 7, 2], [900, 30, 2], [64, 4, 3], [125, 5, 3], [36, 6, 2], [27, 3, 3], [144, 12, 2], [8, 2, 3], [121, 11, 2], [1000, 10, 3], [225, 15, 2], [343, 7, 3]];
  const RR_SQRT = [ // [radicand string, root string, negative prefix?] — answers are choice strings
    ["100", "10", false], ["0.49", "0.7", true], ["4/9", "2/3", false], ["3.61", "1.9", false],
    ["1.69", "1.3", false], ["1.96", "1.4", false], ["49/64", "7/8", false], ["81/256", "9/16", true],
    ["64/289", "8/17", true], ["0.25", "0.5", false], ["9/16", "3/4", false], ["0.81", "0.9", false]
  ];
  const RR_SQRT_WRONGS = [
    [MINUS + "10", "50", "5"], ["0.7", MINUS + "0.07", MINUS + "7"], [MINUS + "2/3", "3/2", "2/9"],
    [MINUS + "1.9", "0.19", "19"], [MINUS + "1.3", "0.13", "13"], [MINUS + "1.4", "0.14", "14"],
    [MINUS + "7/8", "8/7", "7/64"], ["9/16", MINUS + "16/9", MINUS + "9/256"], ["8/17", MINUS + "17/8", MINUS + "8/289"],
    [MINUS + "0.5", "0.05", "5"], [MINUS + "3/4", "4/3", "3/16"], [MINUS + "0.9", "0.09", "9"]
  ];
  const RR_CBRT = [ // [radicand string, root string]
    [MINUS + "8", MINUS + "2"], ["0.125", "0.5"], ["27/125", "3/5"], [MINUS + "27/125", MINUS + "3/5"],
    [MINUS + "0.027", MINUS + "0.3"], ["0.064", "0.4"], [MINUS + "64/125", MINUS + "4/5"], ["8/27", "2/3"],
    [MINUS + "1/64", MINUS + "1/4"], ["0.027", "0.3"], ["1000", "10"], [MINUS + "0.001", MINUS + "0.1"]
  ];
  const RR_CBRT_WRONGS = [
    ["2", "no real cube root", MINUS + "4"], [MINUS + "0.5", "0.25", "5"], [MINUS + "3/5", "5/3", "9/25"],
    ["3/5", MINUS + "5/3", MINUS + "9/25"], ["0.3", MINUS + "0.03", MINUS + "3"], [MINUS + "0.4", "0.04", "4"],
    ["4/5", MINUS + "5/4", MINUS + "16/25"], [MINUS + "2/3", "3/2", "4/9"], ["1/4", MINUS + "4", MINUS + "1/16"],
    [MINUS + "0.3", "0.03", "3"], [MINUS + "10", "100", "10/3"], ["0.1", MINUS + "0.01", MINUS + "1"]
  ];
  const RR_BOTH = [[9, "3"], [25, "5"], [49, "7"], ["0.36", "0.6"], ["4/25", "2/5"], ["1.21", "1.1"]];
  const RR_TRUTHS = [
    { correct: "The √ symbol gives only the positive square root", wrongs: ["√16 means both 4 and " + MINUS + "4", "Negative numbers have square roots", "Every number has exactly one square root"] },
    { correct: "A negative number has exactly one cube root — a negative one", wrongs: ["Negative numbers have no cube roots", "∛(" + MINUS + "8) is 2", "A number's cube root always has two values"] },
    { correct: "Every positive number has two square roots", wrongs: ["Only perfect squares have square roots", "The square roots of 25 are 5 and 0", "A positive number has only one square root"] }
  ];
  function radDisp(rad) { return rad.includes("/") ? `√(${rad})` : `√${rad}`; }
  function rootRocketProblem(vi) {
    const form = vi % 4;
    const slot = Math.floor(vi / 4); // cycles fully within each form
    if (form === 0) {
      const sub = slot % 2;
      if (sub === 0) {
        const [x, k] = pick(RR_POWERS, slot);
        const expected = x ** k;
        const word = k === 2 ? "square" : "cube";
        const chain = Array.from({ length: k }, () => String(x)).join(" × ");
        const p = problemBase("root-rocket", vi, slot % 2 === 0 ? "choice" : "filled");
        p.prompt = `Work out ${x}${sup(k)}.`;
        p.hint1 = `A power is repeated multiplication: ${x}${sup(k)} means ${k === 2 ? "two" : "three"} copies of ${x} multiplied together.`;
        p.hint2 = `Write it out: ${chain}.`;
        p.solution = `${x}${sup(k)} means ${chain} = ${expected}. The ${word} of ${x} is ${expected}.`;
        p.visual = { type: "card", title: `the ${word} rocket`, expr: `${x}${sup(k)}`, lines: [`${k} copies of ${x} multiplied`, chain], steps: [`${chain} = ${expected}`] };
        p.data = { form, sub, x, k };
        return finishNumeric(p, expected, [x * k, expected + x, expected - x], [expected + 1, expected - 1, expected * 2], slot % 2 === 0, vi);
      }
      const [N, base, k] = pick(RR_BASES, slot);
      const chain = Array.from({ length: k }, () => String(base)).join(" × ");
      const p = problemBase("root-rocket", vi, slot % 2 === 1 ? "choice" : "filled");
      p.prompt = k === 2
        ? `The square of a positive number is ${N}. What is the number?`
        : `The cube of a number is ${N}. What is the number?`;
      p.hint1 = k === 2 ? `Which number times itself gives ${N}? Try some perfect squares.` : `Which number, multiplied three times, gives ${N}?`;
      p.hint2 = `Test it: ${chain}.`;
      p.solution = `${chain} = ${N}, so the number is ${base}.${k === 2 ? ` (The square roots of ${N} are ${base} and ${sx(-base)}, but the question asks for the positive one.)` : ""}`;
      p.visual = { type: "card", title: "find the base", expr: `?${sup(k)} = ${N}`, lines: ["try repeated multiplication", chain], steps: [`${chain} = ${N}`, `answer: ${base}`] };
      p.data = { form, sub, N, base, k };
      return finishNumeric(p, base, [base + 1, base - 1, base * 2], [base + 2, base - 2, base * 3], slot % 2 === 1, vi);
    }
    if (form === 1) {
      const idx = slot % RR_SQRT.length;
      const [rad, rootStr, neg] = RR_SQRT[idx];
      const ans = neg ? MINUS + rootStr : rootStr;
      const expr = (neg ? MINUS : "") + radDisp(rad);
      const chain = rootStr.includes("/")
        ? `(${rootStr}) × (${rootStr}) = ${rad}`
        : `${rootStr} × ${rootStr} = ${rad}`;
      const p = problemBase("root-rocket", vi, "choice");
      p.prompt = `Work out ${expr}.`;
      p.hint1 = neg ? "First find the plain square root — then keep the minus that sits in front." : "The √ symbol asks: which NON-NEGATIVE number, squared, gives the inside?";
      p.hint2 = `Check by squaring: ${chain}.`;
      p.solution = neg
        ? `${chain}, so ${radDisp(rad)} is ${rootStr}; the minus in front stays: ${expr} is ${ans}.`
        : `${chain}, so ${expr} is ${ans}. (The √ symbol only ever gives the positive root.)`;
      p.visual = { type: "card", title: "root rocket — square root", expr, lines: ["square which number?", chain.replace(/ = .*/, "")], steps: [chain, `answer: ${ans}`] };
      p.data = { form, rad, ans, k: 2 };
      return finishChoice(p, ans, RR_SQRT_WRONGS[idx], ["1", MINUS + "1", "0"], vi);
    }
    if (form === 2) {
      const idx = slot % RR_CBRT.length;
      const [rad, rootStr] = RR_CBRT[idx];
      const factor = rootStr.startsWith(MINUS) || rootStr.includes("/") ? `(${rootStr})` : rootStr;
      const chain = `${factor} × ${factor} × ${factor} = ${rad}`;
      const expr = `∛(${rad})`;
      const p = problemBase("root-rocket", vi, "choice");
      p.prompt = `Work out ${expr}.`;
      p.hint1 = "Cube roots keep the sign: a negative inside means a negative root — exactly one answer.";
      p.hint2 = `Check by cubing: ${chain}.`;
      p.solution = `${chain}, so ${expr} is ${rootStr}. Every number has exactly ONE cube root.`;
      p.visual = { type: "card", title: "root rocket — cube root", expr, lines: ["cube which number?", `${factor} × ${factor} × ${factor}`], steps: [chain, `answer: ${rootStr}`] };
      p.data = { form, rad, ans: rootStr, k: 3 };
      return finishChoice(p, rootStr, RR_CBRT_WRONGS[idx], ["1", MINUS + "1", "0"], vi);
    }
    // form 3: concept — two square roots / root facts (always choice)
    const sub = slot % 2;
    if (sub === 0) {
      const [N, r] = pick(RR_BOTH, slot);
      const correct = `${r} and ${MINUS}${r}`;
      const sq = (s) => (s.includes("/") ? `(${s}) × (${s})` : `${s} × ${s}`);
      const p = problemBase("root-rocket", vi, "choice");
      p.prompt = `The square roots of ${N} are ___.`;
      p.hint1 = "Careful — TWO different numbers square to give the same positive result.";
      p.hint2 = `${sq(r)} = ${N} and (${MINUS}${r}) × (${MINUS}${r}) = ${N}.`;
      p.solution = `${sq(r)} = ${N} and (${MINUS}${r}) × (${MINUS}${r}) = ${N} — every positive number has TWO square roots: ${correct}. (√${N} is just the positive one.)`;
      p.visual = { type: "card", title: "two doors, one house", expr: `?² = ${N}`, lines: ["one positive door…", "…and one negative door"], steps: [`${r} works: ${sq(r)} = ${N}`, `${MINUS}${r} works too`, `answer: ${correct}`] };
      p.data = { form, sub, N, r, correct };
      return finishChoice(p, correct, [`${r} only`, `${MINUS}${r} only`, `${N} has no square roots`], ["0", `${r} and ${r}`, `√${N}`], vi);
    }
    const t = pick(RR_TRUTHS, Math.floor(slot / 2));
    const p = problemBase("root-rocket", vi, "choice");
    p.prompt = "Which statement is TRUE about roots?";
    p.hint1 = "Remember: the √ symbol means only the non-negative root, and cube roots follow the sign of the inside.";
    p.hint2 = "Test each statement on a number like 16 or " + MINUS + "8.";
    p.solution = t.correct === RR_TRUTHS[0].correct
      ? `√16 is 4 — never ${MINUS}4. The symbol names only the positive root, even though 16 has two square roots.`
      : t.correct === RR_TRUTHS[1].correct
        ? `Cube roots keep the sign: ∛(${MINUS}8) is ${MINUS}2, and there is exactly one. Every number has one cube root.`
        : `A positive number always has two square roots — a positive one and its negative — even when they are not whole numbers.`;
    p.visual = { type: "card", title: "root rules", expr: "√  vs  ∛", lines: ["√ → positive root only", "∛ → one root, sign follows"], steps: [t.correct] };
    p.data = { form, sub, correct: t.correct };
    return finishChoice(p, t.correct, t.wrongs, ["Zero has two square roots", "Cube roots come in pairs", "√4 is " + MINUS + "2"], vi);
  }

  /* ---------------- 2. sign-of-power ---------------- */
  const SP_PAIRS = [[3, 4], [3, 5], [2, 3], [2, 5], [2, 4], [5, 3], [4, 3], [5, 2], [3, 3], [2, 6], [6, 2], [4, 4]];
  const SP_PARITY = [
    { q: "negative", word: "POSITIVE", correct: "n²", wrongs: ["n − 1", "n³", "1 · n⁻¹"] },
    { q: "negative", word: "NEGATIVE", correct: "n³", wrongs: ["n²", "(" + MINUS + "n)²", MINUS + "n"] },
    { q: "negative", word: "POSITIVE", correct: "(" + MINUS + "n)²", wrongs: ["n³", MINUS + "n²", "n − 1"] },
    { q: "positive", word: "NEGATIVE", correct: MINUS + "n²", wrongs: ["n²", "(" + MINUS + "n)²", "n³"] },
    { q: "positive", word: "NEGATIVE", correct: MINUS + "(n³)", wrongs: ["n³", "n⁴", "(" + MINUS + "n)⁴"] }
  ];
  const SP_COUNT1 = [ // [label, value] lists — count entries equal to 1
    [["(−1)²", 1], ["(−1)³", -1], ["−1²", -1], ["|−1|", 1], ["−(−1)", 1], ["−1/(−1)", 1]],
    [["(−2)²", 4], ["−2²", -4], ["(−1)³", -1], ["(−1)²", 1], ["0²", 0], ["1³", 1]],
    [["(−1)⁵", -1], ["−(−1)", 1], ["(−1)⁴", 1], ["−1⁴", -1], ["|−2|", 2], ["−(−1)²", -1]],
    [["(−3)²", 9], ["3²", 9], ["(−1)¹⁰¹", -1], ["−(−1)³", 1], ["(−2)³", -8], ["1⁵", 1]],
    [["(−1)²⁰", 1], ["(−1)²¹", -1], ["−(−1)²", -1], ["(−1)¹", -1], ["|−1|²", 1], ["0⁵", 0]],
    [["(−1)⁶", 1], ["−(−1)³", 1], ["(−1)³", -1], ["−1³", -1], ["|−3|⁰", 1], ["(−1)⁴", 1]]
  ];
  const SP_MINUS1 = [
    { expr: "(−1)ⁿ + (−1)ⁿ⁺¹", correct: "0", wrongs: ["2", MINUS + "2", "1 or " + MINUS + "1, depending on n"], why: "Consecutive powers of " + MINUS + "1 always flip sign: one of them is 1 and the other is " + MINUS + "1, so the sum is 1 + (" + MINUS + "1) = 0." },
    { expr: "(−1)²ⁿ", correct: "1", wrongs: [MINUS + "1", "1 or " + MINUS + "1, depending on n", "2n"], why: "The exponent 2n is always even, and " + MINUS + "1 to an even power is 1." },
    { expr: "(−1)²ⁿ⁺¹", correct: MINUS + "1", wrongs: ["1", "1 or " + MINUS + "1, depending on n", "n"], why: "The exponent 2n + 1 is always odd, and " + MINUS + "1 to an odd power stays " + MINUS + "1." },
    { expr: "(−1)ⁿ × (−1)ⁿ⁺¹", correct: MINUS + "1", wrongs: ["1", "0", "1 or " + MINUS + "1, depending on n"], why: "Multiplying adds the exponents: n + (n + 1) is 2n + 1, always odd — so the product is " + MINUS + "1." },
    { expr: "(−1)ⁿ + (−1)ⁿ⁺¹ + (−1)ⁿ⁺²", correct: "1 or " + MINUS + "1, depending on n", wrongs: ["0", "1", MINUS + "1"], why: "The first two cancel (they are 1 and " + MINUS + "1 in some order), leaving the third — which is 1 when n is even and " + MINUS + "1 when n is odd." }
  ];
  function expandPow(base, n) { return Array.from({ length: n }, () => base).join(" × "); }
  function signOfPowerProblem(vi) {
    const form = vi % 4;
    const slot = Math.floor(vi / 4);
    if (form === 0) {
      const [a, n] = pick(SP_PAIRS, slot);
      const paren = slot % 2 === 0;
      const expected = paren ? (-a) ** n : -(a ** n);
      const other = paren ? -(a ** n) : (-a) ** n;
      const expr = paren ? `(${sx(-a)})${sup(n)}` : `${MINUS}${a}${sup(n)}`;
      const chain = expandPow(paren ? `(${sx(-a)})` : String(a), n);
      const p = problemBase("sign-of-power", vi, slot % 2 === 1 ? "choice" : "filled");
      p.prompt = `Work out ${expr}.`;
      p.hint1 = paren
        ? "The minus is INSIDE the brackets, so the base itself is negative — count how many negative factors."
        : "No brackets: the power only touches the number. The minus in front applies AFTER.";
      p.hint2 = paren ? `${chain} — ${n} negative factors, an ${n % 2 === 0 ? "even" : "odd"} count.` : `First ${chain} = ${a ** n}, then apply the minus.`;
      p.solution = paren
        ? `${expr} means ${chain} = ${expected} — ${n} negative factors is an ${n % 2 === 0 ? "EVEN count → positive" : "ODD count → negative"}.`
        : `${expr} means ${MINUS}(${chain}) = ${expected} — the power happens first, the minus second.`;
      const vals = [1];
      for (let i = 0; i < n && vals.length < 7; i++) vals.push(vals[vals.length - 1] * (paren ? -a : a));
      p.visual = { type: "ladder", title: paren ? "the sign flip-flop" : "power first, minus after", base: paren ? sx(-a) : String(a), values: vals.map(sx), note: paren ? `${n} negatives → ${n % 2 === 0 ? "positive" : "negative"}: ${sx(expected)}` : `result ${a ** n}, then the minus: ${sx(expected)}` };
      p.data = { form, a, n, paren };
      return finishNumeric(p, expected, [other, a * n, -(a * n)], [expected + 2, expected - 2, 0], slot % 2 === 1, vi);
    }
    if (form === 1) {
      const t = pick(SP_PARITY, slot);
      const p = problemBase("sign-of-power", vi, "choice");
      p.prompt = `n is a ${t.q} number. Which expression must be ${t.word}?`;
      p.hint1 = t.q === "negative" ? "Try a concrete value like n → " + MINUS + "3 and test each option." : "Try a concrete value like n → 3 and test each option.";
      p.hint2 = "Even powers wipe out a minus; odd powers keep it; a minus in FRONT of a power flips a positive.";
      const probe = t.q === "negative" ? MINUS + "3" : "3";
      p.solution = `Test with n → ${probe}: only ${t.correct} is guaranteed ${t.word.toLowerCase()}. Even powers are never negative, odd powers keep the sign, and a leading minus flips a positive result.`;
      p.visual = { type: "card", title: "sign logic", expr: `n is ${t.q} → which is ${t.word.toLowerCase()}?`, lines: ["even power → never negative", "odd power → keeps the sign"], steps: [`answer: ${t.correct}`] };
      p.data = { form, correct: t.correct };
      return finishChoice(p, t.correct, t.wrongs, ["n", MINUS + "n", "n⁰"], vi);
    }
    if (form === 2) {
      const list = pick(SP_COUNT1, slot);
      const count = list.filter(([, v]) => v === 1).length;
      const listing = list.map(([e]) => e).join(";  ");
      const detail = list.map(([e, v]) => `${e} → ${sx(v)}`).join(";  ");
      const p = problemBase("sign-of-power", vi, "choice");
      p.prompt = `How many of these expressions equal 1?  ${listing}`;
      p.hint1 = "Evaluate each one slowly: brackets first, and watch whether the minus is inside or outside the power.";
      p.hint2 = detail;
      p.solution = `${detail} — that is ${count} expressions equal to 1.`;
      p.visual = { type: "card", title: "count the ones", expr: listing, lines: ["evaluate each separately"], steps: list.slice(0, 4).map(([e, v]) => `${e} → ${sx(v)}`) };
      p.data = { form, list, count };
      return finishNumeric(p, count, [count + 1, count - 1, count + 2], [0, 6, count + 3], true, vi);
    }
    // form 3: (−1)ⁿ parity expressions (always choice)
    const t = pick(SP_MINUS1, slot);
    const p = problemBase("sign-of-power", vi, "choice");
    p.prompt = `n is a positive integer. Work out ${t.expr}.`;
    p.hint1 = MINUS + "1 has only two moods: odd power → " + MINUS + "1, even power → 1.";
    p.hint2 = "Try n → 1 and n → 2 to see the pattern.";
    p.solution = t.why;
    p.visual = { type: "ladder", title: "the " + MINUS + "1 flip-flop", base: MINUS + "1", values: ["1", MINUS + "1", "1", MINUS + "1", "1", MINUS + "1"], note: `odd ↔ ${MINUS + "1"}, even ↔ 1` };
    p.data = { form, correct: t.correct };
    return finishChoice(p, t.correct, t.wrongs, ["n", "2", MINUS + "2"], vi);
  }

  /* ---------------- 3. fraction-powers ---------------- */
  const FP_FRAC = [[2, 3, 3], [3, 4, 2], [1, 2, 5], [3, 5, 3], [5, 6, 2], [2, 5, 4], [1, 3, 4], [4, 5, 2], [3, 7, 2], [1, 2, 6], [5, 4, 2], [2, 7, 3]];
  const FP_NEG = [ // [n, d, k, paren?]
    [3, 5, 4, true], [3, 5, 4, false], [2, 3, 3, true], [3, 4, 2, true],
    [1, 2, 5, true], [3, 2, 3, false], [1, 3, 4, true], [5, 6, 2, true],
    [2, 5, 3, false], [1, 2, 4, false], [3, 4, 3, true], [2, 3, 4, false]
  ];
  const FP_TOP = [[3, 4, 5], [2, 3, 3], [2, 3, 5], [3, 3, 2], [2, 4, 3], [5, 2, 2], [3, 2, 7], [2, 5, 3], [3, 3, 4], [4, 2, 3], [1, 6, 2], [2, 2, 9]];
  const FP_ZS0 = [[3, 2], [2, 3], [5, 1], [4, 2], [1, 5], [3, 1]]; // |x−a|+(y+b)²=0 → y^x
  const FP_ZS1 = [[5, 4, 2021], [3, 4, 2022], [7, 6, 99], [2, 3, 100], [9, 8, 2025], [1, 2, 64]]; // |a+c|+(b−d)²=0 → (a+b)^E
  const FP_ZS2 = [[1, 2, 4], [3, 9, 6], [2, 4, 8], [5, 16, 2], [4, 25, 10], [6, 1, 12]]; // |x+p|+√(z−q)+(2y−k)²=0 → x+y+z
  const FP_ZS3 = [[3, 2018], [2, 2020], [4, 2022], [5, 2024], [6, 100], [7, 300]]; // (ka+1)² & (b−1)² inverses → a+(−b)^E
  function fractionPowersProblem(vi) {
    const form = vi % 4;
    const slot = Math.floor(vi / 4);
    if (form === 0) {
      const [n, d, k] = pick(FP_FRAC, slot);
      const ansF = powF(F(n, d), k);
      const factor = `(${n}/${d})`;
      const chain = `${expandPow(factor, k)} = ${fstr(ansF)}`;
      const expr = `(${n}/${d})${sup(k)}`;
      const p = problemBase("fraction-powers", vi, "choice");
      p.prompt = `Work out ${expr}.`;
      p.hint1 = "The power applies to the WHOLE fraction — the top AND the bottom both get powered.";
      p.hint2 = `Write it out: ${expandPow(factor, k)}. Tops: ${n}${sup(k)}; bottoms: ${d}${sup(k)}.`;
      p.solution = `${expr} means ${chain} — power the top and the bottom: ${n}${sup(k)} over ${d}${sup(k)}.`;
      p.visual = { type: "card", title: "power the tower — top AND bottom", expr, lines: [`${k} copies of ${factor}`, `tops ${n}${sup(k)}, bottoms ${d}${sup(k)}`], steps: [chain] };
      p.data = { form, n, d, k };
      return finishFraction(p, ansF,
        [fneg(ansF), F(n ** k, d), F(n * k, d * k)], // dropped sign · forgot to power the bottom · multiplied instead
        [F(1, 1), F(2, 1), F(n, d)], true, vi);
    }
    if (form === 1) {
      const [n, d, k, paren] = pick(FP_NEG, slot);
      const ansF = paren ? powF(F(-n, d), k) : fneg(powF(F(n, d), k));
      const otherF = paren ? fneg(powF(F(n, d), k)) : powF(F(-n, d), k);
      const factor = paren ? `(${MINUS}${n}/${d})` : `(${n}/${d})`;
      const chain = paren ? `${expandPow(factor, k)} = ${fstr(ansF)}` : `${MINUS}(${expandPow(`(${n}/${d})`, k)}) = ${fstr(ansF)}`;
      const expr = paren ? `(${MINUS}${n}/${d})${sup(k)}` : `${MINUS}(${n}/${d})${sup(k)}`;
      const p = problemBase("fraction-powers", vi, "choice");
      p.prompt = `Work out ${expr}.`;
      p.hint1 = paren
        ? `The minus is INSIDE the brackets: count ${k} negative factors — an ${k % 2 === 0 ? "even" : "odd"} count.`
        : "The minus sits OUTSIDE: power the fraction first, then apply the minus.";
      p.hint2 = chain;
      p.solution = paren
        ? `${expr} means ${chain} — ${k} negatives is an ${k % 2 === 0 ? "EVEN count → positive" : "ODD count → negative"}.`
        : `${expr} means ${chain} — the minus only applies after the powering.`;
      p.visual = { type: "card", title: paren ? "minus inside the power" : "minus outside the power", expr, lines: [paren ? `base is ${MINUS}${n}/${d}` : `power first, minus after`], steps: [chain] };
      p.data = { form, n, d, k, paren };
      return finishFraction(p, ansF,
        [otherF, fneg(ansF), F(ansF.d, ansF.n)], // wrong bracket reading · sign slip · flipped answer
        [F(1, 1), F(-1, 1), F(2, 1)], true, vi);
    }
    if (form === 2) {
      const [n, k, d] = pick(FP_TOP, slot);
      const ansF = F(n ** k, d);
      const top = expandPow(String(n), k);
      const chain = `(${top})/${d} = ${fstr(ansF)}`;
      const expr = `${n}${sup(k)}/${d}`;
      const p = problemBase("fraction-powers", vi, "choice");
      p.prompt = `Work out ${expr}.`;
      p.hint1 = `Look closely: only the top number ${n} carries the exponent — the ${d} has no power at all.`;
      p.hint2 = `Tops: ${top}. The bottom stays ${d}.`;
      p.solution = `${expr} means ${chain} — only the TOP gets the power; the bottom just stays ${d}. (Compare (${n}/${d})${sup(k)}, where the bottom would be powered too.)`;
      p.visual = { type: "card", title: "only the top gets the power", expr, lines: [`top: ${top}`, `bottom: stays ${d}`], steps: [chain] };
      p.data = { form, n, d, k };
      return finishFraction(p, ansF,
        [F(n ** k, d ** k), fneg(ansF), F(n * k, d)], // powered the bottom too · sign slip · multiplied the top
        [F(1, 1), F(-1, 1), F(n, d)], true, vi);
    }
    // form 3: zero-sum puzzles — absolute value + square (+ root) all ≥ 0
    const sub = slot % 4;
    if (sub === 0) {
      const [a, b] = pick(FP_ZS0, Math.floor(slot / 4));
      const expected = (-b) ** a;
      const trap = a % 2 === 1 ? b ** a : -(b ** a);
      const chain = expandPow(`(${sx(-b)})`, a);
      const p = problemBase("fraction-powers", vi, slot % 2 === 1 ? "choice" : "filled");
      p.prompt = `|x − ${a}| + (y + ${b})² = 0. Work out y^x.`;
      p.hint1 = "An absolute value and a square are both ≥ 0 — two non-negatives can only add to 0 if BOTH are 0.";
      p.hint2 = `So x is ${a} and y is ${sx(-b)}. Now compute y^x.`;
      p.solution = `Both parts must be 0: x is ${a} and y is ${sx(-b)}. Then y^x → ${chain} = ${sx(expected)}.`;
      p.visual = { type: "card", title: "zero + zero = zero", expr: `|x − ${a}| + (y + ${b})² = 0`, lines: [`x is ${a}, y is ${sx(-b)}`], steps: [`${chain} = ${sx(expected)}`] };
      p.data = { form, sub, a, b };
      return finishNumeric(p, expected, [trap, a * b, a + b], [0, 1, -1], slot % 2 === 1, vi);
    }
    if (sub === 1) {
      const [c, d, E] = pick(FP_ZS1, Math.floor(slot / 4));
      const base = d - c; // a = −c, b = d → a + b
      const expected = base ** E;
      const p = problemBase("fraction-powers", vi, slot % 2 === 1 ? "choice" : "filled");
      p.prompt = `|a + ${c}| + (b − ${d})² = 0. Work out (a + b)${sup(E)}.`;
      p.hint1 = "Both parts are ≥ 0, so both must be 0. Find a and b, add them, THEN power.";
      p.hint2 = `a is ${sx(-c)} and b is ${d}, so a + b is ${sx(base)}. Is ${E} odd or even?`;
      p.solution = `a is ${sx(-c)} and b is ${d}, so a + b is ${sx(base)}. ${sx(base)} to the ${E % 2 === 0 ? "EVEN" : "ODD"} power ${E} is ${sx(expected)}.`;
      p.visual = { type: "card", title: "tiny base, giant power", expr: `(a + b)${sup(E)}`, lines: [`a + b is ${sx(base)}`], steps: [`${sx(base)}${sup(E)} → ${sx(expected)} (${E} is ${E % 2 === 0 ? "even" : "odd"})`] };
      p.data = { form, sub, c, d, E };
      return finishNumeric(p, expected, [-expected, E, base * 2], [0, 2, -2], slot % 2 === 1, vi);
    }
    if (sub === 2) {
      const [pp, q, k] = pick(FP_ZS2, Math.floor(slot / 4));
      const expected = q + k / 2 - pp;
      const p = problemBase("fraction-powers", vi, slot % 2 === 1 ? "choice" : "filled");
      p.prompt = `|x + ${pp}| + √(z − ${q}) + (2y − ${k})² = 0. Work out x + y + z.`;
      p.hint1 = "Absolute value, square root and square are ALL ≥ 0 — so each of the three parts must be 0.";
      p.hint2 = `x is ${sx(-pp)}, z is ${q}, and 2y − ${k} is 0, so y is ${k / 2}.`;
      p.solution = `Each part is 0: x is ${sx(-pp)}, z is ${q}, and 2y − ${k} is 0 gives y is ${k / 2}. Sum: ${sx(-pp)} + ${k / 2} + ${q} = ${sx(expected)}.`;
      p.visual = { type: "card", title: "three zeros at once", expr: `|x + ${pp}| + √(z − ${q}) + (2y − ${k})² = 0`, lines: [`x is ${sx(-pp)} · y is ${k / 2} · z is ${q}`], steps: [`${sx(-pp)} + ${k / 2} + ${q} = ${sx(expected)}`] };
      p.data = { form, sub, pp, q, k };
      return finishNumeric(p, expected, [expected + 2, expected - 2, pp + q + k], [0, 1, expected * 2], slot % 2 === 1, vi);
    }
    const [k, E] = pick(FP_ZS3, Math.floor(slot / 4));
    const ansF = F(k - 1, k); // a = −1/k, b = 1, (−1)^even = 1 → 1 − 1/k
    const p = problemBase("fraction-powers", vi, "choice");
    p.prompt = `(${k}a + 1)² and (b − 1)² are additive inverses. Work out a + (${MINUS}b)${sup(E)}.`;
    p.hint1 = "Additive inverses sum to 0 — and two squares that sum to 0 must BOTH be 0.";
    p.hint2 = `So ${k}a + 1 is 0 and b is 1. Note ${E} is even.`;
    p.solution = `Both squares are 0: ${k}a + 1 is 0, so a is ${MINUS}1/${k}, and b is 1. (${MINUS}1) to the even power ${E} is 1, so the sum → ${MINUS}1/${k} + 1 = ${fstr(ansF)}.`;
    p.visual = { type: "card", title: "inverses that cancel", expr: `(${k}a + 1)² + (b − 1)² = 0`, lines: [`a is ${MINUS}1/${k}, b is 1`], steps: [`${MINUS}1/${k} + 1 = ${fstr(ansF)}`] };
    p.data = { form, sub, k, E };
    return finishFraction(p, ansF, [fneg(ansF), F(1, k), F(k + 1, k)], [F(1, 1), F(0, 1), F(2, 1)], true, vi);
  }

  /* ---------------- 4. standard-writer ---------------- */
  const SW_BIG = [ // [plain value, A string, n]
    ["52000000", "5.2", 7], ["421000", "4.21", 5], ["6014000000", "6.014", 9], ["75400000", "7.54", 7],
    ["9500000000000", "9.5", 12], ["3050000", "3.05", 6], ["480000", "4.8", 5], ["70000000", "7", 7],
    ["123000000", "1.23", 8], ["64000000", "6.4", 7], ["20250000", "2.025", 7], ["81555000000", "8.1555", 10]
  ];
  const SW_SMALL = [
    ["0.000421", "4.21", -4], ["0.0000325", "3.25", -5], ["0.00000059", "5.9", -7], ["0.00562", "5.62", -3],
    ["0.000068", "6.8", -5], ["0.0000071", "7.1", -6], ["0.000205", "2.05", -4], ["0.000000033", "3.3", -8],
    ["0.0019", "1.9", -3], ["0.00000088", "8.8", -7], ["0.00046", "4.6", -4], ["0.00000101", "1.01", -6]
  ];
  const SW_WORDS = [ // [prompt, A, n, plain, note]
    ["Write 63 million in standard form.", "6.3", 7, "63000000", "63 million → 63 × 10⁶ → 6.3 × 10⁷ — million adds 6 zeros, then normalize the 63."],
    ["Write 17600 billion in standard form.", "1.76", 13, "17600000000000", "17600 billion → 17600 × 10⁹ → 1.76 × 10¹³ — billion adds 9 zeros, then normalize."],
    ["Write 4.5 million in standard form.", "4.5", 6, "4500000", "4.5 million → 4.5 × 10⁶ — a million is exactly 10⁶."],
    ["Write 280 billion in standard form.", "2.8", 11, "280000000000", "280 billion → 280 × 10⁹ → 2.8 × 10¹¹."],
    ["Write 0.7 million in standard form.", "7", 5, "700000", "0.7 million → 0.7 × 10⁶ → 7 × 10⁵ — normalizing 0.7 drops the exponent by 1."],
    ["Write 95 billion in standard form.", "9.5", 10, "95000000000", "95 billion → 95 × 10⁹ → 9.5 × 10¹⁰."],
    ["Express 7800 km in centimetres, in standard form.", "7.8", 8, "780000000", "1 km → 10⁵ cm, so 7800 km → 7800 × 10⁵ cm → 7.8 × 10⁸ cm."],
    ["Express 0.05 mm in kilometres, in standard form.", "5", -8, "0.00000005", "1 mm → 10⁻⁶ km, so 0.05 mm → 0.05 × 10⁻⁶ km → 5 × 10⁻⁸ km."],
    ["Express 2500 m in millimetres, in standard form.", "2.5", 6, "2500000", "1 m → 10³ mm, so 2500 m → 2500 × 10³ mm → 2.5 × 10⁶ mm."],
    ["Express 0.0004 km in centimetres, in standard form.", "4", 1, "40", "1 km → 10⁵ cm, so 0.0004 km → 0.0004 × 10⁵ cm → 40 cm → 4 × 10¹ cm."],
    ["Write 1.2 million in standard form.", "1.2", 6, "1200000", "1.2 million → 1.2 × 10⁶."],
    ["Write 0.09 billion in standard form.", "9", 7, "90000000", "0.09 billion → 0.09 × 10⁹ → 9 × 10⁷."]
  ];
  const SW_BACK = [ // [A, n, expanded]
    ["1.452", -3, "0.001452"], ["4.21", 5, "421000"], ["5.2", 7, "52000000"], ["6.8", -5, "0.000068"],
    ["3.05", 6, "3050000"], ["9.5", 12, "9500000000000"], ["2.5", -4, "0.00025"], ["7.54", 7, "75400000"],
    ["1.01", -6, "0.00000101"], ["8.1555", 10, "81555000000"], ["4", 13, "40000000000000"], ["6.3", 2, "630"]
  ];
  function standardWriterProblem(vi) {
    const form = vi % 4;
    const slot = Math.floor(vi / 4);
    if (form === 0 || form === 1) {
      const bank = form === 0 ? SW_BIG : SW_SMALL;
      const [plain, a, n] = pick(bank, slot);
      const correct = sfStr(a, n);
      const wrongA = shiftPointRight(a); // same value, A ≥ 10 — the classic non-standard trap
      const wrongs = form === 0
        ? [sfStr(wrongA, n - 1), sfStr(a, n - 1), sfStr(a, n + 1)]
        : [sfStr(a, n + 1), sfStr(a, n - 1), sfStr(wrongA, n + 1)];
      const jumps = Math.abs(n);
      const p = problemBase("standard-writer", vi, "choice");
      p.prompt = `Write ${plain} in standard form (A × 10ⁿ, where 1 ≤ A < 10).`;
      p.hint1 = "Park the decimal point right after the first non-zero digit, then count how many places it jumped.";
      p.hint2 = form === 0
        ? `The point starts at the very end of ${plain} and jumps ${jumps} places LEFT.`
        : `The point jumps ${jumps} places RIGHT to reach ${a} — rightward jumps mean a NEGATIVE exponent.`;
      p.solution = form === 0
        ? `${plain} → the point jumps ${jumps} places left to sit after the first digit: ${correct}. Check: ${correct} = ${plain}.`
        : `${plain} → the point jumps ${jumps} places right to make ${a}, and rightward means negative: ${correct}. Check: ${correct} = ${plain}.`;
      const digits = form === 0 ? plain : plain.slice(2); // strip "0."
      p.visual = { type: "zoom", title: "the point rocket", digits, pointFrom: form === 0 ? digits.length - 1 : 0, pointTo: form === 0 ? 0 : jumps, places: `${jumps} places ${form === 0 ? "left" : "right"}`, result: correct };
      p.data = { form, a, n, plain };
      return finishChoice(p, correct, wrongs, [sfStr(a, n + 2), sfStr(a, 0), sfStr(wrongA, n)], vi);
    }
    if (form === 2) {
      const [prompt, a, n, plain, note] = pick(SW_WORDS, slot);
      const correct = sfStr(a, n);
      const wrongA = shiftPointRight(a);
      const p = problemBase("standard-writer", vi, "choice");
      p.prompt = prompt;
      p.hint1 = "First turn the words (or units) into a plain number, then run the point rocket.";
      p.hint2 = note.split(" — ")[0] + ".";
      p.solution = `${note} Check: ${correct} = ${plain}.`;
      p.visual = { type: "card", title: "words & units first", expr: prompt.replace(/^Write |^Express | in standard form\.|,$/g, ""), lines: [`plain value: ${plain}`], steps: [`${plain} → ${correct}`] };
      p.data = { form, a, n, plain };
      return finishChoice(p, correct,
        [sfStr(a, n + 1), sfStr(a, n - 1), sfStr(wrongA, n - 1)],
        [sfStr(a, n + 2), sfStr(wrongA, n), sfStr(a, 0)], vi);
    }
    // form 3: standard form → ordinary number
    const [a, n, expanded] = pick(SW_BACK, slot);
    const expr = sfStr(a, n);
    const p = problemBase("standard-writer", vi, "choice");
    p.prompt = `Write ${expr} as an ordinary number.`;
    p.hint1 = n >= 0 ? `10${sup(n)} means move the point ${n} places RIGHT — pad with zeros.` : `10${sup(n)} means move the point ${-n} places LEFT — pad with zeros.`;
    p.hint2 = `Start at ${a} and count the jumps carefully.`;
    p.solution = `${expr} → move the point ${Math.abs(n)} places ${n >= 0 ? "right" : "left"}: ${a} → ${expanded}. Check: ${expr} = ${expanded}.`;
    p.visual = { type: "card", title: "land the rocket", expr, lines: [`${Math.abs(n)} place jumps ${n >= 0 ? "right" : "left"}`], steps: [`${expr} = ${expanded}`] };
    p.data = { form, a, n, plain: expanded };
    return finishChoice(p, expanded,
      [expandSF(a, n + 1), expandSF(a, n - 1), expandSF(a, n - 2)],
      [expandSF(a, n + 2), expandSF(a, 0), expandSF(shiftPointRight(a), n)], vi);
  }

  /* ---------------- 5. standard-compare ---------------- */
  const SC_CMP = [ // [left display, right display, left plain, right plain]
    [sfStr("5.6", 6), sfStr("6", 5), "5600000", "600000"],
    ["71000", sfStr("7.1", 5), "71000", "710000"],
    [sfStr("3.2", 4), sfStr("3.2", 3), "32000", "3200"],
    [sfStr("4.8", -3), sfStr("4.8", -2), "0.0048", "0.048"],
    [sfStr("9.1", 7), "91000000", "91000000", "91000000"],
    [sfStr("2.5", -4), "0.00025", "0.00025", "0.00025"],
    [sfStr("6.7", 5), sfStr("6.8", 5), "670000", "680000"],
    [sfStr("1.3", -2), sfStr("1.2", -2), "0.013", "0.012"],
    ["84000", sfStr("8.4", 3), "84000", "8400"],
    [sfStr("5", 6), sfStr("4.9", 7), "5000000", "49000000"],
    [sfStr("3.6", -7), sfStr("3.8", -7), "0.00000036", "0.00000038"],
    [sfStr("7.7", 3), sfStr("7.7", 3), "7700", "7700"]
  ];
  const SC_ORDER = [ // banks of 4 [label, value, plain] — strictly tie-free
    [[sfStr("2.73", 3), 2730, "2730"], [sfStr("27.3", -3), 0.0273, "0.0273"], [sfStr("273", 2), 27300, "27300"], ["0.00273", 0.00273, "0.00273"]],
    [[sfStr("0.038", -6), 3.8e-8, "0.000000038"], [sfStr("3800", -10), 3.8e-7, "0.00000038"], ["380", 380, "380"], [sfStr("3.6", -7), 3.6e-7, "0.00000036"]],
    [[sfStr("4.5", 4), 45000, "45000"], [sfStr("0.45", 4), 4500, "4500"], [sfStr("45", 5), 4500000, "4500000"], [sfStr("405", 3), 405000, "405000"]],
    [[sfStr("72", -7), 7.2e-6, "0.0000072"], ["0.0007", 7e-4, "0.0007"], [sfStr("7.2", -5), 7.2e-5, "0.000072"], [sfStr("720", -6), 7.2e-4, "0.00072"]],
    [[sfStr("15.5", 4), 155000, "155000"], [sfStr("1.55", 6), 1550000, "1550000"], [sfStr("1555", 2), 155500, "155500"], [sfStr("0.155", 5), 15500, "15500"]],
    [[sfStr("9.09", -3), 9.09e-3, "0.00909"], [sfStr("9.9", -2), 9.9e-2, "0.099"], [sfStr("0.099", -1), 9.9e-3, "0.0099"], [sfStr("99", -5), 9.9e-4, "0.00099"]]
  ];
  const SC_SAT = [ // [V (×10³ m/s), rawA, a, n] — one hour = 3600 s
    [8, "28.8", "2.88", 7], [7.5, "27", "2.7", 7], [6, "21.6", "2.16", 7], [9, "32.4", "3.24", 7],
    [5, "18", "1.8", 7], [4, "14.4", "1.44", 7], [3, "10.8", "1.08", 7], [3.5, "12.6", "1.26", 7],
    [8.5, "30.6", "3.06", 7], [7, "25.2", "2.52", 7], [6.5, "23.4", "2.34", 7], [4.5, "16.2", "1.62", 7]
  ];
  const SC_STAR = [ // [K (× solar mass 2×10³⁰ kg), rawA, a, n]
    [315, "630", "6.3", 32], [250, "500", "5", 32], [120, "240", "2.4", 32], [45, "90", "9", 31],
    [380, "760", "7.6", 32], [60, "120", "1.2", 32], [150, "300", "3", 32], [75, "150", "1.5", 32],
    [420, "840", "8.4", 32], [90, "180", "1.8", 32], [200, "400", "4", 32], [33, "66", "6.6", 31]
  ];
  const SC_ZEROS = [ // [A, n, zero count in the expansion]
    ["8.1555", 10, 6], ["4.21", 5, 3], ["5.2", 7, 6], ["6.014", 9, 7], ["9.5", 12, 11], ["3.05", 6, 5],
    ["7.54", 7, 5], ["1.23", 8, 7], ["2.025", 7, 5], ["6.4", 7, 6], ["1.01", 6, 5], ["4", 13, 13]
  ];
  const SC_PIERRE = [ // [factor1, factor2, product plain, Pierre's A, Pierre's n, correct A, correct n]
    [61000, 4000, "244000000", 24.4, 7, 2.44, 8],
    [52000, 3000, "156000000", 15.6, 7, 1.56, 8],
    [2500, 8000, "20000000", 20, 6, 2, 7],
    [12000, 500, "6000000", 60, 5, 6, 6],
    [750, 40000, "30000000", 30, 6, 3, 7],
    [91000, 2000, "182000000", 18.2, 7, 1.82, 8]
  ];
  function standardCompareProblem(vi) {
    const form = vi % 4;
    const slot = Math.floor(vi / 4);
    if (form === 0) {
      const [lD, rD, lP, rP] = pick(SC_CMP, slot);
      const lv = Number(lP), rv = Number(rP);
      const rel = lv > rv ? ">" : lv < rv ? "<" : "=";
      const others = [">", "<", "="].filter((s) => s !== rel);
      const p = problemBase("standard-compare", vi, "choice");
      p.prompt = `Which symbol goes in the box?   ${lD}  ☐  ${rD}`;
      p.hint1 = "Turn BOTH sides into ordinary numbers (or the same power of 10) before you compare.";
      p.hint2 = `${lD} → ${lP} and ${rD} → ${rP}.`;
      p.solution = `${lD} → ${lP} and ${rD} → ${rP}, so ${lD} ${rel} ${rD}.`;
      p.visual = { type: "card", title: "cosmic weighing scales", expr: `${lD}  ☐  ${rD}`, lines: [`${lP}  vs  ${rP}`], steps: [`${lP} ${rel} ${rP}`, `answer: ${rel}`] };
      p.data = { form, lv, rv };
      return finishChoice(p, rel, others, ["cannot be determined", "≈"], vi);
    }
    if (form === 1) {
      const items = pick(SC_ORDER, slot);
      const ask = slot % 2 === 0 ? "smallest" : "largest";
      const vals = items.map(([, v]) => v);
      const target = ask === "smallest" ? Math.min(...vals) : Math.max(...vals);
      const correct = items.find(([, v]) => v === target)[0];
      const listing = items.map(([l]) => l).join("   ·   ");
      const detail = items.map(([l, , pl]) => `${l} → ${pl}`).join(";  ");
      const p = problemBase("standard-compare", vi, "choice");
      p.prompt = `Which of these numbers is the ${ask.toUpperCase()}?   ${listing}`;
      p.hint1 = "Write each one as an ordinary number first — the exponents are trying to distract you.";
      p.hint2 = detail;
      p.solution = `${detail} — so the ${ask} is ${correct}.`;
      p.visual = { type: "card", title: `hunt the ${ask}`, expr: `${items.length} contenders`, lines: items.map(([l]) => l).slice(0, 4), steps: [detail.split(";  ").slice(0, 2).join(";  "), `answer: ${correct}`] };
      p.data = { form, items, ask };
      return finishChoice(p, correct, items.filter(([l]) => l !== correct).map(([l]) => l), ["0", "1"], vi);
    }
    if (form === 2) {
      const sub = slot % 2;
      if (sub === 0) {
        const [V, rawA, a, n] = pick(SC_SAT, Math.floor(slot / 2));
        const correct = sfStr(a, n);
        const p = problemBase("standard-compare", vi, "choice");
        p.prompt = `A satellite flies at ${V} × 10³ m/s. How far does it travel in one hour (3600 s)? Give the distance in metres, in standard form.`;
        p.hint1 = "distance → speed × time. Multiply the plain parts first, then normalize into standard form.";
        p.hint2 = `${V} × 3600 = ${V * 3600}, and don't forget the × 10³.`;
        p.solution = `${V} × 3600 = ${V * 3600}, so the distance → ${V * 3600} × 10³ m → ${rawA} × 10⁶ m → ${correct} m. (${rawA} is ≥ 10, so normalize.)`;
        p.visual = { type: "card", title: "satellite distance", expr: `${V} × 10³ × 3600`, lines: [`${V} × 3600 = ${V * 3600}`, `then × 10³`], steps: [`${rawA} × 10⁶ → ${correct}`] };
        p.data = { form, sub, a, n, rawVal: V * 3.6e6 };
        return finishChoice(p, correct,
          [`${rawA} × 10${sup(6)}`, sfStr(a, n - 1), sfStr(a, n + 1)],
          [sfStr(a, n + 2), sfStr(shiftPointRight(a), n), sfStr(a, 0)], vi);
      }
      const [K, rawA, a, n] = pick(SC_STAR, Math.floor(slot / 2));
      const correct = sfStr(a, n);
      const p = problemBase("standard-compare", vi, "choice");
      p.prompt = `A star is ${K} times as heavy as the Sun, whose mass is about 2 × 10³⁰ kg. What is the star's mass, in standard form?`;
      p.hint1 = `Multiply ${K} by the Sun's mass — then check that your A really lies in 1 ≤ A < 10.`;
      p.hint2 = `${K} × 2 = ${K * 2}.`;
      p.solution = `${K} × 2 = ${K * 2}, so the mass → ${rawA} × 10³⁰ kg → ${correct} kg. (${rawA} is ≥ 10, so normalize.)`;
      p.visual = { type: "card", title: "weighing a star", expr: `${K} × (2 × 10³⁰)`, lines: [`${K} × 2 = ${K * 2}`], steps: [`${rawA} × 10³⁰ → ${correct}`] };
      p.data = { form, sub, a, n, rawVal: K * 2e30 };
      return finishChoice(p, correct,
        [`${rawA} × 10${sup(30)}`, sfStr(a, n - 1), sfStr(a, n + 1)],
        [sfStr(a, n + 2), sfStr(shiftPointRight(a), n), sfStr(a, 0)], vi);
    }
    // form 3: zeros count / Pierre's standard-form verdict
    const sub = slot % 2;
    if (sub === 0) {
      const [a, n, zeros] = pick(SC_ZEROS, Math.floor(slot / 2));
      const expanded = expandSF(a, n);
      const p = problemBase("standard-compare", vi, slot % 2 === 1 ? "choice" : "filled");
      p.prompt = `How many ZEROS does ${sfStr(a, n)} have when it is written as an ordinary number?`;
      p.hint1 = "Write the ordinary number out in full first, then count every 0 digit.";
      p.hint2 = `${sfStr(a, n)} → ${expanded}.`;
      p.solution = `${sfStr(a, n)} = ${expanded} — count them: ${zeros} zeros. (Not ${n}: the digits of ${a} use up some of the jump!)`;
      p.visual = { type: "card", title: "count the zeros", expr: sfStr(a, n), lines: ["write it out fully first"], steps: [`${expanded}`, `${zeros} zeros`] };
      p.data = { form, sub, a, n };
      return finishNumeric(p, zeros, [zeros + 1, zeros - 1, n], [zeros - 2, zeros + 2, n + 1], slot % 2 === 1, vi);
    }
    const [f1, f2, prod, pierreA, pierreN, correctA, correctN] = pick(SC_PIERRE, Math.floor(slot / 2));
    const correct = "No — A must be at least 1 and less than 10";
    const p = problemBase("standard-compare", vi, "choice");
    p.prompt = `Pierre computes ${f1} × ${f2} and writes the answer as ${pierreA} × 10${sup(pierreN)}. Is this standard form?`;
    p.hint1 = "Check TWO things separately: is the value right, and does A satisfy 1 ≤ A < 10?";
    p.hint2 = `${f1} × ${f2} = ${prod}. Now look at A → ${pierreA}.`;
    p.solution = `${f1} × ${f2} = ${prod} — the value is right! But standard form needs 1 ≤ A < 10, and ${pierreA} ≥ 10. Proper form: ${prod} → ${sfStr(String(correctA), correctN)}.`;
    p.visual = { type: "card", title: "Pierre's checkpoint", expr: `${pierreA} × 10${sup(pierreN)}`, lines: ["value: correct!", `A → ${pierreA} … is that < 10?`], steps: [`${prod} → ${sfStr(String(correctA), correctN)}`] };
    p.data = { form, sub, f1, f2, prod, pierreA, pierreN, correctA, correctN };
    return finishChoice(p, correct,
      ["Yes — it is correct standard form", "Yes — the value matches, so the form is right", "No — the value is wrong"],
      ["Yes — every big number is standard form", "No — the exponent should be 0"], vi);
  }

  /* ---------------- 6. power-capstone ---------------- */
  const PC_SQ = [[16, 4, 2], [81, 9, 3], [256, 16, 4], [625, 25, 5], [1296, 36, 6], [6561, 81, 9], [10000, 100, 10], [2401, 49, 7]]; // c²=N, r²=c
  const PC_CB = [[729, 9, 3], [64, 4, 2], [15625, 25, 5], [1, 1, 1], [46656, 36, 6], [4096, 16, 4], [117649, 49, 7]]; // c³=N, r²=c
  const PC_LY = [ // [light-years, approx A (×10¹³), exact A (×10¹³), raw product A (×10¹²)]
    ["4.2", 4, "3.99", "39.9"], ["2.5", 2, "2.375", "23.75"], ["8.1", 8, "7.695", "76.95"], ["1.3", 1, "1.235", "12.35"],
    ["6.4", 6, "6.08", "60.8"], ["3.8", 4, "3.61", "36.1"], ["5.3", 5, "5.035", "50.35"], ["9.2", 9, "8.74", "87.4"]
  ];
  const PC_SIGN = [ // [display, JS expr, expected, worked solution]
    ["(−1)²⁰²⁵ + (−1)²⁰²⁶", "((-1)**2025)+((-1)**2026)", 0, "Odd power → " + MINUS + "1, even power → 1: " + MINUS + "1 + 1 = 0."],
    ["(−2)³ − (−3)²", "((-2)**3)-((-3)**2)", -17, "(−2)³ → " + MINUS + "8 (three negatives); (−3)² → 9 (two negatives): " + MINUS + "8 − 9 = " + MINUS + "17."],
    ["(−1)⁹⁹ × (−2)²", "((-1)**99)*((-2)**2)", -4, "(−1)⁹⁹ → " + MINUS + "1 and (−2)² → 4: " + MINUS + "1 × 4 = " + MINUS + "4."],
    ["(−3)² − (−2)³", "((-3)**2)-((-2)**3)", 17, "(−3)² → 9 and (−2)³ → " + MINUS + "8: 9 − (" + MINUS + "8) = 17."],
    ["(−1)²⁰²⁴ − (−1)²⁰²⁵", "((-1)**2024)-((-1)**2025)", 2, "Even → 1, odd → " + MINUS + "1: 1 − (" + MINUS + "1) = 2."],
    ["(−2)⁴ ÷ (−2)²", "((-2)**4)/((-2)**2)", 4, "(−2)⁴ → 16 and (−2)² → 4: 16 ÷ 4 = 4."],
    ["(−5)² + (−1)⁵ × 10", "((-5)**2)+((-1)**5)*10", 15, "(−5)² → 25; (−1)⁵ × 10 → " + MINUS + "10: 25 + (" + MINUS + "10) = 15."],
    ["(−0.5)² × (−2)³", "((-0.5)**2)*((-2)**3)", -2, "(−0.5)² → 0.25; (−2)³ → " + MINUS + "8: 0.25 × (" + MINUS + "8) = " + MINUS + "2."]
  ];
  const PC_ORD = [ // banks of 5 [label, value] — strictly tie-free min & max
    [["(−0.6)³", -0.216], ["0.6⁰", 1], ["−0.6²", -0.36], ["(−0.6)⁶", 0.046656], ["−0.6", -0.6]],
    [["(−0.5)²", 0.25], ["−0.5", -0.5], ["(−0.5)³", -0.125], ["0.5⁰", 1], ["−0.5²", -0.25]],
    [["(−0.2)³", -0.008], ["−0.2²", -0.04], ["(−0.2)²", 0.04], ["−0.2", -0.2], ["0.2¹", 0.2]],
    [["(−0.3)³", -0.027], ["(−0.3)²", 0.09], ["−0.3²", -0.09], ["0.3⁰", 1], ["−0.3", -0.3]],
    [["(−1.5)²", 2.25], ["−1.5", -1.5], ["(−1.5)³", -3.375], ["1.5⁰", 1], ["−1.5²", -2.25]],
    [["(−0.4)²", 0.16], ["−0.4", -0.4], ["(−0.4)³", -0.064], ["0.4⁰", 1], ["(−0.4)⁴", 0.0256]]
  ];
  function powerCapstoneProblem(vi) {
    const form = vi % 4;
    const slot = Math.floor(vi / 4);
    if (form === 0) {
      const sub = slot % 2;
      if (sub === 0) {
        const [N, c, r] = pick(PC_SQ, Math.floor(slot / 2));
        const p = problemBase("power-capstone", vi, slot % 2 === 0 ? "choice" : "filled");
        p.prompt = `Work out the square root of √${N}.`;
        p.hint1 = "One root at a time: first find √" + N + ", then take the square root of THAT result.";
        p.hint2 = `√${N} is ${c}. Now the square root of ${c}?`;
        p.solution = `√${N} is ${c}, and ${r} × ${r} = ${c}, so the square root of √${N} is ${r}.`;
        p.visual = { type: "card", title: "two-step root", expr: `√(√${N})`, lines: [`step 1: √${N} is ${c}`, `step 2: √${c} ?`], steps: [`${r} × ${r} = ${c}`, `answer: ${r}`] };
        p.data = { form, sub, N, c, r };
        return finishNumeric(p, r, [c, r + 1, r - 1], [r + 2, N, 0], slot % 2 === 0, vi);
      }
      const [N, c, r] = pick(PC_CB, Math.floor(slot / 2));
      const correct = `${r} and ${MINUS}${r}`;
      const p = problemBase("power-capstone", vi, "choice");
      p.prompt = `Find ALL the square roots of ∛${N}.`;
      p.hint1 = `First the cube root: ∛${N} is ${c}. Then remember how many square roots a positive number has.`;
      p.hint2 = `${c} × ${c} × ${c} = ${N}. Now the square roots of ${c} — there are TWO.`;
      p.solution = `∛${N} is ${c} (${c} × ${c} × ${c} = ${N}), and the square roots of ${c} are ${correct} — do not forget the negative one!`;
      p.visual = { type: "card", title: "two-step root", expr: `square roots of ∛${N}`, lines: [`step 1: ∛${N} is ${c}`, `step 2: roots of ${c}?`], steps: [`${c} × ${c} × ${c} = ${N}`, `answer: ${correct}`] };
      p.data = { form, sub, N, c, r };
      return finishChoice(p, correct, [`${r} only`, `${c} and ${MINUS}${c}`, `${MINUS}${r} only`], ["0", `${r}`, "no real square roots"], vi);
    }
    if (form === 1) {
      const sub = slot % 2;
      const [ly, approxA, exactA, rawA] = pick(PC_LY, Math.floor(slot / 2));
      if (sub === 0) {
        const correct = sfStr(String(approxA), 13);
        const p = problemBase("power-capstone", vi, "choice");
        p.prompt = `One light-year is about 9.5 × 10¹² km. A star is ${ly} light-years away. ABOUT how many kilometres is that? Give your answer in standard form with one significant figure.`;
        p.hint1 = `Multiply ${ly} by 9.5, then round to ONE significant figure before writing standard form.`;
        p.hint2 = `${ly} × 9.5 → about ${approxA * 10}.`;
        p.solution = `${ly} × 9.5 → about ${approxA * 10}, so the distance is about ${approxA * 10} × 10¹² km → ${correct} km.`;
        p.visual = { type: "card", title: "the light-year leap", expr: `${ly} × 9.5 × 10¹² km`, lines: [`${ly} × 9.5 → about ${approxA * 10}`], steps: [`about ${approxA * 10} × 10¹² → ${correct}`] };
        p.data = { form, sub, ly, approxA };
        return finishChoice(p, correct,
          [sfStr(String(approxA), 12), sfStr(String(approxA + 1), 13), sfStr(String(approxA + 2), 14)],
          [sfStr(String(approxA), 14), sfStr(String(approxA + 1), 12), sfStr("1", 13)], vi);
      }
      const correct = sfStr(exactA, 13);
      const p = problemBase("power-capstone", vi, "choice");
      p.prompt = `One light-year is about 9.5 × 10¹² km. A star is ${ly} light-years away. How many kilometres is that exactly? Give your answer in standard form.`;
      p.hint1 = `Compute ${ly} × 9.5 exactly, then normalize so that 1 ≤ A < 10.`;
      p.hint2 = `${ly} × 9.5 = ${rawA}.`;
      p.solution = `${ly} × 9.5 = ${rawA}, so the distance → ${rawA} × 10¹² km → ${correct} km. (${rawA} is ≥ 10, so normalize.)`;
      p.visual = { type: "card", title: "the light-year leap", expr: `${ly} × 9.5 × 10¹² km`, lines: [`${ly} × 9.5 = ${rawA}`], steps: [`${rawA} × 10¹² → ${correct}`] };
      p.data = { form, sub, ly, exactA };
      return finishChoice(p, correct,
        [`${rawA} × 10¹²`, sfStr(exactA, 12), sfStr(exactA, 14)],
        [sfStr(exactA, 11), sfStr(shiftPointRight(exactA), 12), sfStr(exactA, 15)], vi);
    }
    if (form === 2) {
      const [disp, js, expected, why] = pick(PC_SIGN, slot);
      const p = problemBase("power-capstone", vi, slot % 2 === 1 ? "choice" : "filled");
      p.prompt = `Work out ${disp}.`;
      p.hint1 = "Power BEFORE the +, −, ×, ÷ around it. For each power, count the negative factors.";
      p.hint2 = "Odd count of negatives → negative; even count → positive. Then finish the arithmetic.";
      p.solution = why;
      p.visual = { type: "card", title: "the sign ladder", expr: disp, lines: ["powers first, signs by counting"], steps: [why] };
      p.data = { form, js };
      return finishNumeric(p, expected,
        [expected === 0 ? 1 : -expected, expected + 2, expected - 2],
        [expected + 1, expected - 1, expected * 2 + 1], slot % 2 === 1, vi);
    }
    // form 3: order the mixed powers (book: powers of −0.6)
    const items = pick(PC_ORD, slot);
    const ask = slot % 2 === 0 ? "smallest" : "largest";
    const vals = items.map(([, v]) => v);
    const target = ask === "smallest" ? Math.min(...vals) : Math.max(...vals);
    const correct = items.find(([, v]) => v === target)[0];
    const listing = items.map(([l]) => l).join("   ·   ");
    const detail = items.map(([l, v]) => `${l} → ${sx(v)}`).join(";  ");
    const p = problemBase("power-capstone", vi, "choice");
    p.prompt = `Which of these is the ${ask.toUpperCase()}?   ${listing}`;
    p.hint1 = "Careful with brackets: (−0.6)² is positive, but −0.6² is negative. And anything to the power 0 is 1.";
    p.hint2 = detail;
    p.solution = `${detail} — so the ${ask} is ${correct}.`;
    p.visual = { type: "card", title: `hunt the ${ask}`, expr: `${items.length} mixed powers`, lines: items.map(([l]) => l).slice(0, 4), steps: [`answer: ${correct}`] };
    p.data = { form, items, ask };
    return finishChoice(p, correct, items.filter(([l]) => l !== correct).map(([l]) => l), ["0", "1"], vi);
  }

  /* ---------------- engine ---------------- */
  const GENERATORS = {
    "root-rocket": rootRocketProblem,
    "sign-of-power": signOfPowerProblem,
    "fraction-powers": fractionPowersProblem,
    "standard-writer": standardWriterProblem,
    "standard-compare": standardCompareProblem,
    "power-capstone": powerCapstoneProblem
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
    const exp = problem.expected;
    const sameF = (f) => String(Fdisp(f)) === String(exp);
    switch (problem.classicId) {
      case "root-rocket": {
        if (d.form === 0) {
          if (d.sub === 0) return exp === d.x ** d.k;
          return exp === d.base && d.base ** d.k === d.N;
        }
        if (d.form === 1 || d.form === 2) {
          return Math.abs(Math.pow(evalPlain(d.ans), d.k) - evalPlain(d.rad)) < 1e-9;
        }
        return typeof exp === "string" && exp === d.correct;
      }
      case "sign-of-power": {
        if (d.form === 0) return exp === (d.paren ? (-d.a) ** d.n : -(d.a ** d.n));
        if (d.form === 2) return exp === d.count && d.count === d.list.filter(([, v]) => v === 1).length;
        return typeof exp === "string" && exp === d.correct;
      }
      case "fraction-powers": {
        if (d.form === 0) return sameF(powF(F(d.n, d.d), d.k));
        if (d.form === 1) return sameF(d.paren ? powF(F(-d.n, d.d), d.k) : fneg(powF(F(d.n, d.d), d.k)));
        if (d.form === 2) return sameF(F(d.n ** d.k, d.d));
        if (d.sub === 0) return exp === (-d.b) ** d.a;
        if (d.sub === 1) return exp === (d.d - d.c) ** d.E;
        if (d.sub === 2) return exp === d.q + d.k / 2 - d.pp;
        return sameF(F(d.k - 1, d.k));
      }
      case "standard-writer": {
        if (d.form === 3) return exp === expandSF(d.a, d.n) && d.plain === exp;
        return exp === sfStr(d.a, d.n) && expandSF(d.a, d.n) === d.plain;
      }
      case "standard-compare": {
        if (d.form === 0) return exp === (d.lv > d.rv ? ">" : d.lv < d.rv ? "<" : "=");
        if (d.form === 1) {
          const vals = d.items.map(([, v]) => v);
          if (new Set(vals).size !== vals.length) return false; // ties would make the question ambiguous
          const target = d.ask === "smallest" ? Math.min(...vals) : Math.max(...vals);
          return exp === d.items.find(([, v]) => v === target)[0];
        }
        if (d.form === 2) {
          return exp === sfStr(d.a, d.n) && Math.abs(evalPlain(d.a) * 10 ** d.n - d.rawVal) / d.rawVal < 1e-9;
        }
        if (d.sub === 0) {
          return exp === (expandSF(d.a, d.n).match(/0/g) || []).length;
        }
        return typeof exp === "string" && exp.startsWith("No")
          && d.f1 * d.f2 === Number(d.prod)
          && Math.abs(d.pierreA * 10 ** d.pierreN - d.correctA * 10 ** d.correctN) / (d.correctA * 10 ** d.correctN) < 1e-9;
      }
      case "power-capstone": {
        if (d.form === 0) {
          if (d.sub === 0) return exp === d.r && d.r * d.r === d.c && d.c * d.c === d.N;
          return typeof exp === "string" && exp === `${d.r} and ${MINUS}${d.r}` && d.r * d.r === d.c && d.c ** 3 === d.N;
        }
        if (d.form === 1) {
          const total = Number(d.ly) * 9.5e12;
          if (d.sub === 0) return exp === sfStr(String(d.approxA), 13) && Math.abs(total / 1e13 - d.approxA) <= 0.5;
          return exp === sfStr(d.exactA, 13) && Math.abs(total - Number(d.exactA) * 1e13) / total < 1e-9;
        }
        if (d.form === 2) {
          try { return exp === Function(`"use strict";return (${d.js});`)(); } catch { return false; }
        }
        const vals = d.items.map(([, v]) => v);
        const target = d.ask === "smallest" ? Math.min(...vals) : Math.max(...vals);
        const hits = d.items.filter(([, v]) => v === target);
        return hits.length === 1 && exp === hits[0][0];
      }
      default:
        return false;
    }
  }
  function renderProblemVisual(problem, state = "initial") {
    const v = problem.visual || {};
    const revealed = state === "solution" || state === "worked";
    const answer = revealed ? `<text x="280" y="316" text-anchor="middle" font-size="16" font-weight="bold" fill="${NAVY}">Answer: ${escapeHtml(problem.expectedDisplay)}</text>` : "";
    let html = "";
    let text = problem.skill;
    if (v.type === "ladder") {
      html = ladderSvg(v, revealed).replace("</svg>", answer + "</svg>");
      text = revealed ? "Each step multiplies by the base — the sign flip-flops with the count of negatives." : "Watch the sign flip-flop as the ladder climbs.";
    } else if (v.type === "zoom") {
      html = zoomSvg(v, revealed).replace("</svg>", answer + "</svg>");
      text = revealed ? "The point rocket lands after the first digit — the jumps count the exponent." : "Count how many places the decimal point must jump.";
    } else if (v.type === "card") {
      html = cardSvg(v, revealed).replace("</svg>", answer + "</svg>");
      text = revealed ? "The card shows the worked steps." : "Plan the steps — the card tracks the work.";
    }
    return { html, text };
  }

  /* ---------------- intro scenes ---------------- */
  const INTRO_SCENES = [
    {
      title: "Pip's Power Tower",
      purpose: "Squares, cubes and roots as repeated multiplication and its undoing.",
      classicId: "root-rocket",
      variant: 0,
      caption: "Powers launch the rocket — roots bring it home.",
      durationMs: 20000,
      voiceover: "Welcome back, engineer! Pip's newest machine is the Power Tower. A square like eight squared just means eight times eight — sixty-four — and a cube stacks three copies. Roots fly the mission backwards: the square root of one hundred asks which number, squared, makes one hundred. Remember the rule of the tower: the root symbol only ever reports the positive root, even though every positive number has two square roots."
    },
    {
      title: "The Sign Flip-Flop",
      purpose: "(−3)⁴ is positive but −3⁴ is negative — brackets decide.",
      classicId: "sign-of-power",
      variant: 0,
      caption: "Even count of negatives → positive; odd count → negative.",
      durationMs: 22000,
      voiceover: "Watch the flip-flop ladder! Negative three to the fourth means four copies of negative three multiplied together — four negatives, an even count, so the answer is positive eighty-one. But without brackets, the power only touches the three, and the minus applies afterwards: negative eighty-one. Same digits, opposite answers! Count the negative factors like you counted counters at the depot — even makes positive, odd makes negative."
    },
    {
      title: "Tiny but Mighty",
      purpose: "Power the top AND the bottom of a fraction — and spot where the minus sits.",
      classicId: "fraction-powers",
      variant: 1,
      caption: "The exponent belongs to everything inside the brackets.",
      durationMs: 21000,
      voiceover: "Fractions love powers — but the exponent belongs to the whole tower, top and bottom. Negative three-fifths to the fourth means four copies of the whole fraction: four negatives make a positive, and three-to-the-fourth over five-to-the-fourth gives eighty-one six-hundred-twenty-fifths. Watch for impostors: a minus outside the brackets applies after, and an exponent on the top alone leaves the bottom unpowered. Three different problems, three different answers."
    },
    {
      title: "The Point Rocket",
      purpose: "Standard form A × 10ⁿ — the point jumps, the exponent counts.",
      classicId: "standard-writer",
      variant: 0,
      caption: "Park the point after the first digit; count the jumps.",
      durationMs: 23000,
      voiceover: "Astronomers hate writing fifty-two million as a parade of zeros, so they launch the point rocket. Park the decimal point right after the first digit — five point two — and count the jumps: seven places, so times ten to the seventh. The law of the rocket: A must be at least one and less than ten. Tiny numbers fly the other way, earning a negative exponent."
    },
    {
      title: "Cosmic Weighing Scales",
      purpose: "Compare standard-form numbers by expanding or matching exponents.",
      classicId: "standard-compare",
      variant: 0,
      caption: "Expand both sides before you judge.",
      durationMs: 20000,
      voiceover: "Which is heavier: five point six times ten to the sixth, or six times ten to the fifth? The cosmic scales say: expand first! That is five million six hundred thousand against six hundred thousand — the first wins easily. Bigger-looking coefficients can hide smaller exponents, and negative exponents flip your intuition upside down. Never compare the front numbers alone; the exponent is the real boss of the number's size."
    },
    {
      title: "The Light-Year Leap",
      purpose: "Capstone: light-year distances, sign ladders and root chains.",
      classicId: "power-capstone",
      variant: 1,
      caption: "Proxima Centauri: 4.2 light-years ≈ 4 × 10¹³ km.",
      durationMs: 24000,
      voiceover: "Final mission, cadet! Proxima Centauri sits four point two light-years away, and one light-year is about nine point five times ten-to-the-twelfth kilometres. Multiply and round: about forty times ten-to-the-twelfth — that is four times ten-to-the-thirteenth kilometres! Then survive the capstone gauntlet: two-step roots where the answer hides inside another root, sign ladders of negative one where consecutive powers always cancel to zero. Bring everything you learned — launch!"
    }
  ];
  function renderIntroScene(index) {
    const scene = INTRO_SCENES[index % INTRO_SCENES.length];
    const fakeProblem = generateProblem(scene.classicId || CLASSIC_IDS[index % CLASSIC_IDS.length], scene.variant ?? index);
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
  root.RationalPowersModule = api;
})(typeof window !== "undefined" ? window : globalThis);
