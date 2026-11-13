// frontend/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================
// 🎯 ROLE → DASHBOARD YAO
// ============================================
const ROLE_REDIRECTS: Record<string, string> = {
  mhasibu: "/admin/dashboard/accountant",
  mzee_kanisa: "/admin/dashboard/elder",
  it: "/admin/dashboard/it",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Tuangalie tu kama ni /admin/dashboard (exact match)
  //    — sio /admin/dashboard/it, /admin/dashboard/accountant, n.k.
  if (pathname === "/admin/dashboard" || pathname === "/admin/dashboard/") {
    // Soma cookie ya role
    const role = request.cookies.get("user_role")?.value?.toLowerCase();

    // Kama role ina dashboard yake → redirect PAPO HAPO
    if (role && ROLE_REDIRECTS[role]) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_REDIRECTS[role];
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// ============================================
// 🎯 TUNAMIA TU KWENYE /admin/dashboard
// ============================================
export const config = {
  matcher: ["/admin/dashboard"],
};