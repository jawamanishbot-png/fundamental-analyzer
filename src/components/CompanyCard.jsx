export default function CompanyCard({ company, onAddToWatchlist, isInWatchlist }) {
  const getValuationScore = () => {
    if (!company.forwardPE) return 'N/A'
    if (company.forwardPE < 15) return { score: 'Undervalued', color: 'text-green-400', bg: 'bg-green-900/20' }
    if (company.forwardPE < 25) return { score: 'Fair', color: 'text-blue-400', bg: 'bg-blue-900/20' }
    return { score: 'Overvalued', color: 'text-red-400', bg: 'bg-red-900/20' }
  }

  const valuation = getValuationScore()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{company.symbol}</h2>
            <p className="text-slate-300 text-sm">{company.name}</p>
            <p className="text-slate-400 text-xs mt-1">{company.industry || 'Unknown'}</p>
          </div>
          <button
            onClick={() => onAddToWatchlist(company)}
            disabled={isInWatchlist}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isInWatchlist
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isInWatchlist ? '✓ Saved' : '+ Watchlist'}
          </button>
        </div>
      </div>

      {/* Valuation Score */}
      {valuation !== 'N/A' && (
        <div className={`${valuation.bg} border border-slate-600 rounded-lg p-4`}>
          <p className="text-slate-400 text-sm mb-1">Valuation Assessment</p>
          <p className={`text-2xl font-bold ${valuation.color}`}>{valuation.score}</p>
        </div>
      )}

      {/* Forward Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Forward P/E"
          value={company.forwardPE ? company.forwardPE.toFixed(2) : 'N/A'}
          subtitle="Next 12 months"
        />
        <MetricCard
          label="Forward EPS"
          value={company.forwardEPS ? `$${company.forwardEPS.toFixed(2)}` : 'N/A'}
          subtitle="Projected"
        />
        <MetricCard
          label="Next Qtr EPS Est."
          value={company.nextQuarterEPS ? `$${company.nextQuarterEPS.toFixed(2)}` : 'N/A'}
          subtitle="Consensus"
        />
        <MetricCard
          label="Revenue Growth"
          value={company.revenueGrowth ? `${company.revenueGrowth.toFixed(1)}%` : 'N/A'}
          subtitle="Next 5 years"
        />
      </div>

      {/* Price Target */}
      {company.priceTarget && (
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-2">Analyst Price Target</p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-green-400">${company.priceTarget.toFixed(2)}</p>
            <p className="text-slate-400 text-sm">
              {company.currentPrice && (
                <>
                  Current: ${company.currentPrice.toFixed(2)}
                  <br />
                  Upside: {(((company.priceTarget - company.currentPrice) / company.currentPrice) * 100).toFixed(1)}%
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {company.marketCap && (
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-3">Key Metrics</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-slate-400">Market Cap</p>
              <p className="text-white font-medium">{company.marketCap}</p>
            </div>
            <div>
              <p className="text-slate-400">P/E Ratio</p>
              <p className="text-white font-medium">{company.peRatio ? company.peRatio.toFixed(2) : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Disclaimer */}
      <p className="text-xs text-slate-500 text-center">
        Data from Financial Modeling Prep. Analyst estimates are forward-looking projections.
      </p>
    </div>
  )
}

function MetricCard({ label, value, subtitle }) {
  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold text-lg">{value}</p>
      {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
    </div>
  )
}
