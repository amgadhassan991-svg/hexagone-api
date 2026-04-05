# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Project Manager (react-vite) — `/`

A B2B SaaS project management web app called **Orbit**. Features:
- Dashboard with KPI stats, activity feed, overdue tasks, project progress
- Projects: list, create, edit, delete projects with status/color/deadline
- Tasks: cross-project task list with filtering by status, priority, assignee
- Project detail: per-project task management
- Team: view, add, edit, remove team members
- Settings: placeholder page

### API Server — `/api`

Express 5 backend with:
- `GET /api/projects` — list projects with task counts
- `POST/GET/PUT/DELETE /api/projects/:id` — project CRUD
- `GET /api/tasks` — list tasks with filtering
- `POST/GET/PUT/DELETE /api/tasks/:id` — task CRUD
- `GET/POST /api/members` — team member management
- `PUT/DELETE /api/members/:id`
- `GET /api/dashboard/summary` — KPI counts
- `GET /api/dashboard/activity` — recent activity feed
- `GET /api/dashboard/overdue-tasks` — overdue tasks
- `GET /api/dashboard/project-progress` — per-project progress breakdown

## Database Schema

Tables: `projects`, `tasks`, `members`, `activity`

- `projects`: id, name, description, status, color, due_date, created_at, updated_at
- `tasks`: id, title, description, status, priority, project_id, assignee_id, due_date, created_at, updated_at
- `members`: id, name, email, role, avatar_url, created_at, updated_at
- `activity`: id, type, description, entity_id, entity_type, created_at
