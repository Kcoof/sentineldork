# 🛡️ SentinelDork Pro v3.0

**SentinelDork Pro** is a high-performance security reconnaissance toolkit designed for Bug Bounty hunters and Penetration Testers. It leverages advanced search engine dorking techniques and Google Gemini AI to identify exposed assets, sensitive files, and infrastructure misconfigurations.

## ✨ Key Features

- **🎯 Precision Dorking**: Pre-configured templates for AWS S3, Azure Blobs, Firebase, K8s, and more.
- **🤖 AI Risk Analysis**: Real-time vulnerability assessment powered by Gemini 3.0 Flash.
- **🔍 Multi-Engine Support**: Seamlessly switch between Google, Bing, DuckDuckgo, Shodan, and Censys.
- **⚡ Pro UI/UX**: Built with React & Tailwind CSS for a terminal-grade, high-productivity interface.
- **🔒 Compliance Focused**: Designed for ethical security testing and asset discovery.

## 🚀 Deployment

### GitHub Pages (Fastest)
1. Push this repository to GitHub.
2. Go to **Settings > Pages**.
3. Select **Deploy from a branch** (main/root).
4. Ensure your `API_KEY` for Gemini is configured if using a build-time injection or proxy.

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/sentinel-dork.git

# Open index.html in any modern browser
```

## 🛠️ Technical Stack
- **Frontend**: React (ESM), Tailwind CSS
- **Icons**: Lucide React
- **AI**: @google/genai (Gemini 3.0 Flash)
- **Deployment**: Optimized for zero-build environments (GitHub Pages, Vercel, Netlify)

## ⚖️ Disclaimer
This tool is for educational and ethical security testing purposes only. The author is not responsible for any misuse or damage caused by this application. Always obtain proper authorization before testing any target.
