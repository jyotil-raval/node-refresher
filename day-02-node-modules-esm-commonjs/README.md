# 🧠 Day 2 — Node Modules: CommonJS vs ESM

## Key Learnings

- CommonJS: synchronous, cached, runtime-based loading.
- ESM: static, async-ready, supports top-level await.
- `.mjs` extension or `"type": "module"` required for ESM in Node.

## Commands Tried

- `node cjs/index.js`
- `node esm/index.mjs`

## Reflection

🧠 Clarity: CommonJS feels simpler but less flexible.
⚡ Confusion: Still unclear how `require` cache invalidation works — need to explore later.

## Score

| Metric           | Score (1–10) | Notes                                                                                    |
| :--------------- | :----------: | :--------------------------------------------------------------------------------------- |
| Concept Clarity  |      7       | I can now explain import/export differences; still fuzzy on mixed usage in hybrid repos. |
| Code Fluency     |      6       | Built both module types; hit 1 syntax error and debugged it correctly.                   |
| Reflection Depth |      6       | Recognized why syntax + runtime alignment matters — better architecture awareness.       |
