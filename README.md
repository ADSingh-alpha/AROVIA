# AROVIA Platform

> **AROVIA** — The Online Pitching Platform. Where visionary founders meet decision-making investors in real time.

---

## 🏗️ Architecture Overview

```
arovia-platform/
├── docker-compose.yml          # Infra: Postgres, Redis, Kafka (KRaft)
├── Makefile                    # Developer convenience commands
├── turbo.json                  # Turborepo pipeline config
├── package.json                # Yarn Workspaces root
├── .env.example                # Environment variable template
├── infra/
│   └── postgres/init.sql       # DB init & extension setup
├── frontend/                   # Next.js 14 (App Router) — Step 5
├── backend/
│   ├── packages/               # Shared packages (DB client, types)
│   ├── api-gateway/            # Request routing — Step 2
│   ├── auth-service/           # JWT auth — Step 2
│   ├── pitch-service/          # Pitch upload + Kafka emit — Step 3
│   ├── live-session-service/   # WebSocket + Redis pub/sub — Step 3
│   └── ledger-service/         # Bid/transaction records — Step 3+
└── ai-agent-37/                # Python FastAPI + LangChain agents — Step 4
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop ≥ 24.x
- Node.js ≥ 20.x + Yarn 1.x
- Python ≥ 3.10 + pip

### First-time Setup
```bash
# 1. Clone the repo
git clone https://github.com/your-org/arovia-platform.git
cd arovia-platform

# 2. Copy environment variables
cp .env.example .env
# Edit .env and fill in your secrets

# 3. Start infrastructure
make infra-up

# 4. Install all dependencies
make install

# 5. Start dev servers
make dev
```

### Optional Dev Tools
```bash
# Kafka UI (port 8080) + pgAdmin (port 5050)
make infra-tools
```

## 📡 Infrastructure Services

| Service      | Port  | Description                            |
|-------------|-------|----------------------------------------|
| PostgreSQL   | 5432  | Primary relational database            |
| Redis        | 6379  | Pub/Sub, session cache, bid events     |
| Kafka        | 9092  | Event streaming (KRaft mode)           |
| Kafka UI     | 8080  | Visual Kafka management (dev only)     |
| pgAdmin      | 5050  | PostgreSQL GUI (dev only)              |

## 🔌 Application Services

| Service              | Port  | Description                          |
|---------------------|-------|--------------------------------------|
| Frontend (Next.js)   | 3000  | AROVIA web application               |
| API Gateway          | 4000  | Unified request router               |
| Auth Service         | 4001  | JWT authentication & authorization   |
| Pitch Service        | 4002  | Pitch upload & management            |
| Live Session Service | 4003  | WebSocket real-time bidding          |
| Ledger Service       | 4004  | Bid & transaction records            |
| AI Agent 37          | 8000  | Python FastAPI + LangChain agents    |

## 🎯 Kafka Topics

| Topic               | Producer          | Consumer          |
|--------------------|-------------------|-------------------|
| `pitch.uploaded`    | pitch-service     | ai-agent-37       |
| `pitch.evaluated`   | ai-agent-37       | pitch-service     |
| `bid.placed`        | live-session      | ledger-service    |
| `bid.accepted`      | ledger-service    | live-session      |
| `session.started`   | live-session      | pitch-service     |
| `session.ended`     | live-session      | ledger-service    |
| `agent37.response`  | ai-agent-37       | pitch-service     |

## 🛠️ Make Commands

```bash
make help           # Show all available commands
make infra-up       # Start Postgres + Redis + Kafka
make infra-tools    # Start infra + Kafka UI + pgAdmin
make infra-down     # Stop all containers
make infra-reset    # Wipe data and restart fresh
make dev            # Start all dev servers (Turborepo)
make build          # Production build
make lint           # Lint all workspaces
make test           # Run all tests
make db-migrate     # Run Prisma migrations
make db-studio      # Open Prisma Studio
make ai-up          # Start AI Agent 37
```

## 📝 Build Progress

- [x] **Step 1** — Root Initialization & Infrastructure (Kafka, Postgres, Redis)
- [ ] **Step 2** — Backend API Gateway & Shared Packages
- [ ] **Step 3** — Event-Driven Microservices (Kafka Integration)
- [ ] **Step 4** — Python AI Layer (Agent 37)
- [ ] **Step 5** — Frontend Next.js Application

---

*Built with ❤️ for the AROVIA Hackathon*