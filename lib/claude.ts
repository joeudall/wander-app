import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const MODELS = {
  // Full synthesis: day-by-day itinerary, narrative descriptions, complex reasoning
  synthesis: 'claude-sonnet-4-5',

  // Lightweight tasks: formatting, weather summary, budget calc explanation,
  // extracting structured data from search results, generating packing lists
  utility: 'claude-haiku-4-5-20251001',
}
