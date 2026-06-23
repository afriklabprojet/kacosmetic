"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef } from "react"

interface Props {
  mediaType: "video" | "image"
  mediaUrl: string
  titleLine1: string
  titleLine2?: string
  description: string
}

export default function RituelSection({ mediaType, mediaUrl, titleLine1, titleLine2, description }: Readonly<Props>) {
  const sectionRef = useRef<HTMLElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const media = mediaRef.current
    const content = contentRef.current
    if (!section || !media || !content) return

    // Stagger children of content panel
    const children = Array.from(content.children) as HTMLElement[]

    // Set initial states
    media.style.cssText = "opacity:0; transform:translateX(-48px);"
    children.forEach((el, i) => {
      el.style.cssText = `opacity:0; transform:translateY(${24 + i * 6}px);`
    })

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        observer.disconnect()

        // Animate media panel: slide in from left
        media.style.cssText = "opacity:1; transform:translateX(0); transition: opacity 1s cubic-bezier(0.19,1,0.22,1), transform 1s cubic-bezier(0.19,1,0.22,1);"

        // Stagger content children
        children.forEach((el, i) => {
          el.style.cssText = `opacity:1; transform:translateY(0); transition: opacity 0.8s cubic-bezier(0.19,1,0.22,1) ${0.2 + i * 0.12}s, transform 0.8s cubic-bezier(0.19,1,0.22,1) ${0.2 + i * 0.12}s;`
        })
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh]">

        {/* ── Media panel ── */}
        <div ref={mediaRef} className="relative h-[50vh] md:h-auto order-2 md:order-1">
          {mediaType === "video" ? (
            <video
              src={mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Image
              src={mediaUrl}
              alt="Ingrédients botaniques Ka Cosmetic"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          )}
          {/* Subtle overlay gradient on the right edge to blend into text panel */}
          <div className="absolute inset-y-0 right-0 w-16 hidden md:block" style={{ background: "linear-gradient(to right, transparent, #F8F5F1)" }} aria-hidden />
        </div>

        {/* ── Text panel ── */}
        <div ref={contentRef} className="bg-ivoire flex flex-col justify-center items-start px-8 py-16 md:px-16 lg:px-24 order-1 md:order-2">

          {/* Heading */}
          <h2 className="font-display text-3xl text-ebene mb-5 md:text-5xl">
            {titleLine1}
            {titleLine2 && (
              <>
                {" "}
                <em className="text-brun not-italic">{titleLine2}</em>
              </>
            )}
          </h2>

          {/* Description */}
          <p className="text-sm leading-loose text-taupe max-w-md mb-8 md:text-base">
            {description}
          </p>

          {/* CTA */}
          <Link
            href="/a-propos"
            className="group flex items-center gap-3 text-sm uppercase tracking-widest text-brun transition-colors duration-300 hover:text-brun-dark"
          >
            Notre Histoire
            <span className="block h-px w-8 bg-brun transition-all duration-300 group-hover:w-16 group-hover:bg-or" />
          </Link>

        </div>
      </div>
    </section>
  )
}
