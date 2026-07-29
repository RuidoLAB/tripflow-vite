import {
  getDailyBudget, getTodayRemaining, getTodaySpent,
  getRemaining, getTotalSpent, getTripInfo,
  fmt, fmtDec
} from '../lib/budget'

export default function Hero({ expenses, config }) {
  const daily = getDailyBudget(expenses, config)
  const todaySpent = getTodaySpent(expenses, config)
  const todayRemaining = getTodayRemaining(expenses, config)
  const remaining = getRemaining(expenses, config)
  const totalSpent = getTotalSpent(expenses)
  const { started, ended, dayNumber, remainingDays, totalDays } = getTripInfo(config)

  const totalUsable = config?.totalUsable || 1450
  const todayPct = daily > 0 ? Math.min((todaySpent / daily) * 100, 100) : 0
  const totalPct = Math.min((totalSpent / totalUsable) * 100, 100)
  const daysPct = totalDays > 0 ? ((dayNumber - 1) / totalDays) * 100 : 0

  const isOver = totalPct > daysPct + 5
  const isUnder = totalPct < daysPct - 5
  const statusColor = isOver ? '#FF5757' : isUnder ? '#4AE6A4' : '#FFB547'
  const statusLabel = isOver ? 'Sobre presupuesto' : isUnder ? 'Bajo presupuesto' : 'En objetivo'

  const bigColor = todayRemaining < 0 ? '#FF5757' : todayRemaining < daily * 0.15 ? '#FFB547' : '#fff'

  if (!started) return (
    <div style={s.card}>
      <div style={s.bg1} /><div style={s.bg2} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✈️</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff', marginBottom: 8 }}>Viaje no iniciado</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Configura e inicia el viaje más abajo</div>
      </div>
    </div>
  )

  if (ended) return (
    <div style={s.card}>
      <div style={s.bg1} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏁</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff', marginBottom: 8 }}>Viaje finalizado</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Gastaste {fmt(totalSpent)} de {fmt(totalUsable)}</div>
      </div>
    </div>
  )

  return (
    <div style={s.card}>
      <div style={s.bg1} /><div style={s.bg2} />
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Status + day */}
        <div style={s.topRow}>
          <div style={{ ...s.badge, background: `${statusColor}18`, border: `1px solid ${statusColor}30`, color: statusColor }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
            {statusLabel}
          </div>
          <div style={s.dayBadge}>Día {dayNumber} de {totalDays}</div>
        </div>

        {/* Big number — what's left today */}
        <p style={s.label}>Disponible para gastar hoy</p>
        <div style={s.amountRow}>
          <span style={{ ...s.amount, color: bigColor }}>
            {fmt(Math.max(todayRemaining, 0))}
          </span>
          <span style={s.currency}>USD</span>
        </div>

        {/* Today progress bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={s.progressTrack}>
            <div style={{
              ...s.progressFill,
              width: `${todayPct}%`,
              background: todayPct > 90 ? '#FF5757' : todayPct > 70 ? '#FFB547' : '#4AE6A4'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            <span>Gastado hoy: {fmtDec(todaySpent)} de {fmt(daily)}</span>
            {todayRemaining >= 0
              ? <span style={{ color: '#4AE6A4' }}>Quedan {fmt(todayRemaining)}</span>
              : <span style={{ color: '#FF5757' }}>Pasado {fmt(-todayRemaining)}</span>
            }
          </div>
        </div>

        {/* Sub stats */}
        <div style={s.substats}>
          <SubStat label="Ppto. usable" value={fmt(totalUsable)} />
          <SubStat label="Total gastado" value={fmt(totalSpent)} color="#FFB547" />
          <SubStat label="Restante" value={fmt(remaining)} color="#4AE6A4" />
          <SubStat label="Días rest." value={`${remainingDays}d`} />
        </div>

        {/* Daily budget note */}
        <div style={s.dailyNote}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Presupuesto diario actual</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: '#60AAFF' }}>{fmt(daily)}/día</span>
        </div>

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

const s = {
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '26px 24px', position: 'relative', overflow: 'hidden' },
  bg1: { position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(74,230,164,0.06)', filter: 'blur(40px)', pointerEvents: 'none' },
  bg2: { position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(96,170,255,0.05)', filter: 'blur(40px)', pointerEvents: 'none' },
  topRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 100 },
  dayBadge: { fontSize: 12, color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: 100 },
  label: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 6, fontWeight: 500 },
  amountRow: { display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 18 },
  amount: { fontFamily: 'var(--font-display)', fontSize: 64, lineHeight: 1, letterSpacing: -2, transition: 'color 0.3s' },
  currency: { fontSize: 15, color: 'rgba(255,255,255,0.25)', marginBottom: 6 },
  progressTrack: { height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width 0.4s ease' },
  substats: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 },
  dailyNote: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px' },
}
