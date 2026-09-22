# Checkmate Game Frontend — Product Requirements & Technical Decisions

This document is the single source of truth for **what** the Checkmate frontend
does. Any implementation work must conform to it.

- [UI_SPECIFICATION.md](UI_SPECIFICATION.md) — **how** it looks and behaves:
  design tokens, layout, screen-by-screen visual and interaction spec. It is
  subordinate to this document; where the two conflict, this one wins.
- [CLAUDE.md](CLAUDE.md) — the working agreement that enforces both.

---

## 1. Product Scope

The frontend provides:

- Welcome screen
- Authentication using email OTP
- New-user profile setup
- Home screen
- Play Online — matched with a random opponent
- Play Bot — single-player against the server bot
- Play with Friend — create a room, or join one by code
- Real-time chess game
- 30-second per-turn timer
- Game result screen
- Completed game history
- Game detail with move history

---

## 2. Product Requirements

### 2.1 Welcome

**Route:** `/`

Display:

- Checkmate branding
- **Start Playing** button

On **Start Playing**:

| User state      | Destination |
| --------------- | ----------- |
| Authenticated   | `/home`     |
| Unauthenticated | `/auth`     |

No API request is required to render the welcome screen.

### 2.2 Authentication

**Route:** `/auth`

Flow:

```
Enter Email
    ↓
Send OTP
    ↓
Enter OTP
    ↓
Verify OTP
```

**Existing user:**

```
OTP verified → JWT → /home
```

**New user:**

```
OTP verified
    ↓
Profile setup
    ↓
Register
    ↓
JWT
    ↓
/home
```

New-user profile fields:

- Username
- Name
- Date of birth
- Profile image

The access token is stored by the frontend and attached to authenticated API
requests and Socket.IO authentication.

It is persisted to `localStorage`, so the session survives a page refresh. On
boot the stored token is validated before any protected route renders — see
[IMPLEMENTATION_PLAN.md §17](IMPLEMENTATION_PLAN.md).

### 2.3 Home

**Route:** `/home`

Actions:

- Play Online
- Play Bot
- Play with Friend
- Profile (where game history lives — §6)

No player lobby or online-player list.

### 2.4 Play Online

User selects **Play Online**.

The frontend connects to the authenticated Socket.IO connection and emits:

```
joinQueue
```

Waiting state:

```
Finding an opponent...
```

When the backend matches two players, it emits:

```
gameStarted
```

The frontend navigates both players to `/game/:gameId`.

The `gameStarted` payload provides the initial game state required to render the
board.

### 2.5 Play with Friend

User selects **Play with Friend**, which replaces the Home menu with the create
/ join view.

Screen provides:

```
Create Room

OR

Enter Room Code
[________]
[Join]
```

**Create Room**

Frontend emits:

```
createRoom
```

Backend returns:

- `gameId`
- `roomCode`

Display the room code and waiting state.

**Join Room**

User enters the room code. Frontend emits:

```
joinRoom
```

When the second player joins, both clients receive `gameStarted` and both
navigate to `/game/:gameId`.

### 2.6 Play Bot

User selects **Play Bot**. The frontend emits:

```
startBotGame
```

The backend creates a single-player game against its bot user and replies with
`gameStarted`, carrying `mode: "BOT"` and `botPlayerId`. There is no waiting
state — nothing is being matched — so the player goes straight to
`/game/:gameId`.

Bot games are ordinary games in every other respect: the bot is a real user, its
reply arrives as a second `moveMade`, and the move, timer, promotion, resign and
reconnect rules in §3 apply unchanged. See
[IMPLEMENTATION_PLAN.md §16](IMPLEMENTATION_PLAN.md).

---

## 3. Chess Game

**Route:** `/game/:gameId`

### 3.1 Game UI

The game screen contains:

- Player information
- Opponent information
- 30-second turn timer
- Chess board
- Game status
- Resign action
- Connection status

The board uses:

- Board background/image
- Chess coordinates
- Chess piece layer
- Transparent 8×8 interaction grid

Standard chess coordinates:

```
a–h
1–8
```

Each square has a coordinate key:

```
a8
b8
...
h1
```

The board must remain square and the interaction grid must match the board
dimensions.

### 3.2 Chess Pieces

Chess piece assets are **frontend-owned static assets**.

**Location:** `src/assets/`

```
src/assets/
├── checkmate-logo.svg   app mark
├── board/
│   ├── board.png        8×8 board image (#EBECD0 light / #739552 dark)
│   └── background.png   navy backdrop — unused (see UI §3.1)
└── pieces/
    ├── wk.png  wq.png  wr.png  wb.png  wn.png  wp.png
    └── bk.png  bq.png  br.png  bb.png  bn.png  bp.png
```

Piece filenames follow `{color}{type}.png`:

| | king | queen | rook | bishop | knight | pawn |
| --- | --- | --- | --- | --- | --- | --- |
| **white** (`w`) | `wk` | `wq` | `wr` | `wb` | `wn` | `wp` |
| **black** (`b`) | `bk` | `bq` | `br` | `bb` | `bn` | `bp` |

This is the same encoding `chess.js` uses for a piece (`{ color, type }`), so
the frontend maps `color + piece` to its asset by direct template rather than a
lookup table:

```
src/assets/pieces/${color}${type}.png
```

The backend sends chess state, **not** chess-piece image URLs.

### 3.3 Board State

- The backend provides the authoritative FEN.
- The frontend uses the FEN to render the current board.
- Frontend `chess.js` is used for:
  - Legal move calculation
  - Possible-move indicators
  - Local move interaction
  - Promotion handling
- The backend independently validates every submitted move.

### 3.4 Selecting a Piece

When a player selects one of their pieces:

1. Verify it belongs to the current player.
2. Verify it is the player's turn.
3. Use `chess.js` to calculate legal moves.
4. Display possible destinations.
5. Allow the player to select a legal destination.

Possible moves are displayed using the board's move-indicator UI.

### 3.5 Making a Move

When the player selects a destination, the following are sent through Socket.IO
via `makeMove`:

```
from
to
gameId
```

The frontend **must not** assume the move succeeded.

While the move is awaiting backend confirmation:

- Disable additional move interaction for that move.
- Wait for `moveMade` or `moveRejected`.

**On `moveMade`:**

- Update FEN
- Update board
- Update turn
- Update move number
- Update last move
- Reset the displayed 30-second timer

**On `moveRejected`:**

- Keep the authoritative board state
- Clear the pending move
- Display the relevant error state

### 3.6 Board Orientation

| Player | Orientation           |
| ------ | --------------------- |
| White  | White pieces at bottom |
| Black  | Black pieces at bottom |

The board coordinates must rotate consistently with the board orientation.

### 3.7 Turn Timer

- Each player has 30 seconds for their turn.
- The frontend displays the countdown.
- The backend provides the authoritative `turnStartedAt`.
- The frontend calculates the displayed countdown from the current turn start
  time.
- When the displayed timer reaches zero, the frontend emits `moveTimeout`.
- The backend validates the actual elapsed time before ending the game.
- The frontend receives `gameEnded` and displays the result.

### 3.8 Game End States

The frontend handles:

- Checkmate
- Stalemate
- Resignation
- Timeout

When `gameEnded` is received:

1. Disable board interaction.
2. Stop the timer.
3. Display the result.
4. Provide navigation to Home and/or History.

### 3.9 Resignation

Player selects **Resign**. Frontend emits `resign`. The backend determines the
result and broadcasts `gameEnded`.

---

## 4. Real-Time Communication

Socket.IO is used for active-game communication.

**Client → Server events**

```
joinQueue
leaveQueue

createRoom
joinRoom

joinGame

makeMove
resign
moveTimeout
```

**Server → Client events**

```
queueJoined
queueLeft

gameStarted

moveMade
moveRejected

gameState

gameEnded

opponentDisconnected
opponentReconnected

error
```

### 4.1 Socket Lifecycle

- A single authenticated Socket.IO connection is maintained for the
  authenticated application session.
- The connection is **not** recreated on every component render.
- Game screens join the relevant game room: `game:{gameId}`.
- The frontend subscribes to Socket.IO events through a game socket hook/service
  rather than directly implementing socket logic inside the board component.

### 4.2 Reconnection

When the socket disconnects during an active game, display:

```
Connection lost
Reconnecting...
```

Do not allow new moves while the game state is unavailable.

After reconnection:

1. Re-authenticate the socket.
2. Identify the active game.
3. Rejoin the game room.
4. Request the current game state.
5. Replace the local board state with the authoritative state.
6. Resume interaction when synchronized.

Supported server events:

```
opponentDisconnected
opponentReconnected
gameState
```

---

## 5. Offline / Local Recovery

Persist the latest known game snapshot locally:

```
gameId
lastKnownFEN
lastMove
currentTurn
```

When connectivity is unavailable during an active game:

1. Freeze board interaction.
2. Preserve the latest local game state.
3. Reconnect.
4. Synchronize with the backend.
5. Replace local state with the authoritative game state.
6. Resume the game.

**Do not submit stale chess moves after reconnection.**

---

## 6. Profile & History

**Route:** `/profile`

The profile page shows the authenticated player's account and, beneath it, their
completed games. There is no separate history list route — `/history` redirects
to `/profile`, so older links still resolve.

### 6.1 Profile

Displays, from the data the backend exposes on the user:

- Profile image (or initials)
- Username
- Name
- Joined date
- Email and date of birth
- Log out action

The page is view-only; there is no profile editing (§17).

### 6.2 Game history

Displays completed games for the authenticated player, with a total count in the
panel header. Each item displays relevant game information such as:

- Opponent
- Result
- Date
- Move count

Selecting a game opens `/history/:gameId`, which remains its own route.

When the player has no completed games, the panel shows an empty state rather
than an empty list.

### 6.3 Game detail

**Route:** `/history/:gameId`

Game details display:

- Players
- Result
- Complete move sequence
  - Move number
  - Player moves
  - Opponent moves

REST endpoints:

```
GET /games
GET /games/:gameId
```

---

## 7. Frontend State Management

Use **Zustand** for application and game state.

Suggested stores:

```
src/stores/
├── authStore.js
├── gameStore.js
└── connectionStore.js
```

**Auth Store**

```
user
accessToken
isAuthenticated
```

**Game Store**

```
gameId
fen
currentTurn
myColor
opponent
selectedSquare
possibleMoves
lastMove
moveNumber
gameStatus
pendingMove
```

**Connection Store**

```
socketStatus
isReconnecting
```

Chess rules remain in `chess.js`; Zustand stores application state and UI state.

---

## 8. API Architecture

The API integration layer is **fully separated from the UI layer**. A UI
component never performs a request, never names an endpoint, and never imports
the HTTP client.

```
UI Component                    features/<feature>/components/*
    ↓  consumes only { data, loading, error, actions }
Feature Service Hook            features/<feature>/hooks/use<Feature>Service.ts
    ↓  calls the centralised hook, once per endpoint
useApiRequest                   src/hooks/useApiRequest.ts
    ↓  resolves an endpoint descriptor, owns request state
Feature Service                 features/<feature>/services/<feature>.service.ts
    ↓  endpoint paths + request shapes only
apiClient                       src/services/apiClient.ts
    ↓  axios instance: base URL, auth header, error normalisation
Backend REST API
```

Each layer may only talk to the one directly beneath it. Skipping a layer —
a component calling `useApiRequest`, or a feature hook importing `apiClient` —
is a defect.

### 8.0 Layer Responsibilities

| Layer | File | Owns | Must not |
| --- | --- | --- | --- |
| Feature Service Hook | `features/<f>/hooks/use<F>Service.ts` | Exposing `data`/`loading`/`error` and named actions to the feature; mapping responses into store or component shape | Build URLs; import `axios` or `apiClient` |
| Centralised hook | `src/hooks/useApiRequest.ts` | Request lifecycle, `data`/`loading`/`error` state, cancellation on unmount, retry, dedupe | Know any specific endpoint |
| Feature Service | `features/<f>/services/<f>.service.ts` | Every endpoint that feature can call, as descriptors | Hold React state; call `apiClient` itself |
| API client | `src/services/apiClient.ts` | Base URL, auth token injection, response unwrapping, error normalisation | Know any feature |

### 8.1 Environment Configuration

Base API URL is defined in `.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Feature services must only define endpoint paths:

```
/games
/games/:gameId
/auth/send-otp
/auth/verify-otp
```

**Do not hardcode the complete backend URL inside feature services.**

### 8.2 Central API Client

Create `src/services/apiClient.ts`.

Responsibilities:

- Configure base URL from `VITE_API_BASE_URL`
- Attach the authentication token to every authenticated request
- Centralize request configuration
- Normalize responses and errors into one shape, so every layer above sees the
  same error object regardless of what the backend returned

Axios is the HTTP client.

```
npm install axios
```

This module is imported **only** by `useApiRequest`. Nothing else in the
codebase may import it.

### 8.3 Feature Services

Each feature owns one service file listing **every** endpoint that feature can
call. Endpoints are declared as descriptors, not as executed requests — the
service is a catalogue, and has no React state and no side effects.

```
features/
└── history/
    └── services/
        └── history.service.ts
```

```ts
// features/history/services/history.service.ts
export const historyService = {
  getGames:    ()       => ({ method: 'GET', url: '/games' }),
  getGameById: (gameId) => ({ method: 'GET', url: `/games/${gameId}` }),
};
```

| Feature | Service | Endpoints |
| --- | --- | --- |
| `auth` | `auth.service.ts` | `sendOtp`, `verifyOtp`, `register` |
| `history` | `history.service.ts` | `getGames`, `getGameById` |
| `game` | `game.service.ts` | REST-based game endpoints only |

Services define **paths only**, never the full backend URL (§8.1).

Live gameplay uses Socket.IO, not REST (§10).

### 8.4 Centralized API Hook

Create `src/hooks/useApiRequest.ts`. This is the single place any REST request
is actually issued from.

```ts
const { data, loading, error, execute, reset } = useApiRequest(endpoint, options);
```

| Returns | Meaning |
| --- | --- |
| `data` | The normalized response body, `null` until the first success |
| `loading` | A request is in flight |
| `error` | Normalized error, `null` when there is none |
| `execute(args)` | Runs the endpoint with `args`; resolves with the result |
| `reset()` | Clears `data` and `error` |

| Options | Meaning |
| --- | --- |
| `immediate` | Fire once on mount instead of waiting for `execute` |
| `onSuccess` / `onError` | Callbacks for side effects such as store updates |

It also owns request cancellation on unmount, so a resolved request never sets
state on an unmounted component.

It is generic over the endpoint and knows nothing about any feature. It is
imported **only** by feature service hooks.

---

## 9. Feature Service Hooks

API state is exposed to the UI through feature-level service hooks — one hook
per feature, wrapping that feature's endpoints via `useApiRequest`.

```ts
// features/history/hooks/useHistoryService.ts
export function useHistoryService() {
  const games = useApiRequest(historyService.getGames);
  const game  = useApiRequest(historyService.getGameById);

  return {
    games: games.data,
    gamesLoading: games.loading,
    gamesError: games.error,
    fetchGames: games.execute,

    game: game.data,
    gameLoading: game.loading,
    gameError: game.error,
    fetchGameById: game.execute,
  };
}
```

A service hook provides:

```
data
loading
error
request/action functions
```

UI components consume the hook and render exactly one of:

```
loading → Loader
error   → ErrorState
empty   → EmptyState
data    → Content
```

### 9.1 Rules

1. **A UI component must never call an API directly.** No `axios`, no
   `apiClient`, no `useApiRequest`, and no endpoint string inside a component.
   A component's only API surface is its feature's service hook.
2. **One service file per feature**, listing all of that feature's endpoints.
3. **All requests go through `useApiRequest`.** A feature hook must not issue a
   request by any other route.
4. **Cross-feature access goes through the owning feature's hook**, not by
   importing another feature's service.

---

## 10. Socket Service Architecture

Create `src/services/socket.ts`.

Responsibilities:

- Create the Socket.IO client
- Connect/authenticate
- Disconnect
- Emit events
- Register/remove event listeners

Game feature hook: `features/game/hooks/useGameSocket.ts`

Responsibilities:

- Subscribe to game events
- Update Zustand game state
- Expose game actions to the feature
- Handle connection/reconnection state

---

## 11. Feature Structure

Use feature-based organization.

```
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers/
│
├── assets/
│   ├── board/                        # board.png, background.png
│   └── pieces/                       # wk…wp, bk…bp  (§3.2)
│
├── components/                       # shared UI only  (§12)
│   ├── AppShell/
│   ├── Button/
│   ├── IconButton/
│   ├── Input/
│   ├── OtpInput/
│   ├── Modal/
│   ├── Loader/
│   ├── ErrorState/
│   ├── EmptyState/
│   ├── Card/
│   └── Avatar/
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── useAuthService.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── utils/
│   │   └── index.ts
│   │
│   ├── home/
│   │   ├── components/
│   │   └── index.ts
│   │
│   ├── matchmaking/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── useMatchmakingSocket.ts
│   │   └── index.ts
│   │
│   ├── game/
│   │   ├── components/
│   │   │   ├── ChessBoard/
│   │   │   ├── ChessSquare/
│   │   │   ├── ChessPiece/
│   │   │   ├── BoardCoordinates/
│   │   │   ├── MoveIndicator/
│   │   │   ├── PromotionDialog/
│   │   │   ├── PlayerInfo/
│   │   │   ├── CapturedPieces/
│   │   │   ├── GameTimer/
│   │   │   ├── MoveList/
│   │   │   ├── GameControls/
│   │   │   ├── ConnectionStatus/
│   │   │   └── GameResult/
│   │   ├── hooks/
│   │   │   ├── useChessGame.ts
│   │   │   ├── useGameSocket.ts
│   │   │   ├── useGameTimer.ts
│   │   │   └── useGameService.ts
│   │   ├── services/
│   │   │   └── game.service.ts
│   │   ├── utils/
│   │   └── index.ts
│   │
│   └── history/
│       ├── components/
│       ├── hooks/
│       │   └── useHistoryService.ts
│       ├── services/
│       │   └── history.service.ts
│       └── index.ts
│
├── hooks/
│   └── useApiRequest.ts              # centralised API hook  (§8.4)
│
├── services/
│   ├── apiClient.ts                  # axios transport  (§8.2)
│   └── socket.ts                     # Socket.IO client  (§10)
│
├── stores/
│   ├── authStore.ts
│   ├── gameStore.ts
│   └── connectionStore.ts
│
├── utils/
│   ├── storage.ts
│   └── constants.ts
│
└── styles/
    └── index.css
```

---

## 12. Shared Components

Common reusable UI components:

```
AppShell
Button
IconButton
Input
OtpInput
Modal
Loader
ErrorState
EmptyState
Card
Avatar
```

Each is specified in [UI_SPECIFICATION.md §4](UI_SPECIFICATION.md).

Feature-specific components remain inside their feature — e.g.
`features/game/components/ChessBoard` rather than putting game-specific
components in the global `components/` directory.

---

## 13. Styling

Use **Tailwind CSS**.

Use reusable shared components for repeated UI patterns:

```jsx
<Button variant="primary">
    Play Online
</Button>
```

Visual tokens — colour, typography, spacing, radius, elevation, motion — are
defined once in [UI_SPECIFICATION.md §2](UI_SPECIFICATION.md) and declared in
`tailwind.config.js` under `theme.extend`. Components consume them as Tailwind
utilities and must not use raw hex values.

Feature-specific styling remains within the feature.

---

## 14. Frontend Dependencies

Required:

```
npm install react-router-dom socket.io-client chess.js zustand axios
```

The existing Tailwind CSS setup is retained.

The frontend does **not** install or use:

- Redis client
- MongoDB client
- Mongoose
- Express
- Backend JWT libraries

---

## 15. Frontend Communication Model

```
                         React Frontend
                              │
              ┌───────────────┴────────────────┐
              │                                │
          REST API                         Socket.IO
              │                                │
      Feature Service Hooks            Game Socket Hook
              │                                │
        useApiRequest                          │
              │                                │
       Feature Services                        │
              │                                │
         apiClient                         socket.ts
              │                                │
              └───────────────┬────────────────┘
                              ↓
                           Backend
```

State flow:

```
REST response
     ↓
apiClient (normalize)
     ↓
useApiRequest (data / loading / error)
     ↓
Feature Service Hook
     ↓
Zustand / component state
     ↓
UI
```

```
Socket event
     ↓
Game Socket Hook
     ↓
Zustand Game Store
     ↓
Chess Board / Timer / Game UI
```

The frontend does not communicate directly with Redis or MongoDB.

---

## 16. Current Repository State

The app is built and runs. Auth, home, matchmaking, game, history and profile
all exist, `npm run build` passes, and the dark theme in
[UI_SPECIFICATION.md §2](UI_SPECIFICATION.md) is implemented as Tailwind tokens.

**Assets are done.** All 12 pieces were visually verified and renamed to the
§3.2 convention, the board and backdrop images were separated, the misspelled
`src/assests/` directory was corrected, and `checkmate-logo.svg` was added.

### 16.1 Known divergences from this document

The code was written before parts of this spec and does not yet match it. These
are recorded rather than silently fixed; each needs its own change.

| This document says | The code does |
| --- | --- |
| `src/components/`, `src/features/`, `src/stores/` (§11) | `src/component/`, `src/feature/`, `src/store/` — all singular |
| `src/app/App.tsx` + `routes.tsx` (§11) | `src/App.tsx` holds the router; no `app/` directory |
| `apiClient.ts` → `useApiRequest` → `<f>.service.ts` → `use<F>Service` (§8) | `src/services/api.ts` exposes `apiFetch`; each feature has `service.ts`; pages call those directly from `useEffect`. `useApiRequest` and the feature service hooks do not exist |
| No socket calls in UI components (§10, §4.1) | `HomePage`, `ChessBoard`, `ResignButton`, `QueueStatus`, `JoinRoomForm` and `GamePage` call `getSocket()?.emit(...)` inline |
| Stores named `authStore`, `gameStore`, `connectionStore` (§7) | `useAuthStore`, `feature/game/store.ts`, `feature/matchmaking/store.ts`; no connection store |
| Shared set incl. `IconButton`, `OtpInput`, `ErrorState`, `EmptyState`, `Card`, `AppShell` (§12) | Only `Button`, `Input`, `Modal`, `Spinner`, `Avatar` |
| Welcome screen at `/` (§2.1) | No `/` route; unmatched paths redirect to `/auth` |
| 4-layer board incl. coordinates (§3.1, UI §5.5.4) | Board image + interaction grid only; no coordinate layer |

---

## 17. Open Decisions

These items are not settled by the spec above and should be confirmed before
the code that depends on them is written.

1. **Backend contract.** The exact payload shapes for `gameStarted`, `moveMade`,
   `gameState`, `gameEnded`, and the REST responses for `GET /games` and
   `GET /games/:gameId` are defined by the backend and must be confirmed against
   it rather than guessed. (The room code is settled: six alphanumeric
   characters, per `JoinRoomForm`.)
2. **Profile image upload.** §2.2 lists a profile image field but does not
   specify the upload endpoint or transport (multipart vs. base64 vs. presigned
   URL).

### Settled

- **TypeScript.** The codebase is TypeScript. Where this document spells a file
  `.js`/`.jsx` in prose, the real file is `.ts`/`.tsx` with the same name and
  path.
- **UI direction.** All screens are specified, dark theme only, desktop-first
  and responsive, modelled on chess.com's play screen. Client-derivable extras
  (captured pieces, live move list, flip board) are in scope; bots, ratings,
  hints, takebacks and analysis are not. See
  [UI_SPECIFICATION.md §1](UI_SPECIFICATION.md).
- **Asset naming.** `{color}{type}.png` under `src/assets/pieces/`, matching
  `chess.js` piece encoding (§3.2).
- **API layer naming.** `apiClient` → `useApiRequest` → `<feature>.service.ts`
  → `use<Feature>Service` (§8).
- **Token storage.** The access token is persisted to `localStorage` (key
  `checkmate-auth`), satisfying §2.2. Only the token is stored; the user is
  re-fetched via `GET /users/me` on every boot, which also validates the token.
  See [IMPLEMENTATION_PLAN.md §17](IMPLEMENTATION_PLAN.md).
