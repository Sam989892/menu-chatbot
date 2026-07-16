import Anthropic from '@anthropic-ai/sdk'
import { systemPrompt } from '@/lib/prompt'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

function isValidHistory(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 40 &&
    value.every(
      (m) =>
        m &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.length > 0 &&
        m.content.length <= 2000,
    )
  )
}

export async function POST(req: Request) {
  let messages: unknown
  try {
    ;({ messages } = await req.json())
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!isValidHistory(messages) || messages[messages.length - 1].role !== 'user') {
    return Response.json({ error: 'Send a non-empty message.' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'Server is missing an ANTHROPIC_API_KEY. Add one to .env.local.' },
      { status: 500 },
    )
  }

  try {
    const client = new Anthropic() // reads ANTHROPIC_API_KEY from the environment
    const stream = client.messages.stream({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system: systemPrompt(),
      messages,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: 'Server API key is invalid.' }, { status: 500 })
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: 'Rate limited. Try again in a minute.' }, { status: 429 })
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: `Claude API error (${error.status}).` }, { status: 502 })
    }
    return Response.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
