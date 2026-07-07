import { NextRequest, NextResponse } from 'next/server'
import { anthropic, MODELS } from '@/lib/claude'
import { buildSynthesisPrompt, SYNTHESIS_SYSTEM } from '@/lib/prompts'
import { TripGuidelines } from '@/lib/schema'
import { auth } from '@/auth'
import sql from '@/lib/db'
import { ANON_COOKIE, ANON_DAILY_LIMIT, IP_DAILY_LIMIT, hashIp } from '@/lib/anon'
import { validateGuidelines } from '@/lib/validate'

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

  const validationError = validateGuidelines(guidelines)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  // Identify the caller: signed-in user, or guest via anon cookie.
  const session = await auth()
  const userId = session?.user?.id ?? null
  let anonId: string | null = null
  let ipHash: string | null = null
  if (!userId) {
    anonId = req.cookies.get(ANON_COOKIE)?.value ?? crypto.randomUUID()
    const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
    ipHash = hashIp(ip)

    // Guest rate limits: per device (cookie) and per IP, rolling 24h.
    // The IP layer means clearing cookies doesn't reset the meter.
    try {
      const [cookieRows, ipRows] = await Promise.all([
        sql`SELECT COUNT(*)::int AS n FROM trips WHERE anon_id = ${anonId} AND created_at > NOW() - INTERVAL '1 day'`,
        sql`SELECT COUNT(*)::int AS n FROM trips WHERE ip_hash = ${ipHash} AND created_at > NOW() - INTERVAL '1 day'`,
      ])
      if ((cookieRows[0]?.n ?? 0) >= ANON_DAILY_LIMIT || (ipRows[0]?.n ?? 0) >= IP_DAILY_LIMIT) {
        return NextResponse.json(
          { error: `You've hit the guest limit of ${ANON_DAILY_LIMIT} trips per day. Create a free account to keep planning.` },
          { status: 429 },
        )
      }
    } catch {
      // anon_id/ip_hash columns missing (migration not run yet) — fall through;
      // the INSERT below will surface a clearer error if so.
    }
  }

  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  const send = async (event: string, data: unknown) => {
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify({ event, data })}\n\n`))
    } catch {
      // stream closed (client disconnected)
    }
  }

  ;(async () => {
    try {
      const { destination, targetMonthYear, startDate, endDate, timeframeMode,
        departureAirport, drivingFrom, travelMode,
        domesticOrInternational, lodgingPrefs, interests, tripType } = guidelines

      const timeframe = timeframeMode === 'exact' && startDate && endDate
        ? `${startDate} to ${endDate}`
        : targetMonthYear

      // Save a placeholder trip immediately so it survives even if the user
      // navigates away. Guests get it under their anon cookie and can claim
      // it by creating an account later.
      let tripId: string | null = null
      const rows = userId
        ? await sql`
            INSERT INTO trips (user_id, guidelines, plan, status, emoji, card_color)
            VALUES (${userId}, ${JSON.stringify(guidelines)}, '{}', 'planning', '🗺️', 'blue')
            RETURNING id
          `
        : await sql`
            INSERT INTO trips (anon_id, ip_hash, guidelines, plan, status, emoji, card_color)
            VALUES (${anonId}, ${ipHash}, ${JSON.stringify(guidelines)}, '{}', 'planning', '🗺️', 'blue')
            RETURNING id
          `
      tripId = rows[0]?.id ?? null
      await send('started', { tripId })

      let travelResearch: string
      if (travelMode === 'drive') {
        await send('progress', { step: 1, label: 'Researching drive route…' })
        travelResearch = await webSearch(`drive from ${drivingFrom} to ${destination} time route tips stops`)
      } else {
        await send('progress', { step: 1, label: 'Researching flights…' })
        travelResearch = await webSearch(`${departureAirport} to ${destination} flights ${timeframe} price range`)
      }

      await send('progress', { step: 2, label: 'Finding lodging options…' })
      const lodgingResearch = await webSearch(`best ${lodgingPrefs.join(' ')} ${destination} ${timeframe} price per night`)

      await send('progress', { step: 3, label: 'Discovering activities…' })
      const activitiesResearch = await webSearch(`best things to do ${destination} with ${tripType} ${interests.slice(0, 3).join(' ')}`)

      await send('progress', { step: 4, label: 'Building your trip plan…' })

      const synthesis = await anthropic.messages.create({
        model: MODELS.synthesis,
        // Plans with booking alternatives regularly exceed 8k output tokens;
        // truncation here breaks JSON parsing and kills the whole generation.
        max_tokens: 20000,
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

      await send('progress', { step: 5, label: 'Saving your trip…' })

      let plan
      try {
        const jsonMatch = planJson.match(/\{[\s\S]*\}/)
        plan = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(planJson)
      } catch (parseErr) {
        // Make failures visible in Vercel logs: truncation shows up as stop_reason 'max_tokens'
        console.error('[generate] plan parse failed', {
          stopReason: synthesis.stop_reason,
          outputChars: planJson.length,
          tail: planJson.slice(-160),
          error: parseErr instanceof Error ? parseErr.message : String(parseErr),
        })
        // Clean up the placeholder if we couldn't parse the plan
        if (tripId) await sql`DELETE FROM trips WHERE id = ${tripId}`
        await send('error', { message: 'Failed to parse trip plan. Please try again.' })
        return
      }

      // Update the placeholder with the real plan (+ its trip-specific emoji)
      if (tripId) {
        const emoji = typeof plan.emoji === 'string' && plan.emoji.length > 0 && plan.emoji.length <= 8
          ? plan.emoji
          : '🗺️'
        await sql`UPDATE trips SET plan = ${JSON.stringify(plan)}, emoji = ${emoji} WHERE id = ${tripId}`
      }

      await send('complete', { plan, tripId })
    } catch (err) {
      await send('error', { message: err instanceof Error ? err.message : 'Generation failed' })
    } finally {
      try {
        await writer.close()
      } catch {
        // already closed
      }
    }
  })()

  const res = new NextResponse(stream.readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  })

  // Persist the guest identity so trips can be viewed and later claimed.
  if (!userId && anonId) {
    res.cookies.set(ANON_COOKIE, anonId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  return res
}
