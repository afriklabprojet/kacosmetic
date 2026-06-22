import { NextRequest, NextResponse } from "next/server"

// Middleware léger sans import Prisma/NextAuth pour rester sous 1 MB (plan Hobby)
// La vérification du rôle ADMIN se fait via le cookie de session NextAuth (présence uniquement).
// La vérification stricte du rôle est faite dans les layouts admin côté serveur.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const sessionCookie =
    req.cookies.get("__Secure-authjs.session-token") ??
    req.cookies.get("authjs.session-token")

  const isLoggedIn = Boolean(sessionCookie?.value)

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  if (pathname.startsWith("/compte")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/connexion?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*"],
}
