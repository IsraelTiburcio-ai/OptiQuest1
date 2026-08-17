# AGENTS.md

Static web game (HTML/CSS/JS/Canvas 2D). No build step, no `package.json`,
no test framework. Repo root *is* the deploy root (GitHub Pages: `main` / `/root`).

## Verify after editing

No lint/typecheck exists. Use these:

```bash
node --check app.js                                    # JS syntax
python3 -c "import json; json.load(open('data/gym1.json'))"   # JSON valid
```

Then serve and click-test: `python3 -m http.server 8000` → http://localhost:8000

## Critical: two sources of truth for game content

`data/gym1.json` is loaded at runtime via `fetch()`. **`app.js` also embeds a
full copy as `FALLBACK_DATA`** (used when the fetch fails, e.g. opened via
`file://`). If you edit questions/enemies/dialogue in one, update the other or
the game silently serves stale content. They must stay in sync.

## Gotchas an agent will likely misread as bugs

- **`file://` doesn't load the JSON** — `fetch()` is blocked by CORS. The game
  still runs (via `FALLBACK_DATA`), but you're not testing the real JSON. Always
  use a static server.
- **Music not playing is expected** — there are no audio files in
  `assets/audio/`. A procedural chiptune (WebAudio) plays instead. When real
  `.mp3` files are added, the chiptune auto-silences; do NOT "fix" the silence.
- **Music only starts after the first tap** ("Iniciar aventura") — mobile
  browser autoplay policy. Intentional.
- **Save key is `optiquest_save_v1`** in `app.js`. Changing it resets every
  player's localStorage progress.

## Asset substitution points

- Sprites: replace `drawHero()` / `drawEnemy()` in `app.js` with
  `ctx.drawImage(...)`. Files go in `assets/img/`.
- Audio filenames are fixed: `assets/audio/{map,battle,correct,wrong,hit,victory}.mp3`.
  Missing files are tolerated (silent + chiptune/beep fallback).

## Architecture

Single IIFE in `app.js` with labeled sections: Constants → State → Save →
Audio/Chiptune → Input → Render helpers → Scene manager → scenes (Title, Intro,
Map, Dialogue, Battle, Result/Menu) → main loop → boot. All UI overlays live in
`index.html`; the canvas only draws the world + battle scene; CSS handles the
retro look and responsive scaling (`#game-container` is `transform: scale()`-d
to fit the viewport, logical resolution is fixed at 360×640, pixelated).

See `README.md` for controls, content editing, and deploy details.
