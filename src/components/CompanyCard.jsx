export default function CompanyCard({ company, onAddToWatchlist, isInWatchlist }) {
  const getValuation = () => {
    if (!company.forwardPE) return null
    if (company.forwardPE < 15)
      return { label: 'Undervalued', color: 'emerald', score: Math.min(95, Math.round(90 - company.forwardPE * 2)) }
    if (company.forwardPE < 25)
      return { label: 'Fair Value', color: 'blue', score: Math.round(70 - (company.forwardPE - 15)) }
    return { label: 'Overvalued', color: 'red', score: Math.max(15, Math.round(50 - (company.forwardPE - 25))) }
  }

  const valuation = getValuation()
  const upside = company.priceTarget && company.currentPrice
    ? (((company.priceTarget - company.currentPrice) / company.currentPrice) * 100)
    : null
  const priceProgress = company.priceTarget && company.currentPrice
    ? Math.min(100, Math.max(0, (company.currentPrice / company.priceTarget) * 100))
    : 0

  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400',
      ring: 'stroke-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
    },
    blue: {
      bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400',
      ring: 'stroke-blue-400', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/20'
    },
    red: {
      bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400',
      ring: 'stroke-red-400', badge: 'bg-red-500/15 text-red-400 border-red-500/20'
    }
  }

  const colors = valuation ? colorMap[valuation.color] : null

  return (
    <div className="space-y-3 stagger-children">
      {/* Company Header */}
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">{company.symbol?.slice(0, 2)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{company.symbol}</h2>
                {valuation && (
                  <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md border ${colors.badge}`}>
                    {valuation.label}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-sm font-medium">{company.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{company.industry || 'Unknown Sector'}</p>
            </div>
          </div>
          <button
            onClick={() => onAddToWatchlist(company)}
            disabled={isInWatchlist}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex-shrink-0 ${
              isInWatchlist
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30'
            }`}
          >
            {isInWatchlist ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Watch
              </>
            )}
          </button>
        </div>
      </div>

      {/* Price & Target Section */}
      {company.currentPrice && (
        <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">Current Price</p>
              <p className="text-3xl font-extrabold text-white tracking-tight">${company.currentPrice.toFixed(2)}</p>
            </div>
            {upside !== null && (
              <div className={`text-right ${upside >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <p className="text-[11px] font-medium uppercase tracking-wider opacity-70 mb-1">Upside</p>
                <div className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {upside >= 0 ? (
                      <polyline points="18 15 12 9 6 15" />
                    ) : (
                      <polyline points="6 9 12 15 18 9" />
                    )}
                  </svg>
                  <span className="text-2xl font-extrabold">{upside >= 0 ? '+' : ''}{upside.toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Price Target Bar */}
          {company.priceTarget && (
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                <span>$0</span>
                <span className="font-medium text-slate-400">Target: ${company.priceTarget.toFixed(2)}</span>
              </div>
              <div className="relative h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
                    upside >= 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                  }`}
                  style={{ width: `${priceProgress}%` }}
                />
                {/* Target marker */}
                <div className="absolute top-1/2 -translate-y-1/2 right-0 w-0.5 h-4 bg-slate-400 rounded-full" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Valuation Gauge */}
      {valuation && (
        <div className={`${colors.bg} border ${colors.border} rounded-2xl p-5`}>
          <div className="flex items-center gap-5">
            {/* Ring Gauge */}
            <div className="relative w-20 h-20 flex-shrink-0 gauge-ring">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1e293b" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className={colors.ring}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${valuation.score} ${100 - valuation.score}`}
                  strokeDashoffset="0"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-extrabold ${colors.text}`}>{valuation.score}</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">Valuation Score</p>
              <p className={`text-xl font-bold ${colors.text}`}>{valuation.label}</p>
              <p className="text-xs text-slate-500 mt-1">Based on forward P/E ratio analysis</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Forward P/E"
          value={company.forwardPE ? company.forwardPE.toFixed(2) : 'N/A'}
          subtitle="Next 12 months"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
        />
        <MetricCard
          label="Forward EPS"
          value={company.forwardEPS ? `$${company.forwardEPS.toFixed(2)}` : 'N/A'}
          subtitle="Projected"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
            </svg>
          }
        />
        <MetricCard
          label="Next Qtr EPS"
          value={company.nextQuarterEPS ? `$${company.nextQuarterEPS.toFixed(2)}` : 'N/A'}
          subtitle="Consensus estimate"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <MetricCard
          label="Rev Growth"
          value={company.revenueGrowth ? `${company.revenueGrowth.toFixed(1)}%` : 'N/A'}
          subtitle="Year over year"
          highlight={company.revenueGrowth > 0}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          }
        />
      </div>

      {/* Key Metrics */}
      {company.marketCap && (
        <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5">
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-3">Key Metrics</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Market Cap</p>
              <p className="text-base font-bold text-white">{company.marketCap}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">P/E Ratio (TTM)</p>
              <p className="text-base font-bold text-white">{company.peRatio ? company.peRatio.toFixed(2) : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-600 text-center pt-1">
        Data via Financial Modeling Prep. Analyst estimates are forward-looking projections and not guarantees.
      </p>
    </div>
  )
}

function MetricCard({ label, value, subtitle, icon, highlight }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-4 hover:border-slate-600/50 transition-colors group">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-slate-500 group-hover:text-slate-400 transition-colors">{icon}</span>
        <p className="text-[11px] text-slate-500 font-medium">{label}</p>
      </div>
      <p className={`text-lg font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
      {subtitle && <p className="text-[10px] text-slate-600 mt-1">{subtitle}</p>}
    </div>
  )
}
