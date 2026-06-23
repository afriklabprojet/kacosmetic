import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "./AdminSidebar"

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  if (!session?.user) redirect("/admin/login")
  if ((session.user as { role?: string }).role !== "ADMIN") redirect("/")

  return (
    <div className="flex min-h-screen bg-[#FAF6F1]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  )
}
