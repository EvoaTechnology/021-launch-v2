"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { login } from "./action";
import { motion } from "framer-motion";
import Link from "next/link";
  

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    // Trigger auth check once (guarded in the store)
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
  if (isAuthenticated && user) {
    router.replace("/"); // redirect to home instead of /chat
  }
}, [isAuthenticated, user, router]);


  // Show loading while checking authentication
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking authentication...</p>
        </div>
      </main>
    );
  }

 const handleSubmit = async (formData: FormData) => {
  setIsLoading(true);
  setError(null);

  try {
    await login(formData);
    router.replace("/chat"); // ✅ redirect only here
  } catch (err: any) {
    setError(err.message || "Login failed. Please check your credentials.");
  } finally {
    setIsLoading(false);
  }
};



  return (
    <div style={{
      background: "linear-gradient(220deg, rgb(15, 15, 16) 20%, rgb(7, 20, 52) 40%, rgb(22, 21, 21) 100%",
    }} className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Radiant Background Elements */}
      <div className="absolute inset-0 overflow-hidden">

        {/* Geometric shapes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute -right-32 md:-right-64 top-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 border border-gray-700 rounded-full"
        />

        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute -left-16 md:-left-32 top-1/6 w-48 h-48 md:w-64 md:h-64 border border-gray-700 rounded-full"
        />

        <motion.div
          initial={{ opacity: 0, x: -150 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, delay: 0.7 }}
          className="absolute -left-24 md:-left-48 bottom-1/6 w-56 h-56 md:w-80 md:h-80 border border-gray-700 rounded-full"
        />

        {/* Square outlines */}
        <motion.div
          initial={{ opacity: 0, rotate: -45 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="hidden md:block absolute right-8 top-16 w-24 h-24 border border-gray-700"
        />
        <motion.div
          initial={{ opacity: 0, rotate: 45 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="hidden md:block absolute right-32 bottom-32 w-32 h-32 border border-gray-700"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full opacity-80"></div>
          </div>
          <span className="text-lg sm:text-xl font-semibold">021 AI</span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-gray-300 hover:text-white transition-colors">
            Home
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-md space-y-6 p-8 bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2" style={{
              background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 30%, #64748b 60%, #e2e8f0 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Welcome back
            </h1>
            <p className="text-gray-300">
              Log in to access your AI workspace.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm">
              {error}
            </motion.div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all duration-300"
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all duration-300"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/25">
              {isLoading ? "Signing in..." : "Log In"}
            </motion.button>
          </form>
          
          <p className="text-center text-gray-300">
            New here?{" "}
            <a href="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
              Create an account
            </a>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
