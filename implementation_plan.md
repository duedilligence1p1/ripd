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

## 4. Deployment Instructions (Completed)
- [x] **GitHub**: Repository pushed to `duedilligence1p1/ripd`.
- [x] **Neon**: Database configured, schema synced, and seeded.
- [x] **Backend (Railway)**: 
  - Service configured with Root Directory `/backend`.
  - Build Command: `npm install && npm run db:generate`.
  - Start Command: `node src/index.js`.
  - Env Vars: `DATABASE_URL`, `JWT_SECRET`, `PORT=3001`.
  - Deployed successfully and handling CORS.
- [x] **Frontend (Vercel)**:
  - Project imported with Root Directory `frontend`.
  - Env Var: `NEXT_PUBLIC_API_URL` pointing to Railway HTTPS URL.
  - Deployed successfully.

# Status: MIGRATION COMPLETE 🚀
