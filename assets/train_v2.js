/* PMC Math Quest v2 — Train Problems (enhanced flagship module).
   "Pip's First Day at Tinker Depot": a fully animated story intro where the
   core insight — the TAIL must clear the far end — is SEEN, not told.
   Practice has three modes: Mission round (adaptive, misconception-aware),
   Pip's Mistakes (spot-the-error, from the book's "Is Pip correct?" format),
   and Depot Master (mixed challenge with hearts). Generators are procedural
   with integer-clean numbers, so variants never run out. */
(function () {
  "use strict";

  /* ================= SVG scene painters ================= */

  const INK = "#232946";
  const SVG_W = 560, SVG_H = 330, GROUND = 262, TRACK = 252;

  function svgEl(tag, attrs = {}) {
    const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }
  function txt(x, y, str, opts = {}) {
    const t = svgEl("text", {
      x, y, "text-anchor": opts.anchor || "middle",
      "font-size": opts.size || 15, "font-weight": opts.weight || 800,
      fill: opts.fill || INK, opacity: opts.opacity ?? 1
    });
    t.textContent = str;
    if (opts.rotate) t.setAttribute("transform", `rotate(${opts.rotate} ${x} ${y})`);
    return t;
  }

  function sceneBase(svg, opts = {}) {
    const sky = svgEl("rect", { x: 0, y: 0, width: SVG_W, height: GROUND, fill: opts.sky || "#dff1ff" });
    svg.appendChild(sky);
    // clouds
    for (const [cx, cy, s] of [[90, 58, 1], [420, 40, 0.8], [280, 78, 0.6]]) {
      const c = svgEl("g", { opacity: 0.85 });
      c.appendChild(svgEl("ellipse", { cx, cy, rx: 26 * s, ry: 12 * s, fill: "#fff" }));
      c.appendChild(svgEl("ellipse", { cx: cx + 18 * s, cy: cy + 3 * s, rx: 18 * s, ry: 9 * s, fill: "#fff" }));
      svg.appendChild(c);
    }
    const ground = svgEl("rect", { x: 0, y: GROUND, width: SVG_W, height: SVG_H - GROUND, fill: opts.ground || "#bfe8c9" });
    svg.appendChild(ground);
    // track: sleepers + rails
    for (let x = 16; x < SVG_W; x += 26) {
      svg.appendChild(svgEl("rect", { x, y: TRACK + 5, width: 14, height: 5, rx: 2, fill: "#8a6d4b" }));
    }
    svg.appendChild(svgEl("line", { x1: 0, y1: TRACK, x2: SVG_W, y2: TRACK, stroke: INK, "stroke-width": 4 }));
    return svg;
  }

  // A train `len` metres long drawn at scale px per metre; group origin = FRONT of train.
  function trainGroup(scale, opts = {}) {
    const px = Math.max(60, len_px(opts.lenM || 150, scale));
    const h = 40, g = svgEl("g");
    const bodyY = TRACK - h - 8;
    const body = svgEl("rect", { x: -px, y: bodyY, width: px, height: h, rx: 9, fill: opts.color || "#ff6b57", stroke: INK, "stroke-width": 3.5 });
    g.appendChild(body);
    // cab roof + chimney at front
    g.appendChild(svgEl("rect", { x: -22, y: bodyY - 14, width: 22, height: 16, rx: 4, fill: opts.color || "#ff6b57", stroke: INK, "stroke-width": 3 }));
    g.appendChild(svgEl("rect", { x: -14, y: bodyY - 26, width: 9, height: 14, rx: 3, fill: INK }));
    // windows
    const win = Math.max(1, Math.floor(px / 46));
    for (let i = 0; i < win; i++) {
      g.appendChild(svgEl("rect", { x: -px + 12 + i * ((px - 46) / Math.max(1, win - 1) || 1), y: bodyY + 8, width: 20, height: 14, rx: 4, fill: "#dff1ff", stroke: INK, "stroke-width": 2.5 }));
    }
    // wheels
    const wheels = Math.max(2, Math.round(px / 42));
    for (let i = 0; i < wheels; i++) {
      const wx = -px + 16 + i * ((px - 32) / Math.max(1, wheels - 1));
      g.appendChild(svgEl("circle", { cx: wx, cy: TRACK - 6, r: 7, fill: "#4a5578", stroke: INK, "stroke-width": 3 }));
    }
    // steam puffs (animated by update)
    const puffs = svgEl("g");
    for (let i = 0; i < 3; i++) {
      puffs.appendChild(svgEl("circle", { cx: -10, cy: bodyY - 32 - i * 10, r: 5 + i * 2, fill: "#fff", opacity: 0.8 }));
    }
    g.appendChild(puffs);
    g._puffs = puffs;
    return g;
  }
  function len_px(m, scale) { return m * scale; }

  function poleAt(x, label) {
    const g = svgEl("g");
    g.appendChild(svgEl("line", { x1: x, y1: TRACK - 86, x2: x, y2: TRACK, stroke: "#0b8993", "stroke-width": 7, "stroke-linecap": "round" }));
    g.appendChild(svgEl("circle", { cx: x, cy: TRACK - 92, r: 7, fill: "#ffc531", stroke: INK, "stroke-width": 3 }));
    g.appendChild(txt(x, TRACK - 104, label || "pole", { size: 13, fill: "#0b8993" }));
    return g;
  }

  function bridgeAt(x, w, label, opts = {}) {
    const g = svgEl("g");
    const top = TRACK - (opts.tall ? 62 : 48);
    g.appendChild(svgEl("rect", { x, y: top, width: w, height: TRACK - top, fill: opts.fill || "#ffe9b8", stroke: INK, "stroke-width": 3.5 }));
    // truss zigzag
    const n = Math.max(3, Math.round(w / 34));
    let d = `M ${x} ${TRACK} `;
    for (let i = 0; i < n; i++) {
      d += `L ${x + (i + 0.5) * (w / n)} ${top + 6} L ${x + (i + 1) * (w / n)} ${TRACK} `;
    }
    g.appendChild(svgEl("path", { d, stroke: "#d8a400", "stroke-width": 3, fill: "none", opacity: 0.75 }));
    if (label) g.appendChild(txt(x + w / 2, top - 10, label, { size: 14, fill: "#8a6d4b" }));
    return g;
  }

  function tunnelAt(x, w, label) {
    return bridgeAt(x, w, label || "tunnel", { fill: "#d9d2e9", tall: true });
  }

  // distance bracket under the track; grows by setting width
  function bracket(y, label, color = "#5b5bd6") {
    const g = svgEl("g");
    const line = svgEl("line", { x1: 0, y1: y, x2: 0, y2: y, stroke: color, "stroke-width": 4 });
    const t1 = svgEl("line", { x1: 0, y1: y - 7, x2: 0, y2: y + 7, stroke: color, "stroke-width": 4 });
    const t2 = svgEl("line", { x1: 0, y1: y - 7, x2: 0, y2: y + 7, stroke: color, "stroke-width": 4 });
    const lab = txt(0, y + 24, "", { size: 15, fill: color });
    g.append(line, t1, t2, lab);
    g._set = (x1, x2, text) => {
      line.setAttribute("x1", x1); line.setAttribute("x2", x2);
      t1.setAttribute("x1", x1); t1.setAttribute("x2", x1);
      t2.setAttribute("x1", x2); t2.setAttribute("x2", x2);
      lab.setAttribute("x", (x1 + x2) / 2);
      lab.textContent = text ?? label;
    };
    return g;
  }

  function flagAt(x, color = "#ff5d8f") {
    const g = svgEl("g");
    g.appendChild(svgEl("line", { x1: x, y1: TRACK - 60, x2: x, y2: TRACK, stroke: INK, "stroke-width": 3.5 }));
    g.appendChild(svgEl("path", { d: `M ${x} ${TRACK - 60} l 22 8 l -22 8 Z`, fill: color, stroke: INK, "stroke-width": 2.5 }));
    return g;
  }

  function clearBadge(x, y, text = "CLEAR!") {
    const g = svgEl("g", { opacity: 0 });
    g.appendChild(svgEl("rect", { x: x - 46, y: y - 20, width: 92, height: 32, rx: 16, fill: "#2fbf8f", stroke: INK, "stroke-width": 3 }));
    g.appendChild(txt(x, y + 2, text, { size: 16, fill: "#fff" }));
    return g;
  }

  function clockAt(x, y) {
    const g = svgEl("g");
    g.appendChild(svgEl("circle", { cx: x, cy: y, r: 20, fill: "#fff", stroke: INK, "stroke-width": 3.5 }));
    const hand = svgEl("line", { x1: x, y1: y, x2: x, y2: y - 13, stroke: "#e5484d", "stroke-width": 3, "stroke-linecap": "round" });
    g.appendChild(hand);
    const lab = txt(x, y + 36, "0 s", { size: 14 });
    g.appendChild(lab);
    g._set = (sec) => {
      hand.setAttribute("transform", `rotate(${(sec % 60) * 6} ${x} ${y})`);
      lab.textContent = `${Math.round(sec)} s`;
    };
    return g;
  }

  function eqCard(x, y, w, lines, opts = {}) {
    const g = svgEl("g");
    const h = 26 * lines.length + 18;
    g.appendChild(svgEl("rect", { x: x - w / 2, y: y - 18, width: w, height: h, rx: 12, fill: opts.fill || "#fffdf6", stroke: INK, "stroke-width": 3 }));
    lines.forEach((l, i) => g.appendChild(txt(x, y + 4 + i * 26, l, { size: 15 })));
    return g;
  }

  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const clamp01 = (t) => Math.max(0, Math.min(1, t));

  function animatePuffs(train, tSec) {
    if (!train || !train._puffs) return;
    [...train._puffs.children].forEach((p, i) => {
      const ph = (tSec * 1.4 + i * 0.33) % 1;
      p.setAttribute("cy", Number(p.getAttribute("cy")) - 0.35);
      p.setAttribute("opacity", String(0.8 * (1 - ph)));
      if (ph < 0.05) p.setAttribute("cy", -32 - i * 10 + 190);
    });
  }

  /* ================= intro scenes ================= */
  // Convention: FRONT of train at group x. Tail at x - L*scale.

  const L1 = 250, V1 = 25;       // scene numbers from the book's Learn & Discover
  const S1 = 0.32;               // px per metre
  const TB = { L: 150, B: 350, v: 25 }, S3 = 0.55; // clear-bridge demo numbers

  const scenes = [
    {
      title: "The Golden Rule",
      say: "Welcome to Tinker Depot! Pip the fox is driving a real train for the very first time. Here is the golden rule of every train puzzle: a train is LONG, so we always measure its journey from the FRONT of the train. Watch the flag: whatever the front passes, that's how far the train has gone.",
      duration: 13,
      beats: [
        { t: 0, text: "🚂 Welcome to <mark>Tinker Depot</mark>! Pip is driving a real train today." },
        { t: 4, text: "Golden rule: a train is <mark>long</mark> — so we measure its journey from the <mark>front</mark>." },
        { t: 8.5, text: "Watch the flag 🚩 — whatever the <mark>front</mark> passes is how far the train has gone." }
      ],
      build(svg) {
        sceneBase(svg);
        const flagX = 150;
        svg.appendChild(flagAt(flagX));
        const train = trainGroup(S1, { lenM: L1 });
        svg.appendChild(train);
        const br = bracket(TRACK + 34, "", "#5b5bd6");
        svg.appendChild(br);
        const lab = txt(280, 40, "", { size: 17, fill: "#5b5bd6" });
        svg.appendChild(lab);
        this._fx = { train, br, lab, flagX, startX: 60, endX: 470 };
      },
      update(t01, tSec) {
        const f = this._fx;
        const x = f.startX + (f.endX - f.startX) * ease(clamp01(t01 * 1.15));
        f.train.setAttribute("transform", `translate(${x},0)`);
        const dist = Math.max(0, x - f.flagX);
        f.br._set(f.flagX, x, `front has travelled ${Math.round(dist / S1)} m`);
        f.lab.textContent = "distance = where the FRONT got to";
        animatePuffs(f.train, tSec);
      }
    },
    {
      title: "Pass the marker",
      say: "First job: pass the telegraph pole. A pole has no width at all. So the moment the TAIL slips past it, the train is completely clear. And how far did the front travel? Exactly one train length — no more, no less. That's the whole trick to marker questions.",
      duration: 14,
      beats: [
        { t: 0, text: "Job 1: pass the <mark>telegraph pole</mark>. A pole has <mark>no width</mark>." },
        { t: 4.5, text: "The train is clear the moment the <mark>tail</mark> slips past the pole…" },
        { t: 9, text: "…and the front has travelled exactly <mark>one train length</mark>. That's the whole trick!" }
      ],
      check: {
        t: 12.2,
        question: `Pip's train is ${L1} m long. From the moment its front reaches the pole to the moment its tail clears the pole, how far does the front travel?`,
        choices: [
          { label: `${L1} m — one train length`, correct: true },
          { label: "0 m — the pole has no width", correct: false },
          { label: `${2 * L1} m — two train lengths`, correct: false }
        ],
        hint: "watch where the front is when the tail finally passes the pole.",
        explain: `Exactly! The front travels one full train length: ${L1} m. Time = ${L1} ÷ speed.`
      },
      build(svg) {
        sceneBase(svg);
        const poleX = 430;
        svg.appendChild(poleAt(poleX, "telegraph pole"));
        const train = trainGroup(S1, { lenM: L1 });
        svg.appendChild(train);
        const ghost = trainGroup(S1, { lenM: L1 });
        ghost.setAttribute("opacity", "0.22");
        ghost.setAttribute("transform", `translate(${poleX},0)`);
        svg.appendChild(ghost);
        svg.appendChild(txt(poleX - (L1 * S1) / 2, TRACK - 60, "start: tail at the pole", { size: 12, fill: "#4a5578" }));
        const br = bracket(TRACK + 34, "", "#2fbf8f");
        svg.appendChild(br);
        const clear = clearBadge(poleX - 40, 70);
        svg.appendChild(clear);
        this._fx = { train, br, clear, poleX, startX: poleX, endX: poleX + L1 * S1 };
      },
      update(t01, tSec) {
        const f = this._fx;
        const go = ease(clamp01(t01 * 1.12));
        const x = f.startX + (f.endX - f.startX) * go;
        f.train.setAttribute("transform", `translate(${x},0)`);
        f.br._set(f.startX, x, `${Math.round((x - f.startX) / S1)} m of ${L1} m`);
        f.clear.setAttribute("opacity", go >= 0.999 ? 1 : 0);
        animatePuffs(f.train, tSec);
      }
    },
    {
      title: "Clear the bridge",
      say: "Now the real challenge: a bridge! A bridge has a length of its own. The front pops out the far side… but the train is NOT clear yet — the tail is still on the bridge! Only when the tail leaves the far end is the crossing complete. So the front travels the train length PLUS the whole bridge length.",
      duration: 16,
      beats: [
        { t: 0, text: "A bridge has a <mark>length of its own</mark>. That changes everything!" },
        { t: 4.5, text: "Front pops out the far side… <mark>not clear yet!</mark> The tail is still on the bridge." },
        { t: 9.5, text: "Clear only when the <mark>tail leaves the far end</mark>." },
        { t: 12.5, text: "So: distance = <mark>train + bridge</mark>. Always!" }
      ],
      check: {
        t: 14.2,
        question: `Train ${TB.L} m, bridge ${TB.B} m. How far does the front travel to clear it completely?`,
        choices: [
          { label: `${TB.L + TB.B} m — train + bridge`, correct: true },
          { label: `${TB.B} m — just the bridge`, correct: false },
          { label: `${TB.L} m — just the train`, correct: false }
        ],
        hint: "the tail must get off the bridge too!",
        explain: `Right! ${TB.L} + ${TB.B} = ${TB.L + TB.B} m. You cleared it like a pro.`
      },
      build(svg) {
        sceneBase(svg);
        const bx = 250, bw = TB.B * S3;
        svg.appendChild(bridgeAt(bx, bw, `bridge ${TB.B} m`));
        const train = trainGroup(S3, { lenM: TB.L, color: "#5b5bd6" });
        svg.appendChild(train);
        const br = bracket(TRACK + 34, "", "#ff5d8f");
        svg.appendChild(br);
        const clear = clearBadge(bx + bw - 30, 60);
        svg.appendChild(clear);
        const lab = txt(120, 40, "", { size: 16, fill: "#ff5d8f", anchor: "middle" });
        svg.appendChild(lab);
        this._fx = { train, br, clear, lab, bx, bw, startX: bx, totalPx: (TB.L + TB.B) * S3 };
      },
      update(t01, tSec) {
        const f = this._fx;
        const go = ease(clamp01(t01 * 1.1));
        const x = f.startX + f.totalPx * go;
        f.train.setAttribute("transform", `translate(${x},0)`);
        const travelled = (x - f.startX) / S3;
        const tailX = x - TB.L * S3;
        f.br._set(f.startX, x, `${Math.round(travelled)} m = train + bridge`);
        const frontOut = x >= f.bx + f.bw && tailX < f.bx + f.bw;
        f.lab.textContent = frontOut ? "front is out… but the TAIL is still on!" : (go >= 1 ? "tail is off — CLEAR!" : "");
        f.clear.setAttribute("opacity", go >= 0.999 ? 1 : 0);
        animatePuffs(f.train, tSec);
      }
    },
    {
      title: "Bridge speed",
      say: "How fast was Pip going? Speed is always distance divided by time — that rule never changes. The only new move is building the right distance: train plus bridge. Then divide by the seconds on the clock, and out comes the speed in metres per second.",
      duration: 13,
      beats: [
        { t: 0, text: "How fast was Pip going? <mark>speed = distance ÷ time</mark> — as always." },
        { t: 4.5, text: "The new move is building the right distance: <mark>train + bridge</mark>." },
        { t: 8.5, text: `${TB.L + TB.B} m ÷ ${(TB.L + TB.B) / TB.v} s = <mark>${TB.v} m/s</mark>. Case closed!` }
      ],
      build(svg) {
        sceneBase(svg);
        const bx = 250, bw = TB.B * S3;
        svg.appendChild(bridgeAt(bx, bw, `bridge ${TB.B} m`));
        const train = trainGroup(S3, { lenM: TB.L, color: "#2fbf8f" });
        svg.appendChild(train);
        const clk = clockAt(80, 66);
        svg.appendChild(clk);
        const totalT = (TB.L + TB.B) / TB.v;
        const card = eqCard(455, 56, 190, [`(${TB.L} + ${TB.B}) ÷ ${totalT} s`, `= ${TB.v} m/s`]);
        card.setAttribute("opacity", "0");
        svg.appendChild(card);
        this._fx = { train, clk, card, bx, bw, startX: bx, totalPx: (TB.L + TB.B) * S3, totalT };
      },
      update(t01, tSec) {
        const f = this._fx;
        const go = ease(clamp01(t01 * 1.08));
        const x = f.startX + f.totalPx * go;
        f.train.setAttribute("transform", `translate(${x},0)`);
        f.clk._set(f.totalT * go);
        f.card.setAttribute("opacity", go > 0.85 ? (go - 0.85) / 0.15 : 0);
        animatePuffs(f.train, tSec);
      }
    },
    {
      title: "Find the train",
      say: "Mystery time! A hidden train crosses a bridge, and we know its speed and the crossing time — but not how long the train is. Multiply speed times time to get the whole journey. That journey is the train plus the bridge. So subtract the bridge… and the train's length pops out of hiding!",
      duration: 14,
      beats: [
        { t: 0, text: "🕵️ Mystery: we know the <mark>speed</mark> and the <mark>time</mark>… but not the train's length." },
        { t: 4.5, text: "<mark>speed × time</mark> = the whole journey = train + bridge." },
        { t: 9, text: "Subtract the bridge… and the train <mark>pops out of hiding</mark>! 🎉" }
      ],
      build(svg) {
        sceneBase(svg);
        const B = 350, v = 25, t = 20, D = v * t, L = D - B;
        const sc = 560 / (D + 160) * 0.9;
        const bx = 200, bw = B * sc;
        svg.appendChild(bridgeAt(bx, bw, `bridge ${B} m`));
        const train = trainGroup(sc, { lenM: L, color: "#9b5de5" });
        train.setAttribute("opacity", "0.35");
        svg.appendChild(train);
        const br = bracket(TRACK + 34, "", "#9b5de5");
        svg.appendChild(br);
        const card = eqCard(430, 60, 210, [`${v} m/s × ${t} s = ${D} m`, `${D} − ${B} = ${L} m`]);
        card.setAttribute("opacity", "0");
        svg.appendChild(card);
        this._fx = { train, br, card, bx, bw, startX: bx, totalPx: D * sc, L, sc };
      },
      update(t01, tSec) {
        const f = this._fx;
        const go = ease(clamp01(t01 * 1.08));
        const x = f.startX + f.totalPx * go;
        f.train.setAttribute("transform", `translate(${x},0)`);
        f.br._set(f.startX, x, `${Math.round((x - f.startX) / f.sc)} m total`);
        const reveal = go > 0.9;
        f.train.setAttribute("opacity", reveal ? 1 : 0.35);
        f.card.setAttribute("opacity", go > 0.8 ? (go - 0.8) / 0.2 : 0);
        animatePuffs(f.train, tSec);
      }
    },
    {
      title: "Two-bridge solve",
      say: "The cleverest trick in the whole lesson. The same train crosses two bridges at the same speed. Write the journey equation for each crossing. Now subtract one from the other — and watch the unknown train length cancel out completely! What remains tells you the speed. Then work back to find the train.",
      duration: 17,
      beats: [
        { t: 0, text: "The <mark>same train</mark>, the <mark>same speed</mark>, two different bridges." },
        { t: 4.5, text: "Write <mark>train + bridge = speed × time</mark> for each crossing…" },
        { t: 8.5, text: "…then <mark>subtract</mark>! The unknown train length <mark>cancels out</mark>. ✨" },
        { t: 12.5, text: "What's left gives the speed. Then work backwards for the train. Genius!" }
      ],
      check: {
        t: 15.2,
        question: "Why does subtracting the two crossings help?",
        choices: [
          { label: "The unknown train length cancels out", correct: true },
          { label: "It makes the numbers smaller", correct: false },
          { label: "The two bridges are the same length", correct: false }
        ],
        hint: "both equations contain the SAME train length.",
        explain: "Exactly — same train, same length, gone in one subtraction!"
      },
      build(svg) {
        sceneBase(svg, { sky: "#f3e9ff" });
        const L = 180, v = 20, b1 = 600, t1 = 39, b2 = 840, t2 = 51;
        const c1 = eqCard(150, 90, 250, [`tunnel 1:  L + ${b1} = v × ${t1}`], { fill: "#fff" });
        const c2 = eqCard(150, 150, 250, [`tunnel 2:  L + ${b2} = v × ${t2}`], { fill: "#fff" });
        const minus = txt(290, 140, "−", { size: 34, fill: "#ff5d8f" });
        const res = eqCard(410, 122, 260, [`${b2} − ${b1} = v × (${t2} − ${t1})`, `v = ${(b2 - b1) / (t2 - t1)} m/s`], { fill: "#dcf7e8" });
        const lNote1 = txt(150, 200, "", { size: 15, fill: "#ff5d8f" });
        svg.append(c1, c2, minus, res, lNote1);
        this._fx = { res, lNote1, c1, c2, minus };
        res.setAttribute("opacity", "0");
        minus.setAttribute("opacity", "0");
      },
      update(t01) {
        const f = this._fx;
        const phase = clamp01((t01 - 0.25) / 0.5);
        f.res.setAttribute("opacity", phase);
        f.minus.setAttribute("opacity", phase > 0.15 ? 1 : 0);
        f.lNote1.textContent = phase > 0.5 ? "L − L = 0 … the train cancels! ✨" : "";
        // strike-through the L's as phase completes
        const strike = phase > 0.55;
        f.c1.setAttribute("opacity", strike ? 0.55 : 1);
        f.c2.setAttribute("opacity", strike ? 0.55 : 1);
      }
    },
    {
      title: "Double-speed finale",
      say: "The final boss! This time the second crossing is at DOUBLE the speed. The plan stays the same: one equation per crossing, but remember to write two-times-the-speed in the second one. Combine them carefully and both the speed and the train length surrender. You did it — you are officially a Depot Detective, and the missions ahead don't stand a chance!",
      duration: 16,
      beats: [
        { t: 0, text: "Final boss: the second crossing is at <mark>double speed</mark>! ⚡" },
        { t: 4.5, text: "Same plan — one equation per crossing… but write <mark>2 × speed</mark> in the second." },
        { t: 9, text: "Combine them carefully and the speed and train length both surrender. 🏳️" },
        { t: 12.5, text: "You're officially a <mark>Depot Detective</mark>! 🕵️ Time to train." }
      ],
      build(svg) {
        sceneBase(svg, { sky: "#fff3d6" });
        const b1 = 100, t1 = 15, b2 = 150, t2 = 10;
        const c1 = eqCard(160, 90, 280, [`crossing 1:  L + ${b1} = v × ${t1}`], { fill: "#fff" });
        const c2 = eqCard(160, 150, 280, [`crossing 2:  L + ${b2} = 2v × ${t2}`], { fill: "#ffe9b8" });
        const res = eqCard(400, 122, 240, [`v = ${(b2 - b1) / (2 * t2 - t1)} m/s`, `L = ${((b2 - b1) / (2 * t2 - t1)) * t1 - b1} m 🎉`], { fill: "#dcf7e8" });
        res.setAttribute("opacity", "0");
        const badge = clearBadge(280, 220, "🕵️ DEPOT DETECTIVE");
        badge.setAttribute("opacity", "0");
        svg.append(c1, c2, res, badge);
        this._fx = { res, badge, c2 };
      },
      update(t01) {
        const f = this._fx;
        f.res.setAttribute("opacity", clamp01((t01 - 0.3) / 0.4));
        const b = clamp01((t01 - 0.75) / 0.2);
        f.badge.setAttribute("opacity", b);
        f.badge.setAttribute("transform", `translate(0,${(1 - b) * 18})`);
      }
    }
  ];

  /* ================= procedural generators (integer-clean) ================= */

  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  const SPEEDS = [15, 18, 20, 25, 30, 40, 50];
  const MARKERS = ["telegraph pole", "signpost", "lamp post", "tree", "signal"];
  const STRUCTS = ["bridge", "tunnel", "viaduct"];

  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  // choices: [{label, err|null, correct}] — err tags drive the diagnosis cards
  function mkChoices(correct, wrongs, unit) {
    const seen = new Set([String(correct)]);
    const items = [{ label: `${correct} ${unit}`, correct: true, err: null }];
    for (const w of wrongs) {
      if (items.length === 4) break;
      if (!Number.isFinite(w.v) || w.v <= 0) continue;
      if (seen.has(String(w.v))) continue;
      seen.add(String(w.v));
      items.push({ label: `${w.v} ${unit}`, correct: false, err: w.err });
    }
    // guarantee 4 options: pad with nearby arithmetic slips if candidates collided
    let bump = 1;
    while (items.length < 4) {
      const cand = correct + bump * (correct > 20 ? 5 : 1);
      bump += 1;
      if (seen.has(String(cand))) continue;
      seen.add(String(cand));
      items.push({ label: `${cand} ${unit}`, correct: false, err: "slip" });
    }
    return shuffle(items);
  }

  const GEN = {
    "pass-marker"() {
      const v = pick(SPEEDS), t = rnd(4, 18), L = v * t;
      const askLen = Math.random() < 0.35;
      if (askLen) {
        const wrongs = [
          { v: v * (t + 2), err: "slip" },
          { v: L + v, err: "slip" },
          { v: Math.max(v, t), err: "confused" }
        ];
        return {
          classicId: "pass-marker", form: "find-length",
          prompt: `A train passes a ${pick(MARKERS)} in ${t} seconds while travelling at ${v} m/s. How long is the train?`,
          data: { L, v, t }, expected: L, unit: "m",
          steps: [
            { label: "Distance = speed × time (a marker has no width)", calc: `${v} × ${t}`, answer: L }
          ],
          solution: `Passing a point marker, the train travels exactly its own length: ${v} m/s × ${t} s = ${L} m.`,
          choices: mkChoices(L, wrongs, "m")
        };
      }
      const wrongs = [
        { v: t + 3, err: "slip" },
        { v: Math.max(1, Math.round(L / (2 * v))), err: "halved" },
        { v: t * 2, err: "doubled" }
      ];
      return {
        classicId: "pass-marker", form: "find-time",
        prompt: `A train ${L} m long passes a ${pick(MARKERS)} at ${v} m/s. How many seconds does it take to pass completely?`,
        data: { L, v, t }, expected: t, unit: "s",
        steps: [
          { label: "Distance = train length (marker has no width)", calc: `${L}`, answer: L },
          { label: `time = distance ÷ speed = ${L} ÷ ${v}`, calc: `${L} ÷ ${v}`, answer: t }
        ],
        solution: `The train travels its own length: ${L} ÷ ${v} = ${t} s.`,
        choices: mkChoices(t, wrongs, "s")
      };
    },

    "clear-bridge"() {
      const v = pick(SPEEDS), t = rnd(10, 60);
      const D = v * t;
      const L = Math.min(rnd(100, 450), D - 100);
      const B = D - L;
      const struct = pick(STRUCTS);
      const wrongs = [
        { v: Math.round(B / v), err: "forgot-train" },
        { v: Math.round(L / v), err: "only-train" },
        { v: t + 5, err: "slip" }
      ];
      return {
        classicId: "clear-bridge", form: "find-time",
        prompt: `A train ${L} m long travels at ${v} m/s. How many seconds does it take to cross a ${struct} ${B} m long completely?`,
        data: { L, B, v, t, struct }, expected: t, unit: "s",
        steps: [
          { label: `distance = train + ${struct}`, calc: `${L} + ${B}`, answer: D },
          { label: `time = distance ÷ speed`, calc: `${D} ÷ ${v}`, answer: t }
        ],
        solution: `Distance = ${L} + ${B} = ${D} m. Time = ${D} ÷ ${v} = ${t} s.`,
        choices: mkChoices(t, wrongs, "s")
      };
    },

    "bridge-speed"() {
      const v = pick(SPEEDS), t = rnd(10, 60);
      const D = v * t;
      const L = Math.min(rnd(100, 450), D - 100);
      const B = D - L;
      const struct = pick(STRUCTS);
      const wrongs = [
        { v: Math.round(B / t), err: "forgot-train" },
        { v: Math.round(D / (2 * t)), err: "halved" },
        { v: v + 3, err: "slip" },
        { v: v - 3, err: "slip" },
        { v: v + 8, err: "slip" }
      ];
      return {
        classicId: "bridge-speed", form: "find-speed",
        prompt: `A train ${L} m long takes ${t} s to cross a ${struct} ${B} m long completely. What is its speed in m/s?`,
        data: { L, B, v, t, struct }, expected: v, unit: "m/s",
        steps: [
          { label: `distance = train + ${struct}`, calc: `${L} + ${B}`, answer: D },
          { label: `speed = distance ÷ time`, calc: `${D} ÷ ${t}`, answer: v }
        ],
        solution: `Distance = ${L} + ${B} = ${D} m. Speed = ${D} ÷ ${t} = ${v} m/s.`,
        choices: mkChoices(v, wrongs, "m/s")
      };
    },

    "find-train"() {
      const v = pick(SPEEDS), t = rnd(12, 60);
      const D = v * t;
      const L = Math.min(rnd(100, 450), D - 100);
      const B = D - L;
      const struct = pick(STRUCTS);
      const wrongs = [
        { v: D, err: "forgot-subtract" },
        { v: B, err: "swapped" },
        { v: L + 50, err: "slip" }
      ];
      return {
        classicId: "find-train", form: "find-length",
        prompt: `A train crosses a ${struct} ${B} m long at ${v} m/s, taking ${t} s to pass completely. How long is the train?`,
        data: { L, B, v, t, struct }, expected: L, unit: "m",
        steps: [
          { label: `total distance = speed × time`, calc: `${v} × ${t}`, answer: D },
          { label: `train = total − ${struct}`, calc: `${D} − ${B}`, answer: L }
        ],
        solution: `Distance = ${v} × ${t} = ${D} m. Train = ${D} − ${B} = ${L} m.`,
        choices: mkChoices(L, wrongs, "m")
      };
    },

    "two-bridge"() {
      const v = pick(SPEEDS);
      const dt = rnd(6, 25);
      const t1 = rnd(15, 60), t2 = t1 + dt;
      const db = v * dt;
      const b1 = rnd(2, 20) * 50;
      const b2 = b1 + db;
      const L = v * t1 - b1;
      if (L <= 0 || L > 600) return GEN["two-bridge"]();
      const wrongs = [
        { v: Math.round(b2 / t2), err: "forgot-train" },
        { v: Math.round(db / t2), err: "wrong-time" },
        { v: v + 4, err: "slip" },
        { v: v - 3, err: "slip" },
        { v: Math.round(b1 / t1), err: "forgot-train" }
      ];
      return {
        classicId: "two-bridge", form: "find-speed",
        prompt: `A train crosses a ${b1} m bridge in ${t1} s, and a ${b2} m bridge in ${t2} s, both at the same constant speed. What is the train's speed in m/s?`,
        data: { L, b1, t1, b2, t2, v }, expected: v, unit: "m/s",
        steps: [
          { label: "subtract to cancel the train length", calc: `${b2} − ${b1}`, answer: db },
          { label: "divide by the time difference", calc: `${db} ÷ ${dt}`, answer: v }
        ],
        solution: `speed = (${b2} − ${b1}) ÷ (${t2} − ${t1}) = ${db} ÷ ${dt} = ${v} m/s. (Train = ${v} × ${t1} − ${b1} = ${L} m.)`,
        choices: mkChoices(v, wrongs, "m/s")
      };
    },

    "double-speed"() {
      const v = pick(SPEEDS);
      const t1 = rnd(12, 40);
      const t2 = rnd(Math.ceil((t1 + 2) / 2), t1);  // need 2*t2 > t1
      const db = v * (2 * t2 - t1);
      if (db <= 0) return GEN["double-speed"]();
      const b1 = rnd(2, 16) * 50;
      const b2 = b1 + db;
      const L = v * t1 - b1;
      if (L <= 0 || L > 600) return GEN["double-speed"]();
      const wrongs = [
        { v: L + 50, err: "slip" },
        { v: Math.abs(v * t2 - b2), err: "forgot-double" },
        { v: v * (t2 - t1) - db, err: "confused" },
        { v: L - 40, err: "slip" },
        { v: b2 - b1, err: "confused" }
      ];
      return {
        classicId: "double-speed", form: "find-length",
        prompt: `A train crosses a ${b1} m bridge in ${t1} s. Then, at DOUBLE the speed, it crosses a ${b2} m bridge in ${t2} s. How long is the train?`,
        data: { L, b1, t1, b2, t2, v }, expected: L, unit: "m",
        steps: [
          { label: `speed: (${b2} − ${b1}) ÷ (2×${t2} − ${t1})`, calc: `${db} ÷ ${2 * t2 - t1}`, answer: v },
          { label: `train = speed × time − bridge 1`, calc: `${v} × ${t1} − ${b1}`, answer: L }
        ],
        solution: `v = (${b2} − ${b1}) ÷ (2×${t2} − ${t1}) = ${v} m/s. Train = ${v} × ${t1} − ${b1} = ${L} m.`,
        choices: mkChoices(L, wrongs, "m")
      };
    }
  };

  const CLASSICS = [
    { id: "pass-marker", nickname: "Pass the Marker", skill: "distance = train length" },
    { id: "clear-bridge", nickname: "Clear the Bridge", skill: "distance = train + structure" },
    { id: "bridge-speed", nickname: "Bridge Speed", skill: "speed = (train + structure) ÷ time" },
    { id: "find-train", nickname: "Find the Train", skill: "train = speed × time − structure" },
    { id: "two-bridge", nickname: "Two-Bridge Solve", skill: "subtract crossings to cancel the train" },
    { id: "double-speed", nickname: "Double-Speed Crossing", skill: "two equations, second at 2× speed" }
  ];

  /* misconception → coach card copy */
  const COACH = {
    "forgot-train": { title: "The train got left behind! 🚃", body: "You only used the structure's length. The train is long — its TAIL must clear the far end too. Add the train length in." },
    "only-train": { title: "The bridge vanished! 🌉", body: "You only used the train's length. The front must travel the bridge too — add both lengths together." },
    "forgot-subtract": { title: "One step missing! ➖", body: "speed × time gives train + structure together. Subtract the structure to uncover the train." },
    "forgot-double": { title: "Double trouble! ⚡", body: "The second crossing is at DOUBLE speed — the 2× belongs on the speed, so it's 2v × time." },
    "wrong-time": { title: "Use the time DIFFERENCE ⏱️", body: "After subtracting the distances, divide by the difference of the two times, not one full time." },
    "halved": { title: "Careful with the halves ✂️", body: "No halving needed here — build the full distance first, then divide once by the time." },
    "doubled": { title: "No doubling needed ✂️", body: "The marker has no width, so one train length is the whole journey." },
    "swapped": { title: "That's the bridge, not the train! 🌉", body: "You found the structure's length. Subtract it from the total distance to reveal the train." },
    "confused": { title: "Rebuild it from the picture 🖼️", body: "Ask: what does the FRONT of the train travel? Build that distance first." },
    "slip": { title: "So close — arithmetic slip! 🔢", body: "Your method looks right; re-check the calculation step by step." }
  };

  /* ================= practice UI ================= */

  function mount({ root, engine: E, meta, moduleId }) {
    E.moduleState(moduleId).classicCount = CLASSICS.length;
    E.save();

    const S = {
      mode: "mission",
      queue: [], idx: 0, problem: null,
      combo: 0, xpVisit: 0,
      roundXP: 0, roundFirst: 0, roundStars: 0,
      hearts: 3, masterScore: 0, pipSolved: 0,
      retrying: false, watchAnim: null
    };

    root.innerHTML = `
      <div class="practice-hud">
        <span class="stat-pill small"><span class="ico">⚡</span> <span data-h="xp">0 XP this visit</span></span>
        <span class="stat-pill small"><span class="ico">🔥</span> <span data-h="combo">combo ×0</span></span>
        <span class="stat-pill small" data-h="hearts"><span class="ico">❤️</span> <span data-h="heartn">3</span></span>
        <span class="stat-pill small"><span class="ico">📋</span> <span data-h="count"></span></span>
      </div>
      <div class="mode-tabs" style="margin-bottom:14px">
        <button class="mode-tab" data-m="mission" type="button">🎯 Mission round</button>
        <button class="mode-tab" data-m="pip" type="button">🕵️ Pip's mistakes</button>
        <button class="mode-tab" data-m="master" type="button">🏆 Depot Master</button>
      </div>
      <div class="mastery-chips" data-h="chips"></div>
      <div class="practice-layout">
        <section class="panel">
          <span class="eyebrow" data-h="skill"></span>
          <p class="problem-text" data-h="prompt"></p>
          <div data-h="pipwork"></div>
          <form data-h="form">
            <div data-h="answers"></div>
            <div class="action-row">
              <button class="btn primary" data-h="check" type="submit">Check ✓</button>
              <button class="btn sky hide" data-h="watch" type="button">🎬 Watch it</button>
              <button class="btn ghost hide" data-h="build" type="button">🧱 Build it step by step</button>
              <button class="btn mint hide" data-h="next" type="button">Next →</button>
            </div>
          </form>
          <div data-h="steps"></div>
          <div class="feedback hide" data-h="fb"></div>
        </section>
        <aside class="panel visual-panel">
          <span class="eyebrow" data-h="vtitle">Picture it</span>
          <div class="stage"><svg data-h="stage" viewBox="0 0 560 330" preserveAspectRatio="xMidYMid meet"></svg></div>
          <p class="visual-note" data-h="vnote"></p>
        </aside>
      </div>`;

    const H = {};
    root.querySelectorAll("[data-h]").forEach((n) => { H[n.dataset.h] = n; });
    H.hearts.classList.add("hide");

    const hud = () => {
      H.xp.textContent = `${S.xpVisit} XP this visit`;
      H.combo.textContent = `combo ×${S.combo}`;
      H.heartn.textContent = S.hearts;
      H.count.textContent = S.mode === "pip"
        ? `Case ${S.idx + 1} of ${S.queue.length}`
        : S.mode === "master"
          ? `Challenge ${S.idx + 1} of ${S.queue.length}`
          : `Question ${S.idx + 1} of ${S.queue.length}`;
    };
    const chips = () => {
      const ms = E.moduleState(moduleId);
      H.chips.innerHTML = CLASSICS.map((c) => {
        const st = (ms.classics[c.id] || { stars: 0 }).stars;
        return `<span class="mchip">${c.nickname} <span class="stars">${"★".repeat(st)}${"☆".repeat(3 - st)}</span></span>`;
      }).join("");
    };

    /* ----- static problem visual + "Watch it" animated replay ----- */
    function drawStill(p) {
      const svg = H.stage;
      cancelWatch();
      svg.innerHTML = "";
      sceneBase(svg);
      const d = p.data;
      const hasBridge = p.classicId !== "pass-marker";
      const total = hasBridge ? (d.L + (d.B ?? d.b2 ?? 0)) : d.L;
      const sc = Math.min(0.6, 430 / Math.max(1, total));
      if (p.classicId === "two-bridge" || p.classicId === "double-speed") {
        const w1 = Math.min(150, d.b1 * 0.16), w2 = Math.min(190, d.b2 * 0.16);
        svg.appendChild(bridgeAt(120, w1, `${d.b1} m`));
        svg.appendChild(bridgeAt(330, w2, `${d.b2} m`));
        svg.appendChild(txt(280, 40, p.classicId === "double-speed" ? "second crossing at DOUBLE speed ⚡" : "same train, same speed", { size: 16, fill: "#5b5bd6" }));
        svg.appendChild(txt(280, 300, `times: ${d.t1} s and ${d.t2} s`, { size: 15, fill: "#4a5578" }));
        H.vnote.textContent = "Two crossings, one train. Line up the two journeys, then subtract.";
        return;
      }
      if (hasBridge) {
        const bw = d.B * sc, bx = 250;
        svg.appendChild(bridgeAt(bx, bw, `${d.struct} ${d.B} m`));
        const train = trainGroup(sc, { lenM: d.L });
        train.setAttribute("transform", `translate(${bx},0)`);
        svg.appendChild(train);
        const br = bracket(TRACK + 34, "", "#5b5bd6");
        svg.appendChild(br);
        br._set(bx, bx + (d.L + d.B) * sc, `full journey = ${d.L} + ${d.B} = ${d.L + d.B} m`);
      } else {
        const poleX = 400;
        svg.appendChild(poleAt(poleX, "marker"));
        const train = trainGroup(sc, { lenM: d.L });
        train.setAttribute("transform", `translate(${poleX},0)`);
        svg.appendChild(train);
        const br = bracket(TRACK + 34, "", "#2fbf8f");
        svg.appendChild(br);
        br._set(poleX, poleX + d.L * sc, `journey = train length ${d.L} m`);
      }
      H.vnote.textContent = "The front travels the FULL bracket before the tail is clear.";
    }

    function cancelWatch() {
      if (S.watchAnim) { cancelAnimationFrame(S.watchAnim); S.watchAnim = null; }
    }

    function watchIt(p) {
      // Animated replay of THIS problem: the train drives the actual crossing.
      const svg = H.stage;
      cancelWatch();
      svg.innerHTML = "";
      sceneBase(svg);
      const d = p.data;
      const hasBridge = p.classicId !== "pass-marker";
      const total = hasBridge ? d.L + d.B : d.L;
      const sc = Math.min(0.6, 430 / Math.max(1, total));
      let fx;
      if (!hasBridge) {
        const poleX = 420;
        svg.appendChild(poleAt(poleX, "marker"));
        fx = { startX: poleX, totalPx: d.L * sc, label: (x) => `${Math.round((x - fx.startX) / sc)} m of ${d.L} m` };
      } else {
        const bw = d.B * sc, bx = 250;
        svg.appendChild(bridgeAt(bx, bw, `${d.struct} ${d.B} m`));
        fx = { startX: bx, totalPx: (d.L + d.B) * sc, label: (x) => `${Math.round((x - fx.startX) / sc)} m = train + ${d.struct}` };
      }
      const train = trainGroup(sc, { lenM: d.L, color: "#5b5bd6" });
      svg.appendChild(train);
      const br = bracket(TRACK + 34, "", "#ff5d8f");
      svg.appendChild(br);
      const clear = clearBadge(300, 60);
      svg.appendChild(clear);
      const t0 = performance.now(), DUR = 5200;
      const step = (now) => {
        const go = clamp01((now - t0) / DUR);
        const x = fx.startX + fx.totalPx * ease(go);
        train.setAttribute("transform", `translate(${x},0)`);
        br._set(fx.startX, x, fx.label(x));
        clear.setAttribute("opacity", go >= 1 ? 1 : 0);
        animatePuffs(train, now / 1000);
        if (go < 1) S.watchAnim = requestAnimationFrame(step);
        else S.watchAnim = null;
      };
      S.watchAnim = requestAnimationFrame(step);
      H.vnote.textContent = "Watch the TAIL — the crossing ends only when it clears the far end.";
    }

    /* ----- question rendering ----- */
    function renderQ() {
      const p = S.problem;
      S.retrying = false;
      S.stepState = null;
      H.skill.textContent = CLASSICS.find((c) => c.id === p.classicId).nickname;
      H.prompt.textContent = p.prompt;
      H.pipwork.innerHTML = "";
      H.steps.innerHTML = "";
      H.fb.className = "feedback hide";
      H.next.classList.add("hide");
      H.watch.classList.add("hide");
      H.build.classList.add("hide");
      H.check.disabled = false;
      const useChoice = S.mode !== "master" && (S.idx % 2 === 0 || S.mode === "pip");
      p._choice = useChoice;
      if (useChoice) {
        H.answers.innerHTML = `<div class="choice-grid">${p.choices.map((c, i) => `
          <label class="choice-card" data-i="${i}"><input type="radio" name="a" value="${i}"><span>${E.esc(c.label)}</span></label>`).join("")}</div>`;
        H.answers.querySelectorAll(".choice-card").forEach((card) => card.addEventListener("click", () => {
          H.answers.querySelectorAll(".choice-card").forEach((x) => x.classList.remove("picked"));
          card.classList.add("picked");
        }));
      } else {
        H.answers.innerHTML = `<div class="answer-row"><input class="filled-answer" name="a" autocomplete="off" inputmode="decimal" placeholder="Type your answer…"> <b style="align-self:center">${E.esc(p.unit)}</b></div>`;
        setTimeout(() => H.answers.querySelector("input")?.focus(), 60);
      }
      drawStill(p);
      hud();
      chips();
    }

    function collect(p) {
      if (p._choice) {
        const sel = H.answers.querySelector(".choice-card.picked");
        if (!sel) return null;
        return { choice: p.choices[Number(sel.dataset.i)] };
      }
      const v = H.answers.querySelector("input").value.trim();
      if (!v) return null;
      return { value: Number(v.replace(/,/g, "")) };
    }

    function check(p) {
      const input = collect(p);
      if (!input) { E.toast("Have a go first — pick or type an answer!"); return; }
      let correct = false, errTag = null;
      if (p._choice) {
        correct = input.choice.correct;
        errTag = input.choice.err;
        const card = H.answers.querySelector(".choice-card.picked");
        if (card) card.classList.add(correct ? "reveal-good" : "reveal-bad");
      } else {
        correct = Math.abs(input.value - p.expected) < 1e-9;
        if (!correct) errTag = guessErr(p, input.value);
      }
      if (correct) onCorrect(p);
      else onWrong(p, errTag);
    }

    // diagnose numeric wrong answers by reverse-engineering the error
    function guessErr(p, v) {
      const d = p.data;
      const near = (x) => Math.abs(v - x) < 1e-9;
      if (p.classicId === "clear-bridge" && near(d.B / d.v)) return "forgot-train";
      if (p.classicId === "clear-bridge" && near(d.L / d.v)) return "only-train";
      if (p.classicId === "bridge-speed" && near(d.B / d.t)) return "forgot-train";
      if (p.classicId === "find-train" && near(d.v * d.t)) return "forgot-subtract";
      if (p.classicId === "find-train" && near(d.B)) return "swapped";
      if (p.classicId === "two-bridge" && near(d.b2 / d.t2)) return "forgot-train";
      if (p.classicId === "two-bridge" && near((d.b2 - d.b1) / d.t2)) return "wrong-time";
      if (p.classicId === "double-speed" && near(Math.abs(d.v * d.t2 - d.b2))) return "forgot-double";
      if (p.classicId === "pass-marker" && near(p.expected * 2)) return "doubled";
      return "confused";
    }

    function onCorrect(p) {
      const firstTry = !S.retrying;
      if (S.mode === "master") {
        S.combo = firstTry ? S.combo + 1 : 0;
        S.masterScore += firstTry ? 1 : 0;
        const out = E.recordAnswer(moduleId, p.classicId, true, { combo: S.combo, retry: !firstTry, base: 15 });
        S.xpVisit += out.xpGain;
        S.roundXP += out.xpGain;
        E.dailyProgress(moduleId, out.xpGain);
      } else {
        S.combo = firstTry ? S.combo + 1 : 0;
        if (firstTry) S.roundFirst += 1;
        const out = E.recordAnswer(moduleId, p.classicId, true, { combo: S.combo, retry: !firstTry, base: 12 });
        if (out.masteryUp) S.roundStars += 1;
        S.xpVisit += out.xpGain;
        S.roundXP += out.xpGain;
        E.dailyProgress(moduleId, out.xpGain);
      }
      E.sfx.correct();
      E.confetti.burst(30);
      H.fb.className = "feedback good";
      H.fb.innerHTML = `🎉 <b>Correct!</b>${S.combo >= 2 ? ` 🔥 combo ×${S.combo}` : ""}<span class="why">${E.esc(p.solution)}</span>`;
      H.check.disabled = true;
      H.build.classList.add("hide");
      H.next.classList.remove("hide");
      hud(); chips();
    }

    function onWrong(p, errTag) {
      S.retrying = true;
      S.combo = 0;
      if (S.mode === "master") {
        S.hearts -= 1;
        E.sfx.wrong();
        E.recordAnswer(moduleId, p.classicId, false, {});
        H.fb.className = "feedback bad";
        H.fb.innerHTML = `💔 <b>That costs a heart!</b> ${E.esc(p.solution)}`;
        H.check.disabled = true;
        H.next.classList.remove("hide");
        if (S.hearts <= 0) {
          H.next.textContent = "See results →";
        }
        hud();
        return;
      }
      E.recordAnswer(moduleId, p.classicId, false, {});
      E.sfx.wrong();
      const coach = COACH[errTag] || COACH.confused;
      H.fb.className = "feedback coach";
      H.fb.innerHTML = `🦊 <b>${coach.title}</b><span class="why">${coach.body}</span>`;
      H.watch.classList.remove("hide");
      H.build.classList.remove("hide");
      hud();
    }

    function buildIt(p) {
      // guided sub-steps: fill each intermediate value; each checked inline
      H.steps.innerHTML = `<div class="coach-steps">${p.steps.map((s, i) => `
        <div class="coach-step" data-i="${i}">
          <span class="num" style="flex:0 0 28px;height:28px;border-radius:9px;background:var(--sky);color:#fff;display:grid;place-items:center;font-weight:800;border:2px solid var(--line)">${i + 1}</span>
          <div style="flex:1"><div style="font-weight:700">${E.esc(s.label)}</div><div class="muted" style="font-size:.9rem">${E.esc(s.calc)} = ?</div></div>
          <input inputmode="decimal" autocomplete="off" placeholder="?">
        </div>`).join("")}</div>`;
      H.steps.querySelectorAll(".coach-step").forEach((row) => {
        const inp = row.querySelector("input");
        inp.addEventListener("change", () => {
          const i = Number(row.dataset.i);
          const ok = Math.abs(Number(inp.value) - p.steps[i].answer) < 1e-9;
          inp.classList.remove("step-good", "step-bad");
          inp.classList.add(ok ? "step-good" : "step-bad");
          if (ok) { E.sfx.click(); inp.disabled = true; }
          else E.sfx.wrong();
          const allDone = [...H.steps.querySelectorAll("input")].every((x) => x.disabled);
          if (allDone) E.toast("🧱 Steps complete — now finish the question above!");
        });
      });
      H.steps.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    /* ----- Pip's mistakes (spot-the-error) ----- */
    function makePipCase() {
      const classic = pick(CLASSICS.filter((c) => c.id !== "double-speed" || Math.random() < 0.4));
      const p = GEN[classic.id]();
      // plant one error into the worked solution
      const d = p.data;
      let lines, wrongLine, fix;
      if (classic.id === "pass-marker" && p.form === "find-time") {
        lines = [`distance = ${d.L} m (train length)`, `time = ${d.L} ÷ ${d.v}`, `= ${d.t + 2} s`];
        wrongLine = 2; fix = d.t;
      } else if (classic.id === "pass-marker") {
        // find-length form: Pip "helps" by adding a made-up marker width
        lines = [`distance = ${d.L} + 10 m (train + marker width)`, `= ${d.L + 10} m`];
        wrongLine = 0; fix = d.L;
      } else if (classic.id === "clear-bridge") {
        lines = [`distance = ${d.B} m (just the ${d.struct})`, `time = ${d.B} ÷ ${d.v}`, `= ${Math.round(d.B / d.v)} s`];
        wrongLine = 0; fix = d.t;
      } else if (classic.id === "bridge-speed") {
        lines = [`distance = ${d.L} + ${d.B} = ${d.L + d.B} m`, `speed = ${d.L + d.B} ÷ ${d.t}`, `= ${Math.round((d.L + d.B) / (2 * d.t))} m/s`];
        wrongLine = 2; fix = d.v;
      } else if (classic.id === "find-train") {
        lines = [`distance = ${d.v} × ${d.t} = ${d.v * d.t} m`, `train = ${d.v * d.t} m (done!)`];
        wrongLine = 1; fix = d.L;
      } else if (classic.id === "two-bridge") {
        lines = [`speed = (${d.b2} − ${d.b1}) ÷ ${d.t2}`, `= ${Math.round((d.b2 - d.b1) / d.t2)} m/s`];
        wrongLine = 0; fix = d.v;
      } else {
        lines = [`v = (${d.b2} − ${d.b1}) ÷ (${d.t2} − ${d.t1})`, `train = v × ${d.t1} − ${d.b1}`];
        wrongLine = 0; fix = d.L;
      }
      return { problem: p, lines, wrongLine, fix };
    }

    function renderPipQ() {
      const c = S.pipCase;
      const p = c.problem;
      H.skill.textContent = "🕵️ Pip's mistake";
      H.prompt.textContent = p.prompt;
      H.answers.innerHTML = "";
      H.steps.innerHTML = "";
      H.fb.className = "feedback hide";
      H.next.classList.add("hide");
      H.check.classList.add("hide");
      H.watch.classList.add("hide");
      H.build.classList.add("hide");
      H.pipwork.innerHTML = `
        <p style="font-weight:700;margin-bottom:8px">🦊 Pip's homework. <b>Tap the line where he went wrong</b>, then give the correct final answer.</p>
        <div class="coach-steps">${c.lines.map((l, i) => `
          <button type="button" class="coach-step" data-line="${i}" style="cursor:pointer;text-align:left;width:100%">
            <span class="num" style="flex:0 0 28px;height:28px;border-radius:9px;background:var(--coral);color:#fff;display:grid;place-items:center;font-weight:800;border:2px solid var(--line)">${i + 1}</span>
            <div style="font-weight:700">${E.esc(l)}</div>
          </button>`).join("")}</div>
        <div class="answer-row mt16 hide" data-fix>
          <input class="filled-answer" inputmode="decimal" autocomplete="off" placeholder="Correct final answer…">
          <button class="btn primary" type="button" data-fixbtn>Fix it 🔧</button>
        </div>`;
      drawStill(p);
      let found = false;
      H.pipwork.querySelectorAll("[data-line]").forEach((btn) => btn.addEventListener("click", () => {
        const i = Number(btn.dataset.line);
        if (i === c.wrongLine) {
          found = true;
          E.sfx.correct();
          btn.style.background = "#dcf7e8";
          btn.style.borderColor = "var(--good)";
          H.pipwork.querySelector("[data-fix]").classList.remove("hide");
          H.pipwork.querySelector("[data-fix] input").focus();
        } else {
          E.sfx.wrong();
          btn.style.background = "#ffe3e3";
          btn.style.borderColor = "var(--bad)";
          H.fb.className = "feedback coach";
          H.fb.innerHTML = `🦊 <b>That line is actually fine…</b><span class="why">Look for the line where the method or the arithmetic breaks.</span>`;
        }
      }));
      H.pipwork.querySelector("[data-fixbtn]").addEventListener("click", () => {
        const v = Number(H.pipwork.querySelector("[data-fix] input").value);
        if (!Number.isFinite(v)) { E.toast("Type the corrected answer first!"); return; }
        if (Math.abs(v - c.fix) < 1e-9) {
          E.state.totals.pipCaught += 1;
          S.pipSolved += 1;
          const out = E.recordAnswer(moduleId, p.classicId, true, { combo: S.combo + 1, base: 14 });
          S.xpVisit += out.xpGain; S.roundXP += out.xpGain;
          E.dailyProgress(moduleId, out.xpGain);
          E.save(); E.sfx.star(); E.confetti.burst(50);
          H.fb.className = "feedback good";
          H.fb.innerHTML = `🕵️ <b>Case cracked!</b> ${E.esc(p.solution)}`;
          H.check.classList.add("hide");
          H.next.classList.remove("hide");
        } else {
          E.sfx.wrong();
          H.fb.className = "feedback coach";
          H.fb.innerHTML = `🔧 <b>Not the fix yet.</b><span class="why">Redo the broken line carefully — the correct final answer is what matters.</span>`;
        }
        hud(); chips();
      });
      hud();
    }

    /* ----- round control ----- */
    function newMissionRound(focus = null) {
      // adaptive ordering: weakest skills first
      const ms = E.moduleState(moduleId);
      const ids = CLASSICS.map((c) => c.id).sort((a, b) => {
        const sa = ms.classics[a] || { stars: 0, correct: 0 }, sb = ms.classics[b] || { stars: 0, correct: 0 };
        return (sa.stars - sb.stars) || (sa.correct - sb.correct);
      });
      const order = focus ? [focus, focus, focus] : ids;
      S.queue = order.map((id) => GEN[id]());
      S.idx = 0;
      S.roundXP = 0; S.roundFirst = 0; S.roundStars = 0;
      S.problem = S.queue[0];
      renderQ();
    }

    function newPipRound() {
      S.queue = Array.from({ length: 4 }, () => null); // cases generated per-question
      S.idx = 0;
      S.pipCase = makePipCase();
      renderPipQ();
    }

    function newMasterRound() {
      S.hearts = 3;
      S.masterScore = 0;
      const ids = [];
      for (let i = 0; i < 8; i++) ids.push(pick(CLASSICS).id);
      S.queue = ids.map((id) => GEN[id]());
      S.idx = 0;
      S.problem = S.queue[0];
      renderQ();
    }

    function nextQ() {
      if (S.mode === "master" && S.hearts <= 0) return recap();
      if (S.idx < S.queue.length - 1) {
        S.idx += 1;
        if (S.mode === "pip") {
          S.pipCase = makePipCase();
          renderPipQ();
        } else {
          S.problem = S.queue[S.idx];
          renderQ();
        }
      } else {
        recap();
      }
    }

    function recap() {
      cancelWatch();
      const total = S.queue.length;
      const isMaster = S.mode === "master";
      const acc = isMaster ? Math.round((S.masterScore / total) * 100) : Math.round((S.roundFirst / total) * 100);
      const zone = document.getElementById("recap-zone");
      const trainZone = document.getElementById("train-zone");
      trainZone.classList.add("hide");
      zone.classList.remove("hide");
      document.getElementById("recap-emoji").textContent = isMaster ? (S.hearts > 0 ? "🏆" : "💔") : acc >= 80 ? "🏆" : acc >= 50 ? "🎉" : "💪";
      document.getElementById("recap-title").textContent = isMaster
        ? (S.hearts > 0 ? `Depot Master with ${S.hearts} heart${S.hearts === 1 ? "" : "s"} left!` : "Out of hearts — the depot believes in you!")
        : S.mode === "pip" ? `You caught ${S.pipSolved} of ${total} mistakes!` : acc >= 80 ? "Brilliant round, detective!" : "Round complete — keep training!";
      document.getElementById("recap-sub").textContent = isMaster
        ? "Depot Master mixes every skill under pressure. Come back tomorrow and defend your title."
        : "Stars come from correct streaks — three in a row earns one.";
      document.getElementById("recap-xp").textContent = S.roundXP;
      document.getElementById("recap-acc").textContent = `${acc}%`;
      document.getElementById("recap-stars").textContent = S.roundStars;
      const ms = E.moduleState(moduleId);
      const weak = CLASSICS.filter((c) => (ms.classics[c.id] || { stars: 0 }).stars < 3);
      document.getElementById("weak-zone").innerHTML = weak.length ? `
        <h3 class="mt16">🎯 Skills to power up</h3>
        <div class="weak-list">${weak.map((c) => {
          const st = (ms.classics[c.id] || { stars: 0 }).stars;
          return `<div class="weak-item">
            <div><strong>${c.nickname}</strong> <span class="stars">${"★".repeat(st)}${"☆".repeat(3 - st)}</span><br><span class="muted">${c.skill}</span></div>
            <button class="btn sky slim" data-focus="${c.id}" type="button">Train this skill →</button>
          </div>`;
        }).join("")}</div>` : `
        <p class="center mt16" style="font-size:1.15rem">🌟 <b>You mastered every Train Problems skill!</b> The Depot salutes you.</p>`;
      zone.querySelectorAll("[data-focus]").forEach((b) => b.addEventListener("click", () => {
        E.sfx.click();
        zone.classList.add("hide");
        trainZone.classList.remove("hide");
        S.mode = "mission";
        syncTabs();
        newMissionRound(b.dataset.focus);
      }));
      document.getElementById("recap-again").onclick = () => {
        E.sfx.click();
        zone.classList.add("hide");
        trainZone.classList.remove("hide");
        startMode(S.mode);
      };
      document.getElementById("recap-intro").onclick = () => {
        zone.classList.add("hide");
        document.querySelector('.mode-tab[data-mode="intro"]').click();
      };
      document.getElementById("recap-home").onclick = () => { location.href = "index.html"; };
    }

    function syncTabs() {
      root.querySelectorAll(".mode-tab[data-m]").forEach((t) => t.classList.toggle("active", t.dataset.m === S.mode));
      H.hearts.classList.toggle("hide", S.mode !== "master");
      H.check.classList.remove("hide");
      H.next.textContent = "Next →";
    }

    function startMode(mode) {
      S.mode = mode;
      cancelWatch();
      syncTabs();
      if (mode === "mission") newMissionRound();
      else if (mode === "pip") newPipRound();
      else newMasterRound();
    }

    root.querySelectorAll(".mode-tab[data-m]").forEach((t) => t.addEventListener("click", () => {
      E.sfx.click();
      startMode(t.dataset.m);
    }));
    H.form.addEventListener("submit", (e) => { e.preventDefault(); if (S.mode !== "pip") check(S.problem); });
    H.next.addEventListener("click", () => { E.sfx.click(); nextQ(); });
    H.watch.addEventListener("click", () => { E.sfx.click(); watchIt(S.problem); });
    H.build.addEventListener("click", () => { E.sfx.click(); buildIt(S.problem); });

    // headless-test hook (no UI impact)
    root.__pmc = { current: () => S.problem, pipCase: () => S.pipCase, state: S };

    startMode("mission");
  }

  window.TrainV2 = { scenes, mount, CLASSICS, GEN };
})();
