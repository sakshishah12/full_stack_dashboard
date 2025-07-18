import React, { useEffect, useState, useRef } from "react";
import { fetchMarketBenchmarkingFutureOutlook } from "../services/api";
import { Chart, registerables } from "chart.js";
import "../index.css";

Chart.register(...registerables);

const MarketBenchmarking = () => {
  const barChartRef = useRef(null);
  const [data, setData] = useState(null);
  
  useEffect(() => {
  const payload = {
    hotel_name: "Hilton Garden Inn",
    hotel_location: "Stony Brook",
    start_date: "2025-07-18",
    end_date: "2025-07-24",
    actual: [25, 20, 27, 34, 34, 30, 32]
  };

  fetchMarketBenchmarkingFutureOutlook(payload)
    .then((response) => setData(response.marketBenchmarkingFutureOutlook))
    .catch((error) =>
      console.error("Error fetching market benchmarking data:", error)
    );
}, []);

 

  useEffect(() => {
    if (!data || !barChartRef.current) return;

    if (barChartRef.current.chartInstance) {
      barChartRef.current.chartInstance.destroy();
    }

    barChartRef.current.chartInstance = new Chart(
      barChartRef.current.getContext("2d"),
      {
        type: "bar",
        data: {
          labels: data.paceChartData.labels,
          datasets: data.paceChartData.datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
          },
          scales: {
            x: { ticks: { font: { size: 12, weight: "bold" } } },
            y: {
              ticks: {
                callback: function (value) {
                  return value;
                },
              },
            },
          },
        },
      }
    );
  }, [data]);

  if (!data)
    return <p className="loading">Loading Market Benchmarking Data...</p>;

  return (
    <div className="market-benchmarking-wrapper">
      <h2 className="kpi-section-title">Market Benchmarking & Future Outlook</h2>
      <hr className="kpi-divider" />

      {/* First Row of 4 KPI Cards */}
      <div className="market-benchmarking-row">
        <div className="market-benchmarking-kpi-card">
          <h3 className="kpi-title">MPI (Occupancy Index)</h3>
          <p className="kpi-value">{data.mpi}</p>
          <p className="kpi-change text-neutral">vs CompSet</p>
        </div>

        <div className="market-benchmarking-kpi-card">
          <h3 className="kpi-title">ARI (ADR Index)</h3>
          <p className="kpi-value">{data.ari}</p>
          <p className="kpi-change text-neutral">vs CompSet</p>
        </div>

        <div className="market-benchmarking-kpi-card">
          <h3 className="kpi-title">Pickup (Last 7 Days)</h3>
          <p className="kpi-value">{data.pickupRooms} Rms</p>
          <p
            className={`kpi-change ${
              parseFloat(data.pickupRevenue.replace(/[^0-9.-]/g, "")) >= 0
                ? "text-positive"
                : "text-negative"
            }`}
          >
            {data.pickupRevenue} Rev
          </p>
        </div>

        <div className="market-benchmarking-kpi-card">
          <h3 className="kpi-title">Forecast Accuracy</h3>
          <p className="kpi-value">{data.forecastAccuracy}%</p>
          <p className="kpi-change text-neutral">vs Last Mth</p>
        </div>
      </div>

      {/* Chart Row */}
      <div className="market-benchmarking-charts">
        <div className="market-chart-container">
          <canvas ref={barChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default MarketBenchmarking;
