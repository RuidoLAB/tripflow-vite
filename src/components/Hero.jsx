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

  // What's left to spend today
  const todayBudget = adjusted  // fixed + yesterday delta
  const todayLeft = todayBudget - todaySpent
  const todayPct = todayBudget > 0 ? Math.min((todaySpent / todayBudget) * 100, 100) : 0

  const budgetPct = Math.min((totalSpent / totalUsable) * 100, 100)
  const daysPct = totalDays > 0 ? ((dayNumber - 1) / totalDays) * 100 : 0
  const isOver = budgetPct > daysPct + 5
  const isUnder = budgetPct < daysPct - 5
  const statusColor = isOver ? '#FF5757' : isUnder ? '#4AE6A4' : '#FFB547'
  const statusLabel = isOver ? 'Sobre presupuesto' : isUnder ? 'Bajo presupuesto' : 'En objetivo'

  const hasDelta = Math.abs(delta) > 0.5
  const deltaPositive = delta >= 0

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

  const bigNumberColor = todayLeft < 0 ? '#FF5757' : todayLeft < fixed * 0.2 ? '#FFB547' : '#fff'

  return (
    <div style={styles.card}>
      <div style={styles.bg1} /><div style={styles.bg2} />
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Top row */}
        <div style={styles.topRow}>
          <div style={{ ...styles.badge, background: `${statusColor}18`, border: `1px solid ${statusColor}30`, color: statusColor }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
            {statusLabel}
          </div>
          <div style={styles.dayBadge}>Día {dayNumber} de {totalDays}</div>
        </div>

        {/* BIG number — what's left today */}
        <p style={styles.label}>Disponible para gastar hoy</p>
        <div style={styles.amountRow}>
          <span style={{ ...styles.amount, color: bigNumberColor }}>
            {fmt(Math.max(todayLeft, 0))}
          </span>
          <span style={styles.currency}>USD</span>

          {/* Small pill: fixed budget + delta info */}
          <div style={styles.infoPill}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Ppto. diario</span>
              <span style={styles.infoVal}>{fmt(fixed)}</span>
            </div>
            {hasDelta && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Ajuste de ayer</span>
                <span style={{ ...styles.infoVal, color: deltaPositive ? '#4AE6A4' : '#FF5757' }}>
                  {deltaPositive ? '+' : ''}{fmt(delta)}
                </span>
              </div>
            )}
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Gastado hoy</span>
              <span style={{ ...styles.infoVal, color: '#FFB547' }}>-{fmtDec(todaySpent)}</span>
            </div>
          </div>
        </div>

        {/* Today progress bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={styles.progressTrack}>
            <div style={{
              ...styles.progressFill,
              width: `${todayPct}%`,
              background: todayPct > 90 ? '#FF5757' : todayPct > 70 ? '#FFB547' : '#4AE6A4'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            <span>{todayPct.toFixed(0)}% usado hoy</span>
            {todayLeft < 0
              ? <span style={{ color: '#FF5757' }}>Pasado por {fmt(-todayLeft)}</span>
              : <span>Quedan {fmt(todayLeft)}</span>
            }
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
  amountRow: { display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 18, flexWrap: 'wrap' },
  amount: { fontFamily: 'var(--font-display)', fontSize: 64, lineHeight: 1, letterSpacing: -2, transition: 'color 0.3s' },
  currency: { fontSize: 15, color: 'rgba(255,255,255,0.25)', marginBottom: 6 },
  infoPill: { display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 14px', marginBottom: 4 },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  infoLabel: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  infoVal: { fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fff' },
  progressTrack: { height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width 0.4s ease' },
  substats: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 },
  smartRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px' },
}
