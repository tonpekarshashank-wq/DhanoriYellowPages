# Dhanori Yellow Pages — Setup Guide

## 1. Neon Database Setup

### Create the project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Click **New Project**
3. Settings:
   - **Name**: `dhanori-yellow-pages`
   - **Region**: `AWS Asia Pacific 1 (Singapore)` — closest to Pune
   - **Postgres version**: 17
4. Click **Create Project**
5. Copy the **connection string** (it looks like `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`)

### Enable extensions

After creating the project, run these in the Neon SQL Editor:

```sql
-- Trigram index for typo-tolerant search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text search (built-in, just ensure the config exists)
-- No extension needed — Postgres has it natively.
```

### Connect to the app

1. Open `/web/.env.local`
2. Paste the connection string as `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### Push the schema and seed data

```bash
cd web
npm run db:push   # creates all tables
npm run db:seed   # loads categories, sub-localities, synonyms and sample listings
```

### (Optional) Open Drizzle Studio

```bash
npm run db:studio
```

This opens a browser-based UI to browse and edit rows.

---

## 2. Upstash Redis Setup (rate limiting)

### Via Vercel Marketplace (recommended)

1. Go to your Vercel project → **Storage** tab
2. Click **Connect Store** → **Upstash Redis**
3. Choose the **Free** plan
4. Region: pick the closest (e.g. `ap-southeast-1` or `us-east-1`)
5. Click **Create & Connect**
6. Vercel auto-injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` as env vars

### Manual (if not using Vercel Marketplace)

1. Go to [console.upstash.com](https://console.upstash.com)
2. Click **Create Database**
3. Choose region closest to Singapore
4. Copy the **REST URL** and **REST Token**
5. Add to `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=xxx
   ```

---

## 3. Google OAuth (admin login)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://your-domain.vercel.app/api/auth/callback/google` (prod)
3. Copy the **Client ID** and **Client Secret**
4. Add to `.env.local`:
   ```
   AUTH_GOOGLE_ID=your-client-id
   AUTH_GOOGLE_SECRET=your-client-secret
   ```

### Generate AUTH_SECRET

```bash
openssl rand -base64 32
```

Add to `.env.local`:
```
AUTH_SECRET=your-generated-secret
```

---

## 4. Cloudflare Turnstile (spam protection)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile**
2. Add a new site
3. Copy the **Site Key** (public) and **Secret Key**
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
   TURNSTILE_SECRET_KEY=your-secret-key
   ```

---

## 5. Vercel Deployment

### Import the project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the Git repo
3. Set **Root Directory** to `web`
4. Framework: **Next.js** (auto-detected)
5. Add all env vars from `.env.local` under **Environment Variables**
6. Deploy

### Admin allow-list

Set `ADMIN_ALLOWED_EMAILS` to a comma-separated list of Google emails:

```
ADMIN_ALLOWED_EMAILS=tonpekar.shashank@gmail.com,other-admin@gmail.com
```

Only these emails can access `/admin`.

---

## 6. Local Development

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database commands

| Command | What it does |
|---|---|
| `npm run db:push` | Push schema changes to Neon (no migration files) |
| `npm run db:generate` | Generate migration SQL files |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:seed` | Seed categories, localities and sample data |
| `npm run db:studio` | Open Drizzle Studio in the browser |
