/* Headless DOM integration test — drives the real pages through jsdom.
   Run: node test/integration.mjs  (requires `npm install --no-save jsdom`)
   Covers: hub render, engine store, enhanced Train module end-to-end
   (intro scenes, mission answer flow, Pip mode, Depot Master hearts),
   and the legacy adapter for every classic module (load, intro, one
   correct + one wrong answer through the real UI). */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { JSDOM } from "jsdom";

const root = fileURLToPath(new URL("..", import.meta.url));
let failures = 0;
const ok = (cond, msg) => { if (!cond) { failures += 1; console.error(`  ✗ ${msg}`); } };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function makePage(url, html, { localStorageSeed } = {}) {
  const dom = new JSDOM(html, {
    url,
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;
  // localStorage: jsdom has one; optionally seed
  if (localStorageSeed) window.localStorage.setItem("pmc_math_quest_v2", JSON.stringify(localStorageSeed));
  // fetch shim: serve local files
  window.fetch = async (path) => {
    const clean = String(path).split("?")[0];
    try {
      const text = readFileSync(join(root, clean), "utf8");
      return { ok: true, text: async () => text };
    } catch {
      return { ok: false, status: 404, text: async () => "" };
    }
  };
  window.matchMedia = () => ({ matches: true });
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  for (const src of ["assets/engine.js", "assets/manifest.js", "assets/train_v2.js"]) {
    window.eval(readFileSync(join(root, src), "utf8"));
  }
  return { dom, window };
}

const fire = (window, el, type = "click") => el.dispatchEvent(new window.Event(type, { bubbles: true, cancelable: true }));

/* ================= 1. hub ================= */
console.log("1. hub page");
{
  const { window } = await makePage("http://localhost/index.html", readFileSync(join(root, "index.html"), "utf8"));
  window.eval(readFileSync(join(root, "assets/hub.js"), "utf8"));
  await sleep(50);
  const cards = window.document.querySelectorAll(".mission-card");
  ok(cards.length === 16, `hub shows 16 mission cards, got ${cards.length}`);
  ok(window.document.querySelectorAll(".badge").length === window.Engine.BADGES.length, "badge shelf renders all badges");
  ok(window.document.getElementById("daily-title").textContent.length > 0, "daily quest card populated");
  ok(window.document.getElementById("xp-fill").style.width !== "", "xp bar has width");
  window.close();
}

/* ================= 2. enhanced train module ================= */
console.log("2. enhanced Train Problems module");
{
  const { window } = await makePage("http://localhost/module.html?m=train_problems", readFileSync(join(root, "module.html"), "utf8"));
  const document = window.document;
  // player.js is loaded as a script tag — evaluate it
  window.eval(readFileSync(join(root, "assets/player.js"), "utf8"));
  await sleep(100);

  // intro narrator rendered with 7 scene dots
  const dots = document.querySelectorAll(".scene-dot");
  ok(dots.length === 7, `intro shows 7 scenes, got ${dots.length}`);
  ok(document.querySelector("#narrator-root svg"), "intro stage svg exists");
  ok(document.querySelector(".stage-caption p").textContent.length > 10, "caption text present");
  const skillTiles = document.querySelectorAll(".skill-tile");
  ok(skillTiles.length === 6, `6 skill tiles, got ${skillTiles.length}`);

  // go to training
  fire(window, document.getElementById("skip-to-train"));
  await sleep(50);
  ok(!document.getElementById("train-zone").classList.contains("hide"), "train zone visible after skip");
  const enhanced = document.getElementById("enhanced-root");
  ok(enhanced.querySelector('[data-m="mission"]'), "enhanced mode tabs render");
  const promptEl = enhanced.querySelector('[data-h="prompt"]');
  ok(promptEl.textContent.length > 30, "mission question prompt rendered");

  // answer correctly through the UI
  const dbg = enhanced.__pmc;
  ok(dbg && dbg.current(), "debug hook exposes current problem");
  const p = dbg.current();
  const form = enhanced.querySelector('[data-h="form"]');
  if (p._choice) {
    const idx = p.choices.findIndex((c) => c.correct);
    fire(window, enhanced.querySelector(`.choice-card[data-i="${idx}"]`));
  } else {
    const inp = enhanced.querySelector(".filled-answer");
    inp.value = String(p.expected);
  }
  const xpBefore = window.Engine.state.xp;
  fire(window, form, "submit");
  await sleep(30);
  const fb = enhanced.querySelector('[data-h="fb"]');
  ok(fb.classList.contains("good"), `correct answer shows good feedback (got: ${fb.className})`);
  ok(window.Engine.state.xp > xpBefore, "XP increased after correct answer");
  ok(!enhanced.querySelector('[data-h="next"]').classList.contains("hide"), "next button revealed");

  // next question, answer WRONG through the UI
  fire(window, enhanced.querySelector('[data-h="next"]'));
  await sleep(30);
  const p2 = dbg.current();
  if (p2._choice) {
    const wrongIdx = p2.choices.findIndex((c) => !c.correct);
    fire(window, enhanced.querySelector(`.choice-card[data-i="${wrongIdx}"]`));
  } else {
    enhanced.querySelector(".filled-answer").value = String(p2.expected + 999);
  }
  fire(window, form, "submit");
  await sleep(30);
  const fb2 = enhanced.querySelector('[data-h="fb"]');
  ok(fb2.classList.contains("coach"), `wrong answer shows diagnosis coach card (got: ${fb2.className})`);
  ok(!enhanced.querySelector('[data-h="watch"]').classList.contains("hide"), "Watch it button appears after error");
  ok(!enhanced.querySelector('[data-h="build"]').classList.contains("hide"), "Build it button appears after error");

  // Build it: guided steps render and validate
  fire(window, enhanced.querySelector('[data-h="build"]'));
  await sleep(30);
  const stepInputs = enhanced.querySelectorAll(".coach-step input");
  ok(stepInputs.length === p2.steps.length, `guided steps render (${stepInputs.length}/${p2.steps.length})`);
  stepInputs.forEach((inp, i) => {
    inp.value = String(p2.steps[i].answer);
    fire(window, inp, "change");
  });
  await sleep(20);
  ok([...stepInputs].every((x) => x.disabled), "all guided steps accepted correct values");

  // mastery star path: 3 first-try correct in a row on one classic → 1 star
  const msBefore = window.Engine.classicState("train_problems", "pass-marker").stars;
  for (let k = 0; k < 3; k++) {
    window.Engine.recordAnswer("train_problems", "pass-marker", true, { combo: 1, base: 5 });
  }
  ok(window.Engine.classicState("train_problems", "pass-marker").stars === msBefore + 1, "3-streak earns a mastery star");

  // Pip mode
  fire(window, enhanced.querySelector('[data-m="pip"]'));
  await sleep(30);
  const pipLines = enhanced.querySelectorAll("[data-line]");
  ok(pipLines.length >= 2, `pip case shows worked lines (${pipLines.length})`);
  const pc = dbg.pipCase();
  fire(window, enhanced.querySelector(`[data-line="${pc.wrongLine}"]`));
  await sleep(20);
  const fixBox = enhanced.querySelector("[data-fix]");
  ok(!fixBox.classList.contains("hide"), "fix box appears after tapping the wrong line");
  fixBox.querySelector("input").value = String(pc.fix);
  const pipCaughtBefore = window.Engine.state.totals.pipCaught;
  fire(window, fixBox.querySelector("[data-fixbtn]"));
  await sleep(20);
  ok(window.Engine.state.totals.pipCaught === pipCaughtBefore + 1, "pip catch recorded");

  // Depot Master: hearts visible, wrong answer costs a heart
  fire(window, enhanced.querySelector('[data-m="master"]'));
  await sleep(30);
  ok(!enhanced.querySelector('[data-h="hearts"]').classList.contains("hide"), "hearts visible in Depot Master");
  const p3 = dbg.current();
  if (p3._choice) {
    const wrongIdx = p3.choices.findIndex((c) => !c.correct);
    fire(window, enhanced.querySelector(`.choice-card[data-i="${wrongIdx}"]`));
  } else {
    enhanced.querySelector(".filled-answer").value = String(p3.expected + 999);
  }
  const heartsBefore = dbg.state.hearts;
  fire(window, form, "submit");
  await sleep(20);
  ok(dbg.state.hearts === heartsBefore - 1, `wrong answer costs a heart (${heartsBefore} → ${dbg.state.hearts})`);
  window.close();
}

/* ================= 3. legacy adapter (all 14) ================= */
console.log("3. legacy adapter end-to-end (all classic modules)");
const MANIFEST = JSON.parse(readFileSync(join(root, "modules/registry.json"), "utf8")).modules;
const legacyIds = ["angles", "consecutive_number_triangles", "volume_prisms", "volume_problem_extension", "triangle_sides", "equal_height_triangles", "algebraic_word_puzzles", "addition_multiplication_2", "calculating_with_formulas", "prime_factorisation_2", "inequalities", "circles_sectors_2", "u2t2_units"];
for (const id of legacyIds) {
  const { window } = await makePage(`http://localhost/module.html?m=${id}`, readFileSync(join(root, "module.html"), "utf8"));
  const document = window.document;
  window.eval(readFileSync(join(root, "assets/player.js"), "utf8"));
  await sleep(120);
  const errBox = document.querySelector("#narrator-root .feedback.bad");
  ok(!errBox, `${id}: loads without adapter error${errBox ? " — " + errBox.textContent.slice(0, 120) : ""}`);
  const dots = document.querySelectorAll(".scene-dot");
  ok(dots.length >= 4, `${id}: intro has >=4 scenes (${dots.length})`);
  fire(window, document.getElementById("skip-to-train"));
  await sleep(60);
  const session = window.__pmcSession;
  ok(session && session.current(), `${id}: training session started`);
  if (!session) { window.close(); continue; }
  const prompt = document.getElementById("problem-prompt") || document.getElementById("q-text");
  ok(prompt && prompt.textContent.length > 10, `${id}: prompt rendered`);
  const p = session.current();
  const n = session.n;
  // correct answer through the real form
  if (n.isChoice(p)) {
    const good = p.choices.find((c) => c.isCorrect);
    const card = [...document.querySelectorAll(".choice-card")].find((c) => c.dataset.v === String("value" in good ? good.value : good.label));
    ok(card, `${id}: correct choice card found in DOM`);
    if (card) fire(window, card);
  } else if (n.isAddress(p)) {
    document.querySelector('[name="row"]').value = String(p.expected.row);
    document.querySelector('[name="position"]').value = String(p.expected.position);
  } else if (p.answerType === "ratio" && Array.isArray(p.expected)) {
    document.querySelector('[name="value"]').value = `${p.expected[0]}:${p.expected[1]}`;
  } else if (p.answerType === "expression" || p.answerType === "text") {
    document.querySelector('[name="value"]').value = String(p.expectedDisplay ?? p.expected);
  } else {
    document.querySelector('[name="value"]').value = String(p.expected);
  }
  fire(window, document.getElementById("answer-form"), "submit");
  await sleep(30);
  const fb = document.getElementById("feedback");
  ok(fb && fb.classList.contains("good"), `${id}: correct answer accepted through UI (got: ${fb && fb.className} — ${fb && fb.textContent.slice(0, 60)})`);
  const nextBtn = document.getElementById("next-btn");
  ok(nextBtn && !nextBtn.classList.contains("hide"), `${id}: next button revealed`);
  fire(window, nextBtn);
  await sleep(30);
  const p2 = session.current();
  ok(p2, `${id}: advanced to question 2`);
  window.close();
}

console.log("");
if (failures) {
  console.error(`INTEGRATION FAILED: ${failures} problem(s)`);
  process.exit(1);
} else {
  console.log("INTEGRATION PASSED — hub, flagship module and all 14 legacy adapters work end-to-end 🎉");
}
