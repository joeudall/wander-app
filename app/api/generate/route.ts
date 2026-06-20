import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODELS } from '@/lib/claude'
import { buildSynthesisPrompt, SYNTHESIS_SYSTEM } from '@/lib/prompts'
import { TripGuidelines } from '@/lib/schema'
import { auth } from '@/auth'
import sql from '@/lib/db'

async function webSearch(query: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODELS.utility,
    max_tokens: 800,
    tools: [{ type: 'web_search_20250305' as const, name: 'web_search' }],
    messages: [{
      role: 'user',
      content: `Search for: ${query}\n\nExtract the 4–6 most useful facts (prices, times, seasonal notes). Be specific with numbers. Be concise.`,
    }],
  })
  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('\n')
  return text || 'No results found.'
}

export async function POST(req: NextRequest) {
  const guidelines: TripGuidelines = await req.json()
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  const send = (event: string, data: unknown) => {
    writer.write(encoder.encode(`data: ${JSON.stringify({ event, data })}\n\n`))
  }

  ;(async () => {
    try {
      const { destination, targetMonthYear, startDate, endDate, timeframeMode,
        departureAirport, drivingFrom, travelMode,
        domesticOrInternational, lodgingPrefs, interests, tripType } = guidelines

      const timeframe = timeframeMode === 'exact' && startDate && endDate
        ? `${startDate} to ${endDate}`
        : targetMonthYear

      let travelResearch: string
      if (travelMode === 'drive') {
        send('progress', { step: 1, label: 'Researching drive route…' })
        travelResearch = await webSearch(`drive from ${drivingFrom} to ${destination} time route tips stops`)
      } else {
        send('progress', { step: 1, label: 'Researching flights…' })
        travelResearch = await webSearch(`${departureAirport} to ${destination} flights ${timeframe} price range`)
      }

      send('progress', { step: 2, label: 'Finding lodging options…' })
      const lodgingResearch = await webSearch(`best ${lodgingPrefs.join(' ')} ${destination} ${timeframe} price per night`)

      send('progress', { step: 3, label: 'Discovering activities…' })
      const activitiesResearch = await webSearch(`best things to do ${destination} with ${tripType} ${interests.slice(0, 3).join(' ')}`)

      send('progress', { step: 4, label: 'Building your trip plan…' })

      const synthesis = await anthropic.messages.create({
        model: MODELS.synthesis,
        max_tokens: 8000,
        system: SYNTHESIS_SYSTEM,
        messages: [{ role: 'user', content: buildSynthesisPrompt(guidelines, {
          flights: travelResearch,
          lodging: lodgingResearch,
          activities: activitiesResearch,
        })}],
      })

      const planJson = synthesis.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { type: 'text'; text: string }).text)
        .join('')

      send('progress', { step: 5, label: 'Saving your trip…' })

      let plan
      try {
        const jsonMatch = planJson.match(/\{[\s\S]*\}/)
        plan = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(planJson)
      } catch {
        send('error', { message: 'Failed to parse trip plan. Please try again.' })
        await writer.close()
        return
      }

      // Save to Neon
      const session = await auth()
      let savedTripId: string | null = null

      if (session?.user?.id) {
        const rows = await sql`
          INSERT INTO trips (user_id, guidelines, plan, status, emoji, card_color)
          VALUES (${session.user.id}, ${JSON.stringify(guidelines)}, ${JSON.stringify(plan)}, 'planning', '🗺️', 'blue')
          RETURNING id
        `
        savedTripId = rows[0]?.id ?? null
      }

      send('complete', { plan, tripId: savedTripId })
    } catch (err) {
      send('error', { message: err instanceof Error ? err.message : 'Generation failed' })
    } finally {
      await writer.close()
    }
  })()

  return new NextResponse(stream.readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  })
}
