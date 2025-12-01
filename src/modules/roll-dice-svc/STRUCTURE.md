# Roll Dice Service Structure Visualization

## 📁 Directory Structure

```
roll-dice-svc/
│
├── 🚀 Entry Points
│   ├── index.ts              # Public SDK export
│   ├── server.ts             # Express server setup & startup
│   └── bootstrapper.ts       # Dependency injection container initialization
│
├── 🔧 Configuration
│   ├── registrations.ts      # DI container registrations (services, configs)
│   ├── mikro-orm.config.ts   # Database ORM configuration
│   ├── package.json          # Dependencies & scripts
│   ├── tsconfig.json         # TypeScript configuration
│   └── vitest.config.ts      # Test configuration
│
├── 🌐 API Layer
│   └── api/
│       ├── routes/
│       │   └── rollDiceSvc.routes.ts    # Route definitions (GET, POST)
│       └── controllers/
│           ├── index.ts
│           └── rollDiceSvc.controller.ts # Request handlers (GET, POST)
│
├── 🎯 Domain Layer
│   └── domain/
│       ├── interfaces/
│       │   └── rollDiceSvc.interface.ts  # Service interface contract
│       ├── types/
│       │   └── rollDiceSvc.types.ts      # DTOs (RequestDto, ResponseDto)
│       ├── schemas/
│       │   └── rollDiceSvc.schema.ts     # Validation schemas
│       └── mappers/
│           └── rollDiceSvc.mappers.ts    # Entity ↔ DTO mappers
│
├── 💼 Business Logic
│   └── services/
│       └── rollDiceSvc.service.ts        # Core business logic implementation
│
├── 💾 Persistence Layer
│   └── persistence/
│       ├── entities/
│       │   ├── index.ts
│       │   └── rollDiceSvcRecord.entity.ts # MikroORM entity definition
│       ├── seeders/
│       │   ├── index.ts
│       │   └── rollDiceSvcRecord.seeder.ts # Database seeding
│       ├── seed.data.ts                  # Seed data
│       └── seeder.ts                     # Seeder configuration
│
├── 🔌 SDK
│   └── sdk.ts                           # Client SDK for external consumers
│
└── 🧪 Tests
    └── __test__/
        ├── rollDiceSvc.test.ts          # Service tests
        └── test-utils.ts                # Test utilities
```

## 🔄 Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP Request                             │
│                    GET /roll-dice-svc                            │
│                    POST /roll-dice-svc                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  server.ts                                                       │
│  • Creates Express app                                           │
│  • Mounts routes                                                 │
│  • Registers SDK                                                 │
│  • Starts server                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  api/routes/rollDiceSvc.routes.ts                                │
│  • Defines router with base path '/roll-dice-svc'                │
│  • Registers GET and POST endpoints                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  api/controllers/rollDiceSvc.controller.ts                      │
│  • rollDiceSvcGet: Simple GET handler                           │
│  • rollDiceSvcPost: POST handler that:                          │
│    - Validates request body (via schema)                         │
│    - Creates service instance (via DI)                          │
│    - Calls service.rollDiceSvcPost()                            │
│    - Returns response                                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  services/rollDiceSvc.service.ts                                │
│  • BaseRollDiceSvcService implements RollDiceSvcService         │
│  • rollDiceSvcPost method:                                       │
│    - Maps DTO → Entity (via RequestMapper)                      │
│    - Persists entity to database                                 │
│    - Maps Entity → DTO (via ResponseMapper)                      │
│    - Returns response DTO                                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  domain/mappers/rollDiceSvc.mappers.ts                          │
│  • RollDiceSvcRequestMapper: DTO → Entity                       │
│  • RollDiceSvcResponseMapper: Entity → DTO                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  persistence/entities/rollDiceSvcRecord.entity.ts               │
│  • RollDiceSvcRecord extends SqlBaseEntity                      │
│  • Represents database table structure                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Architecture Layers

### 1. **Entry & Configuration Layer**
- **server.ts**: Express server initialization, route mounting, SDK registration
- **bootstrapper.ts**: Environment setup, DI container creation
- **registrations.ts**: Dependency injection registrations (singletons, scoped services)

### 2. **API Layer**
- **Routes**: Define HTTP endpoints and mount controllers
- **Controllers**: Handle HTTP requests, validate schemas, delegate to services

### 3. **Domain Layer**
- **Interfaces**: Define service contracts
- **Types**: DTOs for request/response
- **Schemas**: Validation schemas using schema validator
- **Mappers**: Transform between DTOs and entities

### 4. **Service Layer**
- **Business Logic**: Core application logic, orchestrates data operations

### 5. **Persistence Layer**
- **Entities**: MikroORM entity definitions (database models)
- **Seeders**: Database seeding logic

### 6. **SDK Layer**
- **sdk.ts**: Client SDK for external service consumers

## 🔗 Key Dependencies

```
bootstrapper.ts
  └─> registrations.ts
        └─> Creates DI container with:
            • Environment config (PROTOCOL, HOST, PORT, etc.)
            • MikroORM instance
            • OpenTelemetryCollector
            • EntityManager (scoped)
            • RollDiceSvcService (scoped)

server.ts
  ├─> bootstrapper.ts (for DI container)
  ├─> api/routes/rollDiceSvc.routes.ts
  └─> sdk.ts

rollDiceSvc.routes.ts
  ├─> bootstrapper.ts (for DI)
  └─> api/controllers/rollDiceSvc.controller.ts

rollDiceSvc.controller.ts
  ├─> bootstrapper.ts (for DI)
  ├─> domain/mappers/rollDiceSvc.mappers.ts
  └─> services/rollDiceSvc.service.ts (via DI)

rollDiceSvc.service.ts
  ├─> domain/interfaces/rollDiceSvc.interface.ts
  ├─> domain/types/rollDiceSvc.types.ts
  ├─> domain/mappers/rollDiceSvc.mappers.ts
  └─> persistence/entities/rollDiceSvcRecord.entity.ts

rollDiceSvc.mappers.ts
  ├─> domain/schemas/rollDiceSvc.schema.ts
  └─> persistence/entities/rollDiceSvcRecord.entity.ts
```

## 📊 Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **server.ts** | Application entry point, Express setup, route mounting |
| **bootstrapper.ts** | Environment initialization, DI container creation |
| **registrations.ts** | Dependency injection configuration |
| **routes** | HTTP endpoint definitions |
| **controllers** | Request handling, validation, service invocation |
| **services** | Business logic implementation |
| **mappers** | Data transformation (DTO ↔ Entity) |
| **entities** | Database model definitions |
| **schemas** | Request/response validation schemas |
| **types** | TypeScript type definitions for DTOs |
| **interfaces** | Service contracts |
| **sdk.ts** | External client SDK |

## 🎯 Design Patterns

1. **Dependency Injection**: All dependencies resolved via DI container
2. **Layered Architecture**: Clear separation between API, Domain, Service, and Persistence layers
3. **Repository Pattern**: EntityManager handles data access
4. **Mapper Pattern**: Separate mappers for request/response transformations
5. **Interface Segregation**: Service interfaces define contracts
6. **Scoped Services**: EntityManager and services are scoped per request

