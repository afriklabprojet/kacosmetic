"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

const FOOTER_LINKS = {
  maison: [
    { label: "Notre Histoire",        href: "/a-propos" },
    { label: "Philosophie Botanique", href: "/a-propos#philosophie" },
    { label: "Engagements",           href: "/a-propos#engagements" },
  ],
  aide: [
    { label: "Livraison & délais",  href: "/livraison" },
    { label: "Retours & échanges", href: "/retours" },
    { label: "FAQ",                href: "/faq" },
    { label: "Contact",            href: "/contact" },
  ],
  boutique: [
    { label: "Soins Visage", href: "/catalogue/soins-visage" },
    { label: "Corps & Bain", href: "/catalogue/corps-bain" },
    { label: "Maquillage",   href: "/catalogue/maquillage" },
    { label: "Coffrets",     href: "/catalogue/coffrets" },
  ],
}

const PAYMENT_METHODS = [
  { src: "/payment/orange-money.svg", alt: "Orange Money" },
  { src: "/payment/mtn-money.svg",    alt: "MTN Money" },
  { src: "/payment/wave.svg",         alt: "Wave" },
  { src: "/payment/moov-money.svg",   alt: "Moov Money" },
  { src: "/payment/djamo.svg",        alt: "Djamo" },
]

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/kacosmetic.ci",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@kacosmetic.ci",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/2250000000000",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
]

export default function Footer() {
  const [email, setEmail]     = useState("")
  const [status, setStatus]   = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault()
    if (status === "loading") return
    setStatus("loading")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus("success")
        setMessage("Bienvenue dans le Cercle ✨")
        setEmail("")
      } else {
        setStatus("error")
        setMessage("Une erreur est survenue. Réessayez.")
      }
    } catch {
      setStatus("error")
      setMessage("Une erreur est survenue. Réessayez.")
    }
  }

  return (
    <footer className="border-t-2 border-or bg-ivoire pb-8 pt-20 px-4 md:px-8">
      <div className="mx-auto max-w-[1400px]">

        {/* Grille principale */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 mb-16">

          {/* Marque + newsletter + socials */}
          <div className="lg:col-span-5">
            <Link href="/" aria-label="Ka Cosmetic — Accueil">
              <Image
                src="/logo.png"
                alt="Ka Cosmetic"
                width={110}
                height={124}
                className="mb-4"
                style={{ width: "110px", height: "auto" }}
              />
            </Link>

            <p className="text-sm text-ebene/70 mb-6 leading-relaxed max-w-xs">
              Offres privées & rituels exclusifs.
            </p>

            {/* Newsletter */}
            {status === "success" ? (
              <p className="text-sm text-or font-medium py-3">{message}</p>
            ) : (
              <form className="relative group" onSubmit={handleNewsletter} noValidate>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="w-full border-b border-ebene/20 bg-transparent py-3 pr-12 text-sm text-ebene placeholder:text-ebene/40 outline-none transition-colors focus:border-or"
                  required
                  aria-label="Email pour la newsletter"
                  disabled={status === "loading"}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer text-ebene transition-colors hover:text-or disabled:opacity-40"
                  aria-label="S'abonner"
                >
                  {status === "loading" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="animate-spin">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
                {status === "error" && (
                  <p className="mt-2 text-xs text-erreur">{message}</p>
                )}
              </form>
            )}

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-4 mt-6">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="cursor-pointer text-ebene/50 transition-colors hover:text-or"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Colonnes de liens */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">

            {/* La Maison */}
            <div>
              <h4 className="mb-5 text-[11px] font-medium uppercase tracking-[0.28em] text-ebene/50">
                La Maison
              </h4>
              <ul className="flex flex-col gap-4">
                {FOOTER_LINKS.maison.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ebene font-light transition-colors hover:text-brun">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Assistance */}
            <div>
              <h4 className="mb-5 text-[11px] font-medium uppercase tracking-[0.28em] text-ebene/50">
                Assistance
              </h4>
              <ul className="flex flex-col gap-4">
                {FOOTER_LINKS.aide.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ebene font-light transition-colors hover:text-brun">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Boutique */}
            <div>
              <h4 className="mb-5 text-[11px] font-medium uppercase tracking-[0.28em] text-ebene/50">
                Boutique
              </h4>
              <ul className="flex flex-col gap-4">
                {FOOTER_LINKS.boutique.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-ebene font-light transition-colors hover:text-brun">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Réassurance paiement */}
        <div className="mb-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <span className="text-[10px] uppercase tracking-widest text-ebene/40 shrink-0">
            Paiements acceptés
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            {PAYMENT_METHODS.map((p) => (
              <div
                key={p.alt}
                className="flex h-7 items-center rounded border border-ebene/10 bg-white px-2"
              >
                <Image src={p.src} alt={p.alt} width={40} height={24} className="h-4 w-auto object-contain" />
              </div>
            ))}
          </div>
        </div>

        {/* Règle gold */}
        <div className="w-full border-t-2 border-or mb-6" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row font-sans text-[10px] uppercase tracking-widest text-ebene/55">
          <p>© {new Date().getFullYear()} Ka Cosmetic — Tous droits réservés · Abidjan, Côte d&apos;Ivoire</p>
          <div className="flex gap-5">
            <Link href="/mentions-legales" className="transition-colors hover:text-ebene">Mentions légales</Link>
            <Link href="/confidentialite"  className="transition-colors hover:text-ebene">Confidentialité</Link>
            <Link href="/cgv"              className="transition-colors hover:text-ebene">CGV</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
