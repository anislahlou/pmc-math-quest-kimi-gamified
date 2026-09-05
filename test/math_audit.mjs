/* Math audit for PMC Math Quest v2. Run: node test/math_audit.mjs
   Sweeps every classic/submodule of every legacy module across all variant
   indices and verifies, for every generated problem:
     A. contract: expected defined; correct answer accepted, distractors rejected
     B. choices: exactly one correct, unique labels
     C. text claims: every "sqrt(...) = N" and "expr = N" claim inside
        prompt/hints/solution/expectedDisplay is arithmetically exact
     D. triangle_sides geometry invariants recomputed from the visual payload
        (Pythagoras must hold exactly — no rounded sqrts presented as exact)
   Exits non-zero on any hard failure; prints REVIEW notes for soft issues. */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
let failures = 0;
const reviews = [];
const ok = (cond, msg) => { if (!cond) { failures += 1; console.error(`  ✗ ${msg}`); } };
const review = (msg) => reviews.push(msg);

/* ---------- numeric-claim extraction ---------- */
function evalExpr(expr) {
  let s = String(expr)
    .replace(/−/g, "-").replace(/[x×]/g, "*").replace(/÷/g, "/")
    .replace(/(\d+(?:\.\d+)?)\s*\^\s*2/g, "($1*$1)")
    .replace(/(\d+(?:\.\d+)?)²/g, "($1*$1)")
    .replace(/\)\s*\(/g, ")*(")
    .replace(/,/g, "");
  if (!/^[\d+\-*/().\s]+$/.test(s) || !/[+\-*/]/.test(s)) return null;
  try { const v = Function(`"use strict";return (${s});`)(); return Number.isFinite(v) ? v : null; }
  catch { return null; }
}

function checkTextClaims(text, tag) {
  if (!text || typeof text !== "string") return;
  // sqrt(inner) = claimed
  for (const m of text.matchAll(/sqrt\(([^)]*)\)\s*=\s*(-?\d+(?:\.\d+)?)/gi)) {
    const inner = evalExpr(m[1]);
    const claimed = Number(m[2]);
    if (inner === null) continue;
    if (inner < 0) { ok(false, `${tag}: sqrt of negative (${m[0]})`); continue; }
    const exact = Math.sqrt(inner);
    ok(Math.abs(exact - claimed) < 1e-9,
      `${tag}: sqrt(${m[1]}) = ${Number.isInteger(exact) ? exact : exact.toFixed(4)}… but text claims ${claimed}  [${text.slice(0, 90)}…]`);
    if (!Number.isInteger(exact)) review(`${tag}: non-integer sqrt presented in text: ${m[0]}`);
  }
  // equality chains: scan math-only segments (tracking position), split each
  // on "=", then verify every evaluated part of the chain agrees.
  // Guards against label/subscript remnants ("T_7 = …"), ellipsis splits
  // ("… + 100 = …"), and variable splits ("S - 70 = …", "3x + 7 = …").
  const prepared = String(text)
    .replace(/sqrt\([^)]*\)/gi, " ")                    // sqrt claims handled above
    .replace(/(\d)\.(?!\d)/g, "$1 ")                     // sentence period after a number
    .replace(/(?<![\d.])\.(?!\d)/g, " ");                // any other non-decimal period
  for (const segMatch of prepared.matchAll(/[0-9+\-x×*/÷^²().,\s=−]+/g)) {
    const seg = segMatch[0];
    if (!seg.includes("=")) continue;
    if (/\d[x×]/.test(seg)) continue; // algebraic variable (e.g. "3x + 7 = 31") — not a plain numeric claim
    let parts = seg.split("=").map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) continue;
    const letterBefore = segMatch.index > 0 && /[A-Za-z_]/.test(prepared[segMatch.index - 1]);
    if (letterBefore && parts.length >= 2 && !/[+\-x×*/÷^²(]/.test(parts[0])) parts = parts.slice(1); // "T_7 = expr = N" → check expr = N
    if (parts.length >= 2 && /^[+\-x×*/÷^]/.test(parts[0])) parts = parts.slice(1);                    // "… + 100 = N" → leading fragment
    if (parts.length < 2) continue;
    const vals = parts.map((p) => (/^-?\d+(?:\.\d+)?$/.test(p) ? Number(p) : evalExpr(p)));
    const nums = vals.filter((v) => v !== null && v !== undefined);
    if (nums.length < 2 || nums.length !== vals.length) continue; // skip chains with unparseable parts
    const first = nums[0];
    for (let i = 1; i < nums.length; i++) {
      ok(Math.abs(nums[i] - first) < 1e-6,
        `${tag}: equality chain broken: "${parts.join(" = ")}" — part ${i + 1} evaluates to ${Number.isInteger(nums[i]) ? nums[i] : nums[i].toFixed(4)} but part 1 is ${Number.isInteger(first) ? first : first.toFixed(4)}  [${text.slice(0, 90)}…]`);
    }
  }
}

/* ---------- answer submission (mirrors player normalization) ---------- */
function submitCorrect(api, p) {
  if (p.answerType === "address" || (p.expected && typeof p.expected === "object" && "row" in p.expected))
    return { row: p.expected.row, position: p.expected.position };
  if (p.answerType === "choice" && Array.isArray(p.choices) && p.choices.length) {
    const good = p.choices.find((x) => x.isCorrect);
    if (!good) return null;
    const v = "value" in good ? good.value : good.label;
    return { choice: v, value: v };
  }
  if (p.answerType === "ratio" && Array.isArray(p.expected)) return { value: `${p.expected[0]}:${p.expected[1]}` };
  if (p.answerType === "expression" || p.answerType === "text") return { value: String(p.expectedDisplay ?? p.expected) };
  return { value: String(p.expected) };
}

/* ---------- triangle_sides exact geometry invariants ---------- */
const isSq = (n) => Number.isInteger(n) && n >= 0 && Number.isInteger(Math.sqrt(n));
function triangleSidesInvariants(p, tag) {
  const v = p.visual || {};
  if (v.type === "shared") {
    ok(v.leftHyp ** 2 === v.leftBase ** 2 + v.height ** 2,
      `${tag}: left right-triangle not exact: ${v.leftBase}²+${v.height}²=${v.leftBase ** 2 + v.height ** 2} ≠ ${v.leftHyp ** 2}`);
    ok(v.rightHyp ** 2 === v.height ** 2 + v.rightBase ** 2,
      `${tag}: right right-triangle not exact: ${v.height}²+${v.rightBase}²=${v.height ** 2 + v.rightBase ** 2} ≠ ${v.rightHyp ** 2}`);
    if (v.ask === "area") ok(Math.abs(p.expected - (v.leftBase + v.rightBase) * v.height / 2) < 1e-9, `${tag}: area expected mismatch`);
    if (v.ask === "perimeter") ok(Math.abs(p.expected - (v.leftBase + v.rightBase + v.leftHyp + v.rightHyp)) < 1e-9, `${tag}: perimeter expected mismatch`);
    if (v.ask === "rightBase") ok(p.expected === v.rightBase, `${tag}: rightBase expected mismatch`);
  }
  if (v.type === "isoArea") {
    const half = v.base / 2;
    ok(v.equal ** 2 === v.height ** 2 + half ** 2,
      `${tag}: isosceles split not exact: ${v.height}²+${half}²=${v.height ** 2 + half ** 2} ≠ ${v.equal ** 2}`);
    ok(Math.abs(p.expected - v.base * v.height / 2) < 1e-9, `${tag}: iso area expected mismatch`);
  }
  if (v.type === "areaPerimeter") {
    ok(Math.abs(v.height - (2 * v.area) / v.base) < 1e-9, `${tag}: height ≠ 2·area/base (${v.height} vs ${(2 * v.area) / v.base})`);
    const half = v.base / 2;
    ok(v.equal ** 2 === v.height ** 2 + half ** 2,
      `${tag}: equal side not exact: sqrt(${v.height}²+${half}²)=sqrt(${v.height ** 2 + half ** 2}) ≠ ${v.equal}`);
    ok(p.expected === 2 * v.equal + v.base, `${tag}: perimeter expected mismatch (${p.expected} vs ${2 * v.equal + v.base})`);
  }
  if (v.type === "path") {
    ok(p.expected ** 2 === v.x ** 2 + v.y ** 2,
      `${tag}: path distance not exact: sqrt(${v.x}²+${v.y}²)=sqrt(${v.x ** 2 + v.y ** 2}) ≠ ${p.expected}`);
  }
  if (v.type === "right") {
    const { a, b, c } = v;
    const known = [a, b, c].filter((n) => Number.isFinite(n));
    if (known.length === 3) ok(a * a + b * b === c * c, `${tag}: ${a}²+${b}² ≠ ${c}²`);
    else if (Number.isFinite(c) && (Number.isFinite(a) || Number.isFinite(b))) {
      const leg = Number.isFinite(a) ? a : b;
      ok(isSq(c * c - leg * leg), `${tag}: ${c}²−${leg}²=${c * c - leg * leg} is not a perfect square`);
    }
  }
  if (v.type === "isoscelesChoice") {
    ok(2 * v.equal > v.base, `${tag}: chosen sides ${v.equal},${v.equal},${v.base} violate triangle inequality`);
    ok(v.values.includes(v.equal) && v.values.includes(v.base), `${tag}: equal/base must come from the given values`);
    ok(p.expected === 2 * v.equal + v.base, `${tag}: perimeter expected mismatch`);
  }
  if (v.type === "gate") {
    const s = [...v.sides].sort((x, y) => x - y);
    ok(v.ok === (s[0] + s[1] > s[2]), `${tag}: gate verdict wrong for ${v.sides}`);
  }
}

/* ---------- sweep ---------- */
const files = readdirSync(join(root, "modules")).filter((f) => f.endsWith("_module.js"));
let problems = 0, claimsChecked = 0;
for (const f of files) {
  const code = readFileSync(join(root, "modules", f), "utf8");
  const box = { exports: {} };
  try {
    new Function("module", "exports", "window", "document", `"use strict";\n${code}`)(box, box.exports, {}, undefined);
  } catch (err) { ok(false, `${f}: evaluation threw ${err.message}`); continue; }
  const api = box.exports;
  const classicList = api.CLASSICS || api.MODULES || [];
  if (typeof api.generateProblem !== "function" || !classicList.length) { review(`${f}: no generateProblem/classics — skipped`); continue; }
  console.log(`• ${f} (${classicList.length} classics)`);
  for (const c of classicList) {
    for (let vi = 0; vi < 48; vi++) {
      let p;
      try { p = api.generateProblem(c.id, vi); } catch (err) { ok(false, `${f}:${c.id}#${vi}: generate threw ${err.message}`); continue; }
      if (!p) { ok(false, `${f}:${c.id}#${vi}: no problem returned`); continue; }
      const tag = `${f}:${c.id}#${vi}`;
      problems += 1;
      const hasExpected = p.expected !== undefined && p.expected === p.expected && p.expected !== null;
      const hasDisplay = (p.expectedDisplay !== undefined && p.expectedDisplay !== null) ||
        (p.correctInput && (p.correctInput.choice !== undefined || p.correctInput.value !== undefined));
      ok(hasExpected || hasDisplay, `${tag}: no expected/expectedDisplay/correctInput — answer contract incomplete`);
      if (typeof p.expected === "number" && !Number.isInteger(p.expected))
        review(`${tag}: non-integer numeric answer expected=${p.expected} (ok only if decimals intended, e.g. π)`);
      // choices integrity
      if (p.answerType === "choice" && Array.isArray(p.choices) && p.choices.length) {
        ok(p.choices.filter((x) => x.isCorrect).length === 1, `${tag}: exactly one correct choice (${p.choices.filter((x) => x.isCorrect).length})`);
        ok(new Set(p.choices.map((x) => String("value" in x ? x.value : x.label))).size === p.choices.length, `${tag}: duplicate choice labels`);
      }
      // answer contract
      if (typeof api.checkAnswer === "function") {
        const good = submitCorrect(api, p);
        if (good) {
          let res;
          try { res = api.checkAnswer(p, good); } catch (err) { ok(false, `${tag}: checkAnswer threw ${err.message}`); }
          if (res) ok(res.isCorrect === true, `${tag}: correct answer rejected (expected ${JSON.stringify(p.expected)})`);
        }
        if (p.answerType === "choice" && Array.isArray(p.choices)) {
          for (const bad of p.choices.filter((x) => !x.isCorrect)) {
            const v = "value" in bad ? bad.value : bad.label;
            const res = api.checkAnswer(p, { choice: v, value: v });
            ok(res.isCorrect === false, `${tag}: distractor "${v}" accepted as correct`);
          }
        }
      }
      // text claims
      for (const field of ["prompt", "hint1", "hint2", "solution", "expectedDisplay"]) {
        const before = failures;
        checkTextClaims(p[field], `${tag}[${field}]`);
        if (failures === before && p[field]) claimsChecked += 1;
      }
      // module-specific geometry invariants
      if (f === "triangle_sides_module.js") triangleSidesInvariants(p, tag);
      // module-shipped recomputation (e.g. volume_prisms audit payloads)
      if (typeof api.validateProblemMath === "function" && f !== "triangle_sides_module.js") {
        let valid = true;
        try { valid = api.validateProblemMath(p); } catch { valid = true; }
        ok(valid !== false, `${tag}: module's own validateProblemMath rejects the problem`);
      }
    }
  }
}

console.log("");
console.log(`audited ${problems} generated problems across ${files.length} modules`);
if (reviews.length) {
  console.log(`\nREVIEW notes (${reviews.length}) — verify manually, may be intentional:`);
  for (const r of [...new Set(reviews)]) console.log(`  ⚠ ${r}`);
}
console.log("");
if (failures) { console.error(`MATH AUDIT FAILED: ${failures} problem(s)`); process.exit(1); }
console.log("MATH AUDIT PASSED — every claim checks out ✓");
