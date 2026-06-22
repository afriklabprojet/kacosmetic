"use client"

import { useRef, useState, useEffect } from "react"

interface RituelConfig {
  mediaType: "image" | "video"
  url: string
}

export default function SiteSettingsPage() {
  const [current, setCurrent] = useState<RituelConfig | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/admin/site-settings")
      .then((r) => r.json())
      .then((data: RituelConfig) => setCurrent(data))
      .catch(() => {})
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setPreviewType(file.type.startsWith("video/") ? "video" : "image")
    setStatus("idle")
    setErrorMsg("")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setStatus("uploading")
    setErrorMsg("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? "Erreur inconnue")
        setStatus("error")
        return
      }

      setCurrent(data as RituelConfig)
      setPreviewUrl(null)
      setPreviewType(null)
      if (fileRef.current) fileRef.current.value = ""
      setStatus("success")
    } catch {
      setErrorMsg("Erreur réseau. Veuillez réessayer.")
      setStatus("error")
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-[#1A0A00] md:text-3xl">
          Paramètres du site
        </h1>
        <p className="mt-1 text-sm text-[#6B5744]">
          Section &laquo; Le Rituel de la Fée &raquo; — photo ou vidéo
        </p>
      </div>

      {/* Media actuel */}
      {current && (
        <div className="mb-8 overflow-hidden rounded-lg border border-[#E5D5C5] bg-white shadow-sm">
          <div className="border-b border-[#E5D5C5] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B5744]">
              Média actuel —{" "}
              <span className="text-[#C9A84C]">
                {current.mediaType === "video" ? "Vidéo" : "Photo"}
              </span>
            </p>
          </div>
          <div className="relative aspect-video w-full bg-[#F5EFE6]">
            {current.mediaType === "video" ? (
              <video
                src={current.url}
                className="h-full w-full object-cover"
                muted
                playsInline
                controls
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.url}
                alt="Média actuel section Rituel"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>
      )}

      {/* Formulaire upload */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-lg border border-[#E5D5C5] bg-white shadow-sm"
      >
        <div className="border-b border-[#E5D5C5] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B5744]">
            Remplacer le média
          </p>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <label
              htmlFor="rituel-file"
              className="mb-1.5 block text-sm font-medium text-[#1A0A00]"
            >
              Choisir une photo ou une vidéo
            </label>
            <input
              id="rituel-file"
              ref={fileRef}
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
              onChange={handleFileChange}
              className="block w-full rounded border border-[#E5D5C5] bg-[#FAF6F1] px-3 py-2 text-sm text-[#1A0A00] file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-[#C9A84C] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#1A0A00] hover:file:bg-[#b8932a]"
            />
            <p className="mt-1 text-xs text-[#6B5744]">
              Photo : JPEG, PNG, WebP — max 5 Mo · Vidéo : MP4, WebM, MOV — max 50 Mo
            </p>
          </div>

          {/* Prévisualisation */}
          {previewUrl && previewType && (
            <div className="overflow-hidden rounded border border-[#E5D5C5]">
              <p className="border-b border-[#E5D5C5] bg-[#FAF6F1] px-3 py-1.5 text-xs font-medium text-[#6B5744]">
                Aperçu
              </p>
              <div className="relative aspect-video w-full bg-[#F5EFE6]">
                {previewType === "video" ? (
                  <video
                    src={previewUrl}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    controls
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Aperçu"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
          )}

          {status === "error" && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMsg}
            </p>
          )}

          {status === "success" && (
            <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">
              Média mis à jour avec succès.
            </p>
          )}
        </div>

        <div className="border-t border-[#E5D5C5] px-4 py-3">
          <button
            type="submit"
            disabled={status === "uploading" || !previewUrl}
            className="rounded bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1A0A00] transition-colors hover:bg-[#b8932a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "uploading" ? "Upload en cours…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  )
}
