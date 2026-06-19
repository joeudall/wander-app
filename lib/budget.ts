export const RATES = {
  domestic:      { budget: 120, mid: 250, splurge: 500 },
  international: { budget: 175, mid: 350, splurge: 700 },
}

export function fmt(n: number): string {
  if (n >= 1000) return '$' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k'
  return '$' + n
}

export function calcBudgetRanges(
  nights: number,
  travelersMin: number,
  travelersMax: number,
  tripType: 'domestic' | 'international'
) {
  const pax = travelersMin > 0 ? Math.ceil((travelersMin + (travelersMax || travelersMin)) / 2) : 2
  const days = nights > 0 ? nights + 1 : 0
  const rates = RATES[tripType]

  if (days === 0 || pax === 0) return null

  return {
    pax,
    nights,
    budget: {
      label: `< ${fmt(rates.budget * pax * days)}`,
      rate: `~${fmt(rates.budget)}/person/day`,
    },
    mid: {
      label: `${fmt(rates.budget * pax * days)} – ${fmt(rates.mid * pax * days)}`,
      rate: `~${fmt(rates.mid)}/person/day`,
    },
    splurge: {
      label: `${fmt(rates.mid * pax * days)}+`,
      rate: `~${fmt(rates.splurge)}/person/day`,
    },
  }
}
