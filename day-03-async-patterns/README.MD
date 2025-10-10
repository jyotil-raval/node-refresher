# 🧠 Day 3 — The Async Mind: Callbacks, Promises & Async/Await (Architectural Deep Dive)

## 🎯 Objective

Develop an architectural mental model of how Node executes asynchronous work:

- How the event loop schedules tasks, microtasks, and I/O callbacks.
- How libuv and the thread pool enable non-blocking I/O.
- When async/await is only syntactic sugar vs. when you must change architecture (worker threads, clustering).
- How to observe event-loop health and avoid common performance pitfalls.

---

## Key Learnings (short)

- Node exposes a single-threaded JS event loop; heavy I/O is offloaded to libuv or the OS; CPU work blocks the loop.
- libuv provides a thread pool (default 4 threads) used for some filesystem ops, DNS on older platforms, and user-offloaded work.
- Microtasks (Promise jobs) are drained between macrotasks; `process.nextTick` is a special queue drained _before_ microtasks.
- `setImmediate`, `setTimeout`, I/O callbacks and timers occur in different event-loop phases — their ordering matters for latency.
- Use worker threads (or child processes/cluster) for CPU-bound tasks; streams and backpressure for efficient large-data handling.

---

## Architecture Deep Dive (detailed)

### 1) The process model — single-threaded JS, multi-threaded subsystem

- **JS Thread (main):** runs your JavaScript — event loop, V8 runtime, JS call stack. Any synchronous, CPU-heavy computation here will block all incoming events, making your server unresponsive.
- **libuv:** C library that implements the event loop and provides an abstraction over OS async capabilities (epoll/kqueue/iocp) plus a thread pool for operations that the OS exposes only as blocking (notably many filesystem APIs).
- **Thread pool:** default size is 4 (controlled by `UV_THREADPOOL_SIZE` environment variable). File reads via `fs.readFile` in Node are often implemented by scheduling work in this pool so the JS thread doesn't block.
- **Worker threads / child processes:** Node provides `worker_threads` (shared memory via `SharedArrayBuffer`) for offloading CPU work without serializing through the event loop; `child_process`/`cluster` fork separate processes and are useful for isolating memory and CPU.

**Architectural implication:** separate concerns — keep I/O asynchronous in the JS thread; offload CPU to workers or separate processes.

---

### 2) Event loop phases & task types (practical mental model)

High-level phases (libuv):

1. **Timers** — callbacks scheduled by `setTimeout` and `setInterval` whose threshold has elapsed.
2. **Pending callbacks** — certain system-level callbacks.
3. **Idle/prepare** — internal.
4. **Poll** — retrieves new I/O events; executes their callbacks. This phase is where most I/O callbacks run.
5. **Check** — `setImmediate` callbacks run here.
6. **Close callbacks** — e.g., socket `close`.

**Microtasks & nextTick:**

- **process.nextTick queue**: processed _immediately_ after the current operation finishes and _before_ the event loop continues. This queue can starve the loop if abused.
- **Promise microtask queue**: standard microtasks (Promise callbacks) drained after nextTick, between macrotasks. Microtasks run sooner than the next macrotask.

**Example ordering (common confusion):**

- Synchronous code runs first.
- After a macrotask finishes, node drains `nextTick` queue, then Promise microtasks.
- Then the event loop picks the next phase (timers/poll/check/etc).

**Architectural implication:** Choosing `process.nextTick`, Promises, setImmediate, or setTimeout is a choice about _when_ you want work to execute relative to I/O and other timers. Use nextTick sparingly — it affects fairness.

---

### 3) I/O: where real non-blocking magic happens

- For sockets, libuv uses the OS event notification mechanisms (epoll/kqueue/IOCP) to receive notifications and defer callbacks to the poll phase.
- For many filesystem operations, Node uses the libuv thread pool to run blocking OS calls off the main thread.
- This means `fs.readFile` is _non-blocking from the JS perspective_, but internally it may use a worker thread.

**Architectural implication:** For heavy filesystem operations at scale, tune `UV_THREADPOOL_SIZE` or prefer streaming APIs (`fs.createReadStream`) to control memory and throughput.

---

### 4) CPU-bound work vs I/O-bound work

- **I/O-bound (network reads/writes, db queries):** benefit massively from Node’s async model.
- **CPU-bound (large JSON processing, crypto, image transforms):** will block the event loop — offload using `worker_threads` or separate processes.

**Architectural patterns:**

- Use streaming + backpressure for large data (avoid reading entire files into memory).
- Offload CPU-heavy transforms to worker threads or external microservices.

---

### 5) Error propagation & process lifecycle

- Uncaught exceptions: `process.on('uncaughtException', ...)` — will keep the process in uncertain state; best practice is to log and gracefully restart.
- Unhandled Promise rejections: `process.on('unhandledRejection', ...)` — treat as first-class errors; consider failing fast in production or tracking via telemetry.
- Prefer structured error boundaries and keep long-lived processes healthy via process managers (PM2/systemd/k8s).

---

### 6) Observability & measuring health

- **Event-loop latency:** use Node's `perf_hooks` (`monitorEventLoopDelay`) to measure event loop lag percentile and max. This is the best indicator that the thread is being blocked.
- **Thread pool utilization:** monitor blocking tasks that use libuv threadpool; increasing `UV_THREADPOOL_SIZE` is sometimes needed for many parallel fs/cipher operations.
- **Profiling:** use `--inspect` and Chrome DevTools / `clinic` / flamegraphs to find hotspots.

---

## Hands-on: code & explanation

### A) Callback example (fs uses libuv threadpool)

`callback-style.js`

```js
const fs = require('fs');

console.log('Start reading (callback)...');

fs.readFile('./sample.txt', 'utf8', (err, data) => {
  if (err) return console.error('read error', err);
  console.log('File content:', data.trim());
});

console.log('After readFile call (callback)');
```
