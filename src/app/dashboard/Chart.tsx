import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Chart({
  labels,
  igData,
  tiktokData,
  title = "Grafik Engagement Rate (ER) per Hari",
  igLabel = "ER Instagram (%)",
  tiktokLabel = "ER TikTok (%)",
  yLabel = "%",
  yMin = 0,
  yMax,
  stepSize
}: {
  labels: string[];
  igData: number[];
  tiktokData: number[];
  title?: string;
  igLabel?: string;
  tiktokLabel?: string;
  yLabel?: string;
  yMin?: number;
  yMax?: number;
  stepSize?: number;
}) {
  const data = {
    labels,
    datasets: [
      {
        label: igLabel,
        data: igData,
        borderColor: "#56ad9c",
        backgroundColor: "#56ad9c22",
        tension: 0.3,
      },
      {
        label: tiktokLabel,
        data: tiktokData,
        borderColor: "#f7b731",
        backgroundColor: "#f7b73122",
        tension: 0.3,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: title },
    },
    scales: {
      y: {
        beginAtZero: yMin === 0,
        min: yMin,
        max: yMax,
        title: { display: true, text: yLabel },
        ticks: stepSize ? { stepSize } : undefined,
      },
    },
  };
  return <Line data={data} options={options} />;
}
