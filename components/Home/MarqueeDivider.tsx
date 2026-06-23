const ITEMS = [
  "La Fée de la Perfection",
  "Skincare Visage",
  "Rituels Corps & Bain",
  "Coffrets Exclusifs",
  "Coffrets Exclusifs",
]

const SEPARATOR = " ✦ "

export default function MarqueeDivider() {
  const text = ITEMS.join(SEPARATOR) + SEPARATOR

  return (
    <div className="w-full overflow-hidden border-y border-ebene bg-or py-3" aria-hidden="true">
      <div className="flex whitespace-nowrap">
        <span className="animate-marquee inline-block font-sans text-sm font-medium uppercase tracking-[0.2em] text-ebene">
          {text.repeat(4)}
        </span>
        <span className="animate-marquee inline-block font-sans text-sm font-medium uppercase tracking-[0.2em] text-ebene" aria-hidden="true">
          {text.repeat(4)}
        </span>
      </div>
    </div>
  )
}
