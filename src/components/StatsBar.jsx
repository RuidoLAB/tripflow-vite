import { getTodaySpent, getDailyBudget, getTotalSpent, fmt } from '../lib/budget'

export default function StatsBar({ expenses, config }) {
  const todaySpent = getTodaySpent(expenses)
  const daily = getDailyBudget(expenses, config)
  const totalSpent = getTotalSpent(expenses)
  const todayPct = Math.min((todaySpent / daily) * 100, 100) || 0
  const totalPct = Math.min((totalSpent / config.totalUsable) * 100, 100)

  return (
    <div style={styles.grid}>
      <Stat icon="☀" label="Hoy gastado" value={fmt(todaySpent)} sub={`de ${fmt(daily)}`} pct={todayPct} barColor={todayPct > 90 ? '#FF5757' : todayPct > 70 ? '#FFB547' : '#4AE6A4'} iconBg="rgba(255,181,71,0.1)" iconColor="#FFB547" />
      <Stat icon="◎" label="Ppto. diario" value={fmt(daily)} sub="dinámico" pct={null} iconBg="rgba(96,170,255,0.1)" iconColor="#60AAFF" />
      <Stat icon="◈" label="Total usado" value={fmt(totalSpent)} sub={`${totalPct.toFixed(0)}% del total`} pct={totalPct} barColor={totalPct > 90 ? '#FF5757' : '#4AE6A4'} iconBg="rgba(74,230,164,0.1)" iconColor="#4AE6A4" />
    </div>
  )
}

function Stat({ icon, label, value, sub, pct, barColor, iconBg, iconColor }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.icon, background: iconBg, color: iconColor }}>{icon}</div>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
      <div style={styles.sub}>{sub}</div>
      {pct !== null && (
        <div style={styles.track}>
          <div style={{ ...styles.fill, width: `${pct}%`, background: barColor }} />
        </div>
      )}
    </div>
  )
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '14px 14px 12px' },
  icon: { width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginBottom: 10 },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.4, marginBottom: 3 },
  value: { fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, color: '#fff' },
  sub: { fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 2 },
  track: { height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden', marginTop: 10 },
  fill: { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },
}
