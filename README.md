# Prompt Management Platform

A comprehensive platform for managing AI prompts with version control, collaboration, and advanced search capabilities.

## Features

- **User Authentication & Authorization**: Secure JWT-based authentication with role-based access control
- **Project Management**: Create and manage prompt collections with team collaboration
- **Prompt CRUD Operations**: Full lifecycle management of AI prompts with version control
- **Advanced Search**: Full-text search with filtering, tagging, and intelligent suggestions
- **Real-time Collaboration**: Invite team members with different permission levels
- **Version Control**: Track changes, compare versions, and revert to previous states
- **Modern UI**: Responsive React interface with Ant Design components

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT + Passport.js

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Ant Design 5.x
- **State Management**: Zustand + TanStack Query
- **Routing**: React Router v6

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Development**: Hot reload, auto-restart
- **Production**: Multi-stage builds, health checks

## Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git

### Development Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd prompt-management-platform
   \`\`\`

2. **Start development environment**
   \`\`\`bash
   make dev
   # or
   ./scripts/dev-setup.sh
   \`\`\`

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api-docs

### Production Deployment

1. **Configure environment**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with production values
   \`\`\`

2. **Deploy to production**
   \`\`\`bash
   make prod
   # or
   ./scripts/prod-deploy.sh
   \`\`\`

## Development

### Available Commands

\`\`\`bash
# Development
make dev          # Start development environment
make stop         # Stop all services
make logs         # View logs from all services
make clean        # Clean up containers and volumes

# Production
make prod         # Deploy to production
make backup       # Create database backup
make restore      # Restore database from backup

# Development Tools
make test         # Run tests
make lint         # Run linting
make db-shell     # Open database shell
make redis-shell  # Open Redis shell
\`\`\`

### Project Structure

\`\`\`
prompt-management-platform/
├── backend/                 # Backend API server
│   ├── src/                # Source code
│   ├── prisma/             # Database schema and migrations
│   ├── scripts/            # Utility scripts
│   └── Dockerfile          # Backend container configuration
├── frontend/               # Frontend React app
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   └── Dockerfile          # Frontend container configuration
├── docker/                 # Docker configurations
│   ├── nginx/              # Nginx configurations
│   └── redis/              # Redis configurations
├── scripts/                # Deployment and utility scripts
├── docker-compose.yml      # Development environment
├── docker-compose.prod.yml # Production environment
└── Makefile               # Development commands
\`\`\`

### Environment Variables

Key environment variables for configuration:

\`\`\`env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
POSTGRES_DB=promptdb
POSTGRES_USER=promptuser
POSTGRES_PASSWORD=secure-password

# Redis
REDIS_URL=redis://host:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# CORS
CORS_ORIGIN=https://yourdomain.com

# Frontend
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_APP_NAME=Prompt Management Platform
\`\`\`

## API Documentation

Interactive API documentation is available at `/api-docs` when the backend is running.

### Key Endpoints

- **Authentication**: `/api/v1/auth/*`
- **Projects**: `/api/v1/projects/*`
- **Prompts**: `/api/v1/prompts/*`
- **Search**: `/api/v1/search/*`
- **Tags**: `/api/v1/tags/*`

## Database

### Schema Overview

- **Users**: User accounts and authentication
- **Projects**: Prompt collections with access control
- **Prompts**: Individual AI prompts with metadata
- **PromptVersions**: Version history and change tracking
- **Tags**: Categorization and organization
- **ProjectCollaborators**: Team collaboration
- **UserFavorites**: User bookmarks

### Backup and Restore

\`\`\`bash
# Create backup
make backup

# Restore from backup
make restore BACKUP_FILE=./backups/promptdb_backup_20231201_120000.sql.gz
\`\`\`

## Security

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive request validation
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet.js security headers

## Monitoring

- **Health Checks**: Built-in health endpoints
- **Logging**: Structured logging with Winston
- **Metrics**: Container health monitoring
- **Error Tracking**: Centralized error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the development setup guide
