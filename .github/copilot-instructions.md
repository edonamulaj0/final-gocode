# Copilot Instructions for AI Coding Agents

## Project Overview

- **Type:** Next.js 13+ app (App Router) with TypeScript, Prisma ORM, and custom admin/student UI components.
- **Demo Flow:**
  - The homepage is removed. All users are redirected to the login page (`/auth/signin`) by default.
  - After login, users land directly on the dashboard.
  - Consistent color theme and design are enforced throughout the app (see `app/globals.css`).
- **Structure:**
  - `app/` — Next.js routes (admin, auth, courses, API endpoints)
  - `components/` — React UI, split by domain (admin, student, layout, pages, ui)
  - `lib/` — Shared logic (Prisma client, auth, constants, utils)
  - `prisma/` — Prisma schema, migrations, seed scripts
  - `public/` — Static assets
  - `scripts/` — DB/setup scripts
  - `src/types/` — TypeScript types for core entities

## Key Patterns & Conventions

- **API routes:**
  - Located in `app/api/` (RESTful, file-based routing)
  - Use nested folders for resource hierarchy (e.g., `courses/[courseId]/modules/`)
- **Prisma:**
  - DB schema in `prisma/schema.prisma`
  - Access via `lib/prisma.ts`
  - Seed with `prisma/seed.ts`
- **Auth:**
  - NextAuth.js, configured in `app/api/auth/[...nextauth]/route.ts`
  - Use `components/AuthProvider.tsx` for context
- **UI:**
  - Admin/student UIs are separated in `components/admin/` and `components/student/`
  - Shared UI in `components/ui/`
- **Type Safety:**
  - Types in `src/types/` (e.g., `course.ts`, `student.ts`)
  - Prefer explicit imports from this directory

## Developer Workflows

- **Install:** `npm install`
- **Dev server:** `npm run dev`
- **Prisma DB:**
  - Migrate: `npx prisma migrate dev`
  - Seed: `npm run seed` or `node prisma/seed.ts`
  - Setup: `scripts/setup-db.*` (cross-platform)
- **Build:** `npm run build`
- **Lint:** `npm run lint`

## Integration & Data Flow

- **API <-> UI:**
  - UI fetches data via `/api/` endpoints (see `app/api/`)
  - Use React hooks for data fetching/state (see `components/admin/course-management/useCourseManagement.ts`)
- **Auth Context:**
  - Use `AuthProvider` for session/context in UI
- **Cross-component:**
  - Prefer passing props, avoid global state unless via context/provider

## Examples

- **Course management:** `components/admin/course-management/`
- **Student progress:** `components/admin/StudentProgressMonitoring.tsx`, `app/api/admin/student-progress/`
- **Level logic:** `lib/constants/student-levels.ts`, `lib/utils/level-hierarchy.ts`

## Special Notes

- **Demo credentials are seeded in the database for demonstration:**
  - **Admin:** admin@gocode.com / admin123
  - **Instructor:** instructor@gocode.com / admin123
  - **Student:** student@gocode.com / password123
- **Do not edit files in `prisma/migrations/` directly.**
- **All new types go in `src/types/` and should be imported explicitly.**
- **Follow Next.js App Router conventions for new routes/components.**

---

For questions or unclear patterns, ask for clarification or check similar files in the relevant directory.
