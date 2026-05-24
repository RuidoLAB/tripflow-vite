import { useState } from 'react'
import { TIMEZONES, fmt } from '../lib/budget'

const STEPS = ['Básico', 'Destinos', 'Prepagados', 'Resumen']

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
          <div style={{
            ...si.dot,
            background: i < current ? '#4AE6A4' : i === current ? '#fff' : 'rgba(255,255,255,0.1)',
            border: i === current ? '2px solid #4AE6A4' : 'none',
          }}>
            {i < current ? '✓' : i + 1}
          </div>
          <span style={{ ...si.label, color: i === current ? '#fff' : 'rgba(255,255,255,0.3)' }}>{label}</span>
          {i < STEPS.length - 1 && <div style={{ ...si.line, background: i < current ? '#4AE6A4' : 'rgba(255,255,255,0.1)' }} />}
        </div>
      ))}
    </div>
  )
}

const si = {
  wrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 },
  item: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#080A0F', flexShrink: 0 },
  label: { fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' },
  line: { width: 24, height: 1, marginLeft: 6 },
}

// ── Step 1: Basic info ────────────────────────────────────────────────────────
function Step1({ data, onChange }) {
  return (
    <div style={s.stepWrap}>
      <div style={s.stepTitle}>Lo básico</div>
      <div style={s.stepSub}>Ponle nombre a tu viaje y define el presupuesto</div>

      <div style={s.field}>
        <div style={s.label}>Nombre del viaje</div>
        <input type="text" placeholder="ej: EE.UU. 2025" value={data.name} onChange={e => onChange('name', e.target.value)} maxLength={60} autoFocus />
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
            <input type="number" placeholder="16" value={data.totalDays} onChange={e => onChange('totalDays', e.target.value)} min="1" max="365" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }} />
            <span style={s.inputSuffix}>días</span>
          </div>
        </div>
        <div style={{ ...s.field, flex: 1 }}>
          <div style={s.label}>Zona horaria inicial</div>
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
          <div style={{ ...s.label, marginBottom: 6 }}>O elige fecha y hora manualmente</div>
          <input
            type="datetime-local"
            value={data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : ''}
            onChange={e => onChange('startDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
            style={{ fontSize: 13, width: '100%' }}
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
function Step2({ data, onChange, totalDays }) {
  const [newCity, setNewCity] = useState({ name: '', days: '', budget: '' })

  function addCity() {
    if (!newCity.name.trim() || !newCity.days) return
    const updated = [...data, { name: newCity.name.trim(), days: parseInt(newCity.days), budget: parseFloat(newCity.budget) || 0 }]
    onChange(updated)
    setNewCity({ name: '', days: '', budget: '' })
  }

  function removeCity(i) {
    onChange(data.filter((_, idx) => idx !== i))
  }

  function updateCity(i, key, value) {
    const updated = data.map((c, idx) => idx === i ? { ...c, [key]: key === 'name' ? value : parseFloat(value) || 0 } : c)
    onChange(updated)
  }

  const totalAssigned = data.reduce((s, c) => s + (parseInt(c.days) || 0), 0)
  const remaining = parseInt(totalDays) - totalAssigned
  const isOver = remaining < 0

  return (
    <div style={s.stepWrap}>
      <div style={s.stepTitle}>Destinos</div>
      <div style={s.stepSub}>¿A qué ciudades vas y cuántos días en cada una?</div>

      {/* Days counter */}
      <div style={{ ...s.daysCounter, borderColor: isOver ? 'rgba(255,87,87,0.3)' : remaining === 0 ? 'rgba(74,230,164,0.3)' : 'rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Días asignados</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: isOver ? '#FF5757' : remaining === 0 ? '#4AE6A4' : '#fff' }}>
          {totalAssigned} / {totalDays || '?'}
          {remaining > 0 && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}> ({remaining} sin asignar)</span>}
          {isOver && <span style={{ fontSize: 12, color: '#FF5757', fontWeight: 400 }}> ({Math.abs(remaining)} de más)</span>}
          {remaining === 0 && totalAssigned > 0 && <span style={{ fontSize: 12, color: '#4AE6A4', fontWeight: 400 }}> ✓ perfecto</span>}
        </span>
      </div>

      {/* Existing cities */}
      {data.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {data.map((city, i) => (
            <div key={i} style={s.cityRow}>
              <div style={s.cityEmoji}>📍</div>
              <input
                type="text"
                value={city.name}
                onChange={e => updateCity(i, 'name', e.target.value)}
                placeholder="Ciudad"
                style={{ flex: 2, fontSize: 14 }}
              />
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="number"
                  value={city.days || ''}
                  onChange={e => updateCity(i, 'days', e.target.value)}
                  placeholder="días"
                  min="1"
                  style={{ fontSize: 14, paddingRight: 36 }}
                />
                <span style={s.inputSuffixAbs}>días</span>
              </div>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={s.inputPrefixAbs}>$</span>
                <input
                  type="number"
                  value={city.budget || ''}
                  onChange={e => updateCity(i, 'budget', e.target.value)}
                  placeholder="ppto"
                  min="0"
                  style={{ fontSize: 14, paddingLeft: 20 }}
                />
              </div>
              <button onClick={() => removeCity(i)} style={s.removeBtn}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Add new city */}
      <div style={s.addCityWrap}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Agregar destino</div>
        <div style={s.cityRow}>
          <div style={s.cityEmoji}>📍</div>
          <input
            type="text"
            value={newCity.name}
            onChange={e => setNewCity(p => ({ ...p, name: e.target.value }))}
            placeholder="Nombre ciudad"
            style={{ flex: 2, fontSize: 14 }}
            onKeyDown={e => e.key === 'Enter' && addCity()}
          />
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="number"
              value={newCity.days}
              onChange={e => setNewCity(p => ({ ...p, days: e.target.value }))}
              placeholder="días"
              min="1"
              style={{ fontSize: 14, paddingRight: 36 }}
            />
            <span style={s.inputSuffixAbs}>días</span>
          </div>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={s.inputPrefixAbs}>$</span>
            <input
              type="number"
              value={newCity.budget}
              onChange={e => setNewCity(p => ({ ...p, budget: e.target.value }))}
              placeholder="ppto"
              min="0"
              style={{ fontSize: 14, paddingLeft: 20 }}
            />
          </div>
          <button onClick={addCity} style={s.addBtn}>+</button>
        </div>
      </div>

      {data.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
          Agrega al menos un destino
        </div>
      )}
    </div>
  )
}

// ── Step 3: Prepaid items ─────────────────────────────────────────────────────
function Step3({ data, onChange, totalBudget }) {
  const [newItem, setNewItem] = useState({ name: '', category: 'vuelos', amount: '' })

  function addItem() {
    if (!newItem.name.trim() || !newItem.amount) return
    onChange([...data, { ...newItem, amount: parseFloat(newItem.amount), id: Date.now() }])
    setNewItem({ name: '', category: 'vuelos', amount: '' })
  }

  function removeItem(id) {
    onChange(data.filter(i => i.id !== id))
  }

  const totalPrepaid = data.reduce((s, i) => s + Number(i.amount), 0)
  const usable = (parseFloat(totalBudget) || 0) - totalPrepaid

  return (
    <div style={s.stepWrap}>
      <div style={s.stepTitle}>Pagado antes del viaje</div>
      <div style={s.stepSub}>Agrega todo lo que ya pagaste — se descuenta del presupuesto total</div>

      {/* Summary */}
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

      {/* Existing items */}
      {data.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
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

      {/* Add new item */}
      <div style={s.addCityWrap}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Agregar item</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input type="text" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} placeholder="ej: Vuelo Santiago-Miami" style={{ fontSize: 14 }} />
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
      </div>

      {data.length === 0 && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
          Sin items prepagados aún — puedes saltarte este paso
        </div>
      )}
    </div>
  )
}

// ── Step 4: Summary ───────────────────────────────────────────────────────────
function Step4({ basic, cities, prepaid }) {
  const totalPrepaid = prepaid.reduce((s, i) => s + Number(i.amount), 0)
  const usable = (parseFloat(basic.totalBudget) || 0) - totalPrepaid
  const dailyBudget = usable / (parseInt(basic.totalDays) || 1)
  const totalCityDays = cities.reduce((s, c) => s + (parseInt(c.days) || 0), 0)

  return (
    <div style={s.stepWrap}>
      <div style={s.stepTitle}>Resumen</div>
      <div style={s.stepSub}>Todo listo para crear tu viaje</div>

      <div style={s.summaryCard}>
        <div style={s.summaryBig}>{basic.name || 'Mi viaje'}</div>
        {basic.description && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>{basic.description}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SRow label="Presupuesto total" value={fmt(parseFloat(basic.totalBudget) || 0)} />
          <SRow label="Total prepagado" value={fmt(totalPrepaid)} />
          <SRow label="Disponible para gastar" value={fmt(Math.max(usable, 0))} color="#4AE6A4" />
          <SRow label="Presupuesto diario" value={`${fmt(dailyBudget)}/día`} color="#60AAFF" />
          <SRow label="Duración" value={`${basic.totalDays} días`} />
          {basic.startDate && <SRow label="Inicio" value={new Date(basic.startDate).toLocaleString('es-CL', { timeZone: basic.timezone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} />}
        </div>
      </div>

      {cities.length > 0 && (
        <div style={s.summarySection}>
          <div style={s.summarySectionTitle}>Destinos</div>
          {cities.map((city, i) => (
            <div key={i} style={s.summaryItem}>
              <span style={{ fontSize: 14 }}>📍</span>
              <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{city.name}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{city.days} días</span>
              {city.budget > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#60AAFF' }}>{fmt(city.budget)}</span>}
            </div>
          ))}
          {parseInt(basic.totalDays) !== totalCityDays && (
            <div style={{ fontSize: 11, color: '#FFB547', marginTop: 6 }}>
              ⚠ {totalCityDays} días asignados de {basic.totalDays} totales
            </div>
          )}
        </div>
      )}

      {prepaid.length > 0 && (
        <div style={s.summarySection}>
          <div style={s.summarySectionTitle}>Prepagado</div>
          {prepaid.map(item => (
            <div key={item.id} style={s.summaryItem}>
              <span style={{ fontSize: 14 }}>{PREPAID_CATEGORIES.find(c => c.value === item.category)?.label.split(' ')[0]}</span>
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: color || '#fff' }}>{value}</span>
    </div>
  )
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export default function CreateTripWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [basic, setBasic] = useState({
    name: '', description: '', totalBudget: '', totalDays: '',
    timezone: 'America/New_York', startDate: '',
  })
  const [cities, setCities] = useState([])
  const [prepaid, setPrepaid] = useState([])

  function updateBasic(key, value) {
    setBasic(prev => ({ ...prev, [key]: value }))
  }

  function canNext() {
    if (step === 0) return basic.name.trim().length > 0 && basic.totalBudget > 0 && basic.totalDays > 0
    if (step === 1) return cities.length > 0
    return true
  }

  async function handleCreate() {
    setLoading(true)
    const totalPrepaid = prepaid.reduce((s, i) => s + Number(i.amount), 0)
    const totalUsable = Math.max((parseFloat(basic.totalBudget) || 0) - totalPrepaid, 0)

    const cityBudgets = {}
    cities.forEach(c => { cityBudgets[c.name] = c.budget || 0 })

    const { supabase } = await import('../lib/supabase')
    const { data } = await supabase.from('trips').insert({
      name: basic.name.trim(),
      description: basic.description.trim(),
      total_budget: parseFloat(basic.totalBudget) || 0,
      total_usable: totalUsable,
      total_days: parseInt(basic.totalDays) || 16,
      timezone: basic.timezone,
      start_date: basic.startDate || null,
      city_budgets: cityBudgets,
      cities: cities,
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
        {/* Header */}
        <div style={w.header}>
          <button onClick={onClose} style={w.closeBtn}>×</button>
        </div>

        <StepIndicator current={step} />

        {/* Step content */}
        <div style={w.content}>
          {step === 0 && <Step1 data={basic} onChange={updateBasic} />}
          {step === 1 && <Step2 data={cities} onChange={setCities} totalDays={basic.totalDays} />}
          {step === 2 && <Step3 data={prepaid} onChange={setPrepaid} totalBudget={basic.totalBudget} />}
          {step === 3 && <Step4 basic={basic} cities={cities} prepaid={prepaid} />}
        </div>

        {/* Navigation */}
        <div style={w.nav}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={w.backBtn}>← Atrás</button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              style={{ ...w.nextBtn, opacity: canNext() ? 1 : 0.4, cursor: canNext() ? 'pointer' : 'not-allowed' }}
              disabled={!canNext()}
            >
              {step === 2 ? 'Ver resumen →' : 'Siguiente →'}
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

// Shared styles
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
  inputSuffixAbs: { position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' },
  startBtn: { width: '100%', background: 'rgba(74,230,164,0.1)', border: '1px solid rgba(74,230,164,0.2)', borderRadius: 12, padding: '12px', color: '#4AE6A4', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  startedBadge: { fontSize: 12, color: '#4AE6A4', background: 'rgba(74,230,164,0.08)', border: '1px solid rgba(74,230,164,0.15)', borderRadius: 8, padding: '8px 12px', marginTop: 4 },
  daysCounter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid', borderRadius: 12, padding: '12px 16px' },
  cityRow: { display: 'flex', alignItems: 'center', gap: 8, position: 'relative' },
  cityEmoji: { fontSize: 16, flexShrink: 0 },
  addCityWrap: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 14 },
  removeBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1, flexShrink: 0 },
  addBtn: { background: 'rgba(74,230,164,0.1)', border: '1px solid rgba(74,230,164,0.2)', borderRadius: 8, color: '#4AE6A4', fontSize: 18, width: 36, height: 36, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  prepaidSummary: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  prepaidItem: { display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px' },
  summaryCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 },
  summaryBig: { fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff', marginBottom: 8 },
  summarySection: { display: 'flex', flexDirection: 'column', gap: 8 },
  summarySectionTitle: { fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 },
  summaryItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
}

const w = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { background: '#0D1017', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 0' },
  closeBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 24, cursor: 'pointer', lineHeight: 1 },
  content: { flex: 1, overflowY: 'auto', padding: '0 24px 24px' },
  nav: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' },
  backBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer' },
  nextBtn: { background: '#4AE6A4', color: '#080A0F', border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 14, fontWeight: 600 },
}
