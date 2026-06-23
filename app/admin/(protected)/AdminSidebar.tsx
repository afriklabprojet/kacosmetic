"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayersIcon, LayoutDashboard, Package, Settings, ShoppingCart, Tag, Truck } from "lucide-react"

const ADMIN_NAV = [
  { label: "Dashboard",  href: "/admin",               icon: LayoutDashboard },
  { label: "Produits",   href: "/admin/products",      icon: Package },
  { label: "Commandes",  href: "/admin/orders",        icon: ShoppingCart },
  { label: "Catégories", href: "/admin/categories",    icon: LayersIcon },
  { label: "Livraison",  href: "/admin/delivery",      icon: Truck },
  { label: "Coupons",    href: "/admin/coupons",       icon: Tag },
  { label: "Site",       href: "/admin/site-settings", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 bg-[#1A0A00] text-[#FAF6F1]">
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C]">Ka Cosmetic</p>
        <p className="mt-0.5 text-sm text-[#FAF6F1]/50">Back-office</p>
      </div>
      <nav className="px-3 pb-6">
        {ADMIN_NAV.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#C9A84C]/20 text-[#C9A84C]"
                  : "text-[#FAF6F1]/70 hover:bg-[#FAF6F1]/10 hover:text-[#FAF6F1]"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
