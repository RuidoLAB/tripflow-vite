import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { format, parseISO, isToday, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

const CITY_COLORS = [
  '#4AE6A4', '#60AAFF', '#FFB547', '#F472B6',
  '#818CF8', '#34D399', '#FB923C', '#38BDF8',
]

export default function Itinerary({ trip, user }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [openCities, setOpenCities] = useState({})

  const cityDays = useMemo(() => {
    const assignments = trip.day_assignments || {}
    const cities = trip.cities || []
    const tripStart = trip.start_date ? new Date(trip.start_date) : new Date()

    const allDates = Array.from({ length: trip.total_days || 16 }, (_, i) => {
      return format(addDays(tripStart, i), 'yyyy-MM-dd')
    })

    const map = {}
    allDates.forEach(dateStr => {
      const cityName = assignments[dateStr]
      if (cityName) {
        if (!map[cityName]) map[cityName] = []
        map[cityName].push(dateStr)
      }
    })

    const unassigned = allDates.filter(d => !assignments[d])
    if (unassigned.length > 0) map['Sin asignar'] = unassigned

    return Object.entries(map)
      .map(([name, dates]) => ({
        name,
        dates: dates.sort(),
        color: CITY_COLORS[cities.findIndex(c => c.name === name) % CITY_COLORS.length] || '#94A3B8',
      }))
      .sort((a, b) => a.dates[0].localeCompare(b.dates[0]))
  }, [trip])

  const loadActivities = useCallback(async () => {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('trip_id', trip.id)
      .order('time', { ascending: true })
    setActivities(data || [])
    setLoading(false)

    const today = format(new Date(), 'yyyy-MM-dd')
    const todayCity = cityDays.find(c => c.dates.includes(today))
    if (todayCity) {
      setOpenCities({ [todayCity.name]: true })
    } else if (cityDays.length > 0) {
      setOpenCities({ [cityDays[0].name]: true })
    }
  }, [trip.id, cityDays])

  useEffect(() => { loadActivities() }, [loadActivities])

  function toggleCity(name) {
    setOpenCities(prev => ({ ...prev, [name]: !prev[name] }))
  }

  async function handleToggleDone(activity) {
    const { data } = await supabase
      .from('activities')
      .update({ done: !activity.done })
      .eq('id', activity.id)
      .select()
      .single()
    if (data) setActivities(prev => prev.map(a => a.id === data.id ? data : a))
  }

  async function handleAdd(dateStr, form) {
    const { data } = await supabase
      .from('activities')
      .insert({ trip_id: trip.id, user_id: user.id, date: dateStr, ...form, done: false })
      .select()
      .single()
    if (data) setActivities(prev => [...prev, data])
  }

  async function handleDelete(id) {
    await supabase.from('activities').delete().eq('id', id)
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  async function handleEdit(id, updates) {
    const { data } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (data) setActivities(prev => prev.map(a => a.id === data.id ? data : a))
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div className="spinner" style={{ width: 24, height: 24, borderColor: 'rgba(74,230,164,0.2)', borderTopColor: '#4AE6A4' }} />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {cityDays.length === 0 && (
        <div style={styles.empty}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🗺️</div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>Sin destinos configurados</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Asigna días a cada ciudad en el calendario del viaje</div>
        </div>
      )}

      {cityDays.map(city => {
        const isOpen = openCities[city.name]
        const cityActivities = activities.filter(a => city.dates.includes(a.date))
        const doneCount = cityActivities.filter(a => a.done).length
        const hasToday = city.dates.some(d => isToday(parseISO(d)))

        return (
          <div key={city.name} style={styles.cityCard}>
            <div onClick={() => toggleCity(city.name)} style={styles.cityHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <span style={{ ...styles.cityDot, background: city.color }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={styles.cityName}>{city.name}</span>
                    {hasToday && <span style={styles.todayBadge}>Hoy aquí</span>}
                  </div>
                  <div style={styles.cityMeta}>
                    {city.dates.length} días
                    {city.dates.length > 0 && (
                      <> · {format(parseISO(city.dates[0]), 'd MMM', { locale: es })} – {format(parseISO(city.dates[city.dates.length - 1]), 'd MMM', { locale: es })}</>
                    )}
                    {cityActivities.length > 0 && (
                      <> · {doneCount}/{cityActivities.length} ✓</>
                    )}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.2)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
            </div>

            {isOpen && (
              <div style={styles.daysWrap}>
                {city.dates.map(dateStr => {
                  const dayActivities = activities
                    .filter(a => a.date === dateStr)
                    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))
                  return (
                    <DayBlock
                      key={dateStr}
                      dateStr={dateStr}
                      activities={dayActivities}
                      isToday={isToday(parseISO(dateStr))}
                      cityColor={city.color}
                      onAdd={handleAdd}
                      onToggle={handleToggleDone}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function DayBlock({ dateStr, activities, isToday, cityColor, onAdd, onToggle, onDelete, onEdit }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', time: '', notes: '' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const date = parseISO(dateStr)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    await onAdd(dateStr, form)
    setForm({ title: '', time: '', notes: '' })
    setShowForm(false)
  }

  async function handleEditSave(id) {
    await onEdit(id, editForm)
    setEditingId(null)
  }

  return (
    <div style={{ ...styles.dayBlock, borderLeft: `2px solid ${isToday ? cityColor : 'rgba(255,255,255,0.06)'}` }}>
      <div style={styles.dayHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...styles.dayNum, color: isToday ? cityColor : '#fff' }}>
            {format(date, 'd')}
          </span>
          <div>
            <div style={{ fontSize: 12, color: isToday ? cityColor : 'rgba(255,255,255,0.5)', textTransform: 'capitalize', fontWeight: 500 }}>
              {format(date, 'EEEE', { locale: es })}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textTransform: 'capitalize' }}>
              {format(date, 'MMM', { locale: es })}
            </div>
          </div>
          {isToday && <span style={{ ...styles.todayBadge, fontSize: 10 }}>Hoy</span>}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ fontSize: 12, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', color: showForm ? cityColor : 'rgba(255,255,255,0.3)', padding: '4px 8px' }}
        >
          {showForm ? '✕' : '+ Actividad'}
        </button>
      </div>

      {activities.length === 0 && !showForm && (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', padding: '2px 0 6px', fontStyle: 'italic' }}>Sin actividades</div>
      )}

      {activities.map(activity => (
        editingId === activity.id ? (
          <div key={activity.id} style={styles.editForm}>
            <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} style={{ fontSize: 13 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="time" value={editForm.time} onChange={e => setEditForm(p => ({ ...p, time: e.target.value }))} style={{ fontSize: 13, flex: 1 }} />
              <button onClick={() => handleEditSave(activity.id)} style={styles.saveBtn}>✓ Guardar</button>
              <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>✕</button>
            </div>
            <input value={editForm.notes} onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} placeholder="Notas..." style={{ fontSize: 12 }} />
          </div>
        ) : (
          <ActivityRow
            key={activity.id}
            activity={activity}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={a => { setEditingId(a.id); setEditForm({ title: a.title, time: a.time || '', notes: a.notes || '' }) }}
          />
        )
      ))}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.addForm}>
          <input type="text" placeholder="Nombre de la actividad" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ fontSize: 14 }} autoFocus required />
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} style={{ fontSize: 13, flex: 1 }} />
            <button type="submit" style={styles.submitBtn}>Agregar</button>
          </div>
          <input type="text" placeholder="Notas (opcional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ fontSize: 12 }} />
        </form>
      )}
    </div>
  )
}

function ActivityRow({ activity, onToggle, onDelete, onEdit }) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      style={{ ...styles.activityRow, opacity: activity.done ? 0.45 : 1 }}
      onClick={() => setShowActions(!showActions)}
    >
      <button
        onClick={e => { e.stopPropagation(); onToggle(activity) }}
        style={{
          ...styles.checkbox,
          borderColor: activity.done ? '#4AE6A4' : 'rgba(255,255,255,0.2)',
          background: activity.done ? '#4AE6A4' : 'transparent',
        }}
      >
        {activity.done && <span style={{ fontSize: 10, color: '#080A0F', fontWeight: 700 }}>✓</span>}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: '#fff', textDecoration: activity.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activity.title}
        </div>
        {(activity.time || activity.notes) && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2, display: 'flex', gap: 8, overflow: 'hidden' }}>
            {activity.time && <span style={{ flexShrink: 0 }}>🕐 {activity.time}</span>}
            {activity.notes && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activity.notes}</span>}
          </div>
        )}
      </div>

      {showActions && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onEdit(activity); setShowActions(false) }} style={styles.actionBtn}>✏️</button>
          <button onClick={e => { e.stopPropagation(); onDelete(activity.id); setShowActions(false) }} style={styles.actionBtn}>🗑️</button>
        </div>
      )}
    </div>
  )
}

const styles = {
  empty: { textAlign: 'center', padding: '40px 20px' },
  cityCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' },
  cityHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', cursor: 'pointer' },
  cityDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  cityName: { fontSize: 15, fontWeight: 600, color: '#fff' },
  todayBadge: { fontSize: 11, fontWeight: 600, color: '#4AE6A4', background: 'rgba(74,230,164,0.1)', border: '1px solid rgba(74,230,164,0.2)', borderRadius: 100, padding: '2px 8px' },
  cityMeta: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  daysWrap: { borderTop: '1px solid rgba(255,255,255,0.06)' },
  dayBlock: { padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', marginLeft: 8 },
  dayHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dayNum: { fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1 },
  activityRow: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' },
  checkbox: { width: 20, height: 20, borderRadius: 6, border: '1.5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, cursor: 'pointer', transition: 'all 0.15s' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '2px 4px' },
  addForm: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12 },
  editForm: { display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 10, marginBottom: 4 },
  submitBtn: { background: '#4AE6A4', color: '#080A0F', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  saveBtn: { background: 'rgba(74,230,164,0.1)', color: '#4AE6A4', border: '1px solid rgba(74,230,164,0.3)', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' },
  cancelBtn: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' },
}
