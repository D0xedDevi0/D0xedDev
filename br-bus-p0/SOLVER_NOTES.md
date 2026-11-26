# BUS.EXE - BENCH (P0) - solution and verification notes

One file. Offline. Deterministic. No wallet, no testnet, no network calls.
Deliverable: `bench.html` (single HTML document, inline CSS + JS, hand-built 5x7 bitmap font).

Play: https://htmlpreview.github.io/?https://cdn.jsdelivr.net/gh/D0xedDevi0/D0xedDev@8482e46/br-bus-p0/bench.html
Locally: open `bench.html` in any browser.

## Controls
- Click a part in PARTS BIN, then click a board cell to place it.
- `R` rotates the held part (0/90/180/270).
- Right-click a placed part to pull it off the board.
- `ENTER` (or RUN) evaluates the board. `H` hint. `N` next bench. `C` clear.

## The eight benches
| # | name | pads | par | sensors | minimality |
|---|------|------|-----|---------|------------|
| 1 | FIRST CONTACT | 9 | 9 | 1 | BFS-proven minimal |
| 2 | AROUND THE ROCK | 14 | 14 | 1 | BFS-proven minimal |
| 3 | ONE WAY STREET | 11 | 11 | 1 | BFS-proven minimal |
| 4 | BACKWARDS | 11 | 11 | 1 | BFS-proven minimal |
| 5 | DOUBLE TAP | 10 | 10 | 2 | authored (not proven) |
| 6 | DONT WRAP YOUR OWN FUSE | 13 | 13 | 1 | authored (not proven) |
| 7 | TWO HANDS | 13 | 13 | 1 | authored (not proven) |
| 8 | THE BUS | 23 | 23 | 2 | authored (not proven) |

Benches 5-8 split into two branches, so a shortest-path search is not the right
solver; their par values are design targets, not proofs.

## Part semantics
Every part has directional pins. Current only flows pin -> pin, so orientation matters.
- SOURCE: one output pin (E). Fixed on every board.
- SENSOR: one input pin (W). Lights only if current arrives on that pin.
- WIRE: straight N-S or E-W pair. No logic.
- SPLITTER: one input, two outputs (T junction). Feeds both branches.
- RESISTOR: one input, one output, IN ONE DIRECTION. Reversed = dead board.
- FUSE: passes current, but it is destroyed if it is fed from both sides at once
  (a wrap-around double feed). Blown fuse = fault, and a board with any blown
  fuse is NOT counted as solved even if a bypass still lights the sensor.
- RELAY: one input, one output, plus a control pin. Passes only while the control
  line is powered.

## Evaluator
Monotone relaxation to a fixed point (no randomness, no iteration cap): power
spreads outward from the source, each part applies its own rule, and the pass
repeats until nothing changes. Diagnostics are first-class results:
`lit`, `sensors`, `powered`, `blown[]`, `reversed[]`, `noCtl[]`, `open`.

## XP
`pads` (<= 24/day care cap) + `10 + 5 * stars`, scaled x1.5 for par-exact with no
hint, x1.0 with one star lost... repeats of an already-solved bench pay 25%.
Local persistence key: `busexe.bench.p0`.

## Verified (real output, not claims)
- `node vr_run.js` -> `RESULT: ALL 8 AUTHORED SOLUTIONS SOLVE` (8/8, each with lit == sensors, blown == 0).
- BFS shortest-path check -> benches 1-4 par == minimum path length.
- `node vr2.js` -> `RESULT: 6/6 negative cases behave correctly` (reversed resistor,
  bypassed-fuse double feed, missing relay control, wrong splitter orientation,
  open circuit, missing control line).
- In-browser, on the published build: the file's own `selftest()` returns 8/8 in
  the live page; a scripted play of bench 1 (+51 XP), bench 3 (reversed resistor
  diagnosed, then solved with R, +54 XP) and bench 8 (+72 XP) all behave.
- Pixel audit of the live canvas (144,000 px): 125,808 exact-palette pixels and
  18,192 pixels that are four uniform shades of palette colours (grass, grassHi,
  grassDk, white at ~97%). Zero gradients, zero anti-aliased pixels: the font is
  bitmaps and all fills are integer-aligned.
- Layout audit across all 8 benches: the right-panel button stack ends at or above
  y=207, the stats block starts at y=210, status bar at y=268 - no collisions.

## NOT verified
- Benches 5-8 are not formally proven minimal (authored target par).
- No external playtest has happened; the part rules may change once someone plays
  it who is not the author.
- Nothing here talks to Base Rooms. No hook key, no MCP call, no authenticated
  request, no production write. The adapter is a later phase and needs an issued
  sandbox key and a confirmed payload contract.

## Rebuild
```
cat h1_head.html f0_font.js f1_chrome.js f2_logic.js f3a_puzzles.js \
    f3b_state.js f4_render.js f5a_selftest.js f5b_input.js h3_tail.html > bench.html
{ echo "const ROWS=10,COLS=16,CELL=16;"; cat f2_logic.js f3a_puzzles.js f5a_selftest.js vr.js; } > /tmp/vr_run.js
node /tmp/vr_run.js
```
`genfont.py` regenerates `f0_font.js` (51 glyphs, 5x7) from the mock font.

## Files
- `bench.html` - the shipped single-file game.
- `f0_font.js` glyphs / `f1_chrome.js` palette+chrome / `f2_logic.js` evaluator /
  `f3a_puzzles.js` the 8 benches / `f3b_state.js` state+XP / `f4_render.js` renderer /
  `f5a_selftest.js` in-page selftest / `f5b_input.js` input+entry.
- `vr.js` authored-solution + BFS harness, `vr2.js` negative-case harness.
- `shots/` captures of the shipped build.
