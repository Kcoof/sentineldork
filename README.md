# 🛡️ SentinelDork Pro v3.1

**SentinelDork Pro** is a high-performance security reconnaissance toolkit designed for Bug Bounty hunters and Penetration Testers. It leverages advanced search engine dorking techniques and GLM AI to identify exposed assets, sensitive files, and infrastructure misconfigurations.

## ✨ Key Features

- **🎯 Precision Dorking**: Pre-configured templates for AWS S3, Azure Blobs, Firebase, K8s, and more.
- **🤖 AI Risk Analysis**: Real-time vulnerability assessment powered by GLM (Z.ai), **through a serverless proxy so the API key never reaches the browser**.
- **🔍 Multi-Engine Support**: Seamlessly switch between Google, Bing, DuckDuckGo, Shodan, and Censys.
- **⚡ Pro UI/UX**: Built with React & Tailwind CSS for a terminal-grade, high-productivity interface.
- **🔒 Compliance Focused**: Designed for ethical security testing and asset discovery.

## 🚀 Deployment

### Vercel (recommended — AI analysis included)

1. Push this repository to GitHub.
2. Import the repo on [vercel.com](https://vercel.com) (Vite is auto-detected; `api/ai.ts` becomes a serverless function automatically).
3. In **Project → Settings → Environment Variables**, add:
   - `GLM_API_KEY` — your **Z.ai (GLM) key** (**server-side only**) — powers AI analysis
   - `GLM_MODEL` *(optional)* — defaults to `glm-4.5-flash`
   - `GLM_BASE_URL` *(optional)* — defaults to `https://api.z.ai/api/paas/v4`
   - `GEMINI_API_KEY` *(optional)* — Google alternative (key starts with `AIza`); GLM wins if both are set
4. Deploy. The browser calls `/api/ai`; the key stays on the server.

> Already pasted a GLM key into `GEMINI_API_KEY`? It still works — a non-`AIza` key in that variable is routed to GLM automatically. Renaming it to `GLM_API_KEY` is cleaner though.

### GitHub Pages / any static host (dorking only)

Static hosting has no server side, so **AI analysis is disabled** there by design —
the dork database and multi-engine search work fully. **Never** embed a Gemini
key in a static build (e.g. via `VITE_API_KEY`): any key shipped to the browser
is public within minutes of deploying.

### Local Development

```bash
git clone https://github.com/Kcoof/sentineldork.git
cd sentineldork
npm install
npm run dev        # UI at http://localhost:5173
npx vercel dev     # run this instead to also get the /api/gemini proxy locally
```

For `vercel dev`, set `GLM_API_KEY` first (`export GLM_API_KEY=...` or
`.env.local` — it is read server-side only).

## 🔐 Security model

| Where the key lives | Who can see it |
|---|---|
| `GLM_API_KEY` / `GEMINI_API_KEY` (Vercel env) | Serverless function only ✅ |
| Any `VITE_*` variable | Everyone — shipped in the JS bundle ❌ |

If you previously deployed with a build-time API key: **revoke it** in Google AI
Studio and generate a new one.

## 🛠️ Technical Stack

- **Frontend**: React 19, Vite, Tailwind CSS, lucide-react
- **AI**: GLM (Z.ai) via serverless proxy (`api/ai.ts`), Gemini optional, zero client-side SDK
- **Deployment**: Vercel (with functions) or any static host (dorks only)

## ⚖️ Disclaimer

This tool is for educational and ethical security testing purposes only. The author is not responsible for any misuse or damage caused by this application. Always obtain proper authorization before testing any target.
