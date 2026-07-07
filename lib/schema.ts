// Core TypeScript types matching the trip schema

export type TripType = 'family' | 'adults' | 'undecided'
export type PlanningStage = 'destination_selected' | 'ideation'
export type TripDomesticType = 'domestic' | 'international'
export type BudgetStyle = 'budget' | 'mid' | 'splurge'

export interface TripGuidelines {
  // Step 1 — Who
  tripType: TripType
  travelersMin: number
  travelersMax: number
  kidsAges: number[]

  // Step 2 — When & Where
  planningStage: PlanningStage
  destination: string
  timeframeMode: 'flexible' | 'exact'
  targetMonthYear: string   // flexible mode
  nights: number            // flexible mode
  startDate?: string        // exact mode
  endDate?: string          // exact mode
  travelMode: 'fly' | 'drive'
  departureAirport: string  // fly mode
  drivingFrom?: string      // drive mode
  domesticOrInternational: TripDomesticType

  // Step 3 — Style
  interests: string[]
  budgetStyle: BudgetStyle

  // Step 4 — Details
  dietaryNeeds: string[]
  lodgingPrefs: string[]
  freeTextNotes: string
}

export interface FlightOption {
  airline: string
  priceRange: string
  flightTime: string
  notes: string
}

export interface LodgingOption {
  type: string
  pricePerNight: string
  neighborhood: string
  notes: string
}

export interface Activity {
  name: string
  description: string
  timeOfDay?: string
  duration?: string
  cost?: string
  kidFriendly?: boolean
  bookingRequired?: boolean
  tags: string[]
}

export interface ItineraryDay {
  dayNumber: number
  date?: string
  title: string
  activities: Activity[]
}

export interface FoodRecommendation {
  name: string
  description: string
  kidFriendly?: boolean
  dietaryNotes?: string
}

export interface TipCategory {
  category: string
  icon: string
  tips: string[]
}

export interface BudgetBreakdown {
  flights: string
  lodging: string
  food: string
  activities: string
  total: string
}

export interface DestinationPlan {
  destination: string
  summary: string
  highlights: string[]
  weather: {
    avgTemp: string
    rainfall: string
    crowdLevel: string
    seasonalNotes: string
  }
  flights: FlightOption[]
  lodging: LodgingOption[]
  itinerary: ItineraryDay[]
  foodGuide: {
    mustTry: FoodRecommendation[]
    mealTimes?: string
    kidFriendlyPicks?: string[]
    dietaryNotes?: string
  }
  tips: TipCategory[]
  packingList: string[]
  budget: BudgetBreakdown
  bookings: Array<{
    date: string
    activity: string
    time: string
    platform: string
    reference?: string
    notes: string
    alternatives?: Array<{
      activity: string
      description: string
      cost?: string
      platform?: string
    }>
  }>
}

// Field names match the DB columns (snake_case) since rows are passed through as-is.
export interface Trip {
  id: string
  guidelines: TripGuidelines
  plan: DestinationPlan
  status: 'upcoming' | 'past' | 'planning' | 'taken'
  created_at: string
  card_color: 'blue' | 'green' | 'purple' | 'orange' | 'gold'
  emoji: string
  is_public: boolean
  user_id: string | null
  anon_id?: string | null
}

// Section 14 — Collaboration

export interface FamilyGroup {
  id: string
  name: string
  createdBy: string
  createdAt: string
}

export interface Member {
  userId: string
  email: string
  role: 'owner' | 'member'
  joinedAt: string
}

export interface Comment {
  id: string
  tripId: string
  userId: string
  authorEmail: string
  body: string
  referenceType: 'trip' | 'day' | 'activity'
  referenceId?: string
  createdAt: string
  updatedAt?: string
  isRead: boolean
}
