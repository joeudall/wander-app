// Affiliate IDs — fill in after signup
const KAYAK_SID   = 'YOUR_KAYAK_SID'
const BOOKING_AID = 'YOUR_BOOKING_AID'
const VIATOR_PID  = 'YOUR_VIATOR_PID'
const VRBO_SITEID = 'YOUR_VRBO_SITEID'
const GYG_PARTNER = 'YOUR_GYG_PARTNER_ID'

// ── Flights ──────────────────────────────────────────────────────────
export function kayakFlightUrl(origin: string, destination: string, monthYear?: string): string {
  const dateStr = parseMonthYear(monthYear)
  const iata = toIATA(destination)
  const base = `https://www.kayak.com/flights/${encodeURIComponent(origin)}-${iata}`
  return dateStr ? `${base}/${dateStr}?sid=${KAYAK_SID}` : `${base}?sid=${KAYAK_SID}`
}

// ── Lodging ──────────────────────────────────────────────────────────
export function bookingSearchUrl(destination: string, checkin?: string, checkout?: string): string {
  const params = new URLSearchParams({ ss: destination, aid: BOOKING_AID })
  if (checkin) params.set('checkin', checkin)
  if (checkout) params.set('checkout', checkout)
  return `https://www.booking.com/searchresults.html?${params}`
}

export function vrboSearchUrl(destination: string): string {
  return `https://www.vrbo.com/search?destination=${encodeURIComponent(destination)}&siteid=${VRBO_SITEID}`
}

// ── Activities ───────────────────────────────────────────────────────
export function viatorActivityUrl(activityName: string, destination: string): string {
  const q = encodeURIComponent(`${activityName} ${destination}`)
  return `https://www.viator.com/search?q=${q}&pid=${VIATOR_PID}`
}

export function gygActivityUrl(activityName: string, destination: string): string {
  const q = encodeURIComponent(`${activityName} ${destination}`)
  return `https://www.getyourguide.com/s/?q=${q}&partner_id=${GYG_PARTNER}`
}

// ── Platform → URL mapper (Bookings tab) ─────────────────────────────
const PLATFORM_MAP: Record<string, (dest: string) => string> = {
  'viator':       (dest) => `https://www.viator.com/search?q=${encodeURIComponent(dest)}&pid=${VIATOR_PID}`,
  'getyourguide': (dest) => `https://www.getyourguide.com/s/?q=${encodeURIComponent(dest)}&partner_id=${GYG_PARTNER}`,
  'booking.com':  (dest) => bookingSearchUrl(dest),
  'hotels.com':   (dest) => `https://www.hotels.com/search?destination=${encodeURIComponent(dest)}`,
  'expedia':      (dest) => `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(dest)}`,
  'opentable':    (dest) => `https://www.opentable.com/s/?term=${encodeURIComponent(dest)}`,
}

export function platformAffiliateUrl(platform: string, destination: string): string | null {
  const key = platform.toLowerCase().replace(/\s+/g, '')
  const builder = PLATFORM_MAP[key]
  return builder ? builder(destination) : null
}

// ── Helpers ──────────────────────────────────────────────────────────
function parseMonthYear(monthYear?: string): string {
  if (!monthYear) return ''
  const d = new Date(monthYear + ' 1')
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const IATA_MAP: Record<string, string> = {
  'hawaii': 'HNL', 'maui': 'OGG', 'honolulu': 'HNL', 'kauai': 'LIH', 'big island': 'KOA',
  'new york': 'NYC', 'los angeles': 'LAX', 'chicago': 'ORD', 'miami': 'MIA',
  'cancun': 'CUN', 'paris': 'CDG', 'london': 'LHR', 'rome': 'FCO', 'tokyo': 'NRT',
  'barcelona': 'BCN', 'amsterdam': 'AMS', 'lisbon': 'LIS', 'mexico city': 'MEX',
  'spain': 'MAD', 'portugal': 'LIS', 'italy': 'FCO', 'greece': 'ATH',
}

function toIATA(destination: string): string {
  return IATA_MAP[destination.toLowerCase()] ?? destination.toUpperCase().slice(0, 3)
}
