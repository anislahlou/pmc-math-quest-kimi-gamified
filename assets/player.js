/* PMC Math Quest v2 — module player.
   One shell for every mission: animated Narrator intro + adaptive training
   with retry-until-mastery, hint ladder, coach cards, mastery stars, XP,
   combos and a recap that routes weak skills into focused practice.

   Legacy modules come in three API dialects; normalizeModule() adapts all:
     A) train-style: CLASSICS + createRound + renderIntroScene, label choices
     B) angles-style: INTRO_SCENES with svg() functions, value+label choices,
        renderProblemVisual -> {svg}, no createRound
     C) u2t2-style: MODULES (17 submodules), no intro scenes, "number" answers
   Enhanced modules (Train Problems v2) take over the training zone. */
(function () {
  "use strict";
  const E = window.Engine;
  const $ = (id) => document.getElementById(id);

  const moduleId = new URLSearchParams(location.search).get("m") || "train_problems";
  const meta = window.MANIFEST.find((m) => m.id === moduleId) || window.MANIFEST[0];

  /* ---------------- top stats ---------------- */
  function renderTopStats() {
    const lv = E.level();
    $("top-stats").innerHTML = `
      <span class="stat-pill"><span class="ico">${lv.emoji}</span> Lv ${lv.index}</span>
      <span class="stat-pill"><span class="ico">⚡</span> ${E.state.xp} XP</span>
      <span class="stat-pill"><span class="ico">🔥</span> ${E.state.streak.days}</span>
      <button class="stat-pill" id="mute-btn" style="cursor:pointer" title="Sound on/off"><span class="ico">${E.state.muted ? "🔇" : "🔊"}</span></button>`;
    $("mute-btn").addEventListener("click", () => { E.toggleMute(); renderTopStats(); });
  }
  E.onChange(renderTopStats);

  /* ---------------- mode tabs ---------------- */
  let narrator = null;
  function showMode(mode) {
    document.querySelectorAll(".mode-tab").forEach((t) => t.classList.toggle("active", t.dataset.mode === mode));
    $("intro-zone").classList.toggle("hide", mode !== "intro");
    $("train-zone").classList.toggle("hide", mode !== "train");
    $("recap-zone").classList.add("hide");
    if (mode !== "intro" && narrator) narrator.pause();
    if (mode === "train" && trainSession && !trainSession.started) trainSession.start();
  }
  document.querySelectorAll(".mode-tab").forEach((t) => t.addEventListener("click", () => { E.sfx.click(); showMode(t.dataset.mode); }));
  $("skip-to-train").addEventListener("click", () => { E.sfx.click(); showMode("train"); });

  /* ---------------- legacy module normalization ---------------- */
  function normalizeModule(api) {
    const classics = (api.CLASSICS || api.MODULES || []).map((c) => ({
      id: c.id,
      nickname: c.nickname || c.title || c.id,
      skill: c.skill || (Array.isArray(c.skills) ? c.skills.join(" · ") : "")
    }));

    function classicIdOf(p) {
      return p.classicId || p.moduleId || (p.id ? String(p.id).replace(/-\d+$/, "") : classics[0]?.id);
    }
    function classicNameOf(p) {
      const c = classics.find((x) => x.id === classicIdOf(p));
      return p.classic || (c && c.nickname) || "Skill";
    }
    function isChoice(p) {
      return p.answerType === "choice" && Array.isArray(p.choices) && p.choices.length > 0;
    }
    function check(p, input) {
      // composite address answers (consecutive triangles): {row, position}
      if (isAddress(p)) return api.checkAnswer(p, { row: input.row, position: input.position });
      // universal submit: modules disagree on whether .choice is the label
      // (train-style) or the value (volume/u2t2-style). Sending the VALUE as
      // both .choice and .value satisfies every dialect: label-only modules
      // fall back to the label (which is also their expected value).
      if (isChoice(p)) {
        const picked = p.choices.find((c) => String(c.label) === String(input.choice) || String(c.value) === String(input.choice));
        const submit = picked ? ("value" in picked ? picked.value : picked.label) : input.choice;
        return api.checkAnswer(p, { choice: submit, value: submit });
      }
      return api.checkAnswer(p, { value: input.value, choice: input.value });
    }
    function visual(p, state) {
      const v = api.renderProblemVisual(p, state);
      if (!v) return { html: "", text: "" };
      return { html: v.html || v.svg || "", text: v.text || "" };
    }
    // composite answer types: consecutive "address" needs {row, position}
    function isAddress(p) {
      return p.answerType === "address" || (p.expected && typeof p.expected === "object" && "row" in p.expected);
    }
    function introSceneSvg(i) {
      if (typeof api.renderIntroScene === "function") return api.renderIntroScene(i);
      const s = (api.INTRO_SCENES || [])[i];
      if (s && typeof s.svg === "function") return s.svg();
      if (s && typeof s.svg === "string") return s.svg;
      return null;
    }
    function makeRound(offset, count = 6) {
      if (typeof api.createRound === "function") return api.createRound(offset);
      // dialect B/C: one problem per classic, shifted by offset
      const ms = E.state.modules[moduleId];
      const ordered = classics.slice().sort((a, b) => {
        const sa = ((ms && ms.classics[a.id]) || { stars: 0, correct: 0 });
        const sb = ((ms && ms.classics[b.id]) || { stars: 0, correct: 0 });
        return (sa.stars - sb.stars) || (sa.correct - sb.correct);
      });
      const pickList = ordered.slice(0, Math.min(count, ordered.length));
      return pickList.map((c, i) => api.generateProblem(c.id, offset + i));
    }
    function scenesRaw() {
      if (Array.isArray(api.INTRO_SCENES) && api.INTRO_SCENES.length) return api.INTRO_SCENES;
      // u2t2: synthesize scenes from submodule metadata
      return (api.MODULES || []).slice(0, 8).map((m) => ({
        title: m.title,
        purpose: m.zone,
        caption: m.intro,
        voiceover: `${m.title}. ${m.intro} In this quest you will master: ${(m.skills || []).join(", ")}.`,
        durationMs: 11000
      }));
    }
    return { api, classics, classicIdOf, classicNameOf, isChoice, isAddress, check, visual, introSceneSvg, makeRound, scenesRaw };
  }

  /* ---------------- intro scenes ---------------- */
  function chunkBeats(text, duration) {
    const sents = String(text).match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    const per = Math.max(1, Math.ceil(sents.length / 3));
    for (let i = 0; i < sents.length; i += per) chunks.push(sents.slice(i, i + per).join(" ").trim());
    const total = chunks.join(" ").length || 1;
    let acc = 0;
    return chunks.map((c) => {
      const t = (acc / total) * (duration - 0.4);
      acc += c.length;
      return { t: Math.max(0, t), text: c };
    });
  }

  let svgRef = null;

  function legacyScenes(norm) {
    return norm.scenesRaw().map((s, i) => {
      const duration = Math.max(6, (s.durationMs || 12000) / 1000);
      const say = s.voiceover || s.caption || s.purpose || s.title;
      return {
        title: s.title,
        say,
        duration,
        beats: chunkBeats(say, duration),
        build(svg) {
          let html = null;
          try { html = norm.introSceneSvg(i); } catch { html = null; }
          if (!html && s.caption) {
            svg.setAttribute("viewBox", "0 0 560 330");
            svg.innerHTML = `<rect x="0" y="0" width="560" height="330" fill="#dff1ff"/><text x="280" y="140" text-anchor="middle" font-size="26" font-weight="800" fill="#232946">${E.esc(s.title)}</text><text x="280" y="180" text-anchor="middle" font-size="15" font-weight="600" fill="#4a5578">${E.esc(String(s.caption).slice(0, 90))}</text>`;
            return;
          }
          try {
            const doc = new DOMParser().parseFromString(html, "image/svg+xml");
            const inner = doc.querySelector("svg");
            if (inner) {
              const vb = inner.getAttribute("viewBox");
              if (vb) svg.setAttribute("viewBox", vb);
              svg.innerHTML = inner.innerHTML;
            } else {
              svg.innerHTML = html;
            }
          } catch {
            svg.innerHTML = "";
          }
        },
        update(t01) {
          if (svgRef) svgRef.style.transform = `translateY(${Math.sin(t01 * Math.PI * 2) * 3}px)`;
        }
      };
    });
  }

  function mountIntro(scenes) {
    narrator = new E.Narrator({
      root: $("narrator-root"),
      scenes,
      onFinish() {
        E.markIntroWatched(moduleId);
        E.toast("🎬 Story complete — +20 XP! Time to train.");
        setTimeout(() => showMode("train"), 1200);
      },
      onCheck(_i, correct) { if (correct) { E.addXP(4, moduleId, "check"); E.confetti.burst(30); } }
    });
    svgRef = $("narrator-root").querySelector("svg");
  }

  function mountSkillTiles(norm) {
    const list = norm ? norm.classics : meta.skills.map((s) => ({ nickname: s, skill: "" }));
    $("skill-tiles").innerHTML = list.map((c, i) =>
      `<div class="skill-tile"><span class="num">${i + 1}</span><div><strong>${E.esc(c.nickname)}</strong>${c.skill ? `<span>${E.esc(c.skill)}</span>` : ""}</div></div>`).join("");
  }

  /* ---------------- legacy adaptive session ---------------- */
  class LegacySession {
    constructor(norm) {
      this.n = norm;
      this.started = false;
      this.offset = 0;
      this.variantCounters = {};
      this.queue = [];
      this.idx = 0;
      this.combo = 0;
      this.xpVisit = 0;
      this.roundXP = 0;
      this.roundFirstTry = 0;
      this.roundStars = 0;
      this.focused = null;
      E.moduleState(moduleId).classicCount = norm.classics.length;
      E.save();
    }
    start() {
      this.started = true;
      this.newRound();
    }
    nextVariant(id) {
      const v = this.variantCounters[id] || 0;
      this.variantCounters[id] = v + 1;
      return v;
    }
    makeProblem(id) {
      const p = this.n.api.generateProblem(id, this.nextVariant(id));
      p._firstTry = true;
      return p;
    }
    newRound(focusClassic = null) {
      this.focused = focusClassic;
      if (focusClassic) {
        this.queue = [this.makeProblem(focusClassic), this.makeProblem(focusClassic), this.makeProblem(focusClassic)];
      } else {
        this.offset += 1;
        this.queue = this.n.makeRound(this.offset).map((p) => { p._firstTry = true; return p; });
      }
      this.idx = 0;
      this.roundXP = 0;
      this.roundFirstTry = 0;
      this.roundStars = 0;
      this.render();
    }
    current() { return this.queue[this.idx]; }
    renderChips() {
      const ms = E.moduleState(moduleId);
      const curId = this.current() ? this.n.classicIdOf(this.current()) : null;
      $("mastery-chips").innerHTML = this.n.classics.map((c) => {
        const st = (ms.classics[c.id] || { stars: 0 }).stars;
        return `<button type="button" class="mchip ${curId === c.id ? "current" : ""}" data-c="${c.id}" title="Train this skill">
          ${E.esc(c.nickname)} <span class="stars">${"★".repeat(st)}${"☆".repeat(3 - st)}</span></button>`;
      }).join("");
      $("mastery-chips").querySelectorAll(".mchip").forEach((b) => b.addEventListener("click", () => {
        E.sfx.click();
        this.newRound(b.dataset.c);
        E.toast("🎯 Focused practice — three in a row earns a star!");
      }));
    }
    renderHUD() {
      $("hud-xp").textContent = `${this.xpVisit} XP this visit`;
      $("hud-combo").textContent = `combo ×${this.combo}`;
      $("hud-count").textContent = this.focused
        ? `Focus drill · ${this.idx + 1} of ${this.queue.length}`
        : `Question ${this.idx + 1} of ${this.queue.length}`;
    }
    render() {
      const p = this.current();
      this.renderHUD();
      this.renderChips();
      $("q-skill").textContent = this.n.classicNameOf(p);
      $("q-text").textContent = p.prompt;
      $("hint-zone").innerHTML = "";
      $("coach-zone").innerHTML = "";
      const fb = $("feedback");
      fb.className = "feedback hide";
      $("next-btn").classList.add("hide");
      $("check-btn").disabled = false;
      p._hintLevel = 0;
      if (this.n.isChoice(p)) {
        $("answer-host").innerHTML = `<div class="choice-grid">${p.choices.map((c, i) => `
          <label class="choice-card" data-v="${E.esc("value" in c ? c.value : c.label)}"><input type="radio" name="choice" value="${E.esc("value" in c ? c.value : c.label)}"><span>${E.esc(String(c.label))}</span></label>`).join("")}</div>`;
        $("answer-host").querySelectorAll(".choice-card").forEach((card) => {
          card.addEventListener("click", () => {
            $("answer-host").querySelectorAll(".choice-card").forEach((x) => x.classList.remove("picked"));
            card.classList.add("picked");
          });
        });
      } else if (this.n.isAddress(p)) {
        $("answer-host").innerHTML = `<div class="answer-row">
          <input class="filled-answer" name="row" autocomplete="off" inputmode="numeric" placeholder="Row">
          <input class="filled-answer" name="position" autocomplete="off" inputmode="numeric" placeholder="Position in row">
        </div>`;
        setTimeout(() => $("answer-host").querySelector("input")?.focus(), 60);
      } else {
        $("answer-host").innerHTML = `<div class="answer-row"><input class="filled-answer" name="value" autocomplete="off" inputmode="decimal" placeholder="Type your answer…"></div>`;
        setTimeout(() => $("answer-host").querySelector("input")?.focus(), 60);
      }
      this.renderVisual("initial");
    }
    renderVisual(state) {
      try {
        const v = this.n.visual(this.current(), state);
        const host = $("visual-host");
        host.innerHTML = v.html;
        const svg = host.querySelector("svg");
        if (svg) { svg.style.width = "100%"; svg.style.height = "100%"; }
        $("visual-note").textContent = v.text || "";
      } catch {
        $("visual-host").innerHTML = "";
        $("visual-note").textContent = "";
      }
    }
    collect() {
      // read the .picked card directly — more robust than FormData radio state
      const picked = $("answer-host").querySelector(".choice-card.picked");
      const form = new FormData($("answer-form"));
      return { choice: picked ? picked.dataset.v : null, value: form.get("value"), row: form.get("row"), position: form.get("position") };
    }
    check() {
      const p = this.current();
      const input = this.collect();
      if (this.n.isAddress(p) && (!String(input.row ?? "").trim() || !String(input.position ?? "").trim())) { E.toast("Enter both the row and the position!"); return; }
      if (this.n.isChoice(p) && (input.choice === null || input.choice === undefined)) { E.toast("Pick an answer first!"); return; }
      if (!this.n.isChoice(p) && !this.n.isAddress(p) && !String(input.value ?? "").trim()) { E.toast("Type your answer first!"); return; }
      let res;
      try { res = this.n.check(p, input); } catch (err) { res = { isCorrect: false, message: err.message }; }
      if (res.isCorrect) this.onCorrect(res);
      else this.onWrong(res);
    }
    onCorrect(res) {
      const p = this.current();
      const cid = this.n.classicIdOf(p);
      const firstTry = p._firstTry;
      if (firstTry) { this.combo += 1; this.roundFirstTry += 1; } else { this.combo = 0; }
      const out = E.recordAnswer(moduleId, cid, true, {
        combo: this.combo,
        retry: !firstTry,
        base: 8 + meta.difficulty * 2
      });
      if (out.masteryUp) this.roundStars += 1;
      this.xpVisit += out.xpGain;
      this.roundXP += out.xpGain;
      E.dailyProgress(moduleId, out.xpGain);
      E.sfx.correct();
      E.confetti.burst(out.masteryUp ? 60 : 25);
      const fb = $("feedback");
      fb.className = "feedback good";
      fb.innerHTML = `🎉 <b>Correct!</b> +${out.xpGain} XP${this.combo >= 2 ? ` · 🔥 combo ×${this.combo}` : ""}<span class="why">${E.esc(p.solution || res.message || "")}</span>`;
      this.renderVisual("solution");
      this.markChoices(true);
      $("check-btn").disabled = true;
      $("next-btn").classList.remove("hide");
      this.renderHUD();
      this.renderChips();
    }
    onWrong(res) {
      const p = this.current();
      p._firstTry = false;
      this.combo = 0;
      E.recordAnswer(moduleId, this.n.classicIdOf(p), false, {});
      E.sfx.wrong();
      const fb = $("feedback");
      fb.className = "feedback bad";
      fb.innerHTML = `💪 <b>Not yet — good, this is where learning happens!</b><span class="why">${E.esc(res.message || p.hint1 || "Look at what the question is really asking.")}</span>`;
      this.renderVisual("hint");
      this.markChoices(false);
      $("coach-zone").innerHTML = `
        <div class="feedback coach mt8">
          🦊 <b>Pip says:</b> don't move on yet — try once more. Ask for a hint if you want the method, or <b>Show why</b> to watch it solved, then prove it on a fresh one.
        </div>`;
      this.renderHUD();
    }
    markChoices(correctWas) {
      const picked = $("answer-host").querySelector(".choice-card.picked");
      if (!picked) return;
      picked.classList.add(correctWas ? "reveal-good" : "reveal-bad");
    }
    hint() {
      const p = this.current();
      const hints = [p.hint1, p.hint2].filter(Boolean);
      if (!hints.length) { E.toast("No hints for this one — try Show why."); return; }
      const h = hints[Math.min(p._hintLevel, hints.length - 1)];
      p._hintLevel += 1;
      p._firstTry = false;
      $("hint-zone").insertAdjacentHTML("beforeend", `<div class="hint-box">💡 ${E.esc(typeof h === "string" ? h : h.text || "")}</div>`);
      this.renderVisual("hint");
    }
    showWhy() {
      const p = this.current();
      p._firstTry = false;
      const fb = $("feedback");
      fb.className = "feedback";
      fb.innerHTML = `👀 <b>Watch how it works:</b><span class="why">${E.esc(p.solution || "")}</span>`;
      this.renderVisual("solution");
      // Re-angle: swap in a fresh variant of the same skill to prove mastery.
      this.queue[this.idx] = this.makeProblem(this.n.classicIdOf(p));
      E.toast("🔄 Fresh numbers — your turn to prove it!");
      setTimeout(() => this.render(), 2600);
    }
    next() {
      if (this.idx < this.queue.length - 1) {
        this.idx += 1;
        this.render();
      } else {
        this.recap();
      }
    }
    recap() {
      $("train-zone").classList.add("hide");
      $("recap-zone").classList.remove("hide");
      const total = this.queue.length;
      const acc = total ? Math.round((this.roundFirstTry / total) * 100) : 0;
      $("recap-emoji").textContent = acc >= 80 ? "🏆" : acc >= 50 ? "🎉" : "💪";
      $("recap-title").textContent = acc >= 80 ? "Brilliant round!" : acc >= 50 ? "Good round — keep pushing!" : "Tough round — that's how brains grow!";
      $("recap-sub").textContent = this.focused ? "Focus drill complete." : "You finished every question. Mastery comes from the ones you retried.";
      $("recap-xp").textContent = this.roundXP;
      $("recap-acc").textContent = `${acc}%`;
      $("recap-stars").textContent = this.roundStars;
      const ms = E.moduleState(moduleId);
      const weak = this.n.classics.filter((c) => (ms.classics[c.id] || { stars: 0 }).stars < 3);
      $("weak-zone").innerHTML = weak.length ? `
        <h3 class="mt16">🎯 Skills to power up next</h3>
        <div class="weak-list">${weak.map((c) => {
          const st = (ms.classics[c.id] || { stars: 0 }).stars;
          return `<div class="weak-item">
            <div><strong>${E.esc(c.nickname)}</strong> <span class="stars">${"★".repeat(st)}${"☆".repeat(3 - st)}</span><br><span class="muted">${E.esc(c.skill || "")}</span></div>
            <button class="btn sky slim" data-c="${c.id}" type="button">Train this skill →</button>
          </div>`;
        }).join("")}</div>` : `
        <p class="center mt16" style="font-size:1.1rem">🌟 <b>Every skill mastered in this mission!</b> Try a harder mission from the map.</p>`;
      $("weak-zone").querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", () => {
        E.sfx.click();
        $("recap-zone").classList.add("hide");
        $("train-zone").classList.remove("hide");
        this.newRound(b.dataset.c);
      }));
      $("recap-again").onclick = () => { E.sfx.click(); $("recap-zone").classList.add("hide"); $("train-zone").classList.remove("hide"); this.newRound(); };
      $("recap-intro").onclick = () => { E.sfx.click(); $("recap-zone").classList.add("hide"); showMode("intro"); };
      $("recap-home").onclick = () => { location.href = "index.html"; };
    }
  }

  /* ---------------- boot ---------------- */
  let trainSession = null;

  async function boot() {
    document.title = `PMC Math Quest — ${meta.title}`;
    $("mod-chapter").textContent = `${meta.chapter} · ${meta.skills.length} skills`;
    $("mod-title").textContent = `${meta.emoji} ${meta.title}`;
    renderTopStats();

    if (meta.enhanced && window.TrainV2) {
      mountSkillTiles(null);
      mountIntro(window.TrainV2.scenes);
      $("legacy-root").classList.add("hide");
      trainSession = {
        started: false,
        start() {
          this.started = true;
          window.TrainV2.mount({
            root: $("enhanced-root"),
            engine: E,
            meta,
            moduleId
          });
        }
      };
      showMode("intro");
      return;
    }

    try {
      const api = await E.loadLegacyModule(moduleId);
      const norm = normalizeModule(api);
      if (!norm.classics.length || typeof api.generateProblem !== "function") throw new Error("Module API incomplete");
      mountSkillTiles(norm);
      mountIntro(legacyScenes(norm));
      trainSession = new LegacySession(norm);
      window.__pmcSession = trainSession; // headless-test hook (no UI impact)
      $("answer-form").addEventListener("submit", (e) => { e.preventDefault(); trainSession.check(); });
      $("hint-btn").addEventListener("click", () => { E.sfx.click(); trainSession.hint(); });
      $("why-btn").addEventListener("click", () => { E.sfx.click(); trainSession.showWhy(); });
      $("next-btn").addEventListener("click", () => { E.sfx.click(); trainSession.next(); });
      showMode("intro");
    } catch (err) {
      $("narrator-root").innerHTML = `
        <div class="feedback bad">😅 This mission couldn't load here (${E.esc(err.message)}).
        Make sure you're viewing through the dev server (<code>npm run dev</code>).</div>`;
    }
  }

  boot();
})();
