# Answers to the ten, plus the #0009 correction

D0xedDev · Nov 25 2026 · for Slava

## 0 · #0009 — where I saw it, and why our two reads differ

You asked where the override and the statue came from. Here is the exact call and the exact bytes.

```
GET https://os.baserooms.io/units/looks?ids=9          (public, Referer: baserooms.io)
{"looks":{"9":{"head":"crown","face":"specs","body":"bowtie","paint":"midnight","auto":{"blanket":false}}}}
http=200  bytes=107
```
Re-run today, same 107 bytes, unchanged. The statue half:
```
GET https://world.baserooms.io/islands/1/snapshot       (public)
st.statues = [35, 377, 323, 335, 9, 58, 2, 428, 374]     -> 9 units, and 9 is one of them
s["9"] = "slava.base.eth"
island v4 · 446 buddies · st.energy 2 · weather 2
```

So the two reads are not in conflict — they are two different layers of the same unit, which is
your own first guess ("a display layer the island data doesn't carry"):

| your island read | the `units/looks` payload |
|---|---|
| Orange paint, ATM chassis, Hard Hat, Sunglasses, class A, Scout | `head: crown, face: specs, body: bowtie, paint: midnight` + `auto.blanket:false` |

Different slots (chassis/hat/glasses/paint vs head/face/body/paint) *and* a different paint value,
which is what an override layer on top of a base look would produce. Two things worth your eyes:

- If the island UI shows #0009 as Orange paint but `units/looks` says `midnight`, then the override
  is not reaching the island view, or the island view is reading the base traits. That is either a
  display bug or the attestation-vs-display gap you just described.
- You read it as "zero medals". I claimed a statue, not a medal — `st.statues` is a different field
  from medals, and it contains 9 today. If the UI says 0 medals while `st.statues` holds 9, that is
  a second thing worth a look. (My read of `st.statues` as unit ids comes from my own recon notes,
  not from a spec — correct me if that field means something else.)

**On the figurehead ask: withdrawn.** Not because the read was wrong but because it is not mine to
put on his head. If you want a buddy at the first bench, that is your call to make and his to accept.

**On attestation contracts:** if evolution is attested onchain so every client sees the same buddy,
then that layer is the one of record and a module should read from it, not invent a look.

**Question:**
is `units/looks` the owner-set *display override* sitting on top of the attested state — and should a
module read attestation state (read-only) to render the buddy standing at a rig? I will not render a
buddy at all until that is answered.

## 1 · The verb (a P0 session)

Five parts, each with directional pins, so orientation is the whole game:

- **WIRE** — straight, N-S or E-W. You rotate it.
- **SPLITTER** — a T. One input, two outputs, feeds both branches.
- **RESISTOR** — one way only. Reversed = dead board. The single best teaching part.
- **FUSE** — passes current, but is destroyed if fed from both sides at once (a wrap-around).
- **RELAY** — passes only while its control pin is powered.

SOURCE and SENSOR are fixed on the board, so a bench is: get current from the source into every
sensor with the parts you are given.

**One puzzle, FIRST CONTACT (bench 1):** source at (2,5), sensor at (10,5), nine WIRE pads in your
bin, nothing else. Place them, rotate each to face the next one. Par 9. It teaches the verb in about
twenty seconds.

**How a solve is checked:** the evaluator relaxes current outward from the source pin to a fixed
point (no randomness, no iteration cap). Two separate conditions, both required:
`every sensor lit` **AND** `no blown fuse`. A board that reaches the sensor through a blown fuse is
reported as `NOT COUNTED: FUSE BLOWN` and pays nothing — the honesty of the score matters more than
the win. Negative boards are first-class results too: reversed resistor, blown fuse, relay with no
control line, open circuit, wrong junction.

Measured on the eight authored solutions (cells powered at the moment of solve):
`11 · 16 · 13 · 13 · 13 · 16 · 16 · 27`. That 27 is THE BUS: resistor in, splitter, fuse, relay out,
two sensors.

A person who knows the answer takes ~45-90 seconds a board. A first-timer takes a few minutes and
loses one board to a reversed resistor. That is the pacing I would tune the draw against.

## 2 · Crews

I do not think a crew should be a new object. A crew is **a set of buddies, opted in, plus the wallet
that consented for them**:

- one owner + their buddies is the simple case (and the common one),
- several owners can be one crew, but then each owner consents for their own units,
- a crew is not a wallet and holds nothing itself.

Consent for offchain tasks and alerts, per your answer to Q11: the **owner of the buddy** opting in
once per crew, revocable in one action. The module records who consented, for which units, and when —
that record is local, mirroring your read-only rule, and any task or alert says which wallet
consented. Nothing onchain happens without the propose lane.

## 3 · Draw numbers — the curve you asked to see

Unit: I do not have your energy numbers yet (your Q7 is open), so this is expressed in **pad-runs** —
one placed pad held for one run — and it converts to your units the moment you give me a scale.

Measured, not assumed: the eight authored boards place `9 · 14 · 11 · 11 · 10 · 13 · 13 · 23` pads
(mean 13). A run of FIRST CONTACT holds 9 pads; a run of THE BUS holds 23. **An idle rig draws
nothing** — draw exists only while a board is live, so nothing can be bled while nobody is playing.

Assume a busy hour of 20 runs per board position (a board is ~90 s of held current, so the ceiling is
40; 20 is human pace):

| rig | busy hour | 8-hour day | buddies needed at cap 3,000/day | at cap 8,000/day |
|---|---|---|---|---|
| 1 board | 260 pad-runs | 2,080 | 1 | 1 |
| 3 boards | 780 | 6,240 | 3 | 1 |
| 6 boards | 1,560 | 12,480 | 5 | 2 |
| 12 boards | 3,120 | 24,960 | 9 | 4 |

Shape: **linear in boards, step-wise in buddies.** Draw rises with every board a crew runs; the number
of buddies committed jumps in steps whenever the daily cap is crossed. That is the whole curve — the
only real knob is your cap, and the table above is what four different caps would do.

Guardrail, matching your rule that a module can never flatten a buddy: the module reads the buddy's
own state before a rig runs, self-limits to 60% of that buddy's remaining daily budget, hard-stops at
80%, and never touches the last 20%. If the island says low, the rig refuses to stripe that buddy and
the board goes idle — the bench loses, the buddy does not.

Scale check on your "more crews build more": a crew that grows from 1 to 12 boards goes from about
2,000 to 25,000 pad-runs a day. That is a 12x load for the island and a 4-9x load on buddies.

## 4 · Event volume (per crew, peak hour)

Kinds, mapped to the vocabulary on your own setup screen:

| event | when | payload |
|---|---|---|
| `start` | a board is run | crew, rig, board id |
| `done` | solved | board id, pads, cells, stars, par delta, hint used |
| `error` | fault | board id + the diagnostic (blown fuse / reversed / no control / open) |
| `waiting` | rig idle, or the buddy guardrail stopped it | crew, reason |
| `end` | session closed | totals for the session |

Volume: three events per run (start, done, error/end) at 20 runs/board-position/hour = **~360 events
per crew per hour at peak** on a 3-board rig, ~1,400/hour on a 12-board rig. A `progress` tick every
10 s would add ~1,100/hour per crew — I recommend leaving that OFF unless you want a live view, and
making it a flag you control. Idle: one heartbeat per crew per 15 minutes, to sit on the same cadence
as `st.log` (4/hour), if you confirm that cadence is stable enough to key off.

## 5 · Identity — how it reads as third-party

- The window keeps `BUS.EXE  C:/BRTC/GAMES`; the menu row that today reads `TEST MODE  NO WALLET`
  gains `MODULE · THIRD PARTY` when it is on your rail.
- Every event carries `src: "module:bus-exe"` and `kind: "module"`, so your rail can separate module
  events from agent and Room Mate events mechanically, not by convention.
- No buddy is ever the author of a bench event. A buddy may appear as a tender sprite at a rig; it
  never speaks for the module and the UI never implies it endorsed anything.
- First run shows one card: what this is, who made it, what it sends, TEST only, and an off switch.
- The player-facing line stays honest: "no wallet, no network, no testnet" is literally true in P0 and
  becomes "TEST MODE" the moment it is on the rail.

## 6 · Kill switch

One flag, no deploy, as you asked. When it goes off:

- the module stops emitting immediately and **drops its outbox — nothing is retried, nothing lands
  after the flip** (no replay, no queue that drains later);
- the bench keeps working locally, because progress is local-first, and shows `SERVICE PAUSED BY
  OWNER` in the status bar instead of a score;
- **a crew's progress:** survives. It lives in the player's own browser storage; switching the module
  off does not touch it. If you would rather it clear, say so and it clears;
- **XP in flight:** whatever you accepted is yours to keep or discard — your rules already decided
  what landed, and I cannot and will not re-send or reverse anything;
- **anything on a plot:** it was placed under owner attestation, so it stays and remains the owner's.
  The module just stops animating and updating it. Your call on the end state: does a module-placed
  structure go inert, or fall back to a static prop? I would suggest inert-but-present, so the island
  never loses something an owner paid for.

## 7 · Mobile — tested, not assumed

Base Rooms OS is mobile with the desktop look, so I built the board landscape-first and measured it.
The canvas is 480x300 logical pixels, scaled by whole numbers where it fits and by exact fractions
where it does not (never a smeared interpolated scale):

| device width (CSS px) | board renders at | scale |
|---|---|---|
| 320 | 300 x 187 | 0.63 |
| 360 | 330 x 206 | 0.69 |
| 390 | 360 x 225 | 0.75 |
| 412 | 390 x 244 | 0.81 |
| 600 and up | 480 x 300 | 1.00 |
| phone landscape (844 x 390) | 480 x 300 | 1.00 |

Measured: **no horizontal overflow at any width from 320 to 1024**, and the file's own selftest still
returns 8/8 at phone metrics. Two honest notes and one fix:

- Landscape on a phone gives a crisp 1:1 board; portrait fits to width at 0.63-0.81 and shows a
  `ROTATE YOUR PHONE` hint, because at a fractional scale a few one-pixel font strokes drop out.
  Portrait is playable, landscape is the intended way.
- Touch has no right-click, so **long-press a placed part to pull it** — implemented and verified
  (synthetic touch: part placed → removed after the hold).
- At the scale of 8,888 buddies: the bench renders **no buddies at all**, so its cost is per crew,
  not per buddy. A rig is one small canvas and a few hundred events an hour. Nothing in this module
  scales with the number of buddies on the island.

## 8 · Data — what leaves the client, what is stored

- **P0 today: nothing.** Verified by scanning the shipped file for `fetch`, `XMLHttpRequest`,
  `WebSocket`, `sendBeacon` and external `src`: zero hits. It is one offline HTML file.
- **Once on the rail, phase 1:** only the events in section 4 — crew and rig ids, board id, pad and
  cell counts, timings, fault kind, stars, hint used. No wallet address beyond what your key already
  implies, no names, no free text, no player identifier, no device fingerprint, no IP retention: there
  is no server of ours in the path, the client talks to your rail directly.
- **Storage on our side: none.** We have no backend and no database, so there is nothing for us to
  leak or lose. Progress lives in the player's own storage. If we ever want a leaderboard it becomes
  a proposal to you first, with the data written down before anything is built.

## 9 · Timeline

The P0 weekend prototype is **already playable — you can play it right now**:

https://htmlpreview.github.io/?https://cdn.jsdelivr.net/gh/D0xedDevi0/D0xedDev@54b500f/br-bus-p0/bench.html

Eight benches, one file, offline, ~24 KB, no wallet, no network. It runs on your phone today. What it
does *not* have yet is the rail: no key, no events, no writes — that is the phase-1 build and it
starts the day you issue a sandbox key.

Maintainer: **me**. The module is mine to maintain, there is no ask on your team, and I would rather
you never touch it than have it cost you a day.

## 10 · What your answers already changed

- `st.ideas` / `st.board` — treated as reserved. The bench library stays inside the bench and leaves
  as events. Nothing of mine is parked in your island state (Q1).
- Stock — read-only, mirrored locally as a ledger, no spend path. Ore→wire waits for phase 2 (Q2).
- XP — events only, your cap decides. The bench no longer awards anything itself (Q4).
- Island state — the module is write-only and never reads itself back (Q5).
- Arena — dropped from the plan entirely. Solder Rush does not touch trading (Q15).
- Task / alert / skill_draft — only with crew consent, offchain only, everything onchain through the
  propose lane (Q11).
- Placement — a crew can request, the owner attests; the module cannot place anything (Q10).
- Buddy autonomy — nothing in the bench directs a buddy. A buddy tends a rig the way it tends
  anything else; the benches keep running whether it shows up or not.

## 11 · What would unblock phase 1 (from your open list)

1. **Module key type + a sandbox key** (your Q3) — the single blocker for the rail.
2. **Energy units** and whether a third-party structure can register draw, or whether you model it
   from my events (Q7).
3. **A stable read for stock**, or confirmation to read it from the island payload (your Q2 open).
4. **The `C:\BRTC\Games` structure, icon spec and tile pastel** (Q9) — that is the difference between
   a link and a tile in the folder.
5. **Licence and attribution** (Q16) — I will take whatever you standardise on.

And the attestation question from section 0: is `units/looks` the display override on top of the
attested state, and should a module read attestation state read-only to render a buddy?
