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
