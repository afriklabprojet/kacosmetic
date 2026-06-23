"use client"

import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useState, useEffect, useCallback, useRef } from "react"
import { ShoppingBag, User, Heart, Search, X, ChevronDown } from "lucide-react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import AnnouncementBar from "@/components/Navigation/AnnouncementBar"

const CartDrawer = dynamic(() => import("@/components/Cart/CartDrawer"), { ssr: false })

const NAV_ITEMS = [
  {
    label: "Soins Visage",
    href: "/catalogue/soins-visage",
    image: "https://images.unsplash.com/photo-1556228578-8d89b6acb68a?q=80&w=800&auto=format&fit=crop",
    subcategories: [
      "Sérums & Ampoules",
      "Crèmes hydratantes",
      "Masques & Gommages",
      "Contour des yeux",
      "Nettoyants & Toners",
    ],
    featured: { label: "Best Seller", name: "Sérum Or Noir", price: "125 000 FCFA" },
  },
  {
    label: "Corps & Bain",
    href: "/catalogue/corps-bain",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop",
    subcategories: [
      "Huiles & Élixirs corps",
      "Lotions & Laits",
      "Gommages corps",
      "Soins pieds & mains",
      "Rituels de bain",
    ],
    featured: { label: "Nouveauté", name: "Élixir Bronze Sublime", price: "75 000 FCFA" },
  },
  {
    label: "Coffrets",
    href: "/catalogue/coffrets",
    image: "https://images.unsplash.com/photo-1583241475880-083f84372725?q=80&w=800&auto=format&fit=crop",
    subcategories: [
      "Coffrets Visage",
      "Coffrets Corps",
      "Coffrets Rituels",
    ],
    featured: { label: "Idée Cadeau", name: "Rituel Complet", price: "185 000 FCFA" },
  },
]

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isHomepage = pathname === "/"

  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function syncCount() {
      const raw: Record<string, number> = JSON.parse(localStorage.getItem("ka_cart") ?? "{}")
      setCartCount(Object.values(raw).reduce((s, q) => s + q, 0))
    }
    syncCount()
    globalThis.addEventListener("cart:updated", syncCount)
    return () => globalThis.removeEventListener("cart:updated", syncCount)
  }, [])

  const handleScroll = useCallback(() => {
    setScrolled(globalThis.scrollY > 60)
  }, [])

  useEffect(() => {
    globalThis.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => globalThis.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Lock body scroll when overlays open
  useEffect(() => {
    const locked = mobileOpen || searchOpen
    document.body.style.overflow = locked ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen, searchOpen])

  // Keyboard close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false)
        setMobileOpen(false)
        setActiveMenu(null)
        setMobileExpanded(null)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  function openMenu(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActiveMenu(label)
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 150)
  }

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const isTransparent = isHomepage && !scrolled && !searchOpen
  const showSolidBg = !isTransparent || !!activeMenu

  return (
    <>
      {/* ── Desktop Header ──────────────────────────────────── */}
      <header
        className={`fixed left-0 right-0 top-0 z-40 transition-all duration-500 ${
          isTransparent
            ? "py-5"
            : "py-0 shadow-[0_1px_0_rgba(31,31,31,0.06)]"
        }`}
        style={
          !showSolidBg
            ? { background: "transparent" }
            : {
                background: "rgba(248,245,241,0.92)",
                backdropFilter: "blur(14px) saturate(180%)",
                WebkitBackdropFilter: "blur(14px) saturate(180%)",
              }
        }
      >
        {/* Announcement bar — visible on all pages when not scrolled */}
        {!scrolled && <AnnouncementBar transparent={isTransparent} />}

        <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-[72px]">

            {/* ── Left nav (desktop) ─── */}
            <nav className="hidden items-center gap-8 lg:flex xl:gap-10" aria-label="Navigation principale">
              {NAV_ITEMS.slice(0, 3).map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onMouseEnter={() => openMenu(item.label)}
                  onMouseLeave={scheduleClose}
                  className={`relative flex items-center text-[13px] font-medium tracking-[0.06em] transition-colors duration-200 ${
                    pathname.startsWith(item.href)
                      ? isTransparent ? "text-or" : "text-brun"
                      : isTransparent ? "text-ivoire/80 hover:text-or" : "text-ebene/70 hover:text-brun"
                  }`}
                >
                  {item.label}
                  {pathname.startsWith(item.href) && (
                    <span className={`absolute -bottom-1 left-0 right-0 h-px ${isTransparent ? "bg-or" : "bg-brun"}`} />
                  )}
                </button>
              ))}
            </nav>

            {/* ── Logo centered ─── */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2"
              aria-label="Ka Cosmetic — Accueil"
            >
              <Image
                src="/logo.png"
                alt="Ka Cosmetic"
                width={72}
                height={80}
                priority
                className="transition-all duration-300"
                style={{ width: "72px", height: "auto" }}
              />
            </Link>

            {/* ── Right nav + actions ─── */}
            <div className="ml-auto flex items-center gap-1">

              {/* Right nav items (desktop) */}
              <nav className="mr-4 hidden items-center gap-8 lg:flex xl:gap-10" aria-label="Navigation secondaire">
                {NAV_ITEMS.slice(3).map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onMouseEnter={() => openMenu(item.label)}
                    onMouseLeave={scheduleClose}
                    className={`relative text-[13px] font-medium tracking-[0.06em] transition-colors duration-200 ${
                      pathname.startsWith(item.href)
                        ? isTransparent ? "text-or" : "text-brun"
                        : isTransparent ? "text-ivoire/80 hover:text-or" : "text-ebene/70 hover:text-brun"
                    }`}
                  >
                    {item.label}
                    {pathname.startsWith(item.href) && (
                      <span className={`absolute -bottom-1 left-0 right-0 h-px ${isTransparent ? "bg-or" : "bg-brun"}`} />
                    )}
                  </button>
                ))}
              </nav>

              {/* Search */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className={`flex h-11 w-11 items-center justify-center transition-colors duration-200 ${
                  isTransparent ? "text-ivoire/70 hover:text-or" : "text-ebene/60 hover:text-brun"
                }`}
                aria-label="Rechercher"
              >
                <Search size={17} strokeWidth={1.5} />
              </button>

              {/* Wishlist (desktop) */}
              <Link
                href="/compte/wishlist"
                className={`hidden h-11 w-11 items-center justify-center transition-colors duration-200 lg:flex ${
                  isTransparent ? "text-ivoire/70 hover:text-or" : "text-ebene/60 hover:text-brun"
                }`}
                aria-label="Mes favoris"
              >
                <Heart size={17} strokeWidth={1.5} />
              </Link>

              {/* Account (desktop) */}
              <Link
                href={session ? "/compte/commandes" : "/connexion"}
                className={`hidden h-11 w-11 items-center justify-center transition-colors duration-200 lg:flex ${
                  isTransparent ? "text-ivoire/70 hover:text-or" : "text-ebene/60 hover:text-brun"
                }`}
                aria-label={session ? "Mon compte" : "Se connecter"}
              >
                <User size={17} strokeWidth={1.5} />
              </Link>

              {/* Cart */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className={`relative flex h-11 w-11 items-center justify-center transition-colors duration-200 ${
                  isTransparent ? "text-ivoire/70 hover:text-or" : "text-ebene/60 hover:text-brun"
                }`}
                aria-label={`Panier — ${cartCount} article${cartCount === 1 ? "" : "s"}`}
              >
                <ShoppingBag size={17} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brun text-[9px] font-bold leading-none text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className={`flex h-11 w-11 items-center justify-center transition-colors duration-200 lg:hidden ${
                  isTransparent ? "text-ivoire/80 hover:text-or" : "text-ebene/70 hover:text-brun"
                }`}
                aria-label="Ouvrir le menu"
                aria-expanded={mobileOpen}
              >
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
                  <line x1="0" y1="1"  x2="20" y2="1"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="4" y1="7"  x2="20" y2="7"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="8" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mega-menu panel ──────────────────────────────── */}
        {NAV_ITEMS.map((item) => {
          const isOpen = activeMenu === item.label
          return (
            <div
              key={item.href}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              className={`absolute left-0 right-0 border-t transition-all duration-300 ${
                isOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0"
              }`}
              style={{
                top: "100%",
                background: "rgba(248,245,241,0.97)",
                backdropFilter: "blur(20px)",
                borderColor: "rgba(31,31,31,0.06)",
                boxShadow: "0 24px 60px -12px rgba(31,31,31,0.14)",
              }}
            >
              <div className="mx-auto max-w-[1400px] grid grid-cols-12 gap-0 px-6 py-10 lg:px-8">
                {/* Editorial image — only mounted when menu is open */}
                <div className="col-span-3 pr-8">
                  <div className="relative h-64 overflow-hidden rounded-2xl">
                    {isOpen && (
                      <Image
                        src={item.image}
                        alt={item.label}
                        fill
                        sizes="300px"
                        className="object-cover transition-transform duration-700 hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ebene/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="font-display text-xl text-white">{item.label}</span>
                    </div>
                  </div>
                </div>

                {/* Subcategories */}
                <div className="col-span-6 grid grid-cols-2 gap-x-8 gap-y-1 border-x border-ebene/8 px-8">
                  <div className="col-span-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-or">
                      Catégories
                    </span>
                  </div>
                  {item.subcategories.map((sub) => (
                    <Link
                      key={sub}
                      href={`${item.href}?type=${encodeURIComponent(sub)}`}
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-center gap-2 py-2 text-sm text-ebene/70 transition-colors hover:text-brun"
                    >
                      <span className="h-px w-4 bg-or/0 transition-all duration-200 group-hover:w-6 group-hover:bg-or" aria-hidden="true" />
                      {sub}
                    </Link>
                  ))}
                  <div className="col-span-2 mt-4">
                    <Link
                      href={item.href}
                      onClick={() => setActiveMenu(null)}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brun transition-colors hover:text-brun-dark"
                    >
                      Voir toute la collection
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Featured */}
                <div className="col-span-3 pl-8">
                  <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.28em] text-or">
                    {item.featured.label}
                  </span>
                  <p className="font-display text-lg leading-snug text-ebene">{item.featured.name}</p>
                  <p className="mt-1 font-mono text-sm text-brun">{item.featured.price}</p>
                  <Link
                    href={item.href}
                    onClick={() => setActiveMenu(null)}
                    className="mt-5 inline-flex items-center gap-3 rounded-full bg-brun px-5 py-2.5 text-[11px] font-medium uppercase tracking-widest text-ivoire transition-colors hover:bg-brun-dark"
                  >
                    Découvrir
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </header>

      {/* ── Search overlay ──────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-300 ${
          searchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ background: "rgba(31,31,31,0.96)", backdropFilter: "blur(8px)" }}
      >
        <div className="w-full max-w-2xl px-6">
          {/* Close */}
          <div className="mb-10 flex justify-end">
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="flex h-11 w-11 items-center justify-center transition-colors hover:text-or"
              style={{ color: "rgba(248,245,241,0.60)" }}
              aria-label="Fermer la recherche"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Input */}
          <form action="/catalogue" method="GET">
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2" style={{ color: "rgba(201,162,39,0.40)" }}>
                <Search size={20} strokeWidth={1.5} />
              </span>
              <input
                type="search"
                name="q"
                placeholder="Rechercher un soin, un produit…"
                autoFocus={searchOpen}
                className="search-overlay-input w-full bg-transparent pb-4 pl-9 font-display text-2xl outline-none transition-colors md:text-3xl"
                style={{
                  borderBottom: "1px solid rgba(248,245,241,0.20)",
                  color: "#F8F5F1",
                }}
                aria-label="Rechercher un produit"
              />
            </div>
          </form>

          {/* Quick categories */}
          <div className="mt-10">
            <p
              className="mb-4 text-[10px] uppercase tracking-[0.28em]"
              style={{ color: "rgba(248,245,241,0.30)" }}
            >
              Nos collections
            </p>
            <div className="flex flex-wrap gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSearchOpen(false)}
                  className="rounded-full px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:text-or"
                  style={{ border: "1px solid rgba(248,245,241,0.15)", color: "rgba(248,245,241,0.60)" }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile full-screen menu ─────────────────────────── */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-500 lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ background: "rgba(31,31,31,0.5)" }}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal
        aria-label="Menu principal"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto bg-ivoire transition-transform duration-500 ease-[cubic-bezier(0.32,0,0.67,0)] lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header du menu */}
        <div className="flex items-center justify-between px-6 py-5">
          <Image
            src="/logo.png"
            alt="Ka Cosmetic"
            width={56}
            height={63}
            style={{ width: "56px", height: "auto" }}
          />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-11 w-11 items-center justify-center text-taupe transition-colors hover:text-or"
            aria-label="Fermer le menu"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Gold separator */}
        <div className="mx-6 h-px bg-or/20" />

        {/* Nav links avec stagger + sous-catégories */}
        <nav className="flex-1 px-6 py-6" aria-label="Menu mobile">
          <ul className="space-y-0">
            {NAV_ITEMS.map((item, i) => {
              const isExpanded = mobileExpanded === item.label
              const isActive = pathname.startsWith(item.href)
              return (
                <li
                  key={item.href}
                  style={{
                    opacity: mobileOpen ? 1 : 0,
                    transform: mobileOpen ? "translateX(0)" : "translateX(16px)",
                    transition: `opacity 0.4s cubic-bezier(0.19,1,0.22,1) ${0.1 + i * 0.07}s, transform 0.4s cubic-bezier(0.19,1,0.22,1) ${0.1 + i * 0.07}s`,
                  }}
                >
                  {/* Main category row */}
                  <div className={`flex items-center justify-between py-4 ${isActive ? "text-or" : "text-ebene"}`}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-1 items-center gap-4"
                    >
                      <span className="font-mono text-[10px] text-or/50 tracking-widest">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-xl font-light">{item.label}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileExpanded(isExpanded ? null : item.label)}
                      className="flex h-9 w-9 items-center justify-center text-taupe transition-colors hover:text-or"
                      aria-label={isExpanded ? `Réduire ${item.label}` : `Voir sous-catégories ${item.label}`}
                      aria-expanded={isExpanded}
                    >
                      <ChevronDown
                        size={16}
                        strokeWidth={1.5}
                        className={`transition-transform duration-300 ${isExpanded ? "rotate-180 text-or" : ""}`}
                      />
                    </button>
                  </div>

                  {/* Subcategories accordion */}
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isExpanded ? `${item.subcategories.length * 44}px` : "0px" }}
                  >
                    <ul className="mb-3 ml-8 flex flex-col gap-0">
                      {item.subcategories.map((sub) => (
                        <li key={sub}>
                          <Link
                            href={`${item.href}?type=${encodeURIComponent(sub)}`}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 py-2.5 text-sm text-taupe transition-colors hover:text-brun"
                          >
                            <span className="h-px w-3 flex-shrink-0 bg-or/40" aria-hidden="true" />
                            {sub}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="mt-1 flex items-center gap-2 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brun transition-colors hover:text-brun-dark"
                        >
                          Voir tout
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="h-px bg-or/10" />
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom links */}
        <div
          className="border-t border-or/15 px-6 py-6 pb-safe"
          style={{
            opacity: mobileOpen ? 1 : 0,
            transition: `opacity 0.4s cubic-bezier(0.19,1,0.22,1) ${0.1 + NAV_ITEMS.length * 0.07}s`,
          }}
        >
          <div className="mb-5 flex gap-3">
            <Link
              href={session ? "/compte/commandes" : "/connexion"}
              onClick={() => setMobileOpen(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-or/25 py-3 text-xs uppercase tracking-widest text-taupe transition-colors hover:border-or hover:text-or"
            >
              <User size={14} strokeWidth={1.5} />
              {session ? "Mon compte" : "Connexion"}
            </Link>
            <Link
              href="/compte/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-or/25 py-3 text-xs uppercase tracking-widest text-taupe transition-colors hover:border-or hover:text-or"
            >
              <Heart size={14} strokeWidth={1.5} />
              Favoris
            </Link>
          </div>
          {!session && (
            <Link
              href="/inscription"
              onClick={() => setMobileOpen(false)}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-full bg-brun py-3 text-xs uppercase tracking-widest text-ivoire transition-colors hover:bg-brun-dark"
            >
              Créer un compte
            </Link>
          )}
          <p className="text-center font-display text-[10px] italic text-or/60">
            La Fée de la Perfection
          </p>
        </div>
      </aside>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
