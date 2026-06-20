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
  }]
}

Rules:
- Always show costs as ranges, not single numbers
- Tie activities to practical logistics (hours, drive times, booking requirements)
- When uncertain, say so explicitly
- Make the itinerary specific and actionable, not generic
- Tag each activity with relevant tags from: ["transit", "culture", "food", "free", "booking", "nature", "adventure"]`
}

export const SYNTHESIS_SYSTEM = `You are a trip planning expert. You produce detailed, practical, personalized trip plans. Always show costs as ranges, not single numbers. Always tie activities to practical logistics (hours, drive times, booking requirements). When something is uncertain, say so explicitly rather than guessing. Output only valid JSON.`

export function buildResearchPrompt(query: string): string {
  return `Search for: ${query}\n\nExtract the key facts in 3–5 bullet points. Be specific with numbers (prices, times, distances). Note anything uncertain.`
}
