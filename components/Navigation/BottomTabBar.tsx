"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Home, Grid2X2, ShoppingBag, Heart, User } from "lucide-react"

const TABS = [
  { label: "Accueil",   href: "/",                icon: Home },
  { label: "Catalogue", href: "/catalogue",        icon: Grid2X2 },
  { label: "Panier",    href: "/panier",           icon: ShoppingBag },
  { label: "Favoris",   href: "/compte/wishlist",  icon: Heart },
  { label: "Compte",    href: "/compte/commandes", icon: User },
] as const

function readCartCount(): number {
  try {
    const raw: Record<string, number> = JSON.parse(localStorage.getItem("ka_cart") ?? "{}")
    return Object.values(raw).reduce((s, q) => s + q, 0)
  } catch {
    return 0
  }
}

export default function BottomTabBar() {
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    setCartCount(readCartCount())
    function sync() { setCartCount(readCartCount()) }
    window.addEventListener("cart:updated", sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener("cart:updated", sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-ivoire border-t border-or/20"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0)",
      }}
      aria-label="Navigation principale"
    >
      <ul className="flex h-[58px] items-stretch">
        {TABS.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href)

          const isCart = href === "/panier"

          return (
            <li key={href} className="flex flex-1">
              <Link
                href={href}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                  isActive ? "text-or" : "text-taupe hover:text-brun"
                }`}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span
                    className="absolute top-0 left-4 right-4 h-[2px] rounded-b-full bg-or"
                    aria-hidden="true"
                  />
                )}

                <span className="relative">
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2 : 1.4}
                    className="transition-transform duration-200"
                  />
                  {isCart && cartCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brun text-[9px] font-bold leading-none text-white">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.08em] leading-none">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
