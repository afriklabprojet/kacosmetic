"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

interface FormState {
  label: string
  firstName: string
  lastName: string
  phone: string
  street: string
  neighborhood: string
  commune: string
  city: string
  instructions: string
  isDefault: boolean
}

const INITIAL: FormState = {
  label: "",
  firstName: "",
  lastName: "",
  phone: "",
  street: "",
  neighborhood: "",
  commune: "",
  city: "Abidjan",
  instructions: "",
  isDefault: false,
}

interface AddressData extends FormState {
  id: string
}

export default function NouvelleAdressePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-20 text-center text-taupe">Chargement…</div>}>
      <NouvelleAdresseForm />
    </Suspense>
  )
}

function NouvelleAdresseForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")
  const isEdit = Boolean(editId)

  const [form, setForm] = useState<FormState>(INITIAL)
  const [loading, setLoading] = useState(isEdit)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (!editId) return
    fetch(`/api/account/addresses?id=${editId}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data: { address: AddressData } | null) => {
        if (data?.address) {
          const { id: _id, ...fields } = data.address
          setForm({ ...INITIAL, ...fields })
        }
      })
      .catch(() => {/* silently ignore, user sees empty form */})
      .finally(() => setLoading(false))
  }, [editId])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.firstName.trim()) next.firstName = "Prénom requis"
    if (!form.lastName.trim()) next.lastName = "Nom requis"
    if (!form.phone.trim()) next.phone = "Téléphone requis"
    if (!form.street.trim()) next.street = "Rue requise"
    if (!form.commune.trim()) next.commune = "Commune requise"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setServerError(null)
    try {
      const res = await fetch("/api/account/addresses", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editId, ...form } : form),
      })
      if (res.ok) {
        router.push("/compte/adresses")
      } else {
        const data = await res.json() as { error?: string }
        setServerError(data.error ?? "Erreur lors de la sauvegarde.")
      }
    } catch {
      setServerError("Erreur réseau. Réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-taupe">
        Chargement…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/compte/adresses" className="text-sm text-or hover:underline">
          ← Mes adresses
        </Link>
        <h1 className="font-display text-2xl font-semibold text-ebene">
          {isEdit ? "Modifier l'adresse" : "Nouvelle adresse"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 text-sm font-medium text-ebene">
            Libellé <span className="text-taupe font-normal">(optionnel)</span>
          </label>
          <input
            name="label"
            value={form.label}
            onChange={handleChange}
            placeholder="ex: Maison, Bureau..."
            className="w-full rounded-sm border border-or-light px-3 py-2 text-sm text-ebene placeholder:text-taupe/50 focus:border-or focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-ebene">Prénom *</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className={`w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:border-or ${errors.firstName ? "border-erreur" : "border-or-light"}`}
            />
            {errors.firstName && <p className="mt-1 text-xs text-erreur">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-ebene">Nom *</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className={`w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:border-or ${errors.lastName ? "border-erreur" : "border-or-light"}`}
            />
            {errors.lastName && <p className="mt-1 text-xs text-erreur">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-ebene">Téléphone *</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="07 00 00 00 00"
            className={`w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:border-or ${errors.phone ? "border-erreur" : "border-or-light"}`}
          />
          {errors.phone && <p className="mt-1 text-xs text-erreur">{errors.phone}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-ebene">Rue / Numéro *</label>
          <input
            name="street"
            value={form.street}
            onChange={handleChange}
            placeholder="ex: Rue des Jardins, villa 12"
            className={`w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:border-or ${errors.street ? "border-erreur" : "border-or-light"}`}
          />
          {errors.street && <p className="mt-1 text-xs text-erreur">{errors.street}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-ebene">Quartier</label>
          <input
            name="neighborhood"
            value={form.neighborhood}
            onChange={handleChange}
            placeholder="ex: Cocody Danga"
            className="w-full rounded-sm border border-or-light px-3 py-2 text-sm text-ebene placeholder:text-taupe/50 focus:border-or focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-ebene">Commune *</label>
            <input
              name="commune"
              value={form.commune}
              onChange={handleChange}
              placeholder="ex: Cocody"
              className={`w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:border-or ${errors.commune ? "border-erreur" : "border-or-light"}`}
            />
            {errors.commune && <p className="mt-1 text-xs text-erreur">{errors.commune}</p>}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-ebene">Ville</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-sm border border-or-light px-3 py-2 text-sm text-ebene focus:border-or focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-ebene">
            Instructions <span className="text-taupe font-normal">(optionnel)</span>
          </label>
          <textarea
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            rows={2}
            placeholder="Code portail, numéro d'appartement..."
            className="w-full rounded-sm border border-or-light px-3 py-2 text-sm text-ebene placeholder:text-taupe/50 focus:border-or focus:outline-none resize-none"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="isDefault"
            checked={form.isDefault}
            onChange={handleChange}
            className="accent-or h-4 w-4"
          />
          <span className="text-sm text-ebene">Définir comme adresse par défaut</span>
        </label>

        {serverError && (
          <p className="text-sm text-erreur">{serverError}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/compte/adresses" className="btn-secondary flex-1 text-center py-3">
            Annuler
          </Link>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 py-3 disabled:opacity-60">
            {submitting ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Sauvegarder"}
          </button>
        </div>
      </form>
    </div>
  )
}
