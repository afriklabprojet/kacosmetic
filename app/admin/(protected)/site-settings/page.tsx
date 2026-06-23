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
  legal_mentions?: string
  legal_confidentialite?: string
  legal_cgv?: string
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputCls(extra = "") {
  return `w-full rounded border border-[#E5D5C5] bg-[#FAF6F1] px-3 py-2 text-sm text-[#1A0A00] placeholder:text-[#6B5744]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 ${extra}`
}

function SaveBtn({ status, onClick }: Readonly<{ status: SaveStatus; onClick: () => void }>) {
  const label =
    status === "saving" ? "Enregistrement…"
    : status === "saved" ? "✓ Enregistré"
    : status === "error" ? "⚠ Réessayer"
    : "Enregistrer"
  const colorCls =
    status === "saved" ? "bg-green-600 hover:bg-green-700 text-white"
    : status === "error" ? "bg-red-500 hover:bg-red-600 text-white"
    : "bg-[#C9A84C] hover:bg-[#b8932a] text-[#1A0A00]"
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status === "saving"}
      className={`rounded px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${colorCls}`}
    >
      {label}
    </button>
  )
}

function Hint({ children }: Readonly<{ children: React.ReactNode }>) {
  return <p className="mt-1 text-[11px] text-[#6B5744]/60">{children}</p>
}

interface SectionProps {
  id: string
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function Section({ id, title, subtitle, defaultOpen = false, children }: Readonly<SectionProps>) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div id={id} className="overflow-hidden rounded-lg border border-[#E5D5C5] bg-white shadow-sm scroll-mt-6">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between border-b border-[#E5D5C5] bg-[#FAF6F1] px-4 py-3 text-left transition-colors hover:bg-[#F0E8DE]"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B5744]">{title}</p>
          {subtitle && <p className="mt-0.5 text-xs text-[#6B5744]/70">{subtitle}</p>}
        </div>
        <span className={`ml-4 shrink-0 text-[#6B5744]/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}

// ─── Per-section save hook ────────────────────────────────────────────────────

function useSave() {
  const [statuses, setStatuses] = useState<Record<string, SaveStatus>>({})

  const save = useCallback(async (key: string, patch: Partial<TextSettings>) => {
    setStatuses(prev => ({ ...prev, [key]: "saving" }))
    try {
      const res = await fetch("/api/admin/site-settings/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (res.ok) {
        setStatuses(prev => ({ ...prev, [key]: "saved" }))
        setTimeout(() => setStatuses(prev => ({ ...prev, [key]: "idle" })), 2500)
      } else {
        setStatuses(prev => ({ ...prev, [key]: "error" }))
      }
    } catch {
      setStatuses(prev => ({ ...prev, [key]: "error" }))
    }
  }, [])

  return { save, status: (key: string): SaveStatus => statuses[key] ?? "idle" }
}

// ─── Rituel Media Section ─────────────────────────────────────────────────────

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
    <Section id="rituel-media" title="Section Rituel — Média" subtitle="Photo ou vidéo de fond de la section histoire">
      {current && (
        <div className="mb-4 overflow-hidden rounded border border-[#E5D5C5]">
          <div className="relative aspect-video w-full bg-[#F5EFE6]">
            {current.mediaType === "video"
              ? <video src={current.url} className="h-full w-full object-cover" muted playsInline controls />
              // eslint-disable-next-line @next/next/no-img-element
              : <img src={current.url} alt="Média actuel" className="h-full w-full object-cover" />}
          </div>
          <p className="px-3 py-1.5 text-[11px] text-[#6B5744]/60">Média actuel</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input id="rituel-file" ref={fileRef} type="file" name="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          onChange={handleFileChange}
          className="block w-full rounded border border-[#E5D5C5] bg-[#FAF6F1] px-3 py-2 text-sm text-[#1A0A00] file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-[#C9A84C] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#1A0A00] hover:file:bg-[#b8932a]"
        />
        <Hint>Formats acceptés : JPG, PNG, WEBP, MP4, WEBM — max 50 Mo</Hint>
        {previewUrl && previewType && (
          <div className="overflow-hidden rounded border border-[#E5D5C5]">
            <div className="relative aspect-video w-full bg-[#F5EFE6]">
              {previewType === "video"
                ? <video src={previewUrl} className="h-full w-full object-cover" muted playsInline controls />
                // eslint-disable-next-line @next/next/no-img-element
                : <img src={previewUrl} alt="Aperçu" className="h-full w-full object-cover" />}
            </div>
            <p className="px-3 py-1.5 text-[11px] text-[#6B5744]/60">Aperçu avant envoi</p>
          </div>
        )}
        {status === "error" && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{errorMsg}</p>}
        {status === "success" && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">✓ Média mis à jour.</p>}
        <button type="submit" disabled={status === "uploading" || !previewUrl}
          className="rounded bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#1A0A00] transition-colors hover:bg-[#b8932a] disabled:cursor-not-allowed disabled:opacity-40">
          {status === "uploading" ? "Envoi en cours…" : "Enregistrer le média"}
        </button>
      </form>
    </Section>
  )
}

// ─── Navigation anchors ───────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "annonces",       label: "Annonces" },
  { id: "marquee",        label: "Marquee" },
  { id: "hero",           label: "Hero" },
  { id: "rituel-texte",   label: "Rituel" },
  { id: "engagements",    label: "Engagements" },
  { id: "temoignages",    label: "Témoignages" },
  { id: "sociaux",        label: "Réseaux" },
  { id: "newsletter",     label: "Newsletter" },
  { id: "rituel-media",   label: "Média" },
  { id: "legal",          label: "Pages légales" },
]

function SectionNav() {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Sections">
      {NAV_SECTIONS.map(s => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="rounded-full border border-[#E5D5C5] bg-white px-3 py-1 text-[11px] font-medium text-[#6B5744] transition-colors hover:border-[#C9A84C] hover:text-[#C9A84C]"
        >
          {s.label}
        </a>
      ))}
    </nav>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<TextSettings>({})
  const [loaded, setLoaded] = useState(false)
  const { save, status } = useSave()

  // draft states per section
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
  const [legalMentions, setLegalMentions] = useState("")
  const [legalConfidentialite, setLegalConfidentialite] = useState("")
  const [legalCgv, setLegalCgv] = useState("")

  useEffect(() => {
    fetch("/api/admin/site-settings/text")
      .then(r => r.json())
      .then((d: TextSettings) => { setSettings(d); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

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
    setLegalMentions(settings.legal_mentions ?? "")
    setLegalConfidentialite(settings.legal_confidentialite ?? "")
    setLegalCgv(settings.legal_cgv ?? "")
  }, [loaded, settings])

  // ── JSON helpers ──────────────────────────────────────────────────────────

  function parseAnn(): Announcement[] {
    try { return JSON.parse(ann) as Announcement[] } catch { return [] }
  }
  function setAnnItems(items: Announcement[]) { setAnn(JSON.stringify(items, null, 2)) }
  function addAnn() { setAnnItems([...parseAnn(), { text: "", highlight: "" }]) }
  function removeAnn(i: number) { const a = parseAnn(); a.splice(i, 1); setAnnItems(a) }
  function updateAnn(i: number, field: keyof Announcement, val: string) {
    const a = parseAnn(); a[i] = { ...a[i], [field]: val }; setAnnItems(a)
  }

  function parseMarquee(): string[] {
    try { return JSON.parse(marquee) as string[] } catch { return [] }
  }
  function setMarqueeItems(items: string[]) { setMarquee(JSON.stringify(items, null, 2)) }
  function addMarqueeItem() { setMarqueeItems([...parseMarquee(), ""]) }
  function removeMarqueeItem(i: number) { const m = parseMarquee(); m.splice(i, 1); setMarqueeItems(m) }
  function updateMarqueeItem(i: number, val: string) { const m = parseMarquee(); m[i] = val; setMarqueeItems(m) }

  function parseSocials(): SocialLink[] {
    try { return JSON.parse(socials) as SocialLink[] } catch { return [] }
  }
  function setSocialItems(items: SocialLink[]) { setSocials(JSON.stringify(items, null, 2)) }
  function addSocial() { setSocialItems([...parseSocials(), { label: "", href: "" }]) }
  function removeSocial(i: number) { const s = parseSocials(); s.splice(i, 1); setSocialItems(s) }
  function updateSocial(i: number, field: keyof SocialLink, val: string) {
    const s = parseSocials(); s[i] = { ...s[i], [field]: val }; setSocialItems(s)
  }

  function parseTestimonials(): Testimonial[] {
    try { return JSON.parse(testimonials) as Testimonial[] } catch { return [] }
  }
  function setTestimonialItems(items: Testimonial[]) { setTestimonials(JSON.stringify(items, null, 2)) }
  function addTestimonial() {
    setTestimonialItems([...parseTestimonials(), { id: Date.now(), name: "", location: "", rating: 5, text: "", product: "", date: "", initials: "" }])
  }
  function removeTestimonial(i: number) { const t = parseTestimonials(); t.splice(i, 1); setTestimonialItems(t) }
  function updateTestimonial(i: number, field: keyof Testimonial, val: string | number) {
    const t = parseTestimonials(); t[i] = { ...t[i], [field]: val }; setTestimonialItems(t)
  }

  function parseEngagements(): Engagement[] {
    try { return JSON.parse(engagements) as Engagement[] } catch { return [] }
  }
  function setEngagementItems(items: Engagement[]) { setEngagements(JSON.stringify(items, null, 2)) }
  function addEngagement() { setEngagementItems([...parseEngagements(), { title: "", description: "" }]) }
  function removeEngagement(i: number) { const e = parseEngagements(); e.splice(i, 1); setEngagementItems(e) }
  function updateEngagement(i: number, field: keyof Engagement, val: string) {
    const e = parseEngagements(); e[i] = { ...e[i], [field]: val }; setEngagementItems(e)
  }

  if (!loaded) {
    return (
      <div className="space-y-4 max-w-3xl">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-[#F0E8DE]" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">

      {/* ── En-tête ──────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#1A0A00] md:text-3xl">Paramètres du site</h1>
        <p className="mt-1 text-sm text-[#6B5744]">Modifiez tous les textes et contenus visibles sur le site. Chaque section se sauvegarde indépendamment.</p>
      </div>

      {/* ── Navigation rapide ────────────────────────────────── */}
      <SectionNav />

      {/* ── 1. Annonces ──────────────────────────────────────── */}
      <Section id="annonces" title="Barre d'annonces rotative" subtitle="Messages défilants en haut du site" defaultOpen>
        <div className="space-y-3">
          {parseAnn().map((item, i) => (
            <div key={i} className="rounded border border-[#E5D5C5] bg-[#FAF6F1] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B5744]">Annonce {i + 1}</span>
                <button type="button" onClick={() => removeAnn(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>
              </div>
              <input className={inputCls()} placeholder="Texte complet de l'annonce" value={item.text} onChange={e => updateAnn(i, "text", e.target.value)} />
              <div>
                <input className={inputCls()} placeholder="Mot en surbrillance dorée (optionnel)" value={item.highlight ?? ""} onChange={e => updateAnn(i, "highlight", e.target.value)} />
                <Hint>Le mot doit être présent dans le texte pour s&apos;afficher en doré.</Hint>
              </div>
            </div>
          ))}
          <button type="button" onClick={addAnn} className="text-xs text-[#C9A84C] hover:underline">+ Ajouter une annonce</button>
        </div>
        <div className="mt-4">
          <SaveBtn status={status("annonces")} onClick={() => save("annonces", { announcements: ann })} />
        </div>
      </Section>

      {/* ── 2. Marquee ───────────────────────────────────────── */}
      <Section id="marquee" title="Bandeau défilant (Marquee)" subtitle="Textes qui défilent sur la bande dorée">
        <div className="space-y-2">
          {parseMarquee().map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={inputCls("min-w-0 flex-1")} value={item} onChange={e => updateMarqueeItem(i, e.target.value)} placeholder="Texte défilant" />
              <button type="button" onClick={() => removeMarqueeItem(i)} className="text-xs text-red-400 hover:text-red-600 shrink-0">✕</button>
            </div>
          ))}
          <button type="button" onClick={addMarqueeItem} className="text-xs text-[#C9A84C] hover:underline">+ Ajouter un texte</button>
        </div>
        <div className="mt-4">
          <SaveBtn status={status("marquee")} onClick={() => save("marquee", { marquee_items: marquee })} />
        </div>
      </Section>

      {/* ── 3. Hero ──────────────────────────────────────────── */}
      <Section id="hero" title="Section Hero" subtitle="Textes de la bannière principale (fond vidéo)">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A0A00]">Tagline — petit texte doré</label>
            <input className={inputCls()} value={heroTagline} onChange={e => setHeroTagline(e.target.value)} placeholder="La Fée de la Perfection" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A0A00]">Titre principal</label>
            <input className={inputCls()} value={heroHeading} onChange={e => setHeroHeading(e.target.value)} placeholder="Sublime,|Par Nature." />
            <Hint>Utilisez <code className="rounded bg-[#E5D5C5] px-1">|</code> pour couper le titre en deux lignes (ex : <code className="rounded bg-[#E5D5C5] px-1">Sublime,|Par Nature.</code>)</Hint>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A0A00]">Description</label>
            <textarea className={inputCls()} rows={3} value={heroDesc} onChange={e => setHeroDesc(e.target.value)} placeholder="L'art de révéler votre lumière intérieure…" />
          </div>
        </div>
        <div className="mt-4">
          <SaveBtn status={status("hero")} onClick={() => save("hero", { hero_tagline: heroTagline, hero_heading: heroHeading, hero_description: heroDesc })} />
        </div>
      </Section>

      {/* ── 4. Section Rituel — texte ────────────────────────── */}
      <Section id="rituel-texte" title="Section Rituel — Texte" subtitle="Titre et description de la section histoire de marque">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A0A00]">Titre</label>
            <input className={inputCls()} value={rituelTitle} onChange={e => setRituelTitle(e.target.value)} placeholder="Le Rituel de la|Fée" />
            <Hint>Utilisez <code className="rounded bg-[#E5D5C5] px-1">|</code> pour mettre la dernière partie en couleur brun (ex : <code className="rounded bg-[#E5D5C5] px-1">Le Rituel de la|Fée</code>)</Hint>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#1A0A00]">Description</label>
            <textarea className={inputCls()} rows={4} value={rituelDesc} onChange={e => setRituelDesc(e.target.value)} placeholder="Fondée sur les secrets ancestraux…" />
          </div>
        </div>
        <div className="mt-4">
          <SaveBtn status={status("rituel-texte")} onClick={() => save("rituel-texte", { rituel_title: rituelTitle, rituel_description: rituelDesc })} />
        </div>
      </Section>

      {/* ── 5. Engagements ──────────────────────────────────── */}
      <Section id="engagements" title="Nos Engagements" subtitle="3 cartes d'engagement affichées en bas de la page d'accueil">
        <div className="space-y-4">
          {parseEngagements().map((item, i) => (
            <div key={i} className="rounded border border-[#E5D5C5] bg-[#FAF6F1] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B5744]">Engagement {i + 1}</span>
                <button type="button" onClick={() => removeEngagement(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>
              </div>
              <input className={inputCls()} placeholder="Titre (ex : Formules Clean)" value={item.title} onChange={e => updateEngagement(i, "title", e.target.value)} />
              <textarea className={inputCls()} rows={2} placeholder="Description courte" value={item.description} onChange={e => updateEngagement(i, "description", e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={addEngagement} className="text-xs text-[#C9A84C] hover:underline">+ Ajouter un engagement</button>
        </div>
        <div className="mt-4">
          <SaveBtn status={status("engagements")} onClick={() => save("engagements", { engagements })} />
        </div>
      </Section>

      {/* ── 6. Témoignages ─────────────────────────────────── */}
      <Section id="temoignages" title="Témoignages clients" subtitle="Avis affichés sur la page d'accueil">
        <div className="space-y-4">
          {parseTestimonials().map((item, i) => (
            <div key={i} className="rounded border border-[#E5D5C5] bg-[#FAF6F1] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B5744]">Avis {i + 1} — {item.name || "Sans nom"}</span>
                <button type="button" onClick={() => removeTestimonial(i)} className="text-xs text-red-400 hover:text-red-600">Supprimer</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-0.5 block text-[11px] text-[#6B5744]">Nom</label>
                  <input className={inputCls()} placeholder="Aminata K." value={item.name} onChange={e => updateTestimonial(i, "name", e.target.value)} />
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-[#6B5744]">Initiales</label>
                  <input className={inputCls()} placeholder="AK" value={item.initials} onChange={e => updateTestimonial(i, "initials", e.target.value)} />
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-[#6B5744]">Ville / Quartier</label>
                  <input className={inputCls()} placeholder="Cocody, Abidjan" value={item.location} onChange={e => updateTestimonial(i, "location", e.target.value)} />
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-[#6B5744]">Produit concerné</label>
                  <input className={inputCls()} placeholder="Crème Éclat Botanique" value={item.product} onChange={e => updateTestimonial(i, "product", e.target.value)} />
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-[#6B5744]">Date</label>
                  <input className={inputCls()} placeholder="Juin 2026" value={item.date} onChange={e => updateTestimonial(i, "date", e.target.value)} />
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-[#6B5744]">Note (1–5)</label>
                  <input type="number" min={1} max={5} className={inputCls()} value={item.rating} onChange={e => updateTestimonial(i, "rating", Number(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="mb-0.5 block text-[11px] text-[#6B5744]">Texte du témoignage</label>
                <textarea className={inputCls()} rows={3} placeholder="Texte du témoignage…" value={item.text} onChange={e => updateTestimonial(i, "text", e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" onClick={addTestimonial} className="text-xs text-[#C9A84C] hover:underline">+ Ajouter un témoignage</button>
        </div>
        <div className="mt-4">
          <SaveBtn status={status("temoignages")} onClick={() => save("temoignages", { testimonials })} />
        </div>
      </Section>

      {/* ── 7. Réseaux sociaux ──────────────────────────────── */}
      <Section id="sociaux" title="Réseaux sociaux" subtitle="Liens affichés dans le footer (Instagram, TikTok, WhatsApp…)">
        <div className="space-y-3">
          {parseSocials().map((item, i) => (
            <div key={i} className="flex min-w-0 items-center gap-2">
              <div className="w-28 shrink-0">
                {i === 0 && <label className="mb-0.5 block text-[11px] text-[#6B5744]">Réseau</label>}
                <input className={inputCls()} placeholder="Instagram" value={item.label} onChange={e => updateSocial(i, "label", e.target.value)} />
              </div>
              <div className="min-w-0 flex-1">
                {i === 0 && <label className="mb-0.5 block text-[11px] text-[#6B5744]">URL complète</label>}
                <input className={inputCls("min-w-0")} placeholder="https://instagram.com/…" value={item.href} onChange={e => updateSocial(i, "href", e.target.value)} />
              </div>
              <button type="button" onClick={() => removeSocial(i)} className={`shrink-0 text-xs text-red-400 hover:text-red-600 ${i === 0 ? "mt-4" : ""}`}>✕</button>
            </div>
          ))}
          <button type="button" onClick={addSocial} className="text-xs text-[#C9A84C] hover:underline">+ Ajouter un réseau</button>
          <Hint>Labels reconnus pour l&apos;icône automatique : Instagram, TikTok, WhatsApp</Hint>
        </div>
        <div className="mt-4">
          <SaveBtn status={status("sociaux")} onClick={() => save("sociaux", { social_links: socials })} />
        </div>
      </Section>

      {/* ── 8. Newsletter ────────────────────────────────────── */}
      <Section id="newsletter" title="Section Newsletter" subtitle="Texte affiché à côté du formulaire d'inscription">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#1A0A00]">Description</label>
          <textarea className={inputCls()} rows={2} value={newsletterDesc} onChange={e => setNewsletterDesc(e.target.value)} placeholder="Rituels inédits, offres privées et avant-premières réservées aux membres." />
        </div>
        <div className="mt-4">
          <SaveBtn status={status("newsletter")} onClick={() => save("newsletter", { newsletter_description: newsletterDesc })} />
        </div>
      </Section>

      {/* ── 9. Rituel — Média ───────────────────────────────── */}
      <RituelMediaSection />

      {/* ── 10. Pages légales ───────────────────────────────── */}
      <Section id="legal" title="Pages légales" subtitle="Mentions légales, Confidentialité, CGV">
        <div className="space-y-6">
          <Hint>
            Format : <code className="rounded bg-[#E5D5C5] px-1">## Titre de section</code> puis le texte en dessous.
            Séparez les sections par une ligne vide. Utilisez <code className="rounded bg-[#E5D5C5] px-1">**texte**</code> pour le gras.
            Si le champ est vide, le contenu par défaut est affiché.
          </Hint>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-semibold text-[#6B5744]">Mentions légales</label>
              <a href="/mentions-legales" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#C9A84C] hover:underline">Voir la page ↗</a>
            </div>
            <textarea className={inputCls("font-mono text-xs")} rows={12} value={legalMentions} onChange={e => setLegalMentions(e.target.value)} placeholder={"## Éditeur du site\n**Dénomination** : Ka Cosmetic\n..."} />
            <div className="mt-2">
              <SaveBtn status={status("legal-mentions")} onClick={() => save("legal-mentions", { legal_mentions: legalMentions })} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-semibold text-[#6B5744]">Politique de confidentialité</label>
              <a href="/confidentialite" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#C9A84C] hover:underline">Voir la page ↗</a>
            </div>
            <textarea className={inputCls("font-mono text-xs")} rows={12} value={legalConfidentialite} onChange={e => setLegalConfidentialite(e.target.value)} placeholder={"## 1. Responsable du traitement\n..."} />
            <div className="mt-2">
              <SaveBtn status={status("legal-confidentialite")} onClick={() => save("legal-confidentialite", { legal_confidentialite: legalConfidentialite })} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-semibold text-[#6B5744]">Conditions Générales de Vente (CGV)</label>
              <a href="/cgv" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#C9A84C] hover:underline">Voir la page ↗</a>
            </div>
            <textarea className={inputCls("font-mono text-xs")} rows={12} value={legalCgv} onChange={e => setLegalCgv(e.target.value)} placeholder={"## Article 1 — Objet\n..."} />
            <div className="mt-2">
              <SaveBtn status={status("legal-cgv")} onClick={() => save("legal-cgv", { legal_cgv: legalCgv })} />
            </div>
          </div>
        </div>
      </Section>

    </div>
  )
}
