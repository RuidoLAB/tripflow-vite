import { getDailyBudget, getRemaining, getTotalSpent, getRemainingDays, getTodaySpent, getDaysElapsed, getTripDays, fmt, fmtDec, TRIP } from '../lib/budget'

export default function Hero({ expenses }) {
  const daily = getDailyBudget(expenses)
  const remaining = getRemaining(expenses)
  const totalSpent = getTotalSpent(expenses)
  const remainingDays = getRemainingDays()
  const todaySpent = getTodaySpent(expenses)
  const daysElapsed = getDaysElapsed()
  const totalDays = getTripDays()

  const budgetPct = Math.min((totalSpent / TRIP.totalUsable) * 100, 100)
  const daysPct = (daysElapsed / totalDays) * 100
  const isOver = budgetPct > daysPct + 5
  const isUnder = budgetPct < daysPct - 5

  const statusColor = isOver ? '#FF5757' : isUnder ? '#4AE6A4' : '#FFB547'
  const statusLabel = isOver ? 'Sobre presupuesto' : isUnder ? 'Bajo presupuesto' : 'En objetivo'
  const barColor = isOver ? '#FF5757' : isUnder ? '#4AE6A4' : '#FFB547'

  return (
    <div style={styles.card}>
      <div style={styles.bg1} /><div style={styles.bg2} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ ...styles.badge, background: `${statusColor}18`, border: `1px solid ${statusColor}30`, color: statusColor }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
          {statusLabel}
        </div>

        <p style={styles.label}>Disponible para gastar hoy</p>
        <div style={styles.amountRow}>
          <span style={styles.amount}>{fmt(daily)}</span>
          <span style={styles.currency}>USD</span>
        </div>

        <div style={styles.substats}>
          <SubStat label="Ppto. total" value={fmt(TRIP.totalUsable)} />
          <SubStat label="Gastado" value={fmt(totalSpent)} color="#FFB547" />
          <SubStat label="Restante" value={fmt(remaining)} color="#4AE6A4" />
          <SubStat label="Días rest." value={`${remainingDays}d`} />
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={styles.progressMeta}>
            <span>Progreso del presupuesto</span>
            <span>{budgetPct.toFixed(1)}% usado · {daysPct.toFixed(0)}% del viaje</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${budgetPct}%`, background: barColor }} />
          </div>
        </div>

        {todaySpent > 0 && (
          <div style={styles.todayRow}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Gastado hoy</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmtDec(todaySpent)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function SubStat({ label, value, color }) {
  return (
    <div style={styles.substat}>
      <div style={styles.substatLabel}>{label}</div>
      <div style={{ ...styles.substatVal, color: color || '#fff' }}>{value}</div>
    </div>
  )
}

const styles = {
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '26px 24px', position: 'relative', overflow: 'hidden' },
  bg1: { position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(74,230,164,0.06)', filter: 'blur(40px)', pointerEvents: 'none' },
  bg2: { position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(96,170,255,0.05)', filter: 'blur(40px)', pointerEvents: 'none' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 100, marginBottom: 16 },
  label: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6, fontWeight: 500 },
  amountRow: { display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 20 },
  amount: { fontFamily: 'var(--font-display)', fontSize: 60, lineHeight: 1, color: '#fff', letterSpacing: -2 },
  currency: { fontSize: 15, color: 'rgba(255,255,255,0.25)', marginBottom: 4 },
  substats: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 },
  substat: { background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 12px' },
  substatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4 },
  substatVal: { fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500 },
  progressMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 7 },
  progressTrack: { height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, transition: 'width 0.6s ease' },
  todayRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' },
}
