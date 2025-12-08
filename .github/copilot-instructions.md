This repository is a Next.js (App Router) web app using Supabase for auth/DB and Framer Motion for UI animations. The file layout and conventions below are the most important things for an AI coding agent to know before making changes.

Key architecture & where to look
- App Router: server and client code lives under `app/`. Server routes live in `app/api/**/route.ts`.
- Supabase helpers: use `app/lib/hooks/supabaseServerClient.ts` and `app/login/server/getUserSettings.ts` for server-side auth-aware DB access.
- Local test data: some features (e.g. `app/api/wordlist/route.ts`) use file-backed data in `data/wordlists/default.json` — changes here do not touch Supabase.
- UI: reusable client components live in `app/components/` (examples: `Reveal.tsx`, `Navbar.tsx`, `ConfirmDialog.tsx`). Animations use `framer-motion`.

Developer workflows & commands
- Run locally: `npm run dev` (uses `next dev --turbopack`).
- Build: `npm run build`.
- Tests: `npm run test` (Vitest configured).

Patterns & conventions to follow
- Server routes and DB access
  - Server route handlers (POST/GET) are under `app/api/*/route.ts` and use Next.js route handlers. Use `getSupabaseServerClient()` to access Supabase on the server side.
  - For route-level authenticated helpers, `getUserSettingsFromRoute()` returns `{ userId, settings }` and throws `UNAUTHORIZED` if not logged in — prefer reusing it.
  - When updating user state in DB prefer updating Users table by `user_id` via Supabase `.from("Users")` queries (example pattern seen in route code and compiled server chunks).

- Client/server component split
  - File-level `"use client"` opt-in is used for interactive components. Many components are client components with framer-motion animations.
  - For UI changes (toasts/popups), add a small client-only component in `app/components/` and call it from the affected pages or client components where the success action occurs.

Important integration points & examples
- Quiz sentence generation
  - Requesting a quiz sentence: `app/lib/actions/geminiQuizAction.ts` calls POST `/api/quiz` which is implemented in `app/api/quiz/route.ts`.
  - Validation / awarding XP is not implemented in the generator route; instead, the agent should add an XP API endpoint that authenticated routes and client code can call to persist XP.

- Wordlist editing
  - There is a local file-backed API at `app/api/wordlist/route.ts` that reads/writes `data/wordlists/default.json`.
  - There are also example/test routes under `app/api/test/*` (e.g. `createWord/route.ts`) which use the Supabase server client.

Suggested concrete primitives to add (examples an agent can implement)
- Server: Add `app/api/xp/add/route.ts` (POST) that:
  - calls `getSupabaseServerClient()`
  - obtains the user via `supabase.auth.getUser()` (or reuse `getUserSettingsFromRoute()`),
  - increments the user's XP: read current `xp` and update `Users` row with `xp: old + delta`.
  - returns the new total xp.

- Client: Add a small `XPToast` component in `app/components/XPToast.tsx`:
  - client-only, uses `framer-motion` for a short pop/float animation,
  - accepts `{ amount: number }`, auto-dismisses after ~1200ms, and stacks briefly.
  - call it from success flows after answers/word-adds (quiz answer correct, sentence correct, story completed, add word success).

Project-specific gotchas
- Two kinds of wordlists exist: local JSON (`data/wordlists/default.json`) and Supabase-backed (`Word`, `WordList` tables referenced in other examples). Choose the correct storage depending on the page you modify.
- Authentication is Supabase-based. Use the provided server helpers for route-bound requests — cookie-aware helpers are already wired (`createRouteHandlerClient({ cookies })`).
- Animations: the project prefers subtle, non-distracting motion (see `Reveal.tsx` variants). XP popups should be brief and unobtrusive.

Testing and API conventions
- Tests use Vitest; client-only components can be tested using React Testing Library patterns already present in `app/*.test.tsx`.
- Routes return `NextResponse.json(...)` with errors using `{ status: 4xx/5xx }`. Follow pattern when adding new routes.

If you implement XP:
- Add a new route `app/api/xp/add/route.ts` and a client helper `app/lib/actions/xpAction.ts` (POST to `/api/xp/add`).
- Use `app/components/XPToast.tsx` and call it from the client flow after the successful action.
- Pick default XP amounts in a small config file like `app/config/xp.ts` so amounts are discoverable and adjustable.

When unsure, inspect these files first
- `app/api/quiz/route.ts` — quiz sentence generation.
- `app/lib/actions/geminiQuizAction.ts` — client call to `/api/quiz`.
- `app/api/wordlist/route.ts` — local wordlist implementation.
- `app/lib/hooks/supabaseServerClient.ts` and `app/login/server/getUserSettings.ts` — auth-aware server helpers.
- `app/components/Reveal.tsx` and `app/components/Navbar.tsx` — animation and auth display patterns.

Questions for the maintainers (include in PR description)
- Where should XP be persisted? (existing `Users.xp` column vs. a new `UserXP` table)
- What are the exact XP amounts for each action? (defaults can be used: quiz +10, sentence +5, story +20, add-word +2)
- Preferred popup style/position/duration (defaults: top-right, 1.2s, small floating +#xp)

If anything here is out-of-date, point to the file you used to verify, and keep the instructions minimal and actionable.
