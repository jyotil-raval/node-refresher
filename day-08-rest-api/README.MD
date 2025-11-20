# 🧠 Day 08 — REST API Design (Architectural Deep Dive)

## 🎯 Objective

Design a small production-minded REST API demonstrating clean layering, idempotency, input validation, typed errors, and basic observability.

---

## Key Learnings (short)

- Separate route → controller → service → store for testability and adaptability.
- Centralized error middleware maps typed errors to proper HTTP codes.
- Idempotency keys must be persisted to guarantee single side-effect execution on retries.
- Validate at the edge to avoid business logic dealing with malformed data.
- Request-level observability (request IDs, timings) is cheap and amplifies debugging ability drastically.

---

## Architecture Deep Dive (detailed)

- **Edge (express + middleware)**: Validation, logging, idempotency checking; lightweight and fast.
- **Controller**: Thin, handles HTTP specifics (status codes) and delegates to service.
- **Service**: Business rules and side-effect orchestration (calls store).
- **Store (adapter)**: Persistence implementation; multiple adapters possible (in-memory, Redis, SQL).
- **Error handling**: Services throw domain-specific errors. Centralized middleware translates to HTTP. This isolates HTTP concerns from business logic.

Idempotency flow:

1. Request arrives with `Idempotency-Key`.
2. Edge middleware checks store for key; if present, return cached result.
3. If absent, controller -> service -> store (create) → store.saveIdempotency(key, result).
4. On retry with same key, middleware returns stored result.

---

## Commands Tried

```bash
npm i express uuid
node server.js
# test via curl or http client
```
