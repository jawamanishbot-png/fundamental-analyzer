# 📊 FundAnalyze - Mobile-First Fundamental Analysis

Forward-looking fundamental analysis app for stocks. Search any publicly traded company to get analyst estimates, revenue projections, valuation assessments, and price targets.

## ✨ Features

- **Search** — Enter any stock ticker to get analysis
- **Forward-Looking Metrics** — Analyst EPS estimates, revenue growth projections, price targets
- **Valuation Score** — Quick assessment: Undervalued / Fair / Overvalued (based on forward P/E)
- **Watchlist** — Save companies and track across sessions
- **Mobile-First Design** — Built for mobile, works great on desktop
- **Real-Time Data** — Powered by Financial Modeling Prep API

## 🚀 Getting Started

### 1. Get a Free API Key

Get your free API key from [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs) (free tier includes forward estimates).

### 2. Local Development

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Add your FMP_API_KEY to .env.local

# Start dev server
npm run dev
# Opens at http://localhost:5173
```

### 3. Deploy to Vercel

```bash
# Push to GitHub first
git add .
git commit -m "Initial commit"
git push origin main

# Deploy to Vercel
vercel
# Set FMP_API_KEY in Vercel environment variables
```

## 📈 Forward-Looking Metrics Explained

- **Forward P/E** — Price-to-Earnings ratio based on next 12 months of projected earnings
- **Forward EPS** — Estimated earnings per share for the next 12 months
- **Next Quarter EPS** — Analyst consensus for upcoming quarter
- **Revenue Growth** — Projected annual growth rate (next 5 years)
- **Price Target** — Analyst consensus on where the stock should trade
- **Valuation** — Quick assessment based on forward P/E compared to historical ranges

## 📁 Project Structure

```
fundamental-analyzer/
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx       (ticker input)
│   │   ├── CompanyCard.jsx     (metrics display)
│   │   └── Watchlist.jsx       (saved stocks)
│   ├── App.jsx                  (main app)
│   └── index.css               (Tailwind styles)
├── api/
│   └── stock/[ticker].js       (Vercel serverless function)
├── public/
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vercel.json
```

## 🔄 Data Flow

```
User searches "AAPL"
    ↓
Frontend calls /api/stock/AAPL
    ↓
Serverless function proxies Financial Modeling Prep API
    ↓
Returns: Forward metrics, analyst estimates, valuation
    ↓
Display in CompanyCard with valuation assessment
```

## 🛠 Tech Stack

- **Frontend** — React 19 + Vite
- **Styling** — Tailwind CSS (mobile-first)
- **Data** — Financial Modeling Prep API (free tier)
- **Backend** — Vercel serverless functions
- **Deployment** — Vercel

## 📱 Mobile Optimizations

- Responsive grid layouts
- Touch-friendly buttons and spacing
- Optimized typography for small screens
- Fast load times (gzipped <64KB)

## 🔒 Environment Variables

**Development** — `.env.local`:
```
FMP_API_KEY=your_key_here
```

**Production** — Set in Vercel:
```
FMP_API_KEY=your_key_here
```

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues or pull requests!

---

**Built with ❤️ for forward-thinking investors**
