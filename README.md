# Collab Starter

A real-time collaborative document editing application built with modern web technologies. Features live multi-user editing powered by Yjs CRDT (Conflict-free Replicated Data Types) and WebSocket communication.

## ✨ Features

- **Real-time Collaboration** - Multiple users can edit the same document simultaneously
- **Rich Text Editor** - Powered by TipTap with full formatting support
- **Conflict Resolution** - Uses Yjs CRDT for seamless merge of concurrent edits
- **Document Management** - Create, list, and manage documents via REST API
- **Persistent Storage** - PostgreSQL database with Drizzle ORM
- **Type-Safe** - End-to-end TypeScript with shared type definitions

## 🏗️ Architecture

This is a monorepo managed with pnpm workspaces, structured as follows:

```
collab-starter/
├── apps/
│   ├── api/        # REST API server (Hono)
│   ├── server/     # WebSocket collaboration server (Hono + Yjs)
│   └── web/        # Frontend application (React Router + TipTap)
├── packages/
│   ├── db/         # Shared database client & schema (Drizzle)
│   └── types/      # Shared TypeScript types & Zod schemas
└── mise.toml       # Task runner configuration
```

### Tech Stack

| Layer                | Technology                                      |
| -------------------- | ----------------------------------------------- |
| **Frontend**         | React 19, React Router 7, TipTap, TailwindCSS 4 |
| **API Server**       | Hono, Zod validation, Pino logging              |
| **WebSocket Server** | Hono, Yjs, Y-Protocols                          |
| **Database**         | PostgreSQL, Drizzle ORM                         |
| **Monorepo**         | pnpm workspaces                                 |
| **Runtime**          | Node.js 24                                      |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v24+
- [pnpm](https://pnpm.io/) v10+
- [mise](https://mise.jdx.dev/) (optional, for task management)
- PostgreSQL database

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd collab-starter
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create `.env` files in `apps/api` and `apps/server`:

   ```bash
   # apps/api/.env
   DATABASE_URL=postgres://user:password@localhost:5432/collab
   PORT=3000
   LOG_SQL=false

   # apps/server/.env
   DATABASE_URL=postgres://user:password@localhost:5432/collab
   WS_PORT=3001
   ```

4. **Run database migrations**

   ```bash
   mise run db:migrate
   # or
   pnpm --filter api db:migrate
   ```

5. **Seed the database (optional)**
   ```bash
   mise run db:seed
   # or
   pnpm --filter api db:seed
   ```

### Development

Start all servers using mise:

```bash
# Start API and WebSocket servers
mise run dev

# Start web frontend (in a separate terminal)
mise run dev:web
```

Or start individual services:

```bash
# API server (port 3000)
mise run dev:api

# WebSocket server (port 3001)
mise run dev:ws

# Web frontend (port 5173)
mise run dev:web
```

Using pnpm directly:

```bash
pnpm --filter api dev      # API server
pnpm --filter server dev   # WebSocket server
pnpm --filter web dev      # Web frontend
```

## 📁 Project Structure

### Apps

#### `apps/api` - REST API Server

- Document CRUD operations
- User management
- Runs on port 3000 by default

#### `apps/server` - WebSocket Server

- Real-time collaboration via WebSocket
- Yjs document synchronization
- Snapshot and change persistence
- Runs on port 3001 by default

#### `apps/web` - Frontend Application

- React Router for navigation
- TipTap rich text editor with collaboration extensions
- React Query for data fetching
- Radix UI components with TailwindCSS

### Packages

#### `packages/db` - Database Package

- Drizzle ORM schema definitions
- Database client configuration
- Migration and seed scripts

#### `packages/types` - Shared Types

- Zod schemas for validation
- TypeScript type definitions
- Shared between API, server, and web apps

## 🗄️ Database

### Schema Overview

- **users** - User accounts
- **documents** - Document metadata (title, owner, timestamps)
- **document_snapshots** - Yjs document state snapshots
- **document_changes** - Incremental Yjs updates

### Commands

```bash
# Generate new migration
mise run db:generate

# Apply migrations
mise run db:migrate

# Seed sample data
mise run db:seed
```

## 🔌 API Endpoints

### Documents

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/api/documents`     | List all documents  |
| GET    | `/api/documents/:id` | Get document by ID  |
| POST   | `/api/documents`     | Create new document |
| PUT    | `/api/documents/:id` | Update document     |
| DELETE | `/api/documents/:id` | Delete document     |

### WebSocket

| Endpoint                                   | Description                      |
| ------------------------------------------ | -------------------------------- |
| `ws://localhost:3001/collaboration/:docId` | Real-time document collaboration |

## 🛠️ Scripts

### Root Level

```bash
pnpm test      # Run tests across all packages
pnpm build     # Build all packages
pnpm dev:web   # Start web development server
pnpm build:web # Build web for production
```

### Mise Tasks

```bash
mise run dev         # Start API + WebSocket servers
mise run dev:api     # Start API server only
mise run dev:ws      # Start WebSocket server only
mise run dev:web     # Start web frontend
mise run db:generate # Generate DB migrations
mise run db:migrate  # Run DB migrations
mise run db:seed     # Seed database
```

## 📦 Building for Production

```bash
# Build all packages
pnpm build

# Build specific app
pnpm --filter api build
pnpm --filter server build
pnpm --filter web build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and not licensed for public distribution.
