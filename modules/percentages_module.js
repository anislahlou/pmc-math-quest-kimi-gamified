/* ============================================================================
   Percentages — G1 Lesson 7 (Think Academy G1, book pages 100–117)
   Module id: percentages
   Six classics, four forms each, 48 variants per classic swept by test sweep.

   Pip storyline continuity: thermometer → counter depot → Flip-O-Matic →
   Power Tower → Law Lab → Block Factory → THE PERCENT PAINTWORKS (shading
   hundred-grids, mixing amounts, dialing multipliers, rewinding prices).

   Dialect A contract (same as rational_mult_div / rational_powers /
   laws_arithmetic / prime_factors):
     - problemBase + finishNumeric / finishChoice (finishers self-sync
       answerType/answerMode from the useChoice flag)
     - checkAnswer: choice = exact string vs correctInput.choice ?? expected;
       filled = parseNumber within 1e-8
     - validateProblemMath recomputes every answer from the banks (vi is the
       single source of randomness) and must never return false
     - non-plain-integer answers (fraction strings, multiplier strings,
       comparison labels, riddle labels) are ALWAYS choice-mode
     - solutions keep "=" chains exactly-verifiable; "% of" results sit behind
       "→" / "is" so the text-claim audit never compares "2006 = 1003"
   ========================================================================= */
(function (root) {
  "use strict";

  const CLASSICS = [
    { id: "grid-basics", nickname: "Grid Basics", skill: "Percent ↔ decimal ↔ fraction — parts per hundred, even beyond 100%.", sourcePages: "Book 101-102 / PDF 109-110" },
    { id: "amount-mixer", nickname: "Amount Mixer", skill: "Percentage of an amount — convert to a decimal and multiply.", sourcePages: "Book 104-105+113 / PDF 112-113+121" },
    { id: "rate-reporter", nickname: "Rate Reporter", skill: "Express one quantity as a percentage of another; compare rates.", sourcePages: "Book 102-103+106 / PDF 110-111+114" },
    { id: "change-machine", nickname: "Change Machine", skill: "Increase/decrease with decimal multipliers; percentage change.", sourcePages: "Book 104+106-109 / PDF 112+114-117" },
    { id: "reverse-rescue", nickname: "Reverse Rescue", skill: "Original-value problems — divide by the multiplier, backwards.", sourcePages: "Book 107-108+114-115 / PDF 115-116+122-123" },
    { id: "percent-capstone", nickname: "Percent Capstone", skill: "JMO d4: successive changes, profit/loss pairs, sale riddles.", sourcePages: "Book 105+110+112+116-117 / PDF 113+118+120+124-125" }
  ];
  const CLASSIC_IDS = CLASSICS.map((c) => c.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((c) => [c.id, c]));
  const CLASSIC_SKILLS = Object.fromEntries(CLASSICS.map((c) => [c.id, c.skill]));
  const SOURCE_COVERAGE = {
    module: "percentages",
    lesson: "G1 Lesson 7 — Percentages",
    pages: "PDF 108-125 (book 100-117)",
    covered: [
      "percentage as parts per hundred; % ↔ decimal ↔ fraction conversions (Notes 1, LGR 1-3)",
      "percentage of an amount incl. >100% (Notes 4, L&D 104, Expl 2, AC 1-3)",
      "express as a percentage of the total; compare two rates (Notes 2-3, L&D 102-103, Expl 1)",
      "percentage increase/decrease via decimal multiplier (Notes 1, L&D 106-107)",
      "percentage change = Change/Original × 100 (Notes 3, L&D 108, Expl 4, AC 4)",
      "reverse/original-value percentages (Notes 2, L&D 107, Expl 3, AC 5-7+9)",
      "percentage profit (Notes 4, L&D 110, Expl 5-6, AC 8+10, Ext 1-2)",
      "capstones: chained %, a% of b trick, greatest value, successive changes (Pied Piper), Jack & Sadia, sale riddles (Ext Ch 1-2)"
    ]
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
  // p% as a simplest-form fraction string ("40" → "2/5", "12.5" → "1/8")
  function pctToFracStr(p) {
    let n = Math.round(p * 10), d = 1000; // scale to integers (1-dp percentages supported)
    const g = gcd(n, d);
    n /= g; d /= g;
    return d === 1 ? String(n) : `${n}/${d}`;
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
  // Choice-mode string answer (fractions, multipliers, comparison labels…).
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
  // Split fan: one top box splits arrows into branch boxes below (chain of operations).
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
    const note = revealed && v.note ? v.note : "convert the percentage, then multiply";
    s += `<text x="280" y="296" text-anchor="middle" font-size="14" font-weight="${revealed ? "bold" : "normal"}" fill="${revealed ? TEAL : "#4a5578"}">${escapeHtml(note)}</text>`;
    return svgShell(s);
  }
  // Number chips row; the winning (or guilty) ones glow with a brace.
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
    if (v.pair && v.pair.length > 1) {
      const [i, j] = v.pair;
      const x1 = 45 + i * (cw + gap) + cw / 2, x2 = 45 + j * (cw + gap) + cw / 2;
      s += `<path d="M ${x1} ${y + ch + 14} Q ${(x1 + x2) / 2} ${y + ch + 52} ${x2} ${y + ch + 14}" fill="none" stroke="${AMBER}" stroke-width="3.5"/>`;
      s += `<text x="${(x1 + x2) / 2}" y="${y + ch + 48}" text-anchor="middle" font-size="15" font-weight="bold" fill="${AMBER}">${escapeHtml(revealed ? v.pairNote || "" : "look here!")}</text>`;
    }
    const note = revealed && v.note ? v.note : "per hundred — count out of 100";
    s += `<text x="280" y="290" text-anchor="middle" font-size="14" font-weight="${revealed ? "bold" : "normal"}" fill="${revealed ? TEAL : "#4a5578"}">${escapeHtml(note)}</text>`;
    return svgShell(s);
  }

// ---------------------------------------------------------------------------
// Classic 1: Grid Basics — % ↔ decimal ↔ fraction, parts per hundred
// ---------------------------------------------------------------------------
// form0: decimal → percentage (LGR 1)
const DEC2PCT = [
  [0.6, 60], [0.35, 35], [0.08, 8], [0.7, 70], [1.2, 120],
  [1.05, 105], [0.55, 55], [0.02, 2], [0.9, 90], [1.5, 150],
];
// form1: fraction → percentage (LGR 2) — all denominators divide 100
const FRAC2PCT = [
  [4, 50, 8], [3, 20, 15], [7, 25, 28], [9, 20, 45], [17, 50, 34], [3, 4, 75],
  [2, 5, 40], [13, 20, 65], [1, 4, 25], [11, 25, 44], [6, 25, 24], [3, 50, 6],
];
// form2: percentage → simplest fraction (LGR 3) — choice strings
const PCT2FRAC = [
  { pct: "40%", raw: "40/100", div: 20, ans: "2/5", w: ["5/2", "4/10", "1/40"] },
  { pct: "75%", raw: "75/100", div: 25, ans: "3/4", w: ["4/3", "7/5", "15/20"] },
  { pct: "8%", raw: "8/100", div: 4, ans: "2/25", w: ["8/10", "4/5", "25/2"] },
  { pct: "35%", raw: "35/100", div: 5, ans: "7/20", w: ["20/7", "35/10", "7/10"] },
  { pct: "12.5%", raw: "125/1000", div: 125, ans: "1/8", w: ["8/1", "12/5", "5/40"] },
  { pct: "64%", raw: "64/100", div: 4, ans: "16/25", w: ["25/16", "8/5", "64/10"] },
  { pct: "15%", raw: "15/100", div: 5, ans: "3/20", w: ["20/3", "3/10", "15/10"] },
  { pct: "120%", raw: "120/100", div: 20, ans: "6/5", w: ["5/6", "1/20", "12/10"] },
];
// form3: true-statement vocabulary
const VOCAB = [
  { correct: "Percentage means number of parts per hundred", wrongs: ["Percentage means parts per thousand", "Percentage means parts per ten", "A percentage always has a total of 100 items"] },
  { correct: "50% of a number means half of it", wrongs: ["50% of a number means 50 times it", "50% of a number means a fifth of it", "50% of a number means 50 more than it"] },
  { correct: "Percentages can be greater than 100%", wrongs: ["A percentage can never exceed 100%", "Percentages must always be whole numbers", "100% is the largest possible percentage"] },
  { correct: "The symbol for percentage is %", wrongs: ["The symbol for percentage is ‰", "The symbol for percentage is #", "Percentage has no symbol of its own"] },
  { correct: "0.35 written as a percentage is 35%", wrongs: ["0.35 written as a percentage is 3.5%", "0.35 written as a percentage is 350%", "0.35 written as a percentage is 0.35%"] },
  { correct: "To find a percentage of an amount, convert it to a decimal and multiply", wrongs: ["To find a percentage of an amount, divide the amount by the percentage", "To find a percentage of an amount, add the percentage on", "A percentage of an amount is always smaller than the amount"] },
  { correct: "150% of 40 is 60 — over 100% gives more than the original", wrongs: ["150% of 40 is 6", "150% of 40 is still 40", "150% of 40 is impossible to work out"] },
  { correct: "10% of an amount is one tenth of it", wrongs: ["10% of an amount is one hundredth of it", "10% of an amount is ten times it", "10% of an amount is one fifth of it"] },
];

function classicGridBasics(form, vi) {
  if (form === 0) {
    const [d, pct] = pick(DEC2PCT, vi);
    const p = problemBase("grid-basics", vi, "integer");
    finishNumeric(p, pct, [pct * 10, pct / 10, pct + 10], [pct + 1, pct - 1, pct * 2], vi % 2 === 0, vi);
    p.prompt = `Paint-can decoder: write ${d} as a percentage.`;
    p.hint1 = "Per hundred means times 100 — slide the decimal point two places to the right.";
    p.hint2 = `${d} × 100 = ${pct}.`;
    p.solution = `${d} × 100 = ${pct}, so ${d} is ${pct}%. The % sign is just a fancy way of saying "out of 100".${pct > 100 ? " Over 100%? Totally allowed — it means more than the whole thing." : ""}`;
    p.visual = { type: "card", title: "Decimal → percent", equation: `${d}  →  ?%`, badge: "× 100", accent: TEAL, note: "Slide the point two places right." };
    return p;
  }
  if (form === 1) {
    const [n, d, pct] = pick(FRAC2PCT, vi);
    const k = 100 / d;
    const p = problemBase("grid-basics", vi, "integer");
    finishNumeric(p, pct, [pct + 5, pct * 2, pct - 1], [pct + 10, Math.round(pct / 2), 100 - pct], vi % 2 === 0, vi);
    p.prompt = `Hundred-grid check: write ${n}/${d} as a percentage.`;
    p.hint1 = "Percentages live on a grid of 100 — scale the fraction until the denominator is 100.";
    p.hint2 = `Multiply top and bottom by ${k}.`;
    p.solution = `Scale to a denominator of 100: ${n}/${d} = ${n * k}/100 — that is ${pct}%. A percentage is just a fraction dressed in a denominator of 100.`;
    p.visual = { type: "card", title: "Fraction → percent", equation: `${n}/${d}  →  ?%`, badge: `of 100`, accent: PURPLE, note: "Make the denominator 100." };
    return p;
  }
  if (form === 2) {
    const bank = pick(PCT2FRAC, vi);
    const p = problemBase("grid-basics", vi, "choice");
    finishChoice(p, bank.ans, bank.w, ["1/2", "3/10", "7/10"], vi);
    p.prompt = `Paint ratio: write ${bank.pct} as a fraction in its SIMPLEST form.`;
    p.hint1 = `Start with ${bank.raw} — then cancel down.`;
    p.hint2 = `Divide top and bottom of ${bank.raw} by ${bank.div}.`;
    p.solution = `${bank.pct} means ${bank.raw}. Divide top and bottom by ${bank.div} → ${bank.ans}. Fully cancelled — that is the simplest form.`;
    p.visual = { type: "card", title: "Percent → fraction", equation: `${bank.pct}  →  ?`, badge: "CANCEL", accent: AMBER, note: `${bank.raw}, then cancel.` };
    return p;
  }
  const bank = pick(VOCAB, vi);
  const p = problemBase("grid-basics", vi, "choice");
  finishChoice(p, bank.correct, bank.wrongs, ["1% of 100 is 100", "100% means nothing", "A percentage is always a decimal"], vi);
  p.prompt = "Paintworks rulebook: which statement is TRUE?";
  p.hint1 = "Percent means per hundred — and nothing stops you going past 100%.";
  p.hint2 = "Check each statement against the definition of percentage.";
  p.solution = `True: "${bank.correct}". The others break the definition — per hundred, as a fraction or a decimal, and allowed beyond 100%.`;
  p.visual = { type: "card", title: "Rulebook", equation: "parts per hundred", badge: "TRUE?", accent: CORAL, note: "Per hundred — think of the 100-grid." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 2: Amount Mixer — percentage of an amount (incl. >100%)
// ---------------------------------------------------------------------------
// form0: plain percentage of an amount (book: chair reduced TO 70% of £300)
const BASIC = [
  { pct: 70, amt: 300, story: "A chair normally costs £300. In a sale, the price is reduced to 70% of the normal price. What is the sale price (in £)?" },
  { pct: 30, amt: 150, story: "A hall has 150 seats and 30% of them are filled. How many seats are filled?" },
  { pct: 25, amt: 80, story: "A comic has 80 pages and Maya has read 25% of it. How many pages has she read?" },
  { pct: 45, amt: 200, story: "A charity raised £200 and spends 45% of it on books. How much is that (in £)?" },
  { pct: 12, amt: 50, story: "A 50 kg sack of flour loses 12% of its weight to spills. How many kg spill?" },
  { pct: 85, amt: 60, story: "60 cadets took the navigation test and 85% passed. How many passed?" },
  { pct: 5, amt: 240, story: "A factory makes 240 bolts and 5% are faulty. How many are faulty?" },
  { pct: 90, amt: 350, story: "Of 350 seats on a plane, 90% are booked. How many seats are booked?" },
  { pct: 35, amt: 120, story: "A 120 litre tank is 35% full. How many litres are in it?" },
  { pct: 60, amt: 45, story: "Of 45 minutes of band practice, 60% is drills. How many minutes of drills?" },
];
// form1: percentages over 100%
const OVER100 = [
  { pct: 150, amt: 60, story: "A bakery bakes 60 loaves on Monday and 150% of that number on Saturday. How many loaves on Saturday?" },
  { pct: 120, amt: 45, story: "Pip's shop sold 45 kites last month and 120% as many this month. How many kites this month?" },
  { pct: 200, amt: 35, story: "A gym had 35 members; membership is now 200% of that figure. How many members now?" },
  { pct: 110, amt: 80, story: "The old car park fits 80 cars; the new one fits 110% as many. How many cars fit in the new one?" },
  { pct: 130, amt: 40, story: "Last May 40 mm of rain fell; this May brought 130% of that. How much rain this May (in mm)?" },
  { pct: 250, amt: 24, story: "A colony of 24 ants grows to 250% of its size. How many ants now?" },
  { pct: 105, amt: 200, story: "A £200 coin collection grows to 105% of its value. What is it worth now (in £)?" },
  { pct: 175, amt: 80, story: "A cinema screen seats 80 people; the new hall seats 175% as many. How many seats in the new hall?" },
];
// form2: JMO trick — a% of b + b% of a (book Expl 2.2)
const SWAP = [
  [50, 2006], [20, 45], [40, 15], [25, 84], [60, 35], [30, 40], [80, 55], [75, 48], [5, 60],
];
// form3: greatest value (book AC 1) — 4 chips, one strictly greatest
const GREATEST = [
  [[30, 30], [50, 10], [40, 20], [20, 40]],
  [[80, 45], [90, 30], [70, 50], [60, 55]],
  [[35, 60], [25, 70], [45, 40], [55, 30]],
  [[15, 200], [25, 100], [20, 140], [10, 250]],
  [[65, 80], [75, 60], [55, 90], [85, 50]],
  [[45, 120], [35, 140], [55, 80], [25, 200]],
  [[90, 70], [80, 75], [70, 85], [60, 100]],
  [[22, 150], [18, 170], [28, 110], [12, 250]],
];
const pctVal = ([pct, amt]) => (pct * amt) / 100;

function classicAmountMixer(form, vi) {
  if (form === 0) {
    const bank = pick(BASIC, vi);
    const ans = (bank.pct * bank.amt) / 100;
    const p = problemBase("amount-mixer", vi, "integer");
    finishNumeric(p, ans, [ans + 10, ans * 2, bank.amt - ans], [ans + 5, ans - 1, ans * 10], vi % 2 === 0, vi);
    p.prompt = bank.story;
    p.hint1 = "Convert the percentage to a decimal, then multiply it by the amount.";
    p.hint2 = `${bank.pct}% → ${bank.pct / 100}, then multiply by ${bank.amt}.`;
    p.solution = `Convert then multiply: ${bank.pct}% → ${bank.pct / 100} and ${bank.pct / 100} × ${bank.amt} = ${ans}. Answer: ${ans}.`;
    p.visual = { type: "card", title: "Amount mixer", equation: `${bank.pct}% of ${bank.amt}`, badge: "× decimal", accent: TEAL, note: "Percent → decimal → multiply." };
    return p;
  }
  if (form === 1) {
    const bank = pick(OVER100, vi);
    const ans = (bank.pct * bank.amt) / 100;
    const p = problemBase("amount-mixer", vi, "integer");
    finishNumeric(p, ans, [ans - 10, ans + 10, Math.round(ans / 2)], [ans + 5, ans - 5, Math.round(bank.amt * 1.01)], vi % 2 === 1, vi);
    p.prompt = bank.story;
    p.hint1 = "More than 100%? The answer is MORE than the original amount — keep calm and multiply.";
    p.hint2 = `${bank.pct}% → ${bank.pct / 100}, then multiply by ${bank.amt}.`;
    p.solution = `Over 100% just means more than the whole: ${bank.pct}% → ${bank.pct / 100} and ${bank.pct / 100} × ${bank.amt} = ${ans}. Answer: ${ans}.`;
    p.visual = { type: "card", title: "Over 100%", equation: `${bank.pct}% of ${bank.amt}`, badge: ">100%", accent: CORAL, note: "Bigger than the whole — allowed!" };
    return p;
  }
  if (form === 2) {
    const [a, b] = pick(SWAP, vi);
    const half = (a * b) / 100;
    const ans = half * 2;
    const p = problemBase("amount-mixer", vi, "integer");
    finishNumeric(p, ans, [ans + 50, half, Math.abs(ans - 50)], [ans + 1, ans - 1, ans * 2], vi % 2 === 0, vi);
    p.prompt = `Trick sum: find the sum of ${a}% of ${b} and ${b}% of ${a}.`;
    p.hint1 = "Secret swap: a% of b and b% of a are EQUAL — both are a × b ÷ 100.";
    p.hint2 = `So both terms equal ${a} × ${b} ÷ 100 → ${half}.`;
    p.solution = `Swap trick: ${a}% of ${b} and ${b}% of ${a} are both ${a} × ${b} ÷ 100 → ${half}. Sum: ${half} + ${half} = ${ans}. One multiplication, doubled — done.`;
    p.visual = { type: "pairs", title: "The swap trick", chips: [`${a}% of ${b}`, `${b}% of ${a}`, `${half}`, `${half}`, "?"], pair: [0, 1], pairNote: "equal!", note: "a% of b and b% of a always match." };
    return p;
  }
  const opts = pick(GREATEST, vi);
  const vals = opts.map(pctVal);
  const ci = vals.indexOf(Math.max(...vals));
  const correct = `${opts[ci][0]}% of ${opts[ci][1]}`;
  const wrongs = opts.filter((_, i) => i !== ci).map((o) => `${o[0]}% of ${o[1]}`);
  const p = problemBase("amount-mixer", vi, "choice");
  finishChoice(p, correct, wrongs, ["50% of 60", "25% of 90", "10% of 300"], vi);
  p.prompt = `Greatest-value hunt: which of these has the GREATEST value? ${opts.map((o) => `${o[0]}% of ${o[1]}`).join("; ")}.`;
  p.hint1 = "A bigger percentage does NOT always win — the amount matters too. Evaluate each one.";
  p.hint2 = `Convert each to a decimal and multiply: e.g. ${opts[0][0]}% of ${opts[0][1]} → ${vals[0]}.`;
  p.solution = `Evaluate each: ${opts.map((o, i) => `${o[0]}% of ${o[1]} → ${vals[i]}`).join("; ")}. The greatest is ${correct} at ${vals[ci]}.`;
  p.visual = { type: "pairs", title: "Greatest value", chips: opts.map((o) => `${o[0]}%·${o[1]}`), pair: [ci], accent: AMBER, note: `Values: ${vals.join(", ")}` };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 3: Rate Reporter — express & compare as percentages
// ---------------------------------------------------------------------------
// form0: express value/total as a percentage (book: Sandra 30/150 → 20%)
const EXPRESS = [
  { v: 30, t: 150, story: "Sandra scored 30 marks in a test with a total of 150 marks. What percentage did she score?" },
  { v: 32, t: 80, story: "Karen scored 32 out of 80 in a maths test. What percentage is that?" },
  { v: 18, t: 50, story: "18 of 50 raffle tickets were winners. What percentage is that?" },
  { v: 45, t: 60, story: "45 of 60 seats in the theatre are taken. What percentage is that?" },
  { v: 21, t: 30, story: "Leo scored 21 out of 30 in a quiz. What percentage is that?" },
  { v: 27, t: 45, story: "27 of 45 apples in the crate are red. What percentage is that?" },
  { v: 14, t: 56, story: "14 of 56 beads in the jar are blue. What percentage is that?" },
  { v: 36, t: 48, story: "36 of 48 pupils walk to school. What percentage is that?" },
  { v: 12, t: 40, story: "12 of 40 eggs in the box are cracked. What percentage is that?" },
  { v: 44, t: 55, story: "44 of 55 tickets for the show are sold. What percentage is that?" },
  { v: 51, t: 60, story: "51 of 60 planted seeds flowered. What percentage is that?" },
  { v: 26, t: 40, story: "26 of 40 stickers in the pack are shiny. What percentage is that?" },
];
// form1: score vs given percentage — which subject is higher? (book Expl 1)
const COMPARE_ONE = [
  { a: "Maths", s: 32, t: 80, b: "English", pb: 38 },
  { a: "History", s: 27, t: 60, b: "Science", pb: 48 },
  { a: "Spelling", s: 18, t: 25, b: "Reading", pb: 70 },
  { a: "Geography", s: 33, t: 50, b: "Art", pb: 68 },
  { a: "Music", s: 21, t: 30, b: "Drama", pb: 72 },
  { a: "French", s: 39, t: 60, b: "German", pb: 62 },
  { a: "Biology", s: 42, t: 50, b: "Chemistry", pb: 82 },
  { a: "PE", s: 45, t: 75, b: "Athletics", pb: 58 },
];
// form2: two pass rates — which group did better? (book L&D 103)
const PASS_RATE = [
  { na: "Course A", pa: 188, ta: 200, nb: "Course B", pb: 110, tb: 125 },
  { na: "Team X", pa: 117, ta: 130, nb: "Team Y", pb: 91, tb: 100 },
  { na: "Club North", pa: 36, ta: 45, nb: "Club South", pb: 63, tb: 75 },
  { na: "Bus route 1", pa: 84, ta: 120, nb: "Bus route 2", pb: 51, tb: 75 },
  { na: "Class Alpha", pa: 54, ta: 60, nb: "Class Beta", pb: 69, tb: 75 },
  { na: "Choir A", pa: 105, ta: 140, nb: "Choir B", pb: 96, tb: 120 },
  { na: "Squad Red", pa: 99, ta: 110, nb: "Squad Blue", pb: 100, tb: 125 },
  { na: "Bakery A", pa: 126, ta: 150, nb: "Bakery B", pb: 96, tb: 120 },
];
// form3: mixed groups (book Challenge: 48% girls, 25% of girls + 50% of boys by bus)
const MIXED_GROUP = [
  { g: 48, p1: 25, p2: 50, ga: "girls", gb: "boys", what: "travel to school by bus", who: "pupils" },
  { g: 40, p1: 30, p2: 50, ga: "adults", gb: "children", what: "cheer loudly at the match", who: "spectators" },
  { g: 60, p1: 20, p2: 40, ga: "cats", gb: "dogs", what: "wear a collar", who: "pets" },
  { g: 30, p1: 40, p2: 60, ga: "juniors", gb: "seniors", what: "own a skateboard", who: "club members" },
  { g: 50, p1: 20, p2: 30, ga: "morning visitors", gb: "afternoon visitors", what: "buy an ice cream", who: "visitors" },
  { g: 70, p1: 10, p2: 30, ga: "new cars", gb: "used cars", what: "are red", who: "cars in the lot" },
  { g: 80, p1: 15, p2: 25, ga: "hardbacks", gb: "paperbacks", what: "are signed by the author", who: "books" },
  { g: 45, p1: 20, p2: 40, ga: "loader robots", gb: "lifter robots", what: "wear a hat", who: "robots at the depot" },
];

function classicRateReporter(form, vi) {
  if (form === 0) {
    const bank = pick(EXPRESS, vi);
    const ans = (bank.v * 100) / bank.t;
    const p = problemBase("rate-reporter", vi, "integer");
    finishNumeric(p, ans, [ans + 10, ans - 10, ans + 5], [ans + 1, ans * 2, ans - 5], vi % 2 === 0, vi);
    p.prompt = bank.story;
    p.hint1 = "Percentage = Value ÷ Total × 100.";
    p.hint2 = `${bank.v} ÷ ${bank.t} × 100 — work left to right.`;
    p.solution = `Percentage = Value ÷ Total × 100: ${bank.v} ÷ ${bank.t} × 100 = ${ans}. Answer: ${ans}%.`;
    p.visual = { type: "fan", title: "Rate reporter", top: `${bank.v} out of ${bank.t}`, branches: [`÷ ${bank.t}`, `× 100`, "report"], results: [`${bank.v / bank.t}`, `${ans}`, `${ans}%`], accent: TEAL, note: "Value ÷ Total × 100." };
    return p;
  }
  if (form === 1) {
    const bank = pick(COMPARE_ONE, vi);
    const pa = (bank.s * 100) / bank.t;
    const labelA = `${bank.a} — ${pa}%`;
    const labelB = `${bank.b} — ${bank.pb}%`;
    const correct = pa > bank.pb ? labelA : labelB;
    const other = pa > bank.pb ? labelB : labelA;
    const p = problemBase("rate-reporter", vi, "choice");
    finishChoice(p, correct, [other, "Exactly equal", "Cannot be compared"], ["Both are 50%", "Neither test counts"], vi);
    p.prompt = `Karen-style showdown: a score of ${bank.s} out of ${bank.t} in ${bank.a}, and ${bank.pb}% in ${bank.b}. Which is the higher percentage?`;
    p.hint1 = "Convert the raw score to a percentage first — then compare like with like.";
    p.hint2 = `${bank.s} ÷ ${bank.t} × 100 = ${pa}.`;
    p.solution = `${bank.a}: ${bank.s} ÷ ${bank.t} × 100 = ${pa}, so ${pa}% vs ${bank.pb}%. ${correct} wins — always convert before you compare.`;
    p.visual = { type: "pairs", title: "Showdown", chips: [`${bank.s}/${bank.t}`, `${pa}%`, "vs", `${bank.pb}%`, correct === labelA ? bank.a : bank.b], pair: [0, 1], pairNote: `${pa}%`, note: "Convert first, then compare." };
    return p;
  }
  if (form === 2) {
    const bank = pick(PASS_RATE, vi);
    const ra = (bank.pa * 100) / bank.ta;
    const rb = (bank.pb * 100) / bank.tb;
    const labelA = `${bank.na} — ${ra}%`;
    const labelB = `${bank.nb} — ${rb}%`;
    const correct = ra > rb ? labelA : labelB;
    const other = ra > rb ? labelB : labelA;
    const p = problemBase("rate-reporter", vi, "choice");
    finishChoice(p, correct, [other, "Exactly equal", "Cannot compare without equal totals"], ["The bigger group wins", "The smaller group wins"], vi);
    p.prompt = `${bank.ta} people took ${bank.na} and ${bank.tb} took ${bank.nb}. ${bank.pa} passed ${bank.na} and ${bank.pb} passed ${bank.nb}. Which has the higher pass rate?`;
    p.hint1 = "Different totals! Express each pass count as a percentage of its own total first.";
    p.hint2 = `${bank.pa} ÷ ${bank.ta} × 100 = ${ra} and ${bank.pb} ÷ ${bank.tb} × 100 = ${rb}.`;
    p.solution = `${bank.na}: ${bank.pa} ÷ ${bank.ta} × 100 = ${ra}. ${bank.nb}: ${bank.pb} ÷ ${bank.tb} × 100 = ${rb}. ${correct} — the raw counts would have fooled you.`;
    p.visual = { type: "pairs", title: "Pass rates", chips: [`${bank.pa}/${bank.ta}`, `${ra}%`, "vs", `${rb}%`, `${bank.pb}/${bank.tb}`], pair: ra > rb ? [0, 1] : [3, 4], pairNote: "higher!", note: "Each group against its own total." };
    return p;
  }
  const bank = pick(MIXED_GROUP, vi);
  const partA = (bank.g * bank.p1) / 100;
  const partB = ((100 - bank.g) * bank.p2) / 100;
  const ans = partA + partB;
  const p = problemBase("rate-reporter", vi, "integer");
  finishNumeric(p, ans, [ans + 10, ans - 10, ans + 4], [bank.p1, bank.p2, ans - 4], vi % 2 === 1, vi);
  p.prompt = `${bank.g}% of the ${bank.who} are ${bank.ga}. ${bank.p1}% of the ${bank.ga} and ${bank.p2}% of the ${bank.gb} ${bank.what}. What percentage of all the ${bank.who} ${bank.what}?`;
  p.hint1 = "Imagine exactly 100 — then the percentages turn into real counts.";
  p.hint2 = `Of 100: ${bank.g} ${bank.ga} and ${100 - bank.g} ${bank.gb}. Take ${bank.p1}% of one group and ${bank.p2}% of the other.`;
  p.solution = `Imagine 100 ${bank.who}: ${bank.g} ${bank.ga} and ${100 - bank.g} ${bank.gb}. ${bank.p1}% of ${bank.g} is ${partA} and ${bank.p2}% of ${100 - bank.g} is ${partB}. Total: ${partA} + ${partB} = ${ans} — so ${ans}% ${bank.what}.`;
  p.visual = { type: "fan", title: "100-strong crowd", top: `100 ${bank.who}`, branches: [`${bank.g} ${bank.ga}`, `${100 - bank.g} ${bank.gb}`, "join up"], results: [`${partA}`, `${partB}`, `${ans}%`], accent: PURPLE, note: "Percentages of groups add up." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 4: Change Machine — increase/decrease via decimal multipliers
// ---------------------------------------------------------------------------
// form0: reduced BY p% (book: TV £350 −30% → £245)
const DECREASE = [
  { orig: 350, pct: 30, story: "A television normally costs £350. In a sale, this price is reduced by 30%. Work out the sale price (in £)." },
  { orig: 80, pct: 25, story: "A coat priced at £80 is reduced by 25% in a sale. What is the sale price (in £)?" },
  { orig: 120, pct: 15, story: "A £120 bike helmet is reduced by 15%. What is the sale price (in £)?" },
  { orig: 240, pct: 5, story: "A £240 scooter is reduced by 5% in a flash sale. What is the sale price (in £)?" },
  { orig: 60, pct: 40, story: "A game costing £60 is reduced by 40%. What is the sale price (in £)?" },
  { orig: 500, pct: 12, story: "A £500 laptop is reduced by 12%. What is the sale price (in £)?" },
  { orig: 90, pct: 20, story: "Ski gloves at £90 are reduced by 20%. What is the sale price (in £)?" },
  { orig: 150, pct: 10, story: "A £150 train pass is reduced by 10%. What is the sale price (in £)?" },
  { orig: 200, pct: 35, story: "A £200 keyboard is reduced by 35%. What is the sale price (in £)?" },
  { orig: 75, pct: 8, story: "A £75 rucksack is reduced by 8%. What is the sale price (in £)?" },
];
// form1: increased BY p% / VAT (book AC 2: £360 + 17½% VAT → £423)
const INCREASE = [
  { orig: 360, pct: 17.5, story: "A computer costs £360 plus 17.5% VAT. Calculate the total cost (in £)." },
  { orig: 240, pct: 20, story: "A £240 phone plus 20% VAT. What is the total cost (in £)?" },
  { orig: 65, pct: 20, story: "One tyre costs £65 plus 20% VAT. What is the total for one tyre (in £)?" },
  { orig: 80, pct: 15, story: "A meal costs £80 plus a 15% service charge. What is the total (in £)?" },
  { orig: 120, pct: 25, story: "A £120 ticket price rises by 25%. What is the new price (in £)?" },
  { orig: 50, pct: 30, story: "A £50 metered bill rises by 30%. What is the new bill (in £)?" },
  { orig: 200, pct: 12, story: "A savings pot of £200 grows by 12%. What is it worth now (in £)?" },
  { orig: 90, pct: 10, story: "A £90 rail fare rises by 10%. What is the new fare (in £)?" },
  { orig: 150, pct: 8, story: "A £150 hotel room plus 8% city tax. What is the total (in £)?" },
];
// form2: dial the decimal multiplier (book Notes 107)
const MULTIPLIER = [
  { label: "an increase of 15%", pct: 15, dir: "up", ans: "1.15", w: ["0.15", "0.85", "115"] },
  { label: "a decrease of 15%", pct: 15, dir: "down", ans: "0.85", w: ["0.15", "1.15", "85"] },
  { label: "an increase of 25%", pct: 25, dir: "up", ans: "1.25", w: ["0.25", "0.75", "125"] },
  { label: "a decrease of 5%", pct: 5, dir: "down", ans: "0.95", w: ["0.05", "1.05", "9.5"] },
  { label: "an increase of 8%", pct: 8, dir: "up", ans: "1.08", w: ["0.08", "0.92", "1.8"] },
  { label: "a decrease of 40%", pct: 40, dir: "down", ans: "0.6", w: ["0.4", "1.4", "60"] },
  { label: "an increase of 150%", pct: 150, dir: "up", ans: "2.5", w: ["1.5", "0.5", "150"] },
  { label: "a decrease of 2%", pct: 2, dir: "down", ans: "0.98", w: ["0.02", "1.02", "9.8"] },
];
// form3: percentage change (book: car £8000→£2000, Lauren 60→48 kg)
const PCT_CHANGE = [
  { from: 8000, to: 2000, story: "Calculate the percentage decrease when a car goes down in value from £8000 to £2000." },
  { from: 60, to: 48, story: "Lauren's weight decreases from 60 kg to 48 kg. Calculate the percentage decrease." },
  { from: 50, to: 65, story: "A plant grows from 50 cm to 65 cm. Calculate the percentage increase." },
  { from: 80, to: 100, story: "Tickets sold rise from 80 to 100. Calculate the percentage increase." },
  { from: 120, to: 90, story: "A price falls from £120 to £90. Calculate the percentage decrease." },
  { from: 40, to: 46, story: "Attendance at the club rises from 40 to 46. Calculate the percentage increase." },
  { from: 200, to: 170, story: "Stock count falls from 200 to 170. Calculate the percentage decrease." },
  { from: 25, to: 35, story: "A kitten's tail grows from 25 mm to 35 mm. Calculate the percentage increase." },
  { from: 90, to: 72, story: "A high score drops from 90 to 72. Calculate the percentage decrease." },
  { from: 150, to: 180, story: "The crowd grows from 150 to 180. Calculate the percentage increase." },
];

function classicChangeMachine(form, vi) {
  if (form === 0) {
    const bank = pick(DECREASE, vi);
    const mult = 1 - bank.pct / 100;
    const ans = (bank.orig * (100 - bank.pct)) / 100;
    const p = problemBase("change-machine", vi, "integer");
    finishNumeric(p, ans, [ans + 10, ans - 10, bank.orig - ans], [ans + 5, ans - 1, ans * 2], vi % 2 === 0, vi);
    p.prompt = bank.story;
    p.hint1 = "Reduced BY 30%? You still pay 70% — one multiplication with the decimal multiplier.";
    p.hint2 = `Multiplier: (100 − ${bank.pct})% → ${mult}.`;
    p.solution = `Reduced by ${bank.pct}% means ${100 - bank.pct}% remains → multiplier ${mult}. Then ${bank.orig} × ${mult} = ${ans}. Answer: £${ans}.`;
    p.visual = { type: "card", title: "Change machine", equation: `${bank.orig} − ${bank.pct}%`, badge: `× ${mult}`, accent: CORAL, note: "Decrease → multiplier below 1." };
    return p;
  }
  if (form === 1) {
    const bank = pick(INCREASE, vi);
    const mult = 1 + bank.pct / 100;
    const ans = (bank.orig * (100 + bank.pct)) / 100;
    const p = problemBase("change-machine", vi, "integer");
    finishNumeric(p, ans, [ans + 10, ans - 10, ans - bank.orig], [ans + 5, ans - 5, Math.round(bank.orig * 1.01)], vi % 2 === 1, vi);
    p.prompt = bank.story;
    p.hint1 = "An increase keeps the whole 100% AND adds extra — the multiplier goes above 1.";
    p.hint2 = `Multiplier: (100 + ${bank.pct})% → ${mult}.`;
    p.solution = `Add ${bank.pct}% → multiplier ${mult} (that is 100% + ${bank.pct}%). Then ${bank.orig} × ${mult} = ${ans}. Answer: £${ans}.`;
    p.visual = { type: "card", title: "Change machine", equation: `${bank.orig} + ${bank.pct}%`, badge: `× ${mult}`, accent: TEAL, note: "Increase → multiplier above 1." };
    return p;
  }
  if (form === 2) {
    const bank = pick(MULTIPLIER, vi);
    const p = problemBase("change-machine", vi, "choice");
    finishChoice(p, bank.ans, bank.w, ["1", "0.1", "10"], vi);
    p.prompt = `Dial the multiplier: which decimal multiplier gives ${bank.label}?`;
    p.hint1 = "Increase → above 1. Decrease → below 1. The gap from 1 is the percentage.";
    p.hint2 = `(100 ${bank.dir === "up" ? "+" : "−"} ${bank.pct})% → divide by 100.`;
    p.solution = `For ${bank.label}: (100 ${bank.dir === "up" ? "+" : "−"} ${bank.pct})% → ${100 + (bank.dir === "up" ? bank.pct : -bank.pct)} ÷ 100 = ${bank.ans}. The multiplier is ${bank.ans}.`;
    p.visual = { type: "card", title: "Multiplier dial", equation: bank.label, badge: "DIAL IT", accent: PURPLE, note: "Gap from 1 = the percentage." };
    return p;
  }
  const bank = pick(PCT_CHANGE, vi);
  const change = Math.abs(bank.to - bank.from);
  const ans = (change * 100) / bank.from;
  const dir = bank.to > bank.from ? "increase" : "decrease";
  const p = problemBase("change-machine", vi, "integer");
  finishNumeric(p, ans, [ans + 5, ans - 5, ans + 10], [ans + 1, ans - 1, ans * 2], vi % 2 === 0, vi);
  p.prompt = bank.story;
  p.hint1 = "Percentage change = Change ÷ Original × 100 — always divide by the ORIGINAL value.";
  p.hint2 = `Change: ${Math.max(bank.from, bank.to)} − ${Math.min(bank.from, bank.to)} = ${change}. Then ${change} ÷ ${bank.from} × 100.`;
  p.solution = `Change ÷ Original × 100: ${change} ÷ ${bank.from} × 100 = ${ans}. The value went ${bank.to > bank.from ? "up" : "down"} → a ${ans}% ${dir}.`;
  p.visual = { type: "card", title: "Change-o-meter", equation: `${bank.from} → ${bank.to}`, badge: dir.toUpperCase(), accent: AMBER, note: "Change ÷ Original × 100." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 5: Reverse Rescue — original-value problems
// ---------------------------------------------------------------------------
// form0: after a DECREASE, find the original (book: Felicity £42 after −30% → £60)
const REV_DEC = [
  { fin: 42, pct: 30, orig: 60, story: "Felicity buys a dress in a sale. It is reduced by 30% down to a price of £42. Work out the original price (in £)." },
  { fin: 464, pct: 20, orig: 580, story: "In a sale, normal prices are reduced by 20%. A washing machine has a sale price of £464. Calculate the ORIGINAL price (in £)." },
  { fin: 1100, pct: 12, orig: 1250, story: "When a loaf of bread is baked, it loses 12% of its weight. A baked loaf weighs 1100 g. What did it weigh before baking (in g)?" },
  { fin: 36, pct: 40, orig: 60, story: "After a 40% discount, a game costs £36. What was the original price (in £)?" },
  { fin: 63, pct: 30, orig: 90, story: "After a 30% discount, a bag costs £63. What was the original price (in £)?" },
  { fin: 72, pct: 10, orig: 80, story: "After a 10% discount, a ticket costs £72. What was the original price (in £)?" },
  { fin: 108, pct: 25, orig: 144, story: "After a 25% discount, a coat costs £108. What was the original price (in £)?" },
  { fin: 52, pct: 35, orig: 80, story: "After a 35% discount, a helmet costs £52. What was the original price (in £)?" },
  { fin: 126, pct: 40, orig: 210, story: "After a 40% discount, a chair costs £126. What was the original price (in £)?" },
  { fin: 92, pct: 8, orig: 100, story: "After an 8% discount, a toolbox costs £92. What was the original price (in £)?" },
];
// form1: after an INCREASE, find the original (book: smartphone £420, 40% profit → £300)
const REV_INC = [
  { fin: 420, pct: 40, orig: 300, story: "The selling price of a smartphone is £420. Given that the percentage profit is 40%, calculate the cost price (in £)." },
  { fin: 54, pct: 8, orig: 50, story: "After an 8% price rise, a monthly pass costs £54. What did it cost before (in £)?" },
  { fin: 132, pct: 20, orig: 110, story: "After a 20% increase, a membership costs £132. What was the original price (in £)?" },
  { fin: 69, pct: 15, orig: 60, story: "After a 15% increase, a ticket costs £69. What was the original price (in £)?" },
  { fin: 252, pct: 5, orig: 240, story: "After a 5% pay rise, a weekly wage is £252. What was it before (in £)?" },
  { fin: 198, pct: 10, orig: 180, story: "After a 10% increase, the rent is £198. What was the original rent (in £)?" },
  { fin: 234, pct: 30, orig: 180, story: "After a 30% markup, a lamp sells for £234. What did the shop pay for it (in £)?" },
  { fin: 91, pct: 30, orig: 70, story: "After a 30% increase, a subscription costs £91. What was the original price (in £)?" },
  { fin: 168, pct: 40, orig: 120, story: "After a 40% profit markup, a vase sells for £168. What did it cost the dealer (in £)?" },
];
// form2: two-step reverse (book Expl 3: +25% then −10% → £45 → £40)
const REV_CHAIN = [
  { p1: 25, p2: -10, fin: 45, orig: 40, story: "The price of a train ticket increased by 25% and then decreased by 10% in a special offer. It was then priced at £45. What was the original price (in £)?" },
  { p1: 10, p2: -20, fin: 66, orig: 75, story: "A season pass rose by 10% and then fell by 20% in a flash deal. It now costs £66. What was the original price (in £)?" },
  { p1: 20, p2: -25, fin: 54, orig: 60, story: "A console game rose by 20% and then dropped by 25% in a sale. It now costs £54. What was the original price (in £)?" },
  { p1: 50, p2: -20, fin: 120, orig: 100, story: "A flight fare jumped by 50% and then fell by 20%. It now costs £120. What was the original fare (in £)?" },
  { p1: 10, p2: -10, fin: 99, orig: 100, story: "A rare coin rose by 10% and then fell by 10%. It is now valued at £99. What was the original value (in £)?" },
  { p1: 40, p2: -20, fin: 84, orig: 75, story: "A share price rose by 40% and then fell by 20%. It is now £84. What was the original price (in £)?" },
  { p1: 20, p2: -10, fin: 108, orig: 100, story: "A gym fee rose by 20% and then fell by 10% with a loyalty deal. It is now £108. What was the original fee (in £)?" },
  { p1: 15, p2: -20, fin: 69, orig: 75, story: "A phone plan rose by 15% and then fell by 20% in a promo. It is now £69. What was the original price (in £)?" },
  { p1: 5, p2: -20, fin: 84, orig: 100, story: "A parking charge rose by 5% and then fell by 20% for residents. It is now £84. What was the original charge (in £)?" },
];
// form3: "p% MORE than" trap (book AC 7: skis 4.25 m = 150% more → 1.7 m)
const MORE_THAN = [
  { fin: 425, pct: 150, orig: 170, story: "Sarah is a ski jumper. The maximum length of skis she can use is 425 cm, which is 150% MORE than her height. Work out Sarah's height (in cm)." },
  { fin: 120, pct: 50, orig: 80, story: "A deluxe kite costs £120, which is 50% more than the basic kite. What is the price of the basic kite (in £)?" },
  { fin: 210, pct: 75, orig: 120, story: "A gaming chair costs £210, which is 75% more than a plain chair. What is the plain chair's price (in £)?" },
  { fin: 160, pct: 25, orig: 128, story: "A jumbo pack holds 160 g, which is 25% more than the regular pack. What does the regular pack hold (in g)?" },
  { fin: 90, pct: 80, orig: 50, story: "An express train ticket is £90, which is 80% more than the standard fare. What is the standard fare (in £)?" },
  { fin: 260, pct: 30, orig: 200, story: "A collector's comic costs £260, which is 30% more than the standard edition. What is the standard price (in £)?" },
  { fin: 440, pct: 120, orig: 200, story: "A stadium tour costs £440, which is 120% more than the museum tour. What is the museum tour price (in £)?" },
  { fin: 195, pct: 30, orig: 150, story: "A smart pet feeder costs £195, which is 30% more than the basic one. What is the basic price (in £)?" },
];

function classicReverseRescue(form, vi) {
  if (form === 0) {
    const bank = pick(REV_DEC, vi);
    const mult = 1 - bank.pct / 100;
    const p = problemBase("reverse-rescue", vi, "integer");
    finishNumeric(p, bank.orig, [bank.orig + 10, bank.orig - 10, Math.round(bank.fin / 2)], [bank.orig + 5, bank.orig - 5, bank.orig * 2], vi % 2 === 0, vi);
    p.prompt = bank.story;
    p.hint1 = "Reverse it! The sale price is what REMAINS after the discount — divide by the multiplier.";
    p.hint2 = `The price is (100 − ${bank.pct})% → ${mult} of the original.`;
    p.solution = `The sale price is ${100 - bank.pct}% of the original → multiplier ${mult}. Reverse: ${bank.fin} ÷ ${mult} = ${bank.orig}. Check: ${bank.orig} × ${mult} = ${bank.fin} ✓. Answer: ${bank.orig}.`;
    p.visual = { type: "card", title: "Rewind crane", equation: `${bank.fin} after −${bank.pct}%`, badge: "REWIND", accent: PURPLE, note: "Divide by the multiplier." };
    return p;
  }
  if (form === 1) {
    const bank = pick(REV_INC, vi);
    const mult = 1 + bank.pct / 100;
    const p = problemBase("reverse-rescue", vi, "integer");
    finishNumeric(p, bank.orig, [bank.orig + 10, bank.orig - 10, Math.round(bank.fin * 0.9)], [bank.orig + 5, bank.orig - 5, bank.orig * 2], vi % 2 === 1, vi);
    p.prompt = bank.story;
    p.hint1 = "The new price is MORE than 100% of the original — divide by the multiplier to rewind.";
    p.hint2 = `The price is (100 + ${bank.pct})% → ${mult} of the original.`;
    p.solution = `The new price is ${100 + bank.pct}% of the original → multiplier ${mult}. Reverse: ${bank.fin} ÷ ${mult} = ${bank.orig}. Check: ${bank.orig} × ${mult} = ${bank.fin} ✓. Answer: ${bank.orig}.`;
    p.visual = { type: "card", title: "Rewind crane", equation: `${bank.fin} after +${bank.pct}%`, badge: "REWIND", accent: TEAL, note: "Divide by the multiplier." };
    return p;
  }
  if (form === 2) {
    const bank = pick(REV_CHAIN, vi);
    const m1 = 1 + bank.p1 / 100;
    const m2 = 1 + bank.p2 / 100;
    const mid = Math.round((bank.fin / m2) * 100) / 100;
    const p = problemBase("reverse-rescue", vi, "integer");
    finishNumeric(p, bank.orig, [bank.orig + 10, bank.orig - 10, Math.round(bank.fin * 1.1)], [bank.orig + 5, bank.orig - 5, bank.orig * 2], vi % 2 === 0, vi);
    p.prompt = bank.story;
    p.hint1 = "Two changes? Rewind BOTH, last change first — divide by each multiplier in reverse order.";
    p.hint2 = `Undo the ${bank.p2 < 0 ? "fall" : "rise"}: ÷ ${m2}. Then undo the ${bank.p1 < 0 ? "fall" : "rise"}: ÷ ${m1}.`;
    p.solution = `Rewind backwards, last change first: ${bank.fin} ÷ ${m2} = ${mid}, then ${mid} ÷ ${m1} = ${bank.orig}. Check forwards: ${bank.orig} × ${m1} = ${Math.round(bank.orig * m1 * 100) / 100} and ${Math.round(bank.orig * m1 * 100) / 100} × ${m2} = ${bank.fin} ✓. Answer: £${bank.orig}.`;
    p.visual = { type: "fan", title: "Double rewind", top: `£${bank.fin}`, branches: [`÷ ${m2}`, `÷ ${m1}`, "done"], results: [`${mid}`, `${bank.orig}`, "✓"], accent: CORAL, note: "Undo the LAST change first." };
    return p;
  }
  const bank = pick(MORE_THAN, vi);
  const mult = 1 + bank.pct / 100;
  const p = problemBase("reverse-rescue", vi, "integer");
  finishNumeric(p, bank.orig, [bank.orig + 10, bank.orig - 10, Math.round(bank.fin * 0.9)], [bank.orig + 5, bank.orig - 5, bank.orig * 2], vi % 2 === 1, vi);
  p.prompt = bank.story;
  p.hint1 = `Careful — ${bank.pct}% MORE than means the original PLUS ${bank.pct}%, not ${bank.pct}% of it.`;
  p.hint2 = `That is (100 + ${bank.pct})% → ${mult} of the original. Now divide.`;
  p.solution = `${bank.pct}% more means (100 + ${bank.pct})% of the original → multiplier ${mult}. Reverse: ${bank.fin} ÷ ${mult} = ${bank.orig}. The "more than" trap dodged ✓. Answer: ${bank.orig}.`;
  p.visual = { type: "card", title: "The MORE-THAN trap", equation: `${bank.fin} is ${bank.pct}% more`, badge: `× ${mult}`, accent: AMBER, note: "More than → add 100% first." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 6: Percent Capstone — JMO difficulty 4
// ---------------------------------------------------------------------------
// form0: successive changes, total over the week (book Ext 3: Pied Piper 3736 rats)
const PIED = [
  { start: 1000, ch: [-10, 20, -30], story: "On Monday, the Pied Piper caught 1000 rats in a city. On Tuesday, he caught 10% fewer than on Monday. On Wednesday, 20% more than on Tuesday. On Thursday, 30% fewer than on Wednesday. On Friday he rested. How many rats did he catch in total that week?" },
  { start: 500, ch: [-20, 10, -10], story: "A beekeeper counted 500 bees on Monday. Tuesday saw 20% fewer, Wednesday 10% more than Tuesday, Thursday 10% fewer than Wednesday. Friday: no counting. How many bees were counted in total?" },
  { start: 200, ch: [10, 25, -20], story: "A streamer had 200 subscribers on Monday. Tuesday: 10% more. Wednesday: 25% more than Tuesday. Thursday: 20% fewer than Wednesday. How many subscribers did she have in total across the four days?" },
  { start: 800, ch: [-25, 20, -10], story: "A gardener spotted 800 snails on Monday. Tuesday: 25% fewer. Wednesday: 20% more than Tuesday. Thursday: 10% fewer than Wednesday. How many snails in total over the four days?" },
  { start: 400, ch: [15, -20, 25], story: "A drummer gained 400 followers on Monday. Tuesday: 15% more. Wednesday: 20% fewer than Tuesday. Thursday: 25% more than Wednesday. How many new followers in total across the four days?" },
  { start: 250, ch: [20, -10, 40], story: "A collector found 250 cards on Monday. Tuesday: 20% more. Wednesday: 10% fewer than Tuesday. Thursday: 40% more than Wednesday. How many cards in total over the four days?" },
  { start: 600, ch: [-10, -20, 50], story: "A ranger counted 600 deer tracks on Monday. Tuesday: 10% fewer. Wednesday: 20% fewer than Tuesday. Thursday: 50% more than Wednesday. How many tracks in total over the four days?" },
  { start: 900, ch: [-20, 50, -10], story: "A pigeon fancier logged 900 pigeons on Monday. Tuesday: 20% fewer. Wednesday: 50% more than Tuesday. Thursday: 10% fewer than Wednesday. How many pigeons in total over the four days?" },
];
// form1: two items sold at the same price, one at a profit and one at a loss
//        (book Expl 6: Helen's stamps £300 each; Ext 2: houses £156000 each)
const TWO_ITEM = [
  { price: 300, up: 25, down: 25, ask: "profit", win: "Penny Black", lose: "Penny Red", who: "Helen", what: "stamps" },
  { price: 300, up: 25, down: 25, ask: "loss", win: "Penny Black", lose: "Penny Red", who: "Helen", what: "stamps" },
  { price: 156000, up: 20, down: 20, ask: "profit", win: "Costaplenty", lose: "Thisledo", who: "A property owner", what: "houses" },
  { price: 156000, up: 20, down: 20, ask: "loss", win: "Costaplenty", lose: "Thisledo", who: "A property owner", what: "houses" },
  { price: 120, up: 50, down: 50, ask: "profit", win: "vintage guitar", lose: "modern guitar", who: "Marcus", what: "guitars" },
  { price: 120, up: 50, down: 50, ask: "loss", win: "vintage guitar", lose: "modern guitar", who: "Marcus", what: "guitars" },
  { price: 600, up: 25, down: 50, ask: "profit", win: "vintage vase", lose: "modern vase", who: "Priya", what: "vases" },
  { price: 600, up: 25, down: 50, ask: "loss", win: "vintage vase", lose: "modern vase", who: "Priya", what: "vases" },
];
// form2: trader percentage profit (book Ext 1: six watches; AC 8/10; L&D 110; Expl 5)
const TRADER = [
  { story: "A trader buys six watches at £25 each. He scratches one of them, so he sells that one for £10. He sells the other five for £40 each. Find his percentage profit.", cost: 150, revExpr: "10 + 5 × 40", rev: 210, ans: 40 },
  { story: "Sean buys 24 chocolate bars for £10. He sells them for 50p each. Work out his percentage profit.", cost: 10, revExpr: "24 × 0.5", rev: 12, ans: 20 },
  { story: "Emily buys a pack of 12 bottles of water for £5. She sells all 12 bottles for 50p each. Work out Emily's percentage profit.", cost: 5, revExpr: "12 × 0.5", rev: 6, ans: 20 },
  { story: "Renee buys 5 kg of sweets for £10. She packs them into 20 bags of 250 g and sells each bag for 65p. Work out her percentage profit.", cost: 10, revExpr: "20 × 0.65", rev: 13, ans: 30 },
  { story: "Peter bought a table for £800 and sold it for £1000. Calculate his percentage profit.", cost: 800, revExpr: "1000", rev: 1000, ans: 25 },
  { story: "A trader buys 10 mugs for £40. He sells 8 at £5 each and the 2 chipped ones at £3 each. Find his percentage profit.", cost: 40, revExpr: "8 × 5 + 2 × 3", rev: 46, ans: 15 },
  { story: "A trader buys 20 pens for £10. She sells 15 at 80p each and the other 5 at 40p each. Find her percentage profit.", cost: 10, revExpr: "15 × 0.8 + 5 × 0.4", rev: 14, ans: 40 },
  { story: "A trader buys 8 posters for £20. She sells 6 at £4 each and the other 2 at £3 each. Find her percentage profit.", cost: 20, revExpr: "6 × 4 + 2 × 3", rev: 30, ans: 50 },
];
// form3: riddles (book Ext Ch 1 ticket; Challenge 110 Jack & Sadia; Ext Ch 2 computer; Expl 2.1 chain)
const RIDDLES = [
  { kind: "chain", pcts: [25, 20, 50], amt: 40, ans: "£1", w: ["£2", "£0.50", "£4"] },
  { kind: "sadia", pctMore: 25, ans: "20%", w: ["25%", "15%", "30%"] },
  { kind: "shop", off: 20, profit: 20, ans: "50%", w: ["40%", "44%", "25%"] },
  { kind: "ticket", p1: 5, p2: -20, diff: 4, more: false, ans: "£25", w: ["£20", "£16", "£30"] },
  { kind: "chain", pcts: [10, 20, 50], amt: 800, ans: "£8", w: ["£80", "£0.80", "£16"] },
  { kind: "ticket", p1: 50, p2: -40, diff: 5, more: false, ans: "£50", w: ["£40", "£45", "£60"] },
  { kind: "shop", off: 50, profit: 100, ans: "300%", w: ["200%", "150%", "250%"] },
  { kind: "sadia", pctMore: 100, ans: "50%", w: ["100%", "25%", "40%"] },
  { kind: "chain", pcts: [30, 50, 10], amt: 200, ans: "£3", w: ["£30", "£6", "£1.50"] },
  { kind: "ticket", p1: 20, p2: -10, diff: 8, more: true, ans: "£100", w: ["£80", "£96", "£120"] },
  { kind: "ticket", p1: 10, p2: -20, diff: 6, more: false, ans: "£50", w: ["£40", "£55", "£60"] },
  { kind: "chain", pcts: [20, 30, 40], amt: 50, ans: "£1.20", w: ["£1.50", "£2", "£12"] },
];

function classicPercentCapstone(form, vi) {
  if (form === 0) {
    const bank = pick(PIED, vi);
    const days = [bank.start];
    for (const c of bank.ch) days.push(Math.round(days[days.length - 1] * (1 + c / 100)));
    const total = days.reduce((a, b) => a + b, 0);
    const mults = bank.ch.map((c) => 1 + c / 100);
    const p = problemBase("percent-capstone", vi, "integer");
    finishNumeric(p, total, [total + 10, total - 10, days[days.length - 1]], [total + 5, total - 5, total + 100], vi % 2 === 0, vi);
    p.prompt = bank.story;
    p.hint1 = "Each day starts from the PREVIOUS day — work day by day with the decimal multipliers.";
    p.hint2 = `Multipliers: ${bank.ch.map((c, i) => `day ${i + 2} × ${mults[i]}`).join(", ")}.`;
    p.solution = `Day by day: ${days[0]} × ${mults[0]} = ${days[1]}, then ${days[1]} × ${mults[1]} = ${days[2]}, then ${days[2]} × ${mults[2]} = ${days[3]}. Total: ${days.join(" + ")} = ${total}. Answer: ${total}.`;
    p.visual = { type: "fan", title: "Day-by-day chain", top: `${bank.start}`, branches: [`× ${mults[0]}`, `× ${mults[1]}`, `× ${mults[2]}`], results: [`${days[1]}`, `${days[2]}`, `${days[3]}`], accent: TEAL, note: "Each day starts from the day before." };
    return p;
  }
  if (form === 1) {
    const bank = pick(TWO_ITEM, vi);
    const costUp = (bank.price * 100) / (100 + bank.up);
    const costDown = (bank.price * 100) / (100 - bank.down);
    const ans = bank.ask === "profit" ? bank.price - costUp : costDown - bank.price;
    const p = problemBase("percent-capstone", vi, "integer");
    finishNumeric(p, ans, [ans + 10, ans - 10, ans * 2], [ans + 5, ans - 5, Math.round(bank.price / 4)], vi % 2 === 1, vi);
    p.prompt = `${bank.who} has two ${bank.what} for sale — a rare one (the ${bank.win}) and a common one (the ${bank.lose}). They sell for £${bank.price} each. Based on the original cost prices, that is a profit of ${bank.up}% on the ${bank.win} and a loss of ${bank.down}% on the ${bank.lose}. Calculate the ${bank.ask} made on the ${bank.ask === "profit" ? bank.win : bank.lose} (in £).`;
    p.hint1 = "The £-price is AFTER the change — rewind with the multiplier to find the cost price first.";
    p.hint2 = bank.ask === "profit" ? `Cost of the ${bank.win}: ${bank.price} ÷ ${1 + bank.up / 100}.` : `Cost of the ${bank.lose}: ${bank.price} ÷ ${1 - bank.down / 100}.`;
    p.solution = bank.ask === "profit"
      ? `Reverse the cost: ${bank.price} ÷ ${1 + bank.up / 100} = ${costUp}. Profit: ${bank.price} − ${costUp} = ${ans}. Answer: £${ans}.`
      : `Reverse the cost: ${bank.price} ÷ ${1 - bank.down / 100} = ${costDown}. Loss: ${costDown} − ${bank.price} = ${ans}. Answer: £${ans}.`;
    p.visual = { type: "pairs", title: "Two sales, one price", chips: [`£${bank.price}`, bank.win, `+${bank.up}%`, bank.lose, `−${bank.down}%`], pair: bank.ask === "profit" ? [0, 2] : [3, 4], pairNote: "rewind!", note: "Same selling price ≠ same cost price." };
    return p;
  }
  if (form === 2) {
    const bank = pick(TRADER, vi);
    const profit = bank.rev - bank.cost;
    const p = problemBase("percent-capstone", vi, "integer");
    finishNumeric(p, bank.ans, [bank.ans + 10, bank.ans - 10, bank.ans + 5], [bank.ans * 2, bank.ans + 1, bank.ans - 5], vi % 2 === 0, vi);
    p.prompt = bank.story;
    p.hint1 = "Percentage profit = Profit ÷ Total Cost × 100. Get the totals first.";
    p.hint2 = `Cost £${bank.cost}; revenue ${bank.revExpr} → £${bank.rev}.`;
    p.solution = `Total cost £${bank.cost}, total revenue ${bank.revExpr} = ${bank.rev}. Profit: ${bank.rev} − ${bank.cost} = ${profit}. Percentage profit: ${profit} ÷ ${bank.cost} × 100 = ${bank.ans}. Answer: ${bank.ans}%.`;
    p.visual = { type: "card", title: "Trader's ledger", equation: `cost £${bank.cost} → rev £${bank.rev}`, badge: "PROFIT%", accent: AMBER, note: "Profit ÷ Cost × 100." };
    return p;
  }
  const bank = pick(RIDDLES, vi);
  const p = problemBase("percent-capstone", vi, "choice");
  if (bank.kind === "ticket") {
    const combRaw = (1 + bank.p1 / 100) * (1 + bank.p2 / 100);
    const comb = Math.round(combRaw * 10000) / 10000;
    const lost = Math.round(Math.abs(1 - combRaw) * 10000) / 10000;
    const combPct = Math.round(combRaw * 100);
    const lostPct = Math.round(Math.abs(1 - combRaw) * 100);
    finishChoice(p, bank.ans, bank.w, ["£10", "£40", "£75"], vi);
    p.prompt = `Riddle: the price of a train ticket increased by ${bank.p1}% and then decreased by ${Math.abs(bank.p2)}% in a special offer. It was then £${bank.diff} ${bank.more ? "MORE" : "less"} expensive than its original price. What was the original price?`;
    p.hint1 = "Chain the multipliers first — one combined multiplier for both changes.";
    p.hint2 = `Combined: ${1 + bank.p1 / 100} × ${1 + bank.p2 / 100} → ${comb} of the original.`;
    p.solution = `Combined multiplier: ${1 + bank.p1 / 100} × ${1 + bank.p2 / 100} = ${comb} — the ticket ended at ${combPct}% of the original, so the gap is ${lostPct}% → £${bank.diff}. Original: ${bank.diff} ÷ ${lost} = ${parseNumber(bank.ans)}. Answer: ${bank.ans}.`;
    p.visual = { type: "card", title: "The ticket riddle", equation: `× ${1 + bank.p1 / 100} then × ${1 + bank.p2 / 100}`, badge: "RIDDLE", accent: CORAL, note: `Combined × ${comb} — the gap is £${bank.diff}.` };
  } else if (bank.kind === "sadia") {
    const keep = 1 + bank.pctMore / 100;
    const inv = 1 / keep;
    const cutPct = Math.round((1 - inv) * 10000) / 100;
    finishChoice(p, bank.ans, bank.w, ["10%", "30%", "40%"], vi);
    p.prompt = `Cereal offer showdown. Jack's idea: put ${bank.pctMore}% more cereal into each box and keep the price the same. Sadia's idea must give the SAME value for money by cutting the price instead (same amount of cereal). By what percentage does she need to reduce the price?`;
    p.hint1 = "Same value per gram: the box holds more, so the price must shrink in the same ratio.";
    p.hint2 = `New amount is ${keep} times the old — the price must become 1 ÷ ${keep} of itself.`;
    p.solution = `The box holds ${keep} times as much, so matching value needs the price at 1 ÷ ${keep} = ${inv} of itself — a cut of ${cutPct}%. Answer: ${bank.ans}. (${bank.pctMore}% more and ${cutPct}% less are the same deal — percentages flip around!)`;
    p.visual = { type: "pairs", title: "Same value, two routes", chips: [`+${bank.pctMore}% cereal`, "same £", `−${cutPct}% price`, "same g", "equal!"], pair: [0, 2], pairNote: "match", note: `1 ÷ ${keep} = ${inv} — the ${cutPct}% cut.` };
  } else if (bank.kind === "shop") {
    const ratio = Math.round(((1 + bank.profit / 100) / (1 - bank.off / 100)) * 10000) / 10000;
    const ratioPct = Math.round(ratio * 100);
    const profitPct = Math.round((ratio - 1) * 100);
    finishChoice(p, bank.ans, bank.w, ["10%", "100%", "60%"], vi);
    p.prompt = `In a sale, the price of a computer is reduced by ${bank.off}%. At this reduced price, the shopkeeper still makes a profit of ${bank.profit}%. What would have been his percentage profit if the computer had been sold at full price?`;
    p.hint1 = "The sale price is both a discount of the full price AND a markup of the cost. Chain them.";
    p.hint2 = `Full price ÷ cost → (100 + ${bank.profit})% ÷ (100 − ${bank.off})%.`;
    p.solution = `Sale price is ${100 + bank.profit}% of cost AND ${100 - bank.off}% of full price. So full ÷ cost → ${1 + bank.profit / 100} ÷ ${1 - bank.off / 100} = ${ratio} — full price is ${ratioPct}% of cost, a ${profitPct}% profit. Answer: ${bank.ans}.`;
    p.visual = { type: "card", title: "The shopkeeper's secret", equation: `sale −${bank.off}%, profit +${bank.profit}%`, badge: "CHAIN", accent: PURPLE, note: "Full price carries both markups." };
  } else {
    finishChoice(p, bank.ans, bank.w, ["£5", "£15", "£0.10"], vi);
    const steps = [];
    let rest = bank.amt;
    for (let i = bank.pcts.length - 1; i >= 0; i -= 1) {
      const nxt = (rest * bank.pcts[i]) / 100;
      steps.push(`${bank.pcts[i]}% of ${rest} → ${nxt}`);
      rest = nxt;
    }
    p.prompt = `Chain reaction: calculate ${bank.pcts.map((x) => `${x}%`).join(" of ")} of £${bank.amt}.`;
    p.hint1 = "Work from the BACK — the last percentage acts first, then each answer feeds the next.";
    p.hint2 = `First step: ${steps[0]}.`;
    p.solution = `Work from the back: ${steps.join("; ")}. Answer: ${bank.ans}.`;
    p.visual = { type: "card", title: "Chain reaction", equation: `${bank.pcts.map((x) => `${x}%`).join(" of ")} of £${bank.amt}`, badge: "CHAIN", accent: TEAL, note: "Convert each to a decimal, then multiply through." };
  }
  return p;
}

// ---------------------------------------------------------------------------
// Engine: GENERATORS + generateProblem + checkAnswer + validateProblemMath
// ---------------------------------------------------------------------------
const GENERATORS = {
  "grid-basics": (vi) => classicGridBasics(vi % 4, vi),
  "amount-mixer": (vi) => classicAmountMixer(vi % 4, vi),
  "rate-reporter": (vi) => classicRateReporter(vi % 4, vi),
  "change-machine": (vi) => classicChangeMachine(vi % 4, vi),
  "reverse-rescue": (vi) => classicReverseRescue(vi % 4, vi),
  "percent-capstone": (vi) => classicPercentCapstone(vi % 4, vi),
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
  const eq = (a, b) => typeof a === "number" && typeof b === "number" && Math.abs(a - b) < 1e-6;
  switch (problem.classicId) {
    case "grid-basics": {
      if (form === 0) { const [d, pct] = pick(DEC2PCT, vi); return exp === pct && eq(d * 100, pct); }
      if (form === 1) { const [n, d, pct] = pick(FRAC2PCT, vi); return exp === pct && eq((n * 100) / d, pct) && Number.isInteger(pct); }
      if (form === 2) { const b = pick(PCT2FRAC, vi); return exp === b.ans && exp === pctToFracStr(parseFloat(b.pct)) && !b.w.includes(b.ans); }
      const b = pick(VOCAB, vi); return exp === b.correct && !b.wrongs.includes(b.correct);
    }
    case "amount-mixer": {
      if (form === 0) { const b = pick(BASIC, vi); return eq(Number(exp), (b.pct * b.amt) / 100) && Number.isInteger(Number(exp)); }
      if (form === 1) { const b = pick(OVER100, vi); return eq(Number(exp), (b.pct * b.amt) / 100) && Number.isInteger(Number(exp)); }
      if (form === 2) { const [a, b] = pick(SWAP, vi); return eq(Number(exp), (2 * a * b) / 100) && Number.isInteger((a * b) / 100); }
      const opts = pick(GREATEST, vi);
      const vals = opts.map(pctVal);
      const mx = Math.max(...vals);
      const ci = vals.indexOf(mx);
      return vals.filter((v) => eq(v, mx)).length === 1 && exp === `${opts[ci][0]}% of ${opts[ci][1]}`;
    }
    case "rate-reporter": {
      if (form === 0) { const b = pick(EXPRESS, vi); return eq(Number(exp), (b.v * 100) / b.t) && Number.isInteger(Number(exp)); }
      if (form === 1) {
        const b = pick(COMPARE_ONE, vi);
        const pa = (b.s * 100) / b.t;
        const correct = pa > b.pb ? `${b.a} — ${pa}%` : `${b.b} — ${b.pb}%`;
        return pa !== b.pb && exp === correct;
      }
      if (form === 2) {
        const b = pick(PASS_RATE, vi);
        const ra = (b.pa * 100) / b.ta;
        const rb = (b.pb * 100) / b.tb;
        const correct = ra > rb ? `${b.na} — ${ra}%` : `${b.nb} — ${rb}%`;
        return ra !== rb && exp === correct;
      }
      const b = pick(MIXED_GROUP, vi);
      const ans = (b.g * b.p1) / 100 + ((100 - b.g) * b.p2) / 100;
      return eq(Number(exp), ans) && Number.isInteger(ans);
    }
    case "change-machine": {
      if (form === 0) { const b = pick(DECREASE, vi); return eq(Number(exp), (b.orig * (100 - b.pct)) / 100) && Number.isInteger(Number(exp)); }
      if (form === 1) { const b = pick(INCREASE, vi); return eq(Number(exp), (b.orig * (100 + b.pct)) / 100) && Number.isInteger(Number(exp)); }
      if (form === 2) { const b = pick(MULTIPLIER, vi); return exp === b.ans && exp === String((100 + (b.dir === "up" ? b.pct : -b.pct)) / 100) && !b.w.includes(b.ans); }
      const b = pick(PCT_CHANGE, vi); return eq(Number(exp), (Math.abs(b.to - b.from) * 100) / b.from) && Number.isInteger(Number(exp));
    }
    case "reverse-rescue": {
      if (form === 0) { const b = pick(REV_DEC, vi); return eq(Number(exp), b.orig) && eq((b.orig * (100 - b.pct)) / 100, b.fin); }
      if (form === 1) { const b = pick(REV_INC, vi); return eq(Number(exp), b.orig) && eq((b.orig * (100 + b.pct)) / 100, b.fin); }
      if (form === 2) { const b = pick(REV_CHAIN, vi); return eq(Number(exp), b.orig) && eq(b.orig * (1 + b.p1 / 100) * (1 + b.p2 / 100), b.fin); }
      const b = pick(MORE_THAN, vi); return eq(Number(exp), b.orig) && eq((b.orig * (100 + b.pct)) / 100, b.fin);
    }
    case "percent-capstone": {
      if (form === 0) {
        const b = pick(PIED, vi);
        const days = [b.start];
        for (const c of b.ch) days.push(Math.round(days[days.length - 1] * (1 + c / 100)));
        const tot = days.reduce((x, y) => x + y, 0);
        return eq(Number(exp), tot) && days.every(Number.isInteger);
      }
      if (form === 1) {
        const b = pick(TWO_ITEM, vi);
        const cu = (b.price * 100) / (100 + b.up);
        const cd = (b.price * 100) / (100 - b.down);
        const a = b.ask === "profit" ? b.price - cu : cd - b.price;
        return eq(Number(exp), a) && a > 0 && Number.isInteger(a);
      }
      if (form === 2) { const b = pick(TRADER, vi); return eq(Number(exp), b.ans) && eq(((b.rev - b.cost) * 100) / b.cost, b.ans) && Number.isInteger(b.ans); }
      const b = pick(RIDDLES, vi);
      if (b.kind === "ticket") {
        const comb = (1 + b.p1 / 100) * (1 + b.p2 / 100);
        return eq(Math.abs(1 - comb) * parseNumber(b.ans), b.diff) && !b.w.includes(b.ans);
      }
      if (b.kind === "sadia") {
        const cut = 1 - 1 / (1 + b.pctMore / 100);
        return eq(cut * 100, parseNumber(b.ans)) && !b.w.includes(b.ans);
      }
      if (b.kind === "shop") {
        const r = (1 + b.profit / 100) / (1 - b.off / 100);
        return eq((r - 1) * 100, parseNumber(b.ans)) && !b.w.includes(b.ans);
      }
      const tot = b.pcts.reduce((v, x) => (v * x) / 100, b.amt);
      return eq(tot, parseNumber(b.ans)) && parseNumber(b.ans) > 0 && !b.w.includes(b.ans);
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
    text = revealed ? "The fan shows each branch of the percentage split." : "Follow the branches — convert, then multiply.";
  } else if (v.type === "pairs") {
    html = pairSvg(v, revealed).replace("</svg>", answer + "</svg>");
    text = revealed ? "The glowing chips show the winning percentage move." : "Compare the chips — per hundred means out of 100.";
  } else if (v.type === "card") {
    html = cardSvg({ title: v.title, expr: v.equation || "", lines: v.note ? [v.note] : [], steps: v.note ? [v.note] : [] }, revealed).replace("</svg>", answer + "</svg>");
    text = revealed ? "The card shows the worked percentage move." : "Plan the move — multiplier up or down?";
  }
  return { html, text };
}

/* ---------------- intro scenes ---------------- */
const INTRO_SCENES = [
  {
    title: "The Percent Paintworks",
    purpose: "Percents, decimals and fractions are the same paint in different tins.",
    classicId: "grid-basics",
    variant: 0,
    caption: "Per hundred — paint the 100-grid.",
    durationMs: 20000,
    voiceover: "Pip's newest station is the Percent Paintworks, where decimals, fractions and percentages are the same paint in different tins. Nought point six means sixty hundredths, so it paints sixty of the hundred squares — sixty per cent. Slide the decimal point two places, scale fractions to a denominator of one hundred, and remember: percentages can sail past one hundred."
  },
  {
    title: "The Amount Mixer",
    purpose: "Percentage of an amount: convert to a decimal and multiply — even past 100%.",
    classicId: "amount-mixer",
    variant: 0,
    caption: "Convert, then multiply.",
    durationMs: 20000,
    voiceover: "A chair drops to seventy per cent of three hundred pounds at the Amount Mixer, so the machine converts and multiplies: nought point seven times three hundred is two hundred and ten. Then the mixer dares to go past one hundred per cent, swaps fifty per cent of two thousand and six with its mirror twin, and hunts the greatest of four mixtures."
  },
  {
    title: "The Rate Reporter",
    purpose: "Express one quantity as a percentage of another; compare rates fairly.",
    classicId: "rate-reporter",
    variant: 0,
    caption: "Value ÷ Total × 100.",
    durationMs: 20000,
    voiceover: "Sandra scores thirty marks out of one hundred and fifty, and the Rate Reporter divides value by total, times one hundred: twenty per cent. Compare two courses the same way — never compare raw counts with different totals. Then blend group rates: forty-eight per cent girls, twenty-five of them by bus, fifty of the boys — imagine a crowd of exactly one hundred."
  },
  {
    title: "The Multiplier Dial",
    purpose: "Increase and decrease with decimal multipliers; measure percentage change.",
    classicId: "change-machine",
    variant: 0,
    caption: "Up past 1, down below 1.",
    durationMs: 20000,
    voiceover: "A television loses thirty per cent of three hundred and fifty pounds, so the Multiplier Dial turns to nought point eight five — one multiplication lands on two hundred and forty-five. Increases dial above one, decreases below. Measure any percentage change against the original value, never the new one, and the dial never lies."
  },
  {
    title: "The Rewind Crane",
    purpose: "Original-value problems: divide by the multiplier, backwards.",
    classicId: "reverse-rescue",
    variant: 0,
    caption: "Divide to rewind.",
    durationMs: 20000,
    voiceover: "Felicity pays forty-two pounds after a thirty per cent discount, so the Rewind Crane divides by nought point seven and lifts the price back to sixty. Rewind increases the same way, unpick a rise-then-fall chain backwards, and dodge the famous trap: one hundred and fifty per cent MORE than means two hundred and fifty per cent OF."
  },
  {
    title: "The Grand Percent Finale",
    purpose: "JMO-style capstones: successive changes, profit and loss pairs, sale riddles.",
    classicId: "percent-capstone",
    variant: 0,
    caption: "Every percent tool fires at once.",
    durationMs: 20000,
    voiceover: "One thousand rats march for the Pied Piper: down ten per cent, up twenty, down thirty — day by day the total reaches three thousand seven hundred and thirty-six. Then two stamps sold at one price, a trader's stall, chained percentages and the famous ticket riddle. Every tool fires at once. Make the Paintworks proud, Operator!"
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
root.PercentagesModule = api;
})(typeof window !== "undefined" ? window : globalThis);
