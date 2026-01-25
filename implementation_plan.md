# Migration Plan: GitHub, Neon, Vercel, & Railway

This plan outlines the steps to migrate the generic RIPD Manager application from a local SQLite setup to a cloud-native architecture using Neon (PostgreSQL), GitHub, Vercel (Frontend), and Railway (Backend).

## 1. Database Migration (Neon)
- [x] **Update Prisma Schema**: Change datasource provider from `sqlite` to `postgresql`.
- [x] **Environment Variables**: Update `.env` and `.env.example` to use `DATABASE_URL` format for PostgreSQL.
- [x] **Connection String**: Configured with Neon Pooler URL.
- [x] **Migration Script**: `npx prisma db push` used to sync schema.

## 2. Codebase Preparation
- [x] **Backend Adjustments**:
    - Ensure `PORT` is dynamic (process.env.PORT) for Railway.
    - Add `engines` field to `package.json` (also good practice for Railway).
- [x] **Frontend Adjustments**:
    - Prepared for Vercel deployment.

## 3. GitHub Repository Setup

## 4. Deployment Instructions (User Actions)
- **GitHub**: User will need to run the final `git push`.
- **Neon**: User needs to provide the connection string to put in `.env` (or set it in Render).
- **Render**: Connect repo, set build command `npm install && npm run db:generate`, start command `npm start`.
- **Vercel**: Connect repo, simple Next.js deployment.
