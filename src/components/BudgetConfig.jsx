import { useState } from 'react'
import { fmt } from '../lib/budget'

export default function BudgetConfig({ config, onSave }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(config)

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: parseFloat(value) || 0 }))
  }

  function handlePrepaid(key, value) {
    setForm(prev => ({ ...prev, prepaid: { ...prev.prepaid, [key]: parseFloat(value) || 0 } }))
  }

  function handleSave() {
    onSave(form)
    setOpen(false)
  }

  const totalPrepaid = form.prepaid.flights + form.prepaid.parks + form.prepaid.hotel
  const usable = form.totalBudget - totalPrepaid

  if (!open) return (
    <button onClick={() => setOpen(true)} style={styles.trigger}>
      <span style={styles.triggerIcon}>⚙</span>
      <div style={{ flex: 1 }}>
        <div style={styles.triggerTitle}>Configurar presupuesto</div>
        <div style={styles.triggerSub}>Total: {fmt(form.totalBudget)} · Disponible para gastar: {fmt(Math.max(usable, 0))}</div>
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

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Presupuesto total del viaje</div>
        <div style={styles.inputRow}>
          <span style={styles.prefix}>USD</span>
          <input type="number" value={form.totalBudget} onChange={e => handleChange('totalBudget', e.target.value)} style={styles.input} min="0" />
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionLabel}>Pagado antes del viaje (no afecta ppto. diario)</div>
        <div style={styles.prepaidGrid}>
          <PrepaidInput label="✈ Vuelos" value={form.prepaid.flights} onChange={v => handlePrepaid('flights', v)} />
          <PrepaidInput label="🏰 Parques" value={form.prepaid.parks} onChange={v => handlePrepaid('parks', v)} />
          <PrepaidInput label="🏨 Hotel" value={form.prepaid.hotel} onChange={v => handlePrepaid('hotel', v)} />
        </div>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryRow}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Total prepagado</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(totalPrepaid)}</span>
        </div>
        <div style={styles.summaryRow}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Disponible para gastar</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#4AE6A4', fontWeight: 600 }}>{fmt(Math.max(usable, 0))}</span>
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave}>Guardar configuración</button>
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

const styles = {
  trigger: { width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' },
  triggerIcon: { width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 },
  triggerTitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 },
  triggerSub: { fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 },
  chevron: { fontSize: 20, color: 'rgba(255,255,255,0.2)' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: 600, color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 22, lineHeight: 1, cursor: 'pointer', padding: 0 },
  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  sectionLabel: { fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  inputRow: { display: 'flex', alignItems: 'center', gap: 10 },
  prefix: { fontSize: 13, color: 'rgba(255,255,255,0.3)', flexShrink: 0 },
  input: { fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 600 },
  prepaidGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  summary: { background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 },
}
