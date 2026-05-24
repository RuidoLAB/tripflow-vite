import { getByCity, fmt } from '../lib/budget'

const DEFAULT_CITY_BUDGETS = {
  Orlando: 450,
  'New York City': 400,
  'Los Angeles': 600,
  General: 0,
}

export default function CityBreakdown({ expenses, config }) {
  const data = getByCity(expenses)
  const cityBudgets = config?.cityBudgets || DEFAULT_CITY_BUDGETS

  return (
    <div style={styles.card}>
      <div style={styles.title}>Por ciudad</div>
      {data.length === 0 ? (
        <div style={styles.empty}>Sin datos aún</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.map(({ city, spent, color }) => {
            const budget = cityBudgets[city] || null
            const pct = budget ? Math.min((spent / budget) * 100, 100) : null
            const isOver = budget && spent > budget
            return (
              <div key={city}>
                <div style={styles.row}>
                  <div style={styles.cityName}>
                    <span style={{ ...styles.dot, background: color }} />
                    {city}
                    {isOver && <span style={styles.overBadge}>sobre ppto</span>}
                  </div>
                  <div style={styles.cityAmt}>
                    <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmt(spent)}</span>
                    {budget > 0 && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}> / {fmt(budget)}</span>}
                  </div>
                </div>
                {pct !== null && budget > 0 && (
                  <div style={styles.track}>
                    <div style={{ ...styles.fill, width: `${pct}%`, background: isOver ? '#FF5757' : color }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 18 },
  title: { fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 },
  empty: { fontSize: 13, color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '30px 0' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  cityName: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  dot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  overBadge: { fontSize: 10, color: '#FF5757', background: 'rgba(255,87,87,0.1)', border: '1px solid rgba(255,87,87,0.2)', borderRadius: 100, padding: '2px 8px' },
  cityAmt: { fontSize: 13 },
  track: { height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 2, transition: 'width 0.6s ease' },
}
