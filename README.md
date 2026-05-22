# Flight-app

A full-stack flight booking PWA built with **React + Redux Toolkit**, **Node/Express**, and **Supabase**.


## Local Setup

### 1. Clone & install

```bash
# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Supabase setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the migration files **in order** in the Supabase SQL editor:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_rls.sql`
   - `supabase/migrations/003_functions.sql`
   - `supabase/migrations/004_seed.sql`
3. Enable **Realtime** on the `seats` table in Supabase Dashboard → Database → Replication

### 3. Environment variables

```bash
# server/.env
cp server/.env.example server/.env
# Fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

# client/.env
cp client/.env.example client/.env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 4. Run

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

App runs at `http://localhost:5173`

---

## Redux Store Structure

```
store/
  slices/
    authSlice.js      — user session, login/signup/logout thunks
                        persists: session token in localStorage (key: sb-session)

    flightsSlice.js   — search results, selected flight
                        persists: searchQuery in localStorage (key: flight-search)

    seatsSlice.js     — seat map, optimistic seat selection
                        no persistence (always fetched fresh + Realtime)

    bookingsSlice.js  — booking list, in-progress draft, confirmation
                        persists: booking draft in localStorage (key: booking-draft)
                        EXCLUDES: passport_no from localStorage (sensitive data)
```

### Key design decisions
- **Optimistic seat selection** — `selectSeat` updates Redux immediately; Supabase write happens on form submit
- **Sensitive data exclusion** — `passport_no` is stripped before writing to localStorage in `setBookingDraft`
- **Session persistence** — Only the session token is stored, not full user object
- **Reset action** — `resetBookings` is dispatched on logout and booking cancellation

---

## Tech Stack

| Layer       | Choice                              |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS        |
| State       | Redux Toolkit + localStorage persist|
| Backend     | Node.js, Express                    |
| Database    | Supabase (PostgreSQL)               |
| Auth        | Supabase Auth                       |
| Realtime    | Supabase Realtime (seats table)     |
