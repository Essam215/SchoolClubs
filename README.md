# School Clubs Hub

## Connect Supabase

1. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project API settings. Use the publishable key only; never put a secret or service-role key in this Vite app.
2. In the Supabase dashboard, open **SQL Editor → New query**.
3. Run the SQL in [`supabase/schema.sql`](supabase/schema.sql). It creates the private per-user app data table and row-level security policies.
4. Start the app with `npm run dev`, create an account, and sign in. Supabase Auth may ask you to confirm the email before sign-in.

The app starts with empty clubs, events, tasks, suggestions, admissions, attendance, resources, photos, and messages. Changes are saved to the signed-in user's row in `public.user_app_data`. RLS limits access to that user's row.

## Development

- `npm run dev` starts the local development server.
- `npm run build` builds the production app.
- `npm run lint` runs Oxlint.
