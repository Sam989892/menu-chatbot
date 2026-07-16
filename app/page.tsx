'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, SendHorizonal, UtensilsCrossed } from 'lucide-react'
import MenuSidebar from '@/components/MenuSidebar'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  "What's vegan?",
  "What's under £8?",
  'I have a nut allergy — what should I avoid?',
  'What goes well with the Classic Burger?',
]

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy) return
    setError('')
    setInput('')
    setBusy(true)

    const history: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    // add the user message plus an empty assistant bubble to stream into
    setMessages([...history, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Something went wrong.')
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = {
            role: 'assistant',
            content: next[next.length - 1].content + chunk,
          }
          return next
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      // drop the empty assistant bubble on failure
      setMessages((prev) => (prev[prev.length - 1]?.content === '' ? prev.slice(0, -1) : prev))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-8">
      <header className="mb-6 text-center">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white">
          <UtensilsCrossed size={22} />
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-white">
          Ask the menu anything
        </h1>
        <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
          A menu chatbot for The Green Fork. Vegan options, allergens, pairings — just ask.
        </p>
      </header>

      <div className="grid flex-1 gap-5 lg:grid-cols-[320px_1fr]">
        <div className="hidden max-h-[70vh] lg:block">
          <MenuSidebar />
        </div>

        {/* chat */}
        <div className="flex max-h-[70vh] flex-col rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <p className="text-sm text-stone-400">Try one of these:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="cursor-pointer rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:border-emerald-600 hover:text-emerald-700 dark:border-stone-700 dark:text-stone-300"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-emerald-700 text-white'
                      : 'rounded-bl-md bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200'
                  }`}
                >
                  {m.content || (
                    <Loader2 size={16} className="animate-spin text-stone-400" aria-label="Thinking" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p className="mx-5 mb-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" role="alert">
              {error}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex gap-2 border-t border-stone-100 p-4 dark:border-stone-800"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the menu…"
              aria-label="Your question"
              maxLength={2000}
              className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-[15px] text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-emerald-700 text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendHorizonal size={18} />
            </button>
          </form>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-stone-400">
        Concept project by Sam Madni · Next.js + Claude API · Menu lives in data/menu.json
      </footer>
    </main>
  )
}
