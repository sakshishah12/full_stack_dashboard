import React, { useEffect, useState, useRef } from "react";
import { fetchRevenueProfitability } from "../services/api";
import { Chart, registerables } from "chart.js";
import "../index.css";
Chart.register(...registerables);

const RevenueProfitability = () => {
  const trcChartRef = useRef(null); // Total Revenue Contribution
  const agsChartRef = useRef(null); // ADR by Guest Segment
  const accChartRef = useRef(null); // ADR by Channel
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchRevenueProfitability()
      .then((response) => setData(response.revenueProfitability))
      .catch((error) => console.error("Error fetching revenue data:", error));
  }, []);

  useEffect(() => {
    if (!data || !trcChartRef.current || !agsChartRef.current || !accChartRef.current) return;

    const destroyChart = (chartRef) => {
      if (chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }
    };

    destroyChart(trcChartRef);
    destroyChart(agsChartRef);
    destroyChart(accChartRef);

    // Total Revenue Contribution (Donut Chart)
    trcChartRef.current.chartInstance = new Chart(trcChartRef.current.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: ["Rooms", "F&B", "Spa", "Other"],
          datasets: [{
            label: "Revenue Contribution",
            data: Object.values(data.revenueBreakdown),
            backgroundColor: ["#3b82f6", "#f59e0b", "#10b981", "#a0aec0"],
            borderColor: "white",
            borderWidth: 2,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          cutout: "70%",
          plugins: {
            legend: {
              display: true,
              position: "right"
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  let total = tooltipItem.dataset.data.reduce((sum, value) => sum + value, 0);
                  let percentage = ((tooltipItem.raw / total) * 100).toFixed(1);
                  return `${tooltipItem.label}: ${tooltipItem.raw} (${percentage}%)`;
                }
              }
            },
            title: {
              display: true,
              text: "Total Revenue Contribution",
              font: {
                size: 16
              }
            }
          }
        }
      });
      

    // ADR by Guest Segment (Bar Chart)
    agsChartRef.current.chartInstance = new Chart(agsChartRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Transient", "Corporate", "Group", "OTA"],
        datasets: [{
          label: "ADR",
          data: Object.values(data.revenueBySegment),
          backgroundColor: ["#3b82f6", "#f59e0b", "#10b981", "#6b7280"],
          borderRadius: 4,
          barPercentage: 0.7
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });

    // ADR by Channel (Bar Chart) - Now Added
    accChartRef.current.chartInstance = new Chart(accChartRef.current.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Direct", "OTA Global", "GDS", "Brand.com"],
        datasets: [{
          label: "ADR",
          data: Object.values(data.revenueByChannel),
          backgroundColor: ["#f43f5e", "#fb923c", "#22c55e", "#38bdf8"],
          borderRadius: 4,
          barPercentage: 0.7
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false } // No legend
        }
      }
    });

  }, [data]);

  if (!data) return <p className="loading">Loading Revenue & Profitability Data...</p>;

  return (
    <div className="revenue-container">
  <div className="kpi-section-title">Revenue & Profitability Deep Dive</div>

  <div className="revenue-wrapper">
  <hr className="kpi-divider" />
    {/* Revenue Cards */}
    <div className="revenue-cards">
      <div className="revenue-card">
        <p className="revenue-card-title">TRevPAR</p>
        <p className="revenue-card-value">${data.trevpar}<br />
          <span className={`kpi-change ${data.trevparChange.includes('-') ? 'text-negative' : 'text-positive'}`}>
            {data.trevparChange}
          </span>
        </p>
      </div>
      <div className="revenue-card">
        <p className="revenue-card-title">Net ADR</p>
        <p className="revenue-card-value">${data.netADR}<br />
          <span className={`kpi-change ${data.netADRChange.includes('-') ? 'text-negative' : 'text-positive'}`}>
            {data.netADRChange}
          </span>
        </p>
      </div>
      <div className="revenue-card">
        <p className="revenue-card-title">Rooms Dept Profit %</p>
        <p className="revenue-card-value">{data.roomsDeptProfit}%<br />
          <span className={`kpi-change ${data.roomsDeptProfitChange.includes('-') ? 'text-negative' : 'text-positive'}`}>
            {data.roomsDeptProfitChange}
          </span>
        </p>
      </div>
    </div>

    {/* Revenue Charts Below */}
    <div className="revenue-charts">
      <div className="chart-container"><canvas ref={trcChartRef}></canvas></div>
      <div className="chart-container"><canvas ref={agsChartRef}></canvas></div>
      <div className="chart-container"><canvas ref={accChartRef}></canvas></div>
    </div>
  </div>
</div>

  );
};

export default RevenueProfitability;
