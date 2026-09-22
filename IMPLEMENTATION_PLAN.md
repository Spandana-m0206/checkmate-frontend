# Checkmate Frontend — Implementation Plan

> **Source of truth**: [checkmate-API](https://github.com/spandanam-tech/checkmate-API) backend contract.
> All decisions below are confirmed with the product owner.

---

## Table of Contents

1. [Confirmed Decisions](#1-confirmed-decisions)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Pages & Routes](#4-pages--routes)
5. [Component Inventory](#5-component-inventory)
6. [Zustand Stores](#6-zustand-stores)
7. [API Service Layer](#7-api-service-layer)
8. [Socket.IO Integration](#8-socketio-integration)
9. [Authentication Flow](#9-authentication-flow)
10. [Matchmaking Flow](#10-matchmaking-flow)
11. [Game Flow](#11-game-flow)
12. [Game History Flow](#12-game-history-flow)
13. [Dark Mode](#13-dark-mode)
14. [Responsive Design](#14-responsive-design)
15. [Phased Build Order](#15-phased-build-order)

---

## 1. Confirmed Decisions

| # | Decision |
|---|----------|
| 1 | Custom chess board built with `chess.js` — no `react-chessboard`. Board uses a custom image/design with an 8×8 transparent interaction grid on top. |
| 2 | Fully custom Tailwind components — no shadcn/ui, Radix, or other component libraries. |
| 3 | Dark mode required using Tailwind `dark:` classes with a simple theme toggle. |
| 4 | Responsive — desktop, tablet, and mobile. Board maintains square aspect ratio. |
| 5 | Click-to-move only. Legal-move indicators shown on click. Simple CSS transition on piece movement. No drag-and-drop. |
| 6 | No sound effects for v1. |
| 7 | JWT stored in Zustand in-memory store. Sent as `Authorization: Bearer <token>` for HTTP and `auth.token` for Socket.IO. On page refresh the token is lost and the user re-authenticates. No cookies, no localStorage, no sessionStorage. |
| 8 | Use existing `GET /api/v1/users/me` endpoint for current-user fetch (requires valid token). |
| 9 | No mandatory 30-second post-game screen. Show game-end overlay immediately with navigation options (Home / History). |
| 10 | 30-second per-turn countdown displayed in the game UI. Backend is authoritative; frontend emits `moveTimeout` when countdown reaches zero. |
| 11 | React Router v7 for routing and protected routes. |
| 12 | No color selection UI — use backend-assigned color from `gameStarted`. |
| 13 | Private rooms: display 6-char code + copy button. Separate "Join Room" input on Home. No share links. |
| 14 | Profile page is view-only (name, username, email, DOB, profile image). Logout action accessible from profile. |
| 15 | No spectator mode, no draw offers in v1. |

---

## 2. Tech Stack

| Concern | Library | Version |
|---------|---------|---------|
| UI framework | React | 19 |
| Language | TypeScript | 5.x |
| Build tool | Vite | 6.x |
| Routing | react-router | 7.x |
| State management | zustand | 5.x |
| Styling | Tailwind CSS | 3.x |
| Chess logic | chess.js | 1.x |
| Real-time | socket.io-client | 4.x |
| HTTP client | fetch (native) | — |

**No additional UI libraries.** All components are custom Tailwind.

### Dependencies to install

```
npm install react-router socket.io-client chess.js
npm install -D @types/react-router
```

> `chess.js` ships its own types. `socket.io-client` ships its own types.

---

## 3. Project Structure

Feature-based architecture. Each product feature is self-contained under `feature/`.
Shared code lives in top-level `component/`, `hooks/`, `store/`, `services/`, and `utils/`.

```
src/
├── main.tsx                            # ReactDOM.createRoot, mount <App />
├── App.tsx                             # Router config + RouterProvider
├── index.css                           # Tailwind directives + global styles
│
├── feature/                            # Product features — each self-contained
│   ├── auth/
│   │   ├── component/
│   │   │   ├── OtpSendForm.tsx         # Email input + "Send OTP" button
│   │   │   ├── OtpVerifyForm.tsx       # 4-digit OTP input + verify
│   │   │   └── RegisterForm.tsx        # Username, name, DOB, profile image upload
│   │   ├── service.ts                  # sendOtp, verifyOtp, register API calls
│   │   ├── type.ts                     # User, auth response types
│   │   └── index.tsx                   # AuthPage (3-step OTP flow)
│   │
│   ├── home/
│   │   └── index.tsx                   # HomePage (matchmaking hub)
│   │
│   ├── matchmaking/
│   │   ├── component/
│   │   │   ├── QueueStatus.tsx         # "Searching for opponent…" with cancel
│   │   │   ├── RoomCodeDisplay.tsx     # Shows room code + copy button
│   │   │   └── JoinRoomForm.tsx        # 6-char code input + "Join" button
│   │   ├── store.ts                    # useMatchmakingStore (queue/room state)
│   │   └── index.ts                    # Barrel export (store + components)
│   │
│   ├── game/
│   │   ├── component/
│   │   │   ├── ChessBoard.tsx          # 8×8 board with click-to-move
│   │   │   ├── Square.tsx              # Single square — click, indicators
│   │   │   ├── Piece.tsx               # Renders Unicode piece symbol
│   │   │   ├── LegalMoveIndicator.tsx  # Dot / ring for legal moves
│   │   │   ├── PromotionModal.tsx      # Pick Q/R/B/N on pawn promotion
│   │   │   ├── TurnTimer.tsx           # 30-second countdown display
│   │   │   ├── PlayerBar.tsx           # Player name, color, active turn
│   │   │   ├── MoveList.tsx            # Scrollable SAN notation list
│   │   │   ├── GameEndOverlay.tsx      # Result banner + navigation
│   │   │   └── ResignButton.tsx        # Resign with confirmation modal
│   │   ├── hooks/
│   │   │   ├── useChessGame.ts         # chess.js instance, legal moves
│   │   │   └── useTurnTimer.ts         # 30s countdown from turnStartedAt
│   │   ├── store.ts                    # useGameStore (board, turn, timer, moves)
│   │   ├── type.ts                     # GameStatus, GameResult, PieceColor, socket payloads
│   │   └── index.tsx                   # GamePage
│   │
│   ├── history/
│   │   ├── component/
│   │   │   ├── GameHistoryCard.tsx     # Game summary (opponent, result, date)
│   │   │   └── MoveTable.tsx           # Full move list in detail view
│   │   ├── service.ts                  # listGames, getGameDetail API calls
│   │   ├── type.ts                     # Game, Move, Pagination, PlayerInfo
│   │   ├── HistoryPage.tsx             # Completed games list with pagination
│   │   ├── HistoryDetailPage.tsx       # Single game detail + moves
│   │   └── index.ts                    # Barrel export (both pages)
│   │
│   └── profile/
│       ├── component/
│       │   └── ProfileCard.tsx         # User info display (avatar, name, etc.)
│       ├── service.ts                  # getMe API call
│       └── index.tsx                   # ProfilePage (view-only + logout)
│
├── component/                          # Shared, reusable components
│   ├── ui/
│   │   ├── Button.tsx                  # Styled button with variants
│   │   ├── Input.tsx                   # Styled text input
│   │   ├── Modal.tsx                   # Centered overlay modal
│   │   ├── Spinner.tsx                 # Loading spinner
│   │   ├── ThemeToggle.tsx             # Dark/light mode toggle button
│   │   └── Avatar.tsx                  # Profile image circle with fallback
│   └── layout/
│       ├── AppLayout.tsx               # Shell with top bar + socket init
│       ├── TopBar.tsx                  # App name, profile icon, theme toggle
│       ├── ProtectedRoute.tsx          # Auth guard → /auth if no token
│       └── PublicRoute.tsx             # Guest guard → /home if token exists
│
├── hooks/                              # Shared hooks
│   └── useSocket.ts                    # Socket lifecycle + all event wiring
│
├── store/                              # Shared Zustand stores
│   ├── useAuthStore.ts                 # Auth state — token, user, login/logout
│   └── useThemeStore.ts                # Dark mode toggle (persisted to localStorage)
│
├── services/                           # Shared service layer
│   ├── api.ts                          # Fetch wrapper, ApiResponse type, ApiError class
│   └── socket.ts                       # Socket.IO client — connect, disconnect, getSocket
│
├── utils/                              # Shared pure utility functions
│   ├── constants.ts                    # API_BASE_URL, TURN_TIMEOUT_MS (from .env)
│   ├── chess.ts                        # Board helpers (square orientation, light/dark, piece symbols)
│   └── format.ts                       # Date formatting, result text helpers
│
└── assets/                             # Static assets
    ├── pieces/                         # Piece images (wp.png, bk.png, etc.)
    └── board/                          # Board background images
```

### Feature folder convention

Each feature folder follows this structure (files are optional if the feature doesn't need them):

```
feature/<name>/
├── component/     # Feature-specific components
├── hooks/         # Feature-specific hooks
├── service.ts     # Feature-specific API calls
├── type.ts        # Feature-specific TypeScript types
├── store.ts       # Zustand store (only if shared state is genuinely needed)
└── index.ts(x)    # Page component or barrel export
```

**Type ownership:**
- `feature/auth/type.ts` owns the `User` type (imported by profile, store)
- `feature/game/type.ts` owns enums (`GameStatus`, `GameResult`, `PieceColor`) and all socket event payload types
- `feature/history/type.ts` owns `Game`, `Move`, `Pagination`, `PlayerInfo` (API response shapes)
- `services/api.ts` owns `ApiResponse<T>` and `ApiError` (shared across all feature services)

---

## 4. Pages & Routes

| Path | Page Component | Auth | Description |
|------|---------------|------|-------------|
| `/auth` | `AuthPage` | Public only | OTP login / register flow |
| `/home` | `HomePage` | Protected | Matchmaking hub |
| `/game/:gameId` | `GamePage` | Protected | Active chess game |
| `/history` | `HistoryPage` | Protected | Completed games list |
| `/history/:gameId` | `HistoryDetailPage` | Protected | Single game detail + moves |
| `/profile` | `ProfilePage` | Protected | View-only profile + logout |
| `*` | — | — | Redirect to `/home` (authed) or `/auth` (guest) |

### Route Guards

**`ProtectedRoute`**: Checks `useAuthStore.token`. If null, redirect to `/auth`.

**`PublicRoute`**: Checks `useAuthStore.token`. If exists, redirect to `/home`.

> Since JWT is in-memory only, a page refresh clears auth and the user lands on `/auth`.

---

## 5. Component Inventory

### 5.1 ChessBoard (core component)

**Rendering approach:**
1. A container `div` maintains a 1:1 aspect ratio (responsive).
2. The custom board image (`board.png`) fills the container as a `background-image`.
3. An 8×8 CSS grid of transparent `Square` components overlays the board image.
4. Each `Square` renders:
   - A `Piece` component if a piece occupies that square (from chess.js board state).
   - A `LegalMoveIndicator` if the square is a legal destination for the selected piece.
5. Board orientation flips based on the player's assigned color (white = rank 1 at bottom, black = rank 8 at bottom).

**Click-to-move flow:**
1. Player clicks a square containing their piece → square is selected, legal moves for that piece are computed via `chess.js` and displayed as indicators.
2. Player clicks a legal destination square → move is emitted to the server via Socket.IO.
3. If the destination is the 8th/1st rank for a pawn → show `PromotionModal` first, then emit with `promotion` field.
4. Player clicks an invalid square or their own other piece → reselect or deselect.
5. On `moveMade` event from server → update chess.js instance with the move, re-render board. CSS transition animates the piece to its new position.

**State source:** The chess.js `Chess` instance is the single source of truth for board rendering. It is updated exclusively from server events (`gameStarted` FEN, `moveMade` FEN, `gameState` FEN).

### 5.2 TurnTimer

- Receives `turnStartedAt` (Unix ms) and `isMyTurn` from the game store.
- Computes remaining time: `30000 - (Date.now() - turnStartedAt)`.
- Runs a `setInterval` (100ms or 1s) decrementing a local state.
- Displays the countdown as seconds (e.g., "0:17").
- When timer reaches 0 and it is the current player's turn, emit `moveTimeout` event via socket.
- Resets on every `moveMade` / `gameStarted` / `gameState` event (new `turnStartedAt`).
- Visual urgency indicator when time < 10 seconds (red color / pulse).

### 5.3 GameEndOverlay

Shown when `gameEnded` event is received. Displays:
- Result text: "Checkmate — You Win!", "Checkmate — You Lose", "Stalemate — Draw", "Opponent Resigned — You Win!", "Timeout — You Win!" / "Timeout — You Lose".
- Determined by comparing `winnerId` to the current user's ID and the `result` field.
- Two buttons: "Home" (navigate `/home`) and "View History" (navigate `/history/:gameId`).

---

## 6. Zustand Stores

### 6.1 `useAuthStore`

```ts
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}
```

- `setAuth` is called after `verifyOtp` (existing user) or `register` (new user).
- `clearAuth` is called on logout and clears token + user. Socket disconnects via the `useSocket` hook reacting to token becoming null.
- `isAuthenticated` is derived: `token !== null && user !== null`.
- Token loss on refresh is expected — user re-authenticates via OTP.

### 6.2 `useGameStore`

```ts
interface GameState {
  gameId: string | null;
  fen: string | null;                // Current FEN from server
  myColor: "white" | "black" | null; // Assigned by gameStarted
  currentTurn: "white" | "black";
  turnStartedAt: number | null;      // Unix ms
  moveNumber: number;
  moves: MoveNotation[];             // SAN notation list for display
  whitePlayer: PlayerInfo | null;
  blackPlayer: PlayerInfo | null;
  status: "ACTIVE" | "COMPLETED" | "ABANDONED" | null;
  result: GameResult | null;
  winnerId: string | null;
  selectedSquare: string | null;     // Currently selected square (e.g., "e2")
  legalMoves: string[];              // Legal destination squares for selected piece
  isCheck: boolean;
  opponentConnected: boolean;
  lastMove: { from: string; to: string } | null;

  // Actions
  setGameStarted: (data: GameStartedPayload) => void;
  setMoveMade: (data: MoveMadePayload) => void;
  setGameEnded: (data: GameEndedPayload) => void;
  setGameState: (data: GameStatePayload) => void;
  selectSquare: (square: string | null) => void;
  setLegalMoves: (moves: string[]) => void;
  setOpponentConnected: (connected: boolean) => void;
  resetGame: () => void;
}
```

### 6.3 `useMatchmakingStore`

```ts
interface MatchmakingState {
  status: "idle" | "queuing" | "in-room-waiting" | "joining-room";
  roomCode: string | null;         // Code received from createRoom

  setQueuing: () => void;
  setIdle: () => void;
  setRoomCreated: (code: string) => void;
  setJoiningRoom: () => void;
  reset: () => void;
}
```

### 6.4 `useThemeStore`

```ts
interface ThemeState {
  dark: boolean;
  toggle: () => void;
}
```

- On toggle, add/remove `dark` class on `<html>` element.
- Persist preference to `localStorage` (theme preference only — not auth data).
- Initialize from `localStorage` or `prefers-color-scheme` media query.

---

## 7. API Service Layer

### 7.1 `api.ts` — Fetch Wrapper

```ts
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T>
```

- Prepends `API_BASE_URL` (from `constants.ts`, defaults to `http://localhost:3000`).
- Reads token from `useAuthStore.getState().token`.
- Sets `Authorization: Bearer <token>` header if token exists.
- Sets `Content-Type: application/json` for non-FormData requests.
- Parses JSON response. On non-2xx, throws an error with the backend's `message` field.
- On 401 response, calls `useAuthStore.getState().clearAuth()` to force re-login.

### 7.2 Endpoint Functions

**`authApi.ts`**
| Function | Method | Path | Request | Response |
|----------|--------|------|---------|----------|
| `sendOtp(email)` | POST | `/api/v1/auth/send-otp` | `{ email }` | `{ message }` |
| `verifyOtp(email, otp)` | POST | `/api/v1/auth/verify-otp` | `{ email, otp }` | `{ data: { token?, registrationToken?, user?, isNewUser } }` |
| `register(formData)` | POST | `/api/v1/auth/register` | `FormData` (registrationToken, username, name, dateOfBirth, profileImage?) | `{ data: { token, user } }` |

**`userApi.ts`**
| Function | Method | Path | Response |
|----------|--------|------|----------|
| `getMe()` | GET | `/api/v1/users/me` | `{ data: { user } }` |

**`gameApi.ts`**
| Function | Method | Path | Response |
|----------|--------|------|----------|
| `listGames(page, limit)` | GET | `/api/v1/games?page=N&limit=N` | `{ data: { games, pagination } }` |
| `getGameDetail(gameId)` | GET | `/api/v1/games/:gameId` | `{ data: { game, moves } }` |

---

## 8. Socket.IO Integration

### 8.1 Connection Lifecycle

Managed by the `useSocket` hook, used in `AppLayout`:

1. When `useAuthStore.token` becomes non-null → connect:
   ```ts
   io(API_BASE_URL, { auth: { token } })
   ```
2. When `token` becomes null (logout) → `socket.disconnect()`.
3. Socket.IO's built-in reconnection handles transient disconnects automatically.

### 8.2 Event Handlers

The `useSocket` hook registers all listeners on mount:

**Matchmaking events:**

| Server Event | Action |
|--------------|--------|
| `queueJoined` | `matchmakingStore.setQueuing()` |
| `queueLeft` | `matchmakingStore.setIdle()` |
| `roomCreated` | `matchmakingStore.setRoomCreated(code)` |
| `gameStarted` | `gameStore.setGameStarted(data)`, `matchmakingStore.reset()`, navigate to `/game/:gameId` |

**Game events:**

| Server Event | Action |
|--------------|--------|
| `moveMade` | `gameStore.setMoveMade(data)` — update chess.js, update store |
| `moveRejected` | Show a toast / inline error with the `reason` field |
| `gameEnded` | `gameStore.setGameEnded(data)` — show GameEndOverlay |
| `gameState` | `gameStore.setGameState(data)` — restore full board on reconnect |
| `opponentDisconnected` | `gameStore.setOpponentConnected(false)` — show indicator |
| `opponentReconnected` | `gameStore.setOpponentConnected(true)` — hide indicator |
| `error` | Show generic error toast |

### 8.3 Client Emits

| Client Event | Payload | Trigger |
|--------------|---------|---------|
| `joinQueue` | (none) | "Find Match" button |
| `leaveQueue` | (none) | "Cancel" during queue |
| `createRoom` | (none) | "Create Room" button |
| `joinRoom` | `{ code }` | "Join" button with room code input |
| `makeMove` | `{ gameId, from, to, promotion? }` | Click-to-move completes a legal move |
| `resign` | `{ gameId }` | Resign button (after confirmation) |
| `moveTimeout` | `{ gameId }` | Turn timer reaches zero on active player's turn |

---

## 9. Authentication Flow

### Step-by-step (3 stages in `AuthPage`)

```
Stage 1: SEND_OTP
  ┌─────────────────────────┐
  │  Enter your email        │
  │  [email input]           │
  │  [Send OTP]              │
  └─────────────────────────┘
         │ POST /api/v1/auth/send-otp
         │ Success → Stage 2
         ▼
Stage 2: VERIFY_OTP
  ┌─────────────────────────┐
  │  Enter the 4-digit code  │
  │  [OTP input]             │
  │  [Verify]                │
  └─────────────────────────┘
         │ POST /api/v1/auth/verify-otp
         │
         ├─ isNewUser: false → setAuth(token, user) → navigate /home
         │
         └─ isNewUser: true → save registrationToken → Stage 3
                │
                ▼
Stage 3: REGISTER
  ┌─────────────────────────┐
  │  Username                │
  │  Full Name               │
  │  Date of Birth           │
  │  Profile Image (optional)│
  │  [Create Account]        │
  └─────────────────────────┘
         │ POST /api/v1/auth/register (FormData)
         │ Success → setAuth(token, user) → navigate /home
```

### Error Handling

| Error | UX |
|-------|-----|
| Invalid email format | Inline validation before submit |
| OTP expired / incorrect | Show error below OTP input, allow retry |
| Registration token expired (10min) | Show message, restart from Stage 1 |
| Username taken (409) | Show error below username field |
| Email already registered (409) | Show error, restart from Stage 1 |
| Network error | Generic error message with retry |

---

## 10. Matchmaking Flow

### Home Page Layout

```
┌────────────────────────────────┐
│  TopBar (Checkmate | Profile)  │
├────────────────────────────────┤
│                                │
│   [  Find Match  ]             │  ← joinQueue
│                                │
│   ── or ──                     │
│                                │
│   [ Create Private Room ]      │  ← createRoom
│                                │
│   Enter Room Code              │
│   [ ______ ] [ Join ]          │  ← joinRoom
│                                │
│   [ Game History ]             │  ← navigate /history
│                                │
└────────────────────────────────┘
```

### State Transitions

```
idle ──[Find Match]──► queuing
  │                       │
  │                       ├──[Cancel]──► idle
  │                       └──[gameStarted]──► navigate /game/:gameId
  │
  ├──[Create Room]──► in-room-waiting
  │                       │
  │                       ├──[gameStarted]──► navigate /game/:gameId
  │                       └──(show code + copy)
  │
  └──[Join Room]──► joining-room
                          │
                          └──[gameStarted]──► navigate /game/:gameId
```

**Queue status overlay**: When `status === "queuing"`, show a centered overlay with "Searching for opponent…" spinner and a "Cancel" button.

**Room code display**: When `status === "in-room-waiting"`, show `RoomCodeDisplay` with the 6-char code and a copy-to-clipboard button. The user waits until an opponent joins and `gameStarted` fires.

---

## 11. Game Flow

### 11.1 Game Page Initialization

1. On mount, check `useGameStore.gameId`:
   - If set (navigated from matchmaking) → board is already initialized from `gameStarted`.
   - If null but URL has `:gameId` (page refresh / direct nav) → no active game state in memory → redirect to `/home`. (Reconnection is handled automatically by the socket: on reconnect the server emits `gameState`, which the `useSocket` hook processes to populate the game store and navigate back to `/game/:gameId`.)

### 11.2 Game Screen Layout

```
┌──────────────────────────────────────┐
│ TopBar                               │
├──────────────────────────────────────┤
│                                      │
│  [Opponent PlayerBar] [Timer: 0:23]  │
│                                      │
│  ┌──────────────────────────┐        │
│  │                          │        │
│  │     CHESS BOARD           │   [Move List]
│  │     (8×8 grid)           │   1. e4  e5
│  │                          │   2. Nf3 Nc6
│  │                          │   3. ...
│  └──────────────────────────┘        │
│                                      │
│  [Your PlayerBar]    [Timer: 0:30]   │
│                                      │
│  [Resign]                            │
│                                      │
└──────────────────────────────────────┘

Mobile: Move list collapses below the board.
```

### 11.3 Move Flow (Frontend Perspective)

```
1. Player clicks own piece on square "e2"
   → selectSquare("e2")
   → chess.moves({ square: "e2", verbose: true }) → get legal targets
   → setLegalMoves(["e3", "e4"])
   → Board renders LegalMoveIndicators on e3, e4

2. Player clicks "e4" (legal target)
   → Check if pawn promotion (piece is pawn, target is rank 8/1)
     → If yes: show PromotionModal, wait for selection
     → If no: proceed
   → socket.emit("makeMove", { gameId, from: "e2", to: "e4", promotion? })
   → selectSquare(null), setLegalMoves([])
   → Wait for server response (optimistic UI is NOT used — wait for moveMade)

3. Server validates → emits "moveMade" to room
   → gameStore.setMoveMade(data)
   → Update chess.js instance: chess.load(newFen) or chess.move(...)
   → Board re-renders with piece at new position (CSS transition)
   → Turn switches, timer resets

4. If server rejects → "moveRejected" event
   → Show reason as inline feedback
   → Board stays in previous state
```

### 11.4 Board Orientation

- If `myColor === "white"` → board rendered with rank 1 at bottom (a1 = bottom-left).
- If `myColor === "black"` → board rendered with rank 8 at bottom (a8 = bottom-left, flipped).
- The 8×8 grid mapping adjusts based on orientation. The board image stays fixed; the grid overlay flips.

### 11.5 Special States

| State | Visual |
|-------|--------|
| Opponent disconnected | Banner: "Opponent disconnected — waiting for reconnection…" |
| Opponent reconnected | Banner disappears |
| Check | King square highlighted (red tint or border) |
| Game ended | `GameEndOverlay` appears on top of board |

### 11.6 Resign Flow

1. Player clicks "Resign" button.
2. A confirmation modal appears: "Are you sure you want to resign?"
3. On confirm → `socket.emit("resign", { gameId })`.
4. Server processes → emits `gameEnded` with `result: "RESIGNATION"` and `winnerId` = opponent.
5. `GameEndOverlay` shows "You Resigned — Opponent Wins".

---

## 12. Game History Flow

### 12.1 History List Page (`/history`)

- On mount → call `listGames(page=1, limit=10)`.
- Render a scrollable list of `GameHistoryCard` components.
- Each card shows:
  - Opponent name + avatar (determine opponent by comparing `whitePlayerId` / `blackPlayerId` to current user)
  - Result badge: "Win" (green), "Loss" (red), "Draw" (gray)
  - Result type: Checkmate, Resignation, Timeout, Draw
  - Total moves count
  - Date/time (formatted from `endedAt`)
  - Player's color (small white/black circle indicator)
- Pagination: "Load More" button or infinite scroll (simple pagination with page increment).
- Click a card → navigate to `/history/:gameId`.

### 12.2 History Detail Page (`/history/:gameId`)

- On mount → call `getGameDetail(gameId)`.
- Display:
  - Game summary header (same info as the card: players, result, date)
  - Full move table: move number | white's move (SAN) | black's move (SAN)
  - Ordered by `moveNumber` ascending.
  - Moves are laid out in a 2-column format per row (standard chess notation style).
- Back button → navigate to `/history`.

---

## 13. Dark Mode

### Strategy

- Tailwind's `class` strategy: dark mode activates when `<html class="dark">` is present.
- `useThemeStore` manages the `dark` boolean, persisted in `localStorage("theme")`.
- On app init, read `localStorage("theme")`. If absent, check `window.matchMedia("(prefers-color-scheme: dark)")`.
- `ThemeToggle` button in `TopBar` calls `useThemeStore.toggle()`.

### tailwind.config.js update

```js
darkMode: "class"
```

### Color approach

Define a minimal set of semantic color variables using Tailwind classes:

| Token | Light | Dark |
|-------|-------|------|
| Background | `bg-gray-50` | `dark:bg-gray-900` |
| Surface | `bg-white` | `dark:bg-gray-800` |
| Text primary | `text-gray-900` | `dark:text-gray-100` |
| Text secondary | `text-gray-600` | `dark:text-gray-400` |
| Border | `border-gray-200` | `dark:border-gray-700` |
| Primary accent | `bg-indigo-600` | `dark:bg-indigo-500` |
| Danger | `bg-red-600` | `dark:bg-red-500` |
| Success | `bg-green-600` | `dark:bg-green-500` |

---

## 14. Responsive Design

### Breakpoint Strategy

| Breakpoint | Target | Board Size |
|------------|--------|------------|
| `< 640px` (mobile) | Phone portrait | `min(100vw - 2rem, 100vh - navHeight - playerBars)` |
| `640px–1024px` (tablet) | Tablet / landscape | `min(60vw, 100vh - navHeight - playerBars)` |
| `> 1024px` (desktop) | Desktop | Fixed `min(560px, 60vh)` |

### Board Aspect Ratio

The board container uses:
```css
aspect-ratio: 1 / 1;
width: min(var(--board-size), 100%);
```

This guarantees the board is always square regardless of viewport.

### Layout Shifts

| Element | Mobile | Desktop |
|---------|--------|---------|
| Board | Full width, centered | Left side of a 2-column layout |
| Move list | Below board (collapsible) | Right side of board |
| Player bars | Above/below board (narrow) | Above/below board (wider with more info) |
| Home page buttons | Stacked vertically, full width | Centered card with fixed width |

---

## 15. Phased Build Order

### Phase 1: Foundation

**Goal:** Project skeleton with routing, auth, and theme.

| Step | Task | Key Files |
|------|------|-----------|
| 1.1 | Install remaining deps (`react-router`, `socket.io-client`, `chess.js`) | `package.json` |
| 1.2 | Set up TypeScript types for all backend entities and socket events | `src/types/*` |
| 1.3 | Set up constants and api fetch wrapper | `src/utils/constants.ts`, `src/services/api.ts` |
| 1.4 | Create `useAuthStore` | `src/stores/useAuthStore.ts` |
| 1.5 | Create `useThemeStore` + dark mode init + `tailwind.config.js` update | `src/stores/useThemeStore.ts` |
| 1.6 | Build UI primitives: Button, Input, Modal, Spinner, Avatar, ThemeToggle | `src/components/ui/*` |
| 1.7 | Build AppLayout + TopBar | `src/components/layout/*` |
| 1.8 | Set up React Router with ProtectedRoute / PublicRoute guards | `src/routes/*`, `src/App.tsx` |
| 1.9 | Build auth API functions | `src/services/authApi.ts` |
| 1.10 | Build AuthPage (OtpSendForm → OtpVerifyForm → RegisterForm) | `src/pages/AuthPage.tsx`, `src/components/auth/*` |

**Milestone:** User can authenticate and land on a protected Home page (placeholder).

---

### Phase 2: Home & Matchmaking

**Goal:** Home screen with matchmaking, Socket.IO connection.

| Step | Task | Key Files |
|------|------|-----------|
| 2.1 | Set up Socket.IO client + `useSocket` hook | `src/services/socket.ts`, `src/hooks/useSocket.ts` |
| 2.2 | Create `useMatchmakingStore` | `src/stores/useMatchmakingStore.ts` |
| 2.3 | Build Home page components: QuickPlayButton, CreateRoomButton, RoomCodeDisplay, JoinRoomForm, QueueStatus | `src/components/home/*` |
| 2.4 | Build HomePage with all matchmaking flows | `src/pages/HomePage.tsx` |
| 2.5 | Wire socket matchmaking events (joinQueue, leaveQueue, createRoom, joinRoom, gameStarted) | `src/hooks/useSocket.ts` |
| 2.6 | Navigate to `/game/:gameId` on `gameStarted` | Router integration |

**Milestone:** Two users can match via queue or private room and are navigated to the game page.

---

### Phase 3: Chess Game

**Goal:** Fully playable chess game.

| Step | Task | Key Files |
|------|------|-----------|
| 3.1 | Create `useGameStore` | `src/stores/useGameStore.ts` |
| 3.2 | Build `useChessGame` hook (chess.js instance, legal move computation) | `src/hooks/useChessGame.ts` |
| 3.3 | Add piece assets (SVG/PNG for all 12 pieces: wp, wn, wb, wr, wq, wk, bp, bn, bb, br, bq, bk) | `src/assets/pieces/*` |
| 3.4 | Add custom board background image | `src/assets/board.png` |
| 3.5 | Build Square, Piece, LegalMoveIndicator components | `src/components/game/*` |
| 3.6 | Build ChessBoard — 8×8 grid with board image, orientation support, click-to-move | `src/components/game/ChessBoard.tsx` |
| 3.7 | Build PromotionModal | `src/components/game/PromotionModal.tsx` |
| 3.8 | Build PlayerBar | `src/components/game/PlayerBar.tsx` |
| 3.9 | Build MoveList (in-game notation display) | `src/components/game/MoveList.tsx` |
| 3.10 | Build `useTurnTimer` hook + TurnTimer component | `src/hooks/useTurnTimer.ts`, `src/components/game/TurnTimer.tsx` |
| 3.11 | Build ResignButton with confirmation modal | `src/components/game/ResignButton.tsx` |
| 3.12 | Build GameEndOverlay | `src/components/game/GameEndOverlay.tsx` |
| 3.13 | Build GamePage — compose all game components | `src/pages/GamePage.tsx` |
| 3.14 | Wire socket game events (moveMade, moveRejected, gameEnded, gameState, opponentDisconnected/Reconnected) | `src/hooks/useSocket.ts` |
| 3.15 | Handle reconnection: server auto-sends `gameState` → restore board | Game store + socket hook |
| 3.16 | Responsive layout: board + side panel (desktop), board + stacked (mobile) | Tailwind classes |

**Milestone:** Two users can play a full chess game with timer, resignation, promotion, and game-end handling.

---

### Phase 4: History & Profile

**Goal:** View past games and user profile.

| Step | Task | Key Files |
|------|------|-----------|
| 4.1 | Build game API functions (listGames, getGameDetail) | `src/services/gameApi.ts` |
| 4.2 | Build user API function (getMe) | `src/services/userApi.ts` |
| 4.3 | Build GameHistoryCard | `src/components/history/GameHistoryCard.tsx` |
| 4.4 | Build HistoryPage with pagination | `src/pages/HistoryPage.tsx` |
| 4.5 | Build MoveTable for detail view | `src/components/history/MoveTable.tsx` |
| 4.6 | Build HistoryDetailPage | `src/pages/HistoryDetailPage.tsx` |
| 4.7 | Build ProfileCard + ProfilePage with logout | `src/pages/ProfilePage.tsx`, `src/components/profile/ProfileCard.tsx` |

**Milestone:** User can view game history, drill into game details, view profile, and log out.

---

### Phase 5: Polish

**Goal:** Final quality pass.

| Step | Task |
|------|------|
| 5.1 | Dark mode audit — verify all pages/components render correctly in both themes |
| 5.2 | Responsive audit — test all pages on mobile (375px), tablet (768px), desktop (1440px) |
| 5.3 | Error state handling — network errors, 401 token expiry mid-game, socket disconnect UX |
| 5.4 | Loading states — skeleton/spinner for every async operation |
| 5.5 | Edge cases — double-click prevention on moves, resign during promotion modal, back-button during game |
| 5.6 | Accessibility basics — keyboard navigation, focus indicators, aria labels on interactive elements |

**Milestone:** Production-ready v1.

---

## Appendix: Backend API Quick Reference

### REST Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | No | Health check |
| POST | `/api/v1/auth/send-otp` | No | Send 4-digit OTP to email |
| POST | `/api/v1/auth/verify-otp` | No | Verify OTP, get token or registrationToken |
| POST | `/api/v1/auth/register` | No (registrationToken in body) | Register new user (multipart/form-data) |
| GET | `/api/v1/users/me` | Bearer | Get current user |
| PUT | `/api/v1/users/me` | Bearer | Update profile fields |
| PUT | `/api/v1/users/me/profile-image` | Bearer | Upload profile image |
| GET | `/api/v1/games` | Bearer | List completed games (paginated) |
| GET | `/api/v1/games/:gameId` | Bearer | Game detail + moves |
| GET | `/uploads/:filename` | No | Serve uploaded profile images |

### Socket.IO Events

| Direction | Event | Payload |
|-----------|-------|---------|
| C→S | `joinQueue` | (none) |
| C→S | `leaveQueue` | (none) |
| C→S | `createRoom` | (none) |
| C→S | `joinRoom` | `{ code }` |
| C→S | `makeMove` | `{ gameId, from, to, promotion? }` |
| C→S | `resign` | `{ gameId }` |
| C→S | `moveTimeout` | `{ gameId }` |
| S→C | `queueJoined` | (none) |
| S→C | `queueLeft` | (none) |
| S→C | `roomCreated` | `{ code }` |
| S→C | `gameStarted` | `{ gameId, whitePlayerId, blackPlayerId, fen, yourColor, turnStartedAt }` |
| S→C | `moveMade` | `{ gameId, from, to, piece, capturedPiece, promotion, notation, fen, moveNumber, currentTurn, isCheck, turnStartedAt }` |
| S→C | `moveRejected` | `{ gameId, reason }` |
| S→C | `gameEnded` | `{ gameId, status, result, winnerId }` |
| S→C | `gameState` | `{ gameId, fen, whitePlayerId, blackPlayerId, currentTurn, turnStartedAt, moveNumber, status, lastMove }` |
| S→C | `opponentDisconnected` | `{ gameId }` |
| S→C | `opponentReconnected` | `{ gameId }` |
| S→C | `error` | `{ message }` |

### Data Models

**User:** `_id, username, name, email, dateOfBirth, profileImage, createdAt, updatedAt`

**Game:** `_id, whitePlayerId, blackPlayerId, winnerId, status, result, startedAt, endedAt, totalMoves, createdAt, updatedAt`

**Move:** `_id, gameId, moveNumber, playerId, from, to, piece, capturedPiece, promotion, notation, createdAt, updatedAt`

### Enums

- **GameStatus:** `ACTIVE`, `COMPLETED`, `ABANDONED`
- **GameResult:** `CHECKMATE`, `RESIGNATION`, `TIMEOUT`, `DRAW`
- **PieceColor:** `white`, `black`
