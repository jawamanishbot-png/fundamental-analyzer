export default function Watchlist({ companies, onRemove, onSelect }) {
  if (companies.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <p className="text-slate-300 font-semibold text-base">No companies saved yet</p>
        <p className="text-slate-600 text-sm mt-1.5 max-w-[220px] mx-auto">Search for a company and tap Watch to add it here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 stagger-children">
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-sm font-semibold text-slate-400">{companies.length} {companies.length === 1 ? 'Company' : 'Companies'}</p>
      </div>

      {companies.map((company) => {
        const upside = company.priceTarget && company.currentPrice
          ? (((company.priceTarget - company.currentPrice) / company.currentPrice) * 100)
          : null

        return (
          <div
            key={company.symbol}
            className="group bg-slate-800/50 border border-slate-700/30 rounded-2xl p-4 hover:border-slate-600/50 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer"
            onClick={() => onSelect(company)}
          >
            <div className="flex items-center gap-3.5">
              {/* Company icon */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 flex items-center justify-center flex-shrink-0 group-hover:border-slate-500/50 transition-colors">
                <span className="text-xs font-bold text-white">{company.symbol?.slice(0, 2)}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-base">{company.symbol}</h3>
                  {company.forwardPE && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      company.forwardPE < 15
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : company.forwardPE < 25
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {company.forwardPE < 15 ? 'Under' : company.forwardPE < 25 ? 'Fair' : 'Over'}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs truncate">{company.name}</p>
              </div>

              {/* Price info */}
              <div className="text-right flex-shrink-0">
                {company.currentPrice && (
                  <p className="text-white font-bold text-sm">${company.currentPrice.toFixed(2)}</p>
                )}
                {upside !== null && (
                  <div className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${upside >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      {upside >= 0 ? (
                        <polyline points="18 15 12 9 6 15" />
                      ) : (
                        <polyline points="6 9 12 15 18 9" />
                      )}
                    </svg>
                    {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(company.symbol)
                }}
                className="p-2 -mr-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                title="Remove from watchlist"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>

            {/* Mini metrics row */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-700/30">
              {company.forwardPE && (
                <span className="text-[11px] text-slate-500">
                  Fwd P/E <span className="text-slate-300 font-semibold">{company.forwardPE.toFixed(1)}</span>
                </span>
              )}
              {company.priceTarget && (
                <span className="text-[11px] text-slate-500">
                  Target <span className="text-slate-300 font-semibold">${company.priceTarget.toFixed(0)}</span>
                </span>
              )}
              {company.revenueGrowth && (
                <span className="text-[11px] text-slate-500">
                  Rev <span className={`font-semibold ${company.revenueGrowth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{company.revenueGrowth > 0 ? '+' : ''}{company.revenueGrowth.toFixed(1)}%</span>
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
