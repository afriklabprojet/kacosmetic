"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

interface HeroVideoProps {
  videoSrc: string
  posterSrc: string
  alt: string
}

export default function HeroVideo({ videoSrc, posterSrc, alt }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Vidéo — desktop uniquement (md+) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster={posterSrc}
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full object-cover object-center md:block"
        style={{ filter: "contrast(1.05) brightness(0.82)" }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Photo fallback — mobile uniquement */}
      <Image
        src={posterSrc}
        alt={alt}
        fill
        priority
        sizes="(max-width: 767px) 100vw, 1px"
        className="object-cover object-center opacity-90 md:hidden"
        style={{ filter: "contrast(1.05) brightness(0.82)" }}
      />
    </>
  )
}
