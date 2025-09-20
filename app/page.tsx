"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import { useAuthStore } from "./store/authStore";
import { User,LogOut } from "lucide-react";

const LandingPage: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const glowControls = useAnimation();
  const {user, isAuthenticated, checkAuth } = useAuthStore();
  const { signOut } = useAuthStore();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  
  // Handle sending idea to chat
  const handleSendIdea = () => {
    if (!inputValue.trim()) return;
    
    // Store the input in sessionStorage to retrieve it in the chat page
    sessionStorage.setItem('newChatMessage', inputValue);
    
    // Set flag to create a new chat session
    sessionStorage.setItem('createNewChat', 'true');
    
    // Navigate to login if not authenticated, otherwise to chat
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      router.push('/chat');
    }
  };

  React.useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.warn(
        "⚠️ Missing Supabase environment variables. Please check your .env.local file."
      );
    }
  }, []);

  useEffect(() => {
    // Trigger auth check once (guarded in the store)
    checkAuth();
  }, [checkAuth])
  

  const GradientAnimatedText = (text: string) => (
    <motion.span
      className="relative"
      style={{
        background:
          "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 30%, #64748b 60%, #e2e8f0 100%)",
        backgroundSize: "200% 200%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        filter: "drop-shadow(0 0 2px rgba(14, 14, 15, 0.5))",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.02,
        filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))",
      }}>
      {text}
    </motion.span>
  );


  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{
        background: "linear-gradient(220deg, rgb(15, 15, 16) 20%, rgb(7, 20, 52) 40%, rgb(22, 21, 21) 100%",
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none z-10">
          {/* 0 - Bottom left to center-left */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 1 }}
            className="absolute text-[40rem] font-bold"
            style={{
              bottom: "-10rem",
              left: "-4rem",
              lineHeight: 1,
              color: "#060b16", // darkest navy blue
              WebkitTextStroke: "0.5px grey",
            }}
          >
            0
          </motion.h1>

          {/* 2 - Center of screen */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 1.2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40rem] font-bold"
            style={{
              lineHeight: 1,
              color: "#060b16", // darkest navy blue
              WebkitTextStroke: "0.5px grey",
            }}
          >
            2
          </motion.h1>

          {/* 1 - Top right to center-right */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 1.4 }}
            className="absolute text-[40rem] font-bold"
            style={{
              top: "-6rem",
              right: "-2rem",
              lineHeight: 1,
              color: "#060b16", // darkest navy blue
              WebkitTextStroke: "0.5px grey",
            }}
          >
            1
          </motion.h1>
        </div>


        {/* Large circle outline on the right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute -right-32 md:-right-64 top-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 border border-gray-700 rounded-full"
        />

        {/* Smaller circles on the left */}
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

        {/* Square outlines on the right - hidden on mobile */}
        {/* <motion.div
          initial={{ opacity: 0, rotate: -45 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="hidden md:block absolute right-8 top-16 w-24 h-24 border border-gray-700"
        /> */}
        <motion.div
          initial={{ opacity: 0, rotate: 45 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="hidden md:block absolute right-32 bottom-32 w-32 h-32 border border-gray-700"
        />
      </div>

      {/* Header - responsive */}
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

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="/features"
            className="text-gray-300 hover:text-white transition-colors">
            Features
          </a>
          <a
            href="/pricing"
            className="text-gray-300 hover:text-white transition-colors">
            Pricing
          </a>
          <a
            href="https://chat.whatsapp.com/HJ5lwuCnAdGDdkQq4pbsnf?mode=ems_copy_c"
            className="text-gray-300 hover:text-white transition-colors">
            Community
          </a>
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden text-gray-300 hover:text-white">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Desktop auth buttons */}
        {isAuthenticated ? (
          <div className="relative">
  {/* User Icon Button */}
  <button
    onClick={() => setOpen(!open)}
    className="flex items-center justify-center h-10 w-10 rounded-full 
               border border-gray-200 bg-gray-800 text-gray-100 
               hover:bg-gray-700 hover:shadow-md hover:border-gray-400 
               transition-all duration-200 ease-in-out"
  >
    <User className="h-5 w-5" />
  </button>

  {/* Dropdown */}
  {open && (
    <div className="absolute right-0 mt-2 w-28 text-center bg-gray-900 text-gray-100 
                    rounded-xl shadow-lg overflow-hidden border border-gray-700 z-50">
      <button
        onClick={signOut}
        className="w-full flex items-center justify-between text-left px-4 py-2 hover:bg-gray-700 transition-colors cursor-pointer"
      >
       <LogOut className="h-4 w-4 text-red-400" /><span>Logout</span>
      </button>
    </div>
  )}
</div>
        ) : (
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <span className="inline-block px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-all duration-300 ease-in-out hover:bg-gray-700 hover:scale-105 cursor-pointer">
                Sign In
              </span>
            </Link>
            <Link href="/register">
              <span className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer">
                Sign up →
              </span>
            </Link>
          </div>
        )}

      </motion.header>

      {/* Main content - responsive */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-8">
        {/* Main heading - responsive */}
        <motion.h1
          // initial={{ y: 50, opacity: 0 }}
          // animate={{ y: 0, opacity: 1 }}
          // transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          // className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-8 sm:mb-12 max-w-5xl leading-tight"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-8 sm:mb-12 max-w-5xl leading-tight"
          style={{
            background:
              "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 30%, #64748b 60%, #e2e8f0 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 2px rgba(148, 163, 184, 0.5))",
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          whileHover={{
            scale: 1.02,
            filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))",
          }}>
          What do you want to build?
        </motion.h1>

        {/* Chat bubble with glowing hover effect and framer motion */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          onHoverStart={() => {
            glowControls.start({
              boxShadow: [
                "0 0 20px rgba(34, 211, 238, 0.4)",
                "0 0 40px rgba(34, 211, 238, 0.6)",
                "0 0 20px rgba(34, 211, 238, 0.4)",
              ],
              transition: { duration: 2, repeat: Infinity },
            });
          }}
          onHoverEnd={() => {
            glowControls.start({
              boxShadow: "0 0 0px rgba(34, 211, 238, 0)",
              transition: { duration: 0.5 },
            });
          }}
          className="mb-8 relative group cursor-pointer">
          {/* Glowing background layers */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-xl"
            initial={{ opacity: 0, scale: 1 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/10 to-blue-500/10 blur-2xl"
            initial={{ opacity: 0, scale: 1 }}
            whileHover={{ opacity: 1, scale: 1.25 }}
            transition={{ duration: 0.7 }}
          />

          {/* Main chat bubble */}
          <motion.div
            animate={glowControls}
            className="relative bg-gray-800 rounded-full px-4 sm:px-6 py-3 flex items-center space-x-3 border border-gray-700 group-hover:border-cyan-400/50 transition-all duration-300">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-cyan-400/50 transition-shadow duration-300">
              <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
            </motion.div>

            {/* Textured text with gradient and animations */}
            <motion.span
              className="text-xs sm:text-sm font-medium relative"
              style={{
                background:
                  "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 30%, #64748b 60%, #e2e8f0 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 2px rgba(44, 77, 123, 0.5))",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{
                scale: 1.02,
                filter: "drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))",
              }}>
              Hi! I`m 021 AI. Pitch your startup idea and I`ll help you validate
              it
            </motion.span>
          </motion.div>

          {/* Animated light particles with framer motion */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.5 }}>
            <motion.div
              className="absolute top-2 left-8 w-1 h-1 bg-cyan-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0,
              }}
            />
            <motion.div
              className="absolute top-4 right-12 w-1 h-1 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute bottom-3 left-16 w-1 h-1 bg-cyan-300 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 1,
              }}
            />
            <motion.div
              className="absolute bottom-2 right-8 w-1 h-1 bg-blue-300 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 1.5,
              }}
            />
          </motion.div>
        </motion.div>

        {/* Input area - responsive */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          className="w-full max-w-3xl mb-6 sm:mb-8">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendIdea();
                }
              }}
              placeholder="Type here........"
              className="w-full h-32 sm:h-38 bg-gray-800/90 border border-gray-600 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all duration-300 pr-12"
            />

            {/* Upward arrow send button */}
            <button
              type="button"
              className="absolute bottom-4 right-4 text-white hover:text-blue-400 focus:outline-none transition-all duration-300 transform hover:scale-125 hover:shadow-[0_0_20px_#3b82f6] focus:shadow-[0_0_25px_#3b82f6] bg-gradient-to-br to-blue-700/30 backdrop-blur-md rounded-full w-12 h-12 flex items-center justify-center"
              onClick={handleSendIdea}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6">
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 17.25a.75.75 0 01-1.5 0v-5.19l-1.72 1.72a.75.75 0 11-1.06-1.06l3-3a.75.75 0 011.06 0l3 3a.75.75 0 11-1.06 1.06l-1.72-1.72v5.19z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Category buttons - responsive */}

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
          className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-2xl">
          {["E-commerce App", "Saas Platform", "AI Tool", "Mobile Game"].map(
            (item, index) => (
              <motion.button
                key={item}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                onClick={() => {
                  setInputValue(item);
                  // Focus on the textarea
                  document.querySelector('textarea')?.focus();
                }}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg transition-colors">
                {GradientAnimatedText(item)}
              </motion.button>
            )
          )}
        </motion.div>
      </main>
      {/* Compact Footer */}
      <footer className="relative z-10 bg-gray-900/60 backdrop-blur-sm border-t border-gray-800/50 py-3 text-center text-xs text-gray-500">
  <div className="max-w-6xl mx-auto px-4">
    <div className="flex justify-center text-xl gap-4 text-gray-400">
      <Link
        href="/contact"
        className="hover:text-white transition-colors duration-200">
        Contact Us
      </Link>
    </div>
    {/* Social Icons BELOW the links row */}
    <div className="flex items-center justify-center gap-4 mt-2">
      {/* WhatsApp */}
      <a
        href="https://chat.whatsapp.com/HJ5lwuCnAdGDdkQq4pbsnf?mode=ems_copy_c"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="text-gray-400 hover:text-white transition-colors duration-200"
      >
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      {/* Gmail */}
      <a
        href="https://mail.google.com/mail/?view=cm&fs=1&to=connectevoa@gmail.com"
        aria-label="Gmail"
        className="text-gray-400 hover:text-white transition-colors duration-200"
      >
        <svg className="w-8 h-8" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
        </svg>
      </a>

      {/* Instagram */}
      <a
        href="https://www.instagram.com/evoaofficial?igsh=MTJkN2F3OTJudjc2aw%3D%3D&utm_source=qr"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="text-gray-400 hover:text-white transition-colors duration-200"
      >
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href="https://www.linkedin.com/company/evo-a/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className="text-gray-400 hover:text-white transition-colors duration-200"
      >
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
    </div>
    <p className="m-2">
      © {new Date().getFullYear()} Evoa / 021 AI. All rights reserved.
    </p>
  </div>
</footer>
    </div>
  );
};

export default LandingPage;
