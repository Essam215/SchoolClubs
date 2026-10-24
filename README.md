# School Clubs Hub

React (Vite) frontend, .NET 8 minimal API, Supabase (PostgreSQL) database.
Features: Event management, Task management, Notifications, Suggestion box.

## 1. Database (Supabase)
Open your project > SQL Editor, then run these in order:
1. `database/01_schema.sql` (creates tables; drops existing ones with the same names)
2. `database/02_seed.sql` (16 users, 5 clubs, 10 events, 19 tasks, 7 suggestions, notifications)

## 2. Backend
Needs the .NET 8 SDK.
```
cd backend/SchoolClubs.Api
dotnet run
```
Runs on http://localhost:5080. Copy `appsettings.example.json` to `appsettings.json`
in `backend/SchoolClubs.Api`, then set `Supabase:Url` and `Supabase:Key` to your
Supabase project values. The local settings file is ignored by Git so credentials are
not committed.

## 3. Frontend
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Pick any account on the sign-in screen
(Omar Khaled = club leader, Layla Mostafa = student, Mariam Soliman = admin, Hossam Fathy = advisor).

## How the features connect
- Creating an event notifies the club's members. Editing or cancelling it notifies registered students.
- Assigning a task notifies the assignee. Moving a task to review/done notifies the task creator.
- Submitting a suggestion notifies the club's leaders and advisor. Responding notifies the author, even if anonymous.
- Permissions: admins manage everything; advisors manage their clubs; club leaders manage clubs they lead; students register for events, update their own tasks and submit/vote on suggestions.

## Before production
- The API uses the publishable key, so `01_schema.sql` adds open RLS policies. Anyone with that key could read or write
  the tables directly. Before launch, move the API to a secret/service key or a direct Npgsql connection (keep it in
  user-secrets or an environment variable) and remove the open policies.
- Sign-in is email only (no password) to keep this demo small. Replace it with Supabase Auth or ASP.NET Identity.
