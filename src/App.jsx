import { useState } from 'react'
import SearchBar from './components/SearchBar'
import CompanyCard from './components/CompanyCard'
import Watchlist from './components/Watchlist'

export default function App() {
  const [activeTab, setActiveTab] = useState('search') // 'search' or 'watchlist'
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">📊 FundAnalyze</h1>
          <p className="text-sm text-slate-400">Forward-looking fundamental analysis</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-16 z-40 bg-slate-800 border-b border-slate-700">
        <div className="max-w-2xl mx-auto px-4 flex gap-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-3 px-4 font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`py-3 px-4 font-medium transition-colors relative ${
              activeTab === 'watchlist'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Watchlist
            {watchlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {watchlist.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'search' ? (
          <div className="space-y-6">
            <SearchBar onSearch={handleSearch} loading={loading} />

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-400"></div>
              </div>
            )}

            {selectedCompany && !loading && (
              <CompanyCard
                company={selectedCompany}
                onAddToWatchlist={handleAddToWatchlist}
                isInWatchlist={watchlist.some(c => c.symbol === selectedCompany.symbol)}
              />
            )}

            {!selectedCompany && !loading && !error && (
              <div className="text-center py-12">
                <p className="text-slate-400">Search for a company to get started</p>
              </div>
            )}
          </div>
        ) : (
          <Watchlist
            companies={watchlist}
            onRemove={handleRemoveFromWatchlist}
            onSelect={setSelectedCompany}
          />
        )}
      </main>
    </div>
  )
}
