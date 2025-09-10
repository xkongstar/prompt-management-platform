# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Prompt Management Platform** - a full-stack application for managing AI prompts with version control, collaboration features, and advanced search capabilities. The platform consists of a React frontend, Express backend, PostgreSQL database, and Redis cache, all containerized with Docker.

## Essential Commands

### Quick Start
```bash
# Start everything with one command
./start.sh

# Or use Make
make dev

# Stop services
./stop.sh
# or
make stop

# View logs
docker-compose logs -f [service_name]  # service_name: backend, frontend, postgres, redis
```

### Backend Development
```bash
cd backend

# Development server with hot reload
npm run dev

# Database operations
npm run db:migrate      # Run new migrations
npm run db:push         # Push schema changes without migration
npm run db:studio       # Open Prisma Studio GUI
npm run db:seed         # Run seed data
npm run db:reset        # Reset database completely

# Testing and quality
npm run test            # Run Jest tests
npm run test:watch      # Run tests in watch mode
npm run lint            # Check ESLint issues
npm run lint:fix        # Auto-fix ESLint issues

# Build
npm run build           # Compile TypeScript to dist/
```

### Frontend Development
```bash
cd frontend

# Development
npm run dev             # Vite dev server on port 3000
npm run build           # Production build
npm run preview         # Preview production build
npm run lint            # ESLint checking
```

### Docker Operations
```bash
# Container management
docker-compose exec backend sh     # Shell into backend container
docker-compose exec postgres psql -U promptuser -d promptdb  # Database console
docker-compose exec redis redis-cli  # Redis console

# Clean restart
docker-compose down -v  # Remove containers and volumes
docker-compose up -d    # Start fresh
```

### Database Console Commands
```sql
-- When inside psql
\dt                     -- List all tables
\d+ "users"            -- Describe users table structure
\d+ "prompts"          -- Describe prompts table structure
SELECT * FROM "users" LIMIT 5;
SELECT * FROM "projects" WHERE visibility = 'PUBLIC';
```

## Architecture Overview

### Core Architecture Pattern
The application follows a **layered architecture** with clear separation:

1. **API Layer** (Express Routes) → Handles HTTP requests, authentication, validation
2. **Service Layer** → Business logic, orchestration, complex operations
3. **Data Layer** (Prisma ORM) → Database operations, transactions
4. **Cache Layer** (Redis) → Session storage, frequently accessed data

### Authentication Flow
- JWT-based authentication with refresh tokens
- Tokens stored in httpOnly cookies
- Refresh token rotation for security
- Role-based access control (USER/ADMIN roles)

### Data Model Relationships
```
User (1) ──→ (N) Project (owner)
User (N) ←→ (N) Project (via ProjectCollaborator)
Project (1) ──→ (N) Prompt
Prompt (1) ──→ (N) PromptVersion
Project (1) ──→ (N) Tag
Prompt (N) ←→ (N) Tag (via PromptTag)
User (N) ←→ (N) Prompt (via UserFavorite)
```

### API Structure
All API endpoints follow RESTful conventions under `/api/v1/`:
- `/auth/*` - Authentication (login, register, refresh, logout)
- `/projects/*` - Project CRUD and collaboration
- `/prompts/*` - Prompt management and versioning
- `/tags/*` - Tag operations within projects
- `/search/*` - Full-text and filtered search

### Frontend State Management
- **Zustand** stores for client-side state (auth, UI)
- **TanStack Query** for server state with:
  - Automatic caching and background refetching
  - Optimistic updates for better UX
  - Query invalidation on mutations

## Critical Files and Their Purposes

### Backend Core Files
- `backend/src/middleware/auth.ts` - JWT verification and user attachment
- `backend/src/services/auth.service.ts` - Authentication logic and token management
- `backend/src/services/prompt.service.ts` - Prompt versioning and collaboration checks
- `backend/prisma/schema.prisma` - Database schema definition

### Frontend Core Files
- `frontend/src/stores/authStore.ts` - Authentication state management
- `frontend/src/services/api.ts` - Axios instance with interceptors
- `frontend/src/components/ProtectedRoute.tsx` - Route authentication guard
- `frontend/src/hooks/useAuth.ts` - Authentication hook with token refresh

### Configuration Files
- `docker-compose.yml` - Development environment setup
- `backend/.env` - Backend environment variables (auto-generated)
- `frontend/.env` - Frontend environment variables (auto-generated)

## Database Migration Strategy

Always use Prisma migrations for schema changes:
```bash
# Development workflow
cd backend
npx prisma migrate dev --name describe_your_change  # Creates and applies migration
npx prisma generate  # Regenerate Prisma Client

# Production deployment
npx prisma migrate deploy  # Apply pending migrations only
```

## Testing Approach

### Running Tests
```bash
# Backend tests
cd backend && npm run test

# Run specific test file
npx jest src/services/auth.service.test.ts

# Run with coverage
npx jest --coverage
```

### Test Database
Tests should use a separate test database. Set `DATABASE_URL` in test environment to a test database.

## Common Development Scenarios

### Adding a New API Endpoint
1. Define route in `backend/src/routes/`
2. Implement service logic in `backend/src/services/`
3. Add validation middleware if needed
4. Update Swagger documentation
5. Add corresponding frontend API call in `frontend/src/services/api/`

### Modifying Database Schema
1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change`
3. Update seed data if needed in `backend/prisma/seed.ts`
4. Generate TypeScript types with `npx prisma generate`

### Adding Frontend Feature
1. Create component in `frontend/src/components/`
2. Add API integration using TanStack Query hooks
3. Update routing if new page in `frontend/src/App.tsx`
4. Add to navigation if user-facing

## Environment Variables

### Critical Backend Variables
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret (generate with `openssl rand -hex 32`)
- `JWT_REFRESH_SECRET` - Refresh token secret
- `CORS_ORIGIN` - Frontend URL for CORS

### Critical Frontend Variables
- `VITE_API_URL` - Backend API base URL
- `VITE_APP_NAME` - Application display name

## Debugging Tips

### Backend Debugging
- Logs are in `backend/logs/` directory
- Use `docker-compose logs -f backend` for real-time logs
- Enable `LOG_LEVEL=debug` in backend/.env for verbose logging

### Database Issues
- Check connection: `docker-compose exec postgres pg_isready`
- View Prisma queries: Set `DEBUG=prisma:query` environment variable
- Use Prisma Studio: `cd backend && npx prisma studio`

### Frontend Debugging
- React Developer Tools for component inspection
- Network tab for API calls
- Check `VITE_API_URL` matches backend address

## Production Deployment

### Pre-deployment Checklist
1. Update production environment variables
2. Run database migrations: `npx prisma migrate deploy`
3. Build frontend: `cd frontend && npm run build`
4. Build backend: `cd backend && npm run build`
5. Use `docker-compose.prod.yml` for production

### Health Checks
- Backend health: `GET /health`
- Database health: Included in backend health check
- Redis health: Included in backend health check

## Performance Considerations

### Database Optimization
- Prisma includes connection pooling by default
- Add database indexes for frequently queried fields
- Use `findMany` with `take` and `skip` for pagination

### Caching Strategy
- Redis caches session data
- Frontend uses TanStack Query for request caching
- Static assets served by Nginx in production

## Security Notes

### Authentication Security
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire in 7 days, refresh tokens in 30 days
- Refresh token rotation prevents token replay

### API Security
- Rate limiting configured per IP
- Input validation on all endpoints
- SQL injection prevented by Prisma parameterized queries
- XSS prevention through React's default escaping