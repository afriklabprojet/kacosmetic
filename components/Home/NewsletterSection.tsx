export default function NewsletterSection() {
  return (
    <section className="fade-in-section relative overflow-hidden bg-creme border-y border-or/20">
      {/* Ligne décorative animée en haut */}
      <div className="absolute top-0 left-0 right-0 h-[2px] newsletter-shimmer" aria-hidden="true" />

      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-col items-center gap-6 py-10 md:flex-row md:items-center md:gap-12 md:py-8">

          {/* Gauche — identité */}
          <div className="flex flex-shrink-0 items-center gap-4 md:gap-6">
            <span
              className="select-none text-2xl text-or newsletter-pulse"
              aria-hidden="true"
            >
              ✦
            </span>
            <div className="h-10 w-px bg-or/25 hidden md:block" aria-hidden="true" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-or">
                Newsletter exclusive
              </p>
              <h2 className="font-display text-xl font-light text-ebene leading-tight">
                Rejoignez le Cercle
              </h2>
            </div>
          </div>

          {/* Milieu — texte (desktop uniquement) */}
          <p className="hidden flex-1 text-sm font-light text-taupe md:block md:border-l md:border-or/20 md:pl-8">
            Rituels inédits, offres privées et avant-premières réservées aux membres.
          </p>

          {/* Droite — formulaire */}
          <form
            action="/api/newsletter"
            method="POST"
            className="newsletter-form relative flex w-full max-w-sm flex-shrink-0 items-center gap-0 rounded-full border border-or/30 bg-white shadow-sm transition-shadow focus-within:border-or focus-within:shadow-[0_0_0_3px_rgba(201,162,39,0.12)] md:w-auto"
          >
            <input
              type="email"
              name="email"
              placeholder="Votre adresse email"
              required
              aria-label="Email pour la newsletter"
              className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-ebene placeholder:text-taupe/50 outline-none"
            />
            <button
              type="submit"
              aria-label="S'abonner"
              className="m-1 flex h-11 items-center gap-2 rounded-full bg-or px-4 text-[11px] font-semibold uppercase tracking-wider text-ebene transition-all hover:bg-brun hover:text-white active:scale-95 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brun focus-visible:ring-offset-1"
            >
              S&apos;abonner
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

        </div>
      </div>

      {/* Ligne décorative en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] newsletter-shimmer" style={{ animationDelay: "1.4s" }} aria-hidden="true" />
    </section>
  )
}
