# BUS.EXE · BENCH — a third-party module for Base Rooms OS

Handover document · D0xedDev (@D0xedDevi0) · 25 Nov 2026 · for Slava Mushyakov

**TL;DR**

1. **BUS.EXE BENCH** is a deterministic circuit-building puzzle module: eight benches, one offline
   HTML file, ~25 KB, no wallet, no network, no testnet. It is **playable right now** (link in §9).
2. It is the P0 slice of **THE WORKSHOP DISTRICT** — a plot district where crews build circuits —
   but the district is a future direction, not a requirement. P0 stands alone.
3. It already fits your system rather than asking for something new: your own client matrix has a
   non-agent category (**`Script, bot, cron or CI` → webhook + wrapper + http**), and your `/hook`
   rail already takes exactly the kind of events a bench emits. §3 has the verified detail.
4. It invents no economy. XP and materials arrive as events and your rules decide what lands; TEST by
   default, live only when you flip it; no token, no mint, no wagering; nothing onchain without the
   propose lane; a module can never flatten a buddy.
5. Blocked on three things only: a **module key type + sandbox key**, **energy units**, and the
   **`C:\BRTC\Games` icon/tile spec**. §10.

---

## 1 · What this is

**BUS.EXE BENCH** is a small game about routing current. Each bench gives you a source, one or more
sensors, and a bin of parts. You place parts on a grid, rotate them to face each other, and run the
board. A board is solved when **every sensor is lit and no fuse is blown** — two conditions, checked
separately, so a board that reaches a sensor through a blown fuse reports `NOT COUNTED` and pays
nothing.

**THE WORKSHOP DISTRICT** is where it goes: a district of plots where crews keep rigs, benches get
harder, and a crew's accumulated rig becomes a thing the island can see — the same way a statue, a
Gazette mention or a festival round already works there. I am explicitly **not** asking for a new
reward type. Everything the bench can produce, your island already knows how to pay for.

Technical shape, because it matters for an OS that keeps its desktop look on a phone:

| property | value |
|---|---|
| runtime | one HTML file, ~25 KB, assembled from plain source fragments |
| network | **none at runtime** — no fetch, XHR, WebSocket, beacon or external src (verified by scan) |
| assets | none — the 5×7 bitmap font is hand-built into the file |
| palette | your desktop chrome palette, resolved through a palette object (no stray CSS colours) |
| rendering | 480×300 logical canvas, whole-number scaling where it fits, exact fractions where it does not |
| input | mouse, keyboard and touch (long-press pulls a placed part) |
| determinism | the evaluator relaxes current to a fixed point — no randomness, no iteration cap |

## 2 · What a player actually does

Five parts. Every part has directional pins, so orientation is the whole game:

| part | behaviour | why it teaches |
|---|---|---|
| **WIRE** | straight, N-S or E-W | the verb: current needs a path, and the path has a direction |
| **SPLITTER** | a T: one input, two outputs | branching without losing the main line |
| **RESISTOR** | one way only | reversed = dead board — the single best mistake to make |
| **FUSE** | passes current, destroyed if fed from both sides | wrap-arounds fail loudly and honestly |
| **RELAY** | passes only while its control pin is powered | conditional logic; two boards in one |

**One bench, FIRST CONTACT (bench 1):** source at (2,5), sensor at (10,5), nine WIRE pads in the bin
and nothing else. Place them, rotate each to face the next. Par 9. It teaches the verb in about
twenty seconds.

**How a solve is checked:** current spreads outward from the source pin to a fixed point, following
pins in the direction they point. Required: `every sensor lit` **and** `res.blown.length === 0`.
Negative boards are first-class results with their own diagnostics — reversed resistor, blown fuse,
relay with no control line, open circuit, wrong junction:

```text
NOT COUNTED: FUSE BLOWN
```

Measured on the eight authored solutions, at the moment of solve:

| bench | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| name | FIRST CONTACT | … | TRAP | … | … | … | … | THE BUS |
| pads placed | 9 | 14 | 11 | 11 | 10 | 13 | 13 | 23 |
| cells powered | 11 | 16 | 13 | 13 | 13 | 16 | 16 | 27 |

Pacing: 45-90 seconds a board for someone who knows the answer; a first-timer loses one board to a
reversed resistor and then gets it. That pacing is what the draw curve in §6 is built on.

In P0 a crew's board is local: source → sensor, PAR (the authored solution length), pads placed,
stars, and a local XP counter capped at 24 pads a day. None of that is authoritative — it becomes
events the moment there is a rail to send them to.

---

## 3 · Where this already fits your system

This is the part I would want if I were you, so it is evidence-first. Everything below was read from
your live app or your live endpoints today; §12 has the exact commands so you can re-run all of it.

### 3.1 Your own taxonomy already has a slot for this

Your onboarding JS ships a per-client matrix of supported integration methods. Two entries are the
relevant ones, verbatim from your bundle:

```js
{id:"script", name:"Script, bot, cron or CI", methods:["webhook","wrapper","http"]}
{id:"other",  name:"Any other agent",         methods:["mcp","http","wrapper","webhook","tell"]}
```

The bench is **`script`-class, not an agent**. It uses **webhook + http** and it never uses `tell`,
because it is not a chat agent and should not be able to speak as one. That is your own non-agent
category — so a module riding it is a first-class citizen of your design, not an exception carved out
for me. (The full method vocabulary found in your bundle: `connector`, `hooks`, `mcp`, `wrapper`,
`http`, `webhook`, `tell`, plus `muse`.)

### 3.2 The rail, exactly as your own onboarding text specifies it

Your app generates these for users, so this is your contract, not my interpretation:

```bash
curl -s -X POST {base}/hook -H "Authorization: Bearer ***" -H "content-type: application/json" \
     -d '{"event":"tool","command":"npm test"}'
curl -s -X POST {base}/hook -H "content-type: application/json" \
     -d '{"event":"done","text":"Tests pass"}'
# messages from your buddy (waits up to 25 s)
curl -s "{base}/hook/inbox?wait=25" -H "..."
# ask the owner first (then poll /hook/approval/<id>?wait=25)
curl -s -X POST {base}/hook/approval -H "content-type: application/json" \
     -d '{"action":"Deploy to prod"}'
```

Live right now with no key, all answering `{"error":"unknown or revoked key"}`:

| path | method | what it is |
|---|---|---|
| `/hook` | POST | emit an event (the bench's whole write surface) |
| `/hook/inbox?wait=25` | GET | long-poll messages **from** the buddy/OS |
| `/hook/approval` + `/hook/approval/<id>?wait=25` | POST + GET | ask the owner first, then poll the answer |
| `/hook/event` | GET/POST | also present, same rejection |

So the bench's integration is small and boring, which is what you want:

| what happens in the bench | what it sends |
|---|---|
| a bench is run | `start` — crew, rig, board id |
| a board is solved | `done` — board id, pads, cells, stars, par delta, hint used |
| a fault | `error` — board id + diagnostic (blown fuse / reversed / no control / open) |
| a rig goes idle, or the guardrail stops it | `waiting` — crew + reason |
| a crew's build order is taken on | `prompt` — the order, its bench set |
| anything needing permission (a plot placement) | **`/hook/approval`** — never a silent write |

`/hook/inbox` is the one part the bench would read rather than write: if an owner or a buddy has
something to say to a rig, the bench can display it. Nothing else comes inbound. The island stays the
authority in both directions.

### 3.3 Where the bench shows up in the OS

Your client keeps a pulse store shaped `{agents, approvals, proposals, events, since, primed}`, cursored
by `since`, keeping the last 60 events. Bench events ride that same `events` stream, and every one
carries `src:"module:bus-exe"` and `kind:"module"` so they can never be mistaken for an agent or a
Room Mate event — the labelling requirement from your answer 3, built in rather than promised.
Approval requests land in the same `approvals` array the OS already renders. Nothing new appears in
your UI that you did not already have a component for.

### 3.4 Key and revocation — you already own the kill switch

The key is a bearer token, and your hook already distinguishes an **unknown** key from a **revoked**
one. That means revoking the module key is a kill switch that lives entirely on your side, independent
of the flag I build into the client. Two switches; yours is the real one.

### 3.5 One bug worth fixing, found while verifying

`GET` and `POST` on `/hook` return **HTTP 200 with an error body**:

```json
{"error":"unknown or revoked key"}
```

while `/hook/inbox`, `/hook/approval/<id>` and `/hook/event` return a proper **401**. Any module or
agent written against a stock HTTP client — check the status, treat 2xx as success — will record a
**rejected event as a delivered one** and never retry it. Normalising `/hook` to 401/403 would close
that quietly.

### 3.6 The honest line on what is verified

**Verified today:** the paths exist and their methods; the 401 + `unknown or revoked key` behaviour;
the client/method matrix and the `Script, bot, cron or CI` entry; the payload examples above; the
pulse shape; the public read endpoints I use for my own read-only mirror
(`world.baserooms.io/islands/1/{snapshot,bits,log}`, `os.../units/looks`, `.../units/progress`, the
Gazette feed).

**Not verified, and I will not guess them into the build:** the complete accepted `event` list beyond
`tool`/`done`; rate limits for module events vs agent events; whether a module key is a new key type on
your side; retry/backoff and idempotency expectations; whether `wait=25` long-polls are the intended
pattern for a non-agent module; and whether module events are billed, capped or muted at volume.

---

## 4 · What this is not

Rails already built to, from your answers, so they do not need re-negotiating later:

- **No token, no mint of parts, no wagering, no stake-to-play.** XP and materials only.
- **TEST by default.** Live only when you flip it through the propose lane.
- **Nothing onchain without the propose lane.** The module cannot place anything on a plot itself —
  placement needs the owner's attestation, and a crew can only request.
- **Write-only on island state.** The module never reads its own state back from the island.
- **Stock is read-only.** Mirrored locally as a ledger; an ore-to-wire spend path is a phase-2
  conversation, after you have seen the bench played.
- **Buddy autonomy untouched.** Nothing in the bench directs a buddy. A buddy may tend a rig the way it
  tends anything else; the benches run whether it shows up or not. No buddy is ever authored as the
  bench or speaks for it.
- **A module can never flatten a buddy.** The client reads the buddy's state first, self-limits to 60%
  of its remaining daily budget, hard-stops at 80%, never touches the last 20%. The bench loses before
  the buddy does.
- **No player data on our side.** There is no server of ours in the path.

---

## 5 · What your answers changed

| your answer | what changed in the design |
|---|---|
| `st.ideas` / `st.board` reserved | the bench library stays inside the bench; it leaves only as events |
| stock read-only | ledger mirror, no spend path |
| hook/event rail, module keys, TEST first | §3 is the build target; no new API invented |
| XP as events only | the bench awards nothing itself; your cap decides |
| island is write-only | no read-back path exists |
| energy is real, draw capped, never flatten | guardrail in §4 |
| placement needs owner attestation | the bench requests; the owner attests |
| tasks / alerts / skill_draft with consent | offchain only, consent recorded per owner |
| Arena is trading | dropped from the plan entirely |
| kill switch, no deploy | flag + your key revocation (§3.4, §7) |
| standalone module, move by PR | the bench stays a standalone embeddable file until you say otherwise |
| statues, Gazette, festivals opt-in | the bench plugs into what you already schedule; it invents no reward type |

---

## 6 · The numbers you asked for

### 6.1 Draw — the curve, before you set the cap

You asked for a typical rig's daily draw and how it scales as a crew builds more. I do not have your
energy units yet (your Q7 is open), so this is in **pad-runs** — one placed pad held for one run — and
it converts to your units the moment you give me a scale.

Measured, not assumed: the eight authored boards place `9 · 14 · 11 · 11 · 10 · 13 · 13 · 23` pads
(mean 13). **An idle rig draws nothing** — draw exists only while a board is live, so a crew cannot be
bled by a rig nobody is playing.

Assume a busy hour of 20 runs per board position (a board is ~90 s of held current, so 40 is the
ceiling; 20 is human pace):

| rig | busy hour | 8-hour day | buddies at cap 3,000/day | at cap 8,000/day |
|---|---|---|---|---|
| 1 board | 260 pad-runs | 2,080 | 1 | 1 |
| 3 boards | 780 | 6,240 | 3 | 1 |
| 6 boards | 1,560 | 12,480 | 5 | 2 |
| 12 boards | 3,120 | 24,960 | 9 | 4 |

**Shape: linear in boards, step-wise in buddies.** Draw rises with every board a crew runs; the number
of buddies committed jumps whenever the daily cap is crossed. The cap is the only real knob, and that
table is what four caps would do. The guardrail in §4 means the module stops before a buddy's floor,
so the worst case is an idle rig, never a flat buddy.

### 6.2 Event volume

Three events per run (`start`, `done`, `error`) at 20 runs per board position per hour:

| rig | events/hour at peak |
|---|---|
| 3 boards | ~360 |
| 6 boards | ~720 |
| 12 boards | ~1,400 |

A `progress` tick every 10 s would add ~1,100/hour per crew, so it is **off by default** and a flag you
control. Idle: one heartbeat per crew per 15 minutes (4/hour), which sits on the same cadence as
`st.log` if you confirm that cadence is stable enough to key off.

### 6.3 Mobile — measured, not asserted

| device width (CSS px) | board renders at | scale |
|---|---|---|
| 320 | 300 × 187 | 0.63 |
| 360 | 330 × 206 | 0.69 |
| 390 | 360 × 225 | 0.75 |
| 412 | 390 × 244 | 0.81 |
| 600 and up | 480 × 300 | 1.00 |
| phone landscape (844 × 390) | 480 × 300 | 1.00 |

No horizontal overflow at any width from 320 to 1024, and the file's selftest still returns 8/8 at
phone metrics. Landscape is the intended way (crisp 1:1); portrait fits to width and shows a
`ROTATE YOUR PHONE` hint, because at a fractional scale a few one-pixel font strokes drop. Touch has
no right-click, so **long-press a placed part to pull it** — implemented and verified.

At the scale of 8,888 buddies: the bench renders **no buddies at all**. Its cost is per crew, not per
buddy. Nothing in this module scales with the size of the island.

---

## 7 · Kill switch

One flag, no deploy, as you asked — plus your own key revocation as the outer switch (§3.4).

- The module **stops emitting immediately and drops its outbox** — nothing is retried, nothing lands
  after the flip. No queue drains later.
- The bench keeps working locally, because progress is local-first, and the status bar shows
  `SERVICE PAUSED BY OWNER` instead of a score.
- **A crew's progress:** survives. It lives in the player's own browser storage; the flag does not
  touch it. If you would rather it clear, say so and it clears.
- **XP in flight:** whatever you accepted is yours to keep or discard — your rules already decided what
  landed. I cannot and will not re-send or reverse anything.
- **Anything on a plot:** it was placed under owner attestation, so it stays and remains the owner's.
  The module stops animating and updating it. Your call on the end state — inert-but-present, or
  removed? I would argue inert-but-present so the island never destroys something an owner paid for.

## 8 · Data — what leaves the client, what is stored

- **P0 today: nothing.** Verified by scanning the shipped file for `fetch`, `XMLHttpRequest`,
  `WebSocket`, `sendBeacon`, dynamic import and external `src`: zero hits.
- **Phase 1, once on the rail:** only the events in §3.2 — crew and rig ids, board id, pad and cell
  counts, timings, fault kind, stars, hint used. No wallet address beyond what your key already
  implies, no names, no free text, no player identifier, no device fingerprint, no IP retention: there
  is no server of ours in the path, the client talks to your rail directly.
- **Stored on our side: nothing.** We have no backend and no database, so there is nothing for us to
  leak or lose. Progress lives in the player's own storage. If a leaderboard is ever wanted it becomes
  a proposal to you first, with the data written down before anything is built.

## 9 · Status

**Playable now — no install, no wallet, no key:**

https://htmlpreview.github.io/?https://cdn.jsdelivr.net/gh/D0xedDevi0/D0xedDev@54b500f/br-bus-p0/bench.html

Eight benches, one file, offline. Source fragments, solver notes and screenshots sit beside it in the
same branch, so it can be rebuilt rather than only played.

**Verified:** the file's own selftest returns 0 failures; all eight authored solutions solve; negative
cases (reversed resistor, blown fuse, relay with no control, open circuit) all report correctly and
never score; a blown-fuse board that reaches the sensor through a bypass is explicitly **not counted**;
no runtime network calls; the palette and button colours resolve through the palette object; the right
panel fits all eight benches without collision; the mobile fit table in §6.3 was measured in a browser.

**Still open, and I would rather say it than have you find it:** the minimality of benches 5-8 at their
authored PAR values is **not formally proven** (benches 1-4 have BFS proofs; 5-8 are authored targets
until a multi-branch solver exists); the evaluator's relay/splitter/fuse semantics have been tested
against my own cases and played in a browser, but **no external playtest has happened yet** — that is
exactly what P0 is for.

**Next build while we settle the three items in §10:** the module-rail adapter behind an OFF flag — the
event vocabulary, an outbox that drops on the kill switch, and the consent record — written and tested
locally, so the day a sandbox key exists it is a config flip and a TEST run rather than a build.

---

## 10 · What I need from you

1. **A module key type and a sandbox key.** The single blocker for the rail. TEST first, as you said.
2. **Energy units**, and whether a third-party structure can register draw or whether you would model
   it from my events.
3. **A stable read for stock**, or confirmation to read it from the island payload.
4. **The `C:\BRTC\Games` structure, the icon spec and the tile pastel** — the difference between a link
   and a tile in the folder.
5. **Licence and attribution.** My proposal, so you do not have to write one: **MIT** for the module
   code (so you can embed, modify and vendor it without asking me), with the attribution line
   *BUS.EXE BENCH — a Base Rooms module by @D0xedDevi0*, and the tile pastel and icon drawn to your
   spec by me at no cost to you. If you standardise on something else, I will take it.

And the one design question that decides whether a buddy ever appears at a bench: is `units/looks` the
owner-set display override sitting on top of the attested evolution state, and should a module read
attestation state read-only to render the buddy tending a rig? Until it is answered, the bench renders
no buddy at all.

## 11 · Two things I noticed on your side, with evidence

**a) `#0009` has two different looks depending on where you read it.** The island's own view for the
unit reads (your description) orange paint, ATM chassis, hard hat, sunglasses, class A, Scout — but
`os.baserooms.io/units/looks?ids=9` returns the override layer:

```json
{"looks":{"9":{"head":"crown","face":"specs","body":"bowtie","paint":"midnight","auto":{"blanket":false}}}}
```

Different slots (chassis/hat/glasses vs head/face/body) **and** a different paint value. If your UI
shows orange while the looks endpoint says midnight, either the override is not reaching the island
view or the island view is reading base traits. Related: `st.statues` in the island snapshot is a
9-entry list of **unit ids** — `[35,377,323,335,9,58,2,428,374]` — with 9 among them and
`s["9"] = slava.base.eth`; medals are a different field. If the UI reports zero medals for a unit that
holds a statue, that is worth a look too. (My reading of `st.statues` as unit ids comes from my own
notes, not from a spec — correct me if the field means something else.)

**b) `/hook` returns success on a rejected event.** See §3.5 — a 200 with an error body, where its
subpaths return 401. Worth normalising before modules start trusting status codes.

## 12 · Verify all of this yourself

```bash
# the rail exists and rejects without a key (subpaths 401; the /hook root 200 with an error body)
curl -s -o /dev/null -w "%{http_code}\n" https://os.baserooms.io/hook
curl -s https://os.baserooms.io/hook/inbox?wait=1
curl -s https://os.baserooms.io/hook/approval/x
# the MCP surface: POST-only, MCP protocol header expected
curl -s -o /dev/null -w "GET %{http_code}\n"  https://baserooms.io/mcp
curl -s -X OPTIONS -o /dev/null -w "OPTIONS %{http_code}\n" https://baserooms.io/mcp
# the look-override layer and the statue list behind 11a
curl -s "https://os.baserooms.io/units/looks?ids=9" -H "Referer: https://baserooms.io/"
curl -s "https://world.baserooms.io/islands/1/snapshot" -H "Referer: https://world.baserooms.io/" | head -c 400
```

## 13 · Maintenance and contact

**Me.** The module is mine to maintain — code, art, balance, bugs — and there is no ask on your team.
It stays a standalone embeddable file until you want it in by PR, exactly as you said in answer 16. The
one thing I would ask is that the items in §10 land when they can, because the prototype is finished
and is now waiting on a key rather than on work.

D0xedDev · @D0xedDevi0 · reply here or on X.
