import { differenceInCalendarDays, parseISO, isAfter, isBefore, startOfDay, format } from 'date-fns'

export const TRIP = {
  start: '2025-07-24',
  end: '2025-08-08',
  totalUsable: 1450,
  prepaid: { flights: 1500, parks: 488, hotel: 500 },
}

export const PREPAID_CATEGORIES = ['vuelos', 'parques', 'hotel']

export const CATEGORIES = [
  { value: 'comida',      label: 'Comida',       color: '#4AE6A4' },
  { value: 'transporte',  label: 'Transporte',   color: '#60AAFF' },
  { value: 'uber',        label: 'Uber',         color: '#38BDF8' },
  { value: 'actividades', label: 'Actividades',  color: '#818CF8' },
  { value: 'compras',     label: 'Compras',      color: '#FACC15' },
  { value: 'ropa',        label: 'Ropa',         color: '#F9A8D4' },
  { value: 'entradas',    label: 'Entradas',     color: '#34D399' },
  { value: 'gasolina',    label: 'Gasolina',     color: '#FCD34D' },
  { value: 'souvenirs',   label: 'Souvenirs',    color: '#86EFAC' },
  { value: 'vuelos',      label: 'Vuelos',       color: '#A78BFA' },
  { value: 'parques',     label: 'Parques',      color: '#F472B6' },
  { value: 'hotel',       label: 'Hotel',        color: '#FB923C' },
  { value: 'otros',       label: 'Otros',        color: '#94A3B8' },
]

export const CITIES = ['Orlando', 'New York City', 'Los Angeles', 'General']

export const CITY_BUDGETS = {
  Orlando: 450,
  'New York City': 400,
  'Los Angeles': 600,
  General: null,
}

export const CITY_COLORS = {
  Orlando: '#60AAFF',
  'New York City': '#4AE6A4',
  'Los Angeles': '#FFB547',
  General: '#94A3B8',
}

export function getCategoryColor(value) {
  return CATEGORIES.find(c => c.value === value)?.color || '#94A3B8'
}
export function getCategoryLabel(value) {
  return CATEGORIES.find(c => c.value === value)?.label || value
}

export function getTripDays() {
  return differenceInCalendarDays(parseISO(TRIP.end), parseISO(TRIP.start)) + 1
}

export function getRemainingDays() {
  const today = startOfDay(new Date())
  const end = parseISO(TRIP.end)
  const start = parseISO(TRIP.start)
  if (isBefore(today, start)) return getTripDays()
  if (isAfter(today, end)) return 0
  return differenceInCalendarDays(end, today) + 1
}

export function getDaysElapsed() {
  return getTripDays() - getRemainingDays()
}

export function isUsable(expense) {
  return !expense.prepaid && !PREPAID_CATEGORIES.includes(expense.category)
}

export function getUsable(expenses) {
  return expenses.filter(isUsable)
}

export function getTotalSpent(expenses) {
  return getUsable(expenses).reduce((s, e) => s + Number(e.amount), 0)
}

export function getRemaining(expenses) {
  return TRIP.totalUsable - getTotalSpent(expenses)
}

export function getDailyBudget(expenses) {
  const days = getRemainingDays()
  if (days <= 0) return 0
  return getRemaining(expenses) / days
}

export function getTodaySpent(expenses) {
  const today = format(new Date(), 'yyyy-MM-dd')
  return getUsable(expenses)
    .filter(e => e.date === today)
    .reduce((s, e) => s + Number(e.amount), 0)
}

export function getByCategory(expenses) {
  const map = {}
  getUsable(expenses).forEach(e => {
    map[e.category] = (map[e.category] || 0) + Number(e.amount)
  })
  return Object.entries(map)
    .map(([key, value]) => ({ key, label: getCategoryLabel(key), value, color: getCategoryColor(key) }))
    .sort((a, b) => b.value - a.value)
}

export function getByCity(expenses) {
  const map = {}
  getUsable(expenses).forEach(e => {
    map[e.city] = (map[e.city] || 0) + Number(e.amount)
  })
  return Object.entries(map)
    .map(([city, spent]) => ({
      city, spent,
      budget: CITY_BUDGETS[city] || null,
      color: CITY_COLORS[city] || '#94A3B8',
    }))
    .sort((a, b) => b.spent - a.spent)
}

export function fmt(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

export function fmtDec(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}
