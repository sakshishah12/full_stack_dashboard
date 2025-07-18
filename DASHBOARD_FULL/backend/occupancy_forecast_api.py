from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from datetime import datetime
from generic import refine_with_expert_reviewer_loop, expert_llm, reviewer_llm
import json
import os
import re

app = FastAPI()

# === Models ===
class BookingInput(BaseModel):
    hotel_name: str
    hotel_location: str
    start_date: str
    end_date: str
    confirmed_bookings: List[dict]
    room_count: int
    my_hotel_prices: List[dict]

# === Prompt Templates ===
expert_prompt_template = """
You are a hotel revenue management AI specializing in booking prediction.

Hotel: {hotel_name}
Location: {hotel_location}
Forecast Period: {date_range}

Confirmed Bookings:
{confirmed_bookings}

Event Data:
{events_json}

Review Context:
{review_context}

My Hotel Pricing:
{my_hotel_prices}

Total Rooms: {room_count}

Task:
- Predict the **total bookings** for each day in the forecast period.
- Base your prediction on confirmed bookings, event data, reviews, and hotel prices.

Respond in JSON array format:
[
  {{"date": "YYYY-MM-DD", "predicted_total_bookings": <integer>, "reasoning": "..." }},
  ...
]
"""

reviewer_prompt_template = """
You are a reviewer evaluating the predicted total bookings.

Event Data: {events_json}

Instructions:
- Ensure each entry includes "date", "predicted_total_bookings", and "reasoning".
- Check for illogical or inconsistent predictions based on events and trends.
- Suggest corrections if needed.

Forecast to Review:
{extracted_output}

Respond with:
{{"feedback": "<review comments>", "corrected_forecast": [ ... ]}}
"""

# === Helper: clean and parse forecast ===
def clean_and_parse_forecast(raw_forecast: str):
    cleaned = re.sub(r"```json|```", "", raw_forecast).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        return {"error": f"Failed to parse forecast JSON: {str(e)}"}

# === Endpoint ===
# @app.post("/forecast")
def forecast_total_bookings(input_data: BookingInput):
    date_range = f"{input_data.start_date} to {input_data.end_date}"

    # Read event data
    events_file_path = os.path.join("event_logs", f"extracted_events_{input_data.hotel_location.replace(' ', '_')}_{input_data.start_date}_{input_data.end_date}.json")
    try:
        with open(events_file_path, "r") as f:
            events_json = json.load(f)
    except Exception as e:
        return {"error": f"Failed to load events file: {str(e)}"}

    # Read review logs
    review_context = ""
    review_log_path = os.path.join("review_logs", f"extracted_review_{input_data.hotel_name.replace(' ', '_')}_.json")
    if os.path.exists(review_log_path):
        try:
            with open(review_log_path, "r") as f:
                review_context = f.read()
        except Exception as e:
            review_context = f"Could not load review log: {str(e)}"

    # Format data as strings
    confirmed_bookings_str = json.dumps(input_data.confirmed_bookings, indent=2)
    events_json_str = json.dumps(events_json, indent=2)
    my_hotel_prices_str = json.dumps(input_data.my_hotel_prices, indent=2)

    # Run feedback loop
    final_forecast_raw, logs = refine_with_expert_reviewer_loop(
        raw_text="",
        expert_llm=expert_llm,
        reviewer_llm=reviewer_llm,
        expert_prompt_template=expert_prompt_template,
        reviewer_prompt_template=reviewer_prompt_template,
        max_iterations=3,
        reviewer_acceptance_check=lambda feedback: "APPROVED" in feedback.upper(),
        additional_format_kwargs={
            "hotel_name": input_data.hotel_name,
            "hotel_location": input_data.hotel_location,
            "date_range": date_range,
            "confirmed_bookings": confirmed_bookings_str,
            "events_json": events_json_str,
            "my_hotel_prices": my_hotel_prices_str,
            "room_count": input_data.room_count,
            "review_context": review_context
        }
    )

    # Clean and parse forecast
    parsed_forecast = clean_and_parse_forecast(final_forecast_raw)

    # Save forecast result
    os.makedirs("forecast_logs", exist_ok=True)
    safe_filename = f"{input_data.hotel_name.replace(' ', '_')}_{date_range.replace(' ', '').replace(':', '-')}.json"
    file_path = os.path.join("forecast_logs", safe_filename)

    try:
        with open(file_path, "w") as json_file:
            json.dump(parsed_forecast, json_file, indent=4)
    except Exception as e:
        return {"error": f"Failed to save forecast file: {str(e)}"}

    return {
        "final_forecast": parsed_forecast
    }
