# 🧠 Day 1 — Node Runtime & Tooling Mastery

## Key Learnings

- Node is powered by V8 + libuv.
- Event loop order: sync → microtasks (promises) → macrotasks (timeouts).
- REPL helps quick prototyping.

## Commands Tried

- `node -p "process.version"`
- `npm init -y`
- `nvm use --lts`

## Reflection

🧠 Clarity: [write your insight]
⚡ Confusion: [write what felt unclear]

### Score

| Metric           | Score (1–10) | Notes                                                                                                                                                                |
| :--------------- | :----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Concept Clarity  |      7       | Understood how Node runs single-threaded with an event loop; the microtask vs macrotask order finally clicked. Need to visualize how libuv threads offload file I/O. |
| Code Fluency     |      6       | Wrote loop-demo.js without reference; used REPL comfortably. needed.                                                                                                 |
| Reflection Depth |      5       | Realized I was focusing more on commands than mental models. Tomorrow I’ll summarize each concept as if teaching it — forces clarity.                                |
