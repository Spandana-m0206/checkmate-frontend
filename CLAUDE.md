# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Rule 0 — Read the specs first

**Before writing or changing any code in this repository, read
[REQUIREMENTS.md](REQUIREMENTS.md). If the task touches anything visual, also
read [UI_SPECIFICATION.md](UI_SPECIFICATION.md).**

| Document | Answers | Authority |
| --- | --- | --- |
| `REQUIREMENTS.md` | **What** it does — routes, flows, socket events, state, API architecture, folder structure | Wins on any conflict |
| `UI_SPECIFICATION.md` | **How** it looks and behaves — tokens, layout, screens, board anatomy, interaction, a11y | Subordinate to REQUIREMENTS.md |
| `IMPLEMENTATION_PLAN.md` | **How it was built** — structure, backend contract reference, per-feature plans | Reference; parts are superseded and marked so |

This applies to every implementation task, including small ones — a "quick"
component still has to sit in the right folder, consume the right hook, use the
right event names, and use the right tokens.

When starting an implementation task:

1. Read the governing section(s) in both documents.
2. Cite them in your plan (e.g. "per REQ §3.5, UI §5.5.7").
3. If the requirement is ambiguous or absent, **ask** rather than inventing
   behaviour. Check REQ §17 Open Decisions and UI §10 Open UI Questions first —
   the question may already be listed there.
4. If the user asks for something that contradicts the specs, say so, then
   follow the user. Afterwards, update the affected document so it and the code
   stay in agreement.

Both are living documents. When a requirement or a visual decision genuinely
changes, update the document in the same change as the code.

## Project

Real-time chess web app. React 19 + Vite 6 + TypeScript + Tailwind CSS 3.
The backend is a separate service, reached over REST and Socket.IO.

Scripts:

```
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build
npm run preview  # preview the production build
```

## Non-negotiable architecture rules

These are the rules most easily broken by accident. All of them are derived from
`REQUIREMENTS.md`; the document wins if this summary ever drifts from it.

- **The backend is authoritative.** The frontend never assumes a move
  succeeded. It emits `makeMove`, disables further interaction for that move,
  and waits for `moveMade` or `moveRejected` (§3.5). On reconnect, local state
  is *replaced* by the server's state, never merged (§4.2, §5).
- **`chess.js` is for rules only** — legal moves, move indicators, promotion.
  It is not the source of truth for game state (§3.3).
- **No API calls in UI components.** The chain is strictly
  `UI → use<Feature>Service → useApiRequest → <feature>.service.ts → apiClient →
  backend` (REQ §8). Each layer talks only to the one beneath it. A component
  that imports `axios`, `apiClient` or `useApiRequest`, or that names an
  endpoint path, is wrong — and so is a feature hook that reaches past
  `useApiRequest`. `src/services/apiClient.ts` has exactly one importer:
  `src/hooks/useApiRequest.ts`.
- **No socket calls in UI components.** Board/timer components talk to
  `features/game/hooks/useGameSocket.ts`, not to `src/services/socket.ts` (§10,
  §4.1).
- **One socket connection per authenticated session.** It is not recreated on
  render (§4.1).
- **Bot games differ only in labelling.** `startBotGame` produces an ordinary
  game: the bot is a real user, its move arrives as a second `moveMade`, and
  move/timer/promotion/resign/reconnect logic is shared with multiplayer. Never
  branch those paths on game mode. The bot fields (`mode`, `botPlayerId`,
  `isBotGame`) are **optional** — absent means `MULTIPLAYER`
  ([IMPLEMENTATION_PLAN.md §16](IMPLEMENTATION_PLAN.md)).
- **No hardcoded backend URLs.** The base URL comes from `VITE_API_BASE_URL` in
  `.env`; feature services define paths only (§8.1).
- **Feature-based structure.** Game-specific components live in
  `features/game/components/`, not in the global `components/` directory. Only
  genuinely shared primitives (Button, IconButton, Input, OtpInput, Modal,
  Loader, ErrorState, EmptyState, Card, Avatar, AppShell) go in
  `src/components/` (REQ §11, §12).
- **Zustand holds application and UI state** — `authStore`, `gameStore`,
  `connectionStore` (§7).
- **Chess piece images are local assets** at
  `src/assets/pieces/{color}{type}.png` — `w`/`b` plus `k q r b n p`, matching
  `chess.js` piece encoding. The backend never sends image URLs (REQ §3.2).
- **Styling uses design tokens, never raw hex.** Colour, type, spacing, radius
  and motion come from `tailwind.config.js`, defined in UI §2.
- **Backend-only packages are never installed here** — no Redis client, no
  MongoDB/Mongoose, no Express, no backend JWT libraries (§14).

## Conventions

- Use TypeScript (`.ts` / `.tsx`). Where `REQUIREMENTS.md` spells a file
  `.js`/`.jsx` in prose, keep the name and path but use the TS extension.
- Style with Tailwind utility classes built from the tokens in UI §2; extract
  repeated patterns into shared components rather than repeating class strings.
- Socket event names are fixed by the backend contract in REQ §4 — use them
  exactly as written, with no aliasing or renaming.
- Dark theme only. Do not add light-mode variants or a theme toggle (UI §1.1).

## Before you report a task complete

- The change conforms to the governing `REQUIREMENTS.md` section, and to
  `UI_SPECIFICATION.md` if it is visual.
- `npm run build` passes (it type-checks via `tsc -b`).
- No endpoint path, backend URL, `axios`/`apiClient`/`useApiRequest` import, or
  socket call leaked into a UI component.
- No raw hex colours — tokens only.
- Anything left out or assumed is stated explicitly to the user.
