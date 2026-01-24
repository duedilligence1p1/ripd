# Task List: Cloud Migration

- [ ] **Database Setup** <!-- id: 0 -->
    - [ ] Update `backend/prisma/schema.prisma` to use `postgresql` <!-- id: 1 -->
    - [ ] Update `.env.example` in backend with PG connection string example <!-- id: 2 -->
    - [ ] Delete `backend/prisma/migrations` (SQLite migrations won't work) <!-- id: 3 -->
- [ ] **Backend Configuration** <!-- id: 4 -->
    - [ ] Verify `backend/src/index.js` uses `process.env.PORT` <!-- id: 5 -->
    - [ ] Add `engines` to `backend/package.json` <!-- id: 6 -->
- [ ] **Git Initialization** <!-- id: 7 -->
    - [ ] Check/Create `.gitignore` for root, backend, and frontend <!-- id: 8 -->
    - [ ] Initialize git repo <!-- id: 9 -->
    - [ ] Add remote `duedilligence1p1/ripd` <!-- id: 10 -->
    - [ ] Commit current state <!-- id: 11 -->
