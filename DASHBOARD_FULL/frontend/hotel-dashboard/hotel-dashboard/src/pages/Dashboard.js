import React from "react";
import SummaryBar from "../components/SummaryBar";
import KpiSection from "../components/KpiSection";
import RevenueProfitability from "../components/RevenueProfitability";
import OperationalEfficiency from "../components/OperationalEfficiency";
import GuestExperience from "../components/GuestExperience";
import DistributionMarketing from "../components/DistributionMarketing";
import MarketBenchmarking from "../components/MarketBenchmarking";
import CompetitiveRateSnapshot from "../components/CompetitiveRateSnapshot";

const Dashboard = () => {
    return (
        <div className="p-4">
            <h1 className="dashboard-title">Multi-Property Business Insights Dashboard</h1>
            <SummaryBar />
            <KpiSection />
            <RevenueProfitability />
            <OperationalEfficiency />
            <GuestExperience />
            <DistributionMarketing />
            <MarketBenchmarking />
            <CompetitiveRateSnapshot />

        </div>
    );
};

export default Dashboard;
