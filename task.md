# Task List: Cloud Migration

- [x] **Database Setup** <!-- id: 0 -->
    - [x] Update `backend/prisma/schema.prisma` to use `postgresql` <!-- id: 1 -->
    - [x] Update `.env.example` in backend with PG connection string example <!-- id: 2 -->
    - [x] Delete `backend/prisma/migrations` (SQLite migrations won't work) <!-- id: 3 -->
- [x] **Backend Configuration** <!-- id: 4 -->
    - [x] Verify `backend/src/index.js` uses `process.env.PORT` <!-- id: 5 -->
    - [x] Add `engines` to `backend/package.json` <!-- id: 6 -->
- [x] **Git Initialization** <!-- id: 7 -->
    - [x] Check/Create `.gitignore` for root, backend, and frontend <!-- id: 8 -->
    - [x] Initialize git repo <!-- id: 9 -->
    - [x] Add remote `duedilligence1p1/ripd` <!-- id: 10 -->
    - [x] Commit current state <!-- id: 11 -->
