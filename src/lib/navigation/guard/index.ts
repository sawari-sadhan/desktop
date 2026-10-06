import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const hasConsoleAuth = request.cookies.get("console_auth")?.value === "true";
  const hasDashboardAuth = !!request.cookies.get("dashboard_auth")?.value;

  // Protect Console routes
  if (path.startsWith("/console") && !path.startsWith("/console-login")) {
    if (!hasConsoleAuth) {
      return NextResponse.redirect(new URL("/console-login", request.url));
    }
  }

  // Protect Dashboard routes
  if (path.startsWith("/dashboard")) {
    if (!hasDashboardAuth) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect if already authenticated
  if (path === "/console-login" && hasConsoleAuth) {
    return NextResponse.redirect(new URL("/console", request.url));
  }

  if ((path === "/login" || path === "/register") && hasDashboardAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}


