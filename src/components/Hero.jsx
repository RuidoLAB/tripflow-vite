import {
  getFixedDailyBudget, getTodayAdjustedBudget, getYesterdayDelta,
  getRemaining, getTotalSpent, getTodaySpent, getTripInfo,
  getSmartDailyBudget, fmt, fmtDec
} from '../lib/budget'

export default function Hero({ expenses, config }) {
  const fixed = getFixedDailyBudget(config)
  const adjusted = getTodayAdjustedBudget(expenses, config)
  const delta = getYesterdayDelta(expenses, config)
  const remaining = getRemaining(expenses, config)
  const totalSpent = getTotalSpent(expenses)
  const todaySpent = getTodaySpent(expenses, config)
  const smart = getSmartDailyBudget(expenses, config)
  const { started, ended, dayNumber, remainingDays, totalDays } = getTripInfo(config)

  const totalUsable = config?.totalUsable || 1450
  const budgetPct = Math.min((totalSpent / totalUsable) * 100, 100)
  const daysPct = totalDays > 0 ? ((dayNumber - 1) / totalDays) * 100 : 0
  const isOver = budgetPct > daysPct + 5
  const isUnder = budgetPct < daysPct - 5
  const statusColor = isOver ? '#FF5757' : isUnder ? '#4AE6A4' : '#FFB547'
  const statusLabel = isOver ? 'Sobre presupuesto' : isUnder ? 'Bajo presupuesto' : 'En objetivo'

  const hasDelta = Math.abs(delta) > 0.5
  const deltaPositive = delta >= 0
  const todayPct = fixed > 0 ? Math.min((todaySpent / fixed) * 100, 100) : 0
  const todayRemaining = fixed - todaySpent

  if (!started) return (
    <div style={styles.card}>
      <div style={styles.bg1} /><div style={styles.bg2} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✈️</div>
        <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: '#fff', marginBottom: 8 }}>Viaje no iniciado</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Configura tu presupuesto e inicia el viaje más abajo</div>
      </div>
    </div>
  )

  if (ended) return (
    <div style={styles.card}>
      <div style={styles.bg1} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏁</div>
        <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: '#fff', marginBottom: 8 }}>Viaje finalizado</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Total gastado: {fmt(totalSpent)} de {fmt(totalUsable)}</div>
      </div>
    </div>
  )

  return (
    <div style={styles.card}>
      <div style={styles.bg1} /><div style={styles.bg2} />
      <div style={{ position: 'relative', zIndex: 1 }}>

        <div style={styles.topRow}>
          <div style={{ ...styles.badge, background: `${statusColor}18`, border: `1px solid ${statusColor}30`, color: statusColor }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
            {statusLabel}
          </div>
          <div style={styles.dayBadge}>Día {dayNumber} de {totalDays}</div>
        </div>

        {/* Big number + adjusted pill */}
        <p style={styles.label}>Presupuesto diario</p>
        <div style={styles.amountRow}>
          <span style={styles.amount}>{fmt(fixed)}</span>
          <span style={styles.currency}>USD</span>
          {hasDelta && (
            <div style={styles.adjustedPill}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>real hoy</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: deltaPositive ? '#4AE6A4' : '#FF5757', lineHeight: 1 }}>
                {fmt(adjusted)}
              </span>
              <span style={{ fontSize: 11, color: deltaPositive ? '#4AE6A4' : '#FF5757' }}>
                {deltaPositive ? `+${fmt(delta)}` : fmt(delta)} de ayer
              </span>
            </div>
          )}
        </div>

        {/* Today bar */}
        <div style={styles.todaySection}>
          <div style={styles.todayHeader}>
            <span style={styles.todayLabel}>Gastado hoy</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 14, color: todayPct > 90 ? '#FF5757' : '#fff' }}>{fmtDec(todaySpent)}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>de {fmt(fixed)}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: todayRemaining >= 0 ? 'rgba(74,230,164,0.08)' : 'rgba(255,87,87,0.08)', color: todayRemaining >= 0 ? '#4AE6A4' : '#FF5757' }}>
                {todayRemaining >= 0 ? `quedan ${fmt(todayRemaining)}` : `pasado ${fmt(-todayRemaining)}`}
              </span>
            </div>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${todayPct}%`, background: todayPct > 90 ? '#FF5757' : todayPct > 70 ? '#FFB547' : '#4AE6A4' }} />
          </div>
        </div>

        {/* Sub stats */}
        <div style={styles.substats}>
          <SubStat label="Ppto. usable" value={fmt(totalUsable)} />
          <SubStat label="Total gastado" value={fmt(totalSpent)} color="#FFB547" />
          <SubStat label="Restante" value={fmt(remaining)} color="#4AE6A4" />
          <SubStat label="Días rest." value={`${remainingDays}d`} />
        </div>

        {/* Smart suggestion */}
        {Math.abs(smart - fixed) > 1 && (
          <div style={styles.smartRow}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Ppto. diario recomendado con lo que queda</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: smart < fixed ? '#FF5757' : '#4AE6A4' }}>{fmt(smart)}/día</span>
          </div>
        )}

      </div>
    </div>
  )
}

function SubStat({ label, value, color }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '10px 12px' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: color || '#fff' }}>{value}</div>
    </div>
  )
}

const styles = {
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '26px 24px', position: 'relative', overflow: 'hidden' },
  bg1: { position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(74,230,164,0.06)', filter: 'blur(40px)', pointerEvents: 'none' },
  bg2: { position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(96,170,255,0.05)', filter: 'blur(40px)', pointerEvents: 'none' },
  topRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 100 },
  dayBadge: { fontSize: 12, color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: 100 },
  label: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6, fontWeight: 500 },
  amountRow: { display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  amount: { fontFamily: 'var(--font-display)', fontSize: 60, lineHeight: 1, color: '#fff', letterSpacing: -2 },
  currency: { fontSize: 15, color: 'rgba(255,255,255,0.25)', marginBottom: 4 },
  adjustedPill: { display: 'flex', flexDirection: 'column', gap: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '8px 12px', marginBottom: 4 },
  todaySection: { marginBottom: 18 },
  todayHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 },
  todayLabel: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  progressTrack: { height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },
  substats: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 },
  smartRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px' },
}
