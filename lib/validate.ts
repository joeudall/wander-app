import { TripGuidelines } from '@/lib/schema'

/**
 * Sanity-check and clamp incoming wizard payloads before they reach the
 * AI pipeline. Prevents oversized/garbage payloads from burning tokens.
 * Returns an error string, or null if valid (mutates nothing).
 */
export function validateGuidelines(g: unknown): string | null {
  if (!g || typeof g !== 'object') return 'Invalid request body'
  const t = g as Partial<TripGuidelines>

  if (typeof t.destination !== 'string' || !t.destination.trim()) return 'Destination is required'
  if (t.destination.length > 200) return 'Destination is too long'

  const strFields: Array<[string | undefined, string, number]> = [
    [t.targetMonthYear, 'Timeframe', 100],
    [t.departureAirport, 'Departure airport', 120],
    [t.drivingFrom, 'Driving from', 120],
    [t.freeTextNotes, 'Notes', 2000],
    [t.startDate, 'Start date', 20],
    [t.endDate, 'End date', 20],
  ]
  for (const [val, name, max] of strFields) {
    if (val !== undefined && (typeof val !== 'string' || val.length > max)) return `${name} is invalid`
  }

  const arrFields: Array<[unknown, string]> = [
    [t.interests, 'Interests'],
    [t.dietaryNeeds, 'Dietary needs'],
    [t.lodgingPrefs, 'Lodging preferences'],
    [t.kidsAges, 'Kids ages'],
  ]
  for (const [val, name] of arrFields) {
    if (val !== undefined) {
      if (!Array.isArray(val) || val.length > 25) return `${name} is invalid`
      for (const item of val) {
        if (typeof item === 'string' && item.length > 80) return `${name} is invalid`
      }
    }
  }

  if (t.nights !== undefined && (typeof t.nights !== 'number' || t.nights < 1 || t.nights > 90)) return 'Nights must be between 1 and 90'
  if (t.travelersMin !== undefined && (typeof t.travelersMin !== 'number' || t.travelersMin < 1 || t.travelersMin > 50)) return 'Traveler count is invalid'
  if (t.travelersMax !== undefined && (typeof t.travelersMax !== 'number' || t.travelersMax < 1 || t.travelersMax > 50)) return 'Traveler count is invalid'

  return null
}

/** Escape HTML entities in model-generated text before any innerHTML use. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
