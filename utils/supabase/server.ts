import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies(); 

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error("❌ Missing Supabase environment variables");
    throw new Error("Supabase environment variables are not configured");
  }

  console.log("🔧 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    "🔧 Supabase Key length:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
  );

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Safe to ignore in server components
          }
        },
      },
    }
  );
}
