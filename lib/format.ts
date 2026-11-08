/** ₡84.900 — punto como separador de miles, como lo escribe DRYX en sus publicaciones. */
export function formatCRC(value: number) {
  const n = Math.round(value)
  const digits = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${n < 0 ? "-" : ""}₡${digits}`
}

/*
 * Fechas formateadas a mano (sin Intl): Node y el navegador traen versiones distintas de ICU
 * y difieren en detalles invisibles (p. ej. el espacio en "a. m."), lo que rompe la hidratación.
 * Costa Rica usa UTC−6 todo el año (sin horario de verano), así que basta un desfase fijo.
 */
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"]
const CR_OFFSET_MS = -6 * 3600000

function crParts(iso: string) {
  const d = new Date(Date.parse(iso) + CR_OFFSET_MS)
  return { day: d.getUTCDate(), month: MONTHS[d.getUTCMonth()], year: d.getUTCFullYear(), h: d.getUTCHours(), m: d.getUTCMinutes() }
}

/** 7 nov 2026 */
export function formatDate(iso: string) {
  const p = crParts(iso)
  return `${p.day} ${p.month} ${p.year}`
}

/** 7 nov, 4:05 p. m. */
export function formatDateTime(iso: string) {
  const p = crParts(iso)
  const h12 = p.h % 12 || 12
  return `${p.day} ${p.month}, ${h12}:${String(p.m).padStart(2, "0")} ${p.h < 12 ? "a. m." : "p. m."}`
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export const uid = () => Math.random().toString(36).slice(2, 10)
