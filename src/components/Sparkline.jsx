export default function Sparkline({ data, width = 200, height = 48 }) {
  if (!data?.length || data.length < 2) return null

  const values = data.map(d => d.close)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const isPositive = values[values.length - 1] >= values[0]
  const strokeColor = isPositive ? '#34d399' : '#f87171'
  const fillColor = isPositive ? 'url(#sparkGreen)' : 'url(#sparkRed)'

  const padding = 2
  const w = width - padding * 2
  const h = height - padding * 2

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * w
    const y = padding + h - ((v - min) / range) * h
    return `${x},${y}`
  })

  const linePath = `M${points.join(' L')}`
  const areaPath = `${linePath} L${padding + w},${padding + h} L${padding},${padding + h} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="block"
    >
      <defs>
        <linearGradient id="sparkGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={fillColor} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
