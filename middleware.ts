import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define Public Route Rules
  const isPublicFormRoute =
    pathname.startsWith("/forms/") ||
    /^\/api\/v1\/forms\/[^/]+\/submit$/.test(pathname);

  const isPublicAuthRoute =
    pathname.startsWith("/api/auth") || pathname === "/login";

  const isStaticFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".");

  if (isPublicFormRoute || isPublicAuthRoute || isStaticFile) {
    return NextResponse.next();
  }

  // 2. Extract JWT Token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isApiRoute = pathname.startsWith("/api/");

  // 3. Reject unauthenticated requests
  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "غير مصرح بالوصول. يرجى تسجيل الدخول أولاً.",
          },
        },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role Authorization Checks
  const userRoles: string[] = (token.roles as string[]) || [];
  const isSuperAdmin = userRoles.includes("super_admin");

  // Protect Tenant Management (Super Admin only)
  const isTenantManagement =
    pathname.startsWith("/tenants") ||
    pathname.startsWith("/api/v1/tenants");

  if (isTenantManagement && !isSuperAdmin) {
    if (isApiRoute) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "هذا الإجراء مخصص لمدير النظام (Super Admin) فقط.",
          },
        },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 5. Inject Tenant Context Headers into Request
  const requestHeaders = new Headers(request.headers);
  if (token.tenant_id) {
    requestHeaders.set("x-tenant-id", token.tenant_id as string);
  }
  if (token.id) {
    requestHeaders.set("x-user-id", token.id as string);
  }
  if (token.roles) {
    requestHeaders.set(
      "x-user-roles",
      JSON.stringify(token.roles)
    );
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
