// login/actions.ts
"use server";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("Wrong credentials. Please check your email and password.");
    }
    if (error.message.includes("Email not confirmed")) {
      throw new Error("Please verify your email before logging in.");
    }
    throw new Error(error.message);
  }

  // ✅ Success → just return (no redirect)
  return { ok: true };
}
