import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODELS } from '@/lib/claude'
import { buildRefinementPrompt, REFINEMENT_SYSTEM, CROSS_SECTION_KEYS, RefinementTab } from '@/lib/prompts'
import { auth } from '@/auth'
import sql from '@/lib/db'
import { DestinationPlan, TripGuidelines } from '@/lib/schema'

export async function POST(req: NextRequest) {
  const { tripId, tab, suggestion } = await req.json() as {
    tripId: string
    tab: RefinementTab
    suggestion: string
  }

  if (!tripId || !tab || !suggestion?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await sql`SELECT * FROM trips WHERE id = ${tripId} AND user_id = ${session.user.id}`
  const trip = rows[0]
  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
  }

  const plan = trip.plan as DestinationPlan
  const guidelines = trip.guidelines as TripGuidelines

  const destination = plan.destination || guidelines.destination
  const fullPlan = plan as unknown as Record<string, unknown>
  const prompt = buildRefinementPrompt(tab, destination, guidelines, fullPlan, suggestion)

  const response = await anthropic.messages.create({
    model: MODELS.synthesis,
    max_tokens: 6000,
    system: REFINEMENT_SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')

  let updatedSection: Record<string, unknown>
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    updatedSection = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Failed to parse refinement. Please try again.' }, { status: 500 })
  }

  const newPlan = { ...plan, ...updatedSection }
  await sql`UPDATE trips SET plan = ${JSON.stringify(newPlan)} WHERE id = ${tripId}`

  return NextResponse.json({ section: updatedSection })
}
