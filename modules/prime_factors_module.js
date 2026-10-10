/* ============================================================================
   Prime Factors, LCM & HCF — G1 Lesson 6 (Think Academy G1, book pages 83–99)
   Module id: prime_factors
   Six classics, four forms each, 48 variants per classic swept by test sweep.

   Pip storyline continuity: thermometer → counter depot → Flip-O-Matic →
   Power Tower → Law Lab → THE BLOCK FACTORY (primes as building blocks).

   Dialect A contract (same as rational_mult_div / rational_powers /
   laws_arithmetic):
     - problemBase + finishNumeric / finishChoice (finishers self-sync
       answerType/answerMode from the useChoice flag)
     - checkAnswer: choice = exact string vs correctInput.choice ?? expected;
       filled = parseNumber within 1e-8
     - validateProblemMath recomputes every answer from the banks (vi is the
       single source of randomness) and must never return false
     - non-plain-integer answers (prime-product strings, pair labels,
       vocabulary sentences) are ALWAYS choice-mode
     - solutions keep "=" chains plain-integer-verifiable; power strings sit
       behind "→" / "means" so the text-claim audit never chokes on ³⁴⁵
   ========================================================================= */
(function (root) {
  "use strict";

  const CLASSICS = [
    { id: "factor-detective", nickname: "Factor Detective", skill: "Spot factors, multiples and primes — with divisibility shortcuts.", sourcePages: "Book 84-86 / PDF 92-94" },
    { id: "prime-factoriser", nickname: "Prime Factoriser", skill: "Break any number into a product of prime factors with power notation.", sourcePages: "Book 86-87+95 / PDF 94-95+103" },
    { id: "hcf-lab", nickname: "HCF Lab", skill: "Highest common factor from prime factorisations — two or three numbers.", sourcePages: "Book 88-93 / PDF 96-101" },
    { id: "lcm-lab", nickname: "LCM Lab", skill: "Lowest common multiple from prime factorisations — two or three numbers.", sourcePages: "Book 88-93 / PDF 96-101" },
    { id: "word-works", nickname: "Word Works", skill: "Choose HCF or LCM for sharing, tiling, cutting and sync problems.", sourcePages: "Book 90-94+96-97 / PDF 98-102+104-105" },
    { id: "prime-capstone", nickname: "Prime Capstone", skill: "IMC-style puzzles: prime pairs, HCF × LCM = a × b, mystery exponents.", sourcePages: "Book 86+91+98 / PDF 94+99+106" }
  ];
  const CLASSIC_IDS = CLASSICS.map((c) => c.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((c) => [c.id, c]));
  const CLASSIC_SKILLS = Object.fromEntries(CLASSICS.map((c) => [c.id, c.skill]));
  const SOURCE_COVERAGE = {
    module: "prime_factors",
    lesson: "G1 Lesson 6 — Prime Factors/LCM/HCF",
    pages: "PDF 91-107 (book 83-99)",
    covered: [
      "factors & multiples vocabulary + factor pairs (Notes 1, LGR Q3)",
      "prime number facts + spotting with divisibility shortcuts (Notes 2-3, LGR Q1-Q2)",
      "prime factorisation: short division, product notation, expanded form (L&D 87, Expl 2, AC 1)",
      "HCF via prime factorisation, 2 and 3 numbers (L&D 89, Warm Up 88, Expl 3/5, AC 2-4/7-8)",
      "LCM via prime factorisation, 2 and 3 numbers (L&D 89, Warm Up 88, Expl 3/5, AC 2-4/7-8)",
      "word problems: sharing, cutting, tiling (HCF) and alarms, lamps, buses, cookies (LCM)",
      "capstones: Nidah prime pairs, Martin/William HCF-LCM pairs, HCF×LCM = a×b, mystery exponents p,q,r"
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
  function gcdMany(ns) { return ns.reduce((a, b) => gcd(a, b)); }
  function lcm2(a, b) { return (a / gcd(a, b)) * b; }
  function lcmMany(ns) { return ns.reduce((a, b) => lcm2(a, b), 1); }
  function isPrime(n) {
    if (!Number.isInteger(n) || n < 2) return false;
    for (let p = 2; p * p <= n; p++) if (n % p === 0) return false;
    return true;
  }
  function factorList(n) { // prime factors with repetition, ascending
    const out = [];
    let x = n;
    for (let p = 2; p * p <= x; p++) while (x % p === 0) { out.push(p); x /= p; }
    if (x > 1) out.push(x);
    return out;
  }
  function factorMap(n) { // Map prime -> exponent
    const m = new Map();
    for (const p of factorList(n)) m.set(p, (m.get(p) || 0) + 1);
    return m;
  }
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶" };
  function prodStr(n) { // product notation: 300 → "2² × 3 × 5²"
    return [...factorMap(n)].map(([p, e]) => (e === 1 ? String(p) : `${p}${SUP[e]}`)).join(" × ");
  }
  function expandedStr(n) { // expanded form: 300 → "2 × 2 × 3 × 5 × 5"
    return factorList(n).join(" × ");
  }
  function factorCount(n) { // number of positive factors
    let c = 0;
    for (let d = 1; d * d <= n; d++) if (n % d === 0) c += d * d === n ? 1 : 2;
    return c;
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
  // Choice-mode string answer (product notation, pairs, vocabulary sentences…).
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
  // Split fan: one top box splits arrows into branch boxes below (factorisation).
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
    const note = revealed && v.note ? v.note : "every branch must be PRIME before the slide stops";
    s += `<text x="280" y="296" text-anchor="middle" font-size="14" font-weight="${revealed ? "bold" : "normal"}" fill="${revealed ? TEAL : "#4a5578"}">${escapeHtml(note)}</text>`;
    return svgShell(s);
  }
  // Number chips row; the paired (or guilty) ones glow with a brace.
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
      s += `<text x="${(x1 + x2) / 2}" y="${y + ch + 48}" text-anchor="middle" font-size="15" font-weight="bold" fill="${AMBER}">${escapeHtml(revealed ? v.pairNote || "" : "look here!")}</text>`;
    }
    const note = revealed && v.note ? v.note : "test each chip with the divisibility shortcuts";
    s += `<text x="280" y="290" text-anchor="middle" font-size="14" font-weight="${revealed ? "bold" : "normal"}" fill="${revealed ? TEAL : "#4a5578"}">${escapeHtml(note)}</text>`;
    return svgShell(s);
  }

// ---------------------------------------------------------------------------
// Classic 1: Factor Detective
// ---------------------------------------------------------------------------
// form0: which is NOT prime — [composite, prime, prime, prime]
const SPOT0 = [
  { opts: [87, 97, 43, 59], cfac: "3 × 29" },
  { opts: [57, 101, 67, 89], cfac: "3 × 19" },
  { opts: [91, 13, 47, 71], cfac: "7 × 13" },
  { opts: [119, 31, 53, 97], cfac: "7 × 17" },
  { opts: [51, 17, 23, 89], cfac: "3 × 17" },
  { opts: [143, 19, 43, 61], cfac: "11 × 13" },
  { opts: [77, 37, 13, 67], cfac: "7 × 11" },
  { opts: [95, 29, 53, 71], cfac: "5 × 19" },
  { opts: [111, 11, 31, 101], cfac: "3 × 37" },
  { opts: [133, 7, 89, 61], cfac: "7 × 19" },
];
// form1: which IS a multiple of k
const MULT_BANKS = [
  { k: 6, mult: 42, nons: [3, 28, 80] },
  { k: 9, mult: 63, nons: [35, 29, 100] },
  { k: 4, mult: 36, nons: [18, 22, 30] },
  { k: 7, mult: 56, nons: [20, 30, 48] },
  { k: 8, mult: 96, nons: [42, 52, 60] },
  { k: 12, mult: 84, nons: [40, 56, 70] },
  { k: 15, mult: 90, nons: [25, 42, 56] },
  { k: 11, mult: 121, nons: [45, 68, 90] },
];
// form2: how many factors does n have?
const FACTOR_COUNT_BANKS = [
  { n: 200, pairs: "1 × 200, 2 × 100, 4 × 50, 5 × 40, 8 × 25, 10 × 20" },
  { n: 12, pairs: "1 × 12, 2 × 6, 3 × 4" },
  { n: 28, pairs: "1 × 28, 2 × 14, 4 × 7" },
  { n: 45, pairs: "1 × 45, 3 × 15, 5 × 9" },
  { n: 36, pairs: "1 × 36, 2 × 18, 3 × 12, 4 × 9, 6 × 6" },
  { n: 64, pairs: "1 × 64, 2 × 32, 4 × 16, 8 × 8" },
  { n: 100, pairs: "1 × 100, 2 × 50, 4 × 25, 5 × 20, 10 × 10" },
  { n: 72, pairs: "1 × 72, 2 × 36, 3 × 24, 4 × 18, 6 × 12, 8 × 9" },
  { n: 96, pairs: "1 × 96, 2 × 48, 3 × 32, 4 × 24, 6 × 16, 8 × 12" },
  { n: 60, pairs: "1 × 60, 2 × 30, 3 × 20, 4 × 15, 5 × 12, 6 × 10" },
  { n: 48, pairs: "1 × 48, 2 × 24, 3 × 16, 4 × 12, 6 × 8" },
  { n: 90, pairs: "1 × 90, 2 × 45, 3 × 30, 5 × 18, 6 × 15, 9 × 10" },
];
// form3: vocabulary true-statement
const VOCAB = [
  { correct: "1 is not a prime number — it has only one factor", wrongs: ["1 is the smallest prime number", "2 is not prime because it is even", "Every odd number is prime"] },
  { correct: "2 is the only even prime number", wrongs: ["Even numbers are never prime", "2 is not prime because it is too small", "The only even prime is 12"] },
  { correct: "A prime number has exactly two factors", wrongs: ["A prime number has exactly one factor", "Prime numbers always have three factors", "Prime numbers have no factors"] },
  { correct: "Every multiple of 6 is also a multiple of 3", wrongs: ["Every multiple of 3 is a multiple of 6", "Multiples of 6 are never multiples of 3", "3 is a multiple of 6"] },
  { correct: "The factors of 12 are 1, 2, 3, 4, 6 and 12", wrongs: ["The factors of 12 are 2, 3, 4 and 6", "12 is a factor of 6", "The factors of 12 are 1, 2, 3, 4, 5 and 12"] },
  { correct: "Except for 2 and 5, all prime numbers end in 1, 3, 7 or 9", wrongs: ["All numbers ending in 1, 3, 7 or 9 are prime", "Prime numbers can end in 4", "Most prime numbers end in 5"] },
  { correct: "A factor of a number divides it exactly, leaving no remainder", wrongs: ["A factor always leaves a remainder of 1", "Factors of a number come in threes", "A factor multiplies the number to make it bigger"] },
  { correct: "There is no pattern in the series of prime numbers", wrongs: ["Primes follow a simple adding pattern", "Every fourth number is prime", "Prime numbers are always odd"] },
];

function classicFactorDetective(form, vi) {
  if (form === 0) {
    const bank = pick(SPOT0, vi);
    const comp = bank.opts[0];
    const p = problemBase("factor-detective", vi, "integer");
    finishNumeric(p, comp, bank.opts.slice(1), [2, 4, 9], vi % 2 === 0, vi);
    p.prompt = `Impostor at the Block Factory! One of these numbers is NOT prime: ${bank.opts.join(", ")}. Which one?`;
    p.hint1 = "Cross out anything ending in 0, 2, 4, 6, 8 or 5 first — then test 3, 7, 11…";
    p.hint2 = `Digit sums betray multiples of 3. One of these splits as ${bank.cfac}.`;
    p.solution = `${comp} = ${bank.cfac} — it fails a divisibility test, so it is NOT prime. The others survive: no prime up to their square root divides them. A prime has exactly two factors; ${comp} has more.`;
    p.visual = { type: "pairs", title: "Suspect line-up", chips: bank.opts.map(String), pair: [0], accent: CORAL, note: `${comp} splits as ${bank.cfac} — impostor!` };
    return p;
  }
  if (form === 1) {
    const bank = pick(MULT_BANKS, vi);
    const p = problemBase("factor-detective", vi, "integer");
    finishNumeric(p, bank.mult, bank.nons, [bank.k * 2, bank.k, bank.k * 10], vi % 2 === 1, vi);
    p.prompt = `Times-table scanner: which of these is a multiple of ${bank.k}: ${bank.nons[0]}, ${bank.mult}, ${bank.nons[1]} or ${bank.nons[2]}?`;
    p.hint1 = `A multiple of ${bank.k} divides by ${bank.k} with NO remainder.`;
    p.hint2 = `Try each: ${bank.mult} ÷ ${bank.k} comes out exactly.`;
    p.solution = `${bank.mult} ÷ ${bank.k} = ${bank.mult / bank.k} — a whole-number quotient, so ${bank.mult} sits in the ${bank.k} times table. ${bank.nons.map((n) => `${n} ÷ ${bank.k} leaves a remainder`).join("; ")}.`;
    p.visual = { type: "pairs", title: "Scanner", chips: [bank.nons[0], bank.mult, bank.nons[1], bank.nons[2]].map(String), pair: [1], accent: TEAL, note: `${bank.mult} = ${bank.k} × ${bank.mult / bank.k}` };
    return p;
  }
  if (form === 2) {
    const bank = pick(FACTOR_COUNT_BANKS, vi);
    const count = factorCount(bank.n);
    const p = problemBase("factor-detective", vi, "integer");
    finishNumeric(p, count, [count + 1, count - 1, count + 2], [count - 2, count * 2, count + 4], vi % 2 === 0, vi);
    p.prompt = `Factor census: write down ALL the factors of ${bank.n} — how many are there?`;
    p.hint1 = "Hunt in pairs: if d is a factor, so is n ÷ d. Stop when the pairs meet in the middle.";
    p.hint2 = `Start: ${bank.pairs.split(", ").slice(0, 2).join(", ")} …`;
    p.solution = `Pair them up: ${bank.pairs}. That is ${count} factors — a repeated pair like 6 × 6 only counts once. ${bank.n} has ${count} factors.`;
    p.visual = { type: "card", title: "Factor census", equation: `factors of ${bank.n}`, badge: "COUNT", accent: TEAL, note: "Pair small with large until the pairs meet." };
    return p;
  }
  const bank = pick(VOCAB, vi);
  const p = problemBase("factor-detective", vi, "choice");
  finishChoice(p, bank.correct, bank.wrongs, ["1 is prime", "9 is prime", "Multiples are smaller than factors"], vi);
  p.prompt = "Factory rulebook: which statement is TRUE?";
  p.hint1 = "Primes have exactly two factors — and 1 has only one.";
  p.hint2 = "Check each statement against the definitions of factor, multiple and prime.";
  p.solution = `True: "${bank.correct}". The others break the definitions — a prime needs exactly two factors (so 1 is out), factors divide exactly, and multiples grow bigger, not smaller.`;
  p.visual = { type: "card", title: "Rulebook", equation: "factor · multiple · prime", badge: "TRUE?", accent: PURPLE, note: "Definitions first, shortcuts second." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 2: Prime Factoriser
// ---------------------------------------------------------------------------
const FACTORISE0 = [300, 28, 75, 378, 420, 1620, 10000, 90, 120, 48, 60, 72, 96, 144, 180, 360];
// form1: power notation → expanded form
const EXPAND_BANKS = [
  { pow: "2² × 3²", factors: [2, 2, 3, 3] },
  { pow: "2² × 5²", factors: [2, 2, 5, 5] },
  { pow: "2³ × 3", factors: [2, 2, 2, 3] },
  { pow: "3² × 5", factors: [3, 3, 5] },
  { pow: "2 × 3² × 5", factors: [2, 3, 3, 5] },
  { pow: "2² × 3 × 5", factors: [2, 2, 3, 5] },
  { pow: "3³ × 2", factors: [3, 3, 3, 2] },
  { pow: "5² × 7", factors: [5, 5, 7] },
];
// form2: value of a product-notation string
const VALUE_BANKS = [
  { str: "2³ × 3 × 5²", factors: [2, 2, 2, 3, 5, 5] },
  { str: "2² × 3² × 7", factors: [2, 2, 3, 3, 7] },
  { str: "2 × 3² × 5²", factors: [2, 3, 3, 5, 5] },
  { str: "2⁴ × 3", factors: [2, 2, 2, 2, 3] },
  { str: "2² × 5²", factors: [2, 2, 5, 5] },
  { str: "2 × 3 × 5³", factors: [2, 3, 5, 5, 5] },
  { str: "3² × 5 × 7", factors: [3, 3, 5, 7] },
  { str: "2² × 3³", factors: [2, 2, 3, 3, 3] },
  { str: "2⁵ × 3", factors: [2, 2, 2, 2, 2, 3] },
  { str: "3 × 5 × 7²", factors: [3, 5, 7, 7] },
];
// form3: missing exponent — n = base^letter × restStr
const MISSING_EXP = [
  { n: 360, base: 2, restStr: "3² × 5", restVal: 45, ans: 3, letter: "a" },
  { n: 108, base: 3, restStr: "2²", restVal: 4, ans: 3, letter: "b" },
  { n: 600, base: 2, restStr: "3 × 5²", restVal: 75, ans: 3, letter: "a" },
  { n: 1350, base: 3, restStr: "2 × 5²", restVal: 50, ans: 3, letter: "b" },
  { n: 392, base: 2, restStr: "7²", restVal: 49, ans: 3, letter: "c" },
  { n: 1200, base: 2, restStr: "3 × 5²", restVal: 75, ans: 4, letter: "a" },
  { n: 972, base: 3, restStr: "2²", restVal: 4, ans: 5, letter: "b" },
  { n: 720, base: 2, restStr: "3² × 5", restVal: 45, ans: 4, letter: "a" },
];
const SUP_LETTER = { a: "ᵃ", b: "ᵇ", c: "ᶜ" };

// Wrong product-notation strings for n: bump/remove prime powers (values differ from n).
function notationWrongs(n) {
  const fl = factorList(n);
  const uniq = [...new Set(fl)];
  const out = [];
  const w1 = [...fl, uniq[0]]; // one extra copy of the smallest prime
  const w2 = fl.slice(0, -1); // drop one copy of the largest prime
  const w3 = fl.filter((x) => x !== uniq[uniq.length - 1]); // drop the largest prime entirely
  for (const lst of [w1, w2, w3]) {
    if (!lst.length) continue;
    out.push(lst.reduce((a, b) => a * b, 1));
  }
  return out.filter((v) => v !== n).map((v) => prodStr(v));
}
function groupValues(factors) { // [2,2,2,3,5,5] → ["2³ → 8", "3 → 3", "5² → 25"], [8,3,25]
  const m = new Map();
  for (const f of factors) m.set(f, (m.get(f) || 0) + 1);
  const notes = [];
  const vals = [];
  for (const [p, e] of m) {
    const v = Math.pow(p, e);
    notes.push(e === 1 ? `${p} → ${v}` : `${p}${SUP[e]} → ${v}`);
    vals.push(v);
  }
  return [notes, vals];
}

function classicPrimeFactoriser(form, vi) {
  if (form === 0) {
    const n = pick(FACTORISE0, vi);
    const correct = prodStr(n);
    const p = problemBase("prime-factoriser", vi, "choice");
    finishChoice(p, correct, notationWrongs(n), ["2 × 3 × 5", "2² × 3²", "3 × 5 × 7"], vi);
    const divisors = factorList(n);
    p.prompt = `Feed ${n} into the short-division slide. Which is its prime factorisation in product notation?`;
    p.hint1 = "Divide by the smallest prime that fits, again and again, until 1 remains.";
    p.hint2 = `The slide divides ${n} by ${divisors.slice(0, 3).join(", then ")} …`;
    p.solution = `Short division by ${divisors.join(", ")} leaves 1 — collect the divisors: ${n} → ${correct}. Every number has exactly ONE prime fingerprint; that is the unique factorisation property.`;
    const groups = [...factorMap(n)].map(([pr, e]) => (e === 1 ? String(pr) : `${pr}${SUP[e]}`));
    p.visual = { type: "fan", title: "Short-division slide", top: String(n), branches: groups.slice(0, 3), results: groups.slice(0, 3).map((g, i) => `copy ${i + 1} ✓`), accent: AMBER, note: `Divisors: ${divisors.join(" · ")}` };
    return p;
  }
  if (form === 1) {
    const bank = pick(EXPAND_BANKS, vi);
    const correct = bank.factors.join(" × ");
    const val = bank.factors.reduce((a, b) => a * b, 1);
    const w1 = bank.factors.slice(0, -1).join(" × ");
    const w2 = [...bank.factors, bank.factors[0]].join(" × ");
    const w3 = [bank.factors[0], ...bank.factors.slice(1), bank.factors[bank.factors.length - 1]].join(" × ");
    const p = problemBase("prime-factoriser", vi, "choice");
    finishChoice(p, correct, [w1, w2, w3], ["2 × 3 × 5", "2 × 2 × 2 × 2", "3 × 3 × 3 × 3"], vi);
    p.prompt = `The stamp reads ${bank.pow}. Write it in EXPANDED form — every copy spelled out.`;
    p.hint1 = "The little power number counts the copies of its base.";
    p.hint2 = `${bank.pow.split(" × ")[0]} contributes ${bank.factors.filter((f) => f === bank.factors[0]).length} copies of ${bank.factors[0]}.`;
    p.solution = `${bank.pow} means ${correct} — the power counts the copies. Multiply it back out: ${correct} = ${val}.`;
    p.visual = { type: "card", title: "Expanded form", equation: bank.pow, badge: "SPELL IT", accent: TEAL, note: "A power is just a copy counter." };
    return p;
  }
  if (form === 2) {
    const bank = pick(VALUE_BANKS, vi);
    const val = bank.factors.reduce((a, b) => a * b, 1);
    const p = problemBase("prime-factoriser", vi, "integer");
    finishNumeric(p, val, [val + 10, val - 10, val * 2], [val / 2, val + 100, val - 2], vi % 2 === 0, vi);
    p.prompt = `Stamp value check: what number is ${bank.str}?`;
    p.hint1 = "Evaluate each prime-power stamp first, then multiply the group values.";
    const [notes, vals] = groupValues(bank.factors);
    p.hint2 = notes.join(", ") + ".";
    p.solution = `${notes.join(", ")} — multiply: ${vals.join(" × ")} = ${val}. So ${bank.str} → ${val}.`;
    p.visual = { type: "fan", title: "Stamp value", top: bank.str, branches: notes.slice(0, 3), results: vals.slice(0, 3).map(String), accent: CORAL, note: "Evaluate each stamp, then multiply." };
    return p;
  }
  const bank = pick(MISSING_EXP, vi);
  const p = problemBase("prime-factoriser", vi, "integer");
  finishNumeric(p, bank.ans, [bank.ans + 1, bank.ans - 1, bank.ans + 2], [1, 5, 6], vi % 2 === 1, vi);
  p.prompt = `Mystery exponent: ${bank.n} → ${bank.base}${SUP_LETTER[bank.letter]} × ${bank.restStr}. What is the value of ${bank.letter}?`;
  p.hint1 = `Divide ${bank.n} by the known part ${bank.restStr}.`;
  p.hint2 = `${bank.n} ÷ ${bank.restVal} = ${bank.n / bank.restVal} — how many ${bank.base}s make that?`;
  p.solution = `${bank.restStr} → ${bank.restVal}, and ${bank.n} ÷ ${bank.restVal} = ${bank.n / bank.restVal}. Now ${bank.n / bank.restVal} → ${bank.base}^${bank.ans} — so ${bank.letter} = ${bank.ans}.`;
  p.visual = { type: "card", title: "Mystery exponent", equation: `${bank.n} = ${bank.base}? × ${bank.restStr}`, badge: "FIND IT", accent: PURPLE, note: "Divide out the known part, count the copies left." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 3: HCF Lab
// ---------------------------------------------------------------------------
const HCF2 = [
  [90, 120], [75, 105], [26, 39], [45, 110], [14, 28], [5, 9],
  [70, 84], [52, 78], [17, 34], [7, 8], [42, 54], [48, 60],
];
const HCF_POW = [
  { xs: "2² × 3² × 7", ys: "2 × 3² × 5²", xv: 252, yv: 450 },
  { xs: "2⁴ × 5 × 7", ys: "2² × 5² × 7", xv: 560, yv: 700 },
  { xs: "2² × 5²", ys: "2 × 3 × 5³", xv: 100, yv: 750 },
  { xs: "2² × 3²", ys: "2⁴ × 3", xv: 36, yv: 48 },
  { xs: "2³ × 3 × 5", ys: "2² × 3²", xv: 120, yv: 36 },
  { xs: "2 × 3² × 5", ys: "2² × 3 × 7", xv: 90, yv: 84 },
  { xs: "3² × 5²", ys: "2 × 3 × 5²", xv: 225, yv: 150 },
  { xs: "2² × 3 × 5", ys: "2 × 3² × 5", xv: 60, yv: 90 },
];
const HCF3 = [
  [462, 147, 56], [32, 152, 600], [36, 54, 90], [24, 60, 84],
  [42, 70, 98], [18, 27, 45], [20, 50, 90], [40, 72, 88],
];
const HCF_WORD = [
  { story: "72 pears and 54 oranges are shared among children so every child gets the same number of pears and the same number of oranges. At most how many children?", nums: [72, 54], unit: "children" },
  { story: "60 sandwiches and 75 burgers are shared among several people so each person gets the same of each. At most how many people?", nums: [60, 75], unit: "people" },
  { story: "Wooden sticks of 54 cm, 63 cm and 144 cm are cut into pieces of equal length with no surplus. What is the longest possible piece?", nums: [54, 63, 144], unit: "cm" },
  { story: "Marta has 42 apples, 60 apricots and 90 cherries to divide into identical piles using all the fruit. What is the largest number of piles?", nums: [42, 60, 90], unit: "piles" },
  { story: "96 cookies and 84 brownies are packed into identical gift bags using everything. At most how many bags?", nums: [96, 84], unit: "bags" },
  { story: "105 pencils and 75 erasers are packed into identical stationery sets. At most how many sets?", nums: [105, 75], unit: "sets" },
  { story: "84 roses and 126 tulips are arranged into identical bouquets with none left over. At most how many bouquets?", nums: [84, 126], unit: "bouquets" },
  { story: "Ribbons of 36 m, 60 m and 72 m are cut into equal-length pieces with no waste. What is the longest possible piece?", nums: [36, 60, 72], unit: "m" },
];

function commonFactorChain(a, b) { // shared prime factors with multiplicity: "2 × 3 × 5"
  const fa = factorList(a);
  const fb = factorList(b);
  const common = [];
  const used = fb.slice();
  for (const f of fa) {
    const i = used.indexOf(f);
    if (i >= 0) { common.push(f); used.splice(i, 1); }
  }
  return common;
}

function classicHcfLab(form, vi) {
  if (form === 0) {
    const [a, b] = pick(HCF2, vi);
    const h = gcd(a, b);
    const common = commonFactorChain(a, b);
    const p = problemBase("hcf-lab", vi, "integer");
    finishNumeric(p, h, [a, b, h * 2], [gcd(a, b) + 1, Math.min(a, b), h + 2], vi % 2 === 0, vi);
    p.prompt = `Magnet chamber: find the highest common factor (HCF) of ${a} and ${b}.`;
    p.hint1 = "Unpack both numbers into prime factors, then multiply only the factors they SHARE.";
    p.hint2 = `${a} → ${expandedStr(a)}; ${b} → ${expandedStr(b)}.`;
    p.solution = common.length
      ? `${a} → ${expandedStr(a)} and ${b} → ${expandedStr(b)}. Shared factors: ${common.join(", ")} — multiply them: ${common.join(" × ")} = ${h}.`
      : `${a} → ${expandedStr(a)} and ${b} → ${expandedStr(b)}. No shared prime factors at all — the HCF is 1.`;
    p.visual = { type: "fan", title: "HCF magnet", top: `${a} & ${b}`, branches: [expandedStr(a), expandedStr(b)].slice(0, 2), results: [common.length ? common.join(" × ") : "none", `HCF → ${h}`].slice(0, 2), accent: TEAL, note: "The magnet lifts only the factors BOTH lists share." };
    return p;
  }
  if (form === 1) {
    const bank = pick(HCF_POW, vi);
    const h = gcd(bank.xv, bank.yv);
    const p = problemBase("hcf-lab", vi, "integer");
    finishNumeric(p, h, [h * 2, h + 1, bank.xv], [h * 3, h + 2, bank.yv], vi % 2 === 0, vi);
    p.prompt = `Stamp room: X = ${bank.xs} and Y = ${bank.ys}. Find the HCF of X and Y.`;
    p.hint1 = "Only primes present in BOTH stamps count — take the SMALLER power of each.";
    const shared = [...factorMap(h)].map(([pr, e]) => (e === 1 ? String(pr) : `${pr}${SUP[e]}`)).join(" × ");
    p.hint2 = `Shared primes with smaller powers: ${shared || "none"}.`;
    p.solution = `Shared primes only, smaller power wins: ${shared}. So ${shared} = ${h} → HCF is ${h}. The unshared stamps (and bigger powers) stay on the shelf.`;
    p.visual = { type: "card", title: "Stamp room", equation: `X = ${bank.xs}   Y = ${bank.ys}`, badge: "HCF", accent: CORAL, note: "Shared primes, smaller powers." };
    return p;
  }
  if (form === 2) {
    const [a, b, c] = pick(HCF3, vi);
    const h = gcdMany([a, b, c]);
    const p = problemBase("hcf-lab", vi, "integer");
    finishNumeric(p, h, [h * 2, gcd(a, b), h + 1], [h * 3, gcd(a, c), h + 2], vi % 2 === 0, vi);
    p.prompt = `Triple magnet: find the HCF of ${a}, ${b} and ${c}.`;
    p.hint1 = "A factor must appear in ALL THREE prime lists to be lifted.";
    p.hint2 = `${a} → ${expandedStr(a)}; ${b} → ${expandedStr(b)}; ${c} → ${expandedStr(c)}.`;
    const common = commonFactorChain(gcd(a, b), c);
    p.solution = `${a} → ${expandedStr(a)}; ${b} → ${expandedStr(b)}; ${c} → ${expandedStr(c)}. Common to all three: ${common.join(", ")} → ${common.join(" × ")} = ${h}. A factor of only two lists does not count!`;
    p.visual = { type: "card", title: "Triple magnet", equation: `${a} , ${b} , ${c}`, badge: "HCF ×3", accent: PURPLE, note: "All three lists must share it." };
    return p;
  }
  const bank = pick(HCF_WORD, vi);
  const h = gcdMany(bank.nums);
  const p = problemBase("hcf-lab", vi, "integer");
  finishNumeric(p, h, [h * 2, h + 1, bank.nums[0]], [h - 1, h * 3, bank.nums[1] || bank.nums[0]], vi % 2 === 1, vi);
  p.prompt = bank.story;
  p.hint1 = `Splitting INTO equal groups with nothing left over → find the HCF of ${bank.nums.join(" and ")}.`;
  p.hint2 = `${bank.nums.map((n) => `${n} → ${expandedStr(n)}`).join("; ")}.`;
  const each = bank.nums[0] / h;
  p.solution = `${bank.nums.map((n) => `${n} → ${expandedStr(n)}`).join("; ")}. Shared factors multiply to ${h} — the biggest equal split. Answer: ${h} ${bank.unit} (each gets ${each} of the first item).`;
  p.visual = { type: "card", title: "Sharing ceremony", equation: bank.nums.join(" , "), badge: "HCF", accent: AMBER, note: "Equal groups, nothing left over → HCF." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 4: LCM Lab
// ---------------------------------------------------------------------------
// form0: LCM of two numbers (book: L&D2 48 & 60 first)
const LCM2 = [
  [48, 60], [6, 18], [42, 54], [26, 39], [45, 110], [14, 28], [5, 9], [70, 84],
  [52, 78], [17, 34], [7, 8], [12, 18], [9, 15], [8, 12], [15, 20], [21, 28],
];
// form1: LCM from prime-power stamps (same book pairs as the HCF stamp room)
// form2: LCM of three numbers — book Notes 4: take any two first, then the third
const LCM3 = [
  [12, 20, 8], [6, 8, 15], [4, 6, 9], [10, 15, 25], [6, 9, 12],
  [14, 21, 28], [8, 12, 18], [9, 12, 15], [10, 12, 15], [4, 10, 15],
];
// form3: sync stories — alarms, lighthouses, buses, grandma's cookies…
const LCM_WORD = [
  { story: "Two alarms beep every 6 minutes and every 8 minutes. They beep together at 7:30. In how many minutes do they next beep together?", nums: [6, 8], unit: "minutes" },
  { story: "Two lighthouses flash every 36 seconds and every 30 seconds. They flash together at 08:00. After how many seconds do they next flash together?", nums: [36, 30], unit: "seconds" },
  { story: "Three lamps blink every 36 s, 45 s and 120 s. They blink together now. In how many seconds do all three next blink together?", nums: [36, 45, 120], unit: "seconds" },
  { story: "Three buses leave the station every 12, 20 and 8 minutes. They all leave together at 07:05. In how many minutes do they next all leave together?", nums: [12, 20, 8], unit: "minutes" },
  { story: "Grandma bakes cookies that can be shared equally among 2, 3, 5 or 6 grandchildren. What is the smallest number of cookies she could have baked?", nums: [2, 3, 5, 6], unit: "cookies" },
  { story: "Four bus routes depart every 6, 8, 12 and 15 minutes. They all depart together at 08:30. In how many minutes do they next all depart together?", nums: [6, 8, 12, 15], unit: "minutes" },
  { story: "Hot dogs come in packs of 8 and buns in packs of 10. What is the smallest number of hot dogs you can buy to have exactly matching buns?", nums: [8, 10], unit: "hot dogs" },
  { story: "Two gears click every 16 teeth and every 24 teeth. They clicked together just now. After how many clicks of the first gear do they next click together?", nums: [16, 24], unit: "clicks" },
];

function classicLcmLab(form, vi) {
  if (form === 0) {
    const [a, b] = pick(LCM2, vi);
    const l = lcm2(a, b);
    const p = problemBase("lcm-lab", vi, "integer");
    finishNumeric(p, l, [a * b, l * 2, Math.max(a, b)], [Math.round(l / 2), l + 2, a + b], vi % 2 === 0, vi);
    p.prompt = `Beacon chamber: find the lowest common multiple (LCM) of ${a} and ${b}.`;
    p.hint1 = "Unpack both numbers into prime factors, then take EVERY prime — the biggest stack of each.";
    p.hint2 = `${a} → ${expandedStr(a)}; ${b} → ${expandedStr(b)}.`;
    p.solution = `${a} → ${expandedStr(a)} and ${b} → ${expandedStr(b)}. Every prime, biggest stack: ${expandedStr(l)} = ${l}. Multiples of ${a}: ${a}, ${a * 2}, ${a * 3} … the first one ${b} also divides is ${l}.`;
    p.visual = { type: "fan", title: "LCM beacon", top: `${a} & ${b}`, branches: [expandedStr(a), expandedStr(b)].slice(0, 2), results: [`LCM → ${prodStr(l)}`, `= ${l}`].slice(0, 2), accent: PURPLE, note: "Every prime from both lists, biggest stack of each." };
    return p;
  }
  if (form === 1) {
    const bank = pick(HCF_POW, vi); // same stamp pairs, different question
    const l = lcm2(bank.xv, bank.yv);
    const p = problemBase("lcm-lab", vi, "integer");
    finishNumeric(p, l, [l * 2, gcd(bank.xv, bank.yv), Math.max(bank.xv, bank.yv)], [l + 10, Math.round(l / 2), l - 5], vi % 2 === 0, vi);
    p.prompt = `Stamp room: X = ${bank.xs} and Y = ${bank.ys}. Find the LCM of X and Y.`;
    p.hint1 = "For the LCM take EVERY prime that appears in either stamp — the BIGGER power of each.";
    const all = [...factorMap(l)].map(([pr, e]) => (e === 1 ? String(pr) : `${pr}${SUP[e]}`)).join(" × ");
    p.hint2 = `Collect every prime from both stamps: ${all}.`;
    p.solution = `Every prime, bigger power wins: ${all}. So ${all} → ${l} → LCM is ${l}. (Check: HCF × LCM = X × Y → ${gcd(bank.xv, bank.yv)} × ${l} = ${gcd(bank.xv, bank.yv) * l}.)`;
    p.visual = { type: "card", title: "Stamp room", equation: `X = ${bank.xs}   Y = ${bank.ys}`, badge: "LCM", accent: PURPLE, note: "Every prime, bigger powers." };
    return p;
  }
  if (form === 2) {
    const [a, b, c] = pick(LCM3, vi);
    const l1 = lcm2(a, b);
    const ans = lcm2(l1, c);
    const p = problemBase("lcm-lab", vi, "integer");
    finishNumeric(p, ans, [ans * 2, l1, a + b + c], [ans + 1, ans - 1, ans + 2], vi % 2 === 0, vi);
    p.prompt = `Triple beacon: find the LCM of ${a}, ${b} and ${c}.`;
    p.hint1 = "Sneaky shortcut from the notes: find the LCM of any TWO first, then find the LCM of that answer with the third.";
    p.hint2 = `LCM of ${a} and ${b} → ${l1}.`;
    p.solution = `LCM of first two: ${a} → ${expandedStr(a)}, ${b} → ${expandedStr(b)}, biggest stacks give ${l1}. Then the LCM of ${l1} and ${c} is ${ans}. Check: ${ans} ÷ ${a} = ${ans / a} and ${ans} ÷ ${b} = ${ans / b} and ${ans} ÷ ${c} = ${ans / c} — all divide exactly.`;
    p.visual = { type: "fan", title: "Triple beacon", top: `${a}, ${b}, ${c}`, branches: [`${a} & ${b} → ${l1}`, `${l1} & ${c} → ${ans}`, "done"].slice(0, 3), results: ["step 1 ✓", "step 2 ✓", `${ans}`].slice(0, 3), accent: TEAL, note: "Two at a time — the LCM chain." };
    return p;
  }
  const bank = pick(LCM_WORD, vi);
  const ans = lcmMany(bank.nums);
  const p = problemBase("lcm-lab", vi, "integer");
  finishNumeric(p, ans, [ans * 2, ans + bank.nums[0], Math.max(...bank.nums)], [ans - 1, ans + 3, Math.round(ans / 2)], vi % 2 === 1, vi);
  p.prompt = bank.story;
  p.hint1 = "Repeating events meet at common MULTIPLES — the next meeting is the LCM of the intervals.";
  p.hint2 = `${bank.nums.map((n) => `${n} → ${expandedStr(n)}`).join("; ")}. Every prime, biggest stack.`;
  p.solution = `${bank.nums.map((n) => `${n} → ${expandedStr(n)}`).join("; ")}. Biggest stacks multiply to ${ans} — the next sync. Answer: ${ans} ${bank.unit}.`;
  p.visual = { type: "card", title: "Sync beacon", equation: bank.nums.join(" , "), badge: "LCM", accent: AMBER, note: "Repeating events meet at the LCM." };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 5: Word Works — HCF or LCM? pick the tool, then use it
// ---------------------------------------------------------------------------
// form0: which tool does this job?
const TOOL_BANKS = [
  { scenario: "72 pears and 54 oranges shared equally among as many children as possible", correct: "HCF — split into equal groups" },
  { scenario: "Two alarms beeping every 6 and 8 minutes — when do they next beep together?", correct: "LCM — sync repeating events" },
  { scenario: "Cutting sticks of 54 cm, 63 cm and 144 cm into the longest equal pieces", correct: "HCF — split into equal groups" },
  { scenario: "Hot dogs in packs of 8, buns in packs of 10 — smallest matching purchase", correct: "LCM — sync repeating events" },
  { scenario: "Packing 96 cookies and 84 brownies into identical gift bags", correct: "HCF — split into equal groups" },
  { scenario: "Three buses leaving every 12, 20 and 8 minutes — next departure all together", correct: "LCM — sync repeating events" },
  { scenario: "Covering a 72 cm by 54 cm floor with the largest possible square tiles", correct: "HCF — split into equal groups" },
  { scenario: "Cookies that can be shared equally among 2, 3, 5 or 6 grandchildren", correct: "LCM — sync repeating events" },
];
// form1: per-share after the HCF split — answer is nums[0] / HCF
const PER_SHARE = [
  { nums: [72, 54], item: "pears", other: "oranges" },
  { nums: [75, 60], item: "burgers", other: "sandwiches" },
  { nums: [96, 84], item: "cookies", other: "brownies" },
  { nums: [105, 75], item: "pencils", other: "erasers" },
  { nums: [84, 126], item: "roses", other: "tulips" },
  { nums: [48, 80], item: "grapes", other: "cherries" },
  { nums: [90, 120], item: "marbles", other: "beads" },
  { nums: [36, 60], item: "stickers", other: "stamps" },
];
// form2: largest square tile for an l × w floor
const TILE = [
  [72, 54], [96, 60], [105, 75], [84, 126], [48, 80], [90, 120], [36, 84], [56, 98],
];
// form3: how many syncs inside a time window
const SYNC_COUNT = [
  { story: "Three lamps blink together every LCM of 36 s, 45 s and 120 s. How many times do they blink together in one hour (3600 s), counting only after the start?", intervals: [36, 45, 120], window: 3600, countStart: false, unit: "seconds" },
  { story: "Three buses all leave together at 07:05, then every 12, 20 and 8 minutes. How many times do they all leave together before 12:00 (a 295-minute window), counting the 07:05 departure?", intervals: [12, 20, 8], window: 295, countStart: true, unit: "minutes" },
  { story: "Two alarms beep together every LCM of 6 and 8 minutes. How many times do they beep together in one hour (60 minutes), not counting the start?", intervals: [6, 8], window: 60, countStart: false, unit: "minutes" },
  { story: "Two lighthouses flash together every LCM of 36 and 30 seconds. How many times do they flash together in 600 seconds, not counting the start?", intervals: [36, 30], window: 600, countStart: false, unit: "seconds" },
  { story: "Four routes depart together at 08:30, then every 6, 8, 12 and 15 minutes. How many times do they all depart together in the next 240 minutes, counting the 08:30 departure?", intervals: [6, 8, 12, 15], window: 240, countStart: true, unit: "minutes" },
  { story: "Two gears click together every LCM of 16 and 24 clicks. How many times do they click together in 200 clicks, not counting the start?", intervals: [16, 24], window: 200, countStart: false, unit: "clicks" },
  { story: "Two metronomes tick together every LCM of 9 and 12 seconds. How many times do they tick together in 120 seconds, not counting the start?", intervals: [9, 12], window: 120, countStart: false, unit: "seconds" },
  { story: "Two sprinklers spray together every LCM of 15 and 25 seconds. How many times do they spray together in 300 seconds, not counting the start?", intervals: [15, 25], window: 300, countStart: false, unit: "seconds" },
];

function classicWordWorks(form, vi) {
  if (form === 0) {
    const bank = pick(TOOL_BANKS, vi);
    const other = bank.correct.startsWith("HCF") ? "LCM — sync repeating events" : "HCF — split into equal groups";
    const p = problemBase("word-works", vi, "choice");
    finishChoice(p, bank.correct, [other, "Add the numbers together", "Multiply all the numbers together"], ["Divide the bigger by the smaller", "Round both numbers first"], vi);
    p.prompt = `Toolbox check — which tool solves this? ${bank.scenario}.`;
    p.hint1 = "Ask yourself: am I SPLITTING into equal groups, or SYNCING repeating events?";
    p.hint2 = "Splitting → shared factors → HCF. Syncing → common multiples → LCM.";
    p.solution = `${bank.scenario} — this is a job for the ${bank.correct}. Equal-group problems need shared factors (HCF); repeating-event problems need common multiples (LCM).`;
    p.visual = { type: "card", title: "HCF or LCM?", equation: "split ⇄ sync", badge: "PICK A TOOL", accent: CORAL, note: "Equal groups → HCF. Repeating events → LCM." };
    return p;
  }
  if (form === 1) {
    const bank = pick(PER_SHARE, vi);
    const [a, b] = bank.nums;
    const g = gcd(a, b);
    const ans = a / g;
    const p = problemBase("word-works", vi, "integer");
    finishNumeric(p, ans, [g, ans + 1, b / g], [ans + 2, ans * 2, g + 1], vi % 2 === 0, vi);
    p.prompt = `${a} ${bank.item} and ${b} ${bank.other} are packed into the largest possible number of identical groups, using everything. How many ${bank.item} go into each group?`;
    p.hint1 = "First find the number of groups — that is the HCF of the two amounts.";
    p.hint2 = `HCF of ${a} and ${b} → ${g} groups. Now share the ${bank.item}.`;
    p.solution = `HCF(${a}, ${b}) → ${g} groups. Then ${a} ÷ ${g} = ${ans} — each group gets ${ans} ${bank.item}. (The ${bank.other} share out as ${b} ÷ ${g} = ${b / g} each.)`;
    p.visual = { type: "fan", title: "Equal groups", top: `${a} ${bank.item} + ${b} ${bank.other}`, branches: [`${g} groups`, `${a} ÷ ${g}`, `${b} ÷ ${g}`].slice(0, 3), results: ["HCF ✓", String(ans), String(b / g)].slice(0, 3), accent: TEAL, note: "HCF counts the groups — then divide." };
    return p;
  }
  if (form === 2) {
    const [l, w] = pick(TILE, vi);
    const ans = gcd(l, w);
    const p = problemBase("word-works", vi, "integer");
    finishNumeric(p, ans, [ans * 2, ans + 1, Math.min(l, w)], [ans - 1, ans + 2, l], vi % 2 === 1, vi);
    p.prompt = `Tiler's puzzle: a rectangular floor is ${l} cm by ${w} cm. What is the side length of the LARGEST square tile that covers it exactly (in cm)?`;
    p.hint1 = "The tile side must divide BOTH side lengths exactly — a shared factor.";
    p.hint2 = `Largest shared factor of ${l} and ${w}: unpack both into primes.`;
    p.solution = `The side must divide both ${l} and ${w} — so it is the HCF. ${l} → ${expandedStr(l)}; ${w} → ${expandedStr(w)}; shared factors multiply to ${ans}. Largest tile: ${ans} cm by ${ans} cm.`;
    p.visual = { type: "card", title: "Tiler's puzzle", equation: `${l} × ${w} floor`, badge: "HCF", accent: AMBER, note: "The side must divide BOTH lengths." };
    return p;
  }
  const bank = pick(SYNC_COUNT, vi);
  const l = lcmMany(bank.intervals);
  const q = Math.floor(bank.window / l);
  const ans = q + (bank.countStart ? 1 : 0);
  const p = problemBase("word-works", vi, "integer");
  finishNumeric(p, ans, [l, ans + 1, Math.max(0, ans - 1)], [ans + 2, q, Math.round(bank.window / 60)], vi % 2 === 0, vi);
  p.prompt = bank.story;
  p.hint1 = "The events sync once every LCM of the intervals. Find that first.";
  p.hint2 = `LCM of ${bank.intervals.join(", ")} → ${l} ${bank.unit}. Now count the syncs inside ${bank.window} ${bank.unit}.`;
  p.solution = `Sync interval: LCM of ${bank.intervals.join(", ")} → ${l} ${bank.unit}. Then ${bank.window} ÷ ${l} → ${q} full sync${q === 1 ? "" : "s"} (remainder ${bank.window - q * l})${bank.countStart ? `, plus counting the start together: ${q} + 1 = ${ans}` : ""}. Answer: ${ans} times.`;
  p.visual = { type: "card", title: "Sync counter", equation: bank.intervals.join(" , "), badge: "LCM", accent: PURPLE, note: `Sync every ${l} — count inside ${bank.window}.` };
  return p;
}

// ---------------------------------------------------------------------------
// Classic 6: Prime Capstone — Nidah's squares, the golden rule, Martin's pairs,
// mystery exponents (IMC-style)
// ---------------------------------------------------------------------------
function isSquare(n) { const r = Math.round(Math.sqrt(n)); return r * r === n; }
// form0: two different primes whose sum is a square below 30 (book Expl 1)
const NIDAH = [
  { pair: [2, 7], wrongs: ["3 and 11", "5 and 13", "7 and 19"] },
  { pair: [3, 13], wrongs: ["2 and 11", "5 and 19", "7 and 17"] },
  { pair: [5, 11], wrongs: ["2 and 13", "3 and 17", "7 and 23"] },
  { pair: [2, 23], wrongs: ["3 and 19", "5 and 17", "11 and 13"] },
  { pair: [2, 7], wrongs: ["2 and 5", "3 and 7", "2 and 11"] },
  { pair: [5, 11], wrongs: ["3 and 11", "5 and 7", "11 and 13"] },
  { pair: [3, 13], wrongs: ["3 and 5", "13 and 17", "2 and 13"] },
  { pair: [2, 23], wrongs: ["2 and 19", "23 and 5", "23 and 7"] },
];
// form1: golden rule HCF × LCM = a × b — [h, l, a, ans]
const GOLDEN = [
  [6, 72, 18, 24], [4, 60, 12, 20], [3, 90, 15, 18], [8, 48, 16, 24],
  [5, 150, 25, 30], [2, 84, 12, 14], [9, 108, 27, 36], [7, 84, 21, 28],
];
// form2: Martin's mystery pair — HCF is h, LCM is a multiple of mult
const MARTIN = [
  { h: 6, mult: 15, pair: [6, 30], wrongs: [[12, 18], [6, 45], [10, 30]] },
  { h: 12, mult: 9, pair: [12, 36], wrongs: [[12, 27], [24, 60], [36, 72]] },
  { h: 6, mult: 15, pair: [12, 30], wrongs: [[6, 20], [18, 24], [10, 15]] },
  { h: 12, mult: 9, pair: [12, 72], wrongs: [[12, 33], [24, 48], [16, 36]] },
  { h: 6, mult: 15, pair: [6, 60], wrongs: [[6, 25], [12, 24], [30, 45]] },
  { h: 12, mult: 9, pair: [36, 60], wrongs: [[12, 18], [24, 60], [36, 45]] },
  { h: 6, mult: 15, pair: [18, 30], wrongs: [[12, 18], [9, 30], [20, 30]] },
  { h: 12, mult: 9, pair: [24, 36], wrongs: [[12, 24], [18, 27], [48, 60]] },
];
// form3: mystery exponents p/q/r — HCF takes the min power, LCM the max
const PQR = [
  { setup: "A = 3⁵ × 5 × 7³, B = 2³ × 3 × 7⁴, C = 2ᵖ × 5ᑫ × 7ʳ. HCF(B, C) = 2³ × 7 and LCM(A, C) = 2⁴ × 3⁵ × 5² × 7³", letter: "p", ans: 4, mode: "max", fixed: 0, target: 4 },
  { setup: "A = 3⁵ × 5 × 7³, B = 2³ × 3 × 7⁴, C = 2ᵖ × 5ᑫ × 7ʳ. HCF(B, C) = 2³ × 7 and LCM(A, C) = 2⁴ × 3⁵ × 5² × 7³", letter: "q", ans: 2, mode: "max", fixed: 1, target: 2 },
  { setup: "A = 3⁵ × 5 × 7³, B = 2³ × 3 × 7⁴, C = 2ᵖ × 5ᑫ × 7ʳ. HCF(B, C) = 2³ × 7 and LCM(A, C) = 2⁴ × 3⁵ × 5² × 7³", letter: "r", ans: 1, mode: "min", fixed: 4, target: 1 },
  { setup: "A = 2 × 3², C = 2ᵖ × 3ᑫ. LCM(A, C) = 2³ × 3² and HCF(A, C) = 2 × 3", letter: "p", ans: 3, mode: "max", fixed: 1, target: 3 },
  { setup: "A = 2 × 3², C = 2ᵖ × 3ᑫ. LCM(A, C) = 2³ × 3² and HCF(A, C) = 2 × 3", letter: "q", ans: 1, mode: "min", fixed: 2, target: 1 },
  { setup: "A = 3 × 5², C = 3ᵖ × 5ᑫ. LCM(A, C) = 3² × 5³ and HCF(A, C) = 3 × 5²", letter: "p", ans: 2, mode: "max", fixed: 1, target: 2 },
  { setup: "A = 3 × 5², C = 3ᵖ × 5ᑫ. LCM(A, C) = 3² × 5³ and HCF(A, C) = 3 × 5²", letter: "q", ans: 3, mode: "max", fixed: 2, target: 3 },
  { setup: "A = 2² × 7, C = 2ᵖ × 7². LCM(A, C) = 2³ × 7² and HCF(A, C) = 2² × 7", letter: "p", ans: 3, mode: "max", fixed: 2, target: 3 },
];
const SUP_PQR = { p: "ᵖ", q: "ᑫ", r: "ʳ" };

function classicPrimeCapstone(form, vi) {
  if (form === 0) {
    const bank = pick(NIDAH, vi);
    const [pr1, pr2] = bank.pair;
    const sum = pr1 + pr2;
    const correct = `${pr1} and ${pr2}`;
    const p = problemBase("prime-capstone", vi, "choice");
    finishChoice(p, correct, bank.wrongs, ["2 and 3", "11 and 13", "5 and 7"], vi);
    p.prompt = `Nidah's challenge: two DIFFERENT prime numbers whose sum is a square number less than 30. Which pair works?`;
    p.hint1 = "Squares below 30: 1, 4, 9, 16, 25. Add each pair and check.";
    p.hint2 = `Try the pair you think: ${pr1} + ${pr2} = ${sum} — is ${sum} a square below 30?`;
    p.solution = `${pr1} + ${pr2} = ${sum}, and ${sum} = ${Math.round(Math.sqrt(sum))}² — a square below 30, with both numbers prime and different. ${correct} is the pair.`;
    p.visual = { type: "pairs", title: "Nidah's square hunt", chips: [String(pr1), String(pr2), String(sum), `${Math.round(Math.sqrt(sum))}²`, "< 30"], pair: [0, 1], pairNote: `${pr1} + ${pr2} = ${sum}`, note: "Two different primes, sum is a square below 30." };
    return p;
  }
  if (form === 1) {
    const [h, l, a, ans] = pick(GOLDEN, vi);
    const p = problemBase("prime-capstone", vi, "integer");
    finishNumeric(p, ans, wrongs(ans), [ans + 4, ans - 3, ans * 3], vi % 2 === 0, vi);
    p.prompt = `Golden rule: two numbers have HCF ${h} and LCM ${l}. One of the numbers is ${a}. Find the other.`;
    p.hint1 = "Golden rule: HCF × LCM always equals the product of the two numbers.";
    p.hint2 = `So ${h} × ${l} = ${h * l} must equal ${a} × (the missing number).`;
    p.solution = `Golden rule: HCF × LCM = a × b. So ${h} × ${l} = ${h * l} and ${h * l} ÷ ${a} = ${ans}. Check: HCF(${a}, ${ans}) → ${gcd(a, ans)}, LCM(${a}, ${ans}) → ${lcm2(a, ans)} ✓.`;
    p.visual = { type: "card", title: "The golden rule", equation: "HCF × LCM = a × b", badge: `${h} × ${l}`, accent: AMBER, note: `${h * l} ÷ ${a} → the missing partner.` };
    return p;
  }
  if (form === 2) {
    const bank = pick(MARTIN, vi);
    const [x, y] = bank.pair;
    const correct = `${x} and ${y}`;
    const p = problemBase("prime-capstone", vi, "choice");
    finishChoice(p, correct, bank.wrongs.map((w) => `${w[0]} and ${w[1]}`), ["8 and 24", "10 and 20", "9 and 27"], vi);
    p.prompt = `Martin says: "My two numbers have HCF ${bank.h}, and their LCM is a multiple of ${bank.mult}." Which pair COULD be Martin's numbers?`;
    p.hint1 = `Test each pair twice: is the HCF exactly ${bank.h}? Is the LCM a multiple of ${bank.mult}?`;
    p.hint2 = `For ${x} and ${y}: HCF → ${gcd(x, y)}, LCM → ${lcm2(x, y)}.`;
    p.solution = `For ${x} and ${y}: HCF(${x}, ${y}) → ${gcd(x, y)} ✓ and LCM(${x}, ${y}) → ${lcm2(x, y)}, and ${lcm2(x, y)} ÷ ${bank.mult} = ${lcm2(x, y) / bank.mult} exactly ✓. Every other pair fails one test. Answer: ${correct}.`;
    p.visual = { type: "pairs", title: "Martin's mystery pair", chips: [String(x), String(y), `HCF ${bank.h}`, `LCM ${lcm2(x, y)}`, `÷${bank.mult} ✓`], pair: [0, 1], pairNote: `HCF → ${gcd(x, y)}`, note: `HCF exactly ${bank.h}, LCM divisible by ${bank.mult}.` };
    return p;
  }
  const bank = pick(PQR, vi);
  const p = problemBase("prime-capstone", vi, "integer");
  finishNumeric(p, bank.ans, [bank.ans + 1, Math.max(0, bank.ans - 1), bank.fixed + 1], [bank.ans + 2, bank.ans + 3, Math.max(0, bank.ans - 2)], vi % 2 === 1, vi);
  p.prompt = `Mystery exponents. ${bank.setup}. Find the value of ${bank.letter}.`;
  p.hint1 = "The HCF takes the SMALLER power of each shared prime; the LCM takes the LARGER power.";
  p.hint2 = `Look at the prime carrying ${bank.letter}: ${bank.mode === "max" ? `the LCM power ${bank.target} must beat the fixed power ${bank.fixed} — so ${bank.letter} IS that bigger power` : `the HCF power ${bank.target} is the smaller of ${bank.fixed} and ${bank.letter}`}.`;
  p.solution = `HCF takes the smaller power, LCM the larger. Here ${bank.mode === "max" ? `max(${bank.fixed}, ${bank.letter}) = ${bank.target}, and since ${bank.target} > ${bank.fixed} we need ${bank.letter} = ${bank.ans}` : `min(${bank.fixed}, ${bank.letter}) = ${bank.target}, and since ${bank.target} < ${bank.fixed} we need ${bank.letter} = ${bank.ans}`}. Check the other given: it stays consistent ✓. So ${bank.letter} = ${bank.ans}.`;
  p.visual = { type: "card", title: "Mystery exponents", equation: `find ${SUP_PQR[bank.letter] || bank.letter}`, badge: "min vs max", accent: CORAL, note: "HCF → smaller power, LCM → bigger power." };
  return p;
}

// ---------------------------------------------------------------------------
// Engine: distractor helper, generators, answer checking, self-validation,
// visuals, intro scenes, public api
// ---------------------------------------------------------------------------
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

const GENERATORS = {
  "factor-detective": (vi) => classicFactorDetective(vi % 4, vi),
  "prime-factoriser": (vi) => classicPrimeFactoriser(vi % 4, vi),
  "hcf-lab": (vi) => classicHcfLab(vi % 4, vi),
  "lcm-lab": (vi) => classicLcmLab(vi % 4, vi),
  "word-works": (vi) => classicWordWorks(vi % 4, vi),
  "prime-capstone": (vi) => classicPrimeCapstone(vi % 4, vi),
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
    case "factor-detective": {
      if (form === 0) { const b = pick(SPOT0, vi); return exp === b.opts[0] && !isPrime(b.opts[0]) && b.opts.slice(1).every(isPrime); }
      if (form === 1) { const b = pick(MULT_BANKS, vi); return exp === b.mult && b.mult % b.k === 0 && b.nons.every((n) => n % b.k !== 0); }
      if (form === 2) { const b = pick(FACTOR_COUNT_BANKS, vi); return exp === factorCount(b.n); }
      const b = pick(VOCAB, vi); return exp === b.correct && !b.wrongs.includes(b.correct);
    }
    case "prime-factoriser": {
      if (form === 0) { const n = pick(FACTORISE0, vi); return exp === prodStr(n) && factorList(n).reduce((a, b) => a * b, 1) === n && factorList(n).every(isPrime); }
      if (form === 1) { const b = pick(EXPAND_BANKS, vi); return exp === b.factors.join(" × ") && b.factors.every(isPrime) && b.factors.length > 1; }
      if (form === 2) { const b = pick(VALUE_BANKS, vi); return eq(Number(exp), b.factors.reduce((a, x) => a * x, 1)); }
      const b = pick(MISSING_EXP, vi); return exp === b.ans && Math.pow(b.base, b.ans) * b.restVal === b.n;
    }
    case "hcf-lab": {
      if (form === 0) { const [a, b] = pick(HCF2, vi); return eq(Number(exp), gcd(a, b)); }
      if (form === 1) { const b = pick(HCF_POW, vi); return eq(Number(exp), gcd(b.xv, b.yv)); }
      if (form === 2) { const t = pick(HCF3, vi); return eq(Number(exp), gcdMany(t)); }
      const b = pick(HCF_WORD, vi); return eq(Number(exp), gcdMany(b.nums));
    }
    case "lcm-lab": {
      if (form === 0) { const [a, b] = pick(LCM2, vi); return eq(Number(exp), lcm2(a, b)); }
      if (form === 1) { const b = pick(HCF_POW, vi); return eq(Number(exp), lcm2(b.xv, b.yv)); }
      if (form === 2) { const t = pick(LCM3, vi); return eq(Number(exp), lcmMany(t)); }
      const b = pick(LCM_WORD, vi); return eq(Number(exp), lcmMany(b.nums));
    }
    case "word-works": {
      if (form === 0) { const b = pick(TOOL_BANKS, vi); return exp === b.correct && (b.correct.startsWith("HCF") || b.correct.startsWith("LCM")); }
      if (form === 1) { const b = pick(PER_SHARE, vi); const g = gcd(b.nums[0], b.nums[1]); return eq(Number(exp), b.nums[0] / g) && Number.isInteger(b.nums[0] / g); }
      if (form === 2) { const [l, w] = pick(TILE, vi); return eq(Number(exp), gcd(l, w)); }
      const b = pick(SYNC_COUNT, vi); const l = lcmMany(b.intervals); return eq(Number(exp), Math.floor(b.window / l) + (b.countStart ? 1 : 0));
    }
    case "prime-capstone": {
      if (form === 0) {
        const b = pick(NIDAH, vi);
        const [p1, p2] = b.pair;
        const good = (x, y) => isPrime(x) && isPrime(y) && x !== y && isSquare(x + y) && x + y < 30;
        return exp === `${p1} and ${p2}` && good(p1, p2) &&
          b.wrongs.every((w) => { const [x, y] = w.split(" and ").map(Number); return !good(x, y); });
      }
      if (form === 1) {
        const [h, l, a, ans] = pick(GOLDEN, vi);
        return eq(Number(exp), ans) && h * l === a * ans && gcd(a, ans) === h && lcm2(a, ans) === l;
      }
      if (form === 2) {
        const b = pick(MARTIN, vi);
        const [x, y] = b.pair;
        const good = (u, v) => gcd(u, v) === b.h && lcm2(u, v) % b.mult === 0;
        return exp === `${x} and ${y}` && good(x, y) && b.wrongs.every((w) => !good(w[0], w[1]));
      }
      const b = pick(PQR, vi);
      return eq(Number(exp), b.ans) && (b.mode === "max" ? Math.max(b.fixed, b.ans) === b.target : Math.min(b.fixed, b.ans) === b.target);
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
    text = revealed ? "The fan shows the prime split — shared factors and biggest stacks." : "Split the number into primes, branch by branch.";
  } else if (v.type === "pairs") {
    html = pairSvg(v, revealed).replace("</svg>", answer + "</svg>");
    text = revealed ? "The guilty chips glow — the test caught them." : "Test each chip with the divisibility shortcuts.";
  } else if (v.type === "card") {
    html = cardSvg({ title: v.title, expr: v.equation || "", lines: v.note ? [v.note] : [], steps: v.note ? [v.note] : [] }, revealed).replace("</svg>", answer + "</svg>");
    text = revealed ? "The card shows the worked prime move." : "Plan the move — HCF splits, LCM syncs.";
  }
  return { html, text };
}

/* ---------------- intro scenes ---------------- */
const INTRO_SCENES = [
  {
    title: "The Block Factory",
    purpose: "Primes are the bricks every number is built from — spot the impostors.",
    classicId: "factor-detective",
    variant: 0,
    caption: "Primes are the bricks every number is built from.",
    durationMs: 20000,
    voiceover: "Pip's newest machine is the Block Factory, and its bricks are prime numbers. A prime has exactly two factors — one and itself — like seven or forty-three. But eighty-seven? Its digits add to fifteen, a multiple of three, so it splits into three times twenty-nine. Test the digits, check the endings, and trial-divide by small primes — the factory hides no impostor from you."
  },
  {
    title: "The Short-Division Slide",
    purpose: "Prime factorisation: divide by small primes until 1 remains; write with powers.",
    classicId: "prime-factoriser",
    variant: 0,
    caption: "Every number owns exactly one prime fingerprint.",
    durationMs: 20000,
    voiceover: "Feed three hundred into the short-division slide: divide by two, again by two, then three, then five, then five — one remains. Collect the divisors: two squared times three times five squared. Every number owns exactly one prime fingerprint — that is unique factorisation. Then rebuild stamps: expanded form spells out every copy, and product notation counts them with powers."
  },
  {
    title: "The Common-Factor Magnet",
    purpose: "HCF: multiply only the prime factors BOTH numbers share.",
    classicId: "hcf-lab",
    variant: 0,
    caption: "Shared factors only — the magnet lifts the rest away.",
    durationMs: 20000,
    voiceover: "The magnet chamber lifts only what both numbers share. Ninety unpacks to two times three times three times five; one hundred twenty to two cubed times three times five. Shared: two, three, five — multiply them and the HCF is thirty. Stamps make it faster: shared primes only, and the smaller power always wins."
  },
  {
    title: "The Sync Beacon",
    purpose: "LCM: every prime, biggest stack — when repeating events meet.",
    classicId: "lcm-lab",
    variant: 0,
    caption: "Repeating events meet at the LCM.",
    durationMs: 20000,
    voiceover: "The sync beacon finds when repeating events meet — the lowest common multiple. Forty-eight unpacks to four twos and a three; sixty to two twos, a three and a five. Take every prime, biggest stack: two to the fourth times three times five is two hundred forty. Alarms, lighthouses, buses — they all meet at the LCM."
  },
  {
    title: "The Sharing Ceremony",
    purpose: "Read the story, pick the tool: equal groups → HCF, repeating events → LCM.",
    classicId: "word-works",
    variant: 0,
    caption: "Equal groups → HCF. Repeating events → LCM.",
    durationMs: 20000,
    voiceover: "Seventy-two pears and fifty-four oranges, shared fairly among as many children as possible — that is a splitting job, so grab the HCF: eighteen children, four pears each. But syncing two alarms is a multiple job — grab the LCM. Read the story, name the tool: equal groups mean HCF, repeating events mean LCM. Then the arithmetic is one line."
  },
  {
    title: "The Grand Prime Finale",
    purpose: "IMC-style capstones: prime pairs, the golden rule, mystery exponents.",
    classicId: "prime-capstone",
    variant: 0,
    caption: "HCF × LCM = a × b — every tool fires at once.",
    durationMs: 20000,
    voiceover: "Finale, cadet! Nidah's two primes sum to a square below thirty — two and seven make nine. Then the golden rule: HCF times LCM always equals the product of the two numbers, so a missing partner is one division away. Finally, chase mystery exponents: the LCM takes the bigger power, the HCF the smaller. Solve for p, q and r — make the Block Factory proud!"
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
root.PrimeFactorsModule = api;
})(typeof window !== "undefined" ? window : globalThis);
