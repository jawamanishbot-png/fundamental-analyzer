import { useState } from 'react'

export default function SearchBar({ onSearch, loading }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSearch(input)
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter ticker (e.g., AAPL, MSFT, GOOGL)"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          maxLength="5"
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>
      <p className="text-xs text-slate-400">
        💡 Tip: Search any publicly traded company by its stock ticker
      </p>
    </form>
  )
}
