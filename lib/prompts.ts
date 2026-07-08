import { TripGuidelines } from './schema'

export function buildSynthesisPrompt(
  guidelines: TripGuidelines,
  research: {
    flights: string
    lodging: string
    activities: string
  }
): string {
  const { tripType, travelersMin, travelersMax, kidsAges, destination,
    targetMonthYear, nights, departureAirport, domesticOrInternational,
    interests, budgetStyle, dietaryNeeds, lodgingPrefs, freeTextNotes } = guidelines

  const travelerCount = travelersMax > travelersMin
    ? `${travelersMin}–${travelersMax}`
    : `${travelersMin}`

  const composition = tripType === 'family' && kidsAges.length > 0
    ? `including kids ages ${kidsAges.join(', ')}`
    : tripType === 'adults'
    ? 'adults only'
    : 'mixed group'

  return `Plan a ${nights}-night ${domesticOrInternational} trip to ${destination} for ${travelerCount} travelers (${composition}). Departing from ${departureAirport} around ${targetMonthYear}.

Budget style: ${budgetStyle}
Interests: ${interests.join(', ') || 'flexible'}
Dietary needs: ${dietaryNeeds.join(', ') || 'none specified'}
Lodging preferences: ${lodgingPrefs.join(', ') || 'flexible'}
Additional notes: ${freeTextNotes || 'none'}

[FLIGHT RESEARCH]
${research.flights}

[LODGING RESEARCH]
${research.lodging}

[ACTIVITIES & ATTRACTIONS RESEARCH]
${research.activities}

Produce a complete trip plan as a JSON object matching this exact TypeScript interface. Return ONLY the JSON, no markdown fences, no explanation:

{
  "destination": string,
  "emoji": string (ONE emoji that best captures this specific trip — e.g. 🏔️ 🏖️ 🗼 🌋 🎿 — not 🗺️),
  "summary": string (2–3 sentence overview),
  "highlights": string[] (4–6 bullet highlights),
  "weather": {
    "avgTemp": string,
    "rainfall": string,
    "crowdLevel": string,
    "seasonalNotes": string
  },
  "flights": [{
    "airline": string,
    "priceRange": string,
    "flightTime": string,
    "notes": string
  }],
  "lodging": [{
    "type": string,
    "pricePerNight": string,
    "neighborhood": string,
    "notes": string
  }],
  "itinerary": [{
    "dayNumber": number,
    "date": string,
    "title": string,
    "activities": [{
      "name": string,
      "description": string,
      "timeOfDay": string,
      "duration": string,
      "cost": string,
      "kidFriendly": boolean,
      "bookingRequired": boolean,
      "tags": string[]
    }]
  }],
  "foodGuide": {
    "mustTry": [{
      "name": string,
      "description": string,
      "kidFriendly": boolean,
      "dietaryNotes": string
    }],
    "mealTimes": string,
    "kidFriendlyPicks": string[],
    "dietaryNotes": string
  },
  "tips": [{
    "category": string,
    "icon": string,
    "tips": string[]
  }],
  "packingList": string[],
  "budget": {
    "flights": string,
    "lodging": string,
    "food": string,
    "activities": string,
    "total": string
  },
  "bookings": [{
    "date": string,
    "activity": string,
    "time": string,
    "platform": string,
    "reference": string,
    "notes": string
  }] (ONLY the must-book items — advance reservations that sell out or gate the trip. 3–8 rows max. Do NOT include alternatives; users request those later.)
}

Rules:
- Always show costs as ranges, not single numbers
- Tie activities to practical logistics (hours, drive times, booking requirements)
- When uncertain, say so explicitly
- Make the itinerary specific and actionable, not generic
- Be concise: descriptions 1–2 sentences, no filler prose
- Tag each activity with relevant tags from: ["transit", "culture", "food", "free", "booking", "nature", "adventure"]`
}

export const SYNTHESIS_SYSTEM = `You are a trip planning expert. You produce detailed, practical, personalized trip plans. Always show costs as ranges, not single numbers. Always tie activities to practical logistics (hours, drive times, booking requirements). When something is uncertain, say so explicitly rather than guessing. Output only valid JSON.`

export function buildResearchPrompt(query: string): string {
  return `Search for: ${query}\n\nExtract the key facts in 3–5 bullet points. Be specific with numbers (prices, times, distances). Note anything uncertain.`
}

export type RefinementTab = 'overview' | 'itinerary' | 'bookings' | 'food' | 'tips'

// Primary keys each tab owns
export const TAB_SECTION_KEYS: Record<RefinementTab, string[]> = {
  overview: ['highlights', 'weather', 'flights', 'lodging', 'budget'],
  itinerary: ['itinerary'],
  bookings: ['bookings'],
  food: ['foodGuide'],
  tips: ['tips'],
}

// All keys that must stay in sync when a tab is refined
export const CROSS_SECTION_KEYS: Record<RefinementTab, string[]> = {
  overview: ['highlights', 'weather', 'flights', 'lodging', 'budget', 'bookings'],
  itinerary: ['itinerary', 'bookings', 'budget'],
  bookings: ['bookings'],
  food: ['foodGuide', 'itinerary', 'bookings'],
  tips: ['tips'],
}

const SECTION_SCHEMAS: Record<string, string> = {
  highlights: `"highlights": string[]`,
  weather: `"weather": { "avgTemp": string, "rainfall": string, "crowdLevel": string, "seasonalNotes": string }`,
  flights: `"flights": [{ "airline": string, "priceRange": string, "flightTime": string, "notes": string }]`,
  lodging: `"lodging": [{ "type": string, "pricePerNight": string, "neighborhood": string, "notes": string }]`,
  budget: `"budget": { "flights": string, "lodging": string, "food": string, "activities": string, "total": string }`,
  itinerary: `"itinerary": [{ "dayNumber": number, "date": string, "title": string, "activities": [{ "name": string, "description": string, "timeOfDay": string, "duration": string, "cost": string, "kidFriendly": boolean, "bookingRequired": boolean, "tags": string[] }] }]`,
  bookings: `"bookings": [{ "date": string, "activity": string, "time": string, "platform": string, "reference": string, "notes": string, "alternatives": [{ "activity": string, "description": string, "cost": string, "platform": string }] }]`,
  foodGuide: `"foodGuide": { "mustTry": [{ "name": string, "description": string, "kidFriendly": boolean, "dietaryNotes": string }], "mealTimes": string, "kidFriendlyPicks": string[], "dietaryNotes": string }`,
  tips: `"tips": [{ "category": string, "icon": string, "tips": string[] }]`,
}

function buildCrossSchema(keys: string[]): string {
  return `{\n  ${keys.map((k) => SECTION_SCHEMAS[k]).filter(Boolean).join(',\n  ')}\n}`
}

export function buildRefinementPrompt(
  tab: RefinementTab,
  destination: string,
  guidelines: TripGuidelines,
  fullPlan: Record<string, unknown>,
  suggestion: string,
): string {
  const { tripType, travelersMin, travelersMax, kidsAges, targetMonthYear, budgetStyle, interests } = guidelines
  const travelerCount = travelersMax > travelersMin ? `${travelersMin}–${travelersMax}` : `${travelersMin}`
  const composition = tripType === 'family' && kidsAges.length > 0
    ? `family with kids ages ${kidsAges.join(', ')}`
    : tripType === 'adults' ? 'adults only' : 'mixed group'

  const affectedKeys = CROSS_SECTION_KEYS[tab]

  // Pull only the sections that will be updated for the current data block
  const currentData: Record<string, unknown> = {}
  for (const key of affectedKeys) {
    currentData[key] = fullPlan[key]
  }

  const crossNote = affectedKeys.length > TAB_SECTION_KEYS[tab].length
    ? `\nIMPORTANT: Your changes must be reflected consistently across ALL returned sections. For example, if a dietary preference changes, update food recommendations in both the food guide AND any food-related itinerary activities AND any restaurant bookings.`
    : ''

  return `Trip: ${destination} | ${travelerCount} travelers (${composition}) | ${targetMonthYear} | Budget: ${budgetStyle} | Interests: ${interests.join(', ')}

The user wants to refine the "${tab}" section of their trip plan.
User's request: "${suggestion}"
${crossNote}

Current data for all sections you must update:
${JSON.stringify(currentData, null, 2)}

Return ONLY valid JSON with these exact top-level keys, all updated to be fully consistent with each other:
${buildCrossSchema(affectedKeys)}

Rules:
- Keep all cost/price values as ranges, not single numbers
- Activity tags must come from: ["transit", "culture", "food", "free", "booking", "nature", "adventure"]
- Preserve day count and structure unless the request implies changing it
- All returned sections must be internally consistent — no contradictions between food guide, itinerary activities, and bookings
- Return ONLY the JSON, no markdown fences, no explanation`
}

export const REFINEMENT_SYSTEM = `You are a trip planning expert making targeted updates to an existing trip plan. When one section changes, you ensure all related sections stay consistent — dietary changes ripple into itinerary activities and restaurant bookings, lodging changes ripple into bookings and budget, activity changes ripple into bookings. Output only valid JSON.`
