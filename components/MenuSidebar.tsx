import { Leaf, Flame } from 'lucide-react'
import { menu } from '@/lib/prompt'

export default function MenuSidebar() {
  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <div className="border-b border-stone-100 px-5 py-4 dark:border-stone-800">
        <h2 className="font-semibold text-stone-900 dark:text-stone-100">{menu.restaurant}</h2>
        <p className="text-xs text-stone-500">{menu.tagline}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {menu.categories.map((cat) => (
          <section key={cat.name} className="mb-6 last:mb-0">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              {cat.name}
            </h3>
            <ul className="space-y-2.5">
              {cat.items.map((item) => (
                <li key={item.name} className="text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-medium text-stone-800 dark:text-stone-200">
                      {item.name}
                      {item.tags.includes('vegan') && (
                        <Leaf size={12} className="shrink-0 text-emerald-600" aria-label="vegan" />
                      )}
                      {item.tags.includes('spicy') && (
                        <Flame size={12} className="shrink-0 text-orange-500" aria-label="spicy" />
                      )}
                    </span>
                    <span className="shrink-0 tabular-nums text-stone-500">£{item.price.toFixed(2)}</span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{item.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="border-t border-stone-100 px-5 py-2.5 text-[11px] text-stone-400 dark:border-stone-800">
        Menu is a JSON file — swap in any restaurant&apos;s menu in minutes.
      </p>
    </aside>
  )
}
