import { Leaf, Flame } from 'lucide-react'
import { menu } from '@/lib/prompt'

export default function MenuSidebar() {
  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-char-2">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-display text-xl font-bold tracking-tight text-cream">{menu.restaurant}</h2>
        <p className="text-xs uppercase tracking-[0.2em] text-paprika">{menu.tagline}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {menu.categories.map((cat) => (
          <section key={cat.name} className="mb-6 last:mb-0">
            <h3 className="mb-2.5 font-display text-xs font-semibold uppercase tracking-wider text-gold">
              {cat.name}
            </h3>
            <ul className="space-y-3">
              {cat.items.map((item) => (
                <li key={item.name} className="text-sm">
                  <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-line pb-0.5">
                    <span className="flex items-center gap-1.5 font-medium text-cream">
                      {item.name}
                      {item.tags.includes('vegan') && (
                        <Leaf size={12} className="shrink-0 text-herb" aria-label="vegan" />
                      )}
                      {item.tags.includes('spicy') && (
                        <Flame size={12} className="shrink-0 text-paprika" aria-label="spicy" />
                      )}
                    </span>
                    <span className="shrink-0 font-display text-sm tabular-nums text-gold">
                      £{item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-cream-dim">{item.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="border-t border-line px-5 py-2.5 text-[11px] text-cream-dim/70">
        Menu is a JSON file — swap in any restaurant&apos;s menu in minutes.
      </p>
    </aside>
  )
}
