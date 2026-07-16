# Ask the menu anything — restaurant menu chatbot

A chatbot for a restaurant menu: "What's vegan?", "What's under £8?", "I have a nut allergy — what should I avoid?". The menu lives in a single JSON file, so any cafe or restaurant could plug in their own in minutes.

Built from real hospitality experience — I've worked in cafes and restaurants, and these are the questions customers actually ask.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · Claude API (`@anthropic-ai/sdk`, streaming) · Lucide

## What it shows

| Skill | Where |
|-------|-------|
| Context injection | `lib/prompt.ts` — the menu JSON is injected into the system prompt with strict no-hallucination rules (never invent items or prices, flag allergens, suggest staff confirmation) |
| Streaming chat | `app/api/chat/route.ts` — multi-turn history validated server-side, response streamed chunk-by-chunk into the open chat bubble |
| Data-driven design | `data/menu.json` — restaurant, categories, prices, allergens, tags; the sidebar and the AI both read from the same file |
| Chat UX | Suggested-question chips, auto-scroll, streaming bubbles, error recovery that removes the empty bubble on failure |
| Domain knowledge | Allergen handling treated as a safety issue, not just a filter |

## Run it

```bash
npm install
cp .env.local.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev                        # http://localhost:3000
```

Swap in your own menu: edit `data/menu.json` — nothing else changes.

## Deploy (Vercel)

Import the repo at [vercel.com](https://vercel.com) and set `ANTHROPIC_API_KEY` in the project's environment variables.

## Resume bullets

- Built a streaming restaurant-menu chatbot in Next.js 16 + TypeScript that
  injects a JSON menu into the Claude system prompt with strict grounding rules,
  so answers about prices, vegan options and allergens never leave the data
- Designed the menu as a plug-and-play JSON file (categories, allergens, tags)
  powering both the sidebar UI and the AI context from one source of truth

---

Concept project — designed & built by Saiyed (Sam) Madni, drawing on real cafe and restaurant experience.
