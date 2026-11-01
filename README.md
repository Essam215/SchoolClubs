# School Clubs Hub

React (Vite) frontend, .NET 8 minimal API, Supabase (PostgreSQL) database.
Features: Event management, Task management, Notifications, Suggestion box, Leaderboard, Resource library.

## 1. Database (Supabase)
For a fresh database, open your project > SQL Editor and run these in order:
1. `database/01_schema.sql` (creates the schema; drops existing tables with the same names)
2. `database/02_seed.sql` (seeds users, clubs, events, tasks, suggestions and notifications)
3. `database/03_leaderboard_resources.sql` (safe to run after the schema)
4. `database/04_seed_leaderboard_resources.sql` (adds sample points and learning resources)

For an existing database that already has the original seed data, run only
`database/03_leaderboard_resources.sql` and `database/04_seed_leaderboard_resources.sql`.
Do not rerun `01_schema.sql` on a database with data you want to keep; it drops and
recreates the existing tables.

## 2. Backend
Needs the .NET 8 SDK.
```
cd backend/SchoolClubs.Api
dotnet run
```
Runs on http://localhost:5080 by default. Copy `appsettings.example.json` to
`appsettings.json` in `backend/SchoolClubs.Api`, then set `Supabase:Url` and
`Supabase:Key` to your Supabase project values. In Supabase SQL Editor, run
the database. For a database that has already been set up, run only the two new
leaderboard/resource SQL files described above. The local settings file is ignored
by Git so credentials are not committed.

## 3. Frontend
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Pick any account on the sign-in screen
(Omar Khaled = club leader, Layla Mostafa = student, Mariam Soliman = admin, Hossam Fathy = advisor).

## 4. Deploying the backend to MonsterASP.NET
The FTP address (`webftp.monsterasp.net`) is for file transfer; it is not the API's public URL.
Create an ASP.NET Core site in MonsterASP.NET and use the `*.runasp.net` hostname assigned to
that site as the API URL. The hosting plan must support .NET 8.

1. Configure these application environment variables in the MonsterASP.NET control panel:
   - `Supabase__Url`: your Supabase project URL
   - `Supabase__Key`: your Supabase publishable key
   - `Cors__Origins__0`: the exact origin of your deployed Vercel frontend, for example
     `https://your-school-clubs.vercel.app` (no trailing slash). Add `Cors__Origins__1` and
     later entries for any additional frontend origins you use.
2. Publish from the repository root:
   ```
   dotnet publish backend/SchoolClubs.Api/SchoolClubs.Api.csproj -c Release -o backend/SchoolClubs.Api/bin/Release/net8.0/publish
   ```
3. Use MonsterASP.NET's FTP details with an FTP client or its web FTP site, and upload the
   **contents** of `backend/SchoolClubs.Api/bin/Release/net8.0/publish` to the website's
   application root. Keep the generated `web.config` in place. The project excludes the
   machine-local `appsettings.json` from publish output so local settings are not uploaded.
4. In Vercel, add `VITE_API_URL` to the frontend project's environment variables using the
   assigned API hostname, for example `https://your-api-name.runasp.net` (do not add `/api`).
   Redeploy the frontend after saving the variable.
5. Check `https://your-api-name.runasp.net/api/health`; a working API responds with
   `{"ok":true}`.

## How the features connect
- Creating an event notifies the club's members. Editing or cancelling it notifies registered students.
- Assigning a task notifies the assignee. Moving a task to review/done notifies the task creator.
- Submitting a suggestion notifies the club's leaders and advisor. Responding notifies the author, even if anonymous.
- Club staff can award points to members; the leaderboard ranks those saved awards.
- Club staff can maintain club resources, and advisors/admins can also add school-wide resources.
- Permissions: admins manage everything; advisors manage their clubs; club leaders manage clubs they lead; students register for events, update their own tasks and submit/vote on suggestions.

## Before production
- The API uses the publishable key, so `01_schema.sql` adds open RLS policies. Anyone with that key could read or write
  the tables directly. Before launch, move the API to a secret/service key or a direct Npgsql connection (keep it in
  user-secrets or an environment variable) and remove the open policies.
- Sign-in is email only (no password) to keep this demo small. Replace it with Supabase Auth or ASP.NET Identity.
