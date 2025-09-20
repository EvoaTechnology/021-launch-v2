"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { connectToDB } from "@/lib/connectToDB";
import User from "@/model/User";

// Email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length > 5; // Ensure reasonable length
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("📩 Signup attempt:", email);

  // Validate email format before sending to Supabase
  if (!isValidEmail(email)) {
    console.error("❌ Invalid email format:", email);
    return { error: "Please enter a valid email address" };
  }

  // Validate password length
  if (!password || password.length < 6) {
    console.error("❌ Password too short");
    return { error: "Password must be at least 6 characters long" };
  }

  // Step 1: Check MongoDB for existing user
  console.log("🔍 Checking MongoDB for existing user...");
  await connectToDB();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.error("❌ User already exists in MongoDB:", email);
    return { error: "User already exists. Please login instead." };
  }

  console.log(
    "✅ No existing user found in MongoDB, proceeding with Supabase signup"
  );

  // Step 2: Proceed with Supabase signup
  const supabase = await createClient();

  console.log("🔧 Attempting Supabase signup with:", {
    email,
    passwordLength: password.length,
  });

  // Try signup with email confirmation
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/private`,
      data: {
        // Add any additional user metadata if needed
      },
    },
  });

  if (error) {
    console.error("❌ Supabase sign-up error:", error.message);
    console.error("❌ Error details:", error);

    // Handle specific error cases
    if (error.message.includes("invalid")) {
      return {
        error:
          "The email address format is not accepted. Please try a different email.",
      };
    }

    // Check for various "already exists" error messages
    if (
      error.message.includes("already registered") ||
      error.message.includes("already exists") ||
      error.message.includes("already been registered") ||
      error.message.includes("User already registered")
    ) {
      return {
        error: "Email already registered. Please login instead.",
      };
    }

    return { error: error.message };
  }

  console.log("✅ Sign-up successful:", {
    userId: data.user?.id,
    userEmail: data.user?.email,
    hasSession: !!data.session,
    confirmationSent: data.user?.confirmation_sent_at,
  });

  // Check if email confirmation is required
  if (data.user && !data.session) {
    console.log("📧 Email confirmation required");
    console.log("📧 User details:", {
      id: data.user.id,
      email: data.user.email,
      emailConfirmed: data.user.email_confirmed_at,
      confirmationSent: data.user.confirmation_sent_at,
    });

    // Check if this is a duplicate signup (no confirmation email sent)
    if (!data.user.confirmation_sent_at) {
      console.log("⚠️ No confirmation email sent - user might already exist");
      return {
        error:
          "Email already registered. Please check your email for confirmation or try logging in.",
      };
    }

    // redirect to a "Check your email" page instead of chat
    redirect("/verify-email");
  } else if (data.session) {
    console.log("✅ User signed in automatically");
    redirect("/chat");
  } else {
    console.log("⚠️ Unexpected signup result");
    redirect("/verify-email");
  }
}
