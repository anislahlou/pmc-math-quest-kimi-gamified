/* PMC Math Quest v2 — mission map (hub). */
(function () {
  "use strict";
  const E = window.Engine;
  const $ = (id) => document.getElementById(id);

  function renderTopStats() {
    const lv = E.level();
    const s = E.state;
    $("top-stats").innerHTML = `
      <span class="stat-pill" title="Level"><span class="ico">${lv.emoji}</span> Lv ${lv.index} · ${lv.title}</span>
      <span class="stat-pill" title="Total XP"><span class="ico">⚡</span> ${s.xp} XP</span>
      <span class="stat-pill" title="Day streak"><span class="ico">🔥</span> ${s.streak.days} day${s.streak.days === 1 ? "" : "s"}</span>
      <button class="stat-pill" id="mute-btn" title="Sound on/off" style="cursor:pointer"><span class="ico">${s.muted ? "🔇" : "🔊"}</span></button>`;
    $("mute-btn").addEventListener("click", () => { E.toggleMute(); renderTopStats(); });
  }

  function renderHero() {
    const lv = E.level();
    $("hero-mascot").innerHTML = E.pipSVG(120);
    $("xp-fill").style.width = `${lv.pct}%`;
    $("xp-level-label").textContent = `Level ${lv.index} · ${lv.title}`;
    $("xp-next-label").textContent = lv.next ? `${E.state.xp - lv.at} / ${lv.next.at - lv.at} XP to ${lv.next.title}` : "Max level!";
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    $("hero-title").textContent = `${greet}, explorer!`;
  }

  function renderDaily() {
    const q = E.dailyQuest(window.MANIFEST);
    const mod = window.MANIFEST.find((m) => m.id === q.moduleId);
    $("daily-title").textContent = `${mod.emoji} ${mod.title}`;
    $("daily-desc").textContent = q.done
      ? "Quest complete — nice work! Come back tomorrow for a fresh one."
      : `Earn ${q.target} XP in ${mod.title} today. Reward: +40 bonus XP.`;
    $("daily-fill").style.width = `${Math.min(100, (q.progress / q.target) * 100)}%`;
    $("daily-go").textContent = q.done ? "Quest done ✓ (play again)" : "Go to today's quest →";
    $("daily-go").onclick = () => { location.href = `module.html?m=${mod.id}`; };
  }

  function dotsFor(m) {
    const ms = E.state.modules[m.id];
    let stars = 0;
    if (ms) stars = m.skills.reduce((n, _, i) => {
      const c = Object.values(ms.classics || {})[i];
      return n + (c ? c.stars : 0);
    }, 0);
    // per-skill dots: use classic states in insertion order when available
    return m.skills.map((_, i) => {
      const c = ms && Object.values(ms.classics || {})[i];
      const st = c ? c.stars : 0;
      const cls = st >= 3 ? "full" : st >= 1 ? "half" : "";
      return `<span class="mastery-dot ${cls}" title="${st}/3 stars"></span>`;
    }).join("");
  }

  function renderMissions() {
    const grid = $("mission-grid");
    grid.innerHTML = "";
    let mastered = 0;
    for (const m of window.MANIFEST) {
      const ms = E.state.modules[m.id];
      const done = ms && ms.done;
      if (done) mastered += 1;
      const introSeen = E.state.intros[m.id];
      const card = document.createElement("button");
      card.type = "button";
      card.className = "mission-card";
      card.innerHTML = `
        <div class="mission-top">
          <span class="mission-chapter">${m.chapter}</span>
          <span style="font-size:1.5rem">${m.emoji}</span>
        </div>
        <h3>${m.title}</h3>
        <p>${m.blurb}</p>
        <div class="mastery-track">${dotsFor(m)}</div>
        <div class="mission-foot">
          <span class="row" style="gap:6px">
            ${m.enhanced ? `<span class="tag enhanced">New adventure</span>` : ""}
            ${done ? `<span class="tag done">Mastered</span>` : ""}
            ${m.external ? `<span class="tag">Classic</span>` : ""}
            ${!introSeen && !m.external ? `<span class="tag new">Start here</span>` : ""}
          </span>
          <span class="play-chip">${introSeen || done ? "Train ▶" : "Watch intro ▶"}</span>
        </div>`;
      card.addEventListener("click", () => {
        E.sfx.click();
        if (m.external) window.open(m.external, "_blank", "noopener");
        else location.href = `module.html?m=${m.id}`;
      });
      grid.appendChild(card);
    }
    $("mission-summary").textContent = `${window.MANIFEST.length} missions · ${mastered} mastered`;
  }

  function renderBadges() {
    const shelf = $("badge-shelf");
    const earned = new Set(E.state.badges);
    shelf.innerHTML = E.BADGES.map((b) => `
      <span class="badge ${earned.has(b.id) ? "" : "locked"}" title="${b.desc}">
        <span class="ico">${b.emoji}</span> ${b.name}
      </span>`).join("");
    $("badge-count").textContent = `${earned.size} / ${E.BADGES.length} earned`;
  }

  function renderAll() {
    renderTopStats();
    renderHero();
    renderDaily();
    renderBadges();
    renderMissions();
  }

  E.onChange(renderAll);
  renderAll();
})();
