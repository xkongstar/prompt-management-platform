# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Prompt Management Platform built with Next.js 15+ using the App Router. It's a monolithic application that helps users manage, search, and organize their AI prompts with GitHub authentication.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Database**: SQLite with Prisma ORM
- **Authentication**: Auth.js (NextAuth v5) with GitHub OAuth
- **UI Components**: Shadcn/UI with Tailwind CSS
- **TypeScript**: Strict mode enabled

## Essential Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Build & Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run Next.js linter

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma Studio GUI
```

## Project Structure

The application follows Next.js App Router conventions:

- `/app` - App Router pages and API routes
  - `/api/auth/[...nextauth]` - Auth.js authentication endpoints
  - `/api/prompts` - CRUD API for prompts
  - `/dashboard` - Protected prompt management pages
  - `/auth/signin` - GitHub OAuth login page
- `/components` - Reusable React components (Shadcn/UI based)
- `/lib` - Utility functions and configurations
  - `/lib/auth.ts` - Auth.js configuration
  - `/lib/prisma.ts` - Prisma client singleton
- `/prisma` - Database schema and migrations
  - `schema.prisma` - Defines User, Prompt, and Auth.js models
  - `database.db` - SQLite database file (gitignored)

## Authentication Flow

The app uses GitHub OAuth as the sole authentication method:
1. Unauthenticated users are redirected to `/auth/signin`
2. GitHub OAuth handles authentication via Auth.js
3. Protected routes are enforced by `middleware.ts`
4. Session data is stored in SQLite via Prisma adapter

## Data Models

**Core Models:**
- `User` - GitHub authenticated users
- `Prompt` - User's prompts with title, content, and comma-separated tags
- Auth.js models: `Account`, `Session`, `VerificationToken`

## API Endpoints

- `GET/POST /api/prompts` - List user's prompts or create new
- `GET/PUT/DELETE /api/prompts/[id]` - Single prompt operations
- `/api/auth/*` - Auth.js managed endpoints

## Environment Variables

Create a `.env.local` file with:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]
GITHUB_ID=[from GitHub OAuth App]
GITHUB_SECRET=[from GitHub OAuth App]
```

## Development Workflow

1. Ensure environment variables are configured
2. Run `npx prisma generate` after schema changes
3. Use `npx prisma db push` to apply schema to database
4. Test authentication flow with GitHub OAuth
5. All prompts are user-scoped via userId foreign key