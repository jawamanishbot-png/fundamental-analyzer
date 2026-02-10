import { useState } from 'react'

export default function SearchBar({ onSearch, loading }) {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSearch(input)
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-200 ${
          focused
            ? 'bg-slate-800/80 border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20'
            : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
        }`}
      >
        {/* Search icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={focused ? '#60a5fa' : '#64748b'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 transition-colors duration-200"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          placeholder="Search ticker symbol..."
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength="5"
          disabled={loading}
          className="flex-1 bg-transparent text-white text-sm font-medium placeholder-slate-500 focus:outline-none disabled:opacity-50"
        />

        {input.trim() && (
          <button
            type="button"
            onClick={() => setInput('')}
            className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            'Analyze'
          )}
        </button>
      </div>

      {/* Quick tickers */}
      <div className="flex items-center gap-2 mt-3 px-1">
        <span className="text-[11px] text-slate-600 font-medium">Popular:</span>
        {['AAPL', 'MSFT', 'GOOGL', 'TSLA'].map(ticker => (
          <button
            key={ticker}
            type="button"
            disabled={loading}
            onClick={() => {
              setInput(ticker)
              onSearch(ticker)
            }}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 hover:text-slate-200 hover:border-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {ticker}
          </button>
        ))}
      </div>
    </form>
  )
}
