import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("paku_access")?.value;
  const pathname = request.nextUrl.pathname;

  // Si intento acceder a /login estando ya autenticado, redirigir a /dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Si intento acceder a rutas protegidas sin token, redirigir a /login.
  // /paku-spa es pública: muestra los servicios sin precio a quien no inició sesión.
  if (!token && (pathname.startsWith("/dashboard") || pathname.startsWith("/account"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/account/:path*"],
};
