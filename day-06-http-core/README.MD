# 🧠 Day 06 — HTTP, Sockets & The Event Loop (Architectural Deep Dive)

## 🎯 Objective

Develop an architectural understanding of how Node’s **HTTP module** operates internally — from incoming TCP connections to request/response streaming:

- How HTTP sits on top of TCP sockets and integrates with libuv.
- The complete lifecycle of an HTTP request and response.
- How Node achieves concurrency without threads (through event-driven sockets).
- How streaming and backpressure work in HTTP servers.
- How Node manages multiple connections efficiently.

---

## Key Learnings (short)

- Node’s HTTP module is built atop the **net module**, which uses **libuv** for socket management.
- Every request in Node is a **stream**:
  `req` → Readable (incoming data),
  `res` → Writable (outgoing data).
- The event loop listens for socket events (`readable`, `writable`, `close`) and dispatches them via callbacks.
- Node’s HTTP server is single-threaded at the JavaScript level but uses the kernel’s asynchronous I/O under the hood.
- Backpressure ensures TCP buffers don’t overflow — Node’s event loop naturally cooperates with TCP windowing.
- Frameworks like Express and Fastify are thin abstractions over this raw model.

---

## Architecture Deep Dive (detailed)

### 1) Node’s HTTP Stack

```

+--------------------------------------------------+
| JavaScript Layer (http, https, net, url, stream) |
+--------------------------------------------------+
| C++ Bindings (http_parser, tcp_wrap.cc) |
+--------------------------------------------------+
| libuv (event loop, TCP I/O watchers) |
+--------------------------------------------------+
| OS Kernel (TCP/IP stack, syscalls) |
+--------------------------------------------------+

```

- **libuv** wraps OS-level non-blocking syscalls (`epoll`, `kqueue`, or `IOCP`).
- **http_parser (C++)** converts byte streams into structured HTTP requests and responses.
- **JavaScript API** (`http.createServer`) wires this into the event loop as a callback mechanism.

**Architectural implication:**
Node is not “multi-threaded HTTP”; it’s a **reactor pattern** system — all requests are handled through asynchronous events, not parallel threads.

---

### 2) Event Loop & I/O Cycle

When you run:

```js
http.createServer((req, res) => { ... })
```

Node:

1. Uses `net.createServer()` to open a TCP socket on the specified port.
2. Registers an **I/O watcher** in libuv for incoming connections.
3. When data arrives, libuv triggers the poll phase → Node’s `http_parser` parses bytes → emits a `request` event.
4. Your callback receives `req` and `res`, both streams managed by libuv underneath.

**Simplified data path:**

```
TCP socket → libuv I/O watcher → http_parser → JS callback(req, res)
```

---

### 3) Minimal HTTP Server

**File:** `basic-http-server.js`

```js
const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Day 06 — Node Core HTTP!');
});

server.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
```

**Flow:**

- Each new connection = new socket handled by libuv.
- Request data is streamed → parsed → converted to JS objects.
- The response is written as a stream; Node manages TCP flow control automatically.

---

### 4) Streaming Responses

**File:** `streaming-response.js`

```js
const http = require('http');

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    let i = 0;

    const interval = setInterval(() => {
      i++;
      res.write(`Chunk ${i}\n`);
      if (i === 5) {
        clearInterval(interval);
        res.end('Stream complete.\n');
      }
    }, 1000);
  })
  .listen(3001, () => console.log('🌀 Streaming server on http://localhost:3001'));
```

**Architectural Insight:**

- Each `res.write()` sends a packet over TCP.
- `res.end()` signals the connection should close (or stay alive for Keep-Alive).
- This streaming design allows real-time APIs and event-driven responses (e.g. Server-Sent Events).

---

### 5) Simple Router Example

**File:** `router-example.js`

```js
const http = require('http');

const routes = {
  '/': 'Home Page',
  '/about': 'About Page',
  '/contact': 'Contact Page'
};

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(routes[req.url] || '404 - Not Found');
  })
  .listen(3002, () => console.log('🧭 Router server at http://localhost:3002'));
```

**Conceptual View:**
Routing is just conditionals around URLs — Express wraps this logic with layered middlewares and parameter matching.

---

### 6) HTTP as a Client

**File:** `client-request.js`

```js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => console.log('BODY:', chunk));
  res.on('end', () => console.log('No more data.'));
});

req.on('error', (err) => console.error('Request error:', err));
req.end();
```

**Architectural Insight:**

- The same HTTP module powers both client and server.
- `http.request()` creates a TCP socket, handled asynchronously by libuv.
- Request → socket write; response → readable stream.

---

### 7) Backpressure and Flow Control

- `res.write()` returns `false` when the kernel send buffer is full → Node pauses writes.
- When the buffer drains, a `drain` event fires → Node resumes sending.
- This **backpressure** mechanism prevents excessive memory usage and ensures stable throughput.
- On the client side, `req.pause()` and `req.resume()` can control incoming flow.

**Architectural parallel:**
TCP’s windowing and Node’s stream backpressure are two layers of the same system — both ensure the producer never outruns the consumer.

---

### 8) Observability & Performance

**Code Snippet:**

```js
console.log({
  pid: process.pid,
  uptime: process.uptime(),
  memoryMB: (process.memoryUsage().rss / 1024 / 1024).toFixed(2)
});
```

**Command:**

```bash
curl -v http://localhost:3000
```

**Why:**
This lets you observe socket reuse (`Connection: keep-alive`), latency, and process resource behavior — showing how efficiently Node reuses system resources per connection.

---

## Commands Tried

```bash
npm init -y
node basic-http-server.js
node streaming-response.js
node router-example.js
node client-request.js
curl -v http://localhost:3000
```

---

## Reflection

🧠 **Clarity:**
Node’s HTTP model is an elegant layering of **TCP sockets + streams + event loop**.
Every request and response is a stream; every connection is managed by libuv without blocking the JS thread.
It’s fundamentally a _reactor pattern_, not a thread-per-request model.

⚡ **Confusion:**
Still want to explore how HTTPS and TLS handshakes integrate with Node’s event loop (OpenSSL binding in `tls_wrap.cc`).

---

### 📊 Score

| Metric           | Score (1–10) | Notes                                                       |
| :--------------- | :----------: | :---------------------------------------------------------- |
| Concept Clarity  |      8       | Understood full request/response lifecycle and socket flow. |
| Code Fluency     |      7       | Built servers, routers, and streaming endpoints manually.   |
| Reflection Depth |      7       | Connected TCP backpressure to Node stream behavior.         |

---

## 🧭 Architectural Summary

| Layer                     | Component                      | Responsibility                        |
| :------------------------ | :----------------------------- | :------------------------------------ |
| **JavaScript (Userland)** | `http`, `net`, `url`, `stream` | Developer APIs for HTTP/TCP           |
| **C++ Bindings**          | `tcp_wrap.cc`, `http_parser`   | Convert raw bytes ↔ JS objects        |
| **libuv**                 | I/O polling, socket event loop | Async non-blocking I/O orchestration  |
| **OS Kernel**             | TCP/IP stack, syscalls         | Real data transmission and scheduling |

**Conceptual takeaway:**
Node’s HTTP layer is a _streaming interface over sockets_, not a separate thread-per-request server.
It scales by **event multiplexing**, not by concurrency threads — which is why it handles tens of thousands of simultaneous connections efficiently.
