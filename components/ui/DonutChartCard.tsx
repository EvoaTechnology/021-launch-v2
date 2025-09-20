"use client";

import { FC } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartCardProps {
  label: string;
  data: number[];
  colors: string[];
  onUnlock: (roleName: string) => void;
}

const DonutChartCard: FC<DonutChartCardProps> = ({
  label,
  data,
  colors,
  onUnlock,
}) => {
  const chartData = {
    datasets: [
      {
        data: data,
        backgroundColor: colors,
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    cutout: "75%",
    plugins: { tooltip: { enabled: false }, legend: { display: false } },
    responsive: true,
    maintainAspectRatio: false,
  };

  const percentage = data[0];

  return (
    <div
      className="w-full h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex flex-col items-center justify-between cursor-pointer hover:bg-white/10 transition-all duration-200"
      onClick={() => onUnlock(label)}>
      {/* Title */}
      <p className="text-white text-[12px] font-normal">{label}</p>

      {/* Doughnut Chart */}
      <div className="relative w-18 h-18">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-sm">
          <p className="font-bold text-[12px]">{percentage}%</p>
        </div>
      </div>

      {/* Unlock indicator */}
      <div className="text-[8px] text-white/60 mt-1">
        {data[1] === 0 ? "Click to unlock" : "Unlocked"}
      </div>
    </div>
  );
};

export default DonutChartCard;
