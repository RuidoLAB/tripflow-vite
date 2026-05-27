import { useState, useMemo } from 'react'
import { format, addDays, parseISO, eachDayOfInterval, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

const CITY_COLORS = [
  '#4AE6A4', '#60AAFF', '#FFB547', '#F472B6',
  '#818CF8', '#34D399', '#FB923C', '#38BDF8',
  '#FACC15', '#A78BFA', '#FF5757', '#86EFAC',
]

export default function TripCalendar({ startDate, totalDays, cities, dayAssignments, onChange }) {
  const [selecting, setSelecting] = useState(null) // { start: date }
  const [selectedCity, setSelectedCity] = useState(cities[0]?.name || null)
  const [dragEnd, setDragEnd] = useState(null)

  const tripStart = useMemo(() => startDate ? new Date(startDate) : new Date(), [startDate])
  const tripEnd = useMemo(() => addDays(tripStart, totalDays - 1), [tripStart, totalDays])

  const allDays = useMemo(() =>
    eachDayOfInterval({ start: tripStart, end: tripEnd }),
    [tripStart, tripEnd]
  )

  function getDateStr(date) {
    return format(date, 'yyyy-MM-dd')
  }

  function getCityForDate(dateStr) {
    return dayAssignments[dateStr] || null
  }

  function getCityColor(cityName) {
    if (!cityName) return null
    const idx = cities.findIndex(c => c.name === cityName)
    return CITY_COLORS[idx % CITY_COLORS.length]
  }

  function handleDayMouseDown(date) {
    setSelecting({ start: date })
    setDragEnd(date)
  }

  function handleDayMouseEnter(date) {
    if (selecting) setDragEnd(date)
  }

  function handleDayMouseUp(date) {
    if (!selecting || !selectedCity) {
      setSelecting(null)
      setDragEnd(null)
      return
    }
    const start = selecting.start < date ? selecting.start : date
    const end = selecting.start < date ? date : selecting.start
    const days = eachDayOfInterval({ start, end })
    const updated = { ...dayAssignments }
    days.forEach(d => { updated[getDateStr(d)] = selectedCity })
    onChange(updated)
    setSelecting(null)
    setDragEnd(null)
  }

  function handleDayTap(date) {
    if (!selectedCity) return
    const dateStr = getDateStr(date)
    const updated = { ...dayAssignments }
    if (updated[dateStr] === selectedCity) {
      delete updated[dateStr]
    } else {
      updated[dateStr] = selectedCity
    }
    onChange(updated)
  }

  function isInDragRange(date) {
    if (!selecting || !dragEnd) return false
    const start = selecting.start < dragEnd ? selecting.start : dragEnd
    const end = selecting.start < dragEnd ? dragEnd : selecting.start
    return date >= start && date <= end
  }

  function clearCity(cityName) {
    const updated = {}
    Object.entries(dayAssignments).forEach(([k, v]) => {
      if (v !== cityName) updated[k] = v
    })
    onChange(updated)
  }

  // Group days by week for calendar layout
  const weeks = useMemo(() => {
    const result = []
    let week = []
    allDays.forEach((day, i) => {
      week.push(day)
      if (week.length === 7 || i === allDays.length - 1) {
        result.push(week)
        week = []
      }
    })
    return result
  }, [allDays])

  // Summary
  const citySummary = useMemo(() => {
    const map = {}
    Object.values(dayAssignments).forEach(city => {
      map[city] = (map[city] || 0) + 1
    })
    return map
  }, [dayAssignments])

  const assignedDays = Object.keys(dayAssignments).length
  const unassignedDays = totalDays - assignedDays

  return (
    <div style={styles.wrap}>
      {/* City selector */}
      <div style={styles.citySelector}>
        <div style={styles.selectorLabel}>Toca para seleccionar ciudad y luego marca los días</div>
        <div style={styles.cityPills}>
          {cities.map((city, i) => {
            const color = CITY_COLORS[i % CITY_COLORS.length]
            const isActive = selectedCity === city.name
            return (
              <button
                key={city.name}
                onClick={() => setSelectedCity(city.name)}
                style={{
                  ...styles.cityPill,
                  background: isActive ? `${color}20` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.1)'}`,
                  color: isActive ? color : 'rgba(255,255,255,0.5)',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                {city.name}
                {citySummary[city.name] && (
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{citySummary[city.name]}d</span>
                )}
              </button>
            )
          })}
          <button
            onClick={() => setSelectedCity('__clear__')}
            style={{
              ...styles.cityPill,
              background: selectedCity === '__clear__' ? 'rgba(255,87,87,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${selectedCity === '__clear__' ? 'rgba(255,87,87,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: selectedCity === '__clear__' ? '#FF5757' : 'rgba(255,255,255,0.3)',
            }}
          >
            ✕ Borrar
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div style={styles.calendar}
        onMouseLeave={() => { if (selecting) { setSelecting(null); setDragEnd(null) } }}
      >
        {/* Day headers */}
        <div style={styles.weekRow}>
          {['L','M','M','J','V','S','D'].map((d, i) => (
            <div key={i} style={styles.dayHeader}>{d}</div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} style={styles.weekRow}>
            {/* Pad first week */}
            {wi === 0 && Array.from({ length: (allDays[0].getDay() + 6) % 7 }).map((_, i) => (
              <div key={`pad-${i}`} style={styles.dayCell} />
            ))}
            {week.map(day => {
              const dateStr = getDateStr(day)
              const cityName = selectedCity === '__clear__' ? null : getCityForDate(dateStr)
              const color = getCityColor(getCityForDate(dateStr))
              const inDrag = isInDragRange(day)
              const dragColor = selectedCity && selectedCity !== '__clear__'
                ? getCityColor(selectedCity)
                : '#FF5757'

              return (
                <div
                  key={dateStr}
                  style={{
                    ...styles.dayCell,
                    background: inDrag
                      ? `${dragColor}30`
                      : color ? `${color}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${inDrag ? dragColor : color ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer',
                  }}
                  onMouseDown={() => handleDayMouseDown(day)}
                  onMouseEnter={() => handleDayMouseEnter(day)}
                  onMouseUp={() => handleDayMouseUp(day)}
                  onClick={() => handleDayTap(day)}
                >
                  <span style={{ fontSize: 12, fontWeight: 500, color: color ? color : 'rgba(255,255,255,0.5)' }}>
                    {format(day, 'd')}
                  </span>
                  {color && !inDrag && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: color, margin: '2px auto 0' }} />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Month labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={styles.monthLabel}>{format(tripStart, 'MMM yyyy', { locale: es })}</span>
        {format(tripStart, 'MMM') !== format(tripEnd, 'MMM') && (
          <span style={styles.monthLabel}>{format(tripEnd, 'MMM yyyy', { locale: es })}</span>
        )}
      </div>

      {/* Summary */}
      <div style={styles.summary}>
        {cities.map((city, i) => {
          const color = CITY_COLORS[i % CITY_COLORS.length]
          const days = citySummary[city.name] || 0
          return (
            <div key={city.name} style={styles.summaryRow}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{city.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: days > 0 ? color : 'rgba(255,255,255,0.2)' }}>
                {days > 0 ? `${days} días` : 'sin asignar'}
              </span>
              {days > 0 && (
                <button onClick={() => clearCity(city.name)} style={styles.clearBtn}>✕</button>
              )}
            </div>
          )
        })}
        {unassignedDays > 0 && (
          <div style={{ fontSize: 12, color: '#FFB547', marginTop: 4 }}>
            ⚠ {unassignedDays} día{unassignedDays > 1 ? 's' : ''} sin asignar
          </div>
        )}
        {unassignedDays === 0 && assignedDays > 0 && (
          <div style={{ fontSize: 12, color: '#4AE6A4', marginTop: 4 }}>✓ Todos los días asignados</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 16 },
  citySelector: { display: 'flex', flexDirection: 'column', gap: 8 },
  selectorLabel: { fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em' },
  cityPills: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  cityPill: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' },
  calendar: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 12, userSelect: 'none' },
  weekRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 },
  dayHeader: { textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', padding: '4px 0', fontWeight: 500 },
  dayCell: { aspectRatio: '1', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s', minHeight: 36 },
  monthLabel: { fontSize: 11, color: 'rgba(255,255,255,0.25)', textTransform: 'capitalize' },
  summary: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 },
  summaryRow: { display: 'flex', alignItems: 'center', gap: 8 },
  clearBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 11, cursor: 'pointer', padding: '0 2px' },
}
