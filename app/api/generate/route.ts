import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODELS } from '@/lib/claude'
import { buildSynthesisPrompt, SYNTHESIS_SYSTEM } from '@/lib/prompts'
import { TripGuidelines } from '@/lib/schema'
import { createClient } from '@/lib/supabase/server'

async function webSearch(query: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODELS.utility,
    max_tokens: 800,
    tools: [{ type: 'web_search_20250305' as const, name: 'web_search' }],
    messages: [
      {
        role: 'user',
        content: `Search for: ${query}\n\nExtract the 4–6 most useful facts (prices, times, seasonal notes). Be specific with numbers. Be concise.`,
      },
    ],
  })

  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('\n')

  return text || 'No results found.'
}

export async function POST(req: NextRequest) {
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const guidelines: TripGuidelines = await req.json()

  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  const send = (event: string, data: unknown) => {
    const line = `data: ${JSON.stringify({ event, data })}\n\n`
    writer.write(encoder.encode(line))
  }

  ;(async () => {
    try {
      const { destination, targetMonthYear, departureAirport,
        domesticOrInternational, lodgingPrefs, interests, tripType } = guidelines

      send('progress', { step: 1, label: 'Researching flights…' })
      const flightsResearch = await webSearch(`${departureAirport} to ${destination} flights ${targetMonthYear} price range`)

      send('progress', { step: 2, label: 'Finding lodging options…' })
      const lodgingResearch = await webSearch(`best ${lodgingPrefs.join(' ')} ${destination} ${targetMonthYear} price per night`)

      send('progress', { step: 3, label: 'Discovering activities…' })
      const activitiesResearch = await webSearch(`best things to do ${destination} with ${tripType} ${interests.slice(0, 3).join(' ')}`)

      send('progress', { step: 4, label: 'Checking weather & seasonality…' })
      const weatherResearch = await webSearch(`${destination} weather ${targetMonthYear.split(' ')[0]} what to expect travel tips`)

      send('progress', { step: 5, label: 'Building your trip plan…' })

      const userPrompt = buildSynthesisPrompt(guidelines, {
        flights: flightsResearch,
        lodging: lodgingResearch,
        activities: activitiesResearch,
        weather: weatherResearch,
      })

      const synthesis = await anthropic.messages.create({
        model: MODELS.synthesis,
        max_tokens: 8000,
        system: SYNTHESIS_SYSTEM,
        messages: [{ role: 'user', content: userPrompt }],
      })

      const planJson = synthesis.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as { type: 'text'; text: string }).text)
        .join('')

      send('progress', { step: 6, label: 'Saving your trip…' })

      let plan
      try {
        const jsonMatch = planJson.match(/\{[\s\S]*\}/)
        plan = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(planJson)
      } catch {
        send('error', { message: 'Failed to parse trip plan. Please try again.' })
        await writer.close()
        return
      }

      // Save to Supabase
      const supabase = await createClient()
      let savedTripId: string | null = null

      const { data: savedTrip } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          guidelines,
          plan,
          status: 'planning',
          emoji: '🗺️',
          card_color: 'blue',
        })
        .select('id')
        .single()

      savedTripId = savedTrip?.id ?? null

      send('complete', { plan, tripId: savedTripId })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed'
      send('error', { message })
    } finally {
      await writer.close()
    }
  })()

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
