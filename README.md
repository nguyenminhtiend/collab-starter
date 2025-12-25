# Project Plan: Real-time Collaboration Tool (Modular Monolith)

**Goal:** Build a high-performance, real-time collaboration engine (similar to Figma/Google Docs) capable of handling concurrent editing with low latency.

**Architecture:** Modular Monolith
**Repo Strategy:** Monorepo (pnpm workspaces)
**Environment Manager:** mise

---

## 1. Technology Stack

| Component          | Technology           | Rationale                                                                   |
| :----------------- | :------------------- | :-------------------------------------------------------------------------- |
| **Env Management** | **mise**             | Unified version management for Node, Bun, and tools via `mise.toml`.        |
| **Runtime**        | **Node.js 24 (LTS)** | Production stability, native WebSocket optimizations, mature observability. |
| **Build/Tooling**  | **pnpm**             | efficient, determinstic package manager.                                    |
| **API Framework**  | **Hono**             | Standards-based, type-safe RPC, runs on Node adapter (`@hono/node-server`). |
| **WebSockets**     | **`@hono/node-ws`**  | Wraps the battle-tested `ws` library for stability.                         |
| **Frontend**       | **React Router v7**  | SPA Mode. No SSR/Hydration overhead for the heavy client editor.            |
| **Database**       | **PostgreSQL 18**    | Leveraging Native **UUIDv7** keys and **Async I/O** for write throughput.   |
| **ORM**            | **Drizzle ORM**      | Lightweight, SQL-like, 0-runtime overhead.                                  |
| **Logging**        | **Pino**             | Structured JSON logging with `requestId` tracing via `hono-pino`.           |
| **Testing**        | **Vitest**           | Fast parallel testing with Database Template Cloning.                       |

---

## 2. Environment Setup

We use **mise** to lock tool versions across the team and CI.

**`mise.toml`** configuration:

```toml
[tools]
node = "24"

pnpm = "latest"
```

**Workflow:**

```bash
# Install tools
mise install

# Initialize Monorepo
pnpm init
```

## 3. Monorepo Structure

```plaintext
/root
├── package.json              # { "type": "module" }
├── pnpm-workspace.yaml
├── mise.toml
├── apps/
│   ├── web/                  # React Router v7 (SPA)
│   └── api/                  # Hono + Node 24
│       ├── src/
│       │   ├── container.ts  # Raw DI Container
│       │   ├── index.ts      # Server Entry
│       │   └── modules/      # Vertical Slices (Auth, Doc, etc.)
└── packages/
    ├── database/             # Drizzle Schema & Client
    ├── testing/              # Isolated DB Test Utilities
    └── shared-types/         # RPC Types shared between API/Web
```

## 4. Database Design (PostgreSQL 18)

We use a "Polyglot-within-Postgres" strategy.

### A. Operations Log (The "NoSQL" Table)

Stores the high-velocity stream of edit events.

**Table:** `operations`

**Primary Key:** `(doc_id, version, created_at)`

**Performance Tuning:**

- **UUIDv7:** Time-ordered IDs to prevent B-Tree index fragmentation.
- **Partitioning:** Range Partitioned by created_at (Monthly/Weekly).
- **Async I/O:** Enabled (PG18 feature) to handle massive concurrent inserts.

### B. Snapshots (The "Blob" Table)

Stores full document state to speed up loading.

**Table:** `snapshots`

**Storage:** Relies on Postgres TOAST to compress large JSON/Binary blobs automatically.

### C. Metadata

Standard relational tables (users, permissions, workspaces).

## 5. Application Architecture

### Dependency Injection (Raw Code Pattern)

We avoid heavy DI frameworks like NestJS. We use manual injection via a singleton container that holds the database connection.

```typescript
// apps/api/src/container.ts
import { createDb } from '@my-app/database';

export const container = {
  // The only stateful singleton we manage
  db: createDb(process.env.DATABASE_URL),
};
```

### Real-time Protocol (Hybrid)

**Initial Load (HTTP):** `GET /documents/:id`

- **Returns:** Snapshot (v100) + CatchUpOps (v101-v105).
- **Why:** Fast first paint, cacheable.

**Live Sync (WebSocket):** `/ws?docId=...`

- **Upstream:** `edit_op` (Batched), `cursor_move` (Throttled).
- **Downstream:** `remote_op`, `ack`, `presence_update`.

**Conflict Resolution:**

- Client keeps a "Pending" queue.
- On remote conflict: `Undo Local -> Apply Remote -> Transform Local -> Redo Local`.

## 6. Testing Strategy (Template Cloning)

We enable parallel execution of integration tests by giving every test file its own isolated database schema.

**Global Setup:**

1. Drop/Create `test_template_db`.
2. Run Drizzle Migrations ONCE on the template.

**Per Test File:**

1. Run `CREATE DATABASE test_xyz TEMPLATE test_template_db`.
2. Cost: ~20ms per file.

**Per Test Case:**

1. Run `TRUNCATE` on all tables.
2. Cost: ~5ms per test.

## 7. Deployment (Hybrid Docker)

We use a multi-stage build to leverage Bun's speed for installing dependencies, but Node's image for running the production server.

**Dockerfile Strategy:**

**Stage 1 (Builder):** `node:24-bookworm-slim`

- **Action:** `corepack enable && pnpm install --frozen-lockfile` & `pnpm run build`.

**Stage 2 (Runner):** `node:22-bookworm-slim` (Migrate to 24-bookworm when stable image exists).

- **Action:** `node apps/api/dist/index.js`.
- **Security:** Run as non-root node user.

## 8. Implementation Roadmap

### Phase 1: Foundation

- [ ] Initialize Monorepo with mise and pnpm.
- [ ] Setup `packages/database` with Drizzle & Postgres 18.
- [ ] Setup `packages/testing` with Template Cloning logic.
- [ ] Create `apps/api` with Hono + Node adapter.

### Phase 2: Core Real-time

- [ ] Implement operations table with UUIDv7.
- [ ] Setup WebSocket handler in Hono.
- [ ] Implement "Snapshot + Replay" loading logic.

### Phase 3: Client & Collaboration

- [ ] Setup `apps/web` with React Router v7.
- [ ] Implement Client-side State Machine (Connecting -> CatchUp -> Synced).
- [ ] Implement Optimistic UI & Re-base logic.

### Phase 4: Production Readiness

- [ ] Setup Pino Logger with Request Tracing.
- [ ] Configure Redis Pub/Sub for Presence (Cursors).
- [ ] Finalize Dockerfile.
