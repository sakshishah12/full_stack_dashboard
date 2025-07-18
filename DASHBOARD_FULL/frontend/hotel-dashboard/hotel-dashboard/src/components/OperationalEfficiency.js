import React, { useEffect, useState, useRef } from "react";
import { fetchOperationalEfficiency } from "../services/api";
import { Chart, registerables } from "chart.js";
import "../index.css";

Chart.register(...registerables);

const OperationalEfficiency = () => {
  const trendChartRef = useRef(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchOperationalEfficiency()
      .then((response) => setData(response.operationalEfficiency))
      .catch((error) => console.error("Error fetching efficiency data:", error));
  }, []);

  useEffect(() => {
    if (!data || !trendChartRef.current) return;
  
    if (trendChartRef.current.chartInstance) {
      trendChartRef.current.chartInstance.destroy();
    }
  
    trendChartRef.current.chartInstance = new Chart(trendChartRef.current.getContext("2d"), {
      type: "line",
      data: {
        labels: data.efficiencyTrend.months,
        datasets: [
          {
            label: "CPOR",
            data: data.efficiencyTrend.cporData,
            borderColor: "#f59e0b", // Orange accent color
            tension: 0.4, // Smooth curve
            pointBackgroundColor: "#f59e0b",
            yAxisID: "yCurrency"
          },
          {
            label: "LCP",
            data: data.efficiencyTrend.lcpData,
            borderColor: "#10b981", // Green accent color
            tension: 0.4, // Smooth curve
            pointBackgroundColor: "#10b981",
            yAxisID: "yPercentage"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" }
        },
        scales: {
          x: {
            ticks: { font: { size: 12, weight: "bold" } }
          },
          yCurrency: {
            type: "linear",
            position: "left",
            ticks: {
              callback: (value) => `$${value}`,
              font: { size: 12 },
              color: "#718096"
            },
            grid: { color: "#edf2f7", drawBorder: false },
            border: { display: false }
          },
          yPercentage: {
            type: "linear",
            position: "right",
            grid: { drawOnChartArea: false },
            ticks: {
              callback: (value) => `${value}%`,
              font: { size: 12 },
              color: "#718096"
            }
          }
        }
      }
    });
  }, [data]);
  

  if (!data) return <p className="loading">Loading Operational Efficiency Data...</p>;

  return (
    <div className="ops-cost-wrapper">
      <h2 className="kpi-section-title">Operational Efficiency & Cost Management</h2>
      <hr className="kpi-divider" />

      {/* KPI Cards */}
      <div className="ops-cost-cards">
        {[
          { title: "ALOS", value: `${data.alos} N`, change: "" },
          { title: "CPOR", value: `$${data.cpor}`, change: data.cporChange },
          { title: "LCP", value: `${data.lcp}%`, change: data.lcpChange },
          { title: "LCOR", value: `$${data.lcor}`, change: data.lcorChange },
          { title: "Energy/Occ Room", value: `${data.energyPerOccRoom}`, change: "" }
        ].map((metric, index) => (
          <div key={index} className="ops-cost-card">
            <h3 className="kpi-title">{metric.title}</h3>
            <p className="kpi-value">{metric.value}</p>
            {metric.change && (
              <p className={`kpi-change ${metric.change.includes('-') ? 'kpi-change-negative' : 'kpi-change-positive'}`}>
                {metric.change}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="ops-cost-charts">
        <div className="ops-chart-container">
          <canvas ref={trendChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default OperationalEfficiency;
