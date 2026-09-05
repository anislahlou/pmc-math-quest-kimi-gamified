# PMC Math Quest v2

A gamified rebuild of the PMC Math Quest learning app for 11-year-olds.

## Run it

```bash
npm run dev            # → http://127.0.0.1:7100/
# or: node server.mjs --port 8080 --host 0.0.0.0
```

Then open the URL. No build step, no dependencies — plain HTML/CSS/JS.
Must be served over http(s) (the legacy-module adapter fetches module files);
opening `index.html` from the filesystem will not load classic missions.

## Validate

```bash
npm run smoke          # generator math, store logic, legacy adapter contract
node test/math_audit.mjs  # sweeps 5,400+ generated problems: sqrt/equality claims, choice integrity, exact geometry
npm test               # smoke + math audit + integration (jsdom UI flow)
```

## What's inside

| Piece | File | What it does |
|---|---|---|
| Learning engine | `assets/engine.js` | Profile & gamification (XP, levels, mastery stars, streaks, badges, daily quest) in `localStorage`, WebAudio sound effects, confetti, toasts, level-up popups, the animated `Narrator` intro player, and the legacy module adapter. |
| Design system | `assets/engine.css` | Kid-first UI kit: chunky 48px+ targets, comic outlines, celebration states. |
| Mission map | `index.html` + `assets/hub.js` | Gamified hub: level ring, XP bar, daily quest card, badge shelf, per-mission mastery dots. |
| Module player | `module.html` + `assets/player.js` | One shell for every mission: animated intro + adaptive training (retry-until-mastery, hint ladder, coach cards, recap routing weak skills into focus drills). |
| Train Problems v2 | `assets/train_v2.js` | Enhanced flagship: 7-scene animated story intro with in-video checks, procedural integer-clean generators, misconception-tagged distractors with coach cards, "Watch it" animated replay, "Build it" guided steps, Pip's Mistakes (spot-the-error) and Depot Master (hearts) modes. |
| Legacy modules | `modules/*.js` | The 13 classic missions from the original app, loaded through the adapter into the new shell. |
| Manifest | `assets/manifest.js` | Mission metadata (from the original `modules/registry.json`). |

## Deploying to GitHub Pages

Copy `index.html`, `module.html`, `assets/`, `modules/` into the repo root
(or a subfolder) of a Pages-served branch. Pascal Triangle remains linked as
the classic external mission.
