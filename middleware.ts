import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Protéger les routes admin — role ADMIN requis (sauf la page login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
    if ((session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // Protéger les pages compte
  if (pathname.startsWith("/compte")) {
    if (!session?.user) {
      return NextResponse.redirect(
        new URL(`/connexion?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      )
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*"],
}
