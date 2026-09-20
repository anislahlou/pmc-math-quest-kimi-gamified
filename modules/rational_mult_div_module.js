/* Multiply & Divide Rationals module (G1 Lesson 3, Think Academy G1M L1-L8 study book).
   Dialect A (train-style): CLASSICS + generateProblem + checkAnswer +
   renderProblemVisual + INTRO_SCENES + createRound.
   All generators are procedural with exact, audit-clean answers (integer or
   exact 1-2 dp decimals; fraction answers are always choice-mode strings).
   Distractors target the lesson's known misconceptions: sign-count slips,
   forgot-to-flip division, flipped-the-wrong-fraction, mixed numbers treated
   as w×n/d or w+n/d, and dropped negative signs (book Explorations 1-6,
   After Class 1-10, Extensive Exercises 1-3). */
(function (root) {
  "use strict";

  const CLASSICS = [
    { id: "first-products", nickname: "First Products", skill: "Multiply positive fractions and integers — cross-cancel before you multiply.", sourcePages: "Book 36-37+39 / PDF 44-45+47" },
    { id: "sign-detective", nickname: "Sign Detective", skill: "Decide a product's sign by counting negative factors: odd → negative, even → positive.", sourcePages: "Book 38-39 / PDF 46-47" },
    { id: "flip-multiply", nickname: "Keep, Change, Flip", skill: "Divide by a non-zero number by multiplying with its reciprocal.", sourcePages: "Book 43-45 / PDF 51-53" },
    { id: "mixed-makeover", nickname: "Mixed Number Makeover", skill: "Convert mixed numbers to improper fractions before multiplying or dividing.", sourcePages: "Book 37+39+43 / PDF 45+47+51" },
    { id: "factor-detective", nickname: "Factor Detective", skill: "Hunt integer factors with sign logic: smallest products and sum-product mysteries.", sourcePages: "Book 40-42+49 / PDF 48-50+57" },
    { id: "chain-reaction", nickname: "Chain Reaction", skill: "Mixed × and ÷ chains: convert mixed numbers, flip every division, count the negatives, cancel.", sourcePages: "Book 45+47-48 / PDF 53+55-56" }
  ];
  const CLASSIC_IDS = CLASSICS.map((c) => c.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((c) => [c.id, c]));
  const CLASSIC_SKILLS = {
    "first-products": "Multiply & cross-cancel",
    "sign-detective": "Count the negatives",
    "flip-multiply": "Keep · change · flip",
    "mixed-makeover": "Convert mixed numbers",
    "factor-detective": "Factor & sign logic",
    "chain-reaction": "Convert, flip, cancel"
  };
  const SOURCE_COVERAGE = {
    "first-products": ["Let's Get Ready 1 (book 37)", "Exploration 1 (book 39)"],
    "sign-detective": ["Learn and Discover 1-2 counter groups & ladder (book 38)", "Notes sign-of-product rules (book 39)", "After Class 1+5 (book 46-47)"],
    "flip-multiply": ["Warm Up reciprocals (book 43)", "Notes division rules (book 44)", "Exploration 5 + Practice (book 44-45)", "After Class 3-4 (book 46-47)"],
    "mixed-makeover": ["Let's Get Ready 3 (book 37)", "Exploration 1(3)(4) (book 39)", "Warm Up mixed reciprocal (book 43)", "After Class 2+4 (book 46-47)"],
    "factor-detective": ["Exploration 2 Kanga (book 40)", "Exploration 4 (book 41-42)", "Extensive Exercises 1-3 (book 49)"],
    "chain-reaction": ["Exploration 6 (book 45)", "After Class 6-10 (book 47-48)"]
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
  function fdiv(a, b) { return F(a.n * b.d, a.d * b.n); }
  function fneg(a) { return F(-a.n, a.d); }
  function fstr(f) { return fracStr(f.n, f.d); }
  function Fdisp(f) { return f.d === 1 ? f.n : fstr(f); } // number for integers, "a/b" string otherwise
  function mixStr(s, w, n, d) { return (s < 0 ? MINUS : "") + `${w} ${n}/${d}`; }
  function decStr(n, d) { // terminating decimal display with proper minus (values here are exact at 2 dp)
    const v = Math.abs(n / d);
    return (n < 0 ? MINUS : "") + String(Math.round(v * 100) / 100);
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
  // Choice-mode string answer (reciprocals, trios, sign words, expressions…).
  function finishChoice(p, correct, wrongs, fallbacks, variantIndex) {
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = makeChoices(correct, wrongs, fallbacks, variantIndex);
    return p;
  }

  /* ---------------- chain terms (mixed ×/÷ expressions) ---------------- */
  // term: {t:"int",k} | {t:"frac",n,d} (n signed) | {t:"mixed",s,w,n,d} | {t:"dec",n,d} (n signed, terminating)
  function termVal(t) {
    if (t.t === "int") return F(t.k, 1);
    if (t.t === "frac") return F(t.n, t.d);
    if (t.t === "mixed") return F(t.s * (t.w * t.d + t.n), t.d);
    return F(t.n, t.d); // dec
  }
  function termCore(t) { // magnitude display
    if (t.t === "int") return String(Math.abs(t.k));
    if (t.t === "frac") return `${Math.abs(t.n)}/${t.d}`;
    if (t.t === "mixed") return `${t.w} ${t.n}/${t.d}`;
    return decStr(Math.abs(t.n), t.d);
  }
  function termNeg(t) {
    if (t.t === "int") return t.k < 0;
    if (t.t === "mixed") return t.s < 0;
    return t.n < 0;
  }
  function dispTerm(t, first) { // book style: first factor bare, later negatives in brackets
    const neg = termNeg(t), core = termCore(t);
    if (neg) return first ? MINUS + core : `(${MINUS}${core})`;
    return core;
  }
  function exprStr(terms, ops) {
    let out = dispTerm(terms[0], true);
    for (let i = 1; i < terms.length; i++) out += ` ${ops[i - 1]} ${dispTerm(terms[i], false)}`;
    return out;
  }
  function foldChain(terms, ops) { // exact left-to-right ×/÷ evaluation
    let acc = termVal(terms[0]);
    for (let i = 1; i < terms.length; i++) {
      acc = ops[i - 1] === "÷" ? fdiv(acc, termVal(terms[i])) : fmul(acc, termVal(terms[i]));
    }
    return acc;
  }
  function dispConverted(f, first) { // value displayed as integer or improper fraction
    const neg = f.n < 0;
    const core = f.d === 1 ? String(Math.abs(f.n)) : `${Math.abs(f.n)}/${f.d}`;
    if (neg) return first ? MINUS + core : `(${MINUS}${core})`;
    return core;
  }
  function convertedExpr(terms, ops) { // mixed/dec → improper, every ÷ flipped to × reciprocal
    const vals = terms.map((t, i) => {
      let v = termVal(t);
      if (i > 0 && ops[i - 1] === "÷") v = F(v.d, v.n);
      return v;
    });
    return vals.map((v, i) => dispConverted(v, i === 0)).join(" × ");
  }
  function negCountOf(terms) { return terms.filter(termNeg).length; }

  /* ---------------- generic SVG bits ---------------- */
  const NAVY = "#16345d", CORAL = "#ff7654", TEAL = "#0b8993", AMBER = "#e8a20c", PURPLE = "#7a4fd0";
  const RED = "#ff8a94", BLUE = "#7fb7ff";
  function svgShell(inner) {
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Problem visual">${inner}</svg>`;
  }
  // Red/blue counter chips in groups (same renderer as rational_add_sub). v = {groups:[{n: signed int}], cancel, note}
  function countersSvg(v, revealed) {
    let s = `<rect x="0" y="0" width="560" height="330" fill="#f4f9ff"/>`;
    const bands = v.groups.length;
    const bandH = Math.min(130, 250 / bands);
    let redStruck = 0, blueStruck = 0;
    const cancel = revealed ? (v.cancel || 0) : 0;
    v.groups.forEach((g, gi) => {
      const n = Math.abs(g.n), isRed = g.n > 0;
      const cy = 76 + gi * bandH + bandH / 2;
      const perRow = 9, r = 15, gap = 37;
      const rows = Math.ceil(n / perRow);
      let idx = 0;
      for (let row = 0; row < rows; row++) {
        const inRow = Math.min(perRow, n - row * perRow);
        const x0 = 264 - ((inRow - 1) * gap) / 2;
        for (let i = 0; i < inRow; i++, idx++) {
          let strike = false;
          if (isRed && redStruck < cancel) { strike = true; redStruck++; }
          if (!isRed && blueStruck < cancel) { strike = true; blueStruck++; }
          const cx = x0 + i * gap, cyy = cy + (row - (rows - 1) / 2) * gap;
          s += `<circle cx="${cx}" cy="${cyy}" r="${r}" fill="${isRed ? RED : BLUE}" stroke="${NAVY}" stroke-width="2" opacity="${strike ? 0.35 : 1}"/>`;
          s += `<text x="${cx}" y="${cyy + 5}" text-anchor="middle" font-size="14" font-weight="bold" fill="${NAVY}" opacity="${strike ? 0.4 : 1}">${isRed ? "1" : MINUS + "1"}</text>`;
          if (strike) s += `<line x1="${cx - r}" y1="${cyy - r}" x2="${cx + r}" y2="${cyy + r}" stroke="${NAVY}" stroke-width="3" opacity="0.6"/>`;
        }
      }
      s += `<text x="510" y="${cy + 6}" text-anchor="end" font-size="18" font-weight="bold" fill="${NAVY}">${sx(g.n)}</text>`;
    });
    if (v.note) s += `<text x="280" y="36" text-anchor="middle" font-size="16" fill="${NAVY}">${escapeHtml(v.note)}</text>`;
    if (revealed && (v.cancel || 0) > 0) s += `<text x="280" y="60" text-anchor="middle" font-size="15" font-weight="bold" fill="${TEAL}">${v.cancel} zero pair${v.cancel > 1 ? "s" : ""} cancel out!</text>`;
    return svgShell(s);
  }
  // Area model for a/b × c/d (proper fractions). v = {rows, rowShade, cols, colShade, frac1, frac2, note}
  function gridSvg(v, revealed) {
    let s = `<rect x="0" y="0" width="560" height="330" fill="#f4f9ff"/>`;
    const X0 = 110, Y0 = 62, W = 340, H = 198;
    const cw = W / v.cols, rh = H / v.rows;
    for (let r = 0; r < v.rows; r++) {
      for (let c = 0; c < v.cols; c++) {
        const inRow = r < v.rowShade, inCol = c < v.colShade;
        const fill = inRow && inCol ? "#b49cec" : inRow ? "#9adfe4" : inCol ? "#ffc4b3" : "white";
        s += `<rect x="${X0 + c * cw}" y="${Y0 + r * rh}" width="${cw}" height="${rh}" fill="${fill}" stroke="${NAVY}" stroke-width="1.5"/>`;
      }
    }
    s += `<rect x="${X0}" y="${Y0}" width="${W}" height="${H}" fill="none" stroke="${NAVY}" stroke-width="4"/>`;
    s += `<text x="${X0 - 16}" y="${Y0 + H / 2}" text-anchor="end" font-size="22" font-weight="bold" fill="${TEAL}">${escapeHtml(v.frac1)}</text>`;
    s += `<text x="${X0 + W / 2}" y="${Y0 - 18}" text-anchor="middle" font-size="22" font-weight="bold" fill="${CORAL}">${escapeHtml(v.frac2)}</text>`;
    if (v.note) s += `<text x="280" y="30" text-anchor="middle" font-size="15" fill="${NAVY}">${escapeHtml(v.note)}</text>`;
    if (revealed) {
      s += `<text x="280" y="${Y0 + H + 32}" text-anchor="middle" font-size="16" font-weight="bold" fill="${PURPLE}">purple overlap: ${v.rowShade} × ${v.colShade} = ${v.rowShade * v.colShade} of ${v.rows * v.cols} cells</text>`;
    } else {
      s += `<text x="280" y="${Y0 + H + 32}" text-anchor="middle" font-size="14" fill="#4a5578">the double-shaded overlap is the product</text>`;
    }
    return svgShell(s);
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

  /* ---------------- 1. first-products ---------------- */
  function firstProductsProblem(vi) {
    const form = vi % 4;
    if (form === 0) {
      // fraction × integer with a clean cancellation → integer answer
      const [k, d, m] = pick([[4, 9, 4], [3, 8, 3], [5, 6, 3], [2, 7, 5], [5, 9, 2], [3, 11, 4], [4, 5, 3], [7, 8, 2], [5, 12, 2], [2, 9, 6], [3, 10, 3], [6, 7, 2]], vi);
      const n = d * m, expected = k * m;
      const frac = fracStr(k, d);
      const flipOrder = vi % 8 >= 4;
      const p = problemBase("first-products", vi, vi % 2 === 0 ? "choice" : "filled");
      p.prompt = flipOrder ? `Work out ${n} × ${frac}.` : `Work out ${frac} × ${n}.`;
      p.hint1 = "Cancel before you multiply: the integer and the bottom number share a big factor.";
      p.hint2 = `${n} ÷ ${d} = ${m}, so this becomes ${k} × ${m}.`;
      p.solution = `Cancel the giant first: ${n} ÷ ${d} = ${m}, leaving ${k} × ${m} = ${expected}. Much easier than multiplying everything and simplifying at the end!`;
      p.visual = { type: "card", title: "cancel the giant first", expr: flipOrder ? `${n} × ${frac}` : `${frac} × ${n}`, lines: [`${n} ÷ ${d} = ${m}`, `then ${k} × ${m}`], steps: [`${n} ÷ ${d} = ${m}`, `${k} × ${m} = ${expected}`] };
      p.data = { form, k, d, m };
      return finishNumeric(p, expected, [m, k * n, k * (m + 1)], [expected + 2, expected - 2, expected + d], vi % 2 === 0, vi);
    }
    if (form === 1) {
      // fraction × fraction with cross-cancellation in BOTH crosses (always choice)
      const [a, b, c, d] = pick([[7, 4, 8, 21], [8, 7, 21, 16], [14, 5, 15, 7], [5, 6, 12, 7], [9, 8, 16, 27], [6, 11, 22, 9], [10, 13, 26, 25], [3, 8, 16, 15], [12, 25, 35, 18], [9, 14, 7, 12], [4, 9, 15, 16], [21, 10, 25, 14]], vi);
      const ansF = fmul(F(a, b), F(c, d));
      const g1 = gcd(a, d), g2 = gcd(c, b);
      const a1 = a / g1, d1 = d / g1, c1 = c / g2, b1 = b / g2;
      const expr = `${fracStr(a, b)} × ${fracStr(c, d)}`;
      const p = problemBase("first-products", vi, "choice");
      p.prompt = `Work out ${expr}.`;
      p.hint1 = "Cross-cancel BEFORE you multiply: hunt for a shared factor between a top number and a bottom number.";
      p.hint2 = `${a} and ${d} share ${g1}, shrinking to ${a1} and ${d1}; ${c} and ${b} share ${g2}, shrinking to ${c1} and ${b1}.`;
      p.solution = `Cross-cancel first: ${a} and ${d} become ${a1} and ${d1}; ${c} and ${b} become ${c1} and ${b1}. Now (${a1} × ${c1}) / (${b1} × ${d1}) = ${fstr(ansF)}.`;
      p.visual = { type: "card", title: "cross-cancel first!", expr, lines: [`${a} and ${d} → ${a1} and ${d1}`, `${c} and ${b} → ${c1} and ${b1}`], steps: [`tops: ${a1} × ${c1} = ${a1 * c1}`, `bottoms: ${b1} × ${d1} = ${b1 * d1}`, `answer: ${fstr(ansF)}`] };
      p.data = { form, a, b, c, d };
      return finishFraction(p, ansF,
        [F(a * d, b * c), F(a + c, b + d), F(ansF.d, ansF.n)], // flipped the 2nd fraction · added tops & bottoms · flipped the answer
        [F(1, 1), F(-1, 1), F(2, 1)], true, vi);
    }
    if (form === 2) {
      // proper fraction × proper fraction with the area model (always choice)
      const [a, b, c, d] = pick([[2, 3, 3, 4], [3, 4, 2, 5], [1, 2, 5, 6], [4, 5, 1, 3], [2, 5, 1, 4], [3, 5, 2, 3], [5, 6, 3, 4], [1, 3, 3, 5], [3, 4, 5, 6], [2, 3, 4, 5], [1, 4, 2, 3], [5, 6, 1, 2]], vi);
      const ansF = fmul(F(a, b), F(c, d));
      const expr = `${fracStr(a, b)} × ${fracStr(c, d)}`;
      const p = problemBase("first-products", vi, "choice");
      p.prompt = `Work out ${expr}. (Picture it: ${fracStr(a, b)} of ${fracStr(c, d)}.)`;
      p.hint1 = "Multiply the tops together and the bottoms together — the overlap rectangles count the top.";
      p.hint2 = `Tops: ${a} × ${c}. Bottoms: ${b} × ${d}.`;
      p.solution = `${expr} = (${a} × ${c})/(${b} × ${d}) = ${fstr(ansF)}. The grid shows ${a * c} double-shaded cells out of ${b * d}.`;
      p.visual = { type: "grid", rows: b, rowShade: a, cols: d, colShade: c, frac1: fracStr(a, b), frac2: fracStr(c, d), note: `${fracStr(a, b)} of ${fracStr(c, d)}` };
      p.data = { form, a, b, c, d };
      return finishFraction(p, ansF,
        [F(a + c, b + d), F(a * d, b * c), F(a * c + 1, b * d)], // added both parts · cross-mixed · slip in the top
        [F(1, 1), F(0, 1), F(2, 1)], true, vi);
    }
    // form 3: missing factor with an integer answer
    const [a, b, t] = pick([[2, 5, 4], [3, 7, 2], [4, 9, 2], [5, 6, 3], [3, 8, 3], [7, 4, 2], [5, 12, 2], [2, 9, 3], [3, 10, 2], [4, 7, 2], [6, 7, 2], [5, 8, 2]], vi);
    const k = a * t, expected = b * t;
    const frac = fracStr(a, b);
    const p = problemBase("first-products", vi, vi % 2 === 1 ? "choice" : "filled");
    p.prompt = `What number completes this? ${frac} × ? = ${k}`;
    p.hint1 = "Undo the multiplication: divide the result by the fraction you know.";
    p.hint2 = `? = ${k} ÷ (${frac}) — and dividing by a fraction means multiplying by its flip.`;
    p.solution = `? = ${k} ÷ (${frac}) = ${k} × ${fracStr(b, a)} = ${expected}. Check: ${frac} × ${expected} = ${k}.`;
    p.visual = { type: "card", title: "undo it with the flip", expr: `${frac} × ? = ${k}`, lines: [`? = ${k} ÷ (${frac})`, `= ${k} × ${fracStr(b, a)}`], steps: [`${k} × ${fracStr(b, a)} = ${expected}`, `check: ${frac} × ${expected} = ${k}`] };
    p.data = { form, a, b, t };
    return finishNumeric(p, expected, [k * b, expected + a, a * b], [expected + 2, expected - 2, k], vi % 2 === 1, vi);
  }

  /* ---------------- 2. sign-detective ---------------- */
  function signDetectiveProblem(vi) {
    const form = vi % 4;
    if (form === 0) {
      // negative × positive integers (book Learn and Discover 1)
      const [a, b] = pick([[4, 2], [7, 8], [3, 3], [20, 3], [6, 11], [5, 2], [12, 5], [9, 6], [2, 4], [8, 7], [3, 2], [15, 4], [6, 2], [11, 5], [4, 3], [25, 4]], vi);
      const expected = -a * b;
      const negFirst = vi % 2 === 1;
      const expr = negFirst ? `${sx(-a)} × ${b}` : `${b} × (${sx(-a)})`;
      const p = problemBase("sign-detective", vi, vi % 2 === 1 ? "choice" : "filled");
      p.prompt = `Work out ${expr}.`;
      p.hint1 = "Multiply the sizes first. Then count the negative factors: exactly one — an odd count — so the answer is negative.";
      p.hint2 = `${a} × ${b} = ${a * b}; now give it a minus sign.`;
      p.solution = `The sizes give ${a} × ${b} = ${a * b}. There is exactly one negative factor — an odd count — so the product is negative: ${sx(expected)}.`;
      p.visual = (a <= 9 && b <= 4)
        ? { type: "counters", groups: Array.from({ length: b }, () => ({ n: -a })), cancel: 0, note: `${b} groups of ${sx(-a)}` }
        : { type: "card", title: "sizes first, sign second", expr, lines: [`sizes: ${a} × ${b}`, "one negative → negative"], steps: [`${a} × ${b} = ${a * b}`, `one negative factor → ${sx(expected)}`] };
      p.data = { form, a, b };
      return finishNumeric(p, expected, [a * b, -(a + b), b - a], [expected - 2, expected + 2, 0], vi % 2 === 1, vi);
    }
    if (form === 1) {
      // negative × negative → positive (book Learn and Discover 2)
      const [a, b] = pick([[6, 3], [10, 8], [5, 2], [9, 7], [4, 6], [12, 3], [8, 5], [7, 7], [11, 4], [9, 5], [5, 3], [20, 4]], vi);
      const expected = a * b;
      const expr = `(${sx(-a)}) × (${sx(-b)})`;
      const p = problemBase("sign-detective", vi, vi % 2 === 0 ? "choice" : "filled");
      p.prompt = `Work out ${expr}.`;
      p.hint1 = "Two negative factors: an EVEN count, so the answer is positive. Negative times negative is positive!";
      p.hint2 = a === 5
        ? `Watch the ladder: ${sx(-5)} × 2 = ${sx(-10)}, ${sx(-5)} × 1 = ${sx(-5)}, ${sx(-5)} × 0 = 0 — each step climbs by 5, so ${sx(-5)} × (${sx(-1)}) = 5.`
        : `Sizes: ${a} × ${b} = ${a * b}; two negatives make it positive.`;
      p.solution = `Sizes: ${a} × ${b} = ${a * b}. The two negative factors are an even count, so the product is positive: ${expected}.`;
      p.visual = { type: "card", title: "two negatives make a positive", expr, lines: [`sizes: ${a} × ${b}`, "even count of negatives → positive"], steps: [`${a} × ${b} = ${a * b}`, `answer: ${expected}`] };
      p.data = { form, a, b };
      return finishNumeric(p, expected, [-a * b, a + b, a * b - (a + b)], [expected + 2, expected - 2, 0], vi % 2 === 0, vi);
    }
    if (form === 2) {
      // multi-factor integer chains (book Notes + After Class 5), with zero-factor variants
      const sub = vi % 3;
      if (sub === 2) {
        // a zero hides in the factors (always choice)
        const factors = pick([[-7, 3, 0, -5], [6, 0, -4, -9], [0, -2, -8, 3], [-5, 8, 0, 7], [9, -6, 0, -4], [-11, 5, 0, 2]], vi);
        const nz = factors.filter((f) => f !== 0);
        const nzProd = nz.reduce((x, y) => x * y, 1);
        const nzSum = nz.reduce((x, y) => x + y, 0);
        const expr = factors.map((f, i) => (f < 0 && i > 0 ? `(${sx(f)})` : sx(f))).join(" × ");
        const p = problemBase("sign-detective", vi, "choice");
        p.prompt = `Work out ${expr}.`;
        p.hint1 = "Zero is a product-killer: if ANY factor is 0, the whole product is 0.";
        p.hint2 = `One of the factors is 0 — no need to multiply anything else.`;
        p.solution = `There is a 0 among the factors, and any number times 0 is 0, so ${expr} = 0. (Multiplying the others would give ${sx(nzProd)} — a waste of time!)`;
        p.visual = { type: "card", title: "zero kills the product", expr, lines: ["spot the 0 factor", "product is 0"], steps: [`0 factor present`, `answer: 0`] };
        p.data = { form, sub, factors };
        return finishChoice(p, "0", [sx(nzProd), sx(-nzProd), sx(nzSum)], ["1", MINUS + "1", "2"], vi);
      }
      const bank = sub === 0
        ? [[-2, -3, -4], [-1, -5, -6], [-2, -5, -3], [-3, -4, -5], [-1, -2, -9], [-4, -2, -6]]
        : [[-1, -2, -3, -4], [-5, -3, 4, -2], [-3, -3, -3, -3], [-2, 9, -8, -1], [-6, -2, 5, -3], [-5, 8, -7, -0.25]];
      const raw = pick(bank, vi);
      const factors = raw.map((f) => (Number.isInteger(f) ? { n: f, d: 1, disp: mag(f) } : { n: Math.round(f * 100), d: 100, disp: mag(f) }));
      const prod = factors.map((f) => F(f.n, f.d)).reduce(fmul, F(1, 1));
      const expected = prod.n; // every bank product is an integer
      const negs = factors.filter((f) => f.n < 0).length;
      const odd = negs % 2 === 1;
      const expr = factors.map((f, i) => (f.n < 0 ? (i === 0 ? MINUS + f.disp : `(${MINUS}${f.disp})`) : f.disp)).join(" × ");
      const sizes = factors.map((f) => f.disp).join(" × ");
      const p = problemBase("sign-detective", vi, vi % 2 === 0 ? "choice" : "filled");
      p.prompt = `Work out ${expr}.`;
      p.hint1 = `Count the negative factors: ${negs} — an ${odd ? "odd" : "even"} count, so the product is ${odd ? "negative" : "positive"}.`;
      p.hint2 = `Multiply the sizes: ${sizes} = ${mag(expected)}.`;
      p.solution = `There are ${negs} negative factors — ${odd ? "odd, so the product is negative" : "even, so the product is positive"}. Sizes: ${sizes} = ${mag(expected)}, so the answer is ${sx(expected)}.`;
      p.visual = { type: "card", title: "count the negatives first", expr, lines: [`negatives: ${negs} (${odd ? "odd → negative" : "even → positive"})`, `sizes: ${sizes}`], steps: [`${negs} negatives → ${odd ? "negative" : "positive"}`, `${sizes} = ${mag(expected)}`, `answer: ${sx(expected)}`] };
      p.data = { form, sub, factors: factors.map((f) => ({ n: f.n, d: f.d })) };
      return finishNumeric(p, expected, [-expected, expected + 2 * Math.abs(factors[factors.length - 1].n / factors[factors.length - 1].d), expected - 2 * Math.abs(factors[0].n / factors[0].d)], [expected + 2, expected - 2, 0], vi % 2 === 0, vi);
    }
    // form 3: sign of a product without computing (book Notes) — always choice
    const sub = Math.floor(vi / 4) % 2; // form 3 ⇒ vi odd, so vi % 2 alone would strand sub 0
    const p = problemBase("sign-detective", vi, "choice");
    if (sub === 0) {
      const list = pick([[-2, -3, 5, -7, 8], [-1, 4, -6, 2], [-3, -5, -2, 7, -1], [-9, 2, -3, 5, -6], [-4, -4, 3, 1, -2], [-6, 1, -1, -1, 2]], vi);
      const negs = list.filter((n) => n < 0).length;
      const correct = negs % 2 === 1 ? "Negative" : "Positive";
      const expr = list.map((n, i) => (n < 0 && i > 0 ? `(${sx(n)})` : sx(n))).join(" × ");
      p.prompt = `Pip multiplies these numbers together: ${expr}. Without computing, what is the sign of the product?`;
      p.hint1 = "Only the COUNT of negative factors matters — the sizes never do.";
      p.hint2 = `There are ${negs} negative factors, and ${negs} is ${negs % 2 ? "odd" : "even"}.`;
      p.solution = `Count the negative factors: ${negs}. ${negs % 2 ? "Odd count, so the product is NEGATIVE" : "Even count, so the product is POSITIVE"}. No multiplying needed!`;
      p.visual = { type: "card", title: "sizes never decide the sign", expr: list.join(" × "), lines: [`negative factors: ${negs}`, `${negs % 2 ? "odd → negative" : "even → positive"}`], steps: [`${negs} negatives`, `answer: ${correct.toLowerCase()}`] };
      p.data = { form, sub, list, correct };
      return finishChoice(p, correct, [correct === "Negative" ? "Positive" : "Negative", "Zero", "Cannot be told without computing"], ["Always positive", "Sign of the biggest number", "Negative zero"], vi);
    }
    const [N, K] = pick([[9, 5], [6, 4], [7, 3], [8, 2], [5, 4], [10, 7]], vi);
    const correct = K % 2 === 1 ? "Negative" : "Positive";
    p.prompt = `Pip multiplies ${N} non-zero numbers together. Exactly ${K} of them are negative. What is the sign of the product?`;
    p.hint1 = "Odd count of negatives → negative product; even count → positive product.";
    p.hint2 = `${K} is an ${K % 2 ? "odd" : "even"} number.`;
    p.solution = `With ${K} negative factors — an ${K % 2 ? "odd" : "even"} count — the product is ${correct.toLowerCase()}. The sizes of the numbers never matter for the sign.`;
    p.visual = { type: "card", title: "the count decides", expr: `${K} negatives among ${N} factors`, lines: [`${K} is ${K % 2 ? "odd" : "even"}`], steps: [`${K} is ${K % 2 ? "odd → negative" : "even → positive"}`, `answer: ${correct.toLowerCase()}`] };
    p.data = { form, sub, N, K, correct };
    return finishChoice(p, correct, [correct === "Negative" ? "Positive" : "Negative", "Zero", "Depends on the numbers' sizes"], ["Always positive", "Always negative", "Sign of the first factor"], vi);
  }

  /* ---------------- 3. flip-multiply ---------------- */
  function flipMultiplyProblem(vi) {
    const form = vi % 4;
    if (form === 0) {
      // reciprocal identification (book Warm Up) — always choice
      const entries = [
        { kind: "frac", n: 3, d: 7 }, { kind: "unit", d: 5 }, { kind: "int", k: 12 }, { kind: "mixed", s: 1, w: 2, n: 3, d: 4 },
        { kind: "negfrac", n: 7, d: 9 }, { kind: "frac", n: 5, d: 8 }, { kind: "int", k: 9 }, { kind: "mixed", s: 1, w: 1, n: 2, d: 5 },
        { kind: "negfrac", n: 3, d: 4 }, { kind: "unit", d: 8 }, { kind: "frac", n: 2, d: 9 }, { kind: "mixed", s: 1, w: 4, n: 2, d: 3 }
      ];
      const e = pick(entries, vi);
      let disp, correct, wrongs, tip, check;
      if (e.kind === "frac") {
        disp = fracStr(e.n, e.d); correct = fracStr(e.d, e.n);
        wrongs = [disp, fracStr(-e.n, e.d), fracStr(-e.d, e.n)];
        tip = `Flip ${disp} upside down.`;
        check = `${disp} × ${correct} = 1, so the reciprocal of ${disp} is ${correct}.`;
      } else if (e.kind === "unit") {
        disp = fracStr(1, e.d); correct = String(e.d);
        wrongs = [sx(-e.d), disp, "1"];
        tip = `${disp} is one share of ${e.d} — you need ${e.d} of them to make 1.`;
        check = `${disp} × ${e.d} = 1, so the reciprocal of ${disp} is ${e.d}.`;
      } else if (e.kind === "int") {
        disp = String(e.k); correct = fracStr(1, e.k);
        wrongs = [disp, sx(-e.k), fracStr(-1, e.k)];
        tip = `Write ${e.k} as ${e.k}/1 first, then flip.`;
        check = `${e.k} = ${e.k}/1, so its flip is ${correct}. Check: ${e.k} × ${correct} = 1.`;
      } else if (e.kind === "mixed") {
        const imp = e.w * e.d + e.n;
        disp = mixStr(e.s, e.w, e.n, e.d); correct = fracStr(e.d, imp);
        wrongs = [fracStr(imp, e.d), `${e.w} ${e.d}/${e.n}`, fracStr(e.d, e.n)];
        tip = `Convert ${disp} to an improper fraction first, then flip.`;
        check = `${disp} becomes ${fracStr(imp, e.d)}, and ${fracStr(imp, e.d)} × ${correct} = 1, so the reciprocal is ${correct}.`;
      } else { // negfrac
        disp = fracStr(-e.n, e.d); correct = fracStr(-e.d, e.n);
        wrongs = [fracStr(e.d, e.n), disp, fracStr(e.n, e.d)];
        tip = "The sign stays put — only the flip changes.";
        check = `The sign stays: the reciprocal of ${disp} is ${correct}. Check: (${disp}) × (${correct}) = 1.`;
      }
      const p = problemBase("flip-multiply", vi, "choice");
      p.prompt = `What is the reciprocal of ${disp}?`;
      p.hint1 = "A reciprocal flips the number upside down — a number times its reciprocal is exactly 1.";
      p.hint2 = tip;
      p.solution = check;
      p.visual = { type: "card", title: "flip it upside down", expr: `${disp} → ?`, lines: ["product with its flip is 1"], steps: [`${disp} × ${correct} = 1`, `reciprocal: ${correct}`] };
      p.data = { form, entry: e };
      return finishChoice(p, correct, wrongs, ["0", "1", MINUS + "1"], vi);
    }
    if (form === 1) {
      const sub = Math.floor(vi / 4) % 2; // form 1 ⇒ vi odd, so vi % 2 alone would strand sub 0
      if (sub === 0) {
        // fraction ÷ integer (book Practice / After Class 3) — fraction answer, always choice
        const [a, b, n0] = pick([[3, 5, 9], [6, 5, 3], [8, 7, 4], [9, 4, 6], [10, 13, 15], [12, 5, 9], [4, 9, 6], [15, 8, 10], [7, 3, 14], [5, 8, 10], [6, 11, 9], [14, 5, 7]], vi);
        const n = vi % 3 === 1 ? -n0 : n0;
        const ansF = fdiv(F(a, b), F(n, 1));
        const divisorDisp = n < 0 ? `(${sx(n)})` : String(n);
        const flipDisp = fstr(F(1, n)); // F normalizes the sign when n < 0
        const rawStep = `${n < 0 ? MINUS : ""}${a}/${Math.abs(b * n)}`;
        const expr = `${fracStr(a, b)} ÷ ${divisorDisp}`;
        const p = problemBase("flip-multiply", vi, "choice");
        p.prompt = `Work out ${expr}.`;
        p.hint1 = `Keep the first fraction, change ÷ to ×, and flip the integer: ${n0} becomes ${fracStr(1, n0)}.`;
        p.hint2 = `${fracStr(a, b)} ÷ ${divisorDisp} = ${fracStr(a, b)} × ${brk(flipDisp)}.`;
        p.solution = `Keep, change, flip: ${fracStr(a, b)} × ${brk(flipDisp)} = ${rawStep} = ${fstr(ansF)}.`;
        p.visual = { type: "card", title: "keep · change · flip", expr, lines: [`= ${fracStr(a, b)} × ${brk(flipDisp)}`], steps: [`${fracStr(a, b)} × ${brk(flipDisp)}`, `= ${rawStep} = ${fstr(ansF)}`] };
        p.data = { form, sub, a, b, n };
        return finishFraction(p, ansF,
          [F(a * n, b), F(b * n, a), F(b, a * n)], // multiplied instead · flipped the whole thing · flipped the first then divided
          [F(1, 1), F(-1, 1), F(0, 1)], true, vi);
      }
      // integer ÷ fraction → integer answer (book Exploration 5, Practice)
      const [n0, a, b] = pick([[2, 1, 2], [9, 3, 5], [25, 1, 5], [12, 3, 4], [6, 2, 3], [8, 4, 5], [30, 5, 9], [13, 1, 13], [4, 1, 3], [16, 2, 5], [7, 1, 4], [18, 3, 7]], vi);
      const sn = vi % 3 === 1 ? -1 : 1; // negative divisor on some variants
      const divisorF = F(sn * a, b);
      const ansF = fdiv(F(n0, 1), divisorF);
      const divisorDisp = sn < 0 ? `(${fracStr(-a, b)})` : fracStr(a, b);
      const flipDisp = fracStr(sn * b, a);
      const expr = `${n0} ÷ ${divisorDisp}`;
      const p = problemBase("flip-multiply", vi, vi % 2 === 0 ? "choice" : "filled");
      p.prompt = `Work out ${expr}.`;
      p.hint1 = "Keep the integer, change ÷ to ×, and flip the fraction upside down.";
      p.hint2 = `${n0} ÷ ${sn < 0 ? divisorDisp : `(${divisorDisp})`} = ${n0} × ${brk(flipDisp)}.`;
      p.solution = a === 1
        ? `${n0} × ${brk(flipDisp)} = ${fstr(ansF)}.`
        : `${n0} × ${brk(flipDisp)} = ${sn * n0 * b}/${a} = ${fstr(ansF)}.`;
      p.visual = { type: "card", title: "keep · change · flip", expr, lines: [`= ${n0} × ${brk(flipDisp)}`], steps: [`${n0} × ${brk(flipDisp)} = ${fstr(ansF)}`] };
      p.data = { form, sub, n: n0, a, b, sn };
      return finishFraction(p, ansF,
        [F(n0 * a * sn, b), fneg(ansF), F(ansF.n + a, ansF.d)], // forgot to flip · sign slip · off by the top
        [F(ansF.n + 2, ansF.d), F(ansF.n - 2, ansF.d), F(n0 * b, 1)], vi % 2 === 0, vi);
    }
    if (form === 2) {
      // fraction ÷ fraction with signs (book After Class 3-4)
      const [a, b, c, d] = pick([[-4, 5, 3, 20], [-5, 9, -5, 6], [9, 14, -3, 1], [-30, 1, 5, 9], [12, 5, -3, 10], [-8, 21, -12, 7], [2, 1, -3, 2], [-4, 7, 7, 4], [-6, 5, 2, 15], [9, 4, 27, 8], [12, 5, 3, 4], [-1, 3, -4, 3]], vi);
      const ansF = fdiv(F(a, b), F(c, d));
      const firstDisp = fracStr(a, b);
      const secondDisp = c < 0 ? `(${fracStr(c, d)})` : fracStr(c, d);
      const flipDisp = fstr(F(d, c)); // F normalizes a negative denominator onto the numerator
      const rawNum = a * d, rawDen = b * c;
      const rawStr = (rawNum < 0) !== (rawDen < 0) ? MINUS + `${Math.abs(rawNum)}/${Math.abs(rawDen)}` : `${Math.abs(rawNum)}/${Math.abs(rawDen)}`;
      const expr = `${firstDisp} ÷ ${secondDisp}`;
      const p = problemBase("flip-multiply", vi, ansF.d === 1 && vi % 2 === 1 ? "filled" : "choice");
      p.prompt = `Work out ${expr}.`;
      p.hint1 = "Keep the first fraction, change ÷ to ×, flip the SECOND fraction upside down — never the first!";
      p.hint2 = `${firstDisp} ÷ ${c < 0 ? secondDisp : `(${secondDisp})`} = ${firstDisp} × ${brk(flipDisp)}.`;
      p.solution = `Keep, change, flip: ${firstDisp} × ${brk(flipDisp)} = ${rawStr} = ${fstr(ansF)}.`;
      p.visual = { type: "card", title: "flip the second one only", expr, lines: [`= ${firstDisp} × ${brk(flipDisp)}`], steps: [`${firstDisp} × ${brk(flipDisp)}`, `= ${rawStr} = ${fstr(ansF)}`] };
      p.data = { form, a, b, c, d };
      return finishFraction(p, ansF,
        [F(a * c, b * d), F(b * c, a * d), fneg(ansF)], // forgot to flip · flipped the FIRST fraction · sign slip
        [F(1, 1), F(-1, 1), F(0, 1)], vi % 2 === 0, vi);
    }
    // form 3: decimal ÷ fraction (book Exploration 5 + Practice) — convert the decimal first
    const [dn, dd, cn, cd, s1, s2, decFirst] = pick([
      [3, 4, 5, 4, -1, 1, true], [4, 1, 1, 4, -1, -1, false], [3, 5, 3, 10, 1, 1, true], [3, 2, 3, 7, -1, 1, true],
      [5, 2, 5, 8, 1, 1, true], [2, 5, 2, 15, -1, -1, true], [7, 2, 7, 3, 1, -1, true], [9, 2, 3, 4, -1, 1, true]
    ], vi);
    const leftF = F(s1 * dn, dd), rightF = F(s2 * cn, cd);
    const ansF = fdiv(leftF, rightF);
    const leftDisp = decFirst ? decStr(s1 * dn, dd) : String(s1 * dn);
    const rightCore = decFirst ? fracStr(s2 * cn, cd) : decStr(s2 * cn, cd);
    const rightDisp = rightCore.startsWith(MINUS) ? `(${rightCore})` : rightCore;
    const flipDisp = fracStr(rightF.d, rightF.n);
    const expr = `${leftDisp} ÷ ${rightDisp}`;
    const p = problemBase("flip-multiply", vi, ansF.d === 1 && vi % 2 === 0 ? "filled" : "choice");
    p.prompt = `Work out ${expr}.`;
    p.hint1 = "Turn the decimal into a fraction first — halves, quarters, fifths and tenths are all friendly.";
    p.hint2 = `${leftDisp} = ${fstr(leftF)} — now keep, change, flip.`;
    p.solution = `${leftDisp} = ${fstr(leftF)}, and dividing by ${fstr(rightF)} means multiplying by ${flipDisp}: ${fstr(leftF)} × ${flipDisp} = ${fstr(ansF)}.`;
    p.visual = { type: "card", title: "decimal → fraction, then flip", expr, lines: [`${leftDisp} = ${fstr(leftF)}`, `× ${flipDisp}`], steps: [`${leftDisp} = ${fstr(leftF)}`, `${fstr(leftF)} × ${flipDisp} = ${fstr(ansF)}`] };
    p.data = { form, dn, dd, cn, cd, s1, s2 };
    return finishFraction(p, ansF,
      [fmul(leftF, rightF), fmul(F(leftF.d, leftF.n), rightF), fneg(ansF)], // forgot to flip · flipped the first · sign slip
      [F(1, 1), F(-1, 1), F(0, 1)], vi % 2 === 1, vi);
  }

  /* ---------------- operand helpers (mixed-makeover) ---------------- */
  // operand: {t:"m",s,w,n,d} | {t:"f",n,d} (n signed) | {t:"i",k} (k signed)
  function opTerm(o) {
    if (o.t === "m") return { t: "mixed", s: o.s, w: o.w, n: o.n, d: o.d };
    if (o.t === "f") return { t: "frac", n: o.n, d: o.d };
    return { t: "int", k: o.k };
  }
  function opVal(o) { return termVal(opTerm(o)); }
  function opDisp(o, first) { return dispTerm(opTerm(o), first); }
  function brk(s) { return s.startsWith(MINUS) ? `(${s})` : s; } // bracket negatives inside × chains

  /* ---------------- 4. mixed-makeover ---------------- */
  function mixedMakeoverProblem(vi) {
    const form = vi % 4;
    if (form === 0) {
      // mixed number → improper fraction (book Let's Get Ready 3) — always choice
      const [w, n, d, s] = pick([[2, 3, 4, 1], [3, 1, 2, 1], [1, 7, 8, 1], [4, 1, 3, 1], [2, 5, 6, -1], [3, 3, 4, -1], [1, 4, 7, 1], [2, 4, 13, 1], [5, 1, 4, -1], [6, 1, 4, 1], [2, 1, 2, 1], [4, 1, 2, -1]], vi);
      const disp = mixStr(s, w, n, d);
      const ansF = F(s * (w * d + n), d);
      const p = problemBase("mixed-makeover", vi, "choice");
      p.prompt = `Write ${disp} as an improper fraction.`;
      p.hint1 = `A mixed number hides an addition: the whole part ${w} is worth ${w * d}/${d}.`;
      p.hint2 = `${w} = ${w * d}/${d}; now add the extra ${n}/${d} on top.`;
      p.solution = `The whole ${w} is ${w * d}/${d}, and ${w * d} + ${n} = ${w * d + n}, so ${disp} = ${fstr(ansF)}.`;
      p.visual = { type: "card", title: "mixed → improper", expr: `${disp} = ?`, lines: [`whole ${w} → ${w * d}/${d}`, `then add ${n}/${d}`], steps: [`${w * d} + ${n} = ${w * d + n}`, `answer: ${fstr(ansF)}`] };
      p.data = { form, w, n, d, s };
      return finishFraction(p, ansF,
        [F(s * (w + n), d), F(s * w * n, d), F(s * w * d, n)], // added whole+top · multiplied everything · flipped parts
        [F(s * (w * d + n) + s, d), F(s * w * d, d + n), F(1, 1)], true, vi);
    }
    if (form === 1) {
      // multiplying with a mixed number (book Exploration 1(3), After Class 2)
      const rows = [
        { a: { t: "f", n: 4, d: 5 }, b: { t: "m", s: 1, w: 1, n: 7, d: 8 } },
        { a: { t: "m", s: 1, w: 2, n: 1, d: 5 }, b: { t: "f", n: -7, d: 11 } },
        { a: { t: "m", s: -1, w: 2, n: 5, d: 6 }, b: { t: "m", s: -1, w: 2, n: 2, d: 17 } },
        { a: { t: "m", s: 1, w: 4, n: 1, d: 3 }, b: { t: "f", n: 3, d: 7 } },
        { a: { t: "m", s: -1, w: 2, n: 2, d: 3 }, b: { t: "f", n: -9, d: 8 } },
        { a: { t: "f", n: -2, d: 3 }, b: { t: "m", s: -1, w: 2, n: 1, d: 2 } },
        { a: { t: "m", s: -1, w: 6, n: 1, d: 4 }, b: { t: "m", s: -1, w: 3, n: 1, d: 5 } },
        { a: { t: "m", s: 1, w: 1, n: 1, d: 2 }, b: { t: "f", n: 4, d: 9 } },
        { a: { t: "m", s: -1, w: 1, n: 3, d: 4 }, b: { t: "m", s: 1, w: 2, n: 2, d: 7 } },
        { a: { t: "f", n: 5, d: 6 }, b: { t: "m", s: -1, w: 3, n: 3, d: 5 } },
        { a: { t: "m", s: 1, w: 2, n: 2, d: 5 }, b: { t: "m", s: 1, w: 1, n: 1, d: 4 } },
        { a: { t: "m", s: -1, w: 3, n: 1, d: 3 }, b: { t: "f", n: 9, d: 10 } }
      ];
      const row = rows[Math.floor(vi / 4) % rows.length];
      const vA = opVal(row.a), vB = opVal(row.b);
      const ansF = fmul(vA, vB);
      const dA = opDisp(row.a, true), dB = opDisp(row.b, false);
      const m = row.a.t === "m" ? row.a : row.b; // there is always at least one mixed operand
      const other = row.a.t === "m" ? vB : vA;
      const misF = fmul(F(m.s * (m.w + m.n), m.d), other); // converted as w+n/d
      const prodF = fmul(F(m.s * m.w * m.n, m.d), other);   // treated 2 1/4 as 2×1/4
      const mDisp = mixStr(m.s, m.w, m.n, m.d);
      const p = problemBase("mixed-makeover", vi, ansF.d === 1 && vi % 2 === 0 ? "filled" : "choice");
      p.prompt = `Work out ${dA} × ${dB}.`;
      p.hint1 = "Makeover first: a mixed number must become an improper fraction BEFORE you multiply.";
      p.hint2 = `${mDisp} = ${fstr(opVal(m))}. Now multiply tops and bottoms.`;
      p.solution = `Makeover: ${mDisp} = ${fstr(opVal(m))}. Multiply: ${fstr(vA)} × ${brk(fstr(vB))} = ${fstr(ansF)}.`;
      p.visual = { type: "card", title: "makeover, then multiply", expr: `${dA} × ${dB}`, lines: [`${mDisp} = ${fstr(opVal(m))}`], steps: [`${fstr(vA)} × ${brk(fstr(vB))} = ${fstr(ansF)}`] };
      p.data = { form, a: row.a, b: row.b };
      return finishFraction(p, ansF, [misF, prodF, fneg(ansF)],
        [F(ansF.n + ansF.d, ansF.d), F(ansF.n - ansF.d, ansF.d), F(ansF.n + 1, ansF.d)], vi % 2 === 1, vi);
    }
    if (form === 2) {
      // dividing with a mixed number (book Exploration 1(4), After Class 4)
      const rows = [
        { a: { t: "m", s: 1, w: 2, n: 4, d: 13 }, b: { t: "m", s: 1, w: 3, n: 3, d: 4 } },
        { a: { t: "m", s: 1, w: 1, n: 4, d: 7 }, b: { t: "m", s: 1, w: 2, n: 5, d: 14 } },
        { a: { t: "m", s: -1, w: 2, n: 9, d: 11 }, b: { t: "i", k: 31 } },
        { a: { t: "m", s: -1, w: 3, n: 1, d: 2 }, b: { t: "f", n: 7, d: 3 } },
        { a: { t: "m", s: 1, w: 2, n: 1, d: 4 }, b: { t: "f", n: -3, d: 8 } },
        { a: { t: "m", s: -1, w: 1, n: 1, d: 2 }, b: { t: "m", s: -1, w: 2, n: 1, d: 4 } },
        { a: { t: "m", s: 1, w: 1, n: 3, d: 4 }, b: { t: "m", s: -1, w: 1, n: 1, d: 6 } },
        { a: { t: "i", k: -4 }, b: { t: "m", s: -1, w: 1, n: 1, d: 3 } },
        { a: { t: "m", s: 1, w: 4, n: 1, d: 2 }, b: { t: "m", s: 1, w: 1, n: 1, d: 8 } },
        { a: { t: "m", s: -1, w: 2, n: 2, d: 5 }, b: { t: "f", n: -8, d: 15 } },
        { a: { t: "m", s: 1, w: 1, n: 5, d: 6 }, b: { t: "i", k: -11 } },
        { a: { t: "m", s: -1, w: 4, n: 1, d: 5 }, b: { t: "m", s: -1, w: 1, n: 2, d: 5 } }
      ];
      const row = rows[Math.floor(vi / 4) % rows.length];
      const vA = opVal(row.a), vB = opVal(row.b);
      const ansF = fdiv(vA, vB);
      const dA = opDisp(row.a, true), dB = opDisp(row.b, false);
      const forgotF = fmul(vA, vB); // multiplied by the divisor instead of its reciprocal
      const m = row.a.t === "m" ? row.a : row.b;
      const misF = F(m.s * (m.w + m.n), m.d);
      const misAns = row.a.t === "m" ? fdiv(misF, vB) : fdiv(vA, misF);
      const mDisp = mixStr(m.s, m.w, m.n, m.d);
      const recip = fstr(F(vB.d, vB.n));
      const p = problemBase("mixed-makeover", vi, ansF.d === 1 && vi % 2 === 1 ? "filled" : "choice");
      p.prompt = `Work out ${dA} ÷ ${dB}.`;
      p.hint1 = "Makeover first: rewrite every mixed number as an improper fraction.";
      p.hint2 = `Then keep, change, flip: dividing by ${dB} means multiplying by ${recip}.`;
      p.solution = `Makeover: ${mDisp} = ${fstr(opVal(m))}. Keep, change, flip: ${fstr(vA)} × ${brk(recip)} = ${fstr(ansF)}.`;
      p.visual = { type: "card", title: "makeover, then flip", expr: `${dA} ÷ ${dB}`, lines: [`${mDisp} = ${fstr(opVal(m))}`, `flip divisor → ${recip}`], steps: [`${fstr(vA)} × ${brk(recip)} = ${fstr(ansF)}`] };
      p.data = { form, a: row.a, b: row.b };
      return finishFraction(p, ansF, [forgotF, misAns, fneg(ansF)],
        [F(ansF.n + ansF.d, ansF.d), F(ansF.n - ansF.d, ansF.d), F(ansF.n + 2, ansF.d)], vi % 2 === 0, vi);
    }
    // form 3: reciprocal of a mixed number (book Warm Up) — always choice
    const [w, n, d, s] = pick([[2, 3, 4, 1], [1, 2, 5, 1], [5, 2, 3, 1], [2, 1, 4, -1], [1, 3, 4, -1], [4, 1, 2, 1], [2, 2, 3, 1], [5, 1, 3, -1], [3, 2, 5, 1], [1, 1, 6, -1], [6, 2, 3, 1], [2, 3, 5, -1]], vi);
    const disp = mixStr(s, w, n, d);
    const imp = w * d + n;
    const ansF = F(s * d, imp);
    const p = problemBase("mixed-makeover", vi, "choice");
    p.prompt = `Write down the reciprocal of ${disp}.`;
    p.hint1 = "You cannot flip a mixed number directly — convert it to an improper fraction first.";
    p.hint2 = `${disp} = ${fracStr(s * imp, d)}. Now swap the top and bottom numbers.`;
    p.solution = `${disp} = ${fracStr(s * imp, d)}, and flipping gives ${fstr(ansF)}. Check: ${fracStr(s * imp, d)} × ${brk(fstr(ansF))} = 1.`;
    p.visual = { type: "card", title: "convert, then flip", expr: `${disp} → ?`, lines: [`${disp} = ${fracStr(s * imp, d)}`, "now flip"], steps: [`reciprocal: ${fstr(ansF)}`, `product with flip: 1`] };
    p.data = { form, w, n, d, s };
    return finishFraction(p, ansF,
      [F(s * imp, d), F(-s * d, imp), F(s * n, imp)], // kept it unflipped · sign slipped · flipped only the top
      [F(s * d, imp + 1), F(s * d, imp - 1), F(1, 1)], true, vi);
  }

  /* ---------------- 5. factor-detective ---------------- */
  function trioLabel(t) {
    const parts = t.slice().sort((p2, q) => p2 - q).map((v) => sx(v));
    return parts.length > 1 ? parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1] : parts[0];
  }
  function countListStr(arr) {
    return arr.length > 1 ? arr.slice(0, -1).join(", ") + " or " + arr[arr.length - 1] : String(arr[0]);
  }
  function factorDetectiveProblem(vi) {
    const form = vi % 4;
    if (form === 0) {
      // sum & product mystery (book Exploration 4)
      const [a, b] = pick([[12, 2], [8, 4], [15, 3], [9, 5], [7, 6], [18, 2], [10, 5], [14, 4], [6, 5], [16, 3], [20, 2], [11, 6]], vi);
      const swap = vi % 2 === 1;
      const n1 = swap ? a : -a, n2 = swap ? -b : b; // swap=false: sum b−a (negative); swap=true: sum a−b (positive)
      const sumVal = n1 + n2;
      const p = problemBase("factor-detective", vi, vi % 3 === 0 ? "choice" : "filled");
      p.prompt = `The product of two numbers is ${sx(-a * b)} and their sum is ${sx(sumVal)}. What is the positive difference between the two numbers?`;
      p.hint1 = "A negative product means one number is positive and the other is negative — so the sum is really a subtraction of sizes.";
      p.hint2 = `Find a factor pair of ${a * b} whose sizes differ by ${Math.abs(sumVal)}.`;
      p.solution = `The numbers are ${sx(n1)} and ${sx(n2)}: (${sx(n1)}) × (${sx(n2)}) = ${sx(-a * b)} and (${sx(n1)}) + (${sx(n2)}) = ${sx(sumVal)}. The positive difference is ${sx(Math.max(n1, n2))} − (${sx(Math.min(n1, n2))}) = ${a + b}.`;
      p.visual = { type: "card", title: "sum–product mystery", expr: `product ${sx(-a * b)} · sum ${sx(sumVal)}`, lines: ["one positive, one negative", `sizes differ by ${Math.abs(sumVal)}`], steps: [`${sx(n1)} and ${sx(n2)}`, `difference: ${a + b}`] };
      p.data = { form, a, b, swap };
      return finishNumeric(p, a + b, [a, Math.abs(sumVal), a + b + 2], [a + b - 1, a + b + 1, b], vi % 3 === 0, vi);
    }
    if (form === 1) {
      // three-number product & sum (book Exploration 4 style) — always choice
      const [x, y, z] = pick([[3, 2, 4], [2, 3, 6], [1, 4, 6], [3, 1, 8], [5, 2, 6], [4, 3, 6], [1, 6, 8], [2, 4, 8], [3, 5, 6], [6, 1, 9], [4, 1, 10], [2, 6, 9]], vi);
      const sum = z - x - y;
      const prod = x * y * z;
      const correct = [-x, -y, z];
      const wrongs = [[-x, -z, y], [-y, -z, x], [-x, -y, -z]];
      const p = problemBase("factor-detective", vi, "choice");
      p.prompt = `The product of three numbers is ${sx(prod)} and their sum is ${sx(sum)}. What are the three numbers?`;
      p.hint1 = `The product is positive, so there are zero or two negative numbers. The sum is ${sum >= 0 ? "positive" : "negative"} — use that to decide.`;
      p.hint2 = `Hunt three numbers with product ${prod}: try triples of factors of ${prod} and check the sum.`;
      p.solution = `The numbers are ${trioLabel(correct)}: (${sx(-x)}) × (${sx(-y)}) × ${z} = ${sx(prod)} and (${sx(-x)}) + (${sx(-y)}) + ${z} = ${sx(sum)}.`;
      p.visual = { type: "card", title: "product & sum mystery", expr: `product ${sx(prod)} · sum ${sx(sum)}`, lines: ["positive product → 0 or 2 negatives"], steps: [`${trioLabel(correct)}`] };
      p.data = { form, x, y, z };
      return finishChoice(p, trioLabel(correct), wrongs.map(trioLabel),
        [trioLabel([x, y, z]), trioLabel([-x, y, z]), trioLabel([x, -y, z])], vi);
    }
    if (form === 2) {
      // Kanga's card game: best product of three cards (book Exploration 2) — always choice
      const list = pick([
        [-5, -3, -1, 2, 4, 6], [-4, -2, -1, 3, 5, 7], [-6, -4, -2, 1, 3, 5], [-7, -3, -2, 2, 5, 6],
        [-8, -5, -1, 3, 4, 7], [-9, -2, -1, 4, 5, 8], [-3, -2, -1, 5, 6, 7], [-10, -4, -1, 2, 3, 9],
        [-6, -3, -2, 4, 5, 6], [-5, -4, -3, 1, 2, 7]
      ], vi);
      const who = pick(["Pip", "Kanga", "Ada", "Jenny"], vi);
      const wantLargest = vi % 3 === 2;
      const combos = [];
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) for (let k = j + 1; k < list.length; k++) {
        combos.push({ inds: [list[i], list[j], list[k]], val: list[i] * list[j] * list[k] });
      }
      combos.sort((p2, q) => p2.val - q.val);
      const best = wantLargest ? combos[combos.length - 1] : combos[0];
      const worst = wantLargest ? combos[0] : combos[combos.length - 1];
      const negs = list.filter((v) => v < 0);
      const poss = list.filter((v) => v > 0);
      const threeNeg = negs[0] * negs[1] * negs[2];
      const threePos = poss[0] * poss[1] * poss[2];
      const comboStr = best.inds.map((v) => sx(v)).join(", ");
      const p = problemBase("factor-detective", vi, "choice");
      p.prompt = `${who} has six cards numbered ${list.map((v) => sx(v)).join(", ")}. ${who} takes three cards and multiplies the numbers. What is the ${wantLargest ? "largest" : "smallest"} product ${who} can make?`;
      p.hint1 = "Two negative cards multiply to a positive — a pair of negatives can team up with the biggest positive card.";
      p.hint2 = "Compare the candidate triples: three positives against two negatives with one positive. Compute both.";
      p.solution = `The winning triple is ${comboStr}: (${sx(best.inds[0])}) × (${sx(best.inds[1])}) × (${sx(best.inds[2])}) = ${sx(best.val)}.`;
      p.visual = { type: "card", title: "pick three cards", expr: list.map((v) => sx(v)).join("  "), lines: ["two negatives + one big positive?"], steps: [`${comboStr} → ${sx(best.val)}`] };
      p.data = { form, list: list.slice(), wantLargest };
      return finishNumeric(p, best.val, [worst.val, threeNeg, threePos], [best.val + 1, best.val - 1, best.val * 2], true, vi);
    }
    // form 3: sign-count logic (book Notes / Extensive) — always choice
    const sub = Math.floor(vi / 4) % 2;
    if (sub === 0) {
      const [N, K] = pick([[9, 5], [6, 4], [7, 3], [8, 2], [5, 4], [10, 7]], vi);
      const odd = K % 2 === 1;
      const correct = odd ? "No" : "Yes";
      const p = problemBase("factor-detective", vi, "choice");
      p.prompt = `${N} numbers multiply to give a positive product. Exactly ${K} of the numbers are negative. Could this be true?`;
      p.hint1 = "The sign of a product is decided by how many negative factors there are — nothing else.";
      p.hint2 = "An even count of negatives makes a positive product; an odd count makes a negative product.";
      p.solution = `The product is positive, so the count of negative factors must be even. ${K} is ${odd ? "odd" : "even"}, so this is ${odd ? "impossible" : "possible"}.`;
      p.visual = { type: "card", title: "could it be true?", expr: `${K} negatives among ${N} factors`, lines: [`${K} is ${odd ? "odd" : "even"}`], steps: [`positive product needs even count`, `answer: ${correct.toLowerCase()}`] };
      p.data = { form, sub, N, K };
      return finishChoice(p, correct, [odd ? "Yes" : "No", "Only if the numbers are small", "Only if zero is included"],
        ["Cannot be told", "Always", "Never"], vi);
    }
    const [N, word] = pick([[5, "negative"], [6, "positive"], [4, "negative"], [7, "positive"], [8, "negative"], [9, "positive"]], vi);
    const wantOdd = word === "negative";
    const counts = [], comp = [];
    for (let k = 0; k <= N; k++) ((k % 2 === 1) === wantOdd ? counts : comp).push(k);
    const correct = countListStr(counts);
    const p = problemBase("factor-detective", vi, "choice");
    p.prompt = `${N} numbers multiply to give a ${word} product. How many of the numbers could be negative?`;
    p.hint1 = "The sign of a product is decided by the COUNT of negative factors.";
    p.hint2 = wantOdd ? "A negative product needs an odd count of negative factors." : "A positive product needs an even count of negative factors.";
    p.solution = `With ${N} numbers, the count of negative factors must be ${wantOdd ? "odd" : "even"}: ${correct}.`;
    p.visual = { type: "card", title: "count the negatives", expr: `${N} factors, ${word} product`, lines: [`${wantOdd ? "odd" : "even"} counts only`], steps: [`answer: ${correct}`] };
    p.data = { form, sub, N, word };
    return finishChoice(p, correct, [countListStr(comp), "Any number of them", "None of them"],
      ["All of them", "Exactly half", "Exactly one"], vi);
  }

  /* ---------------- 6. chain-reaction ---------------- */
  function chainReactionProblem(vi) {
    const form = vi % 4;
    const buildChain = (terms, ops) => {
      const ans = foldChain(terms, ops);
      const negs = negCountOf(terms);
      const signWord = negs % 2 === 1 ? "negative" : "positive";
      const signSlip = fneg(ans);
      const forgot = ops.includes("÷")
        ? foldChain(terms.map((t) => ({ ...t })), ops.map((o) => (o === "÷" ? "×" : o))) // ÷ became × without flipping
        : fmul(ans, F(2, 1));
      const mixedWrong = terms.some((t) => t.t === "mixed")
        ? foldChain(terms.map((t) => (t.t === "mixed" ? { t: "frac", n: t.s * t.w * t.n, d: t.d } : { ...t })), ops) // 2 1/4 treated as 2×1/4
        : F(ans.d, ans.n); // answer flipped upside down
      const base = {
        hint1: `Count the negatives first: ${negs} negative factor${negs === 1 ? "" : "s"} — an ${negs % 2 === 1 ? "odd" : "even"} count, so the answer is ${signWord}.`,
        hint2: "Convert mixed numbers and decimals to fractions, then change every ÷ into × with the reciprocal.",
        solution: `Convert and flip: ${convertedExpr(terms, ops)} = ${fstr(ans)}.`,
        data: { form, terms, ops }
      };
      return { ans, wrongs: [signSlip, forgot, mixedWrong], base };
    };
    const chainFinish = (row) => {
      const { ans, wrongs, base } = buildChain(row.terms, row.ops);
      const p = problemBase("chain-reaction", vi, ans.d === 1 && vi % 2 === 0 ? "filled" : "choice");
      p.prompt = `Work out ${exprStr(row.terms, row.ops)}.`;
      p.hint1 = base.hint1;
      p.hint2 = base.hint2;
      p.solution = base.solution;
      p.visual = { type: "card", title: "chain reaction", expr: exprStr(row.terms, row.ops), lines: ["convert · flip · cancel"], steps: [convertedExpr(row.terms, row.ops), `= ${fstr(ans)}`] };
      p.data = base.data;
      return finishFraction(p, ans, wrongs,
        [F(ans.n + ans.d, ans.d), F(ans.n - ans.d, ans.d), F(ans.n + 1, ans.d)],
        ans.d !== 1 || vi % 2 === 1, vi);
    };
    if (form === 0) {
      // one division in a three-term chain (book After Class 6-8)
      const row = pick([
        { terms: [{ t: "frac", n: -5, d: 12 }, { t: "frac", n: 8, d: 15 }, { t: "frac", n: -3, d: 2 }], ops: ["×", "÷"] },
        { terms: [{ t: "int", k: -3 }, { t: "frac", n: -5, d: 6 }, { t: "mixed", s: -1, w: 1, n: 1, d: 4 }], ops: ["×", "÷"] },
        { terms: [{ t: "dec", n: -25, d: 100 }, { t: "frac", n: -3, d: 7 }, { t: "frac", n: 4, d: 3 }], ops: ["÷", "×"] },
        { terms: [{ t: "frac", n: 9, d: 4 }, { t: "frac", n: -8, d: 27 }, { t: "frac", n: -4, d: 9 }], ops: ["×", "÷"] },
        { terms: [{ t: "frac", n: -2, d: 3 }, { t: "frac", n: -7, d: 8 }, { t: "frac", n: 7, d: 16 }], ops: ["×", "÷"] },
        { terms: [{ t: "frac", n: 5, d: 6 }, { t: "frac", n: -10, d: 9 }, { t: "frac", n: -3, d: 4 }], ops: ["÷", "×"] }
      ], vi);
      return chainFinish(row);
    }
    if (form === 1) {
      // flagship mixed chains with integers and mixed numbers (book Exploration 6)
      const row = pick([
        { terms: [{ t: "int", k: -72 }, { t: "mixed", s: 1, w: 2, n: 1, d: 4 }, { t: "frac", n: -4, d: 9 }, { t: "mixed", s: -1, w: 3, n: 3, d: 5 }], ops: ["×", "×", "÷"] },
        { terms: [{ t: "int", k: -5 }, { t: "mixed", s: -1, w: 1, n: 2, d: 7 }, { t: "frac", n: 4, d: 5 }, { t: "mixed", s: -1, w: 2, n: 1, d: 4 }, { t: "int", k: 7 }], ops: ["÷", "×", "×", "÷"] },
        { terms: [{ t: "int", k: -54 }, { t: "mixed", s: 1, w: 2, n: 1, d: 4 }, { t: "mixed", s: -1, w: 4, n: 1, d: 2 }, { t: "frac", n: 2, d: 9 }], ops: ["×", "÷", "×"] },
        { terms: [{ t: "int", k: 48 }, { t: "mixed", s: -1, w: 1, n: 1, d: 3 }, { t: "mixed", s: -1, w: 2, n: 2, d: 5 }, { t: "frac", n: -3, d: 8 }], ops: ["×", "÷", "×"] },
        { terms: [{ t: "int", k: -36 }, { t: "mixed", s: -1, w: 2, n: 1, d: 4 }, { t: "frac", n: -5, d: 12 }, { t: "mixed", s: 1, w: 1, n: 1, d: 2 }], ops: ["÷", "×", "×"] },
        { terms: [{ t: "mixed", s: 1, w: 2, n: 2, d: 3 }, { t: "frac", n: -9, d: 16 }, { t: "mixed", s: -1, w: 1, n: 1, d: 2 }, { t: "frac", n: -5, d: 6 }], ops: ["×", "÷", "÷"] }
      ], vi);
      return chainFinish(row);
    }
    if (form === 2) {
      // double division chains (book After Class 9-10)
      const row = pick([
        { terms: [{ t: "mixed", s: -1, w: 2, n: 2, d: 3 }, { t: "int", k: -4 }, { t: "frac", n: -2, d: 5 }], ops: ["÷", "÷"] },
        { terms: [{ t: "frac", n: 5, d: 8 }, { t: "frac", n: -5, d: 4 }, { t: "frac", n: -1, d: 6 }], ops: ["÷", "÷"] },
        { terms: [{ t: "frac", n: -16, d: 9 }, { t: "frac", n: 8, d: 3 }, { t: "frac", n: -2, d: 3 }], ops: ["÷", "÷"] },
        { terms: [{ t: "mixed", s: 1, w: 3, n: 3, d: 5 }, { t: "frac", n: -6, d: 25 }, { t: "mixed", s: -1, w: 1, n: 1, d: 2 }], ops: ["÷", "÷"] },
        { terms: [{ t: "mixed", s: -1, w: 4, n: 1, d: 2 }, { t: "frac", n: -3, d: 10 }, { t: "frac", n: 5, d: 9 }], ops: ["÷", "÷"] },
        { terms: [{ t: "frac", n: 2, d: 7 }, { t: "frac", n: -4, d: 21 }, { t: "frac", n: -3, d: 8 }], ops: ["÷", "÷"] }
      ], vi);
      return chainFinish(row);
    }
    // form 3: equivalent-expression choice (book Exploration 6 style) — always choice
    const row = pick([
      {
        terms: [{ t: "frac", n: -3, d: 4 }, { t: "frac", n: -1, d: 2 }, { t: "mixed", s: -1, w: 2, n: 1, d: 4 }], ops: ["×", "÷"],
        correct: `${MINUS}3/4 × (${MINUS}1/2) × (${MINUS}4/9)`,
        wrongs: [`${MINUS}3/4 × (${MINUS}1/2) × (${MINUS}9/4)`, `${MINUS}3/4 × 1/2 × (${MINUS}4/9)`, `(${MINUS}4/3) × (${MINUS}1/2) × (${MINUS}4/9)`]
      },
      {
        terms: [{ t: "frac", n: 5, d: 6 }, { t: "mixed", s: -1, w: 2, n: 2, d: 3 }, { t: "frac", n: -3, d: 5 }], ops: ["÷", "×"],
        correct: `5/6 × (${MINUS}3/8) × (${MINUS}3/5)`,
        wrongs: [`5/6 × (${MINUS}8/3) × (${MINUS}3/5)`, `5/6 × (${MINUS}3/8) × 3/5`, `(6/5) × (${MINUS}3/8) × (${MINUS}3/5)`]
      },
      {
        terms: [{ t: "mixed", s: -1, w: 1, n: 1, d: 2 }, { t: "frac", n: 9, d: 4 }, { t: "frac", n: -5, d: 6 }], ops: ["÷", "÷"],
        correct: `${MINUS}3/2 × 4/9 × (${MINUS}6/5)`,
        wrongs: [`${MINUS}3/2 × 9/4 × (${MINUS}5/6)`, `${MINUS}3/2 × 4/9 × 6/5`, `(${MINUS}2/3) × 4/9 × (${MINUS}6/5)`]
      },
      {
        terms: [{ t: "frac", n: -7, d: 8 }, { t: "frac", n: 4, d: 21 }, { t: "mixed", s: -1, w: 1, n: 1, d: 6 }], ops: ["×", "÷"],
        correct: `${MINUS}7/8 × 4/21 × (${MINUS}6/7)`,
        wrongs: [`${MINUS}7/8 × 4/21 × (${MINUS}7/6)`, `7/8 × 4/21 × (${MINUS}6/7)`, `${MINUS}7/8 × (21/4) × (${MINUS}6/7)`]
      },
      {
        terms: [{ t: "mixed", s: 1, w: 2, n: 1, d: 3 }, { t: "frac", n: -7, d: 9 }, { t: "frac", n: 3, d: 5 }], ops: ["÷", "×"],
        correct: `7/3 × (${MINUS}9/7) × 3/5`,
        wrongs: [`7/3 × (${MINUS}7/9) × 3/5`, `7/3 × (${MINUS}9/7) × (${MINUS}3/5)`, `(3/7) × (${MINUS}9/7) × 3/5`]
      },
      {
        terms: [{ t: "frac", n: -5, d: 12 }, { t: "mixed", s: -1, w: 2, n: 1, d: 2 }, { t: "frac", n: 4, d: 3 }], ops: ["÷", "÷"],
        correct: `${MINUS}5/12 × (${MINUS}2/5) × 3/4`,
        wrongs: [`${MINUS}5/12 × (${MINUS}5/2) × 4/3`, `5/12 × (${MINUS}2/5) × 3/4`, `${MINUS}5/12 × (${MINUS}2/5) × 4/3`]
      }
    ], vi);
    const ans = foldChain(row.terms, row.ops);
    const p = problemBase("chain-reaction", vi, "choice");
    p.prompt = `Which expression has the same value as ${exprStr(row.terms, row.ops)}?`;
    p.hint1 = "Dividing by a number gives the same result as multiplying by its reciprocal.";
    p.hint2 = "Flip each divisor into its reciprocal and change ÷ to ×. Keep every sign exactly where it was.";
    p.solution = `${exprStr(row.terms, row.ops)} = ${row.correct} = ${fstr(ans)}.`;
    p.visual = { type: "card", title: "flip every division", expr: exprStr(row.terms, row.ops), lines: ["÷ means × the reciprocal"], steps: [row.correct, `= ${fstr(ans)}`] };
    p.data = { form, terms: row.terms, ops: row.ops, ansValue: fstr(ans) };
    return finishChoice(p, row.correct, row.wrongs, ["1", MINUS + "1", "0"], vi);
  }

  /* ---------------- engine ---------------- */
  const GENERATORS = {
    "first-products": firstProductsProblem,
    "sign-detective": signDetectiveProblem,
    "flip-multiply": flipMultiplyProblem,
    "mixed-makeover": mixedMakeoverProblem,
    "factor-detective": factorDetectiveProblem,
    "chain-reaction": chainReactionProblem
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
      case "first-products": {
        if (d.form === 0) return exp === d.k * d.m;
        if (d.form === 1 || d.form === 2) return sameF(fmul(F(d.a, d.b), F(d.c, d.d)));
        return exp === d.b * d.t;
      }
      case "sign-detective": {
        if (d.form === 0) return exp === -d.a * d.b;
        if (d.form === 1) return exp === d.a * d.b;
        if (d.form === 2) {
          if (d.sub === 2) return exp === "0" && d.factors.includes(0);
          const prod = d.factors.map((f) => F(f.n, f.d)).reduce(fmul, F(1, 1));
          return prod.d === 1 && exp === prod.n;
        }
        return typeof exp === "string" && exp === d.correct;
      }
      case "flip-multiply": {
        if (d.form === 0) {
          const e = d.entry;
          const f = e.kind === "frac" ? F(e.n, e.d)
            : e.kind === "unit" ? F(1, e.d)
            : e.kind === "int" ? F(e.k, 1)
            : e.kind === "mixed" ? F(e.s * (e.w * e.d + e.n), e.d)
            : F(-e.n, e.d);
          return exp === fstr(F(f.d, f.n));
        }
        if (d.form === 1) {
          if (d.sub === 0) return sameF(fdiv(F(d.a, d.b), F(d.n, 1)));
          return sameF(fdiv(F(d.n, 1), F(d.sn * d.a, d.b)));
        }
        if (d.form === 2) return sameF(fdiv(F(d.a, d.b), F(d.c, d.d)));
        return sameF(fdiv(F(d.s1 * d.dn, d.dd), F(d.s2 * d.cn, d.cd)));
      }
      case "mixed-makeover": {
        if (d.form === 0) return sameF(F(d.s * (d.w * d.d + d.n), d.d));
        if (d.form === 1) return sameF(fmul(opVal(d.a), opVal(d.b)));
        if (d.form === 2) return sameF(fdiv(opVal(d.a), opVal(d.b)));
        return sameF(F(d.s * d.d, d.w * d.d + d.n));
      }
      case "factor-detective": {
        if (d.form === 0) return exp === d.a + d.b;
        if (d.form === 1) return typeof exp === "string" && exp === trioLabel([-d.x, -d.y, d.z]);
        if (d.form === 2) {
          const L = d.list, vals = [];
          for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) for (let k = j + 1; k < L.length; k++) vals.push(L[i] * L[j] * L[k]);
          vals.sort((a, b) => a - b);
          return exp === (d.wantLargest ? vals[vals.length - 1] : vals[0]);
        }
        if (d.sub === 0) return exp === (d.K % 2 === 1 ? "No" : "Yes");
        const wantOdd = d.word === "negative";
        const counts = [];
        for (let k = 0; k <= d.N; k++) if ((k % 2 === 1) === wantOdd) counts.push(k);
        return exp === countListStr(counts);
      }
      case "chain-reaction": {
        if (d.form === 3) return typeof exp === "string" && exp.length > 0 && fstr(foldChain(d.terms, d.ops)) === d.ansValue;
        return sameF(foldChain(d.terms, d.ops));
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
    if (v.type === "counters") {
      html = countersSvg(v, revealed).replace("</svg>", answer + "</svg>");
      text = revealed ? "Count every counter for the size — the sign rule gives the sign." : "Multiplication repeats a group: each row holds the same negative counters.";
    } else if (v.type === "grid") {
      html = gridSvg(v, revealed).replace("</svg>", answer + "</svg>");
      text = revealed ? "The double-shaded cells count the top of the answer." : "Shade one fraction each way — the overlap is the product.";
    } else if (v.type === "card") {
      html = cardSvg(v, revealed).replace("</svg>", answer + "</svg>");
      text = revealed ? "The card shows the worked steps." : "Convert, flip, cancel — the card tracks the plan.";
    }
    return { html, text };
  }

  /* ---------------- intro scenes ---------------- */
  const INTRO_SCENES = [
    {
      title: "Pip's Multiplier Machine",
      purpose: "Fraction × fraction as overlap on an area grid.",
      classicId: "first-products",
      variant: 2,
      caption: "Tops times tops, bottoms times bottoms — the overlap counts the answer.",
      durationMs: 21000,
      voiceover: "Welcome back to Pip's workshop! You already know counters from the depot — now meet the multiplier machine. Multiplying fractions means finding a fraction OF a fraction: two-thirds of three-quarters is the overlap of two shadings on this grid. Watch how the double-shaded cells count the answer: tops times tops, bottoms times bottoms."
    },
    {
      title: "The Sign Ladder",
      purpose: "Negative × negative is positive — count the negatives.",
      classicId: "sign-detective",
      variant: 1,
      caption: "One negative makes a negative; two negatives make a positive.",
      durationMs: 22000,
      voiceover: "Remember the thermometer from our very first mission? Multiplication has its own ladder. Negative five times two is negative ten; times one, negative five; times zero, zero. Each step climbs UP by five — so negative five times negative one must be positive five. One negative makes a negative; two negatives make a positive. Count the negatives and the sign is yours."
    },
    {
      title: "The Flip-O-Matic",
      purpose: "Division = multiplication by the reciprocal.",
      classicId: "flip-multiply",
      variant: 0,
      caption: "Keep the first, change ÷ to ×, flip the second.",
      durationMs: 20000,
      voiceover: "Officer Pip reporting for division duty! Here is the whole secret: dividing by a number is exactly the same as multiplying by its reciprocal — its upside-down flip. Keep the first number, change divide to times, flip the second number. Keep, change, flip! Three-quarters divided by eight becomes three-quarters times one-eighth. The Flip-O-Matic never misses."
    },
    {
      title: "Mixed Number Makeover",
      purpose: "Convert mixed numbers to improper fractions first.",
      classicId: "mixed-makeover",
      variant: 0,
      caption: "A mixed number hides an addition — convert it before anything else.",
      durationMs: 21000,
      voiceover: "Mixed numbers look friendly, but they are impostors hiding an addition: two and three-quarters secretly means two PLUS three-quarters. Never multiply or divide them as they are! Give every mixed number a makeover first — turn the whole part into quarters, add the top, and out pops eleven-quarters. Then multiply or flip as usual. Makeover first, always."
    },
    {
      title: "The Case of the Smallest Product",
      purpose: "Sign logic with card triples: two negatives can win.",
      classicId: "factor-detective",
      variant: 2,
      caption: "Two negatives multiply to a positive — use them wisely.",
      durationMs: 23000,
      voiceover: "Detective Pip has a new case! Kanga holds six cards — some negative, some positive — and wants the smallest possible product of three. Here is the twist: two negatives multiply to a positive, so the biggest result often pairs the two most negative cards with the biggest positive one. List the candidate triples, compute each, and the mystery solves itself."
    },
    {
      title: "Chain Reaction Champion",
      purpose: "Full mixed ×/÷ chains: convert, flip, count, cancel.",
      classicId: "chain-reaction",
      variant: 1,
      caption: "Convert, flip, count the negatives, cancel — in that order.",
      durationMs: 24000,
      voiceover: "Time for the championship chain: negative seventy-two times two and a quarter, times negative four-ninths, divided by negative three and three-fifths! Do not panic. Convert the mixed numbers, flip the division into multiplication, count the negatives — three, an odd count, so the answer is negative — then cancel mountains before multiplying. Champion move: cancel first, multiply last."
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
  root.RationalMultDivModule = api;
})(typeof window !== "undefined" ? window : globalThis);
