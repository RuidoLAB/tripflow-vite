import { useState, useMemo, useRef } from 'react'
import { format, addDays, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'

const CITY_COLORS = [
  '#4AE6A4', '#60AAFF', '#FFB547', '#F472B6',
  '#818CF8', '#34D399', '#FB923C', '#38BDF8',
  '#FACC15', '#A78BFA', '#FF5757', '#86EFAC',
]

export default function TripCalendar({ startDate, totalDays, cities, dayAssignments, onChange }) {
  const [selectedCity, setSelectedCity] = useState(cities[0]?.name || null)
  const [dragStart, setDragStart] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const isDragging = useRef(false)
  const calendarRef = useRef(null)

  const tripStart = useMemo(() => startDate ? new Date(startDate) : new Date(), [startDate])
  const tripEnd = useMemo(() => addDays(tripStart, (parseInt(totalDays) || 16) - 1), [tripStart, totalDays])

  const allDays = useMemo(() =>
    eachDayOfInterval({ start: tripStart, end: tripEnd }),
    [tripStart, tripEnd]
  )

  function getDateStr(date) { return format(date, 'yyyy-MM-dd') }

  function getCityColor(cityName) {
    if (!cityName) return null
    const idx = cities.findIndex(c => c.name === cityName)
    return idx >= 0 ? CITY_COLORS[idx % CITY_COLORS.length] : null
  }

  function applyRange(start, end) {
    if (!selectedCity) return
    const s = start < end ? start : end
    const e = start < end ? end : start
    const days = eachDayOfInterval({ start: s, end: e })
    const updated = { ...dayAssignments }
    days.forEach(d => {
      const str = getDateStr(d)
      if (selectedCity === '__clear__') {
        delete updated[str]
      } else {
        updated[str] = selectedCity
      }
    })
    onChange(updated)
  }

  // Get day element from touch position
  function getDayFromTouch(touch) {
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    if (!el) return null
    const dayEl = el.closest('[data-date]')
    if (!dayEl) return null
    const dateStr = dayEl.getAttribute('data-date')
    return allDays.find(d => getDateStr(d) === dateStr) || null
  }

  // Mouse events (desktop)
  function handleMouseDown(day) {
    isDragging.current = true
    setDragStart(day)
    setDragEnd(day)
  }

  function handleMouseEnter(day) {
    if (isDragging.current) setDragEnd(day)
  }

  function handleMouseUp(day) {
    if (!isDragging.current) return
    isDragging.current = false
    applyRange(dragStart || day, day)
    setDragStart(null)
    setDragEnd(null)
  }

  // Touch events (mobile)
  function handleTouchStart(e, day) {
    e.preventDefault()
    isDragging.current = true
    setDragStart(day)
    setDragEnd(day)
  }

  function handleTouchMove(e) {
    e.preventDefault()
    if (!isDragging.current) return
    const touch = e.touches[0]
    const day = getDayFromTouch(touch)
    if (day) setDragEnd(day)
  }

  function handleTouchEnd(e) {
    e.preventDefault()
    if (!isDragging.current) return
    isDragging.current = false
    if (dragStart && dragEnd) applyRange(dragStart, dragEnd)
    setDragStart(null)
    setDragEnd(null)
  }

  function isInRange(date) {
    if (!dragStart || !dragEnd) return false
    const s = dragStart < dragEnd ? dragStart : dragEnd
    const e = dragStart < dragEnd ? dragEnd : dragStart
    return date >= s && date <= e
  }

  function clearCity(cityName) {
    const updated = {}
    Object.entries(dayAssignments).forEach(([k, v]) => {
      if (v !== cityName) updated[k] = v
    })
    onChange(updated)
  }

  // Group into weeks starting Monday
  const weeks = useMemo(() => {
    const result = []
    let week = []
    const firstDayOfWeek = (allDays[0].getDay() + 6) % 7 // 0=Mon
    for (let i = 0; i < firstDayOfWeek; i++) week.push(null) // padding
    allDays.forEach(day => {
      week.push(day)
      if (week.length === 7) { result.push(week); week = [] }
    })
    if (week.length > 0) {
      while (week.length < 7) week.push(null)
      result.push(week)
    }
    return result
  }, [allDays])

  const citySummary = useMemo(() => {
    const map = {}
    Object.values(dayAssignments).forEach(c => { map[c] = (map[c] || 0) + 1 })
    return map
  }, [dayAssignments])

  const assignedDays = Object.keys(dayAssignments).length
  const unassignedDays = (parseInt(totalDays) || 16) - assignedDays

  return (
    <div style={styles.wrap}>
      {/* City selector */}
      <div>
        <div style={styles.selectorLabel}>Selecciona ciudad y arrastra los días</div>
        <div style={styles.cityPills}>
          {cities.map((city, i) => {
            const color = CITY_COLORS[i % CITY_COLORS.length]
            const isActive = selectedCity === city.name
            return (
              <button key={city.name} onClick={() => setSelectedCity(city.name)} style={{
                ...styles.cityPill,
                background: isActive ? `${color}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.1)'}`,
                color: isActive ? color : 'rgba(255,255,255,0.5)',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {city.name}
                {citySummary[city.name] > 0 && (
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{citySummary[city.name]}d</span>
                )}
              </button>
            )
          })}
          <button onClick={() => setSelectedCity('__clear__')} style={{
            ...styles.cityPill,
            background: selectedCity === '__clear__' ? 'rgba(255,87,87,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${selectedCity === '__clear__' ? 'rgba(255,87,87,0.4)' : 'rgba(255,255,255,0.1)'}`,
            color: selectedCity === '__clear__' ? '#FF5757' : 'rgba(255,255,255,0.3)',
          }}>
            ✕ Borrar
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div
        ref={calendarRef}
        style={styles.calendar}
        onMouseLeave={() => {
          if (isDragging.current) {
            isDragging.current = false
            if (dragStart && dragEnd) applyRange(dragStart, dragEnd)
            setDragStart(null)
            setDragEnd(null)
          }
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Headers */}
        <div style={styles.weekRow}>
          {['L','M','X','J','V','S','D'].map((d, i) => (
            <div key={i} style={styles.dayHeader}>{d}</div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} style={styles.weekRow}>
            {week.map((day, di) => {
              if (!day) return <div key={`empty-${di}`} style={styles.dayCell} />
              const dateStr = getDateStr(day)
              const assignedCity = dayAssignments[dateStr]
              const color = getCityColor(assignedCity)
              const inRange = isInRange(day)
              const rangeColor = selectedCity && selectedCity !== '__clear__'
                ? getCityColor(selectedCity)
                : '#FF5757'

              return (
                <div
                  key={dateStr}
                  data-date={dateStr}
                  style={{
                    ...styles.dayCell,
                    background: inRange
                      ? `${rangeColor}35`
                      : color ? `${color}22` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${inRange ? rangeColor : color ? `${color}50` : 'rgba(255,255,255,0.07)'}`,
                    cursor: 'pointer',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                  }}
                  onMouseDown={() => handleMouseDown(day)}
                  onMouseEnter={() => handleMouseEnter(day)}
                  onMouseUp={() => handleMouseUp(day)}
                  onTouchStart={e => handleTouchStart(e, day)}
                >
                  <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: color ? color : 'rgba(255,255,255,0.5)',
                    lineHeight: 1,
                  }}>
                    {format(day, 'd')}
                  </span>
                  {color && !inRange && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: color, marginTop: 2 }} />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Month range */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
                <button onClick={() => clearCity(city.name)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 12, cursor: 'pointer', padding: '0 2px' }}>✕</button>
              )}
            </div>
          )
        })}
        <div style={{ fontSize: 12, marginTop: 4, color: unassignedDays === 0 ? '#4AE6A4' : '#FFB547' }}>
          {unassignedDays === 0
            ? '✓ Todos los días asignados'
            : `⚠ ${unassignedDays} día${unassignedDays > 1 ? 's' : ''} sin asignar`}
        </div>
      </div>
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 14 },
  selectorLabel: { fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 },
  cityPills: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  cityPill: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: 'pointer' },
  calendar: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 10, touchAction: 'none' },
  weekRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 3 },
  dayHeader: { textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', padding: '4px 0' },
  dayCell: { aspectRatio: '1', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 38, transition: 'background 0.08s, border 0.08s' },
  monthLabel: { fontSize: 11, color: 'rgba(255,255,255,0.25)', textTransform: 'capitalize' },
  summary: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 },
  summaryRow: { display: 'flex', alignItems: 'center', gap: 8 },
}
