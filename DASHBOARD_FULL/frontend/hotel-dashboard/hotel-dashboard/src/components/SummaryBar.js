import React, { useEffect, useState } from "react";
import { fetchSummaryData } from "../services/api";

const SummaryBar = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const getData = async () => {
            const fetchedData = await fetchSummaryData();
            setData(fetchedData || []);
        };
        getData();
    }, []);

    return (
        <div className="summary-container">
            <div className="summary-bar-container">
                {data.length > 0 ? (
                    data.map((item, index) => (
                        <div key={index} className="summary-bar-card">
                            <p className="summary-bar-title">{item.title}</p>
                            <p className="summary-bar-value">{item.value}</p>
                        </div>
                    ))
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default SummaryBar;
