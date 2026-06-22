"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

export default function DeleteAddressButton({ addressId }: { addressId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Supprimer cette adresse ?")) return
    setLoading(true)
    try {
      const res = await fetch(`/api/account/addresses?id=${addressId}`, { method: "DELETE" })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1 text-xs text-red-400 transition-colors hover:text-red-600 disabled:opacity-50"
      aria-label="Supprimer l'adresse"
    >
      <Trash2 size={13} />
      Supprimer
    </button>
  )
}
