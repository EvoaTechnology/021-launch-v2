import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Debug environment variables
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error("❌ Missing Supabase environment variables in browser");
    throw new Error("Supabase environment variables are not configured");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
