import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export const TRIP = {
  totalUsable: 1450,
  prepaid: { flights: 1500, parks: 488, hotel: 500 },
}

export const PREPAID_CATEGORIES = ['vuelos', 'parques', 'hotel']

export const TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern (ET) — Miami, Orlando, NYC' },
  { value: 'America/Chicago',     label: 'Central (CT)' },
  { value: 'America/Denver',      label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT) — Los Angeles' },
]

export const CATEGORIES = [
  { value: 'comida',      label: 'Comida',      color: '#4AE6A4' },
  { value: 'transporte',  label: 'Transporte',  color: '#60AAFF' },
  { value: 'uber',        label: 'Uber',        color: '#38BDF8' },
  { value: 'actividades', label: 'Actividades', color: '#818CF8' },
  { value: 'compras',     label: 'Compras',     color: '#FACC15' },
  { value: 'ropa',        label: 'Ropa',        color: '#F9A8D4' },
  { value: 'entradas',    label: 'Entradas',    color: '#34D399' },
  { value: 'gasolina',    label: 'Gasolina',    color: '#FCD34D' },
  { value: 'souvenirs',   label: 'Souvenirs',   color: '#86EFAC' },
  { value: 'vuelos',      label: 'Vuelos',      color: '#A78BFA' },
  { value: 'parques',     label: 'Parques',     color: '#F472B6' },
  { value: 'hotel',       label: 'Hotel',       color: '#FB923C' },
  { value: 'otros',       label: 'Otros',       color: '#94A3B8' },
]

export const CITIES = ['Orlando', 'New York City', 'Los Angeles', 'General']
export const CITY_BUDGETS = { Orlando: 450, 'New York City': 400, 'Los Angeles': 600, General: null }
export const CITY_COLORS = { Orlando: '#60AAFF', 'New York City': '#4AE6A4', 'Los Angeles': '#FFB547', General: '#94A3B8' }

export function getCategoryColor(v) { return CATEGORIES.find(c => c.value === v)?.color || '#94A3B8' }
export function getCategoryLabel(v) { return CATEGORIES.find(c => c.value === v)?.label || v }

// Get current date string in the configured timezone (YYYY-MM-DD)
export function getTodayStr(config) {
  const tz = config?.timezone || 'America/New_York'
  const now = toZonedTime(new Date(), tz)
  return format(now, 'yyyy-MM-dd')
}

// Get yesterday's date string in configured timezone
export function getYesterdayStr(config) {
  const tz = config?.timezone || 'America/New_York'
  const now = toZonedTime(new Date(), tz)
  now.setDate(now.getDate() - 1)
  return format(now, 'yyyy-MM-dd')
}

// Trip days elapsed and remaining based on startDate + totalDays
export function getTripInfo(config) {
  if (!config?.startDate || !config?.totalDays) {
    return { started: false, ended: false, dayNumber: 0, daysElapsed: 0, remainingDays: config?.totalDays || 16, totalDays: config?.totalDays || 16 }
  }

  const tz = config.timezone || 'America/New_York'
  const now = toZonedTime(new Date(), tz)
  const start = toZonedTime(new Date(config.startDate), tz)
  const totalDays = config.totalDays

  // Reset to midnight for day comparison
  const nowDay = new Date(format(now, 'yyyy-MM-dd'))
  const startDay = new Date(format(start, 'yyyy-MM-dd'))

  const daysElapsed = Math.floor((nowDay - startDay) / (1000 * 60 * 60 * 24))

  if (daysElapsed < 0) return { started: false, ended: false, dayNumber: 0, daysElapsed: 0, remainingDays: totalDays, totalDays }
  if (daysElapsed >= totalDays) return { started: true, ended: true, dayNumber: totalDays, daysElapsed: totalDays, remainingDays: 0, totalDays }

  return {
    started: true,
    ended: false,
    dayNumber: daysElapsed + 1,
    daysElapsed,
    remainingDays: totalDays - daysElapsed,
    totalDays,
  }
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

export function getRemaining(expenses, config) {
  const usable = config?.totalUsable ?? TRIP.totalUsable
  return usable - getTotalSpent(expenses)
}

// Fixed daily budget: totalUsable / totalDays — never changes
export function getFixedDailyBudget(config) {
  const usable = config?.totalUsable ?? TRIP.totalUsable
  const days = config?.totalDays || 16
  return usable / days
}

// Smart recommended: remaining / remaining days
export function getSmartDailyBudget(expenses, config) {
  const { remainingDays } = getTripInfo(config)
  if (remainingDays <= 0) return 0
  return getRemaining(expenses, config) / remainingDays
}

// Spent on a specific date string
export function getSpentOnDate(expenses, dateStr) {
  return getUsable(expenses)
    .filter(e => e.date === dateStr)
    .reduce((s, e) => s + Number(e.amount), 0)
}

// Yesterday's delta vs fixed budget
export function getYesterdayDelta(expenses, config) {
  const { started, dayNumber } = getTripInfo(config)
  if (!started || dayNumber <= 1) return 0
  const yesterday = getYesterdayStr(config)
  const spent = getSpentOnDate(expenses, yesterday)
  const fixed = getFixedDailyBudget(config)
  return fixed - spent // positive = saved, negative = overspent
}

// Today adjusted = fixed + yesterday delta
export function getTodayAdjustedBudget(expenses, config) {
  return getFixedDailyBudget(config) + getYesterdayDelta(expenses, config)
}

export function getTodaySpent(expenses, config) {
  const today = getTodayStr(config)
  return getSpentOnDate(expenses, today)
}

export function getByCategory(expenses) {
  const map = {}
  getUsable(expenses).forEach(e => { map[e.category] = (map[e.category] || 0) + Number(e.amount) })
  return Object.entries(map)
    .map(([key, value]) => ({ key, label: getCategoryLabel(key), value, color: getCategoryColor(key) }))
    .sort((a, b) => b.value - a.value)
}

export function getByCity(expenses) {
  const map = {}
  getUsable(expenses).forEach(e => { map[e.city] = (map[e.city] || 0) + Number(e.amount) })
  return Object.entries(map)
    .map(([city, spent]) => ({ city, spent, budget: CITY_BUDGETS[city] || null, color: CITY_COLORS[city] || '#94A3B8' }))
    .sort((a, b) => b.spent - a.spent)
}

export function fmt(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

export function fmtDec(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}
