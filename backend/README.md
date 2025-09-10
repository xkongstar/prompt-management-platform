# Prompt Management Platform - Backend

A comprehensive backend API for managing AI prompts with version control, collaboration, and advanced search capabilities.

## Features

- **User Authentication & Authorization**: JWT-based auth with role-based access control
- **Project Management**: Create and manage prompt collections with team collaboration
- **Prompt CRUD Operations**: Full lifecycle management of AI prompts
- **Version Control**: Track changes and revert to previous versions
- **Advanced Search**: Full-text search with filtering and suggestions
- **Tag System**: Organize prompts with customizable tags
- **Collaboration**: Invite team members with different permission levels
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT + Passport.js
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

1. **Clone and setup**
   \`\`\`bash
   cd backend
   npm install
   \`\`\`

2. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   # Initialize PostgreSQL database
   psql -U postgres -f scripts/init-database.sql
   
   # Setup database schema and seed data
   npm run db:setup
   \`\`\`

4. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

The API will be available at `http://localhost:8000`

### API Documentation

Visit `http://localhost:8000/api-docs` for interactive API documentation.

## Database Schema

### Core Models

- **Users**: User accounts with authentication
- **Projects**: Prompt collections with access control
- **Prompts**: Individual AI prompts with metadata
- **PromptVersions**: Version history for prompts
- **Tags**: Categorization system
- **ProjectCollaborators**: Team collaboration
- **UserFavorites**: User bookmarks

### Key Features

- **Full-text Search**: PostgreSQL GIN indexes for fast text search
- **Soft Deletes**: Preserve data integrity
- **Audit Trail**: Track all changes with timestamps
- **Flexible Permissions**: Role-based access control

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/profile` - Get user profile

### Projects
- `GET /api/v1/projects` - List projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project

### Prompts
- `GET /api/v1/prompts` - List prompts with filtering
- `POST /api/v1/prompts` - Create prompt
- `GET /api/v1/prompts/:id` - Get prompt details
- `PUT /api/v1/prompts/:id` - Update prompt
- `DELETE /api/v1/prompts/:id` - Delete prompt
- `GET /api/v1/prompts/:id/versions` - Get version history

### Search
- `GET /api/v1/search/prompts` - Search prompts
- `GET /api/v1/search/suggestions` - Get search suggestions

## Development

### Database Operations

\`\`\`bash
# Generate Prisma client
npm run db:generate

# Create migration
npm run db:migrate

# Reset database (development only)
npm run db:reset

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
\`\`\`

### Code Quality

\`\`\`bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Watch mode
npm run test:watch
\`\`\`

## Deployment

### Environment Variables

Required environment variables for production:

\`\`\`env
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=https://yourdomain.com
\`\`\`

### Build and Start

\`\`\`bash
# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Security

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin requests
- **Helmet**: Security headers
- **Password Hashing**: bcrypt with salt rounds

## Monitoring

- **Health Check**: `GET /health`
- **Logging**: Structured logging with Winston
- **Error Handling**: Centralized error management
- **API Documentation**: Auto-generated Swagger docs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
