# 🧠 Day 05 — File System & Process Management (Architectural Deep Dive)

## 🎯 Objective

To build a deep architectural understanding of how Node.js communicates with the operating system:

- How Node performs **non-blocking filesystem I/O** via libuv’s thread pool.
- How to spawn, pipe, and manage OS processes using `child_process`.
- How **IPC (Inter-Process Communication)** enables message passing between Node processes.
- When to offload CPU-heavy work into separate processes for scalability.

---

## Key Learnings (short)

- Node bridges JavaScript and the OS using **libuv**, which abstracts system calls like `read()`, `write()`, and `fork()`.
- File operations (`fs`) often use **libuv’s thread pool** for async execution, keeping the JS event loop free.
- Process creation (`child_process.spawn`, `exec`, `fork`) interfaces directly with OS-level `fork()` and `execvp()`.
- `exec` buffers the entire output before returning — best for short commands.
- `spawn` streams data — ideal for long-running processes.
- `fork` spawns a **new Node process** with built-in IPC channels for JSON-style message passing.
- Backpressure exists not only in streams but also in **OS I/O buffers** — the same flow-control principle applies at multiple layers.

---

## Architecture Deep Dive (detailed)

### 1) How Node talks to the OS

Node doesn’t perform disk or process operations itself; it delegates them through:

- **libuv:** a C library that wraps asynchronous I/O across platforms (Linux epoll, macOS kqueue, Windows IOCP).
- **Thread pool:** default size = 4 threads. Used for filesystem I/O and crypto when async APIs are called.
- **Kernel:** executes the real system calls (`read`, `write`, `open`, `fork`, etc.) and manages scheduling.

**Architectural implication:**
JavaScript remains single-threaded, but Node orchestrates parallelism underneath through libuv.
It’s _cooperative concurrency_, not preemptive — Node coordinates, libuv executes.

---

### 2) Async File I/O

**Example:**

```js
const fs = require('fs').promises;
(async () => {
  const data = await fs.readFile('./input.txt', 'utf-8');
  console.log('File content:', data);
})();
```

Flow:
JS → fs binding → C++ addon → libuv thread pool → OS syscall → callback queued → JS callback invoked.
The event loop stays free during disk access.

Architectural note:
Async filesystem operations mimic non-blocking behavior even though the OS I/O is still blocking — because libuv runs it in worker threads.
