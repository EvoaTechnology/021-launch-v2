// lib/update-session.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Required for session sync!
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public routes: exact root plus these prefixes
  const publicPrefixes = [
    "/login",
    "/register",
    "/auth",
    "/verify-email",
    "/error",
    "/pricing",
    "/private",
  ];
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    publicPrefixes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (process.env.NODE_ENV === "development") {
    console.log("🔒 Middleware check:", {
      pathname: request.nextUrl.pathname,
      isPublicRoute,
      hasUser: !!user,
    });
  }

  if (!user && !isPublicRoute) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "🚫 Unauthenticated user accessing protected route, redirecting to login"
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}
