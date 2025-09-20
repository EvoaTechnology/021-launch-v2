import React from "react";
import { FileText } from "lucide-react";
import clsx from "clsx";

interface ProgressBarProps {
  label?: string;
  percentage: number; // 0–100
  color?: string; // Tailwind classes or custom gradient
  showReportIcon?: boolean;
  onReportClick?: () => void;
  className?: string; // For external positioning (e.g., ml-auto in header)
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  percentage,
  color = "bg-gradient-to-r from-red-500 via-purple-600 to-blue-600",
  showReportIcon,
  onReportClick,
  className = "",
}) => {
  // Clamp percentage to avoid overflow
  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={clsx("flex items-center gap-3 group", className)}>
      {/* Label (optional) */}
      {label && (
        <span className="text-sm font-medium text-white/90 whitespace-nowrap tracking-wide">
          {label}
        </span>
      )}

      {/* Progress track */}
      <div className="flex-1 relative min-w-[160px]">
        <div
          className="w-full h-[15px] bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 
                     rounded-full overflow-hidden shadow-lg border border-white/10 backdrop-blur-sm
                     hover: hover:shadow-xl transition-all duration-500 ease-out">
          {/* Progress fill */}

          <div
            className={clsx(
              "h-full transition-all duration-700 ease-out rounded-full relative overflow-hidden",
              "group-hover:brightness-125 group-hover:saturate-110",
              color
            )}
            style={{ width: `${safePercentage}%` }}>
            {/* Animated shimmer effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                         animate-pulse opacity-60 rounded-full"
            />
            {/* Top highlight */}
            {/* <div 
              className="absolute top-0 left-0 right-0 h-1/2 
                         bg-gradient-to-b from-white/20 to-transparent rounded-full"
            /> */}
          </div>

          {/* Enhanced glowing sphere indicator */}
          <div
            className="absolute top-1/2 w-5 h-5 rounded-full transition-all duration-500 ease-out
                       group-hover: group-hover:brightness-125"
            style={{
              left: `${safePercentage}%`,
              // transform: "translate(-50%, -50%)",
              // background: `
              //   radial-gradient(
              //     circle,
              //     rgba(255,255,255,0.95) 0%,
              //     rgba(255,255,255,0.7) 30%,
              //     rgba(255,255,255,0.3) 60%,
              //     rgba(255,255,255,0.1) 100%
              //   )
              // `,
              // boxShadow: `
              //   0 0 8px rgba(255,255,255,0.8),
              //   0 0 16px rgba(255,255,255,0.5),
              //   0 0 24px rgba(255,255,255,0.3),
              //   0 0 32px rgba(255,255,255,0.15),
              //   inset 0 0 8px rgba(255,255,255,0.4)
              // `,
              // border: "1px solid rgba(255,255,255,0.3)"
            }}>
            {/* Inner glow core */}
            {/* <div 
              className="absolute inset-1 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)"
              }}
            /> */}
          </div>

          {/* Percentage text inside bar center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-200 drop-shadow-sm">
              {Math.round(safePercentage)}%
            </span>
          </div>
        </div>

        {/* Percentage text overlay */}
        {/* <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
          <span className="text-xs font-bold text-white/80 bg-black/20 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
            {Math.round(safePercentage)}%
          </span>
        </div> */}
      </div>

      {/* Report icon */}
      {showReportIcon && (
        <button
          onClick={onReportClick}
          className="flex-shrink-0 group/icon relative">
          <div
            className="absolute inset-0 bg-blue-500/20 rounded-lg scale-0 group-hover/icon:scale-110 
                          transition-all duration-300 blur-md group-hover/icon:blur-sm"
          />
          <FileText
            className="relative h-7 w-7 text-blue-400 cursor-pointer 
                       group-hover/icon:text-blue-300 group-hover/icon:scale-125 
                       group-hover/icon:rotate-6 transition-all duration-400 ease-out
                       drop-shadow-lg group-hover/icon:drop-shadow-xl 
                       group-hover/icon:drop-shadow-blue-400/60"
          />
        </button>
      )}
    </div>
  );
};

export default ProgressBar;
