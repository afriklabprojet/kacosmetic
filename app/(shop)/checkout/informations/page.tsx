"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Stepper from "@/components/Checkout/Stepper"

interface CartItem {
  variantId: string
  quantity: number
  price: number
  name: string
}

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  commune: string
  address: string
  notes: string
}

const INITIAL_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  commune: "",
  address: "",
  notes: "",
}

function formatPrice(n: number) {
  return n.toLocaleString("fr-CI") + " FCFA"
}

export default function CheckoutInformationsPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [items, setItems] = useState<CartItem[]>([])
  const [errors, setErrors] = useState<Partial<FormState>>({})

  useEffect(() => {
    const raw: Record<string, number> = JSON.parse(localStorage.getItem("ka_cart") ?? "{}")
    const entries = Object.entries(raw)
    if (!entries.length) { router.replace("/panier"); return }

    async function fetchItems() {
      const params = new URLSearchParams(
        entries.map(([id, qty]) => ["ids", `${id}:${qty}`])
      )
      const res = await fetch(`/api/cart?${params}`)
      if (res.ok) {
        const data = await res.json() as { items: CartItem[] }
        setItems(data.items)
      }
    }
    void fetchItems()

    const saved = sessionStorage.getItem("ka_checkout_info")
    if (saved) setForm(JSON.parse(saved) as FormState)
  }, [router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function validate(): boolean {
    const next: Partial<FormState> = {}
    if (!form.firstName.trim()) next.firstName = "Prénom requis"
    if (!form.lastName.trim()) next.lastName = "Nom requis"
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Email valide requis"
    if (!form.phone.trim() || !/^[0-9+\s]{8,15}$/.test(form.phone))
      next.phone = "Numéro de téléphone valide requis"
    if (!form.commune.trim()) next.commune = "Commune requise"
    if (!form.address.trim()) next.address = "Adresse requise"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    sessionStorage.setItem("ka_checkout_info", JSON.stringify(form))
    router.push("/checkout/livraison")
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <Stepper currentStep={1} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <h2 className="font-display text-xl font-semibold text-ebene">Vos informations</h2>

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
            <label className="block mb-1 text-sm font-medium text-ebene">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:border-or ${errors.email ? "border-erreur" : "border-or-light"}`}
            />
            {errors.email && <p className="mt-1 text-xs text-erreur">{errors.email}</p>}
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
            <label className="block mb-1 text-sm font-medium text-ebene">Commune *</label>
            <input
              name="commune"
              value={form.commune}
              onChange={handleChange}
              placeholder="ex: Cocody, Plateau, Yopougon..."
              className={`w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:border-or ${errors.commune ? "border-erreur" : "border-or-light"}`}
            />
            {errors.commune && <p className="mt-1 text-xs text-erreur">{errors.commune}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-ebene">Adresse *</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Rue, quartier, repère..."
              className={`w-full rounded-sm border px-3 py-2 text-sm focus:outline-none focus:border-or ${errors.address ? "border-erreur" : "border-or-light"}`}
            />
            {errors.address && <p className="mt-1 text-xs text-erreur">{errors.address}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-ebene">
              Instructions de livraison <span className="text-taupe font-normal">(optionnel)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-sm border border-or-light px-3 py-2 text-sm focus:outline-none focus:border-or resize-none"
              placeholder="Code de portail, numéro d'appartement..."
            />
          </div>

          <button type="submit" className="btn-primary w-full py-3">
            Continuer vers la livraison
          </button>
        </form>

        {/* Résumé commande */}
        <div className="rounded-md border border-or-light bg-ivoire p-5 h-fit">
          <h3 className="font-display mb-3 text-base font-semibold text-ebene">Récapitulatif</h3>
          <ul className="space-y-2 text-sm text-taupe">
            {items.map((item) => (
              <li key={item.variantId} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-or-light pt-3 flex justify-between font-semibold text-ebene">
            <span>Sous-total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
