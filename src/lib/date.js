const DAY = 86400000

export const todayStr = () => new Date().toISOString().slice(0, 10)

// Nombre de jours entiers avant une deadline (négatif = en retard).
export function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date(todayStr()).getTime()
  const target = new Date(dateStr).getTime()
  return Math.round((target - today) / DAY)
}

// Libellé humain : "aujourd'hui", "demain", "dans 3 j", "en retard de 2 j".
export function deadlineLabel(dateStr) {
  const d = daysUntil(dateStr)
  if (d === null) return null
  if (d === 0) return "aujourd'hui"
  if (d === 1) return 'demain'
  if (d === -1) return 'hier'
  if (d < 0) return `en retard de ${-d} j`
  return `dans ${d} j`
}

export function urgency(dateStr) {
  const d = daysUntil(dateStr)
  if (d === null) return 'none'
  if (d < 0) return 'late'
  if (d <= 1) return 'urgent'
  if (d <= 3) return 'soon'
  return 'calm'
}

const FR_DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const FR_MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

export function prettyToday() {
  const d = new Date()
  return `${FR_DAYS[d.getDay()]} ${d.getDate()} ${FR_MONTHS[d.getMonth()]}`
}

// Valeur "YYYY-MM-DD" décalée de n jours à partir d'aujourd'hui.
export function dateOffset(n) {
  return new Date(Date.now() + n * DAY).toISOString().slice(0, 10)
}

// Horizons d'un souhait : "réel à 100% dans …".
export const HORIZONS = [
  { key: '1s', label: '1 semaine', days: 7 },
  { key: '15j', label: '15 jours', days: 15 },
  { key: '1m', label: '1 mois', days: 30 },
  { key: '3m', label: '3 mois', days: 91 },
  { key: '6m', label: '6 mois', days: 182 },
  { key: '1an', label: '1 an', days: 365 },
  { key: '2ans', label: '2 ans', days: 730 },
  { key: '5ans', label: '5 ans', days: 1825 },
  { key: '10ans', label: '10 ans', days: 3650 },
]

export const horizonLabel = (key) => HORIZONS.find((h) => h.key === key)?.label || null
