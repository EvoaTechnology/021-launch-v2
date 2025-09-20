import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // Get the current logged-in user from the cookie/session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error fetching user:", userError);
  } else if (user) {
    if (process.env.NODE_ENV === "development")
      console.log("Logging out user:", user.email, " | ID:", user.id);
  } else {
    if (process.env.NODE_ENV === "development")
      console.log("No user currently logged in.");
  }

  // Sign out the current session
  await supabase.auth.signOut();

  // Redirect to login page
  return NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_BASE_URL)
  );
}
