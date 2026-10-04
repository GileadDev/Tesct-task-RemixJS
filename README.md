# Form Builder

A form builder built with Next.js. An admin creates forms in a visual editor (live preview + field settings sidebar, optional AI assistant), and visitors fill out published forms on the public site.

**Live demo:** https://tesct-task-remix-js.vercel.app (admin credentials are provided separately)

## Features

**Admin panel** (`/admin`, protected by JWT authentication)

- CRUD for forms: create, edit, delete, publish / unpublish.
- Three field types with their own settings:

  | Type       | Settings                                                             |
  | ---------- | -------------------------------------------------------------------- |
  | `text`     | `label`, `placeholder`, `required`, `minLength`, `maxLength`         |
  | `number`   | `label`, `placeholder`, `required`, `min`, `max`, `step`             |
  | `textarea` | `label`, `placeholder`, `required`, `minLength`, `maxLength`, `rows` |

- Form editor with a live preview: clicking a field opens a sidebar with its settings, and the preview updates as you type. Fields can be reordered and removed.
- Form structure is stored in MongoDB via Mongoose.
- **Bonus:** AI assistant in the editor (LangChain.js + OpenAI). Write “Add a required phone field” and the agent updates the fields.

**Public part**

- Home page (`/`) lists published forms.
- Form page (`/forms/[id]`) validates input against the field settings. After submit, a modal shows the entered data for confirmation.

## Tech stack

| Requirement     | Choice                                                                           |
| --------------- | -------------------------------------------------------------------------------- |
| Language        | TypeScript                                                                       |
| Framework       | Next.js 16 (App Router), React 19                                                |
| Validation      | Zod 4 (shared between client and server), React Hook Form                        |
| ORM / Database  | Mongoose 9 / MongoDB 8 (Atlas or Docker)                                         |
| Authentication  | JWT (`jose`, HS256) in an `httpOnly` cookie, passwords hashed with `bcryptjs`    |
| UI              | Tailwind CSS 4 + shadcn/ui (Base UI)                                             |
| API protocol    | REST (Next.js Route Handlers)                                                    |
| Code quality    | ESLint 9, Prettier 3 (+ `prettier-plugin-tailwindcss`)                           |
| Package manager | npm                                                                              |
| Bundler         | Turbopack, the default bundler of Next.js 16 (`next build --webpack` also works) |
| Environment     | Docker Compose (app + MongoDB)                                                   |
| AI (bonus)      | LangChain.js (`@langchain/openai`) with structured output                        |

## Requirements

- Node.js 24 LTS
- MongoDB: a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster or the Docker setup below
- OpenAI API key (optional, only for the AI assistant)

## Getting started

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/GileadDev/Tesct-task-RemixJS.git
   cd Tesct-task-RemixJS
   npm install
   ```

2. Create `.env.local` from the template and fill it in (see [Environment variables](#environment-variables)):

   ```bash
   cp .env.example .env.local
   ```

   On Windows PowerShell: `Copy-Item .env.example .env.local`.

3. Create the admin user. The script hashes `ADMIN_PASSWORD` and upserts the user, so it is safe to run again (for example, to change the password):

   ```bash
   npm run seed:admin
   ```

4. Start the dev server and open http://localhost:3000:

   ```bash
   npm run dev
   ```

5. Sign in at http://localhost:3000/login with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Environment variables

| Variable         | Required | Description                                                                                       |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`    | yes      | MongoDB connection string, e.g. `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/form_builder` |
| `SESSION_SECRET` | yes      | Secret key for signing JWTs (see below)                                                           |
| `ADMIN_EMAIL`    | yes      | Admin login, used by `npm run seed:admin`                                                         |
| `ADMIN_PASSWORD` | yes      | Admin password (at least 8 characters), used by `npm run seed:admin`                              |
| `OPENAI_API_KEY` | no       | Enables the AI assistant. Without it the chat replies that AI is not configured                   |
| `OPENAI_MODEL`   | no       | OpenAI model for the assistant. Default: `gpt-5-mini`                                             |

Generate `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Running with Docker

`compose.yaml` starts two containers: MongoDB 8 (data in the `mongo_data` volume) and the app (standalone Next.js build). The app waits until the database passes its health check.

1. Start everything:

   ```bash
   docker compose up --build
   ```

2. The database in Docker is empty, so create the admin from a second terminal, pointing the seed script at the container:

   ```bash
   MONGODB_URI="mongodb://root:example@127.0.0.1:27017/form_builder?authSource=admin" npm run seed:admin
   ```

   On Windows PowerShell:

   ```powershell
   $env:MONGODB_URI = "mongodb://root:example@127.0.0.1:27017/form_builder?authSource=admin"
   npm run seed:admin
   Remove-Item Env:MONGODB_URI
   ```

   A variable set in the terminal takes precedence over `.env.local`, so `ADMIN_EMAIL` and `ADMIN_PASSWORD` are still read from `.env.local`.

3. Open http://localhost:3000.

4. Stop with `Ctrl+C`, then `docker compose down` (add `-v` to delete the database volume).

The credentials and `SESSION_SECRET` in `compose.yaml` are for local use only. The AI assistant is disabled in Docker unless you add `OPENAI_API_KEY` to the `app` service environment.

## Deployment

The live demo runs on Vercel with MongoDB Atlas.

1. Import the GitHub repository in Vercel. The Next.js preset is detected automatically.
2. Add the environment variables `MONGODB_URI` and `SESSION_SECRET` (plus `OPENAI_API_KEY` and `OPENAI_MODEL` for the AI assistant). `ADMIN_EMAIL` and `ADMIN_PASSWORD` are not needed there: run `npm run seed:admin` locally against the same database.
3. In Atlas, allow connections from Vercel: Network Access → add `0.0.0.0/0`, because Vercel uses dynamic IP addresses.
4. Every push to `main` triggers a new production deployment.

## Scripts

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the dev server                      |
| `npm run build`        | Production build (`output: "standalone"`) |
| `npm run lint`         | Run ESLint                                |
| `npm run lint:fix`     | Run ESLint with auto-fix                  |
| `npm run format`       | Format all files with Prettier            |
| `npm run format:check` | Check formatting                          |
| `npm run seed:admin`   | Create or update the admin user           |

## REST API

All `/api/forms` and `/api/ai` endpoints require the session cookie set by `/api/auth/login`.

| Method   | Endpoint           | Description                              | Success                     |
| -------- | ------------------ | ---------------------------------------- | --------------------------- |
| `POST`   | `/api/auth/login`  | Sign in with `{ email, password }`       | `200`, sets the cookie      |
| `POST`   | `/api/auth/logout` | Sign out                                 | `204`, clears the cookie    |
| `GET`    | `/api/forms`       | List all forms                           | `200` + array of forms      |
| `POST`   | `/api/forms`       | Create a form                            | `201` + created form        |
| `GET`    | `/api/forms/:id`   | Get a form                               | `200` + form                |
| `PUT`    | `/api/forms/:id`   | Replace a form (title, settings, fields) | `200` + updated form        |
| `DELETE` | `/api/forms/:id`   | Delete a form                            | `204`                       |
| `POST`   | `/api/ai`          | `{ message, fields }` → updated fields   | `200` + `{ reply, fields }` |

Errors use one format, `{ "error": "message" }`, with status `400` (validation), `401` (not signed in) or `404` (form not found). Validation errors also include the failed fields: `"issues": [{ "path": "title", "message": "..." }]`.

Example request body for `POST /api/forms`:

```json
{
  "title": "Course registration",
  "description": "",
  "published": true,
  "fields": [
    {
      "id": "f1",
      "type": "text",
      "label": "Name",
      "required": true,
      "minLength": 2
    },
    {
      "id": "f2",
      "type": "number",
      "label": "Age",
      "required": false,
      "min": 18,
      "max": 99
    }
  ]
}
```

## Project structure

```
scripts/
  seed-admin.ts              create / update the admin user
src/
  proxy.ts                   redirects /admin → /login without a valid session
  models/                    Mongoose models: User, Form
  lib/
    db.ts                    cached MongoDB connection
    session.ts               JWT sign / verify, session cookie
    dal.ts                   getSession / verifySession
    api.ts                   shared JSON error helpers
    auth-schema.ts           Zod schema for login
    forms/
      schema.ts              Zod schemas for fields and forms (shared client/server)
      queries.ts             data access: list / get / create / update / delete
      build-fill-schema.ts   builds a Zod schema from a form's fields for filling
    ai/form-agent.ts         LangChain agent with structured output
  components/
    ui/                      shadcn/ui components
    form-field-view.tsx      renders one field (editor preview and public form)
  app/
    page.tsx                 public list of forms
    forms/[id]/              fill a form + confirmation modal
    login/                   sign-in page
    admin/                   forms table, editor, AI chat
    api/                     REST endpoints
```

## Design decisions

- **One source of truth for validation.** The Zod schemas in `src/lib/forms/schema.ts` validate requests in the API, the editor before saving, and the AI output. TypeScript types are inferred from the same schemas.
- **Fields are embedded in the form document.** A form is always read and saved as a whole, which is the natural shape for MongoDB.
- **Defense in depth for auth.** `proxy.ts` only redirects; every admin page and every API handler checks the session again (see CVE-2025-29927).
- **Dynamic validation for filling.** The public form builds a Zod schema at runtime from the field settings, so `required`, `minLength`, `min`, `max` and `step` are enforced exactly as configured.
- **Reliable AI output.** The agent uses structured output with a Zod schema, and its result is validated again with the regular field schema before it reaches the editor. The OpenAI key is used only on the server.

## Limitations

- Submitted answers are shown in the confirmation modal but not stored (the task does not require it).
- There is a single admin, created with `npm run seed:admin`. There is no registration.
