"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle, Loader } from "lucide-react"

interface FormState {
  prenom: string
  nom: string
  email: string
  sujet: string
  message: string
}

const INITIAL: FormState = { prenom: "", nom: "", email: "", sujet: "", message: "" }

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.prenom.trim()} ${form.nom.trim()}`.trim(),
          email: form.email.trim(),
          subject: form.sujet,
          message: form.message.trim(),
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setForm(INITIAL)
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? "Une erreur est survenue. Réessayez.")
      }
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-or/20 bg-white px-8 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle size={28} className="text-green-600" />
        </div>
        <h3 className="font-display text-xl text-ebene">Message envoyé !</h3>
        <p className="mt-2 text-sm text-taupe">
          Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm font-medium text-brun underline-offset-2 hover:underline"
        >
          Envoyer un autre message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="prenom" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-taupe">
            Prénom <span className="text-erreur">*</span>
          </label>
          <input
            id="prenom"
            value={form.prenom}
            onChange={set("prenom")}
            required
            maxLength={50}
            className="w-full rounded-xl border border-or/25 bg-white px-4 py-3 text-sm text-ebene placeholder:text-taupe/50 outline-none transition-colors focus:border-or"
            placeholder="Votre prénom"
          />
        </div>
        <div>
          <label htmlFor="nom" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-taupe">
            Nom <span className="text-erreur">*</span>
          </label>
          <input
            id="nom"
            value={form.nom}
            onChange={set("nom")}
            required
            maxLength={50}
            className="w-full rounded-xl border border-or/25 bg-white px-4 py-3 text-sm text-ebene placeholder:text-taupe/50 outline-none transition-colors focus:border-or"
            placeholder="Votre nom"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-taupe">
          Email <span className="text-erreur">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={set("email")}
          required
          maxLength={255}
          className="w-full rounded-xl border border-or/25 bg-white px-4 py-3 text-sm text-ebene placeholder:text-taupe/50 outline-none transition-colors focus:border-or"
          placeholder="votre@email.com"
        />
      </div>

      <div>
        <label htmlFor="sujet" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-taupe">
          Sujet <span className="text-erreur">*</span>
        </label>
        <select
          id="sujet"
          value={form.sujet}
          onChange={set("sujet")}
          required
          className="w-full rounded-xl border border-or/25 bg-white px-4 py-3 text-sm text-ebene outline-none transition-colors focus:border-or"
        >
          <option value="">Sélectionnez un sujet</option>
          <option value="Ma commande">Ma commande</option>
          <option value="Question produit">Question produit</option>
          <option value="Livraison">Livraison</option>
          <option value="Retour / Échange">Retour / Échange</option>
          <option value="Partenariat / B2B">Partenariat / B2B</option>
          <option value="Autre">Autre</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-taupe">
          Message <span className="text-erreur">*</span>
        </label>
        <textarea
          id="message"
          value={form.message}
          onChange={set("message")}
          rows={5}
          required
          maxLength={3000}
          className="w-full resize-none rounded-xl border border-or/25 bg-white px-4 py-3 text-sm text-ebene placeholder:text-taupe/50 outline-none transition-colors focus:border-or"
          placeholder="Décrivez votre demande..."
        />
      </div>

      {error && (
        <div className="rounded-xl border border-erreur/30 bg-erreur/5 px-4 py-3 text-sm text-erreur">
          {error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
        {submitting ? (
          <>
            <Loader size={16} className="animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>
            Envoyer le message
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </>
        )}
      </button>

      <p className="text-center text-xs text-taupe/60">
        Vos données sont traitées conformément à notre{" "}
        <Link href="/confidentialite" className="underline hover:text-brun">politique de confidentialité</Link>.
      </p>
    </form>
  )
}
