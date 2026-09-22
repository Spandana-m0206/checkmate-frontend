# Checkmate Frontend — UI Specification

Visual and interaction specification for the Checkmate frontend, modelled on the
chess.com *Play vs. Computer* screen.

**This document defines how it looks and behaves.
[REQUIREMENTS.md](REQUIREMENTS.md) defines what it does.** Where the two appear
to conflict, `REQUIREMENTS.md` wins and this document is corrected. Every
section below cross-references the requirement it renders — e.g. "(REQ §3.5)".

---

## 1. Reference & Scope

**Reference:** `https://www.chess.com/play/computer` — dark shell, slim left nav,
centred board flanked by opponent/player strips, right-hand panel holding the
move list and game controls.

### 1.1 Decisions governing this spec

| Decision | Choice |
| --- | --- |
| Screens covered | All screens in REQ §2, §3, §6 |
| Feature set | Everything REQ supports, plus chess.com elements the frontend can derive on its own |
| Layout | Desktop-first, responsive down to mobile |
| Theme | Dark only |

### 1.2 In scope

Everything `REQUIREMENTS.md` specifies, plus these chess.com elements that the
frontend can compute **with no backend change**, since they are all derivable
from the authoritative FEN and the moves already received over the socket:

- Captured-piece tray and material advantage (diffed from the FEN against the
  standard starting material)
- Live move list during play, in chess.com's two-column format
- Flip-board control
- Last-move highlight, selected-square highlight, check highlight

### 1.3 Out of scope

These chess.com features are **not** part of Checkmate and must not appear in
the UI: bot/opponent selection, Elo ratings and rating change, hints, takebacks,
move evaluation and analysis, game review, board/piece theme pickers, draw
offers, premoves, chat, puzzles, and the marketing/global site navigation.

Any of these that are later requested must first be added to
`REQUIREMENTS.md` — they imply backend support this frontend does not have.

---

## 2. Design Tokens

Declared once in `tailwind.config.js` under `theme.extend` and consumed as
Tailwind utilities. Components must use tokens, never raw hex values (REQ §13).

### 2.1 Colour

Board colours are sampled from `src/assets/board/board.png`; the surface ramp is
built from `src/assets/board/background.png` so the shell and the backdrop
agree.

**Surfaces**

| Token | Hex | Use |
| --- | --- | --- |
| `bg-base` | `#1F2C3D` | Page background, behind the backdrop image |
| `surface` | `#26334A` | Panels, cards, left nav |
| `surface-raised` | `#2C3A54` | Player strips, move-list header, hover rows |
| `surface-sunken` | `#1A2536` | Move-list body, inputs |
| `border` | `#3A4A66` | Hairlines, dividers, input borders |
| `border-strong` | `#4A5C7A` | Focused input, active tab |

**Text**

| Token | Hex | Use |
| --- | --- | --- |
| `text-primary` | `#EDEFF3` | Headings, player names, move text |
| `text-secondary` | `#9AA6BC` | Labels, metadata, timestamps |
| `text-muted` | `#6B7893` | Disabled, placeholder, board coordinates |

**Accent & status**

| Token | Hex | Use |
| --- | --- | --- |
| `accent` | `#81B64C` | Primary actions, active turn indicator |
| `accent-hover` | `#9BCB63` | Primary hover |
| `accent-pressed` | `#6B9A3F` | Primary active |
| `danger` | `#CC3333` | Resign, destructive confirms, errors |
| `danger-hover` | `#E04A4A` | Danger hover |
| `warning` | `#E8A33D` | Timer ≤ 10s, reconnecting banner |
| `info` | `#4A90D9` | Neutral notices, room-code panel |

**Board**

| Token | Hex / value | Use |
| --- | --- | --- |
| `board-light` | `#EBECD0` | Light squares (from `board.png`) |
| `board-dark` | `#739552` | Dark squares (from `board.png`) |
| `board-highlight` | `rgba(255, 241, 120, 0.55)` | Selected square, last-move from/to |
| `board-legal` | `rgba(20, 30, 20, 0.22)` | Legal-move dot and capture ring |
| `board-check` | `radial-gradient(circle, #E5453B 0%, rgba(229,69,59,0) 72%)` | King in check |
| `board-pending` | `rgba(255, 241, 120, 0.28)` | Square of a move awaiting confirmation |

### 2.2 Typography

System font stack; no web font is loaded.

```
font-sans: ui-sans-serif, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace
```

| Role | Size / weight | Notes |
| --- | --- | --- |
| Display | 40px / 700 | Welcome wordmark |
| H1 | 28px / 700 | Screen titles |
| H2 | 20px / 600 | Panel and section headers |
| Body | 15px / 400 | Default |
| Body-strong | 15px / 600 | Player names |
| Small | 13px / 400 | Metadata, labels |
| Caption | 11px / 600, `0.06em` tracking, uppercase | Panel eyebrows, board coordinates |
| Timer | 26px / 700, `font-mono`, tabular numerals | Clock — must not reflow as digits change |
| Move text | 14px / 500, `font-mono` | Move list, so columns align |

### 2.3 Spacing, radius, elevation, motion

- **Spacing** — Tailwind's 4px scale. Panel padding `16px` (`p-4`); gap between
  shell columns `16px`; screen gutter `24px` desktop, `16px` mobile.
- **Radius** — `sm 4px` (inputs, squares' highlight), `md 8px` (buttons, cards),
  `lg 12px` (panels, board frame), `full` (avatars, pills).
- **Elevation** — `panel: 0 1px 2px rgba(0,0,0,.35)`,
  `raised: 0 4px 12px rgba(0,0,0,.4)`, `modal: 0 16px 48px rgba(0,0,0,.55)`.
- **Motion** — `fast 120ms` (hover, focus), `base 180ms` (panels, highlights),
  `piece 160ms ease-out` (piece travel), `modal 220ms` (result dialog).
  All easing `cubic-bezier(.4, 0, .2, 1)`.
- **Reduced motion** — under `prefers-reduced-motion: reduce`, piece movement
  and modal transitions become instant; only opacity fades remain.

---

## 3. App Shell

### 3.1 Backdrop

`src/assets/board/background.png` is fixed to the viewport, `cover`, centred,
with a `bg-base` colour beneath it and a `rgba(31,44,61,0.72)` scrim on top so
foreground text keeps contrast. It never scrolls with content.

### 3.2 Breakpoints

| Name | Width | Shell |
| --- | --- | --- |
| `sm` | < 768px | Single column, nav becomes a bottom bar |
| `md` | 768–1023px | Board + panel stack vertically, nav is a bottom bar |
| `lg` | 1024–1279px | Three columns, right panel `280px` |
| `xl` | ≥ 1280px | Three columns, right panel `320px` |

### 3.3 Left nav (`lg` and up)

A `72px` fixed rail on `surface`, holding the Checkmate mark at top and
icon+label buttons: **Home** (`/home`), **Play** (`/home` → Play Random),
**History** (`/history`), and the user avatar at the bottom.

Active item: `accent` icon with a 3px `accent` left edge. Inactive:
`text-secondary`, hover `text-primary` on `surface-raised`.

Below `lg` the rail becomes a `56px` bottom bar with the same items, labels
hidden, safe-area padding applied.

The nav is hidden entirely on `/` and `/auth` (REQ §2.1, §2.2 — pre-auth).

---

## 4. Shared Components

Live in `src/components/` (REQ §12). Each is a directory with its component and
an `index.ts`.

### 4.1 Button

| Variant | Appearance |
| --- | --- |
| `primary` | `accent` fill, `#14210A` text, 2px darker bottom edge (chess.com's raised look), hover `accent-hover` |
| `secondary` | `surface-raised` fill, `text-primary`, `border` hairline |
| `danger` | `danger` fill, white text |
| `ghost` | Transparent, `text-secondary`, hover `surface-raised` |

Sizes `sm 32px` / `md 40px` / `lg 48px` height. Full-width via `fullWidth`.
`loading` swaps the label for an inline spinner and sets `aria-busy`, keeping
the button's width so the layout does not jump. `disabled` drops to 45% opacity.

### 4.2 IconButton

Square, sizes `32/40px`, `radius-md`, `text-secondary` → `text-primary` on
hover. Requires `aria-label`. Used for flip-board and panel controls.

### 4.3 Input

`surface-sunken` fill, `border` hairline, `40px` tall, `radius-sm`,
`text-primary`, placeholder `text-muted`. Focus: `border-strong` plus a 2px
`accent` ring. Error: `danger` border with a `13px` `danger` message beneath,
wired by `aria-describedby`.

### 4.4 OtpInput

Six `48×56px` `surface-sunken` cells, `font-mono` `24px`, centred, `8px` gaps.
Auto-advance on entry, backspace moves back, paste distributes across cells,
and the whole group is one labelled field for screen readers. Filled cells get
a `border-strong` outline; the active cell gets the `accent` ring.

### 4.5 Modal

Centred `surface` panel, `radius-lg`, `shadow-modal`, max-width `420px`, over a
`rgba(10,15,24,0.7)` overlay. Focus is trapped and restored on close; `Esc`
closes unless the modal is marked non-dismissable (the game-result modal is).

### 4.6 Loader

`accent` spinner in `16/24/40px`, with optional label beneath in
`text-secondary`. Full-screen variant centres in the content area.

### 4.7 ErrorState / EmptyState

Centred icon, `H2` title, `text-secondary` body, optional action Button.
`ErrorState` uses a `danger`-tinted icon and takes a `retry` handler;
`EmptyState` uses `text-muted`.

### 4.8 Card

`surface` fill, `radius-md`, `border` hairline, `16px` padding. `interactive`
adds hover `surface-raised` with a `1px` lift and a focus ring.

### 4.9 Avatar

Circular, sizes `24/32/40/56px`. Falls back to the user's initials on an
`accent`-tinted disc when no profile image is set. Always carries `alt`.

---

## 5. Screens

### 5.1 Welcome — `/` (REQ §2.1)

```
┌──────────────────────────────────────────┐
│                                          │
│            ♞  CHECKMATE                  │   Display, text-primary
│      Play chess with anyone, anywhere    │   Body, text-secondary
│                                          │
│         ┌──────────────────────┐         │
│         │    Start Playing     │         │   Button primary lg
│         └──────────────────────┘         │
│                                          │
└──────────────────────────────────────────┘
        backdrop image, no nav rail
```

Single centred column, max-width `420px`, vertically centred. The wordmark uses
the black knight asset (`bn.png`) at `56px` beside the text.

**Start Playing** routes to `/home` when authenticated, `/auth` otherwise
(REQ §2.1). No request is made to render this screen, so it has no loading
state.

### 5.2 Authentication — `/auth` (REQ §2.2)

One centred `Card` (max-width `420px`) whose content swaps between four steps.
A step indicator is **not** shown; the card header names the current step.

**Step 1 — Email**

```
┌────────────────────────────────┐
│  Sign in                       │  H1
│  We'll email you a code        │  Small, text-secondary
│                                │
│  Email                         │  Small label
│  ┌──────────────────────────┐  │
│  │ you@example.com          │  │  Input
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │       Send code          │  │  Button primary, fullWidth
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

Submit is disabled until the email is syntactically valid. The button shows its
`loading` state while `sendOtp` is in flight.

**Step 2 — OTP**

Header reads `Enter code`, sub-label `Sent to you@example.com` with a **Change**
ghost button returning to step 1. `OtpInput` below, then a `Verify` primary
button. A `Resend code` ghost button sits underneath, disabled with a `0:30`
countdown after each send.

Verification failure renders the error beneath the OTP group and clears the
cells, leaving focus in the first cell.

**Step 3 — Profile setup** (new users only, REQ §2.2)

```
┌────────────────────────────────┐
│  Create your profile           │  H1
│                                │
│        ╭────────╮              │
│        │ avatar │  Upload      │  Avatar 56px + ghost Button
│        ╰────────╯              │
│  Username  [________________]  │
│  Name      [________________]  │
│  Date of birth [__/__/____]    │
│  ┌──────────────────────────┐  │
│  │      Create account      │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

All four fields are required. Validation is inline, on blur, and the submit
button stays disabled until the form is valid.

**Step 4 — Success** — no dedicated screen; on receiving the JWT the app
redirects straight to `/home` (REQ §2.2).

### 5.3 Home — `/home` (REQ §2.3)

Three stacked action cards in a centred `560px` column. No lobby and no
online-player list (REQ §2.3).

```
┌────────────────────────────────────────┐
│  Welcome back, {name}                  │  H1
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ ♟  Play Random                   │  │  Card interactive
│  │    Get matched with a player  ▸  │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ ✉  Invite Friend                 │  │
│  │    Create or join a room      ▸  │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ ⏱  History                       │  │
│  │    Your completed games       ▸  │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Play Random** is visually primary — `accent` left border and an `accent`
-tinted icon disc. The other two are neutral.

### 5.4 Matchmaking (REQ §2.4, §2.5)

Rendered as a `Modal` over `/home` rather than as its own route, so dismissing
returns the player to Home.

**Searching** (after `joinQueue`)

```
┌──────────────────────────────┐
│          ◌  spinner          │
│   Finding an opponent...     │  H2
│        0:12 elapsed          │  Small, text-secondary
│  ┌────────────────────────┐  │
│  │        Cancel          │  │  secondary → emits leaveQueue
│  └────────────────────────┘  │
└──────────────────────────────┘
```

The modal is non-dismissable except through **Cancel**, so the player cannot
abandon the queue without `leaveQueue` being emitted (REQ §4).

**Invite Friend** — two stacked blocks separated by an `OR` divider:

```
┌──────────────────────────────┐
│  Invite a friend             │  H2
│  ┌────────────────────────┐  │
│  │     Create Room        │  │  Button primary
│  └────────────────────────┘  │
│  ──────────  OR  ──────────  │
│  Enter room code             │  Small label
│  ┌────────────────────────┐  │
│  │  [_ _ _ _ _ _]         │  │  OtpInput-style, uppercase
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │         Join           │  │  Button secondary
│  └────────────────────────┘  │
└──────────────────────────────┘
```

**Room created** — replaces the modal body with the code rendered at `40px`
`font-mono`, letter-spaced, on an `info`-tinted panel, a **Copy code**
`IconButton`, and `Waiting for your friend to join...` with a spinner. Copy
confirms with a transient `Copied` pill.

On `gameStarted` the modal closes and both clients navigate to `/game/:gameId`
(REQ §2.4, §2.5).

### 5.5 Game — `/game/:gameId` (REQ §3)

The chess.com replica and the centrepiece of this spec.

**Desktop (`lg` and up)**

```
┌────┬──────────────────────────────┬──────────────────────┐
│    │  ╭──────────────────────────╮│ ┌──────────────────┐ │
│ ♞  │  │ ◍ opponent_name          ││ │ Game    ● Live   │ │ panel header
│    │  │   ♟♟♝ +2         ⏱ 0:24  ││ ├──────────────────┤ │
│ ⌂  │  ╰──────────────────────────╯│ │  1. e4      e5   │ │
│    │  ┌──────────────────────────┐│ │  2. Nf3     Nc6  │ │ move list
│ ▶  │  │8                         ││ │  3. Bb5  ◂       │ │ (auto-scroll)
│    │  │7        BOARD            ││ │                  │ │
│ ⏱  │  │…   (square, max 640px)   ││ │                  │ │
│    │  │1 a b c d e f g h         ││ ├──────────────────┤ │
│    │  └──────────────────────────┘│ │  ⇅ Flip          │ │ controls
│    │  ╭──────────────────────────╮│ │  ⚑ Resign        │ │
│ ◍  │  │ ◍ you (white)            ││ └──────────────────┘ │
│    │  │   ♟♟ +0          ⏱ 0:30  ││                      │
└────┴──╰──────────────────────────╯┴──────────────────────┘
 72px        centre column            280px (lg) / 320px (xl)
```

**Mobile (`sm`)** — single column in this order: opponent strip, board, player
strip, a control row (`Flip`, `Resign`), then a collapsed **Moves** disclosure
that expands to the move list. The board takes the full gutter width.

#### 5.5.1 Player strips

Opponent above the board, player below — and they swap with board orientation
so the player is always at the bottom (REQ §3.6).

Each strip is `surface-raised`, `radius-md`, `56px` tall, `12px` padding, and
holds, left to right: `Avatar 40px`, name (Body-strong) with colour dot beneath,
the captured-piece tray, then the clock pushed right.

**Active turn** — the strip whose turn it is gets a `2px accent` border and its
clock switches to `text-primary`; the idle strip's clock is `text-muted`.

#### 5.5.2 Captured pieces (client-derived, §1.2)

Inline row of `18px` piece images at 85% opacity, grouped by type in
pawn→knight→bishop→rook→queen order, `-4px` overlap within a group. Material
advantage appends as `+N` in `Small` `text-secondary` on the leading side only;
when material is level neither side shows a number.

Derived by diffing the current FEN against the standard starting material. It
is display-only and never feeds move legality.

#### 5.5.3 Game timer (REQ §3.7)

`M:SS`, `font-mono`, tabular numerals, `26px`, in a `52×32px` pill.

| State | Appearance |
| --- | --- |
| Idle (not your turn) | `surface-sunken` fill, `text-muted` |
| Running | `surface-sunken` fill, `text-primary` |
| ≤ 10s | `warning` text, pill border pulses at 1Hz |
| ≤ 5s | `danger` text, pulse at 2Hz |
| Expired | `danger` fill, white `0:00` |

The countdown is computed from the backend's `turnStartedAt`, not from a local
decrementing counter, so it stays correct across tab throttling and re-render
(REQ §3.7). It re-derives on every animation frame tick against `Date.now()`.

At zero the frontend emits `moveTimeout` and the timer holds at `0:00` — it does
**not** declare a result. The result is only rendered on `gameEnded` (REQ §3.7).

#### 5.5.4 Board anatomy (REQ §3.1)

Four stacked layers in one `aspect-square` container, sized
`min(calc(100vh - 220px), 640px)` on desktop and `100%` of the gutter on mobile,
with a `min` of `280px`:

1. **Board image** — `board.png`, `radius-lg`, `object-cover`, `z-0`.
2. **Coordinates** — files `a–h` along the bottom edge, ranks `1–8` along the
   left edge, `Caption` type, inset `4px`, coloured for contrast against the
   square they sit on. They rotate with orientation (REQ §3.6). `z-10`.
3. **Highlight layer** — last move, selection, legal-move markers, check glow,
   pending-move tint. `z-20`, `pointer-events-none`.
4. **Piece layer + interaction grid** — a transparent CSS-grid `8×8` overlay
   whose cells exactly match the board's squares, one cell per coordinate key
   `a8`…`h1` (REQ §3.1). `z-30`.

The container is strictly square via `aspect-ratio: 1`, so the grid cannot drift
from the image at any width (REQ §3.1).

#### 5.5.5 Square states

| State | Rendering |
| --- | --- |
| Default | Board image shows through |
| Last move (from and to) | `board-highlight` full-square wash |
| Selected | `board-highlight` wash + `2px` inset `accent` border |
| Legal move, empty | Centred `board-legal` dot, 28% of square width |
| Legal move, capture | `board-legal` ring, 8% of square width, hugging the edge |
| Hover on a legal target | Dot/ring grows to 34%, `fast` |
| King in check | `board-check` radial glow |
| Pending confirmation | `board-pending` wash on both from and to |
| Board locked | Cursor `default`, no hover response |

#### 5.5.6 Pieces

`ChessPiece` maps `color + type` to a local asset (REQ §3.2) — `w`/`b` plus
`k q r b n p`, giving `src/assets/pieces/{color}{type}.png`. The backend never
sends image URLs (REQ §3.2).

Pieces are `100%` of the square, `object-contain`, centred, and drawn above the
highlight layer. A piece moves by transitioning its grid position over `piece`
(160ms), so it slides rather than teleports; captures fade the taken piece out
over 120ms as the capturer arrives.

Pieces have `pointer-events: none`; all input is taken by the interaction grid
beneath them, so hit-testing stays exactly square-aligned.

#### 5.5.7 Move interaction (REQ §3.4, §3.5)

Selection requires the piece to be the player's own **and** the player's turn
(REQ §3.4); a tap on any other piece is ignored without feedback.

1. **Select** — square highlights and legal destinations render, from
   `chess.js` (REQ §3.4).
2. **Reselect** — tapping another of the player's pieces moves the selection.
3. **Deselect** — tapping the selected square, an illegal square, or pressing
   `Esc` clears it.
4. **Move** — tapping a legal destination emits `makeMove { from, to, gameId }`
   and enters the pending state (REQ §3.5).
5. **Drag** — dragging a piece is equivalent to select-then-drop; the dragged
   piece follows the cursor at 90% opacity with the origin square showing a
   ghost. Dropping off-board or on an illegal square cancels.

**Pending state** (REQ §3.5) — the board takes no further move input, the from
and to squares carry the `board-pending` tint, and the piece is optimistically
shown at its destination. This is presentation only; the authoritative FEN has
not changed.

- On `moveMade` — the pending tint clears, FEN/turn/move-number/last-move update
  from the payload, the move appends to the list, and the timer resets
  (REQ §3.5).
- On `moveRejected` — the piece animates back to its origin over `base`, the
  board re-renders from the retained authoritative FEN, the pending move clears,
  and a `danger` toast shows the reason (REQ §3.5).

If neither event arrives within 5s, the strip shows `Confirming move...` in
`text-secondary` while the board stays locked.

#### 5.5.8 Promotion

When a selected pawn move reaches the last rank, a promotion chooser opens
anchored over the destination square: a `surface` column of four `64px` piece
buttons — queen, rook, bishop, knight — in the mover's colour, queen first.
`Esc` or an outside click cancels the move entirely. `makeMove` is emitted only
after the choice, carrying the promotion piece (REQ §3.3).

#### 5.5.9 Orientation (REQ §3.6)

White sees white at the bottom, Black sees black at the bottom. Orientation is
set from `myColor` when the game loads.

**Flip** is a local view toggle only — it rotates the grid, the coordinates and
the player strips together, and never alters `myColor`, move encoding, or
anything sent to the backend.

#### 5.5.10 Move list (client-derived, §1.2)

Two columns in chess.com's format — move number, White's move, Black's move —
`font-mono`, alternating `surface-sunken` row tint. The latest move is marked
with an `accent` left edge, and the list auto-scrolls to keep it visible unless
the user has scrolled up, in which case a **Jump to latest** pill appears.

The list is display-only during play: clicking a move does **not** navigate the
board, because the frontend holds only the authoritative current position
(REQ §3.3). Replay lives in `/history/:gameId` (REQ §6).

#### 5.5.11 Game controls

`Flip` (`IconButton`, `⇅`) and `Resign` (`danger` `ghost` Button, `⚑`) sit in a
bordered footer in the right panel.

**Resign** opens a confirm Modal — `Resign this game?` / `Your opponent will be
awarded the win.` / `Cancel` + `Resign` — and only emits `resign` on confirm
(REQ §3.9). The result is rendered from `gameEnded`, never assumed locally.

#### 5.5.12 Connection status (REQ §4.2, §5)

A pill in the panel header:

| Socket state | Pill |
| --- | --- |
| Connected | `accent` dot + `Live`, `text-secondary` |
| Reconnecting | `warning` dot pulsing + `Reconnecting...` |
| Disconnected | `danger` dot + `Offline` |

On disconnect during an active game, a `warning` banner spans the top of the
centre column reading `Connection lost — Reconnecting...`, and the board locks
immediately: no selection, no drag, no emit (REQ §4.2).

On reconnect the banner switches to `Syncing...` until `gameState` arrives, at
which point local state is **replaced** wholesale by the authoritative payload
and the banner clears (REQ §4.2, §5). Any move composed while offline is
discarded rather than sent (REQ §5).

`opponentDisconnected` shows `{name} disconnected` in the opponent strip with a
`warning` dot; `opponentReconnected` restores it (REQ §4.2).

#### 5.5.13 Game result (REQ §3.8)

On `gameEnded` the board locks, the timer stops, and a non-dismissable Modal
opens over a board that stays visible behind the overlay:

```
┌────────────────────────────────┐
│           👑 / 🤝              │
│        You won                 │  H1
│      by checkmate              │  Body, text-secondary
│                                │
│   ◍ you    1 – 0   opponent ◍  │
│                                │
│  ┌──────────┐  ┌────────────┐  │
│  │   Home   │  │  History   │  │
│  └──────────┘  └────────────┘  │
└────────────────────────────────┘
```

| Outcome | Headline | Accent |
| --- | --- | --- |
| Win | `You won` | `accent` |
| Loss | `You lost` | `danger` |
| Draw / stalemate | `Draw` | `info` |

The reason line reads `by checkmate`, `by stalemate`, `by resignation`, or
`on time`, covering the four end states in REQ §3.8. Both buttons are always
offered — `Home` (`/home`) and `History` (`/history`) — per REQ §3.8.

### 5.6 History — `/history` (REQ §6)

A centred `720px` column of rows, newest first.

```
┌──────────────────────────────────────────────┐
│  History                                     │  H1
│  ┌────────────────────────────────────────┐  │
│  │ ▌ ◍ opponent_name          Won     ▸  │  │  accent left edge
│  │     22 Sep 2026 · 34 moves             │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │ ▌ ◍ other_player           Lost    ▸  │  │  danger left edge
│  │     21 Sep 2026 · 51 moves             │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

Each row is an interactive `Card` carrying opponent, result, date and move count
(REQ §6), with a 3px left edge coloured by result — `accent` won, `danger` lost,
`info` drawn. Selecting a row opens `/history/:gameId` (REQ §6).

States: `Loader` while fetching, `ErrorState` with retry on failure, and an
`EmptyState` reading `No games yet` with a **Play Random** action when the list
is empty.

### 5.7 Game detail — `/history/:gameId` (REQ §6)

Two columns at `lg`: a static board on the left, the full move list on the
right. Below `lg` they stack.

A header names both players and the result. The move list here **is**
interactive, since the whole move sequence is available from
`GET /games/:gameId` (REQ §6): selecting a move renders that position on the
board, and `←` / `→` step through the game while `Home` / `End` jump to the
start and the final position. This is local replay only and issues no requests.

---

## 6. Cross-cutting States

Every screen that fetches data renders exactly one of four states, driven by the
feature service hook (REQ §9):

| State | Rendering |
| --- | --- |
| Loading | `Loader`, centred in the content area |
| Error | `ErrorState` with the message and a retry action |
| Empty | `EmptyState` with a next-step action |
| Content | The screen |

Skeletons are not used — a spinner is the single loading idiom.

**Toasts** appear bottom-right on desktop and top-centre on mobile,
`surface-raised`, `radius-md`, auto-dismissing after 4s, with an accent edge
coloured by severity. They carry transient messages such as `moveRejected`
reasons and copy confirmations — never anything the user must act on.

---

## 7. Accessibility

- **Contrast** — all text meets WCAG AA on its surface. `text-muted` is reserved
  for non-essential text; board coordinates flip between `board-light` and
  `board-dark` to hold contrast on whichever square they sit on.
- **Keyboard** — the board is a focusable grid: arrows move a focus cursor,
  `Enter`/`Space` selects and then moves, `Esc` deselects. Every interactive
  element has a visible `accent` focus ring; modals trap and restore focus.
- **Screen readers** — squares are labelled by coordinate and occupant
  (`e4, white pawn`). An `aria-live="polite"` region announces each completed
  move in algebraic notation, whose turn it is, check, and the final result.
  Timer pills are `aria-live="off"` to avoid announcing every second, but a
  polite announcement fires at 10s and 5s remaining.
- **Colour independence** — turn, result and connection state are never signalled
  by colour alone; each pairs with text or an icon.
- **Targets** — interactive elements are at least `44×44px` on touch. Board
  squares below `sm` are at least `35px`, so a `280px` board remains usable.

---

## 8. Asset Inventory

Assets live in `src/assets/` and are frontend-owned (REQ §3.2).

```
src/assets/
├── board/
│   ├── board.png        1600×1600  8×8 board, #EBECD0 / #739552
│   └── background.png   2048×2048  dark navy backdrop, #1F2C3D
└── pieces/
    ├── wk.png  wq.png  wr.png  wb.png  wn.png  wp.png
    └── bk.png  bq.png  br.png  bb.png  bn.png  bp.png
```

Piece filenames follow `{color}{type}.png` with `color ∈ {w, b}` and
`type ∈ {k, q, r, b, n, p}` — the same encoding `chess.js` uses for a piece, so
the lookup is a direct template with no mapping table.

---

## 9. Component Inventory

| Component | Location | Spec |
| --- | --- | --- |
| `Button` | `src/components/Button` | §4.1 |
| `IconButton` | `src/components/IconButton` | §4.2 |
| `Input` | `src/components/Input` | §4.3 |
| `OtpInput` | `src/components/OtpInput` | §4.4 |
| `Modal` | `src/components/Modal` | §4.5 |
| `Loader` | `src/components/Loader` | §4.6 |
| `ErrorState` | `src/components/ErrorState` | §4.7 |
| `EmptyState` | `src/components/EmptyState` | §4.7 |
| `Card` | `src/components/Card` | §4.8 |
| `Avatar` | `src/components/Avatar` | §4.9 |
| `AppShell` | `src/components/AppShell` | §3 |
| `ChessBoard` | `features/game/components/ChessBoard` | §5.5.4 |
| `ChessSquare` | `features/game/components/ChessSquare` | §5.5.5 |
| `ChessPiece` | `features/game/components/ChessPiece` | §5.5.6 |
| `BoardCoordinates` | `features/game/components/BoardCoordinates` | §5.5.4 |
| `MoveIndicator` | `features/game/components/MoveIndicator` | §5.5.5 |
| `PromotionDialog` | `features/game/components/PromotionDialog` | §5.5.8 |
| `PlayerInfo` | `features/game/components/PlayerInfo` | §5.5.1 |
| `CapturedPieces` | `features/game/components/CapturedPieces` | §5.5.2 |
| `GameTimer` | `features/game/components/GameTimer` | §5.5.3 |
| `MoveList` | `features/game/components/MoveList` | §5.5.10 |
| `GameControls` | `features/game/components/GameControls` | §5.5.11 |
| `ConnectionStatus` | `features/game/components/ConnectionStatus` | §5.5.12 |
| `GameResult` | `features/game/components/GameResult` | §5.5.13 |

---

## 10. Open UI Questions

1. **Welcome mark** — the wordmark currently reuses `bn.png`. A dedicated logo
   asset would be better if one exists.
2. **Avatar fallback** — initials are specified, but the profile-image upload
   transport is itself unresolved (REQ §17.4), so the URL shape is unknown.
3. **Toast library vs. in-house** — §6 specifies behaviour but not
   implementation; a small in-house component is assumed.
4. **Room-code length** — §5.4 draws six cells. The real length is set by the
   backend and must be confirmed (REQ §17.2).
