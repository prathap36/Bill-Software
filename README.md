# Ledgerly
1. Create a Supabase project, run `supabase/01_migration.sql` then `supabase/02_seed.sql` in the SQL Editor. For an existing project, also run `supabase/03_only-completed-sales-write-bills.sql` once.
2. Authentication > Users > Add user (email + password, tick Auto Confirm).
3. `cp .env.example .env` and fill in the two values (Project Settings > API).
4. `npm install` then `npm run dev` (http://localhost:5173).
Deploy to Vercel: import the repo, add the same two env vars, no other settings needed.
