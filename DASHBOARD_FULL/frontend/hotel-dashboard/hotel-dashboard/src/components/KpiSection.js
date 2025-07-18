import React, { useEffect, useState } from "react";
import { fetchKpiData } from "../services/api";
import Chart from "chart.js/auto";

const KpiSection = () => {
  const [kpis, setKpis] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const fetchedData = await fetchKpiData(); // Fetch KPI & Chart data from API
      if (fetchedData) {
        setKpis(fetchedData.kpis || []);
        setChartData(fetchedData.chart || null);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    if (chartData) {
      const ctx = document.getElementById("keyMetricsTrendChart")?.getContext("2d");
      if (ctx) {
        if (window.keyMetricsChart) {
          window.keyMetricsChart.destroy();
        }
        window.keyMetricsChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: chartData.labels, // Dynamic labels from API
            datasets: [
              {
                label: "RevPAR",
                data: chartData.revpar,
                borderColor: "#3182ce",
                tension: 0.4,
                fill: false,
                pointBackgroundColor: "#3182ce",
                pointRadius: 4,
                yAxisID: "yCurrency"
              },
              {
                label: "ADR",
                data: chartData.adr,
                borderColor: "#4299E1",
                tension: 0.4,
                fill: false,
                pointBackgroundColor: "#4299E1",
                pointRadius: 4,
                yAxisID: "yCurrency"
              },
              {
                label: "Occupancy",
                data: chartData.occupancy,
                borderColor: "#F6AD55",
                tension: 0.4,
                fill: false,
                pointBackgroundColor: "#F6AD55",
                pointRadius: 4,
                yAxisID: "yPercentage"
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "bottom" } // Legend at the bottom
            },
            scales: {
              x: {
                ticks: { font: { size: 12, family: "Poppins", weight: "bold" } },
                grid: { color: "#edf2f7", drawBorder: false }
              },
              yCurrency: {
                type: "linear",
                position: "left",
                ticks: {
                  callback: (value) => `$${value}`,
                  font: { size: 12 },
                  color: "#718096"
                }
              },
              yPercentage: {
                type: "linear",
                position: "right",
                ticks: {
                  callback: (value) => `${value}%`,
                  font: { size: 12 },
                  color: "#718096"
                },
                grid: { drawOnChartArea: false }
              }
            }
          }
        });
      }
    }
  }, [chartData]);

  return (
    <div>
      <h2 className="kpi-section-title">Key Performance Snapshot</h2>
      <div className="kpi-section-inner">
        <div className="kpi-wrapper">
          <hr className="kpi-divider" />
          <div className="kpi-container">
            {kpis.length > 0 ? (
              kpis.map((kpi, index) => (
                <div key={index} className="kpi-card text-center">
                  <div className="kpi-title-container">
                    {/* Conditionally render icons */}
                    {kpi.title === "RevPAR" && (
                      <svg
                        className="kpi-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        width="16"
                        height="16"
                        style={{ marginRight: "6px", verticalAlign: "middle" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                        />
                      </svg>
                    )}
                    {kpi.title === "ADR" && (
                      <svg
                        className="kpi-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        style={{ marginRight: "6px", verticalAlign: "middle" }}
                      >
                        <path
                          fill="#4299E1"
                          d="M20 10.586l-8-8a2 2 0 00-2.828 0l-8 8A2 2 0 003.414 14l8 8a2 2 0 002.828 0l8-8a2 2 0 000-2.414z"
                        />
                        <circle cx="8" cy="8" r="1.5" fill="#fff" />
                      </svg>
                    )}
                    <h3 className="kpi-title">{kpi.title}</h3>
                  </div>
                  {kpi.title === "RGI (RevPAR Index)" ? (
                    <>
                      <div className="gauge-container">
                        <div
                          className="gauge-fill"
                          style={{
                            width: `${(kpi.value / 180) * 120}px`
                          }}
                        ></div>
                        <div className="gauge-cover">
                          <span className="gauge-value">{kpi.value}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">vs CompSet</p>
                    </>
                  ) : (
                    <div>
                      <p className="kpi-value">{kpi.value}</p>
                      <p className={`kpi-change ${kpi.change.includes('-') ? 'kpi-change-negative' : 'kpi-change-positive'}`}>
  {kpi.change}
</p>

                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>Loading...</p>
            )}
          </div>

          {/* Chart Card */}
          <div className="chart-card">
            <div className="chart-containerkpi">
              <canvas id="keyMetricsTrendChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KpiSection;
