/* Smoke test for PMC Math Quest v2. Run: node test/smoke.mjs
   Validates: train generators produce integer-clean, solvable problems with
   4 unique choices incl. the correct one; engine store math (XP, mastery,
   combo); every legacy module loads through the adapter contract and its
   round/generate/check cycle works. Uses minimal DOM stubs. */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
let failures = 0;
const ok = (cond, msg) => {
  if (!cond) { failures += 1; console.error(`  ✗ ${msg}`); }
};

/* ---- minimal browser stubs (engine.js touches these at load time) ---- */
function stubEl() {
  const e = {
    style: {}, dataset: {}, children: [],
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, getAttribute: () => null,
    appendChild() {}, append() {}, remove() {},
    addEventListener() {},
    querySelector: () => stubEl(),
    querySelectorAll: () => [],
    focus() {}, scrollIntoView() {}
  };
  Object.defineProperty(e, "innerHTML", { get() { return ""; }, set() {} });
  Object.defineProperty(e, "textContent", { get() { return ""; }, set() {} });
  return e;
}
globalThis.localStorage = {
  _m: new Map(),
  getItem(k) { return this._m.has(k) ? this._m.get(k) : null; },
  setItem(k, v) { this._m.set(k, String(v)); },
  removeItem(k) { this._m.delete(k); }
};
globalThis.window = globalThis;
globalThis.document = {
  createElement: () => stubEl(),
  querySelector: () => null,
  body: { appendChild() {} },
  addEventListener() {}
};
globalThis.matchMedia = () => ({ matches: true });
globalThis.performance = globalThis.performance || { now: () => Date.now() };

/* ---- load engine + manifest + train module ---- */
const load = (p) => {
  const code = readFileSync(join(root, p), "utf8");
  new Function("window", "document", "localStorage", "matchMedia", "performance", code)(
    globalThis.window, globalThis.document, globalThis.localStorage, globalThis.matchMedia, globalThis.performance
  );
};
load("assets/engine.js");
load("assets/manifest.js");
load("assets/train_v2.js");

const E = globalThis.Engine;
const T = globalThis.TrainV2;
const M = globalThis.MANIFEST;

console.log("1. manifest & scenes");
ok(Array.isArray(M) && M.length === 16, `manifest should list 16 missions, got ${M && M.length}`);
ok(M.every((m) => m.id && m.title && m.skills.length >= 4), "every mission needs id/title/>=4 skills");
ok(T.scenes.length === 7, `train intro should have 7 scenes, got ${T.scenes.length}`);
ok(T.scenes.every((s) => s.say.split(" ").length >= 25), "every scene voiceover >= 25 words");
ok(T.scenes.some((s) => s.check), "at least one interactive check in the intro");

console.log("2. train generators (300 samples per classic)");
for (const c of T.CLASSICS) {
  for (let i = 0; i < 300; i++) {
    const p = T.GEN[c.id]();
    ok(Number.isFinite(p.expected) && p.expected > 0, `${c.id}#${i}: positive finite answer`);
    ok(Number.isInteger(p.expected), `${c.id}#${i}: integer answer (${p.expected})`);
    ok(p.prompt && p.prompt.length > 30, `${c.id}#${i}: real prompt`);
    ok(p.steps.length >= 1, `${c.id}#${i}: guided steps exist`);
    ok(p.steps.every((s) => Number.isFinite(s.answer)), `${c.id}#${i}: step answers finite`);
    ok(p.choices.length === 4, `${c.id}#${i}: 4 choices (${p.choices.length})`);
    ok(p.choices.filter((x) => x.correct).length === 1, `${c.id}#${i}: exactly one correct choice`);
    ok(new Set(p.choices.map((x) => x.label)).size === 4, `${c.id}#${i}: unique choice labels`);
    ok(p.choices.filter((x) => !x.correct).every((x) => x.err), `${c.id}#${i}: every distractor tagged with a misconception`);
    // verify the math relationship actually holds
    const d = p.data;
    if (c.id === "pass-marker" && p.form === "find-time") ok(Math.abs(d.L / d.v - p.expected) < 1e-9, `${c.id}#${i}: L/v = t`);
    if (c.id === "pass-marker" && p.form === "find-length") ok(Math.abs(d.v * d.t - p.expected) < 1e-9, `${c.id}#${i}: v*t = L`);
    if (c.id === "clear-bridge") ok(Math.abs((d.L + d.B) / d.v - p.expected) < 1e-9, `${c.id}#${i}: (L+B)/v = t`);
    if (c.id === "bridge-speed") ok(Math.abs((d.L + d.B) / d.t - p.expected) < 1e-9, `${c.id}#${i}: (L+B)/t = v`);
    if (c.id === "find-train") ok(Math.abs(d.v * d.t - d.B - p.expected) < 1e-9, `${c.id}#${i}: v*t - B = L`);
    if (c.id === "two-bridge") ok(Math.abs((d.b2 - d.b1) / (d.t2 - d.t1) - p.expected) < 1e-9, `${c.id}#${i}: db/dt = v`);
    if (c.id === "double-speed") ok(Math.abs((d.b2 - d.b1) / (2 * d.t2 - d.t1) - d.v) < 1e-9 && Math.abs(d.v * d.t1 - d.b1 - p.expected) < 1e-9, `${c.id}#${i}: two-equation solve consistent`);
  }
}
console.log("   generators OK unless marked above");

console.log("3. engine store: XP, mastery, levels");
const E2 = E; // fresh profile via stubs (localStorage empty)
const before = E2.state.xp;
const r1 = E2.recordAnswer("train_problems", "clear-bridge", true, { combo: 1, base: 10 });
ok(r1.xpGain >= 10, `first correct should award >=10 XP, got ${r1.xpGain}`);
ok(E2.state.xp > before, "XP increased");
const r2 = E2.recordAnswer("train_problems", "clear-bridge", true, { combo: 5, base: 10 });
ok(r2.xpGain > r1.xpGain, "combo multiplier increases XP");
// mastery stars: 3-in-a-row x3 => 3 stars (use a fresh classic to avoid star-bonus crosstalk)
for (let i = 0; i < 9; i++) E2.recordAnswer("train_problems", "pass-marker", true, { combo: 1, base: 5 });
ok(E2.classicState("train_problems", "pass-marker").stars === 3, "9 straight correct => 3 stars");
E2.recordAnswer("train_problems", "pass-marker", false, {});
ok(E2.classicState("train_problems", "pass-marker").stars === 3, "a miss does not remove stars");
ok(E2.classicState("train_problems", "pass-marker").streak === 0, "a miss resets the streak");
// retry XP: fresh classic, no star interference
E2.recordAnswer("train_problems", "find-train", true, { combo: 1, base: 10 });
const rRetry = E2.recordAnswer("train_problems", "find-train", true, { combo: 1, base: 10, retry: true });
const rNormal = E2.recordAnswer("train_problems", "find-train", true, { combo: 1, base: 10 });
ok(rRetry.xpGain < rNormal.xpGain, `retry awards reduced XP (retry=${rRetry.xpGain} normal=${rNormal.xpGain})`);
ok(E2.level().index >= 1, "level computed");
ok(E2.state.badges.includes("first_steps"), "first answer badge awarded");
const q = E2.dailyQuest(M);
ok(q && q.moduleId && M.some((m) => m.id === q.moduleId), "daily quest resolves to a real module");

console.log("4. legacy adapter contract (all classic modules)");
const legacyFiles = readdirSync(join(root, "modules")).filter((f) => f.endsWith("_module.js"));
ok(legacyFiles.length === 14, `expected 14 legacy module files, found ${legacyFiles.length}`);
for (const f of legacyFiles) {
  const code = readFileSync(join(root, "modules", f), "utf8");
  const box = { exports: {} };
  try {
    // bare root (no document) so module DOM drivers never boot — mirrors the player adapter
    new Function("module", "exports", "window", "document", `"use strict";\n${code}`)(
      box, box.exports, {}, undefined
    );
  } catch (err) {
    ok(false, `${f}: evaluation threw ${err.message}`);
    continue;
  }
  const api = box.exports;
  // dialects: CLASSICS (train-style) or MODULES (u2t2 year mission)
  const classicList = api.CLASSICS || api.MODULES || [];
  ok(classicList.length >= 4, `${f}: >=4 classics/submodules (${classicList.length})`);
  ok(typeof api.generateProblem === "function" && typeof api.checkAnswer === "function", `${f}: generate/check present`);
  ok(typeof api.renderProblemVisual === "function", `${f}: visual renderer present`);
  const hasIntro = (Array.isArray(api.INTRO_SCENES) && api.INTRO_SCENES.length >= 4) || (Array.isArray(api.MODULES) && api.MODULES.length >= 4);
  ok(hasIntro, `${f}: intro scenes or submodule metadata present`);
  if (!classicList.length || !api.generateProblem) continue;
  for (const c of classicList) {
    const p = api.generateProblem(c.id, 1);
    ok(p && p.prompt, `${f}: ${c.id} generates a prompt`);
    if (!p) continue;
    const isChoice = p.answerType === "choice" && Array.isArray(p.choices) && p.choices.length > 0;
    const isAddress = p.answerType === "address" || (p.expected && typeof p.expected === "object" && "row" in p.expected);
    let res, wrongRes;
    if (isAddress) {
      res = api.checkAnswer(p, { row: p.expected.row, position: p.expected.position });
      wrongRes = api.checkAnswer(p, { row: p.expected.row + 1, position: p.expected.position + 1 });
    } else if (isChoice) {
      const good = p.choices.find((x) => x.isCorrect);
      const bad = p.choices.find((x) => !x.isCorrect);
      // player normalization: submit the VALUE when present, else the label
      const goodSubmit = "value" in good ? good.value : good.label;
      const badSubmit = "value" in bad ? bad.value : bad.label;
      res = api.checkAnswer(p, { choice: goodSubmit, value: goodSubmit });
      wrongRes = api.checkAnswer(p, { choice: badSubmit, value: badSubmit });
    } else if (p.answerType === "ratio" && Array.isArray(p.expected)) {
      res = api.checkAnswer(p, { value: `${p.expected[0]}:${p.expected[1]}` });
      wrongRes = api.checkAnswer(p, { value: `${p.expected[0] + 1}:${p.expected[1] + 1}` });
    } else if (p.answerType === "expression" || p.answerType === "text") {
      res = api.checkAnswer(p, { value: String(p.expectedDisplay ?? p.expected) });
      wrongRes = api.checkAnswer(p, { value: "zzz-definitely-wrong" });
    } else {
      res = api.checkAnswer(p, { value: String(p.expected) });
      wrongRes = api.checkAnswer(p, { value: "-999999" });
    }
    ok(res.isCorrect, `${f}: correct answer accepted for ${c.id}`);
    ok(!wrongRes.isCorrect, `${f}: wrong answer rejected for ${c.id}`);
    const vis = api.renderProblemVisual(p, "initial");
    const visHtml = vis && (vis.html || vis.svg);
    ok(typeof visHtml === "string" && visHtml.includes("<"), `${f}: visual renders content for ${c.id}`);
    if (typeof visHtml === "string") {
      // repo's leak rule: the "Answer:" banner renders only in solution/worked state
      ok(!/>\s*Answer:/.test(visHtml), `${f}: initial visual shows an Answer banner for ${c.id}`);
    }
  }
}

console.log("");
if (failures) {
  console.error(`SMOKE FAILED: ${failures} problem(s)`);
  process.exit(1);
} else {
  console.log("SMOKE PASSED — all systems green 🚂");
}
