# Handoff: verify, migrate, commit & push

Context: a large batch of changes was made to this repo (perf, guest-planning funnel, security hardening, design cleanup). Everything compiles in theory but **no typecheck or build has been run yet** — that's your first job. Then migrate the DB, run tests, and push.

## What changed (grouped)

**Performance**
- `app/loading.tsx`, `app/trips/loading.tsx`, `app/trips/[id]/loading.tsx` + `components/ui/Skeletons.tsx` — instant loading skeletons
- `components/trip/DashboardPage.tsx` — shared dashboard for `/` and `/trips`; query selects only card columns instead of `SELECT *` (no more shipping full plan JSON)
- `app/layout.tsx` + `app/globals.css` — fonts moved from CSS `@import` to `next/font/google` (Hanken_Grotesk, Schibsted_Grotesk; both verified to exist in the installed next version)

**Guest planning funnel**
- `components/landing/LandingPage.tsx` — public landing at `/` for signed-out visitors
- `proxy.ts` — `/`, `/plan` now public
- `app/api/generate/route.ts` — guests can generate; trips saved under `wander_anon` cookie (`lib/anon.ts`); claimed on signup/login via `claimAnonTrips` (called from `DashboardPage` and trip detail page)
- `app/trips/[id]/page.tsx` — guest creators can view their trips; private trips show a friendly explainer instead of login-bounce-then-404; claim banner via `TripDetail`'s new `claimable` prop
- Deleted dead `app/trips/generated/` (orphaned sessionStorage flow) and unused `data/trips.ts`

**Security**
- `lib/validate.ts` — payload validation for `/api/generate` (400 on garbage), `escapeHtml` used before the `dangerouslySetInnerHTML` in TripDetail's tips tab
- Guest rate limits: 3/day per cookie + 10/day per IP (salted hash, `lib/anon.ts`), 429 with friendly message
- `app/api/auth/signup/route.ts` + `auth.ts` — email validation, lowercase normalization, case-insensitive lookups

**Design**
- `components/ui/Brand.tsx` — single source for StarIcon/getInitials (deduped from Nav, TripsDashboard, login)
- `.input` CSS class replaces all copy-pasted JS focus handlers (plan + login pages)
- Nav hidden on `/login`; Sign in button in Nav for guests
- AI now returns a per-trip `emoji` (prompt + generate route); `taken` status color added; `--text3` darkened for contrast; aria-labels on icon buttons
- `lib/schema.ts` — `Trip` type now matches DB columns (`created_at`, `card_color`, nullable `user_id`, `anon_id`)

## Steps (in order)

1. **DB migration first** (prod code for guest flow depends on it; logged-in flows work either way):
   ```
   node scripts/migrate-anon.mjs
   ```
   Adds `trips.anon_id`, `trips.ip_hash`, drops NOT NULL on `trips.user_id`, adds partial indexes. Idempotent.

2. **Typecheck & build:**
   ```
   npx tsc --noEmit
   npm run build
   ```
   Fix any errors you find — the changes were made without a compiler available. Likely spots if anything broke: `next/font` usage in `app/layout.tsx`, the `claimable` prop threading in `TripDetail`, imports of `@/components/ui/Brand`.

3. **Tests:**
   ```
   npx playwright test
   ```
   Note: `tests/auth.spec.ts` was updated — `/` and `/plan` are now public (guest flow), `/trips` still redirects. If other tests assert old redirect behavior, update the tests, not the app.

4. **Review the diff before committing.** `git status` showed pre-existing uncommitted modifications (e.g. `README.md`, `app/api/refine/route.ts`, `app/api/trips/[id]/route.ts`) that predate this batch — check whether they belong in this commit or a separate one.

5. **Commit & push.** Suggested split:
   - `perf: loading skeletons, trimmed dashboard query, self-hosted fonts`
   - `feat: guest trip planning with claim-on-signup, public landing page`
   - `fix: harden generate/signup APIs, escape AI output, rate-limit guests`
   - `chore: design cleanup — shared brand components, input class, a11y`

   One combined commit is fine too if Joe prefers.

6. **Manual smoke test after deploy:** incognito → landing page → plan a trip as guest → see claim banner → sign up → trip appears in My Trips. Then share a trip and open the link in incognito.

## Known follow-ups (not in scope)
- `/api/refine` has no rate limit (auth-only, low risk)
- Hero SVG identical for all trips (could vary by `card_color`)
- `past` vs `taken` statuses overlap conceptually
