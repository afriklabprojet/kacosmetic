"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface GalleryImage {
  id: string
  url: string
  alt?: string | null
  blurHash?: string | null
}

interface PhotoGalleryProps {
  images: GalleryImage[]
  productName: string
}

export default function PhotoGallery({ images, productName }: Readonly<PhotoGalleryProps>) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex]

  function prev() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }

  function next() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  if (!active) return null

  return (
    <div className="flex flex-col gap-3">
      {/* Image principale */}
      <div className="group relative aspect-[4/5] overflow-hidden rounded-md bg-[#F0E8DC]">
        <Image
          key={active.id}
          src={active.url}
          alt={active.alt ?? productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300"
          priority={activeIndex === 0}
          placeholder={active.blurHash ? "blur" : "empty"}
          blurDataURL={active.blurHash ?? undefined}
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#1A0A00] opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-white"
              aria-label="Image précédente"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#1A0A00] opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-white"
              aria-label="Image suivante"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dots mobile */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails desktop */}
      {images.length > 1 && (
        <div className="hidden gap-2 overflow-x-auto md:flex">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-[#F0E8DC] transition-all ${
                i === activeIndex
                  ? "ring-2 ring-[#C9A84C] ring-offset-1"
                  : "opacity-60 hover:opacity-100"
              }`}
              aria-label={`Voir image ${i + 1}`}
              aria-pressed={i === activeIndex}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productName} ${i + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
