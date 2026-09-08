# SESSION HANDOFF — CodeFlow AI

_Last updated 2026-09-05. Branch `master`, remote `github.com/jayalexandermg/codeflow-ai` (public). Written to be sufficient, together with the repo, to fully rehydrate a fresh agent._

---

## 1. What this project is

CodeFlow AI is an AI code-review web app for "vibe coders" — people who build fast with AI help and want a sanity check before shipping. You paste code, Claude reviews it, and you get a 0-100 score, plain-English issues, and toggleable one-click fixes.

The product bet is **plain English**: the system prompt explicitly forbids linter-speak ("Potential null pointer dereference") in favour of "This code tries to use `user.name` but `user` might not exist yet — if someone visits before logging in, the app will crash." That tone is the differentiator; preserve it in any prompt edits.

There is also a standalone CLI (`cli/`, 303 lines) that does the same review against a local file.

---

## 2. Architecture

**Stack:** React 18 + TypeScript + Vite + Tailwind + Framer Motion · Netlify Functions (serverless, ESM) · Anthropic SDK `^0.24.0` · react-router-dom v6.

**Request flow:**

```
LandingPage ──"Try Demo"──> loadDemo() ──> navigate('/loading')
     └───────"Review code"─> /input ─> setCode + navigate('/loading') + runReview(code)
                                              │
LoadingPage  watches state.status ────────────┤ 'success' -> navigate('/results')
                                              │ 'error'   -> inline retry buttons
ResultsPage  4 tabs (issues/suggestions/changes/actions)
     └─ select fixes -> POST /api/apply-fix -> setFixedCode -> ComparisonView
```

**State:** one React context, `src/context/ReviewContext.tsx`. No Redux, no persistence — **all state is in memory and a page refresh wipes it.** That is why `ResultsPage` has a redirect-to-`/` guard, and why the nav race in `2e636f5` happened.

**Key files (the ones that actually matter):**

| File | Role |
|---|---|
| `src/context/ReviewContext.tsx` | All state + both API calls. The centre of gravity. |
| `src/pages/ResultsPage.tsx` | Tabs, fix selection, apply/re-scan orchestration, comparison |
| `src/components/ScoreDisplay.tsx` | Score ring + 4 category bars |
| `src/shared/types.ts` | Single source of truth for the API contract |
| `src/shared/demo-data.ts` | 3 canned demos (447 lines): JS, Python, and a third |
| `netlify/functions/review.js` | `POST /api/review` — the big system prompt lives here |
| `netlify/functions/apply-fix.js` | `POST /api/apply-fix` — separate, smaller prompt |
| `cli/index.js` | Standalone terminal reviewer, duplicates the prompt again |
| `netlify.toml` | Build, dev, function config, `/api/*` redirect |

**API contract** — `ReviewResponse` in `src/shared/types.ts`: `{ score, summary?, categories{security,performance,readability,bestPractices}, issues[], suggestions[], proposedChanges[], actionItems[] }`. The functions hand-parse Claude's JSON (strip ``` fences, regex `/\{[\s\S]*\}/`, `JSON.parse`) — there is **no** schema validation beyond checking `score` is a number and `categories` exists.

**Prompt duplication (important):** the review system prompt exists in **three** places — `netlify/functions/review.js`, `cli/index.js`, and historically `src/lib/prompts.ts` (now deleted). Editing one and not the others is the most likely way to introduce drift. `apply-fix.js` has its own unrelated prompt.

---

## 3. How to run it

```bash
npm install
npx netlify dev      # REQUIRED — plain `npm run dev` has no /api
npm run build        # tsc && vite build
npm run lint         # eslint, --max-warnings 0
```

`ANTHROPIC_API_KEY` must be in a local `.env` (gitignored) **and** in Netlify's env vars. Neither is in the repo.

---

## 4. Where things stand

A full read-only review of the repo is complete. **No source code has been fixed yet** — every finding in §5 is open. The only commits this session are documentation and `.gitignore`; `src/`, `netlify/`, and `cli/` are untouched since `61971b1`.

Nothing was built, linted, or deployed this session. The last evidence of the app working is the three UI screenshots in `docs/error/` dated 2026-01-14, which show real analysis output rendering correctly (score ring, 4 issues, Changes tab with a diff). Not re-verified against current HEAD.

---

## 5. Open issues — full inventory, highest priority first

**P0 — credentials**
1. `docs/error/image.png` shows a live `ANTHROPIC_API_KEY` value (`sk-ant-api03-t1ayMW2pN2…`, truncated by the input field, so a prefix rather than the whole key). Verified **never committed** — `git log --all -- 'docs/*'` is empty and no `sk-ant-api` string exists anywhere in history, so **no history rewrite is needed**. It is now gitignored. **Rotating the key is still the safe call and has not been done.**

**P1 — the deploy bug the last four commits were chasing**

2. **`b56893c` "updated syntax" silently reverted the timeout fix.** `8a79d6d` added `[functions]\n  timeout = 26`; `b56893c` deleted it and changed nothing else. Current `netlify.toml` has no `[functions]` block → Netlify's **default 10s** sync timeout applies. The model downgrade (`f089cd0`) and `force = true` (`61971b1`) were both stacked on a config that had already lost the fix, which is likely why neither helped. **Read the file; do not trust the commit log.**
3. **`[dev]` port collision.** `netlify.toml` sets `port = 3000` *and* `targetPort = 3000`. These must differ — `targetPort` is where Vite listens, `port` is where `netlify dev` serves. Vite is also on 3000 (`vite.config.ts`). Expect `netlify dev` to fail or behave oddly; the conventional layout is `port = 8888`, `targetPort = 3000`.
4. **Vite's own proxy points at 8888** (`vite.config.ts` → `http://localhost:8888/.netlify/functions`) which contradicts #3's `port = 3000`. One of the two is wrong; they were probably edited at different times.

**P2 — real functional bugs**

5. **Post-fix re-scan is permanently faked.** `src/pages/ResultsPage.tsx:134` calls `runReview(fixedCode, true)` with demo mode **hardcoded `true`**. After a user applies fixes to *real* code, "Re-scanning with AI" returns random demo data and the comparison view is built from it. Fully-built UI around a stubbed core — the easiest thing here to mistake for done.
6. **First demo load mismatches code and results.** `ReviewContext.tsx:62` reads `state.result` from a stale closure. `loadDemo` sets a demo then immediately calls `runReview`, which still sees `state.result === null` on the first run and calls `getRandomDemo()` a **second** time — so on-screen code is demo A while the issues are demo B. Later loads work (functional `setState` carries the right `prev.result`), making it look intermittent.
7. **Model IDs are inconsistent and stale.** `review.js` and `cli/index.js:173` are on `claude-3-5-sonnet-20241022`; `apply-fix.js:112` is still on `claude-sonnet-4-20250514`. The downgrade was done "to test against netlify timeout," but an older model is not a faster one, and both call sites request `max_tokens: 8192`. **Before changing any model ID, load the `claude-api` skill** — that load was rejected in an earlier session, so no model guidance in this document is sourced. Do not set model IDs from memory.
8. **`applyFixes` is typed `() => void` but implemented `async`** (`ReviewContext.tsx:11` vs `:116`); `ResultsPage.tsx:122` awaits it. Works at runtime, but the type lies and TS won't catch a missing await elsewhere.
9. **Silent fallback hides API failures.** `ReviewContext.tsx:182` catches an `/api/apply-fix` failure and falls back to `newCode.replace(fix.before, fix.after)` — first occurrence only, and a no-op if the snippet doesn't match exactly. The user sees "Fixes applied!" either way, including when nothing changed.

**P3 — security / hygiene**

10. **`Access-Control-Allow-Origin: '*'` on both functions** (`review.js:13`, `apply-fix.js:13`) with no auth and no rate limit. Deployed, these are an open proxy billing the owner's Anthropic key. It's on both files so it looks deliberate, but it is not production-safe.
11. **No schema validation of Claude's JSON.** A malformed or adversarial response propagates straight into React state. `score` is not clamped to 0-100.
12. **Score vs "confidence" naming inconsistency.** `ScoreDisplay.tsx:81` labels the number `confidence`; `types.ts` comments it as "0-100 overall confidence score"; the system prompt treats it as a *quality* score with explicit deduction rules. The UI label matches the type comment, so this is a naming decision to settle, not a clear-cut bug — but users read "15 confidence" as "the AI is unsure," which is not the intent.
13. **Stale `CLAUDE.md`** (now committed): it documents `src/lib/prompts.ts` and `src/lib/analyzer.ts`, both deleted in `897d9fa`. Only `src/lib/types.ts` remains. The "keep prompts in sync" warning is still valid; the file list is not.

---

## 6. What was last done

This session: read-only review of the whole repo, then a documentation/hygiene commit. Specifically —
- Traced the timeout commit chain and found the silent revert (#2).
- Added `.claude/`, `logs/`, and `docs/error/image.png` to `.gitignore`.
- Committed `CLAUDE.md` (previously never committed), this handoff, and the five non-sensitive screenshots. Pushed to `origin/master`.

---

## 7. Immediate next step

Restore `[functions]\n  timeout = 26` in `netlify.toml` and fix the `[dev]` port collision (`port = 8888`, `targetPort = 3000`), then deploy and confirm whether `/api/review` still times out. That single change tests the leading hypothesis for the bug the last four commits failed to fix.

## 8. Total remaining scope

Roughly in order: (a) rotate the key; (b) P1 deploy config #2-4 and verify against a real deploy; (c) un-stub the re-scan #5 and fix the demo closure #6; (d) resolve model IDs #7 *after* loading `claude-api`; (e) lock down CORS #10 before any public launch; (f) validation + typing cleanup #8, #9, #11; (g) settle the score/confidence wording #12 and refresh `CLAUDE.md` #13.

---

## 9. Traps — do NOT assume

- **Don't trust the commit log over the files.** #2 is a commit that says it did one thing and did the opposite.
- **Don't "fix" demo mode by deleting it.** It's a real feature — the landing page's "Try Demo" is the main entry point. The bug in #5 is one hardcoded `true` at one call site.
- **Don't set Claude model IDs from memory.** Load the `claude-api` skill first (#7).
- **Don't `git add .` blindly.** It's safe now that the ignore rules are in, but the reason those rules exist is a credential screenshot.
- **Everything in `docs/error/` is January debugging scratch, not current-state documentation.** The Netlify screenshots show a *local Windows path* pasted into Netlify's base-directory field, which is itself probably wrong for a cloud build.
- **A page refresh wipes all state.** Any bug reported as "it reset to the landing page" is probably this, or the `ResultsPage` redirect guard, not a routing bug.
- **Unreviewed files**, in case a finding hides there: everything in `src/components/` except `ScoreDisplay.tsx`, plus `cli/index.js` beyond its model line and `src/shared/demo-data.ts` beyond its shape.
