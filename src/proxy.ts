import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, decrypt } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const session = await decrypt(request.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = request.nextUrl;

  // Не вошёл, а идёт в админку — на страницу входа
  if (pathname.startsWith("/admin") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Уже вошёл, а открывает /login — сразу в админку
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

// На каких адресах запускать proxy. Остальные страницы он не трогает.
export const config = {
  matcher: ["/admin/:path*", "/login"],
};
