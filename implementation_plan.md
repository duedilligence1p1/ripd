# Migration Plan: GitHub, Neon, Vercel, & Render

This plan outlines the steps to migrate the generic RIPD Manager application from a local SQLite setup to a cloud-native architecture using Neon (PostgreSQL), GitHub, Vercel (Frontend), and Render (Backend).

## 1. Database Migration (Neon)
- [ ] **Update Prisma Schema**: Change datasource provider from `sqlite` to `postgresql`.
- [ ] **Environment Variables**: Update `.env` and `.env.example` to use `DATABASE_URL` format for PostgreSQL.
- [ ] **Dependencies**: Ensure necessary database drivers are installed (Prisma Client supports PG out of the box, but we'll verify).
- [ ] **Migration Script**: create a generic migration to initialize the schema on the new DB.

## 2. Codebase Preparation
- [ ] **Backend Adjustments**:
    - Ensure `PORT` is dynamic (process.env.PORT) for Render.
    - Add `engines` field to `package.json` for Node version consistency.
- [ ] **Frontend Adjustments**:
    - Build scripts are already `next build`, which is good for Vercel.
    - Ensure environment variables for the API URL are dynamic.

## 3. GitHub Repository Setup
- [ ] Initialize Git repository (if not present).
- [ ] Create `.gitignore` files (backend/frontend) to exclude node_modules, .env, etc.
- [ ] Add remote origin: `https://github.com/duedilligence1p1/ripd.git`.
- [ ] Stage and Commit all files.

## 4. Deployment Instructions (User Actions)
- **GitHub**: User will need to run the final `git push`.
- **Neon**: User needs to provide the connection string to put in `.env` (or set it in Render).
- **Render**: Connect repo, set build command `npm install && npm run db:generate`, start command `npm start`.
- **Vercel**: Connect repo, simple Next.js deployment.
