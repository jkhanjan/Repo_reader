# Repo Reader

A GitHub repository analysis service built with Next.js, TypeScript, and LangGraph. It runs a self-expanding agentic loop over a repo's contents — pulling in more files only when the model decides it doesn't have enough context yet — rather than a fixed-depth crawl. Works standalone as its own UI, and as the analysis backend for a separate chat platform via deep links.
---

## What it does

- Accepts a GitHub URL and returns an LLM-generated analysis of the repo
- Runs an autonomous LangGraph loop that expands context on its own until it judges it has enough to answer — not a fixed number of fetch steps
- Exposes a single analysis endpoint that other services can call directly
- Supports deep linking: a repo analysis can be triggered and rendered purely from a URL query param, so other apps can link straight into a specific analysis
- Deployed on Vercel, using Groq as the LLM provider

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Agent Orchestration | LangGraph |
| LLM Provider | Groq |
| Deployment | Vercel |
| Cross-service calls | REST over CORS |

---

## Architecture

```
Chat UI (external)
       │  user pastes a GitHub URL
       ▼
Query Classifier
       │  routes GitHub URLs to repo intent
       ▼
Repo Reader API
       │  POST /api/analyze  (Vercel + Groq)
       ▼
┌────────────────────────────────────────────┐
│         LangGraph Sufficiency Loop           │
│                                              │
│   checkSufficiency ──► expandContext ──► generateAnswer
│         ▲                                    │
│         └────── loops back if insufficient ───┘
└────────────────────────────────────────────┘
       │
       ▼
SSE Stream + Deep Link (?repo=<url>)
       │
       ▼
Chat UI renders answer, user can click through to full repo view
```

---

## The LangGraph Sufficiency Loop

This is the core of the app. Instead of a fixed-pipeline RAG lookup (fetch N files, stop), the agent runs a loop with an explicit stopping condition:

1. **`checkSufficiency`** — the model looks at what's been gathered so far and decides whether it has enough context to answer the query about the repo
2. **`expandContext`** — if not sufficient, the agent fetches additional related files (e.g. following imports, config references, adjacent modules) and adds them to its working context
3. **`generateAnswer`** — once sufficiency passes, the model drafts the actual analysis/answer

Steps 1–2 repeat until `checkSufficiency` passes, so simple repos resolve in one pass while complex ones pull in progressively more context automatically. This is framed as "agent with a stopping condition" rather than a fixed-depth crawl — the loop count adapts to the repo, not to a hardcoded constant.

---

## API

### `POST /api/analyze`

Runs the sufficiency loop against a given repo and query, and streams back the result.

**Request body (typical shape):**
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "query": "What does this repo do and how is it structured?"
}
```

**Response:** streamed via SSE, terminating in a final analysis payload the caller can render or fold into its own context.

This endpoint is called both by the app's own UI and by the external chat platform's backend, so it's treated as a stable service boundary — request/response shape stays consistent regardless of caller.

---

## Deep Linking & URL State Hydration

A repo analysis can be reached directly via `?repo=<github-url>` in the query string. On load, the page reads that param and re-triggers (or rehydrates) the same analysis, so a chat app can link a user straight from an inline answer into the full repo view without re-explaining context.

Two things this required, since they're easy to get wrong in the App Router:

- **Suspense boundary around `useSearchParams`** — Next.js requires any component reading `useSearchParams` to be wrapped in a `<Suspense>` boundary, or the build fails/hydration breaks. The param-reading logic is isolated into its own client component for this reason.
- **URL cleanup after hydration** — once the param has been read and the analysis state initialized from it, the query string is cleared (via `router.replace`) so the URL doesn't stay "sticky" with stale state on refresh or share.

---

## Cross-Service Communication

Since the chat platform's backend and this app are separate services, `/api/analyze` is called across origins. CORS is configured explicitly on the route to allow the chat backend's origin, rather than relying on same-origin defaults — this is the main thing to double-check when adding a new caller.

---

## Folder Structure

```
repo-reader/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts        # POST /api/analyze, SSE response
│   ├── page.tsx                 # main UI, reads ?repo= param
│   └── layout.tsx
├── components/
│   ├── RepoInput.tsx
│   ├── AnalysisView.tsx
│   └── SearchParamsReader.tsx   # isolated, wrapped in Suspense
├── lib/
│   └── langgraph/
│       ├── graph.ts             # node graph definition
│       ├── checkSufficiency.ts
│       ├── expandContext.ts
│       └── generateAnswer.ts
└── types/
```

---

## Limitations

- Loop termination depends on the model's own sufficiency judgment — no hard upper bound guarantees completeness, and there's no hard cap preventing a pathological loop on a very large or unusual repo
- `expandContext` fetches are sequential per loop iteration, so deep expansions add latency
- No caching — re-analyzing the same repo re-runs the full loop from scratch
- CORS allowlist is currently static; adding a new caller service means a manual config change

---

## Future Improvements

- [ ] Cache analyses per repo (or per repo + query) to skip re-running the loop
- [ ] Hard iteration cap on the sufficiency loop as a safety valve
- [ ] Parallelize `expandContext` fetches where files are independent
- [ ] Persist analysis history so deep links can resolve instantly instead of re-triggering the loop
- [ ] Surface loop step count / expansion path in the UI for transparency into how an answer was reached