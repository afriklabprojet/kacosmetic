import { Star } from "lucide-react"

const REVIEWS = [
  {
    id: 1,
    name: "Aminata K.",
    location: "Cocody, Abidjan",
    rating: 5,
    text: "La crème éclat a totalement transformé mon teint en 2 semaines. Mon visage est lumineux comme jamais. Je recommande à toutes mes amies !",
    product: "Crème Éclat Botanique",
    date: "Juin 2026",
    initials: "AK",
  },
  {
    id: 2,
    name: "Fatou D.",
    location: "Plateau, Abidjan",
    rating: 5,
    text: "J'utilise Ka Cosmetic depuis 6 mois. La livraison est toujours rapide, les produits sont authentiques et l'emballage est luxueux. Je suis une cliente fidèle.",
    product: "Sérum Vitamine C",
    date: "Mai 2026",
    initials: "FD",
  },
  {
    id: 3,
    name: "Mariame T.",
    location: "Yopougon, Abidjan",
    rating: 5,
    text: "Enfin des produits pensés pour nos peaux noires ! Résultats visibles dès la première semaine. Le service client est exceptionnel.",
    product: "Huile Corps Karité",
    date: "Juin 2026",
    initials: "MT",
  },
  {
    id: 4,
    name: "Kadiatou B.",
    location: "Marcory, Abidjan",
    rating: 5,
    text: "Le coffret cadeau que j'ai offert à ma mère était magnifiquement emballé. Elle a adoré chaque produit. Ka Cosmetic c'est du luxe accessible !",
    product: "Coffret Prestige",
    date: "Mai 2026",
    initials: "KB",
  },
]

function StarRating({ rating }: Readonly<{ rating: number }>) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "fill-or text-or" : "fill-transparent text-taupe"}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }: Readonly<{ review: typeof REVIEWS[number] }>) {
  return (
    <article className="flex w-[80vw] flex-shrink-0 snap-center flex-col gap-4 rounded-2xl border border-or/10 bg-white p-6 shadow-sm sm:w-[60vw] md:w-auto md:flex-shrink">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-or/10 text-xs font-semibold text-or">
            {review.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-ebene">{review.name}</p>
            <p className="text-[10px] text-taupe">{review.location}</p>
          </div>
        </div>
      </div>

      <StarRating rating={review.rating} />

      <blockquote className="flex-1 text-sm leading-relaxed text-taupe">
        &ldquo;{review.text}&rdquo;
      </blockquote>

      <div className="border-t border-or/10 pt-3">
        <p className="text-[11px] font-medium text-or">{review.product}</p>
        <p className="text-[10px] text-taupe">{review.date}</p>
      </div>
    </article>
  )
}

export default function TestimonialsSection() {
  return (
    <section className="fade-in-section bg-ivoire py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1400px]">

        {/* En-tête */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 px-4 md:flex-row md:items-end md:px-0">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">
              Témoignages
            </p>
            <h2 className="font-display text-3xl font-light text-ebene md:text-5xl">
              Elles nous font<br />
              <em className="text-brun not-italic">confiance</em>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-display text-3xl text-or">4.9</p>
              <div className="mt-1 flex justify-end">
                <StarRating rating={5} />
              </div>
              <p className="mt-0.5 text-xs text-taupe">+2 400 avis</p>
            </div>
          </div>
        </div>

        {/* Mobile : carousel horizontal / Desktop : grille */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4 no-scrollbar md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0">
          {REVIEWS.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Indicateur de pagination mobile */}
        <div className="mt-4 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
          {REVIEWS.map((_, i) => (
            <span key={i} className={`block h-1 rounded-full bg-or/30 ${i === 0 ? "w-4 bg-or" : "w-1.5"}`} />
          ))}
        </div>

      </div>
    </section>
  )
}
