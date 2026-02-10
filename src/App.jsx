import { useState } from 'react'
import SearchBar from './components/SearchBar'
import CompanyCard from './components/CompanyCard'
import Watchlist from './components/Watchlist'
import SkeletonLoader from './components/SkeletonLoader'

export default function App() {
  const [activeTab, setActiveTab] = useState('search')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('fundamentalWatchlist')
    return saved ? JSON.parse(saved) : []
  })

  const handleSearch = async (ticker) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/stock/${ticker.toUpperCase()}`)
      if (!response.ok) throw new Error('Company not found')
      const data = await response.json()
      setSelectedCompany(data)
    } catch (err) {
      setError(err.message)
      setSelectedCompany(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWatchlist = (company) => {
    const exists = watchlist.find(c => c.symbol === company.symbol)
    if (!exists) {
      const updated = [...watchlist, company]
      setWatchlist(updated)
      localStorage.setItem('fundamentalWatchlist', JSON.stringify(updated))
    }
  }

  const handleRemoveFromWatchlist = (symbol) => {
    const updated = watchlist.filter(c => c.symbol !== symbol)
    setWatchlist(updated)
    localStorage.setItem('fundamentalWatchlist', JSON.stringify(updated))
  }

  const handleSelectFromWatchlist = (company) => {
    setSelectedCompany(company)
    setActiveTab('search')
  }

  return (
    <div className="min-h-screen bg-[#0b1121]">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">FundAnalyze</h1>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5">Fundamental Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
            </span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-[73px] z-40 glass border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-2 flex gap-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'search'
                ? 'bg-white/10 text-white shadow-inner'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 relative ${
              activeTab === 'watchlist'
                ? 'bg-white/10 text-white shadow-inner'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Watchlist
            {watchlist.length > 0 && (
              <span className="ml-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-[11px] font-bold rounded-full bg-blue-500 text-white">
                {watchlist.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'search' ? (
          <div className="space-y-5 stagger-children">
            <SearchBar onSearch={handleSearch} loading={loading} />

            {error && (
              <div className="animate-fade-in flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div>
                  <p className="text-red-400 font-semibold text-sm">Search Failed</p>
                  <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {loading && <SkeletonLoader />}

            {selectedCompany && !loading && (
              <div className="animate-fade-in-up">
                <CompanyCard
                  company={selectedCompany}
                  onAddToWatchlist={handleAddToWatchlist}
                  isInWatchlist={watchlist.some(c => c.symbol === selectedCompany.symbol)}
                />
              </div>
            )}

            {!selectedCompany && !loading && !error && (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium">Search a ticker to get started</p>
                <p className="text-slate-600 text-sm mt-1">e.g. AAPL, MSFT, GOOGL, TSLA</p>
              </div>
            )}
          </div>
        ) : (
          <Watchlist
            companies={watchlist}
            onRemove={handleRemoveFromWatchlist}
            onSelect={handleSelectFromWatchlist}
          />
        )}
      </main>
    </div>
  )
}
