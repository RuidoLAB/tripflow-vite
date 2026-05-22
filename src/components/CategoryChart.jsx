import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { getByCategory, fmt } from '../lib/budget'

export default function CategoryChart({ expenses }) {
  const data = getByCategory(expenses)
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div style={styles.card}>
      <div style={styles.title}>Por categoría</div>
      {data.length === 0 ? (
        <div style={styles.empty}>Sin gastos aún</div>
      ) : (
        <>
          <div style={{ width: '100%', height: 140 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value" strokeWidth={0}>
                  {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null
                  const d = payload[0].payload
                  return (
                    <div style={styles.tooltip}>
                      <div style={{ color: d.color, fontSize: 12 }}>{d.label}</div>
                      <div style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmt(d.value)}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{((d.value / total) * 100).toFixed(1)}%</div>
                    </div>
                  )
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
            {data.slice(0, 6).map(item => (
              <div key={item.key} style={styles.legendRow}>
                <span style={{ ...styles.dot, background: item.color }} />
                <span style={styles.legendLabel}>{item.label}</span>
                <span style={styles.legendVal}>{fmt(item.value)}</span>
                <span style={styles.legendPct}>{((item.value / total) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 18 },
  title: { fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 },
  empty: { fontSize: 13, color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '30px 0' },
  tooltip: { background: 'rgba(13,16,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px' },
  legendRow: { display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { fontSize: 12, color: 'rgba(255,255,255,0.45)', flex: 1 },
  legendVal: { fontSize: 12, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.65)', fontWeight: 500 },
  legendPct: { fontSize: 11, color: 'rgba(255,255,255,0.25)', width: 28, textAlign: 'right' },
}
