import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const fetchSummaryData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching summary data:", error);
        return null;
    }
};

export const fetchKpiData = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching KPI data:", error);
        return null;
    }
};

export const fetchRevenueProfitability = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching KPI data:", error);
        return null;
    }
};

export const fetchOperationalEfficiency = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching KPI data:", error);
        return null;
    }
};

export const fetchGuestExperienceReputation = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching KPI data:", error);
        return null;
    } 
};

export const fetchDistributionMarketingPerformance = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching KPI data:", error);
        return null;
    }
};

export const fetchMarketBenchmarkingFutureOutlook = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/section6`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching KPI data:", error.response?.data || error.message);
    return null;
  }
};



export const fetchCompetitiveRateSnapshot = async (params) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/section7`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    return null;
  }
};



// export const fetchCompetitiveRateSnapshot = async (params) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}`, {
//       params
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching KPI data:", error);
//     return null;
//   }
// };


