import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayersIcon, LayoutDashboard, Package, Settings, ShoppingCart, Tag, Truck } from "lucide-react"

const ADMIN_NAV = [
  { label: "Dashboard",   href: "/admin",                  icon: LayoutDashboard },
  { label: "Produits",    href: "/admin/products",         icon: Package },
  { label: "Commandes",   href: "/admin/orders",           icon: ShoppingCart },
  { label: "Catégories",  href: "/admin/categories",       icon: LayersIcon },
  { label: "Livraison",   href: "/admin/delivery",         icon: Truck },
  { label: "Coupons",     href: "/admin/coupons",          icon: Tag },
  { label: "Site",        href: "/admin/site-settings",    icon: Settings },
]

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  if (!session?.user) redirect("/admin/login")
  if ((session.user as { role?: string }).role !== "ADMIN") redirect("/")

  return (
    <div className="flex min-h-screen bg-[#FAF6F1]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-[#1A0A00] text-[#FAF6F1]">
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A84C]">
            Ka Cosmetic
          </p>
          <p className="mt-0.5 text-sm text-[#FAF6F1]/50">Back-office</p>
        </div>
        <nav className="px-3 pb-6">
          {ADMIN_NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#FAF6F1]/70 transition-colors hover:bg-[#FAF6F1]/10 hover:text-[#FAF6F1]"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Contenu */}
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  )
}
