# Axle
Axle is a full-stack bookkeeping platform built for underserved SMEs that need a reliable way to track income, expenses, and cash across multiple accounts. Instead of relying on manual bookkeeping, Axle enforces double-entry accounting, immutable transaction records, and server-side validation to keep every transaction balanced and the ledger consistent.

Built with Node.js, Express, PostgreSQL, React, and Supabase, Axle is designed around financial correctness from the database upward.

<img width="1867" height="677" alt="image" src="https://github.com/user-attachments/assets/84f09ee3-a8d8-4d94-8e9c-8d730b8eb785" />


# Contributing to Axle

Axle is a full-stack bookkeeping platform built around double-entry accounting and transaction integrity. The backend is built with Node.js, Express, PostgreSQL (Supabase), and React, and is currently being re-architected into a layered architecture (`routes → services → repositories → types`).

This guide explains how to set up the project, work within the architecture, and contribute safely without breaking accounting correctness.

## Project structure

Current and target structure:

```text
backend/
  routes/
  services/
  repositories/
  types/
  controllers/      # legacy (being phased out)

frontend/
  src/
    pages/
```

The backend is mid-migration to a layered architecture. New code should target this structure rather than extending the legacy controller pattern where avoidable.

- **routes** — HTTP layer (request/response only)
- **services** — business logic (ledger rules, wallet validation, tag validation)
- **repositories** — all Supabase/database access
- **types** — shared type definitions

## Getting started

1. Clone the repository.

   ```bash
   git clone https://github.com/pijeomah/project-axle.git
   ```

2. Install dependencies in both `backend/` and `frontend/`.
3. Create your own Supabase project.
4. Configure environment variables (`.env.example` if available).
5. Start the backend and frontend locally.

## Branching & workflow

- Branch from `main` (or the active migration branch such as `schema-design`).
- Never commit directly to `main`.
- Use descriptive branch names:

  - `feat/wallet-section-ui`
  - `fix/opening-balance-tag-mismatch`

- Keep pull requests focused on a single concern.

## Accounting invariants

Before changing transaction logic, understand these invariants.

- Every transaction must balance under the double-entry model.
- The system wallet completes balancing entries where required.
- Asset wallets are the only supported wallet type in the current cash-flow-focused version.
- Liability and debt tracking are intentionally deferred to a future v3 and should not be introduced through scope creep.

If you're unsure how a change affects ledger integrity, open an issue or draft PR before implementing it.

## Coding conventions

- Match the existing code style within the file you're editing.
- Tag types and other enums are currently validated at the controller layer rather than through database `CHECK` constraints.
- System-managed tags (such as `opening_balance`) are intentionally hidden from the normal tag workflow.
- Prefer explicit, lowercase, consistent string constants for enum-like values.

A real bug in this project came from inconsistent casing (`transfer` vs `OPENING_BALANCE`), so avoid introducing values that bypass existing validation.

## Security

### Current protections

- Server-side validation for transaction handling.
- CORS restricted through an explicit `allowedOrigins` allowlist in `backend/server.js`.

### Planned hardening

- Rate limiting.
- Improved token storage (avoiding new `localStorage` usage).

If you discover a security issue, report it rather than silently patching it so it can be tracked properly.

## Submitting a pull request

1. Sync your branch with the target branch.
2. Explain **what** changed and **why**.
3. Document any manual testing performed.
4. Call out known limitations or follow-up work instead of leaving them undocumented.

Example testing notes:

- Created a wallet with an opening balance.
- Verified the opening balance transaction posted correctly.
- Confirmed debit and credit entries remained balanced.

## Questions

If a proposed change affects ledger integrity, transaction posting, wallet semantics, or core financial logic, open an issue or draft PR before implementing it.

Preserving accounting correctness takes priority over implementation convenience.

#Licensing
Axle is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

You are free to use, study, and modify the software, but if you deploy a modified version as a networked service, you must also make the modified source code available under the same license.
Copyright (c) 2026 Promise Ijeomah
