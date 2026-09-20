# SentinelDork

**A dorking workbench for finding exposed assets — pick a query, pick an engine, search.**

SentinelDork ships a curated library of Google-dork templates for the exposures bug bounty hunters actually look for: open S3 buckets, exposed Azure containers, Terraform state files, `.env` files, leaked Firebase configs, public Jira dashboards. You type a domain, click a template, and it builds the query and runs it on the search engine of your choice — Google, Bing, DuckDuckGo, Shodan, or Censys — with the syntax corrected per engine.

It is built for people who do recon manually and want the query library and the engine plumbing handled for them, not a black box that scrapes everything.

---

## What's inside

| Category | Templates |
|---|---|
| **Cloud & Infrastructure** | Exposed S3 buckets · Azure Blob containers · Terraform state files (`.tfstate`/`.tfvars`) · misconfigured Kubernetes dashboards |
| **API & JS leakage** | Source maps (`.map`) · Firebase configurations · Swagger/OpenAPI docs · GraphQL endpoints with introspection |
| **SaaS secrets** | Public Notion pages · Google Drive spreadsheets with PII · public Trello boards |
| **Database & server logs** | Downloadable SQLite files · `.env` files with credentials · `phpinfo()` pages · unauthenticated Jira dashboards |

Every template carries a short description, an impact rating, and tags — you always know what you're looking for and why it matters before you run it.

### The engines

| Engine | Notes |
|---|---|
| Google | Default; full dork syntax |
| Bing / DuckDuckGo | Query syntax auto-corrected where the operators differ |
| Shodan | For infrastructure-facing queries |
| Censys | For certificate/host discovery queries |

Switch engines from one dropdown; the same dork is rebuilt for whichever you pick.

---

## The AI analysis (optional)

Each dork has an **Analyze** action. With an AI key configured, a serverless function sends the query to the model and gets back three things: why this exposure is dangerous, how an administrator fixes it, and a risk level (Critical / High / Medium / Low). It's the "so what" behind the query, next to the query.

Providers: **GLM (Z.ai)** by default, Google Gemini optional. The key lives only in your deployment's environment variables — the browser talks to `/api/ai` and never sees or sends any key.

Nothing depends on the AI. Without a key, every dork and every engine works exactly the same.

---

## Deploy to Vercel (AI analysis included)

1. Push this repo to GitHub.
2. Import it on [vercel.com](https://vercel.com) — Vite is auto-detected; `api/ai.ts` becomes a serverless function.
3. In **Project → Settings → Environment Variables**, add:
   - `GLM_API_KEY` — your [Z.ai](https://z.ai) key (server-side only)
   - `GLM_MODEL` *(optional)* — defaults to `glm-4.5-flash`
   - `GLM_BASE_URL` *(optional)* — defaults to `https://api.z.ai/api/paas/v4`
   - `GEMINI_API_KEY` *(optional)* — Google alternative (key starts with `AIza`); GLM wins if both are set
4. Deploy.

> Already pasted a GLM key into `GEMINI_API_KEY`? It still works — a non-`AIza` key in that variable is routed to GLM automatically. Renaming it to `GLM_API_KEY` is cleaner though.

## Static hosting (dorking only)

GitHub Pages, Netlify, or any static host: `npm run build` and upload `dist/`. The dork library and all five engines work fully. AI analysis is disabled by design — a static host has no server side, and there is nowhere safe to put a key.

## Local development

```bash
git clone https://github.com/Kcoof/sentineldork.git
cd sentineldork
npm install
npm run dev        # UI at http://localhost:5173 (no AI)
npx vercel dev     # instead: also runs /api/ai locally (set GLM_API_KEY in .env.local)
```

---

## Security model

| Where the key lives | Who can see it |
|---|---|
| `GLM_API_KEY` / `GEMINI_API_KEY` (Vercel env) | Serverless function only |
| Any `VITE_*` variable | Everyone — shipped in the JS bundle |

If you previously deployed with a build-time API key: **revoke it** and generate a new one. Any key shipped to the browser is public within minutes.

---

## Stack

- React 19, Vite, Tailwind CSS, lucide-react
- AI: GLM (Z.ai) via the `api/ai.ts` serverless function, Gemini optional
- Deployment: Vercel (with functions) or any static host (dorks only)

## Authorized testing only

SentinelDork queries search engines — the data is public, but acting on what you find (opening an exposed bucket, probing a dashboard) requires authorization: your own assets, a program you're registered with, or written permission. Respect the scope of any program you test.
