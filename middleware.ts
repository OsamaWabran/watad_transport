import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define Public Route Rules
  const isPublicFormDefinitionRoute =
    request.method === "GET" && /^\/api\/v1\/forms\/[^/]+$/.test(pathname);

  const isPublicFormRoute =
    pathname.startsWith("/forms/") ||
    isPublicFormDefinitionRoute ||
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
  const tenantId = token.tenant_id as string | undefined;

  // Protect Tenant Management (Super Admin only)
  const isSuperAdminRoute =
    pathname.startsWith("/dashboard/tenants") ||
    pathname.startsWith("/api/v1/tenants") ||
    pathname.startsWith("/dashboard/users") ||
    pathname.startsWith("/api/v1/users");

  if (isSuperAdminRoute && !isSuperAdmin) {
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

  // Protect Tenant Admin Routes (Operational)
  const isTenantAdminRoute =
    pathname.startsWith("/dashboard/passengers") ||
    pathname.startsWith("/api/v1/passengers") ||
    pathname.startsWith("/dashboard/vehicles") ||
    pathname.startsWith("/api/v1/vehicles") ||
    pathname.startsWith("/dashboard/drivers") ||
    pathname.startsWith("/api/v1/drivers");

  // Only allow if user is NOT a super admin OR if they somehow need to access it?
  // User asked to check role and Session.user.tenant_id. Let's assume tenant admins must have a valid tenant_id.
  if (isTenantAdminRoute && (isSuperAdmin || !tenantId)) {
    if (isApiRoute) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "هذا الإجراء مخصص لإدارة المؤسسة فقط.",
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
