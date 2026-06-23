"use client"

import { useEffect, useState } from "react"

interface Announcement { text: string; highlight?: string }

const DEFAULT_MESSAGES: Announcement[] = [
  { text: "Première commande — code BIENVENUE10 pour –10% de réduction", highlight: "BIENVENUE10" },
  { text: "Nouveau : Rituel Éclat Originel disponible en ligne", highlight: "Rituel Éclat Originel" },
  { text: "Paiement via Wave, Orange Money & Mobile Money accepté", highlight: "" },
]

export default function AnnouncementBar({ transparent = false, messages }: Readonly<{ transparent?: boolean; messages?: Announcement[] }>) {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [dynamicMessages, setDynamicMessages] = useState<Announcement[]>(messages ?? DEFAULT_MESSAGES)

  // Fetch from DB only if not passed as prop (client-side hydration)
  useEffect(() => {
    if (messages) return
    fetch("/api/site-settings/public?keys=announcements")
      .then(r => r.json())
      .then((d: { announcements?: string }) => {
        if (d.announcements) {
          const parsed = JSON.parse(d.announcements) as Announcement[]
          if (Array.isArray(parsed) && parsed.length > 0) setDynamicMessages(parsed)
        }
      })
      .catch(() => {})
  }, [messages])

  useEffect(() => {
    if (dismissed || dynamicMessages.length <= 1) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent((c) => (c + 1) % dynamicMessages.length)
        setVisible(true)
      }, 350)
    }, 4500)
    return () => clearInterval(interval)
  }, [dismissed, dynamicMessages])

  if (dismissed || dynamicMessages.length === 0) return null

  const msg = dynamicMessages[current] ?? dynamicMessages[0]

  return (
    <div className="relative z-50 px-4 py-2.5 text-center"
      style={{ background: transparent ? "rgba(0,0,0,0.45)" : "#6B4019" }}
      role="status" aria-live="polite">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ivoire/90 transition-all duration-350"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-4px)" }}>
        {msg.highlight ? (
          <>
            {msg.text.split(msg.highlight)[0]}
            <span className="text-or">{msg.highlight}</span>
            {msg.text.split(msg.highlight)[1]}
          </>
        ) : msg.text}
      </p>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Fermer"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ivoire/40 transition-colors hover:text-ivoire/80">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
