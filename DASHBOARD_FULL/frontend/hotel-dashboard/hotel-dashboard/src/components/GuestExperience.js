import React, { useEffect, useState, useRef } from "react";
import { fetchGuestExperienceReputation } from "../services/api";
import { Chart, registerables } from "chart.js";
import "../index.css";

Chart.register(...registerables);

const GuestExperience = () => {
  const trendChartRef = useRef(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchGuestExperienceReputation()
      .then((response) => setData(response.guestExperienceReputation))
      .catch((error) => console.error("Error fetching guest experience data:", error));
  }, []);

  useEffect(() => {
    if (!data || !trendChartRef.current) return;

    if (trendChartRef.current.chartInstance) {
      trendChartRef.current.chartInstance.destroy();
    }

    trendChartRef.current.chartInstance = new Chart(trendChartRef.current.getContext("2d"), {
      type: "line",
      data: {
        labels: data.guestScoreTrend.labels,
        datasets: [
          {
            label: "Avg. Score (out of 5)",
            data: data.guestScoreTrend.scores,
            borderColor: "#38a169", // Green color
            backgroundColor: "rgba(56, 161, 105, 0.1)", // Light green fill
            fill: true, // Fills background under line
            tension: 0.4, // Smooth curve
            pointBackgroundColor: "#38a169",
            pointRadius: 4,
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
          x: { ticks: { font: { size: 12, weight: "bold" } } },
          y: {
            min: 3,
            max: 5,
            ticks: {
              stepSize: 0.5,
              callback: function(value) { return value; }
            }
          }
        }
      }
    });
  }, [data]);

  if (!data) return <p className="loading">Loading Guest Experience Data...</p>;

  return (
    <div className="guest-exp-wrapper">
      <h2 className="kpi-section-title">Guest Experience & Reputation</h2>
      <hr className="kpi-divider" />

      {/* KPI Cards */}
      <div className="guest-exp-cards">
        {/* Guest Satisfaction Gauge */}
        <div className="guest-exp-card text-center">
          <h3 className="kpi-title">Guest Satisfaction</h3>
          <div className="gauge-container">
            <div className="gauge-fill" style={{ width: `${(data.guestSatisfaction / 10) * 120}px` }}></div>
            <div className="gauge-cover">
              <span className="gauge-value">{data.guestSatisfaction}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">/ 10</p>
        </div>

        {/* NPS Gauge */}
        <div className="guest-exp-card text-center">
          <h3 className="kpi-title">NPS</h3>
          <div className="gauge-container">
            <div className="gauge-fill" style={{ width: `${(data.nps / 100) * 120}px` }}></div>
            <div className="gauge-cover">
              <span className="gauge-value">{data.nps}</span>
            </div>
          </div>
        </div>

        {/* Other KPI Cards */}
        {[
          { title: "Repeat Guest %", value: `${data.repeatGuestPercentage}%`, change: data.repeatGuestChange },
          { title: "Avg Response Time", value: `${data.avgRequestResponseTime} min`, change: data.responseTimeChange },
          { title: "Issue Resolution", value: `${data.issueResolution}%`, change: data.resolutionChange },
          { title: "Review Volume", value: `${data.reviewVolume}`, change: data.reviewVolumeChange, isAlwaysBlack: true }
        ].map((metric, index) => (
          <div key={index} className="guest-exp-card">
            <h3 className="kpi-title">{metric.title}</h3>
            <p className="kpi-value">{metric.value}</p>
            {metric.change && (
              <p className={`kpi-change ${metric.isAlwaysBlack ? "review-volume" : metric.change.includes('-') ? 'kpi-change-negative' : 'kpi-change-positive'}`}>
                {metric.change}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="guest-exp-charts">
        <div className="chart-container">
          <canvas ref={trendChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default GuestExperience;
