import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Hero from '../components/Hero'
import PrepaidCard from '../components/PrepaidCard'
import StatsBar from '../components/StatsBar'
import AddExpenseForm from '../components/AddExpenseForm'
import CategoryChart from '../components/CategoryChart'
import CityBreakdown from '../components/CityBreakdown'
import ExpenseList from '../components/ExpenseList'

export default function Dashboard() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const loadExpenses = useCallback(async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setExpenses(data || [])
    setLoading(false)
  }, [user.id])

  useEffect(() => { loadExpenses() }, [loadExpenses])

  async function handleAdd(expense) {
    const { data } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: user.id })
      .select()
      .single()
    if (data) setExpenses(prev => [data, ...prev])
  }

  async function handleDelete(id) {
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080A0F', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: 28, height: 28, borderWidth: 2, borderColor: 'rgba(74,230,164,0.2)', borderTopColor: '#4AE6A4' }} />
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Cargando tu viaje...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080A0F', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'rgba(74,230,164,0.04)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <div style={styles.navIcon}>✈</div>
          <span style={styles.navTitle}>TripFlow</span>
        </div>
        <div style={styles.navRight}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{user.email}</span>
          <button onClick={handleSignOut} style={styles.signOutBtn}>Salir</button>
        </div>
      </nav>

      <main style={styles.main}>
        <div className="fade-up"><Hero expenses={expenses} /></div>
        <div className="fade-up-2"><PrepaidCard /></div>
        <div className="fade-up-3"><StatsBar expenses={expenses} /></div>

        <div style={styles.sectionLabel}>Agregar gasto</div>
        <div className="fade-up-4"><AddExpenseForm onAdd={handleAdd} /></div>

        <div style={styles.chartsGrid}>
          <CategoryChart expenses={expenses} />
          <CityBreakdown expenses={expenses} />
        </div>

        <div style={styles.sectionLabel}>Gastos recientes</div>
        <ExpenseList expenses={expenses} onDelete={handleDelete} />
      </main>
    </div>
  )
}

const styles = {
  nav: { position: 'sticky', top: 0, zIndex: 50, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: 'rgba(8,10,15,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' },
  navLogo: { display: 'flex', alignItems: 'center', gap: 10 },
  navIcon: { width: 28, height: 28, borderRadius: 8, background: 'rgba(74,230,164,0.1)', border: '1px solid rgba(74,230,164,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 },
  navTitle: { fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff' },
  navRight: { display: 'flex', alignItems: 'center', gap: 14 },
  signOutBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer' },
  main: { maxWidth: 640, margin: '0 auto', padding: '20px 16px 60px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 12, marginBottom: -4 },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 8 },
}
