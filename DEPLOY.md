# Deployment Guide — L'Hexagone API on Render

## Before you start

You need two things ready:

| What | Where to get it |
|------|----------------|
| **DATABASE_URL** | Create a free PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com) — both free tiers work. Copy the connection string. |
| **GEMINI_API_KEY** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → "Create API Key" |

---

## Step-by-step on Render

### 1 — Create a new Web Service

- Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
- Connect your GitHub account and select the `hexagone` (or whatever you named it) repository
- Click **Connect**

### 2 — Render auto-detects render.yaml

Render will find the `render.yaml` in the root and pre-fill:

- **Runtime:** Node
- **Build Command:** `corepack enable && corepack prepare pnpm@10.26.1 --activate && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build`
- **Start Command:** `node --enable-source-maps ./artifacts/api-server/dist/index.mjs`
- **Region:** Frankfurt

> If Render does NOT auto-detect the yaml, paste the commands above manually into the Build Command and Start Command fields.

### 3 — Add Environment Variables

In the **Environment** section of the setup page, add these two variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your PostgreSQL connection string (e.g. `postgresql://user:pass@host/db`) |
| `GEMINI_API_KEY` | Your Google AI Studio API key |

`NODE_ENV=production` is already set by `render.yaml` — you do not need to add it.

### 4 — Choose your plan

- **Free** — fine for testing; server sleeps after 15 min of inactivity (slow cold start)
- **Starter $7/mo** — always-on, no cold starts — recommended for real use

### 5 — Click "Create Web Service"

Render will:
1. Clone your repo
2. Run the build command (~2–3 minutes)
3. Start the server
4. Give you a URL like `https://hexagone-api.onrender.com`

Your API will be live at `https://hexagone-api.onrender.com/api/...`

---

## Verify it's working

Once deployed, open this URL in your browser (replace with your actual domain):

```
https://hexagone-api.onrender.com/api/dashboard/summary
```

You should see a JSON response. If you see `{"error":"..."}` related to the database, double-check your `DATABASE_URL` value in the Environment tab.

---

## Redeploy after code changes

Every `git push` to `main` triggers an automatic redeploy. Nothing to click.

---

## Environment Variables — full reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key for AI features |
| `NODE_ENV` | Set by render.yaml | Always `production` — do not override |
| `PORT` | Set by Render | Render injects this automatically — do not set |
