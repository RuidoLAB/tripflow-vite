import { useState } from 'react'
import { fmt, TIMEZONES, CITIES } from '../lib/budget'

const DEFAULT_CITY_BUDGETS = {
  Orlando: 450,
  'New York City': 400,
  'Los Angeles': 600,
  General: 0,
}

export default function BudgetConfig({ config, onSave }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    ...config,
    cityBudgets: config.cityBudgets || DEFAULT_CITY_BUDGETS,
  })

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: key === 'totalDays' ? parseInt(value) || 1 : parseFloat(value) || 0 }))
  }

  function handlePrepaid(key, value) {
    setForm(prev => ({ ...prev, prepaid: { ...prev.prepaid, [key]: parseFloat(value) || 0 } }))
  }

  function handleCityBudget(city, value) {
    setForm(prev => ({ ...prev, cityBudgets: { ...prev.cityBudgets, [city]: parseFloat(value) || 0 } }))
  }

  function handleStartNow() {
    setForm(prev => ({ ...prev, startDate: new Date().toISOString() }))
  }

  function handleSave() {
    onSave(form)
    setOpen(false)
  }

  const totalPrepaid = (form.prepaid?.flights || 0) + (form.prepaid?.parks || 0) + (form.prepaid?.hotel || 0)
  const usable = (form.totalBudget || 0) - totalPrepaid
  const dailyFixed = usable / (form.totalDays || 16)

  const startLabel = form.startDate
    ? new Date(form.startDate).toLocaleString('es-CL', {
        timeZone: form.timezone || 'America/New_York',
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      })
    : null

  const tzLabel = TIMEZONES.find(t => t.value === (form.timezone || 'America/New_York'))?.label.split(' — ')[0]

  if (!open) return (
    <button onClick={() => setOpen(true)} style={styles.trigger}>
      <span style={styles.triggerIcon}>⚙</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={styles.triggerTitle}>Configurar presupuesto</div>
        <div style={styles.triggerSub}>
          {config.startDate
            ? `Viaje iniciado · ${config.totalDays} días · ${fmt(config.totalUsable || 0)} usable`
            : 'Configura tu presupuesto e inicia el viaje'}
        </div>
      </div>
      <span style={styles.chevron}>›</span>
    </button>
  )

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>⚙ Configurar presupuesto</div>
        <button onClick={() => setOpen(false)} style={styles.closeBtn}>×</button>
      </div>

      {/* Total budget */}
      <Section label="Presupuesto total del viaje">
        <div style={styles.inputRow}>
          <span style={styles.prefix}>USD</span>
          <input type="number" value={form.totalBudget || ''} onChange={e => handleChange('totalBudget', e.target.value)} placeholder="3500" min="0" style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 600 }} />
        </div>
      </Section>

      {/* Prepaid */}
      <Section label="Pagado antes del viaje">
        <div style={styles.prepaidGrid}>
          <PrepaidInput label="✈ Vuelos" value={form.prepaid?.flights || ''} onChange={v => handlePrepaid('flights', v)} />
          <PrepaidInput label="🏰 Parques" value={form.prepaid?.parks || ''} onChange={v => handlePrepaid('parks', v)} />
          <PrepaidInput label="🏨 Hotel" value={form.prepaid?.hotel || ''} onChange={v => handlePrepaid('hotel', v)} />
        </div>
      </Section>

      {/* City budgets */}
      <Section label="Presupuesto por ciudad">
        <div style={styles.prepaidGrid}>
          {CITIES.filter(c => c !== 'General').map(city => (
            <PrepaidInput
              key={city}
              label={city === 'New York City' ? '🗽 NYC' : city === 'Los Angeles' ? '🎬 LA' : `🏰 ${city}`}
              value={form.cityBudgets?.[city] ?? DEFAULT_CITY_BUDGETS[city]}
              onChange={v => handleCityBudget(city, v)}
            />
          ))}
        </div>
        <p style={styles.hint}>Usado para mostrar el progreso por ciudad en el desglose.</p>
      </Section>

      {/* Duration */}
      <Section label="Duración del viaje">
        <div style={styles.inputRow}>
          <input type="number" value={form.totalDays || ''} onChange={e => handleChange('totalDays', e.target.value)} placeholder="16" min="1" max="365" style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 600 }} />
          <span style={styles.suffix}>días</span>
        </div>
      </Section>

      {/* Timezone */}
      <Section label="Zona horaria actual">
        <select value={form.timezone || 'America/New_York'} onChange={e => setForm(prev => ({ ...prev, timezone: e.target.value }))}>
          {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
        </select>
        <p style={styles.hint}>Cámbiala cuando te muevas de ciudad. El cambio de día ocurre a medianoche en esta zona.</p>
      </Section>

      {/* Start date */}
      <Section label="Inicio del viaje">
        <button onClick={handleStartNow} style={styles.startBtn}>
          {form.startDate ? '🔄 Reiniciar desde ahora' : '🚀 Iniciar viaje ahora'}
        </button>
        <p style={styles.hint}>O ajusta la fecha manualmente:</p>
        <input
          type="datetime-local"
          value={form.startDate ? new Date(form.startDate).toISOString().slice(0, 16) : ''}
          onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value ? new Date(e.target.value).toISOString() : null }))}
          style={{ fontSize: 13, width: '100%' }}
        />
        {startLabel && (
          <div style={styles.startedBadge}>✓ Iniciado el {startLabel} ({tzLabel})</div>
        )}
      </Section>

      {/* Summary */}
      <div style={styles.summary}>
        <SummaryRow label="Total prepagado" value={fmt(totalPrepaid)} />
        <SummaryRow label="Disponible para gastar" value={fmt(Math.max(usable, 0))} color="#4AE6A4" />
        <SummaryRow label="Presupuesto diario fijo" value={`${fmt(dailyFixed)}/día`} color="#60AAFF" />
      </div>

      <button className="btn-primary" onClick={handleSave}>Guardar configuración</button>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      {children}
    </div>
  )
}

function PrepaidInput({ label, value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>$</span>
        <input type="number" value={value} onChange={e => onChange(e.target.value)} style={{ paddingLeft: 24, fontSize: 14 }} min="0" />
      </div>
    </div>
  )
}

function SummaryRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: color || '#fff' }}>{value}</span>
    </div>
  )
}

const styles = {
  trigger: { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' },
  triggerIcon: { width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 },
  triggerTitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 },
  triggerSub: { fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chevron: { fontSize: 20, color: 'rgba(255,255,255,0.2)', flexShrink: 0 },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: 600, color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 22, lineHeight: 1, cursor: 'pointer', padding: 0 },
  inputRow: { display: 'flex', alignItems: 'center', gap: 10 },
  prefix: { fontSize: 13, color: 'rgba(255,255,255,0.3)', flexShrink: 0 },
  suffix: { fontSize: 13, color: 'rgba(255,255,255,0.3)', flexShrink: 0 },
  prepaidGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  hint: { fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 2, lineHeight: 1.5 },
  startBtn: { width: '100%', background: 'rgba(74,230,164,0.1)', border: '1px solid rgba(74,230,164,0.2)', borderRadius: 12, padding: '12px 16px', color: '#4AE6A4', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  startedBadge: { fontSize: 12, color: '#4AE6A4', background: 'rgba(74,230,164,0.08)', border: '1px solid rgba(74,230,164,0.15)', borderRadius: 8, padding: '8px 12px', marginTop: 4 },
  summary: { background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 },
}
