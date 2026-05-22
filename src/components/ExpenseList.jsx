import { useState } from 'react'
import { getCategoryLabel, getCategoryColor, fmtDec } from '../lib/budget'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ExpenseList({ expenses, onDelete }) {
  const [deleting, setDeleting] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const sorted = [...expenses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const displayed = showAll ? sorted : sorted.slice(0, 8)

  async function handleDelete(id) {
    setDeleting(id)
    await onDelete(id)
    setDeleting(null)
  }

  if (expenses.length === 0) return (
    <div style={styles.empty}>No hay gastos aún. ¡Agrega el primero! 👆</div>
  )

  return (
    <div style={styles.list}>
      {displayed.map((expense, i) => {
        const color = getCategoryColor(expense.category)
        const label = getCategoryLabel(expense.category)
        const isLast = i === displayed.length - 1
        return (
          <div key={expense.id} style={{ ...styles.item, borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ ...styles.icon, background: `${color}18` }}>
              <span style={{ ...styles.dot, background: color }} />
            </div>
            <div style={styles.info}>
              <div style={styles.name}>{expense.description || label}</div>
              <div style={styles.meta}>
                {label} · {expense.city} · {format(parseISO(expense.date), 'd MMM', { locale: es })}
                {expense.prepaid && <span style={styles.prepaidBadge}>prepago</span>}
              </div>
            </div>
            <span style={{ ...styles.amount, color: expense.prepaid ? 'rgba(255,255,255,0.3)' : '#fff' }}>
              {fmtDec(expense.amount)}
            </span>
            <button onClick={() => handleDelete(expense.id)} disabled={deleting === expense.id} style={styles.deleteBtn}>
              {deleting === expense.id ? '...' : '×'}
            </button>
          </div>
        )
      })}
      {sorted.length > 8 && (
        <button onClick={() => setShowAll(!showAll)} style={styles.showMore}>
          {showAll ? 'Ver menos' : `Ver ${sorted.length - 8} más`} {showAll ? '↑' : '↓'}
        </button>
      )}
    </div>
  )
}

const styles = {
  list: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' },
  empty: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 32, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.2)' },
  item: { display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', transition: 'background 0.15s' },
  icon: { width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dot: { width: 8, height: 8, borderRadius: '50%' },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 13, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  meta: { fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 },
  prepaidBadge: { color: '#4AE6A4', fontSize: 10, marginLeft: 4 },
  amount: { fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, flexShrink: 0 },
  deleteBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 18, lineHeight: 1, padding: '0 4px', flexShrink: 0, transition: 'color 0.15s' },
  showMore: { width: '100%', background: 'none', border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: '14px', cursor: 'pointer', transition: 'color 0.15s' },
}
