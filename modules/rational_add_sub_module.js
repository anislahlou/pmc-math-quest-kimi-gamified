/* Add & Subtract Rationals module (G1 Lesson 2, Think Academy G1M L1-L8 study book).
   Dialect A (train-style): CLASSICS + generateProblem + checkAnswer +
   renderProblemVisual + INTRO_SCENES + createRound.
   All generators are procedural with exact, audit-clean answers (integer or
   exact 1-2 dp decimals; fraction answers are always choice-mode strings).
   Distractors target the lesson's known misconceptions: sign-of-the-winner,
   forgot-to-flip subtraction, add-magnitudes, displacement vs distance,
   and wrong-operation reversals (book Explorations 1-6, After Class 1-10). */
(function (root) {
  "use strict";

  const CLASSICS = [
    { id: "counter-sum", nickname: "Counter Sum", skill: "Add integers with red (+1) and blue (−1) counters, using zero pairs.", sourcePages: "Book 24-25 / PDF 32-33" },
    { id: "sign-mixer", nickname: "Sign Mixer", skill: "Add rationals with the same or different signs — decimals and fractions.", sourcePages: "Book 25-26 / PDF 33-34" },
    { id: "subtract-negative", nickname: "Double-Negative Switch", skill: "Subtract rationals by adding the opposite: a − (−b) = a + b.", sourcePages: "Book 27-29 / PDF 35-37" },
    { id: "smart-pairing", nickname: "Smart Pairing", skill: "Evaluate multi-term chains by pairing inverses and friendly numbers first.", sourcePages: "Book 27+29 / PDF 35+37" },
    { id: "wrong-operation", nickname: "Oops! Wrong Operation", skill: "Undo a wrong operation: added instead of subtracted (or the reverse).", sourcePages: "Book 26+33 / PDF 34+41" },
    { id: "patrol-route", nickname: "The Patrol Route", skill: "Use signed sums for direction/displacement and total distance in stories.", sourcePages: "Book 33 / PDF 41" },
    { id: "bracket-nest", nickname: "Bracket Nest", skill: "Evaluate nested brackets with negative numbers, inside out.", sourcePages: "Book 30+34 / PDF 38+42" }
  ];
  const CLASSIC_IDS = CLASSICS.map((c) => c.id);
  const CLASSIC_BY_ID = Object.fromEntries(CLASSICS.map((c) => [c.id, c]));
  const CLASSIC_SKILLS = {
    "counter-sum": "Add integers with counters",
    "sign-mixer": "Add signed decimals & fractions",
    "subtract-negative": "Subtract = add the opposite",
    "smart-pairing": "Pair first, then compute",
    "wrong-operation": "Undo the wrong operation",
    "patrol-route": "Signed sums in stories",
    "bracket-nest": "Nested brackets"
  };
  const SOURCE_COVERAGE = {
    "counter-sum": ["Learn and Discover counters 1-2 (book 24-25)"],
    "sign-mixer": ["Exploration 1 (book 26)", "Notes additive-inverse split (book 25)"],
    "subtract-negative": ["Learn and Discover removal (book 27)", "Notes simplify signs (book 28)", "Exploration 4 + Practice (book 28-29)"],
    "smart-pairing": ["Exploration 3 (book 27)", "Exploration 5 (book 29)", "After Class 7-8 (book 32-33)"],
    "wrong-operation": ["Exploration 2 Jenny (book 26)", "After Class 10 Wilson (book 33)"],
    "patrol-route": ["After Class 9 motorcycle patrol (book 33)"],
    "bracket-nest": ["Exploration 6 (book 30)", "Extensive Exercises 3 (book 34)"]
  };
  const INTRO_SCENE_MS = 20000;
  const ROUND_LENGTH = 7;

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

  /* ---------------- generic SVG bits ---------------- */
  const NAVY = "#16345d", CORAL = "#ff7654", TEAL = "#0b8993", AMBER = "#e8a20c", PURPLE = "#7a4fd0";
  const RED = "#ff8a94", BLUE = "#7fb7ff";
  function svgShell(inner) {
    return `<svg viewBox="0 0 560 330" role="img" aria-label="Problem visual">${inner}</svg>`;
  }
  // Number line (same contract as rational_numbers): cfg {min,max,unit,sub,points,arcs,brace,note}
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
  // Red/blue counter chips. v = {groups:[{n: signed int}], cancel, note}
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
  // White working card. v = {title, expr, lines[], steps[] (shown when revealed)}
  function cardSvg(v, revealed) {
    let s = `<rect x="0" y="0" width="560" height="330" fill="#f4f9ff"/>`;
    s += `<rect x="52" y="50" width="456" height="230" rx="20" fill="white" stroke="${NAVY}" stroke-width="4"/>`;
    if (v.title) s += `<text x="280" y="88" text-anchor="middle" font-size="15" font-weight="bold" fill="${PURPLE}">${escapeHtml(v.title)}</text>`;
    s += `<text x="280" y="${v.title ? 132 : 118}" text-anchor="middle" font-size="24" font-weight="800" fill="${NAVY}">${escapeHtml(v.expr)}</text>`;
    const rows = (revealed && v.steps ? v.steps : v.lines || []).slice(0, 4);
    rows.forEach((ln, i) => {
      s += `<text x="280" y="${178 + i * 26}" text-anchor="middle" font-size="16" fill="${revealed && v.steps ? TEAL : "#4a5578"}" ${revealed && v.steps ? 'font-weight="bold"' : ""}>${escapeHtml(ln)}</text>`;
    });
    return svgShell(s);
  }

  /* ---------------- 1. counter-sum ---------------- */
  function counterSumProblem(vi) {
    const form = vi % 4;
    const useChoice = form === 3 || vi % 2 === 0;
    const p = problemBase("counter-sum", vi, useChoice ? "choice" : "filled");
    if (form === 0) {
      // same sign: both negative
      const a = pick([3, 5, 7, 4, 8, 6, 9, 2], vi);
      const b = pick([5, 8, 6, 3, 9, 4, 7, 10], vi * 2 + 1);
      const expected = -(a + b);
      p.prompt = `Work out ${sx(-a)} + (${sx(-b)}).`;
      p.hint1 = "Blue counter plus blue counter means MORE negative — add the sizes, keep the sign.";
      p.hint2 = `The total size is ${a} + ${b}.`;
      p.solution = `Same sign: add the sizes (${a} + ${b} = ${a + b}) and keep the negative sign, so the total is ${sx(expected)}.`;
      p.visual = { type: "counters", groups: [{ n: -a }, { n: -b }], cancel: 0, note: "blue + blue = more blue" };
      p.data = { form, a, b };
      return finishNumeric(p, expected, [a + b, -Math.abs(a - b), -(a + b) + 2], [expected - 2, expected + 1, 0], useChoice, vi);
    }
    if (form === 1) {
      // different signs with zero-pair cancellation
      const pairs = [[5, 3], [3, 5], [7, 4], [2, 6], [8, 5], [4, 9], [6, 2], [9, 7], [5, 8], [7, 3]];
      const [a, b] = pick(pairs, vi);
      const expected = a - b;
      p.prompt = `Work out ${a} + (${sx(-b)}).`;
      p.hint1 = "Pair every red counter with a blue one — each zero pair disappears. Count what is left.";
      p.hint2 = `${Math.min(a, b)} zero pairs cancel, leaving ${Math.abs(expected)} counter${Math.abs(expected) === 1 ? "" : "s"} of one colour.`;
      p.solution = `${Math.min(a, b)} zero pairs cancel out. The ${a > b ? "red" : "blue"} counters win, leaving ${sx(expected)}. Different signs: subtract the sizes and take the sign of the bigger side.`;
      p.visual = { type: "counters", groups: [{ n: a }, { n: -b }], cancel: Math.min(a, b), note: "pair reds with blues" };
      p.data = { form, a, b };
      return finishNumeric(p, expected, [b - a, a + b, 0], [expected + 2, expected - 2, 1], useChoice, vi);
    }
    if (form === 2) {
      // missing addend: s + ? = t
      const s = pick([-4, -6, 3, -2, 5, -8, 7, -3], vi);
      const d = pick([-3, -5, -7, 4, -6, -2, 6, -4], vi * 3 + 1);
      const t = s + d;
      p.prompt = `What number completes this? ${sx(s)} + ? = ${sx(t)}`;
      p.hint1 = "Count how far and in which direction you must travel from the first number to the target.";
      p.hint2 = `From ${sx(s)} to ${sx(t)} is a move of ${sx(t - s)}.`;
      p.solution = `? = ${sx(t)} − (${sx(s)}) = ${sx(d)}. Adding ${sx(d)} to ${sx(s)} lands on ${sx(t)}.`;
      p.visual = { type: "counters", groups: [{ n: s }], cancel: 0, note: `target total: ${sx(t)}` };
      p.data = { form, s, d, t };
      return finishNumeric(p, d, [-d, t, s], [d + 2, d - 2, 0], useChoice, vi);
    }
    // form 3: equal red and blue — total zero (always choice)
    const n = pick([3, 4, 5, 6, 7, 8], vi);
    p.prompt = `Pip tips ${n} red counters and ${n} blue counters into the same pot. What is the total?`;
    p.hint1 = "Every red counter grabs a blue partner and they vanish as a zero pair.";
    p.hint2 = `${n} zero pairs cancel — is anything left over?`;
    p.solution = `${n} red and ${n} blue make ${n} zero pairs, and every pair cancels. The total is 0 — this is why a number plus its additive inverse is zero.`;
    p.visual = { type: "counters", groups: [{ n }, { n: -n }], cancel: n, note: "what is left over?" };
    p.data = { form, n };
    p.expected = "0";
    p.expectedDisplay = "0";
    p.correctInput = { choice: "0" };
    p.choices = makeChoices("0", [sx(n), sx(-n), sx(2 * n)], ["1", MINUS + "1", "2"], vi);
    return p;
  }

  /* ---------------- 2. sign-mixer ---------------- */
  function signMixerProblem(vi) {
    const form = vi % 4;
    const useChoice = form === 2 || vi % 2 === 0; // fraction form is always choice
    const p = problemBase("sign-mixer", vi, useChoice ? "choice" : "filled");
    if (form === 0 || form === 1) {
      const bothNeg = form === 1;
      const t = pick([16, 23, 35, 42, 51, 66, 27, 58], vi);          // u = t/10
      const w = pick([27, 34, 15, 62, 49, 71, 38, 26], vi * 2 + 1);  // v = w/10
      if (t === w) return signMixerProblem(vi + 1);
      const u = t / 10, v = w / 10;
      const expectedH = bothNeg ? -(t + w) : w - t;                  // exact in tenths
      const expected = expectedH / 10;
      p.prompt = bothNeg ? `Work out (${sx(-u)}) + (${sx(-v)}).` : `Work out (${sx(-u)}) + ${mag(v)}.`;
      p.hint1 = bothNeg
        ? "Same sign: add the sizes and keep the sign."
        : "Different signs: subtract the sizes — the bigger size wins the sign.";
      p.hint2 = bothNeg ? `Sizes: ${mag(u)} + ${mag(v)}.` : `Bigger size ${mag(Math.max(u, v))} minus smaller size ${mag(Math.min(u, v))}; ${v > u ? "positive wins" : "negative wins"}.`;
      p.solution = bothNeg
        ? `Both negative: ${mag(u)} + ${mag(v)} = ${mag(expected)}, sign stays negative: ${sx(expected)}.`
        : `${mag(Math.max(u, v))} − ${mag(Math.min(u, v))} = ${mag(expected)}, and the bigger size is ${v > u ? "positive" : "negative"}, so the answer is ${sx(expected)}.`;
      const hopMin = Math.floor(Math.min(0, -u, expected)) - 1;
      const hopMax = Math.ceil(Math.max(0, -u, expected)) + 1;
      p.visual = {
        type: "line", min: hopMin, max: hopMax, unit: 1, sub: 2,
        points: [{ v: expected, label: "?", color: CORAL, secret: true }],
        arcs: [{ from: 0, to: -u, text: sx(-u), color: BLUE }, ...(bothNeg ? [{ from: -u, to: expected, text: sx(-v), color: BLUE }] : [{ from: -u, to: expected, text: "+" + mag(v), color: TEAL }])]
      };
      p.data = { form, t, w };
      const wrongs = bothNeg
        ? [sx((t + w) / 10), sx((w - t) / 10), sx((t - w) / 10)]
        : [sx((t - w) / 10), sx((t + w) / 10), sx(-(t + w) / 10)];
      return finishNumeric(p, expected, wrongs, [sx(expected + 1), sx(expected - 1), "0"], useChoice, vi);
    }
    if (form === 2) {
      // fractions, same denominator, different signs — choice mode
      const den = pick([7, 9, 11, 8, 13, 6], vi);
      let n1 = pick([5, 3, 6, 2, 7, 4], vi * 2 + 1) % (den - 1) + 1;
      let n2 = pick([2, 4, 1, 5, 3, 6], vi + 2) % (den - 1) + 1;
      if (n1 === n2) n2 = (n2 % (den - 1)) + 1;
      const rn = n1 - n2; // may be negative
      const correct = fracStr(rn, den);
      const gAdd = gcd(n1 + n2, den);
      const wrongs = [fracStr(-rn, den), fracStr(n1 + n2, den), `${fracStr(rn, den * 2)}`];
      p.prompt = `Work out ${fracStr(n1, den)} + (${fracStr(-n2, den)}).`;
      p.hint1 = "Same denominator: just combine the numerators. The denominator stays put.";
      p.hint2 = `${n1} − ${n2} = ${rn} over ${den}.`;
      p.solution = `${fracStr(n1, den)} + (${fracStr(-n2, den)}) has the same denominator, so combine numerators: ${n1} − ${n2} = ${rn}. Answer: ${correct}${gcd(rn, den) > 1 ? ` (already simplified from ${rn}/${den})` : ""}.`;
      p.visual = { type: "card", title: "same denominator — combine tops", expr: `${fracStr(n1, den)} + (${fracStr(-n2, den)})`, lines: [`denominator stays ${den}`, `tops: ${n1} − ${n2}`], steps: [`tops: ${n1} − ${n2} = ${rn}`, `answer: ${correct}`] };
      p.data = { form, n1, n2, den };
      p.expected = correct;
      p.expectedDisplay = correct;
      p.correctInput = { choice: correct };
      p.choices = makeChoices(correct, wrongs, ["1", MINUS + "1", "0"], vi);
      return p;
    }
    // form 3: decimal + nice fraction (book Exploration 1 style)
    const t = pick([51, 23, 63, 34, 46, 72], vi);            // decimal t/10
    const fr = pick([{ w: 1, n: 2, d: 5 }, { w: 0, n: 1, d: 2 }, { w: 1, n: 1, d: 4 }, { w: 0, n: 3, d: 4 }, { w: 2, n: 1, d: 5 }, { w: 1, n: 3, d: 4 }], vi * 3 + 1);
    const fracH = fr.w * 100 + (fr.n * 100) / fr.d;        // fraction value in hundredths
    const decH = t * 10;                                    // decimal in hundredths
    const negDec = vi % 2 === 1;                            // decimal is negative?
    const expectedH = (negDec ? -decH : decH) + (negDec ? fracH : -fracH);
    const expected = expectedH / 100;
    const fracDisp = (fr.w ? `${fr.w} ` : "") + `${fr.n}/${fr.d}`;
    const decDisp = sx((negDec ? -1 : 1) * t / 10);
    p.prompt = `Work out (${decDisp}) + ${negDec ? fracDisp : MINUS + fracDisp}.`;
    p.hint1 = "Turn the fraction into a decimal first — halves, quarters and fifths are all friendly.";
    p.hint2 = `${fracDisp} = ${mag(fracH / 100)}. Then combine signs: different signs means subtract sizes.`;
    p.solution = `${fracDisp} = ${mag(fracH / 100)}, so this is ${decDisp} ${negDec ? "+" : MINUS} ${mag(fracH / 100)}. Different signs: ${(Math.max(decH, fracH)) / 100} − ${(Math.min(decH, fracH)) / 100} = ${mag(expected)}, sign of the bigger size: ${sx(expected)}.`;
    p.visual = { type: "card", title: "fraction → decimal first", expr: `${decDisp} + ${negDec ? fracDisp : MINUS + fracDisp}`, lines: [`${fracDisp} = ${mag(fracH / 100)}`, "then subtract the sizes"], steps: [`${fracDisp} = ${mag(fracH / 100)}`, `${(Math.max(decH, fracH)) / 100} − ${(Math.min(decH, fracH)) / 100} = ${mag(expected)}`, `bigger side is ${negDec ? "negative" : "…check the sign!"}`, `answer: ${sx(expected)}`] };
    p.data = { form, t, fr, negDec };
    const wrongs = [
      sx(-expected), // flipped the winning sign
      sx(((negDec ? -1 : 1) * (decH + fracH)) / 100), // added the sizes instead of subtracting
      sx(((negDec ? -decH : decH) + (negDec ? fr.w * 100 : -fr.w * 100)) / 100) // used only the whole part of the fraction
    ];
    return finishNumeric(p, expected, wrongs, [sx(expected + 1), sx(expected - 1), "0"], useChoice, vi);
  }

  /* ---------------- 3. subtract-negative ---------------- */
  function subtractNegativeProblem(vi) {
    const form = vi % 4;
    const useChoice = form === 3 || vi % 2 === 0;
    const p = problemBase("subtract-negative", vi, useChoice ? "choice" : "filled");
    if (form === 0) {
      const a = pick([12, -8, 7, -3, 15, -11, 5, 9], vi);
      const b = pick([6, 50, 4, 9, 12, 7, 3, 11], vi * 2 + 1);
      const expected = a + b;
      p.prompt = `Work out ${sx(a)} − (${sx(-b)}).`;
      p.hint1 = "Two minus signs in a row switch to a plus: subtracting a negative adds its opposite.";
      p.hint2 = `${sx(a)} − (${sx(-b)}) becomes ${sx(a)} + ${b}.`;
      p.solution = `${sx(a)} − (${sx(-b)}) = ${sx(a)} + ${b} = ${sx(expected)}. Taking away blue counters is like adding red ones.`;
      p.visual = { type: "card", title: "double negative switch", expr: `${sx(a)} − (${sx(-b)})`, lines: ["− (−b) switches to + b", `= ${sx(a)} + ${b}`], steps: [`− (${sx(-b)}) switches to + ${b}`, `${sx(a)} + ${b} = ${sx(expected)}`] };
      p.data = { form, a, b };
      return finishNumeric(p, expected, [a - b, -(a + b), b - a], [expected + 2, expected - 2, 0], useChoice, vi);
    }
    if (form === 1) {
      const a = pick([28, 17, 50, 9, 35, 12, 44, 21], vi);
      const b = pick([6, 30, 12, 4, 15, 8, 20, 11], vi + 3);
      if (a === b) return subtractNegativeProblem(vi + 1);
      const expected = -a + b;
      p.prompt = `Work out (${sx(-a)}) − (${sx(-b)}).`;
      p.hint1 = "Switch −(−b) to + b first, then you have a different-signs addition.";
      p.hint2 = `(${sx(-a)}) + ${b}: different signs, subtract the sizes.`;
      p.solution = `(${sx(-a)}) − (${sx(-b)}) = (${sx(-a)}) + ${b}. Different signs: ${a} − ${b} = ${Math.abs(expected)} in size, and the bigger size (${Math.max(a, b)}) is ${a > b ? "negative" : "positive"}, so ${sx(expected)}.`;
      p.visual = { type: "card", title: "switch, then add", expr: `(${sx(-a)}) − (${sx(-b)})`, lines: [`= (${sx(-a)}) + ${b}`, "different signs: subtract sizes"], steps: [`= (${sx(-a)}) + ${b}`, `${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.abs(expected)}`, `answer: ${sx(expected)}`] };
      p.data = { form, a, b };
      return finishNumeric(p, expected, [-(a + b), a + b, a - b], [expected + 2, expected - 2, 0], useChoice, vi);
    }
    if (form === 2) {
      // decimals: u − (−v) or (−u) − (+v)
      const t = pick([134, 57, 36, 204, 88, 46], vi);   // u = t/10
      const w = pick([67, 29, 28, 53, 19, 35], vi * 2); // v = w/10
      const u = t / 10, v = w / 10;
      const negFirst = vi % 2 === 1;
      const expected = negFirst ? -(t + w) / 100 * 10 : (t + w) / 10;
      p.prompt = negFirst ? `Work out (${sx(-u)}) − (+${mag(v)}).` : `Work out ${mag(u)} − (${sx(-v)}).`;
      p.hint1 = negFirst ? "−(+v) is just −v: a minus followed by a plus gives a minus." : "−(−v) switches to +v: two negatives make a positive.";
      p.hint2 = negFirst ? `(${sx(-u)}) − ${mag(v)}: same sign, add sizes.` : `${mag(u)} + ${mag(v)}.`;
      p.solution = negFirst
        ? `(${sx(-u)}) − (+${mag(v)}) = (${sx(-u)}) + (${sx(-v)}) = ${sx(expected)} — same sign, add the sizes and keep it negative.`
        : `${mag(u)} − (${sx(-v)}) = ${mag(u)} + ${mag(v)} = ${sx(expected)} — the double negative switches to a plus.`;
      p.visual = { type: "card", title: "simplify the signs first", expr: negFirst ? `(${sx(-u)}) − (+${mag(v)})` : `${mag(u)} − (${sx(-v)})`, lines: [negFirst ? "−(+) becomes −" : "−(−) becomes +", negFirst ? `= (${sx(-u)}) − ${mag(v)}` : `= ${mag(u)} + ${mag(v)}`], steps: [negFirst ? `= (${sx(-u)}) − ${mag(v)}` : `= ${mag(u)} + ${mag(v)}`, `answer: ${sx(expected)}`] };
      p.data = { form, t, w, negFirst };
      const wrongs = negFirst
        ? [sx((w - t) / 10), sx((t - w) / 10), sx((t + w) / 10)]
        : [sx((t - w) / 10), sx((w - t) / 10), sx(-(t + w) / 10)];
      return finishNumeric(p, expected, wrongs, [sx(expected + 1), sx(expected - 1), "0"], useChoice, vi);
    }
    // form 3: which expression is equivalent (always choice)
    const a = pick([2, 5, 8, 3, 11, 7], vi);
    const b = pick([1, 4, 6, 9, 2, 10], vi + 2);
    const plusForm = vi % 2 === 1; // a + (−b) instead of a − (−b)
    const expr = plusForm ? `${a} + (${sx(-b)})` : `${a} − (${sx(-b)})`;
    const correct = plusForm ? `${a} − ${b}` : `${a} + ${b}`;
    const wrongs = plusForm
      ? [`${a} + ${b}`, `${MINUS}${a} − ${b}`, `${MINUS}${a} + ${b}`]
      : [`${a} − ${b}`, `${MINUS}${a} + ${b}`, `${MINUS}${a} − ${b}`];
    p.prompt = `Which expression has the same value as ${expr}?`;
    p.hint1 = plusForm ? "A plus followed by a minus gives a minus." : "Two negatives make a positive.";
    p.hint2 = plusForm ? `+ (${sx(-b)}) means subtract ${b}.` : `− (${sx(-b)}) means add ${b}.`;
    p.solution = plusForm
      ? `+ (${sx(-b)}) simplifies to − ${b}, so ${expr} = ${correct}.`
      : `− (${sx(-b)}) simplifies to + ${b}, so ${expr} = ${correct}.`;
    p.visual = { type: "card", title: "simplify adjacent signs", expr, lines: [plusForm ? "+(−) → −" : "−(−) → +"], steps: [`${expr} = ${correct}`] };
    p.data = { form, a, b, plusForm };
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = makeChoices(correct, wrongs, [`${a}`, `${MINUS}${a}`, "0"], vi);
    return p;
  }

  /* ---------------- 4. smart-pairing ---------------- */
  function smartPairingProblem(vi) {
    const form = vi % 4;
    const useChoice = form === 3 || vi % 2 === 0;
    const p = problemBase("smart-pairing", vi, useChoice ? "choice" : "filled");
    if (form === 0) {
      // integer chain with a friendly pair summing to a round ten
      const pairs = [[8, 12], [13, 17], [24, 16], [29, 11], [36, 14], [27, 23], [45, 15], [19, 21]];
      const [a, b] = pick(pairs, vi);
      const c = pick([6, 5, 8, 4, 9, 3, 7, 10], vi + 1);
      const d = pick([5, 8, 3, 10, 6, 4, 7, 9], vi * 2 + 2);
      const expected = a + b - c - d;
      p.prompt = `Work out ${a} + ${b} + (${sx(-c)}) + (${sx(-d)}).`;
      p.hint1 = "Hunt for a friendly pair first: two numbers that make a round ten.";
      p.hint2 = `${a} + ${b} = ${a + b}. Then subtract ${c} and ${d}.`;
      p.solution = `Pair the friends: ${a} + ${b} = ${a + b}. Negatives together: ${c} + ${d} = ${c + d}. So ${a + b} − ${c + d} = ${sx(expected)}.`;
      p.visual = { type: "card", title: "pair the friends first", expr: `${a} + ${b} + (${sx(-c)}) + (${sx(-d)})`, lines: [`${a} + ${b} = ${a + b}`, `negatives: ${c} + ${d} = ${c + d}`], steps: [`${a} + ${b} = ${a + b}`, `${c} + ${d} = ${c + d}`, `${a + b} − ${c + d} = ${sx(expected)}`] };
      p.data = { form, a, b, c, d };
      return finishNumeric(p, expected, [a + b + c + d, a + b + c - d, a + b - c + d], [expected + 2, expected - 2, 0], useChoice, vi);
    }
    if (form === 1) {
      // decimals with an exact inverse pair hiding inside
      const t = pick([35, 46, 12, 58, 24, 71], vi);        // u = t/10
      const v = pick([78, 25, 92, 40, 66, 31], vi + 2);    // v = v10/10
      const w = pick([20, 45, 38, 16, 50, 27], vi * 3);    // w = w10/10
      if (v === w) return smartPairingProblem(vi + 4);
      const u = t / 10, vv = v / 10, ww = w / 10;
      const expected = (v - w) / 10;
      p.prompt = `Work out ${sx(-u)} + ${mag(vv)} + (${sx(-ww)}) + ${mag(u)}.`;
      p.hint1 = "Two of these numbers are exact opposites — they cancel to zero. Find them first.";
      p.hint2 = `${sx(-u)} and ${mag(u)} make zero. What remains?`;
      p.solution = `${sx(-u)} + ${mag(u)} = 0 (additive inverses), leaving ${mag(vv)} − ${mag(ww)} = ${sx(expected)}.`;
      p.visual = { type: "card", title: "spot the zero pair", expr: `${sx(-u)} + ${mag(vv)} + (${sx(-ww)}) + ${mag(u)}`, lines: [`${sx(-u)} + ${mag(u)} = 0`, `left with ${mag(vv)} − ${mag(ww)}`], steps: [`${sx(-u)} + ${mag(u)} = 0`, `${mag(vv)} − ${mag(ww)} = ${sx(expected)}`] };
      p.data = { form, t, v, w };
      return finishNumeric(p, expected, [(v + w) / 10, (v - w) / 10 + 2 * u, (v - w) / 10 - 2 * u], [expected + 1, expected - 1, 0], useChoice, vi);
    }
    if (form === 2) {
      // mixed chain with parenthesised signs (book Exploration 5)
      const pp = pick([12, 20, 7, 15, 9, 18], vi);
      const q = pick([18, 3, 14, 6, 11, 5], vi + 1);
      const r = pick([7, 5, 10, 4, 8, 6], vi * 2);
      let s = pick([15, 7, 13, 2, 9, 12], vi + 3);
      const expected = -pp + q - r - s;
      const w1 = -pp - q - r - s;             // forgot to flip −(−q)
      const w2 = -pp + q + r - s;             // treated +(−r) as +r
      let w3 = -pp - q + r + s;               // flipped everything the wrong way
      while ([expected, w1, w2].includes(w3)) { s += 1; w3 = -pp - q + r + s; }
      p.prompt = `Work out ${sx(-pp)} − (${sx(-q)}) + (${sx(-r)}) − ${s}.`;
      p.hint1 = "Simplify the signs first: −(−q) becomes +q, and +(−r) becomes −r.";
      p.hint2 = `It becomes ${sx(-pp)} + ${q} − ${r} − ${s}.`;
      p.solution = `${sx(-pp)} − (${sx(-q)}) + (${sx(-r)}) − ${s} simplifies to ${sx(-pp)} + ${q} − ${r} − ${s} = ${sx(expected)}.`;
      p.visual = { type: "card", title: "simplify signs, then pair", expr: `${sx(-pp)} − (${sx(-q)}) + (${sx(-r)}) − ${s}`, lines: [`= ${sx(-pp)} + ${q} − ${r} − ${s}`], steps: [`= ${sx(-pp)} + ${q} − ${r} − ${s}`, `= ${sx(expected)}`] };
      p.data = { form, pp, q, r, s };
      return finishNumeric(p, expected, [w1, w2, w3], [expected + 2, expected - 2, 0], useChoice, vi);
    }
    // form 3: which pair adds to zero (always choice)
    const x = pick([7, 12, 5, 9, 14, 6], vi);
    const y = pick([3, 8, 11, 2, 13, 4], vi + 1);
    const z = pick([10, 5, 6, 15, 3, 8], vi * 2 + 1);
    const correct = `${sx(x)} and ${sx(-x)}`;
    p.prompt = `Look at these four numbers: ${sx(x)}, ${sx(-x)}, ${sx(y)}, ${sx(-z)}. Which two add to exactly zero?`;
    p.hint1 = "Zero comes from a number plus its own mirror image.";
    p.hint2 = `The mirror of ${sx(x)} is ${sx(-x)}.`;
    p.solution = `${sx(x)} + (${sx(-x)}) = 0 — additive inverses always cancel each other.`;
    p.visual = { type: "line", min: -Math.max(x, y, z) - 2, max: Math.max(x, y, z) + 2, unit: Math.max(1, Math.ceil(Math.max(x, y, z) / 7)), sub: 1, points: [{ v: x, label: sx(x), color: TEAL }, { v: -x, label: sx(-x), color: CORAL, secret: true }, { v: y, label: sx(y), color: AMBER }, { v: -z, label: sx(-z), color: PURPLE }] };
    p.data = { form, x, y, z };
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = makeChoices(correct, [`${sx(x)} and ${sx(y)}`, `${sx(-x)} and ${sx(-z)}`, `${sx(y)} and ${sx(-z)}`], [`${sx(x)} and ${sx(-z)}`, `${sx(-x)} and ${sx(y)}`, "none of them"], vi);
    return p;
  }

  /* ---------------- 5. wrong-operation ---------------- */
  function wrongOperationProblem(vi) {
    const form = vi % 4;
    const useChoice = form === 3 || vi % 2 === 0;
    const p = problemBase("wrong-operation", vi, useChoice ? "choice" : "filled");
    if (form === 0 || form === 1) {
      const addedInstead = form === 1; // Wilson: meant to subtract, added instead
      const k = pick([26, 8, 15, 12, 20, 9, 17, 30], vi);
      const R = pick([-14, -20, 6, -8, 12, -3, 18, -25], vi * 2 + 1);
      // meant: x ± k; did the opposite and got R. corrected = R ± 2k
      const expected = addedInstead ? R - 2 * k : R + 2 * k;
      const mystery = addedInstead ? R - k : R + k;
      const who = pick(["Pip", "Jenny", "Wilson", "Ada"], vi);
      p.prompt = addedInstead
        ? `${who} had to subtract ${k} from a mystery number. Instead ${who} ADDED ${k} and got ${sx(R)}. What should the answer have been?`
        : `${who} had to add ${k} to a mystery number. Instead ${who} SUBTRACTED ${k} and got ${sx(R)}. What should the answer have been?`;
      p.hint1 = "First work backwards to find the mystery number, then do the correct operation.";
      p.hint2 = addedInstead ? `Mystery number = ${sx(R)} − ${k} = ${sx(mystery)}.` : `Mystery number = ${sx(R)} + ${k} = ${sx(mystery)}.`;
      p.solution = addedInstead
        ? `Mystery number: ${sx(R)} − ${k} = ${sx(mystery)}. Correct move: ${sx(mystery)} − ${k} = ${sx(expected)}. The wrong button threw the answer off by ${2 * k}!`
        : `Mystery number: ${sx(R)} + ${k} = ${sx(mystery)}. Correct move: ${sx(mystery)} + ${k} = ${sx(expected)}. The wrong button threw the answer off by ${2 * k}!`;
      p.visual = { type: "card", title: "undo the oops, then redo it right", expr: addedInstead ? `? + ${k} = ${sx(R)}` : `? − ${k} = ${sx(R)}`, lines: [`mystery number: ${sx(mystery)}`, addedInstead ? `then subtract ${k}` : `then add ${k}`], steps: [`mystery = ${sx(mystery)}`, `${sx(mystery)} ${addedInstead ? "−" : "+"} ${k} = ${sx(expected)}`] };
      p.data = { form, k, R, addedInstead };
      return finishNumeric(p, expected, [R, mystery, addedInstead ? R + 2 * k : R - 2 * k], [expected + 2, expected - 2, 0], useChoice, vi);
    }
    if (form === 2) {
      // decimal version (1 dp exact)
      const t = pick([25, 45, 15, 65, 35, 55], vi);        // k = t/10
      const r10 = pick([-45, -20, 15, -80, 30, -10], vi + 2); // R = r10/10
      const k = t / 10, R = r10 / 10;
      const addedInstead = vi % 4 === 2; // deterministic from variant
      const expectedH = addedInstead ? r10 - 2 * t : r10 + 2 * t;
      const expected = expectedH / 10;
      const mystery = (addedInstead ? r10 - t : r10 + t) / 10;
      p.prompt = addedInstead
        ? `Pip had to subtract ${mag(k)} from a number. Instead he added ${mag(k)} and got ${sx(R)}. What should he have obtained?`
        : `Pip had to add ${mag(k)} to a number. Instead he subtracted ${mag(k)} and got ${sx(R)}. What should he have obtained?`;
      p.hint1 = "Work backwards from the wrong result to find the number, then apply the correct operation.";
      p.hint2 = addedInstead ? `Number = ${sx(R)} − ${mag(k)} = ${sx(mystery)}.` : `Number = ${sx(R)} + ${mag(k)} = ${sx(mystery)}.`;
      p.solution = addedInstead
        ? `Number: ${sx(R)} − ${mag(k)} = ${sx(mystery)}. Correct: ${sx(mystery)} − ${mag(k)} = ${sx(expected)}.`
        : `Number: ${sx(R)} + ${mag(k)} = ${sx(mystery)}. Correct: ${sx(mystery)} + ${mag(k)} = ${sx(expected)}.`;
      p.visual = { type: "card", title: "undo, then redo", expr: addedInstead ? `? + ${mag(k)} = ${sx(R)}` : `? − ${mag(k)} = ${sx(R)}`, lines: [`number: ${sx(mystery)}`], steps: [`number = ${sx(mystery)}`, `${sx(mystery)} ${addedInstead ? "−" : "+"} ${mag(k)} = ${sx(expected)}`] };
      p.data = { form, t, r10, addedInstead };
      return finishNumeric(p, expected, [R, mystery, (addedInstead ? r10 + 2 * t : r10 - 2 * t) / 10], [expected + 1, expected - 1, 0], useChoice, vi);
    }
    // form 3: find the MYSTERY NUMBER (choice)
    const k = pick([8, 12, 5, 15, 9, 20], vi);
    const R = pick([-20, 6, -14, 10, -6, 3], vi + 1);
    const addedInstead = vi % 2 === 1;
    const mystery = addedInstead ? R - k : R + k;
    const corrected = addedInstead ? R - 2 * k : R + 2 * k;
    const correct = sx(mystery);
    p.prompt = addedInstead
      ? `Ada meant to subtract ${k} from a number, but she added ${k} and got ${sx(R)}. What WAS the number?`
      : `Ada meant to add ${k} to a number, but she subtracted ${k} and got ${sx(R)}. What WAS the number?`;
    p.hint1 = "Undo what she actually did: run the wrong operation in reverse.";
    p.hint2 = addedInstead ? `She added ${k}, so undo it: ${sx(R)} − ${k}.` : `She subtracted ${k}, so undo it: ${sx(R)} + ${k}.`;
    p.solution = addedInstead
      ? `Number = ${sx(R)} − ${k} = ${correct}. (The answer she wanted would be ${sx(corrected)} — but you were asked for the number.)`
      : `Number = ${sx(R)} + ${k} = ${correct}. (The answer she wanted would be ${sx(corrected)} — but you were asked for the number.)`;
    p.visual = { type: "card", title: "read the question: find the number", expr: addedInstead ? `? + ${k} = ${sx(R)}` : `? − ${k} = ${sx(R)}`, lines: ["undo the wrong operation"], steps: [`? = ${sx(R)} ${addedInstead ? "−" : "+"} ${k} = ${correct}`] };
    p.data = { form, k, R, addedInstead };
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = makeChoices(correct, [sx(corrected), sx(R), sx(addedInstead ? R + k : R - k)], [sx(mystery + 2), sx(mystery - 2), "0"], vi);
    return p;
  }

  /* ---------------- 6. patrol-route ---------------- */
  const PATROL_SCENARIOS = [
    { key: "patrol", unit: "km", posWord: "north", negWord: "south", actor: "Officer Pip on his motorbike", base: "the sentry box",
      legs: [[10, -9, 7, -15, 6, 4, -14, -2], [12, -7, -8, 15, -6, 9, -11, 4], [8, -13, 5, -6, 14, -9, 7, -3], [15, -6, -9, 4, 12, -14, 8, -5]],
      rate: 0.05, rateUnit: "litres of fuel per km", rateAsk: "How many litres of fuel did the bike use?", rateName: "fuel used" },
    { key: "lift", unit: "floors", posWord: "up", negWord: "down", actor: "Pip in the tower lift", base: "the lobby",
      legs: [[9, -4, 6, -12, 7, 3, -8, -2], [11, -6, -3, 8, -5, 10, -9, 2], [7, -12, 4, -3, 9, -6, 5, -8], [13, -8, -5, 6, 11, -10, 4, -7]],
      rate: 0.4, rateUnit: "units of energy per floor", rateAsk: "How many units of energy did the lift use?", rateName: "energy used" },
    { key: "till", unit: "£", posWord: "paid in", negWord: "paid out", actor: "Pip running the depot shop till", base: "zero change",
      legs: [[14, -8, 6, -11, 9, 5, -13, -4], [16, -9, -5, 12, -7, 8, -10, 3], [9, -14, 7, -4, 12, -8, 6, -5], [18, -7, -6, 5, 10, -12, 9, -6]],
      rate: null, rateUnit: "", rateAsk: "", rateName: "" }
  ];
  function patrolRouteProblem(vi) {
    const form = vi % 3;
    const sc = pick(PATROL_SCENARIOS, vi);
    const legs = pick(sc.legs, Math.floor(vi / PATROL_SCENARIOS.length) + vi);
    const sum = legs.reduce((a, b) => a + b, 0);
    const total = legs.reduce((a, b) => a + Math.abs(b), 0);
    if (sum === 0) return patrolRouteProblem(vi + 1);
    const useChoice = form === 0 || vi % 2 === 0;
    const p = problemBase("patrol-route", vi, useChoice ? "choice" : "filled");
    const legStr = legs.map((l) => (l > 0 ? "+" + l : sx(l))).join(", ");
    const dirWord = sum > 0 ? sc.posWord : sc.negWord;
    if (form === 0) {
      // displacement with direction — choice strings
      const correct = `${mag(sum)} ${sc.unit} ${dirWord}`;
      p.prompt = `${sc.actor} records the day (${sc.unit}): ${legStr}. Positive means ${sc.posWord}. Where does the day end, measured from ${sc.base}?`;
      p.hint1 = "Add every record together — the sign of the total tells the direction.";
      p.hint2 = `Sum: ${legStr.replaceAll(",", " +")} … group positives and negatives.`;
      p.solution = `Positives add to ${legs.filter((l) => l > 0).reduce((a, b) => a + b, 0)} and negatives to ${sx(legs.filter((l) => l < 0).reduce((a, b) => a + b, 0))}; total ${sx(sum)}, so the day ends ${mag(sum)} ${sc.unit} ${dirWord} of ${sc.base}. (Total distance travelled is a different question — that would be ${total} ${sc.unit}.)`;
      p.visual = { type: "line", min: Math.min(0, sum) - 3, max: Math.max(0, sum) + 3, unit: Math.max(1, Math.ceil(Math.abs(sum) / 6)), sub: 1, points: [{ v: 0, label: "base", color: NAVY }, { v: sum, label: "?", color: CORAL, secret: true }], note: `records: ${legStr}` };
      p.data = { form, scenario: sc.key, legs, sum, total };
      p.expected = correct;
      p.expectedDisplay = correct;
      p.correctInput = { choice: correct };
      p.choices = makeChoices(correct, [`${mag(sum)} ${sc.unit} ${sum > 0 ? sc.negWord : sc.posWord}`, `${total} ${sc.unit} ${dirWord}`, `0 ${sc.unit} — back at the start`], [`${total} ${sc.unit} ${sum > 0 ? sc.negWord : sc.posWord}`, `${mag(sum) + 2} ${sc.unit} ${dirWord}`, `${mag(total - sum)} ${sc.unit} ${dirWord}`], vi);
      return p;
    }
    if (form === 1) {
      // total distance travelled — filled (or choice by parity)
      p.prompt = `${sc.actor} records (${sc.unit}): ${legStr}. What is the TOTAL distance travelled (ignoring direction)?`;
      p.hint1 = "Total distance ignores signs: make every record positive, then add.";
      p.hint2 = `Add ${legs.map((l) => mag(l)).join(" + ")}.`;
      p.solution = `Total = ${legs.map((l) => mag(l)).join(" + ")} = ${total} ${sc.unit}. (The day's displacement — where it ended — is only ${mag(sum)} ${sc.unit} ${dirWord}.)`;
      p.visual = { type: "card", title: "distance ignores direction", expr: legs.map((l) => `|${sx(l)}|`).join(" + "), lines: ["make every leg positive"], steps: [`${legs.map((l) => mag(l)).join(" + ")} = ${total} ${sc.unit}`] };
      p.data = { form, scenario: sc.key, legs, sum, total };
      return finishNumeric(p, total, [Math.abs(sum), total + 2, total - 5], [total + 4, Math.max(1, total - 9), total * 2], useChoice, vi);
    }
    // form 2: rate question (patrol fuel / lift energy) or till final balance
    if (sc.rate) {
      const cost = Math.round(total * sc.rate * 100) / 100;
      p.prompt = `${sc.actor} records (${sc.unit}): ${legStr}. The vehicle uses ${sc.rate} ${sc.rateUnit}. ${sc.rateAsk}`;
      p.hint1 = "First find the TOTAL distance travelled (all legs positive), then multiply by the rate.";
      p.hint2 = `Total = ${total} ${sc.unit}; multiply by ${sc.rate}.`;
      p.solution = `Total distance: ${total} ${sc.unit}. ${sc.rateName}: ${total} × ${sc.rate} = ${sx(cost)}.`;
      p.visual = { type: "card", title: "total distance × rate", expr: `${sc.rate} × total`, lines: [`total = ${total} ${sc.unit}`], steps: [`${total} × ${sc.rate} = ${sx(cost)}`] };
      p.data = { form, scenario: sc.key, legs, sum, total };
      return finishNumeric(p, cost, [Math.abs(sum) * sc.rate, cost * 2, cost + sc.rate], [cost + 1, cost + 0.5, cost - 0.25].filter((x) => x > 0), useChoice, vi);
    }
    // till: final balance from £100 start
    const startCash = 100;
    const finalCash = startCash + sum;
    p.prompt = `${sc.actor} records (${sc.unit}): ${legStr}. The till started with £${startCash}. How much is in it at the end?`;
    p.hint1 = "Add the signed records to the starting amount.";
    p.hint2 = `Records add to ${sx(sum)}; then ${startCash} + (${sx(sum)}).`;
    p.solution = `Records total ${sx(sum)}. Final till: ${startCash} + (${sx(sum)}) = £${finalCash}.`;
    p.visual = { type: "card", title: "start + signed total", expr: `${startCash} + (${sx(sum)})`, lines: [`records total: ${sx(sum)}`], steps: [`${startCash} + (${sx(sum)}) = £${finalCash}`] };
    p.data = { form, scenario: sc.key, legs, sum, total };
    return finishNumeric(p, finalCash, [startCash - sum, Math.abs(sum), total], [finalCash + 5, finalCash - 5, startCash], useChoice, vi);
  }

  /* ---------------- 7. bracket-nest ---------------- */
  function bracketNestProblem(vi) {
    const form = vi % 4;
    const useChoice = form === 3 || form === 0 ? true : vi % 2 === 0;
    const p = problemBase("bracket-nest", vi, useChoice ? "choice" : "filled");
    if (form === 0) {
      // book Exploration 6(1): n + (+n) + (−n) − (+n) − (−n)
      const n = pick([2010, 350, 47, 1204, 88, 515, 76, 999], vi);
      p.prompt = `Work out ${n} + (+${n}) + (${sx(-n)}) − (+${n}) − (${sx(-n)}).`;
      p.hint1 = "Simplify the signs, then pair up opposites.";
      p.hint2 = `It becomes ${n} + ${n} − ${n} − ${n} + ${n}.`;
      p.solution = `Signs simplify to ${n} + ${n} − ${n} − ${n} + ${n}. Three positives and two negatives of the same number leave exactly one copy: ${n}.`;
      p.visual = { type: "card", title: "pair the copies", expr: `${n} + (+${n}) + (${sx(-n)}) − (+${n}) − (${sx(-n)})`, lines: [`= ${n} + ${n} − ${n} − ${n} + ${n}`], steps: [`= ${n} + ${n} − ${n} − ${n} + ${n}`, `= ${n}`] };
      p.data = { form, n };
      return finishNumeric(p, n, [0, 2 * n, -n], [3 * n, -2 * n, n + 1], useChoice, vi);
    }
    if (form === 1) {
      // pure nesting: a − (b − (c − (d − e)))
      const a = pick([1, 2, 3, 5, 4, 6], vi);
      const b = pick([2, 4, 6, 3, 8, 5], vi + 1);
      const c = pick([3, 6, 2, 9, 5, 7], vi * 2);
      const d = pick([4, 7, 10, 5, 9, 6], vi + 2);
      const e = pick([5, 3, 8, 2, 11, 4], vi * 3 + 1);
      const inner = d - e;
      const mid = c - inner;
      const outer = b - mid;
      const expected = a - outer;
      const flat = a - b - c - d - e;        // ignored brackets
      const flipIn = a - (b - (c - (d + e))); // flipped innermost sign
      p.prompt = `Work out ${a} − (${b} − (${c} − (${d} − ${e}))).`;
      p.hint1 = "Start at the innermost bracket and unwrap one layer at a time.";
      p.hint2 = `Innermost: ${d} − ${e} = ${sx(inner)}.`;
      p.solution = `Inside out: ${d} − ${e} = ${sx(inner)}; ${c} − (${sx(inner)}) = ${sx(mid)}; ${b} − (${sx(mid)}) = ${sx(outer)}; ${a} − (${sx(outer)}) = ${sx(expected)}.`;
      p.visual = { type: "card", title: "unwrap from the inside", expr: `${a} − (${b} − (${c} − (${d} − ${e})))`, lines: [`innermost: ${d} − ${e}`], steps: [`${d} − ${e} = ${sx(inner)}`, `${c} − (${sx(inner)}) = ${sx(mid)}`, `${b} − (${sx(mid)}) = ${sx(outer)}`, `${a} − (${sx(outer)}) = ${sx(expected)}`] };
      p.data = { form, a, b, c, d, e };
      return finishNumeric(p, expected, [flat, flipIn, -expected], [expected + 2, expected - 2, 0], useChoice, vi);
    }
    if (form === 2) {
      // book Extensive 3(1): A − (−B + (−C)) − (D − (−E − F))
      const A = pick([1, 2, 3, 4, 5, 6], vi);
      const B = pick([4, 6, 3, 8, 5, 7], vi + 1);
      const C = pick([2, 5, 7, 3, 6, 4], vi * 2);
      const D = pick([8, 6, 9, 7, 10, 5], vi + 3);
      const E = pick([5, 3, 8, 2, 9, 6], vi * 3 + 1);
      const F = pick([7, 4, 6, 9, 3, 8], vi + 2);
      const inner1 = -B - C;                  // −B + (−C)
      const inner2 = D + E + F;               // D − (−E − F)
      const expected = A - inner1 - inner2;
      const w1 = A - (B + C) - inner2;        // missed the −(−…) flip in bracket 1
      const w2 = A - inner1 - (D - E - F);    // missed the flip in bracket 2
      const w3 = A + inner1 - inner2;         // flipped the outer sign
      p.prompt = `Work out ${A} − (${sx(-B)} + (${sx(-C)})) − (${D} − (${sx(-E)} − ${F})).`;
      p.hint1 = "Evaluate each bracket on its own first — watch the double negatives.";
      p.hint2 = `First bracket: ${sx(-B)} + (${sx(-C)}) = ${sx(inner1)}. Second: ${D} − (${sx(-E - F)}) = ${sx(inner2)}.`;
      p.solution = `First bracket: ${sx(-B)} + (${sx(-C)}) = ${sx(inner1)}. Second bracket: ${D} − (${sx(-(E + F))}) = ${D} + ${E + F} = ${inner2}. Now ${A} − (${sx(inner1)}) − ${inner2} = ${A} + ${-inner1} − ${inner2} = ${sx(expected)}.`;
      p.visual = { type: "card", title: "brackets first, double negatives!", expr: `${A} − (${sx(-B)} + (${sx(-C)})) − (${D} − (${sx(-E)} − ${F}))`, lines: [`bracket 1: ${sx(inner1)}`, `bracket 2: ${sx(inner2)}`], steps: [`bracket 1: ${sx(inner1)}`, `bracket 2: ${sx(inner2)}`, `${A} − (${sx(inner1)}) − ${inner2} = ${sx(expected)}`] };
      p.data = { form, A, B, C, D, E, F };
      return finishNumeric(p, expected, [w1, w2, w3], [expected + 2, expected - 2, -expected], useChoice, vi);
    }
    // form 3: book Exploration 6(2) pattern: a − (−a − a) − (−a − (−a − a)) — choice
    const a = pick([2, 3, 4, 5, 6, 7], vi);
    const inner = -a - a;              // −2a
    const mid = -a - inner;            // −a − (−2a) = a
    const expected = a - inner - mid;  // a + 2a − a = 2a
    const correct = sx(expected);
    p.prompt = `What is the value of ${a} − (${sx(-a)} − ${a}) − (${sx(-a)} − (${sx(-a)} − ${a}))?`;
    p.hint1 = "Work out the innermost bracket first, then each outer layer.";
    p.hint2 = `${sx(-a)} − ${a} = ${sx(inner)}.`;
    p.solution = `Innermost: ${sx(-a)} − ${a} = ${sx(inner)}. Then ${sx(-a)} − (${sx(inner)}) = ${sx(mid)}. Finally ${a} − (${sx(inner)}) − ${sx(mid)} = ${a} + ${-inner} − ${mid} = ${correct}.`;
    p.visual = { type: "card", title: "three layers deep", expr: `${a} − (${sx(-a)} − ${a}) − (${sx(-a)} − (${sx(-a)} − ${a}))`, lines: [`innermost: ${sx(-a)} − ${a} = ${sx(inner)}`], steps: [`${sx(-a)} − ${a} = ${sx(inner)}`, `${sx(-a)} − (${sx(inner)}) = ${sx(mid)}`, `${a} − (${sx(inner)}) − ${sx(mid)} = ${correct}`] };
    p.data = { form, a };
    p.expected = correct;
    p.expectedDisplay = correct;
    p.correctInput = { choice: correct };
    p.choices = makeChoices(correct, ["0", sx(a), sx(4 * a)], [sx(-expected), sx(3 * a), sx(-a)], vi);
    return p;
  }

  /* ---------------- engine ---------------- */
  const GENERATORS = {
    "counter-sum": counterSumProblem,
    "sign-mixer": signMixerProblem,
    "subtract-negative": subtractNegativeProblem,
    "smart-pairing": smartPairingProblem,
    "wrong-operation": wrongOperationProblem,
    "patrol-route": patrolRouteProblem,
    "bracket-nest": bracketNestProblem
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
    const exp = Number(problem.expected);
    switch (problem.classicId) {
      case "counter-sum": {
        if (d.form === 0) return exp === -(d.a + d.b);
        if (d.form === 1) return exp === d.a - d.b;
        if (d.form === 2) return exp === d.d && d.s + d.d === d.t;
        return problem.expected === "0";
      }
      case "sign-mixer": {
        if (d.form === 0) return Math.abs(exp - (d.w - d.t) / 10) < 1e-9;
        if (d.form === 1) return Math.abs(exp + (d.t + d.w) / 10) < 1e-9;
        if (d.form === 2) return problem.expected === fracStr(d.n1 - d.n2, d.den);
        const fracH = d.fr.w * 100 + (d.fr.n * 100) / d.fr.d;
        const want = ((d.negDec ? -d.t * 10 : d.t * 10) + (d.negDec ? fracH : -fracH)) / 100;
        return Math.abs(exp - want) < 1e-9;
      }
      case "subtract-negative": {
        if (d.form === 0) return exp === d.a + d.b;
        if (d.form === 1) return exp === -d.a + d.b;
        if (d.form === 2) return Math.abs(exp - (d.negFirst ? -(d.t + d.w) / 10 : (d.t + d.w) / 10)) < 1e-9;
        return typeof problem.expected === "string" && problem.expected.length > 0;
      }
      case "smart-pairing": {
        if (d.form === 0) return exp === d.a + d.b - d.c - d.d;
        if (d.form === 1) return Math.abs(exp - (d.v - d.w) / 10) < 1e-9;
        if (d.form === 2) return exp === -d.pp + d.q - d.r - d.s;
        return problem.expected.includes(MINUS);
      }
      case "wrong-operation": {
        if (d.form === 0 || d.form === 1) return exp === (d.addedInstead ? d.R - 2 * d.k : d.R + 2 * d.k);
        if (d.form === 2) return Math.abs(exp - (d.addedInstead ? (d.r10 - 2 * d.t) / 10 : (d.r10 + 2 * d.t) / 10)) < 1e-9;
        return problem.expected === sx(d.addedInstead ? d.R - d.k : d.R + d.k);
      }
      case "patrol-route": {
        const sum = d.legs.reduce((a, b) => a + b, 0);
        const total = d.legs.reduce((a, b) => a + Math.abs(b), 0);
        if (d.form === 1) return exp === total;
        if (d.form === 2 && d.scenario !== "till") return Math.abs(exp - Math.round(total * 0.05 * 100) / 100) < 1e-6 || Math.abs(exp - Math.round(total * 0.4 * 100) / 100) < 1e-6;
        if (d.form === 2) return exp === 100 + sum;
        return sum !== 0 && problem.expected.startsWith(mag(Math.abs(sum)));
      }
      case "bracket-nest": {
        if (d.form === 0) return exp === d.n;
        if (d.form === 1) return exp === d.a - (d.b - (d.c - (d.d - d.e)));
        if (d.form === 2) return exp === d.A - (-d.B - d.C) - (d.D + d.E + d.F);
        return exp === 2 * d.a;
      }
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
    if (v.type === "counters") {
      html = countersSvg(v, revealed).replace("</svg>", answer + "</svg>");
      text = revealed ? "Zero pairs are struck through — count what remains." : "Red counters are +1, blue counters are −1.";
    } else if (v.type === "line") {
      const cfg = { min: v.min, max: v.max, unit: v.unit, sub: v.sub, arcs: v.arcs, brace: revealed ? v.brace : undefined, points: (v.points || []).map((pt) => ({ ...pt, label: !revealed && pt.secret ? "?" : pt.label, show: revealed ? (pt.show || (pt.secret ? pt.label : undefined)) : undefined })) };
      html = numberLineSvg(cfg).replace("</svg>", answer + "</svg>");
      text = revealed ? "The line shows where the journey ends." : "Follow the hops: right adds, left subtracts.";
    } else if (v.type === "card") {
      html = cardSvg(v, revealed).replace("</svg>", answer + "</svg>");
      text = revealed ? "The card shows the worked steps." : "Simplify the signs, then combine.";
    }
    return { html, text };
  }

  /* ---------------- intro scenes ---------------- */
  const INTRO_SCENES = [
    {
      title: "Counters at the Depot",
      purpose: "Model integers with red (+1) and blue (−1) counters.",
      classicId: "counter-sum",
      variant: 1,
      caption: "Red +1, blue −1. A red-blue pair is worth exactly zero.",
      durationMs: 21000,
      voiceover: "Welcome to Pip's counter depot! Red counters are worth plus one, blue counters minus one. Here is the magic trick: one red and one blue together make a zero pair — they cancel out completely. To add two numbers, just pour the counters together, strike out the zero pairs, and count what is left standing."
    },
    {
      title: "Same Sign, Same Team",
      purpose: "Same-sign addition: add sizes, keep the sign.",
      classicId: "counter-sum",
      variant: 0,
      caption: "Blue plus blue is more blue. Red plus red is more red.",
      durationMs: 19000,
      voiceover: "When both numbers share a sign, they pull in the same direction like teammates. Negative three plus negative five? Three blue counters and five more blue counters make eight blues: negative eight. Same sign means add the sizes and keep the sign. It works for positives too — red plus red is simply more red."
    },
    {
      title: "Tug of War",
      purpose: "Different signs: subtract sizes, bigger size wins the sign.",
      classicId: "sign-mixer",
      variant: 0,
      caption: "Different signs? The bigger size wins the sign.",
      durationMs: 22000,
      voiceover: "When the signs disagree, it is a tug of war between the positives and the negatives. Take negative one point six plus two point seven: the positive side is bigger, so the answer is positive — and the gap between the sizes is one point one. Subtract the sizes, and hand the win to the bigger side. That one rule cracks every different-signs addition."
    },
    {
      title: "The Double-Negative Switch",
      purpose: "Subtracting a negative switches to adding: −(−b) = +b.",
      classicId: "subtract-negative",
      variant: 0,
      caption: "− (−6) switches to + 6. Two negatives make a positive!",
      durationMs: 23000,
      voiceover: "Subtraction hides a secret switch. Taking away a blue counter actually makes your total go UP, so minus a negative becomes plus. Twelve minus negative six is really twelve plus six: eighteen. Watch the adjacent signs like a hawk: minus minus flips to plus, while plus minus or minus plus both stay a minus. Simplify the signs first, then add the opposite."
    },
    {
      title: "Smart Pairing",
      purpose: "Multi-term chains: pair inverses and friendly tens first.",
      classicId: "smart-pairing",
      variant: 1,
      caption: "Spot zero pairs and friendly tens before you compute.",
      durationMs: 21000,
      voiceover: "Long chains of pluses and minuses look scary, but champions never compute left to right. They hunt for shortcuts first: a number hiding next to its exact opposite makes zero and vanishes, and friendly pairs that make a round ten jump out too. Pair cleverly, and a four-term monster shrinks to one tiny subtraction."
    },
    {
      title: "Pip's Patrol & the Oops Button",
      purpose: "Signed sums in stories — and undoing a wrong operation.",
      classicId: "patrol-route",
      variant: 0,
      caption: "Add the signed records for where you end; add the sizes for how far you went.",
      durationMs: 24000,
      voiceover: "Officer Pip patrols a north-south road, writing plus for every kilometre north and minus for every south. Adding the signed records tells you where he ends up; adding just the sizes tells you how far he rode — a sneakily different question! And when someone presses add instead of subtract, do not panic: undo the oops to find the number, then redo it properly."
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
  root.RationalAddSubModule = api;
})(typeof window !== "undefined" ? window : globalThis);
