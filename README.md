# BazaarLens

> "Point your camera at any product. Your AI intelligence team watches its market forever."

AI market intelligence assistant for small business owners — built for iQOO Hackathon 2026 Bengaluru.

---

## For Teammates — Start Here

1. Clone this repo
2. Open the project folder in Claude Code
3. Read `CLAUDE.md` — it has everything: vision, architecture, tech stack, roadmap
4. Read `docs/blueprint.md` — full engineering blueprint with milestone plan
5. Read `docs/api.md` — complete API contract

Claude Code will automatically load `CLAUDE.md` context for every session.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS, shadcn/ui, PWA |
| Backend | Axum (Rust) |
| Database | SQLite (local) + Supabase (PostgreSQL) |
| AI | OpenRouter → DeepSeek V4 Pro + Minimax M3 |
| Deploy | Vercel (frontend) + Railway (backend) |

## Project Structure

```
bazaarlens/
├── frontend/     Next.js PWA
├── backend/      Axum (Rust) server
├── docs/         Blueprint + API contract
└── CLAUDE.md     Full project context (read this first)
```

## Current Phase

See `docs/blueprint.md` → Section 10 for the milestone roadmap.
Check off milestones as they're completed.
