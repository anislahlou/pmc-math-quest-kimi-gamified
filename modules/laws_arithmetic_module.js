/* Laws of Arithmetic module (G1 Lesson 5, Think Academy G1M L1-L8 study book).
   Dialect A (train-style): CLASSICS + generateProblem + checkAnswer +
   renderProblemVisual + INTRO_SCENES + createRound.
   All generators are procedural with exact, audit-clean answers (integers are
   filled-or-choice; every fraction, mixed-number and decimal answer is a
   choice-mode string). Distractors target the lesson's known misconceptions:
   law mix-ups, sign slips when distributing over brackets, forgetting to power
   BOTH terms, grouping unfriendly pairs, and nudging a mixed number the wrong
   way (book Lesson 5: laws & regrouping 71-73, distributive spreads 74-76,
   nudge tricks & challenges 77, After Class 78-80, Extensive 81-82). */
(function (root) {
  "use strict";

  const CLASSICS = [
    { id: "name-that-law", nickname: "Name That Law", skill: "Spot commutative, associative and distributive laws — and expand brackets with correct signs.", sourcePages: "Book 71-72 / PDF 79-80" },
    { id: "friendly-pairs", nickname: "Friendly Pairs", skill: "Use commutative + associative laws to regroup into friendly pairs that make 1, 10 or 100.", sourcePages: "Book 72-73 / PDF 80-81" },
    { id: "spread-it-out", nickname: "Spread It Out", skill: "Distributive law forwards: multiply every term in the bracket by the outside factor.", sourcePages: "Book 71+74-76 / PDF 79+82-84" },
    { id: "factor-out", nickname: "Factor It Out", skill: "Distributive law backwards: pull out the common factor — even hidden or point-shifted ones.", sourcePages: "Book 73-77+80 / PDF 81-85+88" },
    { id: "nudge-split", nickname: "Nudge & Split", skill: "Rewrite numbers near an integer (9.8 → 10 − 0.2, −9 24/25 → −10 + 1/25) to make products easy.", sourcePages: "Book 73+77+82 / PDF 81+85+90" },
    { id: "clever-capstone", nickname: "Clever Capstone", skill: "IMC-style chains: double factor-outs, giant-product distributions and split subtractions.", sourcePages: "Book 76-77+81-82 / PDF 84-85+89-90" }
  ];
  const CLASSIC_IDS = CLASSICS.map((c) => c.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((c) => [c.id, c]));
  const CLASSIC_SKILLS = {
    "name-that-law": "Spot the law",
    "friendly-pairs": "Swap & group",
    "spread-it-out": "Distribute forwards",
    "factor-out": "Distribute backwards",
    "nudge-split": "Nudge near integers",
    "clever-capstone": "Clever chains"
  };
  const SOURCE_COVERAGE = {
    "name-that-law": ["Notes law table (book 72)", "Let's Get Ready 2 (book 71)", "Learn and Discover 10.1 × 15 (book 72)"],
    "friendly-pairs": ["Notes examples (book 72)", "Exploration 1-2 regrouping (book 73)"],
    "spread-it-out": ["Let's Get Ready 3 (book 71)", "Learn and Discover 1 (book 74)", "Exploration 4 (book 75-76)", "After Class 3-4 (book 78-79)"],
    "factor-out": ["Exploration 2-3 (book 73-74)", "Learn and Discover 2 (book 75)", "Practice + After Class 2+5-10 (book 76+78-80)", "Challenge 2 (book 77)"],
    "nudge-split": ["Exploration 1 + 5 (book 73+77)", "Extensive Challenge 1-2 (book 82)"],
    "clever-capstone": ["Challenge 1 (book 77)", "After Class 6 (book 79)", "Extensive Exercises 1-3 (book 81)", "Extensive Challenge 2 (book 82)"]
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
  function fadd(a, b) { return F(a.n * b.d + b.n * a.d, a.d * b.d); }
  function fsub(a, b) { return F(a.n * b.d - b.n * a.d, a.d * b.d); }
  function fneg(a) { return F(-a.n, a.d); }
  function fstr(f) { return fracStr(f.n, f.d); }
  function Fdisp(f) { return f.d === 1 ? f.n : fstr(f); } // number for integers, "a/b" string otherwise
  // Mixed-number display for a fraction: −91/6 → "−15 1/6"; 5/4 → "1 1/4"; integers stay plain.
  function mixStrF(f) {
    if (f.d === 1) return String(f.n);
    const sign = f.n < 0 ? MINUS : "";
    const a = Math.abs(f.n);
    const w = Math.floor(a / f.d), r = a % f.d;
    if (w === 0) return sign + `${r}/${f.d}`;
    if (r === 0) return sign + w;
    return `${sign}${w} ${r}/${f.d}`;
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
      answerMode: answerType === "choice" ? "choice" : "filled",
      data: { form: variantIndex % 4 }
    };
  }
  // Attach numeric-answer fields (filled or choice by flag).
  function finishNumeric(p, expected, wrongs, fallbacks, useChoice, variantIndex) {
    const disp = (w) => (typeof w === "number" ? sx(w) : String(w)); // unify minus signs before dedup
    p.answerType = useChoice ? "choice" : "filled";
    p.answerMode = p.answerType;
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
    p.answerType = "choice";
    p.answerMode = "choice";
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = makeChoices(correct, wrongs.map(Fdisp).map(String), fallbacks.map(Fdisp).map(String), variantIndex);
    return p;
  }
  // Choice-mode string answer (law names, expansions, mixed numbers, decimals…).
  function finishChoice(p, correct, wrongs, fallbacks, variantIndex) {
    p.answerType = "choice";
    p.answerMode = "choice";
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = makeChoices(correct, wrongs, fallbacks, variantIndex);
    return p;
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
    s += `<text x="280" y="${v.title ? 132 : 118}" text-anchor="middle" font-size="${(v.expr || "").length > 38 ? 15 : (v.expr || "").length > 26 ? 19 : 24}" font-weight="800" fill="${NAVY}">${escapeHtml(v.expr)}</text>`;
    const rows = (revealed && v.steps ? v.steps : v.lines || []).slice(0, 4);
    rows.forEach((ln, i) => {
      s += `<text x="280" y="${178 + i * 26}" text-anchor="middle" font-size="16" fill="${revealed && v.steps ? TEAL : "#4a5578"}" ${revealed && v.steps ? 'font-weight="bold"' : ""}>${escapeHtml(ln)}</text>`;
    });
    return svgShell(s);
  }
  // Distributive fan: one top box spreads arrows to branch boxes below.
  // v = {title, top, branches[] (labels), results[] (revealed only), note}
  function fanSvg(v, revealed) {
    let s = `<rect x="0" y="0" width="560" height="330" fill="#f4f9ff"/>`;
    if (v.title) s += `<text x="280" y="38" text-anchor="middle" font-size="15" font-weight="bold" fill="${PURPLE}">${escapeHtml(v.title)}</text>`;
    const branches = v.branches.slice(0, 3);
    const n = branches.length;
    const bw = Math.min(190, 460 / n - 16), bh = 52;
    s += `<rect x="160" y="58" width="240" height="56" rx="14" fill="white" stroke="${NAVY}" stroke-width="3"/>`;
    s += `<text x="280" y="92" text-anchor="middle" font-size="${v.top.length > 20 ? 15 : 18}" font-weight="800" fill="${NAVY}">${escapeHtml(v.top)}</text>`;
    branches.forEach((b, i) => {
      const x = 280 + (i - (n - 1) / 2) * (bw + 24) - bw / 2;
      const cx = x + bw / 2;
      s += `<line x1="280" y1="114" x2="${cx}" y2="160" stroke="${CORAL}" stroke-width="3"/>`;
      s += `<circle cx="${cx}" cy="160" r="4" fill="${CORAL}"/>`;
      s += `<rect x="${x}" y="166" width="${bw}" height="${bh}" rx="12" fill="${i === 1 ? "#ffe9c2" : "#dff3f4"}" stroke="${TEAL}" stroke-width="2.5"/>`;
      s += `<text x="${cx}" y="${166 + bh / 2 + 5}" text-anchor="middle" font-size="${b.length > 16 ? 13 : 15}" font-weight="bold" fill="${NAVY}">${escapeHtml(b)}</text>`;
      if (revealed && v.results && v.results[i]) {
        s += `<text x="${cx}" y="${166 + bh + 24}" text-anchor="middle" font-size="15" font-weight="bold" fill="${TEAL}">${escapeHtml(v.results[i])}</text>`;
      }
    });
    const note = revealed && v.note ? v.note : "the outside factor visits EVERY term inside";
    s += `<text x="280" y="296" text-anchor="middle" font-size="14" font-weight="${revealed ? "bold" : "normal"}" fill="${revealed ? TEAL : "#4a5578"}">${escapeHtml(note)}</text>`;
    return svgShell(s);
  }
  // Friendly-pair chips: a row of number chips; the paired ones glow with a brace.
  // v = {title, chips[], pair:[i,j], pairNote, note}
  function pairSvg(v, revealed) {
    let s = `<rect x="0" y="0" width="560" height="330" fill="#f4f9ff"/>`;
    if (v.title) s += `<text x="280" y="42" text-anchor="middle" font-size="15" font-weight="bold" fill="${PURPLE}">${escapeHtml(v.title)}</text>`;
    const chips = v.chips.slice(0, 5);
    const n = chips.length;
    const cw = Math.min(96, 470 / n - 10), ch = 54;
    const y = 130;
    const gap = (470 - n * cw) / (n - 1 || 1);
    chips.forEach((label, i) => {
      const x = 45 + i * (cw + gap);
      const inPair = v.pair && v.pair.includes(i);
      s += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="14" fill="${inPair ? "#ffe9c2" : "white"}" stroke="${inPair ? AMBER : NAVY}" stroke-width="${inPair ? 4 : 2.5}"/>`;
      s += `<text x="${x + cw / 2}" y="${y + ch / 2 + 6}" text-anchor="middle" font-size="${String(label).length > 5 ? 15 : 19}" font-weight="800" fill="${NAVY}">${escapeHtml(label)}</text>`;
    });
    if (v.pair) {
      const [i, j] = v.pair;
      const x1 = 45 + i * (cw + gap) + cw / 2, x2 = 45 + j * (cw + gap) + cw / 2;
      s += `<path d="M ${x1} ${y + ch + 14} Q ${(x1 + x2) / 2} ${y + ch + 52} ${x2} ${y + ch + 14}" fill="none" stroke="${AMBER}" stroke-width="3.5"/>`;
      s += `<text x="${(x1 + x2) / 2}" y="${y + ch + 48}" text-anchor="middle" font-size="15" font-weight="bold" fill="${AMBER}">${escapeHtml(revealed ? v.pairNote || "" : "friendly pair!")}</text>`;
    }
    const note = revealed && v.note ? v.note : "hunt for the two numbers that click together";
    s += `<text x="280" y="290" text-anchor="middle" font-size="14" font-weight="${revealed ? "bold" : "normal"}" fill="${revealed ? TEAL : "#4a5578"}">${escapeHtml(note)}</text>`;
    return svgShell(s);
  }

// ---------------------------------------------------------------------------
// Classic 1: Name That Law
// ---------------------------------------------------------------------------
const LAW_NAMES = { com: "Commutative law", assoc: "Associative law", dist: "Distributive law" };
const NAME0 = [
  ["7 × 9 = 9 × 7", "com"],
  ["(2 × 5) × 4 = 2 × (5 × 4)", "assoc"],
  ["6 × (3 + 2) = 6 × 3 + 6 × 2", "dist"],
  ["0.5 × 8 = 8 × 0.5", "com"],
  ["(1/2 × 3) × 2/3 = 1/2 × (3 × 2/3)", "assoc"],
  ["(1/2 + 1/3) × 6 = 1/2 × 6 + 1/3 × 6", "dist"],
  ["(−4) × 2.5 = 2.5 × (−4)", "com"],
  ["12 × (1/4 + 1/6) = 12 × 1/4 + 12 × 1/6", "dist"],
  ["(0.25 × 17) × 4 = 0.25 × (17 × 4)", "assoc"],
  ["5/7 × 3/5 = 3/5 × 5/7", "com"],
  ["8 × (10 − 0.5) = 8 × 10 − 8 × 0.5", "dist"],
  ["(1.5 × 2) × 5 = 1.5 × (2 × 5)", "assoc"],
];
// form1: correct expansion of (−k) × (m − 1/q)
const NAME1 = [
  [3, 4, 2], [2, 5, 3], [5, 6, 2], [4, 7, 2],
  [2, 9, 4], [6, 3, 5], [3, 8, 3], [4, 5, 4],
];
function name1Correct(k, m, q) { return `(−${k}) × ${m} − (−${k}) × (1/${q})`; }
function name1Wrongs(k, m, q) {
  return [
    `(−${k}) × ${m} − (−${k}) × (−1/${q})`,
    `(−${k}) × ${m} + ${k} × (−1/${q})`,
    `${k} × ${m} − (−${k}) × (1/${q})`,
  ];
}
// form2: quickest rewrite of a.b × m
const NAME2 = [
  [10, 1, 15], [20, 2, 5], [30, 3, 4], [40, 4, 25],
  [10, 5, 8], [50, 5, 4], [20, 5, 12], [100, 1, 7],
];
function name2Correct(a, b, m) { return `(${a} + 0.${b}) × ${m}`; }
function name2Wrongs(a, b, m) {
  return [`${a} × 0.${b} × ${m}`, `(${a} + ${b}) × ${m}`, `${a} + 0.${b} × ${m}`];
}
// form3: complete the equality
const NAME3 = [
  ["5/7 × 3 = 3 × ___", "5/7", ["3", "7/5", "1"]],
  ["(0.25 × 4) × 9 = 0.25 × (4 × ___)", "9", ["4", "0.25", "36"]],
  ["3 × (2 + 4) = 3 × 2 + ___", "3 × 4", ["2 + 4", "3 × 2", "4"]],
  ["12 × (10 − 2) = 12 × 10 − ___", "12 × 2", ["10 − 2", "12 × 10", "2"]],
  ["(−6) × 7.5 = 7.5 × ___", "−6", ["6", "7.5", "−7.5"]],
  ["(2/3 × 9) × 1/3 = 2/3 × (9 × ___)", "1/3", ["9", "2/3", "3"]],
  ["5 × (1/5 + 1/10) = 5 × 1/5 + ___", "5 × 1/10", ["1/5 + 1/10", "5 × 5", "1/10"]],
  ["1.2 × 5 = 5 × ___", "1.2", ["5", "0.6", "12"]],
  ["(8 × 0.125) × 13 = 8 × (0.125 × ___)", "13", ["8", "0.125", "104"]],
  ["24 × (1/3 − 1/8) = 24 × 1/3 − ___", "24 × 1/8", ["1/3 − 1/8", "24 × 3", "1/8"]],
  ["(−2.5) × (−4) = (−4) × ___", "−2.5", ["2.5", "−4", "4"]],
  ["9 × (100 + 2) = 9 × 100 + ___", "9 × 2", ["100 + 2", "9 × 9", "2"]],
];

function classicNameThatLaw(form, vi) {
  if (form === 0) {
    const e = pick(NAME0, vi);
    const p = problemBase("name-that-law", vi, "choice");
    const correct = LAW_NAMES[e[1]];
    const wrongs = Object.keys(LAW_NAMES).filter((k) => k !== e[1]).map((k) => LAW_NAMES[k]);
    wrongs.push("None of the laws");
    finishChoice(p, correct, wrongs, ["Exponent law", "Pi law", "Estimation law"], vi);
    p.prompt = "This machine part is stamped with an equation. Which law of arithmetic does it show?";
    p.data.equation = e[0];
    p.hint1 = "Look at WHAT changed: the order of the factors, the grouping brackets, or one factor being spread over a sum.";
    p.hint2 = "Swapping order → commutative. Moving brackets → associative. Spreading over a sum → distributive.";
    p.solution = `${e[0]} — the ${e[1] === "com" ? "factors simply swapped order" : e[1] === "assoc" ? "brackets moved to a different pair" : "outside factor was spread over every term inside the brackets"}. That is the ${correct}. The value never changes — that is the whole point of a law.`;
    p.visual = { type: "card", title: "Part stamp", equation: e[0], badge: "WHICH LAW?", accent: TEAL, note: "A true law keeps the value identical on both sides." };
    return p;
  }
  if (form === 1) {
    const [k, m, q] = pick(NAME1, vi);
    const p = problemBase("name-that-law", vi, "choice");
    const correct = name1Correct(k, m, q);
    finishChoice(p, correct, name1Wrongs(k, m, q), [`(−${k}) × ${m} − 1/${q}`, `${k} × ${m} + ${k} × (1/${q})`, `(−${k}) × (${m} − 1/${q})`], vi);
    p.prompt = `A bracket sits on the bench: (−${k}) × (${m} − 1/${q}). Which expansion applies the distributive law CORRECTLY — signs included?`;
    p.hint1 = "Every term inside the bracket gets multiplied by (−" + k + ") — keep the minus signs attached to the right owners.";
    p.hint2 = `The second term is MINUS 1/${q}, so the product is (−${k}) × (−1/${q}) — written as − (−${k}) × (1/${q}) with the sign handled outside... check each option's signs slowly.`;
    const val = fadd(F(-k * m, 1), F(k, q));
    p.solution = `Distribute (−${k}) over both terms: ${correct}. The trap is the second term: it is a SUBTRACTION inside, so the expansion keeps a minus in front of (−${k}) × (1/${q}). Numerically this gives ${fstr(val)} — any option with a different value broke a sign.`;
    p.visual = { type: "fan", title: "Bracket bench", top: `(−${k}) × (${m} − 1/${q})`, branches: [`${m}`, `−1/${q}`], results: [`(−${k}) × ${m}`, `(−${k}) × (−1/${q})`], accent: CORAL, note: "The distributor must carry its minus sign to BOTH terms." };
    return p;
  }
  if (form === 2) {
    const [a, b, m] = pick(NAME2, vi);
    const p = problemBase("name-that-law", vi, "choice");
    const correct = name2Correct(a, b, m);
    finishChoice(p, correct, name2Wrongs(a, b, m), [`(${a} − 0.${b}) × ${m}`, `${a} × ${m} + 0.${b}`, `0.${b} × (${a} + ${m})`], vi);
    p.prompt = `Quick calculation: ${a}.${b} × ${m}. Which rewrite uses the laws to make this painless?`;
    p.hint1 = `${a}.${b} is one number glued from ${a} and 0.${b} — a sum inside a bracket.`;
    p.hint2 = `Distributive law: (${a} + 0.${b}) × ${m} lets you multiply each part by ${m} separately — both are easy.`;
    p.solution = `${a}.${b} = ${a} + 0.${b}, so ${a}.${b} × ${m} becomes ${correct}. That gives ${a * m} + ${sx(b / 10 * m)} → ${sx((a + b / 10) * m)}. The other options either drop a factor, glue the wrong sum, or forget the bracket.`;
    p.visual = { type: "card", title: "Quick-calc ticket", equation: `${a}.${b} × ${m} = ?`, badge: "REWRITE", accent: AMBER, note: `Split ${a}.${b} into ${a} + 0.${b}, then distribute.` };
    return p;
  }
  const [disp, ans, wrongs] = pick(NAME3, vi);
  const p = problemBase("name-that-law", vi, "choice");
  finishChoice(p, ans, wrongs, ["0", "10", "1/2"], vi);
  p.prompt = "Complete the equality so that both sides stay equal:";
  p.data.equation = disp;
  p.hint1 = "Whatever the laws do — swap, regroup, or spread — the two sides must keep the SAME value.";
  p.hint2 = "Match the pattern of the law: find which part moved, then fill the blank with its partner.";
  p.solution = `${disp.replace("___", ans)} — the blank must be ${ans} for the law's pattern to hold and the values to stay equal.`;
  p.visual = { type: "card", title: "Balance stamp", equation: disp, badge: "FILL IT", accent: PURPLE, note: "Both sides must balance — the laws guarantee it." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 2: Friendly Pairs
// ---------------------------------------------------------------------------
const ADD_TRIPLES = [
  ["3.7", "5", "6.3"], ["4.6", "7", "5.4"], ["2.9", "8", "7.1"],
  ["1.25", "3", "8.75"], ["0.6", "9", "9.4"], ["2.5", "6", "7.5"],
];
const FR_TRIPLES = [
  [["2/7", F(2, 7)], ["5/8", F(5, 8)], ["5/7", F(5, 7)]],
  [["3/11", F(3, 11)], ["1/4", F(1, 4)], ["8/11", F(8, 11)]],
  [["4/9", F(4, 9)], ["2/5", F(2, 5)], ["5/9", F(5, 9)]],
  [["5/13", F(5, 13)], ["3/7", F(3, 7)], ["8/13", F(8, 13)]],
  [["1/6", F(1, 6)], ["4/9", F(4, 9)], ["5/6", F(5, 6)]],
  [["3/8", F(3, 8)], ["2/3", F(2, 3)], ["5/8", F(5, 8)]],
];
const MULT_TRIPLES = [
  ["0.25", "17", "4"], ["8", "0.125", "23"], ["2.5", "7", "40"], ["1.25", "19", "8"],
  ["0.5", "46", "2"], ["0.2", "31", "5"], ["4", "2.6", "25"], ["0.125", "37", "8"],
];
const MULT_FR = [
  [["5/7", F(5, 7)], [9, F(9, 1)], ["7/5", F(7, 5)]],
  [["3/4", F(3, 4)], [5, F(5, 1)], ["8/3", F(8, 3)]],
  [["2/9", F(2, 9)], [7, F(7, 1)], ["9/2", F(9, 2)]],
  [["5/6", F(5, 6)], [3, F(3, 1)], ["12/5", F(12, 5)]],
];
const FOUR_MULT = [
  ["25", "7", "0.4", "2"], ["5", "13", "2", "0.5"], ["8", "3", "0.125", "4"],
  ["2.5", "9", "4", "0.2"], ["50", "3", "0.2", "5"], ["4", "11", "25", "0.1"],
  ["1.25", "7", "8", "0.3"], ["0.4", "6", "2.5", "3"], ["0.75", "8", "4", "0.25"],
  ["1.5", "12", "2", "0.25"], ["2.2", "5", "5", "0.4"], ["12.5", "3", "8", "0.2"],
];
const MISSING = [
  ["0.25", "4", 17, 17], ["8", "0.125", 23, 23], ["2.5", "40", 300, 3],
  ["1.25", "8", 70, 7], ["0.5", "2", 19, 19], ["0.2", "5", 13, 13],
  ["4", "25", 1100, 11], ["50", "0.02", 9, 9],
];
const ROT_ORDERS = [[0, 1, 2], [1, 2, 0], [2, 1, 0]];

function joinSigned(nums) {
  return nums.map((v, i) => {
    const a = Math.abs(v);
    if (i === 0) return v < 0 ? `−${a}` : `${a}`;
    return v < 0 ? `− ${a}` : `+ ${a}`;
  }).join(" ");
}

function classicFriendlyPairs(form, vi) {
  const slot = Math.floor(vi / 4);
  if (form === 0) {
    if (slot % 2 === 0) {
      const bank = pick(ADD_TRIPLES, slot);
      const order = pick(ROT_ORDERS, slot);
      const chips = order.map((i) => bank[i]);
      const total = bank.reduce((s, x) => s + parseFloat(x), 0);
      const p = problemBase("friendly-pairs", vi, "integer");
      finishNumeric(p, total, wrongs(total), [10, 20, 100], vi % 2 === 0, vi);
      p.prompt = `Three crates need one total: ${chips.join(" + ")}. Pair the friendly decimals first, then give the sum.`;
      p.hint1 = "Hunt for two crates whose decimal parts complete a whole number.";
      p.hint2 = `${bank[0]} + ${bank[2]} = ${sx(parseFloat(bank[0]) + parseFloat(bank[2]))} — a friendly pair!`;
      const pairSum = sx(parseFloat(bank[0]) + parseFloat(bank[2]));
      p.solution = `${bank[0]} + ${bank[2]} = ${pairSum} — swap and group (commutative + associative)! Then ${pairSum} + ${bank[1]} = ${sx(total)}.`;
      p.visual = { type: "pairs", title: "Crate wall", chips, pair: [order.indexOf(0), order.indexOf(2)], accent: TEAL, note: "Decimals that complete a whole number belong together." };
      return p;
    }
    const bank = pick(FR_TRIPLES, slot);
    const order = pick(ROT_ORDERS, slot);
    const chips = order.map((i) => bank[i][0]);
    const totalF = bank.reduce((s, t) => fadd(s, t[1]), F(0, 1));
    const pairF = fadd(bank[0][1], bank[2][1]);
    const p = problemBase("friendly-pairs", vi, "choice");
    finishChoice(p, fstr(totalF), wrongsFrac(totalF).map((f) => String(Fdisp(f))), ["1", "2", "3"], vi);
    p.prompt = `Three fraction crates: ${chips.join(" + ")}. Pair the same-denominator friends first, then give the sum.`;
    p.hint1 = "Same denominators are instant friends — add those two first.";
    p.hint2 = `${bank[0][0]} + ${bank[2][0]} = ${fstr(pairF)} — then add ${bank[1][0]}.`;
    p.solution = `${bank[0][0]} + ${bank[2][0]} = ${fstr(pairF)} — group the friends! Then ${fstr(pairF)} + ${bank[1][0]} = ${fstr(totalF)}.`;
    p.visual = { type: "pairs", title: "Crate wall", chips, pair: [order.indexOf(0), order.indexOf(2)], accent: TEAL, note: "Same denominator? Same team." };
    return p;
  }
  if (form === 1) {
    if (slot % 2 === 0) {
      const bank = pick(MULT_TRIPLES, slot);
      const order = pick(ROT_ORDERS, slot);
      const chips = order.map((i) => bank[i]);
      const total = bank.reduce((s, x) => s * parseFloat(x), 1);
      const pairProd = parseFloat(bank[0]) * parseFloat(bank[2]);
      const p = problemBase("friendly-pairs", vi, "integer");
      finishNumeric(p, total, wrongs(total), [1, 10, 100], vi % 2 === 0, vi);
      p.prompt = `Conveyor multiply: ${chips.join(" × ")}. Pair the friendly factors first, then give the product.`;
      p.hint1 = "Two of these multiply into a clean whole number — find them.";
      p.hint2 = `${bank[0]} × ${bank[2]} = ${sx(pairProd)} — friendly!`;
      p.solution = `${bank[0]} × ${bank[2]} = ${sx(pairProd)} — swap and group! Then ${sx(pairProd)} × ${bank[1]} = ${sx(total)}.`;
      p.visual = { type: "pairs", title: "Conveyor", chips, pair: [order.indexOf(0), order.indexOf(2)], accent: CORAL, note: "0.25 loves 4. 0.125 loves 8. Learn the couples." };
      return p;
    }
    const bank = pick(MULT_FR, slot);
    const order = pick(ROT_ORDERS, slot);
    const chips = order.map((i) => String(bank[i][0]));
    const totalF = bank.reduce((s, t) => fmul(s, t[1]), F(1, 1));
    const pairF = fmul(bank[0][1], bank[2][1]);
    const ans = totalF.n / totalF.d;
    const p = problemBase("friendly-pairs", vi, "integer");
    finishNumeric(p, ans, wrongs(ans), [1, 2, 10], vi % 2 === 0, vi);
    p.prompt = `Conveyor multiply: ${chips.join(" × ")}. Pair the fraction friends first, then give the product.`;
    p.hint1 = "Two of these fractions cancel each other beautifully.";
    p.hint2 = `${bank[0][0]} × ${bank[2][0]} = ${fstr(pairF)} — then multiply by ${bank[1][0]}.`;
    p.solution = `${bank[0][0]} × ${bank[2][0]} = ${fstr(pairF)} — swap and group! Then ${fstr(pairF)} × ${bank[1][0]} = ${fstr(totalF)}.`;
    p.visual = { type: "pairs", title: "Conveyor", chips, pair: [order.indexOf(0), order.indexOf(2)], accent: CORAL, note: "Upside-down fractions multiply to something clean." };
    return p;
  }
  if (form === 2) {
    const bank = pick(FOUR_MULT, vi);
    const [w, x, y, z] = bank.map((s) => parseFloat(s));
    const p1 = w * y;
    const p2 = x * z;
    const total = p1 * p2;
    const p = problemBase("friendly-pairs", vi, "integer");
    finishNumeric(p, total, wrongs(total), [10, 100, 1000], vi % 2 === 0, vi);
    p.prompt = `Four-part conveyor: ${bank.join(" × ")}. Make TWO friendly pairs, then give the product.`;
    p.hint1 = "Shuffle the order so decimals meet their soulmates.";
    p.hint2 = `${bank[0]} × ${bank[2]} = ${sx(p1)} and ${bank[1]} × ${bank[3]} = ${sx(p2)}.`;
    p.solution = `${bank[0]} × ${bank[2]} = ${sx(p1)} and ${bank[1]} × ${bank[3]} = ${sx(p2)}, then ${sx(p1)} × ${sx(p2)} = ${sx(total)}. Two friendly pairs — the associative and commutative laws working as a team.`;
    p.visual = { type: "pairs", title: "Double conveyor", chips: bank.slice(), pair: [0, 2], accent: CORAL, note: `Also pair ${bank[1]} with ${bank[3]} — two teams at once.` };
    return p;
  }
  const [aStr, cStr, target, ans] = pick(MISSING, vi);
  const p = problemBase("friendly-pairs", vi, "integer");
  finishNumeric(p, ans, wrongs(ans), [1, 10, 100], slot % 2 === 1, vi);
  p.prompt = `Mystery crate: ${aStr} × ? × ${cStr} = ${target}. What number hides in the middle crate?`;
  p.hint1 = `${aStr} × ${cStr} is a friendly pair — multiply them first.`;
  const ac = parseFloat(aStr) * parseFloat(cStr);
  p.hint2 = `${aStr} × ${cStr} = ${sx(ac)}. So ${sx(ac)} × ? = ${target}.`;
  p.solution = `${aStr} × ${cStr} = ${sx(ac)} — the friendly pair! Then ${sx(ac)} × ? = ${target} forces ? → ${ans}. Grouping first turns a mystery into a one-liner.`;
  p.visual = { type: "pairs", title: "Mystery crate", chips: [aStr, "?", cStr], pair: [0, 2], accent: PURPLE, note: "Lock the friendly pair, then read off the stranger." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 3: Spread It Out
// ---------------------------------------------------------------------------
const SPREAD0 = [
  { k: -18, t: [[7, 9, 1], [5, 6, -1], [5, 18, 1]] },
  { k: -48, t: [[1, 16, 1], [1, 24, -1]] },
  { k: -24, t: [[5, 12, 1], [2, 3, 1], [3, 4, -1]] },
  { k: -60, t: [[5, 12, 1], [1, 5, -1]] },
  { k: -12, t: [[3, 4, 1], [5, 6, -1], [7, 12, 1]] },
  { k: 24, t: [[1, 2, 1], [2, 3, -1], [5, 6, 1]] },
  { k: -24, t: [[7, 12, 1], [3, 8, -1], [1, 6, 1]] },
  { k: 36, t: [[2, 3, 1], [3, 4, -1], [5, 12, 1]] },
  { k: -18, t: [[5, 6, 1], [7, 9, -1], [1, 3, 1]] },
  { k: -20, t: [[4, 5, 1], [1, 2, -1], [3, 10, 1]] },
  { k: 24, t: [[7, 8, 1], [5, 6, -1], [1, 4, 1]] },
  { k: -40, t: [[2, 5, 1], [1, 4, 1], [3, 10, -1]] },
];
const SPREAD1 = [
  { k: -24, t: [["3/4", 3, 4, -1], ["1 1/3", 4, 3, 1], ["2.5", 5, 2, -1]] },
  { k: -8, t: [["1/4", 1, 4, 1], ["0.5", 1, 2, 1], ["5/8", 5, 8, -1]] },
  { k: 36, t: [["0.75", 3, 4, 1], ["1/6", 1, 6, -1], ["5/12", 5, 12, 1]] },
  { k: -16, t: [["0.5", 1, 2, -1], ["3/4", 3, 4, 1], ["1/8", 1, 8, -1]] },
  { k: -15, t: [["1.2", 6, 5, 1], ["2/3", 2, 3, 1], ["4/15", 4, 15, -1]] },
  { k: 12, t: [["2.5", 5, 2, -1], ["5/6", 5, 6, 1], ["1/3", 1, 3, 1]] },
  { k: -20, t: [["3.5", 7, 2, 1], ["7/10", 7, 10, -1], ["1/5", 1, 5, 1]] },
  { k: 16, t: [["1.25", 5, 4, -1], ["5/8", 5, 8, 1], ["3/4", 3, 4, 1]] },
];
const SPREAD2 = [
  { inside: "−3/4 − 5/9 + 7/12", rn: 1, rd: 36, t: [[3, 4, -1], [5, 9, -1], [7, 12, 1]] },
  { inside: "1 3/4 − 7/8 − 7/12", rn: -7, rd: 8, t: [[7, 4, 1], [7, 8, -1], [7, 12, -1]] },
  { inside: "2/3 − 5/6 + 1/2", rn: 1, rd: 12, t: [[2, 3, 1], [5, 6, -1], [1, 2, 1]] },
  { inside: "5/6 − 3/4 + 1/3", rn: 1, rd: 24, t: [[5, 6, 1], [3, 4, -1], [1, 3, 1]] },
  { inside: "7/9 + 1/3 − 5/18", rn: 1, rd: 18, t: [[7, 9, 1], [1, 3, 1], [5, 18, -1]] },
  { inside: "4/7 − 1/2 + 5/14", rn: 1, rd: 28, t: [[4, 7, 1], [1, 2, -1], [5, 14, 1]] },
  { inside: "−5/6 + 3/8 + 7/12", rn: -1, rd: 24, t: [[5, 6, -1], [3, 8, 1], [7, 12, 1]] },
  { inside: "3/4 + 5/6 − 7/8", rn: 1, rd: 48, t: [[3, 4, 1], [5, 6, 1], [7, 8, -1]] },
];
const SPREAD3 = [
  ["2.5", "9.8", "24.5", "2.5 × (10 − 0.2) → 25 − 0.5", ["25.5", "24.3", "245"]],
  ["3.6", "10.2", "36.72", "3.6 × (10 + 0.2) → 36 + 0.72", ["36.2", "3.672", "367.2"]],
  ["1.25", "8.8", "11", "1.25 × (8 + 0.8) → 10 + 1", ["10", "12", "110"]],
  ["2.5", "4.4", "11", "2.5 × (4 + 0.4) → 10 + 1", ["10", "12", "110"]],
  ["12.5", "8.08", "101", "12.5 × (8 + 0.08) → 100 + 1", ["100", "102", "1010"]],
  ["0.25", "4.8", "1.2", "0.25 × (4 + 0.8) → 1 + 0.2", ["1.8", "4.8", "12"]],
  ["7.5", "9.6", "72", "7.5 × (10 − 0.4) → 75 − 3", ["75", "71", "720"]],
  ["4.5", "10.2", "45.9", "4.5 × (10 + 0.2) → 45 + 0.9", ["45.2", "459", "44.9"]],
  ["6.25", "8.4", "52.5", "6.25 × (8 + 0.4) → 50 + 2.5", ["52", "50.4", "525"]],
  ["1.5", "10.4", "15.6", "1.5 × (10 + 0.4) → 15 + 0.6", ["15.4", "156", "14.9"]],
  ["12.3", "9.9", "121.77", "12.3 × (10 − 0.1) → 123 − 1.23", ["121.23", "122.77", "1217.7"]],
  ["5.14", "1.01", "5.1914", "5.14 × (1 + 0.01) → 5.14 + 0.0514", ["5.15", "5.2414", "51.914"]],
];

function termListDisp(terms, withSign) {
  return terms.map((t, i) => {
    const s = t[t.length - 1];
    const body = typeof t[0] === "string" ? t[0] : `${t[0]}/${t[1]}`;
    if (i === 0) return (s < 0 ? "−" : "") + body;
    return `${s < 0 ? "−" : "+"} ${body}`;
  }).join(" ");
}

function parK(k) { return k < 0 ? `(−${Math.abs(k)})` : String(k); }

function classicSpreadItOut(form, vi) {
  if (form === 0 || form === 1) {
    const bank = form === 0 ? pick(SPREAD0, vi) : pick(SPREAD1, vi);
    const terms = bank.t;
    const prods = terms.map((t) => {
      const n = form === 0 ? t[0] : t[1];
      const d = form === 0 ? t[1] : t[2];
      const s = t[t.length - 1];
      return (bank.k * s * n) / d;
    });
    const ans = prods.reduce((a, b) => a + b, 0);
    const inside = termListDisp(terms);
    const branches = terms.map((t) => (t[t.length - 1] < 0 ? "−" : "") + (typeof t[0] === "string" ? t[0] : `${t[0]}/${t[1]}`));
    const results = prods.map((v) => sx(v));
    const p = problemBase("spread-it-out", vi, "integer");
    finishNumeric(p, ans, wrongs(ans), [0, 1, -1], vi % 2 === 0, vi);
    p.prompt = `Fire the splitter: (${inside}) × ${parK(bank.k)}. Spread ${parK(bank.k)} onto every term, then total the products.`;
    p.hint1 = `${parK(bank.k)} visits EVERY term inside the bracket — denominators cancel against it.`;
    p.hint2 = `Watch the signs: minus × minus → plus. The products are ${prods.map((v) => sx(v)).join(", ")}.`;
    p.solution = `The distributor visits every term: ${joinSigned(prods)} = ${sx(ans)}. Signs rode along on every visit — minus × minus → plus, minus × plus → minus.`;
    p.visual = { type: "fan", title: "Splitter", top: `(${inside}) × ${parK(bank.k)}`, branches, results, accent: AMBER, note: `${parK(bank.k)} must visit every branch — sign included.` };
    return p;
  }
  if (form === 2) {
    const bank = pick(SPREAD2, vi);
    const recip = F(bank.rd, bank.rn);
    const prodFs = bank.t.map((t) => fmul(F(t[2] * t[0], t[1]), recip));
    const ansF = prodFs.reduce((a, b) => fadd(a, b), F(0, 1));
    const branches = bank.t.map((t) => (t[2] < 0 ? "−" : "") + `${t[0]}/${t[1]}`);
    const results = prodFs.map((f) => fstr(f));
    const p = problemBase("spread-it-out", vi, ansF.d === 1 ? "integer" : "choice");
    const dispR = recip.n < 0 ? `(−${Math.abs(recip.n)}${recip.d === 1 ? "" : `/${recip.d}`})` : (recip.d === 1 ? String(recip.n) : `${recip.n}/${recip.d}`);
    const dispOrig = bank.rn < 0 ? `(−${Math.abs(bank.rn)}/${bank.rd})` : `${bank.rn}/${bank.rd}`;
    finishFraction(p, ansF, wrongsFrac(ansF), [F(2, 1), F(-2, 1), F(1, 2)], ansF.d !== 1 || vi % 2 === 0, vi);
    p.prompt = `Flip and spread: (${bank.inside}) ÷ ${dispOrig}. Turn the division into multiplication first, then distribute.`;
    p.hint1 = `Dividing by ${dispOrig} is multiplying by ${dispR} — now the splitter can fire.`;
    p.hint2 = `Each term multiplies ${dispR}: ${results.join(", ")}. Add them with care for signs.`;
    p.solution = `Dividing by ${dispOrig} is multiplying by ${dispR}. Every term takes its turn: ${results.join(", ")} → total ${fstr(ansF)}. The flip comes first — then the distributive law does the heavy lifting.`;
    p.visual = { type: "fan", title: "Flip & spread", top: `(${bank.inside}) × ${dispR}`, branches, results, accent: PURPLE, note: "÷ fraction → × its flip. Then spread." };
    return p;
  }
  const [xStr, mStr, ansStr, splitNote, bankWrongs] = pick(SPREAD3, vi);
  const ansNum = parseFloat(ansStr);
  const p = problemBase("spread-it-out", vi, Number.isInteger(ansNum) ? "integer" : "choice");
  if (Number.isInteger(ansNum)) {
    finishNumeric(p, ansNum, wrongs(ansNum), [10, 100, 1], vi % 2 === 0, vi);
  } else {
    finishChoice(p, ansStr, bankWrongs, ["0", "1", String(parseFloat(xStr) * 10)], vi);
  }
  p.prompt = `Bench job: ${xStr} × ${mStr}. Split the awkward factor into friendly parts, then give the exact product.`;
  p.hint1 = `${mStr} is a hop away from a round number — rewrite it as a sum or difference.`;
  p.hint2 = `Use ${splitNote}.`;
  p.solution = `${splitNote} → exact total ${ansStr}. Splitting near-round numbers is the distributive law in work boots: ${xStr} × ${mStr} = ${ansStr}.`;
  p.visual = { type: "fan", title: "Number splitter", top: `${xStr} × ${mStr}`, branches: splitNote.replace(/^.*→ /, "").split(/ [−+] /).map((s) => s), results: splitNote.replace(/^.*→ /, "").split(/ (?=[−+]) /), accent: TEAL, note: "Near-round numbers split into a round part and a small change." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 4: Factor It Out
// ---------------------------------------------------------------------------
const FACTOR0 = [
  { f: "4.5", t: [["5.5", 5.5, 1], ["4.5", 4.5, 1]] },
  { f: "7.8", t: [["3.3", 3.3, 1], ["7.7", 7.7, 1], ["", 1, -1]] },
  { f: "0.13", t: [["78", 78, 1], ["21", 21, 1], ["", 1, 1]] },
  { f: "6.66", t: [["17", 17, 1], ["82", 82, 1], ["", 1, 1]] },
  { f: "3.7", t: [["6.4", 6.4, 1], ["3.6", 3.6, 1]] },
  { f: "9.9", t: [["4.5", 4.5, 1], ["5.5", 5.5, 1]] },
  { f: "1.7", t: [["25", 25, 1], ["74", 74, 1], ["", 1, 1]] },
  { f: "0.45", t: [["33", 33, 1], ["66", 66, 1], ["", 1, 1]] },
  { f: "2.6", t: [["13", 13, 1], ["87", 87, 1]] },
  { f: "8.8", t: [["6.25", 6.25, 1], ["3.75", 3.75, 1]] },
];
const FACTOR1 = [
  { disp: "−7 × (−4/19) + 13 × (−4/19) − 6 × (−4/19)", g: [-4, 19], c: [[-7, 1], [13, 1], [-6, 1]] },
  { disp: "(−3/4) × (−98) + (−3/4) × (−2)", g: [-3, 4], c: [[-98, 1], [-2, 1]] },
  { disp: "−14 5/8 × (5/9) + 5/9 × (−3 3/8)", g: [5, 9], c: [[-117, 8], [-27, 8]] },
  { disp: "−1/4 × (−19) − 1/2 × 19 − 3/4 × (−19)", g: [19, 1], c: [[1, 4], [-1, 2], [3, 4]] },
  { disp: "(−5) × 7 1/3 + 7 × (−7 1/3) − 12 × (−7 1/3)", g: [-22, 3], c: [[5, 1], [7, 1], [-12, 1]] },
  { disp: "4/5 × (−5/13) − 3/5 × (−5/13) − 5/13 × (−1 3/5)", g: [-5, 13], c: [[4, 5], [-3, 5], [-8, 5]] },
  { disp: "1/7 × (−6/5) + 1.2 × (−2/7) + 4/7 × (−1 1/5)", g: [-6, 5], c: [[1, 7], [2, 7], [4, 7]] },
  { disp: "(−0.25) × (−5 1/2) + 1/4 × (−3.5) + (−1/4) × (−2)", g: [1, 4], c: [[11, 2], [-7, 2], [2, 1]] },
];
// [a1,t1, a2,t2, a3,t3, d, G, s1,s2,s3, ans] with ai×ti = G×si
const TOPSWAP = [
  [84, 13, 42, 22, 28, 21, 31, 42, 26, 22, 14, 84],
  [39, 144, 144, 84, 48, 72, 147, 144, 39, 84, 24, 144],
  [14, 3, 21, 2, 7, 5, 7, 7, 6, 6, 5, 17],
  [12, 5, 18, 4, 24, 1, 6, 6, 10, 12, 4, 26],
  [20, 3, 30, 2, 10, 7, 10, 10, 6, 6, 7, 19],
  [16, 5, 24, 3, 8, 9, 8, 8, 10, 9, 9, 28],
];
const TWINS = [
  { disp: "2.017 × 2016 − 10.16 × 201.7", conv: "2.017 × 2016 → 201.7 × 20.16", f: "201.7", parts: "20.16 − 10.16", sum: "10", ans: 2017, check: [[2.017, 2016, 1], [10.16, 201.7, -1]] },
  { disp: "20.07 × 39 + 200.7 × 4.1 + 40 × 10.035", conv: "200.7 × 4.1 → 20.07 × 41 and 40 × 10.035 → 20.07 × 20", f: "20.07", parts: "39 + 41 + 20", sum: "100", ans: 2007, check: [[20.07, 39, 1], [200.7, 4.1, 1], [40, 10.035, 1]] },
  { disp: "1.25 × 67 + 12.5 × 3.3", conv: "1.25 × 67 → 12.5 × 6.7", f: "12.5", parts: "6.7 + 3.3", sum: "10", ans: 125, check: [[1.25, 67, 1], [12.5, 3.3, 1]] },
  { disp: "3.3 × 45 + 0.33 × 550", conv: "0.33 × 550 → 3.3 × 55", f: "3.3", parts: "45 + 55", sum: "100", ans: 330, check: [[3.3, 45, 1], [0.33, 550, 1]] },
  { disp: "0.48 × 25 + 4.8 × 7.5", conv: "0.48 × 25 → 4.8 × 2.5", f: "4.8", parts: "2.5 + 7.5", sum: "10", ans: 48, check: [[0.48, 25, 1], [4.8, 7.5, 1]] },
  { disp: "2.2 × 36 − 0.22 × 160", conv: "0.22 × 160 → 2.2 × 16", f: "2.2", parts: "36 − 16", sum: "20", ans: 44, check: [[2.2, 36, 1], [0.22, 160, -1]] },
  { disp: "1.8 × 72 + 18 × 2.8", conv: "1.8 × 72 → 18 × 7.2", f: "18", parts: "7.2 + 2.8", sum: "10", ans: 180, check: [[1.8, 72, 1], [18, 2.8, 1]] },
  { disp: "0.65 × 40 + 6.5 × 6", conv: "0.65 × 40 → 6.5 × 4", f: "6.5", parts: "4 + 6", sum: "10", ans: 65, check: [[0.65, 40, 1], [6.5, 6, 1]] },
];

function factorExpr(f, terms) {
  return terms.map((t, i) => {
    const body = t[0] === "" ? f : `${f} × ${t[0]}`;
    if (i === 0) return (t[2] < 0 ? "−" : "") + body;
    return ` ${t[2] < 0 ? "−" : "+"} ${body}`;
  }).join("");
}

function classicFactorOut(form, vi) {
  if (form === 0) {
    const bank = pick(FACTOR0, vi);
    const expr = factorExpr(bank.f, bank.t);
    const sum = bank.t.reduce((s, t) => s + t[2] * t[1], 0);
    const ans = parseFloat(bank.f) * sum;
    const p = problemBase("factor-out", vi, "integer");
    finishNumeric(p, ans, wrongs(ans), [10, 100, 1000], vi % 2 === 0, vi);
    p.prompt = `Merger station: ${expr}. Run the distributive law BACKWARDS — pull out the common factor, then give the total.`;
    p.hint1 = `Every term carries ${bank.f} — even a bare "${bank.f}" is ${bank.f} × 1.`;
    const coefDisp = joinSigned(bank.t.map((t) => t[2] * t[1]));
    p.hint2 = `${bank.f} × (${coefDisp}) — the bracket collapses to a friendly number.`;
    p.solution = `Magnet out ${bank.f}: ${bank.f} × (${coefDisp}) = ${bank.f} × ${sx(sum)} = ${sx(ans)}. Backwards distributive law — the merger merges everything into one clean multiplication.`;
    p.visual = { type: "card", title: "Merger", equation: expr, badge: "PULL OUT", accent: TEAL, note: `Every term carries ${bank.f} — a bare ${bank.f} is ${bank.f} × 1.` };
    return p;
  }
  if (form === 1) {
    const bank = pick(FACTOR1, vi);
    const g = F(bank.g[0], bank.g[1]);
    const coefSum = bank.c.reduce((s, c) => fadd(s, F(c[0], c[1])), F(0, 1));
    const ansF = fmul(g, coefSum);
    const p = problemBase("factor-out", vi, ansF.d === 1 ? "integer" : "choice");
    finishFraction(p, ansF, wrongsFrac(ansF), [F(2, 1), F(-2, 1), F(1, 2)], ansF.d !== 1 || vi % 2 === 0, vi);
    p.prompt = `Merger station: ${bank.disp}. One factor hides in EVERY term — pull it out and give the total.`;
    p.hint1 = "Decimals and mixed numbers are fractions in disguise — rewrite them and look for the shared factor.";
    const gDisp = fstr(g);
    const gPar = g.n < 0 ? `(−${fstr(F(Math.abs(g.n), g.d))})` : (g.d === 1 ? gDisp : `(${gDisp})`);
    const cVals = bank.c.map((c) => F(c[0], c[1]));
    const cDisp = cVals.map((c, i) => {
      const s = fstr(F(Math.abs(c.n), c.d));
      if (i === 0) return c.n < 0 ? `−${s}` : s;
      return c.n < 0 ? `− ${s}` : `+ ${s}`;
    }).join(" ");
    p.hint2 = `The shared factor is ${gDisp}. The leftover coefficients are ${bank.c.map((c) => fstr(F(c[0], c[1]))).join(", ")}.`;
    const sumIsInt = coefSum.d === 1;
    p.solution = sumIsInt
      ? `Magnet out ${gPar}: ${gPar} × (${cDisp}) = ${gPar} × ${fstr(coefSum)} = ${fstr(ansF)}. Signs rode along — the leftover bracket is just an integer.`
      : `Magnet out ${gPar}: the leftover coefficients are ${bank.c.map((c) => fstr(F(c[0], c[1]))).join(" , ")} → their sum is ${fstr(coefSum)}, and ${gPar} × (${fstr(coefSum)}) → ${fstr(ansF)}.`;
    p.visual = { type: "card", title: "Merger", equation: bank.disp, badge: "PULL OUT", accent: CORAL, note: "Mixed numbers and decimals hide fraction factors." };
    return p;
  }
  if (form === 2) {
    const [a1, t1, a2, t2, a3, t3, d, G, s1, s2, s3, ans] = pick(TOPSWAP, vi);
    const expr = `${a1} × ${t1}/${d} + ${a2} × ${t2}/${d} + ${a3} × ${t3}/${d}`;
    const p = problemBase("factor-out", vi, "integer");
    finishNumeric(p, ans, wrongs(ans), [G, d, ans + G], vi % 2 === 0, vi);
    p.prompt = `Merger station: ${expr}. The tops don't match... yet. Swap numerators between terms to forge a common factor, then give the total.`;
    p.hint1 = `${a1} × ${t1} = ${G} × ${s1} — swapping tops keeps a product identical.`;
    p.hint2 = `Forge ${G}/${d} in every term: tops ${s1}, ${s2}, ${s3}.`;
    p.solution = `Swap tops: ${a1} × ${t1} = ${G} × ${s1}, ${a3} × ${t3} = ${G} × ${s3} — every term now carries ${G}/${d}. Magnet it out: (${s1} + ${s2} + ${s3}) × ${G}/${d} = ${G} × ${s1 + s2 + s3}/${d} = ${ans}.`;
    p.visual = { type: "card", title: "Top-swap forge", equation: expr, badge: "FORGE", accent: AMBER, note: "Swapping numerators never changes a product." };
    return p;
  }
  const bank = pick(TWINS, vi);
  const p = problemBase("factor-out", vi, "integer");
  finishNumeric(p, bank.ans, wrongs(bank.ans), [bank.ans / 10, bank.ans * 10, bank.sum ? parseFloat(bank.sum) : 10], vi % 2 === 0, vi);
  p.prompt = `Merger station: ${bank.disp}. Slide a decimal point to forge twin factors, then give the total.`;
  p.hint1 = "Move the point left on one factor and right on its partner — the product stays identical.";
  p.hint2 = `${bank.conv}.`;
  p.solution = `Slide the point: ${bank.conv}. Magnet out ${bank.f}: ${bank.f} × (${bank.parts}) = ${bank.f} × ${bank.sum} = ${bank.ans}. Point-sliding is the commutative law wearing a disguise.`;
  p.visual = { type: "card", title: "Point slider", equation: bank.disp, badge: "SLIDE", accent: PURPLE, note: "Left on one side, right on the other — product unchanged." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 5: Nudge & Split
// ---------------------------------------------------------------------------
const NUDGE0 = [
  ["−9 24/25", -10, 1, 25, -125, 1],
  ["−99 98/99", -100, 1, 99, 99, 1],
  ["−75 5/6", -75, -5, 6, 1, 5],
  ["−19 18/19", -20, 1, 19, -38, 1],
  ["49 49/50", 50, -1, 50, -100, 1],
  ["−24 23/25", -25, 2, 25, 25, 1],
  ["99 98/99", 100, -1, 99, -99, 1],
  ["−49 48/49", -50, 1, 49, -98, 1],
];
const NUDGE1 = [
  [57, 55, 56], [27, 27, 28], [101, 99, 100], [38, 36, 37],
  [65, 63, 64], [81, 79, 80], [46, 44, 45], [20, 18, 19],
];
const NUDGE2 = [
  ["9.8", "50", "9.8", "10", "0.2", "−", 490],
  ["10.2", "35", "10.2", "10", "0.2", "+", 357],
  ["98", "2.5", "98", "100", "2", "−", 245],
  ["102", "7.5", "102", "100", "2", "+", 765],
  ["9.9", "40", "9.9", "10", "0.1", "−", 396],
  ["10.1", "60", "10.1", "10", "0.1", "+", 606],
  ["99", "12", "99", "100", "1", "−", 1188],
  ["101", "23", "101", "100", "1", "+", 2323],
  ["25", "10.4", "10.4", "10", "0.4", "+", 260],
  ["2.5", "9.6", "9.6", "10", "0.4", "−", 24],
];
const NUDGE3 = [
  [57, 55, 56, 27, 27, 28, "82 1/56"],
  [41, 39, 40, 21, 19, 20, "59 37/40"],
  [25, 23, 24, 13, 11, 12, "35 7/8"],
  [31, 29, 30, 16, 14, 15, "44 9/10"],
  [51, 49, 50, 26, 24, 25, "74 47/50"],
  [19, 17, 18, 10, 8, 9, "26 5/6"],
  [101, 99, 100, 51, 49, 50, "149 97/100"],
  [29, 27, 28, 15, 13, 14, "41 25/28"],
];

function parF(f) {
  const body = f.d === 1 ? String(Math.abs(f.n)) : `${Math.abs(f.n)}/${f.d}`;
  return f.n < 0 ? `(−${body})` : (f.d === 1 ? body : `(${body})`);
}

function classicNudgeSplit(form, vi) {
  if (form === 0) {
    const [dispMixed, iN, fN, fD, mN, mD] = pick(NUDGE0, vi);
    const iF = F(iN, 1);
    const fF = F(fN, fD);
    const mF = F(mN, mD);
    const p1 = fmul(iF, mF);
    const p2 = fmul(fF, mF);
    const ansF = fadd(p1, p2);
    const mDisp = mF.d === 1 ? (mF.n < 0 ? `(−${Math.abs(mF.n)})` : String(mF.n)) : `(${fstr(mF)})`;
    const p = problemBase("nudge-split", vi, ansF.d === 1 ? "integer" : "choice");
    if (ansF.d === 1) {
      finishNumeric(p, ansF.n, wrongs(ansF.n), [ansF.n + 10, ansF.n - 10, -ansF.n], vi % 2 === 0, vi);
    } else {
      finishChoice(p, mixStrF(ansF), [mixStrF(fadd(ansF, F(1, 6))), mixStrF(fsub(ansF, F(1, 6))), mixStrF(F(-ansF.n, ansF.d))], [mixStrF(fadd(ansF, F(1, 1))), mixStrF(fsub(ansF, F(1, 1))), dispMixed], vi);
    }
    p.prompt = `Nudge machine: (${dispMixed}) × ${mDisp}. Bump the mixed number to the nearest integer — keep the change — and give the exact product.`;
    p.hint1 = `${dispMixed} is ${iN} plus a small leftover — split it, multiply the parts, recombine.`;
    p.hint2 = `${parF(iF)} × ${mDisp} = ${fstr(p1)} and ${parF(fF)} × ${mDisp} = ${fstr(p2)}.`;
    p.solution = `${parF(iF)} × ${mDisp} = ${fstr(p1)} and ${parF(fF)} × ${mDisp} = ${fstr(p2)}, so ${fstr(p1)} ${p2.n < 0 ? "−" : "+"} ${fstr(F(Math.abs(p2.n), p2.d))} = ${fstr(ansF)}${ansF.d === 1 ? "." : ` — as a mixed number that's ${mixStrF(ansF)}.`} Nudge to the integer, keep the change.`;
    p.visual = { type: "card", title: "Nudge machine", equation: `(${dispMixed}) × ${mDisp}`, badge: "NUDGE", accent: CORAL, note: `Bump to ${iN}, multiply, then add back the leftover piece.` };
    return p;
  }
  if (form === 1) {
    const [a, n, d] = pick(NUDGE1, vi);
    const ansF = F(a * n, d);
    const p = problemBase("nudge-split", vi, "choice");
    const w1 = mixStrF(fadd(ansF, F(1, 1)));
    const w2 = mixStrF(fsub(ansF, F(1, 1)));
    const w3 = mixStrF(F(a * n + 1, d));
    finishChoice(p, mixStrF(ansF), [w1, w2, w3], [mixStrF(fadd(ansF, F(2, 1))), String(a), "1"], vi);
    const over = a > d;
    const base = over ? d : d;
    const diff = over ? 1 : -1;
    p.prompt = `Nudge machine: ${a} × (${n}/${d}). Bump ${a} one step to ${d}, then give the exact product as a mixed number.`;
    p.hint1 = `${a} = ${d} ${over ? "+" : "−"} 1 — split, multiply each piece by ${n}/${d}, recombine.`;
    p.hint2 = `${d} × (${n}/${d}) = ${n} and 1 × (${n}/${d}) = ${n}/${d}.`;
    p.solution = over
      ? `Nudge ${a} → ${d} + 1: ${d} × (${n}/${d}) = ${n} and 1 × (${n}/${d}) = ${n}/${d}, so the product is ${n} + ${n}/${d} → ${mixStrF(ansF)}.`
      : `Nudge ${a} → ${d} − 1: ${d} × (${n}/${d}) = ${n} and 1 × (${n}/${d}) = ${n}/${d}, so the product is ${n} − ${n}/${d} → ${mixStrF(ansF)}.`;
    p.visual = { type: "card", title: "Nudge machine", equation: `${a} × ${n}/${d}`, badge: "NUDGE", accent: CORAL, note: `${a} sits one step from ${d} — split it there.` };
    return p;
  }
  if (form === 2) {
    const [xStr, mStr, nudged, r, c, sign, ans] = pick(NUDGE2, vi);
    const p = problemBase("nudge-split", vi, "integer");
    finishNumeric(p, ans, wrongs(ans), [ans + 10, ans - 10, ans * 10], vi % 2 === 0, vi);
    p.prompt = `Nudge machine: ${xStr} × ${mStr}. Bump the awkward factor to a round number and give the exact product.`;
    p.hint1 = `${nudged} = ${r} ${sign} ${c} — multiply both pieces, then recombine.`;
    p.hint2 = `${r} × ${nudged === xStr ? mStr : xStr} = ${sx(parseFloat(r) * parseFloat(nudged === xStr ? mStr : xStr))} and ${c} × ${nudged === xStr ? mStr : xStr} = ${sx(parseFloat(c) * parseFloat(nudged === xStr ? mStr : xStr))}.`;
    const other = nudged === xStr ? mStr : xStr;
    const big = sx(parseFloat(r) * parseFloat(other));
    const small = sx(parseFloat(c) * parseFloat(other));
    p.solution = `Nudge ${nudged} → ${r} ${sign} ${c}: ${r} × ${other} = ${big} and ${c} × ${other} = ${small}, so ${big} ${sign} ${small} = ${ans}.`;
    p.visual = { type: "card", title: "Nudge machine", equation: `${xStr} × ${mStr}`, badge: "NUDGE", accent: AMBER, note: `${nudged} = ${r} ${sign} ${c} — split, multiply, recombine.` };
    return p;
  }
  const [a1, n1, d1, a2, n2, d2, ansStr] = pick(NUDGE3, vi);
  const f1v = F(a1 * n1, d1);
  const f2v = F(a2 * n2, d2);
  const ansF = fadd(f1v, f2v);
  const p = problemBase("nudge-split", vi, "choice");
  const wrongs3 = [mixStrF(fadd(ansF, F(1, 1))), mixStrF(fsub(ansF, F(1, 1))), mixStrF(fadd(ansF, F(2, 1)))];
  finishChoice(p, ansStr, wrongs3, [mixStrF(fsub(ansF, F(2, 1))), "1", "100"], vi);
  p.prompt = `Grand nudge: ${a1} × (${n1}/${d1}) + ${a2} × (${n2}/${d2}). Nudge BOTH multipliers, then give the exact total as a mixed number.`;
  p.hint1 = `${a1} is one step from ${d1}; ${a2} is one step from ${d2}. Split both.`;
  p.hint2 = `${a1} × (${n1}/${d1}) → ${mixStrF(f1v)}; ${a2} × (${n2}/${d2}) → ${mixStrF(f2v)}. Now add whole parts and fraction parts separately.`;
  const w1v = Math.floor(f1v.n / f1v.d);
  const w2v = Math.floor(f2v.n / f2v.d);
  const r1 = F(f1v.n - w1v * f1v.d, f1v.d);
  const r2 = F(f2v.n - w2v * f2v.d, f2v.d);
  p.solution = `Nudge both: ${a1} × (${n1}/${d1}) → ${mixStrF(f1v)} and ${a2} × (${n2}/${d2}) → ${mixStrF(f2v)}. Whole parts: ${w1v} + ${w2v} = ${w1v + w2v}. Fraction parts: ${fstr(r1)} + ${fstr(r2)} → carry 1 → ${fstr(fsub(ansF, F(w1v + w2v, 1)))} on top. Total → ${ansStr}.`;
  p.visual = { type: "card", title: "Grand nudge", equation: `${a1} × ${n1}/${d1} + ${a2} × ${n2}/${d2}`, badge: "DOUBLE", accent: PURPLE, note: "Two nudges, one tidy carry." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 6: Clever Capstone
// ---------------------------------------------------------------------------
const CAP0 = [
  [7, 11, 10], [2, 3, 5], [3, 4, 6], [2, 5, 7],
  [3, 5, 10], [4, 5, 10], [2, 7, 9], [3, 4, 8],
];
const CAP1 = [
  [[2, 4, 5], [3, 4, 5], [11, 2, 9], [-2, 2, 9]],
  [[13, -11, 5], [7, -11, 5], [5, -16, 7], [2, -16, 7]],
  [[4, 3, 7], [3, 3, 7], [5, 2, 3], [4, 2, 3]],
  [[6, 2, 5], [4, 2, 5], [7, 3, 4], [1, 3, 4]],
  [[5, 4, 9], [13, 4, 9], [3, 5, 8], [5, 5, 8]],
  [[9, -2, 7], [5, -2, 7], [4, 3, 5], [6, 3, 5]],
  [[8, 5, 6], [4, 5, 6], [2, 7, 9], [7, 7, 9]],
  [[3, -5, 4], [9, -5, 4], [6, 2, 3], [3, 2, 3]],
];
const CAP2 = [
  [13, 11, 12, 7, 5, 6, "6 1/12"],
  [19, 17, 18, 10, 8, 9, "9 1/18"],
  [25, 23, 24, 13, 11, 12, "12 1/24"],
  [31, 29, 30, 16, 14, 15, "15 1/30"],
  [21, 19, 20, 11, 9, 10, "10 1/20"],
  [17, 15, 16, 9, 7, 8, "8 1/16"],
  [11, 9, 10, 6, 4, 5, "5 1/10"],
  [9, 7, 8, 5, 3, 4, "4 1/8"],
];
const CAP3 = [
  ["−4 × (−8/9) + (−8) × (−8/9) + 12 ÷ (−9/8)", -8, 9, -4, -8, 12, 0],
  ["5 × (3/4) − 2 × (3/4) − 3 ÷ (4/3)", 3, 4, 5, -2, -3, 0],
  ["7 × (2/5) − 3 × (2/5) − 4 ÷ (5/2)", 2, 5, 7, -3, -4, 0],
  ["9 × (5/6) − 4 × (5/6) − 5 ÷ (6/5)", 5, 6, 9, -4, -5, 0],
  ["8 × 7 − 5 × 7 − 2 ÷ (1/7)", 7, 1, 8, -5, -2, 7],
  ["6 × (−3) − 3 × (−3) − 2 ÷ (−1/3)", -3, 1, 6, -3, -2, -3],
  ["11 × (−2) − 6 × (−2) − 3 ÷ (−1/2)", -2, 1, 11, -6, -3, -4],
  ["10 × (−7) − 4 × (−7) − 5 ÷ (−1/7)", -7, 1, 10, -4, -5, -7],
];

function cap1Disp(terms) {
  return terms.map((t, i) => {
    const [c, fn, fd] = t;
    const fr = fn < 0 ? `(−${Math.abs(fn)}/${fd})` : `${fn}/${fd}`;
    const body = `${Math.abs(c)} × ${fr}`;
    if (i === 0) return (c < 0 ? "−" : "") + body;
    return ` ${c < 0 ? "−" : "+"} ${body}`;
  }).join("");
}

function classicCleverCapstone(form, vi) {
  if (form === 0) {
    const [a, b, c] = pick(CAP0, vi);
    const ans = a * b + a * c + b * c;
    const expr = `${a} × ${b} × ${c} × (1/${a} + 1/${b} + 1/${c})`;
    const p = problemBase("clever-capstone", vi, "integer");
    finishNumeric(p, ans, wrongs(ans), [a * b * c, a + b + c, ans + a], vi % 2 === 0, vi);
    p.prompt = `Capstone: ${expr}. The triple product spreads onto every fraction — give the total.`;
    p.hint1 = "Distribute the big product: each fraction cancels one factor of it.";
    p.hint2 = `${a} × ${b} × ${c} × (1/${a}) = ${b * c} — what remains for the other two?`;
    p.solution = `${a} × ${b} × ${c} × (1/${a}) = ${b * c}; ${a} × ${b} × ${c} × (1/${b}) = ${a * c}; ${a} × ${b} × ${c} × (1/${c}) = ${a * b}. Total: ${b * c} + ${a * c} + ${a * b} = ${ans}.`;
    p.visual = { type: "fan", title: "Capstone fan", top: expr, branches: [`1/${a}`, `1/${b}`, `1/${c}`], results: [String(b * c), String(a * c), String(a * b)], accent: AMBER, note: "Each fraction cancels one factor of the triple product." };
    return p;
  }
  if (form === 1) {
    const terms = pick(CAP1, vi);
    const expr = cap1Disp(terms);
    const g1 = F(terms[0][1], terms[0][2]);
    const g2 = F(terms[2][1], terms[2][2]);
    const s1 = terms[0][0] + terms[1][0];
    const s2 = terms[2][0] + terms[3][0];
    const v1 = fmul(g1, F(s1, 1));
    const v2 = fmul(g2, F(s2, 1));
    const ansF = fadd(v1, v2);
    const p = problemBase("clever-capstone", vi, "integer");
    finishNumeric(p, ansF.n, wrongs(ansF.n), [0, 1, -1], vi % 2 === 0, vi);
    p.prompt = `Capstone: ${expr}. TWO shared factors hide here — magnet both, then give the total.`;
    p.hint1 = "Group the first two terms and the last two terms separately.";
    p.hint2 = `${parF(g1)} × (${joinSigned([terms[0][0], terms[1][0]])}) and ${parF(g2)} × (${joinSigned([terms[2][0], terms[3][0]])}).`;
    p.solution = `Two magnets! ${parF(g1)} × (${joinSigned([terms[0][0], terms[1][0]])}) = ${fstr(v1)} and ${parF(g2)} × (${joinSigned([terms[2][0], terms[3][0]])}) = ${fstr(v2)}, so ${fstr(v1)} ${v2.n < 0 ? "−" : "+"} ${fstr(F(Math.abs(v2.n), v2.d))} = ${fstr(ansF)}.`;
    p.visual = { type: "card", title: "Double magnet", equation: expr, badge: "×2", accent: TEAL, note: "Pair the terms that share a factor — twice." };
    return p;
  }
  if (form === 2) {
    const [a1, n1, d1, a2, n2, d2, ansStr] = pick(CAP2, vi);
    const f1v = F(a1 * n1, d1);
    const f2v = F(a2 * n2, d2);
    const ansF = fsub(f1v, f2v);
    const addTrap = mixStrF(fadd(f1v, f2v));
    const p = problemBase("clever-capstone", vi, "choice");
    finishChoice(p, ansStr, [mixStrF(fadd(ansF, F(1, 1))), mixStrF(fsub(ansF, F(1, 1))), addTrap], [mixStrF(fadd(ansF, F(2, 1))), "1", String(a1)], vi);
    p.prompt = `Capstone: ${a1} × (${n1}/${d1}) − ${a2} × (${n2}/${d2}). Nudge both multipliers, subtract carefully, and give the exact result as a mixed number.`;
    p.hint1 = `${a1} is one step from ${d1}; ${a2} is one step from ${d2}. Split each product into integer + leftover.`;
    p.hint2 = `${a1} × (${n1}/${d1}) → ${mixStrF(f1v)}; ${a2} × (${n2}/${d2}) → ${mixStrF(f2v)}. Subtract whole from whole, leftover from leftover.`;
    const w1v = Math.floor(f1v.n / f1v.d);
    const w2v = Math.floor(f2v.n / f2v.d);
    const r1 = F(f1v.n - w1v * f1v.d, f1v.d);
    const r2 = F(f2v.n - w2v * f2v.d, f2v.d);
    p.solution = `Nudge both: ${a1} × (${n1}/${d1}) → ${mixStrF(f1v)} and ${a2} × (${n2}/${d2}) → ${mixStrF(f2v)}. Difference: (${w1v} − ${w2v}) = ${w1v - w2v} and ${fstr(r1)} − ${fstr(r2)} → ${fstr(fsub(r1, r2))}, giving ${ansStr}.`;
    p.visual = { type: "card", title: "Capstone subtractor", equation: `${a1} × ${n1}/${d1} − ${a2} × ${n2}/${d2}`, badge: "FINALE", accent: CORAL, note: "Nudge, split, subtract — three laws in one move." };
    return p;
  }
  const [disp, gN, gD, c1, c2, c3, ans] = pick(CAP3, vi);
  const g = F(gN, gD);
  const coefSum = c1 + c2 + c3;
  const prod = fmul(g, F(coefSum, 1));
  const gPar = g.n < 0 ? `(−${Math.abs(g.n)}${g.d === 1 ? "" : `/${g.d}`})` : (g.d === 1 ? String(g.n) : `${g.n}/${g.d}`);
  const p = problemBase("clever-capstone", vi, "integer");
  finishNumeric(p, ans, wrongs(ans), [ans + gN, ans - gN, coefSum], vi % 2 === 0, vi);
  p.prompt = `Capstone: ${disp}. The division at the end is a multiplication in disguise — flip it, magnet out the shared factor, and give the total.`;
  p.hint1 = "Dividing by a fraction is multiplying by its flip — then EVERY term shares one factor.";
  p.hint2 = `After the flip, every term carries ${gPar}. Coefficients: ${joinSigned([c1, c2, c3])}.`;
  p.solution = `Flip the division — every term carries ${gPar}! (${joinSigned([c1, c2, c3])}) × ${gPar} = ${fstr(F(coefSum, 1))} × ${gPar} = ${fstr(prod)}.`;
  p.visual = { type: "card", title: "Flip & magnet", equation: disp, badge: "FINALE", accent: PURPLE, note: "÷ fraction → × flip. Then the magnet fires." };
  return p;
}

// ---------------------------------------------------------------------------
// Distractor helpers + engine
// ---------------------------------------------------------------------------
// Three distinct numeric distractors near x (makeChoices dedups + falls back).
function wrongs(x) {
  const cand = [x + 1, x - 1, x * 2, x + 2, x - 2, x * 10, -x, x + 10, x - 10];
  const out = [];
  for (const c of cand) {
    if (!Number.isFinite(c)) continue;
    if (Math.abs(c - x) < 1e-9) continue;
    if (out.some((o) => Math.abs(o - c) < 1e-9)) continue;
    out.push(c);
    if (out.length === 3) break;
  }
  return out;
}
// Three distinct fraction distractors (as F objects — finishFraction maps via Fdisp).
function wrongsFrac(f) {
  return [fadd(f, F(1, 1)), fsub(f, F(1, 1)), F(-f.n, f.d)];
}

const GENERATORS = {
  "name-that-law": (vi) => classicNameThatLaw(vi % 4, vi),
  "friendly-pairs": (vi) => classicFriendlyPairs(vi % 4, vi),
  "spread-it-out": (vi) => classicSpreadItOut(vi % 4, vi),
  "factor-out": (vi) => classicFactorOut(vi % 4, vi),
  "nudge-split": (vi) => classicNudgeSplit(vi % 4, vi),
  "clever-capstone": (vi) => classicCleverCapstone(vi % 4, vi),
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
// Recompute every answer straight from the banks (vi determines everything) and
// confirm the stored expected value matches. Must never return false.
function validateProblemMath(problem) {
  const exp = problem.expected;
  const vi = problem.variantIndex || 0;
  const form = vi % 4;
  const slot = Math.floor(vi / 4);
  const eq = (a, b) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) < 1e-6;
  const fracMatch = (ansF) => (typeof exp === "number" ? ansF.d === 1 && exp === ansF.n : exp === String(Fdisp(ansF)));
  switch (problem.classicId) {
    case "name-that-law": {
      if (form === 0) { const e = pick(NAME0, vi); return exp === LAW_NAMES[e[1]]; }
      if (form === 1) { const [k, m, q] = pick(NAME1, vi); return exp === name1Correct(k, m, q); }
      if (form === 2) { const [a, b, m] = pick(NAME2, vi); return exp === name2Correct(a, b, m); }
      const e = pick(NAME3, vi); return exp === e[1];
    }
    case "friendly-pairs": {
      if (form === 0) {
        if (slot % 2 === 0) {
          const bank = pick(ADD_TRIPLES, slot);
          const total = bank.reduce((s, x) => s + parseFloat(x), 0);
          return eq(Number(exp), total) && Number.isInteger(Math.round(total));
        }
        const bank = pick(FR_TRIPLES, slot);
        const totalF = bank.reduce((s, t) => fadd(s, t[1]), F(0, 1));
        return exp === fstr(totalF);
      }
      if (form === 1) {
        if (slot % 2 === 0) {
          const bank = pick(MULT_TRIPLES, slot);
          const total = bank.reduce((s, x) => s * parseFloat(x), 1);
          return eq(Number(exp), total);
        }
        const bank = pick(MULT_FR, slot);
        const totalF = bank.reduce((s, t) => fmul(s, t[1]), F(1, 1));
        return eq(Number(exp), totalF.n / totalF.d);
      }
      if (form === 2) {
        const bank = pick(FOUR_MULT, vi);
        const total = bank.reduce((s, x) => s * parseFloat(x), 1);
        return eq(Number(exp), total);
      }
      const [aStr, cStr, target, ans] = pick(MISSING, vi);
      return exp === ans && eq(parseFloat(aStr) * ans * parseFloat(cStr), target);
    }
    case "spread-it-out": {
      if (form === 0 || form === 1) {
        const bank = form === 0 ? pick(SPREAD0, vi) : pick(SPREAD1, vi);
        const prods = bank.t.map((t) => {
          const n = form === 0 ? t[0] : t[1];
          const d = form === 0 ? t[1] : t[2];
          const s = t[t.length - 1];
          return (bank.k * s * n) / d;
        });
        return prods.every((v) => Number.isInteger(v)) && exp === prods.reduce((a, b) => a + b, 0);
      }
      if (form === 2) {
        const bank = pick(SPREAD2, vi);
        const recip = F(bank.rd, bank.rn);
        const ansF = bank.t.map((t) => fmul(F(t[2] * t[0], t[1]), recip)).reduce((a, b) => fadd(a, b), F(0, 1));
        return fracMatch(ansF);
      }
      const [xStr, mStr, ansStr] = pick(SPREAD3, vi);
      if (!eq(parseFloat(xStr) * parseFloat(mStr), parseFloat(ansStr))) return false;
      return Number.isInteger(parseFloat(ansStr)) ? eq(Number(exp), parseFloat(ansStr)) : exp === ansStr;
    }
    case "factor-out": {
      if (form === 0) {
        const bank = pick(FACTOR0, vi);
        const sum = bank.t.reduce((s, t) => s + t[2] * t[1], 0);
        return eq(Number(exp), parseFloat(bank.f) * sum);
      }
      if (form === 1) {
        const bank = pick(FACTOR1, vi);
        const g = F(bank.g[0], bank.g[1]);
        const coefSum = bank.c.reduce((s, c) => fadd(s, F(c[0], c[1])), F(0, 1));
        return fracMatch(fmul(g, coefSum));
      }
      if (form === 2) {
        const [a1, t1, a2, t2, a3, t3, d, G, s1, s2, s3, ans] = pick(TOPSWAP, vi);
        return exp === ans && a1 * t1 + a2 * t2 + a3 * t3 === ans * d && G * (s1 + s2 + s3) === ans * d;
      }
      const bank = pick(TWINS, vi);
      const total = bank.check.reduce((s, c) => s + c[2] * c[0] * c[1], 0);
      return exp === bank.ans && eq(total, bank.ans);
    }
    case "nudge-split": {
      if (form === 0) {
        const [, iN, fN, fD, mN, mD] = pick(NUDGE0, vi);
        const ansF = fmul(F(iN * fD + fN, fD), F(mN, mD));
        return ansF.d === 1 ? exp === ansF.n : exp === mixStrF(ansF);
      }
      if (form === 1) {
        const [a, n, d] = pick(NUDGE1, vi);
        return exp === mixStrF(F(a * n, d)) && mixStrF(F(a * n, d)).includes(" ");
      }
      if (form === 2) {
        const [xStr, mStr, , , , , ans] = pick(NUDGE2, vi);
        return exp === ans && eq(parseFloat(xStr) * parseFloat(mStr), ans);
      }
      const [a1, n1, d1, a2, n2, d2, ansStr] = pick(NUDGE3, vi);
      return exp === ansStr && ansStr === mixStrF(fadd(F(a1 * n1, d1), F(a2 * n2, d2)));
    }
    case "clever-capstone": {
      if (form === 0) { const [a, b, c] = pick(CAP0, vi); return exp === a * b + a * c + b * c; }
      if (form === 1) {
        const terms = pick(CAP1, vi);
        const v1 = fmul(F(terms[0][1], terms[0][2]), F(terms[0][0] + terms[1][0], 1));
        const v2 = fmul(F(terms[2][1], terms[2][2]), F(terms[2][0] + terms[3][0], 1));
        const ansF = fadd(v1, v2);
        return ansF.d === 1 && exp === ansF.n;
      }
      if (form === 2) {
        const [a1, n1, d1, a2, n2, d2, ansStr] = pick(CAP2, vi);
        return exp === ansStr && ansStr === mixStrF(fsub(F(a1 * n1, d1), F(a2 * n2, d2)));
      }
      const [, gN, gD, c1, c2, c3, ans] = pick(CAP3, vi);
      const prod = fmul(F(gN, gD), F(c1 + c2 + c3, 1));
      return prod.d === 1 && prod.n === ans && exp === ans;
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
  if (v.type === "fan") {
    html = fanSvg(v, revealed).replace("</svg>", answer + "</svg>");
    text = revealed ? "The outside factor visited every branch — signs included." : "The outside factor must visit every branch inside.";
  } else if (v.type === "pairs") {
    html = pairSvg(v, revealed).replace("</svg>", answer + "</svg>");
    text = revealed ? "The friendly pair clicked first — then the rest was easy." : "Hunt for the two numbers that click together.";
  } else if (v.type === "card") {
    html = cardSvg({ title: v.title, expr: v.equation || "", lines: v.note ? [v.note] : [], steps: v.note ? [v.note] : [] }, revealed).replace("</svg>", answer + "</svg>");
    text = revealed ? "The card shows the worked clever move." : "Plan the clever move — the card tracks the work.";
  }
  return { html, text };
}

/* ---------------- intro scenes ---------------- */
const INTRO_SCENES = [
  {
    title: "The Law Lab",
    purpose: "Meet the three laws that run the number factory: commutative, associative, distributive.",
    classicId: "name-that-law",
    variant: 0,
    caption: "Swap, group, or spread — the value never changes.",
    durationMs: 20000,
    voiceover: "Welcome to the Law Lab, engineer! Pip's number factory runs on three laws. The commutative law swaps factors: seven times nine equals nine times seven. The associative law moves the brackets. And the distributive law spreads one multiplier over a whole bracket. Every law keeps the value perfectly unchanged — that is exactly what makes them laws."
  },
  {
    title: "The Pairing Dance",
    purpose: "Commutative + associative team up to build friendly pairs.",
    classicId: "friendly-pairs",
    variant: 1,
    caption: "0.25 × 4 = 1 — learn the classic couples.",
    durationMs: 21000,
    voiceover: "Zero point two five times seventeen times four looks scary — until the numbers start dancing. Swap the order, group zero point two five with four, and you get one — times seventeen is seventeen! Commutative swaps, associative groups: together they build friendly pairs that multiply to one, ten, or one hundred. Learn the classic couples and long products melt in seconds."
  },
  {
    title: "The Popcorn Splitter",
    purpose: "Distribute a multiplier over every term — signs included.",
    classicId: "spread-it-out",
    variant: 0,
    caption: "The outside factor visits EVERY term inside.",
    durationMs: 22000,
    voiceover: "A bracket stuffed with fractions, times negative eighteen — do not panic! Fire the splitter: the distributive law pops the multiplier onto every term like heat popping corn. Negative eighteen times seven-ninths, minus, times five-sixths, plus, times five-eighteenths — every denominator cancels, and the signs ride along: minus times minus makes plus. Three tiny products, one tidy total."
  },
  {
    title: "The Magnet Merge",
    purpose: "Run the distributive law backwards: pull out the shared factor.",
    classicId: "factor-out",
    variant: 0,
    caption: "Shared factor? Merge first, multiply once.",
    durationMs: 22000,
    voiceover: "Four point five times five point five plus four point five times four point five. Two multiplications? No — one! Run the distributive law backwards: the magnet pulls four point five out of both terms, leaving five point five plus four point five — that is ten. Ten times four point five is forty-five. Whenever terms share a factor, merge first and multiply once."
  },
  {
    title: "The Nudge Machine",
    purpose: "Bump mixed numbers to the nearest integer — and keep the change.",
    classicId: "nudge-split",
    variant: 0,
    caption: "Bump to the integer, multiply, add back the leftover.",
    durationMs: 23000,
    voiceover: "Negative nine and twenty-four twenty-fifths times negative one twenty-five — ugly, until the nudge machine bumps the mixed number up to negative ten. Multiply the round part: one thousand two hundred fifty. Then keep the change: one twenty-fifth times negative one twenty-five is negative five. Total: one thousand two hundred forty-five. Bump to the integer, multiply, add back the leftover."
  },
  {
    title: "The Grand Clever Finale",
    purpose: "IMC-style capstones: spread triple products, forge twin factors, flip divisions.",
    classicId: "clever-capstone",
    variant: 0,
    caption: "Every law fires at once.",
    durationMs: 24000,
    voiceover: "Finale, cadet! Seven times eleven times ten, times the sum of their unit fractions. Spread the triple product and each fraction cancels one factor: one ten, seventy, seventy-seven — total two fifty-seven. Then nudge pairs like fifty-seven times fifty-five fifty-sixths, slide decimal points to forge twin factors, and flip sneaky divisions into multiplications. Every law you learned fires at once. Make the Law Lab proud!"
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
root.LawsArithmeticModule = api;
})(typeof window !== "undefined" ? window : globalThis);
