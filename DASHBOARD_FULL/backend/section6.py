from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
import json

app = FastAPI()

class ActualInput(BaseModel):
    hotel_name: str
    hotel_location: str
    start_date: str
    end_date: str
    actual: List[float]

def load_json_file(path):
    try:
        with open(path, "r") as file:
            return json.load(file)
    except Exception as e:
        return {"error": f"Failed to read file {path}: {str(e)}"}

# @app.post("/calculate_kpis")
def section6(input_data: ActualInput):
    
    # Parse and calculate ARI
    start_date = datetime.strptime(input_data.start_date, "%Y-%m-%d")
    start_date_minus_one = (start_date - timedelta(days=1)).strftime("%Y-%m-%d")
    
    pricing_data = load_json_f ile(f"kpi_logs/{input_data.hotel_name.replace(' ', '_')}_{start_date_minus_one}.json")
    if "error" in pricing_data:
        return pricing_data

    try:
        hotel_adr = sum(pricing_data["competitiveRateSnapshot"]["futureRateComparison"]["yourHotelRates"]) / len(pricing_data["competitiveRateSnapshot"]["futureRateComparison"]["yourHotelRates"])
        compset_adr = sum(pricing_data["competitiveRateSnapshot"]["futureRateComparison"]["compSetMedianRates"]) / len(pricing_data["competitiveRateSnapshot"]["futureRateComparison"]["compSetMedianRates"])
        ari = round((hotel_adr / compset_adr) * 100, 2)
    except Exception as e:
        return {"error": f"Error computing ARI: {str(e)}"}

    # Forecast accuracy
    forecast_data = load_json_file(f"forecast_logs/{input_data.hotel_name.replace(' ', '_')}_{input_data.start_date}to{input_data.end_date}.json")
    if "error" in forecast_data:
        return forecast_data

    try:
        forecasted = [entry["predicted_total_bookings"] for entry in forecast_data]
        actual = input_data.actual
        if len(forecasted) != len(actual):
            return {"error": "Length of forecasted and actual lists must match"}

        accuracy_list = []
        for f, a in zip(forecasted, actual):
            if a == 0:
                accuracy = 0.0
            else:
                accuracy = (1 - abs(f - a) / a) * 100
            accuracy_list.append(round(accuracy, 2))

        overall_accuracy = round(sum(accuracy_list) / len(accuracy_list), 2)
    except Exception as e:
        return {"error": f"Error computing forecast accuracy: {str(e)}"}

    return {
        "marketBenchmarkingFutureOutlook": {
            "mpi": 110,  
            "ari": ari,
            "pickupRooms": 150,  # Manual / placeholder
            "pickupRevenue": "$25K",  # Manual / placeholder
            "forecastAccuracy": overall_accuracy,
            "paceChartData": {
                "labels": ["Next 30 Days", "Next 60 Days", "Next 90 Days"],
                "datasets": [
                    {
                        "label": "On The Books (Rms)",
                        "data": [1200, 2300, 3100],
                        "backgroundColor": "#3182ce",
                        "borderRadius": 4,
                        "barPercentage": 0.6
                    },
                    {
                        "label": "STLY (Rms)",
                        "data": [1100, 2150, 2900],
                        "backgroundColor": "#f59e0b",
                        "borderRadius": 4,
                        "barPercentage": 0.6
                    },
                    {
                        "label": "Target (Rms)",
                        "data": [1150, 2250, 3000],
                        "backgroundColor": "#7f9cf5",
                        "borderRadius": 4,
                        "barPercentage": 0.6
                    }
                ]
            }
        }
    }
