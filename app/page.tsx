'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, SendHorizonal, BookOpen, X } from 'lucide-react'
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
  const [menuOpen, setMenuOpen] = useState(false)
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
      setMessages((prev) => (prev[prev.length - 1]?.content === '' ? prev.slice(0, -1) : prev))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8">
      {/* signboard header */}
      <header className="mb-6 flex items-center gap-4 rounded-2xl border border-line bg-char-2 px-6 py-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-paprika font-display text-2xl font-bold text-cream">
          GF
        </span>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-cream sm:text-3xl">
            Ask the menu
          </h1>
          <p className="text-sm text-cream-dim">
            The Green Fork&apos;s table assistant. Allergens, vegan picks, what pairs with what.
          </p>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-line bg-char-3 px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:border-paprika hover:text-paprika lg:hidden"
        >
          <BookOpen size={16} /> Menu
        </button>
      </header>

      <div className="grid flex-1 gap-5 lg:grid-cols-[320px_1fr]">
        <div className="hidden max-h-[70vh] lg:block">
          <MenuSidebar />
        </div>

        {/* mobile menu sheet */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-char/95 backdrop-blur-sm lg:hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="font-display text-lg font-bold text-cream">The menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-cream-dim transition-colors hover:bg-char-3 hover:text-cream"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <MenuSidebar />
            </div>
          </div>
        )}

        {/* chat */}
        <div className="flex max-h-[70vh] flex-col rounded-2xl border border-line bg-char-2">
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <p className="font-display text-sm uppercase tracking-widest text-cream-dim">Ask me anything</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="cursor-pointer rounded-full border border-line bg-char-3 px-4 py-2 text-sm text-cream transition-colors hover:border-paprika hover:text-paprika"
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
                      ? 'rounded-br-md bg-paprika text-cream'
                      : 'rounded-bl-md bg-char-3 text-cream'
                  }`}
                >
                  {m.content || (
                    <Loader2 size={16} className="animate-spin text-cream-dim" aria-label="Thinking" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p className="mx-5 mb-2 rounded-xl border-l-2 border-paprika bg-paprika/10 px-4 py-2.5 text-sm text-paprika" role="alert">
              {error}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex gap-2 border-t border-line p-4"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the menu…"
              aria-label="Your question"
              maxLength={2000}
              className="flex-1 rounded-xl border border-line bg-char px-4 py-3 text-[15px] text-cream outline-none transition-colors placeholder:text-cream-dim/50 focus:border-paprika"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-paprika text-cream transition-colors hover:bg-paprika-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendHorizonal size={18} />
            </button>
          </form>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-cream-dim/60">
        Concept project by Sam Madni · menu lives in data/menu.json
      </footer>
    </main>
  )
}
