import Image from "next/image";
import React, { useState, useEffect } from "react";

interface CSuiteAdvisorCardProps {
  name?: string;
  title?: string;
  expertise?: string;
  avatar?:
    | string
    | { src: string; alt?: string; width: number; height: number };
  isActive?: boolean;
  isClicked?: boolean;
  isReplying?: boolean;
  isThinking?: boolean;
  isLocked?: boolean;
  primaryColor?: string;
  className?: string;
  onClick?: () => void;
}

const CSuiteAdvisorCard: React.FC<CSuiteAdvisorCardProps> = ({
  name,
  title,
  // expertise = "Strategic Leadership & Vision",
  avatar,
  isActive = false,
  isReplying = false,
  isClicked = false,
  isThinking = false,
  isLocked = false,
  primaryColor = "gray",
  className = "",
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [speakingPulse, setSpeakingPulse] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const aiMessages = isClicked ? ["Ready to assist..."] : [name || "Advisor"];

  // Color mapping for CSS custom properties
  const colorMap: Record<string, { light: string; medium: string; dark: string; shadow: string }> = {
    blue: { light: "#60a5fa", medium: "#3b82f6", dark: "#1e40af", shadow: "#3b82f6" },
    green: { light: "#4ade80", medium: "#22c55e", dark: "#15803d", shadow: "#22c55e" },
    purple: { light: "#a78bfa", medium: "#8b5cf6", dark: "#7c3aed", shadow: "#8b5cf6" },
    pink: { light: "#f472b6", medium: "#ec4899", dark: "#be185d", shadow: "#ec4899" },
    gray: { light: "#9ca3af", medium: "#6b7280", dark: "#374151", shadow: "#6b7280" },
  };

  const colors = colorMap[primaryColor] || colorMap.gray;

  useEffect(() => {
    const loadTimer = setTimeout(() => setIsLoaded(true), 200);

    // AI thinking animation
    const thinkingTimer = setInterval(() => {
      setAiThinking((prev) => !prev);
      if (!aiThinking) {
        setMessageIndex((prev) => (prev + 1) % aiMessages.length);
      }
    }, 2500);

    // Speaking pulse for meeting-like feel
    const speakingTimer = setInterval(() => {
      setSpeakingPulse((prev) => !prev);
    }, 800);

    return () => {
      clearTimeout(loadTimer);
      clearInterval(thinkingTimer);
      clearInterval(speakingTimer);
    };
  }, [aiThinking, aiMessages.length]);

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      style={{
        '--primary-light': colors.light,
        '--primary-medium': colors.medium,
        '--primary-dark': colors.dark,
        '--primary-shadow': colors.shadow,
      } as React.CSSProperties}
      className={`
        relative h-40 w-full
        bg-black border 
        ${
          isLocked
            ? "border-gray-800/40"
            : isReplying
            ? `border-${primaryColor}-400/40 shadow-lg shadow-${primaryColor}-500/10`
            : isActive
            ? "border-opacity-50 shadow-md"
            : "border-gray-800/60 hover:border-gray-700/80"
        }
        rounded-xl overflow-hidden
        ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}
        group
        transition-all duration-400 ease-out
        ${
          isLocked
            ? ""
            : "hover:shadow-xl hover:shadow-black/40"
        }
        ${
          isLocked
            ? ""
            : isReplying
            ? "scale-[1.02]"
            : isActive
            ? "scale-[1.01]"
            : "hover:scale-[1.005]"
        }
        ${className}
      `}>
      
      {/* Main Content */}
      <div className={isLocked ? "blur-sm opacity-30" : ""}>
        {/* Background Gradient */}
        <div
          className={`
          absolute inset-0 transition-all duration-500
          ${
            isReplying
              ? "bg-gradient-to-br from-black via-black to-black"
              : isActive
              ? "bg-gradient-to-br from-black via-black to-black"
              : "bg-gradient-to-br from-gray-950/50 via-black to-gray-950/30"
          }
        `}
          style={{
          background: isReplying 
            ? `linear-gradient(to bottom right, ${colors.dark}40, black, ${colors.dark}20)`
            : isActive
            ? `linear-gradient(to bottom right, ${colors.dark}30, black, ${colors.dark}10)`
            : undefined
        }}
      />

        {/* Neural Network Pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            <defs>
              <pattern
                id="neural-net"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor" />
                <line
                  x1="20"
                  y1="20"
                  x2="35"
                  y2="15"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
                <line
                  x1="20"
                  y1="20"
                  x2="5"
                  y2="25"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#neural-net)"
              className="text-blue-400"
            />
          </svg>
        </div>

        {/* Main Content - Centered Layout */}
        <div className="relative z-10 p-4 h-full flex flex-col">
          {/* Status Bar */}
          <div className="flex items-center justify-between mb-4">
            {/* AI Terminal Status */}
            <div
              className={`
              flex items-center gap-1.5 px-2 py-1 rounded-full text-xs
              ${
                isReplying
                  ? "bg-opacity-40 border border-opacity-30"
                  : isActive
                  ? "bg-opacity-50 border border-opacity-40"
                  : "bg-gray-900/60 border border-gray-700/40 text-gray-400"
              }
              transition-all duration-300
            `}
            style={{
              backgroundColor: isReplying 
                ? `${colors.dark}40`
                : isActive
                ? `${colors.dark}50`
                : undefined,
              borderColor: isReplying
                ? `${colors.medium}30`
                : isActive
                ? `${colors.dark}40`
                : undefined,
              color: isReplying
                ? colors.light
                : isActive
                ? colors.medium
                : undefined
            }}
          >
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div
                  className={`
                  w-1 h-1 rounded-full transition-colors duration-300
                  ${
                    isReplying
                      ? "animate-pulse"
                      : "bg-green-400"
                  }
                `}
                style={{
                  backgroundColor: isReplying ? colors.medium : undefined
                }}
              ></div>
              </div>
              <span className="font-mono ml-1">
                {isThinking
                  ? "thinking"
                  : isReplying
                  ? "responding"
                  : isActive
                  ? "active"
                  : "ready"}
              </span>
            </div>

            {/* Status Indicator */}
            <div
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${
                  isThinking
                    ? "bg-yellow-400 animate-pulse shadow-sm shadow-yellow-400/50"
                    : isReplying
                    ? `bg-${primaryColor}-400 animate-pulse shadow-sm shadow-${primaryColor}-400/50`
                    : isActive
                    ? `bg-${primaryColor}-500`
                    : "bg-emerald-500"
                }
              `}></div>
          </div>

          {/* Center Section - Avatar & Info */}
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
            {/* Avatar */}
            <div className="relative">
              <div
                className={`
                w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-500
                ${
                  isThinking
                    ? "border-yellow-400/60 shadow-lg shadow-yellow-400/20"
                    : isReplying
                    ? `border-${primaryColor}-400/60 shadow-lg shadow-${primaryColor}-400/20`
                    : isActive
                    ? `border-${primaryColor}-500/50 shadow-md shadow-${primaryColor}-500/20`
                    : "border-gray-700/60 group-hover:border-gray-600/80"
                }
              `}>
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={name || "Advisor"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`
                    w-full h-full flex items-center justify-center relative overflow-hidden
                    ${
                      isReplying
                        ? `bg-gradient-to-br from-${primaryColor}-600 to-${primaryColor}-800`
                        : isActive
                        ? `bg-gradient-to-br from-${primaryColor}-700 to-${primaryColor}-900`
                        : "bg-gradient-to-br from-gray-700 to-gray-900"
                    }
                    transition-all duration-500
                  `}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0">
                      <div
                        className={`
                        w-full h-full transition-opacity duration-500
                        ${
                          isActive || isReplying
                            ? `bg-gradient-to-br from-${primaryColor}-400/15 via-transparent to-${primaryColor}-400/10`
                            : "bg-gradient-to-br from-white/8 via-transparent to-white/4"
                        }
                      `}></div>
                    </div>

                    {/* Role Icon */}
                    <svg
                      className={`
                      w-7 h-7 relative z-10 transition-colors duration-300
                      ${
                        isActive || isReplying
                          ? `text-${primaryColor}-200`
                          : "text-gray-300"
                      }
                    `}
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7C14.4 7 14 7.4 14 8S14.4 9 15 9H21ZM3 9H9C9.6 9 10 8.6 10 8S9.6 7 9 7H3V9ZM12 7.5C13.7 7.5 15 8.8 15 10.5V11H21V13H15V22H13V13H11V22H9V13H3V11H9V10.5C9 8.8 10.3 7.5 12 7.5Z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Speaking Indicator - Subtle meeting-style */}
              {(isReplying || isThinking) && (
                <div
                  className={`
                  absolute -top-1 -right-1 w-3 h-3 rounded-full border border-black
                  transition-all duration-500
                  ${
                    speakingPulse
                      ? isThinking
                        ? "bg-yellow-400 scale-110"
                        : `bg-${primaryColor}-400 scale-110`
                      : isThinking
                      ? "bg-yellow-500 scale-100"
                      : `bg-${primaryColor}-500 scale-100`
                  }
                `}></div>
              )}

              {/* Active Checkmark */}
              {isActive && !isReplying && !isThinking && (
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 bg-${primaryColor}-500 rounded-full border-2 border-black flex items-center justify-center`}>
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>

            {/* AI Chat Simulation */}
            <div className="w-full max-w-[80%]">
              <div
                className={`
                px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-2
                transition-all duration-700
                ${
                  isThinking
                    ? "bg-yellow-900/40 text-yellow-300 border border-yellow-700/30"
                    : isReplying
                    ? `bg-${primaryColor}-900/40 text-${primaryColor}-300 border border-${primaryColor}-700/30`
                    : isActive
                    ? `bg-${primaryColor}-950/50 text-${primaryColor}-400 border border-${primaryColor}-800/40`
                    : "bg-gray-900/60 text-gray-500 border border-gray-800/40"
                }
                ${aiThinking ? "opacity-100" : "opacity-70"}
              `}>
                {(isReplying || isThinking) && (
                  <svg
                    className="w-3 h-3 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
                <span className="font-mono">
                  {isThinking
                    ? "Thinking..."
                    : isReplying
                    ? "Responding..."
                    : aiMessages[messageIndex]}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section - Name & Info */}
          <div
            className={`
            text-center space-y-1
            transition-all duration-500 ease-out
            ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}
          `}>
            {/* Name */}
            <h3
              className={`
              text-sm font-semibold leading-tight transition-colors duration-300
              ${
                isReplying
                  ? `text-${primaryColor}-200`
                  : isActive
                  ? `text-${primaryColor}-100`
                  : "text-white group-hover:text-gray-100"
              }
            `}>
              {name}
            </h3>

            {/* Title */}
            <p
              className={`
              text-xs font-medium transition-colors duration-300
              ${
                isReplying
                  ? `text-${primaryColor}-400`
                  : isActive
                  ? `text-${primaryColor}-300`
                  : "text-gray-400 group-hover:text-gray-300"
              }
            `}>
              {title}
            </p>

            {/* Call to action hint */}
            <div
              className={`
              flex items-center justify-center gap-1 pt-0.5 opacity-0 group-hover:opacity-100 
              transition-all duration-300 text-xs
              ${isActive ? `text-${primaryColor}-400` : "text-gray-500"}
            `}>
              <span>Add to chat</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Subtle Glow Effects */}
        {isActive && (
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-br from-${primaryColor}-500/5 via-transparent to-${primaryColor}-500/5 pointer-events-none`}></div>
        )}

        {isReplying && (
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-br from-${primaryColor}-400/8 via-transparent to-${primaryColor}-400/8 pointer-events-none`}></div>
        )}

        {/* Hover Effect */}
        {!isLocked && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-500/3 via-transparent to-gray-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        )}

        {/* Click Ripple */}
        {!isLocked && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-150 pointer-events-none"></div>
        )}
      </div>

      {/* Locked State Overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="flex flex-col items-center space-y-2">
            {/* Lock Icon */}
            <div className="w-12 h-12 rounded-full bg-gray-800/90 border border-gray-600/50 flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24">
                <path d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M12,3A3,3 0 0,1 15,6V8H9V6A3,3 0 0,1 12,3Z" />
              </svg>
            </div>
            {/* Locked Text */}
            <div className="text-center">
              <p className="text-xs font-medium text-gray-400">Locked</p>
              <p className="text-xs text-gray-500 mt-1">Coming Soon!!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSuiteAdvisorCard;