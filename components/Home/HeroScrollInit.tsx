"use client"

import { useEffect } from "react"

export default function HeroScrollInit() {
  useEffect(() => {
    const fadeSections = document.querySelectorAll<HTMLElement>(".fade-in-section")
    const vh = globalThis.innerHeight

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("will-animate")
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.04, rootMargin: "0px 0px -20px 0px" }
    )

    fadeSections.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < vh) {
        // Déjà visible au chargement : aucune animation
        el.classList.add("is-visible")
      } else {
        // Hors-viewport : on prépare l'animation seulement sur cet élément
        el.classList.add("will-animate")
        observer.observe(el)
      }
    })

    return () => observer.disconnect()
  }, [])

  return null
}
