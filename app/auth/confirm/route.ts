import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { connectToDB } from "@/lib/connectToDB";
import User from "@/model/User";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/chat";

  if (process.env.NODE_ENV === "development") {
    console.log("🔧 Email confirmation attempt:", {
      code: !!code,
      token_hash: !!token_hash,
      type,
      next,
      allParams: Object.fromEntries(searchParams.entries()),
    });
  }

  const supabase = await createClient();

  // if (code) {
  //   console.log("📧 Using code-based verification");

  //   const email = searchParams.get("email"); // 👈 add this
  //   if (!email) {
  //     console.error("❌ Missing email in verification URL");
  //     return redirect("/error?message=missing-email");
  //   }

  //   const { error } = await supabase.auth.verifyOtp({
  //     type: "email",      // 👈 this requires email
  //     token: code,
  //     email: email,       // ✅ required for this type
  //   });

  //   if (error) {
  //     console.error("❌ Code-based verification failed:", error.message);
  //     return redirect("/error?message=email-verification-failed");
  //   }

  //   console.log("✅ Code-based email verification successful");
  //   return redirect(next);
  // }

  if (token_hash && type) {
    if (process.env.NODE_ENV === "development")
      console.log("📧 Using token_hash-based verification");
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error("❌ Token-hash verification failed:", error.message);
      return redirect("/error?message=email-verification-failed");
    }

    if (process.env.NODE_ENV === "development")
      console.log("✅ Token-hash verification successful");

    // Step 2: Get the verified user from Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("❌ No user found after verification");
      return redirect("/error?message=user-not-found");
    }

    if (process.env.NODE_ENV === "development") {
      console.log("👤 Verified user:", {
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at,
      });
    }

    // Step 3: Connect to MongoDB and create user if not exists
    if (process.env.NODE_ENV === "development")
      console.log("🔍 Checking MongoDB for existing user...");
    await connectToDB();

    const existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      if (process.env.NODE_ENV === "development")
        console.log("✅ User already exists in MongoDB:", user.email);
    } else {
      if (process.env.NODE_ENV === "development")
        console.log("📝 Creating new user in MongoDB...");

      // Create new user in MongoDB
      const newUser = new User({
        name: user.email?.split("@")[0] || "User", // Use email prefix as name
        email: user.email,
        role: "user",
        ideaValidated: false,
      });

      await newUser.save();
      if (process.env.NODE_ENV === "development")
        console.log("✅ User created in MongoDB:", newUser._id);
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        "🎉 Email verification and user setup complete, redirecting to:",
        next
      );
    }
    return redirect(next);
  }

  console.warn("❌ Missing code or token_hash in verification URL");
  return redirect("/error?message=invalid-verification-link");
}
