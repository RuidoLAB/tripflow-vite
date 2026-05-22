import { getDailyBudget, getRemainingBudget, getTotalUsableSpent, getRemainingDays, getTodaySpent, getBudgetStatus, getDaysElapsed, getTotalTripDays, usd, usdDecimal, TRIP_CONFIG } from '../lib/budget'

export default function HeroBudget({ expenses }) {
  const daily = getDailyBudget(expenses)
  const remaining = getRemainingBudget(expenses)
  const totalSpent = getTotalUsableSpent(expenses)
  const remainingDays = getRemainingDays()
  const todaySpent = getTodaySpent(expenses)
  const status = getBudgetStatus(expenses)
  const pctUsed = Math.min((totalSpent / TRIP_CONFIG.totalUsable) * 100, 100)
  const pctDays = (getDaysElapsed() / getTotalTripDays()) * 100

  const statusColor = status === 'over' ? '#FF5757' : status === 'under' ? '#4AE6A4' : '#FFB547'
  const statusLabel = status === 'over' ? 'Sobre presupuesto' : status === 'under' ? 'Bajo presupuesto' : 'En objetivo'
  const barColor = status === 'over' ? '#FF5757' : status === 'under' ? '#4AE6A4' : '#FFB547'

  return (
    <div style={s.card}>
      <div style={s.bg1} /><div style={s.bg2} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ ...s.badge, background: `${statusColor}18`, border: `1px solid ${statusColor}30`, color: statusColor }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block', marginRight: 6 }} />
          {statusLabel}
        </div>
        <p style={s.label}>Disponible para gastar hoy</p>
        <div style={s.amountRow}>
          <span style={s.amount}>{usd(daily)}</span>
          <span style={s.amountSub}>USD</span>
        </div>
        <div style={s.subGrid}>
          <SubStat label="Ppto. total" value={usd(TRIP_CONFIG.totalUsable)} />
          <SubStat label="Gastado" value={usd(totalSpent)} color={totalSpent > 0 ? '#FFB547' : null} />
          <SubStat label="Restante" value={usd(remaining)} color="#4AE6A4" />
          <SubStat label="Días rest." value={`${remainingDays}d`} />
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={s.progressMeta}>
            <span>Progreso</span>
            <span>{pctUsed.toFixed(1)}% usado · {pctDays.toFixed(0)}% del viaje</span>
          </div>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressFill, width: `${pctUsed}%`, background: barColor }} />
          </div>
        </div>
        {todaySpent > 0 && (
          <div style={s.todayRow}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Gastado hoy</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{usdDecimal(todaySpent)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function SubStat({ label, value, color }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '11px 14px' }}>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 500, color: color || '#fff' }}>{value}</p>
    </div>
  )
}

const s = {
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden' },
  bg1: { position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(74,230,164,0.06)', pointerEvents: 'none' },
  bg2: { position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(96,170,255,0.05)', pointerEvents: 'none' },
  badge: { display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 100, marginBottom: 18 },
  label: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: 6 },
  amountRow: { display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 20 },
  amount: { fontFamily: "'DM Serif Display', serif", fontSize: 60, lineHeight: 1, letterSpacing: -2 },
  amountSub: { fontSize: 14, color: 'rgba(255,255,255,0.25)', paddingBottom: 8 },
  subGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 },
  progressMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 8 },
  progressTrack: { height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, transition: 'width 0.6s ease' },
  todayRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' },
}
