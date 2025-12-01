# Dice Roll Service

A modern dice rolling API service built with ForkLaunch, featuring comprehensive monitoring, database persistence, and a clean layered architecture.

## 🎲 Features

- **Dice Rolling API**: Roll dice with configurable number of sides
- **Statistics Tracking**: View statistics about all dice rolls
- **Database Persistence**: PostgreSQL database for storing roll history
- **Monitoring Stack**: Integrated Grafana, Prometheus, Tempo, and Loki for observability
- **OpenTelemetry**: Distributed tracing and metrics collection
- **Type-Safe**: Built with TypeScript for type safety
- **Docker Support**: Complete Docker Compose setup for easy development

## 🛠️ Tech Stack

- **Framework**: ForkLaunch (Express-based)
- **Language**: TypeScript
- **Database**: PostgreSQL with MikroORM
- **Monitoring**: 
  - Grafana (Dashboards)
  - Prometheus (Metrics)
  - Tempo (Tracing)
  - Loki (Logs)
  - OpenTelemetry Collector
- **Package Manager**: pnpm
- **Testing**: Vitest
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)
- [Docker](https://www.docker.com/) and Docker Compose

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd diceRoll
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up the database:
```bash
pnpm database:setup
```

This command will:
- Build the project
- Initialize database migrations
- Run migrations
- Seed the database with initial data

### Running the Application

#### Development Mode (Docker Compose)

Start all services (API, database, monitoring stack):
```bash
pnpm dev
```

This will start:
- **API Server**: http://localhost:8000
- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100
- **Tempo**: http://localhost:3200
- **PostgreSQL**: localhost:5432

#### Development Mode (Local)

For local development without Docker:
```bash
cd src/modules/roll-dice-svc
pnpm dev:local
```

Make sure PostgreSQL is running and configured in `.env.local`.

#### Production Mode

```bash
pnpm build
pnpm start
```

## 📡 API Endpoints

### Base URL
- Development: `http://localhost:8000`
- API Version: `v1`
- Documentation: `http://localhost:8000/api/v1/docs`

### Dice Router (`/dice-rtr`)

#### GET `/dice-rtr`
Simple health check endpoint.

**Response:**
```json
{
  "message": "hello, world!"
}
```

#### POST `/dice-rtr`
Basic POST endpoint.

**Request Body:**
```json
{
  // Request schema defined in DiceRtrRequestSchema
}
```

**Response:**
```json
{
  "message": "hello, world!"
}
```

#### POST `/dice-rtr/roll`
Roll a dice with specified number of sides.

**Request Body:**
```json
{
  "sides": 6  // Number of sides on the dice
}
```

**Response:**
```json
{
  "result": 4,  // The rolled value
  "sides": 6,   // Number of sides
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### GET `/dice-rtr/stats`
Get statistics about all dice rolls.

**Response:**
```json
{
  "totalRolls": 100,
  "averageRoll": 3.5,
  "distribution": {
    "1": 15,
    "2": 18,
    "3": 17,
    "4": 16,
    "5": 17,
    "6": 17
  }
}
```

### Roll Dice Service (`/roll-dice-svc`)

#### GET `/roll-dice-svc`
Simple health check endpoint.

#### POST `/roll-dice-svc`
Post endpoint for roll dice service operations.

**Request Body:**
```json
{
  // Request schema defined in RollDiceSvcRequestMapper
}
```

## 🧪 Testing

Run all tests:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test --watch
```

## 🗄️ Database Management

### Migrations

Create a new migration:
```bash
pnpm migrate:create
```

Run migrations:
```bash
pnpm migrate:up
```

Rollback migrations:
```bash
pnpm migrate:down
```

Initialize migrations (first time setup):
```bash
pnpm migrate:init
```

### Seeding

Seed the database with initial data:
```bash
pnpm seed
```

## 📊 Monitoring

The application includes a complete monitoring stack:

- **Grafana**: Access at http://localhost:3000
  - Default credentials: `admin` / `admin`
  - Pre-configured dashboards and datasources

- **Prometheus**: Access at http://localhost:9090
  - Metrics collection and querying

- **Tempo**: Access at http://localhost:3200
  - Distributed tracing backend

- **Loki**: Access at http://localhost:3100
  - Log aggregation

All monitoring services are automatically configured and connected via Docker Compose.

## 🏗️ Project Structure

```
diceRoll/
├── src/modules/
│   ├── core/              # Core utilities and shared code
│   ├── monitoring/        # Monitoring configuration
│   ├── roll-dice-svc/     # Main dice rolling service
│   │   ├── api/           # API routes and controllers
│   │   ├── domain/        # Domain models, schemas, mappers
│   │   ├── persistence/   # Database entities and seeders
│   │   ├── services/      # Business logic
│   │   └── server.ts      # Express server setup
│   └── universal-sdk/     # Shared SDK
├── docker-compose.yaml    # Docker services configuration
└── README.md
```

For detailed service structure, see [STRUCTURE.md](src/modules/roll-dice-svc/STRUCTURE.md).

## 🔧 Development Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all modules |
| `pnpm dev` | Start development environment with Docker |
| `pnpm test` | Run tests |
| `pnpm lint` | Lint code |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm format` | Format code with Prettier |
| `pnpm database:setup` | Set up database (migrate + seed) |
| `pnpm migrate:up` | Run database migrations |
| `pnpm migrate:down` | Rollback migrations |
| `pnpm seed` | Seed database |

## 📝 Environment Variables

Create `.env.local` for local development:

```env
NODE_ENV=development
HOST=0.0.0.0
PROTOCOL=http
PORT=8000
VERSION=v1
DOCS_PATH=/docs

# Database
DB_NAME=dice-roll-node-app-roll-dice-svc-dev
DB_HOST=localhost
DB_USER=postgresql
DB_PASSWORD=postgresql
DB_PORT=5432

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=dice-roll-node-app-roll-dice-svc
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

**SRTd Solutions**

## 🙏 Acknowledgments

- Built with [ForkLaunch](https://forklaunch.com/) framework
- Monitoring stack powered by Grafana, Prometheus, Tempo, and Loki
