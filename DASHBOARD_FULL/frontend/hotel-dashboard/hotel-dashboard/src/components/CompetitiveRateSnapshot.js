import React, { useEffect, useState, useRef } from "react";
import { fetchCompetitiveRateSnapshot } from "../services/api";
import { Chart, registerables } from "chart.js";
import "../index.css";

Chart.register(...registerables);

const CompetitiveRateSnapshot = () => {
  const lineChartRef = useRef(null);
  const [data, setData] = useState(null);

  useEffect(() => {
  const sampleParams = {
    hotel_name: "Hilton Garden Inn",
    start_date: "2025-07-17",
    base_path: "kpi_logs"
  };

    fetchCompetitiveRateSnapshot(sampleParams)
    .then((response) => {
      console.log("Full API response:", response); // Debug log

      setData({
        ...response.competitiveRateSnapshot, // Spread core snapshot values
        localEvents: response.localEvents     // Attach localEvents directly
      });
    })
    .catch((error) => console.error("Error fetching rate data:", error));
}, []);


  useEffect(() => {
    if (!data || !lineChartRef.current) return;

    if (lineChartRef.current.chartInstance) {
      lineChartRef.current.chartInstance.destroy();
    }

    lineChartRef.current.chartInstance = new Chart(lineChartRef.current.getContext("2d"), {
      type: "line",
      data: {
        labels: data.futureRateComparison.labels,
        datasets: [
          {
            label: "Your Hotel Rate",
            data: data.futureRateComparison.yourHotelRates,
            borderColor: "#3182ce",
            backgroundColor: "rgba(49, 130, 206, 0.1)",
            fill: true,
            tension: 0.3,
            pointBackgroundColor: "#3182ce",
            pointRadius: 4
          },
          {
            label: "CompSet Median Rate",
            data: data.futureRateComparison.compSetMedianRates,
            borderColor: "#f59e0b",
            backgroundColor: "rgba(221, 107, 32, 0.1)",
            fill: true,
            tension: 0.3,
            pointBackgroundColor: "#f59e0b",
            pointRadius: 4,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
          title: {
            display: true,
            text: "Rate Comparison: Your Hotel vs. CompSet Median (Next 7 Days)",
            font: { size: 16, family: "Poppins", weight: "600" },
            color: "#2c5282",
            padding: { top: 5, bottom: 15 }
          }
        }
      }
    });
  }, [data]);

  if (!data) return <p className="loading">Loading Competitive Rate Snapshot Data...</p>;

  return (
    <div className="competitive-rate-wrapper">
  <h2 className="kpi-section-title">Competitive Rate Snapshot & External Factors</h2>
  <hr className="kpi-divider" />

  {/* First Row - 4 KPI Cards */}
  <div className="competitive-rate-cards">
    {[
      { title: "Your Lead Rate (Tonight)", value: `$${data.leadRateTonight}`, change: `vs. $${data.compSetMedianTonight} CompSet Median` },
      { title: "CompSet Median (Tonight)", value: `$${data.compSetMedianTonight}`, change: data.futureRateChange },
      { title: "CompSet Rate Range (Tonight)", value: data.compSetRateRange, change: "5 Competitors Tracked" },
      { title: "Rate Parity Status", value: data.rateParityStatus, change: data.parityDetails }
    ].map((metric, index) => (
      <div key={index} className="competitive-kpi-card">
        <h3 className="kpi-title">{metric.title}</h3>
        <p className="kpi-value">{metric.value}</p>
        <p className="kpi-change">{metric.change}</p>
      </div>
    ))}
  </div>

  {/* Second Row - 4 KPI Cards */}
  <div className="competitive-rate-cards">
    {[
      { title: "Your Rate Rank (Tonight)", value: data.rateRankTonight, change: "Above 2, Below 2" },
      { title: "Future Rate Index (Next 7D)", value: data.futureRateIndex, change: data.futureRateChange },
      { title: "Comp. Rate Changes (24h)", value: "", change: (
        <>
          <span className="text-green-600">{data.competitorRateChanges.increased} <span className="font-normal">Increased (Avg. {data.competitorRateChanges.avgIncrease})</span></span><br />
          <span className="text-red-600">{data.competitorRateChanges.decreased} <span className="font-normal">Decreased (Avg. {data.competitorRateChanges.avgDecrease})</span></span>
        </>
      ) },
      {
  title: "Local Events & Demand", 
  value: data.localEvents && data.localEvents.length > 0 ? data.localEvents[0].name : "No events",
  change: (
    <>
      {data.localEvents && data.localEvents.length > 0 && (
        <p className="kpi-change text-neutral">
          {data.localEvents[0].dates}: {data.localEvents[0].demand}
        </p>
      )}
      {data.localEvents && data.localEvents.length > 1 && (
        <p className="kpi-change text-amber-600 mt-1 text-xs">
          {data.localEvents[1].name} {data.localEvents[1].dates}: {data.localEvents[1].demand}
        </p>
      )}
    </>
  )
}

    ].map((metric, index) => (
      <div key={index} className="competitive-kpi-card">
        <h3 className="kpi-title">{metric.title}</h3>
        <p className="kpi-value">{metric.value}</p>
        <p className="kpi-change">{metric.change}</p>
      </div>
    ))}
  </div>

  {/* Rate Comparison Chart Row */}
  <div className="competitive-rate-charts">
    <div className="chart-container">
      <canvas ref={lineChartRef}></canvas>
    </div>
  </div>
</div>

  );
};

export default CompetitiveRateSnapshot;
