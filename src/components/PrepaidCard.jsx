import { TRIP, fmt } from '../lib/budget'

export default function PrepaidCard() {
  const total = TRIP.prepaid.flights + TRIP.prepaid.parks + TRIP.prepaid.hotel
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>✓ Pagado antes del viaje</div>
        <span style={styles.total}>{fmt(total)} total</span>
      </div>
      <div style={styles.grid}>
        <Item icon="✈" label="Vuelos" amount={TRIP.prepaid.flights} bg="rgba(167,139,250,0.1)" color="#A78BFA" />
        <Item icon="🏰" label="Parques" amount={TRIP.prepaid.parks} bg="rgba(244,114,182,0.1)" color="#F472B6" />
        <Item icon="🏨" label="Hotel" amount={TRIP.prepaid.hotel} bg="rgba(251,146,60,0.1)" color="#FB923C" />
      </div>
      <p style={styles.note}>Estos gastos no afectan el presupuesto diario ni el saldo disponible.</p>
    </div>
  )
}

function Item({ icon, label, amount, bg, color }) {
  return (
    <div style={styles.item}>
      <div style={{ ...styles.itemIcon, background: bg }}>{icon}</div>
      <div style={styles.itemLabel}>{label}</div>
      <div style={{ ...styles.itemVal, color }}>{fmt(amount)}</div>
    </div>
  )
}

const styles = {
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '18px 20px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  title: { fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' },
  total: { fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  item: { background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12 },
  itemIcon: { width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginBottom: 8 },
  itemLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 },
  itemVal: { fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)' },
  note: { fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 12 },
}
