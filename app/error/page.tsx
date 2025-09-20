"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";

function ErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const getErrorMessage = (message: string | null) => {
    switch (message) {
      case "missing-email":
        return "Email verification link is missing required information.";
      case "email-verification-failed":
        return "Email verification failed. Please try again or request a new verification link.";
      case "user-not-found":
        return "User not found after verification. Please try registering again.";
      case "database-error":
        return "There was an error setting up your account. Please try again.";
      case "invalid-verification-link":
        return "Invalid verification link. Please check your email for the correct link.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Radiant Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none z-10">
          {/* Large letter elements */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            transition={{ duration: 1 }}
            className="absolute text-[25rem] font-medium"
            style={{
              bottom: "-6rem",
              left: "-4rem",
              lineHeight: 1,
              backgroundImage: "linear-gradient(to right, #FF6EC4, #7873F5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
            E
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            transition={{ duration: 1.2 }}
            className="absolute top-1/2 right-1/2 -translate-y-1/2 text-[28rem] font-medium"
            style={{
              lineHeight: 1,
              backgroundImage: "linear-gradient(to right, #FF6EC4, #7873F5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
            R
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            transition={{ duration: 1.4 }}
            className="absolute text-[30rem] font-medium"
            style={{
              top: "-4rem",
              right: "-2rem",
              lineHeight: 1,
              backgroundImage: "linear-gradient(to right, #FF6EC4, #7873F5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
            R
          </motion.h1>
        </div>

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
          className="absolute -left-16 md:-left-32 top-1/3 w-48 h-48 md:w-64 md:h-64 border border-gray-700 rounded-full"
        />

        <motion.div
          initial={{ opacity: 0, x: -150 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, delay: 0.7 }}
          className="absolute -left-24 md:-left-48 bottom-1/4 w-56 h-56 md:w-80 md:h-80 border border-gray-700 rounded-full"
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
          <a
            href="/"
            className="text-gray-300 hover:text-white transition-colors">
            Home
          </a>
          <a
            href="/login"
            className="text-gray-300 hover:text-white transition-colors">
            Sign In
          </a>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-md space-y-6 p-8 bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-red-400 text-6xl mb-4">⚠️</motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-3xl font-bold text-white mb-4">Oops!</motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-gray-300 mb-6">{getErrorMessage(message)}</motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/25">
              Go to Login
            </Link>
            <Link
              href="/register"
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300">
              Create New Account
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none select-none z-10">
              {/* Large letter elements */}
              <h1
                className="absolute text-[25rem] font-medium"
                style={{
                  bottom: "-6rem",
                  left: "-4rem",
                  lineHeight: 1,
                  backgroundImage: "linear-gradient(to right, #FF6EC4, #7873F5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                E
              </h1>

              <h1
                className="absolute top-1/2 right-1/2 -translate-y-1/2 text-[28rem] font-medium"
                style={{
                  lineHeight: 1,
                  backgroundImage: "linear-gradient(to right, #FF6EC4, #7873F5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                R
              </h1>

              <h1
                className="absolute text-[30rem] font-medium"
                style={{
                  top: "-4rem",
                  right: "-2rem",
                  lineHeight: 1,
                  backgroundImage: "linear-gradient(to right, #FF6EC4, #7873F5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                R
              </h1>
            </div>

            {/* Geometric shapes */}
            <div className="absolute -right-32 md:-right-64 top-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 border border-gray-700 rounded-full" />
            <div className="absolute -left-16 md:-left-32 top-1/3 w-48 h-48 md:w-64 md:h-64 border border-gray-700 rounded-full" />
            <div className="absolute -left-24 md:-left-48 bottom-1/4 w-56 h-56 md:w-80 md:h-80 border border-gray-700 rounded-full" />
            <div className="hidden md:block absolute right-8 top-16 w-24 h-24 border border-gray-700" />
            <div className="hidden md:block absolute right-32 bottom-32 w-32 h-32 border border-gray-700" />
          </div>

          {/* Header */}
          <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full opacity-80"></div>
              </div>
              <span className="text-lg sm:text-xl font-semibold">021 AI</span>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-gray-300 hover:text-white transition-colors">
                Home
              </a>
              <a
                href="/login"
                className="text-gray-300 hover:text-white transition-colors">
                Sign In
              </a>
            </div>
          </header>

          {/* Main Content */}
          <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-8">
            <div className="w-full max-w-md space-y-6 p-8 bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-white">Loading...</h1>
            </div>
          </main>
        </div>
      }>
      <ErrorContent />
    </Suspense>
  );
}
