export default function Watchlist({ companies, onRemove }) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">Your watchlist is empty</p>
        <p className="text-slate-500 text-sm mt-2">Search for companies to add them</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-slate-400 text-sm">{companies.length} saved companies</p>
      {companies.map((company) => (
        <div
          key={company.symbol}
          className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex justify-between items-center hover:border-slate-500 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg">{company.symbol}</h3>
            <p className="text-slate-400 text-sm">{company.name}</p>
            <div className="flex gap-4 mt-2 text-xs">
              {company.forwardPE && (
                <span className="text-slate-400">
                  Forward P/E: <span className="text-white">{company.forwardPE.toFixed(2)}</span>
                </span>
              )}
              {company.priceTarget && (
                <span className="text-slate-400">
                  Target: <span className="text-white">${company.priceTarget.toFixed(2)}</span>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onRemove(company.symbol)}
            className="ml-4 p-2 text-red-400 hover:text-red-300 transition-colors"
            title="Remove from watchlist"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
