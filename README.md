# UniMeadow

**Find your place, your way.** The centralised transition platform for new university students.

Moving from school to university is when students first manage their own mental health, physical health, food and money on their own. The support already exists, but it's scattered across universities, the NHS and charities. UniMeadow asks a student a few questions and turns all of that into one personalised plan, ranked by urgency, with step-by-step guides.

## Architecture

```
Frontend  (frontend/)        HTML, CSS, JavaScript: pages, forms, the plan
    │  HTTPS / REST API
Backend   (backend/)         Node.js + Express on Render: login, validation, business rules, API
    │  secure (SSL) database connection
Database                     Supabase PostgreSQL: users, profiles (consent), plans
```

Request flow: the user acts on the website → the frontend calls the backend API → the backend checks the session and validates the input → business rules run (e.g. no saving without consent, users only access their own data) → the backend reads or writes PostgreSQL → it returns JSON → the frontend updates.

## Folders

```
frontend/
  index.html     landing page + tool
  styles.css     styling
  data.js        universities, questions, sample students, services, step-by-step guides
  app.js         rules engine (plan) + UI
  account.js     sign-up/login, consent, saving plans, delete my data (calls the API)
  privacy.html   privacy notice
backend/
  server.js      Express server: REST API, security, serves the frontend
  db.js          PostgreSQL connection
  schema.sql     tables (created automatically on start-up)
  package.json   dependencies
render.yaml      Render Blueprint (deployment)
```

## API

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/api/health` | Is the server up? |
| POST | `/api/auth/register` | Create an account (email + password, hashed with bcrypt) |
| POST | `/api/auth/login` | Sign in (sets a secure httpOnly session cookie) |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/me` | Current user and consent status |
| POST | `/api/consent` | Agree to store answers |
| GET / PUT | `/api/plan` | Load / save answers and checklist progress |
| DELETE | `/api/account` | Delete the account and all data |

## How recommendations work

A transparent rules engine (`plan()` in `frontend/app.js`). Each answer triggers recommendations with an urgency tier (today / this week / keep handy), a priority score and a reason. Rules combine answers (e.g. register with a GP before counselling) and crisis answers override everything. UCL, King's, LSE and Imperial are mapped with their own services; every other UK university gets national services plus what to ask their university for.

## Run locally

```bash
cd backend
npm install
npm run dev      # in-memory database, no setup needed → http://localhost:3000
```

## Team

Beatrice Brozzi · Mélusine Jurd de Girancourt (co-founders, UCL)
