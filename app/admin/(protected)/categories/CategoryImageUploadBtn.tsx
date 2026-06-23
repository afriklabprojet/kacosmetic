"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  categoryId: string
  categoryName: string
  currentImageUrl: string | null
}

export default function CategoryImageUploadBtn({ categoryId, categoryName, currentImageUrl }: Readonly<Props>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle")
  const [preview, setPreview] = useState<string | null>(null)
  const router = useRouter()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    void uploadFile(file)
  }

  async function uploadFile(file: File) {
    setStatus("uploading")
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}/image`, { method: "POST", body: fd })
      if (res.ok) {
        router.refresh()
        setStatus("idle")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  const displayUrl = preview ?? currentImageUrl

  return (
    <div className="group relative flex h-10 w-16 items-center">
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayUrl}
          alt={categoryName}
          className="h-10 w-16 rounded object-cover"
        />
      ) : (
        <div className="flex h-10 w-16 items-center justify-center rounded border border-dashed border-or-light bg-ivoire">
          <span className="text-[9px] text-taupe/50">Aucune</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-wait"
        title="Changer l'image"
      >
        {status === "uploading" ? (
          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        )}
      </button>

      {status === "error" && (
        <span className="absolute -bottom-4 left-0 text-[10px] text-red-500">Erreur</span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
