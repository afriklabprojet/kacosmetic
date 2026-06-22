import type { Metadata } from "next"
import Link from "next/link"
import ContactForm from "./ContactForm"
import { WHATSAPP_URL } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Contact — Ka Cosmetic",
  description: "Contactez l'équipe Ka Cosmetic. Service client disponible 7j/7 sur WhatsApp, email et formulaire de contact.",
}

export default function ContactPage() {
  return (
    <div className="bg-ivoire">

      {/* Header */}
      <div className="border-b border-or/20 bg-creme px-4 py-16 pt-28 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <nav className="mb-4 flex items-center gap-2 text-xs text-taupe" aria-label="Fil d'ariane">
            <Link href="/" className="hover:text-or transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-ebene">Contact</span>
          </nav>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.28em] text-or">Assistance</p>
          <h1 className="font-display text-4xl font-light text-ebene md:text-5xl">Nous contacter</h1>
          <p className="mt-3 max-w-lg text-sm font-light text-taupe">
            Notre équipe est disponible du lundi au samedi de 8h à 20h, et le dimanche de 10h à 18h.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">

          {/* Coordonnées */}
          <div>
            <h2 className="mb-8 font-display text-2xl text-ebene">Nos canaux de contact</h2>

            <div className="flex flex-col gap-4">
              {/* WhatsApp */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-2xl border border-or/20 bg-white p-5 transition-all hover:border-or/50 hover:shadow-[0_4px_20px_rgba(201,162,39,0.12)]"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-creme text-brun transition-colors group-hover:bg-or group-hover:text-ebene">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-or mb-1">WhatsApp</p>
                  <p className="font-display text-base text-ebene">+225 00 00 000 000</p>
                  <p className="text-xs text-taupe">Réponse en moins d&apos;une heure</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto self-center text-or/40 transition-transform group-hover:translate-x-1 group-hover:text-or" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>

              {/* Email */}
              <a
                href="mailto:contact@kacosmetic.ci"
                className="group flex items-start gap-4 rounded-2xl border border-or/20 bg-white p-5 transition-all hover:border-or/50 hover:shadow-[0_4px_20px_rgba(201,162,39,0.12)]"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-creme text-brun transition-colors group-hover:bg-or group-hover:text-ebene">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-or mb-1">Email</p>
                  <p className="font-display text-base text-ebene">contact@kacosmetic.ci</p>
                  <p className="text-xs text-taupe">Réponse sous 24h ouvrées</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto self-center text-or/40 transition-transform group-hover:translate-x-1 group-hover:text-or" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/kacosmetic"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-2xl border border-or/20 bg-white p-5 transition-all hover:border-or/50 hover:shadow-[0_4px_20px_rgba(201,162,39,0.12)]"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-creme text-brun transition-colors group-hover:bg-or group-hover:text-ebene">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-or mb-1">Instagram</p>
                  <p className="font-display text-base text-ebene">@kacosmetic</p>
                  <p className="text-xs text-taupe">Messages privés ouverts</p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto self-center text-or/40 transition-transform group-hover:translate-x-1 group-hover:text-or" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Horaires */}
            <div className="mt-8 rounded-2xl bg-creme border border-or/20 p-6">
              <h3 className="mb-4 font-display text-lg text-ebene">Horaires du service client</h3>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { jours: "Lundi — Vendredi", heures: "8h00 – 20h00" },
                  { jours: "Samedi", heures: "9h00 – 18h00" },
                  { jours: "Dimanche", heures: "10h00 – 16h00" },
                ].map((h) => (
                  <div key={h.jours} className="flex items-center justify-between">
                    <span className="text-taupe">{h.jours}</span>
                    <span className="font-medium text-ebene">{h.heures}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire client */}
          <div>
            <h2 className="mb-8 font-display text-2xl text-ebene">Formulaire de contact</h2>
            <ContactForm />
          </div>

        </div>
      </div>
    </div>
  )
}
