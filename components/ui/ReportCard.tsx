"use client";

import React, { FC, memo, useMemo } from "react";
import { Lock } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ReportCardProps {
  title: string;
  percentage: number;
  buttonText: string;
  locked?: boolean;
}

const ReportCard: FC<ReportCardProps> = ({
  title,
  percentage,
  locked = false,
}) => {
  const data = useMemo(
    () => ({
      datasets: [
        {
          data: [percentage, 100 - percentage],
          backgroundColor: locked 
            ? ["#64748B", "#374151"] 
            : ["#2563EB", "#1E293B"],
          borderWidth: 0,
        },
      ],
    }),
    [percentage, locked]
  );

  const options: ChartOptions<"doughnut"> = useMemo(
    () => ({
      cutout: "75%",
      plugins: { tooltip: { enabled: false }, legend: { display: false } },
      responsive: true,
      maintainAspectRatio: true,
      animation: false,
    }),
    []
  );

  return (
    <div className="relative w-full h-full">
      <div
        className={`relative w-full h-full backdrop-blur-md border rounded-2xl p-2 flex flex-col items-center justify-between transition-all duration-300 ${
          locked 
            ? "bg-slate-800/80 border-slate-600/40 shadow-lg" 
            : "bg-white/5 border-white/10"
        }`}
      >
        {/* Title */}
        <p className={`text-[12px] font-normal transition-colors duration-300 ${
          locked ? "text-slate-300 opacity-0" : "text-white"
        }`}>
          {title}
        </p>

        {/* Doughnut Chart */}
        <div className={`relative w-18 h-18 ${locked ? "opacity-0" : ""}`}>
          <Doughnut data={data} options={options} />
          <div className={`absolute inset-0 flex flex-col items-center justify-center text-sm transition-colors duration-300 ${
            locked ? "text-slate-300" : "text-white"
          }`}>
            <p className="font-bold text-[12px]">{percentage}%</p>
          </div>
        </div>

        {/* Locked Overlay */}
        {locked && (
          <div className="absolute inset-0 z-10 rounded-2xl bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-transparent ">
              <div className="p-2 rounded-lg bg-slate-700/70 border border-slate-600/50">
                <Lock className="w-4 h-4 text-slate-300" />
              </div>
              <span className="text-xs font-medium text-slate-200 tracking-wide">LOCKED</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(
  ReportCard,
  (prev, next) =>
    prev.percentage === next.percentage &&
    prev.locked === next.locked &&
    prev.title === next.title
);