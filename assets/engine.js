/* PMC Math Quest v2 — learning engine
   Owns: profile & gamification (XP, levels, mastery stars, streaks, badges,
   daily quest), sound effects, confetti, toasts, the animated Narrator used
   for intro videos, and the adapter that runs legacy module files inside the
   new shell. No dependencies; everything persists to localStorage. */
(function () {
  "use strict";

  const STORE_KEY = "pmc_math_quest_v2";

  /* ================= profile store ================= */

  const LEVELS = [
    { at: 0, title: "Math Scout", emoji: "🔎" },
    { at: 120, title: "Number Tamer", emoji: "🧮" },
    { at: 300, title: "Puzzle Rider", emoji: "🧩" },
    { at: 550, title: "Pattern Pro", emoji: "🌀" },
    { at: 850, title: "Bridge Builder", emoji: "🌉" },
    { at: 1250, title: "Depot Star", emoji: "⭐" },
    { at: 1750, title: "Quest Captain", emoji: "🚀" },
    { at: 2400, title: "Math Legend", emoji: "🏆" }
  ];

  const BADGES = [
    { id: "first_steps", emoji: "👣", name: "First Steps", desc: "Answer your first question", test: (s) => s.totals.answered >= 1 },
    { id: "sharp_eye", emoji: "🕵️", name: "Sharp Eye", desc: "Catch 3 of Pip's mistakes", test: (s) => s.totals.pipCaught >= 3 },
    { id: "on_fire", emoji: "🔥", name: "On Fire", desc: "Reach a 5-answer combo", test: (s) => s.totals.bestCombo >= 5 },
    { id: "unstoppable", emoji: "⚡", name: "Unstoppable", desc: "Reach a 10-answer combo", test: (s) => s.totals.bestCombo >= 10 },
    { id: "movie_buff", emoji: "🎬", name: "Movie Buff", desc: "Watch a full intro video", test: (s) => Object.keys(s.intros).length >= 1 },
    { id: "star_collector", emoji: "🌟", name: "Star Collector", desc: "Master 5 skills", test: (s) => masteredSkills(s) >= 5 },
    { id: "skill_sweep", emoji: "🧹", name: "Skill Sweep", desc: "Master every skill in one mission", test: (s) => anyModuleFullyMastered(s) },
    { id: "regular", emoji: "📅", name: "Regular", desc: "Play 3 days in a row", test: (s) => s.streak.days >= 3 },
    { id: "weekly_hero", emoji: "🗓️", name: "Weekly Hero", desc: "Play 7 days in a row", test: (s) => s.streak.days >= 7 },
    { id: "daily_done", emoji: "✅", name: "Daily Done", desc: "Finish a daily quest", test: (s) => s.totals.dailyDone >= 1 },
    { id: "centurion", emoji: "💯", name: "Centurion", desc: "Answer 100 questions", test: (s) => s.totals.answered >= 100 },
    { id: "depot_master", emoji: "🚂", name: "Depot Master", desc: "Master every Train Problems skill", test: (s) => moduleMastered(s, "train_problems") }
  ];

  function blankProfile() {
    return {
      xp: 0,
      muted: false,
      streak: { days: 0, lastDay: null },
      totals: { answered: 0, correct: 0, bestCombo: 0, pipCaught: 0, dailyDone: 0 },
      modules: {},      // id -> { xp, classics: { classicId: {stars, streak, correct, attempts} }, done }
      intros: {},       // moduleId -> true when intro watched fully
      badges: [],       // badge ids earned
      daily: null       // { day, moduleId, target, progress, done }
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return blankProfile();
      return Object.assign(blankProfile(), JSON.parse(raw));
    } catch {
      return blankProfile();
    }
  }

  const state = load();
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* private mode */ }
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function touchStreak() {
    const today = todayKey();
    if (state.streak.lastDay === today) return;
    const yesterday = new Date(Date.now() - 864e5);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    state.streak.days = state.streak.lastDay === yKey ? state.streak.days + 1 : 1;
    state.streak.lastDay = today;
    save();
  }

  function level() {
    let lv = LEVELS[0], next = null, idx = 0;
    LEVELS.forEach((l, i) => { if (state.xp >= l.at) { lv = l; idx = i; } });
    next = LEVELS[idx + 1] || null;
    const floor = lv.at, ceil = next ? next.at : lv.at + 1;
    return { ...lv, index: idx + 1, next, pct: next ? Math.min(100, Math.round(((state.xp - floor) / (ceil - floor)) * 100)) : 100 };
  }

  function moduleState(id) {
    if (!state.modules[id]) state.modules[id] = { xp: 0, classics: {}, done: false };
    return state.modules[id];
  }

  function classicState(moduleId, classicId) {
    const m = moduleState(moduleId);
    if (!m.classics[classicId]) m.classics[classicId] = { stars: 0, streak: 0, correct: 0, attempts: 0 };
    return m.classics[classicId];
  }

  function masteredSkills(s) {
    return Object.values(s.modules).reduce((n, m) => n + Object.values(m.classics).filter((c) => c.stars >= 3).length, 0);
  }
  function moduleMastered(s, id) {
    const m = s.modules[id];
    if (!m || !m.classicCount) return false;
    const got = Object.values(m.classics).filter((c) => c.stars >= 3).length;
    return got >= m.classicCount && m.classicCount > 0;
  }
  function anyModuleFullyMastered(s) {
    return Object.keys(s.modules).some((id) => moduleMastered(s, id));
  }

  const listeners = new Set();
  function emit(what) { listeners.forEach((fn) => { try { fn(what); } catch { /* noop */ } }); }

  function checkBadges() {
    for (const b of BADGES) {
      if (!state.badges.includes(b.id) && b.test(state)) {
        state.badges.push(b.id);
        save();
        toast(`Badge earned: ${b.emoji} ${b.name}!`, "badge-toast");
        sfx.badge();
        confetti.burst();
        emit({ type: "badge", badge: b });
      }
    }
  }

  function addXP(amount, moduleId, why) {
    if (amount <= 0) return;
    const before = level();
    state.xp += amount;
    if (moduleId) moduleState(moduleId).xp += amount;
    save();
    const after = level();
    emit({ type: "xp", amount, why });
    if (after.index > before.index) {
      sfx.levelup();
      confetti.burst(160);
      levelUpPop(after);
    }
  }

  // recordAnswer: updates mastery stars, combo, XP, streak, badges.
  // Returns { xpGain, stars, masteryUp }.
  function recordAnswer(moduleId, classicId, correct, opts = {}) {
    touchStreak();
    const c = classicState(moduleId, classicId);
    c.attempts += 1;
    state.totals.answered += 1;
    let xpGain = 0, masteryUp = false;
    if (correct) {
      c.correct += 1;
      c.streak += 1;
      state.totals.correct += 1;
      const combo = opts.combo || 1;
      state.totals.bestCombo = Math.max(state.totals.bestCombo, combo);
      xpGain = Math.round((opts.base ?? 10) * (1 + 0.25 * Math.min(combo - 1, 4)) * (opts.retry ? 0.5 : 1));
      if (c.streak >= 3 && c.stars < 3) {
        c.stars = Math.min(3, c.stars + 1);
        c.streak = 0;
        masteryUp = true;
        xpGain += 15;
        sfx.star();
        toast(`⭐ Skill star earned (${c.stars}/3)!`);
        confetti.burst(70);
      }
    } else {
      c.streak = 0;
    }
    addXP(xpGain, moduleId, correct ? "correct" : "attempt");
    if (moduleId && moduleState(moduleId).classicCount) {
      // done flag when every classic has 3 stars
      moduleState(moduleId).done = moduleMastered(state, moduleId);
    }
    save();
    checkBadges();
    return { xpGain, stars: c.stars, masteryUp };
  }

  function markIntroWatched(moduleId) {
    if (!state.intros[moduleId]) {
      state.intros[moduleId] = true;
      addXP(20, moduleId, "intro");
      save();
      checkBadges();
    }
  }

  /* daily quest: deterministic pick from the module list for the day */
  function dailyQuest(modules) {
    const today = todayKey();
    if (!state.daily || state.daily.day !== today || !modules.some((m) => m.id === state.daily.moduleId)) {
      let hash = 0;
      for (const ch of today) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
      const pool = modules.filter((m) => !m.external);
      const pick = pool[hash % pool.length];
      state.daily = { day: today, moduleId: pick.id, target: 40, progress: 0, done: false };
      save();
    }
    return state.daily;
  }

  function dailyProgress(moduleId, xpGain) {
    const d = state.daily;
    if (!d || d.done || d.moduleId !== moduleId || !xpGain) return;
    d.progress += xpGain;
    if (d.progress >= d.target) {
      d.done = true;
      state.totals.dailyDone += 1;
      save();
      toast("✅ Daily quest complete! +40 XP", "badge-toast");
      addXP(40, moduleId, "daily");
      confetti.burst(120);
      checkBadges();
    } else {
      save();
    }
  }

  /* ================= sound effects (WebAudio, no assets) ================= */

  let actx = null;
  function ac() {
    if (state.muted) return null;
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === "suspended") actx.resume().catch(() => {});
    return actx;
  }
  function blip(freqs, dur = 0.12, type = "triangle", gain = 0.12) {
    const ctx = ac();
    if (!ctx) return;
    const t0 = ctx.currentTime;
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + i * dur);
      g.gain.exponentialRampToValueAtTime(gain, t0 + i * dur + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * dur);
      o.connect(g).connect(ctx.destination);
      o.start(t0 + i * dur); o.stop(t0 + (i + 1) * dur + 0.02);
    });
  }
  const sfx = {
    click: () => blip([520], 0.07, "triangle", 0.07),
    correct: () => blip([523, 659, 784], 0.1),
    wrong: () => blip([220, 185], 0.14, "sawtooth", 0.06),
    star: () => blip([784, 988, 1175, 1568], 0.09),
    levelup: () => blip([523, 659, 784, 1047, 1319], 0.11),
    badge: () => blip([880, 1109, 1319, 1760], 0.1, "square", 0.05),
    whistle: () => blip([988, 988], 0.18, "sine", 0.1)
  };

  /* ================= confetti ================= */

  const confetti = (() => {
    let canvas, ctx, parts = [], raf = null;
    const COLORS = ["#ffc531", "#ff6b57", "#5b5bd6", "#2fbf8f", "#38b6e8", "#ff5d8f"];
    function ensure() {
      if (canvas) return;
      canvas = document.createElement("canvas");
      canvas.className = "confetti-canvas";
      document.body.appendChild(canvas);
      ctx = canvas.getContext("2d");
    }
    function resize() {
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
    }
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts = parts.filter((p) => p.y < canvas.height + 20 && p.life > 0);
      if (!parts.length) { raf = null; canvas.remove(); canvas = null; return; }
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.18 * devicePixelRatio; p.rot += p.vr; p.life -= 1;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.globalAlpha = Math.min(1, p.life / 40);
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    }
    function burst(count = 90) {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      ensure(); resize();
      const cx = canvas.width / 2, cy = canvas.height * 0.28;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2, v = (4 + Math.random() * 7) * devicePixelRatio;
        parts.push({
          x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3 * devicePixelRatio,
          s: (6 + Math.random() * 7) * devicePixelRatio, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
          color: COLORS[i % COLORS.length], life: 90 + Math.random() * 40
        });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }
    return { burst };
  })();

  /* ================= toasts & level-up ================= */

  function toastZone() {
    let z = document.querySelector(".toast-zone");
    if (!z) { z = document.createElement("div"); z.className = "toast-zone"; document.body.appendChild(z); }
    return z;
  }
  function toast(msg, cls = "") {
    const t = document.createElement("div");
    t.className = `toast ${cls}`;
    t.textContent = msg;
    toastZone().appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }
  function levelUpPop(lv) {
    const wrap = document.createElement("div");
    wrap.className = "levelup-pop";
    wrap.innerHTML = `
      <div class="levelup-card">
        <div class="big-emoji">${lv.emoji}</div>
        <h2>Level ${lv.index} — ${lv.title}!</h2>
        <p class="muted">Your maths powers are growing. Keep the streak alive!</p>
        <button class="btn primary mt16" type="button">Keep going</button>
      </div>`;
    wrap.querySelector("button").addEventListener("click", () => wrap.remove());
    wrap.addEventListener("click", (e) => { if (e.target === wrap) wrap.remove(); });
    document.body.appendChild(wrap);
  }

  /* ================= mascot (Pip, SVG) ================= */

  function pipSVG(size = 44, mood = "happy") {
    const mouth = mood === "thinking"
      ? `<path d="M22 33 q4 -2 8 0" stroke="#232946" stroke-width="2" fill="none" stroke-linecap="round"/>`
      : `<path d="M20 31 q6 5 12 0" stroke="#232946" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    const eye = mood === "thinking"
      ? `<circle cx="20" cy="24" r="2.2" fill="#232946"/><circle cx="33" cy="22" r="2.2" fill="#232946"/><path d="M29 16 l8 -2" stroke="#232946" stroke-width="2" stroke-linecap="round"/>`
      : `<circle cx="20" cy="23" r="2.4" fill="#232946"/><circle cx="32" cy="23" r="2.4" fill="#232946"/>`;
    return `<svg class="pip-face" width="${size}" height="${size}" viewBox="0 0 52 52" role="img" aria-label="Pip the fox engineer">
      <circle cx="26" cy="27" r="19" fill="#ff9d5c" stroke="#232946" stroke-width="2.5"/>
      <path d="M10 16 L14 5 L22 12 Z" fill="#ff9d5c" stroke="#232946" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M42 16 L38 5 L30 12 Z" fill="#ff9d5c" stroke="#232946" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="26" cy="33" rx="9" ry="6.5" fill="#fff3e4"/>
      <circle cx="26" cy="29.5" r="2.6" fill="#232946"/>
      ${eye}${mouth}
      <path d="M12 12 q14 -12 28 0 l-2 4 q-12 -9 -24 0 Z" fill="#5b5bd6" stroke="#232946" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="24" y="2" width="4" height="5" rx="2" fill="#ffc531" stroke="#232946" stroke-width="2"/>
    </svg>`;
  }

  /* ================= Narrator — animated, beat-synced intro player =================
     scenes: [{
       title, say,                      // scene name + full narration text
       beats: [{t, text}],              // caption chunks at time t (seconds)
       build(svg) {},                   // draw static scene elements
       update(t01, tSec, ctx) {},       // animate at normalized time
       check: {t, question, choices:[{label, correct}], explain},  // interactive pause
       duration                          // seconds
     }]
  */
  class Narrator {
    constructor(opts) {
      this.o = opts;
      this.i = 0;
      this.playing = false;
      this.t = 0;               // seconds into current scene
      this.raf = null;
      this.last = 0;
      this.seenAll = false;
      this.visited = new Set([0]);
      this.checked = new Set();
      this.voiceOn = opts.voiceOn !== false;
      this._buildChrome();
      this._show(0, false);
    }
    _buildChrome() {
      const o = this.o;
      o.root.innerHTML = `
        <div class="stage-wrap">
          <div class="stage"><svg viewBox="0 0 560 330" preserveAspectRatio="xMidYMid meet" aria-label="Intro scene"></svg></div>
          <div class="check-pop hide"></div>
        </div>
        <div class="progress-rail"><span></span></div>
        <div class="stage-caption">${pipSVG(44)}<p></p></div>
        <div class="video-controls">
          <button class="btn primary" data-a="play" type="button">▶ Play</button>
          <button class="btn ghost slim" data-a="prev" type="button">← Back</button>
          <button class="btn ghost slim" data-a="next" type="button">Next →</button>
          <button class="btn ghost slim" data-a="replay" type="button">↺ Replay scene</button>
          <button class="btn ghost slim" data-a="voice" type="button">🔊 Voice on</button>
        </div>
        <div class="scene-track"></div>`;
      this.svg = o.root.querySelector("svg");
      this.caption = o.root.querySelector(".stage-caption p");
      this.rail = o.root.querySelector(".progress-rail > span");
      this.pop = o.root.querySelector(".check-pop");
      this.track = o.root.querySelector(".scene-track");
      o.root.querySelector('[data-a="play"]').addEventListener("click", () => this.toggle());
      o.root.querySelector('[data-a="prev"]').addEventListener("click", () => { this.pause(); this._show(this.i - 1, false); });
      o.root.querySelector('[data-a="next"]').addEventListener("click", () => { this.pause(); this._show(this.i + 1, false); });
      o.root.querySelector('[data-a="replay"]').addEventListener("click", () => this._show(this.i, true));
      o.root.querySelector('[data-a="voice"]').addEventListener("click", (e) => {
        this.voiceOn = !this.voiceOn;
        e.target.textContent = this.voiceOn ? "🔊 Voice on" : "🔇 Voice off";
        if (!this.voiceOn) this._stopSpeech();
        else if (this.playing) this._speak();
      });
    }
    scene() { return this.o.scenes[this.i]; }
    _renderTrack() {
      this.track.innerHTML = this.o.scenes.map((s, i) =>
        `<button type="button" class="scene-dot ${i === this.i ? "active" : ""} ${this.visited.has(i) && i !== this.i ? "seen" : ""}" data-i="${i}">${i + 1}. ${s.title}</button>`).join("");
      this.track.querySelectorAll(".scene-dot").forEach((b) =>
        b.addEventListener("click", () => { this.pause(); this._show(Number(b.dataset.i), false); }));
    }
    _show(i, autoplay) {
      const n = this.o.scenes.length;
      this.i = ((i % n) + n) % n;
      this.visited.add(this.i);
      this.t = 0;
      this._stopSpeech();
      const s = this.scene();
      this.svg.innerHTML = "";
      s.build(this.svg);
      s.update(0, 0, {});
      this._captionAt(0);
      this._renderTrack();
      if (this.o.onScene) this.o.onScene(this.i, s);
      if (autoplay) this.play(); else { this.playing = false; this._syncPlayBtn(); }
    }
    _syncPlayBtn() {
      this.o.root.querySelector('[data-a="play"]').textContent = this.playing ? "⏸ Pause" : "▶ Play";
    }
    _captionAt(t) {
      const s = this.scene();
      let text = s.beats.length ? s.beats[0].text : s.say;
      for (const b of s.beats) if (t >= b.t) text = b.text;
      if (this.caption.dataset.text !== text) {
        this.caption.dataset.text = text;
        this.caption.innerHTML = text;
      }
    }
    _stopSpeech() {
      try { speechSynthesis.cancel(); } catch { /* no speech */ }
    }
    _speak() {
      this._stopSpeech();
      if (!this.voiceOn || state.muted) return;
      if (!("speechSynthesis" in window)) return;
      const u = new SpeechSynthesisUtterance(this.scene().say);
      const voices = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang || ""));
      u.voice = voices.find((v) => /natural|online|neural|aria|jenny|sonia|samantha|karen|moira/i.test(v.name))
        || voices.find((v) => /google|microsoft|apple/i.test(v.name)) || voices[0] || null;
      u.rate = 0.96; u.pitch = 1.08;
      speechSynthesis.speak(u);
    }
    toggle() { this.playing ? this.pause() : this.play(); }
    play() {
      this.playing = true;
      this._syncPlayBtn();
      this._speak();
      this.last = performance.now();
      const step = (now) => {
        if (!this.playing) return;
        const dt = (now - this.last) / 1000;
        this.last = now;
        this.t += dt;
        const s = this.scene();
        const dur = s.duration;
        // interactive check pause
        if (s.check && !this.checked.has(this.i) && this.t >= s.check.t) {
          this.t = s.check.t;
          this._openCheck();
          return;
        }
        if (this.t >= dur) {
          if (this.i === this.o.scenes.length - 1) {
            this.t = dur;
            this._finish();
            return;
          }
          this._show(this.i + 1, true);
          return;
        }
        s.update(this.t / dur, this.t, {});
        this._captionAt(this.t);
        this.rail.style.width = `${(this.t / dur) * 100}%`;
        this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    }
    pause() {
      this.playing = false;
      this._syncPlayBtn();
      this._stopSpeech();
      if (this.raf) cancelAnimationFrame(this.raf);
    }
    _openCheck() {
      const s = this.scene();
      this.playing = false;
      this._syncPlayBtn();
      this._stopSpeech();
      sfx.whistle();
      this.pop.classList.remove("hide");
      this.pop.innerHTML = `
        <div class="check-card">
          <span class="eyebrow">Pip pauses the film…</span>
          <h3>${s.check.question}</h3>
          <div class="choices">${s.check.choices.map((c, i) => `
            <button type="button" class="btn ghost slim" data-i="${i}">${c.label}</button>`).join("")}
          </div>
          <p class="mt8 muted explain"></p>
        </div>`;
      this.pop.querySelectorAll("[data-i]").forEach((btn) => btn.addEventListener("click", () => {
        const c = s.check.choices[Number(btn.dataset.i)];
        const ex = this.pop.querySelector(".explain");
        if (c.correct) {
          sfx.correct();
          this.checked.add(this.i);
          ex.innerHTML = `🎉 ${s.check.explain}`;
          setTimeout(() => {
            this.pop.classList.add("hide");
            this.last = performance.now();
            this.play();
            if (this.o.onCheck) this.o.onCheck(this.i, true);
          }, 1400);
        } else {
          sfx.wrong();
          btn.disabled = true;
          ex.innerHTML = `🤔 Not quite — Pip says: <em>${s.check.hint || "watch what happens to the tail of the train."}</em>`;
          if (this.o.onCheck) this.o.onCheck(this.i, false);
        }
      }));
    }
    _finish() {
      this.pause();
      this.rail.style.width = "100%";
      if (!this.seenAll) {
        this.seenAll = true;
        confetti.burst(80);
        sfx.correct();
      }
      if (this.o.onFinish) this.o.onFinish();
    }
    destroy() { this.pause(); this.o.root.innerHTML = ""; }
  }

  /* ================= legacy module adapter ================= */

  const MODULE_FILES = {
    consecutive_number_triangles: "consecutive_triangles_module.js",
    angles: "angles_module.js",
    u2t2_units: "u2t2_module.js",
    volume_prisms: "volume_prisms_module.js",
    volume_problem_extension: "volume_extension_module.js",
    triangle_sides: "triangle_sides_module.js",
    equal_height_triangles: "equal_height_triangles_module.js",
    algebraic_word_puzzles: "algebraic_word_puzzles_module.js",
    addition_multiplication_2: "addition_multiplication_2_module.js",
    calculating_with_formulas: "calculating_with_formulas_module.js",
    prime_factorisation_2: "prime_factorisation_2_module.js",
    inequalities: "inequalities_module.js",
    circles_sectors_2: "circles_sectors_2_module.js"
  };

  async function loadLegacyModule(id) {
    const file = MODULE_FILES[id];
    if (!file) throw new Error(`No adapter for module ${id}`);
    const res = await fetch(`modules/${file}`);
    if (!res.ok) throw new Error(`Could not load ${file} — serve this app over http (npm run dev).`);
    const code = await res.text();
    // Every legacy module is an IIFE that exports its pure API when `module`
    // exists. We pass a BARE root object (no `document`) so the module's own
    // DOM driver (initApp/startApp/boot) never fires — several modules run it
    // whenever root.document exists and would crash or double-render.
    const box = { exports: {} };
    const factory = new Function("module", "exports", "window", "document", `"use strict";\n${code}`);
    factory(box, box.exports, {}, undefined);
    return box.exports;
  }

  /* ================= shared helpers ================= */

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function esc(v) {
    return String(v).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  window.Engine = {
    state, save, level, addXP, recordAnswer, markIntroWatched,
    moduleState, classicState, dailyQuest, dailyProgress,
    BADGES, LEVELS, sfx, confetti, toast, pipSVG, Narrator,
    loadLegacyModule, el, esc, onChange: (fn) => listeners.add(fn),
    toggleMute() {
      state.muted = !state.muted;
      save();
      if (state.muted) try { speechSynthesis.cancel(); } catch { /* noop */ }
      return state.muted;
    }
  };
})();
