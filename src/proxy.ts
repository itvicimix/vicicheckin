import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-vici-booking-key-change-in-production"
);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect /[tenantSlug]/admin routes
  const adminMatch = pathname.match(/^\/([^/]+)\/admin/);
  
  if (adminMatch) {
    const tenantSlug = adminMatch[1];
    
    // Look for the specific cookie for this tenant
    const cookieName = `tenant_auth_${tenantSlug}`;
    const token = request.cookies.get(cookieName)?.value;

    if (!token) {
      // Not logged in, redirect to login page for this tenant
      return NextResponse.redirect(new URL(`/${tenantSlug}/login`, request.url));
    }

    try {
      // Verify the token
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Ensure the token belongs to the correct tenant
      if (payload.slug !== tenantSlug) {
        return NextResponse.redirect(new URL(`/${tenantSlug}/login`, request.url));
      }
      
      return NextResponse.next();
    } catch (error) {
      // Token invalid or expired
      return NextResponse.redirect(new URL(`/${tenantSlug}/login`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
