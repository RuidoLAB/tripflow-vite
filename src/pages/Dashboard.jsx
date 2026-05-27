import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Hero from '../components/Hero'
import PrepaidCard from '../components/PrepaidCard'
import AddExpenseForm from '../components/AddExpenseForm'
import CategoryChart from '../components/CategoryChart'
import CityBreakdown from '../components/CityBreakdown'
import ExpenseList from '../components/ExpenseList'
import BudgetConfig from '../components/BudgetConfig'

function tripToConfig(trip) {
  if (!trip) return null
  return {
    totalBudget: Number(trip.total_budget) || 3500,
    totalUsable: Number(trip.total_usable) || 1450,
    totalDays: trip.total_days || 16,
    timezone: trip.timezone || 'America/New_York',
    startDate: trip.start_date || null,
    cityBudgets: trip.city_budgets || null,
    cities: trip.cities || [],
    prepaid: {
      flights: Number(trip.prepaid_flights) || 0,
      parks: Number(trip.prepaid_parks) || 0,
      hotel: Number(trip.prepaid_hotel) || 0,
    },
  }
}

export default function Dashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [trip, setTrip] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [{ data: tripData }, { data: expData }] = await Promise.all([
      supabase.from('trips').select('*').eq('id', id).single(),
      supabase.from('expenses').select('*').eq('trip_id', id).order('created_at', { ascending: false }),
    ])
    if (!tripData) { navigate('/'); return }
    setTrip(tripData)
    setExpenses(expData || [])
    setLoading(false)
  }, [id, navigate])

  useEffect(() => { load() }, [load])

  async function handleSaveConfig(newConfig) {
    const totalPrepaid = newConfig.prepaid.flights + newConfig.prepaid.parks + newConfig.prepaid.hotel
    const totalUsable = Math.max(newConfig.totalBudget - totalPrepaid, 0)
    const updates = {
      total_budget: newConfig.totalBudget,
      total_usable: totalUsable,
      total_days: newConfig.totalDays,
      timezone: newConfig.timezone,
      start_date: newConfig.startDate,
      prepaid_flights: newConfig.prepaid.flights,
      prepaid_parks: newConfig.prepaid.parks,
      prepaid_hotel: newConfig.prepaid.hotel,
      city_budgets: newConfig.cityBudgets || null,
    }
    const { data } = await supabase.from('trips').update(updates).eq('id', id).select().single()
    if (data) setTrip(data)
  }

  async function handleAdd(expense) {
    const { data } = await supabase
      .from('expenses')
      .insert({ ...expense, trip_id: id, user_id: user?.id })
      .select()
      .single()
    if (data) setExpenses(prev => [data, ...prev])
  }

  async function handleDelete(expId) {
    await supabase.from('expenses').delete().eq('id', expId)
    setExpenses(prev => prev.filter(e => e.id !== expId))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080A0F', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" style={{ width: 28, height: 28, borderWidth: 2, borderColor: 'rgba(74,230,164,0.2)', borderTopColor: '#4AE6A4' }} />
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>Cargando tu viaje...</p>
    </div>
  )

  const config = tripToConfig(trip)

  return (
    <div style={{ minHeight: '100vh', background: '#080A0F', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'rgba(74,230,164,0.04)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <button onClick={() => navigate('/')} style={styles.backBtn}>‹</button>
          <div style={styles.navLogo}>
            <div style={styles.navIcon}>✈</div>
            <span style={styles.navTitle}>{trip.name}</span>
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        <div className="fade-up"><Hero expenses={expenses} config={config} /></div>

        <div style={styles.sectionLabel}>Agregar gasto</div>
        <div className="fade-up-2"><AddExpenseForm onAdd={handleAdd} /></div>

        <div className="fade-up-3"><BudgetConfig config={config} onSave={handleSaveConfig} /></div>
        <div className="fade-up-3"><PrepaidCard config={config} /></div>

        <div style={styles.sectionLabel}>Desglose</div>
        <div style={styles.chartsGrid}>
          <CategoryChart expenses={expenses} />
          <CityBreakdown expenses={expenses} config={config} />
        </div>

        <div style={styles.sectionLabel}>Gastos recientes</div>
        <ExpenseList expenses={expenses} onDelete={handleDelete} />
      </main>
    </div>
  )
}

const styles = {
  nav: { position: 'sticky', top: 0, zIndex: 50, height: 52, display: 'flex', alignItems: 'center', padding: '0 16px', background: 'rgba(8,10,15,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  backBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 26, cursor: 'pointer', lineHeight: 1, padding: '0 4px', marginRight: 4 },
  navLogo: { display: 'flex', alignItems: 'center', gap: 8 },
  navIcon: { width: 26, height: 26, borderRadius: 7, background: 'rgba(74,230,164,0.1)', border: '1px solid rgba(74,230,164,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 },
  navTitle: { fontFamily: 'var(--font-display)', fontSize: 17, color: '#fff' },
  main: { maxWidth: 640, margin: '0 auto', padding: '20px 16px 60px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 12 },
  sectionLabel: { fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 12, marginBottom: -4 },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 },
}
