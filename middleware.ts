// middleware.ts
import { updateSession } from "./utils/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - login
     * - register
     * - auth (auth confirmation, etc.)
     * - favicon.ico
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - public folder files
     */
    "/((?!login|register|auth|favicon.ico|api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
