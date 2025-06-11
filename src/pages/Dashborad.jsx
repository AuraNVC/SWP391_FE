import React from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function Dashborad() {
  // Dữ liệu mẫu cho biểu đồ
  const healthCheckData = {
    labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
    datasets: [
      {
        label: "Khám sức khỏe định kỳ",
        data: [120, 150, 100, 180, 130, 170],
        backgroundColor: "#42a5f5",
      },
      {
        label: "Tiêm chủng",
        data: [80, 110, 90, 140, 100, 120],
        backgroundColor: "#66bb6a",
      },
    ],
  };

  const eventData = {
    labels: ["Sốt", "Cảm cúm", "Chấn thương", "Khác"],
    datasets: [
      {
        label: "Sự kiện y tế",
        data: [30, 45, 15, 10],
        backgroundColor: ["#ef5350", "#ffa726", "#ab47bc", "#29b6f6"],
      },
    ],
  };

  const lineData = {
    labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
    datasets: [
      {
        label: "Tổng số sự kiện y tế",
        data: [20, 35, 25, 40, 30, 38],
        borderColor: "#ffa726",
        backgroundColor: "rgba(255,167,38,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h2>Giám sát sức khỏe & y tế học sinh</h2>
      <div className="dashboard-charts">
        <div className="dashboard-chart">
          <h4>Khám sức khỏe & Tiêm chủng</h4>
          <Bar data={healthCheckData} options={{ responsive: true }} />
        </div>
        <div className="dashboard-chart">
          <h4>Tỉ lệ các sự kiện y tế</h4>
          <Pie data={eventData} options={{ responsive: true }} />
        </div>
        <div className="dashboard-chart">
          <h4>Biến động sự kiện y tế theo tháng</h4>
          <Line data={lineData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
}