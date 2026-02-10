import Sparkline from './Sparkline'

function formatLargeNumber(num) {
  if (num == null) return 'N/A'
  const abs = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
  return `$${num.toLocaleString()}`
}

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

  const hasFinancialHealth = company.debtToEquity != null || company.currentRatio != null
  const hasProfitability = company.grossMargin != null || company.operatingMargin != null || company.netMargin != null
  const hasCashFlow = company.freeCashFlow != null || company.operatingCashFlow != null

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
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-slate-500 text-xs">{company.industry || 'Unknown Sector'}</p>
                {company.sector && company.sector !== company.industry && (
                  <span className="text-slate-600 text-xs">/ {company.sector}</span>
                )}
              </div>
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

      {/* Price & Sparkline Section */}
      {company.currentPrice && (
        <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">Current Price</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-white tracking-tight">${company.currentPrice.toFixed(2)}</p>
                {company.dayChange != null && (
                  <span className={`text-sm font-bold ${company.dayChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {company.dayChange >= 0 ? '+' : ''}{company.dayChange.toFixed(2)} ({company.dayChangePercent != null ? `${company.dayChangePercent.toFixed(2)}%` : ''})
                  </span>
                )}
              </div>
            </div>
            {/* 30-day sparkline */}
            {company.priceHistory?.length > 1 && (
              <div className="flex-shrink-0">
                <p className="text-[10px] text-slate-600 text-right mb-1">30 days</p>
                <Sparkline data={company.priceHistory} width={120} height={40} />
              </div>
            )}
          </div>

          {/* 52-week range */}
          {company.yearLow != null && company.yearHigh != null && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                <span>52W Low: ${company.yearLow.toFixed(2)}</span>
                <span>52W High: ${company.yearHigh.toFixed(2)}</span>
              </div>
              <div className="relative h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-slate-500 to-slate-400"
                  style={{ width: `${Math.min(100, Math.max(0, ((company.currentPrice - company.yearLow) / (company.yearHigh - company.yearLow)) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Price Target Bar */}
          {company.priceTarget && (
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                <span>$0</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-400">Target: ${company.priceTarget.toFixed(2)}</span>
                  {upside !== null && (
                    <span className={`font-bold ${upside >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ({upside >= 0 ? '+' : ''}{upside.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${
                    upside >= 0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                  }`}
                  style={{ width: `${priceProgress}%` }}
                />
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
            <div className="relative w-20 h-20 flex-shrink-0 gauge-ring">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1e293b" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  className={colors.ring} strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${valuation.score} ${100 - valuation.score}`} strokeDashoffset="0"
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

      {/* Forward Estimates Grid */}
      <div>
        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-2 px-1">Forward Estimates</p>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Forward P/E" value={company.forwardPE ? company.forwardPE.toFixed(2) : 'N/A'} subtitle="Next 12 months" />
          <MetricCard label="Forward EPS" value={company.forwardEPS ? `$${company.forwardEPS.toFixed(2)}` : 'N/A'} subtitle="Projected" />
          <MetricCard label="Next Qtr EPS" value={company.nextQuarterEPS ? `$${company.nextQuarterEPS.toFixed(2)}` : 'N/A'} subtitle="Consensus estimate" />
          <MetricCard label="Rev Growth" value={company.revenueGrowth ? `${company.revenueGrowth.toFixed(1)}%` : 'N/A'} subtitle="Year over year" highlight={company.revenueGrowth > 0} />
        </div>
      </div>

      {/* Profitability */}
      {hasProfitability && (
        <div>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-2 px-1">Profitability</p>
          <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5 space-y-3">
            {company.grossMargin != null && (
              <MarginBar label="Gross Margin" value={company.grossMargin} />
            )}
            {company.operatingMargin != null && (
              <MarginBar label="Operating Margin" value={company.operatingMargin} />
            )}
            {company.netMargin != null && (
              <MarginBar label="Net Margin" value={company.netMargin} />
            )}
            {company.eps != null && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
                <span className="text-xs text-slate-500">EPS (TTM)</span>
                <span className="text-sm font-bold text-white">${company.eps.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financial Health */}
      {hasFinancialHealth && (
        <div>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-2 px-1">Financial Health</p>
          <div className="grid grid-cols-2 gap-3">
            {company.debtToEquity != null && (
              <MetricCard
                label="Debt / Equity"
                value={company.debtToEquity.toFixed(2)}
                subtitle={company.debtToEquity < 1 ? 'Low leverage' : company.debtToEquity < 2 ? 'Moderate' : 'High leverage'}
                highlight={company.debtToEquity < 1}
              />
            )}
            {company.currentRatio != null && (
              <MetricCard
                label="Current Ratio"
                value={company.currentRatio.toFixed(2)}
                subtitle={company.currentRatio >= 1.5 ? 'Healthy' : company.currentRatio >= 1 ? 'Adequate' : 'Low'}
                highlight={company.currentRatio >= 1.5}
              />
            )}
            {company.totalDebt != null && (
              <MetricCard label="Total Debt" value={formatLargeNumber(company.totalDebt)} />
            )}
            {company.totalCash != null && (
              <MetricCard label="Cash & Equiv." value={formatLargeNumber(company.totalCash)} highlight />
            )}
          </div>
        </div>
      )}

      {/* Cash Flow */}
      {hasCashFlow && (
        <div>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-2 px-1">Cash Flow</p>
          <div className="grid grid-cols-2 gap-3">
            {company.freeCashFlow != null && (
              <MetricCard
                label="Free Cash Flow"
                value={formatLargeNumber(company.freeCashFlow)}
                subtitle="FCF"
                highlight={company.freeCashFlow > 0}
              />
            )}
            {company.operatingCashFlow != null && (
              <MetricCard
                label="Operating CF"
                value={formatLargeNumber(company.operatingCashFlow)}
                subtitle="From operations"
                highlight={company.operatingCashFlow > 0}
              />
            )}
            {company.capex != null && (
              <MetricCard
                label="CapEx"
                value={formatLargeNumber(company.capex)}
                subtitle="Capital expenditure"
              />
            )}
            {company.dividendYield != null && (
              <MetricCard
                label="Div Yield"
                value={`${company.dividendYield.toFixed(2)}%`}
                subtitle="Annual yield"
                highlight={company.dividendYield > 0}
              />
            )}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5">
        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-3">Key Metrics</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <KeyMetricRow label="Market Cap" value={company.marketCap || 'N/A'} />
          <KeyMetricRow label="P/E Ratio (TTM)" value={company.peRatio ? company.peRatio.toFixed(2) : 'N/A'} />
          {company.beta != null && <KeyMetricRow label="Beta" value={company.beta.toFixed(2)} />}
          {company.volume != null && <KeyMetricRow label="Volume" value={company.volume.toLocaleString()} />}
          {company.avgVolume != null && <KeyMetricRow label="Avg Volume" value={company.avgVolume.toLocaleString()} />}
          {company.bookValuePerShare != null && <KeyMetricRow label="Book Value/Sh" value={`$${company.bookValuePerShare.toFixed(2)}`} />}
          {company.employees != null && <KeyMetricRow label="Employees" value={Number(company.employees).toLocaleString()} />}
          {company.exchange && <KeyMetricRow label="Exchange" value={company.exchange} />}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-600 text-center pt-1">
        Data via Financial Modeling Prep. Analyst estimates are forward-looking projections and not guarantees.
      </p>
    </div>
  )
}

function MetricCard({ label, value, subtitle, highlight }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-4 hover:border-slate-600/50 transition-colors group">
      <p className="text-[11px] text-slate-500 font-medium mb-1.5">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
      {subtitle && <p className="text-[10px] text-slate-600 mt-1">{subtitle}</p>}
    </div>
  )
}

function KeyMetricRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  )
}

function MarginBar({ label, value }) {
  const clamped = Math.max(0, Math.min(100, value))
  const isGood = value > 20
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className={`text-sm font-bold ${isGood ? 'text-emerald-400' : value > 0 ? 'text-white' : 'text-red-400'}`}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isGood ? 'bg-emerald-500/70' : value > 0 ? 'bg-slate-400/50' : 'bg-red-500/50'
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
