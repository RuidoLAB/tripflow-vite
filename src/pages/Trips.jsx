import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import CreateTripWizard from '../components/CreateTripWizard'

export default function Trips() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { loadTrips() }, [])

  async function loadTrips() {
    const { data } = await supabase.from('trips').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setTrips(data || [])
    setLoading(false)
  }

  function handleCreated(trip) {
    navigate(`/trip/${trip.id}`)
  }

  async function handleDelete(id, e) {
    e.stopPropagation()
    if (!confirm('¿Eliminar este viaje y todos sus gastos?')) return
    await supabase.from('trips').delete().eq('id', id)
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  function getTripStatus(trip) {
    if (!trip.start_date) return { label: 'Sin iniciar', color: '#94A3B8' }
    const start = new Date(trip.start_date)
    const end = new Date(start.getTime() + (trip.total_days || 16) * 24 * 60 * 60 * 1000)
    const now = new Date()
    if (now < start) return { label: 'Próximo', color: '#60AAFF' }
    if (now > end) return { label: 'Finalizado', color: '#94A3B8' }
    const dayNum = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1
    return { label: `En curso · Día ${dayNum}`, color: '#4AE6A4' }
  }

  function getCityNames(trip) {
    if (trip.cities && trip.cities.length > 0) {
      return trip.cities.map(c => c.name).join(' · ')
    }
    return null
  }

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {showWizard && (
        <CreateTripWizard
          onClose={() => setShowWizard(false)}
          onCreated={handleCreated}
          userId={user?.id}
        />
      )}

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>✈</div>
            <span style={styles.logoTitle}>TripFlow</span>
          </div>
          <p style={styles.logoSub}>Tu tracker de viajes</p>
          <button onClick={async () => { await supabase.auth.signOut() }} style={styles.signOutBtn}>Cerrar sesión</button>
        </div>

        <button onClick={() => setShowWizard(true)} style={styles.newBtn} className="fade-up">
          <span style={styles.newBtnPlus}>+</span>
          <span>Nuevo viaje</span>
        </button>

        {loading ? (
          <div style={styles.loadingWrap}>
            <div className="spinner" style={{ width: 24, height: 24, borderColor: 'rgba(74,230,164,0.2)', borderTopColor: '#4AE6A4' }} />
          </div>
        ) : trips.length === 0 ? (
          <div style={styles.empty} className="fade-up">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>No hay viajes todavía</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Crea tu primer viaje arriba</div>
          </div>
        ) : (
          <div style={styles.list}>
            {trips.map(trip => {
              const status = getTripStatus(trip)
              const cityNames = getCityNames(trip)
              return (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  style={styles.tripCard}
                  className="fade-up"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <div style={styles.tripLeft}>
                    <div style={styles.tripIcon}>
                      {status.label === 'Finalizado' ? '🏁' : status.label.includes('En curso') ? '🌎' : status.label === 'Próximo' ? '🗓️' : '✈️'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={styles.tripName}>{trip.name}</div>
                      {cityNames && <div style={styles.tripCities}>{cityNames}</div>}
                      {trip.description && !cityNames && <div style={styles.tripDesc}>{trip.description}</div>}
                      <div style={styles.tripMeta}>
                        <span style={{ ...styles.statusDot, background: status.color }} />
                        <span style={{ color: status.color, fontSize: 12 }}>{status.label}</span>
                        {trip.total_days && <><span style={styles.metaSep}>·</span><span style={styles.metaText}>{trip.total_days} días</span></>}
                        {trip.total_usable > 0 && <><span style={styles.metaSep}>·</span><span style={styles.metaText}>${Number(trip.total_usable).toLocaleString()} usable</span></>}
                      </div>
                    </div>
                  </div>
                  <div style={styles.tripRight}>
                    <span style={styles.arrow}>›</span>
                    <button onClick={e => handleDelete(trip.id, e)} style={styles.deleteBtn}>×</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#080A0F', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 60, paddingBottom: 60 },
  orb1: { position: 'fixed', top: '15%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(74,230,164,0.04)', filter: 'blur(60px)', pointerEvents: 'none' },
  orb2: { position: 'fixed', bottom: '20%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(96,170,255,0.04)', filter: 'blur(60px)', pointerEvents: 'none' },
  container: { width: '100%', maxWidth: 480, padding: '0 16px', position: 'relative', zIndex: 1 },
  header: { textAlign: 'center', marginBottom: 40 },
  logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 },
  logoIcon: { width: 40, height: 40, borderRadius: 12, background: 'rgba(74,230,164,0.1)', border: '1px solid rgba(74,230,164,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  logoTitle: { fontFamily: 'var(--font-display)', fontSize: 32, color: '#fff' },
  logoSub: { fontSize: 13, color: 'rgba(255,255,255,0.25)' },
  newBtn: { width: '100%', background: 'rgba(74,230,164,0.08)', border: '1px dashed rgba(74,230,164,0.25)', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#4AE6A4', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 16 },
  newBtnPlus: { fontSize: 22, lineHeight: 1, fontWeight: 300 },
  loadingWrap: { display: 'flex', justifyContent: 'center', padding: 40 },
  empty: { textAlign: 'center', padding: '60px 20px' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  tripCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.15s' },
  tripLeft: { display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 },
  tripIcon: { width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
  tripName: { fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 2 },
  tripCities: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  tripDesc: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 4 },
  tripMeta: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  statusDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  metaSep: { color: 'rgba(255,255,255,0.15)', fontSize: 12 },
  metaText: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  tripRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  arrow: { fontSize: 22, color: 'rgba(255,255,255,0.2)' },
  deleteBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.15)', fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1 },
  signOutBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 13, cursor: 'pointer', marginTop: 8 },
}
