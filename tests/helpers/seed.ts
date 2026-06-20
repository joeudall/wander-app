/**
 * seed.ts — inserts a minimal test trip directly into the DB.
 *
 * Used by share.spec.ts to avoid running the full AI generation wizard.
 * Requires the same DATABASE_URL env var the app uses.
 */

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

const SEED_PLAN = {
  destination: 'Maui, Hawaii',
  summary: 'A test trip for Playwright.',
  highlights: ['Beautiful beaches', 'Great snorkeling'],
  weather: { avgTemp: '80°F', rainfall: 'Low', crowdLevel: 'Moderate', seasonalNotes: 'Great year-round.' },
  flights: [{ airline: 'Delta', priceRange: '$400–$600', flightTime: '5h', notes: 'Nonstop from PHX' }],
  lodging: [{ type: 'Hotel', pricePerNight: '$250/night', neighborhood: 'Wailea', notes: 'Beachfront' }],
  itinerary: [
    {
      dayNumber: 1, date: '2025-08-10', title: 'Arrival Day',
      activities: [
        { name: 'Check in', description: 'Settle into the hotel.', timeOfDay: 'Afternoon', duration: '1h', cost: '', kidFriendly: true, bookingRequired: false, tags: [] },
      ],
    },
  ],
  foodGuide: { mustTry: [], mealTimes: 'Typical US hours', kidFriendlyPicks: [], dietaryNotes: '' },
  tips: [{ category: 'General', icon: '💡', tips: ['Stay hydrated.'] }],
  packingList: ['Sunscreen', 'Swimsuit'],
  budget: { flights: '$400–$600', lodging: '$250/night', food: '$100/day', activities: '$200 total', total: '$3,500' },
  bookings: [],
}

const SEED_GUIDELINES = {
  tripType: 'family',
  travelersMin: 4,
  travelersMax: 4,
  kidsAges: [8, 11],
  destination: 'Maui, Hawaii',
  targetMonthYear: 'August 2025',
  nights: 7,
  departureAirport: 'PHX',
  domesticOrInternational: 'domestic',
  interests: ['Beach', 'Snorkeling'],
  budgetStyle: 'moderate',
  dietaryNeeds: [],
  lodgingPrefs: ['Hotel'],
  freeTextNotes: '',
}

export async function seedTrip(userId: string): Promise<string> {
  const rows = await sql`
    INSERT INTO trips (user_id, status, plan, guidelines, is_public)
    VALUES (
      ${userId},
      'upcoming',
      ${JSON.stringify(SEED_PLAN)}::jsonb,
      ${JSON.stringify(SEED_GUIDELINES)}::jsonb,
      FALSE
    )
    RETURNING id
  `
  return String(rows[0].id)
}

export async function deleteSeedTrip(tripId: string) {
  await sql`DELETE FROM trips WHERE id = ${tripId}`
}

export async function getTestUserId(email: string): Promise<string | null> {
  const rows = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
  return rows[0] ? String(rows[0].id) : null
}
