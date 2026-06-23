"use client"

import { useRef, useState, useEffect, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface RituelConfig { mediaType: "image" | "video"; url: string }

interface Announcement { text: string; highlight?: string }
interface SocialLink    { label: string; href: string }
interface Testimonial   { id: number; name: string; location: string; rating: number; text: string; product: string; date: string; initials: string }
interface Engagement    { title: string; description: string }

interface TextSettings {
  announcements?: string
  marquee_items?: string
  social_links?: string
  testimonials?: string
  engagements?: string
  hero_tagline?: string
  hero_heading?: string
  hero_description?: string
  rituel_title?: string
  rituel_description?: string
  newsletter_description?: string
  brand_tagline?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children }: Readonly<{ title: string; subtitle?: string; children: React.ReactNode }>) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#E5D5C5] bg-white shadow-sm">
      <div className="border-b border-[#E5D5C5] bg-[#FAF6F1] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B5744]">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-[#6B5744]/70">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function SaveButton({ saving, saved }: Readonly<{ saving: boolean; saved: boolean }>) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="rounded bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1A0A00] transition-colors hover:bg-[#b8932a] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {saving ? "Enregistrement…" : saved ? "✓ Enregistré" : "Enregistrer"}
    </button>
  )
}

function inputCls(extra = "") {
  return `w-full rounded border border-[#E5D5C5] bg-[#FAF6F1] px-3 py-2 text-sm text-[#1A0A00] placeholder:text-[#6B5744]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 ${extra}`
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function RituelMediaSection() {
  const [current, setCurrent] = useState<RituelConfig | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/admin/site-settings")
      .then(r => r.json())
      .then((d: RituelConfig) => setCurrent(d))
      .catch(() => {})
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    setPreviewType(file.type.startsWith("video/") ? "video" : "image")
    setStatus("idle"); setErrorMsg("")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setStatus("uploading"); setErrorMsg("")
    const fd = new FormData(); fd.append("file", file)
    try {
      const res = await fetch("/api/admin/site-settings", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error ?? "Erreur inconnue"); setStatus("error"); return }
      setCurrent(data as RituelConfig)
      setPreviewUrl(null); setPreviewType(null)
      if (fileRef.current) fileRef.current.value = ""
      setStatus("success")
    } catch { setErrorMsg("Erreur réseau."); setStatus("error") }
  }

  return (
    <SectionCard title="Section Rituel — média" subtitle="Photo ou vidéo de fond">
      {current && (
        <div className="mb-4 overflow-hidden rounded border border-[#E5D5C5]">
          <div className="relative aspect-video w-full bg-[#F5EFE6]">
            {current.mediaType === "video"
              ? <video src={current.url} className="h-full w-full object-cover" muted playsInline controls />
              // eslint-disable-next-line @next/next/no-img-element
              : <img src={current.url} alt="Média actuel" className="h-full w-full object-cover" />}
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input id="rituel-file" ref={fileRef} type="file" name="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          onChange={handleFileChange}
          className="block w-full rounded border border-[#E5D5C5] bg-[#FAF6F1] px-3 py-2 text-sm text-[#1A0A00] file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-[#C9A84C] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#1A0A00] hover:file:bg-[#b8932a]"
        />
        {previewUrl && previewType && (
          <div className="overflow-hidden rounded border border-[#E5D5C5]">
            <div className="relative aspect-video w-full bg-[#F5EFE6]">
              {previewType === "video"
                ? <video src={previewUrl} className="h-full w-full object-cover" muted playsInline controls />
                // eslint-disable-next-line @next/next/no-img-element
                : <img src={previewUrl} alt="Aperçu" className="h-full w-full object-cover" />}
            </div>
          </div>
        )}
        {status === "error" && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{errorMsg}</p>}
        {status === "success" && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">Média mis à jour.</p>}
        <SaveButton saving={status === "uploading"} saved={status === "success"} />
      </form>
    </SectionCard>
  )
}

// ─── Generic text settings form ───────────────────────────────────────────────

function useTextSettings() {
  const [settings, setSettings] = useState<TextSettings>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/admin/site-settings/text")
      .then(r => r.json())
      .then((d: TextSettings) => { setSettings(d); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  return { settings, setSettings, loaded }
}

function useSave(settings: TextSettings, setSettings: React.Dispatch<React.SetStateAction<TextSettings>>) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = useCallback(async (patch: Partial<TextSettings>) => {
    setSaving(true); setSaved(false)
    try {
      const res = await fetch("/api/admin/site-settings/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (res.ok) {
        setSettings(prev => ({ ...prev, ...patch }))
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } finally { setSaving(false) }
  }, [setSettings])

  return { save, saving, saved }
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SiteSettingsPage() {
  const { settings, setSettings, loaded } = useTextSettings()
  const { save, saving, saved } = useSave(settings, setSettings)

  // local draft states per section
  const [ann, setAnn] = useState("")
  const [marquee, setMarquee] = useState("")
  const [socials, setSocials] = useState("")
  const [testimonials, setTestimonials] = useState("")
  const [engagements, setEngagements] = useState("")
  const [heroTagline, setHeroTagline] = useState("")
  const [heroHeading, setHeroHeading] = useState("")
  const [heroDesc, setHeroDesc] = useState("")
  const [rituelTitle, setRituelTitle] = useState("")
  const [rituelDesc, setRituelDesc] = useState("")
  const [newsletterDesc, setNewsletterDesc] = useState("")

  // Populate drafts once loaded
  useEffect(() => {
    if (!loaded) return
    setAnn(settings.announcements ?? "")
    setMarquee(settings.marquee_items ?? "")
    setSocials(settings.social_links ?? "")
    setTestimonials(settings.testimonials ?? "")
    setEngagements(settings.engagements ?? "")
    setHeroTagline(settings.hero_tagline ?? "")
    setHeroHeading(settings.hero_heading ?? "")
    setHeroDesc(settings.hero_description ?? "")
    setRituelTitle(settings.rituel_title ?? "")
    setRituelDesc(settings.rituel_description ?? "")
    setNewsletterDesc(settings.newsletter_description ?? "")
  }, [loaded, settings])

  // ── Announcement helpers
  function parseAnn(): Announcement[] {
    try { return JSON.parse(ann) as Announcement[] } catch { return [] }
  }
  function stringifyAnn(items: Announcement[]) { setAnn(JSON.stringify(items, null, 2)) }
  function addAnn() { stringifyAnn([...parseAnn(), { text: "", highlight: "" }]) }
  function removeAnn(i: number) { const a = parseAnn(); a.splice(i, 1); stringifyAnn(a) }
  function updateAnn(i: number, field: keyof Announcement, val: string) {
    const a = parseAnn(); a[i] = { ...a[i], [field]: val }; stringifyAnn(a)
  }

  // ── Marquee helpers
  function parseMarquee(): string[] {
    try { return JSON.parse(marquee) as string[] } catch { return [] }
  }
  function stringifyMarquee(items: string[]) { setMarquee(JSON.stringify(items, null, 2)) }
  function addMarqueeItem() { stringifyMarquee([...parseMarquee(), ""]) }
  function removeMarqueeItem(i: number) { const m = parseMarquee(); m.splice(i, 1); stringifyMarquee(m) }
  function updateMarqueeItem(i: number, val: string) { const m = parseMarquee(); m[i] = val; stringifyMarquee(m) }

  // ── Social helpers
  function parseSocials(): SocialLink[] {
    try { return JSON.parse(socials) as SocialLink[] } catch { return [] }
  }
  function stringifySocials(items: SocialLink[]) { setSocials(JSON.stringify(items, null, 2)) }
  function addSocial() { stringifySocials([...parseSocials(), { label: "", href: "" }]) }
  function removeSocial(i: number) { const s = parseSocials(); s.splice(i, 1); stringifySocials(s) }
  function updateSocial(i: number, field: keyof SocialLink, val: string) {
    const s = parseSocials(); s[i] = { ...s[i], [field]: val }; stringifySocials(s)
  }

  // ── Testimonial helpers
  function parseTestimonials(): Testimonial[] {
    try { return JSON.parse(testimonials) as Testimonial[] } catch { return [] }
  }
  function stringifyTestimonials(items: Testimonial[]) { setTestimonials(JSON.stringify(items, null, 2)) }
  function addTestimonial() {
    const items = parseTestimonials()
    stringifyTestimonials([...items, { id: Date.now(), name: "", location: "", rating: 5, text: "", product: "", date: "", initials: "" }])
  }
  function removeTestimonial(i: number) { const t = parseTestimonials(); t.splice(i, 1); stringifyTestimonials(t) }
  function updateTestimonial(i: number, field: keyof Testimonial, val: string | number) {
    const t = parseTestimonials(); t[i] = { ...t[i], [field]: val }; stringifyTestimonials(t)
  }

  // ── Engagement helpers
  function parseEngagements(): Engagement[] {
    try { return JSON.parse(engagements) as Engagement[] } catch { return [] }
  }
  function stringifyEngagements(items: Engagement[]) { setEngagements(JSON.stringify(items, null, 2)) }
  function addEngagement() { stringifyEngagements([...parseEngagements(), { title: "", description: "" }]) }
  function removeEngagement(i: number) { const e = parseEngagements(); e.splice(i, 1); stringifyEngagements(e) }
  function updateEngagement(i: number, field: keyof Engagement, val: string) {
    const e = parseEngagements(); e[i] = { ...e[i], [field]: val }; stringifyEngagements(e)
  }

  if (!loaded) {
    return (
      <div className="flex items-center gap-3 py-12 text-sm text-[#6B5744]">
        <span className="animate-spin">↻</span> Chargement…
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#1A0A00] md:text-3xl">Paramètres du site</h1>
        <p className="mt-1 text-sm text-[#6B5744]">Modifiez tous les textes et contenus visibles sur le site.</p>
      </div>

      {saved && (
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
          ✓ Modifications enregistrées et publiées.
        </div>
      )}

      {/* ── 1. Barre d'annonces ───────────────────────────── */}
      <SectionCard title="Barre d'annonces rotative" subtitle="Messages affichés en haut du site">
        <div className="space-y-3">
          {parseAnn().map((item, i) => (
            <div key={i} className="rounded border border-[#E5D5C5] bg-[#FAF6F1] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B5744]">Annonce {i + 1}</span>
                <button type="button" onClick={() => removeAnn(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>
              </div>
              <input className={inputCls()} placeholder="Texte complet de l'annonce" value={item.text} onChange={e => updateAnn(i, "text", e.target.value)} />
              <input className={inputCls()} placeholder="Mot à mettre en surbrillance dorée (optionnel)" value={item.highlight ?? ""} onChange={e => updateAnn(i, "highlight", e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={addAnn} className="text-xs text-[#C9A84C] hover:underline">+ Ajouter une annonce</button>
        </div>
        <div className="mt-4">
          <SaveButton saving={saving} saved={false} />
          <span className="ml-2" />
          <button type="button" onClick={() => save({ announcements: ann })}
            className="rounded bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1A0A00] hover:bg-[#b8932a] disabled:opacity-50"
            disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </SectionCard>

      {/* ── 2. Marquee ───────────────────────────────────────── */}
      <SectionCard title="Bandeau défilant (Marquee)" subtitle="Textes qui défilent en bande dorée">
        <div className="space-y-2">
          {parseMarquee().map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={inputCls("flex-1")} value={item} onChange={e => updateMarqueeItem(i, e.target.value)} placeholder="Texte défilant" />
              <button type="button" onClick={() => removeMarqueeItem(i)} className="text-xs text-red-400 hover:text-red-600 shrink-0">✕</button>
            </div>
          ))}
          <button type="button" onClick={addMarqueeItem} className="text-xs text-[#C9A84C] hover:underline">+ Ajouter un texte</button>
        </div>
        <div className="mt-4">
          <button type="button" onClick={() => save({ marquee_items: marquee })}
            className="rounded bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1A0A00] hover:bg-[#b8932a] disabled:opacity-50"
            disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
        </div>
      </SectionCard>

      {/* ── 3. Hero copy ─────────────────────────────────────── */}
      <SectionCard title="Section Hero" subtitle="Textes de la bannière principale">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A0A00]">Tagline (petit texte doré)</label>
            <input className={inputCls()} value={heroTagline} onChange={e => setHeroTagline(e.target.value)} placeholder="La Fée de la Perfection" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A0A00]">Titre principal</label>
            <input className={inputCls()} value={heroHeading} onChange={e => setHeroHeading(e.target.value)} placeholder="Sublime, Par Nature." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A0A00]">Description</label>
            <textarea className={inputCls()} rows={3} value={heroDesc} onChange={e => setHeroDesc(e.target.value)} placeholder="L'art de révéler votre lumière intérieure…" />
          </div>
        </div>
        <div className="mt-4">
          <button type="button" onClick={() => save({ hero_tagline: heroTagline, hero_heading: heroHeading, hero_description: heroDesc })}
            className="rounded bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1A0A00] hover:bg-[#b8932a] disabled:opacity-50"
            disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
        </div>
      </SectionCard>

      {/* ── 4. Section Rituel copy ───────────────────────────── */}
      <SectionCard title="Section Rituel — texte" subtitle="Titre et description de la section histoire de marque">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A0A00]">Titre</label>
            <input className={inputCls()} value={rituelTitle} onChange={e => setRituelTitle(e.target.value)} placeholder="Le Rituel de la Fée" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A0A00]">Description</label>
            <textarea className={inputCls()} rows={3} value={rituelDesc} onChange={e => setRituelDesc(e.target.value)} placeholder="Fondée sur les secrets ancestraux…" />
          </div>
        </div>
        <div className="mt-4">
          <button type="button" onClick={() => save({ rituel_title: rituelTitle, rituel_description: rituelDesc })}
            className="rounded bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1A0A00] hover:bg-[#b8932a] disabled:opacity-50"
            disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
        </div>
      </SectionCard>

      {/* ── 5. Engagements ──────────────────────────────────── */}
      <SectionCard title="Nos Engagements (3 cards)" subtitle="Titre et description de chaque engagement marque">
        <div className="space-y-4">
          {parseEngagements().map((item, i) => (
            <div key={i} className="rounded border border-[#E5D5C5] bg-[#FAF6F1] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B5744]">Engagement {i + 1}</span>
                <button type="button" onClick={() => removeEngagement(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>
              </div>
              <input className={inputCls()} placeholder="Titre (ex: Formules Clean)" value={item.title} onChange={e => updateEngagement(i, "title", e.target.value)} />
              <textarea className={inputCls()} rows={2} placeholder="Description" value={item.description} onChange={e => updateEngagement(i, "description", e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={addEngagement} className="text-xs text-[#C9A84C] hover:underline">+ Ajouter un engagement</button>
        </div>
        <div className="mt-4">
          <button type="button" onClick={() => save({ engagements })}
            className="rounded bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1A0A00] hover:bg-[#b8932a] disabled:opacity-50"
            disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
        </div>
      </SectionCard>

      {/* ── 6. Témoignages ─────────────────────────────────── */}
      <SectionCard title="Témoignages clients" subtitle="4 avis affichés sur la page d'accueil">
        <div className="space-y-4">
          {parseTestimonials().map((item, i) => (
            <div key={i} className="rounded border border-[#E5D5C5] bg-[#FAF6F1] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B5744]">Avis {i + 1}</span>
                <button type="button" onClick={() => removeTestimonial(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls()} placeholder="Nom (ex: Aminata K.)" value={item.name} onChange={e => updateTestimonial(i, "name", e.target.value)} />
                <input className={inputCls()} placeholder="Initiales (AK)" value={item.initials} onChange={e => updateTestimonial(i, "initials", e.target.value)} />
                <input className={inputCls()} placeholder="Quartier (ex: Cocody)" value={item.location} onChange={e => updateTestimonial(i, "location", e.target.value)} />
                <input className={inputCls()} placeholder="Produit (ex: Crème Éclat)" value={item.product} onChange={e => updateTestimonial(i, "product", e.target.value)} />
                <input className={inputCls()} placeholder="Date (ex: Juin 2026)" value={item.date} onChange={e => updateTestimonial(i, "date", e.target.value)} />
                <input type="number" min={1} max={5} className={inputCls()} placeholder="Note /5" value={item.rating} onChange={e => updateTestimonial(i, "rating", Number(e.target.value))} />
              </div>
              <textarea className={inputCls()} rows={3} placeholder="Texte du témoignage" value={item.text} onChange={e => updateTestimonial(i, "text", e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={addTestimonial} className="text-xs text-[#C9A84C] hover:underline">+ Ajouter un témoignage</button>
        </div>
        <div className="mt-4">
          <button type="button" onClick={() => save({ testimonials })}
            className="rounded bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1A0A00] hover:bg-[#b8932a] disabled:opacity-50"
            disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
        </div>
      </SectionCard>

      {/* ── 7. Réseaux sociaux ──────────────────────────────── */}
      <SectionCard title="Réseaux sociaux" subtitle="Liens affichés dans le footer">
        <div className="space-y-3">
          {parseSocials().map((item, i) => (
            <div key={i} className="flex min-w-0 items-center gap-2">
              <input className={inputCls("w-28 shrink-0")} placeholder="Label (Instagram)" value={item.label} onChange={e => updateSocial(i, "label", e.target.value)} />
              <input className={inputCls("min-w-0 flex-1")} placeholder="URL complète" value={item.href} onChange={e => updateSocial(i, "href", e.target.value)} />
              <button type="button" onClick={() => removeSocial(i)} className="text-xs text-red-400 hover:text-red-600 shrink-0">✕</button>
            </div>
          ))}
          <button type="button" onClick={addSocial} className="text-xs text-[#C9A84C] hover:underline">+ Ajouter un réseau</button>
        </div>
        <div className="mt-4">
          <button type="button" onClick={() => save({ social_links: socials })}
            className="rounded bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1A0A00] hover:bg-[#b8932a] disabled:opacity-50"
            disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
        </div>
      </SectionCard>

      {/* ── 8. Newsletter ────────────────────────────────────── */}
      <SectionCard title="Section Newsletter" subtitle="Texte descriptif affiché à côté du formulaire">
        <textarea className={inputCls()} rows={2} value={newsletterDesc} onChange={e => setNewsletterDesc(e.target.value)} placeholder="Rituels inédits, offres privées et avant-premières réservées aux membres." />
        <div className="mt-4">
          <button type="button" onClick={() => save({ newsletter_description: newsletterDesc })}
            className="rounded bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1A0A00] hover:bg-[#b8932a] disabled:opacity-50"
            disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
        </div>
      </SectionCard>

      {/* ── 9. Rituel média ─────────────────────────────────── */}
      <RituelMediaSection />
    </div>
  )
}
