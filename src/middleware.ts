import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/marketing"];
const AUTH_ROUTES = ["/auth"];
const PROTECTED_PREFIX = "/app";

// Fungsi untuk memeriksa status login berdasarkan cookie token
function checkLoginStatus(req: NextRequest): boolean {
  const token = req.cookies.get("token")?.value; // Ambil nilai token dari cookie
  return !!token; // Return true jika token ada
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Cek apakah rute adalah publik, autentikasi, atau terproteksi
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isAuth = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtected = pathname.startsWith(PROTECTED_PREFIX);

  const isLoggedIn = checkLoginStatus(req);

  // Izinkan akses ke rute publik tanpa cek login
  if (isPublic) {
    return NextResponse.next();
  }

  // Redirect ke /auth/signin jika mencoba akses rute terproteksi tanpa login
  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL("/auth/signin", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect ke /app jika sudah login dan mencoba akses rute autentikasi
  if (isAuth && isLoggedIn) {
    const appUrl = new URL("/app", req.url);
    return NextResponse.redirect(appUrl);
  }

  // Lanjutkan ke rute berikutnya jika tidak ada kondisi di atas
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Tangkap semua rute kecuali file statis (misalnya .png, .js) dan _next
    "/((?!.*\\..*|_next).*)",
    // Tangkap rute API dan tRPC
    "/(api|trpc)(.*)",
  ],
};
