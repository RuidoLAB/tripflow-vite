import { useState } from 'react'
import { TIMEZONES, fmt } from '../lib/budget'
import TripCalendar from './TripCalendar'

const STEPS = ['Básico', 'Destinos', 'Calendario', 'Prepagados', 'Resumen']

const CITY_COLORS = [
  '#4AE6A4', '#60AAFF', '#FFB547', '#F472B6',
  '#818CF8', '#34D399', '#FB923C', '#38BDF8',
  '#FACC15', '#A78BFA', '#FF5757', '#86EFAC',
]

const PREPAID_CATEGORIES = [
  { value: 'vuelos', label: '✈️ Vuelos' },
  { value: 'hotel', label: '🏨 Hotel' },
  { value: 'parques', label: '🏰 Parques' },
  { value: 'actividades', label: '🎟️ Actividades' },
  { value: 'transporte', label: '🚌 Transporte' },
  { value: 'otros', label: '📦 Otros' },
]

function StepIndicator({ current }) {
  return (
    <div style={si.wrap}>
      {STEPS.map((label, i) => (
        <div key={i} style={si.item}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              ...si.dot,
              background: i < current ? '#4AE6A4' : i === current ? '#fff' : 'rgba(255,255,255,0.1)',
              border: i === current ? '2px solid #4AE6A4' : 'none',
              color: i <= current ? '#080A0F' : 'rgba(255,255,255,0.4)',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ ...si.label, color: i === current ? '#fff' : 'rgba(255,255,255,0.3)' }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div style={{ ...si.line, background: i < current ? '#4AE6A4' : 'rgba(255,255,255,0.1)', marginBottom: 18 }} />}
        </div>
      ))}
    </div>
  )
}

const si = {
  wrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 24, padding: '0 4px' },
  item: { display: 'flex', alignItems: 'center', gap: 0 },
  dot: { width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 },
  label: { fontSize: 10, fontWeight: 500, whiteSpace: 'nowrap', textAlign: 'center' },
  line: { width: 12, height: 1, flexShrink: 0 },
}

// ── Step 1: Basic ─────────────────────────────────────────────────────────────
function Step1({ data, onChange }) {
  return (
    <div style={s.stepWrap}>
      <div style={s.stepTitle}>Lo básico</div>
      <div style={s.stepSub}>Ponle nombre a tu viaje y define el presupuesto</div>

      <div style={s.field}>
        <div style={s.label}>Nombre del viaje</div>
        <input type="text" placeholder="ej: Europa 2025" value={data.name} onChange={e => onChange('name', e.target.value)} maxLength={60} autoFocus />
      </div>

      <div style={s.field}>
        <div style={s.label}>Descripción (opcional)</div>
        <input type="text" placeholder="ej: Road trip con amigos" value={data.description} onChange={e => onChange('description', e.target.value)} maxLength={100} />
      </div>

      <div style={s.field}>
        <div style={s.label}>Presupuesto total</div>
        <div style={{ position: 'relative' }}>
          <span style={s.inputPrefix}>USD</span>
          <input type="number" placeholder="3500" value={data.totalBudget} onChange={e => onChange('totalBudget', e.target.value)} min="0" style={{ paddingLeft: 48, fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 600 }} />
        </div>
      </div>

      <div style={s.row}>
        <div style={{ ...s.field, flex: 1 }}>
          <div style={s.label}>Duración total</div>
          <div style={{ position: 'relative' }}>
            <input type="number" placeholder="16" value={data.totalDays} onChange={e => onChange('totalDays', e.target.value)} min="1" max="365" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, paddingRight: 40 }} />
            <span style={s.inputSuffix}>días</span>
          </div>
        </div>
        <div style={{ ...s.field, flex: 1 }}>
          <div style={s.label}>Zona horaria</div>
          <select value={data.timezone} onChange={e => onChange('timezone', e.target.value)}>
            {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label.split(' — ')[0]}</option>)}
          </select>
        </div>
      </div>

      <div style={s.field}>
        <div style={s.label}>Inicio del viaje</div>
        <button onClick={() => onChange('startDate', new Date().toISOString())} style={s.startBtn}>
          {data.startDate ? '🔄 Reiniciar desde ahora' : '🚀 Iniciar desde ahora'}
        </button>
        <div style={{ marginTop: 8 }}>
          <div style={{ ...s.label, marginBottom: 6 }}>O elige manualmente</div>
          <input
            type="datetime-local"
            value={data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : ''}
            onChange={e => onChange('startDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
            style={{ fontSize: 13, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          />
        </div>
        {data.startDate && (
          <div style={s.startedBadge}>
            ✓ {new Date(data.startDate).toLocaleString('es-CL', { timeZone: data.timezone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Step 2: Destinations ──────────────────────────────────────────────────────
function Step2({ data, onChange }) {
  const [newName, setNewName] = useState('')

  function addCity() {
    if (!newName.trim()) return
    if (data.find(c => c.name.toLowerCase() === newName.trim().toLowerCase())) return
    onChange([...data, { name: newName.trim() }])
    setNewName('')
  }

  function removeCity(i) {
    onChange(data.filter((_, idx) => idx !== i))
  }

  return (
    <div style={s.stepWrap}>
      <div style={s.stepTitle}>Destinos</div>
      <div style={s.stepSub}>¿A qué ciudades o países vas? Los asignarás al calendario en el siguiente paso.</div>

      {data.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map((city, i) => (
            <div key={i} style={s.cityChip}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: CITY_COLORS[i % CITY_COLORS.length], flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, color: '#fff' }}>{city.name}</span>
              <button onClick={() => removeCity(i)} style={s.removeBtn}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="ej: París, Londres, Roma..."
          onKeyDown={e => e.key === 'Enter' && addCity()}
          style={{ flex: 1, fontSize: 14 }}
          autoFocus
        />
        <button onClick={addCity} style={s.addBtn}>+</button>
      </div>

      {data.length === 0 && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13, padding: '12px 0' }}>
          Agrega al menos un destino
        </div>
      )}
    </div>
  )
}

// ── Step 3: Calendar ──────────────────────────────────────────────────────────
function Step3({ cities, startDate, totalDays, dayAssignments, onChange }) {
  const effectiveStart = startDate || new Date().toISOString()
  return (
    <div style={s.stepWrap}>
      <div style={s.stepTitle}>Calendario</div>
      <div style={s.stepSub}>Selecciona un destino y toca o arrastra los días del viaje.</div>
      <TripCalendar
        startDate={effectiveStart}
        totalDays={parseInt(totalDays) || 16}
        cities={cities}
        dayAssignments={dayAssignments}
        onChange={onChange}
      />
    </div>
  )
}

// ── Step 4: Prepaid ───────────────────────────────────────────────────────────
function Step4({ data, onChange, totalBudget }) {
  const [newItem, setNewItem] = useState({ name: '', category: 'vuelos', amount: '' })

  function addItem() {
    if (!newItem.name.trim() || !newItem.amount) return
    onChange([...data, { ...newItem, amount: parseFloat(newItem.amount), id: Date.now() }])
    setNewItem({ name: '', category: 'vuelos', amount: '' })
  }

  function removeItem(id) { onChange(data.filter(i => i.id !== id)) }

  const totalPrepaid = data.reduce((s, i) => s + Number(i.amount), 0)
  const usable = (parseFloat(totalBudget) || 0) - totalPrepaid

  return (
    <div style={s.stepWrap}>
      <div style={s.stepTitle}>Prepagados</div>
      <div style={s.stepSub}>Agrega todo lo que ya pagaste antes del viaje.</div>

      <div style={s.prepaidSummary}>
        <div style={s.summaryRow}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Total prepagado</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmt(totalPrepaid)}</span>
        </div>
        <div style={s.summaryRow}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Disponible para gastar</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: usable >= 0 ? '#4AE6A4' : '#FF5757' }}>{fmt(Math.max(usable, 0))}</span>
        </div>
      </div>

      {data.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map(item => (
            <div key={item.id} style={s.prepaidItem}>
              <span style={{ fontSize: 18 }}>{PREPAID_CATEGORIES.find(c => c.value === item.category)?.label.split(' ')[0] || '📦'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{PREPAID_CATEGORIES.find(c => c.value === item.category)?.label.split(' ').slice(1).join(' ')}</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: '#FFB547' }}>{fmt(item.amount)}</span>
              <button onClick={() => removeItem(item.id)} style={s.removeBtn}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={s.addItemWrap}>
        <input type="text" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="ej: Vuelo Santiago-París" style={{ fontSize: 14 }} />
        <div style={s.row}>
          <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))} style={{ flex: 1, fontSize: 13 }}>
            {PREPAID_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={s.inputPrefixAbs}>$</span>
            <input type="number" value={newItem.amount} onChange={e => setNewItem(p => ({ ...p, amount: e.target.value }))} placeholder="monto" min="0" style={{ fontSize: 14, paddingLeft: 20 }} />
          </div>
          <button onClick={addItem} style={s.addBtn}>+</button>
        </div>
      </div>

      {data.length === 0 && (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Sin items — puedes saltarte este paso</div>
      )}
    </div>
  )
}

// ── Step 5: Summary ───────────────────────────────────────────────────────────
function Step5({ basic, cities, dayAssignments, prepaid }) {
  const totalPrepaid = prepaid.reduce((s, i) => s + Number(i.amount), 0)
  const usable = (parseFloat(basic.totalBudget) || 0) - totalPrepaid
  const dailyBudget = usable / (parseInt(basic.totalDays) || 1)

  const citySummary = {}
  Object.values(dayAssignments).forEach(c => { citySummary[c] = (citySummary[c] || 0) + 1 })
  const assignedDays = Object.keys(dayAssignments).length
  const unassigned = parseInt(basic.totalDays) - assignedDays

  return (
    <div style={s.stepWrap}>
      <div style={s.stepTitle}>Resumen</div>
      <div style={s.stepSub}>Todo listo para crear tu viaje</div>

      <div style={s.summaryCard}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff', marginBottom: 8 }}>{basic.name}</div>
        {basic.description && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>{basic.description}</div>}
        <SRow label="Presupuesto total" value={fmt(parseFloat(basic.totalBudget) || 0)} />
        <SRow label="Total prepagado" value={fmt(totalPrepaid)} />
        <SRow label="Disponible para gastar" value={fmt(Math.max(usable, 0))} color="#4AE6A4" />
        <SRow label="Presupuesto diario" value={`${fmt(dailyBudget)}/día`} color="#60AAFF" />
        <SRow label="Duración" value={`${basic.totalDays} días`} />
        {basic.startDate && <SRow label="Inicio" value={new Date(basic.startDate).toLocaleString('es-CL', { timeZone: basic.timezone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} />}
      </div>

      {cities.length > 0 && (
        <div style={s.summarySection}>
          <div style={s.summarySectionTitle}>Destinos</div>
          {cities.map((city, i) => (
            <div key={i} style={s.summaryItem}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: CITY_COLORS[i % CITY_COLORS.length], flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{city.name}</span>
              <span style={{ fontSize: 12, color: citySummary[city.name] ? CITY_COLORS[i % CITY_COLORS.length] : 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' }}>
                {citySummary[city.name] ? `${citySummary[city.name]} días` : 'sin asignar'}
              </span>
            </div>
          ))}
          {unassigned > 0 && <div style={{ fontSize: 11, color: '#FFB547', marginTop: 4 }}>⚠ {unassigned} días sin asignar en el calendario</div>}
        </div>
      )}

      {prepaid.length > 0 && (
        <div style={s.summarySection}>
          <div style={s.summarySectionTitle}>Prepagado</div>
          {prepaid.map(item => (
            <div key={item.id} style={s.summaryItem}>
              <span>{PREPAID_CATEGORIES.find(c => c.value === item.category)?.label.split(' ')[0]}</span>
              <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{item.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#FFB547' }}>{fmt(item.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: color || '#fff' }}>{value}</span>
    </div>
  )
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export default function CreateTripWizard({ onClose, onCreated, userId }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [basic, setBasic] = useState({
    name: '', description: '', totalBudget: '', totalDays: '',
    timezone: 'America/New_York', startDate: '',
  })
  const [cities, setCities] = useState([])
  const [dayAssignments, setDayAssignments] = useState({})
  const [prepaid, setPrepaid] = useState([])

  function updateBasic(key, value) {
    setBasic(prev => ({ ...prev, [key]: value }))
  }

  function canNext() {
    if (step === 0) return basic.name.trim().length > 0 && parseFloat(basic.totalBudget) > 0 && parseInt(basic.totalDays) > 0
    if (step === 1) return cities.length > 0
    return true
  }

  async function handleCreate() {
    setLoading(true)
    const totalPrepaid = prepaid.reduce((s, i) => s + Number(i.amount), 0)
    const totalUsable = Math.max((parseFloat(basic.totalBudget) || 0) - totalPrepaid, 0)

    const cityBudgets = {}
    cities.forEach(c => { cityBudgets[c.name] = 0 })

    const citiesWithDays = cities.map(c => ({
      name: c.name,
      days: Object.values(dayAssignments).filter(v => v === c.name).length,
      budget: 0,
    }))

    const { supabase } = await import('../lib/supabase')
    const { data } = await supabase.from('trips').insert({
      user_id: userId,
      name: basic.name.trim(),
      description: basic.description.trim(),
      total_budget: parseFloat(basic.totalBudget) || 0,
      total_usable: totalUsable,
      total_days: parseInt(basic.totalDays) || 16,
      timezone: basic.timezone,
      start_date: basic.startDate || null,
      city_budgets: cityBudgets,
      cities: citiesWithDays,
      day_assignments: dayAssignments,
      prepaid_items: prepaid,
      prepaid_flights: prepaid.filter(i => i.category === 'vuelos').reduce((s, i) => s + Number(i.amount), 0),
      prepaid_parks: prepaid.filter(i => i.category === 'parques').reduce((s, i) => s + Number(i.amount), 0),
      prepaid_hotel: prepaid.filter(i => i.category === 'hotel').reduce((s, i) => s + Number(i.amount), 0),
    }).select().single()

    setLoading(false)
    if (data) onCreated(data)
  }

  return (
    <div style={w.overlay}>
      <div style={w.modal}>
        <div style={w.header}>
          <button onClick={onClose} style={w.closeBtn}>×</button>
        </div>

        <StepIndicator current={step} />

        <div style={w.content}>
          {step === 0 && <Step1 data={basic} onChange={updateBasic} />}
          {step === 1 && <Step2 data={cities} onChange={setCities} />}
          {step === 2 && <Step3 cities={cities} startDate={basic.startDate} totalDays={basic.totalDays} dayAssignments={dayAssignments} onChange={setDayAssignments} />}
          {step === 3 && <Step4 data={prepaid} onChange={setPrepaid} totalBudget={basic.totalBudget} />}
          {step === 4 && <Step5 basic={basic} cities={cities} dayAssignments={dayAssignments} prepaid={prepaid} />}
        </div>

        <div style={w.nav}>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} style={w.backBtn}>← Atrás</button>}
          <div style={{ flex: 1 }} />
          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              style={{ ...w.nextBtn, opacity: canNext() ? 1 : 0.4, cursor: canNext() ? 'pointer' : 'not-allowed' }}
              disabled={!canNext()}
            >
              {step === 3 ? 'Ver resumen →' : 'Siguiente →'}
            </button>
          ) : (
            <button onClick={handleCreate} disabled={loading} className="btn-primary" style={{ minWidth: 160 }}>
              {loading ? <span className="spinner" /> : '🚀 Crear viaje'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  stepWrap: { display: 'flex', flexDirection: 'column', gap: 16 },
  stepTitle: { fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff', marginBottom: 2 },
  stepSub: { fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 8 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' },
  row: { display: 'flex', gap: 10 },
  inputPrefix: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' },
  inputPrefixAbs: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', zIndex: 1 },
  inputSuffix: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' },
  startBtn: { width: '100%', background: 'rgba(74,230,164,0.1)', border: '1px solid rgba(74,230,164,0.2)', borderRadius: 12, padding: '12px', color: '#4AE6A4', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  startedBadge: { fontSize: 12, color: '#4AE6A4', background: 'rgba(74,230,164,0.08)', border: '1px solid rgba(74,230,164,0.15)', borderRadius: 8, padding: '8px 12px', marginTop: 4 },
  cityChip: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px' },
  addBtn: { background: 'rgba(74,230,164,0.1)', border: '1px solid rgba(74,230,164,0.2)', borderRadius: 8, color: '#4AE6A4', fontSize: 20, width: 40, height: 40, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  removeBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  prepaidSummary: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  prepaidItem: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px' },
  addItemWrap: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  summaryCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 4 },
  summarySection: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 },
  summarySectionTitle: { fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 },
  summaryItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
}

const w = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  modal: { background: '#0D1017', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 600, height: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 0', flexShrink: 0 },
  closeBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 24, cursor: 'pointer', lineHeight: 1 },
  content: { flex: 1, overflowY: 'auto', padding: '0 24px 24px' },
  nav: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 },
  backBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' },
  nextBtn: { background: '#4AE6A4', color: '#080A0F', border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 600 },
}
