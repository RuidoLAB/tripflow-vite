import { useState } from 'react'
import { CATEGORIES, CITIES } from '../lib/budget'
import { format } from 'date-fns'
 
export default function AddExpenseForm({ onAdd }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('comida')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('General')
  const [prepaid, setPrepaid] = useState(false)
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!amount || isNaN(parseFloat(amount))) return
    setLoading(true)
    await onAdd({ amount: parseFloat(amount), category, description, city, prepaid, date })
    setAmount('')
    setDescription('')
    setPrepaid(false)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={styles.card}>
      <input type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} style={styles.amountInput} required />
      <input type="text" placeholder="Descripción (opcional)" value={description} onChange={e => setDescription(e.target.value)} maxLength={100} />

      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <div style={styles.label}>Categoría</div>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.label}>Ciudad</div>
          <select value={city} onChange={e => setCity(e.target.value)}>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <div style={styles.label}>Fecha</div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div style={styles.toggleRow} onClick={() => setPrepaid(!prepaid)}>
        <div>
          <div style={styles.toggleTitle}>Pagado antes del viaje</div>
          <div style={styles.toggleSub}>No afecta el presupuesto diario</div>
        </div>
        <div style={{ ...styles.track, background: prepaid ? '#4AE6A4' : 'rgba(255,255,255,0.1)' }}>
          <div style={{ ...styles.thumb, left: prepaid ? 22 : 3 }} />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading || !amount}>
        {loading ? <span className="spinner" /> : <><span>+</span> Agregar gasto</>}
      </button>
    </form>
  )
}

const styles = {
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 },
  amountInput: { fontSize: 24, fontFamily: 'var(--font-mono)', fontWeight: 600 },
  row: { display: 'flex', gap: 12 },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' },
  toggleRow: { background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  toggleTitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  toggleSub: { fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 },
  track: { width: 40, height: 22, borderRadius: 100, position: 'relative', transition: 'background 0.2s', flexShrink: 0 },
  thumb: { width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'left 0.2s' },
}
