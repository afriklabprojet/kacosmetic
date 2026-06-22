import { NextRequest, NextResponse } from "next/server"

// Middleware léger sans import Prisma/NextAuth pour rester sous 1 MB (plan Hobby)
// La vérification du rôle ADMIN se fait via le cookie de session NextAuth (présence uniquement).
// La vérification stricte du rôle est faite dans les layouts admin côté serveur.

/**
 * Validates that a callbackUrl is a safe relative path (no open redirect).
 * Only allows paths that start with "/" and don't contain "//", preventing
 * protocol-relative URLs like //evil.com or absolute URLs like https://evil.com.
 */
function isSafeCallbackPath(path: string): boolean {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("\\")
  )
}

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
      // Only allow relative paths as callbackUrl to prevent open redirect
      const safePath = isSafeCallbackPath(pathname) ? pathname : "/compte"
      return NextResponse.redirect(
        new URL(`/connexion?next=${encodeURIComponent(safePath)}`, req.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*"],
}
