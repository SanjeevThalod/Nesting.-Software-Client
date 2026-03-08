# Nesting Software – Client (React)

## Deploy to Vercel

1. **From the repo root (with client as root directory):**
   - [Vercel Dashboard](https://vercel.com/new): Import repo → set **Root Directory** to `client`.
   - Or CLI from repo root: `vercel --cwd client`

2. **Environment variable (required if API is on another domain):**
   - In Vercel: Project → Settings → Environment Variables, add:
   - **Name:** `REACT_APP_API_URL`  
   - **Value:** your API base URL (e.g. `https://your-api.vercel.app` or `https://api.yourdomain.com`)  
   - If the API is on the same Vercel project/domain, use a relative path like `/api` (already set in `.env.production`).

3. **Build:** Vercel will run `npm run build` and serve the `build` folder. SPA routes are rewritten to `index.html` via `vercel.json`.

## Local development

```bash
npm install
npm start
```

Set `REACT_APP_API_URL=http://localhost:8000` in `.env.development` (or use the default) so the app talks to your local server.
